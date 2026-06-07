// === 商店和VIP系统 ===
import { state } from './state.js';

const VIP_KEY = 'dd_vip';

export function isVIP() {
  return localStorage.getItem(VIP_KEY) === '1';
}

export function activateVIP() {
  localStorage.setItem(VIP_KEY, '1');
}

export function deactivateVIP() {
  localStorage.removeItem(VIP_KEY);
}

// VIP 特权检查
export function getMaxLives() {
  return isVIP() ? 99 : 3;
}

export function getCoinMultiplier() {
  return isVIP() ? 2 : 1;
}

// 非VIP在第3关弹出引导
export function shouldShowVIPPrompt() {
  return !isVIP() && state.lvl >= 3 && state.lvlProg === 0;
}
