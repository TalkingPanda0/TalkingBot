const deleteIcon =
  "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";
const deleteImg = document.createElement("img");
deleteImg.src = deleteIcon;
const normalEditor = document.getElementById("canvasContainer");
const deleteControl = new fabric.Control({
  x: 0.5,
  y: -0.5,
  offsetY: -16,
  offsetX: 16,
  cursorStyle: "pointer",
  mouseUpHandler: deleteObject,
  render: renderIcon,
  cornerSize: 24,
});
const button = document.getElementById("button");
const textArea = document.getElementById("textarea");
const events = ["object:added", "object:modified", "object:removed"];
const dialog = document.getElementById("imageDialog");
const grid = document.getElementById("imageGrid");
const form = document.getElementById("imageUploadForm");
const playPauseButton = document.getElementById("playPauseButton");
const liveToggle = document.getElementById("liveToggle");
const player = new Twitch.Player("player", {
  width: 1920,
  height: 1080,
  channel: "sweetbabooo_o",
  parent: ["localhost", "talkingpanda.dev"],
  autoplay: true,
  muted: true,
});
const undoStack = [];
const redoStack = [];

let isRestoring = false;
let viewScale = 1;
let panX = 0;
let panY = 0;
let data = {};
let selectedObject = null;
let live = false;
let canvas;
let mode = false;

function toggleLive() {
  live = !live;
  liveToggle.innerText = live ? "sync_disabled" : "sync";
}

function playPause() {
  if (player.isPaused()) {
    playPauseButton.innerText = "pause";
    player.play();
  } else {
    playPauseButton.innerText = "play_arrow";
    player.pause();
  }
}

function deleteObject(_eventData, transform) {
  const canvas = transform.target.canvas;
  canvas.remove(transform.target);
  canvas.requestRenderAll();
}

function renderIcon(ctx, left, top, _styleOverride, fabricObject) {
  const size = this.cornerSize;
  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
  ctx.drawImage(deleteImg, -size / 2, -size / 2, size, size);
  ctx.restore();
}

async function emitUpdate(data) {
  const response = await fetch("/control/modtext/updatecanvas", {
    method: "POST",
    body: JSON.stringify(data),
  });
  console.log(await response.text());
  console.log("Sent to Server:", data);
}

function enablePinchAndPan(canvas) {
  let lastDist = null;
  let lastMid = null;
  let startScale = viewScale;
  let startPanX = panX;
  let startPanY = panY;

  const el = canvas.upperCanvasEl;

  el.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();

        lastDist = getDistance(e.touches[0], e.touches[1]);
        lastMid = getMidpoint(e.touches[0], e.touches[1]);

        startScale = viewScale;
        startPanX = panX;
        startPanY = panY;
        canvas.selection = false;
        canvas.discardActiveObject();
      }
    },
    { passive: false },
  );

  el.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length !== 2 || lastDist === null) return;

      e.preventDefault();

      const dist = getDistance(e.touches[0], e.touches[1]);
      const mid = getMidpoint(e.touches[0], e.touches[1]);

      if (Math.abs(dist - lastDist) > 25) {
        const scaleFactor = dist / lastDist;
        const oldScale = viewScale;
        viewScale = clamp(startScale * scaleFactor, 0.25, 6);
        zoomAtCursor(mid.x, mid.y, oldScale, viewScale);
      } else {
        panX = startPanX + (mid.x - lastMid.x);
        panY = startPanY + (mid.y - lastMid.y);
      }

      clampPan();
      applyTransform();
    },
    { passive: false },
  );

  el.addEventListener("touchend", () => {
    lastDist = null;
    lastMid = null;
    canvas.selection = true;
  });
}

function clampPan() {
  const container = document.getElementById("canvasContainer");

  const maxX = 0;
  const maxY = 0;

  const minX = container.clientWidth - 1920 * viewScale;
  const minY = container.clientHeight - 1080 * viewScale;

  panX = clamp(panX, minX, maxX);
  panY = clamp(panY, minY, maxY);
}

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

function getDistance(t1, t2) {
  const dx = t2.clientX - t1.clientX;
  const dy = t2.clientY - t1.clientY;
  return Math.hypot(dx, dy);
}

function getMidpoint(t1, t2) {
  return {
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  };
}

