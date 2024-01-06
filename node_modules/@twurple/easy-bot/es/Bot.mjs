import { __decorate } from "tslib";
import { LogLevel } from '@d-fischer/logger';
import { Enumerable } from '@d-fischer/shared-utils';
import { EventEmitter } from '@d-fischer/typed-event-emitter';
import { ApiClient, } from '@twurple/api';
import { ChatClient, extractMessageId, toUserName, } from '@twurple/chat';
import { HellFreezesOverError } from '@twurple/common';
import { BotCommandContext } from "./BotCommandContext.mjs";
import { AnnouncementEvent } from "./events/AnnouncementEvent.mjs";
import { BanEvent } from "./events/BanEvent.mjs";
import { BitsBadgeUpgradeEvent } from "./events/BitsBadgeUpgradeEvent.mjs";
import { ChatClearEvent } from "./events/ChatClearEvent.mjs";
import { CommunityPayForwardEvent } from "./events/CommunityPayForwardEvent.mjs";
import { CommunitySubEvent } from "./events/CommunitySubEvent.mjs";
import { EmoteOnlyToggleEvent } from "./events/EmoteOnlyToggleEvent.mjs";
import { FollowersOnlyToggleEvent } from "./events/FollowersOnlyToggleEvent.mjs";
import { GiftPaidUpgradeEvent } from "./events/GiftPaidUpgradeEvent.mjs";
import { JoinEvent } from "./events/JoinEvent.mjs";
import { JoinFailureEvent } from "./events/JoinFailureEvent.mjs";
import { LeaveEvent } from "./events/LeaveEvent.mjs";
import { MessageEvent } from "./events/MessageEvent.mjs";
import { MessageRemoveEvent } from "./events/MessageRemoveEvent.mjs";
import { PrimePaidUpgradeEvent } from "./events/PrimePaidUpgradeEvent.mjs";
import { RaidCancelEvent } from "./events/RaidCancelEvent.mjs";
import { RaidEvent } from "./events/RaidEvent.mjs";
import { SlowModeToggleEvent } from "./events/SlowModeToggleEvent.mjs";
import { StandardPayForwardEvent } from "./events/StandardPayForwardEvent.mjs";
import { SubEvent } from "./events/SubEvent.mjs";
import { SubGiftEvent } from "./events/SubGiftEvent.mjs";
import { SubsOnlyToggleEvent } from "./events/SubsOnlyToggleEvent.mjs";
import { UniqueChatToggleEvent } from "./events/UniqueChatToggleEvent.mjs";
import { WhisperEvent } from "./events/WhisperEvent.mjs";
/**
 * Twitch chatbots made easy.
 *
 * @meta category main
 */
