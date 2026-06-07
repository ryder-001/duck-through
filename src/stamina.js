// === 体力条系统 ===
import { state } from './state.js';
import { MAX_STAMINA, STAMINA_DRAIN, STAMINA_REGEN } from './config.js';
import { sndStaminaOut } from './audio.js';

export function updateStamina() {
  if (state.isDuck) {
    state.stamina -= STAMINA_DRAIN;
    if (state.stamina <= 0) {
      state.stamina = 0;
      state.isDuck = false;
      state.staminaLocked = true; // 锁定，必须松手才能再低头
      state.staminaEmpty = true;
      state.staminaWarningT = 90;
      sndStaminaOut();
    }
  } else {
    // 松开就立即回满并解锁
    state.stamina = MAX_STAMINA;
    state.staminaLocked = false;
    if (state.staminaEmpty) {
      state.staminaEmpty = false;
    }
  }
  if (state.staminaWarningT > 0) state.staminaWarningT--;
}
