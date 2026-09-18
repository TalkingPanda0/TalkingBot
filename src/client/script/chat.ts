import { io } from "socket.io-client";
import {
  formatDisplayName,
  getRandomArbitrary,
  getUserColor,
} from "../../shared/util.ts";
import { MessageData } from "../../shared/types.ts";
import {
  buildEmoteImageUrl,
  ChatMessage,
  ChatViewerMilestoneInfo,
  parseChatMessage,
  parseTwitchMessage,
} from "@twurple/chat";

declare global {
  interface Window {
    emoteLoaded: Function;
  }
}

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
  message: MessageData,
  messageElement: HTMLDivElement,
) => void;

export class ChatHandler {
  recentMessagesInterval: NodeJS.Timeout | null = null;
  mentionRegex = /@(\w+)/g;
  platformIcons = {
    bot: "https://talkingpanda.dev/bot.png",
    twitch: "https://twitch.tv/favicon.ico",
    youtube: "https://www.youtube.com/favicon.ico",
  };

  messageList: HTMLDivElement;
  disconnectList: HTMLDivElement | null = null;

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
    window.emoteLoaded = (event: { target: HTMLImageElement }) => {
      if (event != null && this.emoteWall) this.emoteWall.add(event.target);
      messageList.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    };
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

    socket.on("milestone", (milestone) => {
      console.log("GOT MILESTONE: ", milestone);
      this.handleMilestone(
        milestone.color,
        milestone.displayName,
        milestone.info,
        milestone.badges,
        milestone.parsedMessage,
      );
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
      rewardElement.innerHTML = `@${redeem.user} Redeemed ${redeem.title}`;
      this.messageList.appendChild(rewardElement);
      this.messageList.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    });

