const canvas=document.getElementById('gameCanvas'),ctx=canvas.getContext('2d');
const startScreen=document.getElementById('startScreen');
const gameOverScreen=document.getElementById('gameOverScreen');
const startBtn=document.getElementById('startBtn');
const restartBtn=document.getElementById('restartBtn');
let W,H,ground;
function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;ground=H*0.82;}
resize();window.addEventListener('resize',resize);

// === AUDIO ===
let audioCtx=null;
function initAudio(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();}
function playTone(freq,dur,type,vol){
  if(!audioCtx)return;
  let o=audioCtx.createOscillator(),g=audioCtx.createGain();
  o.connect(g);g.connect(audioCtx.destination);
  o.type=type||'sine';o.frequency.value=freq;
  g.gain.setValueAtTime(vol||0.15,audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+dur);
  o.start();o.stop(audioCtx.currentTime+dur);
}
function sndDuck(){playTone(600,0.08,'sine',0.12);setTimeout(()=>playTone(400,0.06,'sine',0.08),40);}
function sndHit(){playTone(150,0.3,'sawtooth',0.2);setTimeout(()=>playTone(80,0.2,'square',0.1),50);}
function sndCoin(){playTone(880,0.1,'sine',0.15);setTimeout(()=>playTone(1100,0.12,'sine',0.12),80);}
function sndLevelUp(){playTone(523,0.12,'sine',0.15);setTimeout(()=>playTone(659,0.12,'sine',0.15),120);setTimeout(()=>playTone(784,0.2,'sine',0.15),240);}
function sndPass(){playTone(520,0.04,'sine',0.05);}

// Voice
const AUDIO_FILES={start:'audio/start.m4a',scene1:'audio/scene1.m4a',scene2:'audio/scene2.m4a',scene3:'audio/scene3.m4a',scene4:'audio/scene4.m4a',scene5:'audio/scene5.m4a',gameover:'audio/gameover.m4a',cheat:'audio/cheat.m4a'};
let audioCache={},currentVoice=null;
function preloadAudio(){for(let k in AUDIO_FILES){let a=new Audio(AUDIO_FILES[k]);a.preload='auto';audioCache[k]=a;}}
function playVoice(key){if(currentVoice){currentVoice.pause();currentVoice.currentTime=0;}let a=audioCache[key];if(!a)return;a.currentTime=0;a.play().catch(()=>{});currentVoice=a;}
preloadAudio();
const SCENE_KEYS=['scene1','scene2','scene3','scene4','scene5'];

// BGM
let bgmTimer=null;
function startBGM(){
  if(!audioCtx)return;
  let notes=[262,294,330,349,392,349,330,294,262,330,392,440,392,330,294,262],idx=0;
  function tick(){
    if(!running){bgmTimer=null;return;}
    let o=audioCtx.createOscillator(),g=audioCtx.createGain();
    o.connect(g);g.connect(audioCtx.destination);o.type='triangle';o.frequency.value=notes[idx%notes.length];
    g.gain.setValueAtTime(0.02,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.28);
    o.start();o.stop(audioCtx.currentTime+0.32);idx++;bgmTimer=setTimeout(tick,350);
  }
  tick();
}
function stopBGM(){if(bgmTimer){clearTimeout(bgmTimer);bgmTimer=null;}}

// === STATE ===
let running=false,score=0,isDuck=false,frame=0,dadX=130;
let hi=parseInt(localStorage.getItem('dd11')||'0');
let doors=[],coins=[],lamps=[],particles=[],ftexts=[];
let spd=3,lives=3,combo=0,lvl=1,lvlProg=0;
let invT=0,shakeT=0,bannerT=0,bannerTxt='',coinCnt=0,wasDuck=false;

