import { HttpsProxyAgent } from "https-proxy-agent";

export interface ProxyConfig {
  agent?: HttpsProxyAgent;
  enabled: boolean;
  url?: string;
}

/**
 * プロキシ設定を管理するクラス
 */
export class ProxyManager {
  private static instance: ProxyManager;
  private config: ProxyConfig;

  private constructor() {
    this.config = this.initializeProxyConfig();
  }

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): ProxyManager {
    if (!ProxyManager.instance) {
      ProxyManager.instance = new ProxyManager();
    }
    return ProxyManager.instance;
  }

  /**
   * プロキシ設定を初期化
   */
  private initializeProxyConfig(): ProxyConfig {
    const proxyUrl = process.env.PROXY_URL;
    
    if (!proxyUrl) {
      console.log("🔗 プロキシが設定されていません。直接接続を使用します。");
      return {
        enabled: false,
      };
    }

    try {
      const agent = new HttpsProxyAgent(proxyUrl);
      console.log(`🔗 プロキシが有効です: ${proxyUrl}`);
      
      return {
        agent,
        enabled: true,
        url: proxyUrl,
      };
    } catch (error) {
      console.error("❌ プロキシ設定エラー:", error);
      return {
        enabled: false,
      };
    }
  }

  /**
   * プロキシエージェントを取得
   */
  public getAgent(): HttpsProxyAgent | undefined {
    return this.config.agent;
  }

  /**
   * プロキシが有効かどうかを確認
   */
  public isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * プロキシURLを取得
   */
  public getUrl(): string | undefined {
    return this.config.url;
  }

  /**
   * プロキシ設定を再読み込み
   */
  public reload(): void {
    this.config = this.initializeProxyConfig();
  }

  /**
   * プロキシ設定情報を取得
   */
  public getConfig(): ProxyConfig {
    return { ...this.config };
  }

  /**
   * fetchオプションにプロキシを適用
   */
  public applyToFetchOptions(options: any = {}): any {
    if (!this.isEnabled()) {
      return options;
    }

    return {
      ...options,
      agent: this.getAgent(),
    };
  }
}

/**
 * 便利な関数
 */
export const proxyManager = ProxyManager.getInstance();

/**
 * プロキシ付きfetch関数
 */
export async function fetchWithProxy(url: string, options: RequestInit = {}): Promise<Response> {
  const fetchOptions = proxyManager.applyToFetchOptions(options);
  return fetch(url, fetchOptions);
}

/**
 * プロキシ設定をログ出力
 */
export function logProxyStatus(): void {
  const config = proxyManager.getConfig();
  
  if (config.enabled) {
    console.log(`✅ プロキシ有効: ${config.url}`);
  } else {
    console.log("❌ プロキシ無効");
  }
}
