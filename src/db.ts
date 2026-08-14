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
    return (
      await this.database
        .select({ times: hapboo.times })
        .from(hapboo)
        .where(eq(hapboo.userId, id))
    )[0].times;
  }

  public async updateDataBase(inChat: number) {
    const toUpdate = await this.database
      .select()
      .from(watchtimes)
      .where(eq(watchtimes.inChat, inChat));
    const date = new Date();
    toUpdate.forEach(async (watchTime) => {
      if (inChat == 1) {
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

      await this.database.insert(watchtimes).values(watchTime);
    });
  }

  public async cleanDataBase() {
    const toUpdate = await this.database
      .select()
      .from(watchtimes)
      .where(eq(watchtimes.inChat, 0));
    toUpdate.forEach(async (watchTime) => {
      watchTime.inChat = 0;

      await this.database.insert(watchtimes).values(watchTime);
    });
  }

  public async getOrSetConfig<T>(
    key: string,
    defaultValue: T,
  ): Promise<T> {
    const config = (
      await this.database
        .select()
        .from(customConfig)
        .where(eq(customConfig.key, key))
    )[0];
    if (config) return config.value as T;
    await this.database
      .insert(customConfig)
      .values({ key, value: defaultValue });
    return defaultValue;
  }

  public async setConfig<T>(key: string, value: T) {
    await this.database.insert(customConfig).values({ key, value });
  }

  public async getWatchTime(id: string): Promise<WatchTime> {
    return (
      await this.database
        .select()
        .from(watchtimes)
        .where(eq(watchtimes.userId, id))
    )[0];
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
    const date = new Date();
    if (watchTime == null) {
      const newWatchTime: WatchTime = {
        userId: userId,
        lastSeenOnStream: null,
        watchTime: time,
        lastSeen: date.toJSON(),
        chatTime: 0,
        inChat: 0,
      };
      await this.database.insert(watchtimes).values(newWatchTime);
      return;
    }
    watchTime.watchTime += time;
    await this.database.insert(watchtimes).values(watchTime);
    return;
  }

  public async userLeave(id: string, isStreamOnline: boolean) {
    if (id === "400510439") return;
    try {
      const watchTime = await this.getWatchTime(id);
      const date = new Date();
      if (watchTime == null) {
        const newWatchTime: WatchTime = {
          userId: id,
          lastSeenOnStream: isStreamOnline ? date.toJSON() : null,
          watchTime: 0,
          lastSeen: date.toJSON(),
          chatTime: 0,
          inChat: 0,
        };

        await this.database.insert(watchtimes).values(newWatchTime);
        return;
      }
      if (watchTime.inChat == 0) return;

      if (isStreamOnline && watchTime.inChat == 2) {
        if (watchTime.lastSeenOnStream != null) {
          const lastSeenOnStream = new Date(watchTime.lastSeenOnStream);
          watchTime.watchTime += date.getTime() - lastSeenOnStream.getTime();
        }
        watchTime.lastSeenOnStream = date.toJSON();
      } else {
        const lastSeen = new Date(watchTime.lastSeen);
        watchTime.chatTime += date.getTime() - lastSeen.getTime();
      }
      watchTime.lastSeen = date.toJSON();
      watchTime.inChat = 0;

      await this.database.insert(watchtimes).values(watchTime);
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
        const newWatchTime: WatchTime = {
          userId: id,
          lastSeenOnStream: isStreamOnline ? date.toJSON() : null,
          watchTime: 0,
          lastSeen: date.toJSON(),
          chatTime: 0,
          inChat: newStatus,
        };

        await this.database.insert(watchtimes).values(newWatchTime);
        return;
      }
      if (watchTime.inChat == newStatus) return;
      watchTime.inChat = newStatus;

      if (isStreamOnline) watchTime.lastSeenOnStream = date.toJSON();
      else watchTime.lastSeen = date.toJSON();

      await this.database.insert(watchtimes).values(watchTime);
    } catch (e) {
      console.error(`${e} ${id} ${isStreamOnline}`);
    }
  }

  public async hapbooReaction(userId: string) {
    const hapbooReaction = await this.getHapbooReactions(userId);
    if (hapbooReaction == null) {
      await this.database.insert(hapboo).values({
        userId,
        times: 1,
      });
      return;
    }
    await this.database
      .insert(hapboo)
      .values({ userId, times: hapbooReaction + 1 });
  }

  public async getTopHapbooReactions(): Promise<HapbooReaction[]> {
    return await this.database
      .select()
      .from(hapboo)
      .orderBy(desc(hapboo.times));
  }

  async getEmoteStat(userId: string, emoteId: string): Promise<EmoteStat> {
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
    )[0];
  }

  public async reaction(userId: string, emoteId: string, number: number) {
    const reactionUsage = await this.getEmoteStat(userId, emoteId);
    if (reactionUsage == null) {
      await this.database.insert(reactionstats).values({
        userId: userId,
        emoteId: emoteId,
        times: 1,
      });
      return;
    }
    reactionUsage.times += number;
    await this.database.insert(reactionstats).values(reactionUsage);
  }

  public async emoteUsage(userId: string, emoteId: string, number: number) {
    const emoteUsage = await this.getEmoteStat(userId, emoteId);
    if (emoteUsage == null) {
      this.database
        .insert(emotestats)
        .values({ userId: userId, emoteId: emoteId, times: 1 });
      return;
    }
    emoteUsage.times += number;

    this.database.insert(emotestats).values(emoteUsage);
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
    ).map((stat) => {
      return {
        userId: stat.userId,
        emoteId: stat.emoteId,
        times: stat.totaltimes,
      };
    });
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
      .from(emotestats)
      .groupBy(emotestats.userId)
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
      .from(emotestats)
      .groupBy(emotestats.userId)
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
      .from(emotestats)
      .groupBy(emotestats.emoteId)
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
      .from(emotestats)
      .groupBy(emotestats.emoteId)
      .orderBy(sql`sum(${combinedemotestats.totaltimes}) desc`);
  }

  public cleanUp() {}
}
