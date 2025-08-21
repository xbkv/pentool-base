// export_unverified_bots.js
require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// スキーマ定義
const UnverifiedBotSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

// モデル作成
const UnverifiedBotModel = mongoose.model(
  `${process.env.DB_USER}.unverified_bot`,
  UnverifiedBotSchema
);

(async () => {
  try {
    // MongoDB 接続
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/yourdb",
      { useNewUrlParser: true, useUnifiedTopology: true }
    );

    const outputPath = path.join(__dirname, `${process.env.DB_USER}_unverified_accounts.txt`);

    // 既存ファイルの読み込み（存在しない場合は空）
    const existingSet = new Set();
    if (fs.existsSync(outputPath)) {
      const existingData = fs.readFileSync(outputPath, "utf8").split("\n").filter(Boolean);
      for (const line of existingData) {
        existingSet.add(line.trim());
      }
    }

    // DBから全データ取得
    const bots = await UnverifiedBotModel.find().lean();
    console.log(`取得件数: ${bots.length}`);

    const seenInRun = new Set();
    const outputLines = [];

    for (const bot of bots) {
      const combo = `${bot.email}\n${bot.password}`;

      // すでにファイルにある → スキップ
      if (existingSet.has(combo)) {
        console.log(`スキップ（既存ファイルに存在）: ${combo}`);
        continue;
      }

      // 今回の処理中で重複 → DB削除
      if (seenInRun.has(combo)) {
        await UnverifiedBotModel.deleteOne({ _id: bot._id });
        console.log(`削除（今回の重複）: ${combo}`);
      } else {
        seenInRun.add(combo);
        outputLines.push(combo);
      }
    }

    // 新規データのみ追記
    if (outputLines.length > 0) {
      fs.appendFileSync(outputPath, outputLines.join("\n") + "\n", "utf8");
    }

    console.log(`✅ 書き出し完了: ${outputPath}`);
    await mongoose.disconnect();
  } catch (err) {
    console.error("エラー:", err);
    process.exit(1);
  }
})();
