(() => {
  'use strict';

  const canvas = document.getElementById('pong');
  const ctx = canvas.getContext('2d');
  const shell = document.querySelector('.game-shell');
  const ui = {
    player: document.getElementById('player-score'), cpu: document.getElementById('cpu-score'), overlay: document.getElementById('overlay'),
    title: document.getElementById('overlay-title'), copy: document.getElementById('overlay-copy'), action: document.getElementById('main-action'),
    pause: document.getElementById('pause'), restart: document.getElementById('restart')
  };
  const W = canvas.width, H = canvas.height;
  const paddle = { x: 42, w: 15, h: 105 };
  const BALL_START_SPEED = 380, BALL_MAX_SPEED = 690, PLAYER_SPEED = 540;
  const keys = new Set();
  const levels = {
    easy: { speed: 260, reaction: .32, error: 58, awayError: 34 },
    normal: { speed: 405, reaction: .14, error: 24, awayError: 12 },
    hard: { speed: 515, reaction: .055, error: 9, awayError: 4 }
  };
  let difficulty = window.WebArcade.getPongDifficulty();
  let running = false, paused = false, gameOver = false, animation, audio, lastTime = 0;
  let cpuTarget = H / 2, cpuThinkTime = 0, impactFlash = { player: 0, cpu: 0 }, scoreFlash = 0;
  const state = {
    playerY: (H - paddle.h) / 2, cpuY: (H - paddle.h) / 2,
    ball: { x: W / 2, y: H / 2, r: 10, vx: 0, vy: 0 }, playerScore: 0, cpuScore: 0
  };

  function sound(type) {
    if ((window.WebArcade && WebArcade.isMuted()) || !window.AudioContext) return;
    audio ||= new AudioContext();
    if (audio.state === 'suspended') audio.resume();
    const oscillator = audio.createOscillator(), gain = audio.createGain();
    oscillator.type = type === 'score' ? 'square' : 'sine';
    oscillator.frequency.value = type === 'score' ? 180 : type === 'hit' ? 480 : 330;
    gain.gain.setValueAtTime(.06 * WebArcade.getVolume(), audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .11);
    oscillator.connect(gain).connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + .12);
  }

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function randomRange(amount) { return (Math.random() * 2 - 1) * amount; }

  function setDifficulty(level) {
    difficulty = levels[level] ? level : 'normal';
    WebArcade.setPongDifficulty(difficulty);
    document.querySelectorAll('[data-level]').forEach(button => button.classList.toggle('active', button.dataset.level === difficulty));
    cpuThinkTime = 0;
  }

  function resetBall(direction = Math.random() > .5 ? 1 : -1) {
    const ball = state.ball;
    const angle = randomRange(.34);
    ball.x = W / 2; ball.y = H / 2;
    ball.vx = Math.cos(angle) * BALL_START_SPEED * direction;
    ball.vy = Math.sin(angle) * BALL_START_SPEED;
    cpuThinkTime = 0;
  }

  function resetMatch() {
    state.playerScore = state.cpuScore = 0;
    state.playerY = state.cpuY = (H - paddle.h) / 2;
    ui.player.textContent = '0'; ui.cpu.textContent = '0'; gameOver = false;
    resetBall();
  }

  function score(player) {
    if (player) state.playerScore++; else state.cpuScore++;
    ui.player.textContent = state.playerScore; ui.cpu.textContent = state.cpuScore;
    scoreFlash = .28; shell.classList.remove('score-flash'); void shell.offsetWidth; shell.classList.add('score-flash'); sound('score');
    if (state.playerScore === 7 || state.cpuScore === 7) {
      running = false; gameOver = true; ui.pause.disabled = true; ui.overlay.hidden = false;
      const win = state.playerScore === 7;
      ui.title.textContent = win ? 'YOU WIN!' : 'CPU WINS';
      ui.copy.textContent = win ? 'A perfect neon rally. Ready for another round?' : 'The CPU got there first. Give it another serve.';
      ui.action.textContent = 'Play again';
      return;
    }
    resetBall(player ? -1 : 1);
  }

  function predictIntercept() {
    const ball = state.ball;
    if (ball.vx <= 0) return H / 2;
    const paddleFace = W - paddle.x - paddle.w - ball.r;
    const travelTime = Math.max(0, (paddleFace - ball.x) / ball.vx);
    const range = H - ball.r * 2;
    const projected = ball.y - ball.r + ball.vy * travelTime;
    const cycle = range * 2;
    const wrapped = ((projected % cycle) + cycle) % cycle;
    return ball.r + (wrapped <= range ? wrapped : cycle - wrapped);
  }

  function updateCpu(dt) {
    const cfg = levels[difficulty];
    cpuThinkTime -= dt;
    if (cpuThinkTime <= 0) {
      const towardCpu = state.ball.vx > 0;
      const desired = towardCpu ? predictIntercept() : H / 2;
      const error = towardCpu ? cfg.error : cfg.awayError;
      cpuTarget = clamp(desired + randomRange(error), paddle.h / 2, H - paddle.h / 2);
      cpuThinkTime += cfg.reaction;
    }
    const targetY = cpuTarget - paddle.h / 2;
    state.cpuY = clamp(state.cpuY + clamp(targetY - state.cpuY, -cfg.speed * dt, cfg.speed * dt), 0, H - paddle.h);
  }

  function movePlayer(direction, dt) { state.playerY = clamp(state.playerY + direction * PLAYER_SPEED * dt, 0, H - paddle.h); }

  function bounceFromPaddle(left) {
    const ball = state.ball;
    const paddleY = left ? state.playerY : state.cpuY;
    const offset = clamp((ball.y - (paddleY + paddle.h / 2)) / (paddle.h / 2), -.92, .92);
    const speed = Math.min(Math.hypot(ball.vx, ball.vy) + 28, BALL_MAX_SPEED);
    let angle = offset * .82;
    if (Math.abs(angle) < .12) angle = (offset || (Math.random() < .5 ? -1 : 1)) * .12;
    ball.vx = Math.cos(angle) * speed * (left ? 1 : -1);
    ball.vy = Math.sin(angle) * speed;
    ball.x = left ? paddle.x + paddle.w + ball.r : W - paddle.x - paddle.w - ball.r;
    impactFlash[left ? 'player' : 'cpu'] = .14; sound('hit');
  }

  function updateBall(dt) {
    const ball = state.ball;
    const previousX = ball.x;
    ball.x += ball.vx * dt; ball.y += ball.vy * dt;
    if (ball.y - ball.r < 0 || ball.y + ball.r > H) {
      ball.vy *= -1; ball.y = clamp(ball.y, ball.r, H - ball.r); sound('wall');
    }
    const leftFace = paddle.x + paddle.w + ball.r;
    const rightFace = W - paddle.x - paddle.w - ball.r;
    const hitLeft = ball.vx < 0 && previousX >= leftFace && ball.x <= leftFace && ball.y + ball.r >= state.playerY && ball.y - ball.r <= state.playerY + paddle.h;
    const hitRight = ball.vx > 0 && previousX <= rightFace && ball.x >= rightFace && ball.y + ball.r >= state.cpuY && ball.y - ball.r <= state.cpuY + paddle.h;
    if (hitLeft) bounceFromPaddle(true); else if (hitRight) bounceFromPaddle(false);
    if (ball.x < -ball.r) score(false); else if (ball.x > W + ball.r) score(true);
  }

  function update(dt) {
    if (!running || paused) return;
    if (keys.has('w') || keys.has('arrowup')) movePlayer(-1, dt);
    if (keys.has('s') || keys.has('arrowdown')) movePlayer(1, dt);
    updateCpu(dt); updateBall(dt);
    impactFlash.player = Math.max(0, impactFlash.player - dt); impactFlash.cpu = Math.max(0, impactFlash.cpu - dt); scoreFlash = Math.max(0, scoreFlash - dt);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = scoreFlash ? '#17103d' : '#0b0923'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#5e538833'; ctx.setLineDash([12, 15]); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.setLineDash([]);
    ctx.shadowBlur = impactFlash.player ? 32 : 18; ctx.shadowColor = '#22e6ff'; ctx.fillStyle = '#dffcff'; ctx.fillRect(paddle.x, state.playerY, paddle.w, paddle.h);
    ctx.shadowBlur = impactFlash.cpu ? 32 : 18; ctx.shadowColor = '#ff3ed1'; ctx.fillStyle = '#ffd9f5'; ctx.fillRect(W - paddle.x - paddle.w, state.cpuY, paddle.w, paddle.h);
    ctx.shadowColor = '#bcff3f'; ctx.fillStyle = '#bcff3f'; ctx.beginPath(); ctx.arc(state.ball.x, state.ball.y, state.ball.r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  }

  function loop(time) {
    const dt = Math.min((time - lastTime) / 1000 || 0, .035); lastTime = time;
    update(dt); draw(); animation = requestAnimationFrame(loop);
  }
  function start() { if (gameOver) resetMatch(); running = true; paused = false; lastTime = performance.now(); ui.overlay.hidden = true; ui.pause.disabled = false; ui.pause.textContent = 'Pause'; }
  function pause() { if (!running) return; paused = !paused; ui.pause.textContent = paused ? 'Resume' : 'Pause'; ui.overlay.hidden = !paused; if (paused) { ui.title.textContent = 'PAUSED'; ui.copy.textContent = 'Take a breath, then get back in the game.'; ui.action.textContent = 'Resume'; } else lastTime = performance.now(); }
  function setPaddleFromPointer(event) { const rect = canvas.getBoundingClientRect(); const source = event.touches ? event.touches[0] : event; state.playerY = clamp((source.clientY - rect.top) * H / rect.height - paddle.h / 2, 0, H - paddle.h); }

  document.querySelectorAll('[data-level]').forEach(button => button.addEventListener('click', () => setDifficulty(button.dataset.level)));
  ui.action.addEventListener('click', start); ui.pause.addEventListener('click', pause);
  ui.restart.addEventListener('click', () => { resetMatch(); running = false; paused = false; ui.pause.disabled = true; ui.overlay.hidden = false; ui.title.textContent = 'SERVE IT UP'; ui.copy.textContent = 'First to seven wins. Keep the rally alive.'; ui.action.textContent = 'Start game'; });
  window.addEventListener('keydown', event => { const key = event.key.toLowerCase(); if (['w', 's', 'arrowup', 'arrowdown'].includes(key)) { keys.add(key); event.preventDefault(); } });
  window.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
  window.addEventListener('blur', () => keys.clear());
  document.addEventListener('visibilitychange', () => { if (document.hidden && running && !paused) pause(); });
  canvas.addEventListener('mousemove', setPaddleFromPointer); canvas.addEventListener('touchstart', event => { setPaddleFromPointer(event); event.preventDefault(); }, { passive: false }); canvas.addEventListener('touchmove', event => { setPaddleFromPointer(event); event.preventDefault(); }, { passive: false });
  [['up', -1], ['down', 1]].forEach(([id, direction]) => { const button = document.getElementById(id); const key = direction === -1 ? 'arrowup' : 'arrowdown'; const startMove = event => { event.preventDefault(); keys.add(key); }; const stopMove = () => keys.delete(key); button.addEventListener('pointerdown', startMove); ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => button.addEventListener(type, stopMove)); });
  setDifficulty(difficulty); resetBall(); draw(); animation = requestAnimationFrame(loop);
  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('../../service-worker.js', { scope: '../../' }));
})();
