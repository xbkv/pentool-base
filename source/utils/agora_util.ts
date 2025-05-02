// import { HttpsProxyAgent } from "https-proxy-agent";
// const proxyAgent = new HttpsProxyAgent(process.env.PROXY_URL);

import { BotModel, IBot } from "../models/Bot";
import { updateAccessToken } from "./token_util";
import dotenv from 'dotenv';
import { RESULT_MESSAGE } from "../routes/api/messages";
import fetch from "node-fetch"
import { AgoraChannelInfo, AgoraInfo, ErrorResponse, StartConferenceCallUrl } from "./types";
import { colors, setColor } from "./color_util";
import { isErrorResponse } from "./util";
import { ERROR_CODES } from '../constants/errorCodes';
dotenv.config();

async function fetchAgoraRTMToken(conference_id: string, user: IBot): Promise<string> {
    try {
        const response = await fetch(`${process.env.YAY_HOST}/v2/calls/${conference_id}/agora_rtm_token`, {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
                'Content-Type': 'application/json',
                'User-Agent': process.env.USER_AGENT,
            },
            // agent: proxyAgent
        });
        let data = await response.json();
        
        if (data.error_code) {
            if (data.error_code === -3) {
                await updateAccessToken(user);

                const retryResponse = await fetch(`${process.env.YAY_HOST}/v2/calls/${conference_id}/agora_rtm_token`, {
                    headers: {
                        'Authorization': `Bearer ${user?.access_token}`,
                        'Content-Type': 'application/json',
                        'User-Agent': process.env.USER_AGENT,
                    },
                    // agent: proxyAgent
                });

                data = await retryResponse.json();

                if (data.error_code) {
                    throw new Error(`Failed to fetch RTM token after update. Error code: ${data.error_code}`);
                }
            }
        }

        return data.token;
    } catch (error) {
        console.error(`Error fetching Agora RTM token for bot ID ${user.user_id}:`, error);
        throw new Error('Failed to fetch Agora RTM token');
    }
}

async function fetchAgoraInfo(conference_call_id: string, user: IBot | null): Promise<AgoraInfo | null> {
    try {
        const APP_ID = process.env.AGORA_APP_ID;

        if (!user?.access_token) {
            const message = `[${user?.user_id}]のアクセストークンが見つかりません。 トークンをリフレッシュします。`;
            console.log(setColor(colors.red, message, -1));
            await updateAccessToken(user);
        }

        const startCallResult = await startCall(conference_call_id, user);

        if (!startCallResult) {
            const msg = `情報は取得できなかったため処理を中断します。[${user?.user_id}]`;
            console.log(setColor(colors.red, msg, -1));
            return null;
        }

        const { agora_channel, conference_call_user_uuid, agora_channel_token } = startCallResult;

        const agora_rtm_token = await fetchAgoraRTMToken(conference_call_id, user);

        return {
            status: RESULT_MESSAGE.SUCCESS.message,
            agora_channel,
            agora_rtm_token,
            conference_call_user_uuid,
            agora_channel_token,
            APP_ID,
        };
    } catch (error) {
        console.error(`BOTのAgoraデータの取得に失敗しました。[${user?.user_id}] エラー内容:`, error);
        return null;
    }
}

