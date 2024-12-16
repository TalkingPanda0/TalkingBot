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
  } catch (e) {
    // No discord_id cookie was found
    res.redirect(bot.discordLoginUri);
    return;
  }
  console.log(
    `Control - id: ${discordId}, method: ${req.method}, path: ${req.path}, query params: ${JSON.stringify(req.query)}, body: ${JSON.stringify(req.body)}`,
  );

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
        case "/alerts":
          res.sendFile(__dirname + "/html/alertscontrol.html");
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

        case "/command/alias/list":
          res.send(bot.commandHandler.getCommandAliasList());
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
        case "/command/add":
          const commandToAdd = req.query.name.toString();
          if (!req.body || !commandToAdd) {
            res.sendStatus(400);
            return;
          }
          const result = bot.commandHandler.addCustomCommand(
            commandToAdd,
            req.body,
          );
          if (result == "") {
            res.sendStatus(200);
            return;
          }
          res.status(400);
          res.send(result);
          break;

        case "/command/set":
          const name = req.query.name.toString();
          if (!req.body || !name) {
            res.sendStatus(400);
            return;
          }
          bot.commandHandler.setCustomCommand(name, req.body);
          res.sendStatus(200);
          break;
        case "/command/delete":
          bot.commandHandler.deleteCustomCommand(req.query.name.toString());
          res.sendStatus(200);
          break;

        case "/command/alias/add":
          const aliasToAdd = req.query.name.toString();
          if (!req.body || !aliasToAdd) {
            res.sendStatus(400);
            return;
          }
          const aliasAddResult = bot.commandHandler.addCommandAlias(
            aliasToAdd,
            req.body,
          );
          if (aliasAddResult == "") {
            res.sendStatus(200);
            return;
          }
          res.status(400);
          res.send(result);
        case "/command/alias/set":
          const alias = req.query.name.toString();
          if (!req.body || !alias) {
            res.sendStatus(400);
            return;
          }
          bot.commandHandler.setCommandAlias(alias, req.body);
          res.sendStatus(200);
          break;
        case "/command/alias/delete":
          bot.commandHandler.deleteCommandAlias(req.query.name.toString());
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

app.get("/creditsList", (_req, res) => {
  res.send(bot.credits.getCreditsList());
});

app.get("/credits", (_req, res) => {
  res.sendFile(__dirname + "/html/credits.html");
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
    "Set-Cookie": `discord_id=${token};path=/control;max-age=604800;HttpOnly;`,
    Location: "/control",
  });
  res.sendStatus(302);
});

bot.initBot();
server.listen(3000, () => {
  console.log("listening on *:3000");
});

export async function exit() {
  console.log("Exitting...");
  await bot.cleanUp();
  process.exit();
}

process.on("SIGINT", async () => {
  await exit();
});
