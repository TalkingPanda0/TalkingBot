import * as bootstrap from "bootstrap";

import { PollEvent, PollOption } from "../shared/types.ts";
import { io } from "socket.io-client";

const pollElement = document.getElementById("poll") as HTMLDivElement;
let currentPoll: PollEvent | null = null;

function endPoll() {
  if (!currentPoll) return;

  let highestVotes = currentPoll.options.reduce(
    (maxVotes, currentOption) => {
      if (currentOption.score > maxVotes[0].score) {
        return [currentOption];
      } else if (currentOption.score === maxVotes[0].score) {
        return [...maxVotes, currentOption];
      } else {
        return maxVotes;
      }
    },
    [currentPoll.options[0]],
  );
  for (let i = 1; i < pollElement.children[0].childElementCount; i++) {
    const optionElement = pollElement.children[0].children[i] as HTMLDivElement;
    optionElement.style.opacity = "0.2";
  }

  highestVotes.forEach((option) => {
    let element = document.getElementById(
      option.id.toString(),
    ) as HTMLDivElement;
    element.style.opacity = "1";
  });

  setTimeout(() => {
    pollElement.innerHTML = "";
    pollElement.style.display = "none";
  }, 5000);
}

function updatePoll(options: PollOption[]) {
  if (!currentPoll) return;

  currentPoll.options = options;
  const totalVotes = options.reduce((total, option) => total + option.score, 0);

  options.forEach((option) => {
    let percentage = option.score == 0 ? 0 : (option.score / totalVotes) * 100;
    const optionElement = document.getElementById(
      option.id.toString(),
    ) as HTMLDivElement;
    const textElement = optionElement.children[0].children[1] as HTMLDivElement;
    const progressbar = optionElement.children[1].children[0] as HTMLDivElement;
    textElement.innerText = `${Math.round(percentage)}% (${option.score})`;
    progressbar.style.width = `${percentage}%`;
  });
}

function createPoll(poll: PollEvent) {
  currentPoll = poll;
  const totalVotes = poll.options.reduce(
    (total, option) => total + option.score,
    0,
  );

  let html = `
                <div class="card-body">
                  <h5 class="card-title">
                    ${poll.title}
                    <hr />
                  </h5>`;

  poll.options.forEach((option) => {
    const percentage =
      option.score == 0 ? 0 : (option.score / totalVotes) * 100;
    html += `
                  <div class="card-text option" id="${option.id}">
                    <div class="d-flex justify-content-between">
                        <div>${option.id}: ${option.label}</div>
                        <div>${percentage}% (${option.score})</div>
                    </div>
                    <div
                      class="progress"
                      role="progressbar"
                    >
                    <div class="progress-bar" style="width: ${Math.round(percentage)}%"></div>
                    </div>
                  </div>
         `;
  });
  pollElement.innerHTML = html;
  pollElement.style.display = "block";
  setTimeout(() => {
    endPoll();
  }, poll.duration);
}

const socket = io("/poll");

socket.on("createPoll", (poll: PollEvent) => {
  createPoll(poll);
});

socket.on("updatePoll", (options: PollOption[]) => {
  updatePoll(options);
});

socket.on("pollEnd", () => {
  endPoll();
});
