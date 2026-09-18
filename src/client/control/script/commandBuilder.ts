import * as monaco from "monaco-editor";
import Swal from "sweetalert2";

const messageInput = document.getElementById(
  "message-input",
) as HTMLInputElement;
const userInput = document.getElementById("name-input") as HTMLInputElement;
const platformInput = document.getElementById(
  "platform-input",
) as HTMLInputElement;

const libSource = await (await fetch("/script.d.ts")).text();
const libUri = "ts:filename/script.d.ts";
monaco.editor.createModel(libSource, "typescript", monaco.Uri.parse(libUri));

const editor = monaco.editor.create(document.getElementById("container")!, {
  value: 'result = "Hello World!";',
  language: "typescript",
  automaticLayout: true,
  theme: "vs-dark",
});

declare global {
  interface Window {
    loadCommand: Function;
    runCommand: Function;
    uploadCommand: Function;
  }
}

async function loadCommand() {
  await Swal.fire({
    title: "Load from command",
    showCancelButton: true,
    showLoaderOnConfirm: true,
    theme: "dark",
    input: "text",
    inputLabel: "Command name",
    inputValidator: (value) => {
      if (!value) {
        return "You need to write something!";
      }
    },
    preConfirm: async (name) => {
      if (!name) return;
      const result = await fetch(`/api/command/get?name=${name}`);
      if (!result.ok) {
        return Swal.showValidationMessage(`Error: ${await result.text()}`);
      }
      const command = await result.text();
      const matches = /script\((.+)\)/g.exec(command);
      if (!matches || matches.length < 2)
        return Swal.showValidationMessage(`Failed parsing command: ${command}`);
      editor.setValue(matches[1]);
      editor.trigger("editor", "editor.action.formatDocument", null);
    },
  });
}

async function uploadCommand() {
  const code = editor.getValue();
  await Swal.fire({
    title: "Add/Edit a command",
    showCancelButton: true,
    theme: "dark",
    showLoaderOnConfirm: true,
    html:
      '<label for="swal2-input" class="swal2-input-label">Command name</label>' +
      '<input id="swal2-input" class="swal2-input">' +
      '<label class="swal2-checkbox" style="display: flex;">' +
      '<input id="swal2-checkbox" type="checkbox" class="swal2-input">' +
      '<span class="swal2-label">Mod only?</span>' +
      '<input id="swal2-checkbox3" type="checkbox" class="swal2-input">' +
      '<span class="swal2-label">Sub only?</span>' +
      '<input id="swal2-checkbox4" type="checkbox" class="swal2-input">' +
      '<span class="swal2-label">Vip only?</span></label>' +
      '<label class="swal2-checkbox" style="display: flex;">' +
      '<input id="swal2-checkbox2" type="checkbox" class="swal2-input">' +
      '<span class="swal2-label">Reply to the user?</span></label>',
    preConfirm: async () => {
      const name = (document.getElementById("swal2-input") as HTMLInputElement)
        .value;
      const modOnly = (
        document.getElementById("swal2-checkbox") as HTMLInputElement
      ).checked;
      const subOnly = (
        document.getElementById("swal2-checkbox3") as HTMLInputElement
      ).checked;
      const vipOnly = (
        document.getElementById("swal2-checkbox4") as HTMLInputElement
      ).checked;
      const reply = (
        document.getElementById("swal2-checkbox2") as HTMLInputElement
      ).checked;
      const command = `${modOnly ? "(modonly)" : ""} ${reply ? "(reply)" : ""} ${subOnly ? "(subonly)" : ""} ${vipOnly ? "(viponly)" : ""} script(${removeNewLines(code)})`;
      const result = await fetch(`/api/command/set?name=${name}`, {
        method: "POST",
        body: command,
      });
      if (!result.ok) {
        return Swal.showValidationMessage(`${await result.text()}`);
      }
      return await result.text();
    },
    didOpen: function () {
      (document.getElementById("swal2-input") as HTMLInputElement).focus();
    },
  });
}

async function runCommand() {
  const code = editor.getValue();
  const user = userInput.value;
  const args = messageInput.value;
  const platform = platformInput.value;
  console.log(
    `Running ${code} with user: ${user} args: ${args} platform: ${platform}`,
  );
  const result = await fetch("/api/command/run", {
    method: "POST",
    body: JSON.stringify({
      data: {
        isTestRun: true,
        sender: user,
        message: args,
        platform: platform,
      },
      script: code,
    }),
  });
  if (result.ok) {
    Swal.fire({
      title: "Command Output",
      text: await result.text(),
      theme: "dark",
      icon: "success",
    });
    return;
  }
  Swal.fire({
    title: `Error: ${result.status}`,
    text: await result.text(),
    theme: "dark",
    icon: "error",
  });
}

function removeNewLines(text: string): string {
  return text.replaceAll("\n", "").replaceAll("\r", "");
}

window.loadCommand = loadCommand;
window.uploadCommand = uploadCommand;
window.runCommand = runCommand;
