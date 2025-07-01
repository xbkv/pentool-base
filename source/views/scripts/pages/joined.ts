window.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('conference-details');
    const params = new URLSearchParams(window.location.search);
    const conferenceId = params.get('conference_call_id');
  
    if (!conferenceId || !container) return;
  
    try {
      const res = await fetch(`/yay-api/v2/calls/conferences/${conferenceId}`);
      const json = await res.json();
      const conf = json.data.conference_call;
  
      container.innerHTML = `
        <h4 class="text-cyber">通話名: ${conf.name || '（名前なし）'}</h4>
        <p>参加数: ${conf.conference_call_users_count} / ${conf.max_participants}</p>
        <ul class="list-group mt-3">
          ${conf.conference_call_users.map((u: any) => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
              <span>${u.nickname}</span>
              <span class="badge ${u.online_status === 'online' ? 'bg-success' : 'bg-secondary'}">
                ${u.online_status === 'online' ? 'オンライン' : 'オフライン'}
              </span>
            </li>
          `).join('')}
        </ul>
      `;
    } catch (err) {
      console.error('Error loading conference:', err);
      container.innerHTML = `<p class="text-danger">通話情報の取得に失敗しました。</p>`;
    }
  });
  