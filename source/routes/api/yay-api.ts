// import { HttpsProxyAgent } from "https-proxy-agent";
// const proxyAgent = new HttpsProxyAgent(process.env.PROXY_URL);

import { Request, Response, Router } from "express";
import { BotModel, IBot } from "../../models/Bot";
import { updateAccessToken } from "../../utils/token_util";
import { ERROR_MESSAGE, RESULT_MESSAGE } from "./messages";
import fetch from 'node-fetch'
import router from "..";
import dotenv from 'dotenv';
import { colors, setColor } from "../../utils/color_util";
import { ERROR_CODES } from "../../constants/errorCodes";
dotenv.config();

const localhost = `http://localhost:${process.env.PORT}`
router.get('/v1/posts/active_call', async (req: Request, res: Response) => {
        try {
            const { user_id } = req.query;
            if (!user_id) {
                res.status(RESULT_MESSAGE.ERROR.code).json({
                    result: RESULT_MESSAGE.ERROR.code,
                    message: ERROR_MESSAGE.VALIDATION.userIdIsRequired.message,
                    error_code: ERROR_MESSAGE.VALIDATION.userIdIsRequired.code,
                });
            }

            const getActiveCallUserApiUrl: string = `${process.env.YAY_HOST}/v1/posts/active_call?user_id=${user_id}`;
            const randomBotIdResponse = await fetch(`${process.env.HOST || localhost}/api/bot-api/random_bot_id`);
            const randomBotIdData = await randomBotIdResponse.json();
            const bot_id: string = randomBotIdData.bot.id;

            const firstBot: IBot = await BotModel.findOne({ user_id: bot_id });
            if (!firstBot) {
                res.status(ERROR_MESSAGE.NOT_FOUND.botNotFound.code).json({
                    result: RESULT_MESSAGE.ERROR.message,
                    message: ERROR_MESSAGE.NOT_FOUND.botNotFound.message,
                    error_code: ERROR_MESSAGE.NOT_FOUND.botNotFound.code,
                });
            }

            const headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${firstBot.access_token}`,
                "User-Agent": process.env.USER_AGENT,
            };

            const fetchYayActiveCallData = async (token: string) => {
                const response = await fetch(getActiveCallUserApiUrl, {
                    headers: {
                        ...headers,
                        Authorization: `Bearer ${token}`,
                    },
                    // agent: proxyAgent
                });
                return response.json();
            };

            let yayActiveCallData = await fetchYayActiveCallData(firstBot.access_token);

            if (yayActiveCallData.error_code === -3) {
                await updateAccessToken(firstBot);
                const reBot: IBot = await BotModel.findOne({ user_id: bot_id });
                yayActiveCallData = await fetchYayActiveCallData(reBot.access_token);
            }

            if (yayActiveCallData && yayActiveCallData.post?.conference_call) {
                res.json({
                    result: RESULT_MESSAGE.SUCCESS.message,
                    conference_call: yayActiveCallData.post.conference_call,
                });
            } else {
                res.status(ERROR_MESSAGE.NOT_FOUND.conferenceCallNotFound.code).json({
                    result: RESULT_MESSAGE.ERROR.message,
                    message: ERROR_MESSAGE.NOT_FOUND.conferenceCallNotFound.message,
                    error_code: ERROR_MESSAGE.NOT_FOUND.conferenceCallNotFound.code,
                });
            }
        } catch (error) {
            res.status(500).json({
                result: RESULT_MESSAGE.ERROR.message,
                message: error.message || "Internal server error",
            });
        }
});

router.get("/v2/calls/conferences/:conference_id", async (req: Request, res: Response) => {
    try {
      const { conference_id } = req.params;
      if (!conference_id) {
        res.status(400).json({
          result: RESULT_MESSAGE.ERROR.code,
          message: ERROR_MESSAGE.VALIDATION.conferenceIdIsRequired.message,
          error_code: ERROR_MESSAGE.VALIDATION.conferenceIdIsRequired.code,
        });
        return;
      }
  
      const getConferenceCallIdApiUrl = `${process.env.YAY_HOST}/v2/calls/conferences/${conference_id}`;
  
      const fetchRandomBot = async () => {
        const response = await fetch(`${process.env.HOST || localhost}/api/bot-api/random_bot_id`);
        const data = await response.json();
        const bot_id = data.bot.id;
        const bot = await BotModel.findOne({ user_id: bot_id });
        return { bot_id, bot };
      };
  
      const fetchConferenceCallData = async (token: string) => {
        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "User-Agent": process.env.USER_AGENT,
        };
        const response = await fetch(getConferenceCallIdApiUrl, { headers });
        return response.json();
      };
  
      const maxRetries = 5;
      let attempts = 0;
      let bot_id = null;
      let bot = null;
      let conferenceCallIdData = null;
  
      let responseSent = false;
  
      while (attempts < maxRetries && !responseSent) {
        if (!bot) {
          const result = await fetchRandomBot();
          bot_id = result.bot_id;
          bot = result.bot;
          if (!bot) {
            res.status(404).json({
              result: RESULT_MESSAGE.ERROR.code,
              message: ERROR_MESSAGE.NOT_FOUND.botNotFound.message,
              error_code: ERROR_MESSAGE.NOT_FOUND.botNotFound.code,
            });
            responseSent = true;
            break;
          }
        }
  
        conferenceCallIdData = await fetchConferenceCallData(bot.access_token);
        if (!conferenceCallIdData.error_code) break;
  
        if (conferenceCallIdData.error_code === -3) {
          await updateAccessToken(bot);
          bot = await BotModel.findOne({ user_id: bot_id });
          if (!bot) {
            res.status(500).json({
              result: RESULT_MESSAGE.ERROR.message,
              message: ERROR_MESSAGE.AUTHORIZATION.tokenUpdateFailed.message,
              error_code: ERROR_MESSAGE.AUTHORIZATION.tokenUpdateFailed.code,
            });
            responseSent = true;
            break;
          }
        } else if (conferenceCallIdData.error_code === -18) {
          console.log(setColor(colors.red, `ユーザーが運営に削除されたため再試行します (${attempts + 1}/${maxRetries})`, -1));
          await BotModel.deleteOne({ user_id: bot_id });
          bot = null;
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          break;
        }
      }
  
      if (responseSent) return;
  
      if (conferenceCallIdData && conferenceCallIdData.conference_call?.id) {
        res.status(200).json({
          result: RESULT_MESSAGE.SUCCESS.message,
          data: conferenceCallIdData,
        });
      } else {
        if (conferenceCallIdData?.error_code === ERROR_CODES.USER_DELETED && bot_id) {
          console.log(setColor(colors.red, `ユーザー情報を削除します: ${bot_id}`, -1));
          await BotModel.deleteOne({ user_id: bot_id });
        }
  
        res.status(404).json({
          result: RESULT_MESSAGE.ERROR.message,
          message: ERROR_MESSAGE.NOT_FOUND.conferenceCallNotFound.message,
          error_code: ERROR_MESSAGE.NOT_FOUND.conferenceCallNotFound.code,
        });
      }
    } catch (error) {
      console.error("Error fetching conference call:", error);
      res.status(500).json({
        result: RESULT_MESSAGE.ERROR.message,
        message: "An internal error occurred.",
        error: error.message || error,
      });
    }
});
  
router.get("/v2/posts/:post_id", async (req: Request, res: Response) => {
        try {
            const { post_id } = req.params;

            if (!post_id) {
                res.status(400).json({
                    result: RESULT_MESSAGE.ERROR.code,
                    message: ERROR_MESSAGE.VALIDATION.postIdIsRequired.message,
                    error_code: ERROR_MESSAGE.VALIDATION.postIdIsRequired.code,
                });
            }

            const getBotIdUrl = `${process.env.HOST || localhost}/api/bot-api/random_bot_id`;
            const botIdResponse = await fetch(getBotIdUrl);
            const botIdData = await botIdResponse.json();
            const bot_id = botIdData.bot.id;

            let bot = await BotModel.findOne({ user_id: bot_id });
            if (!bot) {
                res.status(404).json({
                    result: RESULT_MESSAGE.ERROR.code,
                    message: ERROR_MESSAGE.NOT_FOUND.botNotFound.message,
                    error_code: ERROR_MESSAGE.NOT_FOUND.botNotFound.code,
                });
            }

            const getPostData = async (token: string) => {
                const url = `${process.env.YAY_HOST}/v2/posts/${post_id}`;
                const headers = {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "User-Agent": process.env.USER_AGENT,
                };
                const response = await fetch(url, { headers });
                return response.json();
            };

            let postData = await getPostData(bot.access_token);

            if (postData.error_code === ERROR_CODES.TOKEN_EXPIRED) {
                await updateAccessToken(bot);
                bot = await BotModel.findOne({ user_id: bot_id });

                if (!bot) {
                    res.status(500).json({
                        result: RESULT_MESSAGE.ERROR.message,
                        message: ERROR_MESSAGE.AUTHORIZATION.tokenUpdateFailed.message,
                        error_code: ERROR_MESSAGE.AUTHORIZATION.tokenUpdateFailed.code,
                    });
                }

                postData = await getPostData(bot.access_token);
            }
            if (postData.post && postData.post.id) {
                res.json({
                    result: RESULT_MESSAGE.SUCCESS.message,
                    data: postData,
                });
            } else {
                res.status(404).json({
                    result: RESULT_MESSAGE.ERROR.message,
                    message: ERROR_MESSAGE.NOT_FOUND.postNotFound.message,
                    error_code: ERROR_MESSAGE.NOT_FOUND.postNotFound.code,
                });
            }
        } catch (error) {
            console.error("Error fetching post data:", error);
            res.status(500).json({
                result: RESULT_MESSAGE.ERROR.message,
                message: "An internal error occurred.",
                error: error.message || error,
            });
        }
});

router.get("/v1/calls/:call_id/participants/:uuid/bot_id/:bot_id", async (req: Request, res: Response) => {
  try {
    const { call_id, uuid, bot_id } = req.params;

    if (!call_id || !uuid || !bot_id) {
      res.status(400).json({
        result: RESULT_MESSAGE.ERROR.code,
        message: ERROR_MESSAGE.VALIDATION.callIdOrUuidRequired.message,
        error_code: ERROR_MESSAGE.VALIDATION.callIdOrUuidRequired.code,
      });
    }

    const yayApiUrl = `${process.env.YAY_HOST}/v1/calls/${call_id}/participants/${uuid}`;

    const bot = await BotModel.findOne({ user_id: bot_id });
    if (!bot) {
      res.status(404).json({
        result: RESULT_MESSAGE.ERROR.code,
        message: ERROR_MESSAGE.NOT_FOUND.botNotFound.message,
        error_code: ERROR_MESSAGE.NOT_FOUND.botNotFound.code,
      });
    }

    const fetchParticipantData = async (token: string) => {
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "User-Agent": process.env.USER_AGENT,
      };
      const response = await fetch(yayApiUrl, { headers });
      return response.json();
    };

    let data = await fetchParticipantData(bot.access_token);
    console.log(data)
    if (data?.error_code === -3) {
      await updateAccessToken(bot);
      const updatedBot = await BotModel.findOne({ user_id: bot_id });
      if (!updatedBot) {
        res.status(500).json({
          result: RESULT_MESSAGE.ERROR.message,
          message: ERROR_MESSAGE.AUTHORIZATION.tokenUpdateFailed.message,
          error_code: ERROR_MESSAGE.AUTHORIZATION.tokenUpdateFailed.code,
        });
      }
      data = await fetchParticipantData(updatedBot.access_token);
    }

    if (data?.user?.id) {
      res.status(200).json({
        result: RESULT_MESSAGE.SUCCESS.message,
        user: data.user,
      });
    } else {
      res.status(404).json({
        result: RESULT_MESSAGE.ERROR.message,
        message: ERROR_MESSAGE.NOT_FOUND.userNotFound(bot_id).message,
        error_code: ERROR_MESSAGE.NOT_FOUND.userNotFound(bot_id).code,
      });
    }
  } catch (err) {
    console.error("Error fetching participant info:", err);
    res.status(500).json({
      result: RESULT_MESSAGE.ERROR.message,
      message: "内部エラーが発生しました。",
      error: err.message || err,
    });
  }
});

export default router;