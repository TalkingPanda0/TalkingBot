//const voices = ["Jan", "Giorgio", "Geraint", "Salli", "Matthew", "Kimberly", "Kendra", "Justin", "Joey", "Joanna", "Ivy", "Raveena", "Aditi", "Emma", "Brian", "Amy", "Russell", "Nicole", "Kangkang", "Linda", "Heather", "Sean"];
const voicesRemoveRegex =
  /^\((Jan|Giorgio|Geraint|Salli|Matthew|Kimberly|Kendra|Justin|Joey|Joanna|Ivy|Raveena|Aditi|Emma|Brian|Amy|Russell|Nicole|Kangkang|Linda|Heather|Sean)\)/;
const voicesRegex =
  /(?<=^\()(Jan|Giorgio|Geraint|Salli|Matthew|Kimberly|Kendra|Justin|Joey|Joanna|Ivy|Raveena|Aditi|Emma|Brian|Amy|Russell|Nicole|Kangkang|Linda|Heather|Sean)(?=\))/;
const messageList = document.getElementById("message-list");

const emoteSoundEffects = {
  HapBoo: "/static/yippe.mp3",
  HapFlat: "/static/squish.mp3",
  HabPoo: "/static/habpoo.mp3",
  aids: "/static/aids.mp3",
  HNNNGH: "/static/hnhg.mp3",
  Skrunk: "/static/huh.mp3",
  Nerd: "/static/nerd.mp3",
  Pixel: "/static/pixel.mp3",
  TeeHee: "/static/hehe.mp3",
  Silly: "/static/silly.mp3",
};

var queue = [];
var isPlaying = false;

function HAPBOO() {
  var img = document.createElement("img");
  img.src = "https://talkingpanda.dev/hapboo.gif";
  img.width = 25;
  return img;
}

function createPopup(message) {
  var popupElement = `<span class="sender">${message.sender} says:</span><br/><span class="text">${message.text}</span class="text"></span><div></div>`;
  messageList.innerHTML = popupElement;
  messageList.style.opacity = 1;
  if (Math.floor(Math.random() * 2) == 0) {
    messageList.appendChild(HAPBOO());
  }
}

function removePopup() {
  messageList.style.opacity = 0;
  setTimeout(() => {
    messageList.innerHTML = "";
  }, 1e3);
}

function handleQueue() {
  if (queue.length === 0 || isPlaying || messageList.childElementCount != 0)
    return;
  var message = queue.shift();
  var text = message.text.trim();
  isPlaying = true;
  createPopup(message);
  for (const key in emoteSoundEffects) {
    const index = text.indexOf(key);
    if (index !== -1) {
      let tempqueue = [];
      console.log("GOT " + index);
      if (index != 0) {
        tempqueue.push(
          new Audio(
            `https://api.streamelements.com/kappa/v2/speech?voice=${message.voice}&text=${encodeURIComponent(text.slice(0, index))}`,
          ),
        );
      }
      tempqueue.push(new Audio(emoteSoundEffects[key]));
      if (index + key.length != text.length) {
        tempqueue.push(
          new Audio(
            `https://api.streamelements.com/kappa/v2/speech?voice=${message.voice}&text=${encodeURIComponent(text.slice(index + key.length, text.length))}`,
          ),
        );
      }
      tempqueue.forEach((audio, index) => {
        audio.onerror = (err) => {
          console.log("Got error: " + err);
          isPlaying = false;
          removePopup();
          createPopup({ sender: "Brian himself", text: err });
          setTimeout(removePopup, 10000);
        };
        audio.onended = () => {
          if (tempqueue.length == 0) {
            isPlaying = false;
            setTimeout(removePopup, 10e2);
            return;
          }
          tempqueue
            .shift()
            .play()
            .catch((err) => {
              isPlaying = false;
              console.log(err);
              createPopup({ sender: "Brian himself", text: err });
              setTimeout(removePopup, 10000);
            });
        };
      });

      tempqueue
        .shift()
        .play()
        .catch((err) => {
          isPlaying = false;
          console.log(err);
          createPopup({ sender: "Brian himself", text: err });
          setTimeout(removePopup, 10000);
        });
      return;
    }
  }
  var audio = new Audio(
    `https://api.streamelements.com/kappa/v2/speech?voice=${message.voice}&text=${encodeURIComponent(text)}`,
  );

  audio.onended = () => {
    isPlaying = false;
    setTimeout(removePopup, 2500);
  };
  audio.play().catch((err) => {
    isPlaying = false;
    console.log(err);
    createPopup({ sender: "Brian himself", text: err });
    setTimeout(removePopup, 10000);
  });
}

function ttSay(message) {
  let voiceMatch = message.text.match(voicesRegex);
  if (voiceMatch !== null) {
    message.voice = voiceMatch[0];
  } else {
    message.voice = "Brian";
  }
  message.text = message.text.replace(voicesRemoveRegex, "");
  queue.push(message);
}

var socket = io("/", { path: "/tts/" });

socket.on("message", (message) => {
  console.log("GOT MESSAGE:", message);
  if (message.sender == "TalkingPanda" && message.text == "refresh") {
    location.reload();
  }
  ttSay(message);
  handleQueue();
});
setInterval(handleQueue, 1e3);
