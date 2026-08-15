CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY,
	`username` text NOT NULL,
	`sender` text NOT NULL,
	`senderId` text NOT NULL,
	`platform` text NOT NULL,
	`channelId` text NOT NULL,
	`message` text NOT NULL,
	`parsedMessage` text NOT NULL,
	`badges` text NOT NULL,
	`isUserMod` integer NOT NULL,
	`isUserVip` integer,
	`isUserSub` integer,
	`isFirst` integer NOT NULL,
	`isCommand` integer NOT NULL,
	`rewardName` text,
	`replyTo` text,
	`replyId` text,
	`replyText` text,
	`isOld` integer NOT NULL,
	`color` text NOT NULL,
	`timestamp` numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE `config` (
	`key` text PRIMARY KEY,
	`value` blob
);
--> statement-breakpoint
CREATE TABLE `emotestats` (
	`userId` text NOT NULL,
	`emoteId` text NOT NULL,
	`times` integer NOT NULL,
	CONSTRAINT `emotestats_pk` PRIMARY KEY(`userId`, `emoteId`)
);
--> statement-breakpoint
CREATE TABLE `hapboo` (
	`userId` text PRIMARY KEY,
	`times` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reactionstats` (
	`userId` text NOT NULL,
	`emoteId` text NOT NULL,
	`times` integer NOT NULL,
	CONSTRAINT `reactionstats_pk` PRIMARY KEY(`userId`, `emoteId`)
);
--> statement-breakpoint
CREATE TABLE `watchtimes` (
	`userId` text PRIMARY KEY,
	`lastSeenOnStream` text,
	`watchTime` integer NOT NULL,
	`lastSeen` text NOT NULL,
	`chatTime` integer NOT NULL,
	`inChat` integer NOT NULL
);
--> statement-breakpoint
CREATE VIEW `combinedemotestats` AS SELECT COALESCE(emotestats.userId, reactionstats.userId) AS userId, COALESCE(emotestats.emoteId, reactionstats.emoteId) AS emoteId, (IFNULL(emotestats.times, 0) + IFNULL(reactionstats.times, 0)) AS totaltimes FROM emotestats FULL OUTER JOIN reactionstats ON emotestats.userId = reactionstats.userId AND emotestats.emoteId = reactionstats.emoteId WHERE emotestats.userId IS NOT NULL OR reactionstats.userId IS NOT NULL;