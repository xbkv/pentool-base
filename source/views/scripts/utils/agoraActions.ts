import AgoraRTC, { IAgoraRTCClient, IBufferSourceAudioTrack } from "agora-rtc-sdk-ng";
import { RtmChannel } from "agora-rtm-sdk";

export async function playTrack(
  source: string,
  loop = false,
  vol = 1000,
  rtcClient: IAgoraRTCClient
): Promise<IBufferSourceAudioTrack> {
  const track = await AgoraRTC.createBufferSourceAudioTrack({ source });
  track.setVolume(vol);
  await rtcClient.publish(track);
  track.startProcessAudioBuffer({ loop, startPlayTime: 0 });
  track.play();
  return track;
}

export async function sendMessage(
  bot_id: string,
  text: string,
  rtmChannel: RtmChannel
): Promise<void> {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const id = `${bot_id}_${timestamp}`;
    await rtmChannel.sendMessage({
      text: `chat ${JSON.stringify({ text, id, created_at_seconds: timestamp })}`,
    });
  } catch (error) {
    console.error("sendMessage error:", error);
  }
}

export async function sendEmoji(
  emoji: string,
  rtmChannel: RtmChannel
): Promise<void> {
  try {
    await rtmChannel.sendMessage({ text: `react ${emoji}` });
  } catch (error) {
    console.error("sendEmoji error:", error);
  }
}