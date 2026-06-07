// === 游戏常量和配置 ===

// 角色尺寸（碰撞用）
export const DAD_H = 170;
export const SON_H = 56;
export const SON_DK = 20;
export const CW = 44;        // 碰撞宽度
export const DW = 56;        // 门宽度
export const WW = 55;        // 窗宽度
export const LPL = 6;        // 每关需要过的门数

export const VISUAL_STAND_H = 194;
export const VISUAL_DUCK_H = 135;
export const STAND_H = VISUAL_STAND_H;
export const DUCK_H = VISUAL_DUCK_H;

// 体力条配置
export const MAX_STAMINA = 100;
export const STAMINA_DRAIN = 0.5;  // 低头每帧消耗（满体力可持续低头约12秒）
export const STAMINA_REGEN = 2;    // 不低头每帧回复（约3秒回满）

// 房间主题
export const THEMES = [
  { n: '客厅', wall: '#faf6f0', floor: '#d4a574', accent: '#e8ddd0', doorColor: '#8B4513', frameColor: '#fff' },
  { n: '卧室', wall: '#e8f0f8', floor: '#c4a882', accent: '#d0ddef', doorColor: '#6b4423', frameColor: '#f8f8ff' },
  { n: '厨房', wall: '#fff8ee', floor: '#b8b8b8', accent: '#f5ece0', doorColor: '#a0a0a0', frameColor: '#e0e0e0' },
  { n: '书房', wall: '#f2ede4', floor: '#7a5c3a', accent: '#e0d8c8', doorColor: '#5c3d1e', frameColor: '#d4c4a8' },
  { n: '后院🎉', wall: '#e8f5e9', floor: '#8bc34a', accent: '#c8e6c9', doorColor: '#795548', frameColor: '#fff9c4' },
];

// 关卡剧情
export const LEVEL_STORIES = [
  '爸爸扛起儿子：走，去后院参加生日派对！',
  '穿过卧室，小心别碰到妈妈的花瓶！',
  '厨房好香啊，蛋糕已经做好了！',
  '书房里安静点，别打扰到猫咪！',
  '到了到了！生日快乐！🎂🎈',
];

// 成就定义
export const ACHIEVEMENT_DEFS = [
  { id: 'first_door', name: '第一步', desc: '通过第一个门洞', icon: '🚪' },
  { id: 'combo_5', name: '连续5次', desc: '连续通过5个门不撞', icon: '🔥' },
  { id: 'coin_50', name: '金币猎人', desc: '累计收集50个金币', icon: '🪙' },
  { id: 'perfect_level', name: '完美通关', desc: '一关内不撞任何东西', icon: '✨' },
  { id: 'stamina_master', name: '体力大师', desc: '体力耗尽后仍安全通过一扇门', icon: '💪' },
  { id: 'all_stars', name: '摘星达人', desc: '收集10颗星星', icon: '⭐' },
  { id: 'party', name: '派对达人', desc: '到达后院生日派对', icon: '🎂' },
];

// 皮肤定义
export const SKIN_DEFS = [
  { id: 'default', name: '默认', cost: 0, colors: { dad: '#5b8fb9', son: '#e74c3c', pants: '#3a3a3a' } },
  { id: 'superman', name: '超人爸爸', cost: 30, colors: { dad: '#1a47b8', son: '#e74c3c', pants: '#1a47b8' } },
  { id: 'princess', name: '公主女儿', cost: 50, colors: { dad: '#6b4c9a', son: '#ff69b4', pants: '#4a4a6a' } },
];

// 关卡配置函数
export function getLevelConfig(lvl) {
  const tallMin = STAND_H + 4, tallMax = STAND_H + 30;
  const shortMin = Math.max(DUCK_H + 8, DUCK_H + 25 - lvl * 2);
  const shortMax = STAND_H - 4;
  return {
    spd: 2.8 + lvl * 0.5,
    tallMin, tallMax, shortMin, shortMax,
    gMin: Math.max(200, 330 - lvl * 14),
    gMax: Math.max(300, 450 - lvl * 14),
    obs: Math.min(0.45, 0.05 + lvl * 0.06),
    shortChance: Math.min(0.7, 0.35 + lvl * 0.05),
    starChance: 0.4,  // 高门出现星星的概率
  };
}
