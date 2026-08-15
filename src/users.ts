import { MessageData } from "botModule";
import { TalkingBot } from "./talkingbot";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import { xpToLevel } from "botutil";

export interface UserData {
  platform: string;
  username: string;
  senderId: string;
  color: string;
}

export interface User {
  id: string;
  userName: string;
  color: string;
  customName: string | null;
  customColor: string | null;
  xp: number;
}

export class UserManager {
  private recentChatters: Map<string, User> = new Map();
  private bot: TalkingBot;
  private interval: Timer | null = null;

  public constructor(bot: TalkingBot) {
    this.bot = bot;
  }

  async setCustomColor(data: UserData, color: string | null) {
    const user = await this.getUser(data);
    user.customColor = color;
    await this.bot.database.database
      .insert(users)
      .values(user)
      .onConflictDoUpdate({
        target: users.id,
        set: { customColor: user.customColor },
      });
  }

  async setCustomName(data: UserData, customName: string | null) {
    const user = await this.getUser(data);
    await this.setUserCustomName(user, customName);
  }

  async setUserCustomName(user: User, customName: string | null) {
    user.customName = customName;
    await this.bot.database.database
      .insert(users)
      .values(user)
      .onConflictDoUpdate({
        target: users.id,
        set: { customName: user.customName },
      });
  }

  async getUser(data: UserData): Promise<User> {
    return (await this.tryGetUser(data.senderId)) ?? this.newUser(data);
  }

  newUser(data: UserData): User {
    return {
      id: `${data.senderId}`,
      color: data.color,
      xp: 0,
      customColor: null,
      customName: null,
      userName: data.username,
    };
  }

  async findUser(username: string): Promise<User | null> {
    return (
      (
        await this.bot.database.database
          .select()
          .from(users)
          .where(eq(users.userName, username))
      ).at(0) ?? null
    );
  }

  async tryGetUser(id: string): Promise<User | null> {
    return (
      (
        await this.bot.database.database
          .select()
          .from(users)
          .where(eq(users.id, id))
      ).at(0) ?? null
    );
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
    const isLiveMessage = !data.isOld && this.bot.twitch.isStreamOnline;

    let user = await this.tryGetUser(data.senderId);

    if (!user) {
      user = this.newUser(data);
      console.log(`new user ${user}`);

      await this.bot.database.database
        .insert(users)
        .values(user)
        .onConflictDoNothing();
    } else if (isLiveMessage && !this.recentChatters.has(data.senderId)) {
      const level = xpToLevel(user.xp);

      if (level < xpToLevel(user.xp + 1)) {
        await data.reply(
          `You dir it ${data.sender}! You are now level ${level + 1}!`,
          true,
        );
      }
    }

    if (isLiveMessage) this.recentChatters.set(data.senderId, user);

    return user;
  }

  async levelUp() {
    for (const chatter of this.recentChatters) {
      const user = chatter[1];
      user.xp += 1;

      await this.bot.database.database
        .insert(users)
        .values(user)
        .onConflictDoUpdate({
          target: users.id,
          set: { xp: user.xp },
        });
    }

    this.recentChatters.clear();
  }
}