const THEMES=[
  {n:'客厅',wall:'#faf6f0',floor:'#d4a574',accent:'#e8ddd0',doorColor:'#8B4513',frameColor:'#fff'},
  {n:'卧室',wall:'#e8f0f8',floor:'#c4a882',accent:'#d0ddef',doorColor:'#6b4423',frameColor:'#f8f8ff'},
  {n:'厨房',wall:'#fff8ee',floor:'#b8b8b8',accent:'#f5ece0',doorColor:'#a0a0a0',frameColor:'#e0e0e0'},
  {n:'书房',wall:'#f2ede4',floor:'#7a5c3a',accent:'#e0d8c8',doorColor:'#5c3d1e',frameColor:'#d4c4a8'},
  {n:'地下室',wall:'#d8d4d0',floor:'#555',accent:'#c0bbb5',doorColor:'#4a4a4a',frameColor:'#888'},
];
let theme=THEMES[0];

// Dimensions - 碰撞用视觉高度
const DAD_H=170,SON_H=56,SON_DK=20,CW=44,DW=56,WW=55,LPL=6;
const VISUAL_STAND_H=194,VISUAL_DUCK_H=135;
const STAND_H=VISUAL_STAND_H,DUCK_H=VISUAL_DUCK_H;
function totH(){return isDuck?VISUAL_DUCK_H:VISUAL_STAND_H;}
function lcfg(){
  let l=lvl;
  let tallMin=STAND_H+4,tallMax=STAND_H+30;
  let shortMin=Math.max(DUCK_H+8,DUCK_H+25-l*2),shortMax=STAND_H-4;
  return{spd:2.8+l*0.5,tallMin,tallMax,shortMin,shortMax,
    gMin:Math.max(200,330-l*14),gMax:Math.max(300,450-l*14),
    obs:Math.min(0.45,0.05+l*0.06),shortChance:Math.min(0.7,0.35+l*0.05)};
}

// Effects
function addParticles(x,y,color,count){for(let i=0;i<count;i++)particles.push({x,y,vx:(Math.random()-.5)*6,vy:-Math.random()*4-2,life:30+Math.random()*20,color,size:3+Math.random()*4});}
function addText(x,y,text,color){ftexts.push({x,y,text,color,life:60,vy:-2});}

// Spawn
function spawnDoor(){
  let c=lcfg(),h;
  if(Math.random()<c.shortChance){h=c.shortMin+Math.random()*(c.shortMax-c.shortMin);}
  else{h=c.tallMin+Math.random()*(c.tallMax-c.tallMin);}
  doors.push({x:W+100,h:h,passed:false});
  if(Math.random()<0.5)coins.push({x:W+100+DW/2,y:ground-h-30-Math.random()*35,got:false,t:Math.random()*6.28});
  if(Math.random()<c.obs){let lx=W+100+c.gMin*0.4+Math.random()*80;lamps.push({x:lx,hangH:ground*(0.32+Math.random()*0.15),hit:false,swing:Math.random()*6.28});}
  lvlProg++;
  if(lvlProg>=LPL){lvlProg=0;lvl++;theme=THEMES[(lvl-1)%THEMES.length];bannerT=120;bannerTxt='第'+lvl+'关 · '+theme.n;sndLevelUp();setTimeout(()=>playVoice(SCENE_KEYS[(lvl-1)%SCENE_KEYS.length]),300);}
}

// Collision
function hitDoor(d){let t=totH(),charTop=ground-t,cl=dadX-CW/2,cr=dadX+CW/2;return cr>d.x&&cl<d.x+DW&&charTop<ground-d.h;}
function hitLamp(la){let t=totH(),top=ground-t,cl=dadX-CW/2,cr=dadX+CW/2;let lx=la.x+Math.sin(la.swing)*10;return cr>lx-16&&cl<lx+16&&top<la.hangH;}
function hitCoin(c){let headY=ground-totH()+10;let dx=dadX-c.x,dy=headY-c.y;return Math.sqrt(dx*dx+dy*dy)<28;}
function takeDamage(){if(invT>0)return;lives--;combo=0;shakeT=15;invT=90;sndHit();addParticles(dadX,ground-totH(),'#ff4444',8);if(lives<=0)gameOver();}

