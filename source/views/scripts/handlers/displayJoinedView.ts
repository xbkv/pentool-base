import { fetchChannelMembers } from '../utils/rtm';
import { handleKickOrBan, handleRequestUnmute, handleUnmute } from './moderation';
import { restoreOriginalView } from './restoreOriginalView';
import { RtmChannel } from "agora-rtm-sdk";

export function displayJoinedView(conference_call_id: string, rtmChannel: RtmChannel): void {
  const mainContent = document.getElementById("main-content") as HTMLElement;

  mainContent.innerHTML = `
    <%- include("partials/joined-view", { conference_call_id: conference_call_id }) %>
  `;

  document.getElementById("backButton")?.addEventListener("click", () => {
    restoreOriginalView();
  });

  document.getElementById("kickButton")?.addEventListener("click", async () => {
    const members = await fetchChannelMembers(rtmChannel);
    await handleKickOrBan("kick", members, rtmChannel);
  });

  document.getElementById("banButton")?.addEventListener("click", async () => {
    const members = await fetchChannelMembers(rtmChannel);
    await handleKickOrBan("ban", members, rtmChannel);
  });

  document.getElementById("requestUnmuteButton")?.addEventListener("click", async () => {
    await handleRequestUnmute(rtmChannel);
  });

  document.getElementById("unmuteButton")?.addEventListener("click", async () => {
    const members = await fetchChannelMembers(rtmChannel);
    await handleUnmute(members, rtmChannel);
  });
}
