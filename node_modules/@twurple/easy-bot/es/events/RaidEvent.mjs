import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { toUserName } from '@twurple/chat';
import { checkRelationAssertion, rtfm } from '@twurple/common';
/**
 * An event representing an incoming raid.
 *
 * @meta category events
 */
let RaidEvent = class RaidEvent {
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
     * The ID of the raid leader.
     */
    get userId() {
        return this._msg.userInfo.userId;
    }
    /**
     * The name of the raid leader.
     */
    get userName() {
        return this._userName;
    }
    /**
     * The display name of the raid leader.
     */
    get userDisplayName() {
        return this._info.displayName;
    }
    /**
     * Gets more information about the raid leader.
     */
    async getUser() {
        return checkRelationAssertion(await this._bot.api.users.getUserById(this.userId));
    }
    /**
     * The number of viewers joining with the raid.
     */
    get viewerCount() {
        return this._info.viewerCount;
    }
    /**
     * The full object that contains all the message information.
     */
    get messageObject() {
        return this._msg;
    }
};
__decorate([
    Enumerable(false)
], RaidEvent.prototype, "_broadcasterName", void 0);
__decorate([
    Enumerable(false)
], RaidEvent.prototype, "_userName", void 0);
__decorate([
    Enumerable(false)
], RaidEvent.prototype, "_info", void 0);
__decorate([
    Enumerable(false)
], RaidEvent.prototype, "_msg", void 0);
__decorate([
    Enumerable(false)
], RaidEvent.prototype, "_bot", void 0);
RaidEvent = __decorate([
    rtfm('easy-bot', 'RaidEvent', 'userId')
], RaidEvent);
export { RaidEvent };
