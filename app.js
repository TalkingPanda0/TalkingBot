const express = require('express');
const app = express();
const http = require('http');

const server = http.createServer(app);
const { Server } = require("socket.io");

const iotts = new Server(server, {
  path: "/tts/"
});
const iochat = new Server(server, {
  path: "/chat/"
});

const { Twitch } = require("./modules/twitch");
const kick = require("./modules/kick");

var enabled = true;

app.use(express.static('public'))

app.get('/tts', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/chat', (req,res) => {
  res.sendFile(__dirname + "/chat.html");
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
  
  iotts.emit('message', message);
};

function sendChat(message){
  if(message.color == null | message.color == undefined){
    message.color = "#048ac7"
  }
  iochat.emit('message',message);
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

let twitch = new Twitch(sendChat,sendTTS,"SweetbabooO_o");
twitch.initBot();

kick.initBot(sendChat,twitch.sendMessage,sendTTS,17587561);