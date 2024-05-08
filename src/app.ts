import express, { Express, Request, Response } from "express";
import * as http from "http";

import { Server } from "socket.io";
import { AuthSetup, TalkingBot, TTSMessage } from "./talkingbot";
import fs from "node:fs";

const app: Express = express();
const server = http.createServer(app);

app.use(express.static("public"));

app.get("/tts", (req: Request, res: Response) => {
  res.sendFile(__dirname + "/html/tts.html");
});
app.get("/modtext", (req: Request, res: Response) => {
  res.sendFile(__dirname + "/html/modtext.html");
});
app.get("/alerts", (req: Request, res: Response) => {
  res.sendFile(__dirname + "/html/alerts.html");
});

app.get("/poll", (req: Request, res: Response) => {
  res.sendFile(__dirname + "/html/poll.html");
});

app.get("/chat", (req: Request, res: Response) => {
  res.sendFile(__dirname + "/html/chat.html");
});
app.get("/setup", (req: Request, res: Response) => {
  res.sendFile(__dirname + "/html/setup.html");
});

const bot: TalkingBot = new TalkingBot("17587561", server);

const iosetup = new Server(server, { path: "/setup/" });

app.get("/oauth", (req: Request, res: Response) => {
  let code: string = req.query.code as string;
  let scope: string = req.query.scope as string;
  if (code == "initBot") {
    res.send("initing bot");
    bot.initBot();
    return;
  }
  if (code.length == 0 || scope.length == 0) {
    res.send("Something went wrong!");
  } else {
    bot.twitch.addUser(code, scope);
    res.send(
      `Success! ${scope.startsWith("bits:read") ? "Broadcaster account added!" : "Bot account added!"}`,
    );
  }
});
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

  socket.on("setup_message", (message: AuthSetup) => {
    console.log(`Got setup message!`);
    bot.twitch.setupAuth(message);
  });
});
bot.initBot();
server.listen(3000, () => {
  console.log("listening on *:3000");
});

process.on("SIGINT", () => {
  console.log("Exitting...");
  process.exit();
});
