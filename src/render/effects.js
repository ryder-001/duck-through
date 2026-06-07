// === 特效系统（粒子、飘浮文字） ===
import { objects } from '../state.js';

export function addParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    objects.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 6,
      vy: -Math.random() * 4 - 2,
      life: 30 + Math.random() * 20,
      color,
      size: 3 + Math.random() * 4,
    });
  }
}

export function addText(x, y, text, color) {
  objects.ftexts.push({ x, y, text, color, life: 60, vy: -2 });
}

export function drawParticles(ctx) {
  for (let i = objects.particles.length - 1; i >= 0; i--) {
    const p = objects.particles[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life--;
    if (p.life <= 0) { objects.particles.splice(i, 1); continue; }
    ctx.globalAlpha = p.life / 50;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

export function drawTexts(ctx) {
  for (let i = objects.ftexts.length - 1; i >= 0; i--) {
    const t = objects.ftexts[i];
    t.y += t.vy; t.life--;
    if (t.life <= 0) { objects.ftexts.splice(i, 1); continue; }
    ctx.globalAlpha = t.life / 60;
    ctx.fillStyle = t.color;
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(t.text, t.x, t.y);
    ctx.textAlign = 'left';
  }
  ctx.globalAlpha = 1;
}
