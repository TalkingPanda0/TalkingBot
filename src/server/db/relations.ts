import { defineRelations } from "drizzle-orm";
import * as schema from "./schema.ts";

export const relations = defineRelations(schema, (r) => ({
  platforms: {
    users: r.many.users(),
    chatMessages: r.many.chatMessages(),
    messageBadges: r.many.messageBadges(),
  },

  badges: {
    messages: r.many.chatMessages(),
  },

  chatMessages: {
    sender: r.one.users({
      from: [r.chatMessages.platform, r.chatMessages.userId],
      to: [r.users.platform, r.users.userId],
      optional: false,
    }),
    badges: r.many.messageBadges(),
    repliedMessage: r.one.chatMessages({
      from: [r.chatMessages.platform, r.chatMessages.replyId],
      to: [r.chatMessages.platform, r.chatMessages.messageId],
      optional: false,
      alias: "replies",
    }),
    replies: r.many.chatMessages({ alias: "replies" }),
    platformInfo: r.one.platforms({
      from: r.chatMessages.platform,
      to: r.platforms.id,
      optional: false,
    }),
  },

  messageBadges: {
    platformInfo: r.one.platforms({
      from: r.messageBadges.platform,
      to: r.platforms.id,
      optional: false,
    }),
    badge: r.one.badges({
      from: r.messageBadges.badgeId,
      to: r.badges.id,
      optional: false,
    }),
    message: r.one.chatMessages({
      from: [r.messageBadges.platform, r.messageBadges.messageId],
      to: [r.chatMessages.platform, r.chatMessages.messageId],
      optional: false,
    }),
  },

  emotes: {
    hapboos: r.many.hapboos(),
    usage: r.many.emoteUsage(),
  },

  hapboos: {
    emote: r.one.emotes({
      from: r.hapboos.hapbooId,
      to: r.emotes.emoteId,
      optional: false,
    }),
  },

  emoteUsage: {
    emoteInfo: r.one.emotes({
      from: r.emoteUsage.emoteId,
      to: r.emotes.emoteId,
      optional: true,
    }),
  },

  users: {
    platformInfo: r.one.platforms({
      from: r.users.platform,
      to: r.platforms.id,
      optional: false,
    }),
    messages: r.many.chatMessages(),
  },
}));

