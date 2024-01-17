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
const iotts = new socket_io_1.Server(server, {
    path: "/tts/"
});
const iochat = new socket_io_1.Server(server, {
    path: "/chat/"
});
let enabled = true;
app.use(express_1.default.static('public'));
app.get('/tts', (req, res) => {
    res.sendFile(__dirname + '/tts.html');
});
app.get('/chat', (req, res) => {
    res.sendFile(__dirname + "/chat.html");
});
app.get('/setup', (req, res) => {
    res.sendFile(__dirname + "/setup.html");
});
function sendTTS(message, isMod) {
    if ((!enabled && !isMod) || !message.text || !message.sender) {
        return;
    }
    if (isMod) {
        if (message.text === "enable") {
            enabled = true;
            sendTTS({ text: "Enabled TTS command!", sender: "Brian" }, true);
            return;
        }
        else if (message.text === "disable") {
            enabled = false;
            sendTTS({ text: "disabled TTS command!", sender: "Brian" }, true);
            return;
        }
    }
    iotts.emit('message', message);
}
/*function sendChat(message: any) {
  if (message.color == null || message.color == undefined) {
    message.color = "#048ac7";
  }
  iochat.emit('message', message);
}*/
iotts.of('/tts').on('connection', (socket) => {
    console.log('a user connected');
});
iochat.of('/chat').on('connection', (socket) => {
    console.log('a chat connected');
});
server.listen(3000, () => {
    console.log('listening on *:3000');
});
let bot = new talkingbot_1.TalkingBot("SweetBabooO_o", "17587561", sendTTS);
// Check if auth.json exists
if (!node_fs_1.default.existsSync("./auth.json")) {
    const iosetup = new socket_io_1.Server(server, {
        path: "/setup/"
    });
    iosetup.of('/setup').on('message', (message) => {
    });
    // Get client id from user
    console.log("\x1b[31m%s\x1b[0m", "Auth not found,please go to localhost:3000/setup to create it");
    app.get('/oauth', (req, res) => {
        console.log(req.query.code);
        console.log(req.query.scope);
        res.send("Success!");
    });
}
else {
    bot.initBot();
}
