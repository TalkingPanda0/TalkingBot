import { MessageData } from "botModule";
import { TalkingBot } from "./talkingbot.ts";
import { users } from "./db/schema.ts";
import { and, eq } from "drizzle-orm";
import { xpToLevel } from "botutil";

export interface UserData {
  platform: string;
  userId: string;
  displayName: string;
  color: string;
}

export interface User {
  userId: string;
  platform: string;
  displayName: string;
  color: string;
  customName: string | null;
  customColor: string | null;
  xp: number;
  lastSeenOnStream: Date | null;
  lastSeen: Date | null;
  chatTime: number | null;
  watchTime: number | null;
}

export enum WatchTimeStatus {
  Chat,
  Stream,
}

export class UserManager {
  private recentChatters: Map<string, User> = new Map();
  private watchTimeTracker: Map<string, WatchTimeStatus> = new Map();
  private bot: TalkingBot;
  private interval: Timer | null = null;

  public constructor(bot: TalkingBot) {
    this.bot = bot;
  }

  async setCustomColor(data: UserData, customColor: string | null) {
    const user = await this.getUser(data);
    const platformId = this.bot.database.getPlatfromId(user.platform);

    await this.bot.database.db
      .update(users)
      .set({ customColor })
      .where(
        and(eq(users.platform, platformId), eq(users.userId, user.userId)),
      );
  }

  async setCustomName(data: UserData, customName: string | null) {
    const user = await this.getUser(data);
    await this.setUserCustomName(user, customName);
  }

  async setUserCustomName(user: User, customName: string | null) {
    const platformId = this.bot.database.getPlatfromId(user.platform);
    await this.bot.database.db
      .update(users)
      .set({ customName })
      .where(
        and(eq(users.platform, platformId), eq(users.userId, user.userId)),
      );
  }

  async getUser(data: UserData): Promise<User> {
    return (
      (await this.tryGetUser(data.userId, data.platform)) ?? this.newUser(data)
    );
  }

  newUser(data: UserData): User {
    const user: User = {
      platform: data.platform,
      displayName: data.displayName,
      userId: data.userId,
      color: data.color,
      customColor: null,
      customName: null,
      xp: 0,
      watchTime: 0,
      chatTime: 0,
      lastSeen: null,
      lastSeenOnStream: null,
    };
    const platformId = this.bot.database.getPlatfromId(user.platform);
    this.bot.database.db
      .insert(users)
      .values({ ...user, platform: platformId })
      .onConflictDoNothing()
      .run();
    return user;
  }

  async findUser(username: string, platform: string): Promise<User | null> {
    const platformId = this.bot.database.getPlatfromId(platform);
    const user = await this.bot.database.db.query.users.findFirst({
      where: { platform: platformId, displayName: username },
    });
    if (user) {
      return { ...user, platform, xp: user.xp ?? 0 };
    }
    return null;
  }

  async tryGetUser(userId: string, platform: string): Promise<User | null> {
    const platformId = this.bot.database.getPlatfromId(platform);
    const user = await this.bot.database.db.query.users.findFirst({
      where: {
        platform: platformId,
        userId,
      },
    });
    if (user) {
      return { ...user, platform, xp: user.xp ?? 0 };
    }
    return null;
  }

  public onStreamOnline() {
    this.interval = setInterval(async () => {
      await this.levelUp();
    }, 60 * 1000);
  }

  public onStreamOffline() {
    if (this.interval == null) return;
    clearInterval(this.interval);
    this.interval = null;
  }

  public async handleMessage(data: MessageData): Promise<User> {
    const platformId = this.bot.database.getPlatfromId(data.platform);
    const isLiveMessage = this.bot.twitch.isStreamOnline;

    let user = await this.tryGetUser(data.userId, data.platform);

    if (!user) {
      user = this.newUser(data);
    } else if (isLiveMessage && !this.recentChatters.has(data.userId)) {
      const level = xpToLevel(user.xp);

      if (level < xpToLevel(user.xp + 1)) {
        await data.reply(
          `You dir it ${data.displayName}! You are now level ${level + 1}!`,
          true,
        );
      }
    }

    if (isLiveMessage) this.recentChatters.set(data.userId, user);

    await this.bot.database.db
      .insert(users)
      .values({ ...user, platform: platformId })
      .onConflictDoUpdate({
        target: [users.userId, users.platform],
        set: { color: user.color, displayName: user.displayName },
      });

    return user;
  }

