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
  SlashCommandSubcommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  BaseMessageOptions,
  parseEmoji,
} from "discord.js";
import { TalkingBot } from "./talkingbot";
import { EmoteStat, HapbooReaction } from "./db";
import { randomInt } from "crypto";
import { getRandomElement } from "./util";
import {
  eightballMessages,
  killOtherMessages,
  selfKillMessages,
} from "./commands";
import { response } from "express";

export interface streamInfo {
  game: string;
  title: string;
  thumbnailUrl: string;
}

interface DiscordCommand {
  commandBuilder:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandBuilder;
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

    this.client.once(Events.ClientReady, (_readyClient) => {
      console.log("\x1b[34m%s\x1b[0m", `Discord setup complete`);
      this.channel = this.client.guilds.cache
        .get("853223679664062465")
        .channels.cache.get("947160971883982919") as TextChannel;
    });

    this.client.on(Events.Error, (error: Error) => {
      console.error(error);
    });

    this.client.on(Events.MessageCreate, async (message) => {
      if (message.author.bot) return;
      console.log(
        "\x1b[34m%s\x1b[0m",
        `Discord - got message from ${message.author.displayName}`,
      );

      const hapbooReactions = this.bot.database.getHapbooReaction.get(
        message.author.id,
      ) as HapbooReaction;
      let currentHapboos = 0;
      if (hapbooReactions != null) currentHapboos = hapbooReactions.times ??= 0;

      if (randomInt(100 + currentHapboos) === 0) {
        try {
          await message.react("<a:baboo_hapboo:1032341515365793884>");
        } catch (e) {
          console.error(e);
        }
        console.log("HAPBOOO");
        this.bot.database.hapbooReaction(message.author.id);
      }

      if (message.partial) {
        await message.fetch();
      }

      this.bot.commandHandler.handleCommand({
        platform: "discord",
        id: message.id,
        reply: (replyMessage, replytoUser) => {
          if (replytoUser) message.reply({ content: replyMessage });
          else message.channel.send({ content: replyMessage });
        },
        badges: [],
        isUserMod: false,
        banUser: () => {},
        message: message.content,
        parsedMessage: message.content,
        sender: message.author.displayName,
        senderId: message.author.id,
        isOld: false,
        isFirst: false,
        color: "",
        replyId: "",
        replyTo: "",
        isCommand: false,
        replyText: "",
        isAction: false,
        rewardName: "",
      });

      const emotes = this.findEmotes(message.content);
      if (emotes == null) return;
      emotes.forEach((emote) => {
        if (emote == "<:baboo_TheDeep:1263655967938318346>") {
          message.react("<:baboo_TheDeep:1263655967938318346>");
        }

        this.bot.database.emoteUsage(message.author.id, emote);
      });
    });

    this.client.on(Events.MessageReactionAdd, async (reaction, user) => {
      if (user.bot) return;
      const emote = reaction.emoji.toString();

      console.log("\x1b[34m%s\x1b[0m", `${user.id} reacted with ${emote}`);
      if (emote == "<:baboo_TheDeep:1263655967938318346>")
        reaction.message.react("<:baboo_TheDeep:1263655967938318346>");

      this.bot.database.reaction(user.id, emote);
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
      if (interaction.isChatInputCommand()) {
        const command = this.commands.get(interaction.commandName);
        if (!command) return;
        try {
          await command.execute(interaction);
        } catch (e) {
          console.error(
            "\x1b[34m%s\x1b[0m",
            `Error when executing command ${interaction.commandName}: ${e}`,
          );
        }
        return;
      }
    });

    this.client.login(this.token);
    this.commands = new Collection();

