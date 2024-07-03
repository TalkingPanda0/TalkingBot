import { Database, Statement, SQLQueryBindings } from "bun:sqlite";

interface WatchTime {
  userId: string;
  lastSeenOnStream: string; // in json
  watchTime: number; // in ms
  lastSeen: string; // in json
  chatTime: number; // in ms
  inChat: number; // 0: not in chat, 1: in offline chat, 2: watching
}

export class DB {
  private database: Database;
  private insertWatchTime: CallableFunction;
  private getWatchTimeQuery: Statement;
  private getTopWatchTimeQuery: Statement;
  private getTopWatchTimeQueryOffline: Statement;
  private inChatQuery: Statement;

  constructor() {
    this.database = new Database(__dirname + "/../config/db.sqlite", {
      create: true,
      strict: true,
    });
  }

  public init() {
    this.database
      .query(
        "CREATE TABLE IF NOT EXISTS watchtimes (userId TEXT PRIMARY KEY,lastSeenOnStream TEXT,watchTime INT,lastSeen TEXT,chatTime INT,inChat INT);",
      )
      .run();

    const insert = this.database.prepare(
      "INSERT OR REPLACE INTO watchtimes (userId,lastSeenOnStream ,watchTime ,lastSeen ,chatTime,inChat) VALUES($userId,$lastSeenOnStream,$watchTime,$lastSeen,$chatTime,$inChat);",
    );

    this.insertWatchTime = this.database.transaction((watchTime) => {
      insert.run(watchTime);
    });

    this.getWatchTimeQuery = this.database.query(
      "SELECT * FROM watchtimes where userId = ?1;",
    );
    this.getTopWatchTimeQuery = this.database.query(
      "SELECT * FROM watchtimes ORDER BY watchTime DESC LIMIT 3;",
    );
    this.getTopWatchTimeQueryOffline = this.database.query(
      "SELECT * FROM watchtimes ORDER BY chatTime DESC LIMIT 3;",
    );
    this.inChatQuery = this.database.query(
      "SELECT * FROM watchtimes where inChat != 0;",
    );
  }
  public updateDataBase() {
    const toUpdate = this.inChatQuery.all() as WatchTime[];
    console.log(`updateing ${toUpdate.length}`);
    const date = new Date();
    toUpdate.forEach((watchTime) => {
      if (watchTime.inChat == 1) {
        const lastSeen = new Date(watchTime.lastSeen);
        watchTime.watchTime += date.getTime() - lastSeen.getTime();
        watchTime.lastSeen = date.toJSON();
      } else {
        const lastSeenOnStream = new Date(watchTime.lastSeenOnStream);
        watchTime.watchTime += date.getTime() - lastSeenOnStream.getTime();
        watchTime.lastSeenOnStream = date.toJSON();
      }
    });
  }

  public getWatchTime(id: string): WatchTime {
    return this.getWatchTimeQuery.get(id) as WatchTime;
  }

  public getTopWatchTime(isOffline: boolean): WatchTime[] {
    if (isOffline) {
      return this.getTopWatchTimeQueryOffline.all() as WatchTime[];
    }
    return this.getTopWatchTimeQuery.all() as WatchTime[];
  }

  public userLeave(id: string, isStreamOnline: boolean) {
    try {
      const watchTime = this.getWatchTime(id);
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
        this.insertWatchTime(newWatchTime);
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
      this.insertWatchTime(watchTime);
    } catch (e) {
      console.error(e);
    }
  }

  public userJoin(id: string, isStreamOnline: boolean) {
    try {
      const newStatus = isStreamOnline ? 2 : 1;
      const watchTime = this.getWatchTime(id);
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
        this.insertWatchTime(newWatchTime);
        return;
      }
      if (watchTime.inChat == newStatus) return;
      watchTime.inChat = newStatus;

      if (isStreamOnline) watchTime.lastSeenOnStream = date.toJSON();
      else watchTime.lastSeen = date.toJSON();

      this.insertWatchTime(watchTime);
    } catch (e) {
      console.error(`${e} ${id} ${isStreamOnline}`);
    }
  }

  public cleanUp() {
    this.database.close();
  }
}
