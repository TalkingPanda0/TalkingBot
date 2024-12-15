import { BunFile } from "bun";
import { TalkingBot } from "./talkingbot";
import { getTimeDifference } from "./util";

const emotes = [
  "sweetb35Stunky he is getting hungry. Please feed him using !pet feed",
  "sweetb35Shy feed him using !pet feed",
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
  deathDate?: string;
  birthDate?: string;
}

interface CurrentPet {
  birthDate?: string;
  deadPets: DeadPet[];
  name: number;
  stomach: number;
  status: Status;
  age: number;
  murderers: string[];
  slaughterers: string[];
}

export class Pet {
  public currentPet: CurrentPet;

  private bot: TalkingBot;
  private timer: Timer;
  private shield = false;
  private lastFed: Date;
  private campfire: number = 2;
  private timeout: boolean = false;
  private petFile: BunFile = Bun.file(__dirname + "/../config/pet.json");
  private createHapbooFile: BunFile = Bun.file(
    __dirname + "/../config/createHapboo",
  );

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

  public murdererList(): string {
    return `Hapboo murderers: @${this.currentPet.murderers.join(", @")}, Hapbooslaughterers: @${this.currentPet.slaughterers.join(", @")}`;
  }

  public graveyard(hapboo?: string): string {
    if (this.currentPet.deadPets.length === 0) {
      return "The graveyard is empty for now...";
    }
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

  public feedOrFuel(userName: string): boolean {
    if (this.currentPet.status !== Status.dead && this.timer == null) {
      this.bot.broadcastMessage(this.sayStatus(StatusReason.command));
      return false;
    }
    switch (this.currentPet.status) {
      case Status.alive:
        return this.feed(userName);
      case Status.egg:
      case Status.hatching:
        return this.fuel(userName);
      default:
        this.bot.broadcastMessage(this.sayStatus(StatusReason.command));
        return false;
    }
  }

  public sayStatus(reason: StatusReason): string {
    let message = "";
    if (this.currentPet.name <= 0)
      message +=
        "THIS IS TEST BOT NOT REAL HAPBOO. if it wasn't obvious by the name.";
    message += `Hapboo #${this.currentPet.name}`;
    switch (this.currentPet.status) {
      case Status.alive:
        if (reason != StatusReason.command)
          this.bot.iochat.emit("hapboo", {
            name: this.currentPet.name,
            status: this.currentPet.stomach,
          });
        switch (reason) {
          case StatusReason.fed:
            message += ` has been given a candy. He is feeling: ${emotes[this.currentPet.stomach]} . ${this.currentPet.stomach + 1}/5`;
            break;
          case StatusReason.tick:
            message += ` is feeling: ${emotes[this.currentPet.stomach]} . ${this.currentPet.stomach + 1}/5`;
            break;
          case StatusReason.command:
            if (this.lastFed == null)
              message += ` is feeling: ${emotes[this.currentPet.stomach]} . ${this.currentPet.stomach + 1}/5`;
            else
              message += ` had a candy ${getTimeDifference(this.lastFed, new Date())} ago. He is feeling: ${emotes[this.currentPet.stomach]} . ${this.currentPet.stomach + 1}/5`;
            message += ` He is ${this.currentPet.age} streams old.`;
            break;
        }
        break;
      case Status.dead:
        message += ` is dead.`;
        break;
      case Status.egg:
      case Status.hatching:
        if (reason != StatusReason.command)
          this.bot.iochat.emit("hapboo", {
            name: this.currentPet.name,
            status: this.campfire,
          });
        message += ` is ${eggs[this.currentPet.status]} The campfire is at ${this.campfire}/5 🔥 `;
        message += campfires[this.campfire];
        break;
      default:
        return;
    }
    if (this.currentPet.status !== Status.dead && this.timer == null)
      message += " He is sleeping.";
    if (this.shield) message += " He is being protected.";
    return message;
  }

  public feed(userName: string): boolean {
    if (this.currentPet.status !== Status.dead && this.timer == null) {
      this.bot.broadcastMessage(this.sayStatus(StatusReason.command));
      return false;
    }

    if (
      this.timeout ||
      this.timer == null ||
      this.currentPet.status !== Status.alive
    )
      return false;

    this.startTimeout();
    this.currentPet.stomach++;
    this.lastFed = new Date();

    if (this.currentPet.stomach >= emotes.length) {
      if (this.shield) {
        this.currentPet.stomach = 4;
        this.shield = false;
        this.bot.twitch.updateShieldReedem(false);
        return true;
      }
      this.bot.broadcastMessage(
        `Hapboo #${this.currentPet.name} became too fat.`,
      );
      this.die(DeathReason.overfed, userName);
      return false;
    }
    this.bot.broadcastMessage(this.sayStatus(StatusReason.fed));

    this.restartTickTimer();
    return false;
  }

  public activateShield(): boolean {
    if (this.shield) return false;

    this.shield = true;
    this.bot.twitch.updateShieldReedem(true);
    this.bot.broadcastMessage(
      `Hapboo ${this.currentPet.name} is now being protected.`,
    );

    return true;
  }

  public sleep() {
    this.bot.twitch.updateShieldReedem(true);
    this.shield = false;
    if (this.currentPet.status !== Status.dead)
      this.bot.broadcastMessage(
        `Hapboo #${this.currentPet.name} is going to sleep!`,
      );
    clearInterval(this.timer);
    this.timer = null;
    this.writePet();
  }

  public fuel(userName: string): boolean {
    if (this.currentPet.status !== Status.dead && this.timer == null) {
      this.bot.broadcastMessage(this.sayStatus(StatusReason.command));
      return false;
    }

    if (
      this.timeout ||
      this.timer == null ||
      this.currentPet.status > Status.hatching
    )
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
        `The campfire got too hot. Habpoo #${this.currentPet.name} is now 🍳`,
      );
      this.die(DeathReason.omelete, userName);
      return false;
    }

