import AgoraRTC, { IAgoraRTCClient, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
import AgoraRTM, { RtmClient, RtmChannel } from "agora-rtm-sdk";
import { initializeRtmChannel } from "./initializeRtmChannel";
import { setupFuckBotUI } from "../ui/fuckBotUI";
import { botStatusResponse } from "./types";
import { handleKusoMode, handleMusicMode } from "./mode/kuso";
import { handleCallMode } from "./mode/call";
import { playTrack } from "../utils/agoraActions";
import { handleFlyMode } from "./mode/fly";
import { handleEdenMode } from "./mode/eden";
// const handleKusoMode = async (rtmChannel: RtmChannel, rtcClient: IAgoraRTCClient) => {
//     const loopRandomAudio = async () => {
//       const sounds = [
//         "/assets/audio/gaiaku/dareyanen.wav",
//         "/assets/audio/gaiaku/sine.wav",
//         "/assets/audio/gaiaku/mazidedareyanen.wav"
//       ];
//       while (true) {
//         const delay = Math.random() * (60000 - 1000) + 1000; // 1秒〜3分
//         const sound = sounds[Math.floor(Math.random() * sounds.length)];
//         await new Promise(res => setTimeout(res, delay));
//         await playTrack(sound, false, 1000, rtcClient);
//       }
//     };
//     loopRandomAudio();

//   rtmChannel.on("ChannelMessage", async (message, memberId, messageProps) => {
//     if ("text" in message && typeof message.text === "string") {
//       const msgText = message.text;
//             const sounds = [
//         "/assets/audio/gaiaku/sine.wav",
//         "/assets/audio/gaiaku/yamee.wav"
//       ];
//       const sound = sounds[Math.floor(Math.random() * sounds.length)];
//       if (msgText.startsWith("kick") || msgText.startsWith("muteAudio")) {
//         await playTrack(sound, false, 1000, rtcClient);
//       }
//     }
//   });
// }

export async function joinCall(conferenceCallId: string, mode: 'music' | 'fuck' | 'kuso'): Promise<void> {
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

      await new Promise(res => setTimeout(res, 10));
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
      await handleKusoMode(botId, rtmChannel, rtcClient);
      // await handleCallMode(botId, rtmChannel, rtcClient);
    } else if (mode === "music") {
      // await handleCallMode(botId, rtmChannel, rtcClient);
      // await handleMusicMode(botId, rtmChannel, rtcClient);
      await handleEdenMode(botId, rtmChannel, rtcClient);
      // await handleFlyMode(botId, rtmChannel, rtcClient);
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

    rtcClient.on("volume-indicator", (volumes) => {
      volumes.forEach(vol => {
        const el = document.querySelector(`#user-${vol.uid} .mic-icon`);
        if (el) el.classList.toggle("muted", vol.level < 5);
      });
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