import { RtmClient, RtmChannel } from "agora-rtm-sdk";

export function initializeRtmChannel(
  rtmClient: RtmClient,
  rtmChannel: RtmChannel,
  botId: string
): void {
  rtmChannel.on("ChannelMessage", ({ text }, senderId) => {
    console.log(`[RTM] ${senderId}: ${text}`);

    if (text.startsWith("chat")) {
      const payload = text.replace("chat ", "");
      try {
        const message = JSON.parse(payload);
        console.log("💬 Chat Message:", message.text);
      } catch (e) {
        console.warn("⚠️ 無効な chat payload:", payload);
      }
    }

    if (text.startsWith("react")) {
      const reaction = text.replace("react ", "").trim();
      console.log(`🎭 Reaction: ${reaction}`);
    }
  });

  rtmChannel.on("MemberJoined", memberId => {
    console.log(`👤 ${memberId} joined the channel.`);
  });

  rtmChannel.on("MemberLeft", memberId => {
    console.log(`🚪 ${memberId} left the channel.`);
  });
}
