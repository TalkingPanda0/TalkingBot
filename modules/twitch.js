
const { RefreshingAuthProvider } = require('@twurple/auth');
const { Bot, createBotCommand } = require('@twurple/easy-bot');
const { ApiClient } = require('@twurple/api')

// Get the tokens from ../tokens.json
const { clientId, accessToken, refreshToken, clientSecret } = require('../tokens.json');
const authProvider = new RefreshingAuthProvider({ clientId, clientSecret });

const userColors = ["#ff0000","#0000ff","#b22222","#ff7f50","#9acd32","#ff4500","#2e8b57","#daa520","#d2691e","#5f9ea0","#1e90ff","#ff69b4","#8a2be2","#00ff7f"];

function removeByIndex(str, index) {
    return str.slice(0, index) + str.slice(index + 1);
}

function removeByIndexToUppercase(str, indexes) {
    var deletedChars = 0;
    indexes.forEach((index) => {
        var i = index - deletedChars;
        while (!isNaN(parseInt(str.charAt(i), 10)) || str.charAt(i) != str.charAt(i).toUpperCase()) {
            str = removeByIndex(str, i);
            deletedChars++;
        }
    });
    // remove chars before the first space in str before returning it
    str = str.split(" ").slice(1).join(" ");
    return str;
}
class Twitch {
     
    sendTTS = () => { };
    sendMessage = () => { };
    channelName = "";
    bot;
    apiClient;
    channelID = "";
    channelBadges;

    constructor(sendMessage, sendTTS, channelName) {
        this.sendTTS = sendTTS;
        this.channelName = channelName;
        this.sendMessage = sendMessage;
    }
    
    async sendToChatList(message)  {
            let color = await this.apiClient.chat.getColorForUser(message.userId);
            let badges = ["https://twitch.tv/favicon.ico"];
            
            // User hasn't set a color get a "random" color
            if(color == null || color == undefined){
                color = userColors.at(parseInt(message.userId) % userColors.length)
            }
        
          //  console.log( await (await message.getUser()).hasSubscriber((await message.getBroadcaster()).id));
            this.sendMessage({
                badges: badges,
                text: message.text,
                sender: message.userDisplayName,
                color: color,

            })
    }

    async initBot() {

        await authProvider.addUserForToken({
            accessToken,
            refreshToken
        }, ['chat']);

        authProvider.onRefresh(async (userId, newTokenData) => await fs.writeFile(`./tokens.json`, JSON.stringify(newTokenData, null, 4), 'UTF-8'));

        let apiClient = new ApiClient({ authProvider });
        this.channelID = (await apiClient.users.getUserByName(this.channelName)).id;
        this.channelBadges = await apiClient.chat.getChannelBadges(this.channelID);

        this.apiClient = apiClient;

        const bot = new Bot(
            {
                authProvider, channel: this.channelName,
                commands: [
                    createBotCommand('dice', (params, { reply }) => {
                        const diceRoll = Math.floor(Math.random() * 6) + 1;
                        reply(`You rolled a ${diceRoll}`);
                    }),
                    createBotCommand('kick', (params, { reply }) => {
                        reply("SweetbabooO_o's Kick channel: https://kick.com/sweetbabooo-o")
                    }),
                    createBotCommand('tts', (params, context) => {
                        let message = context.msg.text.trim();
                        try {
                            var indexes = [];
                            context.msg.emoteOffsets.forEach((emote) => { emote.forEach((index) => { indexes.push(parseInt(index)); }); });
                            message = removeByIndexToUppercase(message, indexes);
                            let ttsMessage = {
                                text: message,
                                sender: context.userName,
                            }
                            this.sendTTS(ttsMessage, false);
                            this.sendToChatList(MessageEvent);
                        } catch (e) {
                            console.log(e);
                        }
                    }),
                    createBotCommand('modtts', (params, context) => {
                        if (!context.msg.userInfo.isMod && !context.msg.userInfo.isBroadcaster)
                            return;
                        let message = context.msg.text.trim();
                        try {
                            var indexes = [];
                            context.msg.emoteOffsets.forEach((emote) => { emote.forEach((index) => { indexes.push(parseInt(index)); }); });
                            message = removeByIndexToUppercase(message, indexes);

                            ttsMessage = {
                                text: message,
                                sender: context.userName,
                            }
                            this.sendTTS(ttsMessage, true);
                            this.sendToChatList(MessageEvent);
                            
                        } catch (e) {
                            console.log(e);
                        }
                    }),
                ]
            }
        );
       

        bot.onAuthenticationSuccess(() => {
            console.log("\x1b[35m%s\x1b[0m", "Twitch setup complete");
            //bot.say(this.channelName,"Talkingbot initiated!");
        })
        bot.onMessage(async (MessageEvent) => {
            console.log("\x1b[35m%s\x1b[0m", `Twitch - ${MessageEvent.userDisplayName}: ${MessageEvent.text}`);
            this.sendToChatList(MessageEvent);

          
        })
        this.bot = bot;
    }
    sendMessage(message) {
        
        this.bot.say(this.channelName, message);
    }
  

}

module.exports.Twitch = Twitch;