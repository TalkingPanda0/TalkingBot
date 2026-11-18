import * as monaco from "monaco-editor";
import Swal from "sweetalert2";

let editorValue = "";
let uploading = false;
const throbber = document.getElementById("throbber") as HTMLDivElement;
const check = document.getElementById("check") as HTMLSpanElement;

const urlParams = new URLSearchParams(window.location.search);
const fileName = urlParams.get("file");

const model = monaco.editor.createModel(
  "",
  undefined,
  monaco.Uri.parse(`file:///${fileName}`)
);

const editor = monaco.editor.create(document.getElementById("container")!, {
  value: editorValue,
  automaticLayout: true,
  theme: "vs-dark",
  minimap: { enabled: false },
  model
});

if (fileName) {
  loadFile();
  document.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
      event.preventDefault(); // stop browser's save dialog
      uploadFile();
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

async function loadFile() {
  const module = await (
    await fetch(`/control/api/fm/file?file=${fileName}`)
  ).text();
  editorValue = module;
  try {
    editor.setValue(editorValue);
  } catch (e) {}
}

async function uploadFile() {
  if (uploading || !fileName) return;
  loadStart();

  const file = new Blob([editor.getValue()], { type: "text/plain" });
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", fileName);

  const result = await fetch("/control/api/fm/file", {
    method: "POST",
    body: formData,
  });

  if (!result.ok) {
    await Swal.fire({
      icon: "error",
      title: "File failed to upload",
      theme: "dark",
      text: await result.text(),
    });
    loadEnd(false);
  } else {
    loadEnd(true);
  }
}
