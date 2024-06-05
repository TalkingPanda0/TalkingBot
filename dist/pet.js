"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pet = exports.StatusReason = exports.Status = void 0;
const talkingbot_1 = require("./talkingbot");
const emotes = [
    "sweetb35Stunky he is getting hungry",
    "sweetb35Shy",
    "sweetb35Sexy",
    "sweetb35Heheh",
    "sweetb35HNNNGH he is a bit too full",
];
const eggs = ["🥚", "🐣"];
var Status;
(function (Status) {
    Status[Status["egg"] = 0] = "egg";
    Status[Status["hatching"] = 1] = "hatching";
    Status[Status["alive"] = 2] = "alive";
    Status[Status["dead"] = 3] = "dead";
})(Status || (exports.Status = Status = {}));
var StatusReason;
(function (StatusReason) {
    StatusReason[StatusReason["fed"] = 0] = "fed";
    StatusReason[StatusReason["tick"] = 1] = "tick";
    StatusReason[StatusReason["command"] = 2] = "command";
})(StatusReason || (exports.StatusReason = StatusReason = {}));
var DeathReason;
(function (DeathReason) {
    DeathReason[DeathReason["starved"] = 0] = "starved";
    DeathReason[DeathReason["overfed"] = 1] = "overfed";
    DeathReason[DeathReason["omelete"] = 2] = "omelete";
    DeathReason[DeathReason["failed"] = 3] = "failed";
})(DeathReason || (DeathReason = {}));
class Pet {
    bot;
    stomach = 1;
    timer;
    name = 0;
    status;
    lastFed;
    campfire = 2;
    age = 0;
    timeout = false;
    petFile = Bun.file(__dirname + "/../config/pet.json");
    createHapbooFile = Bun.file(__dirname + "/../config/createHapboo");
    deadPets = [];
    constructor(bot) {
        this.bot = bot;
        this.readPet();
    }
    startTimeout() {
        this.timeout = true;
        setTimeout(() => {
            this.timeout = false;
        }, 1000 * 60);
    }
    graveyard() {
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
    sayStatus(reason) {
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
                        message += ` had a candy ${(0, talkingbot_1.getTimeDifference)(this.lastFed, new Date())} ago. He is feeling: ${emotes[this.stomach]} . ${this.stomach + 1}/5`;
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
                if (this.campfire > 4)
                    message += "He is getting a bit too warm";
                break;
            default:
                return;
        }
        if (this.status !== Status.dead && this.timer == null)
            message += " He is sleeping.";
        this.bot.twitch.say(message);
    }
    feed() {
        if (this.timeout || this.timer == null || this.status !== Status.alive)
            return;
        this.startTimeout();
        this.stomach++;
        this.lastFed = new Date();
        if (this.stomach >= emotes.length) {
            this.bot.twitch.say(`Hapboo #${this.name} became too fat.`);
            this.die(DeathReason.overfed);
            return;
        }
        this.sayStatus(StatusReason.fed);
    }
    sleep() {
        if (this.status !== Status.dead)
            this.bot.twitch.say(`Hapboo #${this.name} is going to sleep!`);
        clearInterval(this.timer);
        this.timer = null;
        this.writePet();
    }
    fuel() {
        if (this.timeout || this.timer == null || this.status > Status.hatching)
            return;
        this.startTimeout();
        this.campfire++;
        if (this.campfire > 5) {
            this.bot.twitch.say(`The campfire got too hot. Habpoo #${this.name} is now 🍳`);
            this.die(DeathReason.omelete);
            return;
        }
        this.sayStatus(StatusReason.fed);
    }
    pet(user) {
        if (this.status !== Status.alive)
            return;
        this.bot.twitch.say(`${user} petted Hapboo #${this.name}.`);
    }
    init(hatch) {
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
            this.timer = setInterval(() => {
                this.tick();
            }, 15 * 60 * 1000);
        this.sayStatus(StatusReason.tick);
        this.writePet();
    }
    die(reason) {
        clearInterval(this.timer);
        this.timer = null;
        this.stomach = 0;
        this.campfire = 2;
        this.status = Status.dead;
        this.deadPets.push({ name: this.name, deathReason: reason, age: this.age });
        this.writePet();
        switch (reason) {
            case DeathReason.starved:
                Bun.write(this.createHapbooFile, `#${this.name} Starved at the age of ${this.age}`);
                break;
            case DeathReason.overfed:
                Bun.write(this.createHapbooFile, `#${this.name} became too fat at the age of ${this.age}`);
                break;
            case DeathReason.failed:
                Bun.write(this.createHapbooFile, `#${this.name} Couldn't hatch`);
                break;
            case DeathReason.omelete:
                Bun.write(this.createHapbooFile, `#${this.name} Became an 🍳`);
                break;
        }
    }
    async readPet() {
        if (!(await this.petFile.exists()))
            return;
        const pet = await this.petFile.json();
        this.status = pet.status;
        this.name = pet.name;
        this.stomach = pet.stomach;
        this.deadPets = pet.deadPets;
        if (pet.age != null)
            this.age = pet.age;
    }
    async writePet() {
        const currentPet = {
            name: this.name,
            status: this.status,
            stomach: this.stomach,
            deadPets: this.deadPets,
            age: this.age,
        };
        Bun.write(this.petFile, JSON.stringify(currentPet));
    }
    tick() {
        if (this.status <= Status.hatching) {
            this.campfire--;
            if (this.campfire <= 0) {
                this.bot.twitch.say(`The campfire got too cold. Habpoo #${this.name} is now dead`);
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
exports.Pet = Pet;
