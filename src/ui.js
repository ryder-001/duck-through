// === UI交互（商店、每日任务） ===
import { state } from './state.js';
import { SKIN_DEFS } from './config.js';
import { getActiveSkin, getOwnedSkins, isSkinOwned, buySkin, setActiveSkin } from './skins.js';
import { getDailyTasks, isAllDone, isDailyClaimed, claimDailyReward } from './daily.js';
import { isVIP, activateVIP } from './shop.js';

const startScreen = document.getElementById('startScreen');
const shopScreen = document.getElementById('shopScreen');
const dailyScreen = document.getElementById('dailyScreen');

// === 商店 ===
document.getElementById('shopBtn').addEventListener('click', () => {
  startScreen.classList.add('hidden');
  shopScreen.classList.remove('hidden');
  renderShop();
});

document.getElementById('shopBackBtn').addEventListener('click', () => {
  shopScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
});

function renderShop() {
  const container = document.getElementById('shopContent');
  const activeSkin = getActiveSkin();

  let html = `<p style="text-align:center;color:#888;">⭐ 我的星星: ${state.totalStars}</p>`;

  // VIP卡
  html += `<div class="vip-card">
    <h3>👑 VIP会员</h3>
    <ul>
      <li>解锁全部5个场景</li>
      <li>无限生命</li>
      <li>每日双倍金币</li>
      <li>独家皮肤</li>
    </ul>
    ${isVIP()
      ? '<p style="margin-top:10px;font-weight:bold;">✓ 已激活</p>'
      : '<button class="vip-activate" id="vipActivateBtn">体验VIP (Demo)</button>'}
  </div>`;

  // 皮肤列表
  html += '<div class="shop-section"><h2>🎨 皮肤</h2>';
  for (const skin of SKIN_DEFS) {
    const owned = isSkinOwned(skin.id);
    const active = activeSkin.id === skin.id;
    let btnHtml;
    if (active) {
      btnHtml = '<button class="skin-btn skin-btn-active" disabled>使用中</button>';
    } else if (owned) {
      btnHtml = `<button class="skin-btn skin-btn-select" data-skin="${skin.id}">选择</button>`;
    } else if (state.totalStars >= skin.cost) {
      btnHtml = `<button class="skin-btn skin-btn-buy" data-buy="${skin.id}">⭐${skin.cost} 购买</button>`;
    } else {
      btnHtml = `<button class="skin-btn skin-btn-locked" disabled>⭐${skin.cost}</button>`;
    }
    html += `<div class="skin-card">
      <div class="skin-info">
        <div class="skin-name">${skin.name}</div>
        <div class="skin-cost">${owned ? '已拥有' : '⭐' + skin.cost}</div>
      </div>
      ${btnHtml}
    </div>`;
  }
  html += '</div>';

  container.innerHTML = html;

  // 绑定事件
  const vipBtn = document.getElementById('vipActivateBtn');
  if (vipBtn) vipBtn.addEventListener('click', () => { activateVIP(); renderShop(); });

  container.querySelectorAll('[data-buy]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (buySkin(btn.dataset.buy)) renderShop();
    });
  });

  container.querySelectorAll('[data-skin]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (setActiveSkin(btn.dataset.skin)) renderShop();
    });
  });
}

// === 每日任务 ===
document.getElementById('dailyBtn').addEventListener('click', () => {
  startScreen.classList.add('hidden');
  dailyScreen.classList.remove('hidden');
  renderDaily();
});

document.getElementById('dailyBackBtn').addEventListener('click', () => {
  dailyScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
});

function renderDaily() {
  const container = document.getElementById('dailyContent');
  const tasks = getDailyTasks();
  const claimed = isDailyClaimed();

  let html = '';
  for (const task of tasks) {
    const doneClass = task.done ? ' done' : '';
    html += `<div class="daily-task${doneClass}">
      <div class="task-icon">${task.icon}</div>
      <div class="task-info">
        <div class="task-desc">${task.desc}</div>
        <div class="task-progress">${task.progress}/${task.target} ${task.done ? '✓' : ''}</div>
      </div>
    </div>`;
  }

  if (claimed) {
    html += '<button class="daily-claim" disabled>今日已领取 ✓</button>';
  } else if (isAllDone()) {
    html += '<button class="daily-claim" id="dailyClaimBtn">领取奖励 ⭐×5</button>';
  } else {
    html += '<button class="daily-claim" disabled>完成所有任务后领取</button>';
  }

  container.innerHTML = html;

  const claimBtn = document.getElementById('dailyClaimBtn');
  if (claimBtn) {
    claimBtn.addEventListener('click', () => {
      claimDailyReward();
      renderDaily();
    });
  }
}
