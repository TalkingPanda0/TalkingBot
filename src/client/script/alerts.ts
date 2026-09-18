import { AlertEvent, BitsAlert, DiscordJoinAlert, FollowAlert, KofiAlert, SubAlert } from "../../shared/types.ts";
import { TTSHandler } from "./tts.ts";
import { io } from "socket.io-client";

const alertQueue: AlertEvent[] = [];
const alertElement = document.getElementById("alert") as HTMLDivElement;

const searchParams = new URLSearchParams(window.location.search);
const silent = searchParams.has("silent");

const tts = new TTSHandler();
let alertPlaying = false;

function handleQueue() {
  if (tts.isPlaying || alertPlaying || alertQueue.length == 0) return;
  const alert = alertQueue.shift();
  if(!alert) return;

  switch(alert.type) {
    case "followAlert":
      followAlert(alert);
      break;
    case "bitsAlert":
      bitsAlert(alert);
      break;
    case "subAlert":
      subAlert(alert);
      break;
    case "discordJoinAlert":
      discordJoinAlert(alert);
      break;
    case "kofiAlert":
      kofiAlert(alert);
      break;
    default:
      return;
  }
}

function discordJoinAlert(event: DiscordJoinAlert & {audioList: string[]}) {
  alertPlaying = true;
  alertElement.innerHTML = ` <img class="follow" height="1000" src="/follow.gif" /><br/><span class="text" ><span class="sender">${event.member} </span>just joined the fish tank.</span> `;
  alertElement.style.opacity = "100%";
  if (silent) {
    setTimeout(() => {
      alertElement.style.opacity = "0%";
      setTimeout(() => {
        alertElement.innerHTML = "";
        alertElement.style.display = "inline-block";
        alertPlaying = false;
      }, 1000);
    }, 10 * 1000);
  } else {
    tts.playAudioList(event.audioList, () => {
      setTimeout(() => {
        alertElement.style.opacity = "0%";
        setTimeout(() => {
          alertElement.innerHTML = "";
          alertPlaying = false;
        }, 1000);
      }, 4000);
    });
  }
}
function followAlert(followInfo: FollowAlert & {audioList: string[]}) {
  alertPlaying = true;
  alertElement.innerHTML = ` <img class="follow" height="1000" src="/follow.gif" /><br/><span class="text" ><span class="sender">${followInfo.follower} </span>just followed</span> `;
  alertElement.style.opacity = "100";
  if (silent) {
    setTimeout(() => {
      alertElement.style.opacity = "0%";
      setTimeout(() => {
        alertElement.innerHTML = "";
        alertElement.style.display = "inline-block";
        alertPlaying = false;
      }, 1000);
    }, 10 * 1000);
  } else {
    tts.playAudioList(followInfo.audioList, () => {
      setTimeout(() => {
        alertElement.style.opacity = "0%";
        setTimeout(() => {
          alertElement.innerHTML = "";
          alertPlaying = false;
        }, 1000);
      }, 4000);
    });
  }
}
function bitsAlert(cheerInfo: BitsAlert & {audioList: string[]}) {
  alertPlaying = true; 
  alertElement.innerHTML = ` <img class="follow" height="1000" src="/follow.gif" /><br/><span class="text" ><span class="sender">${cheerInfo.user} </span>cheered ${cheerInfo.bits} ${cheerInfo.bits > 1 ? "bits" : "bit"}</span> `;
  alertElement.style.opacity = "100%";
  if (silent) {
    setTimeout(() => {
      alertElement.style.opacity = "0%";
      setTimeout(() => {
        alertElement.innerHTML = "";
        alertElement.style.display = "inline-block";
        alertPlaying = false;
      }, 1000);
    }, 10 * 1000);
  } else {
    tts.playAudioList(cheerInfo.audioList, () => {
      alertElement.style.opacity = "0%";
      setTimeout(() => {
        alertElement.innerHTML = "";
        alertPlaying = false;
      }, 1000);
    });
  }
}
function kofiAlert(paymentInfo: KofiAlert & {audioList: string[]}) {
  alertPlaying = true;
  const message = paymentInfo.is_subscription
    ? `became a ${paymentInfo.tier_name != null ? paymentInfo.tier_name : paymentInfo.amount + " " + paymentInfo.currency} member!`
    : `donated ${paymentInfo.amount} ${paymentInfo.currency}!`;
  alertElement.innerHTML = ` <img class="follow" height="1000" src="/follow.gif" /><br/><span class="text" ><span class="sender">${paymentInfo.sender} </span>${message} </span> `;
  alertElement.style.opacity = "100%";
  if (silent) {
    setTimeout(() => {
      alertElement.style.opacity = "0%";
      setTimeout(() => {
        alertElement.innerHTML = "";
        alertElement.style.display = "inline-block";
        alertPlaying = false;
      }, 1000);
    }, 10 * 1000);
  } else {
    tts.playAudioList(paymentInfo.audioList, () => {
      alertElement.style.opacity = "0%";
      setTimeout(() => {
        alertElement.innerHTML = "";
        alertPlaying = false;
      }, 1000);
    });
  }
}

