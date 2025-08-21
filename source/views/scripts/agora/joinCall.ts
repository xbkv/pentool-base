import AgoraRTC, { IAgoraRTCClient, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
import AgoraRTM, { RtmClient, RtmChannel } from "agora-rtm-sdk";
import { initializeRtmChannel } from "./initializeRtmChannel";
import { setupFuckBotUI } from "../ui/fuckBotUI";
import { botStatusResponse } from "./types";
import { baseMain } from "./mode/base";
import { edenMain } from "./mode/notselling/eden";

export async function joinCall(conferenceCallId: string | null | undefined, mode: 'music' | 'fuck' | 'kuso'): Promise<void> {
  if (!conferenceCallId) {
    console.error("❌ Conference call ID is required");
    return;
  }
  try {
    let botId: string;
    while (true) {
      const botIdRes = await fetch("/api/bot-api/random_bot_id");
      if (!botIdRes.ok) throw new Error("BOT IDの取得に失敗");

      const { bot } = await botIdRes.json();
      const botStatusRes = await fetch(`/api/bot-api/${bot.id}/status`);
      if (!botStatusRes.ok) throw new Error("BOTの状態取得に失敗");

      const botStatusData: botStatusResponse = await botStatusRes.json();
      if (!botStatusData.bot.isActive) {
        botId = bot.id;
        break;
      }

      await new Promise(res => setTimeout(res, 100)); // 100ms待機に変更（10msは短すぎる）
    }

    const agoraInfoRes = await fetch(`/api/agora-api/agora_info?bot_id=${botId}&conference_call_id=${conferenceCallId}`);
    if (!agoraInfoRes.ok) throw new Error("Agora情報の取得に失敗");

    const { APP_ID, agora_rtm_token, agora_channel_token, agora_channel, conference_call_user_uuid } = await agoraInfoRes.json();

    if (!APP_ID || !agora_rtm_token || !agora_channel_token || !agora_channel || !conference_call_user_uuid) {
      throw new Error("Agora情報が不完全");
    }

    const rtcClient: IAgoraRTCClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    const rtmClient: RtmClient = AgoraRTM.createInstance(APP_ID);

    await rtmClient.login({ token: agora_rtm_token, uid: conference_call_user_uuid });
    const rtmChannel: RtmChannel = rtmClient.createChannel(agora_channel);
    await rtmChannel.join();

    await rtcClient.join(APP_ID, agora_channel, agora_channel_token, conference_call_user_uuid);
    rtcClient.enableAudioVolumeIndicator();

    if (mode === "kuso") {
      await baseMain(botId, rtmChannel, rtcClient);
    } else if (mode === "music") {
      await edenMain(botId, rtmChannel, rtcClient);
    } else if (mode === "fuck") {
      setupFuckBotUI(rtcClient, rtmChannel, conferenceCallId, botId);
      const localTrack: IMicrophoneAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      await rtcClient.publish([localTrack]);
    }

    rtcClient.on("user-published", async (user, mediaType) => {
      await rtcClient.subscribe(user, mediaType);
      if (mediaType === "audio" && user.audioTrack) {
        user.audioTrack.play();
      }
    });

    rtcClient.on("user-unpublished", (user) => {
      if (user.audioTrack) user.audioTrack.stop();
    });

    initializeRtmChannel(rtmClient, rtmChannel, botId);
  } catch (err) {
    console.error("❌ joinCall中にエラー:", err);
  }
}

function generateUserUUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateUserUUIDs(count: number): string[] {
  return Array.from({ length: count }, () => generateUserUUID());
}