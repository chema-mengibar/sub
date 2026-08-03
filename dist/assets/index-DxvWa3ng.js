(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function e({selectors:e,jumpRelative:t}){document.addEventListener(`keydown`,n=>{[`INPUT`,`SELECT`,`TEXTAREA`].includes(document.activeElement?.tagName)||(n.code===`Space`?(n.preventDefault(),e.playPauseBtn.click()):n.key.toLowerCase()===`m`?e.loadMediaBtn.click():n.key.toLowerCase()===`t`?e.loadTranscriptBtn.click():n.key.toLowerCase()===`b`?e.blockBtn.click():n.key.toLowerCase()===`r`?e.playRangeBtn.click():n.key.toLowerCase()===`u`?e.unloadTranscriptBtn.click():n.key===`ArrowLeft`?(n.preventDefault(),t(-1)):n.key===`ArrowRight`&&(n.preventDefault(),t(1)))})}function t({selectors:e,fileNameOrUrl:t,sourceUrl:n}){let r=/\.(mp4|webm|ogg|mov|m4v)$/i.test(t),i=r?e.video:e.audio,a=r?e.audio:e.video;return a.pause(),a.hidden=!0,a.removeAttribute(`src`),i.src=n,i.hidden=!1,e.mediaFrame.classList.toggle(`has-audio`,i===e.audio),e.mediaFrame.classList.toggle(`has-video`,i===e.video),e.waveToolbar.hidden=i===e.video,i}function n(e){let t=e.trim().match(/^(\d{2}):(\d{2}):(\d{2})[,.](\d{3})$/);if(!t)return 0;let[,n,r,i,a]=t;return Number(n)*3600+Number(r)*60+Number(i)+Number(a)/1e3}function r(e){let t=Math.max(0,Number.isFinite(e)?e:0),n=Math.floor(t/3600),r=Math.floor(t%3600/60),i=Math.floor(t%60),a=Math.floor((t-Math.floor(t))*1e3);return`${String(n).padStart(2,`0`)}:${String(r).padStart(2,`0`)}:${String(i).padStart(2,`0`)}.${String(a).padStart(3,`0`)}`}function i(e){let t=e.trim().replace(`,`,`.`);if(!t)return null;if(/^\d+(\.\d+)?$/.test(t))return Number(t);let n=t.split(`:`).map(Number);return n.some(e=>!Number.isFinite(e))?null:n.length===2?n[0]*60+n[1]:n.length===3?n[0]*3600+n[1]*60+n[2]:null}function a(e,t){return e.filter(e=>e.toLowerCase().startsWith(t)).map(e=>e.slice(t.length).trim()).join(` `)}function o(e){return e.replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#039;`).replaceAll(`
`,`<br />`)}function s(e){let t=e.replace(/\r\n/g,`
`).replace(/\r/g,`
`),r=t.split(/\n(?=\d+\n\d{2}:\d{2}:\d{2}[,.]\d{3}\s+-->\s+\d{2}:\d{2}:\d{2}[,.]\d{3})/g).map(e=>e.trimEnd()).filter(Boolean);return r.length?r.map((e,t)=>{let r=e.split(`
`),i=r[0].trim(),[o,s]=(r[1]||``).split(`-->`).map(e=>e.trim()),c=r.slice(2),l=a(c,`romaji:`),u=a(c,`español:`)||a(c,`espanol:`),d=c.filter(e=>{let t=e.toLowerCase();return!t.startsWith(`romaji:`)&&!t.startsWith(`español:`)&&!t.startsWith(`espanol:`)});return{number:i,start:n(o),end:n(s),timeLabel:`${o} → ${s}`,japanese:d.join(`
`).trim(),romaji:l,spanish:u,raw:e,index:t}}):t.split(/\n{2,}/g).map((e,t)=>({number:String(t+1),start:t,end:t+1,timeLabel:`no timestamp`,japanese:e.trim(),romaji:``,spanish:``,raw:e,index:t})).filter(e=>e.japanese)}function c({selectors:e,blocks:t,player:n,findActiveIndex:r,setActiveBlock:i,onBlockClick:a}){e.blockCount.textContent=`${t.length} blocks`,e.list.innerHTML=``;let s=document.createDocumentFragment();t.forEach((e,t)=>{let n=document.createElement(`div`);n.className=`transcript-block`,n.dataset.index=String(t),n.innerHTML=`
      <span class="block-meta">${e.number} · ${e.timeLabel}</span>
      ${e.japanese?`<span class="jp">${o(e.japanese)}</span>`:``}
      ${e.romaji?`<span class="romaji">${o(e.romaji)}</span>`:``}
      ${e.spanish?`<span class="spanish">${o(e.spanish)}</span>`:``}
    `,n.addEventListener(`click`,()=>a(t,!0)),s.appendChild(n)}),e.list.appendChild(s),i(r(n.currentTime))}function l({selectors:e,getPlayer:t,clearPlaybackTargets:n}){let r=[],i=!1,a=!1,o=0;function s(){let n=t(),r=Math.max(n.duration||0,1),i=e.waveZoomInput.value;return{width:i===`fit`?e.waveScroll.clientWidth:Math.max(e.waveScroll.clientWidth,Math.ceil(r*18*Number(i))),height:72}}function c(){let{width:t,height:n}=s(),r=window.devicePixelRatio||1;e.waveContent.style.width=`${t}px`,e.waveCanvas.style.width=`${t}px`,e.waveCanvas.style.height=`${n}px`,e.waveCanvas.width=Math.floor(t*r),e.waveCanvas.height=Math.floor(n*r);let i=e.waveCanvas.getContext(`2d`);return i.setTransform(r,0,0,r,0,0),l(),{ctx:i,width:t,height:n}}function l(){let t=e.waveScroll.offsetHeight-e.waveScroll.clientHeight;e.waveScroll.style.setProperty(`--wave-scrollbar-space`,`${Math.max(14,t)}px`)}function u(){let{ctx:e,width:t,height:n}=c();if(p(t),e.clearRect(0,0,t,n),e.fillStyle=`#20242a`,e.fillRect(0,0,t,n),!i||!r.length){e.fillStyle=`#303640`,e.fillRect(0,n/2-2,t,4);return}let a=n/2;e.fillStyle=`#16b8ff`;for(let i=0;i<t;i+=1){let o=Math.min(r.length-1,Math.floor(i/t*r.length)),s=r[o]||0,c=Math.max(2,s*(n-12));e.fillRect(i,a-c/2,1,c)}}function d(e){let t=Math.max(0,Number.isFinite(e)?e:0),n=Math.floor(t/3600),r=Math.floor(t%3600/60),i=Math.floor(t%60);return n>0?`${n}:${String(r).padStart(2,`0`)}:${String(i).padStart(2,`0`)}`:`${r}:${String(i).padStart(2,`0`)}`}function f(e,t){let n=e/Math.max(2,Math.floor(t/68)),r=[1,2,5,10,15,30,60,120,300,600,900,1800,3600];return r.find(e=>e>=n)||r.at(-1)}function p(n){let r=t(),i=r.duration||0;if(e.waveRuler.innerHTML=``,e.waveRuler.style.width=`${n}px`,!i||r!==e.audio)return;let a=f(i,n),o=document.createDocumentFragment();for(let e=0;e<=i;e+=a)o.appendChild(m(e,i,n));i%a!==0&&o.appendChild(m(i,i,n)),e.waveRuler.appendChild(o)}function m(e,t,n){let r=document.createElement(`span`);return r.className=`wave-tick`,r.style.left=`${e/t*n}px`,r.innerHTML=`<span>${d(e)}</span>`,r}function h(){r=[],i=!1,u(),_()}async function g(n){let a=t();if(h(),!(!n||a!==e.audio)){try{let e=new(window.AudioContext||window.webkitAudioContext),t=await e.decodeAudioData(await n.arrayBuffer()),a=t.getChannelData(0),o=Math.min(2400,Math.max(400,Math.floor(t.duration*12))),s=Math.max(1,Math.floor(a.length/o));r=[];for(let e=0;e<o;e+=1){let t=0,n=e*s,i=Math.min(n+s,a.length);for(let e=n;e<i;e+=1){let n=Math.abs(a[e]);n>t&&(t=n)}r.push(t)}i=!0,await e.close()}catch{r=[],i=!1}u(),_()}}function _(){let n=t(),r=n.duration||0,i=e.waveCanvas.getBoundingClientRect().width||0,a=r?n.currentTime/r*i:0;e.wavePlayhead.style.transform=`translateX(${a}px)`}function v(n=!1){let r=t();if(a&&!n)return;let i=r.duration||0;if(!i)return;let o=e.waveCanvas.getBoundingClientRect().width||0,s=r.currentTime/i*o,c=e.waveScroll.scrollLeft,l=c+e.waveScroll.clientWidth,u=Math.min(80,e.waveScroll.clientWidth*.24);(n||s<c+u||s>l-u)&&e.waveScroll.scrollTo({left:Math.max(0,s-e.waveScroll.clientWidth/2),behavior:n?`auto`:`smooth`})}function y(r){let i=t(),a=e.waveCanvas.getBoundingClientRect(),o=i.duration||0;if(!o)return;let s=Math.min(Math.max(r.clientX-a.left,0),a.width);n(),i.currentTime=s/a.width*o,_(),v(!0)}function b(){a=!0,window.clearTimeout(o),o=window.setTimeout(()=>{a=!1},900)}return{build:g,draw:u,handleScroll:b,keepPlayheadVisible:v,reset:h,seekFromEvent:y,updatePlayhead:_}}var u=document.querySelector(`#app`);u.innerHTML=`
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
`;var d={mediaInput:document.querySelector(`#mediaInput`),transcriptInput:document.querySelector(`#transcriptInput`),loadMediaBtn:document.querySelector(`#loadMediaBtn`),loadTranscriptBtn:document.querySelector(`#loadTranscriptBtn`),video:document.querySelector(`#videoPlayer`),audio:document.querySelector(`#audioPlayer`),mediaFrame:document.querySelector(`.media-frame`),waveToolbar:document.querySelector(`.wave-toolbar`),waveScroll:document.querySelector(`#waveScroll`),waveContent:document.querySelector(`#waveContent`),waveCanvas:document.querySelector(`#waveCanvas`),wavePlayhead:document.querySelector(`#wavePlayhead`),waveRuler:document.querySelector(`#waveRuler`),waveZoomInput:document.querySelector(`#waveZoomInput`),rangeStartInput:document.querySelector(`#rangeStartInput`),rangeEndInput:document.querySelector(`#rangeEndInput`),rangeStartNowBtn:document.querySelector(`#rangeStartNowBtn`),rangeEndNowBtn:document.querySelector(`#rangeEndNowBtn`),playRangeBtn:document.querySelector(`#playRangeBtn`),copyRangeBtn:document.querySelector(`#copyRangeBtn`),playPauseBtn:document.querySelector(`#playPauseBtn`),blockBtn:document.querySelector(`#blockBtn`),prevBtn:document.querySelector(`#prevBtn`),nextBtn:document.querySelector(`#nextBtn`),status:document.querySelector(`#status`),list:document.querySelector(`#transcriptList`),blockCount:document.querySelector(`#blockCount`),unloadTranscriptBtn:document.querySelector(`#unloadTranscriptBtn`),copyTranscriptBlockBtn:document.querySelector(`#copyTranscriptBlockBtn`)},f={player:d.audio,transcriptBlocks:[],activeIndex:-1,selectedBlockIndex:-1,blockPauseAt:null,blockPlaybackIndex:-1,rangePauseAt:null,objectUrl:null},p=l({selectors:d,getPlayer:()=>f.player,clearPlaybackTargets:h});function m(e){d.status.textContent=e}function h(){f.blockPauseAt=null,f.blockPlaybackIndex=-1,f.rangePauseAt=null,f.selectedBlockIndex=-1}function g(e){return f.transcriptBlocks.findIndex(t=>e>=t.start&&e<t.end)}function _(e){if(e===f.activeIndex)return;f.activeIndex=e,d.list.querySelectorAll(`.transcript-block`).forEach((e,t)=>{e.classList.toggle(`is-active`,t===f.activeIndex)});let t=d.list.querySelector(`.transcript-block.is-active`);t&&t.scrollIntoView({block:`nearest`})}function v(){c({selectors:d,blocks:f.transcriptBlocks,player:f.player,findActiveIndex:g,setActiveBlock:_,onBlockClick:C})}function y(){f.transcriptBlocks=[],f.activeIndex=-1,f.selectedBlockIndex=-1,f.blockPauseAt=null,f.blockPlaybackIndex=-1,v(),m(`Transcript unloaded.`)}function b(){[d.audio,d.video].forEach(e=>{e.ontimeupdate=S,e.onplay=x,e.onpause=x,e.onended=x,e.onloadedmetadata=()=>{p.draw(),p.updatePlayhead(),p.keepPlayheadVisible(!0)},e.onseeked=()=>{p.updatePlayhead(),p.keepPlayheadVisible(!0)}}),x()}function x(){d.playPauseBtn.textContent=f.player.paused?`Play (Space)`:`Pause (Space)`}function S(){if(f.rangePauseAt!==null&&f.player.currentTime>=f.rangePauseAt){f.player.pause(),f.player.currentTime=Math.max(0,f.rangePauseAt-.02),f.rangePauseAt=null,p.updatePlayhead(),p.keepPlayheadVisible(!0);return}if(f.blockPauseAt!==null&&f.player.currentTime>=f.blockPauseAt){f.player.pause();let e=f.transcriptBlocks[f.blockPlaybackIndex];e&&(f.player.currentTime=Math.max(e.start,e.end-.02),_(f.blockPlaybackIndex)),f.blockPauseAt=null,f.blockPlaybackIndex=-1,p.updatePlayhead(),p.keepPlayheadVisible(!0);return}p.updatePlayhead(),p.keepPlayheadVisible(),_(f.blockPlaybackIndex>=0?f.blockPlaybackIndex:g(f.player.currentTime))}function C(e,t){let n=f.transcriptBlocks[e];n&&(f.selectedBlockIndex=e,f.player.currentTime=n.start,f.blockPauseAt=t?n.end:null,f.rangePauseAt=null,f.blockPlaybackIndex=t?e:-1,_(e),t&&f.player.play())}function w(){let e=i(d.rangeStartInput.value),t=i(d.rangeEndInput.value);if(e===null||t===null||t<=e){m(`Range needs valid start and end times.`);return}f.blockPauseAt=null,f.blockPlaybackIndex=-1,f.selectedBlockIndex=-1,f.rangePauseAt=t,f.player.currentTime=e,f.player.play()}async function T(){let e=d.rangeStartInput.value.trim(),t=d.rangeEndInput.value.trim();if(!e||!t){m(`Range needs start and end times to copy.`);return}try{await navigator.clipboard.writeText(`${e} ${t}`),m(`Copied range to clipboard.`)}catch{m(`Clipboard copy failed.`)}}function E(){return f.selectedBlockIndex>=0?f.transcriptBlocks[f.selectedBlockIndex]:f.activeIndex>=0?f.transcriptBlocks[f.activeIndex]:null}function D(e){return[e.number,e.timeLabel,e.japanese,e.romaji,e.spanish].filter(Boolean).join(`
`)}async function O(){let e=E(),t=e?D(e):``;if(!t){m(`Select a transcript block to copy.`);return}try{await navigator.clipboard.writeText(t),m(`Copied transcript block to clipboard.`)}catch{m(`Clipboard copy failed.`)}}function k(){if(f.selectedBlockIndex>=0)return f.selectedBlockIndex;if(f.activeIndex>=0)return f.activeIndex;let e=f.transcriptBlocks.findIndex(e=>e.start>=f.player.currentTime);return e>=0?e:0}function A(){let e=k();f.transcriptBlocks[e]&&C(e,!0)}function j(e){if(!f.transcriptBlocks.length)return;if(f.selectedBlockIndex>=0){C(Math.min(Math.max(f.selectedBlockIndex+e,0),f.transcriptBlocks.length-1),!0);return}if(e>0){let e=f.transcriptBlocks.findIndex(e=>e.start>f.player.currentTime+.02);C(e>=0?e:f.transcriptBlocks.length-1,!0);return}let t=[...f.transcriptBlocks].reverse().findIndex(e=>e.start<f.player.currentTime-.02);C(t>=0?f.transcriptBlocks.length-1-t:0,!0)}async function M(e,t){f.transcriptBlocks=s(t),v(),m(`Loaded transcript: ${e}`)}d.loadMediaBtn.addEventListener(`click`,()=>d.mediaInput.click()),d.loadTranscriptBtn.addEventListener(`click`,()=>d.transcriptInput.click()),d.mediaInput.addEventListener(`change`,()=>{let e=d.mediaInput.files?.[0];e&&(f.objectUrl&&URL.revokeObjectURL(f.objectUrl),f.objectUrl=URL.createObjectURL(e),f.player=t({selectors:d,fileNameOrUrl:e.name,sourceUrl:f.objectUrl}),b(),p.reset(),f.player===d.audio&&p.build(e),m(`Loaded media: ${e.name}`))}),d.transcriptInput.addEventListener(`change`,async()=>{let e=d.transcriptInput.files?.[0];e&&await M(e.name,await e.text())}),d.playPauseBtn.addEventListener(`click`,()=>{h(),f.player.paused?f.player.play():f.player.pause()}),d.rangeStartNowBtn.addEventListener(`click`,()=>{d.rangeStartInput.value=r(f.player.currentTime)}),d.rangeEndNowBtn.addEventListener(`click`,()=>{d.rangeEndInput.value=r(f.player.currentTime)}),d.playRangeBtn.addEventListener(`click`,w),d.copyRangeBtn.addEventListener(`click`,T),d.waveZoomInput.addEventListener(`change`,()=>{p.draw(),p.updatePlayhead(),p.keepPlayheadVisible(!0)}),d.waveCanvas.addEventListener(`click`,p.seekFromEvent),d.waveScroll.addEventListener(`scroll`,p.handleScroll),d.blockBtn.addEventListener(`click`,A),d.prevBtn.addEventListener(`click`,()=>j(-1)),d.nextBtn.addEventListener(`click`,()=>j(1)),d.unloadTranscriptBtn.addEventListener(`click`,y),d.copyTranscriptBlockBtn.addEventListener(`click`,O),e({selectors:d,jumpRelative:j}),b(),d.waveToolbar.hidden=!0,p.draw(),window.addEventListener(`resize`,()=>{p.draw(),p.updatePlayhead()});