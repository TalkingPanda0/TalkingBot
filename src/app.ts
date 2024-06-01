import express, { Express, Request, Response } from "express";
import * as http from "http";

import { Server } from "socket.io";
import { AuthSetup, TalkingBot } from "./talkingbot";

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

bot.initBot();
server.listen(3000, () => {
  console.log("listening on *:3000");
});

process.on("SIGINT", () => {
  console.log("Exitting...");
  bot.cleanUp();
  process.exit();
});
