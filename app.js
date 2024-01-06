const express = require('express');
const app = express();
const http = require('http');

const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  path: "/tts/"
});

const { Twitch } = require("./modules/twitch");
const kick = require("./modules/kick");

var enabled = true;

app.use(express.static('public'))

app.get('/tts', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

function sendTTS(message,isMod) {
  if ((!enabled && !isMod) || !message.text || !message.sender ) {
    return;
  }

  if(isMod){
    if (message.text === "enable") {
      enabled = true;
      sendTTS({text: "Enabled TTS command!",sender:"Brian"},true);
      return;
    } else if (message.text === "disable") {
      enabled = false;
      sendTTS({text: "disabled TTS command!",sender: "Brian"},true);
      return;
    }
  }
  
  io.emit('message', message);
};

io.of('/tts').on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

let twitch = new Twitch(sendTTS,"SweetbabooO_o");
twitch.initBot();

kick.initBot(twitch.sendMessage,sendTTS,17587561);