import { ChatControl } from "../../../shared/types.ts";
import { ChatHandler } from "../../script/chat.ts";

declare global {
  interface Window {
    sendMessage: Function;
  }
}

const badges = new Map([
  ["Youtube Moderator", "/ytmod.svg"],
  [
    "Twitch Moderator",
    "https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/3",
  ],
  [
    "Twitch Tier 1 Sub",
    "https://static-cdn.jtvnw.net/badges/v1/d945f08c-f244-4207-974b-3909d5732d63/3",
  ],
  [
    "Twitch Tier 3 Sub",
    "https://static-cdn.jtvnw.net/badges/v1/6d959692-22a6-4a66-83e9-10f4de1cf9c2/3",
  ],
  [
    "Twitch Vip",
    "https://static-cdn.jtvnw.net/badges/v1/b817aba4-fad8-49e2-b88a-7cc744dfa6ec/3",
  ],
  ["HAPBOO", "https://talkingpanda.dev/hapboo.gif"],
]);

const dropdownToggle = document.querySelector(
  ".dropdown-toggle",
) as HTMLDivElement;
const dropdownMenu = document.querySelector(".dropdown-menu") as HTMLDivElement;

badges.forEach((_, key) => {
  const label = document.createElement("label");
  label.innerHTML = `<input type="checkbox" value="${key}" /> ${key}`;
  dropdownMenu.appendChild(label);
});

dropdownToggle.addEventListener("click", () => {
  dropdownMenu.classList.toggle("show");
});

// Close dropdown if clicked outside
document.addEventListener("click", (event) => {
  if (
    event.target &&
    !dropdownToggle.contains(event.target as Node) &&
    !dropdownMenu.contains(event.target as Node)
  ) {
    dropdownMenu.classList.remove("show");
  }
});

async function sendToControl(request: ChatControl) {
  const body = JSON.stringify(request);
  const response = await fetch("/api/overlay", {
    method: "POST",
    body: body,
  });
  console.log(await response.text());
  if (response.status == 403) window.location.replace("/control");
}
const messageList = document.getElementById("message-list") as HTMLDivElement;
const disconnectList = document.getElementById(
  "disconnect-list",
) as HTMLDivElement;

const platformInput = document.getElementById(
  "platform-input",
) as HTMLInputElement;
const nameInput = document.getElementById("name-input") as HTMLInputElement;
const colorInput = document.getElementById("color-input") as HTMLInputElement;
const messageInput = document.getElementById(
  "message-input",
) as HTMLInputElement;
const commandInput = document.getElementById(
  "command-input",
) as HTMLInputElement;

colorInput.onkeyup = () => {
  colorInput.style.color = "";
  colorInput.style.color = colorInput.value;
};

messageInput.onkeyup = (e) => {
  if (e.key == "Enter") sendMessage();
};

function sendMessage() {
  const platform = platformInput.value;
  const color = colorInput.value;
  const text = messageInput.value;
  const user = nameInput.value;
  const command = commandInput.checked;
  const badgeList = Array.prototype.map.call(
    dropdownMenu.querySelectorAll('input[type="checkbox"]:checked'),
    (value: { value: string }) => badges.get(value.value),
  );
  const message = {
    badges: badgeList,
    sender: user,
    senderId: user,
    color: color,
    isUserMod: false,
    platform: platform,
    message: text,
    parsedMessage: text,
    isFirst: false,
    replyText: "",
    replyId: "twitch-",
    replyTo: "",
    rewardName: "",
    isOld: false,
    isCommand: command,
    id: `bot-${Math.random().toString(36).substring(2)}`,
    isFake: true,
  };
  sendToControl({
    overlay: "chat",
    target: "message",
    message: message,
  });
}
window.sendMessage = sendMessage;

const chatHandler = new ChatHandler(true, null, messageList, disconnectList);
chatHandler.listen();
