"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixWhisperApi = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@twurple/common");
const whisper_external_1 = require("../../interfaces/endpoints/whisper.external");
const BaseApi_1 = require("../BaseApi");
/**
 * The API methods that deal with whispers.
 *
 * Can be accessed using 'client.whispers' on an {@link ApiClient} instance
 *
 * ## Example
 * ```ts
 * const api = new ApiClient({ authProvider });
 * await api.whispers.sendWhisper('61369223', '86753099', 'Howdy, partner!');
 * ```
 *
 * @meta category helix
 * @meta categorizedTitle Whispers
 */
let HelixWhisperApi = class HelixWhisperApi extends BaseApi_1.BaseApi {
    /**
     * Sends a whisper message to the specified user.
     *
     * NOTE: The API may silently drop whispers that it suspects of violating Twitch policies. (The API does not indicate that it dropped the whisper; it returns a 204 status code as if it succeeded).
     *
     * @param from The user sending the whisper. This user must have a verified phone number and must match the user in the access token.
     * @param to The user to receive the whisper.
     * @param message The whisper message to send. The message must not be empty.
     *
     * The maximum message lengths are:
     *
     * 500 characters if the user you're sending the message to hasn't whispered you before.
     * 10,000 characters if the user you're sending the message to has whispered you before.
     *
     * Messages that exceed the maximum length are truncated.
     */
    async sendWhisper(from, to, message) {
        await this._client.callApi({
            type: 'helix',
            url: 'whispers',
            method: 'POST',
            userId: (0, common_1.extractUserId)(from),
            scopes: ['user:manage:whispers'],
            query: (0, whisper_external_1.createWhisperQuery)(from, to),
            jsonBody: {
                message,
            },
        });
    }
};
HelixWhisperApi = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixWhisperApi')
], HelixWhisperApi);
exports.HelixWhisperApi = HelixWhisperApi;
