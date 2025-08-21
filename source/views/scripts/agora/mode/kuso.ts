import AgoraRTC, {
  IAgoraRTCClient,
  IBufferSourceAudioTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import { RtmChannel } from "agora-rtm-sdk";
import { playTrack, sendEmoji, sendMessage } from "../../utils/agoraActions";

export async function handleKusoMode(bot_id, rtmChannel: RtmChannel, rtcClient: IAgoraRTCClient){
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

  sendSequentialEmojis(extraEmotes, 300, rtmChannel, 3200);

  setTimeout(() => {

    sendAcceleratingNumbers(rtmChannel, 1, 300);
  }, 5500);

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
        // setTimeout(sendNext, 1000); // 必要なら再送ロジック
      }
    }

    sendNext();
  }

  firstTrack.on("source-state-change", async (state) => {
    if (state === "stopped") {
        await playTrack("/assets/audio/users/rinapen/second.wav", true, 1000, rtcClient);
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
        "/assets/audio/kick/atattenai.mp3",
      ];
      const sound = sounds[Math.floor(Math.random() * sounds.length)];

      if (msgText.startsWith("kick") || msgText.startsWith("muteAudio")) {
        await playTrack(sound, false, 500, rtcClient);
      }
    }
  });

};

export const handleMusicMode = async (bot_id: string, rtmChannel: RtmChannel, rtcClient: IAgoraRTCClient) => {
  const send = (t: string) => sendMessage(bot_id, t, rtmChannel);
  const emoji = (e: string) => sendEmoji(e, rtmChannel);

  const firstTrack = await playTrack("/assets/audio/circus/amazing.m4a", false, 100, rtcClient);
  firstTrack.on("source-state-change", async () => {
    await playTrack("/assets/audio/circus/everyday.m4a", true, 100, rtcClient);
  });

  setTimeout(async () => {
    for (let i = 0; i < 40; i++) await emoji("🥁");
    setTimeout(async () => {
      await send("アメイジング・デジタルサーカスへ");
      setTimeout(async () => {
        await send("ようこそ！");
        for (let i = 0; i < 10; i++) {
          await emoji("🤗");
          await emoji("👋");
        }
        setTimeout(async () => {
          await send("私はケイン！");
          for (const ch of ["C", "A", "I", "N", "E"]) await emoji(ch);
          await emoji("👀");
          await emoji("👄");
          setTimeout(async () => {
            await send("ここの舞台監督だ！");
            for (let i = 0; i < 10; i++) await emoji("😎");
            setTimeout(async () => {
              await send("見たことないような");
              setTimeout(async () => {
                await send("顎が外れて");
                await emoji("🤔");
                setTimeout(async () => {
                  await send("心臓が止まるほど");
                  await emoji("🩺");
                  await emoji("🫀");
                  setTimeout(async () => {
                    await send("びっくりする代物を");
                    await emoji("💎");
                    setTimeout(async () => {
                      await send("お見せしよう！！");
                      await emoji("🎉");
                      setTimeout(async () => {
                        await send("そうだろ？バブル");
                        await emoji("❓");
                        setTimeout(async () => {
                          await send("もちろんだよ！ケイン");
                          setTimeout(async () => {
                            await send("今日はどんなものを作ったのか楽しみだよ！");
                            setTimeout(async () => {
                              await send("ああ！時間がもったいないなあ！");
                              for (let i = 0; i < 20; i++) await emoji("⌚");
                              setTimeout(async () => {
                                await send("さあ！ショーの始まりだ！");
                                for (let i = 0; i < 50; i++) await emoji("🎪");
                                setTimeout(async () => {
                                  await send("ガングル");
                                  await emoji("🎭");
                                  for (const ch of ["G", "A", "N", "G", "L", "E"]) await emoji(ch);
                                  setTimeout(async () => {
                                    await send("ズーブル");
                                    await emoji("🚂");
                                    for (const ch of ["Z", "O", "O", "B", "L", "E"]) await emoji(ch);
                                    setTimeout(async () => {
                                      await send("あとキンガーも〜");
                                      await emoji("♟️");
                                      for (const ch of ["K", "I", "N", "G", "E", "R"]) await emoji(ch);
                                      setTimeout(async () => {
                                        await send("ラガタ");
                                        await emoji("🪆");
                                        for (const ch of ["R", "A", "G", "A", "T", "H", "A"]) await emoji(ch);
                                        setTimeout(async () => {
                                          await send("ジャックス");
                                          for (const ch of ["J", "A", "X"]) {
                                            await emoji(ch);
                                            await emoji("🐰");
                                          }
                                          setTimeout(async () => {
                                            await send("それにカフモ〜");
                                            await emoji("🤡");
                                            for (const ch of ["K", "A", "U", "F", "M", "O"]) await emoji(ch);
                                            setTimeout(async () => {
                                              setInterval(async () => {
                                                await send("毎日");
                                                await emoji("📅");
                                                await emoji("毎");
                                                await emoji("日");
                                              }, 100);
                                            }, 1500);
                                          }, 1000);
                                        }, 800);
                                      }, 1400);
                                    }, 1000);
                                  }, 1000);
                                }, 400);
                              }, 1000);
                            }, 2000);
                          }, 1000);
                          for (let i = 0; i < 70; i++) await emoji("🫧");
                        }, 1000);
                      }, 1600);
                    }, 1000);
                  }, 900);
                }, 700);
              }, 1000);
            }, 1000);
          }, 1000);
        }, 800);
      }, 2500);
    }, 290);
  }, 11000);
};