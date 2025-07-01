import mongoose, { Schema, Document } from "mongoose";

interface IAgoraCache extends Document {
  conference_call_id: string;
  bot_user_id: string;
  agoraInfo: Record<string, any>;
  created_at: Date;
}

const AgoraCacheSchema: Schema = new Schema({
  conference_call_id: { type: String, required: true },
  bot_user_id: { type: String, required: true },
  agoraInfo: { type: Object, required: true },
  created_at: { type: Date, default: Date.now }
});

const AgoraCacheModel = mongoose.model<IAgoraCache>("AgoraCache", AgoraCacheSchema);

export { IAgoraCache, AgoraCacheModel };