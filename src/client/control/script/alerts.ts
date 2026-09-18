import { Alert, AlertControl } from "../../../shared/types.ts";

declare global {
  interface Window {
    send: Function;
  }
}

function getInput(id: string): HTMLInputElement {
  return document.getElementById(id) as HTMLInputElement;
}

let currentAlert = "sub";

const alertInput = document.getElementById("alert-input") as HTMLSelectElement;

alertInput.onchange = (event) => {
  (document.getElementById(currentAlert) as HTMLDivElement).style.display =
    "none";
  currentAlert = (event.target as HTMLOptionElement).value;
  (document.getElementById(currentAlert) as HTMLDivElement).style.display =
    "block";
};

const followerName = getInput("followerName");
const discordName = getInput("discordName");
const kofiSub = getInput("kofiSub");
const kofiMessage = getInput("kofiMessage");
const kofiSender = getInput("kofiSender");
const kofiTier = getInput("kofiTier");
const kofiAmount = getInput("kofiAmount");
const kofiCurrency = getInput("kofiCurrency");
const bitSender = getInput("bitSender");
const bitsCount = getInput("bitsCount");
const bitMessage = getInput("bitMessage");
const raider = getInput("raider");
const viewers = getInput("raiders");
const subTier = getInput("subtier-input");
const subMessage = getInput("submessage");
const subMonths = getInput("submonths");
const subscriber = getInput("subscriber");
const giftTier = getInput("gifttier-input");
const gifted = getInput("gifted");
const giftMonths = getInput("giftmonths");
const gifter = getInput("gifter");

async function send() {
  switch (currentAlert) {
    case "follower":
      await sendToControl({
        type: "followAlert",
        follower: followerName.value,
      });
      break;
    case "discord":
      await sendToControl({
        type: "discordJoinAlert",
        member: discordName.value,
      });
      break;
    case "kofi":
      await sendToControl({
        type: "kofiAlert",
        is_subscription: kofiSub.checked,
        message: kofiMessage.value,
        sender: kofiSender.value,
        tier_name: kofiTier.value,
        amount: kofiAmount.value,
        currency: kofiCurrency.value,
      });
      break;
    case "bits":
      await sendToControl({
        type: "bitsAlert",
        user: bitSender.value,
        message: bitMessage.value,
        bits: parseInt(bitsCount.value),
      });
      break;
    case "raid":
      await sendToControl({
        type: "raidAlert",
        viewers: parseInt(viewers.value),
        raider: raider.value,
      });
      break;
    case "sub":
      await sendToControl({
        type: "subAlert",
        gift: false,
        plan: subTier.value,
        message: subMessage.value,
        months: parseInt(subMonths.value),
        name: subscriber.value,
        gifted: 0,
      });
      break;
    case "subgift":
      await sendToControl({
        type: "subAlert",
        gift: true,
        plan: giftTier.value,
        message: "",
        months: parseInt(giftMonths.value),
        name: gifter.value,
        gifted: parseInt(gifted.value),
      });
      break;
    default:
      return;
  }
}
async function sendToControl(request: Alert) {
  console.log(request);
  const control: AlertControl = {
    overlay: "alerts",
    message: request,
  };
  const body = JSON.stringify(control);
  const response = await fetch("/api/overlay", {
    method: "POST",
    body: body,
  });
  console.log(await response.text());
  if (response.status == 403) window.location.replace("/control");
}

window.send = send;