export class Bot extends EventEmitter {
    // endregion
    /**
     * Creates a new bot.
     *
     * @param config The configuration for the bot.
     */
    constructor(config) {
        const { authProvider, authMethod, channel: configChannel, channels, debug, commands, emitCommandMessageEvents, prefix, chatClientOptions, } = config;
        super();
        this._commands = new Map();
        this._botUserIdPromise = null;
        // region events
        /**
         * Fires when the client successfully connects to the chat server.
         *
         * @eventListener
         */
        this.onConnect = this.registerEvent();
        /**
         * Fires when the client disconnects from the chat server.
         *
         * @eventListener
         * @param manually Whether the disconnect was requested by the user.
         * @param reason The error that caused the disconnect, or `undefined` if there was no error.
         */
        this.onDisconnect = this.registerEvent();
        /**
         * Fires when a user is timed out from a channel.
         *
         * @eventListener
         * @param event The event object.
         */
        this.onTimeout = this.registerEvent();
        /**
         * Fires when a user is permanently banned from a channel.
         *
         * @eventListener
         * @param event The event object.
         */
        this.onBan = this.registerEvent();
        /**
         * Fires when a user upgrades their bits badge in a channel.
         *
         * @eventListener
         * @param event The event object.
         */
        this.onBitsBadgeUpgrade = this.registerEvent();
        /**
         * Fires when the chat of a channel is cleared.
         *
         * @eventListener
         * @param event The event object.
         */
        this.onChatClear = this.registerEvent();
        /**
         * Fires when emote-only mode is toggled in a channel.
         *
         * @eventListener
         * @param event The event object.
         */
        this.onEmoteOnlyToggle = this.registerEvent();
        /**
         * Fires when followers-only mode is toggled in a channel.
         *
         * @eventListener
         * @param event The event object.
         */
        this.onFollowersOnlyToggle = this.registerEvent();
        /**
         * Fires when a user joins a channel.
         *
         * The join/leave events are cached by the Twitch chat server and will be batched and sent every 30-60 seconds.
         *
         * Please note that if you have not enabled the `requestMembershipEvents` option
         * or the channel has more than 1000 connected chatters, this will only react to your own joins.
         *
         * @eventListener
         * @param event The event object.
         */
        this.onJoin = this.registerEvent();
        /**
         * Fires when you fail to join a channel.
         *
         * @eventListener
         * @param event The event object.
         */
        this.onJoinFailure = this.registerEvent();
        /**
         * Fires when a user leaves ("parts") a channel.
         *
         * The join/leave events are cached by the Twitch chat server and will be batched and sent every 30-60 seconds.
         *
         * Please note that if you have not enabled the `requestMembershipEvents` option
         * or the channel has more than 1000 connected chatters, this will only react to your own leaves.
         *
         * @eventListener
         * @param event The event object.
         */
        this.onLeave = this.registerEvent();
        /**
         * Fires when a single message is removed from a channel.
         *
         * @eventListener
         * @param event The event object.
         */
        this.onMessageRemove = this.registerEvent();
        /**
         * Fires when unique chat mode is toggled in a channel.
         *
         * @eventListener
         * @param event The event object.
         */
        this.onUniqueChatToggle = this.registerEvent();
        /**
         * Fires when a user raids a channel.
         *
         * @eventListener
         * @param event The event object.
         */
        this.onRaid = this.registerEvent();
        /**
         * Fires when a user cancels a raid.
         *
         * @eventListener
         * @param event The event object.
         */
        this.onRaidCancel = this.registerEvent();
        /**
         * Fires when slow mode is toggled in a channel.
         *
         * @eventListener
         * @param event The event object.
         */
        this.onSlowModeToggle = this.registerEvent();
        /**
         * Fires when sub only mode is toggled in a channel.
         *
         * @eventListener
         * @param event The event object.
         */
        this.onSubsOnlyToggle = this.registerEvent();
        /**
         * Fires when a user subscribes to a channel.
         *
         * @eventListener
         * @param event The event object.
         */
        this.onSub = this.registerEvent();
        /**
         * Fires when a user resubscribes to a channel.
         *
         * @eventListener
         * @param event The event object.
         */
        this.onResub = this.registerEvent();
        /**
         * Fires when a user gifts a subscription to a channel to another user.
         *
         * Community subs also fire multiple `onSubGift` events.
         * To prevent alert spam, check the [example on how to handle sub gift spam](/docs/examples/chat/sub-gift-spam).
         *
         * @eventListener
         * @param event The event object.
         */
        this.onSubGift = this.registerEvent();
        /**
         * Fires when a user gifts random subscriptions to the community of a channel.
         *
         * Community subs also fire multiple `onSubGift` events.
         * To prevent alert spam, check the [example on how to handle sub gift spam](/docs/examples/chat/sub-gift-spam).
         *
         * @eventListener
         * @param event The event object.
         */
        this.onCommunitySub = this.registerEvent();
        /**
         * Fires when a user upgrades their Prime subscription to a paid subscription in a channel.
         *
         * @eventListener
         * @param event The event object.
         */
        this.onPrimePaidUpgrade = this.registerEvent();
        /**
         * Fires when a user upgrades their gift subscription to a paid subscription in a channel.
         *
         * @eventListener
         * @param event The event object.
         */
        this.onGiftPaidUpgrade = this.registerEvent();
        /**
         * Fires when a user pays forward a subscription that was gifted to them to a specific user.
         *
         * @eventListener
         * @param event The event object.
         */
        this.onStandardPayForward = this.registerEvent();
        /**
         * Fires when a user pays forward a subscription that was gifted to them to the community.
         *
         * @eventListener
         * @param event The event object.
         */
        this.onCommunityPayForward = this.registerEvent();
        /**
         * Fires when a user sends an announcement (/announce) to a channel.
         *
         * @eventListener
         * @param event The event object.
         */
        this.onAnnouncement = this.registerEvent();
        /**
         * Fires when receiving a whisper from another user.
         *
         * @eventListener
         * @param event The event object.
         */
        this.onWhisper = this.registerEvent();
        /**
         * Fires when authentication succeeds.
         *
         * @eventListener
         */
        this.onAuthenticationSuccess = this.registerEvent();
        /**
         * Fires when authentication fails.
         *
         * @eventListener
         * @param text The message text.
         * @param retryCount The number of authentication attempts, including this one, that failed in the current attempt to connect.
         *
         * Resets when authentication succeeds.
         */
        this.onAuthenticationFailure = this.registerEvent();
        /**
         * Fires when fetching a token fails.
         *
         * @eventListener
         * @param error The error that was thrown.
         */
        this.onTokenFetchFailure = this.registerEvent();
        /**
         * Fires when sending a message fails.
         *
         * @eventListener
         * @param channel The channel that rejected the message.
         * @param reason The reason for the failure, e.g. you're banned (msg_banned)
         */
        this.onMessageFailed = this.registerEvent();
        /**
         * Fires when a user sends a message to a channel.
         *
         * @eventListener
         * @param event The event object.
         */
        this.onMessage = this.registerEvent();
        /**
         * Fires when a user sends an action (/me) to a channel.
         *
         * @eventListener
         * @param event The event object.
         */
        this.onAction = this.registerEvent();
        const resolvableChannels = configChannel ? [configChannel] : channels;
        if (!resolvableChannels) {
            throw new Error("didn't pass channel nor channels option, exiting");
        }
        this._authProvider = authProvider;
        this._prefix = prefix !== null && prefix !== void 0 ? prefix : '!';
        this._authMethod = authMethod !== null && authMethod !== void 0 ? authMethod : 'bot';
        this._commands = new Map(commands === null || commands === void 0 ? void 0 : commands.map(cmd => [cmd.name, cmd]));
        const minLevel = debug ? LogLevel.DEBUG : LogLevel.ERROR;
        this.api = new ApiClient({
            authProvider: this._authProvider,
            logger: { minLevel },
        });
        this.chat = new ChatClient({
            logger: { minLevel },
            ...chatClientOptions,
            authProvider: this._authProvider,
            channels: resolvableChannels,
        });
        this.chat.onMessage(async (channel, user, text, msg) => {
            const match = this._findMatch(msg);
            if (match === null || match === void 0 ? void 0 : match.command.canExecute(msg.channelId, msg.userInfo.userId)) {
                await match.command.execute(match.params, new BotCommandContext(this, msg));
            }
            if (match === null || emitCommandMessageEvents) {
                this.emit(this.onMessage, new MessageEvent(channel, user, text, false, msg, this));
            }
        });
        // region event redirection
        this.chat.onConnect(() => this.emit(this.onConnect));
        this.chat.onDisconnect((manually, reason) => this.emit(this.onDisconnect, manually, reason));
        this.chat.onAuthenticationSuccess(() => this.emit(this.onAuthenticationSuccess));
        this.chat.onAuthenticationFailure((text, retryCount) => this.emit(this.onAuthenticationFailure, text, retryCount));
        this.chat.onTokenFetchFailure(error => this.emit(this.onTokenFetchFailure, error));
        this.chat.onMessageFailed((channel, text) => this.emit(this.onMessageFailed, channel, text));
        this.chat.onTimeout((channel, user, duration, msg) => this.emit(this.onTimeout, new BanEvent(channel, user, duration, msg, this)));
        this.chat.onBan((channel, user, msg) => this.emit(this.onBan, new BanEvent(channel, user, null, msg, this)));
        this.chat.onBitsBadgeUpgrade((channel, user, upgradeInfo, msg) => this.emit(this.onBitsBadgeUpgrade, new BitsBadgeUpgradeEvent(channel, user, upgradeInfo, msg, this)));
        this.chat.onChatClear((channel, msg) => this.emit(this.onChatClear, new ChatClearEvent(channel, msg, this)));
        this.chat.onEmoteOnly((channel, enabled) => this.emit(this.onEmoteOnlyToggle, new EmoteOnlyToggleEvent(channel, enabled, this)));
        this.chat.onFollowersOnly((channel, enabled, delay) => this.emit(this.onFollowersOnlyToggle, new FollowersOnlyToggleEvent(channel, enabled, delay, this)));
        this.chat.onJoin((channel, user) => this.emit(this.onJoin, new JoinEvent(channel, user, this)));
        this.chat.onJoinFailure((channel, reason) => this.emit(this.onJoinFailure, new JoinFailureEvent(channel, reason, this)));
        this.chat.onPart((channel, user) => this.emit(this.onLeave, new LeaveEvent(channel, user, this)));
        this.chat.onMessageRemove((channel, messageId, msg) => this.emit(this.onMessageRemove, new MessageRemoveEvent(channel, messageId, msg, this)));
        this.chat.onUniqueChat((channel, enabled) => this.emit(this.onUniqueChatToggle, new UniqueChatToggleEvent(channel, enabled, this)));
        this.chat.onRaid((channel, user, raidInfo, msg) => this.emit(this.onRaid, new RaidEvent(channel, user, raidInfo, msg, this)));
        this.chat.onRaidCancel((channel, msg) => this.emit(this.onRaidCancel, new RaidCancelEvent(channel, msg, this)));
        this.chat.onSlow((channel, enabled, delay) => this.emit(this.onSlowModeToggle, new SlowModeToggleEvent(channel, enabled, delay, this)));
        this.chat.onSubsOnly((channel, enabled) => this.emit(this.onSubsOnlyToggle, new SubsOnlyToggleEvent(channel, enabled, this)));
        this.chat.onSub((channel, user, subInfo, msg) => this.emit(this.onSub, new SubEvent(channel, user, subInfo, msg, this)));
        this.chat.onResub((channel, user, subInfo, msg) => this.emit(this.onResub, new SubEvent(channel, user, subInfo, msg, this)));
        this.chat.onSubGift((channel, user, subInfo, msg) => this.emit(this.onSubGift, new SubGiftEvent(channel, user, subInfo, msg, this)));
        this.chat.onCommunitySub((channel, user, subInfo, msg) => this.emit(this.onCommunitySub, new CommunitySubEvent(channel, subInfo, msg, this)));
        this.chat.onPrimePaidUpgrade((channel, user, subInfo, msg) => this.emit(this.onPrimePaidUpgrade, new PrimePaidUpgradeEvent(channel, user, subInfo, msg, this)));
        this.chat.onGiftPaidUpgrade((channel, user, subInfo, msg) => this.emit(this.onGiftPaidUpgrade, new GiftPaidUpgradeEvent(channel, user, subInfo, msg, this)));
        this.chat.onStandardPayForward((channel, user, forwardInfo, msg) => this.emit(this.onStandardPayForward, new StandardPayForwardEvent(channel, user, forwardInfo, msg, this)));
        this.chat.onCommunityPayForward((channel, user, forwardInfo, msg) => this.emit(this.onCommunityPayForward, new CommunityPayForwardEvent(channel, user, forwardInfo, msg, this)));
        this.chat.onAnnouncement((channel, user, announcementInfo, msg) => this.emit(this.onAnnouncement, new AnnouncementEvent(channel, user, announcementInfo, msg, this)));
        this.chat.onWhisper((user, text, msg) => this.emit(this.onWhisper, new WhisperEvent(user, text, msg, this)));
        this.chat.onAction((channel, user, text, msg) => this.emit(this.onAction, new MessageEvent(channel, user, text, true, msg, this)));
        // endregion
        this.chat.connect();
    }
    // region chat management commands
    /**
     * Sends an announcement to the given channel.
     *
     * @param channelName The name of the channel to send the announcement to.
     * @param text The text to send.
     * @param color The color to send the announcement in. If not passed, uses the default channel color.
     */
    async announce(channelName, text, color) {
        await this.announceById(await this._resolveUserId(channelName), text, color);
    }
    /**
     * Sends an announcement to the given channel using its ID.
     *
     * @param channel The channel to send the announcement to.
     * @param text The text to send.
     * @param color The color to send the announcement in. If not passed, uses the default channel color.
     */
    async announceById(channel, text, color) {
        await this.api.asUser(await this._getPreferredUserIdForModAction(channel), async (ctx) => await ctx.chat.sendAnnouncement(channel, {
            message: text,
            color,
        }));
    }
    /**
     * Bans a user from the given channel.
     *
     * @param channelName The name of the channel to ban the user from.
     * @param userName The name of the user to ban.
     * @param reason The reason for the ban.
     */
    async ban(channelName, userName, reason) {
        const channelId = await this._resolveUserId(channelName);
        const userId = await this._resolveUserId(userName);
        await this.banByIds(channelId, userId, reason);
    }
    /**
     * Bans a user from the given channel using the channel and user IDs.
     *
     * @param channel The channel to ban the user from.
     * @param user The user to ban.
     * @param reason The reason for the ban.
     */
    async banByIds(channel, user, reason) {
        await this.api.asUser(await this._getPreferredUserIdForModAction(channel), async (ctx) => await ctx.moderation.banUser(channel, {
            user,
            reason,
        }));
    }
    /**
     * Unban a user from the given channel.
     *
     * @param channelName The name of the channel to unban the user from.
     * @param userName The name of the user to unban.
     */
    async unban(channelName, userName) {
        const channelId = await this._resolveUserId(channelName);
        const userId = await this._resolveUserId(userName);
        await this.unbanByIds(channelId, userId);
    }
    /**
     * Unbans a user from the given channel using the channel and user IDs.
     *
     * @param channel The channel to unban the user from.
     * @param user The user to unban.
     */
    async unbanByIds(channel, user) {
        await this.api.asUser(await this._getPreferredUserIdForModAction(channel), async (ctx) => await ctx.moderation.unbanUser(channel, user));
    }
    /**
     * Removes all messages from the given channel.
     *
     * @param channelName The name of the channel to remove all messages from.
     */
    async clear(channelName) {
        const channelId = await this._resolveUserId(channelName);
        await this.clearById(channelId);
    }
    /**
     * Removes all messages from the given channel using its ID.
     *
     * @param channel The channel to remove all messages from.
     */
    async clearById(channel) {
        await this.api.asUser(await this._getPreferredUserIdForModAction(channel), async (ctx) => await ctx.moderation.deleteChatMessages(channel));
    }
    /**
     * Changes the bot's username color.
     *
     * @param color The hexadecimal code (prefixed with #) or color name to use for your username.
     *
     * Please note that only Twitch Turbo or Prime users can use hexadecimal codes for arbitrary colors.
     *
     * If you have neither of those, you can only choose from the following color names:
     *
     * blue, blue_violet, cadet_blue, chocolate, coral, dodger_blue, firebrick, golden_rod, green, hot_pink, orange_red, red, sea_green, spring_green, yellow_green
     */
    async changeColor(color) {
        await this.api.chat.setColorForUser(await this._getBotUserId(), color);
    }
    /**
     * Runs a commercial break on the given channel.
     *
     * @param channelName The name of the channel to run the commercial break on.
     * @param length The duration of the commercial break.
     */
    async runCommercial(channelName, length = 30) {
        const channelId = await this._resolveUserId(channelName);
        await this.runCommercialById(channelId, length);
    }
    /**
     * Runs a commercial break on the given channel using its ID.
     *
     * @param channel The channel to run the commercial break on.
     * @param length The duration of the commercial break.
     */
    async runCommercialById(channel, length = 30) {
        await this.api.channels.startChannelCommercial(channel, length);
    }
    /**
     * Deletes a message from the given channel.
     *
     * @param channelName The name of the channel to delete the message from.
     * @param message The message (as message ID or message object) to delete.
     */
    async deleteMessage(channelName, message) {
        const channelId = await this._resolveUserId(channelName);
        await this.deleteMessageById(channelId, message);
    }
    /**
     * Deletes a message from the given channel using the channel ID.
     *
     * @param channel The channel to delete the message from.
     * @param message The message (as message ID or message object) to delete.
     */
    async deleteMessageById(channel, message) {
        await this.api.asUser(await this._getPreferredUserIdForModAction(channel), async (ctx) => await ctx.moderation.deleteChatMessages(channel, extractMessageId(message)));
    }
    /**
     * Enables emote-only mode in the given channel.
     *
     * @param channelName The name of the channel to enable emote-only mode in.
     */
    async enableEmoteOnly(channelName) {
        const channelId = await this._resolveUserId(channelName);
        await this.enableEmoteOnlyById(channelId);
    }
    /**
     * Enables emote-only mode in the given channel using its ID.
     *
     * @param channel The channel to enable emote-only mode in.
     */
    async enableEmoteOnlyById(channel) {
        await this._updateChannelSettings(channel, {
            emoteOnlyModeEnabled: true,
        });
    }
    /**
     * Disables emote-only mode in the given channel.
     *
     * @param channelName The name of the channel to disable emote-only mode in.
     */
    async disableEmoteOnly(channelName) {
        const channelId = await this._resolveUserId(channelName);
        await this.disableEmoteOnlyById(channelId);
    }
    /**
     * Disables emote-only mode in the given channel using its ID.
     *
     * @param channel The channel to disable emote-only mode in.
     */
    async disableEmoteOnlyById(channel) {
        await this._updateChannelSettings(channel, {
            emoteOnlyModeEnabled: false,
        });
    }
    /**
     * Enables followers-only mode in the given channel.
     *
     * @param channelName The name of the channel to enable followers-only mode in.
     * @param minFollowTime The time (in minutes) a user needs to be following before being able to send messages.
     */
    async enableFollowersOnly(channelName, minFollowTime = 0) {
        const channelId = await this._resolveUserId(channelName);
        await this.enableFollowersOnlyById(channelId, minFollowTime);
    }
    /**
     * Enables followers-only mode in the given channel using its ID.
     *
     * @param channel The channel to enable followers-only mode in.
     * @param minFollowTime The time (in minutes) a user needs to be following before being able to send messages.
     */
    async enableFollowersOnlyById(channel, minFollowTime = 0) {
        await this._updateChannelSettings(channel, {
            followerOnlyModeEnabled: true,
            followerOnlyModeDelay: minFollowTime,
        });
    }
    /**
     * Disables followers-only mode in the given channel.
     *
     * @param channelName The name of the channel to disable followers-only mode in.
     */
    async disableFollowersOnly(channelName) {
        const channelId = await this._resolveUserId(channelName);
        await this.disableFollowersOnlyById(channelId);
    }
    /**
     * Disables followers-only mode in the given channel using its ID.
     *
     * @param channel The channel to disable followers-only mode in.
     */
    async disableFollowersOnlyById(channel) {
        await this._updateChannelSettings(channel, {
            followerOnlyModeEnabled: false,
        });
    }
    /**
     * Gives a user moderator rights in the given channel.
     *
     * @param channelName The name of the channel to give the user moderator rights in.
     * @param userName The name of the user to give moderator rights to.
     */
    async mod(channelName, userName) {
        const channelId = await this._resolveUserId(channelName);
        const userId = await this._resolveUserId(userName);
        await this.modByIds(channelId, userId);
    }
    /**
     * Gives a user moderator rights in the given channel using the channel and user IDs.
     *
     * @param channel The channel to give the user moderator rights in.
     * @param user The user to give moderator rights to.
     */
    async modByIds(channel, user) {
        await this.api.moderation.addModerator(channel, user);
    }
    /**
     * Takes moderator rights from a user in the given channel.
     *
     * @param channelName The name of the channel to remove the user's moderator rights in.
     * @param userName The name of the user to take moderator rights from.
     */
    async unmod(channelName, userName) {
        const channelId = await this._resolveUserId(channelName);
        const userId = await this._resolveUserId(userName);
        await this.unmodByIds(channelId, userId);
    }
    /**
     * Takes moderator rights from a user in the given channel using the channel and user IDs.
     *
     * @param channel The channel to remove the user's moderator rights in.
     * @param user The user to take moderator rights from.
     */
    async unmodByIds(channel, user) {
        await this.api.moderation.removeModerator(channel, user);
    }
    /**
     * Enables unique chat mode in the given channel.
     *
     * @param channelName The name of the channel to enable unique chat mode in.
     */
    async enableUniqueChat(channelName) {
        const channelId = await this._resolveUserId(channelName);
        await this.enableUniqueChatById(channelId);
    }
    /**
     * Enables unique chat mode in the given channel using its ID.
     *
     * @param channel The channel to enable unique chat mode in.
     */
    async enableUniqueChatById(channel) {
        await this._updateChannelSettings(channel, {
            uniqueChatModeEnabled: true,
        });
    }
    /**
     * Disables unique chat mode in the given channel.
     *
     * @param channelName The name of the channel to disable unique chat mode in.
     */
    async disableUniqueChat(channelName) {
        const channelId = await this._resolveUserId(channelName);
        await this.disableUniqueChatById(channelId);
    }
    /**
     * Disables unique chat mode in the given channel using its ID.
     *
     * @param channel The channel to disable unique chat mode in.
     */
    async disableUniqueChatById(channel) {
        await this._updateChannelSettings(channel, {
            uniqueChatModeEnabled: false,
        });
    }
    /**
     * Enables slow mode in the given channel.
     *
     * @param channelName The name of the channel to enable slow mode in.
     * @param delayBetweenMessages The time (in seconds) a user needs to wait between messages.
     */
    async enableSlowMode(channelName, delayBetweenMessages = 30) {
        const channelId = await this._resolveUserId(channelName);
        await this.enableSlowModeById(channelId, delayBetweenMessages);
    }
    /**
     * Enables slow mode in the given channel using its ID.
     *
     * @param channel The channel to enable slow mode in.
     * @param delayBetweenMessages The time (in seconds) a user needs to wait between messages.
     */
    async enableSlowModeById(channel, delayBetweenMessages = 30) {
        await this._updateChannelSettings(channel, {
            slowModeEnabled: true,
            slowModeDelay: delayBetweenMessages,
        });
    }
    /**
     * Disables slow mode in the given channel.
     *
     * @param channelName The name of the channel to disable slow mode in.
     */
    async disableSlowMode(channelName) {
        const channelId = await this._resolveUserId(channelName);
        await this.disableSlowModeById(channelId);
    }
    /**
     * Disables slow mode in the given channel using its ID.
     *
     * @param channel The channel to disable slow mode in.
     */
    async disableSlowModeById(channel) {
        await this._updateChannelSettings(channel, {
            slowModeEnabled: false,
        });
    }
    /**
     * Enables subscribers-only mode in the given channel.
     *
     * @param channelName The name of the channel to enable subscribers-only mode in.
     */
    async enableSubsOnly(channelName) {
        const channelId = await this._resolveUserId(channelName);
        await this.enableSubsOnlyById(channelId);
    }
    /**
     * Enables subscribers-only mode in the given channel using its ID.
     *
     * @param channel The channel to enable subscribers-only mode in.
     */
    async enableSubsOnlyById(channel) {
        await this._updateChannelSettings(channel, {
            subscriberOnlyModeEnabled: true,
        });
    }
    /**
     * Disables subscribers-only mode in the given channel.
     *
     * @param channelName The name of the channel to disable subscribers-only mode in.
     */
    async disableSubsOnly(channelName) {
        const channelId = await this._resolveUserId(channelName);
        await this.disableSubsOnlyById(channelId);
    }
    /**
     * Disables subscribers-only mode in the given channel using its ID.
     *
     * @param channel The channel to disable subscribers-only mode in.
     */
    async disableSubsOnlyById(channel) {
        await this._updateChannelSettings(channel, {
            subscriberOnlyModeEnabled: false,
        });
    }
    /**
     * Times out a user in the given channel and removes all their messages.
     *
     * @param channelName The name of the channel to time out the user in.
     * @param userName The name of the user to time out.
     * @param duration The time (in seconds) until the user can send messages again. Defaults to 1 minute.
     * @param reason The reason for the timeout.
     */
    async timeout(channelName, userName, duration = 60, reason = '') {
        if (!Number.isInteger(duration) || duration < 1 || duration > 1209600) {
            throw new Error(`Invalid timeout duration: ${duration}. It must be an integer between 1 and 1209600.`);
        }
        const channelId = await this._resolveUserId(channelName);
        const userId = await this._resolveUserId(userName);
        await this.timeoutByIds(channelId, userId, duration, reason);
    }
    /**
     * Times out a user in the given channel and removes all their messages using the channel and user IDs.
     *
     * @param channel The channel to time out the user in.
     * @param user The user to time out.
     * @param duration The time (in seconds) until the user can send messages again. Defaults to 1 minute.
     * @param reason The reason for the timeout.
     */
    async timeoutByIds(channel, user, duration = 60, reason = '') {
        if (!Number.isInteger(duration) || duration < 1 || duration > 1209600) {
            throw new Error(`Invalid timeout duration: ${duration}. It must be an integer between 1 and 1209600.`);
        }
        await this.api.asUser(await this._getPreferredUserIdForModAction(channel), async (ctx) => await ctx.moderation.banUser(channel, {
            user,
            reason,
            duration,
        }));
    }
    /**
     * Removes all messages of a user from the given channel.
     *
     * @param channelName The name of the channel to purge the user's messages from.
     * @param userName The name of the user to purge.
     * @param reason The reason for the purge.
     */
    async purge(channelName, userName, reason = '') {
        await this.timeout(channelName, userName, 1, reason);
    }
    /**
     * Removes all messages of a user from the given channel using the channel and user IDs.
     *
     * @param channel The channel to purge the user's messages from.
     * @param user The user to purge.
     * @param reason The reason for the purge.
     */
    async purgeByIds(channel, user, reason = '') {
        await this.timeoutByIds(channel, user, 1, reason);
    }
    /**
     * Gives a user VIP status in the given channel.
     *
     * @param channelName The name of the channel to give the user VIP status in.
     * @param userName The name of the user to give VIP status.
     */
    async addVip(channelName, userName) {
        const channelId = await this._resolveUserId(channelName);
        const userId = await this._resolveUserId(userName);
        await this.addVipByIds(channelId, userId);
    }
    /**
     * Gives a user VIP status in the given channel using the channel and user IDs.
     *
     * @param channel The channel to give the user VIP status in.
     * @param user The user to give VIP status.
     */
    async addVipByIds(channel, user) {
        await this.api.channels.addVip(channel, user);
    }
    /**
     * Takes VIP status from a user in the given channel.
     *
     * @param channelName The name of the channel to take the user's VIP status in.
     * @param userName The name of the user to take VIP status from.
     */
    async removeVip(channelName, userName) {
        const channelId = await this._resolveUserId(channelName);
        const userId = await this._resolveUserId(userName);
        await this.removeVipByIds(channelId, userId);
    }
    /**
     * Takes VIP status from a user in the given channel using the channel and user IDs.
     *
     * @param channel The channel to take the user's VIP status in.
     * @param user The user to take VIP status from.
     */
    async removeVipByIds(channel, user) {
        await this.api.channels.removeVip(channel, user);
    }
    // endregion
    // region getter commands
    /**
     * Retrieves a list of moderators in the given channel.
     *
     * @param channelName The name of the channel to retrieve the moderators of.
     */
    async getMods(channelName) {
        const channelId = await this._resolveUserId(channelName);
        return await this.getModsById(channelId);
    }
    /**
     * Retrieves a list of moderators in the given channel using its ID.
     *
     * @param channel The channel to retrieve the moderators of.
     */
    async getModsById(channel) {
        return await this.api.moderation.getModeratorsPaginated(channel).getAll();
    }
    /**
     * Retrieves a list of VIPs in the given channel.
     *
     * @param channelName The name of the channel to retrieve the VIPs of.
     */
    async getVips(channelName) {
        const channelId = await this._resolveUserId(channelName);
        return await this.getVipsById(channelId);
    }
    /**
     * Retrieves a list of VIPs in the given channel using its ID.
     *
     * @param channel The channel to retrieve the VIPs of.
     */
    async getVipsById(channel) {
        return await this.api.channels.getVipsPaginated(channel).getAll();
    }
    // endregion
    // region chat messaging
    /**
     * Joins a channel.
     *
     * @param channelName The name of the channel to join.
     */
    async join(channelName) {
        await this.chat.join(channelName);
    }
    /**
     * Leaves a channel.
     *
     * @param channelName The name of the channel to leave.
     */
    leave(channelName) {
        this.chat.part(channelName);
    }
    /**
     * Sends a reply to another chat message to the given channel.
     *
     * @param channel The channel to send the message to.
     * @param text The text to send.
     * @param replyToMessage The message (or ID of the message) to reply to.
     */
    async reply(channel, text, replyToMessage) {
        await this.chat.say(channel, text, { replyTo: replyToMessage });
    }
    /**
     * Sends a regular chat message to the given channel.
     *
     * @param channel The channel to send the message to.
     * @param text The text to send.
     * @param attributes The attributes to add to the message.
     */
    async say(channel, text, attributes = {}) {
        await this.chat.say(channel, text, attributes);
    }
    /**
     * Sends an action (/me) to the given channel.
     *
     * @param channelName The name of the channel to send the action to.
     * @param text The text to send.
     */
    async action(channelName, text) {
        await this.chat.action(channelName, text);
    }
    /**
     * Sends a whisper message to the given user.
     *
     * @param targetName The name of the user to send the whisper message to.
     * @param text The text to send.
     */
    async whisper(targetName, text) {
        await this.whisperById(await this._resolveUserId(targetName), text);
    }
    /**
     * Sends a whisper message to the given user using their ID.
     *
     * @param target The user to send the whisper message to.
     * @param text The text to send.
     */
    async whisperById(target, text) {
        await this.api.whispers.sendWhisper(await this._getBotUserId(), target, text);
    }
    // endregion
    // region internals
    /** @internal */
    _findMatch(msg) {
        const line = msg.text.trim().replace(/  +/g, ' ');
        for (const command of this._commands.values()) {
            const params = command.match(line, this._prefix);
            if (params !== null) {
                return {
                    command,
                    params,
                };
            }
        }
        return null;
    }
    /** @internal */
    async _getBotUserId() {
        if (this._botUserIdPromise) {
            return await this._botUserIdPromise;
        }
        return await (this._botUserIdPromise = this.api
            .asIntent(['chat'], async (ctx) => await ctx.getTokenInfo())
            .then(tokenInfo => {
            if (!tokenInfo.userId) {
                throw new HellFreezesOverError('Bot token is not a user token');
            }
            return tokenInfo.userId;
        }));
    }
    /** @internal */
    async _getPreferredUserIdForModAction(broadcaster) {
        if (this._authMethod === 'bot') {
            return await this._getBotUserId();
        }
        return broadcaster;
    }
    /** @internal */
    async _resolveUserId(userNameOrChannel) {
        const userName = toUserName(userNameOrChannel);
        const user = await this.api.users.getUserByName(userName);
        if (!user) {
            throw new Error(`User ${userName} does not exist`);
        }
        return user.id;
    }
    /** @internal */
    async _updateChannelSettings(channel, settings) {
        await this.api.asUser(await this._getPreferredUserIdForModAction(channel), async (ctx) => await ctx.chat.updateSettings(channel, settings));
    }
}
__decorate([
    Enumerable(false)
], Bot.prototype, "_authProvider", void 0);
