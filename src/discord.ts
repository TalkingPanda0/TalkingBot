import {
  Channel,
  Client,
  Events,
  GatewayIntentBits,
  TextChannel,
} from "discord.js";
import fs from "node:fs";
export interface streamInfo {
  game: string;
  title: string;
  thumbnailUrl: string;
}

export class Discord {
  token: string;
  client: Client;
  channel: TextChannel;
  constructor() {
    if (!fs.existsSync("discord.json")) {
      console.error("\x1b[34m%s\x1b[0m", "Discord.json doesn't exist");
      return;
    }
    const fileContent = JSON.parse(fs.readFileSync("discord.json", "utf-8"));
    this.token = fileContent.token;
  }
  public sendStreamPing(stream: streamInfo) {
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

  public initBot() {
    if (this.token === undefined) return;
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds],
      allowedMentions: { parse: ["users", "roles"] },
    });

    this.client.once(Events.ClientReady, (readyClient) => {
      console.log("\x1b[34m%s\x1b[0m", `Discord setup complete`);
      this.channel = this.client.guilds.cache
        .get("853223679664062465")
        .channels.cache.get("947160971883982919") as TextChannel;
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
      this.client.once(Events.Error, (error: Error) => {
        console.error(error);
      });
    });
    this.client.login(this.token);
  }
}
