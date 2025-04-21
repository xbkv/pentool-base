import { joinCall, generateUserUUIDs } from '../agora/joinCall';
import { ConferenceCall } from '../agora/types';
import { switchToJoinedViewUI } from '../utils/rtm';


const result = document.getElementById('result') as HTMLElement;
result.innerHTML = `...`; 

let idInput: HTMLInputElement;
let searchButton: HTMLButtonElement;
let idTypeHidden: HTMLInputElement;
let botTypeHidden: HTMLInputElement;

export function displayConferenceDetails(conference: ConferenceCall): void {
  const availableSlots = conference.max_participants - conference.conference_call_users_count;

  result.innerHTML = `
    <div class="conference-card neon-panel card mt-4 p-3">
      <div class="conference-header mb-3 d-flex justify-content-between align-items-center">
        <h5 class="text-cyber m-0">📞 通話詳細</h5>
        <span class="badge bg-cyber-secondary">
          ${conference.conference_call_users_count} / ${conference.max_participants}
        </span>
      </div>

      <p class="mb-2 text-white"><strong>ID:</strong> ${conference.id}</p>
      <h6 class="mb-3 text-cyber">👥 参加者一覧</h6>

      <div class="user-list mb-3">
        ${conference.conference_call_users.map(user => {
          const role = conference.conference_call_user_roles.find(r => r.user_id === user.id)?.role;
          const roleBadge = role === 'host'
            ? `<span class="badge bg-pink ms-2">枠主</span>`
            : role === 'moderator'
              ? `<span class="badge bg-blue ms-2">サブ枠主</span>`
              : '';

          const onlineBadge = user.online_status === "online"
            ? `<span class="badge bg-green ms-auto">オンライン</span>`
            : `<span class="badge bg-gray ms-auto">オフライン</span>`;

          return `
            <div class="participant-item d-flex align-items-center justify-content-between">
              <div class="participant-info d-flex align-items-center">
                <img src="${user.profile_icon_thumbnail}" class="participant-avatar" alt="${user.nickname}">
                <span class="text-white fw-semibold ms-2 text-truncate">${user.nickname}</span>
                ${roleBadge}
              </div>
              ${onlineBadge}
            </div>
          `;
        }).join('')}
      </div>

      <div class="mb-3">
        <label for="participantCount" class="form-label text-cyber">BOT参加人数</label>
        <select id="participantCount" class="form-select neon-select w-100">
          ${Array.from({ length: availableSlots }, (_, i) => `<option value="${i + 1}">${i + 1}人</option>`).join('')}
        </select>
      </div>

      <div class="text-end">
        <button id="joinButton" class="btn btn-cyber px-4">
          <i class="fas fa-user-plus me-1"></i> 参加する
        </button>
      </div>
    </div>
  `;

  document.getElementById('joinButton')?.addEventListener('click', async () => {
    await handleJoinClick(conference.id, conference);
  });
}

async function handleJoinClick(conference_call_id: string, conference: ConferenceCall): Promise<void> {
  try {
    const participantCountElement = document.getElementById('participantCount') as HTMLSelectElement;
    const selectedCount = parseInt(participantCountElement.value, 10);
    if (isNaN(selectedCount) || selectedCount <= 0) throw new Error('Invalid participant count selected.');

    const userUUIDs = generateUserUUIDs(selectedCount);
    for (const userUUID of userUUIDs) {
      await joinCall(conference_call_id);
    }
    switchToJoinedViewUI(conference);
  } catch (err) {
    console.error('Error joining conference call:', err);
    alert('通話への参加に失敗しました。');
  }
}

function updateSearchButtonState(): void {
  const idValid = /^\d+$/.test(idInput.value);
  const botSelected = !!botTypeHidden.value;
  searchButton.disabled = !(idValid && botSelected);
}

export function setupCyberSelectors() {
  idInput = document.getElementById('idInput') as HTMLInputElement;
  searchButton = document.getElementById('searchButton') as HTMLButtonElement;
  idTypeHidden = document.getElementById('idTypeHidden') as HTMLInputElement;
  botTypeHidden = document.getElementById('botTypeHidden') as HTMLInputElement;

  setupChoiceSelector('id-type-choice', 'idTypeHidden', 'user_id');
  setupChoiceSelector('bot-type-choice', 'botTypeHidden', 'ガチギレ');

  const observer = new MutationObserver(() => {
    const isIdTypeSelected = !!idTypeHidden.value;
    if (isIdTypeSelected) idInput.disabled = false;
    updateSearchButtonState();
  });

  observer.observe(idTypeHidden, { attributes: true, attributeFilter: ['value'] });

  const botObserver = new MutationObserver(() => updateSearchButtonState());
  botObserver.observe(botTypeHidden, { attributes: true, attributeFilter: ['value'] });

  idInput.addEventListener('input', updateSearchButtonState);
}

function setupChoiceSelector(groupId: string, hiddenId: string, defaultValue: string) {
  const group = document.getElementById(groupId);
  const hiddenInput = document.getElementById(hiddenId) as HTMLInputElement;
  if (!group || !hiddenInput) return;

  const options = group.querySelectorAll('.choice-option');
  hiddenInput.value = defaultValue;

  options.forEach(opt => {
    if (opt.getAttribute('data-value') === defaultValue) opt.classList.add('active');

    opt.addEventListener('click', () => {
      options.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      const val = opt.getAttribute('data-value')!;
      hiddenInput.value = val;
      hiddenInput.setAttribute('value', val); // for MutationObserver to trigger

      updateSearchButtonState();
    });
  });
}