  async levelUp() {
    for (const user of this.recentChatters.values()) {
      user.xp += 1;

      const platformId = this.bot.database.getPlatfromId(user.platform);
      await this.bot.database.db
        .update(users)
        .set({ platform: platformId, userId: user.userId, xp: user.xp })
        .where(
          and(eq(users.platform, platformId), eq(users.userId, user.userId)),
        );
    }

    this.recentChatters.clear();
  }
  public async userLeave(
    userId: string,
    displayName: string,
    isStreamOnline: boolean,
  ) {
    const platformId = this.bot.database.getPlatfromId("twitch");
    if (userId === "400510439") return;

    try {
      const user = await this.getUser({
        userId: userId,
        color: "",
        displayName,
        platform: "twitch",
      });

      const date = new Date();

      if (user == null) {
        return;
      }

      const status = this.watchTimeTracker.get(userId);

      if (!status) return;

      let {
        watchTime: totalWatchTime,
        chatTime,
        lastSeenOnStream,
        lastSeen,
      } = user;

      totalWatchTime = totalWatchTime ?? 0;
      chatTime = chatTime ?? 0;

      if (isStreamOnline && status == WatchTimeStatus.Stream) {
        if (lastSeenOnStream != null) {
          totalWatchTime +=
            date.getTime() - new Date(lastSeenOnStream).getTime();
        }

        lastSeenOnStream = date;
      } else if (lastSeen) {
        chatTime += date.getTime() - new Date(lastSeen).getTime();
      }

      user.lastSeenOnStream = lastSeenOnStream;
      user.lastSeen = date;
      user.watchTime = totalWatchTime;
      user.chatTime = chatTime;

      this.watchTimeTracker.delete(userId);

      await this.bot.database.db
        .insert(users)
        .values({ ...user, platform: platformId })
        .onConflictDoUpdate({
          target: [users.platform, users.userId],
          set: {
            lastSeenOnStream: user.lastSeenOnStream,
            lastSeen: user.lastSeen,
            watchTime: user.watchTime,
            chatTime: user.chatTime,
          },
        });
    } catch (e) {
      console.error(e);
    }
  }

  public async userJoin(
    userId: string,
    displayName: string,
    isStreamOnline: boolean,
  ) {
    if (userId === "400510439") return;

    try {
      const platformId = this.bot.database.getPlatfromId("twitch");
      const newStatus = isStreamOnline
        ? WatchTimeStatus.Stream
        : WatchTimeStatus.Chat;

      const date = new Date();
      const oldStatus = this.watchTimeTracker.get(userId);

      const user = await this.getUser({
        userId: userId,
        color: "",
        displayName,
        platform: "twitch",
      });

      if (oldStatus && oldStatus == newStatus) return;

      this.watchTimeTracker.set(userId, newStatus);

      if (isStreamOnline) user.lastSeenOnStream = date;
      else user.lastSeen = date;

      await this.bot.database.db
        .insert(users)
        .values({ ...user, platform: platformId })
        .onConflictDoUpdate({
          target: [users.platform, users.userId],
          set: {
            ...(isStreamOnline
              ? { lastSeenOnStream: date }
              : { lastSeen: date }),
          },
        });
    } catch (e) {
      console.error(`${e} ${displayName} ${userId} ${isStreamOnline}`);
    }
  }
  public async cleanUp() {}

  public getWatchTimeStatus(userId: string): WatchTimeStatus | null {
    return this.watchTimeTracker.get(userId) ?? null;
  }

  public async updateWatchTimes(isOnline: boolean) {
    const date = new Date();
    const wantedStatus = isOnline
      ? WatchTimeStatus.Stream
      : WatchTimeStatus.Chat;
    const platformId = this.bot.database.getPlatfromId("twitch");

    await Promise.all(
      [...this.watchTimeTracker]
        .filter(([, status]) => status == wantedStatus)
        .map(async ([userId]) => {
          const user = await this.tryGetUser(userId, "twitch");
          if (!user) return;

          if (isOnline && user.lastSeenOnStream) {
            if (!user.watchTime) user.watchTime = 0;
            user.watchTime += date.getTime() - user.lastSeenOnStream.getTime();
            user.lastSeenOnStream = date;
          } else if (user.lastSeen) {
            if (!user.chatTime) user.chatTime = 0;
            user.chatTime += date.getTime() - user.lastSeen.getTime();
            user.lastSeen = date;
          } else {
            return;
          }
          await this.bot.database.db
            .update(users)
            .set({
              lastSeenOnStream: user.lastSeenOnStream,
              watchTime: user.watchTime,
              lastSeen: user.lastSeen,
              chatTime: user.chatTime,
            })
            .where(
              and(
                eq(users.platform, platformId),
                eq(users.userId, user.userId),
              ),
            );
        }),
    );
  }
}
