import { BunFile } from "bun";
import {
  Client,
  Events,
  GatewayIntentBits,
  TextChannel,
  VoiceState,
  Partials,
  SlashCommandBuilder,
  Collection,
  REST,
  Routes,
} from "discord.js";
import { TalkingBot } from "./talkingbot";
export interface streamInfo {
  game: string;
  title: string;
  thumbnailUrl: string;
}

export class Discord {
  private token: string;
  private clientId: string;
  private guildId: string;
  private commands: Collection<string, SlashCommandBuilder>;
  private bot: TalkingBot;
  private client: Client;
  private channel: TextChannel;
  private shouldPing: boolean = true;
  private discordFile: BunFile = Bun.file(
    __dirname + "/../config/discord.json",
  );
  constructor(bot: TalkingBot) {
    this.bot = bot;
  }
  public cleanUp() {
    this.client.destroy();
  }
  public sendStreamPing(stream?: streamInfo) {
    if (stream === undefined) {
      this.channel.send({
        content:
          "<@&965609596087595018> SWEETBABOO IS STREAMIIONG!'!!!!! https://twitch.tv/sweetbabooo_o",
        allowedMentions: { roles: ["965609596087595018"] },
      });
    }
    this.channel.send({
      content:
        "<@&965609596087595018> SWEETBABOO IS STREAMIIONG!'!!!!! https://twitch.tv/sweetbabooo_o",
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
    this.clientId = fileContent.clientId;
    this.guildId = fileContent.guildId;

    if (this.token == null) return;
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
      ],
      allowedMentions: { parse: ["users", "roles"] },
      partials: [Partials.Message, Partials.Channel, Partials.Reaction],
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
    this.client.on(Events.MessageCreate, (message) => {
      console.log(
        "\x1b[34m%s\x1b[0m",
        `Discord - got message from ${message.author.displayName}`,
      );

      if (Math.random() < 0.01) {
        message.react("1255212339406573641");
        this.bot.database.hapbooReaction(message.author.id);
      }
    });

    //this.client.on(Events.MessageReactionAdd, (reaction) => {});

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
    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      const command = this.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await interaction.reply(
          "HAPBOO HAPBOOG PHAPBPO HAPĞBPP HAPBPP HAPBPP HAPBPPO",
        );
      } catch (e) {
        console.error("\x1b[34m%s\x1b[0m", e);
      }
    });
    this.client.login(this.token);
    this.commands = new Collection();

    this.commands.set(
      "hapboo",
      new SlashCommandBuilder()
        .setName("hapboo")
        .setDescription("See who got hapbooed the most."),
    );
    const commandsArray = this.commands.map((value) => {
      return value.toJSON();
    });
    const rest = new REST().setToken(this.token);

    (async () => {
      try {
        console.log(
          "\x1b[34m%s\x1b[0m",
          `Started refreshing ${commandsArray.length} application (/) commands.`,
        );

        const data = (await rest.put(
          Routes.applicationGuildCommands(this.clientId, this.guildId),
          { body: commandsArray },
        )) as Array<any>;

        console.log(
          "\x1b[34m%s\x1b[0m",
          `Successfully reloaded ${data.length} application (/) commands.`,
        );
      } catch (error) {
        console.error(error);
      }
    })();
  }
}
