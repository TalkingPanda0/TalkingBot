import express, { Express, Request, Response } from "express";
import * as http from 'http';

import { Server } from 'socket.io';
//import { Twitch } from './twitch';
import { initBot } from './kick';

const app : Express = express();
const server = http.createServer(app);

const iotts = new Server(server, {
  path: "/tts/"
});

const iochat = new Server(server, {
  path: "/chat/"
});

let enabled = true;

app.use(express.static('public'));

app.get('/tts', (req : Request, res: Response) => {
  res.sendFile(__dirname + '/tts.html');
});

app.get('/chat', (req : Request ,res: Response) => {
  res.sendFile(__dirname + "/chat.html");
});

function sendTTS(message: any, isMod: boolean) {
  if ((!enabled && !isMod) || !message.text || !message.sender) {
    return;
  }

  if (isMod) {
    if (message.text === "enable") {
      enabled = true;
      sendTTS({ text: "Enabled TTS command!", sender: "Brian" }, true);
      return;
    } else if (message.text === "disable") {
      enabled = false;
      sendTTS({ text: "disabled TTS command!", sender: "Brian" }, true);
      return;
    }
  }

  iotts.emit('message', message);
}

function sendChat(message: any) {
  if (message.color == null || message.color == undefined) {
    message.color = "#048ac7";
  }
  iochat.emit('message', message);
}

iotts.of('/tts').on('connection', (socket) => {
  console.log('a user connected');
});

iochat.of('/chat').on('connection', (socket) => {
  console.log('a chat connected');
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

/*let twitch = new Twitch(sendChat, sendTTS, "SweetbabooO_o");
twitch.initBot();*/

initBot(sendChat, () => {}, sendTTS, "17587561");
