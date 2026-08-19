import dotenv from "dotenv";

function checkedEnv(env: string): string {
    if (!process.env[env]) {
        console.error(`${env} not present in .env`);
        process.exit(1);
    }
    return process.env[env];
}

dotenv.config({ path: __dirname + "/../config/.env" });

export const CONFIG = {
  keys: {
    steam: checkedEnv("STEAM_KEY")
  },
  secrets: {
    kofi: process.env.KOFI_SECRET,
    jwt: checkedEnv("JWT_SECRET"),
  },
  discord: {
    token: checkedEnv("DISCORD_TOKEN"),
    clientSecret: checkedEnv("DISCORD_CLIENT_SECRET"),
    clientId: checkedEnv("DISCORD_CLIENT_ID"),
    guildId: checkedEnv("DISCORD_GUILD_ID"),
    redirectUrl: checkedEnv("DISCORD_REDIRECT"),
    loginUrl: checkedEnv("DISCORD_LOGIN"),
  },
  twitch: {
    clientId: checkedEnv("TWITCH_CLIENT_ID"),
    clientSecret: checkedEnv("TWITCH_CLIENT_SECRET"),
    channelName: checkedEnv("TWITCH_CHANNEL_NAME"),
    eventSubSecret: process.env.TWITCH_EVENTSUB_SECRET,
  }
}
