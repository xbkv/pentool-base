import { getSelectedBotType } from './botTypeSelector';

export function setupIdInputHandler(): void {
  const idInput = document.getElementById('idInput') as HTMLInputElement;
  const searchButton = document.getElementById('searchButton') as HTMLButtonElement;
  const radioButtons = document.querySelectorAll('input[name="id_type"]') as NodeListOf<HTMLInputElement>;

  idInput.addEventListener('input', updateSearchButtonState);

  radioButtons.forEach(radio => radio.addEventListener('change', () => {
    idInput.disabled = false;
    searchButton.disabled = true;
    idInput.value = '';
  }));

  function updateSearchButtonState(): void {
    const idValueValid = /^\d+$/.test(idInput.value);
    searchButton.disabled = !(idValueValid && getSelectedBotType());
  }
}