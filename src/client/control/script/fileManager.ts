import Swal from "sweetalert2";
import { File } from "../../../shared/types";

const fileTemplate = document.getElementById(
  "fileTemplate",
) as HTMLTemplateElement;
const fileGrid = document.getElementById("fileGrid") as HTMLDivElement;
const editButton = document.getElementById("editButton") as HTMLButtonElement;

const downloadButton = document.getElementById(
  "downloadButton",
) as HTMLButtonElement;
const renameButton = document.getElementById(
  "renameButton",
) as HTMLButtonElement;
const deleteButton = document.getElementById(
  "deleteButton",
) as HTMLButtonElement;
const uploadButton = document.getElementById(
  "uploadButton",
) as HTMLButtonElement;
const newFileButton = document.getElementById(
  "newFileButton",
) as HTMLButtonElement;
const newFolderButton = document.getElementById(
  "newFolderButton",
) as HTMLButtonElement;

const selectedOnlyButtons = [renameButton, deleteButton];
const fileOnlyButtons = [editButton, downloadButton];

let currentPath: string = "";
let selectedFile: { element: HTMLElement; file: File; time: number } | null =
  null;

function getIconName(mime: string): string {
  const mimeRegex = /^(.+)\/(\w+)/;

  if (mime == "folder") return "folder_open";

  const result = mimeRegex.exec(mime);
  if (!result) return "draft";

  const type = result[1];
  const subType = result[2];

  switch (type) {
    case "text":
      return getTextIcon(subType);
    case "audio":
      return "audio_file";
    case "image":
      return "image";
    case "video":
      return "video_file";
  }

  return "draft";
}

function getTextIcon(subType: string): string {
  switch (subType) {
    case "javascript":
    case "html":
    case "csv":
    case "tsv":
    case "css":
      return subType;
  }
  return "draft";
}

function createFileElement(file: File): DocumentFragment {
  const clone = document.importNode(fileTemplate.content, true);
  const nameElement = clone.querySelector<HTMLSpanElement>(".file .name")!;
  const iconElement = clone.querySelector<HTMLSpanElement>(".file .file-icon")!;
  const fileElement = clone.querySelector<HTMLDivElement>(".file")!;

  nameElement.innerText = file.name;
  iconElement.innerText = getIconName(file.type);

  fileElement.onclick = () => {
    if (selectedFile) {
      if (selectedFile.file == file) {
        if (
          Date.now() - selectedFile.time <= 1000 &&
          selectedFile.file.type == "folder"
        ) {
          const nextPath = currentPath
            ? `${currentPath}/${selectedFile.file.name}`
            : selectedFile.file.name;
          history.pushState(nextPath, "", "");
          currentPath = nextPath;
          getFiles();
        } else {
          selectedFile.element.classList.remove("selected");
          selectedFile = null;
          updateButtonStatus();
        }
        return;
      }

      selectedFile.element.classList.remove("selected");
    }

    selectedFile = { element: fileElement, file, time: Date.now() };
    fileElement.classList.add("selected");
    updateButtonStatus();
  };

  return clone;
}

function reset() {
  fileGrid.innerHTML = "";
  selectedFile = null;
  updateButtonStatus();
}

function setButtonStatus(button: HTMLButtonElement, status: boolean) {
  button.style.color = status ? "white" : "gray";
  button.style.cursor = status ? "pointer" : "default";
}

function setArrayStatus(buttons: HTMLButtonElement[], status: boolean) {
  for (const button of buttons) {
    setButtonStatus(button, status);
  }
}

function updateButtonStatus() {
  if (!selectedFile) {
    setArrayStatus(selectedOnlyButtons, false);
    setArrayStatus(fileOnlyButtons, false);
    return;
  }
  setArrayStatus(selectedOnlyButtons, true);
  setArrayStatus(fileOnlyButtons, selectedFile.file.type != "folder");
}

