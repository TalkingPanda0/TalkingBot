import { toUserName } from '@twurple/chat';
/**
 * The message context of a bot command execution handler.
 *
 * @meta category main
 */
export class BotCommandContext {
    /** @internal **/
    constructor(_bot, msg) {
        this._bot = _bot;
        this.msg = msg;
        /**
         * Sends an action (/me) to the channel.
         *
         * @param text The text to send.
         */
        this.action = async (text) => await this._bot.action(this.broadcasterName, text);
        /**
         * Sends an announcement to the channel.
         *
         * @param text The text to send.
         * @param color The color to send the announcement in. If not passed, uses the default channel color.
         */
        this.announce = async (text, color) => await this._bot.announceById(this.msg.channelId, text, color);
        /**
         * Bans the user who sent the message from the channel.
         *
         * @param reason The reason for the ban.
         */
        this.ban = async (reason) => await this._bot.banByIds(this.broadcasterId, this.userId, reason);
        /**
         * Removes all messages from the channel.
         */
        this.clear = async () => await this._bot.clearById(this.broadcasterId);
        /**
         * Runs a commercial break on the channel.
         *
         * @param length The duration of the commercial break.
         */
        this.runCommercial = async (length = 30) => await this._bot.runCommercialById(this.broadcasterId, length);
        /**
         * Deletes the message from the channel.
         */
        this.delete = async () => await this._bot.deleteMessageById(this.broadcasterId, this.msg.id);
        /**
         * Enables emote-only mode in the channel.
         */
        this.enableEmoteOnly = async () => await this._bot.enableEmoteOnlyById(this.broadcasterId);
        /**
         * Disables emote-only mode in the channel.
         */
        this.disableEmoteOnly = async () => await this._bot.disableEmoteOnlyById(this.broadcasterId);
        /**
         * Enables followers-only mode in the channel.
         *
         * @param minFollowTime The time (in minutes) a user needs to be following before being able to send messages.
         */
        this.enableFollowersOnly = async (minFollowTime = 0) => await this._bot.enableFollowersOnlyById(this.broadcasterId, minFollowTime);
        /**
         * Disables followers-only mode in the channel.
         */
        this.disableFollowersOnly = async () => await this._bot.disableFollowersOnlyById(this.broadcasterId);
        /**
         * Enables unique chat mode in the channel.
         */
        this.enableUniqueChat = async () => await this._bot.enableUniqueChatById(this.broadcasterId);
        /**
         * Disables unique chat mode in the channel.
         */
        this.disableUniqueChat = async () => await this._bot.disableUniqueChatById(this.broadcasterId);
        /**
         * Enables slow mode in the channel.
         *
         * @param delayBetweenMessages The time (in seconds) a user needs to wait between messages.
         */
        this.enableSlow = async (delayBetweenMessages = 30) => await this._bot.enableSlowModeById(this.broadcasterId, delayBetweenMessages);
        /**
         * Disables slow mode in the channel.
         */
        this.disableSlow = async () => await this._bot.disableSlowModeById(this.broadcasterId);
        /**
         * Enables subscribers-only mode in the channel.
         */
        this.enableSubsOnly = async () => await this._bot.enableSubsOnlyById(this.broadcasterId);
        /**
         * Disables subscribers-only mode in the channel.
         */
        this.disableSubsOnly = async () => await this._bot.disableSubsOnlyById(this.broadcasterId);
        /**
         * Gives the user VIP status in the channel.
         */
        this.addVip = async () => await this._bot.addVipByIds(this.broadcasterId, this.userId);
        /**
         * Takes VIP status from the user in the channel.
         */
        this.removeVip = async () => await this._bot.removeVipByIds(this.broadcasterId, this.userId);
        /**
         * Times out then user in the channel and removes all their messages.
         *
         * @param duration The time (in seconds) until the user can send messages again. Defaults to 1 minute.
         * @param reason The reason for the timeout.
         */
        this.timeout = async (duration = 30, reason = '') => await this._bot.timeoutByIds(this.broadcasterId, this.userId, duration, reason);
        /**
         * Removes all messages of the user from the channel.
         *
         * @param reason The reason for the purge.
         */
        this.purge = async (reason = '') => await this._bot.purgeByIds(this.broadcasterId, this.userId, reason);
        /**
         * Sends a reply to the chat message to the channel.
         *
         * @param text The text to send.
         */
        this.reply = async (text) => await this._bot.say(this.broadcasterName, text, { replyTo: this.msg.id });
        /**
         * Sends a regular chat message to the channel.
         *
         * @param text The text to send.
         */
        this.say = async (text) => await this._bot.say(this.broadcasterName, text);
    }
    /**
     * The ID of the broadcaster.
     */
    get broadcasterId() {
        return this.msg.channelId;
    }
    /**
     * The name of the broadcaster.
     */
    get broadcasterName() {
        return toUserName(this.msg.target);
    }
    /**
     * The ID of the user who sent the message.
     */
    get userId() {
        return this.msg.userInfo.userId;
    }
    /**
     * The name of the user who sent the message.
     */
    get userName() {
        return this.msg.userInfo.userName;
    }
    /**
     * The display name of the user who sent the message.
     */
    get userDisplayName() {
        return this.msg.userInfo.displayName;
    }
}
