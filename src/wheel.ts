import { Server } from "socket.io";
import * as http from "http";
import { BunFile } from "bun";
import { userColors } from "./twitch";
import { getRandomElement } from "./talkingbot";

interface WheelSegment {
  weight: number;
  size?: number;
  text: string;
  fillStyle?: string;
}

export class Wheel {
  private iowheel: Server;
  private wheelSegments: WheelSegment[] = [];
  private wheelFile: BunFile = Bun.file(__dirname + "/../config/wheel.json");

  constructor(server: http.Server) {
    this.readWheel();
    this.iowheel = new Server(server, {
      path: "/wheel/",
    });

    this.iowheel.on("connect", (socket) => {
      socket.emit("createWheel", this.calculateWheel());
    });
  }

  private calculateWheel(): WheelSegment[] {
    const multiplier =
      360 /
      this.wheelSegments.reduce((sum, value) => {
        return (sum += value.weight);
      }, 0);

    const calculatedSegments = this.wheelSegments;
    calculatedSegments.forEach((value) => {
      value.size = value.weight * multiplier;
    });

    return calculatedSegments;
  }

  private async writeWheel() {
    await Bun.write(this.wheelFile, JSON.stringify(this.wheelSegments));
  }

  public async readWheel() {
    this.wheelSegments = await this.wheelFile.json();
    if (this.wheelSegments == null) this.wheelSegments = [];
  }

  public addSegment(text: string, weight: number, fillStyle?: string) {
    if (fillStyle == null) fillStyle = getRandomElement(userColors);

    this.wheelSegments.push({
      text: text,
      fillStyle: fillStyle,
      weight: weight,
    });
    this.writeWheel();
    this.updateWheel();
  }

  public removeSegment(text: string): boolean {
    const oldLength = this.wheelSegments.length;
    this.wheelSegments = this.wheelSegments.filter((value) => {
      return value.text != text;
    });
    if (this.wheelSegments.length != oldLength) {
      this.writeWheel();

      this.updateWheel();
      return true;
    }
    return false;
  }

  public updateWheel() {
    this.iowheel.emit("updateWheel", this.calculateWheel());
  }

  public spinWheel() {
    this.iowheel.emit("spinWheel");
  }
  public spinInChat(): string {
    const wheel = this.calculateWheel();
    let index = -1;
    let remanining = Math.random() * 360;
    do {
      index++;
      remanining -= wheel[index].size;
    } while (remanining > 0);
    return wheel[index].text;
  }
  public toString(weights: boolean): string {
    const calculatedSegments = this.calculateWheel();
    return calculatedSegments
      .map((value) => {
        if (weights) return `${value.text}: ${value.weight}`;
        else return `${value.text}: ${Math.round((value.size / 360) * 100)}%`;
      })
      .join(", ");
  }
}
