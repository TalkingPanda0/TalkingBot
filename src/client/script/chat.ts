import "../chat.css";
import { io } from "socket.io-client";
import {
  formatDisplayName,
  getRandomArbitrary,
  getUserColor,
} from "../../shared/util.ts";
import { OverlayMessageData } from "../../shared/types.ts";
import {
  buildEmoteImageUrl,
  ChatMessage,
  parseChatMessage,
  parseEmoteOffsets,
  parseTwitchMessage,
} from "@twurple/chat";

type MessagePart =
  | { type: "text"; element: HTMLSpanElement }
  | { type: "img"; element: HTMLImageElement };

class EmoteWall {
  windowHeight = window.innerHeight;
  windowWidth = window.innerWidth;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  lastTimeStamp: number | null = null;
  currentEmotes: {
    img: HTMLImageElement;
    vx: number;
    vy: number;
    width: number;
    height: number;
    x: number;
    y: number;
    remainingTime: number;
  }[] = [];

  add(img: HTMLImageElement) {
    const height = 56;
    const width = height * (img.naturalWidth / img.naturalHeight);
    const reverseX = Math.random() < 0.5;
    const reverseY = Math.random() < 0.5;
    const speed =
      img.src ==
      "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0"
        ? 0.5
        : 0.25;

    this.currentEmotes.push({
      img: img,
      vx: reverseX ? -speed : speed,
      vy: reverseY ? -speed : speed,
      width: width,
      height: height,
      x: getRandomArbitrary(10 + width, this.windowWidth - width - 10),
      y: getRandomArbitrary(10 + height, this.windowHeight - height - 10),
      remainingTime: 5 * 1000,
    });
  }

  animateEmoteWall(timeStamp: number) {
    if (this.lastTimeStamp == null) {
      this.lastTimeStamp = timeStamp;
    }

    const deltaTime = timeStamp - this.lastTimeStamp;
    this.lastTimeStamp = timeStamp;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.currentEmotes.length - 1; i >= 0; --i) {
      const emote = this.currentEmotes[i];
      emote.remainingTime -= deltaTime;

      if (emote.remainingTime <= -1000) {
        this.currentEmotes[i] =
          this.currentEmotes[this.currentEmotes.length - 1];
        this.currentEmotes.pop();

        continue;
      }

      if (emote.x + emote.width >= this.canvas.width) {
        emote.vx *= -1;
        emote.x = this.canvas.width - emote.width;
      } else if (emote.x <= 0) {
        emote.vx *= -1;
        emote.x = 0;
      }

      if (emote.y + emote.height >= this.canvas.height) {
        emote.vy *= -1;
        emote.y = this.canvas.height - emote.height;
      } else if (emote.y <= 0) {
        emote.vy *= -1;
        emote.y = 0;
      }

      emote.x += emote.vx * deltaTime;
      emote.y += emote.vy * deltaTime;

      this.ctx.globalAlpha =
        emote.remainingTime > 0 ? 1.0 : 1 - emote.remainingTime / -1000;

      this.ctx.drawImage(
        emote.img,
        emote.x,
        emote.y,
        emote.width,
        emote.height,
      );
    }

    window.requestAnimationFrame((ts) => {
      this.animateEmoteWall(ts);
    });
  }

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d")!;
    window.requestAnimationFrame((ts) => {
      this.animateEmoteWall(ts);
    });
    window.addEventListener(
      "resize",
      () => {
        this.resizeCanvas();
      },
      false,
    );

    this.resizeCanvas();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
}

export type MessageCallback = (
  message: OverlayMessageData,
  messageElement: HTMLDivElement,
) => void;

export class ChatHandler {
  recentMessagesInterval: NodeJS.Timeout | null = null;
  mentionRegex = /@(\w+)/g;
  platformIcons = new Map([
    ["bot", "https://talkingpanda.dev/bot.png"],
    ["twitch", "https://twitch.tv/favicon.ico"],
    ["youtube", "https://www.youtube.com/favicon.ico"],
  ]);