    const discordCommands: DiscordCommand[] = [
      {
        commandBuilder: new SlashCommandBuilder()
          .setName("enlarge")
          .setDescription("OH GOD HE IS SO BIG")
          .addStringOption((option) =>
            option
              .setName("emote")
              .setDescription("Who do you want to enlarge"),
          ),
        execute: async (interaction) => {
          const emote = interaction.options.getString("emote");
          if (emote == null) {
            return;
          }
          const emoji = parseEmoji(emote);
          interaction.reply({
            content: `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "png"}`,
          });
        },
      },
      {
        commandBuilder: new SlashCommandBuilder()
          .setName("8ball")
          .setDescription("ball")
          .addStringOption((option) =>
            option.setName("question").setDescription("The Question."),
          ),
        execute: async (interaction) => {
          const question = interaction.options.getString("question");
          if (!question) return;
          let answer = "";
          if (
            question &&
            question.toLowerCase().includes("furry") &&
            question.toLowerCase().includes("sweet")
          ) {
            answer = getRandomElement(eightballMessages.slice(27, 34));
          } else answer = getRandomElement(eightballMessages);
          interaction.reply({
            embeds: [
              {
                title: "8Balls",
                fields: [
                  {
                    name: "Question",
                    value: question,
                  },
                  {
                    name: "Answer",
                    value: answer,
                  },
                ],
              },
            ],
          });
        },
      },
      {
        commandBuilder: new SlashCommandBuilder()
          .setName("bump")
          .setDescription("Bump the server"),
        execute: async (interaction) => {
          try {
            await interaction.reply({
              content: "<:baboo_trollbab:905083275264032798>",
            });
          } catch (e) {
            console.error(e);
          }
        },
      },
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
          .setName("user")
          .setDescription("See emote usage of somebody")
          .addUserOption((option) =>
            option.setName("user").setDescription("The user").setRequired(true),
          )
          .addStringOption((option) =>
            option.setName("filter").setDescription("The filter").addChoices(
              {
                name: "Messages",
                value: "emotes",
              },
              { name: "Reactions", value: "reactions" },
              { name: "Both", value: "both" },
            ),
          ),
        execute: async (interaction) => {
          const filter = interaction.options.getString("filter");
          const user = interaction.options.getUser("user");
          if (user == null) return;
          let suffix = "";
          let emotes: EmoteStat[];
          switch (filter) {
            case "emotes":
              emotes = this.bot.database.getUserEmoteStat.all(
                user.id,
              ) as EmoteStat[];
              suffix = "messages";
              break;
            case "reactions":
              emotes = this.bot.database.getUserReactionStat.all(
                user.id,
              ) as EmoteStat[];

              suffix = "reactions";
              break;
            case "both":
            default:
              emotes = this.bot.database.getUserTotalStat.all(
                user.id,
              ) as EmoteStat[];
              suffix = "messages and reactions";
              break;
          }
          if (emotes == null || emotes.length == 0) {
            await interaction.reply("Can't find emote.");
            return;
          }
          const prev = new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Previous")
            .setCustomId("prev");

          const next = new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Next")
            .setCustomId("next");

          const row = new ActionRowBuilder().addComponents(prev, next);

          let page = 0;
          const pageCount = Math.ceil(emotes.length / 10);

          const genereateEmbed = (page: number) => {
            const start = page * 10;
            return {
              title: "User Statistics",
              thumbnail: {
                url: "https://talkingpanda.dev/hapboo.gif",
              },
              fields: [
                {
                  name: `Top emotes of ${user.displayName} in ${suffix}. (${page + 1}/${pageCount})`,
                  value: emotes
                    .slice(start, start + 10)
                    .map((value, index) => {
                      if (value.totaltimes != null)
                        return `${index + start + 1}: ${value.emoteId} : ${value.totaltimes}`;
                      else
                        return `${index + start + 1}: ${value.emoteId} : ${value.times}`;
                    })
                    .join("\n"),
                },
              ],
            };
          };

          const response = await interaction.reply({
            components: [row],
            embeds: [genereateEmbed(page)],
          });

          const collector = response.createMessageComponentCollector({
            filter: (i) => i.user.id == interaction.user.id,
            componentType: ComponentType.Button,
            time: 1 * 60 * 1000,
          });

          collector.on("collect", async (i) => {
            if (i.customId == "next") {
              page++;
              page = page >= pageCount ? 0 : page;
            } else {
              page--;
              page = page < 0 ? pageCount - 1 : page;
            }
            await i.update({ embeds: [genereateEmbed(page)] });
          });

          collector.on("end", () => {
            response.edit({ components: [] });
          });
        },
      },
      {
        commandBuilder: new SlashCommandBuilder()
          .setName("users")
          .setDescription("See user statistics")
          .addStringOption((option) =>
            option.setName("filter").setDescription("The filter").addChoices(
              {
                name: "Messages",
                value: "emotes",
              },
              { name: "Reactions", value: "reactions" },
              { name: "Both", value: "both" },
            ),
          ),

        execute: async (interaction) => {
          const filter = interaction.options.getString("filter");
          let suffix = "";
          let emotes: EmoteStat[];
          switch (filter) {
            case "emotes":
              emotes = this.bot.database.getTopEmoteUsers.all() as EmoteStat[];
              suffix = "messages";
              break;
            case "reactions":
              emotes =
                this.bot.database.getTopReactionUsers.all() as EmoteStat[];

              suffix = "reactions";
              break;
            case "both":
            default:
              emotes = this.bot.database.getTopTotalUsers.all() as EmoteStat[];
              suffix = "messages and reactions";
              break;
          }
          if (emotes == null || emotes.length == 0) {
            await interaction.reply("Can't find emote.");
            return;
          }

          const prev = new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Previous")
            .setCustomId("prev");

          const next = new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Next")
            .setCustomId("next");

          const row = new ActionRowBuilder().addComponents(prev, next);

          let page = 0;
          const pageCount = Math.ceil(emotes.length / 10);

          const genereateEmbed = (page: number) => {
            const start = page * 10;
            return {
              title: "User Statistics",
              thumbnail: {
                url: "https://talkingpanda.dev/hapboo.gif",
              },
              fields: [
                {
                  name: `Top people in ${suffix}. (${page + 1}/${pageCount})`,
                  value: emotes
                    .slice(start, start + 10)
                    .map((value, index) => {
                      return `${index + start + 1}: <@${value.userId}> : ${value.totalUsage}`;
                    })
                    .join("\n"),
                },
              ],
            };
          };

          const response = await interaction.reply({
            components: [row],
            embeds: [genereateEmbed(page)],
          });
          const collector = response.createMessageComponentCollector({
            filter: (i) => i.user.id == interaction.user.id,
            componentType: ComponentType.Button,
            time: 1 * 60 * 1000,
          });

          collector.on("collect", async (i) => {
            if (i.customId == "next") {
              page++;
              page = page >= pageCount ? 0 : page;
            } else {
              page--;
              page = page < 0 ? pageCount - 1 : page;
            }
            await i.update({ embeds: [genereateEmbed(page)] });
          });

          collector.on("end", () => {
            response.edit({ components: [] });
          });
        },
      },

