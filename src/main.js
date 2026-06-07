// === 游戏主入口 ===
import { state, objects, resetState, hi, setHi } from './state.js';
import { getLevelConfig, DW, CW, LEVEL_STORIES } from './config.js';
import { initAudio, sndDuck, sndPass, sndCoin, sndStar, playVoice, startBGM, stopBGM } from './audio.js';
import { setupInput } from './input.js';
import { updateStamina } from './stamina.js';
import { spawnDoor, hitDoor, hitLamp, hitCoin, hitStar, takeDamage, totH } from './obstacles.js';
import { checkAchievements, checkStaminaMaster, checkPerfectLevel } from './achievements.js';
import { updateDailyProgress } from './daily.js';
import { getCoinMultiplier } from './shop.js';
import { addParticles, addText } from './render/effects.js';
import { draw } from './render/index.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');

let W, H, ground;
function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  ground = H * 0.82;
}
resize();
window.addEventListener('resize', resize);

setupInput(canvas);

// === 游戏更新 ===
function update() {
  if (!state.running) return;
  state.frame++;
  if (state.isDuck && !state.wasDuck) sndDuck();
  state.wasDuck = state.isDuck;
  updateStamina();

  const c = getLevelConfig(state.lvl);
  state.spd = c.spd;
  if (state.invT > 0) state.invT--;
  if (state.shakeT > 0) state.shakeT--;
  if (state.bannerT > 0) state.bannerT--;
  if (state.storyT > 0) state.storyT--;

  const mult = getCoinMultiplier();

  // 门更新
  for (let i = objects.doors.length - 1; i >= 0; i--) {
    objects.doors[i].x -= state.spd;
    if (!objects.doors[i].passed && objects.doors[i].x + DW < state.dadX - CW / 2) {
      objects.doors[i].passed = true;
      state.score++;
      state.combo++;
      sndPass();
      if (state.staminaEmpty) checkStaminaMaster();
      addText(state.dadX, ground - totH() - 20,
        state.combo > 1 ? '+1 x' + state.combo : '+1', '#27ae60');
      if (state.combo > 2) state.score += state.combo - 2;
    }
    if (objects.doors[i].x < -DW - 100) objects.doors.splice(i, 1);
  }

  // 金币更新
  for (let i = objects.coins.length - 1; i >= 0; i--) {
    objects.coins[i].x -= state.spd;
    if (!objects.coins[i].got && hitCoin(objects.coins[i])) {
      objects.coins[i].got = true;
      state.coinCnt += mult;
      state.totalCoins += mult;
      localStorage.setItem('dd_totalCoins', state.totalCoins.toString());
      state.score += 3 * mult;
      sndCoin();
      addParticles(objects.coins[i].x, objects.coins[i].y, '#f1c40f', 6);
      addText(objects.coins[i].x, objects.coins[i].y - 15, '+' + (3 * mult), '#f1c40f');
    }
    if (objects.coins[i].x < -20) objects.coins.splice(i, 1);
  }

  // 星星更新（高门星星）
  for (let i = objects.stars.length - 1; i >= 0; i--) {
    objects.stars[i].x -= state.spd;
    if (!objects.stars[i].got && hitStar(objects.stars[i])) {
      objects.stars[i].got = true;
      state.starCnt++;
      state.totalStars++;
      localStorage.setItem('dd_totalStars', state.totalStars.toString());
      state.score += 5;
      sndStar();
      addParticles(objects.stars[i].x, objects.stars[i].y, '#FFD700', 8);
      addText(objects.stars[i].x, objects.stars[i].y - 15, '⭐+1', '#FFD700');
    }
    if (objects.stars[i].x < -20) objects.stars.splice(i, 1);
  }

  // 灯更新
  for (let i = objects.lamps.length - 1; i >= 0; i--) {
    objects.lamps[i].x -= state.spd;
    objects.lamps[i].swing += 0.03;
    if (!objects.lamps[i].hit && hitLamp(objects.lamps[i])) {
      objects.lamps[i].hit = true;
      if (takeDamage()) { gameOver(); return; }
      addText(objects.lamps[i].x, objects.lamps[i].hangH, '撞灯了!', '#e74c3c');
    }
    if (objects.lamps[i].x < -40) objects.lamps.splice(i, 1);
  }

  // 门碰撞检测
  for (const d of objects.doors) {
    if (!d.passed && hitDoor(d)) {
      d.passed = true;
      state.combo = 0;
      if (takeDamage()) { gameOver(); return; }
      addText(state.dadX, ground - totH() - 20, '撞门框!', '#e74c3c');
    }
  }

  // 生成新门
  const last = objects.doors[objects.doors.length - 1];
  const gap = c.gMin + Math.random() * (c.gMax - c.gMin);
  if (!last || last.x < W - gap) spawnDoor();

  // 每日任务进度和成就检查
  updateDailyProgress();
  checkAchievements();
}

// === 游戏循环 ===
function loop() {
  if (!state.running) return;
  update();
  draw(ctx, W, H, ground);
  requestAnimationFrame(loop);
}

// === 开始游戏 ===
function startGame() {
  initAudio();
  resetState();
  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  stopBGM();
  startBGM(() => state.running);
  setTimeout(() => playVoice('start'), 300);
  setTimeout(() => playVoice('scene1'), 1500);
  state.storyT = 180;
  state.storyTxt = LEVEL_STORIES[0];
  spawnDoor();
  loop();
}

// === 游戏结束 ===
function gameOver() {
  state.running = false;
  stopBGM();
  if (state.score > hi) { setHi(state.score); }
  document.getElementById('finalScore').textContent = state.score;
  document.getElementById('highScore').textContent = hi;
  gameOverScreen.classList.remove('hidden');
  playVoice('gameover');
}

// === UI事件绑定 ===
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

// 商店和每日任务的UI逻辑单独放在 ui.js
import './ui.js';