function enableMousePanAndZoom(canvas) {
  const el = canvas.upperCanvasEl;

  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let startPanX = 0;
  let startPanY = 0;

  el.addEventListener("mousedown", (e) => {
    if (e.button !== 1) return; // Mouse3 only
    e.preventDefault();

    isPanning = true;
    startX = e.clientX;
    startY = e.clientY;
    startPanX = panX;
    startPanY = panY;
    canvas.selection = false;
    canvas.discardActiveObject();
  });

  window.addEventListener("mousemove", (e) => {
    if (!isPanning) return;

    panX = startPanX + (e.clientX - startX);
    panY = startPanY + (e.clientY - startY);

    clampPan();
    applyTransform();
  });

  window.addEventListener("mouseup", (e) => {
    if (e.button === 1) {
      isPanning = false;
      canvas.selection = true;
    }
  });

  /* ---------- CTRL + SCROLL ZOOM ---------- */

  el.addEventListener(
    "wheel",
    (e) => {
      if (!e.ctrlKey) return;

      e.preventDefault();

      const zoomIntensity = 0.0015;
      const delta = -e.deltaY * zoomIntensity;

      const oldScale = viewScale;
      viewScale = clamp(viewScale * (1 + delta), 0.5, 6);

      zoomAtCursor(e.clientX, e.clientY, oldScale, viewScale);
      clampPan();
      applyTransform();
    },
    { passive: false },
  );
}

function zoomAtCursor(clientX, clientY, oldScale, newScale) {
  const container = document.getElementById("canvasContainer");
  const rect = container.getBoundingClientRect();

  const cx = clientX - rect.left;
  const cy = clientY - rect.top;

  const scaleRatio = newScale / oldScale;

  panX = cx - scaleRatio * (cx - panX);
  panY = cy - scaleRatio * (cy - panY);
}

function applyTransform() {
  const scaler = document.getElementById("scaler");

  scaler.style.transform = `translate(${panX}px, ${panY}px) scale(${viewScale})`;

  canvas.requestRenderAll();
}

function initCanvas() {
  document.getElementById("editorCanvas").style.display = "block";
  canvas = new fabric.Canvas("editorCanvas", {
    width: 1920,
    height: 1080,
  });
  enablePinchAndPan(canvas);
  enableMousePanAndZoom(canvas);

  canvas.on("selection:created", updatePanel);
  canvas.on("selection:updated", updatePanel);
  canvas.on("selection:cleared", clearPanel);

  getModText().then(() => {
    events.forEach((event) =>
      canvas.on(event, () => {
        saveState();
        updatePanel();
      }),
    );
  });
}

function updatePanel() {
  const objs = canvas.getActiveObjects();
  if (objs.length != 1) {
    clearPanel();
    return;
  }
  selectedObject = objs[0];

  document.getElementById("noSelection").style.display = "none";
  document.getElementById("props").style.display = "block";

  setVal("prop-left", Math.round(selectedObject.left));
  setVal("prop-top", Math.round(selectedObject.top));
  setVal("prop-scalex", selectedObject.scaleX);
  setVal("prop-scaley", selectedObject.scaleY);
  setVal("prop-angle", selectedObject.angle || 0);
  setVal("prop-opacity", selectedObject.opacity ?? 1);

  if (selectedObject.type === "i-text") {
    document.getElementById("textControls").style.display = "block";
    setVal("prop-text", selectedObject.text);
    setVal("prop-font", selectedObject.fontFamily ?? "sans-serif");
    setVal("prop-color", selectedObject.fill ?? "#000");
    setVal("prop-bgcolor", selectedObject.textBackgroundColor ?? "#000");
    updateTextAlignButtons(selectedObject.textAlign || "left");
  } else {
    document.getElementById("textControls").style.display = "none";
  }
}

function clearPanel() {
  selectedObject = null;
  document.getElementById("props").style.display = "none";
  document.getElementById("noSelection").style.display = "block";
}

function setVal(id, value) {
  document.getElementById(id).value = value;
}

function bind(id, fn) {
  document.getElementById(id).addEventListener("input", () => {
    if (!selectedObject) return;
    fn();
    selectedObject.setCoords();
    canvas.requestRenderAll();
    saveState();
  });
}

function prop(id) {
  return document.getElementById(id).value;
}
function addText() {
  if (!canvas) return;
  const text = new fabric.IText("Type something...", {
    left: 1920 / 2,
    top: 1080 / 2,
    fontFamily: "sans-serif",
    fill: "#ffffff",
  });
  addCustomProperties(text);
  canvas.add(text);
}

function deleteSelected() {
  if (!selectedObject) return;
  canvas.remove(selectedObject);
  clearPanel();
  saveState();
}

