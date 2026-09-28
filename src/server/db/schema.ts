import {
  sqliteTable,
  text,
  integer,
  blob,
  AnySQLiteColumn,
  primaryKey,
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

export const messageBadges = sqliteTable("messageBadges", {
  messageId: text()
    .notNull()
    .references(() => chatMessages.messageId),
  badgeId: integer()
    .notNull()
    .references(() => badges.id),
});

export const chatMessages = sqliteTable(
  "chatMessages",
  {
    messageId: text(),
    platform: integer().references(() => platforms.id),
    displayName: text().notNull(),
    color: text().notNull(),
    userId: text()
      .notNull()
      .references(() => users.userId),
    message: text().notNull(),
    emoteOffsets: text(),
    replyId: text().references((): AnySQLiteColumn => chatMessages.messageId),
    timestamp: integer({ mode: "timestamp_ms" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.messageId, table.platform] })],
);

export const users = sqliteTable(
  "users",
  {
    userId: text(),
    platform: integer()
      .notNull()
      .references(() => platforms.id),
    userName: text().notNull(),
    color: text().notNull(),
    customName: text(),
    customColor: text(),
    xp: integer().default(0),
    lastSeenOnStream: integer({ mode: "timestamp_ms" }),
    lastSeen: integer({ mode: "timestamp_ms" }),
    chatTime: integer().default(0),
    watchTime: integer().default(0),
  },
  (table) => [primaryKey({ columns: [table.userId, table.platform] })],
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

export const emoteUsage = sqliteTable("emoteUsage", {
  userId: text().notNull(),
  emoteId: text().references(() => emotes.emoteId),
  emoji: text().unique(),
  times: integer().default(0),
  reactionTimes: integer().default(0),
});
