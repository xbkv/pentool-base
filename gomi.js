import fetch from "node-fetch";
import HttpsProxyAgent from "https-proxy-agent";

// ===== 設定 =====
const proxyUrl = "http://sp3zhm0nwe:15~5yslruRdt2AYafC@gate.decodo.com:7000"; // プロキシ必要なければ null
const createAgent = () => proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

const url = "https://api-249.yay.space/api/v3/users/9835621/reduce_penalty";
const headers = {
  "Authorization": "Bearer 7e57a212b6f707a938c3e6076b22c09f9ffe7071e269908a8f551ca07063d21b",
  "Content-Type": "application/json"
};

const baseData = {
  "api_key": "92816834ea82099597f7285db999b4b74496eaf9b7e17007ebaaa8be4eb19ad5",
  "signed_version": "ODaTcZ8zuKGIhMzjQPjgNE/2VnHVJBOSqJE5moFezUE=",
  "uuid": "3C4150F1-6C25-4E80-866B-75DFC5F315FF",
  "signed_info": "a519f573572f1b1b0e7be0b99b766980",
  "app_version": "4.15"
};

// ===== 実行関数 =====
async function reducePenaltyLoop(totalMinutes) {
  const loops = Math.floor(totalMinutes / 10);
  console.log(`${loops} 回 POST（10分ずつ減算）`);

  for (let i = 0; i < loops; i++) {
    const data = {
      ...baseData,
      timestamp: Math.floor(Date.now() / 1000) // 秒単位のUNIX時刻
    };

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      agent: createAgent()
    });

    console.log(`[${i+1}/${loops}] Status: ${res.status} ${await res.text()}`);

    await new Promise(r => setTimeout(r, 1000)); // 連投防止
  }
}

// ===== 実行例 =====
reducePenaltyLoop(60); // 60分 → 6回POST
