import { ChatMessage } from "@twurple/chat";
import { Twitch } from "./twitch";
import { Kick } from "./kick";

export enum Platform {
    twitch,
    kick,
}
export interface Command {
    command: string;
    commandFunction: (user: string, isUserMod: boolean, message: string, reply: Function, platform: Platform, context?: any) => void | Promise<void>,
}

export interface TTSMessage {
    text: string;
    sender: string;
    emoteOffsets?: Map<String, String[]>;
}

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

function parseEmotes(message: string): string {
    const regex = /\[emote:(\d+):([^\]]+)\]/g;
    return message.replace(regex, (match, id, name) => name).replace("sweetbabooo-o","");
}



export class TalkingBot {
    private channelName: string;
    private kickId: string;
    private commandList: Command[] = [];
    private twitch: Twitch;
    private kick: Kick;

    constructor(channelName: string, kickId: string, sendTTS: (message: TTSMessage, isMod: boolean) => void) {
        this.channelName = channelName;
        this.kickId = kickId;
        this.commandList = [
            
            {
                command: "!bsr",
                commandFunction: (user: string, isUserMod: boolean, message: string, reply: Function, platform: Platform, context?: ChatMessage): void | Promise<void> => {
                    if (platform == Platform.twitch) return;
                    this.twitch.sendMessage(`!bsr ${message}`);
                }
            },
            {
                command: '!tts',
                commandFunction: (user: string, isUserMod: boolean, message: string, reply: Function, platform: Platform, context?: ChatMessage): void | Promise<void> => {
                    if (platform == Platform.twitch && context != null) {
                        let msg = message.trim();

                        var indexes: number[] = [];
                        context.emoteOffsets.forEach((emote) => { emote.forEach((index) => { indexes.push(parseInt(index)); }); });
                        message = removeByIndexToUppercase(message, indexes);
                        let ttsMessage: TTSMessage = {
                            text: message,
                            sender: user,
                            emoteOffsets: context.emoteOffsets,
                        };

                        sendTTS(ttsMessage, false);

                    } else if (platform == Platform.kick) {
                        const ttsMessage = {
                            text: parseEmotes(message),
                            sender: user,
                        };
                        sendTTS(ttsMessage, false);
                    }
                }
            },
            {
                command: '!modtts',
                commandFunction: (user: string, isUserMod: boolean, message: string, reply: Function, platform: Platform, context?: ChatMessage): void | Promise<void> => {
                    if(!isUserMod) return;
                    if (platform == Platform.twitch && context != null) {
                        let msg = message.trim();

                        var indexes: number[] = [];
                        context.emoteOffsets.forEach((emote) => { emote.forEach((index) => { indexes.push(parseInt(index)); }); });
                        message = removeByIndexToUppercase(message, indexes);
                        let ttsMessage: TTSMessage = {
                            text: message,
                            sender: user,
                            emoteOffsets: context.emoteOffsets,
                        };

                        sendTTS(ttsMessage, true);

                    } else if (platform == Platform.kick) {
                        const ttsMessage = {
                            text: parseEmotes(message),
                            sender: user,
                        };
                        sendTTS(ttsMessage, true);
                    }
                }
            },

        ];
        this.twitch = new Twitch(this.channelName, this.commandList);
        this.twitch.initBot().then(() => {
            
            this.kick = new Kick(this.kickId, this.commandList);
        });
        

    }
}
