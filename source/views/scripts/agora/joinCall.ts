import AgoraRTC, { IAgoraRTCClient } from "agora-rtc-sdk-ng";
import AgoraRTM, { RtmChannel, RtmClient } from "agora-rtm-sdk";
import { initializeRtmChannel } from "./initializeRtmChannel";

let rtcClient: IAgoraRTCClient;
let rtmClient: RtmClient;
let rtmChannel: RtmChannel;

function generateUserUUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function joinCall(conference_call_id: string): Promise<void> {
  try {
    let bot_id: string = "";
    let botIsActive: boolean = true;

    do {
      const randomBotIdResponse = await fetch("/api/bot-api/random_bot_id");
      if (!randomBotIdResponse.ok) throw new Error('Failed to fetch random bot ID');

      const randomBotIdData = await randomBotIdResponse.json();
      bot_id = randomBotIdData.bot.id;

      const botStatusResponse = await fetch(`/api/bot-api/${bot_id}/status`);
      if (!botStatusResponse.ok) throw new Error('Failed to fetch bot status');

      const botStatusData = await botStatusResponse.json();
      botIsActive = botStatusData.isActive;

      if (botIsActive) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } while (botIsActive);

    const agoraInfoResponse = await fetch(`/api/agora-api/agora_info?bot_id=${bot_id}&conference_call_id=${conference_call_id}`);
    if (!agoraInfoResponse.ok) throw new Error('Failed to fetch Agora data');

    const agoraInfo = await agoraInfoResponse.json();
    const { APP_ID, agora_rtm_token, agora_channel_token, agora_channel, conference_call_user_uuid } = agoraInfo;

    if (!APP_ID || !agora_rtm_token || !agora_channel_token || !agora_channel || !conference_call_user_uuid) {
      throw new Error('Incomplete Agora info');
    }

    rtcClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    rtmClient = AgoraRTM.createInstance(APP_ID);

    await rtmClient.login({ token: agora_rtm_token, uid: conference_call_user_uuid });
    rtmChannel = rtmClient.createChannel(agora_channel);
    await rtmChannel.join();

    await rtcClient.join(APP_ID, agora_channel, agora_channel_token, conference_call_user_uuid);
    rtcClient.enableAudioVolumeIndicator();

    const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    await rtcClient.publish([localAudioTrack]);

    rtcClient.remoteUsers.forEach(async (user) => {
      try {
        await rtcClient.subscribe(user, 'audio');
        const remoteAudioTrack = user.audioTrack;
        if (remoteAudioTrack) remoteAudioTrack.play();
      } catch (err) {
        console.warn('Failed to subscribe to existing user:', user.uid, err);
      }
    });

    await rtcClient.publish([localAudioTrack]);

    rtcClient.on("user-published", async (user, mediaType) => {
      await rtcClient.subscribe(user, mediaType);
      if (mediaType === "audio") {
        const remoteAudioTrack = user.audioTrack;
        if (remoteAudioTrack) {
          remoteAudioTrack.play();
        }
      }
    });

    rtcClient.on("user-unpublished", (user) => {
      const remoteAudioTrack = user.audioTrack;
      if (remoteAudioTrack) remoteAudioTrack.stop();
    });

    rtcClient.on("volume-indicator", (volumes) => {
      volumes.forEach(vol => {
        const el = document.querySelector(`#user-${vol.uid} .mic-icon`);
        if (el) {
          el.classList.toggle("muted", vol.level < 5); // 0~255
        }
      });
    });
    

    await fetch(`/api/users/owner/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: conference_call_user_uuid, conference_call_id }),
    });

    initializeRtmChannel(rtmChannel, bot_id);
    // window.location.href = `/joined?conference_call_id=${conference_call_id}`;
  } catch (err) {
    console.error('Error during joinCall:', err);
  }
}

export function generateUserUUIDs(count: number): string[] {
  return Array.from({ length: count }, () => generateUserUUID());
}

export function getRtcClient(): IAgoraRTCClient {
  return rtcClient;
}

export function getRtmChannel(): RtmChannel {
  return rtmChannel;
}