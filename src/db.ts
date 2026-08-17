import { drizzle, SQLiteBunDatabase } from "drizzle-orm/bun-sqlite";
import { sql, inArray, desc, eq, and } from "drizzle-orm";
import {
  combinedemotestats,
  customConfig,
  emotestats,
  hapboo,
  reactionstats,
  watchtimes,
} from "./db/schema";

import { relations } from "./db/relations";

interface WatchTime {
  userId: string;
  lastSeenOnStream: string | null; // in json
  watchTime: number; // in ms
  lastSeen: string; // in json
  chatTime: number; // in ms
  inChat: number; // 0: not in chat, 1: in offline chat, 2: watching
}

export interface EmoteStat {
  userId: string;
  emoteId: string;
  times: number;
}

interface HapbooReaction {
  userId: string;
  times: number;
}

export class DB {
  public database: SQLiteBunDatabase;

  constructor() {
    this.database = drizzle(__dirname + "/../config/db.sqlite", { relations });
  }

  public async init() {
    await this.cleanDataBase();
  }

  public async getEmoteUsage(
    emoteList: string[],
    filter: string,
  ): Promise<{ userId: string; times: number }[]> {
    switch (filter) {
      case "emotes":
        return await this.database
          .select({
            userId: emotestats.userId,
            times: sql<number>`sum(${emotestats.times})`,
          })
          .from(emotestats)
          .where(inArray(emotestats.emoteId, emoteList))
          .groupBy(emotestats.userId)
          .orderBy(desc(emotestats.times));

      case "reactions":
        return await this.database
          .select({
            userId: reactionstats.userId,
            times: sql<number>`sum(${reactionstats.times})`,
          })
          .from(reactionstats)
          .where(inArray(reactionstats.emoteId, emoteList))
          .groupBy(reactionstats.userId)
          .orderBy(desc(reactionstats.times));

      case "both":
      default:
        return await this.database
          .select({
            userId: combinedemotestats.userId,
            times: sql<number>`sum(${combinedemotestats.totaltimes})`,
          })
          .from(combinedemotestats)
          .where(inArray(combinedemotestats.emoteId, emoteList))
          .groupBy(combinedemotestats.userId)
          .orderBy(desc(combinedemotestats.totaltimes));
    }
  }

  public async getHapbooReactions(id: string): Promise<number | null> {
    const reactions = await this.database
      .select({ times: hapboo.times })
      .from(hapboo)
      .where(eq(hapboo.userId, id));

    return reactions[0]?.times ?? null;
  }

  public async updateDataBase(inChat: number) {
    const toUpdate = await this.database
      .select()
      .from(watchtimes)
      .where(eq(watchtimes.inChat, inChat));

    const date = new Date();

    await Promise.all(
      toUpdate.map(async (watchTime) => {
        if (inChat === 1) {
          const lastSeen = new Date(watchTime.lastSeen);

          watchTime.chatTime += date.getTime() - lastSeen.getTime();
          watchTime.lastSeen = date.toJSON();
        } else {
          const lastSeenOnStream = new Date(
            watchTime.lastSeenOnStream ?? Date.now(),
          );

          watchTime.watchTime += date.getTime() - lastSeenOnStream.getTime();

          watchTime.lastSeenOnStream = date.toJSON();
        }

        await this.database
          .update(watchtimes)
          .set({
            lastSeenOnStream: watchTime.lastSeenOnStream,
            watchTime: watchTime.watchTime,
            lastSeen: watchTime.lastSeen,
            chatTime: watchTime.chatTime,
            inChat: watchTime.inChat,
          })
          .where(eq(watchtimes.userId, watchTime.userId));
      }),
    );
  }

  public async cleanDataBase() {
    await this.database
      .update(watchtimes)
      .set({ inChat: 0 })
      .where(eq(watchtimes.inChat, 0));
  }

  public async getOrSetConfig<T>(key: string, defaultValue: T): Promise<T> {
    const config = (
      await this.database
        .select()
        .from(customConfig)
        .where(eq(customConfig.key, key))
    ).at(0);

    if (config) return config.value as T;

    await this.setConfig(key, defaultValue);
    return defaultValue;
  }

