import { BunFile } from "bun";
import { TalkingBot, getTimeDifference } from "./talkingbot";

const emotes = [
  "sweetb35Stunky",
  "sweetb35Sexy",
  "sweetb35Heheh",
  "sweetb35HNNNGH",
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
}

interface CurrentPet {
  deadPets: DeadPet[];
  name: number;
  stomach: number;
  status: Status;
}

export class Pet {
  private bot: TalkingBot;
  private stomach: number = 1;
  private timer: Timer;
  private name = 0;
  private status: Status;
  private lastFed: Date;
  private campfire: number = 2;
  private petFile: BunFile = Bun.file(__dirname + "/../config/pet.json");
  private deadPets: DeadPet[] = [];

  constructor(bot: TalkingBot) {
    this.bot = bot;
    this.readPet();
  }

  public graveyard() {
    if (this.deadPets.length === 0) {
      this.bot.twitch.chatClient.say(
        this.bot.twitch.channel.name,
        "The graveyard is empty... for now.",
      );
      return;
    }
    const message = this.deadPets.map((pet) => {
      switch (pet.deathReason) {
        case DeathReason.omelete:
          return `Hapboo #${pet.name} became a 🍳.`;
        case DeathReason.failed:
          return `Hapboo #${pet.name} couldn't hatch.`;
        case DeathReason.overfed:
          return `Hapboo #${pet.name} became too fat.`;
        case DeathReason.starved:
          return `Hapboo #${pet.name} has starved.`;
      }
    });

    this.bot.twitch.chatClient.say(
      this.bot.twitch.channel.name,
      message.join(" "),
    );
  }

  public sayStatus(reason: StatusReason) {
    let message = `Hapboo #${this.name}`;
    switch (this.status) {
      case Status.alive:
        switch (reason) {
          case StatusReason.fed:
            message += ` has been given a candy. He is feeling: ${emotes[this.stomach]}`;
            break;
          case StatusReason.tick:
            message += ` is feeling: ${emotes[this.stomach]}`;
            break;
          case StatusReason.command:
            message += ` had a candy ${getTimeDifference(this.lastFed, new Date())} ago. He is feeling: ${emotes[this.stomach]}`;
            break;
        }
        break;
      case Status.dead:
        message += ` is dead.`;
        break;
      case Status.egg:
      case Status.hatching:
        message += ` is ${eggs[this.status]} The campfire is at ${this.campfire}/5 🔥 `;
        break;
      default:
        return;
    }
    if (this.status === Status.alive && this.timer === undefined)
      message += " He is sleeping.";
    this.bot.twitch.chatClient.say(this.bot.twitch.channel.name, message);
  }

  public feed() {
    if (this.stomach >= 3) {
      this.bot.twitch.chatClient.say(
        this.bot.twitch.channel.name,
        `Hapboo #${this.name} became too fat.`,
      );
      this.die(DeathReason.overfed);
      return;
    }
    if (this.status === Status.alive) {
      this.stomach++;
      this.lastFed = new Date();
    }
    this.sayStatus(StatusReason.fed);
  }

  public sleep() {
    if (this.status === Status.alive)
      this.bot.twitch.chatClient.say(
        this.bot.twitch.channel.name,
        `Hapboo #${this.name} is going to sleep!`,
      );
    clearInterval(this.timer);
    this.timer = undefined;
    this.writePet();
  }

  public fuel() {
    if (this.status > Status.hatching) return;
    this.campfire += 2;
    if (this.campfire >= 5) {
      this.bot.twitch.chatClient.say(
        this.bot.twitch.channel.name,
        `The campfire got too hot. Habpoo #${this.name} is now 🍳`,
      );
      this.die(DeathReason.omelete);
      return;
    }
    this.sayStatus(StatusReason.fed);
  }

  public init() {
    switch (this.status) {
      case Status.hatching:
        this.status = Status.alive;
        this.stomach = 1;
        break;
      case Status.egg:
        this.status = Status.hatching;
        break;
      case undefined:
      case Status.dead:
        this.name++;
        this.status = Status.egg;
        break;
      case Status.alive:
        break;
    }
    this.sayStatus(StatusReason.tick);
    if (this.timer === undefined)
      this.timer = setInterval(
        () => {
          this.tick();
        },
        30 * 60 * 1000, // 30 minutes
      );
  }

  public die(reason: DeathReason) {
    clearInterval(this.timer);
    this.timer = undefined;
    this.stomach = 0;
    this.status = Status.dead;
    this.deadPets.push({ name: this.name, deathReason: reason });
    this.writePet();
  }

  private async readPet() {
    if (!(await this.petFile.exists())) return;
    const pet: CurrentPet = await this.petFile.json();
    this.status = pet.status;
    this.name = pet.name;
    this.stomach = pet.stomach;
    this.deadPets = pet.deadPets;
  }

  private async writePet() {
    const currentPet: CurrentPet = {
      name: this.name,
      status: this.status,
      stomach: this.stomach,
      deadPets: this.deadPets,
    };
    Bun.write(this.petFile, JSON.stringify(currentPet));
  }

  private tick() {
    if (this.status <= Status.hatching) {
      this.campfire--;
      if (this.campfire <= 0) {
        this.bot.twitch.chatClient.say(
          this.bot.twitch.channel.name,
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
      this.bot.twitch.chatClient.say(
        this.bot.twitch.channel.name,
        `Hapboo #${this.name} has starved.`,
      );
      this.die(DeathReason.starved);
      this.writePet();
      return;
    }
    this.stomach--;
    this.sayStatus(StatusReason.tick);
  }
}
