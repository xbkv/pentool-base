export interface ConferenceUser {
    id: string;
    nickname: string;
    profile_icon_thumbnail: string;
    online_status: 'online' | 'offline';
}
  
export interface ConferenceRole {
    user_id: string;
    role: 'host' | 'moderator' | string;
}
  
export interface ConferenceCall {   
    id: string;
    max_participants: number;
    conference_call_users_count: number;
    conference_call_users: ConferenceUser[];
    conference_call_user_roles: ConferenceRole[];
} 