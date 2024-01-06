"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixAutoModSettings = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@twurple/common");
/**
 * The AutoMod settings of a channel.
 */
let HelixAutoModSettings = class HelixAutoModSettings extends common_1.DataObject {
    /**
     * The ID of the broadcaster for which the AutoMod settings were fetched.
     */
    get broadcasterId() {
        return this[common_1.rawDataSymbol].broadcaster_id;
    }
    /**
     * The ID of a user that has permission to moderate the broadcaster's chat room.
     */
    get moderatorId() {
        return this[common_1.rawDataSymbol].moderator_id;
    }
    /**
     * The default AutoMod level for the broadcaster. This is null if the broadcaster changed individual settings.
     */
    get overallLevel() {
        return this[common_1.rawDataSymbol].overall_level ? this[common_1.rawDataSymbol].overall_level : null;
    }
    /**
     * The AutoMod level for discrimination against disability.
     */
    get disability() {
        return this[common_1.rawDataSymbol].disability;
    }
    /**
     * The AutoMod level for hostility involving aggression.
     */
    get aggression() {
        return this[common_1.rawDataSymbol].aggression;
    }
    /**
     * The AutoMod level for discrimination based on sexuality, sex, or gender.
     */
    get sexualitySexOrGender() {
        return this[common_1.rawDataSymbol].sexuality_sex_or_gender;
    }
    /**
     * The AutoMod level for discrimination against women.
     */
    get misogyny() {
        return this[common_1.rawDataSymbol].misogyny;
    }
    /**
     * The AutoMod level for hostility involving name calling or insults.
     */
    get bullying() {
        return this[common_1.rawDataSymbol].bullying;
    }
    /**
     * The AutoMod level for profanity.
     */
    get swearing() {
        return this[common_1.rawDataSymbol].swearing;
    }
    /**
     * The AutoMod level for racial discrimination.
     */
    get raceEthnicityOrReligion() {
        return this[common_1.rawDataSymbol].race_ethnicity_or_religion;
    }
    /**
     * The AutoMod level for sexual content.
     */
    get sexBasedTerms() {
        return this[common_1.rawDataSymbol].sex_based_terms;
    }
};
HelixAutoModSettings = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixAutoModSettings', 'broadcasterId')
], HelixAutoModSettings);
exports.HelixAutoModSettings = HelixAutoModSettings;
