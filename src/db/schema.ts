import {
  sqliteTable,
  primaryKey,
  sqliteView,
  text,
  integer,
  blob,
  numeric,
} from "drizzle-orm/sqlite-core";

import { sql } from "drizzle-orm";

export const watchtimes = sqliteTable("watchtimes", {
  userId: text().primaryKey().notNull(),
  lastSeenOnStream: text(),
  watchTime: integer().notNull(),
  lastSeen: text().notNull(),
  chatTime: integer().notNull(),
  inChat: integer().notNull(),
});

export const hapboo = sqliteTable("hapboo", {
  userId: text().primaryKey(),
  times: integer().notNull(),
});

export const emotestats = sqliteTable(
  "emotestats",
  {
    userId: text().notNull(),
    emoteId: text().notNull(),
    times: integer().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.emoteId],
      name: "emotestats_pk",
    }),
  ],
);

export const reactionstats = sqliteTable(
  "reactionstats",
  {
    userId: text().notNull(),
    emoteId: text().notNull(),
    times: integer().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.emoteId],
      name: "reactionstats_pk",
    }),
  ],
);

export const customConfig = sqliteTable("config", {
  key: text().primaryKey().notNull(),
  value: blob(),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: text().primaryKey(),
  username: text().notNull(),
  sender: text().notNull(),
  senderId: text().notNull(),
  platform: text().notNull(),
  channelId: text().notNull(),
  message: text().notNull(),
  parsedMessage: text().notNull(),
  badges: text().notNull(),
  isUserMod: integer().notNull(),
  isUserVip: integer(),
  isUserSub: integer(),
  isFirst: integer().notNull(),
  isCommand: integer().notNull(),
  rewardName: text(),
  replyTo: text(),
  replyId: text(),
  replyText: text(),
  isOld: integer().notNull(),
  color: text().notNull(),
  timestamp: numeric().notNull(),
});

export const users = sqliteTable("users", {
  id: text().primaryKey(),
  userName: text().notNull(),
  color: text().notNull(),
  customName: text(),
  customColor: text(),
  xp: integer().notNull(),
});

export const combinedemotestats = sqliteView("combinedemotestats", {
  userId: text().notNull(),
  emoteId: text().notNull(),
  totaltimes: integer().notNull(),
}).as(
  sql`SELECT COALESCE(emotestats.userId, reactionstats.userId) AS userId, COALESCE(emotestats.emoteId, reactionstats.emoteId) AS emoteId, (IFNULL(emotestats.times, 0) + IFNULL(reactionstats.times, 0)) AS totaltimes FROM emotestats FULL OUTER JOIN reactionstats ON emotestats.userId = reactionstats.userId AND emotestats.emoteId = reactionstats.emoteId WHERE emotestats.userId IS NOT NULL OR reactionstats.userId IS NOT NULL`,
);
