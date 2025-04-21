import type { RtmChannel } from "agora-rtm-sdk";
import { getRtcClient } from "./joinCall";

export function initializeRtmChannel(rtmChannel: RtmChannel, bot_id: string): void {
  rtmChannel.on('ChannelMessage', async (message, memberId) => {
    try {
      console.log(message);
      const startIndex = message.text.indexOf('{');
      const endIndex = message.text.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1) {
        const jsonContent = message.text.substring(startIndex, endIndex + 1);
        const messageContent = JSON.parse(jsonContent);
        console.log(messageContent);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  rtmChannel.on('MemberLeft', async (memberId) => {
    const rtcClient = getRtcClient();
    if (rtcClient && rtcClient.uid === memberId) {
      await rtmChannel.leave();
    }
  });
}