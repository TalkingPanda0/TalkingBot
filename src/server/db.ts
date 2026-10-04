import { drizzle, SQLiteBunDatabase } from "drizzle-orm/bun-sqlite";
import { sql, inArray, desc, eq, and } from "drizzle-orm";
import { customConfig } from "./db/schema.ts";

import { relations } from "./db/relations.ts";

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
const watchtimes = {};

export class DB {
  public db: SQLiteBunDatabase;

  constructor() {
    this.db = drizzle(__dirname + "/../../config/db.sqlite", {
      relations,
      jit: true,
    });
  }

  public async init() {
    await this.cleanDataBase();
  }

  public async getEmoteUsage(
    emoteList: string[],
    filter: string,
  ): Promise<{ userId: string; times: number }[]> {
    return [];
  }

  public async getHapbooReactions(id: string): Promise<number | null> {
    return null;
  }

  public async updateDataBase(inChat: number) {

  }

  public async cleanDataBase() {
  
  }

  public async getOrSetConfig<T>(key: string, defaultValue: T): Promise<T> {
   
    return defaultValue;
  }

  public async setConfig<T>(key: string, value: T) {
   
  }

  public async getWatchTime(id: string): Promise<WatchTime | undefined> {
    return undefined;
  }

  public async getTopWatchTime(isOffline: boolean): Promise<WatchTime[]> {
    return [];
  }

  public async addToUser(userId: string, time: number) {
    
  }

  public async userLeave(id: string, isStreamOnline: boolean) {
  
  }

  public async userJoin(id: string, isStreamOnline: boolean) {
    
  }

  public async hapbooReaction(userId: string) {
 
  }

  public async getTopHapbooReactions(): Promise<HapbooReaction[]> {
    return [];
  }

  async getEmoteStat(
    userId: string,
    emoteId: string,
  ): Promise<EmoteStat | undefined> {
    return undefined;
  }

  public async reaction(userId: string, emoteId: string, number: number) {
    
  }

  public async emoteUsage(userId: string, emoteId: string, number: number) {
   
  }

  public async getUserEmoteUsage(userId: string): Promise<EmoteStat[]> {
    return [];
  }

  public async getUserReactionUsage(userId: string): Promise<EmoteStat[]> {
    return [];
  }

  public async getUserReactionAndEmoteUsage(
    userId: string,
  ): Promise<EmoteStat[]> {
    return [];
  }

  public async getTopEmoteUsers(): Promise<
    { userId: string; times: number }[]
  > {
    return [];
  }

  public async getTopReactionUsers(): Promise<
    { userId: string; times: number }[]
  > {
    return [];
  }

  public async getTopEmoteAndReactionUsers(): Promise<
    { userId: string; times: number }[]
  > {
    return [];
  }

  public async getTopEmotes(): Promise<{ emoteId: string; times: number }[]> {
    return [];
  }

  public async getTopReactions(): Promise<
    { emoteId: string; times: number }[]
  > {
    return [];
  }

  public async getTopTotal(): Promise<{ emoteId: string; times: number }[]> {
    return [];
  }

  public cleanUp() {}
}
