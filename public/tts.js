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
  // User needss to interact with the page.

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
function playQueue(audioQueue, onerror, onended) {
  if (audioQueue == null || audioQueue.length == 0) return;
  const audio = audioQueue.shift();
  playing = audio;

  audio.onerror = (err) => {
    console.log("Got error: " + err);
    isPlaying = false;
    clearInterval(interval);
    interval = null;

    playing = null;
    onerror(err);
  };

  audio.onended = () => {
    if (audioQueue.length == 0) {
      playing = null;
      isPlaying = false;
      clearInterval(interval);
      interval = null;
      onended();
      return;
    } else {
      playQueue(audioQueue, onerror, onended);
    }
  };

  audio.play().catch((err) => {
    playing = null;
    isPlaying = false;
    clearInterval(interval);
    interval = null;
    console.error(err);
    onerror(err);
  });
}
function playTTS(message, voice, onerror, onended) {
  const audioQueue = [];

  let match;
  let lastIndex = 0;
  while ((match = soundEffectRegex.exec(message)) !== null) {
    const beforeEmote = getTTSAudio({
      voice: voice,
      text: message.slice(lastIndex, match.index),
    });
    if (beforeEmote) audioQueue.push(beforeEmote);

    audioQueue.push(new Audio(emoteSoundEffects.get(match[0])));
    lastIndex = match.index + match[0].length;
  }
  const afterLastEmote = getTTSAudio({
    voice: voice,
    text: message.slice(lastIndex),
  });
  if (afterLastEmote) audioQueue.push(afterLastEmote);

  console.log(audioQueue);
  console.log(`Found ${audioQueue.length} segments.`);

  playQueue(audioQueue, onerror, onended);
}
