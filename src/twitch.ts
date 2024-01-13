import { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient, ChatMessage } from '@twurple/chat';
import { ApiClient, HelixChatBadgeSet } from '@twurple/api';
import { Command, Platform, TTSMessage } from './talkingbot';


// Get the tokens from ../tokens.json
const { clientId, accessToken, refreshToken, clientSecret } = require('../tokens.json');
const authProvider = new RefreshingAuthProvider({ clientId, clientSecret });


class Twitch {

    private channelName: string;
    private chatClient: ChatClient;
    private commandList: Command[] = [];

    constructor(channelName: string, commandList: Command[]) {

        this.channelName = channelName;
        this.commandList = commandList;
    }

    public sendMessage(message: string) {
        this.chatClient.say(this.channelName, message);
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

        this.chatClient = new ChatClient({ authProvider, channels: [this.channelName] });

        this.chatClient.onMessage(async (channel: string, user: string, text: string, msg: ChatMessage) => {

            console.log("\x1b[35m%s\x1b[0m", `Twitch - ${user}: ${text}`);

            // not a command
            if (!text.startsWith("!")) return;

            this.commandList.forEach((command) => {

                if (!text.startsWith(command.command)) return;

                command.commandFunction(user, msg.userInfo.isMod || msg.userInfo.isBroadcaster, text.substr(text.indexOf(" ") + 1), (message) => {
                    this.chatClient.say(channel, message, { replyTo: msg.id })
                }, Platform.twitch, msg);

            });

        });
        this.chatClient.onConnect(() => {
            console.log("\x1b[35m%s\x1b[0m", "Twitch setup complete");
        });

        this.chatClient.connect();

    }
}

export { Twitch };
