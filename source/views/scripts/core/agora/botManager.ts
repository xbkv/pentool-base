import { botStatusResponse } from "../../agora/types";

export class BotManager {
  private readonly MAX_RETRIES = 10;
  private readonly RETRY_DELAY = 100; // ms

  async getAvailableBotId(): Promise<string> {
    let attempts = 0;
    
    while (attempts < this.MAX_RETRIES) {
      try {
        const botId = await this.fetchRandomBotId();
        const isAvailable = await this.checkBotAvailability(botId);
        
        if (isAvailable) {
          return botId;
        }
        
        await this.delay(this.RETRY_DELAY);
        attempts++;
      } catch (error) {
        console.error(`Bot取得試行 ${attempts + 1}/${this.MAX_RETRIES} でエラー:`, error);
        attempts++;
        
        if (attempts >= this.MAX_RETRIES) {
          throw new Error("利用可能なボットが見つかりませんでした");
        }
      }
    }
    
    throw new Error("利用可能なボットが見つかりませんでした");
  }

  private async fetchRandomBotId(): Promise<string> {
    const botIdRes = await fetch("/api/bot-api/random_bot_id");
    if (!botIdRes.ok) throw new Error("BOT IDの取得に失敗");

    const { bot } = await botIdRes.json();
    if (!bot?.id) throw new Error("BOT IDが無効です");

    return bot.id;
  }

  private async checkBotAvailability(botId: string): Promise<boolean> {
    const botStatusRes = await fetch(`/api/bot-api/${botId}/status`);
    if (!botStatusRes.ok) throw new Error("BOTの状態取得に失敗");

    const botStatusData: botStatusResponse = await botStatusRes.json();
    return !botStatusData.bot.isActive;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
