import mongoose, { Document, Schema } from "mongoose";

interface IBot extends Document {
  user_id: string;
  email: string;
  password: string;
  access_token: string;
  uuid: string;
}

const userSchema = new Schema({
  user_id: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  access_token: { type: String, required: true },
  uuid: { type: String, required: true },
});

const BotModel = mongoose.model<IBot>("1st", userSchema);

export { IBot, BotModel };