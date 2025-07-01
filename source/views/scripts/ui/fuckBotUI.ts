// import { getRtmChannel } from '../agora/joinCall';

import { RtmChannel } from "agora-rtm-sdk";

export function setupFuckBotUI(rtmChannel: RtmChannel): void {
  const input = document.getElementById('fuckBotText') as HTMLInputElement;
  const button = document.getElementById('fuckBotSend') as HTMLButtonElement;

  if (!input || !button || !rtmChannel) return;

  button.addEventListener('click', async () => {
    const value = input.value.trim();
    if (!value) return;

    const chars = value.split('');
    for (const ch of chars) {
      await rtmChannel.sendMessage({ text: `react ${ch}` });
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    input.value = '';
  });
}