    this.getRecentMessages();
  }

  addToMessageList(message: MessageData) {
    if (message.isCommand && !this.showCommands) return;

    // Don't add if a message with the same id already exits or if it's from the bot
    if (message.id !== undefined && document.getElementById(message.id)) return;

    if (message.isFake && this.showCommands)
      message.badges.unshift(this.platformIcons["bot"]);
    else message.badges.unshift(this.platformIcons[message.platform]);

    const messageElement = document.createElement("div");
    if(this.messageCallback) this.messageCallback(message,messageElement);

    const spanElement = document.createElement("span");
    if (message.isFirst)
      messageElement.style.background = "rgba(176, 11, 105, 0.5)";
    messageElement.id = message.id;
    messageElement.classList.add("message");
    messageElement.classList.add(message.platform);
    messageElement.classList.add(message.senderId);
    // message is a reply
    if (message.replyTo != null && message.replyTo != "") {
      let replyColor = "#a5a5a5";
      const messagesOfParentSender = document.querySelectorAll(
        `.${message.replyId} .sender`,
      );

      if (messagesOfParentSender.length != 0)
        replyColor = (
          messagesOfParentSender[
            messagesOfParentSender.length - 1
          ] as HTMLDivElement
        ).style.color;

      const replyElement = document.createElement("span");
      replyElement.classList.add("reply");
      replyElement.innerHTML = `Replying to <span class="reply" style="color:${replyColor}">@${message.replyTo}:</span> ${message.replyText}`;
      messageElement.appendChild(replyElement);
      messageElement.appendChild(document.createElement("br"));
    }
    if (message.rewardName) {
      const rewardElement = document.createElement("span");
      rewardElement.classList.add("reply");
      rewardElement.innerHTML = `Redeemed ${message.rewardName}`;
      messageElement.appendChild(rewardElement);
      messageElement.appendChild(document.createElement("br"));
      if (message.rewardName.toLowerCase() === "highlight my message")
        messageElement.style.background = "#755ebc";
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
    textElement.dataset.name =
      `${message.platform}-${message.username}`.toLowerCase();
    textElement.style.color = `${message.color}`;
    let text = message.parsedMessage.trim();

    text = text.replaceAll(
      this.mentionRegex,
      (mention: string, user: string) => {
        const nameTag = `${message.platform}-${user}`.toLowerCase();
        const elements = document.querySelectorAll(`[data-name="${nameTag}"]`);
        if (elements.length == 0) {
          return mention;
        }

        const targetElement = elements[elements.length - 1] as HTMLDivElement;
        const color = targetElement.style.color;
        return `<span style="color:${color}">${mention}</span>`;
      },
    );
    const faceChars = [
      ")",
      "(",
      "3",
      "}",
      "{",
      "@",
      "[",
      "]",
      "D",
      "O",
      "/",
      "\\",
      "$",
      "X",
      "&",
      "E",
      "P",
      "p",
      "b",
    ];
    const firstChar = text.charAt(0);
    if (firstChar != null && faceChars.includes(firstChar))
      textElement.innerHTML = `${message.sender.trim()}<span class="text">: ${text}</span>`;
    else if (message.isAction) {
      text = text.replace(/ACTION/, "").replaceAll("\u0001", "");
      textElement.innerHTML = `${message.sender.trim()}<span class="text" style='color: ${message.color}'> ${text}</span>`;
    } else
      textElement.innerHTML = `${message.sender.trim()}:<span class="text"> ${text}</span>`;

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

  handleMilestone(
    color: string,
    userName: string,
    info: ChatViewerMilestoneInfo,
    badges: string[],
    parsedMessage: string,
  ) {
    if (info.categoryName != "watch-streak") return;

    const messageElement = document.createElement("div");
    const spanElement = document.createElement("span");
    messageElement.style.background = "rgba(11, 176, 129,0.5)";
    messageElement.classList.add("message");

    const badgesElement = document.createElement("span");
    badgesElement.classList.add("badges");
    badges.forEach((badge) => {
      const badgeElement = document.createElement("img");
      badgeElement.src = badge;
      badgeElement.height = 25;
      badgeElement.classList.add("badge");
      badgesElement.appendChild(badgeElement);
    });

    const milestoneElement = document.createElement("span");
    milestoneElement.innerHTML = `Reached ${info.value} stream watch streak!`;
    const textElement = document.createElement("span");
    textElement.classList.add("sender");
    textElement.style.color = `${color}`;

    spanElement.appendChild(badgesElement);
    if (parsedMessage) {
      milestoneElement.classList.add("reply");
      textElement.innerHTML = `${userName}:<span class="text"> ${parsedMessage}</span>`;
      spanElement.appendChild(textElement);
      messageElement.appendChild(milestoneElement);
      messageElement.appendChild(document.createElement("br"));
      messageElement.appendChild(spanElement);
    } else {
      textElement.innerHTML = `${userName} `;
      spanElement.appendChild(textElement);
      messageElement.appendChild(spanElement);
      milestoneElement.style.verticalAlign = "middle";
      messageElement.appendChild(milestoneElement);
    }

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
    disconnectElement.src = this.platformIcons[id];
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
      this.handleMessage(
        message.userInfo.userName,
        message,
        isAction,
        true,
        isCommand,
      );
    });
  }
  private parseEmotes(text: string, emoteOffsets: Map<string, string[]>) {
    let parsed = "";
    const parsedParts = parseChatMessage(text, emoteOffsets, []);

    parsedParts.forEach((parsedPart) => {
      switch (parsedPart.type) {
        case "text":
          parsed += parsedPart.text;
          break;

        case "emote":
          const emoteUrl = buildEmoteImageUrl(parsedPart.id, {
            size: "3.0",
            backgroundType: "dark",
            animationSettings: "default",
          });
          parsed += ` <img onload="emoteLoaded()" src="${emoteUrl}" class="emote" id="${parsedPart.id}"> `;
          break;
      }
    });
    return parsed;
  }
  private async handleMessage(
    user: string,
    msg: ChatMessage,
    isAction: boolean,
    isOld: boolean,
    isCommand: boolean,
  ) {
    let parsedMessage = this.parseEmotes(msg.text, msg.emoteOffsets);

    let badges = [];

    let replyTo: string | null = null;
    let replyId: string | null = null;
    let replyText: string | null = null;
    let rewardName: string | null = null;
    if (msg.isReply) {
      parsedMessage = parsedMessage.replace(
        new RegExp(`^@${msg.parentMessageUserDisplayName}`, "i"),
        "",
      );
      replyTo = msg.parentMessageUserDisplayName;
      replyId = `twitch-${msg.parentMessageUserId}`;
      replyText = msg.parentMessageText;
    }

    if (msg.isHighlight) {
      rewardName = "Highlight My message";
    }

    const indexes: number[] = [];
    msg.emoteOffsets.forEach((emote) => {
      emote.forEach((index: string) => {
        indexes.push(parseInt(index));
      });
    });

    const isUserMod = msg.userInfo.isMod || msg.userInfo.isBroadcaster;
    const isUserVip = isUserMod || msg.userInfo.isVip;
    const isUserSub = isUserVip || msg.userInfo.isSubscriber;

    let message = {
      badges: badges.filter((s) => !!s),
      username: msg.userInfo.userName,
      sender: formatDisplayName(msg),
      senderId: msg.userInfo.userId,
      color: getUserColor(msg.userInfo),
      isUserMod: isUserMod,
      isUserSub: isUserSub,
      isUserVip: isUserVip,
      platform: "twitch",
      channelId: msg.channelId || "",
      parsedMessage: parsedMessage,
      isFirst: msg.isFirst,
      replyText: replyText ?? undefined,
      replyId: replyId ?? undefined,
      replyTo: replyTo ?? undefined,
      rewardName: rewardName ?? undefined,
      isOld: isOld,
      isAction: isAction,
      isCommand:
        isCommand || user == "botrixoficial" || user == "talkingboto_o",
      id: `twitch-${msg.id}`,
    };
    this.addToMessageList(message);
  }
}
