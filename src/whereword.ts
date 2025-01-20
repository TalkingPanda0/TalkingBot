import { getRandomElement } from "./util";

enum Difficulty {
  Easy,
  Medium,
  Hard,
  Insane,
}
interface PlayerData {
  word: string;
  difficulty: Difficulty;
  guessedBy: string[];
  guessed: boolean;
  times: number;
}
export class WhereWord {
  private players = new Map<string, PlayerData>();
  private easyWords: string[];
  private mediumWords: string[];
  private hardWords: string[];
  private insaneWords: string[];

  async loadWords() {
    this.easyWords = await Bun.file(
      __dirname + "/../config/words/easyWords.json",
    ).json();
    this.mediumWords = await Bun.file(
      __dirname + "/../config/words/mediumWords.json",
    ).json();
    this.hardWords = await Bun.file(
      __dirname + "/../config/words/hardWords.json",
    ).json();
    this.insaneWords = await Bun.file(
      __dirname + "/../config/words/insaneWords.json",
    ).json();
    console.log("Loaded Words");
    console.log(`${this.easyWords.length} easy words`);
    console.log(`${this.mediumWords.length} medium words`);
    console.log(`${this.hardWords.length} hard words`);
    console.log(`${this.insaneWords.length} insane words`);
  }

  constructor() {}

  public async init() {
    await this.loadWords();
  }

  public playerJoin(name: string, difficulty: string): string {
    if (difficulty == null) throw new Error("No difficulty was given.");
    if (this.players.has(name))
      throw new Error(`${name}, You already joined this stream.`);
    let data: PlayerData = {
      guessed: false,
      guessedBy: [],
      times: 0,
      word: "",
      difficulty: Difficulty.Easy,
    };

    switch (difficulty.toLowerCase()) {
      case "easy":
        data.word = getRandomElement(this.easyWords);
        data.difficulty = Difficulty.Easy;
        break;
      case "medium":
        data.word = getRandomElement(this.mediumWords);
        data.difficulty = Difficulty.Medium;
        break;
      case "hard":
        data.word = getRandomElement(this.hardWords);
        data.difficulty = Difficulty.Hard;
        break;
      case "insane":
        data.word = getRandomElement(this.insaneWords);
        data.difficulty = Difficulty.Insane;
        break;
      default:
        throw new Error(`Unknown difficulty ${difficulty}.`);
    }
    this.players.set(name, data);
    return data.word;
  }

  public guess(guesser: string, name: string, word: string): string {
    if (!word || !name) return "Usage !whereword guess name word";
    const player = this.getPlayer(name);
    if (player == null) return `@${name} is not playing the game.`;
    if (player.guessed) return `@${name}'s word was already guessed.`;
    if (player.guessedBy.includes(guesser))
      return `You already guessed @${name}'s word this stream.`;
    let message = "";
    if (player.word == word.trim().toLowerCase()) {
      player.guessed = true;
      player.guessedBy = [guesser];
      player.times = 0;
      message = `Congrulations @${guesser}, you guessed @${name}'s word correctly! their word was ${player.word}.`;
    } else {
      player.guessedBy.push(guesser);
      message = `No @${guesser}, @${name}'s word is not ${word}.`;
    }
    return message;
  }

  public getPlayer(name: string): PlayerData | null {
    return this.players.get(name) ?? null;
  }

  public proccesMessage(name: string, message: string) {
    const player = this.getPlayer(name);
    if (player == null || player.guessed) return;
    const wordRegex = new RegExp(player.word, "gi");
    const times = (message.match(wordRegex) || []).length;
    player.times += times;
  }

  public getWinner(): { name: string; data: PlayerData } | null {
    if (this.players.size == 0) {
      return null;
    }
    let winner: { name: string; data: PlayerData };
    for (const [name, data] of this.players) {
      if (
        !winner ||
        data.times + data.difficulty * 10 >
          winner.data.times + winner.data.difficulty * 10
      ) {
        winner = { name, data };
      }
    }
    if (winner.data.times == 0) return null;
    return winner;
  }

  public resetPlayer(name: string) {
    this.players.delete(name);
  }

  public clearGame() {
    this.players.clear();
  }

  public endGame(): string {
    const winner = this.getWinner();

    let result = "";

    if (winner != null) {
      result = "No one won this stream's whereword. You noobs.";
    } else {
      result = `@${winner.name} won this stream's whereword congrulations!!!1!. Their word was "${winner.data.word}", they have used it ${winner.data.times} times during the stream without getting caught.`;
    }

    this.clearGame();
    return result;
  }
}
