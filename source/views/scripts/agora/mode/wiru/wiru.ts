import { IAgoraRTCClient } from "agora-rtc-sdk-ng";
import { RtmChannel } from "agora-rtm-sdk";
import { playTrack, sendEmoji, sendMessage } from "../../../utils/agoraActions";

export async function wiruMain(bot_id, rtmChannel: RtmChannel, rtcClient: IAgoraRTCClient) {
  const user_path = `/assets/audio/users/${process.env.DB_USER}`
  const firstTrack = await playTrack(`${user_path}/first.wav`, false, 1000, rtcClient);

  const emotes = ["領", "域", "展", "開"];
  const extraEmotes = ["伏","魔","御","厨","子"];

  function sendSequentialEmojis(emotes, delay, channel, initialDelay = 0) {
    setTimeout(() => {
      emotes.forEach((emote, index) => {
        setTimeout(() => {
          sendEmoji(emote, channel);
        }, delay * index);
      });
    }, initialDelay);
  }

  sendSequentialEmojis(emotes, 300, rtmChannel, 500);

  sendSequentialEmojis(extraEmotes, 300, rtmChannel, 3900);

  firstTrack.on("source-state-change", async (state) => {
    if (state === "stopped") {
      try {
        const audioManager = (window as any).audioManager;
        console.log('AudioManager available:', !!audioManager);
        console.log('AudioManager object:', audioManager);
        
        if (audioManager && typeof audioManager.getSelectedAudioFile === 'function') {
          const selectedAudio = audioManager.getSelectedAudioFile();
          console.log('Selected audio file:', selectedAudio);
          
          if (selectedAudio && selectedAudio.path) {
            console.log('Using selected audio file:', selectedAudio.name, 'Path:', selectedAudio.path);
            console.log('Playing custom audio track...');
            await playTrack(selectedAudio.path, true, 1000, rtcClient);
            console.log('Custom audio track played successfully');
          } else {
            console.log('No selected audio file or invalid path, using default second.m4a');
            console.log('Playing default audio track...');
            await playTrack("/assets/audio/users/wiru/second.m4a", true, 1000, rtcClient);
            console.log('Default audio track played successfully');
          }
        } else {
          console.log('AudioManager not available or getSelectedAudioFile method not found');
          console.log('AudioManager methods:', audioManager ? Object.getOwnPropertyNames(audioManager) : 'null');
          console.log('Playing default audio track...');
          await playTrack("/assets/audio/users/wiru/second.m4a", true, 1000, rtcClient);
          console.log('Default audio track played successfully');
        }
      } catch (error) {
        console.error('Failed to play audio, using default:', error);
        console.log('Playing fallback default audio track...');
        await playTrack("/assets/audio/users/wiru/second.m4a", true, 1000, rtcClient);
        console.log('Fallback audio track played successfully');
      }
      
      console.log('=== 音声選択処理完了 ===');
      
      const text = "灰色の鎖が千切れ、黒き刃が降り注ぐ…無限の叫びが刃に刻まれ、伏魔の胎が歓喜に震える…切り刻まれるは魂か、世界か…";
      const emotes = [
        "🔪",  
        "🩸",  
        "📜", 
        "⚔️",  
        "⛓️",  
        "🌑",  
        "✂️",  
        "🪓",  
        "💥",  
        "🔨",  
        "🗡️",  
        "🩹",  
        "❌",  
        "🪚",  
        "🧨",
      ];
      
      let charIndex = 0;
      let emoteIndex = 0;
      setInterval(() => sendMessage(bot_id, text[charIndex++ % text.length], rtmChannel), 100);
      setInterval(() => sendEmoji(emotes[emoteIndex++ % emotes.length], rtmChannel), 50);
      setInterval(() => rtmChannel.sendMessage({ text: `requestLiftAudioMute` }), 50);
    }
  });
  rtmChannel.on("ChannelMessage",
    async (message) => {
      const msgText = message.text;
      if (typeof msgText === "string") {
        if (msgText.startsWith("kick") || msgText.startsWith("muteAudio")) {
          const sounds = [
            "/assets/audio/kick/ganbare.mp3",
          ];
          const sound = sounds[Math.floor(Math.random() * sounds.length)];
          await playTrack(sound, false, 1000, rtcClient);
        }
      }
    }
  );
}
