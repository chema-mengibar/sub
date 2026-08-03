export function createWaveform({ selectors, getPlayer, clearPlaybackTargets }) {
  let waveformPeaks = [];
  let waveformReady = false;
  let userWaveScrolling = false;
  let waveScrollTimer = 0;

  function canvasCssSize() {
    const player = getPlayer();
    const duration = Math.max(player.duration || 0, 1);
    const scale = selectors.waveZoomInput.value;
    const width = scale === 'fit'
      ? selectors.waveScroll.clientWidth
      : Math.max(selectors.waveScroll.clientWidth, Math.ceil(duration * 18 * Number(scale)));
    return { width, height: 72 };
  }

  function prepareCanvas() {
    const { width, height } = canvasCssSize();
    const ratio = window.devicePixelRatio || 1;
    selectors.waveContent.style.width = `${width}px`;
    selectors.waveCanvas.style.width = `${width}px`;
    selectors.waveCanvas.style.height = `${height}px`;
    selectors.waveCanvas.width = Math.floor(width * ratio);
    selectors.waveCanvas.height = Math.floor(height * ratio);
    const ctx = selectors.waveCanvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    updateScrollbarSpacing();
    return { ctx, width, height };
  }

  function updateScrollbarSpacing() {
    const scrollbarHeight = selectors.waveScroll.offsetHeight - selectors.waveScroll.clientHeight;
    selectors.waveScroll.style.setProperty('--wave-scrollbar-space', `${Math.max(14, scrollbarHeight)}px`);
  }

  function draw() {
    const { ctx, width, height } = prepareCanvas();
    renderRuler(width);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#20242a';
    ctx.fillRect(0, 0, width, height);

    if (!waveformReady || !waveformPeaks.length) {
      ctx.fillStyle = '#303640';
      ctx.fillRect(0, height / 2 - 2, width, 4);
      return;
    }

    const mid = height / 2;
    ctx.fillStyle = '#16b8ff';
    for (let x = 0; x < width; x += 1) {
      const peakIndex = Math.min(waveformPeaks.length - 1, Math.floor((x / width) * waveformPeaks.length));
      const peak = waveformPeaks[peakIndex] || 0;
      const barHeight = Math.max(2, peak * (height - 12));
      ctx.fillRect(x, mid - barHeight / 2, 1, barHeight);
    }
  }

  function formatRulerTime(seconds) {
    const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
    const hh = Math.floor(safe / 3600);
    const mm = Math.floor((safe % 3600) / 60);
    const ss = Math.floor(safe % 60);
    if (hh > 0) return `${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    return `${mm}:${String(ss).padStart(2, '0')}`;
  }

  function chooseTickStep(duration, width) {
    const minLabelSpacing = 68;
    const targetTicks = Math.max(2, Math.floor(width / minLabelSpacing));
    const rawStep = duration / targetTicks;
    const steps = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600];
    return steps.find((step) => step >= rawStep) || steps.at(-1);
  }

  function renderRuler(width) {
    const player = getPlayer();
    const duration = player.duration || 0;
    selectors.waveRuler.innerHTML = '';
    selectors.waveRuler.style.width = `${width}px`;

    if (!duration || player !== selectors.audio) return;

    const step = chooseTickStep(duration, width);
    const fragment = document.createDocumentFragment();
    for (let time = 0; time <= duration; time += step) {
      fragment.appendChild(createTick(time, duration, width));
    }
    if (duration % step !== 0) {
      fragment.appendChild(createTick(duration, duration, width));
    }
    selectors.waveRuler.appendChild(fragment);
  }

  function createTick(time, duration, width) {
    const tick = document.createElement('span');
    tick.className = 'wave-tick';
    tick.style.left = `${(time / duration) * width}px`;
    tick.innerHTML = `<span>${formatRulerTime(time)}</span>`;
    return tick;
  }

  function reset() {
    waveformPeaks = [];
    waveformReady = false;
    draw();
    updatePlayhead();
  }

  async function build(file) {
    const player = getPlayer();
    reset();
    if (!file || player !== selectors.audio) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContextClass();
      const buffer = await context.decodeAudioData(await file.arrayBuffer());
      const channel = buffer.getChannelData(0);
      const samples = Math.min(2400, Math.max(400, Math.floor(buffer.duration * 12)));
      const blockSize = Math.max(1, Math.floor(channel.length / samples));
      waveformPeaks = [];
      for (let i = 0; i < samples; i += 1) {
        let peak = 0;
        const start = i * blockSize;
        const end = Math.min(start + blockSize, channel.length);
        for (let j = start; j < end; j += 1) {
          const value = Math.abs(channel[j]);
          if (value > peak) peak = value;
        }
        waveformPeaks.push(peak);
      }
      waveformReady = true;
      await context.close();
    } catch {
      waveformPeaks = [];
      waveformReady = false;
    }
    draw();
    updatePlayhead();
  }

  function updatePlayhead() {
    const player = getPlayer();
    const duration = player.duration || 0;
    const width = selectors.waveCanvas.getBoundingClientRect().width || 0;
    const x = duration ? (player.currentTime / duration) * width : 0;
    selectors.wavePlayhead.style.transform = `translateX(${x}px)`;
  }

  function keepPlayheadVisible(force = false) {
    const player = getPlayer();
    if (userWaveScrolling && !force) return;
    const duration = player.duration || 0;
    if (!duration) return;
    const width = selectors.waveCanvas.getBoundingClientRect().width || 0;
    const x = (player.currentTime / duration) * width;
    const viewportStart = selectors.waveScroll.scrollLeft;
    const viewportEnd = viewportStart + selectors.waveScroll.clientWidth;
    const padding = Math.min(80, selectors.waveScroll.clientWidth * 0.24);

    if (force || x < viewportStart + padding || x > viewportEnd - padding) {
      selectors.waveScroll.scrollTo({
        left: Math.max(0, x - selectors.waveScroll.clientWidth / 2),
        behavior: force ? 'auto' : 'smooth',
      });
    }
  }

  function seekFromEvent(event) {
    const player = getPlayer();
    const rect = selectors.waveCanvas.getBoundingClientRect();
    const duration = player.duration || 0;
    if (!duration) return;
    const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
    clearPlaybackTargets();
    player.currentTime = (x / rect.width) * duration;
    updatePlayhead();
    keepPlayheadVisible(true);
  }

  function handleScroll() {
    userWaveScrolling = true;
    window.clearTimeout(waveScrollTimer);
    waveScrollTimer = window.setTimeout(() => {
      userWaveScrolling = false;
    }, 900);
  }

  return {
    build,
    draw,
    handleScroll,
    keepPlayheadVisible,
    reset,
    seekFromEvent,
    updatePlayhead,
  };
}
