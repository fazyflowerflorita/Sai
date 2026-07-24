/* =========================================================
   5th Work Anniversary — Sai Pradeep Indiran
   Vanilla JS screen controller + effects
   ========================================================= */
(() => {
  'use strict';

  const stage = document.getElementById('stage');
  const screens = Array.from(document.querySelectorAll('.screen'));
  const threadFill = document.getElementById('threadFill');
  const threadNodes = Array.from(document.querySelectorAll('.thread__node'));
  const TOTAL = screens.length;
  let current = 1;

  /* ---------- Screen navigation ---------- */
  function goTo(n){
    n = Math.max(1, Math.min(TOTAL, n));
    if (n === current && document.querySelector(`.screen[data-screen="${n}"]`).classList.contains('active')) return;
    current = n;

    screens.forEach(s => s.classList.toggle('active', Number(s.dataset.screen) === n));

    // update thread
    const pct = ((n - 1) / (TOTAL - 1)) * 100;
    threadFill.style.width = pct + '%';
    threadNodes.forEach(node => {
      const t = Number(node.dataset.target);
      node.classList.toggle('done', t < n);
      node.classList.toggle('current', t === n);
    });

    runScreenEffects(n);
  }

  // clicking a thread node only allowed to jump backwards (already-visited) for orientation
  threadNodes.forEach(node => {
    node.addEventListener('click', () => {
      const t = Number(node.dataset.target);
      if (t <= current) goTo(t);
    });
  });

  document.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => goTo(current + 1));
  });

  /* ---------- Screen 1: Loader ---------- */
  const ringProgress = document.getElementById('ringProgress');
  const loaderPct = document.getElementById('loaderPct');
  const beginBtn = document.getElementById('beginBtn');
  const CIRC = 2 * Math.PI * 52; // matches r=52

  function runLoader(){
    let p = 0;
    const duration = 2200;
    const start = performance.now();
    function tick(now){
      const elapsed = now - start;
      p = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      ringProgress.style.strokeDashoffset = CIRC - CIRC * eased;
      loaderPct.textContent = Math.round(eased * 100) + '%';
      if (p < 1) requestAnimationFrame(tick);
      else {
        beginBtn.disabled = false;
      }
    }
    ringProgress.style.strokeDasharray = CIRC;
    ringProgress.style.strokeDashoffset = CIRC;
    requestAnimationFrame(tick);
  }
  beginBtn.addEventListener('click', () => goTo(2));

  /* ---------- Screen 2: Clues ---------- */
  const clueEls = Array.from(document.querySelectorAll('[data-clue]'));
  let cluesRevealed = false;
  function runClues(){
    if (cluesRevealed) return;
    cluesRevealed = true;
    clueEls.forEach((el, i) => {
      setTimeout(() => el.classList.add('shown'), 350 + i * 420);
    });
  }

  /* ---------- Screen 4: Timeline ---------- */
  const timelineItems = Array.from(document.querySelectorAll('.timeline__item'));
  const railFill = document.getElementById('railFill');
  let timelineRun = false;
  function runTimeline(){
    if (timelineRun) return;
    timelineRun = true;
    timelineItems.forEach((el, i) => {
      setTimeout(() => {
        el.classList.add('in');
        railFill.style.height = `${((i + 1) / timelineItems.length) * 100}%`;
      }, 260 + i * 320);
    });
  }

  /* ---------- Screen 5: Achievement cards ---------- */
  const cardEls = Array.from(document.querySelectorAll('.card'));
  let cardsRun = false;
  function runCards(){
    if (cardsRun) return;
    cardsRun = true;
    cardEls.forEach((el, i) => {
      setTimeout(() => el.classList.add('in'), 200 + i * 140);
    });
  }

  /* ---------- Screen 6: Counters ---------- */
  const counterEls = Array.from(document.querySelectorAll('.counter__num'));
  let countersRun = false;
  function runCounters(){
    if (countersRun) return;
    countersRun = true;
    counterEls.forEach(el => {
      const target = Number(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const duration = 1600;
      const start = performance.now();
      function tick(now){
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  /* ---------- Screen 7: Typewriter ---------- */
  const typewriterEl = document.getElementById('typewriter');
  const toFinaleBtn = document.getElementById('toFinaleBtn');
  const MESSAGE = `Congratulations on completing five remarkable years at Pride Global.

Your leadership, vision and unwavering commitment to Process Excellence have inspired teams, transformed processes and created a lasting impact.

Thank you for being an exceptional mentor and leader.

Wishing you continued success and many more milestones ahead.`;
  let typewriterRun = false;
  function runTypewriter(){
    if (typewriterRun) return;
    typewriterRun = true;
    typewriterEl.innerHTML = '<span class="cursor"></span>';
    const cursor = typewriterEl.querySelector('.cursor');
    let i = 0;
    const speed = 22;
    function tick(){
      if (i < MESSAGE.length){
        const char = MESSAGE.charAt(i);
        const node = document.createTextNode(char);
        typewriterEl.insertBefore(node, cursor);
        i++;
        setTimeout(tick, speed);
      } else {
        toFinaleBtn.disabled = false;
      }
    }
    tick();
  }

  /* ---------- Particles (floating gold specks) ---------- */
  function spawnParticles(containerId, count = 24){
    const container = document.getElementById(containerId);
    if (!container || container.dataset.spawned) return;
    container.dataset.spawned = '1';
    for (let i = 0; i < count; i++){
      const p = document.createElement('span');
      p.className = 'particle';
      const size = 2 + Math.random() * 4;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
      const duration = 6 + Math.random() * 8;
      p.style.animationDuration = duration + 's';
      p.style.animationDelay = (Math.random() * duration) + 's';
      container.appendChild(p);
    }
  }

  /* ---------- Confetti + fireworks (Screen 8) ---------- */
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  let confettiPieces = [];
  let fireworkParticles = [];
  let confettiRunning = false;
  const COLORS = ['#D4AF37', '#F1D178', '#7B5CFA', '#F4F1E8', '#8a6f28'];

  function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);

  function makeConfetti(n){
    for (let i = 0; i < n; i++){
      confettiPieces.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.5,
        w: 5 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8,
        vy: 1.5 + Math.random() * 2.5,
        vx: (Math.random() - 0.5) * 1.5,
        sway: Math.random() * Math.PI * 2
      });
    }
  }

  function makeFirework(x, y){
    const count = 40;
    for (let i = 0; i < count; i++){
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3;
      fireworkParticles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 60 + Math.random() * 20,
        age: 0,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      });
    }
  }

  function confettiLoop(){
    if (!confettiRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confettiPieces.forEach(p => {
      p.sway += 0.05;
      p.x += p.vx + Math.sin(p.sway) * 0.6;
      p.y += p.vy;
      p.rot += p.rotSpeed;
      if (p.y > canvas.height + 20){
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    fireworkParticles.forEach(fp => {
      fp.age++;
      fp.x += fp.vx;
      fp.y += fp.vy;
      fp.vy += 0.03;
      const alpha = Math.max(0, 1 - fp.age / fp.life);
      ctx.beginPath();
      ctx.fillStyle = fp.color;
      ctx.globalAlpha = alpha;
      ctx.arc(fp.x, fp.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
    fireworkParticles = fireworkParticles.filter(fp => fp.age < fp.life);

    requestAnimationFrame(confettiLoop);
  }

  function launchFireworksSequence(){
    let bursts = 0;
    const interval = setInterval(() => {
      makeFirework(
        canvas.width * (0.2 + Math.random() * 0.6),
        canvas.height * (0.2 + Math.random() * 0.35)
      );
      bursts++;
      if (bursts >= 6) clearInterval(interval);
    }, 500);
  }

  function runFinale(){
    if (confettiRunning) return;
    confettiRunning = true;
    resizeCanvas();
    makeConfetti(140);
    launchFireworksSequence();
    confettiLoop();
    spawnParticles('particles-8', 30);
  }

  /* ---------- Restart ---------- */
  document.getElementById('againBtn').addEventListener('click', () => {
    window.location.reload();
  });

  /* ---------- Parallax on pointer move ---------- */
  const parallaxLayers = Array.from(document.querySelectorAll('.bg-parallax'));
  window.addEventListener('pointermove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    const active = document.querySelector('.screen.active .bg-parallax');
    if (active){
      active.style.transform = `translate(${x * 14}px, ${y * 14}px)`;
    }
  });

  /* ---------- Effect dispatcher per screen ---------- */
  function runScreenEffects(n){
    switch(n){
      case 2: runClues(); break;
      case 3: spawnParticles('particles-3', 22); break;
      case 4: runTimeline(); break;
      case 5: runCards(); break;
      case 6: runCounters(); break;
      case 7: runTypewriter(); break;
      case 8: runFinale(); break;
    }
  }

  /* ---------- Init ---------- */
  resizeCanvas();
  spawnParticles('particles-1', 18);
  runLoader();
  threadNodes[0].classList.add('current');
})();
