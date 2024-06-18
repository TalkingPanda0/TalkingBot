import { Server } from "socket.io";
import * as http from "http";
import { BunFile } from "bun";

interface WheelSegment {
  size: number;
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
        return (sum += value.size);
      }, 0);

    const calculatedSegments = this.wheelSegments;
    calculatedSegments.forEach((value) => {
      value.size *= multiplier;
    });

    return calculatedSegments;
  }

  private async writeWheel() {
    await Bun.write(this.wheelFile, JSON.stringify(this.wheelSegments));
  }

  private async readWheel() {
    this.wheelSegments = await this.wheelFile.json();
    if (this.wheelSegments == null) this.wheelSegments = [];
  }

  public addSegment(text: string, weight: number, fillStyle?: string) {
    console.log(this.wheelSegments);
    this.wheelSegments.push({
      text: text,
      fillStyle: fillStyle,
      size: weight,
    });
    this.writeWheel();
  }

  public removeSegment(text: string) {
    this.wheelSegments = this.wheelSegments.filter((value) => {
      return value.text != text;
    });
    this.writeWheel();
  }

  public updateWheel() {
    this.iowheel.emit("updateWheel", this.calculateWheel());
  }

  public spinWheel() {
    this.iowheel.emit("spinWheel");
  }
}
