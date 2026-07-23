/* ══════════════════════════════════════════════════════════════
   mobile-controls.js — экранное управление для телефонов.
   Симулирует клавиатуру (события keydown/keyup), поэтому подходит
   любой игре, которая читает e.code (KEYS). Логику игр не меняет.

   Настройка (необязательно) — задать ПЕРЕД подключением скрипта:
     window.MOBILE_CONFIG = {
       joystick: true,                        // левый стик → стрелки
       buttons: [                             // правые кнопки
         { code:'Space', label:'⚡', color:'#7c3aed' },
         { code:'KeyE',  label:'✋', color:'#ff69b4' },
       ]
     };
   ════════════════════════════════════════════════════════════════ */
(function(){
  var isTouch = (window.matchMedia && matchMedia('(pointer:coarse)').matches) || ('ontouchstart' in window);
  if(!isTouch) return;                          // на ПК ничего не добавляем

  var CFG = window.MOBILE_CONFIG || {
    joystick:true,
    buttons:[{code:'Space',label:'⚡',color:'#7c3aed'},{code:'KeyE',label:'✋',color:'#ff69b4'}]
  };

  function keyName(code){
    if(code==='Space') return ' ';
    if(code.indexOf('Arrow')===0) return code;
    if(code.indexOf('Key')===0) return code.slice(3).toLowerCase();
    return code;
  }
  function fire(type,code){
    window.dispatchEvent(new KeyboardEvent(type,{code:code,key:keyName(code),bubbles:true,cancelable:true}));
  }
  var down = {};
  function press(code){ if(down[code])return; down[code]=true; fire('keydown',code); }
  function release(code){ if(!down[code])return; down[code]=false; fire('keyup',code); }

  // ── стили ──
  var css = document.createElement('style');
  css.textContent =
    '#mc-root{position:fixed;inset:0;z-index:99998;pointer-events:none;font-family:sans-serif}'+
    '.mc-el{position:absolute;pointer-events:auto;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}'+
    '#mc-stick{bottom:24px;left:24px;width:130px;height:130px;border-radius:50%;'+
      'background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.18);backdrop-filter:blur(3px)}'+
    '#mc-knob{position:absolute;left:50%;top:50%;width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:50%;'+
      'background:rgba(255,255,255,.22);border:2px solid rgba(255,255,255,.4);transition:background .1s}'+
    '.mc-btn{width:76px;height:76px;border-radius:50%;display:flex;align-items:center;justify-content:center;'+
      'font-size:30px;color:#fff;border:2px solid rgba(255,255,255,.35);box-shadow:0 4px 16px rgba(0,0,0,.4)}'+
    '.mc-btn:active{filter:brightness(1.35) saturate(1.2);transform:scale(.92)}'+
    '@media (min-width:900px) and (pointer:fine){#mc-root{display:none}}';
  document.head.appendChild(css);

  var root = document.createElement('div'); root.id='mc-root';

  // ── джойстик ──
  if(CFG.joystick!==false){
    var stick = document.createElement('div'); stick.id='mc-stick'; stick.className='mc-el';
    var knob = document.createElement('div'); knob.id='mc-knob'; stick.appendChild(knob);
    root.appendChild(stick);

    var R = 48, DEAD = 0.34;
    function setDir(dx,dy){
      var mag = Math.hypot(dx,dy)||1, nx=dx/Math.max(mag,R), ny=dy/Math.max(mag,R);
      // движение ручки (визуал)
      var cl = Math.min(1, mag/R);
      knob.style.transform='translate('+(dx/mag*R*cl)+'px,'+(dy/mag*R*cl)+'px)';
      // направления → стрелки
      (dx < -R*DEAD) ? press('ArrowLeft')  : release('ArrowLeft');
      (dx >  R*DEAD) ? press('ArrowRight') : release('ArrowRight');
      (dy < -R*DEAD) ? press('ArrowUp')    : release('ArrowUp');
      (dy >  R*DEAD) ? press('ArrowDown')  : release('ArrowDown');
    }
    function clearDir(){
      ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].forEach(release);
      knob.style.transform='translate(0,0)';
      knob.style.background='rgba(255,255,255,.22)';
    }
    var sid=null, cx=0, cy=0;
    stick.addEventListener('pointerdown',function(e){
      e.preventDefault(); sid=e.pointerId; stick.setPointerCapture(sid);
      var r=stick.getBoundingClientRect(); cx=r.left+r.width/2; cy=r.top+r.height/2;
      knob.style.background='rgba(255,255,255,.4)';
      setDir(e.clientX-cx, e.clientY-cy);
    });
    stick.addEventListener('pointermove',function(e){
      if(e.pointerId!==sid) return; e.preventDefault();
      setDir(e.clientX-cx, e.clientY-cy);
    });
    function end(e){ if(e.pointerId!==sid) return; sid=null; clearDir(); }
    stick.addEventListener('pointerup',end);
    stick.addEventListener('pointercancel',end);
  }

  // ── кнопки действий ──
  var btns = CFG.buttons||[];
  btns.forEach(function(b,i){
    var el = document.createElement('div');
    el.className='mc-el mc-btn';
    el.textContent=b.label||'●';
    el.style.background=(b.color||'#7c3aed');
    el.style.bottom=(30 + (i%2)*92)+'px';
    el.style.right=(28 + Math.floor(i/2)*92)+'px';
    el.addEventListener('pointerdown',function(e){ e.preventDefault(); press(b.code); });
    var up=function(e){ e.preventDefault(); release(b.code); };
    el.addEventListener('pointerup',up);
    el.addEventListener('pointercancel',up);
    el.addEventListener('pointerleave',up);
    root.appendChild(el);
  });

  (document.body||document.documentElement).appendChild(root);
})();
