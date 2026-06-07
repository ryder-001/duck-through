// === 角色渲染 ===
import { state } from '../state.js';
import { SON_H, SON_DK } from '../config.js';
import { getActiveSkin } from '../skins.js';

export function drawChar(ctx, ground) {
  const skin = getActiveSkin();
  const baseY = ground, cx = state.dadX, wk = Math.sin(state.frame * 0.1);
  if (state.invT > 0 && Math.floor(state.invT / 4) % 2 === 0) return;
  const legSwing = wk * 6;

  // 爸爸腿
  ctx.fillStyle = skin.colors.pants;
  ctx.beginPath();
  ctx.moveTo(cx - 8, baseY - 40); ctx.lineTo(cx - 10 - legSwing, baseY - 5);
  ctx.lineTo(cx - 2 - legSwing, baseY - 5); ctx.lineTo(cx - 2, baseY - 40); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 2, baseY - 40); ctx.lineTo(cx + 2 + legSwing, baseY - 5);
  ctx.lineTo(cx + 10 + legSwing, baseY - 5); ctx.lineTo(cx + 8, baseY - 40); ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.ellipse(cx - 7 - legSwing, baseY - 3, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 7 + legSwing, baseY - 3, 8, 4, 0, 0, Math.PI * 2); ctx.fill();

  // 爸爸身体
  const bodyBot = baseY - 40, bodyTop = bodyBot - 75;
  ctx.fillStyle = skin.colors.dad;
  ctx.beginPath();
  ctx.moveTo(cx - 20, bodyBot);
  ctx.quadraticCurveTo(cx - 24, bodyBot - 30, cx - 22, bodyTop + 10);
  ctx.quadraticCurveTo(cx, bodyTop - 5, cx + 22, bodyTop + 10);
  ctx.quadraticCurveTo(cx + 24, bodyBot - 30, cx + 20, bodyBot);
  ctx.closePath(); ctx.fill();

  // 领口
  ctx.fillStyle = darkenColor(skin.colors.dad, 20);
  ctx.beginPath();
  ctx.moveTo(cx - 8, bodyTop + 10); ctx.lineTo(cx, bodyTop + 16);
  ctx.lineTo(cx + 8, bodyTop + 10); ctx.lineTo(cx, bodyTop + 5);
  ctx.closePath(); ctx.fill();

  // 手臂(扶着儿子腿)
  ctx.strokeStyle = skin.colors.dad; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx - 22, bodyTop + 18);
  ctx.quadraticCurveTo(cx - 32, bodyTop + 40, cx - 18, bodyTop + 55); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 22, bodyTop + 18);
  ctx.quadraticCurveTo(cx + 32, bodyTop + 40, cx + 18, bodyTop + 55); ctx.stroke();
  ctx.fillStyle = '#f0ba8a';
  ctx.beginPath(); ctx.arc(cx - 18, bodyTop + 55, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 18, bodyTop + 55, 5, 0, Math.PI * 2); ctx.fill();

  // === 儿子(在爸爸头后面) ===
  const shoulderY = bodyTop - 5;
  drawSon(ctx, cx, shoulderY, skin);

  // === 爸爸头(最前面) ===
  drawDadHead(ctx, cx, bodyTop);
}

