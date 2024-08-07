import { BunFile } from "bun";
import { TalkingBot } from "./talkingbot";
import { getTimeDifference } from "./util";

const emotes = [
  "sweetb35Stunky he is getting hungry. Please feed him using !pet feed",
  "sweetb35Shy. Feed him using !pet feed",
  "sweetb35Sexy",
  "sweetb35Heheh",
  "sweetb35HNNNGH he is a bit too full",
];
const campfires = [
  "",
  "He is getting too cold. Please add fuel to the campfire using !pet fuel",
  "Add fuel to the campfire using !pet fuel",
  "",
  "",
  "He is getting a bit too warm",
];
const eggs = ["🥚", "🐣"];

export enum Status {
  egg,
  hatching,
  alive,
  dead,
}

export enum StatusReason {
  fed,
  tick,
  command,
}

enum DeathReason {
  starved,
  overfed,
  omelete,
  failed,
}

interface DeadPet {
  name: number;
  deathReason: DeathReason;
  age?: number;
}

interface CurrentPet {
  deadPets: DeadPet[];
  name: number;
  stomach: number;
  status: Status;
  age: number;
}

export class Pet {
  private bot: TalkingBot;
  private stomach: number = 1;
  private timer: Timer;
  private name = 0;
  private status: Status;
  private shield = false;
  private lastFed: Date;
  private campfire: number = 2;
  private age: number = 0;
  private timeout: boolean = false;
  private petFile: BunFile = Bun.file(__dirname + "/../config/pet.json");
  private createHapbooFile: BunFile = Bun.file(
    __dirname + "/../config/createHapboo",
  );
  private deadPets: DeadPet[] = [];

  constructor(bot: TalkingBot) {
    this.bot = bot;
    this.readPet();
  }

  private startTimeout() {
    this.timeout = true;
    setTimeout(() => {
      this.timeout = false;
    }, 1000 * 60);
  }
  private restartTickTimer() {
    clearInterval(this.timer);
    this.timer = setInterval(
      () => {
        this.tick();
      },
      15 * 60 * 1000, // 15 minutes
    );
  }

