import { defineRelations } from "drizzle-orm";
import * as schema from "./schema.ts";

export const relations = defineRelations(schema, (r) => ({
  chatMessages: {
    sender: r.one.users({
      from: r.chatMessages.userId,
      to: r.users.userId,
      optional: false,
    }),
    badges: r.many.badges({
      from: r.chatMessages.messageId.through(r.messageBadges.messageId),
      to: r.badges.id.through(r.messageBadges.badgeId),
    }),
    repliedMessage: r.one.chatMessages({
      from: r.chatMessages.replyId,
      to: r.chatMessages.messageId,
      optional: true,
    }),
    platformName: r.one.platforms({
      from: r.chatMessages.platform,
      to: r.platforms.id,
      optional: false,
    }),
  },
  badges: {
    messages: r.many.chatMessages(),
  },
  emoteUsage: {
    emoteInfo: r.one.emotes({
      from: r.emoteUsage.emoteId,
      to: r.emotes.emoteId,
      optional: true,
    }),
  },
  users: {
    platformName: r.one.platforms({
      from: r.users.platform,
      to: r.platforms.id,
      optional: false,
    }),
  },
}));
