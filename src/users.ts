import { DB } from "./db";
import { arraytoHashMap, hashMaptoArray } from "./util";

export interface User {
  nickname?: string;
  color?: string;
  realColor?: string;
}
export interface UserIdentifier {
  platform: string;
  username: string;
}

export class Users {
  private userMap = new Map<string, User>();
  private db: DB;

  constructor(db: DB) {
    this.db = db;
  }

  init() {
    this.loadUsers();
  }

  loadUsers() {
    this.userMap = arraytoHashMap(
      JSON.parse(this.db.getOrSetConfig("users", JSON.stringify([]))),
    );
  }
  saveUsers() {
    this.db.setConfig("users", JSON.stringify(hashMaptoArray(this.userMap)));
  }

  setColor(id: UserIdentifier, color: string | undefined) {
    const user = this.getUser(id);
    user.color = color;
    this.userMap.set(`${id.platform}-${id.username}`, user);
    this.saveUsers();
  }

  setRealColor(id: UserIdentifier, color: string) {
    const user = this.getUser(id);
    user.realColor = color;
    this.userMap.set(`${id.platform}-${id.username}`, user);
    this.saveUsers();
  }

  setNickname(id: UserIdentifier, nick: string | undefined) {
    const user = this.getUser(id);
    user.nickname = nick;
    this.userMap.set(`${id.platform}-${id.username}`, user);
    this.saveUsers();
  }

  getUser(id: UserIdentifier): User {
    const user = this.userMap.get(`${id.platform}-${id.username}`);
    return user ?? {};
  }
}
