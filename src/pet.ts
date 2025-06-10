import { BunFile } from "bun";

enum DeathReason {
  starved,
  overfed,
  omelete,
  failed,
}

interface DeadPet {
  name: number;
  deathReason: DeathReason;
  age: number;
  deathDate: string;
  birthDate: string;
}

interface CurrentPet {
  deadPets: DeadPet[];
  murderers: string[];
  slaughterers: string[];
}

export class Pet {
  public currentPet: CurrentPet = {
    deadPets: [],
    murderers: [],
    slaughterers: [],
  };
  private petFile: BunFile = Bun.file(__dirname + "/../config/pet.json");

  public async readPet() {
    if (!(await this.petFile.exists())) return;
    this.currentPet = await this.petFile.json();
  }
  constructor() {
    this.readPet();
  }

  public murdererList(): string {
    return `Hapboo murderers: @${this.currentPet.murderers.join(", @")}, Hapbooslaughterers: @${this.currentPet.slaughterers.join(", @")}`;
  }

  public graveyard(hapboo?: string): string {
    if (this.currentPet.deadPets.length === 0)
      return "The graveyard is empty for now...";
    if (hapboo == null) {
      const longestSurvivingHapboos = this.currentPet.deadPets
        .toSorted((a, b) => {
          if (
            a.deathReason < DeathReason.omelete &&
            b.deathReason < DeathReason.omelete
          ) {
            // Both hatched
            return a.age - b.age;
          } else if (
            a.deathReason >= DeathReason.omelete &&
            b.deathReason >= DeathReason.omelete
          ) {
            // None Hatched
            return 0;
          } else if (
            a.deathReason < DeathReason.omelete &&
            b.deathReason >= DeathReason.omelete
          ) {
            // a hatched b didn't
            return 1;
          } else {
            // b hatched a didn't
            return -1;
          }
        })
        .splice(-3)
        .map((value, _index, _array) => {
          switch (value.deathReason) {
            case DeathReason.omelete:
              return `Hapboo #${value.name} became a 🍳`;
            case DeathReason.failed:
              return `Hapboo #${value.name} couldn't hatch`;
            case DeathReason.overfed:
              return `Hapboo #${value.name} became too fat at the age of ${value.age} streams`;
            case DeathReason.starved:
              return `Hapboo #${value.name} starved at the age of ${value.age} streams`;
          }
        })
        .join(",");
      return `Hapboos lost: ${this.currentPet.deadPets.length}, longest living Hapboos: ${longestSurvivingHapboos}.`;
    }
    if (hapboo === "3") {
      return "[REDACTED]";
    }
    const pet = this.currentPet.deadPets.find((value) => {
      return value.name === parseInt(hapboo);
    });
    if (pet == null) {
      return `Couldn't find hapboo #${hapboo} in the graveyard`;
    }
    switch (pet.deathReason) {
      case DeathReason.omelete:
        return `Hapboo #${pet.name} became a 🍳. ${new Date(pet.birthDate).toLocaleString()} - ${new Date(pet.deathDate).toLocaleString()}`;
      case DeathReason.failed:
        return `Hapboo #${pet.name} couldn't hatch. ${new Date(pet.birthDate).toLocaleString()} - ${new Date(pet.deathDate).toLocaleString()}`;
      case DeathReason.overfed:
        return `Hapboo #${pet.name} became too fat at the age of ${pet.age} streams. ${new Date(pet.birthDate).toLocaleString()} - ${new Date(pet.deathDate).toLocaleString()}`;
      case DeathReason.starved:
        return `Hapboo #${pet.name} starved at the age of ${pet.age} streams. ${new Date(pet.birthDate).toLocaleString()} - ${new Date(pet.deathDate).toLocaleString()}`;
    }
  }
}