function drawSon(ctx, cx, shoulderY, skin) {
  const isDuck = state.isDuck;
  // 儿子腿(骑跨)
  ctx.fillStyle = '#3d6b3d';
  ctx.fillRect(cx - 16, shoulderY, 9, 28);
  ctx.fillRect(cx + 7, shoulderY, 9, 28);
  ctx.fillStyle = '#e67e22';
  ctx.beginPath(); ctx.ellipse(cx - 12, shoulderY + 30, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 12, shoulderY + 30, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
  // 儿子身体
  const sonBot = shoulderY;
  const sonH2 = isDuck ? SON_DK : SON_H;
  const sonTop = sonBot - sonH2 + 10;
  ctx.fillStyle = skin.colors.son;
  if (isDuck) {
    ctx.beginPath(); ctx.ellipse(cx, sonBot - 12, 16, 11, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(cx - 14, sonBot);
    ctx.quadraticCurveTo(cx - 16, sonTop + 8, cx - 12, sonTop + 3);
    ctx.quadraticCurveTo(cx, sonTop - 4, cx + 12, sonTop + 3);
    ctx.quadraticCurveTo(cx + 16, sonTop + 8, cx + 14, sonBot);
    ctx.closePath(); ctx.fill();
  }
  // 儿子手臂
  if (!isDuck) {
    ctx.strokeStyle = '#f0ba8a'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - 12, sonTop + 15); ctx.lineTo(cx - 18, sonTop + 28); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 12, sonTop + 15); ctx.lineTo(cx + 18, sonTop + 28); ctx.stroke();
  }
  // 儿子脖子
  if (!isDuck) { ctx.fillStyle = '#f0ba8a'; ctx.fillRect(cx - 4, sonTop - 8, 8, 12); }
  // 儿子头
  const sHY = isDuck ? sonBot - 24 : sonTop - 18;
  ctx.fillStyle = '#f0ba8a';
  if (isDuck) {
    ctx.beginPath(); ctx.ellipse(cx, sHY, 13, 10, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(cx, sHY, 14, 0, Math.PI * 2); ctx.fill();
  }
  // 头发
  ctx.fillStyle = '#5c3317';
  if (isDuck) {
    ctx.beginPath(); ctx.ellipse(cx, sHY - 5, 12, 7, 0, Math.PI, 2 * Math.PI); ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(cx, sHY - 5, 14, Math.PI, 2 * Math.PI); ctx.fill();
    ctx.fillRect(cx - 12, sHY - 10, 24, 6);
    ctx.strokeStyle = '#5c3317'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx - 2, sHY - 14);
    ctx.quadraticCurveTo(cx, sHY - 24, cx + 5, sHY - 20); ctx.stroke();
  }
  // 耳朵
  if (!isDuck) {
    ctx.fillStyle = '#e8a878';
    ctx.beginPath(); ctx.ellipse(cx - 13, sHY + 1, 4, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 13, sHY + 1, 4, 5, 0, 0, Math.PI * 2); ctx.fill();
  }
  // 眼睛
  if (isDuck) {
    ctx.strokeStyle = '#333'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(cx - 6, sHY); ctx.lineTo(cx - 2, sHY + 1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 2, sHY); ctx.lineTo(cx + 6, sHY + 1); ctx.stroke();
  } else {
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.arc(cx - 5, sHY + 1, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 5, sHY + 1, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx - 4, sHY, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 6, sHY, 1.2, 0, Math.PI * 2); ctx.fill();
    // 腮红
    ctx.fillStyle = 'rgba(255,120,120,0.3)';
    ctx.beginPath(); ctx.arc(cx - 9, sHY + 5, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 9, sHY + 5, 5, 0, Math.PI * 2); ctx.fill();
  }
  // 嘴
  ctx.strokeStyle = isDuck ? '#666' : '#a06040'; ctx.lineWidth = 1.8;
  if (isDuck) {
    ctx.beginPath(); ctx.moveTo(cx - 4, sHY + 6); ctx.lineTo(cx + 4, sHY + 5); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(cx, sHY + 6, 5, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
  }
}

function drawDadHead(ctx, cx, bodyTop) {
  ctx.fillStyle = '#f0ba8a'; ctx.fillRect(cx - 6, bodyTop - 10, 12, 15);
  const headY = bodyTop - 28;
  ctx.fillStyle = '#f0ba8a';
  ctx.beginPath(); ctx.arc(cx, headY, 18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2c2014';
  ctx.beginPath(); ctx.arc(cx, headY - 4, 18, Math.PI, 2 * Math.PI); ctx.fill();
  ctx.fillRect(cx - 16, headY - 8, 32, 8);
  // 耳朵
  ctx.fillStyle = '#e8a878';
  ctx.beginPath(); ctx.ellipse(cx - 17, headY + 2, 5, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 17, headY + 2, 5, 7, 0, 0, Math.PI * 2); ctx.fill();
  // 眼睛
  ctx.fillStyle = '#333';
  ctx.beginPath(); ctx.arc(cx - 6, headY + 2, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 6, headY + 2, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(cx - 5, headY + 1, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 7, headY + 1, 1.2, 0, Math.PI * 2); ctx.fill();
  // 眉毛
  ctx.strokeStyle = '#2c2014'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(cx - 10, headY - 4); ctx.lineTo(cx - 3, headY - 5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 3, headY - 5); ctx.lineTo(cx + 10, headY - 4); ctx.stroke();
  // 鼻子
  ctx.fillStyle = '#e0a070';
  ctx.beginPath(); ctx.moveTo(cx, headY + 4); ctx.lineTo(cx - 3, headY + 10); ctx.lineTo(cx + 3, headY + 10); ctx.fill();
  // 嘴
  ctx.strokeStyle = '#a06040'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, headY + 13, 6, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
}

function darkenColor(hex, amount) {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `rgb(${r},${g},${b})`;
}
