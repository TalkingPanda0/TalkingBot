let queue = [];
let isPlaying = false;
let playing;
let currentUser;
let interval;
let queueInterval;

let soundEffectRegex;
fetch("/soundEffects").then((res) =>
  res.json().then((sounds) => {
    soundEffectRegex = new RegExp(
      `(${sounds.map((sound) => sound.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|")})`,
      "g",
    );
  }),
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

    audioQueue.push(new Audio(encodeURIComponent(`${match[0]}.mp3`)));
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
