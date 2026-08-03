import { parseSrtTime } from './time.js';

function getText(lines, prefix) {
  const found = lines.filter((line) => line.toLowerCase().startsWith(prefix));
  return found.map((line) => line.slice(prefix.length).trim()).join(' ');
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
    .replaceAll('\n', '<br />');
}

export function parseTranscript(text) {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const srtBlocks = normalized
    .split(/\n(?=\d+\n\d{2}:\d{2}:\d{2}[,.]\d{3}\s+-->\s+\d{2}:\d{2}:\d{2}[,.]\d{3})/g)
    .map((block) => block.trimEnd())
    .filter(Boolean);

  if (srtBlocks.length) {
    return srtBlocks.map((raw, index) => {
      const lines = raw.split('\n');
      const number = lines[0].trim();
      const timeLine = lines[1] || '';
      const [startRaw, endRaw] = timeLine.split('-->').map((part) => part.trim());
      const content = lines.slice(2);
      const romaji = getText(content, 'romaji:');
      const spanish = getText(content, 'español:') || getText(content, 'espanol:');
      const main = content.filter((line) => {
        const lower = line.toLowerCase();
        return !lower.startsWith('romaji:') && !lower.startsWith('español:') && !lower.startsWith('espanol:');
      });
      return {
        number,
        start: parseSrtTime(startRaw),
        end: parseSrtTime(endRaw),
        timeLabel: `${startRaw} → ${endRaw}`,
        japanese: main.join('\n').trim(),
        romaji,
        spanish,
        raw,
        index,
      };
    });
  }

  return normalized
    .split(/\n{2,}/g)
    .map((raw, index) => ({
      number: String(index + 1),
      start: index,
      end: index + 1,
      timeLabel: 'no timestamp',
      japanese: raw.trim(),
      romaji: '',
      spanish: '',
      raw,
      index,
    }))
    .filter((block) => block.japanese);
}

export function renderTranscript({ selectors, blocks, player, findActiveIndex, setActiveBlock, onBlockClick }) {
  selectors.blockCount.textContent = `${blocks.length} blocks`;
  selectors.list.innerHTML = '';

  const fragment = document.createDocumentFragment();
  blocks.forEach((block, index) => {
    const button = document.createElement('div');

    button.className = 'transcript-block';
    button.dataset.index = String(index);
    button.innerHTML = `
      <span class="block-meta">${block.number} · ${block.timeLabel}</span>
      ${block.japanese ? `<span class="jp">${escapeHtml(block.japanese)}</span>` : ''}
      ${block.romaji ? `<span class="romaji">${escapeHtml(block.romaji)}</span>` : ''}
      ${block.spanish ? `<span class="spanish">${escapeHtml(block.spanish)}</span>` : ''}
    `;
    button.addEventListener('click', () => onBlockClick(index, true));
    fragment.appendChild(button);
  });

  selectors.list.appendChild(fragment);
  setActiveBlock(findActiveIndex(player.currentTime));
}
