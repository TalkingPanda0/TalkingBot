import Swal from 'sweetalert2'

const list = document.getElementById("list") as HTMLUListElement;

async function loadEffects() {
  list.innerHTML = "";
  const effects = await (await fetch("/get/soundEffects")).json();

  effects.forEach((effect: string) => {
    const li = document.createElement("li");

    const name = document.createElement("p");
    name.innerText = effect;

    const audio = document.createElement("audio");
    audio.controls = true;
    audio.src = `/${encodeURIComponent(effect)}.mp3`;
    const delButton = document.createElement("div");
    delButton.classList.add("material-icons");
    delButton.classList.add("button");
    delButton.innerText = "delete";
    delButton.addEventListener("click", async () => {
      const result = await Swal.fire({
        title: `Are you sure you want to delete ${effect} ?`,
        text: "You won't be able to revert this!",
        icon: "warning",
        theme: "dark",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });
      if (!result.isConfirmed) return;
      await fetch(`/control/soundEffects/delete?name=${effect}`, {
        method: "POST",
      });
      loadEffects();
    });
    const editButton = document.createElement("div");
    editButton.classList.add("material-icons");
    editButton.classList.add("button");
    editButton.innerText = "edit";
    editButton.addEventListener("click", async () => {
      const { value: newName } = await Swal.fire({
        title: `Enter new name for: ${effect}`,
        theme: "dark",
        input: "text",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
      });

      if (!newName) return;

      await fetch(
        `/control/soundEffects/rename?name=${effect}&newName=${newName}`,
        {
          method: "POST",
        },
      );

      loadEffects();
    });

    const header = document.createElement("div");
    header.classList.add("header");
    header.appendChild(name);
    header.appendChild(delButton);
    header.appendChild(editButton);

    li.appendChild(header);
    li.appendChild(audio);

    list.appendChild(li);
  });
}

loadEffects();
