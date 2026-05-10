/** Снимает фокус с активного поля — помогает клавиатуре/zoom на iOS после сабмита формы */
export function blurActiveElement(): void {
  const el = document.activeElement;
  if (el instanceof HTMLElement && typeof el.blur === 'function') {
    el.blur();
  }
}
