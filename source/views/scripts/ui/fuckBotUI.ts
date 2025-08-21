import { IAgoraRTCClient } from "agora-rtc-sdk-ng";
import { RtmChannel } from "agora-rtm-sdk";
import { playTrack, sendEmoji } from "../utils/agoraActions";
import { v4 as uuidv4 } from "uuid";
import { IRemoteAudioTrack } from "agora-rtc-sdk-ng/esm";

async function fetchAndDisplayParticipants(rtcClient: IAgoraRTCClient, rtmChannel: RtmChannel, callId: string, bot_id: string) {
  const buttonsDiv = document.getElementById("emoji-buttons");
  if (!buttonsDiv) return;

  const users = await rtmChannel.getMembers();
  console.log(users);

  for (const user of users) {
    const uuid = String(user); 
    try {
      const res = await fetch(`/yay-api/v1/calls/${callId}/participants/${uuid}/bot_id/${bot_id}`);
      const data = await res.json();
      const nickname = data.user.nickname || "(no name)";
      const userId = uuid;

      // 👞 Kick ボタン
      const kickBtn = document.createElement("button");
      kickBtn.className = "btn btn-danger btn-sm mb-2 me-2";
      kickBtn.textContent = `👞 Kick ${nickname}`;
      kickBtn.addEventListener("click", () => {
        const timestamp = Math.floor(Date.now() / 1000);
        const randomId = uuidv4();
        const message = `kick ${userId} ${timestamp} ${randomId}`;
        rtmChannel.sendMessage({ text: message });
      });
      buttonsDiv.appendChild(kickBtn);

      // 🔇 Mute ボタン
      const muteBtn = document.createElement("button");
      muteBtn.className = "btn btn-secondary btn-sm mb-2 me-2";
      muteBtn.textContent = `🔇 Mute ${nickname}`;
      muteBtn.addEventListener("click", () => {
        const timestamp = Math.floor(Date.now() / 1000);
        const randomId = uuidv4();
        const message = `muteAudio ${userId} ${timestamp} ${randomId}`;
        rtmChannel.sendMessage({ text: message });
      });
      buttonsDiv.appendChild(muteBtn);

    } catch (err) {
      console.error(`Failed to fetch user ${uuid}:`, err);
    }
  }
}


export function setupFuckBotUI(rtcClient: IAgoraRTCClient, rtmChannel: RtmChannel, callId: string, bot_id: string) {
  const container = document.getElementById("fuck-bot-ui");
  const buttonsDiv = document.getElementById("emoji-buttons");
  fetchAndDisplayParticipants(rtcClient, rtmChannel, callId, bot_id);
  if (!container || !buttonsDiv) return;

  const emojis = [
    "🖕", "🧊", "💩", "😂", "🔥", "🤬", "😡", "👿", "🤡",
    "👺", "😈", "🥶", "😤", "😵", "😹", "🥵", "🫠", "🙃",
    "🤢", "🤮", "💀", "☠️", "👻", "🙀", "🗿", "📢", "📣",
    "🧨", "💥", "🪓", "🔪", "🛠️", "🚨", "🚬", "🍺", "🍷",
    "🥴", "🪦", "🛸", "🧠", "🫥", "🔊", "🎺", "📛", "🧷",
    "あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ",
    "さ", "し", "す", "せ", "そ", "た", "ち", "つ", "て", "と",
    "な", "に", "ぬ", "ね", "の", "は", "ひ", "ふ", "へ", "ほ",
    "ま", "み", "む", "め", "も", "や", "ゆ", "よ", "ら", "り",
    "る", "れ", "ろ", "わ", "を", "ん"
  ];

  buttonsDiv.innerHTML = "";

  // 🎙️ ミュート解除ボタン
  const requestBtn = document.createElement("button");
  requestBtn.className = "btn btn-warning btn-lg mb-3 me-2";
  requestBtn.textContent = "🎙️ ミュート解除";
  requestBtn.addEventListener("click", () => rtmChannel.sendMessage({ text: `requestLiftAudioMute`}));
  buttonsDiv.appendChild(requestBtn);

  // 💬 文字入力フォーム
  const inputGroup = document.createElement("div");
  inputGroup.className = "input-group mb-3";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "form-control";
  input.placeholder = "文字列を入力してください";
  input.id = "emoji-input";
  rtcClient.on("user-published", async (user, mediaType) => {
   if (mediaType === "audio") {
    await rtcClient.subscribe(user, mediaType);
    const remoteAudioTrack = user.audioTrack;

    if (remoteAudioTrack) {
      remoteAudioTrack.play();
    } else {
      console.warn("audioTrack is undefined");
    }
  }
});
  const sendBtn = document.createElement("button");
  sendBtn.className = "btn btn-success";
  sendBtn.textContent = "送信";
  sendBtn.addEventListener("click", async () => {
    const text = input.value.trim();
    for (const char of text) {
      await sendEmoji(char, rtmChannel);
      await new Promise(res => setTimeout(res, 150));
    }
    input.value = "";
  });

  inputGroup.appendChild(input);
  inputGroup.appendChild(sendBtn);
  buttonsDiv.appendChild(inputGroup);

  emojis.forEach(emoji => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-light btn-lg mb-2 me-2";
    btn.textContent = emoji;
    btn.addEventListener("click", () => sendEmoji(emoji, rtmChannel));
    buttonsDiv.appendChild(btn);
  });

  container.style.display = "block";
  rtmChannel.on("ChannelMessage", async (message, memberId, messageProps) => {
    const msgText = message.text;
    console.log(message)
    if (typeof msgText === "string") {
      const sounds = [
        "/assets/audio/kick/ganbare.mp3",
        "/assets/audio/kick/nigeruna.mp3",
      ];
      const sound = sounds[Math.floor(Math.random() * sounds.length)];

      if (msgText.startsWith("kick") || msgText.startsWith("muteAudio")) {
        await playTrack(sound, false, 1000, rtcClient);
      }
    }
  });
}