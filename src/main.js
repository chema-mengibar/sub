import './styles.scss';
import { attachKeyboardShortcuts } from './js/keyboard.js';
import { useMediaElement } from './js/media.js';
import { parseTranscript, renderTranscript } from './js/transcript.js';
import { formatTime, parseFlexibleTime } from './js/time.js';
import { createWaveform } from './js/waveform.js';

const app = document.querySelector('#app');
const MAX_TRANSCRIPT_FILE_SIZE = 10 * 1024 * 1024;

app.innerHTML = `
  <main class="shell">
    <section class="stage" aria-label="Media player">
      <div class="toolbar main-toolbar">
        <button id="loadMediaBtn" type="button">Load media (M)</button>
        <button id="loadTranscriptBtn" type="button">Load transcript (T)</button>
      </div>

      <div id="status" class="status" role="status">No files loaded.</div>

      <input id="mediaInput" type="file" accept="audio/*,video/*" hidden />
      <input id="transcriptInput" type="file" accept=".srt,.txt,.vtt,text/plain,application/x-subrip" hidden />

      <div class="media-frame">
        <video id="videoPlayer" class="media-el" controls playsinline hidden></video>
        <audio id="audioPlayer" class="media-el" controls hidden></audio>
      </div>

      <div class="wave-toolbar">
        <div id="waveScroll" class="wave-scroll">
          <div id="waveContent" class="wave-content">
            <canvas id="waveCanvas" class="wave-canvas" height="72"></canvas>
            <div id="wavePlayhead" class="wave-playhead"></div>
            <div id="waveRuler" class="wave-ruler" aria-hidden="true"></div>
          </div>
        </div>
        <label class="wave-zoom">
          <span>Scale</span>
          <select id="waveZoomInput">
            <option value="fit">100%</option>
            <option value="1">x1</option>
            <option value="2">x2</option>
            <option value="4">x4</option>
            <option value="8">x8</option>
          </select>
        </label>
      </div>

      <div class="toolbar timeline-toolbar">
        <label>
          <span>Time_start</span>
          <input id="rangeStartInput" type="text" inputmode="decimal" placeholder="00:00:00.000" />
        </label>
        <button id="rangeStartNowBtn" type="button">now</button>
        <span class="timeline-separator" aria-hidden="true"></span>
        <label>
          <span>Time_end</span>
          <input id="rangeEndInput" type="text" inputmode="decimal" placeholder="00:00:00.000" />
        </label>
        <button id="rangeEndNowBtn" type="button">now</button>
        <span class="timeline-separator" aria-hidden="true"></span>
        <button id="playRangeBtn" type="button">Play range (R)</button>
        <button id="copyRangeBtn" type="button">Copy</button>
      </div>

      <div class="toolbar player-toolbar">
        <button id="playPauseBtn" type="button">Play (Space)</button>
        <div class="separator"></div>
        <button id="blockBtn" type="button">Play block (B)</button>
        <button id="prevBtn" type="button">Prev block (←)</button>
        <button id="nextBtn" type="button">Next block (→)</button>
      </div>
    </section>

    <aside class="transcript-panel" aria-label="Transcription blocks">
      <div class="transcript-head">
        <span>Transcription</span>
        <div class="transcript-head-actions">
          <span id="blockCount">0 blocks</span>
          <button id="unloadTranscriptBtn" type="button">Unload (U)</button>
        </div>
      </div>
      <div class="transcript-controls">
        <button id="copyTranscriptBlockBtn" type="button">Copy</button>
      </div>
      <div id="transcriptList" class="transcript-list"></div>
    </aside>
  </main>
`;

const selectors = {
  mediaInput: document.querySelector('#mediaInput'),
  transcriptInput: document.querySelector('#transcriptInput'),
  loadMediaBtn: document.querySelector('#loadMediaBtn'),
  loadTranscriptBtn: document.querySelector('#loadTranscriptBtn'),
  video: document.querySelector('#videoPlayer'),
  audio: document.querySelector('#audioPlayer'),
  mediaFrame: document.querySelector('.media-frame'),
  waveToolbar: document.querySelector('.wave-toolbar'),
  waveScroll: document.querySelector('#waveScroll'),
  waveContent: document.querySelector('#waveContent'),
  waveCanvas: document.querySelector('#waveCanvas'),
  wavePlayhead: document.querySelector('#wavePlayhead'),
  waveRuler: document.querySelector('#waveRuler'),
  waveZoomInput: document.querySelector('#waveZoomInput'),
  rangeStartInput: document.querySelector('#rangeStartInput'),
  rangeEndInput: document.querySelector('#rangeEndInput'),
  rangeStartNowBtn: document.querySelector('#rangeStartNowBtn'),
  rangeEndNowBtn: document.querySelector('#rangeEndNowBtn'),
  playRangeBtn: document.querySelector('#playRangeBtn'),
  copyRangeBtn: document.querySelector('#copyRangeBtn'),
  playPauseBtn: document.querySelector('#playPauseBtn'),
  blockBtn: document.querySelector('#blockBtn'),
  prevBtn: document.querySelector('#prevBtn'),
  nextBtn: document.querySelector('#nextBtn'),
  status: document.querySelector('#status'),
  list: document.querySelector('#transcriptList'),
  blockCount: document.querySelector('#blockCount'),
  unloadTranscriptBtn: document.querySelector('#unloadTranscriptBtn'),
  copyTranscriptBlockBtn: document.querySelector('#copyTranscriptBlockBtn'),
};