// === DRAW BACKGROUND ===
function drawBG(){
  ctx.fillStyle=theme.wall;ctx.fillRect(0,0,W,ground);
  ctx.fillStyle=theme.floor;ctx.fillRect(0,ground,W,H-ground);
  ctx.strokeStyle='rgba(0,0,0,0.08)';ctx.lineWidth=1;
  for(let x=0;x<W;x+=80){ctx.beginPath();ctx.moveTo(x,ground);ctx.lineTo(x,H);ctx.stroke();}
  ctx.fillStyle=theme.frameColor;ctx.fillRect(0,ground-6,W,6);
}

// === DRAW DOOR (正面视角 - 带门板门框) ===
function drawDoor(d){
  let doorTop=ground-d.h,doorW=DW,frameW=10;
  // 墙壁
  ctx.fillStyle=theme.accent;
  ctx.fillRect(d.x-40,0,40,ground);
  ctx.fillRect(d.x+doorW,0,40,ground);
  ctx.fillRect(d.x-frameW,0,doorW+frameW*2,doorTop-frameW);
  // 门洞内部(深色纵深)
  let grad=ctx.createLinearGradient(d.x,doorTop,d.x,ground);
  grad.addColorStop(0,'#4a3a2a');grad.addColorStop(0.5,'#5a4a38');grad.addColorStop(1,'#3a2a1a');
  ctx.fillStyle=grad;ctx.fillRect(d.x,doorTop,doorW,d.h);
  ctx.fillStyle='rgba(100,80,60,0.5)';ctx.fillRect(d.x+5,ground-15,doorW-10,15);
  // 门框
  ctx.fillStyle=theme.doorColor;
  ctx.fillRect(d.x-frameW,doorTop-frameW,frameW,d.h+frameW);
  ctx.fillRect(d.x+doorW,doorTop-frameW,frameW,d.h+frameW);
  ctx.fillRect(d.x-frameW,doorTop-frameW,doorW+frameW*2,frameW);
  // 门框厚度阴影
  ctx.fillStyle='rgba(0,0,0,0.2)';
  ctx.fillRect(d.x,doorTop,5,d.h);ctx.fillRect(d.x+doorW-5,doorTop,5,d.h);ctx.fillRect(d.x,doorTop,doorW,6);
  // 门框高光
  ctx.fillStyle='rgba(255,255,255,0.2)';
  ctx.fillRect(d.x-frameW,doorTop-frameW,3,d.h+frameW);ctx.fillRect(d.x-frameW,doorTop-frameW,doorW+frameW*2,3);
  // 门框木纹
  ctx.strokeStyle='rgba(0,0,0,0.08)';ctx.lineWidth=1;
  for(let y=doorTop;y<ground;y+=15){ctx.beginPath();ctx.moveTo(d.x-frameW+2,y);ctx.lineTo(d.x-2,y);ctx.stroke();ctx.beginPath();ctx.moveTo(d.x+doorW+2,y);ctx.lineTo(d.x+doorW+frameW-2,y);ctx.stroke();}
  // 半开门板(透视)
  ctx.fillStyle='#b8845a';
  ctx.beginPath();ctx.moveTo(d.x+doorW-2,doorTop+2);ctx.lineTo(d.x+doorW-25,doorTop+8);ctx.lineTo(d.x+doorW-25,ground);ctx.lineTo(d.x+doorW-2,ground);ctx.closePath();ctx.fill();
  ctx.fillStyle='#a07040';let pH=(d.h-40)/2;
  ctx.fillRect(d.x+doorW-23,doorTop+16,18,pH);ctx.fillRect(d.x+doorW-23,doorTop+pH+28,18,pH);
  ctx.fillStyle='rgba(255,255,255,0.1)';ctx.fillRect(d.x+doorW-23,doorTop+16,18,3);ctx.fillRect(d.x+doorW-23,doorTop+pH+28,18,3);
  let hy=doorTop+d.h*0.5;
  ctx.fillStyle='#d4af37';ctx.beginPath();ctx.arc(d.x+doorW-26,hy,4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.beginPath();ctx.arc(d.x+doorW-27,hy-1,1.5,0,Math.PI*2);ctx.fill();
}

// === DRAW LAMP ===
function drawLamp(la){
  let sx=Math.sin(la.swing)*10,lx=la.x+sx;
  ctx.strokeStyle='#777';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(la.x,0);ctx.lineTo(lx,la.hangH-22);ctx.stroke();
  ctx.fillStyle=la.hit?'#999':'#f4d03f';ctx.beginPath();ctx.moveTo(lx-16,la.hangH-22);ctx.lineTo(lx+16,la.hangH-22);ctx.lineTo(lx+11,la.hangH);ctx.lineTo(lx-11,la.hangH);ctx.closePath();ctx.fill();
  ctx.strokeStyle=la.hit?'#666':'#c9a80d';ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle=la.hit?'#aaa':'#fff8dc';ctx.beginPath();ctx.arc(lx,la.hangH+4,5,0,Math.PI*2);ctx.fill();
  if(!la.hit){ctx.fillStyle='rgba(255,250,200,0.12)';ctx.beginPath();ctx.arc(lx,la.hangH+10,30,0,Math.PI*2);ctx.fill();}
}

// === DRAW COIN ===
function drawCoin(c){
  if(c.got)return;c.t+=0.05;let scale=Math.abs(Math.cos(c.t));
  ctx.fillStyle='#f1c40f';ctx.beginPath();ctx.ellipse(c.x,c.y,10*scale,10,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#d4ac0d';ctx.lineWidth=1.5;ctx.stroke();
  if(scale>0.3){ctx.fillStyle='#b8860b';ctx.font='bold 11px Arial';ctx.textAlign='center';ctx.fillText('¥',c.x,c.y+4);ctx.textAlign='left';}
}

// === DRAW CHARACTER (正面 - 爸爸驮儿子) ===
function drawChar(){
  let baseY=ground,cx=dadX,wk=Math.sin(frame*0.1);
  if(invT>0&&Math.floor(invT/4)%2===0)return;
  let legSwing=wk*6;
  // 爸爸腿
  ctx.fillStyle='#3a3a3a';
  ctx.beginPath();ctx.moveTo(cx-8,baseY-40);ctx.lineTo(cx-10-legSwing,baseY-5);ctx.lineTo(cx-2-legSwing,baseY-5);ctx.lineTo(cx-2,baseY-40);ctx.fill();
  ctx.beginPath();ctx.moveTo(cx+2,baseY-40);ctx.lineTo(cx+2+legSwing,baseY-5);ctx.lineTo(cx+10+legSwing,baseY-5);ctx.lineTo(cx+8,baseY-40);ctx.fill();
  ctx.fillStyle='#222';ctx.beginPath();ctx.ellipse(cx-7-legSwing,baseY-3,8,4,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(cx+7+legSwing,baseY-3,8,4,0,0,Math.PI*2);ctx.fill();
  // 爸爸身体
  let bodyBot=baseY-40,bodyTop=bodyBot-75;
  ctx.fillStyle='#5b8fb9';ctx.beginPath();ctx.moveTo(cx-20,bodyBot);ctx.quadraticCurveTo(cx-24,bodyBot-30,cx-22,bodyTop+10);ctx.quadraticCurveTo(cx,bodyTop-5,cx+22,bodyTop+10);ctx.quadraticCurveTo(cx+24,bodyBot-30,cx+20,bodyBot);ctx.closePath();ctx.fill();
  // 领口
  ctx.fillStyle='#4a7a9e';ctx.beginPath();ctx.moveTo(cx-8,bodyTop+10);ctx.lineTo(cx,bodyTop+16);ctx.lineTo(cx+8,bodyTop+10);ctx.lineTo(cx,bodyTop+5);ctx.closePath();ctx.fill();
  // 手臂(扶着儿子腿)
  ctx.strokeStyle='#5b8fb9';ctx.lineWidth=10;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(cx-22,bodyTop+18);ctx.quadraticCurveTo(cx-32,bodyTop+40,cx-18,bodyTop+55);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx+22,bodyTop+18);ctx.quadraticCurveTo(cx+32,bodyTop+40,cx+18,bodyTop+55);ctx.stroke();
  ctx.fillStyle='#f0ba8a';ctx.beginPath();ctx.arc(cx-18,bodyTop+55,5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cx+18,bodyTop+55,5,0,Math.PI*2);ctx.fill();

  // === 儿子整体(在爸爸头后面，先画) ===
  let shoulderY=bodyTop-5;
  // 儿子腿(骑跨)
  ctx.fillStyle='#3d6b3d';ctx.fillRect(cx-16,shoulderY,9,28);ctx.fillRect(cx+7,shoulderY,9,28);
  ctx.fillStyle='#e67e22';ctx.beginPath();ctx.ellipse(cx-12,shoulderY+30,7,4,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(cx+12,shoulderY+30,7,4,0,0,Math.PI*2);ctx.fill();
  // 儿子身体
  let sonBot=shoulderY,sonH2=isDuck?SON_DK:SON_H,sonTop=sonBot-sonH2+10;
  ctx.fillStyle='#e74c3c';
  if(isDuck){ctx.beginPath();ctx.ellipse(cx,sonBot-12,16,11,0,0,Math.PI*2);ctx.fill();}
  else{ctx.beginPath();ctx.moveTo(cx-14,sonBot);ctx.quadraticCurveTo(cx-16,sonTop+8,cx-12,sonTop+3);ctx.quadraticCurveTo(cx,sonTop-4,cx+12,sonTop+3);ctx.quadraticCurveTo(cx+16,sonTop+8,cx+14,sonBot);ctx.closePath();ctx.fill();}
  // 儿子手臂
  if(!isDuck){ctx.strokeStyle='#f0ba8a';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(cx-12,sonTop+15);ctx.lineTo(cx-18,sonTop+28);ctx.stroke();ctx.beginPath();ctx.moveTo(cx+12,sonTop+15);ctx.lineTo(cx+18,sonTop+28);ctx.stroke();}
  // 儿子脖子
  if(!isDuck){ctx.fillStyle='#f0ba8a';ctx.fillRect(cx-4,sonTop-8,8,12);}
  // 儿子头
  let sHY=isDuck?sonBot-24:sonTop-18;
  ctx.fillStyle='#f0ba8a';
  if(isDuck){ctx.beginPath();ctx.ellipse(cx,sHY,13,10,0,0,Math.PI*2);ctx.fill();}
  else{ctx.beginPath();ctx.arc(cx,sHY,14,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#5c3317';
  if(isDuck){ctx.beginPath();ctx.ellipse(cx,sHY-5,12,7,0,Math.PI,2*Math.PI);ctx.fill();}
  else{ctx.beginPath();ctx.arc(cx,sHY-5,14,Math.PI,2*Math.PI);ctx.fill();ctx.fillRect(cx-12,sHY-10,24,6);ctx.strokeStyle='#5c3317';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx-2,sHY-14);ctx.quadraticCurveTo(cx,sHY-24,cx+5,sHY-20);ctx.stroke();}
  if(!isDuck){ctx.fillStyle='#e8a878';ctx.beginPath();ctx.ellipse(cx-13,sHY+1,4,5,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(cx+13,sHY+1,4,5,0,0,Math.PI*2);ctx.fill();}
  if(isDuck){ctx.strokeStyle='#333';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(cx-6,sHY);ctx.lineTo(cx-2,sHY+1);ctx.stroke();ctx.beginPath();ctx.moveTo(cx+2,sHY);ctx.lineTo(cx+6,sHY+1);ctx.stroke();}
  else{ctx.fillStyle='#333';ctx.beginPath();ctx.arc(cx-5,sHY+1,3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cx+5,sHY+1,3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(cx-4,sHY,1.2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cx+6,sHY,1.2,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,120,120,0.3)';ctx.beginPath();ctx.arc(cx-9,sHY+5,5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cx+9,sHY+5,5,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle=isDuck?'#666':'#a06040';ctx.lineWidth=1.8;
  if(isDuck){ctx.beginPath();ctx.moveTo(cx-4,sHY+6);ctx.lineTo(cx+4,sHY+5);ctx.stroke();}
  else{ctx.beginPath();ctx.arc(cx,sHY+6,5,0.1*Math.PI,0.9*Math.PI);ctx.stroke();}

  // === 爸爸头(最后画，在最前面，不被遮挡) ===
  ctx.fillStyle='#f0ba8a';ctx.fillRect(cx-6,bodyTop-10,12,15);
  let headY=bodyTop-28;
  ctx.fillStyle='#f0ba8a';ctx.beginPath();ctx.arc(cx,headY,18,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#2c2014';ctx.beginPath();ctx.arc(cx,headY-4,18,Math.PI,2*Math.PI);ctx.fill();ctx.fillRect(cx-16,headY-8,32,8);
  ctx.fillStyle='#e8a878';ctx.beginPath();ctx.ellipse(cx-17,headY+2,5,7,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(cx+17,headY+2,5,7,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#333';ctx.beginPath();ctx.arc(cx-6,headY+2,3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cx+6,headY+2,3,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(cx-5,headY+1,1.2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cx+7,headY+1,1.2,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#2c2014';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(cx-10,headY-4);ctx.lineTo(cx-3,headY-5);ctx.stroke();ctx.beginPath();ctx.moveTo(cx+3,headY-5);ctx.lineTo(cx+10,headY-4);ctx.stroke();
  ctx.fillStyle='#e0a070';ctx.beginPath();ctx.moveTo(cx,headY+4);ctx.lineTo(cx-3,headY+10);ctx.lineTo(cx+3,headY+10);ctx.fill();
  ctx.strokeStyle='#a06040';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,headY+13,6,0.15*Math.PI,0.85*Math.PI);ctx.stroke();
}

// === HUD ===
function drawHUD(){
  ctx.fillStyle='rgba(255,255,255,0.9)';ctx.beginPath();ctx.roundRect(12,12,200,80,10);ctx.fill();
  ctx.strokeStyle='#e0d5c5';ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle='#e67e22';ctx.font='bold 24px Arial';ctx.fillText('⭐ '+score,25,42);
  ctx.fillStyle='#888';ctx.font='14px Arial';ctx.fillText('第'+lvl+'关 · '+theme.n,25,62);
  ctx.fillStyle='#f1c40f';ctx.font='14px Arial';ctx.fillText('🪙 '+coinCnt,25,82);
  if(combo>1){ctx.fillStyle='#e74c3c';ctx.font='bold 14px Arial';ctx.fillText('🔥x'+combo,130,42);}
  ctx.font='22px Arial';for(let i=0;i<3;i++)ctx.fillText(i<lives?'❤️':'🖤',W-100+i*28,35);
  if(isDuck){ctx.fillStyle='rgba(46,204,113,0.9)';ctx.beginPath();ctx.roundRect(W-110,50,95,30,8);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 13px Arial';ctx.fillText('⬇ 低头中',W-100,70);}
}
function drawParticles(){for(let i=particles.length-1;i>=0;i--){let p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.15;p.life--;if(p.life<=0){particles.splice(i,1);continue;}ctx.globalAlpha=p.life/50;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}ctx.globalAlpha=1;}
function drawTexts(){for(let i=ftexts.length-1;i>=0;i--){let t=ftexts[i];t.y+=t.vy;t.life--;if(t.life<=0){ftexts.splice(i,1);continue;}ctx.globalAlpha=t.life/60;ctx.fillStyle=t.color;ctx.font='bold 18px Arial';ctx.textAlign='center';ctx.fillText(t.text,t.x,t.y);ctx.textAlign='left';}ctx.globalAlpha=1;}
function drawBanner(){if(bannerT<=0)return;let alpha=bannerT>100?((120-bannerT)/20):bannerT>20?1:(bannerT/20);ctx.globalAlpha=alpha;ctx.fillStyle='rgba(0,0,0,0.75)';ctx.beginPath();ctx.roundRect(W/2-160,H/2-45,320,90,12);ctx.fill();ctx.fillStyle='#FFD700';ctx.font='bold 30px Arial';ctx.textAlign='center';ctx.fillText(bannerTxt,W/2,H/2+10);ctx.textAlign='left';ctx.globalAlpha=1;}

// === UPDATE ===
function update(){
  if(!running)return;frame++;
  if(isDuck&&!wasDuck)sndDuck();wasDuck=isDuck;
  let c=lcfg();spd=c.spd;if(invT>0)invT--;if(shakeT>0)shakeT--;if(bannerT>0)bannerT--;
  for(let i=doors.length-1;i>=0;i--){
    doors[i].x-=spd;
    if(!doors[i].passed&&doors[i].x+DW<dadX-CW/2){doors[i].passed=true;score++;combo++;sndPass();addText(dadX,ground-totH()-20,combo>1?'+1 x'+combo:'+1','#27ae60');if(combo>2)score+=combo-2;}
    if(doors[i].x<-DW-WW*2)doors.splice(i,1);
  }
  for(let i=coins.length-1;i>=0;i--){coins[i].x-=spd;if(!coins[i].got&&hitCoin(coins[i])){coins[i].got=true;coinCnt++;score+=3;sndCoin();addParticles(coins[i].x,coins[i].y,'#f1c40f',6);addText(coins[i].x,coins[i].y-15,'+3','#f1c40f');}if(coins[i].x<-20)coins.splice(i,1);}
  for(let i=lamps.length-1;i>=0;i--){lamps[i].x-=spd;lamps[i].swing+=0.03;if(!lamps[i].hit&&hitLamp(lamps[i])){lamps[i].hit=true;takeDamage();addText(lamps[i].x,lamps[i].hangH,'撞灯了!','#e74c3c');}if(lamps[i].x<-40)lamps.splice(i,1);}
  for(let d of doors){if(!d.passed&&hitDoor(d)){d.passed=true;takeDamage();combo=0;addText(dadX,ground-totH()-20,'撞门框!','#e74c3c');}}
  let last=doors[doors.length-1];let gap=c.gMin+Math.random()*(c.gMax-c.gMin);
  if(!last||last.x<W-gap)spawnDoor();
}

// === DRAW & LOOP ===
function draw(){ctx.save();if(shakeT>0)ctx.translate(Math.random()*6-3,Math.random()*6-3);drawBG();for(let la of lamps)drawLamp(la);for(let d of doors)drawDoor(d);for(let c of coins)drawCoin(c);drawChar();drawParticles();drawTexts();drawHUD();drawBanner();ctx.restore();}
function loop(){if(!running)return;update();draw();requestAnimationFrame(loop);}
function startGame(){initAudio();score=0;doors=[];coins=[];lamps=[];particles=[];ftexts=[];spd=3;lives=3;combo=0;lvl=1;lvlProg=0;isDuck=false;wasDuck=false;frame=0;invT=0;shakeT=0;coinCnt=0;theme=THEMES[0];bannerT=90;bannerTxt='第1关 · 客厅';running=true;startScreen.classList.add('hidden');gameOverScreen.classList.add('hidden');stopBGM();startBGM();setTimeout(()=>playVoice('start'),300);setTimeout(()=>playVoice('scene1'),1500);spawnDoor();loop();}
function gameOver(){running=false;stopBGM();if(score>hi){hi=score;localStorage.setItem('dd11',hi.toString());}document.getElementById('finalScore').textContent=score;document.getElementById('highScore').textContent=hi;gameOverScreen.classList.remove('hidden');playVoice('gameover');}

// === INPUT ===
document.addEventListener('keydown',e=>{if(e.code==='Space'&&running){e.preventDefault();isDuck=true;}});
document.addEventListener('keyup',e=>{if(e.code==='Space'){e.preventDefault();isDuck=false;}});
canvas.addEventListener('mousedown',e=>{e.preventDefault();isDuck=true;});
canvas.addEventListener('mouseup',e=>{e.preventDefault();isDuck=false;});
canvas.addEventListener('mouseleave',()=>{isDuck=false;});
canvas.addEventListener('touchstart',e=>{e.preventDefault();isDuck=true;},{passive:false});
canvas.addEventListener('touchend',e=>{e.preventDefault();isDuck=false;},{passive:false});
startBtn.addEventListener('click',startGame);
restartBtn.addEventListener('click',startGame);
