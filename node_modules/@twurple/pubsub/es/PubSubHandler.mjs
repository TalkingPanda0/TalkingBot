import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { rtfm } from '@twurple/common';
/**
 * A handler attached to a single PubSub topic.
 */
let PubSubHandler = class PubSubHandler {
    /** @internal */
    constructor(_topic, _userId, _callback, client) {
        this._topic = _topic;
        this._userId = _userId;
        this._callback = _callback;
        this._client = client;
    }
    /**
     * The type of the topic.
     */
    get topic() {
        return this._topic;
    }
    /**
     * The user ID part of the topic.
     */
    get userId() {
        return this._userId;
    }
    /**
     * Removes the topic from the PubSub client.
     */
    remove() {
        this._client.removeHandler(this);
    }
    /** @internal */
    call(message) {
        this._callback(message);
    }
};
__decorate([
    Enumerable(false)
], PubSubHandler.prototype, "_client", void 0);
PubSubHandler = __decorate([
    rtfm('pubsub', 'PubSubHandler', 'userId')
], PubSubHandler);
export { PubSubHandler };
