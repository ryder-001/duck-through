// === 障碍生成和碰撞检测 ===
import { state, objects } from './state.js';
import { DW, CW, VISUAL_STAND_H, VISUAL_DUCK_H, LPL, THEMES, LEVEL_STORIES, getLevelConfig } from './config.js';
import { sndPass, sndCoin, sndStar, sndLevelUp, sndHit, playVoice, SCENE_KEYS } from './audio.js';
import { addParticles, addText } from './render/effects.js';

let W = () => window.innerWidth;
let ground = () => window.innerHeight * 0.82;

export function totH() {
  return state.isDuck ? VISUAL_DUCK_H : VISUAL_STAND_H;
}

export function spawnDoor() {
  const c = getLevelConfig(state.lvl);
  const w = W(), g = ground();
  let h;
  if (Math.random() < c.shortChance) {
    h = c.shortMin + Math.random() * (c.shortMax - c.shortMin);
  } else {
    h = c.tallMin + Math.random() * (c.tallMax - c.tallMin);
  }

  const door = { x: w + 100, h, passed: false };
  objects.doors.push(door);

  // 金币（50%概率）
  if (Math.random() < 0.5) {
    objects.coins.push({
      x: w + 100 + DW / 2,
      y: g - h - 30 - Math.random() * 35,
      got: false,
      t: Math.random() * 6.28,
    });
  }

  // 高门星星：门洞足够高（站着能过）时，门顶挂星星
  if (h >= VISUAL_STAND_H && Math.random() < c.starChance) {
    objects.stars.push({
      x: w + 100 + DW / 2,
      y: g - h - 20,
      got: false,
      doorIdx: objects.doors.length - 1,
      t: Math.random() * 6.28,
    });
  }

  // 灯障碍
  if (Math.random() < c.obs) {
    const lx = w + 100 + c.gMin * 0.4 + Math.random() * 80;
    objects.lamps.push({
      x: lx,
      hangH: g * (0.32 + Math.random() * 0.15),
      hit: false,
      swing: Math.random() * 6.28,
    });
  }

  // 关卡升级
  state.lvlProg++;
  if (state.lvlProg >= LPL) {
    state.lvlProg = 0;
    state.lvl++;
    state.levelDamaged = false;
    state.theme = THEMES[(state.lvl - 1) % THEMES.length];
    state.bannerT = 120;
    state.bannerTxt = '第' + state.lvl + '关 · ' + state.theme.n;
    sndLevelUp();

    // 剧情文字
    const storyIdx = Math.min(state.lvl - 1, LEVEL_STORIES.length - 1);
    state.storyT = 180;
    state.storyTxt = LEVEL_STORIES[storyIdx];

    setTimeout(() => playVoice(SCENE_KEYS[(state.lvl - 1) % SCENE_KEYS.length]), 300);
  }
}

// === 碰撞检测 ===
export function hitDoor(d) {
  const t = totH(), g = ground();
  const charTop = g - t;
  const cl = state.dadX - CW / 2, cr = state.dadX + CW / 2;
  return cr > d.x && cl < d.x + DW && charTop < g - d.h;
}

export function hitLamp(la) {
  const t = totH(), g = ground();
  const top = g - t;
  const cl = state.dadX - CW / 2, cr = state.dadX + CW / 2;
  const lx = la.x + Math.sin(la.swing) * 10;
  return cr > lx - 16 && cl < lx + 16 && top < la.hangH;
}

export function hitCoin(c) {
  const g = ground();
  const headY = g - totH() + 10;
  const dx = state.dadX - c.x, dy = headY - c.y;
  return Math.sqrt(dx * dx + dy * dy) < 28;
}

export function hitStar(s) {
  // 只有站立时能碰到星星（头顶位置）
  if (state.isDuck) return false;
  const g = ground();
  const headY = g - totH() + 10;
  const dx = state.dadX - s.x, dy = headY - s.y;
  return Math.sqrt(dx * dx + dy * dy) < 32;
}

export function takeDamage() {
  if (state.invT > 0) return;
  state.lives--;
  state.combo = 0;
  state.shakeT = 15;
  state.invT = 90;
  state.levelDamaged = true;
  sndHit();
  addParticles(state.dadX, ground() - totH(), '#ff4444', 8);
  if (state.lives <= 0) return true; // 表示游戏结束
  return false;
}
