-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `watchtimes` (
	`userId` text,
	`lastSeenOnStream` text,
	`watchTime` integer,
	`lastSeen` text,
	`chatTime` integer,
	`inChat` integer,
	CONSTRAINT `watchtimes_pk` PRIMARY KEY(`userId`)
);
--> statement-breakpoint
CREATE TABLE `hapboo` (
	`userId` text,
	`times` integer,
	CONSTRAINT `hapboo_pk` PRIMARY KEY(`userId`)
);
--> statement-breakpoint
CREATE TABLE `emotestats` (
	`userId` text,
	`emoteId` text,
	`times` integer,
	CONSTRAINT `emotestats_pk` PRIMARY KEY(`userId`, `emoteId`)
);
--> statement-breakpoint
CREATE TABLE `reactionstats` (
	`userId` text,
	`emoteId` text,
	`times` integer,
	CONSTRAINT `reactionstats_pk` PRIMARY KEY(`userId`, `emoteId`)
);
--> statement-breakpoint
CREATE TABLE `config` (
	`key` text,
	`value` blob,
	CONSTRAINT `config_pk` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` text,
	`username` text NOT NULL,
	`sender` text,
	`senderId` text,
	`platform` text,
	`channelId` text,
	`message` text,
	`parsedMessage` text,
	`badges` text,
	`isUserMod` integer,
	`isUserVip` integer,
	`isUserSub` integer,
	`isFirst` integer,
	`isCommand` integer,
	`rewardName` text,
	`replyTo` text,
	`replyId` text,
	`replyText` text,
	`isOld` integer,
	`color` text,
	`timestamp` numeric NOT NULL,
	CONSTRAINT `chat_messages_pk` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE VIEW `combinedemotestats` AS SELECT COALESCE(emotestats.userId, reactionstats.userId) AS userId, COALESCE(emotestats.emoteId, reactionstats.emoteId) AS emoteId, (IFNULL(emotestats.times, 0) + IFNULL(reactionstats.times, 0)) AS totaltimes FROM emotestats FULL OUTER JOIN reactionstats ON emotestats.userId = reactionstats.userId AND emotestats.emoteId = reactionstats.emoteId WHERE emotestats.userId IS NOT NULL OR reactionstats.userId IS NOT NULL;
*/