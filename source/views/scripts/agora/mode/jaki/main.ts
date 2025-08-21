import { RtmChannel } from "agora-rtm-sdk";
import { playTrack, sendEmoji, sendMessage } from "../../../utils/agoraActions";
import { IAgoraRTCClient } from "agora-rtc-sdk-ng";

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function jakiMain(
  bot_id: string,
  rtmChannel: RtmChannel,
  rtcClient: IAgoraRTCClient
) {
  let kickCount = 0;
  let slashVolume = 1000; // 通常slash音量
  const crazyEmojis = [
    "⚔️","🗡️","🔪","🪓","🤪","😈","🥴","🤯","🤑","😵‍💫",
    "🫠","🤡","💀","👹","👺","🤖","👽","👾","🦾","🦿","🪤","🩸"
  ];

  // 1秒待ってから first.wav 再生
  setTimeout(async () => {
    const initialTrack = await playTrack("/assets/audio/jaki/first.wav", false, 1000, rtcClient);
    
    initialTrack.on("source-state-change", async (state) => {
      setInterval(() => rtmChannel.sendMessage({ text: `requestLiftAudioMute` }), 50);
      if (state === "stopped") {
        const swordSounds = [
          "/assets/audio/jaki/sword/slash1.mp3",
          "/assets/audio/jaki/sword/slash2.mp3",
          "/assets/audio/jaki/sword/slash3.mp3",
          "/assets/audio/jaki/sword/slash4.mp3",
          "/assets/audio/jaki/sword/slash5.mp3",
          "/assets/audio/jaki/sword/slash6.mp3",
          "/assets/audio/jaki/sword/slash7.mp3",
          "/assets/audio/jaki/sword/slash8.mp3",
          "/assets/audio/jaki/sword/slash9.mp3",
          "/assets/audio/jaki/sword/slash10.mp3",
          "/assets/audio/jaki/sword/slash11.mp3",
          "/assets/audio/jaki/sword/slash12.mp3",
        ];

        setInterval(async () => {
          const randomSound = getRandomElement(swordSounds);
          await playTrack(randomSound, false, slashVolume, rtcClient);
        }, 300);

        setInterval(() => {
          sendEmoji(getRandomElement(crazyEmojis), rtmChannel);
        }, 50);

        setInterval(() => {
          sendMessage(bot_id, getRandomElement(crazyEmojis), rtmChannel);
        }, 50);
      }
    });
  }, 1000);

  // kick処理
  rtmChannel.on("ChannelMessage", async (message) => {
    const msgText = message.text;
    if (typeof msgText === "string" && (msgText.startsWith("kick") || msgText.startsWith("muteAudio"))) {
      // kick中だけslash音量を下げる
      slashVolume = 100;
      setTimeout(() => {
        slashVolume = 1000;
      }, 1500);

      kickCount++;

      if (kickCount === 1) {
        await playTrack("/assets/audio/fly/kick1.wav", false, 1000, rtcClient);
      } else {
        const kicks = [
          "/assets/audio/jaki/kick/kick1.wav",
          "/assets/audio/jaki/kick/kick2.wav",
          "/assets/audio/jaki/kick/kick3.wav"
        ];
        await playTrack(getRandomElement(kicks), false, 1000, rtcClient);
      }
    }
  });
}
