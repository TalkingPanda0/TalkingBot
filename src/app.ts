import express, { Express, Request, Response } from "express";
import * as http from 'http';

import { Server } from 'socket.io';
import { AuthSetup, TalkingBot, TTSMessage } from "./talkingbot";
import fs from "node:fs";

const app: Express = express();
const server = http.createServer(app);

const iotts = new Server(server, {
  path: "/tts/"
});

const iochat = new Server(server, {
  path: "/chat/"
});


let enabled = true;

app.use(express.static('public'));

app.get('/tts', (req: Request, res: Response) => {
  res.sendFile(__dirname + '/tts.html');
});

app.get('/chat', (req: Request, res: Response) => {
  res.sendFile(__dirname + "/chat.html");
});
app.get('/setup', (req: Request, res: Response) => {
  res.sendFile(__dirname + "/setup.html");
});


function sendTTS(message: TTSMessage, isMod: boolean) {
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



let bot: TalkingBot = new TalkingBot("SweetBabooO_o", "17587561", sendTTS);


// Check if oauth.json exists
if (!fs.existsSync("./oauth.json")) {
  console.log("\x1b[31m%s\x1b[0m", "Auth not found, please go to localhost:3000/setup to create it");

  const iosetup = new Server(server, { path: "/setup/" });

  iosetup.on('connection', (socket) => {
    console.log("got chat connection");

    let twitchClientId = bot.twitch.clientId;
    let twitchClientSecret = bot.twitch.clientSecret;

    if (twitchClientId.length != 0 && twitchClientSecret.length != 0)
      socket.emit('setup_message', { twitchClientId: twitchClientId, twitchClientSecret: twitchClientSecret });

    socket.on('setup_message', (message: AuthSetup) => {
      console.log(`Got ${message.twitchClientId} ${message.twitchClientSecret}`)
      bot.twitch.setupAuth(message);
    });

  });


  app.get('/oauth', (req: Request, res: Response) => {
    let code: string = req.query.code as string;
    let scope: string = req.query.scope as string;
    if(code == "initBot"){
      res.send("initing bot");
      bot.initBot();
      return;
    }
    if (code.length == 0 || scope.length == 0) {
      res.send("Something went wrong!");
    } else {

      bot.twitch.addUser(code, scope);
      res.send(`Success! ${scope.startsWith("bits:read") ? "Broadcaster account added!" : "Bot account added!"}`);
    }

  });
} else {
  bot.initBot();
}

server.listen(3000, () => {
  console.log('listening on *:3000');
});
