import AgoraRTC, {
  IAgoraRTCClient,
  IBufferSourceAudioTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import AgoraRTM, { RtmChannel, RtmClient } from "agora-rtm-sdk";
import { initializeRtmChannel } from "./initializeRtmChannel";
import { setupFuckBotUI } from "../ui/fuckBotUI";
import { botStatusResponse } from "./types";

function generateUserUUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

let bot_id = "";

const sendMessage = async (text: string, rtmChannel: RtmChannel) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const id = `${bot_id}_${timestamp}`;
    await rtmChannel.sendMessage({
      text: `chat ${JSON.stringify({ text, id, created_at_seconds: timestamp })}`,
    });
  } catch (error) {
    console.error("sendMessage error:", error);
  }
};

const sendEmoji = async (emoji: string, rtmChannel: RtmChannel) => {
  try {
    await rtmChannel.sendMessage({ text: `react ${emoji}` });
  } catch (error) {
    console.error("sendEmoji error:", error);
  }
};

const playTrack = async (
  source: string,
  loop = false,
  vol: number = 1000,
  rtcClient: IAgoraRTCClient
): Promise<IBufferSourceAudioTrack> => {
  const track = await AgoraRTC.createBufferSourceAudioTrack({ source });
  track.setVolume(vol);
  await rtcClient.publish(track);
  track.startProcessAudioBuffer({ loop, startPlayTime: 0 });
  track.play();
  return track;
};

const handleKusoMode = async (rtmChannel: RtmChannel, rtcClient: IAgoraRTCClient) => {
  const firstTrack = await playTrack("/assets/audio/first.wav", false, 1000, rtcClient);

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
        await sendEmoji(String(count++), channel); // ← 非同期対応

        delay *= 0.85;
        if (delay < minDelay) delay = minDelay;

        setTimeout(sendNext, delay);
      } catch (err) {
        console.error("送信エラー:", err);
        // 通信エラーなどが出た場合にも再送できるようにするなら以下もあり：
        // setTimeout(sendNext, 1000); // 1秒待って再試行
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

      await playTrack("/assets/audio/second.wav", true, 1000, rtcClient);
      const text = "見える…聞こえる…感じる…止まらない…全ての情報が…永遠に流れ込む…君はもう動けない…";
      const emotes = ["🌀", "♾️", "👁️", "💫", "🧠", "🕳️", "🕰️", "📡", "🔁", "🧿", "🖤", "🪐"];
      // const emotes = ["上", "野", "え", "い", "と", ]
      let charIndex = 0;
      let emoteIndex = 0;
      setInterval(() => sendMessage(text[charIndex++ % text.length], rtmChannel), 100);
      setInterval(() => sendEmoji(emotes[emoteIndex++ % emotes.length], rtmChannel), 50);
      setInterval(() => rtmChannel.sendMessage({ text: `requestLiftAudioMute` }), 50);
    }
  });
  rtmChannel.on("ChannelMessage", async (message, memberId, messageProps) => {
    const msgText = message.text;

    if (typeof msgText === "string") {
      const sounds = [
        "/assets/audio/atattenai.wav",
      ];
      const sound = sounds[Math.floor(Math.random() * sounds.length)];

      if (msgText.startsWith("kick") || msgText.startsWith("muteAudio")) {
        await playTrack(sound, false, 500, rtcClient);
      }
    }
  });

};

// const handleKusoMode = async (rtmChannel: RtmChannel, rtcClient: IAgoraRTCClient) => {
//     const loopRandomAudio = async () => {
//       const sounds = [
//         "/assets/audio/dareyanen.wav",
//         "/assets/audio/sine.wav",
//         "/assets/audio/mazidedareyanen.wav"
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
//         "/assets/audio/sine.wav",
//         "/assets/audio/yamee.wav"
//       ];
//       const sound = sounds[Math.floor(Math.random() * sounds.length)];
//       if (msgText.startsWith("kick") || msgText.startsWith("muteAudio")) {
//         await playTrack(sound, false, 1000, rtcClient);
//       }
//     }
//   });
// }

