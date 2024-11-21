//const voices = ["Jan", "Giorgio", "Geraint", "Salli", "Matthew", "Kimberly", "Kendra", "Justin", "Joey", "Joanna", "Ivy", "Raveena", "Aditi", "Emma", "Brian", "Amy", "Russell", "Nicole", "Kangkang", "Linda", "Heather", "Sean"];
const voicesRemoveRegex =
  /^\((Jan|Giorgio|Geraint|Salli|Matthew|Kimberly|Kendra|Justin|Joey|Joanna|Ivy|Raveena|Aditi|Emma|Brian|Amy|Russell|Nicole|Kangkang|Linda|Heather|Sean)\)/;
const voicesRegex =
  /(?<=^\()(Jan|Giorgio|Geraint|Salli|Matthew|Kimberly|Kendra|Justin|Joey|Joanna|Ivy|Raveena|Aditi|Emma|Brian|Amy|Russell|Nicole|Kangkang|Linda|Heather|Sean)(?=\))/;
const messageList = document.getElementById("message-list");

const emoteSoundEffects = new Map([
  ["ShyTwerk", "twerk.mp3"],
  ["HapBoo", "yippe.mp3"],
  ["HapFlat", "squish.mp3"],
  ["HabPoo", "habpoo.mp3"],
  ["Heheh", "hehe.mp3"],
  ["TeeHee", "hehe.mp3"],
  ["aids", "aids.mp3"],
  ["HNNNGH", "hnhg.mp3"],
  ["Skrunk", "huh.mp3"],
  ["Pixel", "pixel.mp3"],
  ["Silly", "silly.mp3"],
  ["realBoo", "realboo.mp3"],
  ["Shy", "uwu.mp3"],
  ["Sexy", "sexy.mp3"],
  ["Stunky", "stunky.mp3"],
  ["BanBan", "borf.mp3"],
  ["EatsDrywall", "eat.mp3"],
  ["Drywall", "eat.mp3"],
  ["HeartSweet", "kiss.mp3"],
  ["Heart", "kiss.mp3"],
  ["Trol", "troll.mp3"],
  ["TrollNuked", "troll.mp3"],
  ["AAA", "a.mp3"],
]);

let queue = [];
let isPlaying = false;
let playing;
let currentUser;
let interval;
let queueInterval;

const soundEffectRegex = new RegExp(
  `(${Array.from(emoteSoundEffects.keys()).join("|")})`,
  "g",
);

const audio = new Audio();

// Try to play to see if we can interact.
audio.play().catch(function (err) {
  // User need to interact with the page.

  if (err.toString().startsWith("NotAllowedError")) {
    var button = document.createElement("button");
    button.style =
      "top: 50%; position: absolute; font-size: 30px; font-weight: 30; cursor: pointer;";

    button.onclick = function () {
      this.remove();
    };

    button.innerHTML = "Click me to activate audio hooks.";
    button.id = "myButton";

    var container = document.getElementById("container");

    if (container) {
      container.appendChild(button);
    } else {
      console.error("Container element not found.");
    }
  }
});

function HAPBOO() {
  var img = document.createElement("img");
  img.src = "https://talkingpanda.dev/hapboo.gif";
  img.width = 50;
  return img;
}

function createPopup(message) {
  var popupElement = `<span class="sender"><span style="color: ${message.color}">${message.sender}</span> says:</span><br/><span class="text">${message.parsedText}</span class="text"></span><div></div>`;
  messageList.innerHTML = popupElement;
  messageList.style.opacity = 1;
  if (Math.floor(Math.random() * 100) == 0) {
    messageList.appendChild(HAPBOO());
  }
}

function removePopup() {
  messageList.style.opacity = 0;
  currentUser = null;
  setTimeout(() => {
    messageList.innerHTML = "";
  }, 1e3);
}
function getTTSAudio(message) {
  if (
    message.voice == null ||
    message.voice == "" ||
    message.text == null ||
    message.text == ""
  )
    return null;
  return new Audio(
    `https://api.streamelements.com/kappa/v2/speech?voice=${message.voice}&text=${encodeURIComponent(message.text)}`,
  );
}