  messageList: HTMLDivElement;
  disconnectList: HTMLDivElement | null = null;
  cheerEmotes = [];

  emoteWall: EmoteWall | null = null;
  showCommands: boolean;
  messageCallback: MessageCallback | null;

  constructor(
    showCommands: boolean,
    emoteWall: HTMLCanvasElement | null,
    messageList: HTMLDivElement,
    disconnectList: HTMLDivElement | null,
    messageCallback: MessageCallback | null = null,
  ) {
    this.messageCallback = messageCallback;
    this.showCommands = showCommands;
    this.messageList = messageList;
    this.disconnectList = disconnectList;

    if (emoteWall) {
      this.emoteWall = new EmoteWall(emoteWall);
    }
  }

  async getCheerEmotes() {
    this.cheerEmotes = await (await fetch("/get/cheerEmotes")).json();
  }

  listen() {
    const socket = io("/chat");

    socket.on("refresh", () => {
      window.location.reload();
    });

    socket.on("connect", () => {
      console.log("Connected");
      this.emptyDisconnectList();
      this.removeFromDisconnectList("bot");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected");
      this.emptyDisconnectList();
      this.addToDisconnectList("bot");
    });

    socket.on("message", (message) => {
      console.log("GOT MESSAGE:", message);
      this.addToMessageList(message);
    });

    socket.on("deleteMessage", (messageId) => {
      console.log("deleteMessage:", messageId);
      const messageElement = document.getElementById(messageId);
      if (messageElement) {
        messageElement.remove();
      } else {
        console.error(`Couldn't find message: ${messageId}`);
      }
    });

    socket.on("clearChat", (platform) => {
      console.log(`Clear chat for ${platform}`);
      Array.from(document.getElementsByClassName(platform)).forEach(
        (message) => {
          message.remove();
        },
      );
    });
    socket.on("banUser", (user) => {
      console.log(`banuser: ${user}`);
      Array.from(document.getElementsByClassName(user)).forEach((message) => {
        message.remove();
      });
    });
    socket.on("chatDisconnect", (chat) => {
      console.log(`Chat disconnect: ${chat}`);
      this.addToDisconnectList(chat);
    });
    socket.on("chatConnect", (chat) => {
      console.log(`Chat connect: ${chat}`);
      this.removeFromDisconnectList(chat);
    });

    socket.on("redeem", (redeem) => {
      console.log(`Got redeem ${redeem}`);
      if (document.getElementById(redeem.id)) return;
      const rewardElement = document.createElement("span");
      rewardElement.id = redeem.id;
      rewardElement.classList.add("redeem");
      rewardElement.classList.add("message");
      rewardElement.innerText = `@${redeem.user} Redeemed ${redeem.title}`;
      this.messageList.appendChild(rewardElement);
      this.messageList.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    });

    this.getRecentMessages();
  }

