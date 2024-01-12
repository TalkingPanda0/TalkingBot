import { RefreshingAuthProvider } from '@twurple/auth';
import { Bot, createBotCommand, BotCommandContext } from '@twurple/easy-bot';
import { ApiClient } from '@twurple/api';
import * as fs from 'fs/promises';

interface TTSMessage {
    text: string;
    sender: string;
    emoteOffsets?: Map<String, String[]>;
}

interface ChatMessage {
    userId: string;
    text: string;
    userDisplayName: string;
}

interface ChatListMessage {
    badges: string[],
    text: string,
    sender: string,
    color: string,
}

// Get the tokens from ../tokens.json
const { clientId, accessToken, refreshToken, clientSecret } = require('../tokens.json');
const authProvider = new RefreshingAuthProvider({ clientId, clientSecret });

const userColors = ["#ff0000", "#0000ff", "#b22222", "#ff7f50", "#9acd32", "#ff4500", "#2e8b57", "#daa520", "#d2691e", "#5f9ea0", "#1e90ff", "#ff69b4", "#8a2be2", "#00ff7f"];

function removeByIndex(str: string, index: number): string {
    return str.slice(0, index) + str.slice(index + 1);
}

function removeByIndexToUppercase(str: string, indexes: number[]): string {
    let deletedChars = 0;
    indexes.forEach((index) => {
        let i = index - deletedChars;
        while (!isNaN(parseInt(str.charAt(i), 10)) || str.charAt(i) !== str.charAt(i).toUpperCase()) {
            str = removeByIndex(str, i);
            deletedChars++;
        }
    });
    // remove chars before the first space in str before returning it
    str = str.split(" ").slice(1).join(" ");
    return str;
}



class Twitch {
    private sendTTS: (message: TTSMessage, isMod: boolean) => void;
    private sendToChat: (message: ChatListMessage) => void;
    private channelName: string;
    private bot: Bot;
    private apiClient: ApiClient;
    private channelID: string;
    private channelBadges: any; // Replace with the actual type

    constructor(sendToChat: (message: ChatListMessage) => void, sendTTS: (message: TTSMessage, isMod: boolean) => void, channelName: string) {
        this.sendTTS = sendTTS;
        this.channelName = channelName;
        this.sendToChat = sendToChat;
    }

    async sendToChatList(message: ChatMessage): Promise<void> {
        let color = await this.apiClient.chat.getColorForUser(message.userId);
        let badges = ["https://twitch.tv/favicon.ico"];

        // User hasn't set a color get a "random" color
        if (color == null || color == undefined) {
            color = userColors[parseInt(message.userId) % userColors.length];
        }

        this.sendToChat({
            badges: badges,
            text: message.text,
            sender: message.userDisplayName,
            color: color,
        });
    }
    public sendMessage (message: string): void {
        console.log(this.channelName);
        this.bot.say(this.channelName, message);
    }
    async initBot(): Promise<void> {
        await authProvider.addUserForToken(
            {
                accessToken,
                refreshToken,
                expiresIn: null,
                obtainmentTimestamp: 0
            }, ['chat']);

        //authProvider.onRefresh(async (userId, newTokenData) => await fs.writeFile(`./tokens.json`, JSON.stringify(newTokenData, null, 4), 'UTF-8'));

        let apiClient = new ApiClient({ authProvider });
        this.channelID = (await apiClient.users.getUserByName(this.channelName) ?? {id: "0"}).id;
        this.channelBadges = await apiClient.chat.getChannelBadges(this.channelID);

        this.apiClient = apiClient;

        this.bot = new Bot({
            authProvider, channel: this.channelName,
            commands: [
                createBotCommand('dice', (params, { reply }) => {
                    const diceRoll = Math.floor(Math.random() * 6) + 1;
                    reply(`You rolled a ${diceRoll}`);
                }),
                createBotCommand('kick', (params, { reply }) => {
                    reply("SweetbabooO_o's Kick channel: https://kick.com/sweetbabooo-o");
                }),
                createBotCommand('tts', (params, context) => {
                    this.sendToChatList({ "text": context.msg.text, "userId": context.userId, "userDisplayName": context.userDisplayName });
                    let message = context.msg.text.trim();
                    try {
                        var indexes: number[] = [];
                        context.msg.emoteOffsets.forEach((emote) => { emote.forEach((index) => { indexes.push(parseInt(index)); }); });
                        message = removeByIndexToUppercase(message, indexes);
                        let ttsMessage: TTSMessage = {
                            text: message,
                            sender: context.userName,
                            emoteOffsets: context.msg.emoteOffsets,
                        };

                        this.sendTTS(ttsMessage, false);

                    } catch (e) {
                        console.log(e);
                    }
                }),
                createBotCommand('modtts', (params, context) => {
                    this.sendToChatList({ "text": context.msg.text, "userId": context.userId, "userDisplayName": context.userDisplayName });
                    if (!context.msg.userInfo.isMod && !context.msg.userInfo.isBroadcaster)
                        return;
                    let message = context.msg.text.trim();
                    try {
                        var indexes: number[] = [];
                        context.msg.emoteOffsets.forEach((emote) => { emote.forEach((index) => { indexes.push(parseInt(index)); }); });
                        message = removeByIndexToUppercase(message, indexes);

                        let ttsMessage: TTSMessage = {
                            text: message,
                            sender: context.userName,
                        };
                        this.sendTTS(ttsMessage, true);

                    } catch (e) {
                        console.log(e);
                    }
                }),
            ]
        });

        this.bot.onAuthenticationSuccess(() => {
            console.log("\x1b[35m%s\x1b[0m", "Twitch setup complete");
            // bot.say(this.channelName,"Talkingbot initiated!");
        });
        /*bot.onMessage(async (messageEvent: BotCommandContext) => {
            console.log("\x1b[35m%s\x1b[0m", `Twitch - ${MessageEvent.userDisplayName}: ${MessageEvent.text}`);
            //this.sendToChatList(MessageEvent);
        });*/
        // this.bot.say(this.channelName,"hi");
        
    }

     
}

export { Twitch };
