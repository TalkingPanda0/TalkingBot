import express, { Express, Request, Response } from "express";
import * as http from "http";

import { TalkingBot } from "./talkingbot";

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
app.get("/chatControl", (req: Request, res: Response) => {
  res.sendFile(__dirname + "/html/chatcontrol.html");
});

app.get("/setup", (req: Request, res: Response) => {
  res.sendFile(__dirname + "/html/setup.html");
});
app.get("/control", (req: Request, res: Response) => {
  res.sendFile(__dirname + "/html/control.html");
});
app.get("/wheel", (req: Request, res: Response) => {
  res.sendFile(__dirname + "/html/wheel.html");
});

const bot: TalkingBot = new TalkingBot(server);

bot.initBot();
server.listen(3000, () => {
  console.log("listening on *:3000");
});

process.on("SIGINT", async () => {
  console.log("Exitting...");
  await bot.cleanUp();
  process.exit();
});
