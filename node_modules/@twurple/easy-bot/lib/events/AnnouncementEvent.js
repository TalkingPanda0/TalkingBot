"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementEvent = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const chat_1 = require("@twurple/chat");
const common_1 = require("@twurple/common");
/**
 * An event representing an announcement in chat.
 *
 * @meta category events
 */
let AnnouncementEvent = class AnnouncementEvent {
    /** @internal */
    constructor(channel, userName, info, msg, bot) {
        this._broadcasterName = (0, chat_1.toUserName)(channel);
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
        return (0, common_1.checkRelationAssertion)(await this._bot.api.users.getUserById(this.broadcasterId));
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
        return (0, common_1.checkRelationAssertion)(await this._bot.api.users.getUserById(this.userId));
    }
    /**
     * The color of the announcement.
     */
    get color() {
        return this._info.color;
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], AnnouncementEvent.prototype, "_broadcasterName", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], AnnouncementEvent.prototype, "_userName", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], AnnouncementEvent.prototype, "_info", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], AnnouncementEvent.prototype, "_msg", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], AnnouncementEvent.prototype, "_bot", void 0);
AnnouncementEvent = tslib_1.__decorate([
    (0, common_1.rtfm)('easy-bot', 'AnnouncementEvent', 'broadcasterId')
], AnnouncementEvent);
exports.AnnouncementEvent = AnnouncementEvent;
