import Swal from "sweetalert2";

const commandTable = document.getElementById(
  "commandTable",
) as HTMLTableSectionElement;
const aliasTable = document.getElementById(
  "aliasTable",
) as HTMLTableSectionElement;

function removeNewLines(text: string): string {
  return text.replaceAll("\n", "").replaceAll("\r", "");
}

declare global {
  // Note the capital "W"
  interface Window {
    addCommand: Function;
    updateSearch: Function;
    addAlias: Function;
  }
}

async function addCommand() {
  await Swal.fire({
    title: "Add a command",
    showCancelButton: true,
    showLoaderOnConfirm: true,
    theme: "dark",
    html:
      '<label for="swal2-input" class="swal2-input-label">Command</label>' +
      '<input id="swal2-input" class="swal2-input">' +
      '<label for="swal2-textarea" class="swal2-input-label">Response</label>' +
      '<textarea id="swal2-textarea" class="swal2-textarea">',
    preConfirm: async () => {
      const command = (
        document.getElementById("swal2-input") as HTMLInputElement
      ).value;
      const response = (
        document.getElementById("swal2-textarea") as HTMLTextAreaElement
      ).value;
      const result = await fetch(`/api/command/add?name=${command}`, {
        method: "POST",
        body: removeNewLines(response),
      });
      if (!result.ok) {
        return Swal.showValidationMessage(`${await result.text()}`);
      }
      getCommands();
      return result.text();
    },
  });
}

async function getCommands() {
  commandTable.innerText = "";

  const commands = await (await fetch("/api/command/list")).json();
  commands.forEach((command: { command: string; response: string }) => {
    const commandRow = document.createElement("tr");
    commandRow.classList.add("command");

    const commandCol = document.createElement("th");
    commandCol.scope = "row";
    commandCol.innerText = command.command;

    commandRow.appendChild(commandCol);

    const responseCol = document.createElement("td");
    responseCol.innerText = command.response;

    commandRow.appendChild(responseCol);

    const buttonDiv = document.createElement("td");

    const editElement = document.createElement("div");
    editElement.classList.add("material-icons");
    editElement.classList.add("button");
    editElement.innerText = "edit";
    editElement.addEventListener("click", async () => {
      await Swal.fire({
        title: `Edit ${command.command}`,
        input: "textarea",
        theme: "dark",
        inputLabel: "Response",
        inputValue: command.response,
        showCancelButton: true,
        showLoaderOnConfirm: true,
        preConfirm: async (newResponse) => {
          const result = await fetch(
            `/api/command/set?name=${command.command}`,
            {
              method: "POST",
              body: removeNewLines(newResponse),
            },
          );
          if (!result.ok) {
            return Swal.showValidationMessage(`${await result.text()}`);
          }
          getCommands();
          return result.text();
        },
      });
    });

    buttonDiv.appendChild(editElement);

    const deleteElement = document.createElement("div");
    deleteElement.classList.add("material-icons");
    deleteElement.classList.add("button");
    deleteElement.innerText = "delete";
    deleteElement.addEventListener("click", async () => {
      const result = await Swal.fire({
        title: `Are you sure you want to delete ${command.command} ?`,
        theme: "dark",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });
      if (!result.isConfirmed) return;
      try {
        const response = await fetch(
          `/api/command/delete?name=${command.command}`,
          {
            method: "POST",
          },
        );
        if (response.status == 200) {
          getCommands();
          Swal.fire({
            title: "Deleted!",
            text: `${command.command} has been deleted.`,
            theme: "dark",
            icon: "success",
          });
        } else {
          Swal.fire({
            title: "Failed!",
            text: `${await response.text()}`,
            theme: "dark",
            icon: "error",
          });
        }
      } catch (e) {
        Swal.fire({
          title: "Failed!",
          text: e,
          theme: "dark",
          icon: "error",
        });
      }
    });

    buttonDiv.appendChild(deleteElement);
    commandRow.appendChild(buttonDiv);

    commandTable.appendChild(commandRow);
  });
}

