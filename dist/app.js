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
const socket_io_1 = require("socket.io");
const talkingbot_1 = require("./talkingbot");
const node_fs_1 = __importDefault(require("node:fs"));
const app = (0, express_1.default)();
const server = http.createServer(app);
app.use(express_1.default.static("public"));
app.get("/tts", (req, res) => {
    res.sendFile(__dirname + "/tts.html");
});
app.get("/alerts", (req, res) => {
    res.sendFile(__dirname + "/alerts.html");
});
app.get("/wheel", (req, res) => {
    res.sendFile(__dirname + "/wheel.html");
});
app.get("/poll", (req, res) => {
    res.sendFile(__dirname + "/poll.html");
});
app.get("/chat", (req, res) => {
    res.sendFile(__dirname + "/chat.html");
});
app.get("/setup", (req, res) => {
    res.sendFile(__dirname + "/setup.html");
});
let bot = new talkingbot_1.TalkingBot("17587561", server);
const iosetup = new socket_io_1.Server(server, { path: "/setup/" });
app.get("/oauth", (req, res) => {
    let code = req.query.code;
    let scope = req.query.scope;
    if (code == "initBot") {
        res.send("initing bot");
        bot.initBot();
        return;
    }
    if (code.length == 0 || scope.length == 0) {
        res.send("Something went wrong!");
    }
    else {
        bot.twitch.addUser(code, scope);
        res.send(`Success! ${scope.startsWith("bits:read") ? "Broadcaster account added!" : "Bot account added!"}`);
    }
});
if (!node_fs_1.default.existsSync("./token-bot.json") ||
    !node_fs_1.default.existsSync("./token-broadcaster.json")) {
    console.log("\x1b[31m%s\x1b[0m", "Auth not found, please go to localhost:3000/setup to create it");
    if (node_fs_1.default.existsSync("./oauth.json"))
        bot.twitch.readAuth();
    iosetup.on("connection", (socket) => {
        console.log("got setup connection");
        let twitchClientId = bot.twitch.clientId;
        let twitchClientSecret = bot.twitch.clientSecret;
        // Send the client id and client secret if they have been given already
        if (twitchClientId.length != 0 && twitchClientSecret.length != 0)
            socket.emit("setup_message", {
                twitchClientId: twitchClientId,
                twitchClientSecret: twitchClientSecret,
            });
        socket.on("setup_message", (message) => {
            console.log(`Got setup message!`);
            bot.twitch.setupAuth(message);
        });
    });
}
else {
    bot.twitch.readAuth();
    bot.initBot();
}
server.listen(3000, () => {
    console.log("listening on *:3000");
});
