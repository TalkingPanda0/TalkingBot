import { TalkingBot } from "./talkingbot";

export interface Chatter {
  name: string,
  color: string,
}

interface CreditsList {
  Followers: Chatter[];
  Subscribers: Chatter[];
  Moderators: Chatter[];
  Cheers: Chatter[];
  Chatters: Chatter[];
}

export enum CreditType {
  Follow,
  Subscription,
  Moderator,
  Cheer,
  Chatter,
}

export class Credits {
  private followers: Map<string,Chatter> = new Map();
  private subscribers:  Map<string,Chatter> = new Map();

  private moderators: Map<string,Chatter> = new Map();
  private cheers: Map<string,Chatter> = new Map();
  private chatters:Map<string,Chatter> = new Map();
  private bot: TalkingBot;

  constructor(bot: TalkingBot) {
    this.bot = bot;
  }

  public clear() {
    this.followers.clear();
    this.subscribers.clear();
    this.moderators.clear();
    this.cheers.clear();
    this.chatters.clear();
  }

  public addToCredits(id: string,name: string,color: string, type: CreditType) {
    switch (type) {
      case CreditType.Follow:
        this.followers.set(id,{name,color});
        break;
      case CreditType.Moderator:
        this.moderators.set(id,{name,color})
        break;
      case CreditType.Subscription:
        this.subscribers.set(id,{name,color})
        break;
      case CreditType.Cheer:
        this.cheers.set(id,{name,color})
        break;
      case CreditType.Chatter:
        this.chatters.set(id,{name,color});
        break;
    }
  }
  public deleteFromCredits(name: string) {
    this.followers.delete(name);
    this.moderators.delete(name);
    this.subscribers.delete(name);
    this.cheers.delete(name);
    this.chatters.delete(name);
  }

  public getCreditsList(): string {
    const list: CreditsList = {
      Moderators: Array.from(this.moderators.values()),
      Subscribers: Array.from(this.subscribers.values()),
      Cheers: Array.from(this.cheers.values()),
      Followers: Array.from(this.followers.values()),
      Chatters: Array.from(this.chatters.values()),
    };
    return JSON.stringify(list);
  }
}