async function addCounter() {
  if (!canvas) return;
  const options = Object.fromEntries(
    Object.entries(data.counters).map(([key, value]) => [
      key,
      `${key}: ${value}`,
    ]),
  );
  const { value: counter } = await Swal.fire({
    title: "Select a counter to show",
    input: "select",
    inputOptions: options,
  });
  const text = new fabric.IText(counter, {
    left: 1920 / 2,
    top: 1080 / 2,
    fontFamily: "sans-serif",
    fill: "#ffffff",
    dataId: "counter",
    counterName: counter,
  });
  addCustomProperties(text);
  canvas.add(text);
}

async function addImagePrompt() {
  if (!canvas) return;
  const { value: url } = await Swal.fire({
    title: "Enter Image URL",
    input: "text",
    inputLabel: "image URL",
    showCancelButton: true,
    inputValidator: (value) => {
      if (!isValidUrl(value)) {
        return "Not a valid URL!";
      }
    },
  });
  if (!url) return;
  const img = await getImage(url);
  canvas.add(img);
}

function addSubName() {
  if (!canvas) return;
  const text = new fabric.IText(data.latestSub, {
    left: 1920 / 2,
    top: 1080 / 2,
    fontFamily: "sans-serif",
    fill: "#ffffff",
    dataId: "latest_sub",
  });
  addCustomProperties(text);
  canvas.add(text);
}

function addCustomProperties(obj) {
  obj.controls.deleteControl = deleteControl;
  applyData(obj);
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => resolve(img);
    img.onerror = reject;

    img.src = url;
  });
}
async function getImage(url) {
  if (!canvas) return;
  const image = await loadImage(url);
  const obj = new fabric.FabricImage(image, {
    left: 1920 / 2,
    top: 1080 / 2,
  });
  obj.controls.deleteControl = deleteControl;
  return obj;
}

async function addSubPfp() {
  if (!canvas) return;
  const img = await getImage(data.latestSubPfp);
  img.dataId = "sub_pfp";
  addCustomProperties(img);
  canvas.add(img);
}

async function sendToOverlay() {
  if (!canvas) return;
  if (mode) {
    sendModtext();
    return;
  }
  const layoutData = canvas.toJSON();
  const response = await fetch("/control/modtext/setcanvas", {
    method: "POST",
    body: JSON.stringify(layoutData),
  });
  console.log(await response.text());
  console.log("Sent to Server:", layoutData);
}

async function sendModtext() {
  const html = textArea.value;
  textArea.value = html;

  const response = await fetch("/control/modtext/set", {
    method: "POST",
    body: html,
  });
  console.log(await response.text());
}

function toggleMode() {
  if (mode) {
    normalEditor.style.display = "block";
    textArea.style.display = "none";
  } else {
    normalEditor.style.display = "none";
    textArea.style.display = "block";
  }
  mode = !mode;
  document.querySelectorAll(".nerdMode").forEach((el) => {
    el.style.display = mode ? "inline" : "none";
  });

  document.querySelectorAll(".normalMode").forEach((el) => {
    el.style.display = mode ? "none" : "inline";
  });
}

async function getModTextdata() {
  try {
    const response = await fetch("/control/modtext/getdata");
    const responseJSON = await response.json();
    console.log("GOT DATA: ", responseJSON);
    data = responseJSON;
  } catch (e) {
    console.error(e);
  }
}

async function getModTextCanvas() {
  try {
    const response = await fetch("/control/modtext/getcanvas");
    const responseJSON = await response.json();
    console.log("GOT CANVAS:", responseJSON);
    await getModTextdata();
    await canvas
      .loadFromJSON(responseJSON, (_, obj) => addCustomProperties(obj))
      .then(() => canvas.renderAll());
    saveState();
  } catch (e) {
    console.error(e);
  }
}

async function getModText() {
  if (!mode) {
    if (!canvas) initCanvas();
    else await getModTextCanvas();
    return;
  }
  try {
    const response = await fetch("/control/modtext/get");
    const responseText = await response.text();
    if (!response.ok) {
      alert(`Error updating modtext ${responseText}`);
      return;
    }
    console.log("GOT MESSAGE:", responseText);
    textArea.value = responseText;
  } catch (e) {
    alert(`Error updating modtext ${e}`);
  }
}
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
}

function formatNumber(n) {
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)));
}
async function pickImage() {
  loadImages();
  dialog.showModal();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  const res = await fetch(form.action, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    alert("Upload failed");
    return;
  }

  await loadImages();

  form.reset();
});

