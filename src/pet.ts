import { BunFile } from "bun";
import { TalkingBot, getTimeDifference } from "./talkingbot";

const emotes = [
  "sweetb35Stunky he is getting hungry",
  "sweetb35Sexy",
  "sweetb35Heheh",
  "sweetb35HNNNGH he is a bit too full",
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
  private lastFed: Date;
  private campfire: number = 2;
  private age: number = 0;
	private timeout: boolean = false;
  private petFile: BunFile = Bun.file(__dirname + "/../config/pet.json");
  private deadPets: DeadPet[] = [];

  constructor(bot: TalkingBot) {
    this.bot = bot;
    this.readPet();
  }

	private startTimeout(){
		this.timeout = true;
		setTimeout(() => {
			this.timeout = false;
		},1000 * 60);
	}

  public graveyard() {
    if (this.deadPets.length === 0) {
      this.bot.twitch.say(this.bot.twitch.channel.name);
      return;
    }
    const message = this.deadPets.map((pet) => {
      switch (pet.deathReason) {
        case DeathReason.omelete:
          return `Hapboo #${pet.name} became a 🍳.`;
        case DeathReason.failed:
          return `Hapboo #${pet.name} couldn't hatch.`;
        case DeathReason.overfed:
          return `Hapboo #${pet.name} became too fat at the age of ${pet.age} streams.`;
        case DeathReason.starved:
          return `Hapboo #${pet.name} starved at the age of ${pet.age} streams.`;
      }
    });

    this.bot.twitch.say(message.join(" "));
  }

  public sayStatus(reason: StatusReason) {
    let message = `Hapboo #${this.name}`;
    switch (this.status) {
      case Status.alive:
        switch (reason) {
          case StatusReason.fed:
            message += ` has been given a candy. He is feeling: ${emotes[this.stomach]}.`;
            break;
          case StatusReason.tick:
            message += ` is feeling: ${emotes[this.stomach]}.`;
            break;
          case StatusReason.command:
            if (this.lastFed == null) {
              message += ` is feeling: ${emotes[this.stomach]}.`;
              break;
            }
            message += ` had a candy ${getTimeDifference(this.lastFed, new Date())} ago. He is feeling: ${emotes[this.stomach]}`;
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
        if (this.campfire > 3) message += "He is getting a bit too warm";
        break;
      default:
        return;
    }
    if (this.status !== Status.dead && this.timer == null)
      message += " He is sleeping.";
    this.bot.twitch.say(message);
  }

  public feed() {
    if (this.timeout || this.timer == null || this.status !== Status.alive) return;
		this.startTimeout();

    if (this.stomach >= 3) {
      this.bot.twitch.say(`Hapboo #${this.name} became too fat.`);
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
      this.bot.twitch.say(`Hapboo #${this.name} is going to sleep!`);
    clearInterval(this.timer);
    this.timer = null;
    this.writePet();
  }

  public fuel() {
    if (this.timeout || this.timer == null || this.status > Status.hatching) return;
		this.startTimeout();
    this.campfire += 2;
    if (this.campfire > 5) {
      this.bot.twitch.say(
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
        this.age = 0;
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
        this.age++;
        break;
    }
    if (this.timer == null)
      this.timer = setInterval(
        () => {
          this.tick();
        },
        15 * 60 * 1000, // 15 minutes
      );
    this.sayStatus(StatusReason.tick);
  }

  public die(reason: DeathReason) {
    clearInterval(this.timer);
    this.timer = null;
    this.stomach = 0;
    this.campfire = 2;
    this.status = Status.dead;
    this.deadPets.push({ name: this.name, deathReason: reason, age: this.age });
    this.writePet();
  }

  private async readPet() {
    if (!(await this.petFile.exists())) return;
    const pet: CurrentPet = await this.petFile.json();
    this.status = pet.status;
    this.name = pet.name;
    this.stomach = pet.stomach;
    this.deadPets = pet.deadPets;
    if (pet.age != null) this.age = pet.age;
  }

  private async writePet() {
    const currentPet: CurrentPet = {
      name: this.name,
      status: this.status,
      stomach: this.stomach,
      deadPets: this.deadPets,
      age: this.age,
    };
    Bun.write(this.petFile, JSON.stringify(currentPet));
  }

  private tick() {
    if (this.status <= Status.hatching) {
      this.campfire--;
      if (this.campfire <= 0) {
        this.bot.twitch.say(
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
      this.bot.twitch.say(`Hapboo #${this.name} has starved.`);
      this.die(DeathReason.starved);
      this.writePet();
      return;
    }
    this.stomach--;
    this.sayStatus(StatusReason.tick);
  }
}