  public async setConfig<T>(key: string, value: T) {
    await this.database
      .insert(customConfig)
      .values({ key, value })
      .onConflictDoUpdate({
        target: customConfig.key,
        set: { value },
      });
  }

  public async getWatchTime(id: string): Promise<WatchTime | undefined> {
    return (
      await this.database
        .select()
        .from(watchtimes)
        .where(eq(watchtimes.userId, id))
    ).at(0);
  }

  public async getTopWatchTime(isOffline: boolean): Promise<WatchTime[]> {
    return await this.database
      .select()
      .from(watchtimes)
      .orderBy(isOffline ? desc(watchtimes.inChat) : desc(watchtimes.watchTime))
      .limit(3);
  }

  public async addToUser(userId: string, time: number) {
    const watchTime = await this.getWatchTime(userId);

    if (watchTime == null) {
      const date = new Date();

      await this.database.insert(watchtimes).values({
        userId,
        lastSeenOnStream: null,
        watchTime: time,
        lastSeen: date.toJSON(),
        chatTime: 0,
        inChat: 0,
      });

      return;
    }

    await this.database
      .update(watchtimes)
      .set({
        watchTime: watchTime.watchTime + time,
      })
      .where(eq(watchtimes.userId, userId));
  }

  public async userLeave(id: string, isStreamOnline: boolean) {
    if (id === "400510439") return;

    try {
      const watchTime = await this.getWatchTime(id);
      const date = new Date();

      if (watchTime == null) {
        await this.database.insert(watchtimes).values({
          userId: id,
          lastSeenOnStream: isStreamOnline ? date.toJSON() : null,
          watchTime: 0,
          lastSeen: date.toJSON(),
          chatTime: 0,
          inChat: 0,
        });

        return;
      }

      if (watchTime.inChat === 0) return;

      let { watchTime: totalWatchTime, chatTime, lastSeenOnStream } = watchTime;

      if (isStreamOnline && watchTime.inChat === 2) {
        if (lastSeenOnStream != null) {
          totalWatchTime +=
            date.getTime() - new Date(lastSeenOnStream).getTime();
        }

        lastSeenOnStream = date.toJSON();
      } else {
        chatTime += date.getTime() - new Date(watchTime.lastSeen).getTime();
      }

      await this.database
        .update(watchtimes)
        .set({
          lastSeenOnStream,
          watchTime: totalWatchTime,
          lastSeen: date.toJSON(),
          chatTime,
          inChat: 0,
        })
        .where(eq(watchtimes.userId, id));
    } catch (e) {
      console.error(e);
    }
  }

  public async userJoin(id: string, isStreamOnline: boolean) {
    if (id === "400510439") return;

    try {
      const newStatus = isStreamOnline ? 2 : 1;
      const watchTime = await this.getWatchTime(id);
      const date = new Date();

      if (watchTime == null) {
        await this.database.insert(watchtimes).values({
          userId: id,
          lastSeenOnStream: isStreamOnline ? date.toJSON() : null,
          watchTime: 0,
          lastSeen: date.toJSON(),
          chatTime: 0,
          inChat: newStatus,
        });

        return;
      }

      if (watchTime.inChat === newStatus) return;

      await this.database
        .update(watchtimes)
        .set({
          inChat: newStatus,
          ...(isStreamOnline
            ? { lastSeenOnStream: date.toJSON() }
            : { lastSeen: date.toJSON() }),
        })
        .where(eq(watchtimes.userId, id));
    } catch (e) {
      console.error(`${e} ${id} ${isStreamOnline}`);
    }
  }

  public async hapbooReaction(userId: string) {
    await this.database
      .insert(hapboo)
      .values({
        userId,
        times: 1,
      })
      .onConflictDoUpdate({
        target: hapboo.userId,
        set: {
          times: sql`${hapboo.times} + 1`,
        },
      });
  }

  public async getTopHapbooReactions(): Promise<HapbooReaction[]> {
    return await this.database
      .select()
      .from(hapboo)
      .orderBy(desc(hapboo.times));
  }

  async getEmoteStat(
    userId: string,
    emoteId: string,
  ): Promise<EmoteStat | undefined> {
    return (
      await this.database
        .select()
        .from(reactionstats)
        .where(
          and(
            eq(reactionstats.userId, userId),
            eq(reactionstats.emoteId, emoteId),
          ),
        )
    ).at(0);
  }

