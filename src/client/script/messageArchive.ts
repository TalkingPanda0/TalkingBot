import Swal from "sweetalert2";
import { ChatHandler } from "./chat";
import html2canvas from "html2canvas";
import { MessageData } from "../../shared/types";

const messageList = document.getElementById("message-list") as HTMLDivElement;
const chatHandler = new ChatHandler(
  true,
  null,
  messageList,
  null,
  (message, element) => {
    const archiveElement = document.createElement("span");
    const timestampElement = document.createElement("span");
    timestampElement.classList.add("timestamp");
    timestampElement.innerText = new Date(message.timestamp)
      .toLocaleTimeString()
      .toLowerCase();

    const downloadElement = document.createElement("div");
    downloadElement.classList.add("material-icons");
    downloadElement.classList.add("badge");
    downloadElement.classList.add("action");
    downloadElement.addEventListener("click", async () => {
      archiveElement.style.display = "none";
      await downloadHTML(
        element,
        `${formatDate(new Date(message.timestamp))} ${message.sender}`,
      );
      element.style.display = "";
    });

    downloadElement.innerText = "download";

    archiveElement.appendChild(timestampElement);
    archiveElement.appendChild(downloadElement);

    element.appendChild(archiveElement);
  },
);
console.log(chatHandler);

async function getMessages() {
  const { value: date } = await Swal.fire({
    title: "Select stream date",
    input: "date",
    theme: "dark",
    didOpen: () => {
      const today = new Date().toISOString();
      Swal.getInput()!.max = today.split("T")[0];
    },
  });
  if (date) {
    const messages = await (await fetch(`/get/messages?date=${date}`)).json();
    if (!messages || messages.length == 0) {
      Swal.fire("No messages for that day was found.");
      return;
    }
    messages.forEach((msg: MessageData) => {
      chatHandler.addToMessageList(msg);
    });
  }
}

function formatDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join("-") +
    " " +
    [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join("-")
  );
}

async function downloadHTML(element: HTMLElement, name: string) {
  const canvas = await html2canvas(element, {
    allowTaint: false,
    backgroundColor: "rgba(0,0,0,0.5)",
    useCORS: true,
    scale: 5,
  });
  const img = document.createElement("a");
  img.href = canvas.toDataURL("image/png"); // Convert canvas to PNG
  img.download = `${name}.png`;
  img.click();
  messageList.appendChild(img);
}

getMessages();
