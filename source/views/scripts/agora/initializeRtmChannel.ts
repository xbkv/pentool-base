import { RtmClient, RtmChannel } from "agora-rtm-sdk";

function handleChatMessage(text: string) {
  const payload = text.replace("chat ", "");
  try {
    const message = JSON.parse(payload);
    console.log(`💬 [チャット受信] :「${message.text}」`);
  } catch {
    console.warn(`⚠️ [エラー] 無効なチャット形式です: ${payload}`);
  }
}

function handleReaction(text: string) {
  const reaction = text.replace("react ", "").trim();
  console.log(`🎭 [リアクション受信] : ${reaction}`);
}

export function initializeRtmChannel(
  rtmClient: RtmClient,
  rtmChannel: RtmChannel,
  botId: string
): void {
  console.log(`✅ RTMチャンネル (${botId}) 初期化完了`);

  rtmChannel.on("ChannelMessage", ({ text }, senderId) => {
    const time = new Date().toLocaleTimeString();
    if (typeof text !== "string") {
      console.warn(`⚠️ [${time}] ${senderId} から受信したメッセージが文字列ではありません:`, text);
      return;
    }

    console.log(`📩 [${time}] メッセージ受信 - 送信者: ${senderId}, 内容: "${text}"`);

    if (text.startsWith("chat")) {
      handleChatMessage(text);
    } else if (text.startsWith("react")) {
      handleReaction(text);
    } else {
      console.log(`📝 [未分類メッセージ] ${text}`);
    }
  });

  rtmChannel.on("MemberJoined", memberId => {
    const time = new Date().toLocaleTimeString();
    console.log(`🔔 [${time}] ユーザー参加 - ${memberId} がチャンネルに参加しました。`);
  });

  rtmChannel.on("MemberLeft", memberId => {
    const time = new Date().toLocaleTimeString();
    console.log(`👋 [${time}] ユーザー退出 - ${memberId} がチャンネルから退出しました。`);
  });
}
