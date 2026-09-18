const audioCtx = new (
  window.AudioContext || (window as any).webkitAudioContext
)();

async function loadBuffer(url: string) {
  const resp = await fetch(url);
  const arrayBuf = await resp.arrayBuffer();
  return await audioCtx.decodeAudioData(arrayBuf);
}

export class TTSHandler {
  activeSources: AudioBufferSourceNode[] = [];
  isPlaying = false;

  async playPlaylist(urls: string[]) {
    const buffers = await Promise.all(urls.map(loadBuffer));

    let when = audioCtx.currentTime;
    let endedCount = 0;

    return new Promise<void>((resolve) => {
      this.activeSources.length = 0;
      buffers.forEach((buffer) => {
        const src = audioCtx.createBufferSource();
        src.buffer = buffer;
        src.connect(audioCtx.destination);

        src.start(when);

        src.onended = () => {
          endedCount++;
          if (endedCount === buffers.length) {
            resolve(); // All tracks finished!
          }
        };
        this.activeSources.push(src);
        when += buffer.duration;
      });
    });
  }

  stopPlaylist() {
    this.activeSources.forEach((src) => {
      try {
        src.stop();
      } catch (e) {
        /* already stopped */
      }
    });
    this.activeSources.length = 0;
  }

  constructor() {
    const audio = new Audio();

    // Try to play to see if we can interact.
    audio.play().catch(function (err) {
      // User needss to interact with the page.

      if (err.toString().startsWith("NotAllowedError")) {
        const button = document.createElement("button");
        button.style.top = "50%";
        button.style.position = "absolute";
        button.style.fontSize = "30px";
        button.style.fontWeight = "30";
        button.style.cursor = "pointer";

        button.onclick = function () {
          button.remove();
        };

        button.innerHTML = "Click me to activate audio hooks.";
        button.id = "myButton";

        const container = document.getElementById("container");

        if (container) {
          container.appendChild(button);
        } else {
          console.error("Container element not found.");
        }
      }
    });
  }

  playAudioList(audioList: string[] | null, onended: () => void) {
    if (!audioList || audioList.length === 0) return;
    const audioQueue = audioList; // as urls of the audios

    this.playPlaylist(audioQueue).then(() => {
      this.isPlaying = false;
      onended();
    });
  }
}
