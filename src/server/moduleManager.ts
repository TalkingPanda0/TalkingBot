import {
  BotModule,
  MessageListener,
  ModuleContext,
  MessageData,
  DiscordMessageListener,
  ChannelRedemptionListener,
  ChannelRedemption,
  ChannelPointRewardStatus,
  Listener,
} from "botModule";

import { Command } from "./commands.ts";
import { TalkingBot } from "./talkingbot.ts";
import fs from "node:fs/promises";
import path from "path";
import { toPascalCase } from "../shared/util.ts";
import { Message } from "discord.js";
import { NextFunction, Request, RequestHandler, Response } from "express";

const modulesDir = path.resolve(__dirname, "../../config/modules");

type CleanupFunction = () => void;

export class ModuleManager {
  private modules: Map<
    string,
    { module: BotModule; cleanups: CleanupFunction[] } | null
  > = new Map();
  private messageListeners: MessageListener[] = [];
  private discordMessageListeners: DiscordMessageListener[] = [];
  private channelRedemptionListeners: Map<string, ChannelRedemptionListener> =
    new Map();
  private routeHandlers: Map<string, RequestHandler> = new Map();
  private onlineListeners: Listener[] = [];
  private offlineListeners: Listener[] = [];
  private bot: TalkingBot;

  constructor(bot: TalkingBot) {
    this.bot = bot;
  }

  public onChatMessage(data: MessageData) {
    this.messageListeners.forEach((l) => l(data));
  }
  public onDiscordMessage(data: Message) {
    this.discordMessageListeners.forEach((l) => l(data));
  }

  public onOnline() {
    this.onlineListeners.forEach((l) => l());
  }

  public onOffline() {
    this.offlineListeners.forEach((l) => l());
  }

  public async onChannelPointReward(
    rewardId: string,
    data: ChannelRedemption,
  ): Promise<void> {
    const listener = this.channelRedemptionListeners.get(rewardId);
    if (!listener) return;

    try {
      await listener(data);
    } catch (e) {
      console.error(`Error running redemption listener: ${e}`);
    }
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

  public handleRoute(req: Request, res: Response, next: NextFunction) {
    const handler = this.routeHandlers.get(`${req.method} ${req.path}`);
    if (!handler) return next();
    Promise.resolve(handler(req, res, next)).catch(next);
  }

  private getContext(): {
    context: ModuleContext;
    cleanups: CleanupFunction[];
  } {
    const cleanups: CleanupFunction[] = [];

    const addCommand = (name: string, command: Command): boolean => {
      return this.bot.commandHandler.addCommand(name, command);
    };
    const removeCommand = (name: string): boolean => {
      return this.bot.commandHandler.removeCommand(name);
    };

    const addMessageListener = (listener: MessageListener) => {
      this.messageListeners.push(listener);
    };
    const removeMessageListener = (listener: MessageListener) => {
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

    const addListener = (listener: Listener, online: boolean) => {
      if (online) {
        this.onlineListeners.push(listener);
      } else {
        this.offlineListeners.push(listener);
      }
    };

    const removeListener = (listener: Listener, online: boolean) => {
      if (online) {
        this.onlineListeners = this.onlineListeners.filter(
          (l) => l !== listener,
        );
      } else {
        this.offlineListeners = this.offlineListeners.filter(
          (l) => l !== listener,
        );
      }
    };

    const addChannelPointListener = (
      rewardId: string,
      listener: ChannelRedemptionListener,
    ) => {
      this.channelRedemptionListeners.set(rewardId, listener);
    };
    const addRoute = (key: string, handler: RequestHandler) => {
      this.routeHandlers.set(key, handler);
    };
    const removeRoute = (key: string) => {
      this.routeHandlers.delete(key);
    };

    const context: ModuleContext = {
      bot: this.bot,
      onChatMessage(listener) {
        addMessageListener(listener);
        cleanups.push(() => {
          removeMessageListener(listener);
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
      async channelPointReward(reward): Promise<ChannelPointRewardStatus> {
        return await this.bot.twitch.channelPointReward(reward);
      },
      onChannelPointReward(rewardId, listener) {
        addChannelPointListener(rewardId, listener);
      },
      registerRoute(method, path, handler) {
        const key = `${method} ${path}`;
        addRoute(key, handler);
        cleanups.push(() => removeRoute(key));
      },

      onStreamOnline(listener) {
        addListener(listener, true);
        cleanups.push(() => {
          removeListener(listener, true);
        });
      },

      onStreamOffline(listener) {
        addListener(listener, false);
        cleanups.push(() => {
          removeListener(listener, false);
        });
      },

      async removeChannelPoint(rewardId) {
        await this.bot.twitch.apiClient.channelPoints.deleteCustomReward(
          this.bot.twitch.channel.id,
          rewardId,
        );
      },
      async setChannelPointEnabled(rewardId, enabled) {
        await this.bot.twitch.apiClient.channelPoints.updateCustomReward(
          this.bot.twitch.channel.id,
          rewardId,
          {
            isEnabled: enabled,
          },
        );
      },
      async setRedemptionStatus(rewardId, redemptionId, status) {
        await this.bot.twitch.apiClient.channelPoints.updateRedemptionStatusByIds(
          this.bot.twitch.channel.id,
          rewardId,
          [redemptionId],
          status,
        );
      },
      async setChannelPointPaused(rewardId, paused) {
        await this.bot.twitch.apiClient.channelPoints.updateCustomReward(
          this.bot.twitch.channel.id,
          rewardId,
          {
            isPaused: paused,
          },
        );
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

  private setModuleDisabled(name: string) {
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
      this.setModuleDisabled(module);
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
    this.unloadModule(module);

    const modPath = path.join(modulesDir, `${name}.ts`);
    const newPath = path.join(modulesDir, `${name}.ts.disabled`);
    await fs.rename(modPath, newPath);
  }

  private unloadModule(module: {
    module: BotModule;
    cleanups: CleanupFunction[];
  }) {
    module.cleanups.forEach((cleanup) => cleanup());
    module.module.onUnload();
    this.setModuleDisabled(module.module.name);
  }

  public async deleteModule(name: string) {
    await this.disableModule(name);
    await fs.rm(path.join(modulesDir, `${name}.ts.disabled`));
    this.modules.delete(name);
  }

  public cleanUp() {
    this.modules
      .values()
      .filter((m) => m != null)
      .forEach((m) => this.unloadModule(m));
  }

  public async init() {
    await this.loadModules();
  }
}
