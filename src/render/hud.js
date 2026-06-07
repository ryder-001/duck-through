// === HUD渲染 ===
import { state } from '../state.js';
import { MAX_STAMINA } from '../config.js';

export function drawHUD(ctx, W, H, ground) {
  // 左上角信息面板
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath(); ctx.roundRect(12, 12, 200, 80, 10); ctx.fill();
  ctx.strokeStyle = '#e0d5c5'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#e67e22'; ctx.font = 'bold 24px Arial';
  ctx.fillText('⭐ ' + state.score, 25, 42);
  ctx.fillStyle = '#888'; ctx.font = '14px Arial';
  ctx.fillText('第' + state.lvl + '关 · ' + state.theme.n, 25, 62);
  ctx.fillStyle = '#f1c40f'; ctx.font = '14px Arial';
  ctx.fillText('🪙 ' + state.coinCnt + '  ⭐ ' + state.starCnt, 25, 82);
  if (state.combo > 1) {
    ctx.fillStyle = '#e74c3c'; ctx.font = 'bold 14px Arial';
    ctx.fillText('🔥x' + state.combo, 130, 42);
  }

  // 右上角生命
  ctx.font = '22px Arial';
  for (let i = 0; i < 3; i++) ctx.fillText(i < state.lives ? '❤️' : '🖤', W - 100 + i * 28, 35);

  // 低头状态指示
  if (state.isDuck) {
    ctx.fillStyle = 'rgba(46,204,113,0.9)';
    ctx.beginPath(); ctx.roundRect(W - 110, 50, 95, 30, 8); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px Arial';
    ctx.fillText('⬇ 低头中', W - 100, 70);
  }

  // === 体力条 ===
  drawStaminaBar(ctx, W);

  // === 体力耗尽警告 ===
  if (state.staminaWarningT > 0) {
    const alpha = Math.min(1, state.staminaWarningT / 30);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(231,76,60,0.9)';
    ctx.beginPath(); ctx.roundRect(W / 2 - 120, H / 2 - 25, 240, 50, 10); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center';
    ctx.fillText('累了！站起来休息一下', W / 2, H / 2 + 5);
    ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  }

  // === 剧情文字 ===
  if (state.storyT > 0) {
    drawStory(ctx, W, H);
  }

  // === 成就弹窗 ===
  if (state.achieveShowT > 0 && state.achieveShowData) {
    drawAchievePopup(ctx, W);
  }
}

function drawStaminaBar(ctx, W) {
  const barW = 120, barH = 14;
  const x = W - barW - 15, y = 88;
  const ratio = state.stamina / MAX_STAMINA;

  // 背景
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.roundRect(x, y, barW, barH, 4); ctx.fill();

  // 前景颜色（绿→黄→红）
  let color;
  if (ratio > 0.5) color = '#2ecc71';
  else if (ratio > 0.25) color = '#f39c12';
  else color = '#e74c3c';

  ctx.fillStyle = color;
  ctx.beginPath(); ctx.roundRect(x, y, barW * ratio, barH, 4); ctx.fill();

  // 边框
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(x, y, barW, barH, 4); ctx.stroke();

  // 标签
  ctx.fillStyle = '#555'; ctx.font = '10px Arial';
  ctx.fillText('体力', x, y - 3);
}

function drawStory(ctx, W, H) {
  const alpha = state.storyT > 150 ? (180 - state.storyT) / 30 :
                state.storyT > 30 ? 1 : state.storyT / 30;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.beginPath(); ctx.roundRect(W / 2 - 200, H * 0.7, 400, 50, 10); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '16px Arial'; ctx.textAlign = 'center';
  ctx.fillText(state.storyTxt, W / 2, H * 0.7 + 30);
  ctx.textAlign = 'left'; ctx.globalAlpha = 1;
}

function drawAchievePopup(ctx, W) {
  const d = state.achieveShowData;
  const alpha = state.achieveShowT > 120 ? (150 - state.achieveShowT) / 30 :
                state.achieveShowT > 30 ? 1 : state.achieveShowT / 30;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(255,215,0,0.95)';
  ctx.beginPath(); ctx.roundRect(W / 2 - 140, 120, 280, 60, 12); ctx.fill();
  ctx.strokeStyle = '#DAA520'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#333'; ctx.font = 'bold 18px Arial'; ctx.textAlign = 'center';
  ctx.fillText('🏆 成就解锁！', W / 2, 147);
  ctx.fillStyle = '#555'; ctx.font = '14px Arial';
  ctx.fillText(d.icon + ' ' + d.name + ' — ' + d.desc, W / 2, 168);
  ctx.textAlign = 'left'; ctx.globalAlpha = 1;
}

export function drawBanner(ctx, W, H) {
  if (state.bannerT <= 0) return;
  const alpha = state.bannerT > 100 ? (120 - state.bannerT) / 20 :
                state.bannerT > 20 ? 1 : state.bannerT / 20;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.beginPath(); ctx.roundRect(W / 2 - 160, H / 2 - 45, 320, 90, 12); ctx.fill();
  ctx.fillStyle = '#FFD700'; ctx.font = 'bold 30px Arial'; ctx.textAlign = 'center';
  ctx.fillText(state.bannerTxt, W / 2, H / 2 + 10);
  ctx.textAlign = 'left'; ctx.globalAlpha = 1;
}
