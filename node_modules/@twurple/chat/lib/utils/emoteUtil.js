"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEmoteOffsets = void 0;
/**
 * Parses an emote offset string into a map that maps emote IDs to their position ranges.
 *
 * @param emotes The emote offset string.
 */
function parseEmoteOffsets(emotes) {
    if (!emotes) {
        return new Map();
    }
    return new Map(emotes
        .split('/')
        .map(emote => {
        const [emoteId, placements] = emote.split(':', 2);
        if (!placements) {
            return null;
        }
        return [emoteId, placements.split(',')];
    })
        .filter((e) => e !== null));
}
exports.parseEmoteOffsets = parseEmoteOffsets;
