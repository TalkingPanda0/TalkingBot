import { Namespace } from "socket.io";

export interface TTSData {
  text: string;
  parsedText: string;
  sender: string;
  color: string;
  isImportant: boolean;
}

export class TTSManager {
  public io: Namespace;
  public enabled: boolean;

  public setPause(status: boolean) {
    this.io.emit("pause", status);
  }

  public skip(user: string) {
    this.io.emit("skip", user);
  }

  public send(data: TTSData) {
    if (!this.enabled && !data.isImportant) return;
    this.io.emit("message", data);
  }

  constructor(io: Namespace) {
    this.enabled = false;
    this.io = io;
  }
}