  addToMessageList(message: OverlayMessageData & { isOld: true | undefined }) {
    if (message.isCommand && !this.showCommands) return;

    // Don't add if it's from the bot or if a message with the same id already exits
    if (message.messageId != null && document.getElementById(message.messageId))
      return;

    if (message.isFake && this.showCommands)
      message.badges.unshift(this.platformIcons.get("bot") ?? "");
    //else message.badges.unshift(this.platformIcons[message.platform]);

    const messageElement = document.createElement("div");
    if (this.messageCallback) this.messageCallback(message, messageElement);

    const spanElement = document.createElement("span");
    messageElement.id = message.messageId;
    messageElement.classList.add("message");
    messageElement.classList.add(message.platform);
    messageElement.classList.add(message.userId);

    // message is a reply
    if (message.replyId) {
      const repliedMessageContainer = document.getElementById(message.replyId);
      const repliedMessage = repliedMessageContainer?.querySelector(".sender");

      if (repliedMessage) {
        const replyElement = document.createElement("span");
        replyElement.classList.add("reply");
        replyElement.innerHTML = `Replying to ${repliedMessage.innerHTML}`;
        messageElement.appendChild(replyElement);
        messageElement.appendChild(document.createElement("br"));
      }
    }

    if (message.highlightColor)
      messageElement.style.background = message.highlightColor;

    if (message.highlightMessage) {
      const rewardElement = document.createElement("span");
      rewardElement.classList.add("reply");
      rewardElement.innerText = message.highlightMessage;
      messageElement.appendChild(rewardElement);
      messageElement.appendChild(document.createElement("br"));
    }

    if (message.isOld) {
      messageElement.style.opacity = "75%";
    }

    const badgesElement = document.createElement("span");
    badgesElement.classList.add("badges");

    message.badges.forEach((badge: string) => {
      const badgeElement = document.createElement("img");
      badgeElement.src = badge;
      badgeElement.height = 25;
      badgeElement.classList.add("badge");
      badgesElement.appendChild(badgeElement);
    });

    const textElement = document.createElement("span");
    textElement.classList.add("sender");
    textElement.dataset.name = `${message.displayName}`.toLowerCase();
    textElement.style.color = `${message.color}`;

    textElement.innerText = message.displayName.trim();

    const textSpanElement = document.createElement("span");
    textSpanElement.classList.add("text");
    const messageParts = this.parseEmotes(
      message.message,
      message.emoteOffsets,
    );
    const firstPart = messageParts[0].type == "text" ? messageParts[0] : null;

    // If it's a reply remove the first mention
    if (firstPart && message.replyId) {
      firstPart.element.innerText = firstPart.element.innerText
        .replace(/^@(\w+)/g, "")
        .trim();
    }

    if (message.isAction) {
      if (firstPart) {
        firstPart.element.innerText = firstPart.element.innerText.replace(
          /ACTION/,
          "",
        );
      }
      messageParts
        .filter((part) => part.type == "text")
        .forEach((part) => {
          part.element.innerText = part.element.innerText.replaceAll(
            "\u0001",
            "",
          );
        });
      textSpanElement.style.color = message.color;
    } else {
      textElement.innerText += ": ";
    }

    for (const part of messageParts) {
      textSpanElement.appendChild(part.element);
    }

    textElement.appendChild(textSpanElement);
    spanElement.appendChild(badgesElement);
    spanElement.appendChild(textElement);
    messageElement.appendChild(spanElement);
    this.messageList.appendChild(messageElement);
    this.messageList.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  }

  addToDisconnectList(id: string) {
    if (id == "twitch" || id == "bot") {
      this.recentMessagesInterval = setInterval(
        this.getRecentMessages,
        1000 * 60,
      );
    }

    if (!this.disconnectList || document.getElementById(id) != null) return;

    const disconnectElement = document.createElement("img");
    disconnectElement.src = this.platformIcons.get(id)!;
    disconnectElement.classList.add("badge");
    disconnectElement.id = id;
    this.disconnectList.appendChild(disconnectElement);
  }

  removeFromDisconnectList(id: string) {
    if (id == "twitch" || id == "bot") {
      if (this.recentMessagesInterval)
        clearInterval(this.recentMessagesInterval);
      this.getRecentMessages();
    }
    const elementToRemove = document.getElementById(id);
    if (elementToRemove != null) elementToRemove.remove();
  }

  emptyDisconnectList() {
    if (this.disconnectList) this.disconnectList.innerHTML = "";
  }

  async getRecentMessages() {
    console.log("getting new messages.");
    const messages = await (
      await fetch(
        "https://recent-messages.robotty.de/api/v2/recent-messages/sweetbabooo_o?limit=10",
      )
    ).json();

    messages.messages.forEach((msg: string) => {
      if (!msg.includes("PRIVMSG")) return;
      const message = parseTwitchMessage(msg) as ChatMessage;

      const isCommand =
        message.text.startsWith("!") ||
        message.userInfo.userId === "736013381" ||
        message.userInfo.userName == "botrixoficial";
      const isAction = message.text.startsWith("\u0001ACTION");
      this.handleMessage(message, isAction, isCommand);
    });
  }

