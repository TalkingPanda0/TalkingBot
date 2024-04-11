"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Discord = void 0;
const discord_js_1 = require("discord.js");
const node_fs_1 = __importDefault(require("node:fs"));
class Discord {
    token;
    client;
    channel;
    constructor() {
        if (!node_fs_1.default.existsSync("discord.json")) {
            console.error("\x1b[34m%s\x1b[0m", "Discord.json doesn't exist");
            return;
        }
        const fileContent = JSON.parse(node_fs_1.default.readFileSync("discord.json", "utf-8"));
        this.token = fileContent.token;
    }
    sendStreamPing(stream) {
        this.channel.send({
            content: "<&@965609596087595018> SWEETBABOO IS STREAMIIONG!'!!!!!",
            allowedMentions: { roles: ["965609596087595018"] },
            embeds: [
                {
                    color: 0x0099ff,
                    title: stream.title,
                    url: "https://www.twitch.tv/sweetbabooo_o",
                    description: stream.game,
                    thumbnail: {
                        url: "https://talkingpanda.dev/hapboo.gif",
                    },
                    fields: [],
                    image: {
                        url: stream.thumbnailUrl,
                    },
                },
            ],
        });
    }
    initBot() {
        if (this.token === undefined)
            return;
        this.client = new discord_js_1.Client({
            intents: [discord_js_1.GatewayIntentBits.Guilds],
            allowedMentions: { parse: ["users", "roles"] },
        });
        this.client.once(discord_js_1.Events.ClientReady, (readyClient) => {
            console.log("\x1b[34m%s\x1b[0m", `Discord setup complete`);
            this.channel = this.client.guilds.cache
                .get("853223679664062465")
                .channels.cache.get("947160971883982919");
            /*this.channel.send({
              content: "<@483756719504097301> SWEETBABOO IS STREAMIIONG!'!!!!!",
              allowedMentions: { users: ["483756719504097301"] },
              embeds: [
                {
                  color: 0x0099ff,
                  title: "romania simulator 2",
                  url: "https://www.twitch.tv/sweetbabooo_o",
                  description: "Resident Evil Village",
                  thumbnail: {
                    url: "https://talkingpanda.dev/hapboo.gif",
                  },
                  fields: [],
                  image: {
                    url: "https://talkingpanda.dev/hapboo.gif",
                  },
                },
              ],
            });*/
            this.client.once(discord_js_1.Events.Error, (error) => {
                console.error(error);
            });
        });
        this.client.login(this.token);
    }
}
exports.Discord = Discord;
