import { fetchChannelMembers } from '../utils/rtm';
import { handleKickOrBan, handleRequestUnmute, handleUnmute } from './moderation';
import { restoreOriginalView } from './restoreOriginalView';

export function displayJoinedView(conference_call_id: string): void {
  const mainContent = document.getElementById("main-content") as HTMLElement;
  mainContent.innerHTML = `
    <%- include("partials/joined-view", { conference_call_id: conference_call_id }) %>
  `;

  document.getElementById("backButton")?.addEventListener("click", () => {
    restoreOriginalView();
  });

  document.getElementById("kickButton")?.addEventListener("click", async () => {
    const members = await fetchChannelMembers();
    handleKickOrBan("kick", members);
  });

  document.getElementById("banButton")?.addEventListener("click", async () => {
    const members = await fetchChannelMembers();
    handleKickOrBan("kick", members);
  });

  document.getElementById("requestUnmuteButton")?.addEventListener("click", async () => {
    handleRequestUnmute();
  });

  document.getElementById("unmuteButton")?.addEventListener("click", async () => {
    const members = await fetchChannelMembers();
    handleUnmute(members);
  });
}