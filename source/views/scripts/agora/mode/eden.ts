import { sendEmoji, sendMessage } from "../../utils/agoraActions";
import { playTrack } from "../../utils/agoraActions";
import { RtmChannel } from "agora-rtm-sdk";
import { IAgoraRTCClient } from "agora-rtc-sdk-ng";

export const handleEdenMode = async (bot_id: string, rtmChannel: RtmChannel, rtcClient: IAgoraRTCClient) => {
    const send = (t: string) => sendMessage(bot_id, t, rtmChannel);
    const emoji = (e: string) => sendEmoji(e, rtmChannel);
  
    const firstTrack = await playTrack("/assets/audio/eden/first.wav", false, 100, rtcClient);
    // firstTrack.on("source-state-change", async () => {
    //   await playTrack("/assets/audio/eden/eden.m4a", true, 100, rtcClient);
    // });
  
    setTimeout(async () => {
    for (let i = 0; i < 30; i++) {
        await emoji("🟦");
        await emoji("🔵");
    }
      setTimeout(async () => {
        await send("えでん「あなる見せてくれたら画録は消すよ?」");
        for (let i = 0; i < 40; i++) {
            await emoji("🤓");
        }
        setTimeout(async () => {
          for (let i = 0; i < 20; i++) {
            await emoji("⬜");
            await emoji("⚪");
          }
          setTimeout(async () => {
            await send("女の子「それはちょっと…」");
            const text = "それはちょっと";
            for (const char of text) {
                await emoji(char);
                await new Promise(res => setTimeout(res, 100)); // 0.3秒間隔
            }
            setTimeout(async () => {
                for (let i = 0; i < 10; i++) {
                    await emoji("⬛");
                    await emoji("⚫");
                }
              setTimeout(async () => {
                await emoji("💔");
                setTimeout(async () => {
                    await send("チャンス！！！！！！");
                    for (let i = 0; i < 5; i++) {
                        await emoji("🎰");
                        await emoji("🎯");
                        await emoji("�");
                        await emoji("🚨");
                        await emoji("🏮");
                        await emoji("🀄");
                        await emoji("🎆");
                        await emoji("💫");
                        await emoji("🏹");
                        await emoji("�");
                        await emoji("�");
                        await emoji("🎇");
                    }
                    setTimeout(async () => {
                        await send("土下座をすれば大当たり！？");
                        setTimeout(async () => {
                            const text = "完全降伏します";
                            for (const char of text) {
                                await emoji(char);
                                await new Promise(res => setTimeout(res, 100)); // 0.3秒間隔
                            }
                            setTimeout(async () => {
                                for (let i = 0; i < 30; i++) {
                                    await emoji("🟥");
                                    await emoji("🔴");
                                }
                                setTimeout(async () => {
                                    await send("喧嘩をこの度売ってしまってすみませんでした");
                                    setTimeout(async () => {
                                        const text = "僕は、えでんです";
                                        for (const char of text) {
                                            await emoji(char);
                                            await new Promise(res => setTimeout(res, 120)); // 0.3秒間隔
                                        }
                                        setTimeout(async () => {
                                            await send("🙇🙇🙇🙇🙇🙇🙇🙇🙇🙇🙇🙇🙇🙇🙇🙇🙇🙇🙇🙇🙇");
                                            await emoji("🙇");
                                            setTimeout(async () => {
                                                for (let i = 0; i < 60; i++) {
                                                    await emoji("🌈");
                                                    await emoji("🤓");
                                                    await emoji("🌈");
                                                }
                                                setTimeout(async () => {
                                                    for (let i = 0; i < 50; i++) {
                                                        await emoji("🙇")
                                                        await emoji("🤓");
                                                        await emoji("🟥");
                                                        await emoji("🔴");
                                                        await emoji("❤");
                                                        await emoji("🟧");
                                                        await emoji("🟠");
                                                        await emoji("🧡");
                                                        await emoji("🟨");
                                                        await emoji("🟡");
                                                        await emoji("💛");
                                                        await emoji("🟩");
                                                        await emoji("🟢");
                                                        await emoji("💚");
                                                        await emoji("🟦");
                                                        await emoji("🔵");
                                                        await emoji("💙");
                                                        await emoji("🟪");
                                                        await emoji("🟣");
                                                        await emoji("💜");
                                                        await emoji("⬜");
                                                        await emoji("⚪");
                                                        await emoji("🤍");
                                                        await emoji("🙇")
                                                    }
                                                }, 500);
                                            }, 1000);
                                        }, 1500);
                                    // for (let i = 0; i < 70; i++) await emoji("🫧");
                                    }, 2400);
                                }, 800);
                            }, 500);
                        }, 1200);
                    }, 750);
                }, 1000);
              }, 650);
            }, 800);
          }, 1600);
        }, 850);
      }, 1100);
    }, 900);
  };