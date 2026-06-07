// === 每日任务系统 ===
import { state } from './state.js';

const STORAGE_KEY = 'dd_daily';

// 任务模板池
const TASK_TEMPLATES = [
  { type: 'coins', target: 10, desc: '收集{n}个金币', icon: '🪙' },
  { type: 'coins', target: 20, desc: '收集{n}个金币', icon: '🪙' },
  { type: 'doors', target: 5, desc: '通过{n}扇门', icon: '🚪' },
  { type: 'doors', target: 10, desc: '通过{n}扇门', icon: '🚪' },
  { type: 'combo', target: 3, desc: '达成{n}连击', icon: '🔥' },
  { type: 'combo', target: 5, desc: '达成{n}连击', icon: '🔥' },
  { type: 'stars', target: 3, desc: '收集{n}颗星星', icon: '⭐' },
  { type: 'stars', target: 5, desc: '收集{n}颗星星', icon: '⭐' },
];

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function generateDailyTasks() {
  // 每天随机选3个不同类型的任务
  const types = ['coins', 'doors', 'combo', 'stars'];
  const shuffled = types.sort(() => Math.random() - 0.5).slice(0, 3);
  return shuffled.map(type => {
    const pool = TASK_TEMPLATES.filter(t => t.type === type);
    const tpl = pool[Math.floor(Math.random() * pool.length)];
    return {
      type: tpl.type,
      target: tpl.target,
      desc: tpl.desc.replace('{n}', tpl.target),
      icon: tpl.icon,
      progress: 0,
      done: false,
    };
  });
}

function loadDaily() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (data.date === getTodayKey()) return data;
  } catch {}
  // 新的一天，生成新任务
  const tasks = generateDailyTasks();
  const data = { date: getTodayKey(), tasks, claimed: false };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

let dailyData = loadDaily();

export function getDailyTasks() {
  return dailyData.tasks;
}

export function isDailyClaimed() {
  return dailyData.claimed;
}

export function isAllDone() {
  return dailyData.tasks.every(t => t.done);
}

// 在游戏中每帧更新进度
export function updateDailyProgress() {
  if (dailyData.claimed) return;
  for (const task of dailyData.tasks) {
    if (task.done) continue;
    let current = 0;
    switch (task.type) {
      case 'coins': current = state.coinCnt; break;
      case 'doors': current = state.score; break;
      case 'combo': current = state.combo; break;
      case 'stars': current = state.starCnt; break;
    }
    task.progress = Math.min(current, task.target);
    if (task.progress >= task.target) task.done = true;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dailyData));
}

// 领取每日奖励（全部完成后可领）
export function claimDailyReward() {
  if (!isAllDone() || dailyData.claimed) return 0;
  dailyData.claimed = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dailyData));
  const reward = 5; // 奖励5颗星星
  state.totalStars += reward;
  localStorage.setItem('dd_totalStars', state.totalStars.toString());
  return reward;
}

// 刷新（新一天时调用）
export function refreshDaily() {
  dailyData = loadDaily();
}
