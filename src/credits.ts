interface CreditsList {
  followers: string[];
  subscribers: string[];
  moderators: string[];
  cheers: string[];
  chatters: string[];
}

export enum CreditType {
  Follow,
  Subscription,
  Moderator,
  Cheer,
  Chatter,
}

export class Credits {
  private followers: Set<string> = new Set();
  private subscribers: Set<string> = new Set();
  private moderators: Set<string> = new Set();
  private cheers: Set<string> = new Set();
  private chatters: Set<string> = new Set();

  public clear() {
    this.followers.clear();
    this.subscribers.clear();
    this.moderators.clear();
    this.cheers.clear();
    this.chatters.clear();
  }

  public addToCredits(name: string, type: CreditType) {
    switch (type) {
      case CreditType.Follow:
        this.followers.add(name);
        break;
      case CreditType.Moderator:
        this.moderators.add(name);
        break;
      case CreditType.Subscription:
        this.subscribers.add(name);
        break;
      case CreditType.Cheer:
        this.cheers.add(name);
        break;
      case CreditType.Chatter:
        this.chatters.add(name);
        break;
    }
  }

  public getCreditsList(): string {
    const list: CreditsList = {
      followers: Array.from(this.followers),
      subscribers: Array.from(this.subscribers),
      moderators: Array.from(this.moderators),
      cheers: Array.from(this.cheers),
      chatters: Array.from(this.chatters),
    };
    return JSON.stringify(list);
  }
}
