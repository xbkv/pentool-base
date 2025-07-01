import { Request, Response } from "express";
import { ERROR_MESSAGE, RESULT_MESSAGE } from "./messages";
import { BotModel, IBot } from "../../models/Bot";
import { participateInConferences } from "../../utils/agora_util";
import router from "..";

router.get('/agora_info', async (req: Request, res: Response) => {
    const { bot_id, conference_call_id } = req.query;

    if (typeof bot_id !== 'string' || typeof conference_call_id !== 'string') {
        const error = ERROR_MESSAGE.VALIDATION.invalidQueryParams.message;
        console.error(`[Validation Error] bot_id or conference_call_id is missing or invalid.`, req.query);
        res
            .status(ERROR_MESSAGE.VALIDATION.invalidQueryParams.code || 400)
            .json({ result: RESULT_MESSAGE.ERROR, message: error });
    }

    try {
        const bot: IBot | null = await BotModel.findOne({ user_id: bot_id });

        if (!bot) {
            const error = ERROR_MESSAGE.NOT_FOUND.botNotFound.message;
            console.error(`[Bot Not Found] user_id: ${bot_id}`);
            res
                .status(ERROR_MESSAGE.NOT_FOUND.botNotFound.code || 404)
                .json({ result: RESULT_MESSAGE.ERROR.message, message: error });
        }

        const agoraInfoArray = await participateInConferences(conference_call_id, [bot]);

        if (agoraInfoArray.length === 0) {
            console.error(`[Agora Error] Failed to retrieve Agora info. user_id: ${bot_id}`);
            res.status(500).json({ error: 'Failed to retrieve Agora information.' });
        }

        const agoraInfoResult = agoraInfoArray[0];

        if (
            !agoraInfoResult ||
            agoraInfoResult.success !== true ||
            !agoraInfoResult.agoraInfo
        ) {
            console.error(`[Agora Error] Invalid or failed Agora info result. user_id: ${bot_id}`);
            res.status(500).json({ error: 'Failed to retrieve Agora information.' });
        }

        const {
            agora_channel,
            conference_call_user_uuid,
            agora_channel_token,
            APP_ID,
            agora_rtm_token
        } = agoraInfoResult.agoraInfo;

        res.json({
            agora_channel,
            agora_rtm_token,
            conference_call_user_uuid,
            agora_channel_token,
            APP_ID
        });

    } catch (err) {
        if (err.message === 'unjoinable_call') {
            res.status(403).json({ error: "この通話にはBOTは参加できません。" });
        }
    }
});

export default router;