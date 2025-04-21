import { displayConferenceDetails } from './displayConferenceDetails';
import { ConferenceCall } from '../agora/types';

const result = document.getElementById('result') as HTMLElement;
const idInput = document.getElementById('idInput') as HTMLInputElement;

async function displayLoadingMessage(): Promise<void> {
  result.innerHTML = `
    <div class="hacker-loader">
      <div class="terminal-box">
        <span>検索中</span>
        <div class="terminal-dots">
          <span>.</span><span>.</span><span>.</span>
        </div>
      </div>
    </div>
  `;
}


function showNoCallMessage(): void {
  result.innerHTML = `<div class="alert alert-info mt-3">アクティブな通話が見つかりませんでした。</div>`;
}

export async function handleSearch(): Promise<void> {
  await displayLoadingMessage();

  const idInput = document.getElementById('idInput') as HTMLInputElement;
  const id = idInput.value;

  const idTypeHidden = document.getElementById('idTypeHidden') as HTMLInputElement;
  const botTypeHidden = document.getElementById('botTypeHidden') as HTMLInputElement;

  const selectedType = idTypeHidden?.value;
  const botType = botTypeHidden?.value;

  if (!selectedType || !id || !/^\d+$/.test(id)) {
    result.innerHTML = `<div class="alert alert-warning mt-3">IDを正しく入力してください。</div>`;
    return;
  }

  try {
    let response: Response, data: any;

    if (selectedType === "user_id") {
      response = await fetch(`/yay-api/v1/posts/active_call?user_id=${id}`);
      data = await response.json();
      const conference: ConferenceCall | null = data.conference_call;
      conference ? displayConferenceDetails(conference) : showNoCallMessage();
    } else if (selectedType === "conference_id") {
      response = await fetch(`/yay-api/v2/calls/conferences/${id}`);
      data = await response.json();
      console.log(data)
      displayConferenceDetails(data.data.conference_call as ConferenceCall);
    } else if (selectedType === "post_id") {
      response = await fetch(`/yay-api/v2/posts/${id}`);
      data = await response.json();
      const post = data.data.post;
      if (post.conference_call) {
        const conferenceResponse = await fetch(`/yay-api/v2/calls/conferences/${post.conference_call.id}`);
        const conferenceData = await conferenceResponse.json();
        displayConferenceDetails(conferenceData.data.conference_call as ConferenceCall);
      } else {
        showNoCallMessage();
      }
    }
  } catch (error) {
    console.error(error);
    result.innerHTML = `<div class="alert alert-danger mt-3">エラーが発生しました。IDが正しいか確認してください。</div>`;
  }
}
