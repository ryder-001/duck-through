// === 皮肤系统 ===
import { state } from './state.js';
import { SKIN_DEFS } from './config.js';

const STORAGE_KEY = 'dd_skins';

function loadSkinData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

function saveSkinData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let skinData = loadSkinData();

// 默认皮肤始终解锁
if (!skinData.owned) skinData.owned = ['default'];
if (!skinData.active) skinData.active = 'default';
saveSkinData(skinData);

export function getActiveSkin() {
  return SKIN_DEFS.find(s => s.id === skinData.active) || SKIN_DEFS[0];
}

export function getOwnedSkins() {
  return skinData.owned;
}

export function isSkinOwned(id) {
  return skinData.owned.includes(id);
}

export function buySkin(id) {
  const def = SKIN_DEFS.find(s => s.id === id);
  if (!def || isSkinOwned(id)) return false;
  if (state.totalStars < def.cost) return false;
  state.totalStars -= def.cost;
  localStorage.setItem('dd_totalStars', state.totalStars.toString());
  skinData.owned.push(id);
  saveSkinData(skinData);
  return true;
}

export function setActiveSkin(id) {
  if (!isSkinOwned(id)) return false;
  skinData.active = id;
  saveSkinData(skinData);
  return true;
}
