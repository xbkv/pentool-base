import AgoraRTC, {
  IAgoraRTCClient,
  IBufferSourceAudioTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import { RtmChannel } from "agora-rtm-sdk";
import { playTrack, sendEmoji, sendMessage } from "../../../utils/agoraActions";

export async function callMain(bot_id, rtmChannel: RtmChannel, rtcClient: IAgoraRTCClient) {
  // 先に call.wav を再生しながらクラブ絵文字送信
  const callTrack = await playTrack("/assets/audio/call/call.wav", false, 200, rtcClient);

  const clubEmojis = ["🪩", "🎵", "🎶", "🔊"];
  let clubIndex = 0;
  const clubInterval = setInterval(() => {
    sendEmoji(clubEmojis[clubIndex++ % clubEmojis.length], rtmChannel);
  }, 150);

  // call.wav 終了後に本来の処理に進む
  callTrack.on("source-state-change", async (state) => {
    if (state !== "stopped") return;
    clearInterval(clubInterval);

    // ======== 本来の処理ここから ========

    const firstTrack = await playTrack("/assets/audio/users/rinapen/first.wav", false, 1000, rtcClient);

    const emotes = ["領", "域", "展", "開"];
    const extraEmotes = ["無", "量", "空", "処"];

    function sendSequentialEmojis(emotes, delay, channel, initialDelay = 0) {
      setTimeout(() => {
        emotes.forEach((emote, index) => {
          setTimeout(() => {
            sendEmoji(emote, channel);
          }, delay * index);
        });
      }, initialDelay);
    }

    sendSequentialEmojis(emotes, 300, rtmChannel, 1000);
    sendSequentialEmojis(extraEmotes, 300, rtmChannel, 4000);

    function sendAcceleratingNumbers(channel, start = 1, initialDelay = 2000) {
      let count = start;
      let delay = initialDelay;
      const minDelay = 50;

      async function sendNext() {
        try {
          const digits = String(count++);
          for (const char of digits) {
            await sendEmoji(char, channel);
          }

          delay *= 0.85;
          if (delay < minDelay) delay = minDelay;

          setTimeout(sendNext, delay);
        } catch (err) {
          console.error("送信エラー:", err);
        }
      }

      sendNext();
    }

    setTimeout(() => {
      sendAcceleratingNumbers(rtmChannel, 1, 300);
    }, 5000);

    firstTrack.on("source-state-change", async (state) => {
      if (state !== "stopped") return;

      await playTrack("/assets/audio/users/rinapen/second.wav", true, 1000, rtcClient);
      const text = "見える…聞こえる…感じる…止まらない…全ての情報が…永遠に流れ込む…君はもう動けない…";
      const emotes = ["🌀", "♾️", "👁️", "💫", "🧠", "🕳️", "🕰️", "📡", "🔁", "🧿", "🖤", "🪐"];

      let charIndex = 0;
      let emoteIndex = 0;
      setInterval(() => sendMessage(bot_id, text[charIndex++ % text.length], rtmChannel), 100);
      setInterval(() => sendEmoji(emotes[emoteIndex++ % emotes.length], rtmChannel), 50);
      setInterval(() => rtmChannel.sendMessage({ text: `requestLiftAudioMute` }), 50);
    });
  });
}
