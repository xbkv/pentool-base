// import { HttpsProxyAgent } from "https-proxy-agent";
// const proxyAgent = new HttpsProxyAgent(process.env.PROXY_URL);

import { IBot, BotModel } from "../models/Bot";
import { IAgoraCache, AgoraCacheModel } from "../models/AgoraCache"; 

import { updateAccessToken } from "./token_util";
import dotenv from 'dotenv';
import { RESULT_MESSAGE } from "../routes/api/messages";
import fetch from "node-fetch"
import { AgoraChannelInfo, AgoraInfo, FetchAgoraResult, ParticipationResult, StartCallResult, StartConferenceCallUrl } from "./types";
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

export async function fetchAgoraInfo(conference_call_id: string, user: IBot | null): Promise<AgoraInfo> {
    try {
        const APP_ID = process.env.AGORA_APP_ID;

        if (!user?.access_token) {
            console.log(setColor(colors.yellow, `[⚠] [${user?.user_id}] のアクセストークンが見つかりません。トークンをリフレッシュします。`, -1));
            await updateAccessToken(user);
        }

        const startCallResult = await startCall(conference_call_id, user);

        if (startCallResult && "success" in startCallResult && !startCallResult.success) {
            console.log(setColor(colors.red, `通話開始に失敗しました。[${user?.user_id}]`, -1));
            throw new Error("unjoinable_call"); // ← 明確にエラーをスロー
        }

        if (startCallResult && !("success" in startCallResult)) {
            const {
                agora_channel,
                conference_call_user_uuid,
                agora_channel_token
            } = startCallResult;

            const agora_rtm_token = await fetchAgoraRTMToken(conference_call_id, user);

            return {
                status: RESULT_MESSAGE.SUCCESS.message,
                agora_channel,
                agora_rtm_token,
                conference_call_user_uuid,
                agora_channel_token,
                APP_ID
            };
        }

        throw new Error("unknown_response");
    } catch (error) {
        const message: string = setColor(colors.red, `BOTが参加できない通話のため処理を停止しました。[${user?.user_id}]`, -1)
        console.log(message);
        throw error;
    }
}


async function startCall(conference_call_id: string, user: IBot | null): Promise<StartCallResult> {
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
            } else if (code === ERROR_CODES.USER_BAN) {
                console.log(setColor(colors.red, `現状BANされています。`, -1));
                return null;
            } else if (code === ERROR_CODES.USER_BANNED_CALL) {
                console.log(setColor(colors.red, `この通話からユーザーが永久追放されているため参加できません。`, -1));
                return null;
            } else if (code === ERROR_CODES.LIMITED_ACCESS) {
                console.log(setColor(colors.red, `この通話には入室制限がかかっています。ボットでは入室できません。`, -1));
                return { success: false, reason: "limited_access" };

            } else if (code === ERROR_CODES.FOLLOWER_ONLY) {
                console.log(setColor(colors.red, `この通話はフォロワーのみ参加できます。ボットでは入室できません。`, -1));
                return { success: false, reason: "follower_only" };

            } else if (code === ERROR_CODES.MUTUAL_ONLY) {
                console.log(setColor(colors.red, `この通話は相互フォローのみ参加できます。ボットでは入室できません。`, -1));
                return { success: false, reason: "mutual_only" };

            } else if (code === ERROR_CODES.CALL_INACTIVE) {
                console.log(setColor(colors.red, `この通話はすでに終了しています。`, -1));
                return { success: false, reason: "call_inactive" };

            } else if (code === ERROR_CODES.REQUEST_LIMIT) {
                console.log(setColor(colors.red, "リクエスト制限に達しました。時間がたってからやり直してください。", -1));
                return { success: false, reason: "request_limit" };

            } else {
                console.log(setColor(colors.red, `まだ識別されていないエラーコードです。${code} ${data.message}`, -1));
                return { success: false, reason: `unknown_error_${code}` };
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
        // console.error('Error starting call:', error);
        throw new Error('Failed to start conference call');
    }
}

export async function participateInConferences(
  conference_call_id: any,
  bots: IBot[]
): Promise<ParticipationResult[]> {
  const blacklist = new Set<string>();
  const results: ParticipationResult[] = [];

  for (const bot of bots) {
    console.log(`[*] ボットの入室プロセスを実行します。 [${bot.user_id}]`);

    const cached = await AgoraCacheModel.findOne({
      conference_call_id,
    });
    // console.log(cached)
    if (cached) {
      console.log(setColor(colors.green, `キャッシュを再利用しました。 [${bot.user_id}]`, 1));
      results.push({ success: true, bot, agoraInfo: cached.agoraInfo });
      continue;
    }

    const result: FetchAgoraResult = await fetchAgoraInfo(conference_call_id, bot);

    if (result && !("success" in result)) {
      console.log(setColor(colors.green, `ボットの入室に成功しました。 [${bot.user_id}]`, 1));

      await AgoraCacheModel.updateOne(
        { conference_call_id, bot_user_id: bot.user_id },
        {
          $set: {
            conference_call_id,
            bot_user_id: bot.user_id,
            agoraInfo: result,
            created_at: new Date(),
          },
        },
        { upsert: true }
      );

      results.push({ success: true, bot, agoraInfo: result });
      continue;
    }

    if (result && "success" in result && result.success === false) {
      console.log(setColor(colors.red, `BOTが参加できない通話のため処理を完全に中断します。[${bot.user_id}]`, -1));
      throw new Error("unjoinable_call");
    }

    console.log(setColor(colors.red, `最初の入室に失敗しました。 [${bot.user_id}]`, -1));

    // ✅ 再試行フェーズ
    let attemptCount = 0;
    const MAX_ATTEMPTS = 100;

    while (attemptCount < MAX_ATTEMPTS) {
      attemptCount++;
      const availableBots = await BotModel.find();

      for (const newBot of availableBots) {
        if (!newBot.access_token || blacklist.has(newBot.user_id)) continue;

        const retry: FetchAgoraResult = await fetchAgoraInfo(conference_call_id, newBot);

        if (retry && !("success" in retry)) {
          console.log(setColor(colors.green, `再試行でボットの入室に成功しました。 [${newBot.user_id}]`, 1));

          await AgoraCacheModel.updateOne(
            { conference_call_id, bot_user_id: newBot.user_id },
            {
              $set: {
                conference_call_id,
                bot_user_id: newBot.user_id,
                agoraInfo: retry,
                created_at: new Date(),
              },
            },
            { upsert: true }
          );

          return [{ success: true, bot: newBot, agoraInfo: retry }];
        }

        if (result && "success" in result && result.success === false) {
          console.log(setColor(colors.red, `再試行中にBOTが入室拒否されました: [${newBot.user_id}]`, -1));
          blacklist.add(newBot.user_id);
          throw new Error("unjoinable_call");
        }

        console.log(setColor(colors.red, `再試行失敗: [${newBot.user_id}]`, -1));
      }

      await new Promise(res => setTimeout(res, 10));
    }

    console.log(setColor(colors.red, `全ての再試行に失敗しました。 [${bot.user_id}]`, -1));
    results.push({ success: false, bot, reason: "retry_failed" });
  }

  return results;
}