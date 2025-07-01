import express, { Request, Response } from 'express';
import { IBot } from '../models/Bot';

export interface AgoraChannelInfo {
    agora_channel: string;
    conference_call_user_uuid: string;
    agora_channel_token: string;
};

export interface AgoraInfo {
    status: string;
    agora_channel: string;
    agora_rtm_token: string;
    conference_call_user_uuid: string;
    agora_channel_token: string;
    APP_ID: string;
};

export interface ConvertYouTubeRequest extends Request {
    query: {
        videoUrl: string;
    };
}

export type Color = {
    black: string;
    red: string;
    green: string;
    yellow: string;
    blue: string;
    magenta: string;
    cyan: string;
    white: string;
    reset: string;
};

export type Result = {
    error: string;
    success: string;
    warning: string;
};

export type Role = 'host' | 'participant';

export type ParticipationResult = {
  success: boolean;
  bot?: IBot;
  agoraInfo?: any;
  reason?: string; 
};

export type StartCallResult =
  | AgoraChannelInfo
  | { success: false; reason: string }
  | null;

export type FetchAgoraResult =
    | AgoraInfo
    | { success: false; reason?: string }
    | null;

export interface ConferenceCallUserRole {
  id: number;
  user_id: number;
  role: Role;
}

export interface BumpParams {
    participant_limit: number;
}

type ConferenceCallUser = {
    id: number;
    nickname: string;
    biography: string;
    followers_count: number;
    is_private: boolean;
    title?: string;
    posts_count: number;
    groups_users_count: number;
    reviews_count: number;
    age_verified: boolean;
    country_code: string;
    vip: boolean;
    hide_vip: boolean;
    online_status: string;
    profile_icon: string;
    profile_icon_thumbnail: string;
    cover_image?: string;
    cover_image_thumbnail?: string;
    last_loggedin_at: number;
    qr_code?: any;
    following: boolean;
    followed_by: boolean;
    follow_pending: boolean;
    hidden: boolean;
    recently_kenta: boolean;
    dangerous_user: boolean;
    new_user: boolean;
    interests_selected: boolean;
};

export interface ConferenceCall {
    id: number;
    active: boolean;
    conference_call_users_count: number;
    call_type: string;
    server: string;
    mode: string;
    anonymous_call_users_count: number;
    joinable_by: string;
    max_participants: number;
    bump_params: BumpParams;
    group_id: number | null;
    post_id: number;
    host_id: number;
    agora_channel: string;
    agora_token: string;
    conference_call_users: ConferenceCallUser[];
    conference_call_user_roles: ConferenceCallUserRole[];
    game: any;   
    genre: any; 
    locked: boolean;
    open: boolean;
}

export interface ActiveCallSuccessResponse {
    result: 'success';
    conference_call: ConferenceCall;
    conference_call_user_roles: ConferenceCallUserRole[];
    conference_call_user_uuid: string;
}

export type StartConferenceCallUrl = {
    result: string;
    conference_call: ConferenceCall;
    conference_call_user_uuid: string;
}

export interface ErrorResponse {
    result: 'error';
    message: string;
    error_code: number;
    [key: string]: any;
}

export type ActiveCallApiResponse = ActiveCallSuccessResponse | ErrorResponse;