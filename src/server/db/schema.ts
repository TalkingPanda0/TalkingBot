import { sql } from "drizzle-orm";
import { isNotNull } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  blob,
  primaryKey,
  uniqueIndex,
  check,
  foreignKey,
} from "drizzle-orm/sqlite-core";

export const customConfig = sqliteTable("config", {
  key: text().primaryKey().notNull(),
  value: blob(),
});

export const platforms = sqliteTable("platforms", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
});

export const badges = sqliteTable("badges", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  url: text().notNull().unique(),
});

export const messageBadges = sqliteTable(
  "messageBadges",
  {
    messageId: text().notNull(),
    platform: integer()
      .notNull()
      .references(() => platforms.id),
    badgeId: integer()
      .notNull()
      .references(() => badges.id),
  },
  (table) => [
    foreignKey({
      columns: [table.platform, table.messageId],
      foreignColumns: [chatMessages.platform, chatMessages.messageId],
    }),
  ],
);

export const chatMessages = sqliteTable(
  "chatMessages",
  {
    messageId: text().notNull(),
    platform: integer()
      .notNull()
      .references(() => platforms.id),
    displayName: text().notNull(),
    color: text().notNull(),
    userId: text().notNull(),
    message: text().notNull(),
    emoteOffsets: text(),
    replyId: text(),
    isAction: integer({mode: "boolean"}).default(false),
    highlightMessage: text(),
    highlightColor: text(),
    timestamp: integer({ mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.platform, table.replyId],
      foreignColumns: [table.platform, table.messageId],
    }),
    foreignKey({
      columns: [table.platform, table.userId],
      foreignColumns: [users.platform, users.userId],
    }),
    primaryKey({ columns: [table.platform, table.messageId] }),
  ],
);

export const users = sqliteTable(
  "users",
  {
    userId: text().notNull(),
    platform: integer()
      .notNull()
      .references(() => platforms.id),
    displayName: text().notNull(),
    color: text().notNull(),
    customName: text(),
    customColor: text(),
    xp: integer().default(0),
    lastSeenOnStream: integer({ mode: "timestamp_ms" }),
    lastSeen: integer({ mode: "timestamp_ms" }),
    chatTime: integer().default(0),
    watchTime: integer().default(0),
  },
  (table) => [primaryKey({ columns: [table.platform, table.userId] })],
);

export const emotes = sqliteTable("emotes", {
  emoteId: text().primaryKey(),
  name: text().notNull(),
  isAnimated: integer({ mode: "boolean" }).default(false),
});

export const hapboos = sqliteTable("hapboos", {
  hapbooId: text()
    .notNull()
    .references(() => emotes.emoteId),
  userId: text().notNull(),
  times: integer().default(0),
});

export const emoteUsage = sqliteTable(
  "emoteUsage",
  {
    userId: text().notNull(),
    emoteId: text().references(() => emotes.emoteId),
    emoji: text(),
    times: integer().default(0),
    reactionTimes: integer().default(0),
  },
  (table) => [
    check(
      "emote_or_emoji",
      sql`(${table.emoteId} IS NOT NULL AND ${table.emoji} IS NULL) OR (${table.emoji} IS NOT NULL AND ${table.emoteId} IS NULL)`,
    ),
    uniqueIndex("user_emote_index")
      .on(table.userId, table.emoteId)
      .where(isNotNull(table.emoteId)),
    uniqueIndex("user_emoji_index")
      .on(table.userId, table.emoji)
      .where(isNotNull(table.emoji)),
  ],
);
