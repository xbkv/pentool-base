import { playTrack, sendEmoji } from "../utils/agoraActions";

export function setupFuckBotUI(rtcClient, rtmChannel) {
  const container = document.getElementById("fuck-bot-ui");
  const buttonsDiv = document.getElementById("emoji-buttons");

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

  const sendBtn = document.createElement("button");
  sendBtn.className = "btn btn-success";
  sendBtn.textContent = "送信";
  sendBtn.addEventListener("click", async () => {
    const text = input.value.trim();
    for (const char of text) {
      await sendEmoji(char, rtmChannel);
      await new Promise(res => setTimeout(res, 150)); // 少し間隔をあける
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