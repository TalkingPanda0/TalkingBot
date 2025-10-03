import dotenv from "dotenv";
dotenv.config({ path: __dirname + "/../config/.env" });
import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import * as http from "http";
import { DiscordAuthData, TalkingBot } from "./talkingbot";
import { sign, verify } from "jsonwebtoken";
import { readdir } from "node:fs/promises";
import fileUpload, { UploadedFile } from "express-fileupload";
import { getDiscordUserId, isDiscordAuthData } from "./util";
import { handleKofiEvent, isKofiEvent } from "./kofi";
import { MessageData } from "botModule";

const app: Express = express();
const server = http.createServer(app);

const bot: TalkingBot = new TalkingBot(server);

app.use(express.static("public"));
app.use(express.static("config/sounds"));
app.use(bodyParser.text());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  }),
);
app.get("/soundEffects", async (_req, res) => {
  const files = await readdir(__dirname + "/../config/sounds");
  res.send(
    JSON.stringify(
      files
        .filter((file) => file.endsWith(".mp3"))
        .map((file) => file.replace(/.mp3$/, "")),
    ),
  );
});

app.use("/control", async (req, res) => {
  try {
    if (!bot.jwtSecret) {
      res.send(500);
      return;
    }
    const decoded = verify(req.cookies.discord_auth, bot.jwtSecret);
    if (!isDiscordAuthData(decoded)) {
      res.sendStatus(403);
      return;
    }

    const discordAuth: DiscordAuthData = decoded;
    var discordId = await getDiscordUserId(discordAuth);
    const isMod = await bot.discord.isStreamMod(discordId);
    if (!isMod) {
      res.sendStatus(403);
      return;
    }
  } catch (e) {
    // No discord_auth cookie was found
    res.redirect(bot.discordLoginUri);
    return;
  }
  console.log(
    `Control - id: ${discordId}, method: ${req.method}, path: ${req.path}, query params: ${JSON.stringify(req.query)}, body: ${JSON.stringify(req.body)} ip: ${req.ip}`,
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
        case "/reload":
          res.sendFile(__dirname + "/html/restart.html");
          break;
        case "/soundeffect":
          res.sendFile(__dirname + "/html/soundeffectscontrol.html");
          break;
        case "/modulemanager":
          res.sendFile(__dirname + "/html/modulemanager.html");
          break;
        case "/commandbuilder":
          res.sendFile(__dirname + "/html/commandbuilder.html");
          break;
        case "/command/get":
          if (req.query.name == null) {
            res.send(400);
            break;
          }
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
        case "/modulemanager/list":
          res.send(bot.moduleManager.getModuleList());
          break;
        case "/modulemanager/get":
          if (req.query.name == null) {
            res.send(400);
            break;
          }
          res.send(
            await bot.moduleManager.getModuleFile(req.query.name.toString()),
          );
          break;
        case "/modulemanager/edit":
          res.sendFile(__dirname + "/html/editmodule.html");
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
          if (req.query.name == null) {
            res.send(400);
            break;
          }
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
          if (req.query.name == null) {
            res.send(400);
            break;
          }
          const name = req.query.name.toString();
          if (!req.body || !name) {
            res.sendStatus(400);
            return;
          }
          bot.commandHandler.setCustomCommand(name, req.body);
          res.sendStatus(200);
          break;
        case "/command/run":
          if (!req.body) {
            res.sendStatus(400);
            return;
          }
          const data: { script: string; data: MessageData } = JSON.parse(
            req.body,
          );
          const commandOutput = await bot.commandHandler.runScript(
            data.script,
            data.data,
            "",
          );
          res.send(commandOutput);
          break;
        case "/command/delete":
          if (req.query.name == null) {
            res.send(400);
            break;
          }
          bot.commandHandler.deleteCustomCommand(req.query.name.toString());
          res.sendStatus(200);
          break;

        case "/command/alias/add":
          if (req.query.name == null) {
            res.send(400);
            break;
          }
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
          res.send(aliasAddResult);
        case "/command/alias/set":
          if (req.query.name == null) {
            res.send(400);
            break;
          }
          const alias = req.query.name.toString();
          if (!req.body || !alias) {
            res.sendStatus(400);
            return;
          }
          bot.commandHandler.setCommandAlias(alias, req.body);
          res.sendStatus(200);
          break;
        case "/command/alias/delete":
          if (req.query.name == null) {
            res.send(400);
            break;
          }
          bot.commandHandler.deleteCommandAlias(req.query.name.toString());
          res.sendStatus(200);
          break;

        case "/modulemanager/enable":
          if (req.query.name == null) {
            res.send(400);
            break;
          }
          await bot.moduleManager.enableModule(req.query.name as string);
          res.sendStatus(200);
          break;
        case "/modulemanager/disable":
          if (!req.query.name) {
            res.send(400);
            break;
          }
          await bot.moduleManager.disableModule(req.query.name as string);
          res.sendStatus(200);
          break;

        case "/modulemanager/delete":
          if (!req.query.name) {
            res.send(400);
            break;
          }
          await bot.moduleManager.deleteModule(req.query.name as string);
          res.sendStatus(200);
          break;

        case "/modulemanager/reload":
          await bot.moduleManager.loadModules();
          res.sendStatus(200);
          break;

        case "/modulemanager/reloadmodule":
          if (req.query.name == null) {
            res.send(400);
            break;
          }
          bot.moduleManager.reloadModule(req.query.name.toString());
          break;

        case "/modulemanager/set":
          if (!req.query.name || !req.body) {
            res.sendStatus(400);
            break;
          }
          await bot.moduleManager.setModuleFile(
            req.query.name.toString(),
            req.body,
          );
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

        case "/soundEffects/delete":
          if (req.query.name == null) {
            res.send(400);
            break;
          }
          const file = Bun.file(
            `${__dirname}/../config/sounds/${req.query.name.toString()}.mp3`,
          );
          console.log(`deleting ${file.name}`);
          file
            .delete()
            .then(() => {
              res.sendStatus(200);
            })
            .catch((e) => {
              console.error(e);
              res.sendStatus(400);
            });
          break;
        case "/soundEffects/add":
          if (!req.files || !req.files.sound || !req.body.name) {
            return res.status(422).send("No files were uploaded");
          }
          const uploadedFile = req.files.sound as UploadedFile;
          if (uploadedFile.mimetype != "audio/mpeg") {
            return res.status(422).send("This is not an mp3.");
          }
          const filePath = `${__dirname}/../config/sounds/${req.body.name}.mp3`;
          uploadedFile.mv(filePath, (e) => {
            if (e) return res.status(500).send(e);
            res.sendStatus(200);
          });
          break;
        default:
          res.sendStatus(404);
          break;
      }
      break;
  }
});

app.post("/kofi/webhook", (req, res) => {
  const data = JSON.parse(req.body.data);
  if (!isKofiEvent(data)) {
    res.sendStatus(400);
    return;
  }
  if (data.verification_token !== process.env.KOFI_SECRET) {
    res.sendStatus(403);
    return;
  }
  handleKofiEvent(bot, data);
  res.sendStatus(200);
});

app.get("/wheelSegments", (_req, res) => {
  res.send(JSON.stringify(bot.wheel.wheelSegments));
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
  if (req.query.code == null) {
    res.send(400);
    return;
  }
  const accessData = await bot.getDiscordAccessToken(req.query.code.toString());
  if (accessData == null) {
    res.sendStatus(403);
    return;
  }
  if (!bot.jwtSecret) {
    res.send(500);
    return;
  }
  const token = sign(accessData, bot.jwtSecret);
  res.set({
    "Set-Cookie": `discord_auth=${token};path=/control;max-age=${accessData.expires_in};HttpOnly;`,
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
