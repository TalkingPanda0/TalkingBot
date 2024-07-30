import { Database, Statement } from "bun:sqlite";

interface WatchTime {
  userId: string;
  lastSeenOnStream: string; // in json
  watchTime: number; // in ms
  lastSeen: string; // in json
  chatTime: number; // in ms
  inChat: number; // 0: not in chat, 1: in offline chat, 2: watching
}
export interface EmoteStat {
  userId: string;
  emoteId: string;
  times: number;
  totaltimes?: number;
  totalUsage?: number;
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
	private notOfflineQuery: Statement; 
  private insertHapbooReaction: CallableFunction;
  private getHapbooReactionSorted: Statement;
  private insertEmoteStat: CallableFunction;
  private insertReactionStat: CallableFunction;

  public getEmoteStat: Statement;
  public getUserEmoteStat: Statement;
  public getTopEmotes: Statement;
  public getTopEmoteUsers: Statement;
  public getReactionStat: Statement;
  public getEmoteReactionStat: Statement;
  public getEmoteEmoteStat: Statement;
  public getEmoteTotalStat: Statement;
  public getUserReactionStat: Statement;
  public getUserTotalStat: Statement;
  public getTopReactions: Statement;
  public getTopReactionUsers: Statement;
  public getTopTotalUsers: Statement;
  public getTopTotal: Statement;

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
        "CREATE VIEW IF NOT EXISTS combinedemotestats AS SELECT COALESCE(emotestats.userId, reactionstats.userId) AS userId, COALESCE(emotestats.emoteId, reactionstats.emoteId) AS emoteId, (IFNULL(emotestats.times, 0) + IFNULL(reactionstats.times, 0)) AS totaltimes FROM emotestats FULL OUTER JOIN reactionstats ON emotestats.userId = reactionstats.userId AND emotestats.emoteId = reactionstats.emoteId WHERE emotestats.userId IS NOT NULL OR reactionstats.userId IS NOT NULL;",
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
      "SELECT * FROM watchtimes where inChat == ?1;",
    );
		this.notOfflineQuery = this.database.query(
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
      "SELECT * FROM hapboo ORDER BY times DESC LIMIT 10;",
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
    this.getUserEmoteStat = this.database.query(
      "SELECT * FROM emotestats WHERE userId = ?1 ORDER BY times DESC;",
    );
    this.getTopEmotes = this.database.query(
      "SELECT emoteId, SUM(times) as totalUsage FROM emotestats GROUP BY emoteId ORDER BY totalUsage DESC LIMIT 10",
    );
    this.getTopEmoteUsers = this.database.query(
      "SELECT userId,SUM(times) as totalUsage FROM emotestats GROUP BY userId ORDER BY totalUsage DESC LIMIT 10",
    );
    this.getEmoteEmoteStat = this.database.query(
      "SELECT * FROM emotestats WHERE emoteId = ?1 ORDER BY times DESC;",
    );
    const insertreactionStatQuery = this.database.prepare(
      "INSERT OR REPLACE INTO reactionstats (userId,emoteId,times) VALUES($userId,$emoteId,$times);",
    );
    this.insertReactionStat = this.database.transaction((reactionStat) => {
      insertreactionStatQuery.run(reactionStat);
    });
    this.getUserReactionStat = this.database.query(
      "SELECT * FROM reactionstats WHERE userId = ?1 ORDER BY times DESC;",
    );
    this.getUserTotalStat = this.database.query(
      "SELECT * FROM combinedemotestats WHERE userId = ?1 ORDER BY totaltimes DESC;",
    );

    this.getReactionStat = this.database.query(
      "SELECT * FROM reactionstats WHERE userId = ?1 AND emoteId = ?2;",
    );
    this.getEmoteReactionStat = this.database.query(
      "SELECT * FROM reactionstats WHERE emoteId = ?1 ORDER BY times DESC;",
    );
    this.getTopReactions = this.database.query(
      "SELECT emoteId, SUM(times) as totalUsage FROM reactionstats GROUP BY emoteId ORDER BY totalUsage DESC LIMIT 10;",
    );
    this.getTopReactionUsers = this.database.query(
      "SELECT userId,SUM(times) as totalUsage FROM reactionstats GROUP BY userId ORDER BY totalUsage DESC LIMIT 10;",
    );
    this.getTopTotalUsers = this.database.query(
      "SELECT userId,SUM(totaltimes) as totalUsage FROM combinedemotestats GROUP BY userId ORDER BY totalUsage DESC LIMIT 10;",
    );
    this.getEmoteTotalStat = this.database.query(
      "SELECT * FROM combinedemotestats WHERE emoteId = ?1 ORDER BY totaltimes DESC;",
    );
    this.getTopTotal = this.database.query(
      "SELECT emoteId, SUM(totaltimes) as totalUsage FROM combinedemotestats GROUP BY emoteId ORDER BY totalUsage DESC LIMIT 10",
    );
		this.cleanDataBase();
  }
  public updateDataBase(inChat: number) {
    const toUpdate = this.inChatQuery.all(inChat) as WatchTime[];
    const date = new Date();
    toUpdate.forEach((watchTime) => {
      if (inChat == 1) {
        const lastSeen = new Date(watchTime.lastSeen);
        watchTime.chatTime += date.getTime() - lastSeen.getTime();
        watchTime.lastSeen = date.toJSON();
      } else {
        const lastSeenOnStream = new Date(watchTime.lastSeenOnStream);
        watchTime.watchTime += date.getTime() - lastSeenOnStream.getTime();
        watchTime.lastSeenOnStream = date.toJSON();
      }
      this.insertWatchTime(watchTime);
    });
  }
  public cleanDataBase() {
    const toUpdate = this.notOfflineQuery.all() as WatchTime[];
    toUpdate.forEach((watchTime) => {
			watchTime.inChat = 0;
     
      this.insertWatchTime(watchTime);
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
  public addToUser(userId: string, time: number) {
    const watchTime = this.getWatchTime(userId);
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
      this.insertWatchTime(newWatchTime);
      return;
    }
    watchTime.watchTime += time;
    this.insertWatchTime(watchTime);
    return;
  }

  public userLeave(id: string, isStreamOnline: boolean) {
    if (id === "400510439") return;
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
    if (id === "400510439") return;
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