function handleQueue() {
  if (queue.length === 0 || isPlaying || messageList.childElementCount != 0)
    return;

  const message = queue.shift();
  const text = message.text.trim();
  const voice = message.text.match(voicesRegex) ?? "Brian";

  isPlaying = true;

  // Stop the TTS after 20 seconds
  interval = setTimeout(() => {
    if (playing != null) stopCurrentTTS();
  }, 20 * 1000);

  createPopup(message);
  currentUser = message.sender;

  const audioQueue = [];

  let match;
  let lastIndex = 0;
  while ((match = soundEffectRegex.exec(text)) !== null) {
    const beforeEmote = getTTSAudio({
      voice: voice,
      text: text.slice(lastIndex, match.index),
    });
    if (beforeEmote) audioQueue.push(beforeEmote);

    audioQueue.push(new Audio(emoteSoundEffects.get(match[0])));
    lastIndex = match.index + match[0].length;
  }
  const afterLastEmote = getTTSAudio({
    voice: voice,
    text: text.slice(lastIndex),
  });
  if (afterLastEmote) audioQueue.push(afterLastEmote);

  console.log(audioQueue);
  console.log(`Found ${audioQueue.length} segments.`);

  playQueue(audioQueue);

  return;
}

function playQueue(audioQueue) {
  if (audioQueue == null || audioQueue.length == 0) return;
  const audio = audioQueue.shift();
  playing = audio;

  audio.onerror = (err) => {
    console.log("Got error: " + err);
    isPlaying = false;
    clearInterval(interval);
    interval = null;

    playing = null;
    removePopup();
    createPopup({
      sender: "Brian himself",
      text: err,
      parsedText: err,
      color: "red",
    });
    setTimeout(removePopup, 10000);
  };

  audio.onended = () => {
    if (audioQueue.length == 0) {
      playing = null;
      isPlaying = false;
      clearInterval(interval);
      interval = null;
      setTimeout(removePopup, 10000);
      return;
    } else {
      playQueue(audioQueue);
    }
  };

  audio.play().catch((err) => {
    playing = null;
    isPlaying = false;
    clearInterval(interval);
    interval = null;
    console.error(err);
    createPopup({
      sender: "Brian himself",
      text: err,
      parsedText: err,
      color: "red",
    });
    setTimeout(removePopup, 10000);
  });
}

function ttSay(message,isImportant) {
  const voiceMatch = message.text.match(voicesRegex);
  if (voiceMatch !== null) {
    message.voice = voiceMatch[0];
  } else {
    message.voice = "Brian";
  }
  message.text = message.text.replace(voicesRemoveRegex, "");
	if(isImportant) queue.unshift(message);
	else queue.push(message);
}

function stopCurrentTTS() {
  playing.pause();
  playing.currentTime = 0;
  playing = null;
  isPlaying = false;
  setTimeout(removePopup, 1000);
}

function listen() {
  const socket = io("/", { path: "/tts/" });

  socket.on("message", (message) => {
    console.log("GOT MESSAGE:", message);
    if (message.sender == "TalkingPanda" && message.text == "refresh") {
      location.reload();
      return;
    }
		if(message.isImportant){
			ttSay(message,true);
			if(queueInterval == null) handleQueue();
			return;
		}
    ttSay(message,false);
  });

  socket.on("skip", (user) => {
    if (user == null) {
      stopCurrentTTS();
      console.log(`Skipping current message`);
      return;
    }
    user = user.replace(/^@/, "").toLowerCase();
    console.log(`Skipping ${user}`);
    if (currentUser != null && currentUser.toLowerCase() === user)
      stopCurrentTTS();
    queue = queue.filter((message) => message.sender.toLowerCase() != user);
  });

	socket.on("pause", (pause) => {
		if(pause) {
			clearInterval(queueInterval);
			queueInterval = null;
		} else {
			queueInterval = setInterval(handleQueue, 1e3);
		}

	});

  queueInterval = setInterval(handleQueue, 1e3);
}
