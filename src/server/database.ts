import { drizzle } from "drizzle-orm/bun-sqlite";

import { relations } from "./db/relations.ts";
import { customConfig, platforms } from "./db/schema.ts";

export class Database {
  public db = drizzle(__dirname + "/../../config/db.sqlite", {
    relations,
  });

  private platformCache: Map<string, number> = new Map();

  public async getOrSetConfig<T>(key: string, defaultValue: T): Promise<T> {
    const result = await this.getConfig<T>(key);
    if (result) return result;

    await this.setConfig(key, defaultValue);
    return defaultValue;
  }

  public async getConfig<T>(key: string): Promise<T | null> {
    const config = await this.db.query.customConfig.findFirst({
      where: { key: key },
    });
    if (config) return config.value as T;

    return null;
  }

  public async setConfig<T>(key: string, value: T) {
    await this.db
      .insert(customConfig)
      .values({ key, value })
      .onConflictDoUpdate({
        target: customConfig.key,
        set: { value },
      });
  }

  public getPlatfromId(name: string): number {
    const cached = this.platformCache.get(name);
    if (cached) return cached;
    const { id: platformId } = this.db
      .insert(platforms)
      .values({ name })
      .onConflictDoUpdate({
        target: platforms.name,
        set: { name },
      })
      .returning({ id: platforms.id }).get();
    this.platformCache.set(name,platformId);
    return platformId;
  }
}
