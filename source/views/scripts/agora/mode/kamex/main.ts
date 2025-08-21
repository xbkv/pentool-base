import { RtmChannel } from "agora-rtm-sdk";
import { playTrack, sendEmoji, sendMessage } from "../../../utils/agoraActions";
import { IAgoraRTCClient } from "agora-rtc-sdk-ng";

export async function kamexMain(bot_id: string, rtmChannel: RtmChannel, rtcClient: IAgoraRTCClient) {
  const initialTrack = await playTrack("/assets/audio/fly/ikinasai.wav", false, 1000, rtcClient);

  initialTrack.on("source-state-change", async (state) => {
    if (state === "stopped") {
      const flyTrack = await playTrack("/assets/audio/fly/fly.wav", true, 500, rtcClient);

      let volume = 0;
      let direction = 1; 
      setInterval(() => {
        volume += direction * 50;
        if (volume >= 1000) {
          volume = 1000;
          direction = -1;
        } else if (volume <= 0) {
          volume = 0;
          direction = 1;
        }
        flyTrack.setVolume(volume); // Agora SDK: 0〜1000
      }, 100); 

      let emojiToggle = true;
      setInterval(() => {
        sendEmoji(emojiToggle ? "💩" : "🪰", rtmChannel);
        emojiToggle = !emojiToggle;
      }, 100);

      let messageToggle = true;
      setInterval(() => {
        sendMessage(bot_id, "🪰", rtmChannel);
        messageToggle = !messageToggle;
      }, 500);
    }
  });

  rtmChannel.on("ChannelMessage", async (message, memberId) => {
    const msgText = message.text;
    if (typeof msgText === "string") {
      const sounds = ["/assets/audio/fly/kick.wav"];
      const sound = sounds[Math.floor(Math.random() * sounds.length)];

      if (msgText.startsWith("kick") || msgText.startsWith("muteAudio")) {
        await playTrack(sound, false, 500, rtcClient);
      }
    }
  });
}