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
  parseEmoji,
  APIEmbed,
  Message,
} from "discord.js";
import { TalkingBot } from "./talkingbot";
import { EmoteStat, HapbooReaction } from "./db";
import { randomInt } from "crypto";
import { MessageData } from "botModule";

const HAPBOOS = [
  "<:commonhapboo:1302651100599554172>",
  "<a:baboo_hapboo:1032341515365793884>",
  "<a:baboo_hyperhapboo:1263893880403922974>",
  "<a:squishedboo:1306943140128620545>",
];

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
  private token!: string;
  public clientId!: string;
  public clientSecret!: string;
  public guildId!: string;
  private commands!: Collection<string, DiscordCommand>;
  private bot: TalkingBot;
  public client!: Client;
  private channel!: TextChannel;
  private shouldPing: boolean = true;
  private discordFile: BunFile = Bun.file(
    __dirname + "/../config/discord.json",
  );

  constructor(bot: TalkingBot) {
    this.bot = bot;
  }

  public async getAllMessages(channelId: string) {
    const channel = this.client.channels.cache.get(channelId) as TextChannel;
    let messages = [];

    // Create message pointer
    let message = await channel.messages
      .fetch({ limit: 1 })
      .then((messagePage) =>
        messagePage.size === 1 ? messagePage.at(0) : null,
      );
    if (!message) {
      console.error("Couldn't get first message.");
      return;
    }
    messages.push(message.toJSON());

    do {
      await channel.messages
        .fetch({ limit: 100, before: message.id })
        .then((messagePage) => {
          messagePage.forEach((msg) => messages.push(msg.toJSON()));

          // Update our message pointer to be the last message on the page of messages
          message =
            0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
        });

      console.log(`Got ${messages.length} messages so far...`);
    } while (message);
    console.log(`Got ${messages.length} messages.`);
    await Bun.write("/dev/shm/discordLog", JSON.stringify(messages));
  }

  public cleanUp() {
    this.client.destroy();
  }

  public async sendStreamPing(stream?: streamInfo) {
    if (!stream) {
      await this.channel.send({
        content:
          "<@&965609596087595018> SWEETBABOO IS STREAMIIONG!'!!!!! https://twitch.tv/sweetbabooo_o",
        allowedMentions: { roles: ["965609596087595018"] },
      });
      return;
    }
    await this.channel.send({
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

  public async say(message: string, channelId: string) {
    const guild = this.client.guilds.cache.get("853223679664062465");
    if (!guild) throw Error("Can't get guild.");
    const channel = guild.channels.cache.get(channelId) as TextChannel;
    if (!channel) throw Error(`Can't find channel with id ${channelId}`);
    const chunks = message.match(/.{1,1024}/g);
    if (!chunks) return;
    for (const chunk of chunks) {
      await channel.send({
        embeds: [{ fields: [{ name: "", value: chunk }] }],
      });
    }
  }

  public async initBot() {
    if (!(await this.discordFile.exists())) {
      console.error("\x1b[34m%s\x1b[0m", "Discord.json doesn't exist");
      return;
    }
    const fileContent = await this.discordFile.json();
    this.token = fileContent.token;
    this.clientId = fileContent.clientId;
    this.clientSecret = fileContent.clientSecret;
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
        GatewayIntentBits.GuildMembers,
      ],
      allowedMentions: { parse: ["users", "roles"] },
      partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    });

    this.client.once(Events.ClientReady, async (_readyClient) => {
      console.log("\x1b[34m%s\x1b[0m", `Discord setup complete`);
      const guild = this.client.guilds.cache.get("853223679664062465");
      if (!guild) return;
      this.channel = guild.channels.cache.get(
        "947160971883982919",
      ) as TextChannel;
      //this.client.guilds.cache.get(this.guildId).members.me.setNickname("");
    });

    this.client.on(Events.Error, (error: Error) => {
      console.error(error);
    });

    this.client.on(Events.MessageCreate, async (message) => {
      if (message.author.bot) return;

      const doReact = message.channelId != "1020739967061868605";
      const hapbooReactions = this.bot.database.getHapbooReaction.get(
        message.author.id,
      ) as HapbooReaction;
      let currentHapboos = 0;
      if (hapbooReactions != null) currentHapboos = hapbooReactions.times ??= 0;

      if (doReact && randomInt(100 + currentHapboos) === 0) {
        try {
          let hapbooIndex: number;
          for (hapbooIndex = 0; hapbooIndex < HAPBOOS.length - 1; hapbooIndex++)
            if (randomInt(10) !== 0) break;

          console.log(`HAPBOO ${hapbooIndex}`);
          await message.react(HAPBOOS[hapbooIndex]);
          this.bot.database.hapbooReaction(message.author.id);
        } catch (e) {
          console.error(e);
        }
      }

      if (message.partial) {
        await message.fetch();
      }
      console.log(
        "\x1b[34m%s\x1b[0m",
        `Discord - ${message.author.displayName}: ${message.content}`,
      );
      if (!message.member) {
        console.error("Discord: Failed getting message.");
        return;
      }
      const rolesCache = message.member.roles.cache;
      const data: MessageData = {
        platform: "discord",
        channelId: message.channelId,
        id: message.id,
        reply: (replyMessage: string, replytoUser: boolean) => {
          if (replyMessage == null) return;
          if (replyMessage == "") return;
          replyMessage.match(/.{1,1024}/g)?.forEach((chunk) => {
            if (replytoUser)
              message.reply({
                embeds: [{ fields: [{ name: "", value: chunk }] }],
              });
            else
              message.channel.send({
                embeds: [{ fields: [{ name: "", value: chunk }] }],
              });
          });
        },
        badges: [],
        isUserMod: rolesCache.has("886305448251261018"),
        isUserVip: rolesCache.has("853223830645112843"),
        isUserSub: rolesCache.has("883443686103461948"),
        banUser: () => {},
        message: message.content,
        parsedMessage: message.content,
        sender: `<@${message.author.id}>`,
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
        username: message.author.username,
      };

      this.bot.commandHandler.handleCommand(data);
      this.bot.moduleManager.onDiscordMessage(message);

      if (doReact && message.content.toLowerCase().includes("gay"))
        message.react("<:baboo_pride:981342135892729888>");

      this.addEmotes(message);
    });

    this.client.on(Events.MessageDelete, async (message) => {
      if (!message.author || message.author.bot) return;
      if (message.partial) await message.fetch();
      if (!message.content) return;

      console.log(
        "\x1b[34m%s\x1b[0m",
        `${message.author.id} deleted ${message.content}`,
      );

      this.removeEmotes(message.author.id, message.content);
    });

    this.client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
      if (!oldMessage.author || oldMessage.author.bot) return;
      if (oldMessage.partial) await oldMessage.fetch();
      if (newMessage.partial) await newMessage.fetch();
      console.log(
        "\x1b[34m%s\x1b[0m",
        `${oldMessage.author.id} updated ${oldMessage.content} to ${newMessage.content}`,
      );

      if (oldMessage.content)
        this.removeEmotes(oldMessage.author.id, oldMessage.content);
      this.addEmotes(newMessage);
    });

    this.client.on(Events.MessageReactionAdd, async (reaction, user) => {
      if (user.bot) return;
      const emote = reaction.emoji.toString();

      console.log("\x1b[34m%s\x1b[0m", `${user.id} reacted with ${emote}`);
      if (emote == "<:baboo_TheDeep:1263655967938318346>")
        reaction.message.react("<:baboo_TheDeep:1263655967938318346>");

      this.bot.database.reaction(user.id, emote, 1);
    });

    this.client.on(Events.MessageReactionRemove, async (reaction, user) => {
      if (user.bot) return;
      const emote = reaction.emoji.toString();
      console.log("\x1b[34m%s\x1b[0m", `${user.id} took back a ${emote}`);
      this.bot.database.reaction(user.id, emote, -1);
    });

    this.client.on(
      Events.VoiceStateUpdate,
      async (oldstate: VoiceState, newState: VoiceState) => {
        if (!newState.member) return;
        // is sweetbaboo
        if (newState.member.id !== "350054317811564544") return;

        // started streaming on #streaming and should ping
        if (
          this.shouldPing &&
          newState.channelId === "858430399380979721" &&
          newState.streaming &&
          oldstate.streaming === false &&
          newState.channel
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

    this.client.on(Events.GuildMemberAdd, async (event) => {
      if (event.guild.id !== this.guildId) return;
      console.log(`${event.user.displayName} joined the fish tank.`);
      this.bot.ioalert.emit("alert", { member: event.user.displayName });
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
          if (!emoji) {
            interaction.reply({ content: "Couldn't parse emoji." });
            return;
          }
          interaction.reply({
            content: `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "png"}`,
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
            const hapboos = this.bot.database.getTopHapbooReactions();

            const pageCount = Math.ceil(hapboos.length / 10);

            const genereateEmbed = (page: number) => {
              const start = page * 10;
              return {
                title: "User Statistics",
                thumbnail: {
                  url: "https://talkingpanda.dev/hapboo.gif",
                },
                fields: [
                  {
                    name: `Top people. (${page + 1}/${pageCount})`,
                    value: hapboos
                      .slice(start, start + 10)
                      .map((value, index) => {
                        return `${index + start + 1}: <@${value.userId}> : ${value.times}`;
                      })
                      .join("\n"),
                  },
                ],
              };
            };

            await this.sendPagedEmbed(interaction, pageCount, genereateEmbed);
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

          await this.sendPagedEmbed(interaction, pageCount, genereateEmbed);
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

          await this.sendPagedEmbed(interaction, pageCount, genereateEmbed);
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

          await this.sendPagedEmbed(interaction, pageCount, genereateEmbed);
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
          const arg = interaction.options.getString("emote");
          const filter = interaction.options.getString("filter");
          if (arg == null) return;
          const emoteList = this.findEmotes(arg);
          if (emoteList == null || emoteList.length == 0) return;

          let suffix = filter;
          if (suffix == null || suffix == "both")
            suffix = "messages and reactions";

          if (!filter) {
            await interaction.reply("Can't find emote.");
            return;
          }

          const emotes: EmoteStat[] = this.bot.database.getEmoteUsage(
            emoteList,
            filter,
          );

          if (emotes == null || emotes.length == 0) {
            await interaction.reply("Can't find emote.");
            return;
          }

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
                  name: `Top ${arg} users in ${suffix}. (${page + 1}/${pageCount})`,
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

          await this.sendPagedEmbed(interaction, pageCount, genereateEmbed);
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

  private findEmotes(message: string): string[] | null {
    return message.match(/<a?:.+?:\d+>|\p{Extended_Pictographic}/gu);
  }

  private async sendPagedEmbed(
    interaction: ChatInputCommandInteraction,
    pageCount: number,
    genereateEmbed: (page: number) => APIEmbed,
  ) {
    if (pageCount == 0) return;

    if (pageCount == 1) {
      await interaction.reply({
        embeds: [genereateEmbed(0)],
      });
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

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(prev, next);

    let page = 0;

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
  }

  private removeEmotes(authorId: string, message: string) {
    const emotes = this.findEmotes(message);
    if (emotes == null) return;
    emotes.forEach((emote) => {
      this.bot.database.emoteUsage(authorId, emote, -1);
    });
  }

  private addEmotes(message: Message) {
    const emotes = this.findEmotes(message.content);
    if (emotes == null) return;
    emotes.forEach((emote) => {
      if (emote == "<:baboo_TheDeep:1263655967938318346>")
        message.react("<:baboo_TheDeep:1263655967938318346>");

      this.bot.database.emoteUsage(message.author.id, emote, 1);
    });
  }

  public async isStreamMod(userId: string): Promise<boolean> {
    try {
      const user = await this.channel.guild.members.fetch(userId);
      if (!user) return false;
      return user.roles.cache.has("886305448251261018");
    } catch (e) {
      return false;
    }
  }
}
