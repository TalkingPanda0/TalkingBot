import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubExtensionBitsTransactionCreateEvent } from "../events/EventSubExtensionBitsTransactionCreateEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubExtensionBitsTransactionCreateSubscription = class EventSubExtensionBitsTransactionCreateSubscription extends EventSubSubscription {
    constructor(handler, client, _clientId) {
        super(handler, client);
        this._clientId = _clientId;
        /** @protected */ this._cliName = 'transaction';
        this.authUserId = null;
    }
    get id() {
        return `extension.bits_transaction.create.${this._clientId}`;
    }
    transformData(data) {
        return new EventSubExtensionBitsTransactionCreateEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToExtensionBitsTransactionCreateEvents(this._clientId, await this._getTransportOptions());
    }
};
EventSubExtensionBitsTransactionCreateSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubExtensionBitsTransactionCreateSubscription);
export { EventSubExtensionBitsTransactionCreateSubscription };
