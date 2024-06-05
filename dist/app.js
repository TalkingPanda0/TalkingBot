"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http = __importStar(require("http"));
const talkingbot_1 = require("./talkingbot");
const app = (0, express_1.default)();
const server = http.createServer(app);
app.use(express_1.default.static("public"));
app.get("/tts", (req, res) => {
    res.sendFile(__dirname + "/html/tts.html");
});
app.get("/modtext", (req, res) => {
    res.sendFile(__dirname + "/html/modtext.html");
});
app.get("/alerts", (req, res) => {
    res.sendFile(__dirname + "/html/alerts.html");
});
app.get("/poll", (req, res) => {
    res.sendFile(__dirname + "/html/poll.html");
});
app.get("/chat", (req, res) => {
    res.sendFile(__dirname + "/html/chat.html");
});
app.get("/setup", (req, res) => {
    res.sendFile(__dirname + "/html/setup.html");
});
const bot = new talkingbot_1.TalkingBot("17587561", server);
bot.initBot();
server.listen(3000, () => {
    console.log("listening on *:3000");
});
process.on("SIGINT", () => {
    console.log("Exitting...");
    bot.cleanUp();
    process.exit();
});