  private createRawText(text: string): HTMLSpanElement {
    const span = document.createElement("span");
    span.innerText = text;
    return span;
  }

  private createText(text: string): HTMLSpanElement {
    const span = document.createElement("span");
    let first = true;
    let currentText = [];

    for (const word of text.split(" ")) {
      const wordResult = parseWord(word);
      if (wordResult) {
        if (first) {
          span.innerText = currentText.join(" ");
          first = false;
        } else if (currentText.length != 0)
          span.appendChild(this.createRawText(currentText.join(" ")));
        currentText.length = 0;
        span.appendChild(wordResult.element);
        if(wordResult.leftOver) currentText.push(wordResult.leftOver);
        continue;
      }

      currentText.push(word);
    }
    if (currentText.length != 0)
      span.appendChild(this.createRawText(currentText.join(" ")));

    return span;
  }

  private createEmote(emoteId: string): HTMLImageElement {
    const image = document.createElement("img");

    image.classList.add("emote");

    image.onload = (event) => {
      if (event != null && this.emoteWall)
        this.emoteWall.add(event.target as HTMLImageElement);
      this.messageList.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    };

    image.src = buildEmoteImageUrl(emoteId, {
      size: "3.0",
      backgroundType: "dark",
      animationSettings: "default",
    });

    return image;
  }

  private parseEmotes(
    text: string,
    emoteOffsets: string | null,
  ): MessagePart[] {
    const parsedOffsets = parseEmoteOffsets(emoteOffsets ?? undefined);

    if (parsedOffsets.size == 0) {
      return [{ type: "text", element: this.createText(text) }];
    }
    const result: MessagePart[] = [];
    const parsedParts = parseChatMessage(text, parsedOffsets, this.cheerEmotes);

    parsedParts.forEach((parsedPart) => {
      switch (parsedPart.type) {
        case "text":
          result.push({
            type: "text",
            element: this.createText(parsedPart.text),
          });
          break;

        case "emote":
          result.push({
            type: "img",
            element: this.createEmote(parsedPart.id),
          });

          break;
      }
    });
    return result;
  }

  private async handleMessage(
    msg: ChatMessage,
    isAction: boolean,
    isCommand: boolean,
  ) {
    this.addToMessageList({
      platform: "twitch",
      displayName: formatDisplayName(msg),
      userId: msg.userInfo.userId,
      replyId: msg.parentMessageId,
      messageId: msg.id,
      color: getUserColor(msg.userInfo),
      message: msg.text,
      emoteOffsets: msg.tags.get("emotes") ?? null,
      highlightMessage: null,
      highlightColor: msg.isHighlight ? "#755ebc" : null,
      isAction,
      isCommand,
      isFake: false,
      isOld: true,
      timestamp: 0,
      badges: [],
    });
  }
}

// Recives one word
type Parser = (
  input: string,
) => { element: HTMLElement; leftOver: string } | null;
const parsers: Parser[] = [parseMentions];

function parseWord(
  input: string,
): { element: HTMLElement; leftOver: string } | null {
  console.log("parsing " + input);
  for (const parser of parsers) {
    const result = parser(input);
    if (result) {
      return result;
    }
  }
  return null;
}

function parseMentions(
  input: string,
): { element: HTMLElement; leftOver: string } | null {
  if (!input.startsWith("@")) return null;

  let username = input.substring(1);

  const end = username.search(/\W/);
  let leftOver = "";
  if (end != -1) {
    leftOver = username.substring(end);
    username = username.substring(0, end);
  }
  const elements = document.querySelectorAll(
    `[data-name="${username.toLowerCase()}"]`,
  );
  if (elements.length == 0) {
    return null;
  }

  const element = document.createElement("span");
  element.innerText = ` @${username}` + (leftOver ? "" : " ");

  const targetElement = elements[elements.length - 1] as HTMLDivElement;

  element.style.color = targetElement.style.color;

  return { element, leftOver };
}