const state = {
  player: selectors.audio,
  transcriptBlocks: [],
  activeIndex: -1,
  selectedBlockIndex: -1,
  blockPauseAt: null,
  blockPlaybackIndex: -1,
  rangePauseAt: null,
  objectUrl: null,
};

const waveform = createWaveform({
  selectors,
  getPlayer: () => state.player,
  clearPlaybackTargets,
});

function setStatus(message) {
  selectors.status.textContent = message;
}

function clearPlaybackTargets() {
  state.blockPauseAt = null;
  state.blockPlaybackIndex = -1;
  state.rangePauseAt = null;
  state.selectedBlockIndex = -1;
}

function findActiveIndex(time) {
  return state.transcriptBlocks.findIndex((block) => time >= block.start && time < block.end);
}

function setActiveBlock(index) {
  if (index === state.activeIndex) return;
  state.activeIndex = index;
  selectors.list.querySelectorAll('.transcript-block').forEach((node, nodeIndex) => {
    node.classList.toggle('is-active', nodeIndex === state.activeIndex);
  });
  const active = selectors.list.querySelector('.transcript-block.is-active');
  if (active) active.scrollIntoView({ block: 'nearest' });
}

function renderCurrentTranscript() {
  renderTranscript({
    selectors,
    blocks: state.transcriptBlocks,
    player: state.player,
    findActiveIndex,
    setActiveBlock,
    onBlockClick: jumpToBlock,
  });
}

function unloadTranscript() {
  state.transcriptBlocks = [];
  state.activeIndex = -1;
  state.selectedBlockIndex = -1;
  state.blockPauseAt = null;
  state.blockPlaybackIndex = -1;
  renderCurrentTranscript();
  setStatus('Transcript unloaded.');
}

function attachPlayerEvents() {
  [selectors.audio, selectors.video].forEach((el) => {
    el.ontimeupdate = handleTimeUpdate;
    el.onplay = updatePlayButton;
    el.onpause = updatePlayButton;
    el.onended = updatePlayButton;
    el.onloadedmetadata = () => {
      waveform.draw();
      waveform.updatePlayhead();
      waveform.keepPlayheadVisible(true);
    };
    el.onseeked = () => {
      waveform.updatePlayhead();
      waveform.keepPlayheadVisible(true);
    };
  });
  updatePlayButton();
}

function updatePlayButton() {
  selectors.playPauseBtn.textContent = state.player.paused ? 'Play (Space)' : 'Pause (Space)';
}

function handleTimeUpdate() {
  if (state.rangePauseAt !== null && state.player.currentTime >= state.rangePauseAt) {
    state.player.pause();
    state.player.currentTime = Math.max(0, state.rangePauseAt - 0.02);
    state.rangePauseAt = null;
    waveform.updatePlayhead();
    waveform.keepPlayheadVisible(true);
    return;
  }

  if (state.blockPauseAt !== null && state.player.currentTime >= state.blockPauseAt) {
    state.player.pause();
    const block = state.transcriptBlocks[state.blockPlaybackIndex];
    if (block) {
      state.player.currentTime = Math.max(block.start, block.end - 0.02);
      setActiveBlock(state.blockPlaybackIndex);
    }
    state.blockPauseAt = null;
    state.blockPlaybackIndex = -1;
    waveform.updatePlayhead();
    waveform.keepPlayheadVisible(true);
    return;
  }

  waveform.updatePlayhead();
  waveform.keepPlayheadVisible();
  setActiveBlock(state.blockPlaybackIndex >= 0 ? state.blockPlaybackIndex : findActiveIndex(state.player.currentTime));
}

function jumpToBlock(index, play) {
  const block = state.transcriptBlocks[index];
  if (!block) return;
  state.selectedBlockIndex = index;
  state.player.currentTime = block.start;
  state.blockPauseAt = play ? block.end : null;
  state.rangePauseAt = null;
  state.blockPlaybackIndex = play ? index : -1;
  setActiveBlock(index);
  if (play) state.player.play();
}

function playRange() {
  const start = parseFlexibleTime(selectors.rangeStartInput.value);
  const end = parseFlexibleTime(selectors.rangeEndInput.value);
  if (start === null || end === null || end <= start) {
    setStatus('Range needs valid start and end times.');
    return;
  }
  state.blockPauseAt = null;
  state.blockPlaybackIndex = -1;
  state.selectedBlockIndex = -1;
  state.rangePauseAt = end;
  state.player.currentTime = start;
  state.player.play();
}

async function copyRange() {
  const start = selectors.rangeStartInput.value.trim();
  const end = selectors.rangeEndInput.value.trim();
  if (!start || !end) {
    setStatus('Range needs start and end times to copy.');
    return;
  }

  try {
    await navigator.clipboard.writeText(`${start} ${end}`);
    setStatus('Copied range to clipboard.');
  } catch {
    setStatus('Clipboard copy failed.');
  }
}

