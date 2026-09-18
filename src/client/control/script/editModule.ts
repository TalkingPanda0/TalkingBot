import * as monaco from "monaco-editor";
import Swal from "sweetalert2";

let editorValue = "";
let uploading = false;
const throbber = document.getElementById("throbber") as HTMLDivElement;
const check = document.getElementById("check") as HTMLSpanElement;

const urlParams = new URLSearchParams(window.location.search);
const moduleName = urlParams.get("name");

const libSource = await (await fetch("/module.d.ts")).text();
const libUri = "ts:filename/module.d.ts";

monaco.editor.createModel(libSource, "typescript", monaco.Uri.parse(libUri));

// Create the editor
let editor = monaco.editor.create(document.getElementById("container")!, {
  value: editorValue,
  language: "typescript",
  automaticLayout: true,
  theme: "vs-dark",
  minimap: { enabled: false },
});

if (moduleName) {
  loadModule();
  document.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
      event.preventDefault(); // stop browser's save dialog
      uploadModule();
    }
  });
}
function loadStart() {
  uploading = true;
  check.classList.add("hidden");
  throbber.classList.remove("hidden");
}
function loadEnd(success: boolean) {
  uploading = false;
  throbber.classList.add("hidden");
  if (!success) return;

  check.classList.remove("hidden");
  setTimeout(() => {
    check.classList.add("hidden");
  }, 1000 * 2);
}

async function loadModule() {
  const module = await (
    await fetch(`/api/modulemanager/get?name=${moduleName}`)
  ).text();
  editorValue = module;
  try {
    editor.setValue(editorValue);
  } catch (e) {}
}

async function uploadModule() {
  if (uploading) return;
  loadStart();
  const module = editor.getValue();
  const result = await fetch(`/api/modulemanager/set?name=${moduleName}`, {
    method: "POST",
    body: module,
  });
  if (!result.ok) {
    await Swal.fire({
      icon: "error",
      title: "Module failed to upload",
      theme: "dark",
      text: await result.text(),
    });
    loadEnd(false);
  } else {
    loadEnd(true);
  }
}
