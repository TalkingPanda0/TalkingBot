
const { RefreshingAuthProvider } = require('@twurple/auth');
const { Bot, createBotCommand } =  require('@twurple/easy-bot');
const { PubSubClient, PubSubRedemptionMessage,PubSubModActionMessage } = require('@twurple/pubsub');
const { ApiClient } = require('@twurple/api')

// Get the tokens from ../tokens.json
const { clientId, accessToken, refreshToken, clientSecret } = require('../tokens.json');



const authProvider = new RefreshingAuthProvider({clientId,clientSecret});

function removeByIndex(str,index) {
    return str.slice(0,index) + str.slice(index+1);
}

function removeByIndexToUppercase(str,indexes) {
    var deletedChars = 0;
    indexes.forEach( (index) => {
        var i = index - deletedChars;
        while (  !isNaN(parseInt(str.charAt(i),10)) || str.charAt(i) != str.charAt(i).toUpperCase()) {
            str = removeByIndex(str,i);
            deletedChars++;
        }
    } );
    // remove chars before the first space in str before returning it
    str = str.split(" ").slice(1).join(" "); 
    return str;
}
class Twitch {
    sendTTS = () => {};
    channelName = "";
    bot;
    pubsubClient;

     constructor(sendTTS,channelName){
        this.sendTTS = sendTTS;
        this.channelName = channelName;
        
     } 
    async initBot() {

        await authProvider.addUserForToken({
            accessToken,
            refreshToken
        }, ['chat']);
        authProvider.onRefresh(async (userId, newTokenData) => await fs.writeFile(`./tokens.json`, JSON.stringify(newTokenData, null, 4), 'UTF-8'));
        
        const bot = new Bot(
            { 
                authProvider, channel: this.channelName,
        commands: [
            createBotCommand('dice', (params, { reply }) => {
                const diceRoll = Math.floor(Math.random() * 6) + 1;
                reply(`You rolled a ${diceRoll}`);
            }),
            createBotCommand('kick', (params, {reply}) => {
                reply("SweetbabooO_o's Kick channel: https://kick.com/sweetbabooo-o")
            }),
            createBotCommand('tts', async (params, context) =>  {
                let message = context.msg.text.trim();
                try {
                    var indexes = [];
                    context.msg.emoteOffsets.forEach( (emote) => {emote.forEach( (index) => {indexes.push(parseInt(index)); } );});
                    message = removeByIndexToUppercase(message,indexes);
                    ttsMessage = {
                        text: message,
                        sender: context.userName,
                    }
                    sendTTS(ttsMessage,false);
                } catch (e){
                    console.log(e);
                }
            } ),
            createBotCommand('modtts', async (params, context) =>  {
                if(!context.msg.userInfo.isMod && !context.msg.userInfo.isBroadcaster)
                    return;
                let message = context.msg.text.trim();
                try {
                        var indexes = [];
                        context.msg.emoteOffsets.forEach( (emote) => {emote.forEach( (index) => {indexes.push(parseInt(index)); } );});
                        message = removeByIndexToUppercase(message,indexes);
                        
                        ttsMessage = {
                            text: message,
                            sender: context.userName,
                        }
                        sendTTS(ttsMessage,true);
                } catch (e){
                        console.log(e);
                    }
            }),
        ]
        }
        );
        
        bot.onAuthenticationSuccess(() => {
            console.log("\x1b[35m%s\x1b[0m","Twitch setup complete");
            //bot.say(this.channelName,"Talkingbot initiated!");
        })
        bot.onMessage( (MessageEvent) => {
            console.log("\x1b[35m%s\x1b[0m",`Twitch - ${MessageEvent.userDisplayName}: ${MessageEvent.text}`);
        } )
        this.bot = bot;
    }
    sendMessage(message) {
        this.bot.say(this.channelName,message);
    }
    
}

module.exports.Twitch = Twitch;