function subAlert(subInfo: SubAlert & {audioList: string[] , messageAudioList: string[] | null}) {
  alertPlaying = true;
  let tier = "";

  switch (subInfo.plan) {
    case "Prime":
      tier = "with Prime";
      break;
    case "1000":
      tier = "at Tier 1";
      break;
    case "2000":
      tier = "at Tier 2";
      break;
    case "3000":
      tier = "at Tier 3";
      break;
  }
  if (!subInfo.message) subInfo.message = "";
  else
    subInfo.message = subInfo.message
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  alertElement.innerHTML = `<div style= "display:block;" ><img class="bab" height="1000" src="/bab.png" /><img class="exp" id="exp0" height="1000" /><img class="exp" id="exp1" height="1000" /><img class="exp" id="exp2" height="1000"  /></div>`;
  if (!subInfo.gift)
    alertElement.innerHTML += `<span class="text" ><span class="sender">${subInfo.name} </span>just subscribed ${tier} for ${subInfo.months} months </span><br /><span class="message">${subInfo.message}</span> `;
  else
    alertElement.innerHTML += `<span class="text"><span class="sender">${subInfo.name} </span>just gifted ${subInfo.gifted} subscriptions ${tier} </span>`;
  alertElement.style.opacity = "100%";

  const exp = new Audio("/explosions.mp3");
  const sub = new Audio("/sub.mp3");

  const exp0 = document.getElementById("exp0") as HTMLImageElement;
  const exp1 = document.getElementById("exp1") as HTMLImageElement;
  const exp2 = document.getElementById("exp2") as HTMLImageElement;

  exp0.src = "/explosion0.gif";
  setTimeout(() => {
    exp1.src = "/explosion1.gif";
  }, 733);
  setTimeout(() => {
    exp2.src = "/explosion2.gif";
  }, 1553);

  setTimeout(() => {
    exp0.src = "";
  }, 2550);

  setTimeout(() => {
    exp1.src = "";
  }, 733 + 2550);
  setTimeout(() => {
    exp2.src = "";
  }, 1553 + 2550);

  exp.onended = () => {
    tts.playAudioList(subInfo.audioList, () => {
      sub.play();
      setTimeout(() => {
        exp0.src = "/explosion1.gif";
      }, 2005);
    });
  };
  sub.onended = () => {
    exp0.style.display = "none";
    if (subInfo.message.trim() == "") {
      alertElement.style.opacity = "0%";
      setTimeout(() => {
        alertElement.innerHTML = "";
        alertPlaying = false;
      }, 1000);
      return;
    }

    tts.playAudioList(subInfo.messageAudioList, () => {
      alertElement.style.opacity = "0%";
      setTimeout(() => {
        alertElement.innerHTML = "";
        alertElement.style.display = "inline-block";
        alertPlaying = false;
      }, 1000);
    });
  };

  if (silent) {
    setTimeout(() => {
      alertElement.style.opacity = "0%";
      setTimeout(() => {
        alertElement.innerHTML = "";
        alertElement.style.display = "inline-block";
        alertPlaying = false;
      }, 1000);
    }, 10 * 1000);
  } else exp.play();
  alertElement.style.opacity = "100%";
}

const socket = io("/alerts");

socket.on("refresh", () => {
  window.location.reload();
});

socket.on("alert", (alertInfo) => {
  console.log(alertInfo);
  alertQueue.push(alertInfo);
});
setInterval(handleQueue, 500);