  public graveyard(hapboo?: string) {
    if (this.deadPets.length === 0) {
      this.bot.broadcastMessage("The graveyard is empty for now...");
      return;
    }
    if (hapboo == null) {
      const longestSurvivingHapboos = this.deadPets
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
        .map((value, index, array) => {
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
      this.bot.broadcastMessage(
        `Hapboos lost: ${this.deadPets.length}, longest living Hapboos: ${longestSurvivingHapboos}.`,
      );
      return;
    }
    if (hapboo === "3") {
      this.bot.broadcastMessage("[REDACTED]");
      return;
    }
    const pet = this.deadPets.find((value, index, obj) => {
      return value.name === parseInt(hapboo);
    });
    if (pet == null) {
      this.bot.broadcastMessage(
        `Couldn't find hapboo #${hapboo} in the graveyard`,
      );
      return;
    }
    switch (pet.deathReason) {
      case DeathReason.omelete:
        this.bot.broadcastMessage(`Hapboo #${pet.name} became a 🍳.`);
        return;
      case DeathReason.failed:
        this.bot.broadcastMessage(`Hapboo #${pet.name} couldn't hatch.`);
        return;
      case DeathReason.overfed:
        this.bot.broadcastMessage(
          `Hapboo #${pet.name} became too fat at the age of ${pet.age} streams.`,
        );
        return;
      case DeathReason.starved:
        this.bot.broadcastMessage(
          `Hapboo #${pet.name} starved at the age of ${pet.age} streams.`,
        );
        return;
    }
  }

  public sayStatus(reason: StatusReason) {
    let message = `Hapboo #${this.name}`;
    switch (this.status) {
      case Status.alive:
        switch (reason) {
          case StatusReason.fed:
            message += ` has been given a candy. He is feeling: ${emotes[this.stomach]} . ${this.stomach + 1}/5`;
            break;
          case StatusReason.tick:
            message += ` is feeling: ${emotes[this.stomach]} . ${this.stomach + 1}/5`;
            break;
          case StatusReason.command:
            if (this.lastFed == null) {
              message += ` is feeling: ${emotes[this.stomach]} . ${this.stomach + 1}/5`;
              break;
            }
            message += ` had a candy ${getTimeDifference(this.lastFed, new Date())} ago. He is feeling: ${emotes[this.stomach]} . ${this.stomach + 1}/5`;
            message += ` He is ${this.age} streams old.`;
            break;
        }
        break;
      case Status.dead:
        message += ` is dead.`;
        break;
      case Status.egg:
      case Status.hatching:
        message += ` is ${eggs[this.status]} The campfire is at ${this.campfire}/5 🔥 `;
        message += campfires[this.campfire];
        break;
      default:
        return;
    }
    if (this.status !== Status.dead && this.timer == null)
      message += " He is sleeping.";
    if (this.shield) message += " He is being protected.";
    this.bot.broadcastMessage(message);
  }

  public feed(): boolean {
    if (this.timeout || this.timer == null || this.status !== Status.alive)
      return false;

    this.startTimeout();
    this.stomach++;
    this.lastFed = new Date();

    if (this.stomach >= emotes.length) {
      if (this.shield) {
        this.stomach = 4;
        this.shield = false;
        this.bot.twitch.updateShieldReedem(false);
        return true;
      }
      this.bot.broadcastMessage(`Hapboo #${this.name} became too fat.`);
      this.die(DeathReason.overfed);
      return false;
    }
    this.sayStatus(StatusReason.fed);
    this.restartTickTimer();
    return false;
  }

  public activateShield(): boolean {
    if (this.shield) return false;

    this.shield = true;
    this.bot.twitch.updateShieldReedem(true);
    this.bot.broadcastMessage(`Hapboo ${this.name} is now being protected.`);

    return true;
  }

  public sleep() {
    this.bot.twitch.updateShieldReedem(true);
    this.shield = false;
    if (this.status !== Status.dead)
      this.bot.broadcastMessage(`Hapboo #${this.name} is going to sleep!`);
    clearInterval(this.timer);
    this.timer = null;
    this.writePet();
  }

  public fuel(): boolean {
    if (this.timeout || this.timer == null || this.status > Status.hatching)
      return false;
    this.startTimeout();
    this.campfire++;
    if (this.campfire > 5) {
      if (this.shield) {
        this.campfire = 5;
        this.shield = false;
        this.bot.twitch.updateShieldReedem(false);
        return true;
      }
      this.bot.broadcastMessage(
        `The campfire got too hot. Habpoo #${this.name} is now 🍳`,
      );
      this.die(DeathReason.omelete);
      return false;
    }
    this.sayStatus(StatusReason.fed);
    this.restartTickTimer();
  }

  public pet(user: string) {
    if (this.status !== Status.alive) return;
    this.bot.broadcastMessage(`${user} petted Hapboo #${this.name}.`);
  }

  public init(hatch: boolean) {
    if (this.timer != null) return;
    this.bot.twitch.updateShieldReedem(false);
    if (hatch) {
      switch (this.status) {
        case Status.hatching:
          this.status = Status.alive;
          Bun.write(this.createHapbooFile, "a");
          this.stomach = 2;
          this.age = 0;
          break;
        case Status.egg:
          this.status = Status.hatching;
          Bun.write(this.createHapbooFile, "e");
          break;
        case undefined:
        case Status.dead:
          this.name++;
          this.status = Status.egg;
          Bun.write(this.createHapbooFile, "e");
          break;
        case Status.alive:
          this.age++;
          break;
      }
    }
    if (this.timer == null)
      this.timer = setInterval(
        () => {
          this.tick();
        },
        15 * 60 * 1000,
      );
    this.sayStatus(StatusReason.tick);
    this.writePet();
  }

  public die(reason: DeathReason) {
    clearInterval(this.timer);
    this.timer = null;
    this.stomach = 0;
    this.campfire = 2;
    this.status = Status.dead;
    this.deadPets.push({ name: this.name, deathReason: reason, age: this.age });
    this.writePet();
    switch (reason) {
      case DeathReason.starved:
        Bun.write(
          this.createHapbooFile,
          `#${this.name} Starved at the age of ${this.age}`,
        );
        break;
      case DeathReason.overfed:
        Bun.write(
          this.createHapbooFile,
          `#${this.name} became too fat at the age of ${this.age}`,
        );
        break;
      case DeathReason.failed:
        Bun.write(this.createHapbooFile, `#${this.name} Couldn't hatch`);
        break;
      case DeathReason.omelete:
        Bun.write(this.createHapbooFile, `#${this.name} Became an 🍳`);
        break;
    }
  }

  public async readPet() {
    if (!(await this.petFile.exists())) return;
    const pet: CurrentPet = await this.petFile.json();
    this.status = pet.status;
    this.name = pet.name;
    this.stomach = pet.stomach;
    this.deadPets = pet.deadPets;
    if (pet.age != null) this.age = pet.age;
  }

  public async writePet() {
    const currentPet: CurrentPet = {
      name: this.name,
      status: this.status,
      stomach: this.stomach,
      deadPets: this.deadPets,
      age: this.age,
    };
    Bun.write(this.petFile, JSON.stringify(currentPet));
  }

  public tick() {
    if (this.status <= Status.hatching) {
      this.campfire--;
      if (this.campfire == 1) {
        setTimeout(
          () => {
            if (this.campfire != 1) return;
            this.bot.broadcastMessage(
              `Hapboo #${this.name}: PLEEASSE IM COLD PLEAAASEEEE KEEP ME WARM PLEASEEEEEEEEEEEEEEE USING !pet fuel.`,
            );
          },
          14 * 60 * 1000,
        );
      } else if (this.campfire <= 0) {
        this.bot.broadcastMessage(
          `The campfire got too cold. Habpoo #${this.name} is now dead`,
        );
        this.die(DeathReason.failed);
        this.writePet();
        return;
      }
      this.sayStatus(StatusReason.tick);
      this.writePet();

      return;
    }
    if (this.status === Status.alive && this.stomach === 0) {
      this.bot.broadcastMessage(`Hapboo #${this.name} has starved.`);
      this.die(DeathReason.starved);
      this.writePet();
      return;
    }
    this.stomach--;
    if (this.stomach == 0) {
      setTimeout(
        () => {
          if (this.stomach != 0) return;
          this.bot.broadcastMessage(
            `Hapboo #${this.name}: PLEEASSE IM HUNGRY PLEAAASEEEE FEED ME PLEASEEEEEEEEEEEEEEE USING !pet feed.`,
          );
        },
        14 * 60 * 1000,
      );
    }
    this.sayStatus(StatusReason.tick);
  }
}