async function addAlias() {
  await Swal.fire({
    title: "Add an alias",
    theme: "dark",
    showCancelButton: true,
    showLoaderOnConfirm: true,

    html:
      '<label for="swal2-input" class="swal2-input-label">Alias</label>' +
      '<input id="swal2-input" class="swal2-input">' +
      '<label for="swal2-input2" class="swal2-input-label">Command</label>' +
      '<input id="swal2-input2" class="swal2-input">',
    preConfirm: async () => {
      const alias = (document.getElementById("swal2-input") as HTMLInputElement)
        .value;
      const command = (
        document.getElementById("swal2-textarea") as HTMLTextAreaElement
      ).value;

      const result = await fetch(`/api/command/alias/add?name=${alias}`, {
        method: "POST",
        body: removeNewLines(command),
      });
      if (!result.ok) {
        return Swal.showValidationMessage(`${await result.text()}`);
      }
      getAliases();
      return result.text();
    },
  });
}

async function getAliases() {
  aliasTable.innerText = "";

  const aliases = await (await fetch("/api/command/alias/list")).json();
  aliases.forEach((alias: { alias: string; command: string }) => {
    const aliasRow = document.createElement("tr");

    aliasRow.classList.add("command");
    const aliasCol = document.createElement("th");
    aliasCol.scope = "row";
    aliasCol.innerText = alias.alias;

    aliasRow.appendChild(aliasCol);

    const responseCol = document.createElement("td");
    responseCol.innerText = alias.command;

    aliasRow.appendChild(responseCol);

    const buttonDiv = document.createElement("td");

    const editElement = document.createElement("div");
    editElement.classList.add("material-icons");
    editElement.classList.add("button");
    editElement.innerText = "edit";
    editElement.addEventListener("click", async () => {
      await Swal.fire({
        title: `Alias ${alias.alias}`,
        input: "text",
        theme: "dark",
        inputLabel: "Command",
        inputValue: alias.command,
        showCancelButton: true,
        showLoaderOnConfirm: true,
        preConfirm: async (newCommand) => {
          const result = await fetch(
            `/api/command/alias/set?name=${alias.alias}`,
            {
              method: "POST",
              body: removeNewLines(newCommand),
            },
          );
          if (!result.ok) {
            return Swal.showValidationMessage(`${await result.text()}`);
          }
          getAliases();
          return result.text();
        },
      });
    });

    buttonDiv.appendChild(editElement);

    const deleteElement = document.createElement("div");
    deleteElement.classList.add("material-icons");
    deleteElement.classList.add("button");
    deleteElement.innerText = "delete";
    deleteElement.addEventListener("click", async () => {
      const result = await Swal.fire({
        title: `Are you sure you want to delete ${alias.alias} ?`,
        text: "You won't be able to revert this!",
        theme: "dark",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });
      if (!result.isConfirmed) return;
      try {
        const response = await fetch(
          `/api/command/alias/delete?name=${alias.alias}`,
          {
            method: "POST",
          },
        );
        if (response.status == 200) {
          getAliases();
          Swal.fire({
            title: "Deleted!",
            text: `${alias.alias} has been deleted.`,
            theme: "dark",
            icon: "success",
          });
        } else {
          Swal.fire({
            title: "Failed!",
            text: `${await response.text()}`,
            theme: "dark",
            icon: "error",
          });
        }
      } catch (e) {
        Swal.fire({
          title: "Failed!",
          text: e,
          theme: "dark",
          icon: "error",
        });
      }
    });

    buttonDiv.appendChild(deleteElement);
    aliasRow.appendChild(buttonDiv);

    aliasTable.appendChild(aliasRow);
  });
}

getCommands();
getAliases();

function updateSearch(event) {
  const filter = event.target.value.toLocaleLowerCase();
  const commands = document.getElementsByClassName(
    "command",
  ) as HTMLCollectionOf<HTMLTableRowElement>;
  for (const command of commands) {
    if (
      filter.length == 0 ||
      (command.firstChild as HTMLDivElement).innerText
        .toLocaleLowerCase()
        .includes(filter)
    ) {
      command.style.display = "";
    } else {
      command.style.display = "none";
    }
  }
}

window.addCommand = addCommand;
window.updateSearch = updateSearch;
window.addAlias = addAlias;
