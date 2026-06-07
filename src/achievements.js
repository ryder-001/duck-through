// === 成就系统 ===
import { state } from './state.js';
import { ACHIEVEMENT_DEFS } from './config.js';
import { sndAchieve } from './audio.js';

const STORAGE_KEY = 'dd_achievements';

// 从 localStorage 加载已解锁的成就
function loadAchievements() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

function saveAchievements(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const unlocked = loadAchievements();

export function isUnlocked(id) {
  return !!unlocked[id];
}

export function getUnlockedList() {
  return ACHIEVEMENT_DEFS.filter(a => unlocked[a.id]);
}

export function getLockedList() {
  return ACHIEVEMENT_DEFS.filter(a => !unlocked[a.id]);
}

function unlock(id) {
  if (unlocked[id]) return;
  unlocked[id] = { time: Date.now() };
  saveAchievements(unlocked);
  const def = ACHIEVEMENT_DEFS.find(a => a.id === id);
  if (def) {
    state.achieveShowT = 150;
    state.achieveShowData = def;
    sndAchieve();
    // 奖励金币
    state.totalCoins += 10;
    localStorage.setItem('dd_totalCoins', state.totalCoins.toString());
  }
}

// 每帧检查成就条件
export function checkAchievements() {
  // 第一步：通过第一个门
  if (state.score >= 1) unlock('first_door');

  // 连续5次
  if (state.combo >= 5) unlock('combo_5');

  // 金币猎人：累计50金币
  if (state.totalCoins >= 50) unlock('coin_50');

  // 完美通关：一关内不撞任何东西（关卡升级时检测）
  // 在 obstacles.js 的关卡升级逻辑中调用 checkPerfectLevel

  // 体力大师：体力耗尽后仍安全通过一扇门
  // 在 update 中当 staminaEmpty && 通过门时触发

  // 摘星达人
  if (state.starCnt >= 10) unlock('all_stars');

  // 派对达人
  if (state.lvl >= 5) unlock('party');

  // 弹窗计时
  if (state.achieveShowT > 0) state.achieveShowT--;
}

export function checkPerfectLevel() {
  if (!state.levelDamaged) unlock('perfect_level');
}

export function checkStaminaMaster() {
  if (state.staminaEmpty) unlock('stamina_master');
}
