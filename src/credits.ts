interface CreditsList {
  followers: string[];
  subscribers: string[];
  moderators: string[];
}

export enum CreditType {
  Follow,
  Subscription,
  Moderator,
}

export class Credits {
  private followers: Set<string> = new Set();
  private subscribers: Set<string> = new Set();
  private moderators: Set<string> = new Set();

  public clear() {
    this.followers.clear();
    this.subscribers.clear();
    this.moderators.clear();
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
    }
  }

  public getCreditsList(): string {
    const list: CreditsList = {
      followers: Array.from(this.followers),
      subscribers: Array.from(this.subscribers),
      moderators: Array.from(this.moderators),
    };
    return JSON.stringify(list);
  }
}
