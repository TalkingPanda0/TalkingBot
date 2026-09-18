import Swal from "sweetalert2";

const gmodules: string[] = [];
const moduleTable = document.getElementById(
  "moduleTable",
) as HTMLTableSectionElement;


declare global {
    // Note the capital "W"
    interface Window { addModule: Function; }
}

async function addModule() {
  await Swal.fire({
    title: "Add a module",
    showCancelButton: true,
    showLoaderOnConfirm: true,
    theme: "dark",

    html:
      '<label for="swal2-input" class="swal2-input-label">Module</label>' +
      '<input id="swal2-input" class="swal2-input">',
    preConfirm: async () => {
      const module = (
        document.getElementById("swal2-input") as HTMLInputElement
      ).value;
      if (gmodules.some((m) => m == module))
        return Swal.showValidationMessage(`${module} already exists.`);

      window.location.href = `/control/editModule?name=${module}`;
    },
  });
}

async function getModules() {
  moduleTable.innerText = "";

  const modules = await (await fetch("/api/modulemanager/list")).json();
  modules.forEach((module: { module: string; enabled: boolean }) => {
    gmodules.push(module.module);
    const moduleRow = document.createElement("tr");

    const moduleCol = document.createElement("th");
    moduleCol.scope = "row";
    moduleCol.innerText = module.module;

    moduleRow.appendChild(moduleCol);

    const buttonDiv = document.createElement("td");

    const editElement = document.createElement("div");
    editElement.classList.add("material-icons");
    editElement.classList.add("button");
    editElement.innerText = "edit";
    editElement.addEventListener("click", () => {
      window.location.href = `/control/editModule?name=${module.module}`;
    });

    buttonDiv.appendChild(editElement);

    const deleteElement = document.createElement("div");
    deleteElement.classList.add("material-icons");
    deleteElement.classList.add("button");
    deleteElement.innerText = "delete";
    deleteElement.addEventListener("click", async () => {
      const result = await Swal.fire({
        title: `Are you sure you want to delete ${module.module} ?`,
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
          `/api/modulemanager/delete?name=${module.module}`,
          {
            method: "POST",
          },
        );
        if (response.status == 200) {
          getModules();
          Swal.fire({
            title: "Deleted!",
            theme: "dark",
            text: `${module.module} has been deleted.`,
            icon: "success",
          });
        } else {
          Swal.fire({
            title: "Failed!",
            theme: "dark",
            text: `${await response.text()}`,
            icon: "error",
          });
        }
      } catch (e) {
        await Swal.fire({
          title: "Failed!",
          text: String(e),
          theme: "dark",
          icon: "error",
        });
      }
    });

    buttonDiv.appendChild(deleteElement);

    const switchElement = document.createElement("label");
    switchElement.classList.add("switch");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = module.enabled;
    checkbox.addEventListener("change", async (event) => {
      const enabled = (event.target as HTMLInputElement).checked;
      const response = await fetch(
        `/api/modulemanager/${enabled ? "enable" : "disable"}?name=${module.module}`,
        {
          method: "POST",
        },
      );
      if (response.status == 200) getModules();
    });
    const slider = document.createElement("span");
    slider.classList.add("slider");
    slider.classList.add("round");
    switchElement.appendChild(checkbox);
    switchElement.appendChild(slider);

    buttonDiv.appendChild(switchElement);

    moduleRow.appendChild(buttonDiv);
    moduleTable.appendChild(moduleRow);
  });
}

getModules();
window.addModule = addModule;
