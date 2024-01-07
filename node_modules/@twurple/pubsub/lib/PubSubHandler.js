"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubHandler = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const common_1 = require("@twurple/common");
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
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], PubSubHandler.prototype, "_client", void 0);
PubSubHandler = tslib_1.__decorate([
    (0, common_1.rtfm)('pubsub', 'PubSubHandler', 'userId')
], PubSubHandler);
exports.PubSubHandler = PubSubHandler;
