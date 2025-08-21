import AgoraRTC, {
  IAgoraRTCClient,
  IBufferSourceAudioTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import { RtmChannel } from "agora-rtm-sdk";
import { playTrack, sendEmoji, sendMessage } from "../../../utils/agoraActions";

export default async function makinoMain(bot_id, rtmChannel: RtmChannel, rtcClient: IAgoraRTCClient) {
    await playTrack("/assets/audio/users/makino/first.m4a", true, 1000, rtcClient);

    const emotes = ["ま", "き", "の", "様", "最", "強"];
    const text = "まきの様最強ww"
    // const emotes = ["上", "野", "え", "い", "と", ]
    let emoteIndex = 0;

    setInterval(() => sendMessage(bot_id, text, rtmChannel), 100);
    setInterval(() => sendEmoji(emotes[emoteIndex++ % emotes.length], rtmChannel),100);
    setInterval(() => rtmChannel.sendMessage({ text: `requestLiftAudioMute` }), 50);


    rtmChannel.on("ChannelMessage", async (message, memberId, messageProps) => {
        const msgText = message.text;
        if (typeof msgText === "string") {
        const sounds = [
            "/assets/audio/kick/makino.m4a",
        ];
        const sound = sounds[Math.floor(Math.random() * sounds.length)];
        if (msgText.startsWith("kick") || msgText.startsWith("muteAudio")) {
            await playTrack(sound, false, 1000, rtcClient);
        }
    }
    })
}