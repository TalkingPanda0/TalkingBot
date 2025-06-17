import { BunFile } from "bun";
import { userColors } from "./twitch";
import { getRandomElement } from "./util";

interface WheelSegment {
  weight: number;
  text: string;
  fillStyle: string;
}

export class Wheel {
  public wheelSegments: WheelSegment[] = [];
  private wheelFile: BunFile = Bun.file(__dirname + "/../config/wheel.json");

  private calculateWheel(): WheelSegment[] {
    const multiplier =
      360 /
      this.wheelSegments.reduce((sum, segment) => sum + segment.weight, 0);
    return this.wheelSegments.map((segment) => ({
      ...segment,
      weight: segment.weight * multiplier,
    }));
  }

  constructor() {
    this.readWheel();
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
  }

  public removeSegment(text: string): boolean {
    const oldLength = this.wheelSegments.length;
    this.wheelSegments = this.wheelSegments.filter((value) => {
      return value.text != text;
    });
    if (this.wheelSegments.length != oldLength) {
      this.writeWheel();
      return true;
    }
    return false;
  }

  public spinInChat(): string {
    const wheel = this.calculateWheel();
    let index = -1;
    let remanining = Math.random() * 360;
    do {
      index++;
      remanining -= wheel[index].weight;
    } while (remanining > 0);
    return wheel[index].text;
  }

  public toString(weights: boolean): string {
    const wheel = weights ? this.wheelSegments : this.calculateWheel();
    return wheel
      .map((value) => {
        if (weights) return `${value.text}: ${value.weight}`;
        else return `${value.text}: ${Math.round((value.weight / 360) * 100)}%`;
      })
      .join(", ");
  }
}
