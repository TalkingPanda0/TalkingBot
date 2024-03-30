"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBotCommand = void 0;
const BotCommand_1 = require("./BotCommand");
/**
 * Creates a simple bot command.
 *
 * @meta category main
 *
 * @expandParams
 *
 * @param commandName The name of the command.
 * @param handler The execution handler that should be called when the command is sent.
 * @param options
 */
function createBotCommand(commandName, handler, options = {}) {
    return new (class extends BotCommand_1.BotCommand {
        constructor(_options) {
            var _a;
            super();
            this._options = _options;
            this.name = commandName;
            this._allowedExecutionPerChannel = new Map();
            this._allowedExecutionPerChannelUser = new Map();
            setInterval(() => {
                const now = Date.now();
                for (const [key, time] of this._allowedExecutionPerChannel) {
                    if (now > time) {
                        this._allowedExecutionPerChannel.delete(key);
                    }
                }
                for (const [key, time] of this._allowedExecutionPerChannelUser) {
                    if (now > time) {
                        this._allowedExecutionPerChannelUser.delete(key);
                    }
                }
            }, ((_a = this._options.cooldownCleanupRate) !== null && _a !== void 0 ? _a : 600) * 1000).unref();
        }
        get aliases() {
            var _a;
            return (_a = options.aliases) !== null && _a !== void 0 ? _a : [];
        }
        canExecute(channelId, userId) {
            const now = Date.now();
            if (options.globalCooldown) {
                const globalAllowedExecutionTime = this._allowedExecutionPerChannel.get(channelId);
                if (globalAllowedExecutionTime !== undefined && now < globalAllowedExecutionTime) {
                    return false;
                }
            }
            if (options.userCooldown) {
                const userAllowedExecutionTime = this._allowedExecutionPerChannelUser.get(`${channelId}:${userId}`);
                if (userAllowedExecutionTime !== undefined && now < userAllowedExecutionTime) {
                    return false;
                }
            }
            return true;
        }
        async execute(params, context) {
            const now = Date.now();
            if (this._options.globalCooldown) {
                this._allowedExecutionPerChannel.set(context.broadcasterId, now + this._options.globalCooldown * 1000);
            }
            if (this._options.userCooldown) {
                this._allowedExecutionPerChannelUser.set(`${context.broadcasterId}:${context.userId}`, now + this._options.userCooldown * 1000);
            }
            await handler(params, context);
        }
    })(options);
}
exports.createBotCommand = createBotCommand;
