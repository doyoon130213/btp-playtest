/* 전투: 움직임, 슬로우, 소나 핑, 수압 방출, 주포, 스킬 카드, 잡몹, 정예, 보스. 메뉴와는 Battle 객체로만 이어진다.
   레벨업은 반드시 스킬 선택으로 이어진다. 기준은 docs/combat-fix-spec.md다. */
(function () {
  'use strict';
  let hooks = {};

  /* ===== 기획서 수치 (탭 1, 3, 6, 7, 8, 10). 챕터 1, 산호 1호, 쌍열 작살포 기준 ===== */
  const CFG = {
    CLOCK_END: 480, ZONE_HP: 0.70, REF_ATK: 120, REF_HP: 1100, DEPTH_FROM: 0, DEPTH_END: 50,
    SPEED: 4, DRAG_DEAD: 8, DRAG_MAX: 48, INERTIA: 0.2 / 3,
    SLOW: 0.35, SLOW_IN: 0.15, SLOW_OUT: 0.08, HIT_INV: 0.5, AFK: 10,
    CAP: 300, HW: 4.5, SPAWN_MARGIN: 1, RELOCATE: 1.8, AIM_MARGIN: 0.5, TOPUP_MUL: 1.5, DMG_START: 0.4, DMG_END: 0.62, BOSS_HP: 1.6, FINAL_HP: 1.2, SUB_R: 0.45, DENSITY: 1,
    BOSSES: [], ELITES: [], BOSS_NAME: '왕집게', BOSS_WARN: 5, ARENA_R: 7,
    GUN_POWER: 0.5, GUN_INTERVAL: 0.5, GUN_RANGE: 9.5, HARPOON_SPEED: 16,
    PULL_R: 2.4,
    PRESS_R: 3.5, PRESS_MAX: 8, PRESS_HIT: 6, PRESS_DECAY: 3,
    BURST_R: 6, BURST_MULT: 3, BURST_PUSH: 4, BURST_INV: 0.5, BURST_LOCK: 5,
    PING_CD: 2, PING_SHOW: 1.5, STRESS_SECONDS: 20, STRESS_ENEMIES: 300,
  };
  const KINDS = [
    { name: '기름 해파리', hp: 0.6, speed: 1.5, dmg: 0.02, r: 0.36, xp: 1, push: 1 },
    { name: '변이 정어리', hp: 0.4, speed: 3.2, dmg: 0.02, r: 0.24, xp: 1, push: 1 },
    { name: '독성 복어', hp: 1.5, speed: 1.2, dmg: 0.03, r: 0.46, xp: 2, push: 0.7 },
    { name: '대왕 기름 해파리', hp: 45, speed: 1.2, dmg: 0.08, r: 0.72, xp: 30, push: 0.2, heavy: true },
    { name: '해파리 조각', hp: 5.6, speed: 1.7, dmg: 0.05, r: 0.46, xp: 5, push: 0.4 },
    { name: '왕집게', hp: 0, speed: 1.7, dmg: 0.05, r: 1.45, xp: 0, push: 0, heavy: true },
  ];
  const JELLY = 0, SARDINE = 1, PUFFER = 2, ELITE = 3, MINI = 4, BOSS = 5;
  const PH1 = 1 / 3, PH2 = 2 / 3;

  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, f) => a + (b - a) * f;
  const rand = (a, b) => a + Math.random() * (b - a);
  const fmt = s => { s = Math.max(0, Math.floor(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const $ = id => document.getElementById(id);
  const calm = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* 챕터 1~5의 8분 기준 표: 시계(초), 초당 흐름, 최소 유지. 다른 챕터는 진행률로 늘리고 DENSITY를 곱한다. */
  const FLOW = [[0, 6, 18], [30, 7.5, 24], [60, 8, 30], [120, 12, 45], [160, 14, 60], [240, 18, 85], [320, 24, 100], [400, 28, 115], [480, 33, 130]];
  const flowOut = { rate: 0, min: 0 };
  function flowAt(u) {
    const t = u * 480;
    for (let i = 1; i < FLOW.length; i++) {
      if (t <= FLOW[i][0]) {
        const a = FLOW[i - 1], b = FLOW[i], f = (t - a[0]) / (b[0] - a[0]);
        flowOut.rate = lerp(a[1], b[1], f) * CFG.DENSITY; flowOut.min = lerp(a[2], b[2], f) * CFG.DENSITY;
        return flowOut;
      }
    }
    flowOut.rate = 33 * CFG.DENSITY; flowOut.min = 130 * CFG.DENSITY;
    return flowOut;
  }
  function timeCoef(u) {
    if (u < PH1) return lerp(1, 1.5, u / PH1);
    if (u < PH2) return lerp(1.5, 4, (u - PH1) / (PH2 - PH1));
    return lerp(4, 4.5, (u - PH2) / (1 - PH2));
  }
  /* 시작부터 물량이 많으므로 잡몹 피해를 낮춰 시작해 진행률 67%까지 서서히 올린다. 값은 docs/combat-fix-spec.md에 있다. */
  const dmgCoef = u => lerp(CFG.DMG_START, CFG.DMG_END, Math.min(1, u / PH2));
  /* 복어는 챕터 1의 주력이 아니고 T3는 1단계 범위 밖이라, 탄을 쏘는 T2 비중을 기획서 비율보다 낮췄다. */
  const t2Share = u => (u < PH1 ? 0.05 : u < PH2 ? 0.14 : 0.20);
  /* 기획서보다 물량이 많아 필요 경험치를 늘렸다. 값은 docs/combat-fix-spec.md에 있다. */
  const xpNeed = L => (L <= 10 ? 20 + 8 * (L - 1) : Math.round((68 + 125 * Math.pow(L - 10, 0.7)) * (L <= 20 ? 1.4 : 2.2)));

  /* ===== 오브젝트 풀 ===== */
  function makePool(max, make) { const a = new Array(max); for (let i = 0; i < max; i++) a[i] = make(); return { a, n: 0, max }; }
  const E = makePool(420, () => ({ id: 0, x: 0, y: 0, vx: 0, vy: 0, px: 0, py: 0, hp: 0, maxHp: 0, kind: 0, r: 0.3, t: 0, seed: 0, flash: 0, leader: false, swell: 0, cd: 0, dead: false, heavy: false, conf: 0, slowT: 0, slowK: 0, ampT: 0, ampK: 0, stuck: 0, dazz: 0, stun: 0 }));
  const H = makePool(260, () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, pierce: 0, dmg: 0, hits: [0, 0, 0, 0, 0, 0], nHits: 0 }));
  const B = makePool(220, () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, dmg: 0.02, net: false }));
  const O = makePool(400, () => ({ x: 0, y: 0, val: 1, v: 0, pull: false }));
  const P = makePool(160, () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, r: 0.1, kind: 0 }));
  const N = makePool(18, () => ({ x: 0, y: 0, life: 0, val: 0 }));
  const C = makePool(40, () => ({ x: 0, y: 0, life: 0 }));
  const SH = makePool(24, () => ({ x: 0, y: 0, t: 0, max: 0.4, r: 6, kind: 0 }));

  /* ===== 상태 ===== */
  const G = {
    state: 'idle', mode: 'run', headless: false, chapterNo: 1, revived: false,
    P: { atk: 120, hp: 1100, speed: 4, levelHeal: 0.03, burstHeal: 0.05, xpMul: 1, subId: 'coral', pilotId: 'coral' },
    clock: 0, real: 0, ts: 1, hitStop: 0, frame: 0, rdt: 0, dt: 0,
    sub: { x: 0, y: 0, vx: 0, vy: 0, dir: 1, tilt: 0, hp: CFG.REF_HP, inv: 0, hurtT: 0 },
    cam: { x: 0, y: 0 },
    input: { active: false, id: null, kb: false, ax: 0, ay: 0, x: 0, y: 0, mx: 0, my: 0, touched: false },
    press: 0, lock: 0, near: 0, vis: 0, level: 1, xp: 0, need: xpNeed(1), fireT: 0,
    cards: 0, chestQ: [], rerolls: 1, holdCards: false, cardsSeen: 0,
    moveMul: 1, pullMul: 1, miss: 0, veil: 0, guardT: 0, guardK: 0, netT: 0, killSlow: 0, lure: { x: 0, y: 0, t: 0 },
    spawnAcc: 0, schoolAcc: 0, formT: 0, formI: 0, tutorRing: false, alive: 0, nextId: 1, opened: 0, noSpawn: false, clockStop: false, calmT: 0, bossI: 0, eliteI: 0, eliteParts: 0, ev: null, boss: null, arena: null,
    ping: { t: 99, x: 0, y: 0 }, pingCd: 0, idle: 0, cloudTick: 0, shake: 0, banner: { t: 0, text: '' }, diveT: 0, menuT: 0,
    stats: null, endKind: '', fps: 60, dpr: 1, scale: 40, viewH: 16, msSim: 0, msDraw: 0,
  };
  const newStats = () => ({ kills: 0, bursts: 0, pings: 0, hits: 0, maxAlive: 0, src: {}, cards: 0, bonusGold: 0, levelAt: {}, bossTime: [], eliteKills: 0 });
  G.stats = newStats();
  const frameLog = new Float32Array(60 * 900);
  let frameN = 0;

  function resetRun(mode) {
    E.n = H.n = B.n = O.n = P.n = N.n = C.n = SH.n = 0;
    Object.assign(G, {
      mode, clock: 0, real: 0, ts: 1, hitStop: 0, frame: 0, press: 0, lock: 0, near: 0, vis: 0, level: 1, xp: 0, need: xpNeed(1), fireT: 0.3,
      cards: 0, chestQ: [], rerolls: G.P.rerolls || 1, holdCards: false,
      veil: 0, guardT: 0, guardK: 0, netT: 0, killSlow: 0,
      spawnAcc: 0, schoolAcc: 0, formT: 25, formI: 0, tutorRing: false, tutorHold: 0, alive: 0, pingCd: 0, idle: 0, cloudTick: 0, shake: 0, endKind: '', revived: false,
      opened: 0, noSpawn: false, clockStop: false, calmT: 0, bossI: 0, eliteI: 0, eliteParts: 0, ev: null, boss: null, arena: null,
    });
    G.lure.t = 0;
    G.ping.t = 99;
    G.banner.t = 0;
    Object.assign(G.sub, { x: 0, y: 0, vx: 0, vy: 0, dir: 1, tilt: 0, hp: G.P.hp, inv: 0, hurtT: 0 });
    G.cam.x = G.cam.y = 0;
    Object.assign(G.input, { active: false, id: null, kb: false, mx: 0, my: 0, touched: false });
    G.stats = newStats();
    frameN = 0;
    if (mode === 'stress') { G.level = 20; SK.loadout(); } else SK.reset(G.P.startSkill);
  }

  /* ===== 소리: 파일 없이 합성한다 ===== */
  const Snd = {
    c: null, on: true, master: null, lp: null, noise: null, last: {},
    init() {
      if (this.c) { if (this.c.state === 'suspended') this.c.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const c = this.c = new AC();
      this.master = c.createGain(); this.master.gain.value = this.on ? 0.7 : 0; this.master.connect(c.destination);
      this.lp = c.createBiquadFilter(); this.lp.type = 'lowpass'; this.lp.frequency.value = 18000; this.lp.connect(this.master);
      const buf = c.createBuffer(1, c.sampleRate * 0.6, c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.noise = buf;
      [55, 55.7].forEach(f => { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = f; g.gain.value = 0.035; o.connect(g); g.connect(this.lp); o.start(); });
    },
    setOn(v) { this.on = v; if (this.master) this.master.gain.setTargetAtTime(v ? 0.7 : 0, this.c.currentTime, 0.02); },
    slow(v) { if (this.lp) this.lp.frequency.setTargetAtTime(v ? 520 : 18000, this.c.currentTime, v ? 0.05 : 0.02); },
    tone(key, gap, f0, f1, dur, type, vol, dry) {
      if (!this.c || G.headless) return;
      const t = this.c.currentTime;
      if (this.last[key] && t - this.last[key] < gap) return;
      this.last[key] = t;
      const o = this.c.createOscillator(), g = this.c.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(dry ? this.master : this.lp); o.start(t); o.stop(t + dur + 0.02);
    },
    click() { this.tone('click', 0.04, 620, 420, 0.06, 'triangle', 0.08, true); },
    shot() { this.tone('shot', 0.09, 1500, 500, 0.05, 'triangle', 0.035); },
    pop() { this.tone('pop', 0.05, 340, 110, 0.07, 'triangle', 0.09); },
    orb() { this.tone('orb', 0.06, 900, 1300, 0.06, 'sine', 0.04); },
    hurt() { this.tone('hurt', 0.1, 170, 70, 0.12, 'square', 0.1); },
    level() { [660, 880, 1100].forEach((f, i) => setTimeout(() => this.tone('lv' + i, 0, f, f * 1.02, 0.13, 'triangle', 0.09), i * 70)); },
    ping() { this.tone('ping', 0, 1500, 1150, 0.5, 'sine', 0.13, true); setTimeout(() => this.tone('ping2', 0, 1500, 1150, 0.4, 'sine', 0.045, true), 180); },
    burst() {
      this.tone('burst', 0.2, 170, 38, 0.55, 'sine', 0.5, true);
      if (!this.c || G.headless) return;
      const s = this.c.createBufferSource(), f = this.c.createBiquadFilter(), g = this.c.createGain(), t = this.c.currentTime;
      s.buffer = this.noise; f.type = 'lowpass'; f.frequency.setValueAtTime(2600, t); f.frequency.exponentialRampToValueAtTime(200, t + 0.5);
      g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      s.connect(f); f.connect(g); g.connect(this.master); s.start(t);
    },
  };

  /* ===== 생성 ===== */
  function addEnemy(kind, x, y, vx, vy, hpBoost) {
    if (E.n >= E.max || G.alive >= CFG.CAP) return null;
    const e = E.a[E.n++], k = KINDS[kind], u = G.clock / CFG.CLOCK_END;
    e.id = G.nextId++; e.kind = kind; e.x = x; e.y = y; e.vx = vx || 0; e.vy = vy || 0; e.px = e.py = 0;
    e.maxHp = e.hp = CFG.REF_ATK * k.hp * timeCoef(Math.min(1, u)) * CFG.ZONE_HP * (hpBoost || 1);
    e.r = k.r; e.t = 0; e.seed = Math.random() * TAU; e.flash = 0; e.leader = false; e.swell = 0; e.cd = rand(3, 7); e.dead = false;
    e.heavy = !!k.heavy; e.conf = 0; e.slowT = 0; e.slowK = 0; e.ampT = 0; e.ampK = 0; e.stuck = 0; e.dazz = 0; e.stun = 0;
    G.alive++;
    if (G.alive > G.stats.maxAlive) G.stats.maxAlive = G.alive;
    return e;
  }
  /* 잠수함 기준 각도 a 방향으로 화면 사각형 바깥 m만큼 떨어진 지점 */
  const edge = { x: 0, y: 0 };
  function edgePoint(a, m) {
    const c = Math.cos(a), n = Math.sin(a), hw = CFG.HW + m, hh = G.viewH / 2 + m;
    const k = Math.min(hw / Math.max(Math.abs(c), 1e-4), hh / Math.max(Math.abs(n), 1e-4));
    edge.x = G.sub.x + c * k; edge.y = G.sub.y + n * k;
    return edge;
  }
  function spawnOnEdge(kind) {
    const p = edgePoint(Math.random() * TAU, CFG.SPAWN_MARGIN + Math.random() * 0.8);
    return addEnemy(kind, p.x, p.y);
  }
  function sardineSchool(n) {
    const a = Math.random() * TAU, sp = KINDS[SARDINE].speed;
    const dx = -Math.cos(a), dy = -Math.sin(a), p = edgePoint(a, CFG.SPAWN_MARGIN + 0.5), sx = p.x, sy = p.y;
    for (let i = 0; i < n; i++) {
      const lat = rand(-0.5, 0.5);
      const e = addEnemy(SARDINE, sx - dx * i * 0.55 - dy * lat, sy - dy * i * 0.55 + dx * lat, dx * sp, dy * sp);
      if (e && i === 0) e.leader = true;
    }
  }
  /* 원형 포위: 세로 화면에서도 사방이 함께 보이도록 화면 가장자리를 따라 나타난다. */
  function ringFormation(n) {
    const off = Math.random() * TAU, hw = CFG.HW + 0.6, hh = G.viewH / 2 + 0.6;
    for (let i = 0; i < n; i++) {
      const a = off + i / n * TAU;
      addEnemy(JELLY, G.sub.x + Math.cos(a) * hw, G.sub.y + Math.sin(a) * hh);
    }
  }
  function wallFormation(n) {
    const a = Math.floor(Math.random() * 4) * TAU / 4 + rand(-0.15, 0.15);
    const dx = Math.cos(a), dy = Math.sin(a), sp = KINDS[SARDINE].speed;
    const dist = (Math.abs(dx) > Math.abs(dy) ? CFG.HW : G.viewH / 2) + 1.2;
    const cx = G.sub.x - dx * dist, cy = G.sub.y - dy * dist;
    const step = Math.floor(n / 8) || 1;
    for (let i = 0; i < n; i++) {
      const o = -7 + 14 * i / (n - 1 || 1), j = rand(0, 0.8);
      const e = addEnemy(SARDINE, cx - dy * o - dx * j, cy + dx * o - dy * j, dx * sp, dy * sp);
      if (e && i % step === 0) e.leader = true;
    }
  }
  function rushFormation(n) {
    const a = (Math.floor(Math.random() * 4) + 0.5) * TAU / 4;
    const dx = Math.cos(a), dy = Math.sin(a), sp = KINDS[SARDINE].speed, off = rand(-3, 3);
    const cx = G.sub.x - dy * off - dx * 12, cy = G.sub.y + dx * off - dy * 12;
    for (let i = 0; i < n; i++) {
      const along = rand(0, 9.6), lat = rand(-1.25, 1.25);
      const e = addEnemy(SARDINE, cx - dx * along - dy * lat, cy - dy * along + dx * lat, dx * sp, dy * sp);
      if (e && i % 12 === 0) e.leader = true;
    }
  }
  /* 여유 구간에는 작은 포메이션, 그 뒤에는 기획서 크기의 포메이션을 낸다. */
  function formations(u) {
    const kind = G.formI++ % 3, d = CFG.DENSITY;
    let n;
    if (u < PH1) {
      const f = u / PH1;
      if (kind === 0) { n = Math.round(lerp(16, 30, f) * d); ringFormation(n); }
      else if (kind === 1) { n = Math.round(lerp(15, 25, f) * d); wallFormation(n); }
      else { n = Math.round(lerp(10, 18, f) * d); sardineSchool(n); }
      G.spawnAcc = Math.max(-10, G.spawnAcc - n * 0.5);
      return;
    }
    const f = (u - PH1) / (1 - PH1);
    if (kind === 0) { n = Math.round(lerp(40, 80, f)); ringFormation(n); }
    else if (kind === 1) { n = Math.round(lerp(30, 60, f)); wallFormation(n); }
    else { n = 100; rushFormation(n); }
    G.spawnAcc = Math.max(-40, G.spawnAcc - n);
  }
  function addOrb(x, y, val) {
    if (O.n >= O.max) {
      let best = null, bd = 1e9;
      for (let i = 0; i < 6; i++) {
        const o = O.a[Math.floor(Math.random() * O.n)];
        const d = (o.x - x) * (o.x - x) + (o.y - y) * (o.y - y);
        if (d < bd) { bd = d; best = o; }
      }
      best.val += val;
      return;
    }
    const o = O.a[O.n++];
    o.x = x + rand(-0.12, 0.12); o.y = y + rand(-0.12, 0.12); o.val = val; o.v = 0; o.pull = false;
  }
  function addBullet(x, y, vx, vy, dmg, net) {
    if (B.n >= B.max) return;
    const b = B.a[B.n++];
    b.x = x; b.y = y; b.vx = vx; b.vy = vy; b.life = 3.5; b.dmg = dmg || 0.02; b.net = !!net;
  }
  function addHarpoon(x, y, ang, dmg, pierce) {
    if (H.n >= H.max) return;
    const h = H.a[H.n++];
    h.x = x; h.y = y; h.vx = Math.cos(ang) * CFG.HARPOON_SPEED; h.vy = Math.sin(ang) * CFG.HARPOON_SPEED;
    h.life = CFG.GUN_RANGE / CFG.HARPOON_SPEED + 0.08; h.dmg = dmg; h.pierce = pierce; h.nHits = 0;
  }
  function addCloud(x, y) {
    if (C.n >= C.max) return;
    const c = C.a[C.n++];
    c.x = x; c.y = y; c.life = 3;
  }
  function puff(x, y, n, kind, speed, r, life) {
    if (G.headless) return;
    for (let i = 0; i < n && P.n < P.max; i++) {
      const p = P.a[P.n++], a = Math.random() * TAU, s = rand(0.25, 1) * speed;
      p.x = x; p.y = y; p.vx = Math.cos(a) * s; p.vy = Math.sin(a) * s;
      p.max = p.life = life * rand(0.6, 1); p.r = r * rand(0.6, 1.1); p.kind = kind;
    }
  }
  function addNum(x, y, val) {
    if (G.headless || N.n >= N.max) return;
    const n = N.a[N.n++];
    n.x = x + rand(-0.15, 0.15); n.y = y - 0.2; n.life = 0.55; n.val = Math.round(val);
  }
  function addShock(x, y, r, max, kind) {
    if (G.headless || SH.n >= SH.max) return;
    const s = SH.a[SH.n++];
    s.x = x; s.y = y; s.r = r; s.t = 0; s.max = max; s.kind = kind;
  }

  /* ===== 전투 규칙 ===== */
  const atk = () => G.P.atk;

  function hurt(frac, soft, src) {
    const S = G.sub;
    if (G.state !== 'play') return;
    if (!soft) {
      if (S.inv > 0) return;
      S.inv = CFG.HIT_INV;
      if (G.lock <= 0) G.press = Math.min(100, G.press + CFG.PRESS_HIT);
    }
    if (G.mode === 'stress') return;
    frac *= SK.taken() * (G.boss ? 1 : dmgCoef(G.clock / CFG.CLOCK_END));
    S.hp -= CFG.REF_HP * frac;
    G.stats.src[src] = (G.stats.src[src] || 0) + CFG.REF_HP * frac;
    S.hurtT = 0.18;
    G.shake = Math.max(G.shake, 0.12);
    G.stats.hits++;
    Snd.hurt();
    if (!soft) SK.onHit();
    if (S.hp <= 0) { S.hp = 0; if (G.headless || G.revived) finish('fail'); else goDown(); }
  }
  function kill(e) {
    e.dead = true; G.alive--;
    G.stats.kills++;
    const k = KINDS[e.kind];
    if (k.xp) addOrb(e.x, e.y, k.xp);
    puff(e.x, e.y, e.kind === PUFFER ? 8 : e.heavy ? 18 : 4, e.kind === JELLY ? 2 : 1, 2.4, 0.09, 0.35);
    if (e.kind === PUFFER) addCloud(e.x, e.y);
    SK.onKill(e);
    if (e.kind === ELITE) eliteDown();
    else if (e.kind === MINI && --G.eliteParts <= 0) eliteDown();
    else if (e.kind === BOSS) bossDown(e);
    Snd.pop();
  }
  /* 대왕 기름 해파리는 체력 50%에서 4개로 나뉜다. 조각까지 다 잡으면 상자를 준다. */
  function splitElite(e) {
    e.dead = true; G.alive--;
    addShock(e.x, e.y, 1.6, 0.3, 4);
    puff(e.x, e.y, 14, 2, 3, 0.11, 0.4);
    for (let i = 0; i < 4; i++) {
      const a = e.seed + i / 4 * TAU, m = addEnemy(MINI, e.x + Math.cos(a) * 0.5, e.y + Math.sin(a) * 0.5);
      if (m) { m.hp = m.maxHp = e.maxHp * 0.125; G.eliteParts++; }
    }
    if (G.eliteParts <= 0) eliteDown();
  }
  function eliteDown() {
    G.stats.eliteKills++;
    G.chestQ.push(rollChest([[1, 90], [3, 9], [5, 1]], '정예 상자'));
  }
  function rollChest(table, name) {
    let r = Math.random() * 100, n = table[table.length - 1][0];
    for (const t of table) { if (r < t[1]) { n = t[0]; break; } r -= t[1]; }
    return { n, name };
  }
  function damage(e, amount, showNum) {
    if (e.ampT > 0) amount *= 1 + e.ampK;
    e.hp -= amount; e.flash = 0.07;
    if (showNum) addNum(e.x, e.y, amount);
    if (e.hp <= 0) kill(e);
    else if (e.kind === ELITE && e.hp <= e.maxHp * 0.5) splitElite(e);
  }
  /* 상태 효과. 혼란과 고정은 잡몹에만 걸리고, 정예와 보스는 이동 −30%와 받는 피해 증가의 절반만 받는다. */
  function slow(e, k, t) {
    if (e.heavy) k = Math.min(k, 0.3);
    if (e.slowT <= 0 || k >= e.slowK) e.slowK = k;
    e.slowT = Math.max(e.slowT, t);
  }
  function confuse(e, t) { if (!e.heavy) e.conf = Math.max(e.conf, t); }
  function amp(e, k, t) {
    if (e.heavy) k *= 0.5;
    if (e.ampT <= 0 || k >= e.ampK) e.ampK = k;
    e.ampT = Math.max(e.ampT, t);
  }
  function stick(e, t) { if (e.heavy) slow(e, 0.3, t); else e.stuck = Math.max(e.stuck, t); }
  function stun(e, t) { e.stun = Math.max(e.stun, t); }
  function knock(e, x, y, dist) {
    const dx = e.x - x, dy = e.y - y, d = Math.hypot(dx, dy) || 0.01, v = dist / 0.12 * KINDS[e.kind].push;
    e.px = dx / d * v; e.py = dy / d * v;
  }
  function gainXp(val) {
    G.xp += val * G.P.xpMul;
    while (G.xp >= G.need) {
      G.xp -= G.need; G.level++; G.need = xpNeed(G.level);
      if (G.mode === 'run') G.cards++;
      if (!G.stats.levelAt[G.level]) G.stats.levelAt[G.level] = Math.round(G.clock);
      G.sub.hp = Math.min(G.P.hp, G.sub.hp + G.P.hp * G.P.levelHeal);
      addShock(G.sub.x, G.sub.y, 1.6, 0.3, 1);
    }
  }
  function burst() {
    const S = G.sub, R2 = CFG.BURST_R * CFG.BURST_R, dmg = atk() * CFG.BURST_MULT * (1 + SK.burstBonus());
    G.press = 0; G.lock = CFG.BURST_LOCK;
    S.inv = Math.max(S.inv, CFG.BURST_INV);
    S.hp = Math.min(G.P.hp, S.hp + G.P.hp * G.P.burstHeal);
    for (let i = 0; i < E.n; i++) {
      const e = E.a[i];
      if (e.dead) continue;
      const dx = e.x - S.x, dy = e.y - S.y, d2 = dx * dx + dy * dy;
      if (d2 >= R2) continue;
      damage(e, dmg, false);
      if (!e.dead) {
        const d = Math.sqrt(d2) || 0.01, v = CFG.BURST_PUSH / 0.12 * KINDS[e.kind].push;
        e.px = dx / d * v; e.py = dy / d * v; e.swell = 0;
      }
    }
    for (let i = B.n - 1; i >= 0; i--) {
      const b = B.a[i], dx = b.x - S.x, dy = b.y - S.y;
      if (dx * dx + dy * dy < R2) { puff(b.x, b.y, 2, 2, 1.2, 0.07, 0.25); B.a[i] = B.a[--B.n]; B.a[B.n] = b; }
    }
    G.stats.bursts++;
    if (!calm) G.hitStop = 0.06;
    G.shake = 0.35;
    addShock(S.x, S.y, CFG.BURST_R, 0.38, 0);
    puff(S.x, S.y, 34, 0, 7, 0.14, 0.7);
    G.banner.t = 0.8; G.banner.text = '수압 방출';
    Snd.burst();
    coach('burst');
  }
  function firePing() {
    G.pingCd = CFG.PING_CD;
    G.ping.t = 0; G.ping.x = G.sub.x; G.ping.y = G.sub.y;
    G.stats.pings++;
    Snd.ping();
  }

  /* ===== 공간 분할 (가로세로 2m 격자) ===== */
  const CELL = 2, GW = 28;
  const gHead = new Int16Array(GW * GW), gNext = new Int16Array(E.max);
  let gOX = 0, gOY = 0;
  const gx = x => clamp(Math.floor((x - gOX) / CELL), 0, GW - 1);
  const gy = y => clamp(Math.floor((y - gOY) / CELL), 0, GW - 1);
  function buildGrid() {
    gHead.fill(-1);
    gOX = G.sub.x - GW; gOY = G.sub.y - GW;
    for (let i = 0; i < E.n; i++) {
      const e = E.a[i];
      if (e.dead) continue;
      const c = gy(e.y) * GW + gx(e.x);
      gNext[i] = gHead[c]; gHead[c] = i;
    }
  }

  /* 반경 안 적마다 fn을 부른다. 격자로 찾으므로 적이 많아도 빠르다. */
  function forNear(x, y, r, fn) {
    const span = r + 1.6, x0 = gx(x - span), x1 = gx(x + span), y0 = gy(y - span), y1 = gy(y + span);
    for (let yy = y0; yy <= y1; yy++) {
      for (let xx = x0; xx <= x1; xx++) {
        let j = gHead[yy * GW + xx];
        while (j >= 0) {
          const e = E.a[j], nx = gNext[j];
          if (!e.dead) {
            const dx = e.x - x, dy = e.y - y, rr = r + e.r;
            if (dx * dx + dy * dy < rr * rr) fn(e);
          }
          j = nx;
        }
      }
    }
  }
  function firstHit(x, y, r) {
    const cx = gx(x), cy = gy(y);
    for (let yy = Math.max(0, cy - 1); yy <= Math.min(GW - 1, cy + 1); yy++) {
      for (let xx = Math.max(0, cx - 1); xx <= Math.min(GW - 1, cx + 1); xx++) {
        let j = gHead[yy * GW + xx];
        while (j >= 0) {
          const e = E.a[j];
          if (!e.dead) {
            const dx = e.x - x, dy = e.y - y, rr = r + e.r;
            if (dx * dx + dy * dy < rr * rr) return e;
          }
          j = gNext[j];
        }
      }
    }
    return null;
  }
  const anyNear = (x, y, r) => !!firstHit(x, y, r);
  const onScreen = e => Math.abs(e.x - G.sub.x) < CFG.HW + CFG.AIM_MARGIN && Math.abs(e.y - G.sub.y) < G.viewH / 2 + CFG.AIM_MARGIN;
  function nearest(x, y) {
    let best = null, bd = 1e9;
    for (let i = 0; i < E.n; i++) {
      const e = E.a[i];
      if (e.dead || !onScreen(e)) continue;
      const dx = e.x - x, dy = e.y - y, d2 = dx * dx + dy * dy;
      if (d2 < bd) { bd = d2; best = e; }
    }
    return best;
  }
  function nearestFree(x, y) {
    let best = null, bd = 1e9;
    for (let i = 0; i < E.n; i++) {
      const e = E.a[i];
      if (e.dead || e.stuck > 0 || !onScreen(e)) continue;
      const dx = e.x - x, dy = e.y - y, d2 = dx * dx + dy * dy;
      if (d2 < bd) { bd = d2; best = e; }
    }
    return best;
  }
  function randomOnScreen() {
    if (!E.n) return null;
    const start = Math.floor(Math.random() * E.n);
    for (let k = 0; k < E.n; k++) {
      const e = E.a[(start + k) % E.n];
      if (!e.dead && onScreen(e)) return e;
    }
    return null;
  }
  /* 무작위 후보 6체 중 주변이 가장 빽빽한 적 */
  function densest() {
    let best = null, bn = -1;
    for (let i = 0; i < 6; i++) {
      const e = randomOnScreen();
      if (!e) break;
      let n = 0;
      forNear(e.x, e.y, 2, () => { n++; });
      if (n > bn) { bn = n; best = e; }
    }
    return best;
  }
  function clearBullets(x, y, r) {
    const R2 = r * r;
    for (let i = B.n - 1; i >= 0; i--) {
      const b = B.a[i], dx = b.x - x, dy = b.y - y;
      if (dx * dx + dy * dy < R2) { puff(b.x, b.y, 2, 2, 1.2, 0.07, 0.25); B.a[i] = B.a[--B.n]; B.a[B.n] = b; }
    }
  }
  function pullAllOrbs() { for (let i = 0; i < O.n; i++) O.a[i].pull = true; }

  /* ===== 시뮬레이션 ===== */
  function updateSpawns(dt, u) {
    if (G.mode === 'stress') {
      while (G.alive < CFG.STRESS_ENEMIES) {
        const r = Math.random();
        const a = Math.random() * TAU, R = rand(5, 10);
        addEnemy(r < 0.6 ? JELLY : r < 0.7 ? SARDINE : PUFFER, G.sub.x + Math.cos(a) * R, G.sub.y + Math.sin(a) * R, -Math.cos(a) * 3.2, -Math.sin(a) * 3.2);
      }
      return;
    }
    if (G.noSpawn) return;
    /* 시작 직후부터 사방에서 몰려온다 */
    if (G.opened === 0) { G.opened = 1; ringFormation(Math.round(12 * CFG.DENSITY)); }
    if (G.opened === 1 && G.clock >= 20) { G.opened = 2; sardineSchool(10); }
    if (G.chapterNo === 1 && !G.tutorRing && G.clock >= 45) {
      // 챕터 1의 수압 고리 안내: 첫 포위에서 방출을 반드시 겪도록 고리를 미리 채우고 8초 안에 터뜨린다.
      G.tutorRing = true; ringFormation(40); G.spawnAcc -= 12;
      G.press = Math.max(G.press, 55); G.tutorHold = 8;
      coach('press');
    }
    G.formT -= dt;
    if (G.formT <= 0) { G.formT = u < PH1 ? 40 : u < PH2 ? 45 : 30; formations(u); }
    const f = flowAt(u);
    G.spawnAcc += f.rate * dt;
    /* 최소 유지: 플레이어가 강해져도 화면이 비지 않게 화면 안 적이 모자란 만큼 빠르게 채운다. */
    if (G.calmT > 0) G.calmT -= dt;
    else if (G.vis < f.min) G.spawnAcc += Math.min(f.rate * CFG.TOPUP_MUL, (f.min - G.vis) * 2) * dt;
    const t2 = t2Share(u);
    while (G.spawnAcc >= 1) {
      if (G.alive >= CFG.CAP) { G.spawnAcc = Math.min(G.spawnAcc, 3); break; }
      G.spawnAcc -= 1;
      const r = Math.random();
      if (r < t2) spawnOnEdge(PUFFER);
      else if (r < t2 + (1 - t2) * 0.3) {
        G.schoolAcc++;
        if (G.schoolAcc >= 6) { sardineSchool(G.schoolAcc); G.schoolAcc = 0; }
      } else spawnOnEdge(JELLY);
    }
  }
  function updateEnemies(dt) {
    const S = G.sub, R2 = CFG.PRESS_R * CFG.PRESS_R, far = CFG.RELOCATE, lured = G.lure.t > 0;
    const farX = CFG.HW + far, farY = G.viewH / 2 + far, visX = CFG.HW, visY = G.viewH / 2;
    let near = 0, vis = 0;
    for (let i = 0; i < E.n; i++) {
      const e = E.a[i];
      if (e.dead) continue;
      e.t += dt;
      if (e.flash > 0) e.flash -= dt;
      if (e.conf > 0) e.conf -= dt;
      if (e.slowT > 0) e.slowT -= dt;
      if (e.ampT > 0) e.ampT -= dt;
      if (e.stuck > 0) e.stuck -= dt;
      if (e.dazz > 0) e.dazz -= dt;
      const dx = S.x - e.x, dy = S.y - e.y, d2 = dx * dx + dy * dy, d = Math.sqrt(d2) || 0.001;
      const pushed = e.px !== 0 || e.py !== 0;
      if (pushed) {
        e.x += e.px * dt; e.y += e.py * dt;
        const k = Math.exp(-dt / 0.12);
        e.px *= k; e.py *= k;
        if (e.px * e.px + e.py * e.py < 0.25) { e.px = 0; e.py = 0; }
      }
      const mul = (e.slowT > 0 ? 1 - e.slowK : 1) * (e.conf > 0 ? 0.6 : 1) * (e.stuck > 0 ? 0 : 1);
      if (e.kind === BOSS) {
        // 보스는 패턴이 직접 움직인다.
      } else if (e.kind === SARDINE) {
        if (!pushed) { e.x += e.vx * dt * mul; e.y += e.vy * dt * mul; }
        if (e.t > 9) { e.dead = true; G.alive--; continue; }
      } else {
        if (Math.abs(dx) > farX || Math.abs(dy) > farY) {
          // 뒤처진 적은 잠수함이 가는 쪽 화면 가장자리로 옮겨 화면이 비지 않게 한다.
          const a = Math.hypot(S.vx, S.vy) > 1 ? Math.atan2(S.vy, S.vx) + rand(-1.3, 1.3) : Math.random() * TAU;
          const p = edgePoint(a, CFG.SPAWN_MARGIN + Math.random() * 0.8);
          e.x = p.x; e.y = p.y;
          continue;
        }
        if (!pushed) {
          const k = KINDS[e.kind];
          // 먹물 장막 중에는 구름을 쫓는다. 혼란에 빠지면 제멋대로 움직인다.
          const tx = lured && !e.heavy ? G.lure.x : S.x, ty = lured && !e.heavy ? G.lure.y : S.y;
          let cx = tx - e.x, cy = ty - e.y, cd = Math.hypot(cx, cy) || 0.001;
          if (e.conf > 0) { const a = e.seed + e.t * 2.3; cx = Math.cos(a); cy = Math.sin(a); cd = 1; }
          if (e.kind !== PUFFER) {
            const v = k.speed * (0.7 + 0.6 * Math.sin(e.t * 3 + e.seed)) * mul;
            e.x += cx / cd * v * dt; e.y += cy / cd * v * dt;
          } else if (e.swell > 0) {
            e.swell -= dt;
            if (e.swell <= 0) {
              for (let b = 0; b < 6; b++) {
                if (e.dazz > 0 && Math.random() < G.miss) continue;
                const a = e.seed + b / 6 * TAU;
                addBullet(e.x, e.y, Math.cos(a) * 3.6, Math.sin(a) * 3.6);
              }
              e.cd = rand(8, 11);
            }
          } else {
            e.cd -= dt;
            if (e.cd <= 0 && d < 6.5 && e.conf <= 0) e.swell = 1;
            else if (d > 3 || lured) { e.x += cx / cd * k.speed * mul * dt; e.y += cy / cd * k.speed * mul * dt; }
          }
        }
      }
      if (Math.abs(dx) < visX && Math.abs(dy) < visY) vis++;
      if (d2 < R2 && e.kind !== BOSS) near++;
      if (d < e.r + CFG.SUB_R * 0.85 && e.conf <= 0) {
        if (!(e.dazz > 0 && Math.random() < G.miss)) hurt(KINDS[e.kind].dmg, false, KINDS[e.kind].name);
      }
    }
    G.near = near; G.vis = vis;
    // 적끼리는 약한 밀어내기만 적용한다. 프레임마다 절반씩 번갈아 처리한다.
    const nGrid = E.n, f = Math.min(1, dt * 6);
    for (let i = (G.frame & 1); i < nGrid; i += 2) {
      const a = E.a[i];
      if (a.dead || a.kind === SARDINE) continue;
      const cx = gx(a.x), cy = gy(a.y);
      let checks = 0;
      for (let yy = Math.max(0, cy - 1); yy <= Math.min(GW - 1, cy + 1) && checks < 12; yy++) {
        for (let xx = Math.max(0, cx - 1); xx <= Math.min(GW - 1, cx + 1) && checks < 12; xx++) {
          let j = gHead[yy * GW + xx];
          while (j >= 0 && checks < 12) {
            if (j !== i && j < nGrid) {
              const b = E.a[j];
              if (!b.dead && b.kind !== SARDINE) {
                const dx = a.x - b.x, dy = a.y - b.y, rr = a.r + b.r, d2 = dx * dx + dy * dy;
                if (d2 < rr * rr && d2 > 1e-6) {
                  const d = Math.sqrt(d2), k = (rr - d) / d * f;
                  a.x += dx * k; a.y += dy * k;
                }
                checks++;
              }
            }
            j = gNext[j];
          }
        }
      }
    }
  }
  /* 주포는 쌍열 작살포 고정값이다. 강해지는 길은 스킬 카드뿐이다. 화면 안 적만 노린다. */
  function updateGun(dt) {
    G.fireT -= dt;
    if (G.fireT > 0) return;
    const S = G.sub, best = nearest(S.x, S.y);
    if (!best) { G.fireT = 0; return; }
    const base = Math.atan2(best.y - S.y, best.x - S.x), dmg = atk() * CFG.GUN_POWER;
    G.fireT = CFG.GUN_INTERVAL;
    addHarpoon(S.x + Math.sin(base) * 0.12, S.y - Math.cos(base) * 0.12, base, dmg, 0);
    addHarpoon(S.x - Math.sin(base) * 0.12, S.y + Math.cos(base) * 0.12, base, dmg, 0);
    Snd.shot();
  }
  function updateHarpoons(dt) {
    for (let i = H.n - 1; i >= 0; i--) {
      const h = H.a[i];
      h.x += h.vx * dt; h.y += h.vy * dt; h.life -= dt;
      let gone = h.life <= 0;
      if (!gone) {
        const cx = gx(h.x), cy = gy(h.y);
        outer:
        for (let yy = Math.max(0, cy - 1); yy <= Math.min(GW - 1, cy + 1); yy++) {
          for (let xx = Math.max(0, cx - 1); xx <= Math.min(GW - 1, cx + 1); xx++) {
            let j = gHead[yy * GW + xx];
            while (j >= 0) {
              const e = E.a[j];
              if (!e.dead) {
                const dx = e.x - h.x, dy = e.y - h.y, rr = e.r + 0.12;
                if (dx * dx + dy * dy < rr * rr) {
                  let seen = false;
                  for (let q = 0; q < h.nHits; q++) if (h.hits[q] === e.id) seen = true;
                  if (!seen) {
                    if (h.nHits < h.hits.length) h.hits[h.nHits++] = e.id;
                    damage(e, h.dmg, true);
                    puff(h.x, h.y, 1, 1, 1.5, 0.06, 0.2);
                    if (--h.pierce < 0) { gone = true; break outer; }
                  }
                }
              }
              j = gNext[j];
            }
          }
        }
      }
      if (gone) { H.a[i] = H.a[--H.n]; H.a[H.n] = h; }
    }
  }
  function updateBullets(dt) {
    const S = G.sub;
    for (let i = B.n - 1; i >= 0; i--) {
      const b = B.a[i];
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      const dx = b.x - S.x, dy = b.y - S.y;
      let gone = b.life <= 0;
      if (!gone && dx * dx + dy * dy < 0.36 && S.inv <= 0) { hurt(b.dmg, false, b.net ? '그물' : '탄'); if (b.net) G.netT = 2; gone = true; }
      if (gone) { B.a[i] = B.a[--B.n]; B.a[B.n] = b; }
    }
    G.cloudTick -= dt;
    for (let i = C.n - 1; i >= 0; i--) {
      const c = C.a[i];
      c.life -= dt;
      const dx = c.x - S.x, dy = c.y - S.y;
      if (dx * dx + dy * dy < 1.44 && G.cloudTick <= 0) { G.cloudTick = 0.5; hurt(0.003, true, '독 구름'); }
      if (c.life <= 0) { C.a[i] = C.a[--C.n]; C.a[C.n] = c; }
    }
  }
  function updateOrbs(dt) {
    const S = G.sub, pullR = CFG.PULL_R * G.pullMul, pull2 = pullR * pullR;
    for (let i = O.n - 1; i >= 0; i--) {
      const o = O.a[i], dx = S.x - o.x, dy = S.y - o.y, d2 = dx * dx + dy * dy;
      if (!o.pull && d2 < pull2) o.pull = true;
      let gone = false;
      if (o.pull) {
        o.v = Math.min(18, o.v + 42 * dt);
        const d = Math.sqrt(d2) || 0.001;
        o.x += dx / d * o.v * dt; o.y += dy / d * o.v * dt;
        if (d2 < 0.2) { gainXp(o.val); SK.onOrb(); Snd.orb(); gone = true; }
      } else if (d2 > 900) gone = true;
      if (gone) { O.a[i] = O.a[--O.n]; O.a[O.n] = o; }
    }
  }
  function updatePressure(dt) {
    if (G.lock > 0) { G.lock -= dt; G.press = 0; return; }
    if (G.tutorHold > 0) { G.tutorHold -= dt; G.press += 6 * dt; }
    if (G.near > 0) G.press += Math.min(CFG.PRESS_MAX, G.near) * dt;
    else if (G.tutorHold <= 0) G.press = Math.max(0, G.press - CFG.PRESS_DECAY * dt);
    if (G.press >= 25) coach('press');
    if (G.press >= 100) burst();
  }
  function compact() {
    for (let i = E.n - 1; i >= 0; i--) {
      if (E.a[i].dead) { const t = E.a[i]; E.a[i] = E.a[E.n - 1]; E.a[E.n - 1] = t; E.n--; }
    }
  }
  function simulate(dt) {
    const S = G.sub;
    if (!G.clockStop) G.clock = Math.min(CFG.CLOCK_END, G.clock + dt);
    const u = Math.min(1, G.clock / CFG.CLOCK_END);
    S.x += S.vx * dt; S.y += S.vy * dt;
    if (S.inv > 0) S.inv -= dt;
    if (G.netT > 0) G.netT -= dt;
    if (G.arena) keepInArena();
    buildGrid();
    updateSpawns(dt, u);
    updateBossFlow(dt);
    updateBoss(dt);
    updateEnemies(dt);
    updateGun(dt);
    updateHarpoons(dt);
    SK.tick(dt);
    updateBullets(dt);
    updateOrbs(dt);
    updatePressure(dt);
    compact();
  }

  /* ===== 정예와 보스 (기획서 탭 7의 순서) ===== */
  function spawnElite() {
    const e = spawnOnEdge(ELITE);
    if (e) showAlert('정예 출현', 'gold', 1.4);
  }
  function setAlarm(on) { if (!G.headless) stage.classList.toggle('alarm', on); }
  function showAlert(text, cls, secs) {
    if (G.headless) return;
    const el = ui.alert;
    el.textContent = text; el.className = 'ribbon show ' + (cls || '');
    el.hidden = false;
    clearTimeout(alertTimer);
    alertTimer = setTimeout(() => { el.hidden = true; }, secs * 1000);
  }
  let alertTimer = 0;
  function updateBossFlow(dt) {
    if (G.mode !== 'run') return;
    const el = CFG.ELITES[G.eliteI];
    if (el !== undefined && !G.ev && G.clock >= el) { G.eliteI++; spawnElite(); }
    if (!G.ev) {
      const d = CFG.BOSSES[G.bossI];
      if (d && G.clock >= d.at - CFG.BOSS_WARN) {
        G.ev = { d, phase: 'warn', t: CFG.BOSS_WARN, siren: 0 };
        G.noSpawn = true;
        setAlarm(true);
        if (!G.headless) ui.coach.classList.remove('show');
        showAlert('보스 접근', 'red', CFG.BOSS_WARN);
      }
      return;
    }
    const ev = G.ev;
    ev.t -= dt;
    if (ev.phase === 'warn') {
      ev.siren -= dt;
      if (ev.siren <= 0) { ev.siren = 1; Snd.tone('siren', 0.2, 520, 300, 0.5, 'square', 0.07, true); }
      if (ev.t <= 0) sweepField(ev);
    } else if (ev.phase === 'sweep') {
      if (ev.t <= 0) { raiseArena(); ev.phase = 'arena'; ev.t = 0.5; }
    } else if (ev.phase === 'arena') {
      if (ev.t <= 0) {
        spawnBoss(ev.d);
        ev.phase = 'name'; ev.t = 1.5;
        showAlert(G.boss.name, 'red', 1.5);
      }
    } else if (ev.phase === 'name') {
      if (ev.t <= 0) { ev.phase = 'fight'; G.holdCards = false; G.boss.act = 'walk'; G.boss.t = 1.2; }
    } else if (ev.phase === 'dying') {
      if (ev.t <= 0) {
        G.arena = null;
        if (ev.d.final) { finish('clear'); return; }
        G.holdCards = false;
        ev.phase = 'rest'; ev.t = 3;
      }
    } else if (ev.phase === 'rest') {
      if (ev.t <= 0) { G.ev = null; G.noSpawn = false; G.calmT = 20; }
    }
  }
  /* 등장 순간: 충격파로 잡몹을 지우고 구슬은 전부 플레이어에게 준다. */
  function sweepField(ev) {
    const S = G.sub;
    G.clock = ev.d.at; G.clockStop = true; G.holdCards = true;
    setAlarm(false);
    for (let i = 0; i < E.n; i++) { const e = E.a[i]; if (!e.dead) { e.dead = true; G.alive--; G.stats.kills++; if (KINDS[e.kind].xp) addOrb(e.x, e.y, KINDS[e.kind].xp); } }
    G.eliteParts = 0;
    B.n = 0; C.n = 0;
    pullAllOrbs();
    G.press = 0; G.lock = 0;
    addShock(S.x, S.y, 14, 0.6, 0);
    puff(S.x, S.y, 40, 0, 9, 0.16, 0.8);
    G.shake = 0.45;
    Snd.burst();
    ev.phase = 'sweep'; ev.t = 1;
  }
  function raiseArena() {
    const S = G.sub;
    G.arena = { x: S.x, y: S.y, r: CFG.ARENA_R };
    addShock(S.x, S.y, CFG.ARENA_R, 0.4, 3);
  }
  function keepInArena() {
    const S = G.sub, A0 = G.arena, dx = S.x - A0.x, dy = S.y - A0.y, d = Math.hypot(dx, dy), lim = A0.r - CFG.SUB_R;
    if (d <= lim) return;
    S.x = A0.x + dx / d * lim; S.y = A0.y + dy / d * lim;
    S.vx = -dx / d * 5; S.vy = -dy / d * 5;
    hurt(0.05, false, '기포 장벽');
  }
  function spawnBoss(d) {
    const A0 = G.arena, e = addEnemy(BOSS, A0.x, A0.y - 5);
    if (!e) return;
    e.maxHp = e.hp = CFG.REF_ATK * d.hp * CFG.ZONE_HP * (d.final ? CFG.FINAL_HP : CFG.BOSS_HP);
    G.boss = { e, name: d.final ? CFG.BOSS_NAME : '왕집게', pats: d.final ? ['sweep', 'dash', 'net'] : ['sweep', 'dash'], i: 0, act: 'idle', t: 0, ang: 0, hit: false, started: G.real };
    if (!G.headless) { show(ui.bossBar, true); ui.bossName.textContent = G.boss.name; ui.bossFill.style.transform = 'scaleX(1)'; }
  }
  function bossDown(e) {
    const b = G.boss, ev = G.ev;
    G.stats.bossTime.push(Math.round(G.real - b.started));
    G.boss = null;
    if (!G.headless) show(ui.bossBar, false);
    G.killSlow = 1; G.clockStop = false;
    G.shake = 0.6;
    addShock(e.x, e.y, 8, 0.7, 4);
    puff(e.x, e.y, 46, 1, 8, 0.16, 0.9);
    Snd.burst();
    if (ev) { ev.phase = 'dying'; ev.t = 0.2; G.holdCards = true; }
    G.bossI++;
    if (!(ev && ev.d.final)) G.chestQ.push(rollChest([[1, 45], [3, 50], [5, 5]], '보스 상자'));
  }
  /* 왕집게 패턴: ① 집게 쓸기 ② 돌진 ③ 그물 투척. 중간 보스는 ③을 쓰지 않는다. 피해는 기준 내구도 대비다. */
  const SWEEP_R = 4.4, SWEEP_ARC = Math.PI / 3;
  function updateBoss(dt) {
    const b = G.boss;
    if (!b) return;
    const e = b.e, S = G.sub;
    if (e.dead) return;
    const dx = S.x - e.x, dy = S.y - e.y, d = Math.hypot(dx, dy) || 0.01;
    if (e.stun > 0) { e.stun -= dt; return; }
    if (b.act === 'idle') return;
    b.t -= dt;
    const mul = e.slowT > 0 ? 1 - e.slowK : 1;
    if (b.act === 'walk') {
      if (d > 2) { e.x += dx / d * KINDS[BOSS].speed * mul * dt; e.y += dy / d * KINDS[BOSS].speed * mul * dt; }
      if (b.t <= 0) {
        const p = b.pats[b.i++ % b.pats.length];
        b.ang = Math.atan2(dy, dx); b.hit = false;
        if (p === 'sweep') { b.act = 'sweepW'; b.t = 0.8; }
        else if (p === 'dash') { b.act = 'dashW'; b.t = 1; }
        else { b.act = 'netW'; b.t = 0.6; }
      }
    } else if (b.act === 'sweepW') {
      if (b.t <= 0) {
        let diff = Math.atan2(dy, dx) - b.ang;
        while (diff > Math.PI) diff -= TAU;
        while (diff < -Math.PI) diff += TAU;
        if (d < SWEEP_R && Math.abs(diff) < SWEEP_ARC) hurt(0.15, false, '집게 쓸기');
        addShock(e.x + Math.cos(b.ang) * 2, e.y + Math.sin(b.ang) * 2, 2.4, 0.22, 4);
        G.shake = Math.max(G.shake, 0.2);
        b.act = 'rest'; b.t = 0.7;
      }
    } else if (b.act === 'dashW') {
      if (b.t <= 0) { b.act = 'dash'; b.t = 1; Snd.tone('dash', 0.2, 120, 400, 0.25, 'sawtooth', 0.1); }
    } else if (b.act === 'dash') {
      e.x += Math.cos(b.ang) * 14 * dt; e.y += Math.sin(b.ang) * 14 * dt;
      if (!b.hit && d < e.r + 0.6) { b.hit = true; hurt(0.18, false, '돌진'); }
      const A0 = G.arena;
      if (A0 && Math.hypot(e.x - A0.x, e.y - A0.y) > A0.r - e.r) {
        e.x -= Math.cos(b.ang) * 14 * dt; e.y -= Math.sin(b.ang) * 14 * dt;
        G.shake = 0.4; addShock(e.x, e.y, 3, 0.3, 4);
        e.stun = 2; b.act = 'rest'; b.t = 0.6;
      } else if (b.t <= 0) { b.act = 'rest'; b.t = 0.6; }
    } else if (b.act === 'netW') {
      if (b.t <= 0) {
        for (const off of [-0.34, 0, 0.34]) addBullet(e.x, e.y, Math.cos(b.ang + off) * 7, Math.sin(b.ang + off) * 7, 0.08, true);
        b.act = 'rest'; b.t = 0.6;
      }
    } else if (b.act === 'rest') {
      if (b.t <= 0) { b.act = 'walk'; b.t = 1.6; }
    }
    const A0 = G.arena;
    if (A0) {
      const ax = e.x - A0.x, ay = e.y - A0.y, ad = Math.hypot(ax, ay), lim = A0.r - e.r * 0.8;
      if (ad > lim) { e.x = A0.x + ax / ad * lim; e.y = A0.y + ay / ad * lim; }
    }
  }
  function updateInputMotion(rdt) {
    const I = G.input, S = G.sub;
    let tx = 0, ty = 0;
    const sp = G.P.speed * G.moveMul * (G.netT > 0 ? 0.5 : 1);
    if (I.active) { tx = I.mx * sp; ty = I.my * sp; }
    const k = 1 - Math.exp(-rdt / CFG.INERTIA);
    S.vx += (tx - S.vx) * k; S.vy += (ty - S.vy) * k;
    if (Math.abs(S.vx) > 0.2) S.dir = S.vx > 0 ? 1 : -1;
    const wantTilt = clamp(S.vy / G.P.speed, -1, 1) * 0.32 * S.dir;
    S.tilt += (wantTilt - S.tilt) * (1 - Math.exp(-rdt * 10));
    if (S.hurtT > 0) S.hurtT -= rdt;
  }
  function step(rdt) {
    G.rdt = rdt;
    G.frame++;
    const I = G.input;
    if (G.mode === 'stress' && !G.headless) {
      const a = G.real * 0.6;
      I.active = true; I.mx = Math.cos(a) * 0.8; I.my = Math.sin(a) * 0.8;
    }
    updateInputMotion(rdt);
    if (G.killSlow > 0) G.killSlow -= rdt;
    const target = G.killSlow > 0 ? 0.2 : I.active ? 1 : CFG.SLOW;
    const span = 1 - CFG.SLOW;
    if (G.ts > target) G.ts = Math.max(target, G.ts - span / CFG.SLOW_IN * rdt);
    else G.ts = Math.min(target, G.ts + span / CFG.SLOW_OUT * rdt);
    if (G.pingCd > 0) G.pingCd -= rdt;
    G.ping.t += rdt;
    G.real += rdt;
    if (!I.active && G.mode === 'run' && !G.headless) {
      G.idle += rdt;
      if (G.idle >= CFG.AFK) { pause('10초 동안 입력이 없어 멈췄습니다.'); return; }
    } else G.idle = 0;
    if (G.hitStop > 0) { G.hitStop -= rdt; G.dt = 0; return; }
    const dt = rdt * G.ts;
    G.dt = dt;
    simulate(dt);
    if (G.mode === 'stress' && G.real >= CFG.STRESS_SECONDS) finish('stress');
    if (G.state === 'play' && !G.holdCards && (G.cards > 0 || G.chestQ.length)) openReward();
  }

  /* ===== 레벨업 = 스킬 선택. 카드를 고를 때까지 시뮬레이션을 멈춘다. ===== */
  function botPick(cards) {
    let best = cards[0], bs = -1;
    for (const c of cards) {
      const s = Math.random() + (c.gold ? 0.6 : 0) + (c.kind === 'attack' ? 0.3 : c.kind === 'summon' ? 0.25 : 0) + (c.lv > 0 ? 0.2 : 0) - (c.filler ? 2 : 0);
      if (s > bs) { bs = s; best = c; }
    }
    return best.id;
  }
  function openReward() {
    if (G.headless) {
      while (G.chestQ.length) { const c = G.chestQ.shift(); if (!SK.upgradeRandom(c.n).length) G.stats.bonusGold += 100; }
      while (G.cards > 0) { SK.apply(botPick(SK.roll())); G.cards--; G.stats.cards++; }
      return;
    }
    clearInput();
    setSlowLook(false);
    show(ui.alert, false);
    G.state = 'levelup';
    updateHud(true);
    Snd.level();
    nextReward();
  }
  function nextReward() {
    if (G.chestQ.length) {
      const c = G.chestQ.shift(), got = SK.upgradeRandom(c.n);
      if (!got.length) G.stats.bonusGold += 100;
      if (hooks.onChest) hooks.onChest({ name: c.name, n: c.n, got, slots: SK.list() });
      return;
    }
    if (G.cards > 0) { showCards(); return; }
    G.state = 'play'; G.idle = 0;
    G.sub.inv = Math.max(G.sub.inv, 0.6);
    setSlowLook(true);
    last = performance.now();
    if (hooks.onRewardEnd) hooks.onRewardEnd(SK.list());
  }
  function showCards() {
    if (hooks.onLevelUp) hooks.onLevelUp({ level: G.level - G.cards + 1, cards: SK.roll(), slots: SK.list(), rerolls: G.rerolls, more: G.cards - 1 });
  }
  function pickSkill(id) {
    if (G.state !== 'levelup' || G.cards <= 0) return;
    SK.apply(id);
    G.cards--;
    G.stats.cards++;
    nextReward();
  }
  function rerollCards() {
    if (G.state !== 'levelup' || G.cards <= 0 || G.rerolls <= 0) return;
    G.rerolls--;
    showCards();
  }
  function closeChest() { if (G.state === 'levelup') nextReward(); }

  /* ===== 입력 ===== */
  const stage = $('stage'), cv = $('cv');
  function toStage(e) { const r = stage.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function updateDrag() {
    const I = G.input;
    let dx = I.x - I.ax, dy = I.y - I.ay, m = Math.hypot(dx, dy);
    if (m > CFG.DRAG_MAX) {
      // 기준점이 손가락을 따라와야 방향 전환이 바로 먹는다.
      I.ax = I.x - dx / m * CFG.DRAG_MAX; I.ay = I.y - dy / m * CFG.DRAG_MAX;
      dx = I.x - I.ax; dy = I.y - I.ay; m = CFG.DRAG_MAX;
    }
    if (m <= CFG.DRAG_DEAD) { I.mx = 0; I.my = 0; return; }
    const f = (m - CFG.DRAG_DEAD) / (CFG.DRAG_MAX - CFG.DRAG_DEAD);
    I.mx = dx / m * f; I.my = dy / m * f;
  }
  function pressInput(p, id) {
    const I = G.input;
    I.active = true; I.id = id; I.kb = false; I.ax = I.x = p.x; I.ay = I.y = p.y; I.mx = I.my = 0; I.touched = true;
    G.idle = 0;
    setSlowLook(false);
  }
  function releaseInput() {
    const I = G.input;
    if (!I.active) return;
    I.active = false; I.id = null; I.kb = false; I.mx = I.my = 0;
    if (G.state === 'play' && G.mode === 'run') {
      setSlowLook(true);
      if (G.pingCd <= 0) firePing();
      coach('ping');
    }
  }
  stage.addEventListener('pointerdown', e => {
    if (e.target.closest && e.target.closest('button')) return;
    if (G.state === 'paused') resume();
    if (G.state !== 'play' && G.state !== 'dive') return;
    if (G.mode !== 'run' || G.input.active) return;
    e.preventDefault();
    try { stage.setPointerCapture(e.pointerId); } catch (err) { /* 캡처가 안 되어도 조작은 된다 */ }
    Snd.init();
    pressInput(toStage(e), e.pointerId);
  });
  stage.addEventListener('pointermove', e => {
    const I = G.input;
    if (!I.active || I.id !== e.pointerId) return;
    const p = toStage(e);
    I.x = p.x; I.y = p.y;
    updateDrag();
  });
  const endPointer = e => { if (G.input.id === e.pointerId) releaseInput(); };
  stage.addEventListener('pointerup', endPointer);
  stage.addEventListener('pointercancel', endPointer);
  stage.addEventListener('contextmenu', e => e.preventDefault());

  const keys = new Set();
  const KEYMAP = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1], KeyA: [-1, 0], KeyD: [1, 0], KeyW: [0, -1], KeyS: [0, 1] };
  function applyKeys() {
    const I = G.input;
    let mx = 0, my = 0;
    keys.forEach(k => { mx += KEYMAP[k][0]; my += KEYMAP[k][1]; });
    const m = Math.hypot(mx, my);
    if (keys.size && (G.state === 'play' || G.state === 'dive') && G.mode === 'run') {
      if (!I.active) { I.active = true; I.kb = true; I.id = null; I.touched = true; G.idle = 0; setSlowLook(false); }
      if (I.kb) { I.mx = m ? mx / m : 0; I.my = m ? my / m : 0; }
    } else if (!keys.size && I.active && I.kb) releaseInput();
  }
  addEventListener('keydown', e => {
    if (KEYMAP[e.code]) {
      e.preventDefault();
      if (G.state === 'paused' && !e.repeat) resume();
      Snd.init();
      keys.add(e.code); applyKeys();
    } else if ((e.code === 'Escape' || e.code === 'KeyP') && !e.repeat) {
      if (G.state === 'play') pause();
      else if (G.state === 'paused') resume();
    }
  });
  addEventListener('keyup', e => { if (KEYMAP[e.code]) { keys.delete(e.code); applyKeys(); } });

  /* ===== 전투 화면 ===== */
  const ui = {
    hud: $('hud'), perf: $('perf'), coach: $('coach'), pause: $('pausePanel'), shade: $('shade'),
    hpText: $('hpText'), hpFill: $('hpFill'), depth: $('depth'), clock: $('clock'), goal: $('goal'), lv: $('lvText'), xpFill: $('xpFill'),
    pauseWhy: $('pauseWhy'), alert: $('alert'), bossBar: $('bossBar'), bossName: $('bossName'), bossFill: $('bossFill'),
  };
  const COACH = {
    move: '화면 아무 곳이나 눌러서 끌면 움직입니다. 공격은 자동입니다.',
    ping: '손을 떼면 느려지고, 소나가 적 탄과 돌진 경로를 보여줍니다.',
    press: '포위되면 둘레 고리가 찹니다. 가득 차면 자동으로 터집니다.',
    burst: '수압 방출. 주변 적을 밀어내고 탄을 지웠습니다.',
  };
  const coachSeen = {};
  let coachTimer = 0;
  function coach(key) {
    if (G.headless || coachSeen[key] || G.boss || G.ev) return;
    coachSeen[key] = true;
    ui.coach.textContent = COACH[key];
    ui.coach.classList.add('show');
    clearTimeout(coachTimer);
    coachTimer = setTimeout(() => ui.coach.classList.remove('show'), 4200);
  }
  function setSlowLook(on) {
    if (G.headless) return;
    stage.classList.toggle('slow', on);
    Snd.slow(on);
  }
  function show(el, on) { el.hidden = !on; }
  function applyRun(o) {
    const ch = o.chapter;
    CFG.CLOCK_END = ch.clock; CFG.DENSITY = ch.density; CFG.BOSSES = ch.bosses; CFG.ELITES = ch.elites; CFG.BOSS_NAME = ch.boss; CFG.ZONE_HP = ch.zone; CFG.REF_ATK = ch.refAtk; CFG.REF_HP = ch.refHp;
    CFG.DEPTH_FROM = ch.from; CFG.DEPTH_END = ch.to;
    G.chapterNo = ch.no;
    G.P = Object.assign({}, G.P, o.player);
  }
  function startRun(o) {
    Snd.init();
    applyRun(o);
    resetRun(o.mode || 'run');
    buildBackground();
    buildSprites();
    stage.classList.add('battle');
    show(ui.pause, false); show(ui.hud, true); show(ui.perf, G.mode === 'stress'); show(ui.shade, true); show(ui.bossBar, false); show(ui.alert, false);
    setAlarm(false);
    if (hooks.onRewardEnd) hooks.onRewardEnd(SK.list());
    ui.goal.textContent = G.mode === 'stress' ? '프레임 시험 중' : '목표 ' + fmt(CFG.CLOCK_END);
    G.state = 'dive'; G.diveT = G.mode === 'stress' ? 0.2 : 1.3;
    setSlowLook(false);
    updateHud(true);
  }
  function quit() {
    G.state = 'idle';
    stage.classList.remove('battle');
    ui.coach.classList.remove('show');
    show(ui.hud, false); show(ui.perf, false); show(ui.pause, false); show(ui.shade, false); show(ui.bossBar, false); show(ui.alert, false);
    setSlowLook(false);
    setAlarm(false);
    if (Snd.c) Snd.c.resume();
  }
  function clearInput() {
    G.input.active = false; G.input.id = null; G.input.kb = false; G.input.mx = G.input.my = 0;
    keys.clear();
  }
  function pause(why) {
    if (G.state !== 'play') return;
    G.state = 'paused';
    clearInput();
    ui.pauseWhy.textContent = (why ? why + ' ' : '') + '화면을 누르면 이어집니다.';
    show(ui.pause, true);
    if (Snd.c) Snd.c.suspend();
  }
  function resume() {
    if (G.state !== 'paused') return;
    G.state = 'play'; G.idle = 0;
    show(ui.pause, false);
    if (Snd.c) Snd.c.resume();
    last = performance.now();
  }
  function goDown() {
    G.state = 'down';
    clearInput();
    if (hooks.onDown) hooks.onDown();
  }
  /* 부활: 내구도 50%로 돌아오고 주변 잡몹을 쓸어낸다. */
  function revive() {
    if (G.state !== 'down') return;
    const S = G.sub;
    G.revived = true;
    S.hp = G.P.hp * 0.5; S.inv = 1.5;
    G.state = 'play'; G.idle = 0;
    for (let i = 0; i < E.n; i++) {
      const e = E.a[i], dx = e.x - S.x, dy = e.y - S.y;
      if (!e.dead && !e.heavy && dx * dx + dy * dy < 64) kill(e);
    }
    compact();
    B.n = 0;
    G.lock = 0; G.press = 0;
    addShock(S.x, S.y, 8, 0.45, 0);
    G.banner.t = 0.8; G.banner.text = '재잠수';
    setSlowLook(true);
    last = performance.now();
  }
  function giveUp() {
    if (G.state !== 'down') return;
    G.state = 'play';
    finish('fail');
  }
  function fpsSummary() {
    if (!frameN) return { avg: 0, low: 0 };
    const a = Array.from(frameLog.subarray(0, frameN)).sort((x, y) => y - x);
    const total = a.reduce((s, v) => s + v, 0);
    const worst = a.slice(0, Math.max(1, Math.floor(a.length / 100)));
    const worstTotal = worst.reduce((s, v) => s + v, 0);
    return { avg: Math.round(a.length / total), low: Math.round(worst.length / worstTotal) };
  }
  function finish(kind) {
    if (G.state === 'over') return;
    G.state = 'over'; G.endKind = kind;
    if (G.headless) return;
    clearInput();
    setSlowLook(false);
    ui.coach.classList.remove('show');
    show(ui.hud, false); show(ui.perf, false); show(ui.shade, false); show(ui.bossBar, false); show(ui.alert, false);
    setAlarm(false);
    if (hooks.onFinish) hooks.onFinish({ kind, mode: G.mode, clock: G.clock, progress: Math.min(1, G.clock / CFG.CLOCK_END), level: G.level, stats: G.stats, skills: SK.list(), fps: fpsSummary(), dpr: G.dpr });
  }
  $('pauseBtn').addEventListener('click', () => pause());
  $('pauseQuit').addEventListener('click', () => { if (hooks.onQuit) hooks.onQuit(); });
  $('pauseSound').addEventListener('click', () => { if (hooks.onSoundToggle) hooks.onSoundToggle(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && G.state === 'play') pause('앱을 벗어나 멈췄습니다.');
  });

  /* ===== 스킬: 필요한 코어 함수만 넘긴다 ===== */
  const SK = window.SkillKit({ G, B, O, TAU, BOSS, rand, makePool, atk, damage, addShock, addOrb, puff, forNear, anyNear, firstHit, nearest, nearestFree, randomOnScreen, densest, knock, slow, confuse, amp, stick, stun, clearBullets, pullAllOrbs, Snd });

  /* ===== 그림 재료: 표시 크기로 미리 그려 두고 찍어 낸다 ===== */
  const SPR = {};
  function glow(px, stops) {
    const c = document.createElement('canvas');
    c.width = c.height = px;
    const x = c.getContext('2d'), g = x.createRadialGradient(px / 2, px / 2, 0, px / 2, px / 2, px / 2);
    stops.forEach(s => g.addColorStop(s[0], s[1]));
    x.fillStyle = g; x.fillRect(0, 0, px, px);
    return { img: c, px };
  }
  function buildSprites() {
    const s = G.scale * G.dpr, sz = m => Math.max(8, Math.ceil(m * s));
    SPR.jelly = Art.enemySprite('jelly', sz(1.04));
    SPR.sardine = Art.enemySprite('sardine', sz(0.88));
    SPR.puffer = Art.enemySprite('puffer', sz(1.44));
    SPR.queen = Art.enemySprite('queenJelly', sz(2.1));
    SPR.mini = Art.enemySprite('miniQueen', sz(1.3));
    SPR.boss = Art.enemySprite('crabKing', sz(4));
    SPR.kinds = [SPR.jelly, SPR.sardine, SPR.puffer, SPR.queen, SPR.mini, SPR.boss];
    SK.buildSprites(s);
    SPR.sub = Art.subSprite(G.P.subId, G.P.pilotId, sz(1.6));
    SPR.orb = glow(sz(0.4), [[0, '#f2fffb'], [0.28, '#7ff5df'], [0.55, 'rgba(45,226,197,.45)'], [1, 'rgba(45,226,197,0)']]);
    SPR.orbBig = glow(sz(0.62), [[0, '#fff8df'], [0.3, '#ecc765'], [0.58, 'rgba(201,162,75,.45)'], [1, 'rgba(201,162,75,0)']]);
    SPR.cloud = glow(sz(2.9), [[0, 'rgba(160,90,200,.55)'], [0.7, 'rgba(122,63,160,.3)'], [1, 'rgba(122,63,160,0)']]);
  }

  /* ===== 렌더 ===== */
  const ctx = cv.getContext('2d', { alpha: false });
  let CW = 0, CH = 0, patSea = null, tilePx = 0;
  const SNOW = [];
  for (let i = 0; i < 44; i++) SNOW.push({ x: Math.random(), y: Math.random(), r: rand(0.7, 1.9) });
  /* 챕터별 바다 색: 바탕, 밝은 면, 어두운 면. 내려갈수록 어두워진다. 면은 경계가 또렷하게 칠한다. */
  const SEA = [
    ['#167FA0', '#1C8FAE', '#116E90'], ['#1878AC', '#1F88BC', '#12689A'], ['#167A7A', '#1C8C86', '#106A6C'], ['#1C5F98', '#2370A8', '#164F86'], ['#3338A0', '#3F46B4', '#292C8A'],
    ['#1C3260', '#243E70', '#152650'], ['#241C42', '#2E2452', '#1B1434'], ['#17384E', '#1E465E', '#112C3E'], ['#233626', '#2D4430', '#1A291C'], ['#172C54', '#1F3864', '#102244'],
    ['#132644', '#1A3054', '#0E1D36'], ['#2A7CB8', '#3A90CC', '#206AA2'], ['#361A30', '#44223C', '#281226'], ['#0E1B30', '#14243E', '#091424'], ['#0B0D1C', '#121528', '#070812'],
  ];
  function buildBackground() {
    const s = G.scale * G.dpr, pal = SEA[(G.chapterNo || 1) - 1] || SEA[0];
    tilePx = Math.round(s * 16); // 16m 타일
    const c = document.createElement('canvas');
    c.width = c.height = tilePx;
    const x = c.getContext('2d', { alpha: false });
    x.fillStyle = pal[0]; x.fillRect(0, 0, tilePx, tilePx);
    const patch = (color, n, rmin, rmax) => {
      x.fillStyle = color;
      for (let i = 0; i < n; i++) {
        const bx = rand(0, tilePx), by = rand(0, tilePx), rx = rand(rmin, rmax) * tilePx, ry = rx * rand(0.45, 0.8), a = rand(0, 3);
        for (const ox of [-tilePx, 0, tilePx]) for (const oy of [-tilePx, 0, tilePx]) { x.beginPath(); x.ellipse(bx + ox, by + oy, rx, ry, a, 0, TAU); x.fill(); }
      }
    };
    patch(pal[1], 6, 0.08, 0.2);
    patch(pal[2], 5, 0.05, 0.14);
    patch(pal[1], 14, 0.006, 0.016);
    patch(pal[2], 14, 0.006, 0.016);
    patSea = ctx.createPattern(c, 'repeat');
  }
  function resize() {
    const app = $('app');
    const W = app.clientWidth || innerWidth, Hh = app.clientHeight || innerHeight;
    const w = Math.min(W, Math.round(Hh * 9 / 16));
    if (w < 1 || Hh < 1) { CW = 0; CH = 0; return; } // 화면이 아직 크기를 받지 못했다. 다음 프레임에 다시 잰다.
    stage.style.width = w + 'px';
    G.scale = w / 9;
    G.viewH = Hh / G.scale;
    if (!G.dprLocked) G.dpr = Math.min(2, window.devicePixelRatio || 1);
    CW = cv.width = Math.round(w * G.dpr);
    CH = cv.height = Math.round(Hh * G.dpr);
    buildBackground();
    buildSprites();
    if (hooks.onResize) hooks.onResize(CW, CH, G.dpr);
  }
  addEventListener('resize', resize);

  function drawBackground(cx, cy) {
    const s = G.scale * G.dpr;
    const ox = -(((cx * s) % tilePx) + tilePx) % tilePx, oy = -(((cy * s) % tilePx) + tilePx) % tilePx;
    ctx.setTransform(1, 0, 0, 1, ox, oy);
    ctx.fillStyle = patSea;
    ctx.fillRect(-ox, -oy, CW, CH);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = 'rgba(255,255,255,.22)';
    ctx.beginPath();
    const px = cx * s * 0.55, py = cy * s * 0.55 - G.real * 7 * G.dpr, span = Math.max(CW, CH);
    for (let i = 0; i < SNOW.length; i++) {
      const f = SNOW[i], x = ((f.x * span - px) % CW + CW) % CW, y = ((f.y * span - py) % CH + CH) % CH, r = f.r * G.dpr;
      ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU);
    }
    ctx.fill();
  }
  function drawSub(s, ox, oy, S, zoom, t) {
    const dir = S.dir, c = Math.cos(S.tilt), n = Math.sin(S.tilt);
    const k = s * zoom;
    ctx.setTransform(c * dir * k, n * dir * k, -n * k, c * k, S.x * s + ox, S.y * s + oy);
    const spin = Math.abs(Math.sin(t * (Math.hypot(S.vx, S.vy) > 0.3 ? 34 : 9)));
    ctx.fillStyle = '#F4BC42'; ctx.strokeStyle = '#15131F'; ctx.lineWidth = 0.035;
    ctx.beginPath(); ctx.ellipse(SPR.sub.tail * 1.6, 0, 0.05, 0.05 + 0.22 * spin, 0, 0, TAU); ctx.fill(); ctx.stroke();
    if (G.veil > 0) ctx.globalAlpha = 0.4;
    ctx.drawImage(S.hurtT > 0 ? SPR.sub.white : SPR.sub.img, -0.8, -0.88, 1.6, 1.6);
    ctx.globalAlpha = 1;
  }
  function drawPressure(S) {
    const R = 0.9;
    ctx.lineCap = 'butt';
    ctx.lineWidth = 0.11;
    ctx.strokeStyle = 'rgba(228,245,242,.16)';
    ctx.beginPath(); ctx.arc(S.x, S.y, R, 0, TAU); ctx.stroke();
    if (G.lock > 0) {
      ctx.strokeStyle = 'rgba(155,187,194,.6)'; ctx.lineWidth = 0.05;
      ctx.beginPath(); ctx.arc(S.x, S.y, R, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - G.lock / CFG.BURST_LOCK)); ctx.stroke();
    } else if (G.press > 0.5) {
      const f = G.press / 100;
      ctx.lineCap = 'round';
      ctx.strokeStyle = f < 0.6 ? '#2DE2C5' : f < 0.85 ? '#E9C766' : '#FF6B5E';
      const beat = f >= 0.85 ? 0.03 * Math.sin(G.real * 22) : 0;
      ctx.lineWidth = 0.13 + beat;
      ctx.beginPath(); ctx.arc(S.x, S.y, R, -Math.PI / 2, -Math.PI / 2 + TAU * f); ctx.stroke();
    }
  }
  function drawPing(s, ox, oy) {
    const p = G.ping, life = CFG.PING_SHOW + 0.25;
    if (p.t >= life) return;
    const fade = clamp((life - p.t) / 0.5, 0, 1);
    ctx.setTransform(s, 0, 0, s, ox, oy);
    for (let k = 0; k < 2; k++) {
      const t = p.t - k * 0.14;
      if (t <= 0 || t > 0.95) continue;
      ctx.strokeStyle = 'rgba(45,226,197,' + ((k ? 0.3 : 0.75) * (1 - t / 0.95)).toFixed(3) + ')';
      ctx.lineWidth = 0.07;
      ctx.beginPath(); ctx.arc(p.x, p.y, t * 24, 0, TAU); ctx.stroke();
    }
    const reveal = p.t * 24, reveal2 = reveal * reveal;
    // 적 탄 궤적
    ctx.strokeStyle = 'rgba(245,150,255,' + (0.8 * fade).toFixed(3) + ')';
    ctx.lineWidth = 0.05; ctx.setLineDash([0.22, 0.16]);
    ctx.beginPath();
    for (let i = 0; i < B.n; i++) {
      const b = B.a[i], dx = b.x - p.x, dy = b.y - p.y;
      if (dx * dx + dy * dy > reveal2) continue;
      ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + b.vx * 1.5, b.y + b.vy * 1.5);
    }
    // 곧 터지는 복어의 탄 경로
    for (let i = 0; i < E.n; i++) {
      const e = E.a[i];
      if (e.kind !== PUFFER || e.swell <= 0 || e.dead) continue;
      const dx = e.x - p.x, dy = e.y - p.y;
      if (dx * dx + dy * dy > reveal2) continue;
      for (let b = 0; b < 6; b++) {
        const a = e.seed + b / 6 * TAU;
        ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + Math.cos(a) * 5.4, e.y + Math.sin(a) * 5.4);
      }
    }
    ctx.stroke();
    // 정어리 돌진 경고선
    ctx.strokeStyle = 'rgba(255,157,60,' + (0.85 * fade).toFixed(3) + ')';
    ctx.lineWidth = 0.08; ctx.setLineDash([0.45, 0.25]);
    ctx.beginPath();
    for (let i = 0; i < E.n; i++) {
      const e = E.a[i];
      if (e.kind !== SARDINE || !e.leader || e.dead) continue;
      const dx = e.x - p.x, dy = e.y - p.y;
      if (dx * dx + dy * dy > reveal2) continue;
      ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + e.vx * 4, e.y + e.vy * 4);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }
  function drawEntities(s, ox, oy, t) {
    const vw = 4.5 + 1.2, vh = G.viewH / 2 + 1.2, S = G.sub, cx = G.cam.x, cy = G.cam.y;
    const on = (x, y) => Math.abs(x - cx) < vw && Math.abs(y - cy) < vh;
    ctx.setTransform(s, 0, 0, s, ox, oy);
    // 독 구름
    for (let i = 0; i < C.n; i++) {
      const c = C.a[i];
      if (!on(c.x, c.y)) continue;
      ctx.globalAlpha = clamp(c.life / 0.6, 0, 1);
      const r = 1.2 + 0.08 * Math.sin(t * 3 + i);
      ctx.drawImage(SPR.cloud.img, c.x - r * 1.2, c.y - r * 1.2, r * 2.4, r * 2.4);
    }
    ctx.globalAlpha = 1;
    SK.drawUnder(ctx, t, on);
    drawArena(t);
    drawTelegraph();
    // 정예의 붉은 오라
    ctx.fillStyle = 'rgba(214,40,70,.28)';
    ctx.beginPath();
    for (let i = 0; i < E.n; i++) { const e = E.a[i]; if (!e.dead && e.kind === ELITE) { const r = e.r * 1.55 + 0.05 * Math.sin(t * 6); ctx.moveTo(e.x + r, e.y); ctx.arc(e.x, e.y, r, 0, TAU); } }
    ctx.fill();
    // 구슬과 적은 크기 변환 없이 정수 좌표로 찍어 낸다.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const orbH = SPR.orb.px / 2, bigH = SPR.orbBig.px / 2;
    for (let i = 0; i < O.n; i++) {
      const o = O.a[i];
      if (!on(o.x, o.y)) continue;
      if (o.val >= 2) ctx.drawImage(SPR.orbBig.img, (o.x * s + ox - bigH) | 0, (o.y * s + oy - bigH) | 0);
      else ctx.drawImage(SPR.orb.img, (o.x * s + ox - orbH) | 0, (o.y * s + oy - orbH) | 0);
    }
    for (let i = 0; i < E.n; i++) {
      const e = E.a[i];
      if (e.dead || !on(e.x, e.y)) continue;
      const set = SPR.kinds[e.kind];
      const img = e.flash > 0 ? set.white : set.img, h = set.px / 2;
      if (e.kind === JELLY) {
        ctx.drawImage(img, (e.x * s + ox - h) | 0, (e.y * s + oy - h + Math.sin(e.t * 4 + e.seed) * 0.05 * s) | 0);
      } else if (e.kind === SARDINE) {
        const l = Math.hypot(e.vx, e.vy) || 1, c = e.vx / l, n = e.vy / l;
        ctx.setTransform(c, n, -n, c, e.x * s + ox, e.y * s + oy);
        ctx.drawImage(img, -h, -h);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      } else if (e.kind === BOSS) {
        const lean = G.boss && G.boss.act === 'dash' ? 0.03 : 0, stunned = e.stun > 0 ? Math.sin(t * 24) * 0.04 * s : 0;
        ctx.drawImage(img, (e.x * s + ox - h + stunned) | 0, (e.y * s + oy - h + Math.sin(t * 3) * (0.05 + lean) * s) | 0);
      } else if (e.swell > 0) {
        const g = (1 + 0.45 * (1 - e.swell) + 0.04 * Math.sin(t * 40)) * set.px;
        ctx.drawImage(Math.sin(t * 30) > 0.3 ? set.white : img, e.x * s + ox - g / 2, e.y * s + oy - g / 2, g, g);
      } else {
        ctx.drawImage(img, (e.x * s + ox - h) | 0, (e.y * s + oy - h) | 0);
      }
    }
    ctx.setTransform(s, 0, 0, s, ox, oy);
    // 혼란 표시
    ctx.strokeStyle = '#D6AEFF'; ctx.lineWidth = 0.05;
    ctx.beginPath();
    for (let i = 0; i < E.n; i++) {
      const e = E.a[i];
      if (e.dead || e.conf <= 0 || !on(e.x, e.y)) continue;
      const a = t * 7 + e.seed, y = e.y - e.r - 0.14;
      ctx.moveTo(e.x + Math.cos(a) * 0.15 + 0.05, y + Math.sin(a) * 0.05); ctx.arc(e.x + Math.cos(a) * 0.15, y + Math.sin(a) * 0.05, 0.05, 0, TAU);
    }
    ctx.stroke();
    SK.drawOver(ctx, t, on);
    // 작살
    ctx.lineCap = 'round'; ctx.lineWidth = 0.075; ctx.strokeStyle = '#8ffbe6';
    ctx.beginPath();
    for (let i = 0; i < H.n; i++) {
      const h = H.a[i];
      ctx.moveTo(h.x, h.y); ctx.lineTo(h.x - h.vx * 0.026, h.y - h.vy * 0.026);
    }
    ctx.stroke();
    // 적 탄
    ctx.fillStyle = 'rgba(190,70,230,.45)';
    ctx.beginPath();
    for (let i = 0; i < B.n; i++) { const b = B.a[i]; ctx.moveTo(b.x + 0.26, b.y); ctx.arc(b.x, b.y, 0.26, 0, TAU); }
    ctx.fill();
    ctx.fillStyle = '#fbd0ff';
    ctx.beginPath();
    for (let i = 0; i < B.n; i++) { const b = B.a[i]; ctx.moveTo(b.x + 0.13, b.y); ctx.arc(b.x, b.y, 0.13, 0, TAU); }
    ctx.fill();
    // 파편
    const colors = ['rgba(228,245,242,.55)', '#7ff5df', 'rgba(190,120,230,.8)'];
    for (let k = 0; k < 3; k++) {
      ctx.fillStyle = colors[k];
      ctx.beginPath();
      for (let i = 0; i < P.n; i++) {
        const p = P.a[i];
        if (p.kind !== k) continue;
        const r = p.r * clamp(p.life / p.max + 0.2, 0, 1);
        ctx.moveTo(p.x + r, p.y); ctx.arc(p.x, p.y, r, 0, TAU);
      }
      ctx.fill();
    }
    // 잠수함과 수압 고리
    drawPressure(S);
    if (!(S.inv > 0.31 && Math.floor(t * 18) % 2)) drawSub(s, ox, oy, S, 1, t);
    ctx.setTransform(s, 0, 0, s, ox, oy);
    // 충격파
    for (let i = 0; i < SH.n; i++) {
      const sh = SH.a[i], f = sh.t / sh.max, r = sh.r * (1 - (1 - f) * (1 - f));
      if (sh.kind === 0) {
        ctx.fillStyle = 'rgba(45,226,197,' + (0.2 * (1 - f)).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(sh.x, sh.y, r, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(228,245,242,' + (1 - f).toFixed(3) + ')';
        ctx.lineWidth = 0.22 * (1 - f) + 0.03;
      } else if (sh.kind >= 2) {
        const col = sh.kind === 2 ? '168,120,240' : sh.kind === 3 ? '90,190,255' : '255,170,70';
        ctx.fillStyle = 'rgba(' + col + ',' + (0.24 * (1 - f)).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(sh.x, sh.y, r, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(' + col + ',' + (1 - f).toFixed(3) + ')';
        ctx.lineWidth = 0.1;
      } else {
        ctx.strokeStyle = 'rgba(233,199,102,' + (1 - f).toFixed(3) + ')';
        ctx.lineWidth = 0.08;
      }
      ctx.beginPath(); ctx.arc(sh.x, sh.y, r, 0, TAU); ctx.stroke();
    }
  }
  /* 기포 장벽과 보스 경고 범위 */
  function drawArena(t) {
    const A0 = G.arena;
    if (!A0) return;
    ctx.lineWidth = 0.18; ctx.strokeStyle = 'rgba(190,240,255,.8)';
    ctx.beginPath(); ctx.arc(A0.x, A0.y, A0.r, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(235,252,255,.75)';
    ctx.beginPath();
    for (let i = 0; i < 44; i++) {
      const a = i / 44 * TAU + t * 0.12, r = 0.09 + 0.06 * ((i * 7) % 3), R = A0.r + 0.22 * Math.sin(i * 2.3 + t * 2);
      const x = A0.x + Math.cos(a) * R, y = A0.y + Math.sin(a) * R;
      ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU);
    }
    ctx.fill();
  }
  function drawTelegraph() {
    const b = G.boss;
    if (!b || b.e.dead) return;
    const e = b.e;
    if (b.act === 'sweepW') {
      const f = 1 - b.t / 0.8;
      ctx.fillStyle = 'rgba(255,60,60,' + (0.16 + 0.26 * f).toFixed(3) + ')';
      ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.arc(e.x, e.y, SWEEP_R, b.ang - SWEEP_ARC, b.ang + SWEEP_ARC); ctx.closePath(); ctx.fill();
    } else if (b.act === 'dashW') {
      const f = 1 - b.t;
      ctx.strokeStyle = 'rgba(255,60,60,' + (0.3 + 0.5 * f).toFixed(3) + ')'; ctx.lineWidth = 1.8; ctx.lineCap = 'butt';
      ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + Math.cos(b.ang) * 14, e.y + Math.sin(b.ang) * 14); ctx.stroke();
    } else if (b.act === 'netW') {
      ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 0.5; ctx.lineCap = 'butt';
      ctx.beginPath();
      for (const off of [-0.34, 0, 0.34]) { ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + Math.cos(b.ang + off) * 9, e.y + Math.sin(b.ang + off) * 9); }
      ctx.stroke();
    }
  }
  function advanceEffects(rdt) {
    const dt = rdt * G.ts;
    for (let i = P.n - 1; i >= 0; i--) {
      const p = P.a[i];
      p.life -= dt;
      if (p.life <= 0) { P.a[i] = P.a[--P.n]; P.a[P.n] = p; continue; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= 0.96; p.vy *= 0.96;
      if (p.kind === 0) p.vy -= 2.2 * dt;
    }
    for (let i = N.n - 1; i >= 0; i--) {
      const n = N.a[i];
      n.life -= dt; n.y -= 1.2 * dt;
      if (n.life <= 0) { N.a[i] = N.a[--N.n]; N.a[N.n] = n; }
    }
    for (let i = SH.n - 1; i >= 0; i--) {
      const sh = SH.a[i];
      sh.t += rdt;
      if (sh.t >= sh.max) { SH.a[i] = SH.a[--SH.n]; SH.a[SH.n] = sh; }
    }
    if (G.banner.t > 0) G.banner.t -= rdt;
    if (G.shake > 0) G.shake = Math.max(0, G.shake - rdt * 1.4);
  }
  function drawScreenLayer(s, ox, oy) {
    const dpr = G.dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // 피해 숫자
    if (N.n) {
      ctx.font = '400 14px "Do Hyeon", "Apple SD Gothic Neo", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#F2FFFB';
      for (let i = 0; i < N.n; i++) {
        const n = N.a[i];
        ctx.globalAlpha = clamp(n.life / 0.25, 0, 1);
        ctx.fillText(n.val, (n.x * s + ox) / dpr, (n.y * s + oy) / dpr);
      }
      ctx.globalAlpha = 1;
    }
    // 수압 방출 알림
    if (G.banner.t > 0) {
      const f = clamp(G.banner.t / 0.8, 0, 1), sx = (G.sub.x * s + ox) / dpr, sy = (G.sub.y * s + oy) / dpr;
      ctx.globalAlpha = Math.min(1, f * 2);
      ctx.font = '400 34px "Do Hyeon", "Apple SD Gothic Neo", sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 5; ctx.strokeStyle = '#0A1F3C'; ctx.fillStyle = '#E4F5F2';
      ctx.strokeText(G.banner.text, sx, sy - 74 - (1 - f) * 18);
      ctx.fillText(G.banner.text, sx, sy - 74 - (1 - f) * 18);
      ctx.globalAlpha = 1;
    }
    // 드래그 기준점은 옅은 고리만 보여 준다
    const I = G.input;
    if (I.active && !I.kb && G.state === 'play') {
      ctx.strokeStyle = 'rgba(228,245,242,.24)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(I.ax, I.ay, CFG.DRAG_MAX, 0, TAU); ctx.stroke();
      ctx.fillStyle = 'rgba(228,245,242,.2)';
      ctx.beginPath(); ctx.arc(I.x, I.y, 15, 0, TAU); ctx.fill();
    }
  }
  function render(rdt) {
    if (!CW || !CH) { resize(); if (!CW || !CH) return; }
    const s = G.scale * G.dpr;
    if (G.state === 'idle') { if (hooks.renderIdle) hooks.renderIdle(ctx, rdt, CW, CH, G.dpr); return; }
    const S = G.sub;
    const follow = 1 - Math.exp(-rdt * 12);
    G.cam.x += (S.x - G.cam.x) * follow;
    G.cam.y += (S.y - G.cam.y) * follow;
    const amp = calm ? 0 : G.shake * 0.5;
    const cx = G.cam.x + (amp ? rand(-amp, amp) : 0), cy = G.cam.y + (amp ? rand(-amp, amp) : 0);
    const ox = CW / 2 - cx * s, oy = CH / 2 - cy * s;
    if (G.state === 'play' || G.state === 'dive') advanceEffects(rdt);
    drawBackground(cx, cy);
    drawPing(s, ox, oy);
    drawEntities(s, ox, oy, G.real);
    drawScreenLayer(s, ox, oy);
    if (G.state === 'dive') {
      // 수면에서 내려가는 연출
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const a = clamp(G.diveT / 1.3, 0, 1);
      ctx.fillStyle = 'rgba(190,240,235,' + (a * a * 0.85).toFixed(3) + ')';
      ctx.fillRect(0, 0, CW, CH);
    }
  }
  let hudT = 0;
  function updateHud(force) {
    hudT += G.rdt || 0;
    if (!force && hudT < 0.1) return;
    hudT = 0;
    const S = G.sub, f = S.hp / G.P.hp;
    ui.hpFill.style.transform = 'scaleX(' + f.toFixed(3) + ')';
    ui.hpFill.classList.toggle('low', f < 0.3);
    ui.hpText.textContent = Math.ceil(S.hp).toLocaleString('ko-KR');
    ui.depth.textContent = '수심 ' + Math.round(lerp(CFG.DEPTH_FROM, CFG.DEPTH_END, Math.min(1, G.clock / CFG.CLOCK_END))).toLocaleString('ko-KR') + 'm';
    ui.clock.textContent = fmt(G.clock);
    ui.lv.textContent = G.level;
    ui.xpFill.style.transform = 'scaleX(' + Math.min(1, G.xp / G.need).toFixed(3) + ')';
    ui.perf.textContent = G.fps + 'fps · 적 ' + G.alive + '체';
    if (G.boss) ui.bossFill.style.transform = 'scaleX(' + Math.max(0, G.boss.e.hp / G.boss.e.maxHp).toFixed(3) + ')';
  }

  /* ===== 메인 루프 ===== */
  let last = 0, fpsT = 0, fpsN = 0, lowT = 0;
  function adaptQuality(fpsNow) {
    // 프레임이 낮으면 해상도부터 낮추고, 그래도 낮으면 슬로우 색 필터를 끈다.
    if (fpsNow >= 48) { lowT = 0; return; }
    lowT += 0.5;
    if (lowT < 2) return;
    lowT = 0;
    if (G.dpr > 1) { G.dpr = Math.max(1, G.dpr - 0.25); G.dprLocked = true; resize(); }
    else stage.classList.add('lite');
  }
  function tick(now) {
    requestAnimationFrame(tick);
    if (G.headless) return;
    let rdt = (now - last) / 1000;
    last = now;
    if (!(rdt > 0)) rdt = 1 / 60;
    const raw = rdt;
    if (rdt > 0.1) rdt = 0.1;
    if (G.state === 'dive') {
      G.diveT -= rdt;
      G.real += rdt;
      G.rdt = rdt;
      updateInputMotion(rdt);
      if (Math.random() < 0.6) puff(G.sub.x + rand(-2, 2), G.sub.y + 3, 1, 0, 1.5, 0.11, 0.8);
      if (G.diveT <= 0) {
        G.state = 'play';
        if (G.mode === 'run') { coach('move'); if (!G.input.active) setSlowLook(true); }
      }
      updateHud();
    } else if (G.state === 'play') {
      const t0 = performance.now();
      step(rdt);
      G.msSim += (performance.now() - t0 - G.msSim) * 0.05;
      if (frameN < frameLog.length && (G.mode === 'run' || G.alive >= CFG.STRESS_ENEMIES * 0.95)) frameLog[frameN++] = raw;
      if (G.state === 'play') updateHud();
    }
    if (G.state === 'play' || G.state === 'dive') {
      fpsT += raw; fpsN++;
      if (fpsT >= 0.5) { G.fps = Math.round(fpsN / fpsT); adaptQuality(G.fps); fpsT = 0; fpsN = 0; }
    }
    const t1 = performance.now();
    render(rdt);
    G.msDraw += (performance.now() - t1 - G.msDraw) * 0.05;
  }

  /* ===== 시험용 도구: 화면 없이 빠르게 돌려 수치를 확인한다 ===== */
  function botInput(kind, t) {
    const I = G.input, S = G.sub;
    if (kind === 'idle') { I.active = false; I.mx = I.my = 0; return; }
    I.active = true;
    if (G.arena && kind !== 'still') {
      const ax = G.arena.x - S.x, ay = G.arena.y - S.y, ad = Math.hypot(ax, ay);
      if (ad > G.arena.r - 2) { I.mx = ax / ad; I.my = ay / ad; return; }
      const b = G.boss;
      if (b && (b.act === 'sweepW' || b.act === 'dashW' || b.act === 'dash' || b.act === 'netW')) {
        // 사람이 경고 범위를 보고 비키는 움직임을 흉내 낸다.
        const px = -Math.sin(b.ang), py = Math.cos(b.ang), side = (S.x - b.e.x) * px + (S.y - b.e.y) * py >= 0 ? 1 : -1;
        I.mx = px * side; I.my = py * side;
        return;
      }
    }
    if (kind === 'still') { I.mx = I.my = 0; return; }
    if (kind === 'circle') { const a = t * 0.55; I.mx = Math.cos(a); I.my = Math.sin(a); return; }
    if (kind === 'roam') {
      if (!G.botT || t > G.botT) {
        G.botT = t + rand(0.8, 2.2);
        let ox = 0, oy = 0, od = 36;
        for (let i = 0; i < O.n; i++) { const o = O.a[i], dx = o.x - S.x, dy = o.y - S.y, d2 = dx * dx + dy * dy; if (d2 < od) { od = d2; ox = dx; oy = dy; } }
        let rx = 0, ry = 0;
        for (let i = 0; i < E.n; i++) { const e = E.a[i]; if (e.dead) continue; const dx = S.x - e.x, dy = S.y - e.y, d2 = dx * dx + dy * dy; if (d2 < 16) { const w = 1 / (d2 + 0.5); rx += dx * w; ry += dy * w; } }
        const od2 = Math.sqrt(od) || 1, a = Math.random() * TAU;
        const vx = rx * 1.5 + ox / od2 * 0.6 + Math.cos(a) * 0.5, vy = ry * 1.5 + oy / od2 * 0.6 + Math.sin(a) * 0.5, m = Math.hypot(vx, vy) || 1;
        G.botX = vx / m; G.botY = vy / m;
      }
      I.mx = G.botX; I.my = G.botY;
      return;
    }
    let rx = 0, ry = 0, n = 0;
    for (let i = 0; i < E.n; i++) {
      const e = E.a[i];
      if (e.dead) continue;
      const dx = S.x - e.x, dy = S.y - e.y, d2 = dx * dx + dy * dy;
      if (d2 < 36) { const w = 1 / (d2 + 0.3); rx += dx * w; ry += dy * w; n++; }
    }
    for (let i = 0; i < B.n; i++) {
      const b = B.a[i], dx = S.x - b.x, dy = S.y - b.y, d2 = dx * dx + dy * dy;
      if (d2 < 9) { const w = 1.5 / (d2 + 0.3); rx += dx * w; ry += dy * w; }
    }
    let ox = 0, oy = 0, od = 1e9;
    for (let i = 0; i < O.n; i++) {
      const o = O.a[i], dx = o.x - S.x, dy = o.y - S.y, d2 = dx * dx + dy * dy;
      if (d2 < od) { od = d2; ox = dx; oy = dy; }
    }
    if (od < 1e9) { const d = Math.sqrt(od) || 1, w = n > 8 ? 0.25 : 1; rx += ox / d * w; ry += oy / d * w; }
    const m = Math.hypot(rx, ry) || 1;
    I.mx = rx / m; I.my = ry / m;
  }
  function runSim(opt) {
    const o = Object.assign({ bot: 'evade', seconds: 0, sample: 30 }, opt);
    const prev = G.state;
    G.headless = true;
    if (o.chapter) applyRun(o);
    if (!o.seconds) o.seconds = CFG.CLOCK_END + 1;
    G.botT = 0;
    resetRun('run');
    G.state = 'play';
    const rows = [];
    let nextSample = 0, simT = 0;
    const started = performance.now();
    while (G.state === 'play' && G.clock < o.seconds && simT < o.seconds * 6) {
      botInput(o.bot, simT);
      step(1 / 60);
      simT += 1 / 60;
      if (G.clock >= nextSample) {
        nextSample += o.sample;
        let vis = 0;
        for (let i = 0; i < E.n; i++) { const e = E.a[i]; if (!e.dead && Math.abs(e.x - G.sub.x) < CFG.HW && Math.abs(e.y - G.sub.y) < G.viewH / 2) vis++; }
        rows.push({ t: fmt(G.clock), alive: G.alive, vis, cards: G.stats.cards, lv: G.level, hp: Math.round(G.sub.hp), kills: G.stats.kills, bursts: G.stats.bursts, orbs: O.n, harpoons: H.n, bullets: B.n, near: G.near });
      }
    }
    const res = { src: G.stats.src, cards: G.stats.cards, levelAt: G.stats.levelAt, bossTime: G.stats.bossTime, eliteKills: G.stats.eliteKills, skills: SK.list(), bot: o.bot, end: G.endKind || 'timeout', clock: fmt(G.clock), level: G.level, kills: G.stats.kills, bursts: G.stats.bursts, hits: G.stats.hits, maxAlive: G.stats.maxAlive, wallMs: Math.round(performance.now() - started), rows };
    G.headless = false;
    resetRun('run');
    G.state = prev;
    return res;
  }
  window.Battle = {
    init(h) {
      hooks = h;
      resize();
      last = performance.now();
      requestAnimationFrame(tick);
      if (document.fonts && document.fonts.load) document.fonts.load('400 34px "Do Hyeon"', '수압 방출').catch(() => {});
    },
    start: startRun, quit, pause, revive, giveUp, finish, runSim, pickSkill, rerollCards, closeChest, G, CFG, Snd,
    get state() { return G.state; },
  };
  window.__game = { G, E, H, B, O, CFG, runSim, step, firePing, burst, ringFormation, wallFormation, rushFormation, finish, gainXp, openReward, spawnElite, SK };
})();
