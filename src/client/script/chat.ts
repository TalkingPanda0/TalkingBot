import "../chat.css";
import { io } from "socket.io-client";
import {
  formatDisplayName,
  getRandomArbitrary,
  getUserColor,
} from "../../shared/util.ts";
import { ChatMetaData, Clip, OverlayMessageData } from "../../shared/types.ts";
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

// Recives one word
type ParserResult = { result: MessagePart; leftOver: string } | null;
type Parser = (input: string) => ParserResult;
export type MessageCallback = (
  message: OverlayMessageData,
  messageElement: HTMLDivElement,
) => void;

interface BTTVEmote {
  id: string;
  code: string;
}

interface BTTVUserInfo {
  channelEmotes: BTTVEmote[];
  sharedEmotes: BTTVEmote[];
}

interface SevenTVEmote {
  id: string;
  name: string;
}

interface EmoteSetUpdate {
  type: "emote_set.update";
  body: {
    pushed?: { value: { id: string; name: string } }[];
    pulled?: { old_value: { id: string; name: string } }[];
  };
}

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
  cheerEmotes: string[] = [];
  channelId?: string;
  extraEmotes: Map<string, string> = new Map();

  parsers: Parser[] = [this.parseMentions, this.parseExtraEmotes];
  emoteWall: EmoteWall | null = null;
  showCommands: boolean;
  chatInfoPromise: Promise<void>;
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
    this.chatInfoPromise = this.getChatInfo();
  }

  async getChatInfo() {
    const info: ChatMetaData = await (await fetch("/get/chatInfo")).json();
    this.cheerEmotes = info.cheerEmotes;
    this.channelId = info.channelId;
    await Promise.all([this.getBttvEmotes(), this.get7TvEmotes()]);
  }

  async getBttvEmotes() {
    const channelInfo: BTTVUserInfo = await (
      await fetch(
        `https://api.betterttv.net/3/cached/users/twitch/${this.channelId}`,
      )
    ).json();
    const globalEmotes: BTTVEmote[] = await (
      await fetch("https://api.betterttv.net/3/cached/emotes/global")
    ).json();

    function getBttvEmote(id: string) {
      return `https://cdn.betterttv.net/emote/${id}/1x`;
    }

    channelInfo.channelEmotes.forEach((value) => {
      this.extraEmotes.set(value.code, getBttvEmote(value.id));
    });

    channelInfo.sharedEmotes.forEach((value) => {
      this.extraEmotes.set(value.code, getBttvEmote(value.id));
    });

    globalEmotes.forEach((value) => {
      this.extraEmotes.set(value.code, getBttvEmote(value.id));
    });
  }

  listenTo7tvEvents(id: string) {
    const url = `https://events.7tv.io/v3@emote_set.update<object_id=${id}>`;
    const source = new EventSource(url);

    source.addEventListener("dispatch", (event) => {
      const data: EmoteSetUpdate = JSON.parse(event.data);
      if (data.body.pushed) {
        for (const { value: emote } of data.body.pushed) {
          this.extraEmotes.set(emote.name, get7TvEmote(emote.id));
        }
      }

      if (data.body.pulled) {
        for (const {
          old_value: { name: emote },
        } of data.body.pulled) {
          this.extraEmotes.delete(emote);
        }
      }
    });
  }

  async get7TvEmotes() {
    const globalEmotes: { emotes: SevenTVEmote[] } = await (
      await fetch("https://api.7tv.app/v3/emote-sets/global")
    ).json();

    globalEmotes.emotes.forEach((value) => {
      this.extraEmotes.set(value.name, get7TvEmote(value.id));
    });

    const result = await fetch(
      `https://api.7tv.app/v3/users/twitch/${this.channelId}`,
    );

    if (!result.ok) {
      return;
    }

    const channel: { emote_set: { id: string; emotes: SevenTVEmote[] } } =
      await result.json();

    channel.emote_set.emotes.forEach((value) => {
      this.extraEmotes.set(value.name, get7TvEmote(value.id));
    });

    this.listenTo7tvEvents(channel.emote_set.id);
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

    socket.on("message", async (message) => {
      console.log("GOT MESSAGE:", message);
      await this.addToMessageList(message);
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

  async addToMessageList(
    message: OverlayMessageData & { isOld: true | undefined },
  ) {
    if (message.isCommand && !this.showCommands) return;

    // Don't add if it's from the bot or if a message with the same id already exits
    if (message.messageId != "" && document.getElementById(message.messageId))
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

    const senderElement = document.createElement("span");
    senderElement.classList.add("sender");
    senderElement.dataset.name = `${message.displayName}`.toLowerCase();
    senderElement.style.color = `${message.color}`;

    senderElement.innerText = message.displayName.trim();

    if (message.gif) {
      const gifElement = document.createElement("img");
      gifElement.classList.add("gif");
      gifElement.src = message.gif;

      gifElement.onload = () => {
        this.messageList.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });
      };

      senderElement.innerText += ":";

      spanElement.appendChild(badgesElement);
      spanElement.appendChild(senderElement);
      messageElement.appendChild(spanElement);
      messageElement.appendChild(document.createElement("br"));
      messageElement.appendChild(gifElement);

      this.messageList.appendChild(messageElement);

      return;
    }

    const textElement = document.createElement("span");
    textElement.classList.add("text");
    const messageParts = this.parseMessages(
      message.message,
      message.emoteOffsets,
    );
    const firstPart = messageParts[0].type == "text" ? messageParts[0] : null;

    // If it's a reply remove the first mention
    if (firstPart && message.replyId)
      firstPart.element.innerText = firstPart.element.innerText
        .trim()
        .replace(/^@(\w+)/g, "")
        .trim();

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
      textElement.style.color = message.color;
    } else {
      senderElement.innerText += ": ";
    }

    for (const part of messageParts) {
      textElement.appendChild(part.element);
    }

    senderElement.appendChild(textElement);

    spanElement.appendChild(badgesElement);
    spanElement.appendChild(senderElement);
    messageElement.appendChild(spanElement);

    if (message.clip) messageElement.appendChild(this.createClip(message.clip));

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
    await this.chatInfoPromise;
    console.log("getting new messages.");
    const messages = await (
      await fetch(
        "https://recent-messages.robotty.de/api/v2/recent-messages/sweetbabooo_o?limit=10",
      )
    ).json();

    for (const msg of messages.messages) {
      if (!msg.includes("PRIVMSG")) return;
      const message = parseTwitchMessage(msg) as ChatMessage;

      const isCommand =
        message.text.startsWith("!") ||
        message.userInfo.userId === "736013381" ||
        message.userInfo.userName == "botrixoficial";
      const isAction = message.text.startsWith("\u0001ACTION");
      await this.handleMessage(message, isAction, isCommand);
    }
  }

  private createRawText(text: string): HTMLSpanElement {
    const span = document.createElement("span");
    span.innerText = text;
    return span;
  }

  private createText(text: string): MessagePart[] {
    let firstElement = true;
    let currentText = [];

    const parts: MessagePart[] = [];

    for (const word of text.split(" ")) {
      const wordResult = this.parseWord(word);
      if (wordResult) {
        //if (firstElement) span.innerText = currentText.join(" ");
        if (currentText.length != 0)
          parts.push({
            type: "text",
            element: this.createRawText(currentText.join(" ")),
          });

        firstElement = false;
        currentText.length = 0;
        parts.push(wordResult.result);

        if (wordResult.leftOver) currentText.push(wordResult.leftOver);
        continue;
      }

      currentText.push(word);
    }
    if (currentText.length != 0)
      parts.push({
        type: "text",
        element: this.createRawText(currentText.join(" ")),
      });
    return parts;
  }

  private createClip(clip: Clip): HTMLElement {
    const clipElement = document.createElement("a");
    clipElement.target = "_blank";
    clipElement.href = clip.url;
    clipElement.classList.add("clip");

    const clipThumbnail = document.createElement("img");
    clipThumbnail.width = 80;
    clipThumbnail.height = 45;
    clipThumbnail.src = clip.thumbnailUrl;

    clipElement.appendChild(clipThumbnail);

    clipElement.innerHTML += `${clip.title} <br /> Clipped by ${clip.creator}`;

    return clipElement;
  }

  private createEmote(emoteId: string): HTMLImageElement {
    return this.createEmoteUrl(
      buildEmoteImageUrl(emoteId, {
        size: "3.0",
        backgroundType: "dark",
        animationSettings: "default",
      }),
    );
  }

  private createEmoteUrl(url: string): HTMLImageElement {
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

    image.src = url;

    return image;
  }

  private parseMessages(
    text: string,
    emoteOffsets: string | null,
  ): MessagePart[] {
    const parsedOffsets = parseEmoteOffsets(emoteOffsets ?? undefined);

    if (parsedOffsets.size == 0) {
      return this.createText(text);
    }

    const result: MessagePart[] = [];
    const parsedParts = parseChatMessage(text, parsedOffsets, this.cheerEmotes);

    for (const parsedPart of parsedParts) {
      switch (parsedPart.type) {
        case "text":
          result.push(...this.createText(parsedPart.text));
          break;

        case "emote":
          result.push({
            type: "img",
            element: this.createEmote(parsedPart.id),
          });
          break;
      }
    }

    return result;
  }

  private async handleMessage(
    msg: ChatMessage,
    isAction: boolean,
    isCommand: boolean,
  ) {
    await this.addToMessageList({
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
  parseWord(input: string): ParserResult {
    for (const parser of this.parsers) {
      const result = parser.bind(this)(input);
      if (result) {
        return result;
      }
    }
    return null;
  }

  parseMentions(
    input: string,
  ): { result: MessagePart; leftOver: string } | null {
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

    return { result: { type: "text", element }, leftOver };
  }
  parseExtraEmotes(
    input: string,
  ): { result: MessagePart; leftOver: string } | null {
    const emote = this.extraEmotes.get(input);
    if (!emote) return null;
    return {
      result: { type: "img", element: this.createEmoteUrl(emote) },
      leftOver: "",
    };
  }
}
function get7TvEmote(id: string) {
  return `https://cdn.7tv.app/emote/${id}/1x.webp`;
}
