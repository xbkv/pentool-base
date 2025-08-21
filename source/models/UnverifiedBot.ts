import mongoose, { Schema, Document } from "mongoose";

export interface IUnverifiedBot extends Document {
    user_id: string;
    email: string;
    password: string;
    created_at: Date;
}

const UnverifiedBotSchema: Schema = new Schema({
    user_id: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

export const UnverifiedBotModel = mongoose.model<IUnverifiedBot>(`${process.env.DB_USER}.unverified_bot`, UnverifiedBotSchema);