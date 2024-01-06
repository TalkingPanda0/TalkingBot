import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { checkRelationAssertion, rtfm } from '@twurple/common';
/**
 * An event representing a whisper message.
 *
 * @meta category events
 */
let WhisperEvent = class WhisperEvent {
    /** @internal */
    constructor(userName, text, msg, bot) {
        this._userName = userName;
        this._text = text;
        this._msg = msg;
        this._bot = bot;
    }
    /**
     * The ID of the user who sent the message.
     */
    get userId() {
        return this._msg.userInfo.userId;
    }
    /**
     * The name of the user who sent the message.
     */
    get userName() {
        return this._userName;
    }
    /**
     * The display name of the user who sent the message.
     */
    get userDisplayName() {
        return this._msg.userInfo.displayName;
    }
    /**
     * Gets more information about the user who sent the message.
     */
    async getUser() {
        return checkRelationAssertion(await this._bot.api.users.getUserById(this.userId));
    }
    /**
     * The text of the message.
     */
    get text() {
        return this._text;
    }
    /**
     * Replies to the message.
     *
     * @param text The text to send as a reply.
     */
    async reply(text) {
        await this._bot.whisperById(this.userId, text);
    }
};
__decorate([
    Enumerable(false)
], WhisperEvent.prototype, "_userName", void 0);
__decorate([
    Enumerable(false)
], WhisperEvent.prototype, "_text", void 0);
__decorate([
    Enumerable(false)
], WhisperEvent.prototype, "_msg", void 0);
__decorate([
    Enumerable(false)
], WhisperEvent.prototype, "_bot", void 0);
WhisperEvent = __decorate([
    rtfm('easy-bot', 'WhisperEvent', 'userId')
], WhisperEvent);
export { WhisperEvent };
