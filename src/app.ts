import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import * as http from "http";

import { TalkingBot } from "./talkingbot";

const app: Express = express();
const server = http.createServer(app);

app.use(express.static("public"));
app.use(bodyParser.text());

app.get("/tts", (_req: Request, res: Response) => {
  res.sendFile(__dirname + "/html/tts.html");
});
app.get("/modtext", (_req: Request, res: Response) => {
  res.sendFile(__dirname + "/html/modtext.html");
});
app.get("/alerts", (_req: Request, res: Response) => {
  res.sendFile(__dirname + "/html/alerts.html");
});

app.get("/poll", (_req: Request, res: Response) => {
  res.sendFile(__dirname + "/html/poll.html");
});

app.get("/chat", (_req: Request, res: Response) => {
  res.sendFile(__dirname + "/html/chat.html");
});
app.get("/chatControl", (_req: Request, res: Response) => {
  res.sendFile(__dirname + "/html/chatcontrol.html");
});

app.get("/setup", (_req: Request, res: Response) => {
  res.sendFile(__dirname + "/html/setup.html");
});
app.put("/control", (req: Request, res: Response) => {
  console.log(req.body);
  if (!req.body) {
    res.sendStatus(400);
    return;
  }
  // AUTH
  bot.modtext = req.body;
  bot.updateModText();
  res.sendStatus(200);
});
app.get("/control", (_req: Request, res: Response) => {
  res.sendFile(__dirname + "/html/control.html");
});
app.get("/wheel", (_req: Request, res: Response) => {
  res.sendFile(__dirname + "/html/wheel.html");
});
app.get("/modtextedit", (_req: Request, res: Response) => {
  res.sendFile(__dirname + "/html/modtextedit.html");
});

const bot: TalkingBot = new TalkingBot("17587561", server);

bot.initBot();
server.listen(3000, () => {
  console.log("listening on *:3000");
});

process.on("SIGINT", async () => {
  console.log("Exitting...");
  await bot.cleanUp();
  process.exit();
});
