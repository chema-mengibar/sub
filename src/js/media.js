export function useMediaElement({ selectors, fileNameOrUrl, sourceUrl }) {
  const isVideo = /\.(mp4|webm|ogg|mov|m4v)$/i.test(fileNameOrUrl);
  const next = isVideo ? selectors.video : selectors.audio;
  const prev = isVideo ? selectors.audio : selectors.video;

  prev.pause();
  prev.hidden = true;
  prev.removeAttribute('src');
  next.src = sourceUrl;
  next.hidden = false;
  selectors.mediaFrame.classList.toggle('has-audio', next === selectors.audio);
  selectors.mediaFrame.classList.toggle('has-video', next === selectors.video);
  selectors.waveToolbar.hidden = next === selectors.video;
  return next;
}