async function startCall(conference_call_id: string, user: IBot | null): Promise<AgoraChannelInfo | null> {
    try {
        const start_conference_call_url = `${process.env.YAY_HOST}/v2/calls/start_conference_call`;

        let response = await fetch(start_conference_call_url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${user?.access_token}`,
                'Content-Type': 'application/json',
                'User-Agent': process.env.USER_AGENT,
            },
            body: JSON.stringify({ conference_id: conference_call_id }),
        });

        let data: StartConferenceCallUrl = await response.json();
        // console.log(data)
        if (isErrorResponse(data)) {
            const code = data.error_code;

            if (code === ERROR_CODES.TOKEN_EXPIRED) {
                await updateAccessToken(user);
                response = await fetch(start_conference_call_url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${user?.access_token}`,
                        'Content-Type': 'application/json',
                        'User-Agent': process.env.USER_AGENT,
                    },
                    body: JSON.stringify({ conference_id: conference_call_id }),
                });

                data = await response.json();

                if (isErrorResponse(data)) {
                    throw new Error(`Failed to start call after retry. Error code: ${data.error_code}, message: ${data.message}`);
                }
            } else if (code === ERROR_CODES.USER_BLOCKING) {
                console.log(setColor(colors.red, `このアカウントは通話内のメンバーにブロックされています。`, -1))
                return null;
            } else if (code === ERROR_CODES.USER_DELETED) {
                console.log(setColor(colors.red, `ユーザーが運営に削除されたためユーザーの情報を削除します。`, -1));
                await BotModel.deleteOne({ user_id: user?.user_id });
                return null;
            } else if (code === ERROR_CODES.LIMITED_ACCESS) {
                console.log(setColor(colors.red, `この通話には入室制限がかかっています。ボットでは入室できません。`, -1));
                process.exit(1);
            } else if (code === ERROR_CODES.FOLLOWER_ONLY) {
                console.log(setColor(colors.red, `この通話はフォロワーのみ参加できます。ボットでは入室できません。`, -1));
                process.exit(1);
            } else if (code === ERROR_CODES.MUTUAL_ONLY) {
                console.log(setColor(colors.red, `この通話は相互フォローのみ参加できます。ボットでは入室できません。`, -1));
                process.exit(1);
            } else if (code === ERROR_CODES.CALL_INACTIVE) {
                console.log(setColor(colors.red, `この通話はすでに終了しています。`, -1));
                process.exit(1);
            } else if (code === ERROR_CODES.REQUEST_LIMIT) {
                console.log(setColor(colors.red, "リクエスト制限に達しました。時間がたってからやり直してください。", -1));
                process.exit(1);
            } else {
                console.log(setColor(colors.red, `まだ識別されていないエラーコードです。${code} ${data.message}`, -1));
                process.exit(1);
            }
        }

        const conference = data.conference_call;
        if (!conference) {
            throw new Error('conference_call data is missing');
        }

        return {
            agora_channel: conference.agora_channel,
            conference_call_user_uuid: data.conference_call_user_uuid,
            agora_channel_token: conference.agora_token,
        };
    } catch (error) {
        console.error('Error starting call:', error);
        throw new Error('Failed to start conference call');
    }
}

export async function participateInConferences(conference_call_id: any, bots: IBot[]) {
    const results = await Promise.all(
        bots.map(async (bot) => {
            console.log(`[*] ボットの入室プロセスを実行します。 [${bot.user_id}]`);

            let result = await fetchAgoraInfo(conference_call_id, bot);

            if (!result) {
                console.log(setColor(colors.red, `最初の入室に失敗しました。 [${bot.user_id}]`, -1));

                let success = false;
                let attemptCount = 0;
                const MAX_ATTEMPTS = 100;

                while (!success && attemptCount < MAX_ATTEMPTS) {
                    attemptCount++;
                    const availableBots = await BotModel.find(); 

                    for (const newBot of availableBots) {
                        if (!newBot.access_token) continue
                        const retry = await fetchAgoraInfo(conference_call_id, newBot);
                        if (retry) {
                            console.log(setColor(colors.green, `再試行でボットの入室に成功しました。 [${newBot.user_id}]`, 1));
                            return retry;
                        } else {
                            console.log(setColor(colors.red, `再試行失敗: [${newBot.user_id}]`, -1));
                        }
                    }

                    await new Promise(res => setTimeout(res, 1000)); // 待機（1秒）
                }

                console.log(setColor(colors.red, `全ての再試行に失敗しました。`, -1));
                return null;
            } else {
                console.log(setColor(colors.green, `ボットの入室に成功しました。 [${bot.user_id}]`, 1));
                return result;
            }
        })
    );

    return results.filter(result => result !== null);
}