async function loadImages() {
  const res = await fetch("/control/modtext/getimages");
  const images = (await res.json()).map((i) => `/${i}`);

  grid.innerHTML = "";

  for (const url of images) {
    const img = document.createElement("img");
    img.src = url;
    img.onclick = async () => {
      const img = await getImage(url);
      canvas.add(img);
      dialog.close();
    };
    grid.appendChild(img);
  }
}

function saveState() {
  if (isRestoring) return;

  redoStack.length = 0;
  undoStack.push(canvas.toJSON());

  if (undoStack.length > 50) {
    undoStack.shift();
  }
}

function undo() {
  if (undoStack.length < 2 || isRestoring) return;

  isRestoring = true;

  const current = undoStack.pop();
  redoStack.push(current);

  const previous = undoStack[undoStack.length - 1];
  canvas
    .loadFromJSON(previous, (_, obj) => addCustomProperties(obj))
    .then(() => {
      canvas.renderAll();
      isRestoring = false;
    });
}

function redo() {
  if (redoStack.length === 0) return;

  isRestoring = true;

  const state = redoStack.pop();
  undoStack.push(state);

  canvas
    .loadFromJSON(state, (_, obj) => addCustomProperties(obj))
    .then(() => {
      canvas.renderAll();
      isRestoring = false;
    });
}

window.addEventListener("keydown", (e) => {
  if (!e.ctrlKey || !canvas) return;

  if (e.key === "d") {
    const obj = canvas.getActiveObject();
    if (!obj) return;
    e.preventDefault();
    obj.clone().then((cloned) => {
      addCustomProperties(cloned);
      canvas.add(cloned);
      canvas.renderAll();
    });
  }

  if (e.key === "z") {
    e.preventDefault();
    undo();
    return;
  }

  if (e.key === "y" || (e.shiftKey && e.key === "Z")) {
    e.preventDefault();
    redo();
    return;
  }
});

function applyData(obj) {
  switch (obj.dataId) {
    case "latest_sub":
      obj.set("text", data.latestSub);
      break;
    case "sub_pfp":
      obj.setSrc(data.latestSubPfp).then(() => canvas.renderAll());
      break;
  }
}

function setTextAlign(align) {
  if (!selectedObject || selectedObject.type !== "i-text") return;

  selectedObject.set("textAlign", align);
  selectedObject.setCoords();

  updateTextAlignButtons(align);
  canvas.requestRenderAll();
  saveState();
}

function updateTextAlignButtons(align) {
  const buttons = document.querySelectorAll("#textControls button");

  buttons.forEach((btn) => {
    btn.classList.toggle("active", btn.textContent.trim().includes(align));
  });
}

async function uploadAndAddImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("/control/modtext/addimage", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    alert("Image upload failed");
    return;
  }

  const imagePath = await res.text();
  const url = imagePath;

  const img = await getImage(url);
  canvas.add(img);
  canvas.setActiveObject(img);
  canvas.requestRenderAll();
}

document.addEventListener("paste", async (e) => {
  if (!canvas) return;

  const items = e.clipboardData?.items;
  if (!items) return;

  for (const item of items) {
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (!file) continue;

      await uploadAndAddImage(file);
      e.preventDefault();
      return;
    }
  }
});

fabric.FabricObject.customProperties = ["dataId", "counterName"];

player.addEventListener(Twitch.Player.READY, () => {
  if (!canvas) initCanvas();
});

bind("prop-left", () => selectedObject.set("left", Number(prop("prop-left"))));
bind("prop-top", () => selectedObject.set("top", Number(prop("prop-top"))));
bind("prop-scalex", () => {
  const s = Number(prop("prop-scalex"));
  selectedObject.set({ scaleX: s });
});
bind("prop-scaley", () => {
  const s = Number(prop("prop-scaley"));
  selectedObject.set({ scaleY: s });
});

bind("prop-angle", () =>
  selectedObject.set("angle", Number(prop("prop-angle"))),
);
bind("prop-opacity", () =>
  selectedObject.set("opacity", Number(prop("prop-opacity"))),
);
bind("prop-text", () => selectedObject.set("text", prop("prop-text")));
bind("prop-font", () => selectedObject.set("fontFamily", prop("prop-font")));
bind("prop-bgcolor", () =>
  selectedObject.set("textBackgroundColor", prop("prop-bgcolor")),
);
bind("prop-color", () => selectedObject.set("fill", prop("prop-color")));

document.getElementById("cancelBtn").onclick = () => dialog.close();