const handleMusicMode = async (rtmChannel: RtmChannel, rtcClient: IAgoraRTCClient) => {
  const send = (t: string) => sendMessage(t, rtmChannel);
  const emoji = (e: string) => sendEmoji(e, rtmChannel);

  const firstTrack = await playTrack("/assets/audio/amazing.m4a", false, 100, rtcClient);
  firstTrack.on("source-state-change", async () => {
    await playTrack("/assets/audio/everyday.m4a", true, 100, rtcClient);
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


export async function joinCall(conference_call_id: string, mode: 'music' | 'fuck' | 'kuso'): Promise<void> {
  try {
    let botIsActive = true;
    do {
      const randomBotIdResponse = await fetch("/api/bot-api/random_bot_id");
      if (!randomBotIdResponse.ok) throw new Error("Failed to fetch random bot ID");
      const randomBotIdData = await randomBotIdResponse.json();
      bot_id = randomBotIdData.bot.id;

      const botStatusRes = await fetch(`/api/bot-api/${bot_id}/status`);
      if (!botStatusRes.ok) throw new Error("Failed to fetch bot status");
      const botStatusData: botStatusResponse = await botStatusRes.json();
      botIsActive = botStatusData.bot.isActive;
      if (botIsActive) await new Promise(resolve => setTimeout(resolve, 10));
    } while (botIsActive);

    const agoraInfoResponse = await fetch(`/api/agora-api/agora_info?bot_id=${bot_id}&conference_call_id=${conference_call_id}`);
    if (!agoraInfoResponse.ok) throw new Error("Failed to fetch Agora data");
    const agoraInfo = await agoraInfoResponse.json();

    const { APP_ID, agora_rtm_token, agora_channel_token, agora_channel, conference_call_user_uuid } = agoraInfo;
    if (!APP_ID || !agora_rtm_token || !agora_channel_token || !agora_channel || !conference_call_user_uuid) {
      throw new Error("Incomplete Agora info");
    }

    const rtcClient: IAgoraRTCClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    const rtmClient: RtmClient = AgoraRTM.createInstance(APP_ID);

    await rtmClient.login({ token: agora_rtm_token, uid: conference_call_user_uuid });
    const rtmChannel: RtmChannel = rtmClient.createChannel(agora_channel);
    await rtmChannel.join();

    await rtcClient.join(APP_ID, agora_channel, agora_channel_token, conference_call_user_uuid);
    rtcClient.enableAudioVolumeIndicator();

    if (mode === "kuso") {
      await handleKusoMode(rtmChannel, rtcClient);
    } else if (mode === "music") {
      await handleMusicMode(rtmChannel, rtcClient);
    } else if (mode === "fuck") {
      setupFuckBotUI(rtmChannel);
      const localTrack: IMicrophoneAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      await rtcClient.publish([localTrack]);
    }

    rtcClient.on("user-published", async (user, mediaType) => {
      await rtcClient.subscribe(user, mediaType);
      if (mediaType === "audio") {
        const remoteAudioTrack = user.audioTrack;
        if (remoteAudioTrack) remoteAudioTrack.play();
      }
    });

    rtcClient.on("user-unpublished", (user) => {
      const remoteAudioTrack = user.audioTrack;
      if (remoteAudioTrack) remoteAudioTrack.stop();
    });

    rtcClient.on("volume-indicator", (volumes) => {
      volumes.forEach(vol => {
        const el = document.querySelector(`#user-${vol.uid} .mic-icon`);
        if (el) el.classList.toggle("muted", vol.level < 5);
      });
    });

    await fetch(`/api/users/owner/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: conference_call_user_uuid, conference_call_id }),
    });

    initializeRtmChannel(rtmClient, rtmChannel, bot_id);
  } catch (err) {
    console.error("Error during joinCall:", err);
  }
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export function generateUserUUIDs(count: number): string[] {
  return Array.from({ length: count }, () => generateUserUUID());
}