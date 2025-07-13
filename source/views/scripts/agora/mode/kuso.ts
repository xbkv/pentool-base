import AgoraRTC, {
  IAgoraRTCClient,
  IBufferSourceAudioTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import { RtmChannel } from "agora-rtm-sdk";
import { playTrack, sendEmoji, sendMessage } from "../../utils/agoraActions";

export default async function handleKusoMode(bot_id, rtmChannel: RtmChannel, rtcClient: IAgoraRTCClient){
  const firstTrack = await playTrack("/assets/audio/rinapen/first.wav", false, 1000, rtcClient);

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

  sendSequentialEmojis(extraEmotes, 300, rtmChannel, 6000);

  setTimeout(() => {

    sendAcceleratingNumbers(rtmChannel, 1, 300);
  }, 8000);

  function sendAcceleratingNumbers(channel, start = 1, initialDelay = 2000) {
    let count = start;
    let delay = initialDelay;
    const minDelay = 50;

    async function sendNext() {
      try {
        const digits = String(count++);
        
        // 1文字ずつ順番に送信（awaitで順に送る）
        for (const char of digits) {
          await sendEmoji(char, channel);
        }

        delay *= 0.85;
        if (delay < minDelay) delay = minDelay;

        setTimeout(sendNext, delay);
      } catch (err) {
        console.error("送信エラー:", err);
        // setTimeout(sendNext, 1000); // 必要なら再送ロジック
      }
    }

    sendNext();
  }


  firstTrack.on("source-state-change", async (state) => {
    if (state === "stopped") {
      // await playTrack("/assets/audio/second.wav", true, 1000, rtcClient);
      // await playTrack("/assets/audio/second.wav", true, 1000, rtcClient);
      // await playTrack("/assets/audio/second.wav", true, 1000, rtcClient);
      // await playTrack("/assets/audio/second.wav", true, 1000, rtcClient);
      // await playTrack("/assets/audio/second.wav", true, 1000, rtcClient);
      // await playTrack("/assets/audio/second.wav", true, 1000, rtcClient);

      await playTrack("/assets/audio/rinapen/second.wav", true, 1000, rtcClient);
      const text = "見える…聞こえる…感じる…止まらない…全ての情報が…永遠に流れ込む…君はもう動けない…";
      const emotes = ["🌀", "♾️", "👁️", "💫", "🧠", "🕳️", "🕰️", "📡", "🔁", "🧿", "🖤", "🪐"];
      // const emotes = ["上", "野", "え", "い", "と", ]
      let charIndex = 0;
      let emoteIndex = 0;
      setInterval(() => sendMessage(bot_id, text[charIndex++ % text.length], rtmChannel), 100);
      setInterval(() => sendEmoji(emotes[emoteIndex++ % emotes.length], rtmChannel), 50);
      setInterval(() => rtmChannel.sendMessage({ text: `requestLiftAudioMute` }), 50);
    }
  });
  rtmChannel.on("ChannelMessage", async (message, memberId, messageProps) => {
    const msgText = message.text;

    if (typeof msgText === "string") {
      const sounds = [
        "/assets/audio/rinapen/atattenai.wav",
      ];
      const sound = sounds[Math.floor(Math.random() * sounds.length)];

      if (msgText.startsWith("kick") || msgText.startsWith("muteAudio")) {
        await playTrack(sound, false, 500, rtcClient);
      }
    }
  });

};
