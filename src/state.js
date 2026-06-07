// === 游戏状态管理 ===
import { MAX_STAMINA, THEMES } from './config.js';

// 游戏核心状态
export const state = {
  running: false,
  score: 0,
  isDuck: false,
  frame: 0,
  dadX: 130,
  lives: 3,
  combo: 0,
  lvl: 1,
  lvlProg: 0,
  spd: 3,
  coinCnt: 0,
  starCnt: 0,
  wasDuck: false,
  invT: 0,
  shakeT: 0,
  bannerT: 0,
  bannerTxt: '',
  theme: THEMES[0],

  // 体力条
  stamina: MAX_STAMINA,
  staminaEmpty: false,   // 是否刚耗尽（用于成就检测）
  staminaWarningT: 0,    // 警告文字显示计时

  // 关卡剧情
  storyT: 0,
  storyTxt: '',

  // 成就弹窗
  achieveShowT: 0,
  achieveShowData: null,

  // 本关是否受伤（完美通关检测用）
  levelDamaged: false,

  // 总金币数（跨局累计，存localStorage）
  totalCoins: parseInt(localStorage.getItem('dd_totalCoins') || '0'),
  totalStars: parseInt(localStorage.getItem('dd_totalStars') || '0'),
};

// 游戏对象数组
export const objects = {
  doors: [],
  coins: [],
  lamps: [],
  stars: [],      // 高门上的星星
  particles: [],
  ftexts: [],
};

// 最高分
export let hi = parseInt(localStorage.getItem('dd11') || '0');
export function setHi(val) { hi = val; localStorage.setItem('dd11', val.toString()); }

// 重置状态（开始新游戏）
export function resetState() {
  state.running = true;
  state.score = 0;
  state.isDuck = false;
  state.frame = 0;
  state.lives = 3;
  state.combo = 0;
  state.lvl = 1;
  state.lvlProg = 0;
  state.spd = 3;
  state.coinCnt = 0;
  state.starCnt = 0;
  state.wasDuck = false;
  state.invT = 0;
  state.shakeT = 0;
  state.bannerT = 90;
  state.bannerTxt = '第1关 · 客厅';
  state.theme = THEMES[0];
  state.stamina = MAX_STAMINA;
  state.staminaEmpty = false;
  state.staminaWarningT = 0;
  state.storyT = 0;
  state.storyTxt = '';
  state.achieveShowT = 0;
  state.achieveShowData = null;
  state.levelDamaged = false;

  objects.doors = [];
  objects.coins = [];
  objects.lamps = [];
  objects.stars = [];
  objects.particles = [];
  objects.ftexts = [];
}
