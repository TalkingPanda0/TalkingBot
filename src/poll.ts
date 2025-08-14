import { Namespace } from "socket.io";

export interface PollOption {
  id: number;
  label: string;
  score: number;
}

abstract class PollMethod {
  public duration: number = 0;
  public currentTitle?: string;
  public iopoll: Namespace;
  public options: PollOption[] = [];
  public onPollEnd: (results: PollOption[]) => void | Promise<void> = () => {};
  private pollTimer: Timer | null = null;
  constructor(iopoll: Namespace) {
    this.iopoll = iopoll;
  }
  public getStartMessage(): string {
    return "";
  }
  public startPoll(
    onPollEnd: (results: PollOption[]) => void | Promise<void>,
    message: string,
  ): string {
    this.onPollEnd = onPollEnd;
    const delimeterIndex = message.indexOf(":");
    this.currentTitle = message.slice(0, delimeterIndex);
    const args = message.slice(delimeterIndex + 2).split(",");
    // Duration in seconds.
    this.duration = parseInt(args.pop() || "") * 1000;
    if (isNaN(this.duration)) throw "Failed to parse duration.";

    args.forEach((option, index) => {
      this.options.push({ id: index + 1, label: option, score: 0 });
    });

    this.iopoll.emit("createPoll", {
      duration: this.duration,
      options: this.options,
      title: this.currentTitle,
    });

    this.pollTimer = setTimeout(() => {
      this.endPoll();
    }, this.duration);
    return this.getStartMessage();
  }
  public addVote(_user: string, _args: string): string {
    this.updatePoll();
    return "";
  }
  public getScores(): PollOption[] {
    return [];
  }
  public updatePoll() {
    this.iopoll.emit("updatePoll", this.getScores());
  }

  public cleanUp() {}

  public endPoll() {
    const scores = this.getScores();
    this.onPollEnd(scores);
    this.iopoll.emit("pollEnd");
    this.options.length = 0;
    if (this.pollTimer) clearTimeout(this.pollTimer);
    this.cleanUp();
  }
}

class FPPPoll extends PollMethod {
  private votes = new Map<string, number>();

  public getStartMessage(): string {
    return `POLL: ${this.currentTitle}? ${this.options.map((option) => `${option.id}: ${option.label}`).join(", ")}. vote by doing !vote [number]. ends in ${this.duration / 1000} seconds`;
  }
  public addVote(user: string, args: string): string {
    const id = parseInt(args);
    if (isNaN(id)) return "NaN.";
    const option = this.options.find((option) => option.id == id);
    if (option == undefined) return `Can't find option ${id}`;
    this.votes.set(user, id);
    this.updatePoll();
    return `You have voted for ${option.label}.`;
  }
  public getScores(): PollOption[] {
    return this.options.map((option) => {
      return {
        id: option.id,
        label: option.label,
        score: Array.from(this.votes.values()).reduce((prev: number, curr) => {
          if (curr == option.id) return prev + 1;
          return prev;
        }, 0),
      };
    });
  }
  public cleanUp() {
    this.votes.clear();
  }
}

class ScorePoll extends PollMethod {
  private votes = new Map<string, number[]>();
  public getStartMessage(): string {
    return `POLL: ${this.currentTitle}? ${this.options.map((option) => `${option.id}: ${option.label}`).join(", ")}. vote by doing !vote [number] -/0/+. or vote for all options by doing !vote + - 0..., ends in ${this.duration / 1000} seconds.`;
  }

  public addVote(user: string, args: string): string {
    const parts = args.split(" ");

    const userVotes =
      this.votes.get(user) || Array(this.options.length).fill(0);

    if (parts.length === 2) {
      const id = parseInt(parts[0]);
      const score = parts[1];
      if (
        isNaN(id) ||
        !["+", "-", "0"].includes(score) ||
        this.options.find((option) => option.id == id) == undefined
      ) {
        return "Invalid vote format. Use [number] -/0/+ to vote for a specific option.";
      }
      userVotes[id - 1] = score === "+" ? 1 : score === "-" ? -1 : 0;
    } else {
      const scores = parts.map((score) => {
        if (score === "+") return 1;
        if (score === "-") return -1;
        if (score === "0") return 0;
        return NaN;
      });
      if (scores.length !== this.options.length || scores.some(isNaN)) {
        return "Invalid vote format. Please use +, -, or 0 for each option.";
      }
      this.votes.set(user, scores);
    }
    this.updatePoll();
    return "Your vote has been recorded.";
  }
  public getScores(): PollOption[] {
    return this.options.map((option, index) => {
      return {
        id: option.id,
        label: option.label,
        score: Array.from(this.votes.values()).reduce(
          (total, userVotes) => total + userVotes[index],
          0,
        ),
      };
    });
  }
  public cleanUp() {
    this.votes.clear();
  }
}

export class Poll {
  private iopoll: Namespace;
  private currentMethod?: PollMethod;
  private pollMethods: Map<string, PollMethod>;
  public constructor(iopoll: Namespace) {
    this.iopoll = iopoll;
    this.pollMethods = new Map<string, PollMethod>([
      ["fpp", new FPPPoll(this.iopoll)],
      ["score", new ScorePoll(this.iopoll)],
    ]);
  }
  public startPoll(
    message: string,
    onPollEnd: (results: PollOption[]) => void | Promise<void>,
  ): string {
    if (this.currentMethod != null) throw "A poll is already running.";
    const args = message.split(" ");

    const methodName = args.shift();
    if (methodName == undefined) throw "Can't get method name";
    const method = this.pollMethods.get(methodName);
    if (method == null) throw "Poll method not found.";
    this.currentMethod = method;
    try {
      const response = this.currentMethod.startPoll((results: PollOption[]) => {
        this.currentMethod = undefined;
        onPollEnd(results);
      }, args.join(" "));
      return response;
    } catch (error) {
      this.currentMethod = undefined;
      throw error;
    }
  }
  public addVote(user: string, message: string): string {
    console.log(`${user} voted for ${message}`);
    if (this.currentMethod == null) throw "no poll.";
    try {
      const response = this.currentMethod.addVote(user, message);
      return response;
    } catch (error) {
      throw error;
    }
  }
  public endPoll() {
    if (this.currentMethod == null) throw "no poll";
    this.currentMethod.endPoll();
  }
}
