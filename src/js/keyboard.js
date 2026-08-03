export function attachKeyboardShortcuts({ selectors, jumpRelative }) {
  document.addEventListener('keydown', (event) => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
    if (event.code === 'Space') {
      event.preventDefault();
      selectors.playPauseBtn.click();
    } else if (event.key.toLowerCase() === 'm') {
      selectors.loadMediaBtn.click();
    } else if (event.key.toLowerCase() === 't') {
      selectors.loadTranscriptBtn.click();
    } else if (event.key.toLowerCase() === 'b') {
      selectors.blockBtn.click();
    } else if (event.key.toLowerCase() === 'r') {
      selectors.playRangeBtn.click();
    } else if (event.key.toLowerCase() === 'u') {
      selectors.unloadTranscriptBtn.click();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      jumpRelative(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      jumpRelative(1);
    }
  });
}
