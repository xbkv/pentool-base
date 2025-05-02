import { displayConferenceDetails } from './displayConferenceDetails';
import { ConferenceCall } from '../agora/types';

const result = document.getElementById('result') as HTMLElement;
const idInput = document.getElementById('idInput') as HTMLInputElement;

async function displayLoadingMessage(): Promise<void> {
  result.innerHTML = `
  <div class="cyber-loader">
    <div class="loader-border">
      <div class="loader-text">🔎 検索中</div>
      <div class="loader-dots">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
      </div>
    </div>
  </div>
  `;
}

function showNoCallMessage(message?: string, is404: boolean = false): void {
  const displayMessage = is404
    ? 'ユーザーの投稿が非公開、削除済み、または存在しないため、見つかりませんでした。'
    : (message || 'エラーが発生しました。もう一度お試しください。');

  result.innerHTML = `
    <div class="cyber-info-alert">
      ${displayMessage}
    </div>
  `;
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

      const post = data?.post;
    
      if (!post) {
        showNoCallMessage(undefined, true); // 投稿が存在しない＝404メッセージ
        return;
      }
    
      const conferenceId = post.conference_call?.id;
    
      if (!conferenceId) {
        showNoCallMessage('この投稿には通話が存在していません。');
        return;
      }
    
      const conferenceResponse = await fetch(`/yay-api/v2/calls/conferences/${conferenceId}`);
      
      if (!conferenceResponse.ok) {
        showNoCallMessage('通話情報の取得に失敗しました。');
        return;
      }
    
      const conferenceData = await conferenceResponse.json();
      console.log(conferenceData);
    
      displayConferenceDetails(conferenceData.data.conference_call as ConferenceCall);
    }
    
  }catch (error) {
    console.error(error);
    result.innerHTML = `
      <div class="cyber-error-alert">
        ⚠️ エラーが発生しました。<br>入力したIDが正しいか確認してください。
      </div>
    `;
  }  
}
