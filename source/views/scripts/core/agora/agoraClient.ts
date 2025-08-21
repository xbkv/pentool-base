import AgoraRTC, { IAgoraRTCClient, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
import AgoraRTM, { RtmClient, RtmChannel } from "agora-rtm-sdk";
import { initializeRtmChannel } from "../../agora/initializeRtmChannel";
import { setupFuckBotUI } from "../../ui/fuckBotUI";
import { baseMain } from "../../agora/mode/base";
import { edenMain } from "../../agora/mode/notselling/eden";
import { BotManager } from "./botManager";

export class AgoraClient {
  private rtcClient: IAgoraRTCClient | null = null;
  private rtmClient: RtmClient | null = null;
  private rtmChannel: RtmChannel | null = null;

  async joinCall(conferenceCallId: string | null | undefined, mode: 'music' | 'fuck' | 'kuso'): Promise<void> {
    if (!conferenceCallId) {
      console.error("❌ Conference call ID is required");
      return;
    }

    try {
      const botManager = new BotManager();
      const botId = await botManager.getAvailableBotId();

      const agoraInfo = await this.fetchAgoraInfo(botId, conferenceCallId);
      await this.initializeAgoraClients(agoraInfo);
      await this.setupEventHandlers();
      await this.handleMode(mode, botId, conferenceCallId);
      await this.initializeRtmChannel(botId);

    } catch (err) {
      console.error("❌ joinCall中にエラー:", err);
    }
  }

  private async fetchAgoraInfo(botId: string, conferenceCallId: string) {
    const agoraInfoRes = await fetch(`/api/agora-api/agora_info?bot_id=${botId}&conference_call_id=${conferenceCallId}`);
    if (!agoraInfoRes.ok) throw new Error("Agora情報の取得に失敗");

    const { APP_ID, agora_rtm_token, agora_channel_token, agora_channel, conference_call_user_uuid } = await agoraInfoRes.json();

    if (!APP_ID || !agora_rtm_token || !agora_channel_token || !agora_channel || !conference_call_user_uuid) {
      throw new Error("Agora情報が不完全");
    }

    return { APP_ID, agora_rtm_token, agora_channel_token, agora_channel, conference_call_user_uuid };
  }

  private async initializeAgoraClients(agoraInfo: any) {
    this.rtcClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    this.rtmClient = AgoraRTM.createInstance(agoraInfo.APP_ID);

    await this.rtmClient.login({ token: agoraInfo.agora_rtm_token, uid: agoraInfo.conference_call_user_uuid });
    this.rtmChannel = this.rtmClient.createChannel(agoraInfo.agora_channel);
    await this.rtmChannel.join();

    await this.rtcClient.join(agoraInfo.APP_ID, agoraInfo.agora_channel, agoraInfo.agora_channel_token, agoraInfo.conference_call_user_uuid);
    this.rtcClient.enableAudioVolumeIndicator();
  }

  private async setupEventHandlers() {
    if (!this.rtcClient) return;

    this.rtcClient.on("user-published", async (user, mediaType) => {
      await this.rtcClient!.subscribe(user, mediaType);
      if (mediaType === "audio" && user.audioTrack) {
        user.audioTrack.play();
      }
    });

    this.rtcClient.on("user-unpublished", (user) => {
      if (user.audioTrack) user.audioTrack.stop();
    });

    this.rtcClient.on("volume-indicator", (volumes) => {
      volumes.forEach(vol => {
        const el = document.querySelector(`#user-${vol.uid} .mic-icon`);
        if (el) el.classList.toggle("muted", vol.level < 5);
      });
    });
  }

  private async handleMode(mode: 'music' | 'fuck' | 'kuso', botId: string, conferenceCallId: string) {
    if (!this.rtmChannel || !this.rtcClient) return;

    if (mode === "kuso") {
      await baseMain(botId, this.rtmChannel, this.rtcClient);
    } else if (mode === "music") {
      await edenMain(botId, this.rtmChannel, this.rtcClient);
    } else if (mode === "fuck") {
      setupFuckBotUI(this.rtcClient, this.rtmChannel, conferenceCallId, botId);
      const localTrack: IMicrophoneAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      await this.rtcClient.publish([localTrack]);
    }
  }

  private async initializeRtmChannel(botId: string) {
    if (!this.rtmClient || !this.rtmChannel) return;
    await initializeRtmChannel(this.rtmClient, this.rtmChannel, botId);
  }
}

// 後方互換性のための関数
export async function joinCall(conferenceCallId: string | null | undefined, mode: 'music' | 'fuck' | 'kuso'): Promise<void> {
  const client = new AgoraClient();
  await client.joinCall(conferenceCallId, mode);
}

function generateUserUUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateUserUUIDs(count: number): string[] {
  return Array.from({ length: count }, () => generateUserUUID());
}
