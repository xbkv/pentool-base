let selectedBotType = '';
export function getSelectedBotType(): string {
  return selectedBotType;
}

export function setupBotTypeSelector(): void {
  const botTypeButtons = document.querySelectorAll('input[name="bot_type"]') as NodeListOf<HTMLInputElement>;
  const searchButton = document.getElementById('searchButton') as HTMLButtonElement;

  botTypeButtons.forEach(button => button.addEventListener('change', () => {
    const checkedButton = document.querySelector('input[name="bot_type"]:checked') as HTMLInputElement;
    selectedBotType = checkedButton ? checkedButton.value : '';
    updateParticipantCountOption();
    updateSearchButtonState();
  }));

  function updateParticipantCountOption(): void {
    const participantCountSelect = document.getElementById('participantCount') as HTMLSelectElement;
    if (participantCountSelect) {
      participantCountSelect.innerHTML = selectedBotType === 'ガチギレ'
        ? Array.from({ length: 18 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')
        : `<option value="1">1</option>`;
    }
  }

  function updateSearchButtonState(): void {
    const idInput = document.getElementById('idInput') as HTMLInputElement;
    const idValueValid = /^\d+$/.test(idInput.value);
    searchButton.disabled = !(idValueValid && selectedBotType);
  }
}