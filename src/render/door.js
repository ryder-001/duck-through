// === 门渲染 ===
import { state, objects } from '../state.js';
import { DW } from '../config.js';

export function drawDoor(ctx, d, ground) {
  const theme = state.theme;
  const doorTop = ground - d.h, doorW = DW, frameW = 10;
  // 墙壁
  ctx.fillStyle = theme.accent;
  ctx.fillRect(d.x - 40, 0, 40, ground);
  ctx.fillRect(d.x + doorW, 0, 40, ground);
  ctx.fillRect(d.x - frameW, 0, doorW + frameW * 2, doorTop - frameW);
  // 门洞内部(深色纵深)
  const grad = ctx.createLinearGradient(d.x, doorTop, d.x, ground);
  grad.addColorStop(0, '#4a3a2a'); grad.addColorStop(0.5, '#5a4a38'); grad.addColorStop(1, '#3a2a1a');
  ctx.fillStyle = grad; ctx.fillRect(d.x, doorTop, doorW, d.h);
  ctx.fillStyle = 'rgba(100,80,60,0.5)'; ctx.fillRect(d.x + 5, ground - 15, doorW - 10, 15);
  // 门框
  ctx.fillStyle = theme.doorColor;
  ctx.fillRect(d.x - frameW, doorTop - frameW, frameW, d.h + frameW);
  ctx.fillRect(d.x + doorW, doorTop - frameW, frameW, d.h + frameW);
  ctx.fillRect(d.x - frameW, doorTop - frameW, doorW + frameW * 2, frameW);
  // 门框厚度阴影
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(d.x, doorTop, 5, d.h); ctx.fillRect(d.x + doorW - 5, doorTop, 5, d.h);
  ctx.fillRect(d.x, doorTop, doorW, 6);
  // 门框高光
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(d.x - frameW, doorTop - frameW, 3, d.h + frameW);
  ctx.fillRect(d.x - frameW, doorTop - frameW, doorW + frameW * 2, 3);
  // 门框木纹
  ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth = 1;
  for (let y = doorTop; y < ground; y += 15) {
    ctx.beginPath(); ctx.moveTo(d.x - frameW + 2, y); ctx.lineTo(d.x - 2, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(d.x + doorW + 2, y); ctx.lineTo(d.x + doorW + frameW - 2, y); ctx.stroke();
  }
  // 半开门板(透视)
  ctx.fillStyle = '#b8845a';
  ctx.beginPath();
  ctx.moveTo(d.x + doorW - 2, doorTop + 2); ctx.lineTo(d.x + doorW - 25, doorTop + 8);
  ctx.lineTo(d.x + doorW - 25, ground); ctx.lineTo(d.x + doorW - 2, ground);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#a07040';
  const pH = (d.h - 40) / 2;
  ctx.fillRect(d.x + doorW - 23, doorTop + 16, 18, pH);
  ctx.fillRect(d.x + doorW - 23, doorTop + pH + 28, 18, pH);
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(d.x + doorW - 23, doorTop + 16, 18, 3);
  ctx.fillRect(d.x + doorW - 23, doorTop + pH + 28, 18, 3);
  const hy = doorTop + d.h * 0.5;
  ctx.fillStyle = '#d4af37';
  ctx.beginPath(); ctx.arc(d.x + doorW - 26, hy, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath(); ctx.arc(d.x + doorW - 27, hy - 1, 1.5, 0, Math.PI * 2); ctx.fill();
}

export function drawLamp(ctx, la) {
  const sx = Math.sin(la.swing) * 10, lx = la.x + sx;
  ctx.strokeStyle = '#777'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(la.x, 0); ctx.lineTo(lx, la.hangH - 22); ctx.stroke();
  ctx.fillStyle = la.hit ? '#999' : '#f4d03f';
  ctx.beginPath();
  ctx.moveTo(lx - 16, la.hangH - 22); ctx.lineTo(lx + 16, la.hangH - 22);
  ctx.lineTo(lx + 11, la.hangH); ctx.lineTo(lx - 11, la.hangH);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = la.hit ? '#666' : '#c9a80d'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = la.hit ? '#aaa' : '#fff8dc';
  ctx.beginPath(); ctx.arc(lx, la.hangH + 4, 5, 0, Math.PI * 2); ctx.fill();
  if (!la.hit) {
    ctx.fillStyle = 'rgba(255,250,200,0.12)';
    ctx.beginPath(); ctx.arc(lx, la.hangH + 10, 30, 0, Math.PI * 2); ctx.fill();
  }
}

export function drawCoin(ctx, c) {
  if (c.got) return;
  c.t += 0.05;
  const scale = Math.abs(Math.cos(c.t));
  ctx.fillStyle = '#f1c40f';
  ctx.beginPath(); ctx.ellipse(c.x, c.y, 10 * scale, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#d4ac0d'; ctx.lineWidth = 1.5; ctx.stroke();
  if (scale > 0.3) {
    ctx.fillStyle = '#b8860b'; ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center'; ctx.fillText('¥', c.x, c.y + 4); ctx.textAlign = 'left';
  }
}

export function drawStar(ctx, s) {
  if (s.got) return;
  s.t += 0.04;
  const bounce = Math.sin(s.t) * 3;
  const y = s.y + bounce;
  // 发光效果
  ctx.fillStyle = 'rgba(255,215,0,0.2)';
  ctx.beginPath(); ctx.arc(s.x, y, 18, 0, Math.PI * 2); ctx.fill();
  // 星星
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const x2 = s.x + Math.cos(angle) * 12;
    const y2 = y + Math.sin(angle) * 12;
    if (i === 0) ctx.moveTo(x2, y2); else ctx.lineTo(x2, y2);
  }
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#DAA520'; ctx.lineWidth = 1; ctx.stroke();
}
