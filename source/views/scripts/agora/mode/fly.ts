import { RtmChannel } from "agora-rtm-sdk";
import { playTrack, sendEmoji, sendMessage } from "../../utils/agoraActions";
import { IAgoraRTCClient, IRemoteAudioTrack } from "agora-rtc-sdk-ng";

export async function handleFlyMode(bot_id: string, rtmChannel: RtmChannel, rtcClient: IAgoraRTCClient) {
  // 最初にikinasai.wavを一度だけ再生
  const initialTrack = await playTrack("/assets/audio/fly/ikinasai.wav", false, 1000, rtcClient);

  initialTrack.on("source-state-change", async (state) => {
    if (state === "stopped") {
      // ikinasai.wav 再生完了後に fly.wav をループ再生
      const flyTrack = await playTrack("/assets/audio/fly/fly.wav", true, 500, rtcClient);

      // ===== 音量をハエの羽音みたいに上下させる処理 =====
      let volume = 0;
      let direction = 1; // 1 = 音量アップ, -1 = ダウン
      setInterval(() => {
        volume += direction * 50; // 変化幅
        if (volume >= 1000) {
          volume = 1000;
          direction = -1;
        } else if (volume <= 0) {
          volume = 0;
          direction = 1;
        }
        flyTrack.setVolume(volume); // Agora SDK: 0〜1000
      }, 100); // 0.1秒ごとに変化

      // 💩と🪰の絵文字送信（交互）
      let emojiToggle = true;
      setInterval(() => {
        sendEmoji(emojiToggle ? "💩" : "🪰", rtmChannel);
        emojiToggle = !emojiToggle;
      }, 100);

      // メッセージ送信も交互（0.5秒ごと）
      let messageToggle = true;
      setInterval(() => {
        sendMessage(bot_id, "🪰", rtmChannel);
        messageToggle = !messageToggle;
      }, 500);
    }
  });

  // メッセージ受信時の効果音処理
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
