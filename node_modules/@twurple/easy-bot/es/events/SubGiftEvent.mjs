import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { checkRelationAssertion, rtfm } from '@twurple/common';
import { SubEvent } from "./SubEvent.mjs";
/**
 * An event representing a user gifting a subscription to another user.
 *
 * @meta category events
 */
let SubGiftEvent = class SubGiftEvent extends SubEvent {
    /** @internal */
    constructor(channel, userName, info, msg, bot) {
        super(channel, userName, info, msg, bot);
        this._giftInfo = info;
    }
    /**
     * The ID of the user who sent the gift.
     */
    get gifterId() {
        var _a;
        return (_a = this._giftInfo.gifterUserId) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * The name of the user who sent the gift.
     */
    get gifterName() {
        var _a;
        return (_a = this._giftInfo.gifter) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * The display name of the user who sent the gift.
     */
    get gifterDisplayName() {
        var _a;
        return (_a = this._giftInfo.gifterDisplayName) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * Gets more information about the user who sent the gift.
     */
    async getGifter() {
        const id = this.gifterId;
        if (!id) {
            return null;
        }
        return checkRelationAssertion(await this._bot.api.users.getUserById(id));
    }
};
__decorate([
    Enumerable(false)
], SubGiftEvent.prototype, "_giftInfo", void 0);
SubGiftEvent = __decorate([
    rtfm('easy-bot', 'SubGiftEvent', 'userId')
], SubGiftEvent);
export { SubGiftEvent };
