import { RefreshingAuthProvider, exchangeCode } from '@twurple/auth';
import { ChatClient, ChatMessage } from '@twurple/chat';
import { ApiClient, HelixChatBadgeSet } from '@twurple/api';
import { AuthSetup, Command, Platform, TTSMessage } from './talkingbot';
import * as fs from 'fs';

// Get the tokens from ../tokens.json
const oauthPath = 'oauth.json';
const botPath = 'token-bot.json';
const broadcasterPath = 'token-broadcaster.json';
export class Twitch {

    public clientId: string = "";
    public clientSecret: string = "";

    private channelName: string;
    private chatClient: ChatClient;
    private commandList: Command[] = [];
    private authProvider: RefreshingAuthProvider;

    constructor(channelName: string, commandList: Command[]) {

        this.channelName = channelName;
        this.commandList = commandList;
    }

    public sendMessage(message: string) {
        this.chatClient.say(this.channelName, message);
    }

    async initBot(): Promise<void> {
        const fileContent = JSON.parse(fs.readFileSync(oauthPath, 'utf-8'));
        this.clientId = fileContent.clientId;
        this.clientSecret = fileContent.clientSecret;

        this.authProvider = new RefreshingAuthProvider({ clientId: this.clientId, clientSecret: this.clientSecret, redirectUri: "http://localhost:3000/oauth" });

        this.authProvider.onRefresh(async (userId, newTokenData) => {
            let isBroadcaster: Boolean = newTokenData.scope[0].startsWith("bits:read");
            fs.writeFileSync(isBroadcaster ? broadcasterPath : botPath, JSON.stringify(newTokenData, null, 4), 'utf-8');
        });

        await this.authProvider.addUserForToken(JSON.parse(fs.readFileSync(botPath,'utf-8')),["chat"]);
        await this.authProvider.addUserForToken(JSON.parse(fs.readFileSync(broadcasterPath,'utf-8')),[""]);
        
        this.chatClient = new ChatClient({ authProvider: this.authProvider, channels: [this.channelName] });

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

    public setupAuth(auth: AuthSetup) {
        this.clientId = auth.twitchClientId;
        this.clientSecret = auth.twitchClientSecret;

        fs.writeFileSync(oauthPath, JSON.stringify({ "clientId": this.clientId, "clientSecret": this.clientSecret }), 'utf-8');

        this.authProvider = new RefreshingAuthProvider({ clientId: this.clientId, clientSecret: this.clientSecret, redirectUri: "http://localhost:3000/oauth" });
    }
    public async addUser(code: string, scope: string) {
        let isBroadcaster: Boolean = scope.startsWith("bits:read");
        const tokenData = await exchangeCode(this.clientId, this.clientSecret, code, "http://localhost:3000/oauth");
        fs.writeFileSync(isBroadcaster ? broadcasterPath : botPath, JSON.stringify(tokenData, null, 4), 'utf-8');
    }
}