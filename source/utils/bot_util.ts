import { ERROR_CODES } from "../constants/errors";
import { BotModel, IBot } from "../models/Bot";
import { updateAccessToken } from "./token_util";
import dotenv from 'dotenv';

dotenv.config();

export async function getRandomBotId(): Promise<string> {
    const count: number = await BotModel.countDocuments();
    
    if (count === 0) {
        throw new Error('No bots found in database');
    }
    
    const randomSkip: number = Math.floor(Math.random() * count);
    const randomBot: IBot = await BotModel.findOne().skip(randomSkip);
    
    if (!randomBot) {
        throw new Error('Failed to retrieve random bot');
    }
    
    return randomBot.user_id;
}

export async function isBotActive(user_id: string): Promise<boolean> {
    const apiUrl: string = `${process.env.YAY_HOST}/v1/posts/active_call?user_id=${user_id}`;

    try {
        const user: IBot | null = await BotModel.findOne({ user_id });

        if (!user) {
            throw new Error('ユーザーが見つかりませんでした。');
        }

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${user?.access_token}`,
                "User-Agent":   process.env.USER_AGENT
            }
        });

        const data = await response.json();

        if (data.error_code === ERROR_CODES.TOKEN_EXPIRED) {
            await updateAccessToken(user);
            const refreshedResponse = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${user?.access_token}`,
                    "User-Agent":   process.env.USER_AGENT
                }
            });
            const refreshedData = await refreshedResponse.json();
            return refreshedData.post !== null;
        }

        return data.post !== null;
    } catch (error) {
        console.error('Error checking bot status:', error);
        throw new Error('Failed to check bot status');
    }
}