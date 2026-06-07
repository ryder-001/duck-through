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
      state.staminaEmpty = true;
      state.staminaWarningT = 90;
      sndStaminaOut();
    }
  } else {
    // 松开就立即回满
    state.stamina = MAX_STAMINA;
    if (state.staminaEmpty && state.stamina >= MAX_STAMINA) {
      state.staminaEmpty = false;
    }
  }
  if (state.staminaWarningT > 0) state.staminaWarningT--;
}
