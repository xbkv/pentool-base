import { IBot } from "../models/Bot";
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { colors, setColor } from "./color_util";

dotenv.config();

export async function updateAccessToken(user: IBot | null): Promise<void> {
    try {
        let message: string = `トークンの有効期限が切れています。[${user?.user_id}]のトークンを再発行します。`;
        const error_messge: string = setColor(colors.red, message, -1);
        console.log(error_messge);
        
        if (!user) {
            throw new Error('ユーザが見つかりません。');
        }

        if (!user?.uuid) {
            const message = `${user?.id}のUUIDが見つかりません。ランダムで発行します。`
            const error_message = setColor(colors.yellow, message, 0);
            console.log(error_message)

            user.uuid = uuidv4();
            await user.save();
        }

        const loginResponse = await fetch(`${process.env.YAY_HOST}/v3/users/login_with_email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "User-Agent":   process.env.USER_AGENT
            },
            body: JSON.stringify({
                api_key: process.env.API_KEY,
                uuid: user.uuid,
                password: user.password,
                email: user.email
            })
        });

        
        if (!loginResponse.ok) {
            const loginData = await loginResponse.json();
            if (loginData.error_code && loginData.error_code === -202) {
                const message: string = `パスワードが不正です。`;
                const result_message: string = setColor(colors.red, message, -1);
                console.log(result_message);
            }
            throw new Error('ログインに失敗したためアクセストークンが取得できませんでした。');
        }

        const loginData = await loginResponse.json();

        if (!user.user_id) {
            user.user_id = loginData.user_id;
        }

        user.access_token = loginData.access_token;
        await user.save();
        message = `アクセストークンの更新に成功しました。[${user?.user_id}]`;
        const success_message = setColor(colors.green, message, 1)
        console.log(success_message);
    } catch (error) {
        console.error('Error updating access token:', error);
        throw new Error('Failed to update access token');
    }
}