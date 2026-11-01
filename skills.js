/* 스킬 12종의 동작. 수치와 문구는 data.js에 있고, 전투 코어(battle.js)가 넘겨준 함수만 쓴다.
   레벨업은 반드시 카드 선택을 거친다. 자동으로 스탯을 올리는 코드를 여기에 넣지 않는다. */
window.SkillKit = function (core) {
  'use strict';
  const { G, B, O, TAU, rand, makePool, atk, damage, addShock, addOrb, puff, forNear, anyNear, firstHit, nearest, nearestFree, randomOnScreen, densest, knock, slow, confuse, amp, stick, stun, Snd } = core;
  const LIST = window.DATA.skills, FILLERS = window.DATA.skillFillers;
  const DEF = {};
  LIST.forEach(s => { DEF[s.id] = s; });
  const SLOTS = 6, MAX_LV = 5;

  let own = [];
  const has = {};
  const lvOf = o => DEF[o.id].lv[o.lv - 1];
  const levelData = id => (has[id] ? lvOf(has[id]) : null);

  /* ===== 풀: 탄과 설치물 ===== */
  const TORPEDO = 0, SHARD = 1, SHOT = 2;
  const MINE = 0, WHIRL = 1, CLOUD = 2, BUBBLE = 3, TRAIL = 4;
  const MIS = makePool(140, () => ({ kind: 0, x: 0, y: 0, vx: 0, vy: 0, life: 0, dmg: 0, R: 0, slowK: 0, slowT: 0, whirl: 0, boss: 0, tgt: null, id: 0 }));
  const FX = makePool(170, () => ({ type: 0, x: 0, y: 0, r: 0, life: 0, max: 1, tick: 0, dmg: 0, slowK: 0, slowT: 0, conf: 0, boom: 0, boomR: 0, push: 0, shard: 0, shardDmg: 0, R: 0 }));
  const echoes = [];
  let mineCount = 0;

  function addMis(kind, x, y, ang, speed, life, dmg) {
    if (MIS.n >= MIS.max) return null;
    const m = MIS.a[MIS.n++];
    m.kind = kind; m.x = x; m.y = y; m.vx = Math.cos(ang) * speed; m.vy = Math.sin(ang) * speed; m.life = life; m.dmg = dmg;
    m.R = 0; m.slowK = 0; m.slowT = 0; m.whirl = 0; m.boss = 0; m.tgt = null; m.id = 0;
    return m;
  }
  function addFx(type, x, y, r, life, dmg) {
    if (FX.n >= FX.max) return null;
    const f = FX.a[FX.n++];
    f.type = type; f.x = x; f.y = y; f.r = r; f.life = f.max = life; f.dmg = dmg; f.tick = 0;
    f.slowK = 0; f.slowT = 0; f.conf = 0; f.boom = 0; f.boomR = 0; f.push = 0; f.shard = 0; f.shardDmg = 0; f.R = 0;
    return f;
  }
  function blast(x, y, R, mult, o) {
    const d = atk() * mult;
    forNear(x, y, R, e => {
      damage(e, o && o.boss && e.kind === core.BOSS ? d * (1 + o.boss) : d, !!(o && o.num));
      if (!e.dead && o && o.slowK) slow(e, o.slowK, o.slowT);
      if (!e.dead && o && o.push) knock(e, x, y, o.push);
    });
    addShock(x, y, R, 0.26, 4);
    puff(x, y, 6, 1, 3, 0.1, 0.3);
    Snd.tone('boom', 0.08, 220, 70, 0.14, 'sine', 0.12);
  }
  function shards(x, y, n, mult) {
    const off = Math.random() * TAU;
    for (let i = 0; i < n; i++) addMis(SHARD, x, y, off + i / n * TAU, 11, 0.5, atk() * mult);
  }

  /* ===== 스킬별 동작 ===== */
  function cry(L) {
    const S = G.sub, d = atk() * L.dmg;
    forNear(S.x, S.y, L.r, e => {
      damage(e, d, false);
      if (e.dead) return;
      confuse(e, L.conf);
      amp(e, L.amp, L.conf);
    });
    addShock(S.x, S.y, L.r, 0.42, 2);
    Snd.tone('cry', 0.2, 90, 45, 0.5, 'sawtooth', 0.14);
  }
  const TICK = {
    abyssCry(o, L, dt) {
      o.t -= dt;
      if (o.again > 0) { o.again -= dt; if (o.again <= 0) cry(L); }
      if (o.t <= 0) { o.t = L.cd; cry(L); if (L.again) o.again = L.again; }
    },
    ghostTorpedo(o, L, dt) {
      o.t -= dt;
      if (o.t > 0) return;
      const S = G.sub;
      if (!randomOnScreen()) { o.t = 0.3; return; }
      o.t = L.cd;
      for (let i = 0; i < L.n; i++) {
        const tgt = randomOnScreen();
        if (!tgt) break;
        const m = addMis(TORPEDO, S.x, S.y, Math.atan2(tgt.y - S.y, tgt.x - S.x) + rand(-0.5, 0.5), 9, 2.6, L.dmg);
        if (!m) break;
        m.tgt = tgt; m.id = tgt.id; m.R = L.R; m.slowK = L.slow; m.slowT = L.slowT; m.whirl = L.whirl || 0; m.boss = L.boss || 0;
      }
      Snd.tone('torp', 0.15, 500, 180, 0.2, 'sine', 0.06);
    },
    coralMine(o, L, dt) {
      o.t -= dt;
      if (o.t > 0) return;
      o.t = L.cd;
      const S = G.sub;
      for (let i = 0; i < L.n && mineCount < L.max; i++) {
        const a = Math.random() * TAU, r = rand(2, 5), f = addFx(MINE, S.x + Math.cos(a) * r, S.y + Math.sin(a) * r, 0.7, L.life, L.dmg);
        if (!f) break;
        f.R = L.R; f.slowK = L.slow; f.slowT = L.slowT; f.shard = L.shard || 0; f.shardDmg = L.shardDmg || 0;
        mineCount++;
      }
    },
    pressureWave(o, L, dt) {
      o.t -= dt;
      if (o.t > 0) return;
      o.t = L.cd;
      const S = G.sub, d = atk() * L.dmg;
      forNear(S.x, S.y, L.r, e => {
        damage(e, d, false);
        if (e.dead) return;
        if (e.kind === core.BOSS) stun(e, L.stun); else knock(e, S.x, S.y, L.push);
      });
      if (L.clear) core.clearBullets(S.x, S.y, L.r);
      addShock(S.x, S.y, L.r, 0.34, 3);
      Snd.tone('wave', 0.2, 140, 50, 0.3, 'sine', 0.22);
    },
    babyOcto(o, L, dt) {
      const S = G.sub;
      while (o.pets.length < L.n) o.pets.push({ x: S.x, y: S.y, e: null, id: 0, on: false, t: 0, tick: 0, wait: o.pets.length * 0.15, ox: 0, oy: 0, pull: 0 });
      for (const p of o.pets) {
        if (p.e && (p.e.dead || p.e.id !== p.id)) { p.e = null; p.on = false; p.wait = 0.4; }
        if (p.e && p.on) {
          const e = p.e;
          p.x = e.x + p.ox; p.y = e.y + p.oy; p.t -= dt; p.tick -= dt;
          stick(e, 0.2);
          amp(e, L.amp, 0.2);
          if (p.tick <= 0) { p.tick = L.tick; damage(e, atk() * L.dmg, false); }
          if (L.pull && !e.dead) {
            p.pull -= dt;
            if (p.pull <= 0) { p.pull = 0.5; forNear(e.x, e.y, L.pull, b => { if (b !== e && !b.heavy) knock(b, e.x, e.y, -0.5); }); }
          }
          if (p.t <= 0) { p.e = null; p.on = false; p.wait = 1; }
        } else if (p.e) {
          const dx = p.e.x - p.x, dy = p.e.y - p.y, d = Math.hypot(dx, dy) || 0.01;
          if (d < 0.5 + p.e.r) { p.on = true; p.t = L.stick; p.tick = 0; p.ox = rand(-0.2, 0.2); p.oy = rand(-0.3, 0.1); } else { const v = 10 * dt / d; p.x += dx * v; p.y += dy * v; }
        } else {
          const dx = S.x - p.x, dy = S.y - p.y, d = Math.hypot(dx, dy) || 0.01;
          if (d > 1.2) { const v = 7 * dt / d; p.x += dx * v; p.y += dy * v; }
          p.wait -= dt;
          if (p.wait <= 0) { p.wait = 0.25; const t = nearestFree(p.x, p.y); if (t) { p.e = t; p.id = t.id; } }
        }
      }
    },
    lumaJelly(o, L, dt) {
      const S = G.sub;
      o.ang = (o.ang || 0) + dt * 1.7;
      G.miss = L.miss;
      o.t -= dt;
      if (o.t > 0) return;
      o.t = 0.4;
      const d = atk() * L.dmg;
      for (let i = 0; i < L.n; i++) {
        const a = o.ang + i / L.n * TAU, x = S.x + Math.cos(a) * L.orbit, y = S.y + Math.sin(a) * L.orbit;
        forNear(x, y, 0.7, e => { damage(e, d, false); });
        forNear(x, y, 1.8, e => { e.dazz = 2; });
      }
    },
    ancientDrone(o, L, dt) {
      const S = G.sub;
      o.t -= dt;
      if (o.t <= 0 && o.pets.length < L.max) { o.t = L.cd; o.pets.push({ x: S.x, y: S.y - 1, t: L.life, shot: 0.3, dash: false, tx: 0, ty: 0, fuse: 1.5, seed: Math.random() * TAU }); }
      for (let i = o.pets.length - 1; i >= 0; i--) {
        const p = o.pets[i];
        if (!p.dash) {
          const a = p.seed + G.clock * 0.9, hx = S.x + Math.cos(a) * 1.5, hy = S.y + Math.sin(a) * 1.1 - 0.6;
          const k = 1 - Math.exp(-dt * 5);
          p.x += (hx - p.x) * k; p.y += (hy - p.y) * k;
          p.shot -= dt;
          if (p.shot <= 0) {
            const e = nearest(p.x, p.y);
            if (e) { p.shot = 0.7; addMis(SHOT, p.x, p.y, Math.atan2(e.y - p.y, e.x - p.x), 12, 0.9, atk() * L.shot); } else p.shot = 0.2;
          }
          p.t -= dt;
          if (p.t <= 0) {
            const t = densest();
            p.dash = true;
            p.tx = t ? t.x : p.x; p.ty = t ? t.y : p.y;
          }
        } else {
          const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy) || 0.01;
          p.fuse -= dt;
          if (d < 0.4 || p.fuse <= 0) {
            blast(p.x, p.y, L.R, L.blast);
            if (L.shard) shards(p.x, p.y, L.shard, L.shardDmg);
            o.pets.splice(i, 1);
          } else { const v = 12 * dt / d; p.x += dx * v; p.y += dy * v; }
        }
      }
    },
    inkVeil(o, L, dt) {
      o.t -= dt;
      if (o.t > 0) return;
      o.t = L.cd;
      const S = G.sub, f = addFx(CLOUD, S.x, S.y, L.r, L.dur, L.dmg);
      G.veil = L.dur;
      G.lure.x = S.x; G.lure.y = S.y; G.lure.t = L.dur;
      if (f) { f.slowK = L.slow; f.slowT = 1; f.conf = L.conf || 0; f.boom = L.blast || 0; f.boomR = L.blastR || 0; }
      Snd.tone('ink', 0.3, 300, 90, 0.4, 'sine', 0.1);
    },
    buoyOverload(o, L, dt) {
      const S = G.sub;
      o.t -= dt;
      if (o.t > 0 || Math.hypot(S.vx, S.vy) < 1) return;
      o.t = L.cd;
      const f = addFx(BUBBLE, S.x, S.y, L.R, 1, L.dmg);
      if (f) f.push = L.push || 0;
    },
    abyssDrain(o, L, dt) {
      if (!L.all) return;
      o.t -= dt;
      if (o.t <= 0) { o.t = L.all; core.pullAllOrbs(); }
    },
    carapace(o, L, dt) {
      if (o.cdA > 0) o.cdA -= dt;
      if (o.cdB > 0) o.cdB -= dt;
    },
    currentRide(o, L, dt) {
      const S = G.sub;
      o.t -= dt;
      if (o.t > 0 || Math.hypot(S.vx, S.vy) < 1) return;
      o.t = 0.25;
      const f = addFx(TRAIL, S.x, S.y, L.r, L.life, L.dmg);
      if (f) { f.slowK = L.slow || 0; f.slowT = 0.8; f.boom = L.pop || 0; f.boomR = L.r + 0.3; }
    },
  };

  /* ===== 탄과 설치물 갱신 ===== */
  function updateMissiles(dt) {
    for (let i = MIS.n - 1; i >= 0; i--) {
      const m = MIS.a[i];
      m.life -= dt;
      let gone = m.life <= 0;
      if (m.kind === TORPEDO) {
        if (m.tgt && (m.tgt.dead || m.tgt.id !== m.id)) { m.tgt = nearest(m.x, m.y); m.id = m.tgt ? m.tgt.id : 0; }
        if (m.tgt) {
          const dx = m.tgt.x - m.x, dy = m.tgt.y - m.y, d = Math.hypot(dx, dy) || 0.01;
          const want = Math.atan2(dy, dx), cur = Math.atan2(m.vy, m.vx);
          let diff = want - cur;
          while (diff > Math.PI) diff -= TAU;
          while (diff < -Math.PI) diff += TAU;
          const na = cur + Math.max(-7 * dt, Math.min(7 * dt, diff)), sp = Math.hypot(m.vx, m.vy);
          m.vx = Math.cos(na) * sp; m.vy = Math.sin(na) * sp;
          if (d < 0.5 + m.tgt.r) gone = true;
        }
        m.x += m.vx * dt; m.y += m.vy * dt;
        if (gone) {
          blast(m.x, m.y, m.R, m.dmg, { slowK: m.slowK, slowT: m.slowT, boss: m.boss, num: true });
          if (m.whirl) { const f = addFx(WHIRL, m.x, m.y, m.R, m.whirl, 0); if (f) { f.slowK = m.slowK; f.slowT = 0.6; } }
        }
      } else {
        m.x += m.vx * dt; m.y += m.vy * dt;
        const e = firstHit(m.x, m.y, 0.14);
        if (e) { damage(e, m.dmg, m.kind === SHOT); gone = true; }
      }
      if (gone) { MIS.a[i] = MIS.a[--MIS.n]; MIS.a[MIS.n] = m; }
    }
  }
  function updateFx(dt) {
    const base = atk();
    for (let i = FX.n - 1; i >= 0; i--) {
      const f = FX.a[i];
      f.life -= dt;
      let gone = f.life <= 0;
      if (f.type === MINE) {
        if (gone) mineCount--;
        else if (anyNear(f.x, f.y, f.r)) {
          blast(f.x, f.y, f.R, f.dmg, { slowK: f.slowK, slowT: f.slowT });
          if (f.shard) shards(f.x, f.y, f.shard, f.shardDmg);
          mineCount--; gone = true;
        }
      } else if (f.type === BUBBLE) {
        if (gone) blast(f.x, f.y, f.r, f.dmg, { push: f.push });
      } else {
        f.tick -= dt;
        if (f.tick <= 0) {
          f.tick = f.type === CLOUD ? 0.5 : 0.4;
          const d = base * f.dmg;
          forNear(f.x, f.y, f.r, e => {
            if (d) damage(e, d, false);
            if (e.dead) return;
            if (f.slowK) slow(e, f.slowK, f.slowT);
            if (f.conf) confuse(e, f.conf);
          });
        }
        if (gone && f.boom) blast(f.x, f.y, f.boomR, f.boom);
      }
      if (gone) { FX.a[i] = FX.a[--FX.n]; FX.a[FX.n] = f; }
    }
  }
  function tick(dt) {
    G.miss = 0;
    if (G.veil > 0) G.veil -= dt;
    if (G.lure.t > 0) G.lure.t -= dt;
    if (G.guardT > 0) G.guardT -= dt;
    for (const o of own) TICK[o.id](o, lvOf(o), dt);
    updateMissiles(dt);
    updateFx(dt);
    /* 메아리는 처치 도중이 아니라 프레임 끝에 터뜨린다. 연쇄가 한 프레임에 몰리지 않게 8개까지만 처리한다. */
    for (let n = 0; echoes.length && n < 8; n++) {
      const q = echoes.pop();
      blast(q.x, q.y, 1.5, q.mult);
    }
    if (echoes.length > 24) echoes.length = 24;
    const ride = levelData('buoyOverload'), ink = levelData('inkVeil');
    G.moveMul = 1 + (ride ? ride.move : 0) + (ink && ink.move && G.veil > 0 ? ink.move : 0);
  }

  /* ===== 전투 코어가 부르는 지점 ===== */
  function onKill(e) {
    const cry = levelData('abyssCry');
    if (cry && cry.echo && e.conf > 0) echoes.push({ x: e.x, y: e.y, mult: cry.echo });
    const jelly = levelData('lumaJelly');
    if (jelly && jelly.orb && e.dazz > 0) addOrb(e.x, e.y, 1);
  }
  function onOrb() {
    const o = has.abyssDrain;
    if (!o) return;
    const L = lvOf(o), S = G.sub;
    o.n = (o.n || 0) + 1;
    if (o.n < L.per) return;
    o.n = 0;
    if (S.hp < G.P.hp) S.hp = Math.min(G.P.hp, S.hp + G.P.hp * 0.01);
    else if (L.lash) {
      const d = atk() * L.lash;
      for (let i = 0; i < 3; i++) { const e = nearest(S.x, S.y); if (!e) break; damage(e, d, true); addShock(e.x, e.y, 0.8, 0.2, 2); }
    }
  }
  function onHit() {
    const o = has.carapace;
    if (!o) return;
    const L = lvOf(o), S = G.sub;
    if (o.cdA <= 0) {
      o.cdA = 1.5;
      const d = atk() * L.counter;
      forNear(S.x, S.y, L.r, e => { damage(e, d, false); if (!e.dead && L.push) knock(e, S.x, S.y, L.push); });
      addShock(S.x, S.y, L.r, 0.22, 4);
    }
    if (o.cdB <= 0) {
      o.cdB = 8;
      G.guardT = L.guardT; G.guardK = L.guard;
      if (L.inv) S.inv = Math.max(S.inv, L.inv);
    }
  }
  /* 받는 피해 배율 */
  function taken() {
    const ink = levelData('inkVeil');
    return (G.guardT > 0 ? 1 - G.guardK : 1) * (ink && ink.guard && G.veil > 0 ? 1 - ink.guard : 1);
  }
  function burstBonus() {
    const w = levelData('pressureWave');
    return w && w.burst ? w.burst : 0;
  }
  function refresh() {
    const drain = levelData('abyssDrain');
    G.pullMul = 1 + (drain ? drain.pull : 0);
  }

  /* ===== 보유와 카드 ===== */
  function add(id) {
    const o = has[id];
    if (o) { if (o.lv < MAX_LV) o.lv++; } else if (own.length < SLOTS) {
      const n = { id, lv: 1, t: id === 'abyssCry' || id === 'pressureWave' ? 1.5 : 0.4, again: 0, pets: [], n: 0, cdA: 0, cdB: 0, ang: 0 };
      own.push(n); has[id] = n;
    }
    refresh();
  }
  function reset(startId) {
    own = [];
    Object.keys(has).forEach(k => { delete has[k]; });
    MIS.n = 0; FX.n = 0; echoes.length = 0; mineCount = 0;
    G.moveMul = 1; G.pullMul = 1; G.miss = 0;
    if (startId && DEF[startId]) add(startId);
    refresh();
  }
  /* 프레임 시험: 무거운 스킬 6개를 Lv5로 건다 */
  function loadout() {
    reset();
    ['abyssCry', 'ghostTorpedo', 'coralMine', 'lumaJelly', 'ancientDrone', 'currentRide'].forEach(id => { for (let i = 0; i < MAX_LV; i++) add(id); });
  }
  const list = () => own.map(o => ({ id: o.id, name: DEF[o.id].name, kind: DEF[o.id].kind, lv: o.lv }));
  function cardOf(id) {
    const s = DEF[id], lv = has[id] ? has[id].lv : 0;
    return { id, name: s.name, kind: s.kind, lv, next: lv + 1, text: s.text[lv], gold: lv === 2 || lv === 4, isNew: lv === 0 };
  }
  /* 기획서 탭 5의 가중치: 보유 2, 보유 스킬의 짝 2, 그 외 1. 6칸이 차면 보유 스킬만, Lv5는 제외. */
  function roll() {
    const pool = [];
    LIST.forEach(s => {
      const o = has[s.id];
      if (o) { if (o.lv < MAX_LV) pool.push({ id: s.id, w: 2 }); } else if (own.length < SLOTS) pool.push({ id: s.id, w: has[s.pair] ? 2 : 1 });
    });
    const cards = [];
    while (cards.length < 3 && pool.length) {
      let r = Math.random() * pool.reduce((t, p) => t + p.w, 0), k = 0;
      for (; k < pool.length - 1; k++) { r -= pool[k].w; if (r < 0) break; }
      cards.push(cardOf(pool[k].id));
      pool.splice(k, 1);
    }
    for (let i = 0; cards.length < 3 && i < FILLERS.length; i++) {
      const f = FILLERS[i];
      cards.push({ id: f.id, name: f.name, kind: 'filler', icon: f.icon, lv: 0, next: 0, text: f.text, gold: false, isNew: false, filler: true });
    }
    return cards;
  }
  function apply(id) {
    const S = G.sub;
    if (id === 'repair') S.hp = Math.min(G.P.hp, S.hp + G.P.hp * 0.3);
    else if (id === 'salvage') G.stats.bonusGold += 100;
    else if (id === 'sweep') core.pullAllOrbs();
    else add(id);
  }
  /* 상자: 보유 스킬만 무작위로 올린다 */
  function upgradeRandom(n) {
    const got = [];
    for (let i = 0; i < n; i++) {
      const c = own.filter(o => o.lv < MAX_LV);
      if (!c.length) break;
      const o = c[Math.floor(Math.random() * c.length)];
      o.lv++;
      got.push({ id: o.id, name: DEF[o.id].name, kind: DEF[o.id].kind, lv: o.lv });
    }
    refresh();
    return got;
  }

  /* ===== 그리기: 호출하는 쪽이 세계 좌표 변환을 걸어 둔다 ===== */
  const SP = {};
  function buildSprites(px) {
    const sz = m => Math.max(10, Math.ceil(m * px));
    SP.mine = window.Art.fxSprite('coralMine', sz(1));
    SP.octo = window.Art.fxSprite('babyOcto', sz(0.8));
    SP.jelly = window.Art.fxSprite('lumaJelly', sz(0.95));
    SP.drone = window.Art.fxSprite('ancientDrone', sz(0.95));
    SP.torp = window.Art.fxSprite('torp', sz(1));
  }
  const stamp = (ctx, sp, x, y, m) => ctx.drawImage(sp, x - m / 2, y - m / 2, m, m);
  function drawUnder(ctx, t, on) {
    ctx.fillStyle = 'rgba(120,230,255,.32)';
    ctx.beginPath();
    for (let i = 0; i < FX.n; i++) { const f = FX.a[i]; if (f.type === TRAIL && on(f.x, f.y)) { const r = f.r * Math.min(1, f.life / 0.3 + 0.35); ctx.moveTo(f.x + r, f.y); ctx.arc(f.x, f.y, r, 0, TAU); } }
    ctx.fill();
    for (let i = 0; i < FX.n; i++) {
      const f = FX.a[i];
      if (!on(f.x, f.y)) continue;
      if (f.type === CLOUD) {
        ctx.fillStyle = 'rgba(32,22,58,' + Math.min(0.72, f.life * 1.4).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r + 0.06 * Math.sin(t * 5), 0, TAU); ctx.fill();
        ctx.lineWidth = 0.07; ctx.strokeStyle = 'rgba(141,108,208,.7)'; ctx.stroke();
      } else if (f.type === WHIRL) {
        ctx.lineWidth = 0.08; ctx.strokeStyle = 'rgba(185,238,255,.7)';
        for (let k = 0; k < 2; k++) { const a = t * 5 + k * Math.PI; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (0.55 + k * 0.3), a, a + 3.6); ctx.stroke(); }
      } else if (f.type === BUBBLE) {
        const g = 1 - f.life / f.max, r = f.r * (0.35 + 0.25 * g);
        ctx.fillStyle = 'rgba(127,228,255,.42)'; ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, TAU); ctx.fill();
        ctx.lineWidth = 0.05; ctx.strokeStyle = '#E6FBFF'; ctx.stroke();
      } else if (f.type === MINE && SP.mine) {
        stamp(ctx, SP.mine, f.x, f.y, 1 + 0.04 * Math.sin(t * 6 + i));
      }
    }
  }
  function drawOver(ctx, t, on) {
    ctx.lineCap = 'round'; ctx.lineWidth = 0.08; ctx.strokeStyle = '#FFE9A8';
    ctx.beginPath();
    for (let i = 0; i < MIS.n; i++) { const m = MIS.a[i]; if (m.kind !== TORPEDO) { ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 0.025, m.y - m.vy * 0.025); } }
    ctx.stroke();
    for (let i = 0; i < MIS.n; i++) {
      const m = MIS.a[i];
      if (m.kind !== TORPEDO || !on(m.x, m.y) || !SP.torp) continue;
      ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(Math.atan2(m.vy, m.vx)); ctx.globalAlpha = 0.5;
      stamp(ctx, SP.torp, 0, 0, 1);
      ctx.restore();
    }
    const S = G.sub;
    for (const o of own) {
      if (o.id === 'babyOcto' && SP.octo) for (const p of o.pets) stamp(ctx, SP.octo, p.x, p.y + 0.04 * Math.sin(t * 8 + p.ox * 20), 0.8);
      else if (o.id === 'ancientDrone' && SP.drone) for (const p of o.pets) stamp(ctx, SP.drone, p.x, p.y, 0.95);
      else if (o.id === 'lumaJelly' && SP.jelly) {
        const L = lvOf(o);
        for (let i = 0; i < L.n; i++) { const a = o.ang + i / L.n * TAU; stamp(ctx, SP.jelly, S.x + Math.cos(a) * L.orbit, S.y + Math.sin(a) * L.orbit, 0.95); }
      }
    }
  }
  return { reset, add, loadout, list, roll, apply, upgradeRandom, tick, onKill, onOrb, onHit, taken, burstBonus, buildSprites, drawUnder, drawOver };
};