    this.bot.broadcastMessage(this.sayStatus(StatusReason.fed));
    this.restartTickTimer();
  }

  public pet(user: string): string {
    if (this.currentPet.status !== Status.alive) return;

    return `${user} petted Hapboo #${this.currentPet.name}.`;
  }

  public init(hatch: boolean) {
    if (!hatch && this.currentPet.status == Status.dead) return;
    if (this.timer != null) return;
    this.bot.twitch.updateShieldReedem(false);
    if (hatch) {
      switch (this.currentPet.status) {
        case Status.hatching:
          this.currentPet.status = Status.alive;
          Bun.write(this.createHapbooFile, "a");
          this.currentPet.stomach = 2;
          this.currentPet.age = 0;
          break;
        case Status.egg:
          this.currentPet.status = Status.hatching;
          Bun.write(this.createHapbooFile, "e");
          break;
        case undefined:
        case Status.dead:
          this.currentPet.name++;
          this.currentPet.status = Status.egg;
          Bun.write(this.createHapbooFile, "e");
          this.currentPet.birthDate = new Date().toJSON();
          break;
        case Status.alive:
          this.currentPet.age++;
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

    this.bot.broadcastMessage(this.sayStatus(StatusReason.tick));
    this.writePet();
  }

  public die(reason: DeathReason, userName?: string) {
    clearInterval(this.timer);
    this.timer = null;
    this.currentPet.stomach = 0;
    this.campfire = 2;
    this.currentPet.status = Status.dead;
    this.currentPet.deadPets.push({
      name: this.currentPet.name,
      deathReason: reason,
      age: this.currentPet.age,
      birthDate: this.currentPet.birthDate,
      deathDate: new Date().toJSON(),
    });
    this.writePet();
    switch (reason) {
      case DeathReason.starved:
        Bun.write(
          this.createHapbooFile,
          `#${this.currentPet.name} Starved at the age of ${this.currentPet.age}`,
        );
        break;
      case DeathReason.overfed:
        Bun.write(
          this.createHapbooFile,
          `#${this.currentPet.name} became too fat at the age of ${this.currentPet.age}`,
        );
        break;
      case DeathReason.failed:
        Bun.write(
          this.createHapbooFile,
          `#${this.currentPet.name} Couldn't hatch`,
        );
        break;
      case DeathReason.omelete:
        Bun.write(
          this.createHapbooFile,
          `#${this.currentPet.name} Became an 🍳`,
        );
        break;
    }
    if (userName) this.currentPet.murderers.push(userName);
  }

  public async readPet() {
    if (!(await this.petFile.exists())) return;
    this.currentPet = await this.petFile.json();

    if (this.currentPet.age == null) this.currentPet.age = 0;
  }

  public async writePet() {
    Bun.write(this.petFile, JSON.stringify(this.currentPet));
  }

  public tick() {
    if (this.currentPet.status <= Status.hatching) {
      this.campfire--;
      if (this.campfire == 1) {
        setTimeout(
          () => {
            if (this.campfire != 1 || this.timer == null) return;
            this.bot.broadcastMessage(
              `Hapboo #${this.currentPet.name}: PLEEASSE IM COLD PLEAAASEEEE KEEP ME WARM PLEASEEEEEEEEEEEEEEE USING !pet fuel.`,
            );
          },
          14 * 60 * 1000,
        );
      } else if (this.campfire <= 0) {
        this.bot.broadcastMessage(
          `The campfire got too cold. Habpoo #${this.currentPet.name} is now dead`,
        );
        this.die(DeathReason.failed);
        this.writePet();
        return;
      }
      this.bot.broadcastMessage(this.sayStatus(StatusReason.tick));
      this.writePet();

      return;
    }
    if (
      this.currentPet.status === Status.alive &&
      this.currentPet.stomach === 0
    ) {
      this.bot.broadcastMessage(`Hapboo #${this.currentPet.name} has starved.`);
      this.die(DeathReason.starved);
      this.writePet();
      return;
    }
    this.currentPet.stomach--;
    if (this.currentPet.stomach == 0) {
      setTimeout(
        () => {
          if (this.currentPet.stomach != 0) return;
          this.bot.broadcastMessage(
            `Hapboo #${this.currentPet.name}: PLEEASSE IM HUNGRY PLEAAASEEEE FEED ME PLEASEEEEEEEEEEEEEEE USING !pet feed.`,
          );
        },
        14 * 60 * 1000,
      );
    }
    this.bot.broadcastMessage(this.sayStatus(StatusReason.tick));
  }
}