async function getFiles() {
  reset();
  const url =
    currentPath == ""
      ? "/control/api/fm/folder"
      : `/control/api/fm/folder?folder=${currentPath}`;
  const files: File[] = await (await fetch(url)).json();
  for (const file of files) {
    const el = createFileElement(file);
    fileGrid.appendChild(el);
  }
}

async function uploadFile(file: Blob, name: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", `${currentPath}/${name}`);

  const res = await fetch("/control/api/fm/file", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    await Swal.fire({
      theme: "dark",
      icon: "error",
      title: "Uploading file failed",
      text: await res.text(),
    });
  }
}

window.addEventListener("popstate", (event) => {
  currentPath = event.state ?? "";
  getFiles();
});

newFileButton.onclick = async () => {
  const result = await Swal.fire({
    title: `New file on ${currentPath}`,
    input: "text",
    inputAttributes: { autocapitalize: "off" },
    showCancelButton: true,
    confirmButtonText: "Create File",
    showLoaderOnConfirm: true,
    theme: "dark",
  });
  if (!result.isConfirmed) {
    return;
  }
  const status = await fetch(
    `/control/api/fm/newfile?file=${currentPath}/${result.value}`,
    { method: "POST" },
  );
  if (!status.ok) {
    await Swal.fire({
      title: "Failed to create file",
      text: await status.text(),
      theme: "dark",
    });
    return;
  }
  getFiles();
};

newFolderButton.onclick = async () => {
  const result = await Swal.fire({
    title: `New folder on ${currentPath}`,
    input: "text",
    inputAttributes: { autocapitalize: "off" },
    showCancelButton: true,
    confirmButtonText: `Create Folder`,
    showLoaderOnConfirm: true,
    theme: "dark",
  });
  if (!result.isConfirmed) {
    return;
  }
  const status = await fetch(
    `/control/api/fm/newfolder?folder=${currentPath}/${result.value}`,
    { method: "POST" },
  );
  if (!status.ok) {
    await Swal.fire({
      title: "Failed to create folder",
      text: await status.text(),
      theme: "dark",
    });
    return;
  }
  getFiles();
};

uploadButton.onclick = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    await uploadFile(file, file.name);
    getFiles();
  };
  input.click();
};

deleteButton.onclick = async () => {
  if (!selectedFile) return;
  const file = `${currentPath}/${selectedFile.file.name}`;
  const result = await Swal.fire({
    title: `Are you sure you want to delete ${file}`,
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
    theme: "dark",
  });
  if (!result.isConfirmed) return;
  const res = await fetch(`/control/api/fm/delete?file=${file}`, {
    method: "POST",
  });
  if (!res.ok) {
    await Swal.fire({
      theme: "dark",
      icon: "error",
      title: `Failed to delete ${file}`,
      text: await res.text(),
    });
    return;
  }
  getFiles();
};

renameButton.onclick = async () => {
  if (!selectedFile) return;
  const result = await Swal.fire({
    title: `Rename ${selectedFile.file.name}`,
    input: "text",
    inputAttributes: { autocapitalize: "off" },
    showCancelButton: true,
    confirmButtonText: `Rename File`,
    showLoaderOnConfirm: true,
    theme: "dark",
  });
  if (!result.isConfirmed) {
    return;
  }
  const status = await fetch(
    `/control/api/fm/rename?old=${currentPath}/${selectedFile}&new=${currentPath}/${result.value}`,
    { method: "POST" },
  );
  if (!status.ok) {
    await Swal.fire({
      title: "Failed to rename file",
      text: await status.text(),
      theme: "dark",
    });
    return;
  }
  getFiles();
};

downloadButton.onclick = async () => {
  if(!selectedFile || selectedFile.file.type == "folder") return;
  const blob = await (
    await fetch(
      `/control/api/fm/file?file=${currentPath}/${selectedFile.file.name}`,
    )
  ).blob();
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = selectedFile.file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
 
editButton.onclick = () => {
  if(!selectedFile || selectedFile.file.type == "folder") return;
  window.location.href = `/control/editFile?file=${currentPath}/${selectedFile.file.name}`;
};

history.replaceState("", "", "");

getFiles();
