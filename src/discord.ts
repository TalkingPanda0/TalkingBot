import { BunFile } from "bun";
import {
  Channel,
  Client,
  Events,
  GatewayIntentBits,
  TextChannel,
  VoiceState,
} from "discord.js";
export interface streamInfo {
  game: string;
  title: string;
  thumbnailUrl: string;
}

export class Discord {
  private token: string;
  private client: Client;
  private channel: TextChannel;
  private shouldPing: boolean = true;
  private discordFile: BunFile = Bun.file(
    __dirname + "/../config/discord.json",
  );
  constructor() {}
  public sendStreamPing(stream?: streamInfo) {
    if (stream === undefined) {
      this.channel.send({
        content: "<@&965609596087595018> SWEETBABOO IS STREAMIIONG!'!!!!!",
        allowedMentions: { roles: ["965609596087595018"] },
      });
    }
    this.channel.send({
      content: "<@&965609596087595018> SWEETBABOO IS STREAMIIONG!'!!!!!",
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

  public async initBot() {
    if (!(await this.discordFile.exists())) {
      console.error("\x1b[34m%s\x1b[0m", "Discord.json doesn't exist");
      return;
    }
    const fileContent = await this.discordFile.json();
    this.token = fileContent.token;

    if (this.token === undefined) return;
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
      allowedMentions: { parse: ["users", "roles"] },
    });

    this.client.once(Events.ClientReady, (readyClient) => {
      console.log("\x1b[34m%s\x1b[0m", `Discord setup complete`);
      this.channel = this.client.guilds.cache
        .get("853223679664062465")
        .channels.cache.get("947160971883982919") as TextChannel;
    });
    this.client.once(Events.Error, (error: Error) => {
      console.error(error);
    });
    this.client.on(
      Events.VoiceStateUpdate,
      async (oldstate: VoiceState, newState: VoiceState) => {
        // is sweetbaboo
        if (newState.member.id !== "350054317811564544") return;

        // started streaming on #streaming and should ping
        if (
          this.shouldPing &&
          newState.channelId === "858430399380979721" &&
          newState.streaming &&
          oldstate.streaming === false
        ) {
          newState.channel.send({
            content:
              "<@&965609422028144700> SWEETBABOO IS STREAMIIONG ON DISCORD!'!!!!!",
            allowedMentions: { roles: ["965609422028144700"] },
          });
          this.shouldPing = false;
        }
        // left #streaming
        else if (
          oldstate.channelId === "858430399380979721" &&
          newState.channel === null
        ) {
          this.shouldPing = true;
        }
      },
    );
    this.client.login(this.token);
  }
}
