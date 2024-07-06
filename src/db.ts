import { Database, Statement } from "bun:sqlite";

interface WatchTime {
  userId: string;
  lastSeenOnStream: string; // in json
  watchTime: number; // in ms
  lastSeen: string; // in json
  chatTime: number; // in ms
  inChat: number; // 0: not in chat, 1: in offline chat, 2: watching
}
interface EmoteStat {
  userId: string;
  emoteId: string;
  times: number;
}
export interface HapbooReaction {
  userId: string;
  times: number;
}

export class DB {
  public getHapbooReaction: Statement;

  private database: Database;
  private insertWatchTime: CallableFunction;
  private getWatchTimeQuery: Statement;
  private getTopWatchTimeQuery: Statement;
  private getTopWatchTimeQueryOffline: Statement;
  private inChatQuery: Statement;
  private insertHapbooReaction: CallableFunction;
  private getHapbooReactionSorted: Statement;
  private insertEmoteStat: CallableFunction;
  private insertReactionStat: CallableFunction;

  public getEmoteStat: Statement;
  public getTopEmotes: Statement;
  public getTopEmoteUsers: Statement;
  public getReactionStat: Statement;
  public getTopReactions: Statement;
  public getTopReactionUsers: Statement;

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
    this.database
      .query(
        "CREATE TABLE IF NOT EXISTS hapboo (userId TEXT PRIMARY KEY,times INT);",
      )
      .run();
    this.database
      .query(
        "CREATE TABLE IF NOT EXISTS emotestats (userId TEXT,emoteId TEXT , times INT, PRIMARY KEY (userId,emoteId));",
      )
      .run();
    this.database
      .query(
        "CREATE TABLE IF NOT EXISTS reactionstats (userId TEXT,emoteId TEXT , times INT, PRIMARY KEY (userId,emoteId));",
      )
      .run();
    this.database
      .query(
        "CREATE VIEW IF NOT EXISTS combinedemotestats AS SELECT emotestats.userId,emotestats.emoteId,(IFNULL(emotestats.times,0) + IFNULL(reactionstats.times,0)) AS totaltimes FROM emotestats LEFT JOIN reactionstats UNION SELECT reactionstats.userId,reactionstats.emoteId,(IFNULL(emotestats.times,0) + IFNULL(reactionstats.times,0)) AS totaltimes FROM reactionstats LEFT JOIN emotestats USING(userId,emoteId);",
      )
      .run();

    const insertWatchTimeQuery = this.database.prepare(
      "INSERT OR REPLACE INTO watchtimes (userId,lastSeenOnStream ,watchTime ,lastSeen ,chatTime,inChat) VALUES($userId,$lastSeenOnStream,$watchTime,$lastSeen,$chatTime,$inChat);",
    );

    this.insertWatchTime = this.database.transaction((watchTime) => {
      insertWatchTimeQuery.run(watchTime);
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

    const insertHapbooReactionQuery = this.database.prepare(
      "INSERT OR REPLACE INTO hapboo (userId,times) VALUES($userId,$times);",
    );

    this.insertHapbooReaction = this.database.transaction((hapbooReaction) => {
      insertHapbooReactionQuery.run(hapbooReaction);
    });
    this.getHapbooReaction = this.database.query(
      "SELECT * FROM hapboo WHERE userId = ?1;",
    );
    this.getHapbooReactionSorted = this.database.query(
      "SELECT * FROM hapboo ORDER BY times DESC LIMIT 10",
    );

    const insertEmoteStatQuery = this.database.prepare(
      "INSERT OR REPLACE INTO emotestats (userId,emoteId,times) VALUES($userId,$emoteId,$times);",
    );
    this.insertEmoteStat = this.database.transaction((emoteStat) => {
      insertEmoteStatQuery.run(emoteStat);
    });
    this.getEmoteStat = this.database.query(
      "SELECT * FROM emotestats WHERE userId = ?1 AND emoteId = ?2;",
    );
    this.getTopEmotes = this.database.query(
      "SELECT emoteId, SUM(times) as totalUsage FROM emotestats GROUP BY emoteId ORDER BY totalUsage DESC LIMIT 10",
    );
    this.getTopEmoteUsers = this.database.query(
      "SELECT userId,SUM(times) as totalUsage FROM emotestats GROUP BY userId ORDER BY totalUsage DESC LIMIT 10",
    );
    const insertreactionStatQuery = this.database.prepare(
      "INSERT OR REPLACE INTO reactionstats (userId,emoteId,times) VALUES($userId,$emoteId,$times);",
    );
    this.insertReactionStat = this.database.transaction((reactionStat) => {
      insertreactionStatQuery.run(reactionStat);
    });
    this.getReactionStat = this.database.query(
      "SELECT * FROM reactionstats WHERE userId = ?1 AND emoteId = ?2;",
    );
    this.getTopReactions = this.database.query(
      "SELECT emoteId, SUM(times) as totalUsage FROM reactionstats GROUP BY emoteId ORDER BY totalUsage DESC LIMIT 10",
    );
    this.getTopReactionUsers = this.database.query(
      "SELECT userId,SUM(times) as totalUsage FROM reactionstats GROUP BY userId ORDER BY totalUsage DESC LIMIT 10",
    );
  }
  public updateDataBase() {
    const toUpdate = this.inChatQuery.all() as WatchTime[];
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

  public hapbooReaction(userId: string) {
    const hapbooReaction = this.getHapbooReaction.get(userId) as HapbooReaction;
    if (hapbooReaction == null) {
      const newHapbooReaction: HapbooReaction = {
        userId: userId,
        times: 1,
      };
      this.insertHapbooReaction(newHapbooReaction);
      return;
    }
    hapbooReaction.times++;
    this.insertHapbooReaction(hapbooReaction);
  }

  public getTopHapbooReactions(): HapbooReaction[] {
    return this.getHapbooReactionSorted.all() as HapbooReaction[];
  }

  public reaction(userId: string, emoteId: string) {
    const reactionUsage = this.getReactionStat.get(
      userId,
      emoteId,
    ) as EmoteStat;
    if (reactionUsage == null) {
      this.insertReactionStat({
        userId: userId,
        emoteId: emoteId,
        times: 1,
      });
      return;
    }
    reactionUsage.times++;
    this.insertReactionStat(reactionUsage);
  }

  public emoteUsage(userId: string, emoteId: string) {
    const emoteUsage = this.getEmoteStat.get(userId, emoteId) as EmoteStat;
    if (emoteUsage == null) {
      this.insertEmoteStat({ userId: userId, emoteId: emoteId, times: 1 });
      return;
    }
    emoteUsage.times++;
    this.insertEmoteStat(emoteUsage);
  }

  public cleanUp() {
    this.database.close();
  }
}
