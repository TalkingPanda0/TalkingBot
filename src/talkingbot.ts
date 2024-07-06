import { Twitch, parseTwitchEmotes } from "./twitch";
import { Discord } from "./discord";
import { YouTube, parseYTMessage } from "./youtube";
import { Kick, parseKickEmotes, removeKickEmotes } from "./kick";
import { kill } from "./beatsniper.js";
import { DB } from "./db";

import { Server } from "socket.io";
import * as http from "http";
import { BunFile } from "bun";
import { Pet, StatusReason } from "./pet";
import { MessageFragments } from "tubechat/lib/types/Client";
import { ChatMessage } from "@twurple/chat";
import { HelixGame } from "@twurple/api";
import { Wheel } from "./wheel";
export enum Platform {
  twitch,
  kick,
  youtube,
}

export interface TwitchCommandData {
  platform: Platform.twitch;
  user: string;
  userColor: string;
  isUserMod: boolean;
  message: string;
  reply: (message: string, replyToUser: boolean) => void | Promise<void>;
  context: ChatMessage;
}
export interface YoutubeCommandData {
  user: string;
  userColor: string;
  isUserMod: boolean;
  message: string;
  platform: Platform.youtube;
  reply: (message: string, replyToUser: boolean) => void | Promise<void>;
  context: MessageFragments[];
}
export interface KickComamndData {
  user: string;
  userColor: string;
  isUserMod: boolean;
  message: string;
  reply: (message: string, replyToUser: boolean) => void | Promise<void>;
  platform: Platform.kick;
}
export type CommandData =
  | TwitchCommandData
  | YoutubeCommandData
  | KickComamndData;

export interface Command {
  command: string;
  showOnChat: boolean;
  commandFunction: (data: CommandData) => void | Promise<void>;
}

export interface CustomCommand {
  command: string;
  response: string;
}
export interface CommandAlias {
  alias: string;
  command: string;
}

export interface AuthSetup {
  twitchClientId: string;
  twitchClientSecret: string;
  channelName: string;
}

export interface pollOption {
  id: string;
  label: string;
  votes: number;
}
export interface Poll {
  title: string;
  options: pollOption[];
  id?: string;
}
interface controlMessage {
  overlay: string;
  target: string;
  message: string;
}

export function getTimeDifference(startDate: Date, endDate: Date): string {
  const timeDifference = endDate.getTime() - startDate.getTime();
  const years = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 365.25));
  const remainingTime = timeDifference % (1000 * 60 * 60 * 24 * 365.25);
  const months = Math.floor(remainingTime / (1000 * 60 * 60 * 24 * 30.44));
  const remainingTime2 = remainingTime % (1000 * 60 * 60 * 24 * 30.44);
  const days = Math.floor(remainingTime2 / (1000 * 60 * 60 * 24));
  const remainingTime3 = remainingTime2 % (1000 * 60 * 60 * 24);
  const hours = Math.floor(remainingTime3 / (1000 * 60 * 60));
  const remainingTime4 = remainingTime3 % (1000 * 60 * 60);
  const minutes = Math.floor(remainingTime4 / (1000 * 60));
  const remainingTime5 = remainingTime4 % (1000 * 60);
  const seconds = Math.floor(remainingTime5 / 1000);

  let timeString = "";
  if (years != 0) timeString += `${years} years `;
  if (months != 0) timeString += `${months} months `;
  if (days != 0) timeString += `${days} days `;
  if (hours != 0) timeString += `${hours} hours `;
  if (minutes != 0) timeString += `${minutes} minutes `;
  if (seconds != 0) timeString += `${seconds} seconds`;
  return timeString;
}
export function milliSecondsToString(timeDifference: number): string {
  const hours = Math.floor(timeDifference / (1000 * 60 * 60));
  const remainingTime4 = timeDifference % (1000 * 60 * 60);
  const minutes = Math.floor(remainingTime4 / (1000 * 60));
  const remainingTime5 = remainingTime4 % (1000 * 60);
  const seconds = Math.floor(remainingTime5 / 1000);

  let timeString = "";
  if (hours != 0) timeString += `${hours} hours `;
  if (minutes != 0) timeString += `${minutes} minutes `;
  if (seconds != 0) timeString += `${seconds} seconds`;
  return timeString;
}

export async function replaceAsync(
  str: string,
  regex: RegExp,
  asyncFn: Function,
) {
  const promises = [];
  str.replace(regex, (full, ...args) => {
    promises.push(asyncFn(full, ...args));
    return full;
  });
  const data = await Promise.all(promises);
  return str.replace(regex, () => data.shift());
}

function removeByIndex(str: string, index: number): string {
  return str.slice(0, index) + str.slice(index + 1);
}

