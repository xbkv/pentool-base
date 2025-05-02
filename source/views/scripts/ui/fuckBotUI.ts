import { getRtmChannel } from '../agora/joinCall';

export function setupFuckBotUI(): void {
  const input = document.getElementById('fuckBotText') as HTMLInputElement;
  const button = document.getElementById('fuckBotSend') as HTMLButtonElement;
  const rtmChannel = getRtmChannel();

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