      {
        commandBuilder: new SlashCommandBuilder()
          .setName("emotes")
          .setDescription("See emtoe statistics")
          .addStringOption((option) =>
            option.setName("filter").setDescription("The filter").addChoices(
              {
                name: "Messages",
                value: "emotes",
              },
              { name: "Reactions", value: "reactions" },
              { name: "Both", value: "both" },
            ),
          ),

        execute: async (interaction) => {
          const filter = interaction.options.getString("filter");
          let suffix = "";
          let emotes: EmoteStat[];
          switch (filter) {
            case "emotes":
              emotes = this.bot.database.getTopEmotes.all() as EmoteStat[];
              suffix = "messages";
              break;
            case "reactions":
              emotes = this.bot.database.getTopReactions.all() as EmoteStat[];
              suffix = "reactions";
              break;
            case "both":
            default:
              emotes = this.bot.database.getTopTotal.all() as EmoteStat[];
              suffix = "messages and reactions";
              break;
          }
          if (emotes == null || emotes.length == 0) {
            await interaction.reply("Can't find emote.");
            return;
          }

          const prev = new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Previous")
            .setCustomId("prev");

          const next = new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Next")
            .setCustomId("next");

          const row = new ActionRowBuilder().addComponents(prev, next);

          let page = 0;
          const pageCount = Math.ceil(emotes.length / 10);

          const genereateEmbed = (page: number) => {
            const start = page * 10;
            return {
              title: "User Statistics",
              thumbnail: {
                url: "https://talkingpanda.dev/hapboo.gif",
              },
              fields: [
                {
                  name: `Top emotes in ${suffix}. (${page + 1}/${pageCount})`,
                  value: emotes
                    .slice(start, start + 10)
                    .map((value, index) => {
                      return `${index + start + 1}: ${value.emoteId} : ${value.totalUsage}`;
                    })
                    .join("\n"),
                },
              ],
            };
          };

          const response = await interaction.reply({
            components: [row],
            embeds: [genereateEmbed(page)],
          });

          const collector = response.createMessageComponentCollector({
            filter: (i) => i.user.id == interaction.user.id,
            componentType: ComponentType.Button,
            time: 1 * 60 * 1000,
          });

          collector.on("collect", async (i) => {
            if (i.customId == "next") {
              page++;
              page = page >= pageCount ? 0 : page;
            } else {
              page--;
              page = page < 0 ? pageCount - 1 : page;
            }
            await i.update({ embeds: [genereateEmbed(page)] });
          });

          collector.on("end", () => {
            response.edit({ components: [] });
          });
        },
      },
      {
        commandBuilder: new SlashCommandBuilder()
          .setName("emote")
          .setDescription("Find statistics about an emote")
          .addStringOption((option) =>
            option
              .setName("emote")
              .setDescription("The emote")
              .setRequired(true),
          )
          .addStringOption((option) =>
            option.setName("filter").setDescription("The filter").addChoices(
              {
                name: "Messages",
                value: "emotes",
              },
              { name: "Reactions", value: "reactions" },
              { name: "Both", value: "both" },
            ),
          ),
        execute: async (interaction) => {
          const emote = interaction.options.getString("emote");
          const filter = interaction.options.getString("filter");
          if (emote == null) {
            return;
          }
          let suffix = "";
          let emotes: EmoteStat[];
          switch (filter) {
            case "emotes":
              emotes = this.bot.database.getEmoteEmoteStat.all(
                emote,
              ) as EmoteStat[];
              suffix = "messages";

              break;
            case "reactions":
              emotes = this.bot.database.getEmoteReactionStat.all(
                emote,
              ) as EmoteStat[];
              suffix = "reactions";
              break;
            case "both":
            default:
              emotes = this.bot.database.getEmoteTotalStat.all(
                emote,
              ) as EmoteStat[];
              suffix = "messages and reactions";
              break;
          }
          if (emotes == null || emotes.length == 0) {
            await interaction.reply("Can't find emote.");
            return;
          }
          const prev = new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Previous")
            .setCustomId("prev");

          const next = new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Next")
            .setCustomId("next");

          const row = new ActionRowBuilder().addComponents(prev, next);

          let page = 0;
          const pageCount = Math.ceil(emotes.length / 10);

          const genereateEmbed = (page: number) => {
            const start = page * 10;
            return {
              title: "User Statistics",
              thumbnail: {
                url: "https://talkingpanda.dev/hapboo.gif",
              },
              fields: [
                {
                  name: `Top ${emote} users in ${suffix}. (${page + 1}/${pageCount})`,
                  value: emotes
                    .slice(start, start + 10)
                    .map((value, index) => {
                      if (value.totaltimes != null)
                        return `${index + start + 1}: <@${value.userId}> : ${value.totaltimes}`;
                      else
                        return `${index + start + 1}: <@${value.userId}> : ${value.times}`;
                    })
                    .join("\n"),
                },
              ],
            };
          };

          const response = await interaction.reply({
            components: [row],
            embeds: [genereateEmbed(page)],
          });

          const collector = response.createMessageComponentCollector({
            filter: (i) => i.user.id == interaction.user.id,
            componentType: ComponentType.Button,
            time: 1 * 60 * 1000,
          });

          collector.on("collect", async (i) => {
            if (i.customId == "next") {
              page++;
              page = page >= pageCount ? 0 : page;
            } else {
              page--;
              page = page < 0 ? pageCount - 1 : page;
            }
            await i.update({ embeds: [genereateEmbed(page)] });
          });

          collector.on("end", () => {
            response.edit({ components: [] });
          });
        },
      },
      {
        commandBuilder: new SlashCommandBuilder()
          .setName("kill")
          .setDescription("KILL")
          .addStringOption((option) =>
            option
              .setName("target")
              .setDescription("the thing you want to murder"),
          ),
        execute: async (interaction) => {
          const target = interaction.options.getString("target");
          let response = "";
          if (target == null) {
            response = getRandomElement(selfKillMessages).replaceAll(
              "$1",
              interaction.user.displayName,
            );
          } else {
            response = getRandomElement(killOtherMessages)
              .replaceAll("$1", interaction.user.displayName)
              .replaceAll("$2", target);
          }
          interaction.reply({
            embeds: [{ fields: [{ name: "", value: response }] }],
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
