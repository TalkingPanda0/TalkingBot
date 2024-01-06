import { type ResolvableValue } from '@d-fischer/shared-utils';
import { EventEmitter } from '@d-fischer/typed-event-emitter';
import { ApiClient, type HelixChatAnnouncementColor, type HelixChatUserColor, type HelixModerator, type HelixUserRelation } from '@twurple/api';
import { type AuthProvider } from '@twurple/auth';
import { ChatClient, type ChatClientOptions, type ChatMessage, type ChatSayMessageAttributes } from '@twurple/chat';
import { type CommercialLength, type UserIdResolvable } from '@twurple/common';
import { type BotCommand } from './BotCommand';
import { AnnouncementEvent } from './events/AnnouncementEvent';
import { BanEvent } from './events/BanEvent';
import { BitsBadgeUpgradeEvent } from './events/BitsBadgeUpgradeEvent';
import { ChatClearEvent } from './events/ChatClearEvent';
import { CommunityPayForwardEvent } from './events/CommunityPayForwardEvent';
import { CommunitySubEvent } from './events/CommunitySubEvent';
import { EmoteOnlyToggleEvent } from './events/EmoteOnlyToggleEvent';
import { FollowersOnlyToggleEvent } from './events/FollowersOnlyToggleEvent';
import { GiftPaidUpgradeEvent } from './events/GiftPaidUpgradeEvent';
import { JoinEvent } from './events/JoinEvent';
import { JoinFailureEvent } from './events/JoinFailureEvent';
import { LeaveEvent } from './events/LeaveEvent';
import { MessageEvent } from './events/MessageEvent';
import { MessageRemoveEvent } from './events/MessageRemoveEvent';
import { PrimePaidUpgradeEvent } from './events/PrimePaidUpgradeEvent';
import { RaidCancelEvent } from './events/RaidCancelEvent';
import { RaidEvent } from './events/RaidEvent';
import { SlowModeToggleEvent } from './events/SlowModeToggleEvent';
import { StandardPayForwardEvent } from './events/StandardPayForwardEvent';
import { SubEvent } from './events/SubEvent';
import { SubGiftEvent } from './events/SubGiftEvent';
import { SubsOnlyToggleEvent } from './events/SubsOnlyToggleEvent';
import { UniqueChatToggleEvent } from './events/UniqueChatToggleEvent';
import { WhisperEvent } from './events/WhisperEvent';
export type BotAuthMethod = 'bot' | 'broadcaster';
/**
 * The bot configuration.
 */
export interface BotConfig {
    /**
     * The {@link AuthProvider} instance to use for authenticating the bot and its users.
     */
    authProvider: AuthProvider;
    /**
     * Whether to enable debug logs.
     */
    debug?: boolean;
    /**
     * The channel to join.
     *
     * Takes priority over `channels`.
     */
    channel?: string;
    /**
     * The channels to join.
     *
     * Is ignored when `channel` is set.
     */
    channels?: ResolvableValue<string[]>;
    /**
     * The commands to register.
     */
    commands?: BotCommand[];
    /**
     * Whether to receive `onMessage` events for message that were already handled as a command.
     */
    emitCommandMessageEvents?: boolean;
    /**
     * The prefix for all commands.
     *
     * Defaults to `!`.
     */
    prefix?: string;
    /**
     * The preferred authentication method for authorized actions such as moderation.
     *
     * Defaults to bot authentication.
     *
     * Some methods can only use broadcaster authentication - they will be marked as such.
     */
    authMethod?: BotAuthMethod;
    /**
     * Additional options to pass to the constructor of the underlying {@link ChatClient}.
     */
    chatClientOptions?: Omit<ChatClientOptions, 'authProvider' | 'channels'>;
}
export type ChatAnnouncementColor = HelixChatAnnouncementColor;
export type ChatUserColor = HelixChatUserColor;
/**
 * Twitch chatbots made easy.
 *
 * @meta category main
 */
