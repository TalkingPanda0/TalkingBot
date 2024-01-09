const WebSocket = require("ws");
//Kick.com channel to join and monitor. Array of values.
//To get a channel ID, load a pop-up chat of the channel you wish to monitor.
//Check that request labeled `101` and use that channel number listed there.

const regex = /\[emote:(\d+):([^\]]+)\]/g;

function isCommand(message,command){
  return message.trim().startsWith(`!${command}`);
}


function cleanMessage(message){
  message = message.substr(message.indexOf(" ") + 1);
  
  // Clean emotes

  return  message.replace(regex, (match, id, name) => name).replaceAll("sweetbabooo-o","");
}


// Open websocket to streamer.

// Pusher is the service used for chatting.
function initBot(sendChat,sendMessage,sendTTS,channelID){
  
  let chatroomNumber = [channelID];
  const chat = new WebSocket(
    "wss://ws-us2.pusher.com/app/eb1d5f283081a78b932c?protocol=7&client=js&version=7.6.0&flash=false"
  );

  chat.on("open", function open() {
    chat.send(
      JSON.stringify({
        event: "pusher:subscribe",
        data: { auth: "", channel: `chatrooms.${chatroomNumber}.v2` },
      })
    );

    console.log("\x1b[32m%s\x1b[0m","Kick Setup Complete")
    sendChat({"text":"message","sender": "jsonDataSub.sender.username","color":"#ffffff"})
  });

  chat.on("error", console.error);

  chat.on("close", function close() {
    console.log("Connection closed for chatroom: " + chatroomNumber);
  });

  chat.on("message", function message(data) {
    //sendChat({"text":"message","sender": "jsonDataSub.sender.username","color":"#ffffff"})
    try {
      // Order to get things.
      // decode message to get components needed.
      const dataString = data.toString();
      const jsonData = JSON.parse(dataString);
      const jsonDataSub = JSON.parse(jsonData.data);
      
      let message = jsonDataSub.content;

      sendChat({"icon":"https://kick.com/favicon.ico","text":message,"sender": jsonDataSub.sender.username,"color":jsonDataSub.sender.identity.color})

      // Log the message in console for tracker purposes.
      console.log(
        "\x1b[32m%s\x1b[0m",
        "Kick - " +
        jsonDataSub.sender.username +
        ": " +
        message
      );

      
      if(isCommand(message,"bsr")){
        sendMessage(cleanMessage(message));
        return;
      }
      
      if(isCommand(message,"tts")){
        ttsMessage = {
          text: cleanMessage(message),
          sender: jsonDataSub.sender.username,
        }
        sendTTS(ttsMessage,false);
        return;
      }

      let firstBadgeType = jsonDataSub.sender.identity.badges[0].type;
      if(firstBadgeType === "moderator" || firstBadgeType === "broadcaster"){
        if(isCommand(message,"modtts")){
          ttsMessage = {
            text: cleanMessage(message),
            sender: jsonDataSub.sender.username,
          }
          sendTTS(ttsMessage,true);
        }
      }
    } catch (error) {
     // console.log(error);
    }
  });
}
module.exports.initBot = initBot;