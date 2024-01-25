"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.solarRadiiToMeter = exports.metersToSolarRadii = exports.findClosestStar = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const stars = JSON.parse(node_fs_1.default.readFileSync("./stars.json", "utf-8"));
function findClosestStar(distance) {
    let foundStar;
    for (const star of stars) {
        // multiply by 2 to find the diameter
        if (star.radius * 2 > distance) {
            foundStar = star;
            break;
        }
    }
    return foundStar;
}
exports.findClosestStar = findClosestStar;
function metersToSolarRadii(meters) {
    const solarRadiusInMeters = 695700000;
    const solarRadii = meters / solarRadiusInMeters;
    return solarRadii;
}
exports.metersToSolarRadii = metersToSolarRadii;
function solarRadiiToMeter(solarRadii) {
    const solarRadiusInMeters = 695700000;
    const meters = solarRadii * solarRadiusInMeters;
    return meters;
}
exports.solarRadiiToMeter = solarRadiiToMeter;
