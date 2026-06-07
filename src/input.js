// === 输入处理 ===
import { state } from './state.js';

export function setupInput(canvas) {
  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && state.running) {
      e.preventDefault();
      if (state.stamina > 0) state.isDuck = true;
    }
  });

  document.addEventListener('keyup', e => {
    if (e.code === 'Space') {
      e.preventDefault();
      state.isDuck = false;
    }
  });

  canvas.addEventListener('mousedown', e => {
    e.preventDefault();
    if (state.running && state.stamina > 0) state.isDuck = true;
  });

  canvas.addEventListener('mouseup', e => {
    e.preventDefault();
    state.isDuck = false;
  });

  canvas.addEventListener('mouseleave', () => { state.isDuck = false; });

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    if (state.running && state.stamina > 0) state.isDuck = true;
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    state.isDuck = false;
  }, { passive: false });
}