export declare class Bot extends EventEmitter {
    /**
     * Direct access to the underlying API client. Use at your own risk.
     */
    readonly api: ApiClient;
    /**
     * Direct access to the underlying chat client. Use at your own risk.
     */
    readonly chat: ChatClient;
    private readonly _prefix;
    private readonly _authMethod;
    private readonly _commands;
    private _botUserIdPromise;
    /**
     * Fires when the client successfully connects to the chat server.
     *
     * @eventListener
     */
    readonly onConnect: import("@d-fischer/typed-event-emitter").EventBinder<[]>;
    /**
     * Fires when the client disconnects from the chat server.
     *
     * @eventListener
     * @param manually Whether the disconnect was requested by the user.
     * @param reason The error that caused the disconnect, or `undefined` if there was no error.
     */
    readonly onDisconnect: import("@d-fischer/typed-event-emitter").EventBinder<[manually: boolean, reason?: Error | undefined]>;
    /**
     * Fires when a user is timed out from a channel.
     *
     * @eventListener
     * @param event The event object.
     */
    readonly onTimeout: import("@d-fischer/typed-event-emitter").EventBinder<[event: BanEvent]>;
    /**
     * Fires when a user is permanently banned from a channel.
     *
     * @eventListener
     * @param event The event object.
     */
    readonly onBan: import("@d-fischer/typed-event-emitter").EventBinder<[event: BanEvent]>;
    /**
     * Fires when a user upgrades their bits badge in a channel.
     *
     * @eventListener
     * @param event The event object.
     */
    readonly onBitsBadgeUpgrade: import("@d-fischer/typed-event-emitter").EventBinder<[event: BitsBadgeUpgradeEvent]>;
    /**
     * Fires when the chat of a channel is cleared.
     *
     * @eventListener
     * @param event The event object.
     */
    readonly onChatClear: import("@d-fischer/typed-event-emitter").EventBinder<[event: ChatClearEvent]>;
    /**
     * Fires when emote-only mode is toggled in a channel.
     *
     * @eventListener
     * @param event The event object.
     */
    readonly onEmoteOnlyToggle: import("@d-fischer/typed-event-emitter").EventBinder<[event: EmoteOnlyToggleEvent]>;
    /**
     * Fires when followers-only mode is toggled in a channel.
     *
     * @eventListener
     * @param event The event object.
     */
    readonly onFollowersOnlyToggle: import("@d-fischer/typed-event-emitter").EventBinder<[event: FollowersOnlyToggleEvent]>;
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
    readonly onJoin: import("@d-fischer/typed-event-emitter").EventBinder<[event: JoinEvent]>;
    /**
     * Fires when you fail to join a channel.
     *
     * @eventListener
     * @param event The event object.
     */
    readonly onJoinFailure: import("@d-fischer/typed-event-emitter").EventBinder<[event: JoinFailureEvent]>;
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
    readonly onLeave: import("@d-fischer/typed-event-emitter").EventBinder<[event: LeaveEvent]>;
    /**
     * Fires when a single message is removed from a channel.
     *
     * @eventListener
     * @param event The event object.
     */
    readonly onMessageRemove: import("@d-fischer/typed-event-emitter").EventBinder<[event: MessageRemoveEvent]>;
    /**
     * Fires when unique chat mode is toggled in a channel.
     *
     * @eventListener
     * @param event The event object.
     */
    readonly onUniqueChatToggle: import("@d-fischer/typed-event-emitter").EventBinder<[event: UniqueChatToggleEvent]>;
    /**
     * Fires when a user raids a channel.
     *
     * @eventListener
     * @param event The event object.
     */
    readonly onRaid: import("@d-fischer/typed-event-emitter").EventBinder<[event: RaidEvent]>;
    /**
     * Fires when a user cancels a raid.
     *
     * @eventListener
     * @param event The event object.
     */
    readonly onRaidCancel: import("@d-fischer/typed-event-emitter").EventBinder<[event: RaidCancelEvent]>;
    /**
     * Fires when slow mode is toggled in a channel.
     *
     * @eventListener
     * @param event The event object.
     */
    readonly onSlowModeToggle: import("@d-fischer/typed-event-emitter").EventBinder<[event: SlowModeToggleEvent]>;
    /**
     * Fires when sub only mode is toggled in a channel.
     *
     * @eventListener
     * @param event The event object.
     */
    readonly onSubsOnlyToggle: import("@d-fischer/typed-event-emitter").EventBinder<[event: SubsOnlyToggleEvent]>;
    /**
     * Fires when a user subscribes to a channel.
     *
     * @eventListener
     * @param event The event object.
     */
    readonly onSub: import("@d-fischer/typed-event-emitter").EventBinder<[event: SubEvent]>;
    /**
     * Fires when a user resubscribes to a channel.
     *
     * @eventListener
     * @param event The event object.
     */
    readonly onResub: import("@d-fischer/typed-event-emitter").EventBinder<[event: SubEvent]>;
    /**
     * Fires when a user gifts a subscription to a channel to another user.
     *
     * Community subs also fire multiple `onSubGift` events.
     * To prevent alert spam, check the [example on how to handle sub gift spam](/docs/examples/chat/sub-gift-spam).
     *
     * @eventListener
     * @param event The event object.
     */
    readonly onSubGift: import("@d-fischer/typed-event-emitter").EventBinder<[event: SubGiftEvent]>;
    /**
     * Fires when a user gifts random subscriptions to the community of a channel.
     *
     * Community subs also fire multiple `onSubGift` events.
     * To prevent alert spam, check the [example on how to handle sub gift spam](/docs/examples/chat/sub-gift-spam).
     *
     * @eventListener
     * @param event The event object.
     */
    readonly onCommunitySub: import("@d-fischer/typed-event-emitter").EventBinder<[event: CommunitySubEvent]>;
    /**
     * Fires when a user upgrades their Prime subscription to a paid subscription in a channel.
     *
     * @eventListener
     * @param event The event object.
     */
    readonly onPrimePaidUpgrade: import("@d-fischer/typed-event-emitter").EventBinder<[event: PrimePaidUpgradeEvent]>;
    /**
     * Fires when a user upgrades their gift subscription to a paid subscription in a channel.
     *
     * @eventListener
     * @param event The event object.
     */
    readonly onGiftPaidUpgrade: import("@d-fischer/typed-event-emitter").EventBinder<[event: GiftPaidUpgradeEvent]>;
    /**
     * Fires when a user pays forward a subscription that was gifted to them to a specific user.
     *
     * @eventListener
     * @param event The event object.
     */
    readonly onStandardPayForward: import("@d-fischer/typed-event-emitter").EventBinder<[event: StandardPayForwardEvent]>;
    /**
     * Fires when a user pays forward a subscription that was gifted to them to the community.
     *
     * @eventListener
     * @param event The event object.
     */
    readonly onCommunityPayForward: import("@d-fischer/typed-event-emitter").EventBinder<[event: CommunityPayForwardEvent]>;
    /**
     * Fires when a user sends an announcement (/announce) to a channel.
     *
     * @eventListener
     * @param event The event object.
     */
    readonly onAnnouncement: import("@d-fischer/typed-event-emitter").EventBinder<[event: AnnouncementEvent]>;
    /**
     * Fires when receiving a whisper from another user.
     *
     * @eventListener
     * @param event The event object.
     */
    readonly onWhisper: import("@d-fischer/typed-event-emitter").EventBinder<[event: WhisperEvent]>;
    /**
     * Fires when authentication succeeds.
     *
     * @eventListener
     */
    readonly onAuthenticationSuccess: import("@d-fischer/typed-event-emitter").EventBinder<[]>;
    /**
     * Fires when authentication fails.
     *
     * @eventListener
     * @param text The message text.
     * @param retryCount The number of authentication attempts, including this one, that failed in the current attempt to connect.
     *
     * Resets when authentication succeeds.
     */
    readonly onAuthenticationFailure: import("@d-fischer/typed-event-emitter").EventBinder<[text: string, retryCount: number]>;
    /**
     * Fires when fetching a token fails.
     *
     * @eventListener
     * @param error The error that was thrown.
     */
    readonly onTokenFetchFailure: import("@d-fischer/typed-event-emitter").EventBinder<[error: Error]>;
    /**
     * Fires when sending a message fails.
     *
     * @eventListener
     * @param channel The channel that rejected the message.
     * @param reason The reason for the failure, e.g. you're banned (msg_banned)
     */
    readonly onMessageFailed: import("@d-fischer/typed-event-emitter").EventBinder<[channel: string, reason: string]>;
    /**
     * Fires when a user sends a message to a channel.
     *
     * @eventListener
     * @param event The event object.
     */
    readonly onMessage: import("@d-fischer/typed-event-emitter").EventBinder<[event: MessageEvent]>;
    /**
     * Fires when a user sends an action (/me) to a channel.
     *
     * @eventListener
     * @param event The event object.
     */
    readonly onAction: import("@d-fischer/typed-event-emitter").EventBinder<[event: MessageEvent]>;
    /**
     * Creates a new bot.
     *
     * @param config The configuration for the bot.
     */
    constructor(config: BotConfig);
    /**
     * Sends an announcement to the given channel.
     *
     * @param channelName The name of the channel to send the announcement to.
     * @param text The text to send.
     * @param color The color to send the announcement in. If not passed, uses the default channel color.
     */
    announce(channelName: string, text: string, color?: ChatAnnouncementColor): Promise<void>;
    /**
     * Sends an announcement to the given channel using its ID.
     *
     * @param channel The channel to send the announcement to.
     * @param text The text to send.
     * @param color The color to send the announcement in. If not passed, uses the default channel color.
     */
    announceById(channel: UserIdResolvable, text: string, color?: ChatAnnouncementColor): Promise<void>;
    /**
     * Bans a user from the given channel.
     *
     * @param channelName The name of the channel to ban the user from.
     * @param userName The name of the user to ban.
     * @param reason The reason for the ban.
     */
    ban(channelName: string, userName: string, reason: string): Promise<void>;
    /**
     * Bans a user from the given channel using the channel and user IDs.
     *
     * @param channel The channel to ban the user from.
     * @param user The user to ban.
     * @param reason The reason for the ban.
     */
    banByIds(channel: UserIdResolvable, user: UserIdResolvable, reason: string): Promise<void>;
    /**
     * Unban a user from the given channel.
     *
     * @param channelName The name of the channel to unban the user from.
     * @param userName The name of the user to unban.
     */
    unban(channelName: string, userName: string): Promise<void>;
    /**
     * Unbans a user from the given channel using the channel and user IDs.
     *
     * @param channel The channel to unban the user from.
     * @param user The user to unban.
     */
    unbanByIds(channel: UserIdResolvable, user: UserIdResolvable): Promise<void>;
    /**
     * Removes all messages from the given channel.
     *
     * @param channelName The name of the channel to remove all messages from.
     */
    clear(channelName: string): Promise<void>;
    /**
     * Removes all messages from the given channel using its ID.
     *
     * @param channel The channel to remove all messages from.
     */
    clearById(channel: UserIdResolvable): Promise<void>;
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
    changeColor(color: ChatUserColor): Promise<void>;
    /**
     * Runs a commercial break on the given channel.
     *
     * @param channelName The name of the channel to run the commercial break on.
     * @param length The duration of the commercial break.
     */
    runCommercial(channelName: string, length?: CommercialLength): Promise<void>;
    /**
     * Runs a commercial break on the given channel using its ID.
     *
     * @param channel The channel to run the commercial break on.
     * @param length The duration of the commercial break.
     */
    runCommercialById(channel: UserIdResolvable, length?: CommercialLength): Promise<void>;
    /**
     * Deletes a message from the given channel.
     *
     * @param channelName The name of the channel to delete the message from.
     * @param message The message (as message ID or message object) to delete.
     */
    deleteMessage(channelName: string, message: string | ChatMessage): Promise<void>;
    /**
     * Deletes a message from the given channel using the channel ID.
     *
     * @param channel The channel to delete the message from.
     * @param message The message (as message ID or message object) to delete.
     */
    deleteMessageById(channel: UserIdResolvable, message: string | ChatMessage): Promise<void>;
    /**
     * Enables emote-only mode in the given channel.
     *
     * @param channelName The name of the channel to enable emote-only mode in.
     */
    enableEmoteOnly(channelName: string): Promise<void>;
    /**
     * Enables emote-only mode in the given channel using its ID.
     *
     * @param channel The channel to enable emote-only mode in.
     */
    enableEmoteOnlyById(channel: UserIdResolvable): Promise<void>;
    /**
     * Disables emote-only mode in the given channel.
     *
     * @param channelName The name of the channel to disable emote-only mode in.
     */
    disableEmoteOnly(channelName: string): Promise<void>;
    /**
     * Disables emote-only mode in the given channel using its ID.
     *
     * @param channel The channel to disable emote-only mode in.
     */
    disableEmoteOnlyById(channel: UserIdResolvable): Promise<void>;
    /**
     * Enables followers-only mode in the given channel.
     *
     * @param channelName The name of the channel to enable followers-only mode in.
     * @param minFollowTime The time (in minutes) a user needs to be following before being able to send messages.
     */
    enableFollowersOnly(channelName: string, minFollowTime?: number): Promise<void>;
    /**
     * Enables followers-only mode in the given channel using its ID.
     *
     * @param channel The channel to enable followers-only mode in.
     * @param minFollowTime The time (in minutes) a user needs to be following before being able to send messages.
     */
    enableFollowersOnlyById(channel: UserIdResolvable, minFollowTime?: number): Promise<void>;
    /**
     * Disables followers-only mode in the given channel.
     *
     * @param channelName The name of the channel to disable followers-only mode in.
     */
    disableFollowersOnly(channelName: string): Promise<void>;
    /**
     * Disables followers-only mode in the given channel using its ID.
     *
     * @param channel The channel to disable followers-only mode in.
     */
    disableFollowersOnlyById(channel: UserIdResolvable): Promise<void>;
    /**
     * Gives a user moderator rights in the given channel.
     *
     * @param channelName The name of the channel to give the user moderator rights in.
     * @param userName The name of the user to give moderator rights to.
     */
    mod(channelName: string, userName: string): Promise<void>;
    /**
     * Gives a user moderator rights in the given channel using the channel and user IDs.
     *
     * @param channel The channel to give the user moderator rights in.
     * @param user The user to give moderator rights to.
     */
    modByIds(channel: UserIdResolvable, user: UserIdResolvable): Promise<void>;
    /**
     * Takes moderator rights from a user in the given channel.
     *
     * @param channelName The name of the channel to remove the user's moderator rights in.
     * @param userName The name of the user to take moderator rights from.
     */
    unmod(channelName: string, userName: string): Promise<void>;
    /**
     * Takes moderator rights from a user in the given channel using the channel and user IDs.
     *
     * @param channel The channel to remove the user's moderator rights in.
     * @param user The user to take moderator rights from.
     */
    unmodByIds(channel: UserIdResolvable, user: UserIdResolvable): Promise<void>;
    /**
     * Enables unique chat mode in the given channel.
     *
     * @param channelName The name of the channel to enable unique chat mode in.
     */
    enableUniqueChat(channelName: string): Promise<void>;
    /**
     * Enables unique chat mode in the given channel using its ID.
     *
     * @param channel The channel to enable unique chat mode in.
     */
    enableUniqueChatById(channel: UserIdResolvable): Promise<void>;
    /**
     * Disables unique chat mode in the given channel.
     *
     * @param channelName The name of the channel to disable unique chat mode in.
     */
    disableUniqueChat(channelName: string): Promise<void>;
    /**
     * Disables unique chat mode in the given channel using its ID.
     *
     * @param channel The channel to disable unique chat mode in.
     */
    disableUniqueChatById(channel: UserIdResolvable): Promise<void>;
    /**
     * Enables slow mode in the given channel.
     *
     * @param channelName The name of the channel to enable slow mode in.
     * @param delayBetweenMessages The time (in seconds) a user needs to wait between messages.
     */
    enableSlowMode(channelName: string, delayBetweenMessages?: number): Promise<void>;
    /**
     * Enables slow mode in the given channel using its ID.
     *
     * @param channel The channel to enable slow mode in.
     * @param delayBetweenMessages The time (in seconds) a user needs to wait between messages.
     */
    enableSlowModeById(channel: UserIdResolvable, delayBetweenMessages?: number): Promise<void>;
    /**
     * Disables slow mode in the given channel.
     *
     * @param channelName The name of the channel to disable slow mode in.
     */
    disableSlowMode(channelName: string): Promise<void>;
    /**
     * Disables slow mode in the given channel using its ID.
     *
     * @param channel The channel to disable slow mode in.
     */
    disableSlowModeById(channel: UserIdResolvable): Promise<void>;
    /**
     * Enables subscribers-only mode in the given channel.
     *
     * @param channelName The name of the channel to enable subscribers-only mode in.
     */
    enableSubsOnly(channelName: string): Promise<void>;
    /**
     * Enables subscribers-only mode in the given channel using its ID.
     *
     * @param channel The channel to enable subscribers-only mode in.
     */
    enableSubsOnlyById(channel: UserIdResolvable): Promise<void>;
    /**
     * Disables subscribers-only mode in the given channel.
     *
     * @param channelName The name of the channel to disable subscribers-only mode in.
     */
    disableSubsOnly(channelName: string): Promise<void>;
    /**
     * Disables subscribers-only mode in the given channel using its ID.
     *
     * @param channel The channel to disable subscribers-only mode in.
     */
    disableSubsOnlyById(channel: UserIdResolvable): Promise<void>;
    /**
     * Times out a user in the given channel and removes all their messages.
     *
     * @param channelName The name of the channel to time out the user in.
     * @param userName The name of the user to time out.
     * @param duration The time (in seconds) until the user can send messages again. Defaults to 1 minute.
     * @param reason The reason for the timeout.
     */
    timeout(channelName: string, userName: string, duration?: number, reason?: string): Promise<void>;
    /**
     * Times out a user in the given channel and removes all their messages using the channel and user IDs.
     *
     * @param channel The channel to time out the user in.
     * @param user The user to time out.
     * @param duration The time (in seconds) until the user can send messages again. Defaults to 1 minute.
     * @param reason The reason for the timeout.
     */
    timeoutByIds(channel: UserIdResolvable, user: UserIdResolvable, duration?: number, reason?: string): Promise<void>;
    /**
     * Removes all messages of a user from the given channel.
     *
     * @param channelName The name of the channel to purge the user's messages from.
     * @param userName The name of the user to purge.
     * @param reason The reason for the purge.
     */
    purge(channelName: string, userName: string, reason?: string): Promise<void>;
    /**
     * Removes all messages of a user from the given channel using the channel and user IDs.
     *
     * @param channel The channel to purge the user's messages from.
     * @param user The user to purge.
     * @param reason The reason for the purge.
     */
    purgeByIds(channel: UserIdResolvable, user: UserIdResolvable, reason?: string): Promise<void>;
    /**
     * Gives a user VIP status in the given channel.
     *
     * @param channelName The name of the channel to give the user VIP status in.
     * @param userName The name of the user to give VIP status.
     */
    addVip(channelName: string, userName: string): Promise<void>;
    /**
     * Gives a user VIP status in the given channel using the channel and user IDs.
     *
     * @param channel The channel to give the user VIP status in.
     * @param user The user to give VIP status.
     */
    addVipByIds(channel: UserIdResolvable, user: UserIdResolvable): Promise<void>;
    /**
     * Takes VIP status from a user in the given channel.
     *
     * @param channelName The name of the channel to take the user's VIP status in.
     * @param userName The name of the user to take VIP status from.
     */
    removeVip(channelName: string, userName: string): Promise<void>;
    /**
     * Takes VIP status from a user in the given channel using the channel and user IDs.
     *
     * @param channel The channel to take the user's VIP status in.
     * @param user The user to take VIP status from.
     */
    removeVipByIds(channel: UserIdResolvable, user: UserIdResolvable): Promise<void>;
    /**
     * Retrieves a list of moderators in the given channel.
     *
     * @param channelName The name of the channel to retrieve the moderators of.
     */
    getMods(channelName: string): Promise<HelixModerator[]>;
    /**
     * Retrieves a list of moderators in the given channel using its ID.
     *
     * @param channel The channel to retrieve the moderators of.
     */
    getModsById(channel: UserIdResolvable): Promise<HelixModerator[]>;
    /**
     * Retrieves a list of VIPs in the given channel.
     *
     * @param channelName The name of the channel to retrieve the VIPs of.
     */
    getVips(channelName: string): Promise<HelixUserRelation[]>;
    /**
     * Retrieves a list of VIPs in the given channel using its ID.
     *
     * @param channel The channel to retrieve the VIPs of.
     */
    getVipsById(channel: UserIdResolvable): Promise<HelixUserRelation[]>;
    /**
     * Joins a channel.
     *
     * @param channelName The name of the channel to join.
     */
    join(channelName: string): Promise<void>;
    /**
     * Leaves a channel.
     *
     * @param channelName The name of the channel to leave.
     */
    leave(channelName: string): void;
    /**
     * Sends a reply to another chat message to the given channel.
     *
     * @param channel The channel to send the message to.
     * @param text The text to send.
     * @param replyToMessage The message (or ID of the message) to reply to.
     */
    reply(channel: string, text: string, replyToMessage: string | ChatMessage): Promise<void>;
    /**
     * Sends a regular chat message to the given channel.
     *
     * @param channel The channel to send the message to.
     * @param text The text to send.
     * @param attributes The attributes to add to the message.
     */
    say(channel: string, text: string, attributes?: ChatSayMessageAttributes): Promise<void>;
    /**
     * Sends an action (/me) to the given channel.
     *
     * @param channelName The name of the channel to send the action to.
     * @param text The text to send.
     */
    action(channelName: string, text: string): Promise<void>;
    /**
     * Sends a whisper message to the given user.
     *
     * @param targetName The name of the user to send the whisper message to.
     * @param text The text to send.
     */
    whisper(targetName: string, text: string): Promise<void>;
    /**
     * Sends a whisper message to the given user using their ID.
     *
     * @param target The user to send the whisper message to.
     * @param text The text to send.
     */
    whisperById(target: UserIdResolvable, text: string): Promise<void>;
}
//# sourceMappingURL=Bot.d.ts.map