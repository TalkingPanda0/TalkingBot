const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

async function loadBuffer(url) {
  const resp = await fetch(url);
  const arrayBuf = await resp.arrayBuffer();
  return await audioCtx.decodeAudioData(arrayBuf);
}

async function playPlaylist(urls) {
  const buffers = await Promise.all(urls.map(loadBuffer));

  let when = audioCtx.currentTime;
  let endedCount = 0;

  return new Promise((resolve) => {
    buffers.forEach((buffer) => {
      const src = audioCtx.createBufferSource();
      src.buffer = buffer;
      src.connect(audioCtx.destination);

      src.start(when);

      src.onended = () => {
        endedCount++;
        if (endedCount === buffers.length) {
          resolve(); // All tracks finished!
        }
      };

      when += buffer.duration;
    });
  });
}

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

function getTTSAudioSource(message) {
  if (
    message.voice == null ||
    message.voice == "" ||
    message.text == null ||
    message.text == ""
  )
    return null;
  return `https://api.streamelements.com/kappa/v2/speech?voice=${message.voice}&text=${encodeURIComponent(message.text)}`;
}

function getTTSAudio(message) {
  const source = getTTSAudioSource(message);
  if (source == null) return null;

  return new Audio(source);
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
function playTTS(message, voice, _onerror, onended) {
  const audioQueue = []; // as urls of the audios

  let match;
  let lastIndex = 0;
  while ((match = soundEffectRegex.exec(message)) !== null) {
    const beforeEmote = getTTSAudioSource({
      voice: voice,
      text: message.slice(lastIndex, match.index),
    });
    if (beforeEmote) audioQueue.push(beforeEmote);

    audioQueue.push(encodeURIComponent(`${match[0]}.mp3`));
    lastIndex = match.index + match[0].length;
  }
  const afterLastEmote = getTTSAudioSource({
    voice: voice,
    text: message.slice(lastIndex),
  });
  if (afterLastEmote) audioQueue.push(afterLastEmote);

  console.log(audioQueue);
  console.log(`Found ${audioQueue.length} segments.`);
  playPlaylist(audioQueue).then(() => {
    onended();
  });
}
