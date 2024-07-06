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
  ChatInputCommandInteraction,
  SlashCommandSubcommandsOnlyBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import { TalkingBot } from "./talkingbot";
import { HapbooReaction } from "./db";
export interface streamInfo {
  game: string;
  title: string;
  thumbnailUrl: string;
}

interface DiscordCommand {
  commandBuilder:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void> | void;
}

export class Discord {
  private token: string;
  private clientId: string;
  private guildId: string;
  private commands: Collection<string, DiscordCommand>;
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
        GatewayIntentBits.MessageContent,
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

    this.client.on(Events.Error, (error: Error) => {
      console.error(error);
    });

    this.client.on(Events.MessageCreate, async (message) => {
      console.log(
        "\x1b[34m%s\x1b[0m",
        `Discord - got message from ${message.author.displayName}`,
      );

      if (Math.random() < 0.01) {
        message.react("1255212339406573641");
        this.bot.database.hapbooReaction(message.author.id);
      }

      if (message.partial) {
        await message.fetch();
      }
      const emotes = this.findEmotes(message.content);
      if (emotes == null) return;
      emotes.forEach((emote) => {
        this.bot.database.emoteUsage(message.author.id, emote);
      });
    });

    this.client.on(Events.MessageReactionAdd, async (reaction, user) => {
      console.log(
        "\x1b[34m%s\x1b[0m",
        `${user.id} reacted with ${reaction.emoji.toString()}`,
      );

      this.bot.database.reaction(user.id, reaction.emoji.toString());
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
    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      const command = this.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (e) {
        console.error("\x1b[34m%s\x1b[0m", e);
      }
    });
    this.client.login(this.token);
    this.commands = new Collection();

    const discordCommands: DiscordCommand[] = [
      {
        commandBuilder: new SlashCommandBuilder()
          .setName("hapboo")
          .setDescription("HAPBOOO")
          .addUserOption((option) =>
            option.setName("target").setDescription("The user"),
          ),
        execute: async (interaction) => {
          const target = interaction.options.getUser("target");
          if (target == null) {
            await interaction.reply({
              embeds: [
                {
                  title: "HAPBOO",
                  thumbnail: {
                    url: "https://talkingpanda.dev/hapboo.gif",
                  },

                  fields: [
                    {
                      name: "Top 10 Hapbooed people",
                      value: this.bot.database
                        .getTopHapbooReactions()
                        .map((value) => {
                          return `<@${value.userId}> : ${value.times}`;
                        })
                        .join("\n"),
                    },
                  ],
                },
              ],
            });
            return;
          }
          const hapbooReaction = this.bot.database.getHapbooReaction.get(
            target.id,
          ) as HapbooReaction;
          if (hapbooReaction == null) {
            interaction.reply({
              embeds: [
                {
                  title: "HAPBOO",
                  thumbnail: {
                    url: "https://talkingpanda.dev/hapboo.gif",
                  },
                  description: `<@${target.id}> has not been hapbooed yet.`,
                },
              ],
            });
            return;
          }
          interaction.reply({
            embeds: [
              {
                title: "HAPBOO",
                thumbnail: {
                  url: "https://talkingpanda.dev/hapboo.gif",
                },
                description: `<@${target.id}> has been hapbooed ${hapbooReaction.times} times.`,
              },
            ],
          });
        },
      },
      {
        commandBuilder: new SlashCommandBuilder()
          .setName("emotestats")
          .setDescription("See emtoe statistics")
          .addUserOption((option) =>
            option.setName("target").setDescription("The user"),
          ),
        execute: async (interaction) => {
          interaction.reply({
            embeds: [
              {
                title: "Emote Statistics",
                thumbnail: {
                  url: "https://talkingpanda.dev/hapboo.gif",
                },

                fields: [
                  {
                    name: "Top 10 emotes",
                    value: (
                      this.bot.database.getTopEmotes.all() as {
                        emoteId: string;
                        totalUsage: number;
                      }[]
                    )
                      .map((value) => {
                        return `${value.emoteId} : ${value.totalUsage}`;
                      })
                      .join("\n"),
                  },
                ],
              },
            ],
          });
        },
      },
    ];
    discordCommands.forEach((value) => {
      this.commands.set(value.commandBuilder.name, value);
    });

    const commandsArray = this.commands.map((value) => {
      return value.commandBuilder.toJSON();
    });

    const rest = new REST().setToken(this.token);

    try {
      await rest.put(
        Routes.applicationGuildCommands(this.clientId, this.guildId),
        { body: commandsArray },
      );
    } catch (error) {
      console.error(error);
    }
  }
  private findEmotes(message: string): string[] {
    return message.match(/<a?:.+?:\d+>/gu);
  }
}
