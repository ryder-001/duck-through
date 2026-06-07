// === 背景渲染 ===
import { state } from '../state.js';

export function drawBG(ctx, W, H, ground) {
  const theme = state.theme;
  ctx.fillStyle = theme.wall;
  ctx.fillRect(0, 0, W, ground);
  ctx.fillStyle = theme.floor;
  ctx.fillRect(0, ground, W, H - ground);
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 80) {
    ctx.beginPath(); ctx.moveTo(x, ground); ctx.lineTo(x, H); ctx.stroke();
  }
  ctx.fillStyle = theme.frameColor;
  ctx.fillRect(0, ground - 6, W, 6);
}