function selectedTranscriptBlock() {
  if (state.selectedBlockIndex >= 0) return state.transcriptBlocks[state.selectedBlockIndex];
  if (state.activeIndex >= 0) return state.transcriptBlocks[state.activeIndex];
  return null;
}

function transcriptBlockText(block) {
  return [
    block.number,
    block.timeLabel,
    block.japanese,
    block.romaji,
    block.spanish,
  ].filter(Boolean).join('\n');
}

async function copySelectedTranscriptBlock() {
  const block = selectedTranscriptBlock();
  const text = block ? transcriptBlockText(block) : '';
  if (!text) {
    setStatus('Select a transcript block to copy.');
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    setStatus('Copied transcript block to clipboard.');
  } catch {
    setStatus('Clipboard copy failed.');
  }
}

function currentOrFirstIndex() {
  if (state.selectedBlockIndex >= 0) return state.selectedBlockIndex;
  if (state.activeIndex >= 0) return state.activeIndex;
  const next = state.transcriptBlocks.findIndex((block) => block.start >= state.player.currentTime);
  return next >= 0 ? next : 0;
}

function playCurrentBlock() {
  const index = currentOrFirstIndex();
  const block = state.transcriptBlocks[index];
  if (!block) return;
  jumpToBlock(index, true);
}

function jumpRelative(direction) {
  if (!state.transcriptBlocks.length) return;
  if (state.selectedBlockIndex >= 0) {
    const next = Math.min(Math.max(state.selectedBlockIndex + direction, 0), state.transcriptBlocks.length - 1);
    jumpToBlock(next, true);
    return;
  }

  if (direction > 0) {
    const next = state.transcriptBlocks.findIndex((block) => block.start > state.player.currentTime + 0.02);
    jumpToBlock(next >= 0 ? next : state.transcriptBlocks.length - 1, true);
    return;
  }

  const reversedIndex = [...state.transcriptBlocks]
    .reverse()
    .findIndex((block) => block.start < state.player.currentTime - 0.02);
  const prev = reversedIndex >= 0 ? state.transcriptBlocks.length - 1 - reversedIndex : 0;
  jumpToBlock(prev, true);
}

async function loadTranscriptText(name, text) {
  state.transcriptBlocks = parseTranscript(text);
  renderCurrentTranscript();
  setStatus(`Loaded transcript: ${name}`);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  });
}

selectors.loadMediaBtn.addEventListener('click', () => selectors.mediaInput.click());
selectors.loadTranscriptBtn.addEventListener('click', () => selectors.transcriptInput.click());

selectors.mediaInput.addEventListener('change', () => {
  const file = selectors.mediaInput.files?.[0];
  if (!file) return;
  if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
  state.objectUrl = URL.createObjectURL(file);
  state.player = useMediaElement({
    selectors,
    fileNameOrUrl: file.name,
    sourceUrl: state.objectUrl,
  });
  attachPlayerEvents();
  waveform.reset();
  if (state.player === selectors.audio) waveform.build(file);
  setStatus(`Loaded media: ${file.name}`);
});

selectors.transcriptInput.addEventListener('change', async () => {
  const file = selectors.transcriptInput.files?.[0];
  if (!file) return;
  if (file.size > MAX_TRANSCRIPT_FILE_SIZE) {
    setStatus('Transcript is too large to load safely in this browser.');
    selectors.transcriptInput.value = '';
    return;
  }
  await loadTranscriptText(file.name, await file.text());
});

selectors.playPauseBtn.addEventListener('click', () => {
  clearPlaybackTargets();
  if (state.player.paused) state.player.play();
  else state.player.pause();
});
selectors.rangeStartNowBtn.addEventListener('click', () => {
  selectors.rangeStartInput.value = formatTime(state.player.currentTime);
});
selectors.rangeEndNowBtn.addEventListener('click', () => {
  selectors.rangeEndInput.value = formatTime(state.player.currentTime);
});
selectors.playRangeBtn.addEventListener('click', playRange);
selectors.copyRangeBtn.addEventListener('click', copyRange);
selectors.waveZoomInput.addEventListener('change', () => {
  waveform.draw();
  waveform.updatePlayhead();
  waveform.keepPlayheadVisible(true);
});
selectors.waveCanvas.addEventListener('click', waveform.seekFromEvent);
selectors.waveScroll.addEventListener('scroll', waveform.handleScroll);
selectors.blockBtn.addEventListener('click', playCurrentBlock);
selectors.prevBtn.addEventListener('click', () => jumpRelative(-1));
selectors.nextBtn.addEventListener('click', () => jumpRelative(1));
selectors.unloadTranscriptBtn.addEventListener('click', unloadTranscript);
selectors.copyTranscriptBlockBtn.addEventListener('click', copySelectedTranscriptBlock);

attachKeyboardShortcuts({ selectors, jumpRelative });
attachPlayerEvents();
selectors.waveToolbar.hidden = true;
waveform.draw();
window.addEventListener('resize', () => {
  waveform.draw();
  waveform.updatePlayhead();
});
