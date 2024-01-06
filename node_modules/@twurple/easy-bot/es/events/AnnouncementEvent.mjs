import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { toUserName } from '@twurple/chat';
import { checkRelationAssertion, rtfm } from '@twurple/common';
/**
 * An event representing an announcement in chat.
 *
 * @meta category events
 */
let AnnouncementEvent = class AnnouncementEvent {
    /** @internal */
    constructor(channel, userName, info, msg, bot) {
        this._broadcasterName = toUserName(channel);
        this._userName = userName;
        this._info = info;
        this._msg = msg;
        this._bot = bot;
    }
    /**
     * The ID of the broadcaster.
     */
    get broadcasterId() {
        return this._msg.channelId;
    }
    /**
     * The name of the broadcaster.
     */
    get broadcasterName() {
        return this._broadcasterName;
    }
    /**
     * Gets more information about the broadcaster.
     */
    async getBroadcaster() {
        return checkRelationAssertion(await this._bot.api.users.getUserById(this.broadcasterId));
    }
    /**
     * The ID of the user who sent the announcement.
     */
    get userId() {
        return this._msg.userInfo.userId;
    }
    /**
     * The name of the user who sent the announcement.
     */
    get userName() {
        return this._userName;
    }
    /**
     * The display name of the user who sent the announcement.
     */
    get userDisplayName() {
        return this._msg.userInfo.displayName;
    }
    /**
     * Gets more information about the user.
     */
    async getUser() {
        return checkRelationAssertion(await this._bot.api.users.getUserById(this.userId));
    }
    /**
     * The color of the announcement.
     */
    get color() {
        return this._info.color;
    }
};
__decorate([
    Enumerable(false)
], AnnouncementEvent.prototype, "_broadcasterName", void 0);
__decorate([
    Enumerable(false)
], AnnouncementEvent.prototype, "_userName", void 0);
__decorate([
    Enumerable(false)
], AnnouncementEvent.prototype, "_info", void 0);
__decorate([
    Enumerable(false)
], AnnouncementEvent.prototype, "_msg", void 0);
__decorate([
    Enumerable(false)
], AnnouncementEvent.prototype, "_bot", void 0);
AnnouncementEvent = __decorate([
    rtfm('easy-bot', 'AnnouncementEvent', 'broadcasterId')
], AnnouncementEvent);
export { AnnouncementEvent };
