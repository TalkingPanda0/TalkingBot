import { TTSEvent } from "../../shared/types.ts";
import { TTSHandler } from "./tts.ts";
import { io } from "socket.io-client";

const messageList = document.getElementById("message-list") as HTMLDivElement;

const tts = new TTSHandler();

let interval: NodeJS.Timeout | null = null;
let queue: TTSEvent[] = [];
let currentUser: string | null = null;

function handleQueue() {
  if (queue.length === 0 || tts.isPlaying || messageList.childElementCount != 0)
    return;

  const message = queue.shift();
  if (message == null) return;

  // Stop the TTS after 20 seconds
  setTimeout(() => {
    stopCurrentTTS();
  }, 20 * 1000);

  createPopup(message);
  currentUser = message.sender;
  tts.playAudioList(message.audioList, () => {
    setTimeout(removePopup, 10000);
  });
  return;
}

function addToQueue(message: TTSEvent, isImportant: boolean) {
  if (isImportant) queue.unshift(message);
  else queue.push(message);
}

function stopCurrentTTS() {
  tts.stopPlaylist();
  setTimeout(removePopup, 1000);
}

function listen() {
  const socket = io("/tts");

  socket.on("refresh", () => {
    window.location.reload();
  });

  socket.on("message", (message: TTSEvent) => {
    console.log("GOT MESSAGE:", message);
    if (message.isImportant) {
      addToQueue(message, true);
      if (interval == null) handleQueue();
      return;
    }

    addToQueue(message, false);
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
    queue = queue.filter(
      (message) => message.sender.toLowerCase() != user,
    );
  });

  socket.on("pause", (pause) => {
    if (pause && interval) {
      clearInterval(interval);
      interval = null;
    } else {
      interval = setInterval(handleQueue, 1e3);
    }
  });

  interval = setInterval(handleQueue, 1e3);
}

function createPopup(message: TTSEvent) {
  const popupElement = `<span class="sender"><span style="color: ${message.color}">${message.sender}</span> says:</span><br/><span class="text">${message.parsedText}</span class="text"></span><div></div>`;
  messageList.innerHTML = popupElement;
  messageList.style.opacity = "1";
}

function removePopup() {
  messageList.style.opacity = "0";
  currentUser = null;
  setTimeout(() => {
    messageList.innerHTML = "";
  }, 1e3);
}

listen();
