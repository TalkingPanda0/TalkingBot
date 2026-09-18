import { io } from "socket.io-client";
import { Canvas } from "fabric";

let data: {
  latestSub: string;
  latestSubPfp: string;
  counters: any;
} | null = null;
const canvas = new Canvas("editorCanvas", {
  width: 1920,
  height: 1080,
  backgroundColor: "transparent",
});
const text = document.getElementById("text") as HTMLDivElement;

const socket = io("/modtext");

socket.on("refresh", () => {
  window.location.reload();
});
socket.on("message", (message) => {
  console.log("GOT MESSAGE:", message);
  text.innerHTML = message;
});
socket.on("canvas", (message) => {
  console.log("GOT CANVAS:", message);
  canvas.loadFromJSON(message, applyData).then(() => canvas.renderAll());
});
socket.on("data", (newData) => {
  console.log("GOT DATA: ", newData);
  data = JSON.parse(newData);
  canvas.getObjects().forEach((obj) => applyData(null, obj));
});

function applyData(_, obj) {
  if(!data) return;
  switch (obj.dataId) {
    case "latest_sub":
      obj.set("text", data.latestSub);
      break;
    case "sub_pfp":
      obj.setSrc(data.latestSubPfp).then(() => canvas.renderAll());
      break;
    case "counter":
      obj.set("text", formatNumber(data.counters[obj.counterName]));
      break;
  }
}

function formatNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)));
}
