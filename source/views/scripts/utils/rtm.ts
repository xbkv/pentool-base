import { getRtmChannel } from '../agora/joinCall';
import { ConferenceCall } from '../agora/types';

export async function fetchChannelMembers(): Promise<string[]> {
  const rtmChannel = getRtmChannel();

  if (!rtmChannel) {
    console.error("RTMチャンネルが初期化されていません。");
    return [];
  }

  try {
    const members = await rtmChannel.getMembers();
    console.log(members);
    return members;
  } catch (error) {
    console.error("メンバーの取得に失敗しました:", error);
    return [];
  }
}

export function switchToJoinedViewUI(conference: ConferenceCall): void {
  console.log(conference);
  const preJoinView = document.getElementById("preJoinView");
  const result = document.getElementById("result");
  if (!result) return;

  if (preJoinView) preJoinView.style.display = "none";

  const userHtml = (conference.conference_call_users ?? []).map(user => {
    const role = conference.conference_call_user_roles.find(r => r.user_id === user.id)?.role;

    const roleBadge = role === 'host'
      ? '<span class="badge crown">👑</span>'
      : role === 'moderator'
        ? '<span class="badge mod">🌟</span>'
        : '';

    return `
      <div class="user-bubble" id="user-${user.id}">
        <div class="avatar-wrapper">
          <img src="${user.profile_icon_thumbnail}" alt="${user.nickname}" class="user-avatar">
          <i class="fas fa-microphone-slash mic-icon muted"></i>
          ${roleBadge}
        </div>
        <div class="username">${user.nickname}</div>
      </div>
    `;
  }).join("");

  result.innerHTML = `<div class="joined-user-grid">${userHtml}</div>`;
  result.style.display = "block"; // ← 追加
  result.style.visibility = "visible"; // ← 念のため追加
}
