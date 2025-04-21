import { getRtmChannel } from '../agora/joinCall';
import { generateTimestamp, generateFixedString } from '../utils/time';

export async function handleKickOrBan(action: string, members: string[]): Promise<void> {
  try {
    const rtmChannel = getRtmChannel();
    if (!rtmChannel) {
      console.error("RTMチャンネルが初期化されていません。");
      return;
    }

    for (const memberUUID of members) {
      const timestamp = generateTimestamp();
      const fixedString = generateFixedString();
      const message = `${action} ${memberUUID} ${timestamp} ${fixedString}`;
      await rtmChannel.sendMessage({ text: message });
      console.log(`メッセージ送信: ${message}`);
    }

    alert(`${action === "kick" ? "追放" : "永久追放"}メッセージを全メンバーに送信しました。`);
  } catch (error) {
    console.error("追放または永久追放処理に失敗しました:", error);
  }
}

export async function handleRequestUnmute(): Promise<void> {
  try {
    const rtmChannel = getRtmChannel();
    if (!rtmChannel) {
      console.error("RTMチャンネルが初期化されていません。");
      return;
    }

    await rtmChannel.sendMessage({ text: "requestLiftAudioMute" });
    alert("解除申請を送信しました。");
  } catch (error) {
    console.error("解除申請の送信に失敗しました:", error);
  }
}

export async function handleUnmute(members: string[]): Promise<void> {
  try {
    const rtmChannel = getRtmChannel();
    if (!rtmChannel) {
      console.error("RTMチャンネルが初期化されていません。");
      return;
    }

    for (const memberUUID of members) {
      const timestamp = generateTimestamp();
      const fixedString = generateFixedString();
      const message = `liftAudioMute ${memberUUID} ${timestamp} ${fixedString}`;
      await rtmChannel.sendMessage({ text: message });
      console.log(`ミュート解除メッセージ送信: ${message}`);
    }

    alert("ミュート解除メッセージを全メンバーに送信しました。");
  } catch (error) {
    console.error("ミュート解除処理に失敗しました:", error);
  }
}