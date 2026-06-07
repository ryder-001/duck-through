// === 渲染调度入口 ===
import { state, objects } from '../state.js';
import { drawBG } from './background.js';
import { drawDoor, drawLamp, drawCoin, drawStar } from './door.js';
import { drawChar } from './character.js';
import { drawParticles, drawTexts } from './effects.js';
import { drawHUD, drawBanner } from './hud.js';

export function draw(ctx, W, H, ground) {
  ctx.save();
  if (state.shakeT > 0) {
    ctx.translate(Math.random() * 6 - 3, Math.random() * 6 - 3);
  }

  drawBG(ctx, W, H, ground);

  for (const la of objects.lamps) drawLamp(ctx, la);
  for (const d of objects.doors) drawDoor(ctx, d, ground);
  for (const c of objects.coins) drawCoin(ctx, c);
  for (const s of objects.stars) drawStar(ctx, s);
  drawChar(ctx, ground);
  drawParticles(ctx);
  drawTexts(ctx);
  drawHUD(ctx, W, H, ground);
  drawBanner(ctx, W, H);

  ctx.restore();
}
