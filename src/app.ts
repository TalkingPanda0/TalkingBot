import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import * as http from "http";

import { TalkingBot } from "./talkingbot";
import { sign, verify } from "jsonwebtoken";

const app: Express = express();
const server = http.createServer(app);

const bot: TalkingBot = new TalkingBot("17587561", server);

app.use(express.static("public"));
app.use(bodyParser.text());
app.use(cookieParser());

app.use("/control", async (req, res) => {
  try {
    var discordId = verify(req.cookies.discord_id, bot.jwtSecret);
    const isMod = await bot.discord.isStreamMod(discordId.toString());
    if (!isMod) {
      res.sendStatus(403);
      return;
    }
    switch (req.method) {
      case "GET":
        res.sendFile(__dirname + "/html/control.html");
        break;
      case "POST":
        bot.handleControl(JSON.parse(req.body));
        res.sendStatus(200);
        break;
    }
  } catch (e) {
    // No discord_id cookie was found
    res.redirect(bot.discordLoginUri);
  }
});

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

app.post("/command", (req: Request, res: Response) => {
  console.log(req.body);
  const name = req.query.name.toString();
  if (!req.body || !name) {
    res.sendStatus(400);
    return;
  }
  bot.commandHandler.setCustomCommand(name, req.body);
  res.sendStatus(200);
});
app.get("/command", (req: Request, res: Response) => {
  res.send(bot.commandHandler.getCustomCommand(req.query.name.toString()));
});
app.get("/commandControl", (_req, res) => {
  res.sendFile(__dirname + "/html/commandControl.html");
});
/*app.put("/control", (req: Request, res: Response) => {
  console.log(req.cookies);
  if (!req.body) {
    res.sendStatus(400);
    return;
  }
  // AUTH
  bot.modtext = req.body;
  bot.updateModText();
  res.sendStatus(200);
});
app.get("/control", (req: Request, res: Response) => {
	console.log(req.signedCookies);
  res.sendFile(__dirname + "/html/control.html");
});*/
app.get("/wheel", (_req: Request, res: Response) => {
  res.sendFile(__dirname + "/html/wheel.html");
});
app.get("/modtextedit", (_req: Request, res: Response) => {
  res.sendFile(__dirname + "/html/modtextedit.html");
});
app.get("/auth", async (req, res) => {
  const userId = await bot.getUserIdFromCode(req.query.code.toString());
  if (userId == null) {
    res.sendStatus(403);
    return;
  }
  const token = sign(userId, bot.jwtSecret);
  res.set({
    "Set-Cookie": `discord_id=${token};path=/control;max-age=18000;HttpOnly;`,
    Location: "/control",
  });
  res.sendStatus(302);
});

bot.initBot();
server.listen(3000, () => {
  console.log("listening on *:3000");
});

process.on("SIGINT", async () => {
  console.log("Exitting...");
  await bot.cleanUp();
  process.exit();
});
