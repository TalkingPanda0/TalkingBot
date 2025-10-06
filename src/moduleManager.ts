import {
  BotModule,
  MessageListener,
  ModuleContext,
  MessageData,
  DiscordMessageListener,
} from "botModule";

import { Command } from "./commands";
import { TalkingBot } from "./talkingbot";
import fs from "node:fs/promises";
import path from "path";
import { toPascalCase } from "./util";
import { Message } from "discord.js";

const modulesDir = path.resolve(__dirname, "../config/modules");

export class ModuleManager {
  private modules: Map<
    string,
    { module: BotModule; cleanups: Function[] } | null
  >;
  private messageListeners: MessageListener[];
  private discordMessageListeners: DiscordMessageListener[];
  private bot: TalkingBot;

  constructor(bot: TalkingBot) {
    this.bot = bot;
    this.modules = new Map();
    this.messageListeners = [];
    this.discordMessageListeners = [];
  }

  public onChatMessage(data: MessageData) {
    this.messageListeners.forEach((l) => l(data));
  }
  public onDiscordMessage(data: Message) {
    this.discordMessageListeners.forEach((l) => l(data));
  }

  private createModuleTemplate(name: string): string {
    const Name = toPascalCase(name);
    return `import { BotModule, ModuleContext } from "botModule";

class ${Name} extends BotModule {
  name: string = "${name}";

  async init(ctx: ModuleContext) {
    // Add commands and listeners here.
    super.init(ctx);
  }
}

export default ${Name};`;
  }

  public async getModuleFile(name: string): Promise<string> {
    const module = this.modules.get(name);
    const modPath = path.join(modulesDir, `${name}.ts`);

    switch (module) {
      case undefined:
        return this.createModuleTemplate(name);
      case null:
        return await Bun.file(`${modPath}.disabled`).text();
      default:
        return await Bun.file(modPath).text();
    }
  }
  public async reloadModule(module: string) {
    await this.disableModule(module);
    await this.enableModule(module);
  }

  public async setModuleFile(name: string, module: string) {
    const modPath = path.join(
      modulesDir,
      `${name}.ts${this.modules.get(name) === null ? ".disabled" : ""}`,
    );
    await Bun.write(modPath, module);
    await this.loadModules();
    await this.reloadModule(name);
  }

  public getModuleStatus(module: string): boolean {
    return this.modules.get(module) != null;
  }

  public getModuleList(): { module: string; enabled: boolean }[] {
    return Array.from(this.modules).map((module) => ({
      module: module[0],
      enabled: module[1] != null,
    }));
  }

  private getContext(): {
    context: ModuleContext;
    cleanups: Function[];
  } {
    const cleanups: Function[] = [];

    const addCommand = (name: string, command: Command): boolean => {
      return this.bot.commandHandler.addCommand(name, command);
    };
    const removeCommand = (name: string): boolean => {
      return this.bot.commandHandler.removeCommand(name);
    };

    const addListener = (listener: MessageListener) => {
      this.messageListeners.push(listener);
    };
    const removeListener = (listener: MessageListener) => {
      this.messageListeners = this.messageListeners.filter(
        (l) => l !== listener,
      );
    };

    const addDiscordListener = (listener: DiscordMessageListener) => {
      this.discordMessageListeners.push(listener);
    };
    const removeDisordListener = (listener: DiscordMessageListener) => {
      this.discordMessageListeners = this.discordMessageListeners.filter(
        (l) => l !== listener,
      );
    };

    const context: ModuleContext = {
      bot: this.bot,
      onChatMessage(listener) {
        addListener(listener);
        cleanups.push(() => {
          removeListener(listener);
        });
      },
      onDiscordMessage(listener) {
        addDiscordListener(listener);
        cleanups.push(() => {
          removeDisordListener(listener);
        });
      },

      registerCommand(name, command) {
        if (addCommand(name, command)) {
          cleanups.push(() => {
            removeCommand(name);
          });
        }
      },
    };
    return { context, cleanups };
  }

  private async loadModule(name: string) {
    try {
      const modPath = path.join(modulesDir, `${name}.ts`);
      const { default: moduleConstructor } = await import(
        `${modPath}?update=${Date.now()}`
      );
      const module: BotModule = new moduleConstructor();
      if (!module) return;
      const context = this.getContext();
      this.modules.set(name, { module, cleanups: context.cleanups });
      await module.init(context.context);
    } catch (e) {
      console.error(`Error loading module, ${name}: ${e}`);
    }
  }

  private loadDisabledModule(name: string) {
    this.modules.set(name, null);
  }

  public async loadModules() {
    const enabledModules: string[] = [];
    const disabledModules: string[] = [];

    (await fs.readdir(modulesDir)).forEach((file) => {
      if (file.endsWith("ts")) enabledModules.push(file.replace(/\.ts$/, ""));
      else if (file.endsWith("disabled"))
        disabledModules.push(file.replace(/\.ts\.disabled$/, ""));
    });

    for (const module of enabledModules.filter((m) => !this.modules.has(m)))
      await this.loadModule(module);
    for (const module of disabledModules.filter((m) => !this.modules.has(m)))
      this.loadDisabledModule(module);
  }

  public async enableModule(name: string) {
    const file = `${name}.ts.disabled`;
    const newFile = `${name}.ts`;
    const modPath = path.join(modulesDir, file);
    const newPath = path.join(modulesDir, newFile);

    if (await Bun.file(modPath).exists()) await fs.rename(modPath, newPath);

    await this.loadModule(name);
  }

  public async disableModule(name: string) {
    const module = this.modules.get(name);
    if (!module) return;
    module.cleanups.forEach((cleanup) => cleanup());
    module.module.onUnload();
    this.loadDisabledModule(name);

    const modPath = path.join(modulesDir, `${name}.ts`);
    const newPath = path.join(modulesDir, `${name}.ts.disabled`);
    await fs.rename(modPath, newPath);
  }

  public async deleteModule(name: string) {
    await this.disableModule(name);
    await fs.rm(path.join(modulesDir, `${name}.ts.disabled`));
    this.modules.delete(name);
  }

  public async init() {
    await this.loadModules();
  }
}
