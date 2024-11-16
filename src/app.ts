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
  } catch (e) {
    // No discord_id cookie was found
    res.redirect(bot.discordLoginUri);
  }

  const isMod = await bot.discord.isStreamMod(discordId.toString());
  if (!isMod) {
    res.sendStatus(403);
    return;
  }

  switch (req.method) {
    case "GET":
      switch (req.path) {
        case "/chat":
          res.sendFile(__dirname + "/html/chatcontrol.html");
          break;
        case "/command":
          res.sendFile(__dirname + "/html/commandControl.html");
          break;
        case "/modtext":
          res.sendFile(__dirname + "/html/modtextedit.html");
          break;

        case "/command/get":
          const command = bot.commandHandler.getCustomCommand(
            req.query.name.toString(),
          );
          if (command == null) res.send(404);
          res.send(command);
          break;
        case "/command/list":
          res.send(bot.commandHandler.getCustomCommandList());
          break;

        case "/modtext/get":
          res.send(bot.modtext);
          break;

        default:
          res.sendFile(__dirname + "/html/control.html");
          break;
      }
      break;
    case "POST":
      switch (req.path) {
        case "/command/set":
          const name = req.query.name.toString();
          if (!req.body || !name) {
            res.sendStatus(400);
            return;
          }
          bot.commandHandler.setCustomCommand(name, req.body);
          res.sendStatus(200);
          break;

        case "/modtext/set":
          bot.modtext = req.body;
          bot.updateModText();
          res.sendStatus(200);
          break;

        case "/overlay":
          bot.handleControl(JSON.parse(req.body));
          res.sendStatus(200);
          break;

        default:
          res.sendStatus(404);
          break;
      }
      break;
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

app.get("/auth", async (req, res) => {
  const userId = await bot.getUserIdFromCode(req.query.code.toString());
  if (userId == null) {
    res.sendStatus(403);
    return;
  }
  const token = sign(userId, bot.jwtSecret);
  res.set({
    "Set-Cookie": `discord_id=${token};path=/control;HttpOnly;`,
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
