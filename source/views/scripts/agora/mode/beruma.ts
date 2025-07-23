import AgoraRTC, {
  IAgoraRTCClient,
  IBufferSourceAudioTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import { RtmChannel } from "agora-rtm-sdk";
import { playTrack, sendEmoji, sendMessage } from "../../utils/agoraActions";

export default async function handleKusoMode(bot_id, rtmChannel: RtmChannel, rtcClient: IAgoraRTCClient) {
  const firstTrack = await playTrack("/assets/audio/users/beruma/first.wav", false, 1000, rtcClient);

    firstTrack.on("source-state-change", async (state) => {
        if (state === "stopped") {
        // 🔁 second.wav をループで再生
        await playTrack("/assets/audio/users/beruma/second.m4a", true, 1000, rtcClient);

        const emotes = ["🦽", "🦯", "🦼"];
        const text = "話をしねえじゃねえか！ふざけんなよ！";
        // const emotes = ["上", "野", "え", "い", "と", ]
        let charIndex = 0;
        let emoteIndex = 0;

        setInterval(() => sendMessage(bot_id, text[charIndex++ % text.length], rtmChannel), 100);
        setInterval(() => sendEmoji(emotes[emoteIndex++ % emotes.length], rtmChannel),100);
      setInterval(() => rtmChannel.sendMessage({ text: `requestLiftAudioMute` }), 50);
        // 📩 メッセージ送信
        setTimeout(() => {
            sendMessage(bot_id, "موتوا أيها الأوغاد", rtmChannel);
        }, 300);
        }
    });

  // 🔄 RTMイベント（そのまま）
  rtmChannel.on("ChannelMessage", async (message, memberId, messageProps) => {
    const msgText = message.text;
    if (typeof msgText === "string") {
      const sounds = [
        "/assets/audio/kick/scream.wav",
      ];
      const sound = sounds[Math.floor(Math.random() * sounds.length)];
      if (msgText.startsWith("kick") || msgText.startsWith("muteAudio")) {
        await playTrack(sound, false, 1000, rtcClient);
      }
    }
  });
}
