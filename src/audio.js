// === 音频系统 ===

let audioCtx = null;

export function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

export function playTone(freq, dur, type, vol) {
  if (!audioCtx) return;
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.connect(g); g.connect(audioCtx.destination);
  o.type = type || 'sine'; o.frequency.value = freq;
  g.gain.setValueAtTime(vol || 0.15, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
  o.start(); o.stop(audioCtx.currentTime + dur);
}

export function sndDuck() { playTone(600, 0.08, 'sine', 0.3); setTimeout(() => playTone(400, 0.06, 'sine', 0.2), 40); }
export function sndHit() { playTone(150, 0.3, 'sawtooth', 0.4); setTimeout(() => playTone(80, 0.2, 'square', 0.25), 50); }
export function sndCoin() { playTone(880, 0.1, 'sine', 0.35); setTimeout(() => playTone(1100, 0.12, 'sine', 0.3), 80); }
export function sndLevelUp() { playTone(523, 0.12, 'sine', 0.35); setTimeout(() => playTone(659, 0.12, 'sine', 0.35), 120); setTimeout(() => playTone(784, 0.2, 'sine', 0.35), 240); }
export function sndPass() { playTone(520, 0.04, 'sine', 0.15); }
export function sndStar() { playTone(1047, 0.1, 'sine', 0.4); setTimeout(() => playTone(1319, 0.1, 'sine', 0.35), 100); setTimeout(() => playTone(1568, 0.15, 'sine', 0.3), 200); }
export function sndStaminaOut() { playTone(200, 0.3, 'square', 0.25); setTimeout(() => playTone(150, 0.2, 'square', 0.2), 150); }
export function sndAchieve() { playTone(784, 0.15, 'sine', 0.4); setTimeout(() => playTone(988, 0.15, 'sine', 0.35), 150); setTimeout(() => playTone(1175, 0.15, 'sine', 0.3), 300); setTimeout(() => playTone(1568, 0.25, 'sine', 0.4), 450); }

// === 语音系统 ===
const AUDIO_FILES = {
  start: 'audio/start.m4a', scene1: 'audio/scene1.m4a', scene2: 'audio/scene2.m4a',
  scene3: 'audio/scene3.m4a', scene4: 'audio/scene4.m4a', scene5: 'audio/scene5.m4a',
  gameover: 'audio/gameover.m4a', cheat: 'audio/cheat.m4a',
};
const audioCache = {};
let currentVoice = null;

export function preloadAudio() {
  for (const k in AUDIO_FILES) {
    const a = new Audio(AUDIO_FILES[k]);
    a.preload = 'auto';
    audioCache[k] = a;
  }
}

export function playVoice(key) {
  if (currentVoice) { currentVoice.pause(); currentVoice.currentTime = 0; }
  const a = audioCache[key];
  if (!a) return;
  a.currentTime = 0;
  a.play().catch(() => {});
  currentVoice = a;
}

export const SCENE_KEYS = ['scene1', 'scene2', 'scene3', 'scene4', 'scene5'];

// === BGM ===
let bgmTimer = null;

export function startBGM(running) {
  if (!audioCtx) return;
  const notes = [262, 294, 330, 349, 392, 349, 330, 294, 262, 330, 392, 440, 392, 330, 294, 262];
  let idx = 0;
  function tick() {
    if (!running()) { bgmTimer = null; return; }
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.type = 'triangle'; o.frequency.value = notes[idx % notes.length];
    g.gain.setValueAtTime(0.06, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.28);
    o.start(); o.stop(audioCtx.currentTime + 0.32);
    idx++; bgmTimer = setTimeout(tick, 350);
  }
  tick();
}

export function stopBGM() { if (bgmTimer) { clearTimeout(bgmTimer); bgmTimer = null; } }