  public async reaction(userId: string, emoteId: string, number: number) {
    await this.database
      .insert(reactionstats)
      .values({
        userId,
        emoteId,
        times: number,
      })
      .onConflictDoUpdate({
        target: [reactionstats.userId, reactionstats.emoteId],
        set: {
          times: sql`${reactionstats.times} + ${number}`,
        },
      });
  }

  public async emoteUsage(userId: string, emoteId: string, number: number) {
    await this.database
      .insert(emotestats)
      .values({
        userId,
        emoteId,
        times: number,
      })
      .onConflictDoUpdate({
        target: [emotestats.userId, emotestats.emoteId],
        set: {
          times: sql`${emotestats.times} + ${number}`,
        },
      });
  }

  public async getUserEmoteUsage(userId: string): Promise<EmoteStat[]> {
    return await this.database
      .select()
      .from(emotestats)
      .where(eq(emotestats.userId, userId));
  }

  public async getUserReactionUsage(userId: string): Promise<EmoteStat[]> {
    return await this.database
      .select()
      .from(reactionstats)
      .where(eq(reactionstats.userId, userId));
  }

  public async getUserReactionAndEmoteUsage(
    userId: string,
  ): Promise<EmoteStat[]> {
    return (
      await this.database
        .select()
        .from(combinedemotestats)
        .where(eq(combinedemotestats.userId, userId))
    ).map((stat) => ({
      userId: stat.userId,
      emoteId: stat.emoteId,
      times: stat.totaltimes,
    }));
  }

  public async getTopEmoteUsers(): Promise<
    { userId: string; times: number }[]
  > {
    return await this.database
      .select({
        userId: emotestats.userId,
        times: sql<number>`sum(${emotestats.times})`.mapWith(Number),
      })
      .from(emotestats)
      .groupBy(emotestats.userId)
      .orderBy(sql`sum(${emotestats.times}) desc`);
  }

  public async getTopReactionUsers(): Promise<
    { userId: string; times: number }[]
  > {
    return await this.database
      .select({
        userId: reactionstats.userId,
        times: sql<number>`sum(${reactionstats.times})`.mapWith(Number),
      })
      .from(reactionstats)
      .groupBy(reactionstats.userId)
      .orderBy(sql`sum(${reactionstats.times}) desc`);
  }

  public async getTopEmoteAndReactionUsers(): Promise<
    { userId: string; times: number }[]
  > {
    return await this.database
      .select({
        userId: combinedemotestats.userId,
        times: sql<number>`sum(${combinedemotestats.totaltimes})`.mapWith(
          Number,
        ),
      })
      .from(combinedemotestats)
      .groupBy(combinedemotestats.userId)
      .orderBy(sql`sum(${combinedemotestats.totaltimes}) desc`);
  }

  public async getTopEmotes(): Promise<{ emoteId: string; times: number }[]> {
    return await this.database
      .select({
        emoteId: emotestats.emoteId,
        times: sql<number>`sum(${emotestats.times})`.mapWith(Number),
      })
      .from(emotestats)
      .groupBy(emotestats.emoteId)
      .orderBy(sql`sum(${emotestats.times}) desc`);
  }

  public async getTopReactions(): Promise<
    { emoteId: string; times: number }[]
  > {
    return await this.database
      .select({
        emoteId: reactionstats.emoteId,
        times: sql<number>`sum(${reactionstats.times})`.mapWith(Number),
      })
      .from(reactionstats)
      .groupBy(reactionstats.emoteId)
      .orderBy(sql`sum(${reactionstats.times}) desc`);
  }

  public async getTopTotal(): Promise<{ emoteId: string; times: number }[]> {
    return await this.database
      .select({
        emoteId: combinedemotestats.emoteId,
        times: sql<number>`sum(${combinedemotestats.totaltimes})`.mapWith(
          Number,
        ),
      })
      .from(combinedemotestats)
      .groupBy(combinedemotestats.emoteId)
      .orderBy(sql`sum(${combinedemotestats.totaltimes}) desc`);
  }

  public cleanUp() {}
}
