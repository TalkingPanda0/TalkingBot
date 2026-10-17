import { MessageData as MsgData } from "botModule";

export type MessageData = MsgData;

export interface DiscordAuthData {
  token_type: string;
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface PollEvent {
  duration: number;
  options: PollOption[];
  title: string;
}

export interface PollOption {
  id: number;
  label: string;
  score: number;
}

export type RaidAlert = { raider: string; viewers: number; type: "raidAlert" };
export type FollowAlert = { follower: string; type: "followAlert" };
export type BitsAlert = {
  user: string;
  bits: number;
  message: string;
  type: "bitsAlert";
};
export type DiscordJoinAlert = { type: "discordJoinAlert"; member: string };
export type KofiAlert = {
  type: "kofiAlert";
  is_subscription: boolean;
  message: string | null;
  sender: string;
  tier_name: string | null;
  amount: string;
  currency: string;
};
export type SubAlert = {
  type: "subAlert";
  name: string;
  message: string;
  plan: string;
  months: number | null;
  gift: boolean;
  gifted: number;
};

export interface TTSAlert {
  type: "tts";
  text: string;
  sender: string;
  color: string;
  isImportant: boolean;
}

export type Alert =
  | RaidAlert
  | FollowAlert
  | BitsAlert
  | SubAlert
  | DiscordJoinAlert
  | KofiAlert
  | TTSAlert;
export type AlertEvent = Alert & {
  audioList: string[];
  messageAudioList: string[] | null;
};

export type ChatControl = (
  | { target: "banUser" | "deleteMessage"; message: string }
  | { target: "message"; message: MessageData }
  | { target: "refresh" }
) & { overlay: "chat" };

export type ModtextControl = (
  | { target: "set"; message: string }
  | { target: "refresh" }
) & { overlay: "modtext" };

export type AlertControl = { message: Alert; overlay: "alerts" };

export type ControlMessage = ChatControl | ModtextControl | AlertControl;

export type StoredMessageData = {
  messageId: string;
  platform: string;
  badges: string[];
  displayName: string;
  color: string;
  userId: string;
  message: string;
  emoteOffsets: string | null;
  replyId: string | null;
  timestamp: number;
  isAction: boolean;
  highlightMessage: string | null;
  highlightColor: string | null;
};

export type Clip = {
  title: string;
  url: string;
  thumbnailUrl: string;
  creator: string;
  start: number;
  end: number;
};

export type OverlayMessageData = StoredMessageData & {
  clip?: Clip;
  isFake: boolean;
  isCommand: boolean;
};

export type ChatMetaData = {
  cheerEmotes: string[];
  channelId: string;
};