function removeByIndexToUppercase(str: string, indexes: number[]): string {
  let deletedChars = 0;
  indexes.forEach((index) => {
    let i = index - deletedChars;
    while (
      !isNaN(parseInt(str.charAt(i), 10)) ||
      str.charAt(i) !== str.charAt(i).toUpperCase()
    ) {
      str = removeByIndex(str, i);
      deletedChars++;
    }
  });
  return str;
}

export function getSuffix(i: number) {
  var j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
}

export function getRandomElement(array: string[]): string {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

const selfKillMessages: string[] = [
  "$1 managed to kill themself.",
  "$1 died from an unknown cause.",
  "$1 was crushed by a boulder, or some piece of debris.",
  "$1 exploded.",
  "$1 forgot how to breathe.",
  "$1 learned that cellular respiration uses oxygen, not sand.",
  "$1 died.",
  "$1 tried to befriend a wild grizzly bear.",
  "$1 suffocated.",
  "$1 tested the bounds of time and space, and lost.",
  "$1 imploded.",
  "$1 drowned.",
  "$1 ceased to be.",
  "$1 went kablewy!",
  "$1 figured out how to divide by 0!",
  "$1 took a long walk off a short pier.",
  "$1 fell off a ladder.",
  "$1 fell off a tree.",
  "$1 fell off of the roof.",
  "$1 burst into flames.",
  "$1 was struck by lightning.",
  "$1 starved to death.",
  "$1 was stabbed to death.",
  "$1 fell victim to gravity.",
  "$1's plead for death was answered.",
  "$1's vital organs were ruptured.",
  "$1's innards were made outwards.",
  "$1 was licked to death. Don't ask.",
  "$1 was deleted.",
  "$1 had to split. Literally..",
  "$1 has bled to death.",
  "$1 Food is a gift from God. Spices are a gift from the devil. I guess it was a little too spicy for you.",
  "$1 has died due to a vehicular explosion!",
  "$1 has killed themself!",
  "$1 has been blown up by a landmine!",
  "$1 died due to holding their breath for too long!",
  "$1 burned to death.",
  "$1 was blown up by a missile!",
  "$1 froze to death.",
  "$1 was dissolved in acid.",
  "$1 tried to swim in acid.",
  "$1 tried to swim in lava.",
  "$1 experienced kinetic energy.",
  "$1 blew up.",
  "$1 fell into a patch of fire.",
  "$1 fell out of a plane.",
  "$1 went up in flames.",
  "$1 withered away.",
  "$1 went skydiving, and forgot the parachute.",
  "$1 spontaneously combusted.",
  "$1 was struck with a bolt of inspiration, I mean lightning.",
  "$1 ended it all. Goodbye cruel world!",
  "$1 passed the event horizon.",
];

const killOtherMessages: string[] = [
  "$1 murdered $2 with a unicorn's horn!",
  "$2 was killed by $1!",
  "$2 was mauled by $1 dressed up as a chicken.",
  "$2 was ripped apart by $1, daaaaaaamn!",
  "$2 was brutally murdered by $1 with a car!",
  "$1 covered $2 in meat sauce and threw them in a cage with a starved tiger.",
  "$1 genetically modified a Venus flytrap to grow abnormally large, and trapped $2 in a room with it.",
  "$1 shanked $2's butt, over and over again.",
  "$1 just wrote $2's name in their Death Note.",
  "$1 put $2 out of their misery.",
  "$1 destroyed $2!",
  "$1 atacó a $2 con un consolador grande!",
  "$2 was poked a bit too hard by $1 with a spork!",
  "ZA WARUDO! $1 stopped time and throw hundreds of knives at $2. END!",
  "$1 attacked $2 with a rusty spork...and managed to kill $2 with very little effort.",
  "$1 stole a car known as 'KITT' and ran over $2.",
  "$1 tickled $2 to death!",
  "$2's skull was crushed by $1!",
  "$2 is in several pieces after a tragic accident involving $1 and cutlery.",
  "$1 licked $2 until $2 was squishy, yeah.. squishy.",
  "$1 catapulted a huge load of rusty sporks on to $2. $2 died.",
  "$1 ran out of rusty sporks and unicorn horns to kill $2 with, so instead they used a rusty hanger.",
  "$1 came in like a mystical being of awesomeness and destroyed $2!",
  "$2 drowned whilst trying to escape from $1",
  "$2 walked into a cactus while running from $1",
  "$2 was attacked by $1 behind a Taco Bell.",
  "$1 went back in time to prevent himself from killing $2, apparently the time machine landed on $2 when $1 jumped back in time.",
  "$1 rekt $2 30-4 by doing a 360 no-scope.",
  "$1 struck the final blow and ended $2.",
  "$1 tried to kill $2 with a unicorn's horn, but police showed up before $1 had time.",
  "$1 tried to murder $2, but swat was hiding in the bushes and jumped on $1 before it could be done.",
  "$1 was going to hit $2 with a hammer. However $2 was trained in the Secret Nippon Arts!",
  "$1 attacked $2 with a plastic spoon, but then suddenly a swarm of police surrounded $1 and detained them.",
  "$2 is protected by an unknown force which repels $1.",
  "$1 was justly ended by $2.",
  "$1 was blown up by $2.",
  "$1 was shot off a ladder by $2.",
  "$1 tried to swim in lava while trying to escape $2.",
  "$1 got finished off by $2.",
  "$1 delivered the fatal blow on $2.",
  "$1 has punched $2 to death.",
  "$1 ruffled $2's fluff, and died!",
  "$1 hugged $2 a little too tight.",
  "$1 sent $2 to an awesome farm in the country.",
];

const eightballMessages: string[] = [
  "Reply hazy try again.",
  "Ask again later.",
  "Better not tell you now.",
  "Cannot predict now.",
  "Go for it!",
  "Yes, in due time.",
  "You will have to wait.",
  "Ask again later.",
  "Yeah, for sure.",
  "Concentrate and ask again.",
  "Probably.",
  "Never going to happen!",
  "The odds of that happening are pretty slim.",
  "My reply is no.",
  "My sources say no.",
  "Very doubtful.",
  "No.",
  "I have no response for that question...",
  "Why would I tell you?",
  "Forget about it.",
  "Don't bet on it.",
  "Who knows?",
  "Signs point to yes.",
  "It is certain.",
  "Without a doubt.",
  "Yes definitely.",
  "You may rely on it.",
  "As I see it, yes.",
  "Most likely.",
  "Outlook good.",
  "Yes.",
  "Signs point to yes.",
  "This is not the Bot you're looking for ༼ﾉ۞⌂۞༽ﾉ",
  "There's a pretty good chance.",
  "No, don't even think about.",
];

export class TalkingBot {
  public discord: Discord;
  public twitch: Twitch;
  public youTube: YouTube;
  public kick: Kick;
  public iochat: Server;
  public iomodtext: Server;
  public iopoll: Server;
  public ioalert: Server;
  public iocontrol: Server;
  public commandList: Command[] = [];
  public customCommands: CustomCommand[] = [];
  public aliasCommands: CommandAlias[] = [];
  public connectedtoOverlay: Boolean = false;
  public pet: Pet;
  public database: DB;

  private kickId: string;
  private wheel: Wheel;
  private modtext: string;
  private counter: number = 0;
  private ttsEnabled: Boolean = false;
  private server: http.Server;
  private iotts: Server;
  private dynamicTitle: string;
  private dynamicTitleInterval: Timer;
  private lastDynamicTitle: string;
  private commandsFile: BunFile = Bun.file(
    __dirname + "/../config/commands.json",
  );
  private aliasesFile: BunFile = Bun.file(
    __dirname + "/../config/aliases.json",
  );

  private async readCustomCommands() {
    if (!(await this.commandsFile.exists())) return;
    this.customCommands = await this.commandsFile.json();
    if (!(await this.aliasesFile.exists())) return;
    this.aliasCommands = await this.aliasesFile.json();
  }

  private writeCustomCommands() {
    Bun.write(this.commandsFile, JSON.stringify(this.customCommands));
    Bun.write(this.aliasesFile, JSON.stringify(this.aliasCommands));
  }

  constructor(kickId: string, server: http.Server) {
    this.server = server;

    this.iomodtext = new Server(this.server, {
      path: "/modtext/",
    });

    this.iomodtext.on("connection", (socket) => {
      socket.emit("message", this.modtext);
    });

    this.iotts = new Server(this.server, {
      path: "/tts/",
    });

    this.iochat = new Server(this.server, {
      path: "/chat/",
    });

    this.iochat.on("connect", () => {
      try {
        this.twitch.sendRecentMessages();
        if (
          this.twitch.chatClient != null &&
          !this.twitch.chatClient.isConnected
        ) {
          this.iochat.emit("chatDisconnect", "Twitch");
        }
        if (!this.kick.isConnected) {
          this.iochat.emit("chatDisconnect", "Kick");
        }
        if (!this.youTube.isConnected) {
          this.iochat.emit("chatDisconnect", "YouTube");
        }
        this.connectedtoOverlay = true;
      } catch (e) {
        console.error(e);
      }
    });
    this.iopoll = new Server(this.server, {
      path: "/poll/",
    });
    this.ioalert = new Server(this.server, {
      path: "/alerts/",
    });

    this.iocontrol = new Server(this.server, {
      path: "/control/",
    });
    this.iocontrol.on("connect", (socket) => {
      socket.on("control", (data: controlMessage) => {
        console.log(data);
        switch (data.overlay) {
          case "chat":
            this.iochat.emit(data.target, data.message);
            break;
          case "modtext":
            this.iomodtext.emit(data.target, data.message);
            break;
          case "tts":
            this.iotts.emit(data.target, data.message);
            break;
          case "alerts":
            this.ioalert.emit(data.target, data.message);
            break;
        }
      });
    });

    this.kickId = kickId;

    this.readCustomCommands();
    this.commandList = [
      {
        showOnChat: false,
        command: "!8ball",
        commandFunction: (data) => {
          if (
            data.message.toLowerCase().includes("furry") &&
            data.message.toLowerCase().includes("sweet")
          ) {
            data.reply("Yes.", false);
            return;
          }
          data.reply(getRandomElement(eightballMessages), false);
        },
      },
      {
        showOnChat: false,
        command: "!toptime",
        commandFunction: async (data) => {
          if (data.platform != Platform.twitch) return;
          const isOffline = data.message === "offline";
          this.database.updateDataBase(isOffline ? 1 : 2);
          const users = this.database.getTopWatchTime(isOffline);
          data.reply(
            (
              await Promise.all(
                users.map(async (watchTime) => {
                  try {
                    const user = await this.twitch.apiClient.users.getUserById(
                      watchTime.userId,
                    );
                    if (isOffline)
                      return `@${user.displayName} has spent ${milliSecondsToString(watchTime.chatTime + (watchTime.inChat == 1 ? new Date().getTime() - new Date(watchTime.lastSeen).getTime() : 0))} in offline chat.`;
                    else
                      return `@${user.displayName} has spent ${milliSecondsToString(watchTime.watchTime + (watchTime.inChat == 2 ? new Date().getTime() - new Date(watchTime.lastSeenOnStream).getTime() : 0))} watching the stream.`;
                  } catch (e) {
                    return e;
                  }
                }),
              )
            ).join(" "),
            false,
          );
        },
      },
      {
        showOnChat: false,
        command: "!watchtime",
        commandFunction: async (data) => {
          if (data.platform != Platform.twitch) return;
          const watchTime = this.database.getWatchTime(
            data.context.userInfo.userId,
          );
          if (data.message === "offline") {
            data.reply(
              `@${data.user} has spent ${milliSecondsToString(watchTime.chatTime + (watchTime.inChat == 1 ? new Date().getTime() - new Date(watchTime.lastSeen).getTime() : 0))} in offline chat.`,
              false,
            );
          } else {
            data.reply(
              `@${data.user} has spent ${milliSecondsToString(watchTime.watchTime + (watchTime.inChat == 2 ? new Date().getTime() - new Date(watchTime.lastSeenOnStream).getTime() : 0))} watching the stream.`,
              false,
            );
          }
        },
      },

      {
        showOnChat: false,
        command: "!kill",
        commandFunction: (data) => {
          if (data.message === "" || data.message === undefined) {
            data.reply(
              getRandomElement(selfKillMessages).replaceAll("$1", data.user),
              false,
            );
          } else {
            data.reply(
              getRandomElement(killOtherMessages)
                .replaceAll("$1", data.user)
                .replaceAll("$2", data.message),
              false,
            );
          }
        },
      },
      {
        showOnChat: false,
        command: "!hapboo",
        commandFunction: (data) => {
          if (!data.isUserMod) return;

          this.iomodtext.emit(
            "message",
            '<img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6">',
          );
        },
      },
      {
        showOnChat: false,
        command: "!modtext",
        commandFunction: (data) => {
          if (!data.isUserMod) return;
          if (data.platform == Platform.twitch) {
            data.message = parseTwitchEmotes(
              "!modtext " + data.message,
              data.context.emoteOffsets,
              this.twitch.cheerEmotes,
            );
            data.message = data.message.replace("!modtext", "");
          } else if (data.platform == Platform.kick) {
            data.message = parseKickEmotes(data.message);
          }
          this.modtext = data.message;
          this.iomodtext.emit(
            "message",
            this.modtext.replaceAll("$counter", this.counter.toString()),
          );
        },
      },
      {
        showOnChat: false,
        command: "!dyntitle",
        commandFunction: (data) => {
          if (!data.isUserMod) return;
          if (data.message == "stop") {
            clearInterval(this.dynamicTitleInterval);
            data.reply("Stopped dynamic title", true);
          } else {
            this.dynamicTitle = data.message;
            this.setDynamicTitle();
            this.dynamicTitleInterval = setInterval(
              this.setDynamicTitle.bind(this),
              1000 * 60,
            );
            if (this.dynamicTitleInterval != null) {
              data.reply("Started dynamic title", true);
            }
          }
        },
      },
      {
        showOnChat: false,
        command: "!redeem",
        commandFunction: (data) => {
          if (!data.isUserMod) return;
          if (this.twitch.redeemQueue.length == 0) {
            data.reply("No redeem found", true);
            return;
          }
          switch (data.message) {
            case "accept":
              this.twitch.handleRedeemQueue(true);
              break;
            case "deny":
              this.twitch.handleRedeemQueue(false);
              break;
            case "scam":
              this.twitch.handleRedeemQueue(null);
              break;
            default:
              data.reply("Usage: !redeem accept/deny", true);
              break;
          }
        },
      },
      {
        showOnChat: false,
        command: "!counter",
        commandFunction: (data) => {
          const regex = /[+|-]/g;
          if (data.isUserMod && data.message != "") {
            if (regex.test(data.message)) {
              this.counter += parseInt(data.message);
            } else {
              this.counter = parseInt(data.message);
            }
            data.reply(`The counter has been set to ${this.counter}`, true);
            this.iomodtext.emit(
              "message",
              this.modtext.replaceAll("$counter", this.counter.toString()),
            );
            return;
          }
          data.reply(`The counter is at ${this.counter}`, true);
        },
      },
      {
        showOnChat: false,
        command: "!uptime",
        commandFunction: async (data) => {
          if (data.platform != Platform.twitch) return;
          const stream = await this.twitch.apiClient.streams.getStreamByUserId(
            this.twitch.channel.id,
          );
          if (stream == null) {
            data.reply(
              `${this.twitch.channel.displayName} is currently offline`,
              true,
            );
            return;
          }
          const timeString = getTimeDifference(stream.startDate, new Date());
          data.reply(
            `${this.twitch.channel.displayName} has been live for ${timeString}`,
            true,
          );
        },
      },
      {
        showOnChat: false,
        command: "!status",
        commandFunction: async (data) => {
          if (data.platform != Platform.twitch) return;
          const stream = await this.twitch.apiClient.streams.getStreamByUserId(
            this.twitch.channel.id,
          );
          if (stream == null) {
            data.reply(
              `${this.twitch.channel.displayName} is currently offline`,
              true,
            );
            return;
          }
          data.reply(
            `\"${stream.title}\" - ${stream.gameName}: ${stream.tags}`,
            true,
          );
        },
      },
      {
        showOnChat: false,
        command: "!followage",
        commandFunction: async (data) => {
          if (data.platform != Platform.twitch) return;
          const followed =
            await this.twitch.apiClient.channels.getChannelFollowers(
              this.twitch.channel.id,
              data.context.userInfo.userId,
            );

          // User is not following
          if (followed.data.length == 0) {
            data.reply(
              `You are not following ${this.twitch.channel.displayName}`,
              true,
            );
          } else {
            const timeString = getTimeDifference(
              followed.data[0].followDate,
              new Date(),
            );
            data.reply(
              `@${data.user} has been following ${this.twitch.channel.displayName} for ${timeString}`,
              false,
            );
          }
        },
      },
      {
        showOnChat: false,
        command: "!addcmd",
        commandFunction: (data) => {
          if (!data.isUserMod) return;
          const splitMessage = data.message.split(" ");
          let commandName = splitMessage[0];
          const response = data.message.substring(
            data.message.indexOf(" ") + 1,
            data.message.length,
          );

          if (!commandName.startsWith("!")) commandName = `!${commandName}`;
          const customCom: CustomCommand = {
            command: commandName,
            response: response,
          };
          if (
            this.customCommands.some(
              (element) => element.command == commandName,
            )
          ) {
            data.reply(`Command ${commandName} already exists!`, true);
            return;
          }
          if (splitMessage.length <= 1) {
            data.reply("No command response given", true);
            return;
          }

          this.customCommands.push(customCom);

          data.reply(`Command ${commandName} has been added`, true);
          this.writeCustomCommands();
        },
      },
      {
        showOnChat: false,
        command: "!showcmd",
        commandFunction: (data) => {
          if (!data.isUserMod) return;
          const splitMessage = data.message.split(" ");
          let commandName = splitMessage[0];
          if (!commandName.startsWith("!")) commandName = `!${commandName}`;
          const command: CustomCommand[] = this.customCommands.filter(
            (element) => element.command == commandName,
          );
          if (command) {
            data.reply(`${command[0].command}: ${command[0].response}`, true);
            return;
          } else {
            data.reply(`Command ${commandName} doesn't exist!`, true);
            return;
          }
        },
      },

      {
        showOnChat: false,
        command: "!delcmd",
        commandFunction: (data) => {
          if (!data.isUserMod) return;
          const oldLen = this.customCommands.length;
          const commandName = data.message.split(" ")[0];
          this.customCommands = this.customCommands.filter(
            (element) => element.command != commandName,
          );
          if (oldLen != this.customCommands.length) {
            data.reply(`${commandName} has been removed`, true);
            this.writeCustomCommands();
          } else {
            data.reply(`${commandName} is not a command`, true);
          }
        },
      },
      {
        showOnChat: false,
        command: "!editcmd",
        commandFunction: (data) => {
          if (!data.isUserMod) return;
          const commandName = data.message.split(" ")[0];
          const response = data.message.substring(
            data.message.indexOf(" ") + 1,
            data.message.length,
          );

          for (let i = 0; i < this.customCommands.length; i++) {
            const command = this.customCommands[i];
            if (command.command == commandName) {
              command.response = response;
              data.reply(`command ${commandName} has been edited`, true);
              this.writeCustomCommands();
              return;
            }
          }
          data.reply(`${commandName} is not a command`, true);
        },
      },
      {
        showOnChat: false,
        command: "!delalias",
        commandFunction: (data) => {
          if (!data.isUserMod) return;
          const oldLen = this.aliasCommands.length;
          const alias = data.message.split(" ")[0];
          this.aliasCommands = this.aliasCommands.filter(
            (element) => element.alias != alias,
          );
          if (oldLen != this.aliasCommands.length) {
            data.reply(`${alias} has been removed`, true);
            this.writeCustomCommands();
          } else {
            data.reply(`${alias} is not an alias`, true);
          }
        },
      },

      {
        showOnChat: false,
        command: "!aliascmd",
        commandFunction: (data) => {
          if (!data.isUserMod) return;
          const splitMessage = data.message.split(" ");
          const commandName = splitMessage[1];
          const alias = splitMessage[0];
          if (this.customCommands.some((element) => element.command == alias)) {
            data.reply(`${alias} already exists`, true);
            return;
          }

          this.aliasCommands.push({ command: commandName, alias: alias });

          data.reply(
            `command ${commandName} has been aliased to ${alias}`,
            true,
          );
          this.writeCustomCommands();
          return;
        },
      },
      {
        showOnChat: false,
        command: "!listcmd",
        commandFunction: (data) => {
          const custom = this.customCommands
            .map((obj) => obj.command)
            .join(", ");
          const builtin = this.commandList.map((obj) => obj.command).join(", ");
          data.reply(
            `Builtin Commands: ${builtin}, Custom Commands: ${custom}`,
            true,
          );
        },
      },
      {
        showOnChat: false,
        command: "!settitle",

        commandFunction: async (data) => {
          if (!data.isUserMod || data.message.length == 0) return;
          await this.twitch.apiClient.channels.updateChannelInfo(
            this.twitch.channel.id,
            { title: data.message },
          );
          // TODO change title in kick

          data.reply(`Title has been changed to "${data.message}"`, true);
        },
      },
      {
        showOnChat: false,
        command: "!setgame",

        commandFunction: async (data) => {
          if (!data.isUserMod || data.message.length == 0) return;
          const game: HelixGame =
            await this.twitch.apiClient.games.getGameByName(data.message);
          if (game == null) {
            data.reply(`Can't find game "${data.message}"`, true);
            return;
          }
          await this.twitch.apiClient.channels.updateChannelInfo(
            this.twitch.channel.id,
            { gameId: game.id },
          );
          // TODO change game in kick

          data.reply(`Game has been changed to "${game.name}"`, true);
        },
      },
      {
        showOnChat: false,
        command: "!tags",
        commandFunction: async (data) => {
          if (!data.isUserMod || data.platform !== Platform.twitch) return;
          const stream = await this.twitch.apiClient.streams.getStreamByUserId(
            this.twitch.channel.id,
          );
          if (stream == null) {
            data.reply("Stream is currently offline", true);
            return;
          }
          const args = data.message.toLowerCase().split(" ");

          switch (args[0]) {
            case "add":
              const newTags = args.slice(1);
              if (newTags.length >= 10) {
                data.reply("Reached maxiumum amount of tags", true);
                break;
              }
              try {
                await this.twitch.apiClient.channels.updateChannelInfo(
                  this.twitch.channel.id,
                  { tags: stream.tags.concat(newTags) },
                );
              } catch (e) {
                data.reply(e, true);
                return;
              }
              data.reply(`Tags ${newTags} has been added`, true);
              break;
            case "remove":
              const tagsToRemove = args.slice(1);
              await this.twitch.apiClient.channels.updateChannelInfo(
                this.twitch.channel.id,
                {
                  tags: stream.tags.filter((value) => {
                    return !tagsToRemove.includes(value.toLowerCase());
                  }),
                },
              );

              data.reply(`Tags ${tagsToRemove} has been removed`, true);
              break;
            default:
              data.reply(`Current tags: ${stream.tags}`, true);
              return;
          }
        },
      },
      {
        showOnChat: false,
        command: "!bsr",
        commandFunction: (data): void | Promise<void> => {
          if (data.platform == Platform.twitch) return;
          this.twitch.chatClient.say(
            this.twitch.channel.name,
            `!bsr ${data.message}`,
          );
        },
      },
      {
        showOnChat: true,
        command: "!tts",
        commandFunction: (data): void | Promise<void> => {
          if (data.message.trim() == "") return;
          if (!data.isUserMod && !this.ttsEnabled) return;
          switch (data.platform) {
            case Platform.twitch:
              if (data.context == null) break;
              let msg = data.message.trim();

              var indexes: number[] = [];
              data.context.emoteOffsets.forEach((emote) => {
                emote.forEach((index) => {
                  indexes.push(parseInt(index) - "!tts ".length);
                });
              });
              msg = removeByIndexToUppercase(msg, indexes);
              this.iotts.emit("message", {
                text: msg,
                sender: data.user,
                color: data.userColor,
                parsedText: parseTwitchEmotes(
                  "!tts " + data.message,
                  data.context.emoteOffsets,
                  this.twitch.cheerEmotes,
                ).replace("!tts ", ""),
              });

              break;
            case Platform.kick:
              this.iotts.emit("message", {
                text: removeKickEmotes(data.message),
                sender: data.user,
                color: data.userColor,
                parsedText: parseKickEmotes(data.message),
              });
              break;
            case Platform.youtube:
              this.iotts.emit("message", {
                text: data.message,
                sender: data.user,
                color: data.userColor,
                parsedText: parseYTMessage(data.context),
              });
              break;
          }
        },
      },
      {
        showOnChat: false,
        command: "!snipe",
        commandFunction: async (data) => {
          if (!data.isUserMod) return;
          data.reply(`Sniping ${data.message}`, true);
          const songs: String[] = await kill(data.message);
          if (songs.length === 0) {
            data.reply("Couldn't find songs", true);
          }
          songs.forEach((map) => {
            data.reply(`!bsr ${map}`, false);
          });
        },
      },
      {
        showOnChat: false,
        command: "!modtts",
        commandFunction: (data) => {
          if (!data.isUserMod) return;
          if (data.message == "enable") {
            this.ttsEnabled = true;
            data.reply("TTS command has been enabled", true);
            return;
          }
          if (data.message == "disable") {
            this.ttsEnabled = false;
            data.reply("TTS command has been disabled", true);
            return;
          }
        },
      },
      {
        showOnChat: false,
        command: "!wheel",
        commandFunction: async (data) => {
          if (!data.isUserMod) {
            data.reply(this.wheel.toString(false), true);
            return;
          }
          const args = data.message.split(" ");
          switch (args[0]) {
            case "spin":
              this.wheel.spinWheel();
              data.reply("WHEEEEEEEEEEEL SPINING!!!!", false);
              break;
            case "add":
              let weight = parseInt(args.at(-1));
              let color: string;
              let text: string;

              if (isNaN(weight)) {
                weight = parseInt(args.at(-2));
                color = args.at(-1);
                text = args.slice(1, -2).join(" ");
              } else {
                text = args.slice(1, -1).join(" ");
              }
              if (text == null || isNaN(weight)) {
                return;
              }
              this.wheel.addSegment(text, weight, color);
              data.reply(`Added segment ${text}`, true);
              break;
            case "remove":
              const segment = args.splice(1).join(" ");
              if (segment == null) return;
              if (this.wheel.removeSegment(segment)) {
                data.reply(`Removed segment ${segment}`, true);
              }
              break;
            case "update":
              this.wheel.updateWheel();
              break;
            case "read":
              this.wheel.readWheel();
              break;
            case "weights":
              data.reply(this.wheel.toString(true), true);
              break;
            default:
              data.reply(this.wheel.toString(false), true);
              break;
          }
        },
      },
      {
        showOnChat: false,
        command: "!pet",
        commandFunction: async (data) => {
          if (data.platform != Platform.twitch) return;
          const args = data.message.split(" ");
          switch (args[0]) {
            case "feed":
              this.pet.feed(data.context.userInfo.userId);
              break;
            case "status":
              this.pet.sayStatus(StatusReason.command);
              break;
            case "graveyard":
              this.pet.graveyard(args[1]);
              break;
            case "fuel":
              this.pet.fuel(data.context.userInfo.userId);
              break;
            case "pet":
              this.pet.pet(data.user);
              break;
            case "wakeup":
              this.pet.init(true);
              break;

            case "start":
              if (data.isUserMod) {
                this.pet.init(true);
                break;
              }
            case "sleep":
              if (data.isUserMod) {
                this.pet.sleep();
                break;
              }
            case "continue":
              if (data.isUserMod) {
                this.pet.init(false);
                break;
              }
            case "tick":
              if (data.isUserMod) {
                this.pet.tick();
                break;
              }
            case "read":
              if (data.isUserMod) {
                this.pet.readPet();
                break;
              }
            case "write":
              if (data.isUserMod) {
                this.pet.writePet();
                break;
              }
            case "protect":
              if (data.isUserMod) {
                this.pet.activateShield();
                break;
              }
            default:
              data.reply(
                "Usage !pet feed|fuel|status|graveyard. Use !petinfo for more info",
                true,
              );
          }
        },
      },
    ];

    this.pet = new Pet(this);
    this.wheel = new Wheel(this.server);
    this.twitch = new Twitch(this);
    this.kick = new Kick(this.kickId, this);
    this.youTube = new YouTube("sweetbaboostreams1351", this);
    this.discord = new Discord(this);
    this.database = new DB();
  }

  public initBot() {
    this.database.init();
    this.discord.initBot();
    this.youTube.initBot();
    this.twitch.initBot();
    this.kick.initBot();
  }

  public async cleanUp() {
    await this.twitch.cleanUp();
    this.youTube.cleanUp();
    this.kick.cleanUp();
    this.discord.cleanUp();
    this.database.cleanUp();
  }

  public updatePoll() {
    const combinedOptions = {};

    if (this.kick.currentPoll != null) {
      this.kick.currentPoll.options.forEach((option) => {
        combinedOptions[option.id] = {
          label: option.label,
          votes: option.votes,
        };
      });
    }

    if (this.twitch.currentPoll != null) {
      this.twitch.currentPoll.options.forEach((option) => {
        if (combinedOptions.hasOwnProperty(option.id)) {
          combinedOptions[option.id].votes += option.votes;
        } else {
          combinedOptions[option.id] = {
            label: option.label,
            votes: option.votes,
          };
        }
      });
    }

    const combinedOptionsArray = Object.keys(combinedOptions).map((id) => ({
      id: parseInt(id),
      label: combinedOptions[id].label,
      votes: combinedOptions[id].votes,
    }));
    this.iopoll.emit("updatePoll", combinedOptionsArray);
  }

  private async setDynamicTitle() {
    if (this.dynamicTitle == null) return;
    const title = (
      await replaceAsync(
        this.dynamicTitle,
        /(!?fetch)\[([^]+)\]{?(\w+)?}?/g,

        async (message: string, command: string, url: string, key: string) => {
          const req = await fetch(url);
          if (key === undefined) {
            return await req.text();
          } else {
            const json = await req.json();
            return json[key];
          }
        },
      )
    ).replace(/suffix\((\d+)\)/g, (message: string, number: string) => {
      return getSuffix(parseInt(number));
    });
    if (title != this.lastDynamicTitle) {
      this.twitch.chatClient.say(
        this.twitch.channel.name,
        `Title has been set to ${title}`,
      );
      this.twitch.apiClient.channels.updateChannelInfo(this.twitch.channel.id, {
        title: title,
      });
      this.lastDynamicTitle = title;
    }
  }

  public async parseClips(text: string): Promise<string> {
    const clipId = this.twitch.clipRegex.exec(text);
    if (clipId !== null) {
      const clip = await this.twitch.apiClient.clips.getClipById(clipId[1]);
      if (clip !== null) {
        return (
          text +
          `<a target="_blank" href="${clip.url}" style="text-decoration: none;"><div style="background-color: #191b1f;box-shadow: 0 1px 2px rgba(0,0,0,.9),0 0px 2px rgba(0,0,0,.9);border-radius: 0.2rem;border: none;padding: 4px;display: flex;align-content: center;margin-top: 5px;text-decoration: none;font-size: 15px;line-height: 25px;"> <img width="80" height="45" src="${clip.thumbnailUrl}" style="padding-right: 10px;"> ${clip.title}  <br> Clipped by ${clip.creatorDisplayName}</div></a>`
        );
      } else {
        console.error(
          "\x1b[35m%s\x1b[0m",
          `Failed getting clip info: ${clipId[1]}`,
        );
      }
    }
    const wwwclipId = this.twitch.wwwclipRegex.exec(text);
    if (wwwclipId !== null) {
      const clip = await this.twitch.apiClient.clips.getClipById(wwwclipId[1]);
      if (clip !== null) {
        return (
          text +
          `<a target="_blank" href="${clip.url}" style="text-decoration: none;"><div style="background-color: #191b1f;box-shadow: 0 1px 2px rgba(0,0,0,.9),0 0px 2px rgba(0,0,0,.9);border-radius: 0.2rem;border: none;padding: 4px;display: flex;align-content: center;margin-top: 5px;text-decoration: none;font-size: 15px;line-height: 25px;"> <img width="80" height="45" src="${clip.thumbnailUrl}" style="padding-right: 10px;"> ${clip.title}  <br> Clipped by ${clip.creatorDisplayName}</div></a>`
        );
      } else {
        console.error(
          "\x1b[35m%s\x1b[0m",
          `Failed getting clip info: ${wwwclipId[1]}`,
        );
      }
    }
    return text;
  }
}
