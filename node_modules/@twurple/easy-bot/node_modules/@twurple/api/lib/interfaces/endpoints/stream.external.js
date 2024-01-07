"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVideoQuery = exports.createStreamMarkerBody = exports.createStreamQuery = void 0;
const common_1 = require("@twurple/common");
/** @internal */
function createStreamQuery(filter) {
    return {
        game_id: filter.game,
        language: filter.language,
        type: filter.type,
        user_id: filter.userId,
        user_login: filter.userName,
    };
}
exports.createStreamQuery = createStreamQuery;
/** @internal */
function createStreamMarkerBody(broadcaster, description) {
    return {
        user_id: (0, common_1.extractUserId)(broadcaster),
        description,
    };
}
exports.createStreamMarkerBody = createStreamMarkerBody;
/** @internal */
function createVideoQuery(id) {
    return {
        video_id: id,
    };
}
exports.createVideoQuery = createVideoQuery;
