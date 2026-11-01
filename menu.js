/* 메뉴 화면: 로비, 수심 지도, 출격 준비, 결과, 하단 탭 5개. 진행 상황 저장과 보상 계산도 여기서 한다. */
(function () {
  'use strict';
  const D = window.DATA, Art = window.Art, Battle = window.Battle, Snd = Battle.Snd;
  const ICON = {};
  'gold pearl oxygen bp alloy star starOff lock back fwd close plus check tabPlay tabSub tabGear tabShop tabMore explore mission mail book gearCfg notice dice chest ad atk hp speed kills clock xp purify shard boss wave'.split(' ').forEach(n => Object.defineProperty(ICON, n, { get: () => Art.ico(n) }));
  const $ = id => document.getElementById(id);
  const shell = $('shell'), modal = $('modal'), toastEl = $('toast');
  const num = n => Math.floor(n).toLocaleString('ko-KR');
  const short = n => (n >= 1000000 ? (n / 10000).toFixed(0) + '만' : n >= 100000 ? (n / 10000).toFixed(1).replace(/\.0$/, '') + '만' : num(n));
  const fmt = s => { s = Math.max(0, Math.floor(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const OXY_MAX = 30, OXY_COST = 5, OXY_MS = 15 * 60 * 1000;
  const SAVE_KEY = 'btp_save_v1';

  /* ===== 저장 ===== */
  const dayKey = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  const weekKey = () => { const d = new Date(); const m = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7)); return m.getFullYear() + '-' + (m.getMonth() + 1) + '-' + m.getDate(); };
  function freshSave() {
    const gear = [], eq = {};
    let uid = 1;
    [['주포', 'twinHarpoon'], ['보조', 'sideGun'], ['센서', 'aim'], ['장갑', 'whaleArmor'], ['엔진', 'supercharge'], ['특수모듈', 'overload']].forEach(p => {
      gear.push({ uid, id: p[1], tier: 0, lv: 1 }); eq[p[0]] = uid; uid++;
    });
    const bp = {};
    D.slots.forEach(s => { bp[s.id] = 2; });
    return {
      v: 1, uid, gold: 500, pearl: 0, oxygen: OXY_MAX, oxyT: Date.now(), alloy: 0, bp,
      acct: { lv: 1, xp: 0 }, chapter: 1, cleared: 0, purity: {}, best: {},
      subId: 'coral', pilotId: 'coral', subs: { coral: { star: 1, shards: 0 } }, pilots: { coral: { star: 1, shards: 0 } },
      gear, eq, pity: { adv: 0, hero: 0, sub: 0, pilot: 0 },
      day: { key: '', freeChest: false, adChest: false, quick: 0, goldBag: 0, oxyPearl: 0, oxyAd: 0 }, week: { key: '', subBox: false, pilotBox: false },
      daily: { key: '', prog: {}, claimed: [] }, weekly: { key: '', pts: 0, claimed: false }, ach: { kills: 0, claimed: {} },
      explore: { last: 0 }, seenEnemy: false, sound: true,
      mail: [{ id: 'welcome', title: '순찰대 합류를 환영합니다', body: '오염된 항구부터 차근차근 내려가 주세요. 시험판 시작 보급입니다.', gold: 3000, pearl: 300, bp: 12, read: false }],
    };
  }
  let S = null;
  function loadSave(data) {
    let raw = null;
    try { raw = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (err) { raw = null; }
    if (!raw && data && data.save) raw = data.save;
    S = raw && raw.v === 1 ? Object.assign(freshSave(), raw) : freshSave();
  }
  function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (err) { /* 저장이 막혀 있어도 이번 판은 계속 된다 */ } }

  /* 날짜가 바뀌면 하루 단위 값을 비운다. */
  function rollDay() {
    const k = dayKey(), w = weekKey();
    if (S.day.key !== k) S.day = { key: k, freeChest: false, adChest: false, quick: 0, goldBag: 0, oxyPearl: 0, oxyAd: 0 };
    if (S.week.key !== w) S.week = { key: w, subBox: false, pilotBox: false };
    if (S.weekly.key !== w) S.weekly = { key: w, pts: 0, claimed: false };
    if (S.daily.key !== k) { S.daily = { key: k, prog: {}, claimed: [] }; S.weekly.pts += 10; }
  }
  function tickOxygen() {
    const now = Date.now();
    if (S.oxygen >= OXY_MAX) { S.oxyT = now; return; }
    while (S.oxygen < OXY_MAX && now - S.oxyT >= OXY_MS) { S.oxygen++; S.oxyT += OXY_MS; }
  }

  /* ===== 계산 ===== */
  const chapterOf = no => D.chapters[no - 1];
  const subOf = id => D.subs.find(x => x.id === id);
  const pilotOf = id => D.pilots.find(x => x.id === id);
  const itemOf = g => D.items[g.id];
  const gearByUid = uid => S.gear.find(g => g.uid === Number(uid));
  const equipped = slot => gearByUid(S.eq[slot]);
  const isEquipped = g => S.eq[itemOf(g).slot] === g.uid;
  const slotDef = id => D.slots.find(x => x.id === id);
  const gearValue = g => { const t = D.tiers[g.tier]; return t.base + t.inc * (g.lv - 1); };
  const gearImg = (g, px) => Art.url('gear', g.id, px || 116, D.tiers[g.tier].group);
  const statLabel = slot => (slotDef(slot).stat === 'atk' ? '공격력' : '내구도');
  const gearStat = g => { const sl = slotDef(itemOf(g).slot); return Math.round(gearValue(g) * sl.weight * (sl.stat === 'hp' ? 5 : 1)); };
  function playerStats() {
    const sub = subOf(S.subId), pil = pilotOf(S.pilotId);
    let atkGear = 0, hpGear = 0;
    D.slots.forEach(sl => {
      const g = equipped(sl.id);
      if (!g) return;
      const v = gearValue(g) * sl.weight;
      if (sl.stat === 'atk') atkGear += v; else hpGear += v * 5;
    });
    const mult = (1 + 0.10 * (S.subs[sub.id].star - 1)) * (1 + 0.05 * (S.pilots[pil.id].star - 1)) * (1 + 0.005 * (S.acct.lv - 1));
    return {
      atk: Math.round((100 * sub.atk + atkGear) * mult * (1 + pil.atk / 100)),
      hp: Math.round((1000 * sub.hp + hpGear) * mult * (1 + pil.hp / 100)),
      speed: sub.speed + pil.move,
    };
  }
  /* 화면 표시용 전투력. 전투 계산에는 쓰지 않는다. */
  const powerOf = (atk, hp) => Math.round(atk * 4 + hp * 0.4);
  const myPower = () => { const st = playerStats(); return powerOf(st.atk, st.hp); };
  function battlePlayer() {
    const st = playerStats(), pil = pilotOf(S.pilotId), coral = S.subId === 'coral';
    return { atk: st.atk, hp: st.hp, speed: st.speed / 100 * 4, levelHeal: coral ? 0.03 : 0, burstHeal: coral ? 0.05 : 0, xpMul: 1 + (pil.xp || 0) / 100, subId: S.subId, pilotId: S.pilotId, startSkill: pil.skillId, rerolls: pil.id === 'coral' ? 2 : 1 };
  }
  const enhanceCost = g => ({ gold: Math.round(200 * Math.pow(1.09, g.lv - 1)), bp: 1 + Math.floor(g.lv / 5) });
  function spentOn(g) {
    let gold = 0, bp = 0;
    for (let lv = 1; lv < g.lv; lv++) { gold += Math.round(200 * Math.pow(1.09, lv - 1)); bp += 1 + Math.floor(lv / 5); }
    return { gold, bp };
  }
  function addBp(n) {
    for (let i = 0; i < n; i++) { const s = D.slots[Math.floor(Math.random() * D.slots.length)].id; S.bp[s] = (S.bp[s] || 0) + 1; }
  }
  const bpTotal = () => D.slots.reduce((t, s) => t + (S.bp[s.id] || 0), 0);
  function addGear(id, tier) { const g = { uid: S.uid++, id, tier, lv: 1 }; S.gear.push(g); return g; }
  function removeGear(g) { S.gear.splice(S.gear.indexOf(g), 1); }
  const anyItemId = () => { const k = Object.keys(D.items); return k[Math.floor(Math.random() * k.length)]; };
  function addAcctXp(n) {
    S.acct.xp += n;
    let need = 100 + 40 * (S.acct.lv - 1), up = 0;
    while (S.acct.xp >= need) { S.acct.xp -= need; S.acct.lv++; up++; need = 100 + 40 * (S.acct.lv - 1); }
    if (up) S.oxygen += 30 * up; // 계정 레벨업 보상은 최대치를 넘길 수 있다.
    return up;
  }
  const missionDone = m => m.id === 'login' || (S.daily.prog[m.track] || 0) >= m.need;
  const dailyScore = () => D.dailyMissions.reduce((t, m) => t + (missionDone(m) ? m.pts : 0), 0);
  function track(key, n) {
    rollDay();
    const before = D.dailyMissions.filter(missionDone).length;
    const beforeScore = dailyScore();
    S.daily.prog[key] = (S.daily.prog[key] || 0) + (n || 1);
    if (D.dailyMissions.filter(missionDone).length !== before) S.weekly.pts += dailyScore() - beforeScore;
  }
  function grantUnlocks() {
    const got = [];
    D.subs.forEach(x => { if (x.unlock && x.unlock <= S.cleared && !(S.subs[x.id] && S.subs[x.id].star)) { S.subs[x.id] = { star: 1, shards: (S.subs[x.id] || {}).shards || 0 }; got.push('잠수함 ' + x.name); } });
    D.pilots.forEach(x => { if (x.unlock && x.unlock <= S.cleared && !(S.pilots[x.id] && S.pilots[x.id].star)) { S.pilots[x.id] = { star: 1, shards: (S.pilots[x.id] || {}).shards || 0 }; got.push('파일럿 ' + x.name); } });
    return got;
  }
  const owned = (kind, id) => { const e = (kind === 'sub' ? S.subs : S.pilots)[id]; return !!(e && e.star >= 1); };
  const exploreOpen = () => S.cleared >= 1;
  function exploreGain() {
    if (!exploreOpen()) return { h: 0, gold: 0, bp: 0 };
    const h = Math.min(16, (Date.now() - S.explore.last) / 3600000);
    return { h, gold: Math.floor(chapterOf(Math.max(1, S.cleared)).exploreGold * h), bp: Math.floor(0.8 * h) };
  }
  const dailyClaimable = () => D.dailyTiers.some(t => dailyScore() >= t.at && S.daily.claimed.indexOf(t.at) < 0);
  const mailUnread = () => S.mail.some(m => !m.read);
  const moreDot = () => dailyClaimable() || mailUnread();
  const shopDot = () => !S.day.freeChest;
  function gearDot() {
    return D.slots.some(sl => {
      const g = equipped(sl.id);
      if (!g) return S.gear.some(x => itemOf(x).slot === sl.id);
      const c = enhanceCost(g);
      return g.lv < D.tiers[g.tier].cap && S.gold >= c.gold && (S.bp[sl.id] || 0) >= c.bp;
    });
  }

  /* ===== 화면 상태 ===== */
  const V = { title: true, tab: 'play', page: null, subMode: 'sub', subSel: 'coral', pilotSel: 'coral', gearFilter: '전체', shopTab: 'gacha', banner: 'advanced', misTab: 'daily', codexTab: 'enemy', result: null, runChapter: 1, wipeArmed: false, focusModes: false };
  const STARS = (n, max) => { let h = '<span class="stars">'; for (let i = 1; i <= (max || 6); i++) h += i <= n ? ICON.star : ICON.starOff; return h + '</span>'; };
  const tag = g => '<span class="tag t' + D.tiers[g.tier].group + '">' + D.tiers[g.tier].name + '</span>';
  const pct = (a, b) => Math.max(0, Math.min(100, Math.round(a / b * 100)));

  function chips(kinds) {
    const k = kinds || ['oxy', 'gold', 'pearl'], h = {
      oxy: '<button class="chip" type="button" data-act="oxy" aria-label="산소">' + ICON.oxygen + '<span id="chipOxy">' + S.oxygen + '/' + OXY_MAX + '</span><i class="plus"></i></button>',
      gold: '<button class="chip" type="button" data-act="goShop" data-arg="goldTab" aria-label="골드">' + ICON.gold + '<span id="chipGold">' + short(S.gold) + '</span><i class="plus"></i></button>',
      pearl: '<button class="chip" type="button" data-act="goShop" data-arg="pearl" aria-label="진주">' + ICON.pearl + '<span id="chipPearl">' + short(S.pearl) + '</span><i class="plus"></i></button>',
    };
    return '<div class="chips">' + k.map(x => h[x]).join('') + '</div>';
  }
  function avatar() {
    const need = 100 + 40 * (S.acct.lv - 1);
    return '<button class="me" type="button" data-act="goSubs" data-arg="pilot" aria-label="파일럿, 계정 레벨 ' + S.acct.lv + '"><span class="me-ring" style="background:conic-gradient(var(--mint) ' + pct(S.acct.xp, need) + '%, #000 0)"><span class="me-in"><img alt="" src="' + Art.url('face', S.pilotId, 96) + '"></span></span><span class="me-lv">' + S.acct.lv + '</span></button>';
  }
  const mainTop = () => '<div class="top">' + avatar() + chips() + '</div>';
  function topBar(title, back, kinds) {
    const left = back ? '<button class="iconbtn" type="button" data-act="' + back + '" aria-label="뒤로">' + ICON.back + '</button>' : '';
    return '<div class="top dim">' + left + '<div class="top-title">' + title + '</div>' + chips(kinds || ['gold', 'pearl']) + '</div>';
  }
  function tabBar() {
    const TABS = [['play', '도전', 'tabPlay', false], ['subs', '잠수함', 'tabSub', false], ['gear', '장비', 'tabGear', gearDot()], ['shop', '상점', 'tabShop', shopDot()], ['more', '더보기', 'tabMore', moreDot()]];
    return '<nav class="tabs" aria-label="메뉴">' + TABS.map(t => '<button class="tab' + (V.tab === t[0] && !V.page ? ' on' : '') + '" type="button" data-act="tab" data-arg="' + t[0] + '">' + ICON[t[2]] + t[1] + (t[3] ? '<span class="dot"></span>' : '') + '</button>').join('') + '</nav>';
  }
  const dot = on => (on ? '<span class="dot"></span>' : '');

  /* ===== 타이틀 ===== */
  let logoUrl = '';
  function viewTitle() {
    return '<button class="title-screen" type="button" data-act="enter" aria-label="게임 시작">' + (logoUrl ? '<img class="logo" alt="해구 순찰대" src="' + logoUrl + '">' : '') + '<span class="tap">화면을 눌러 시작</span><span class="ver">시험판 0.2</span></button>';
  }

  /* ===== 로비 ===== */
  function dailyTrack() {
    const sc = dailyScore();
    return '<span class="track"><i style="width:' + sc + '%"></i>' + D.dailyTiers.map(t => {
      const got = S.daily.claimed.indexOf(t.at) >= 0, ready = sc >= t.at && !got;
      return '<b class="' + (got ? 'got' : ready ? 'ready' : '') + '" style="left:' + t.at + '%">' + ICON.chest + '</b>';
    }).join('') + '</span>';
  }
  function viewLobby() {
    const ch = chapterOf(S.chapter), pur = S.purity[ch.no] || 0, need = powerOf(ch.refAtk, ch.refHp), mine = myPower();
    const railPos = Math.max(2, (S.chapter - 1) / 14 * 100);
    let ticks = '';
    for (let i = 1; i < 5; i++) ticks += '<i style="top:' + i * 20 + '%"></i>';
    return mainTop() +
      '<div class="body"><div class="lobby">' +
        '<div class="scene-box" data-fit="0.78">' +
          '<div class="oxy-next" id="oxyNext"></div>' +
          '<button class="hero-hit" type="button" data-act="goSubs" data-arg="sub" aria-label="잠수함 보기"></button>' +
          '<button class="gauge" type="button" data-act="openMap" aria-label="수심 지도, 현재 ' + num(ch.to) + '미터">' +
            '<span class="gauge-top">' + num(ch.to) + 'm</span>' +
            '<span class="rail" style="--p:' + railPos + '%">' + ticks + '<b>' + ICON.tabSub + '</b></span>' +
            '<span class="gauge-end">10,900m</span>' +
          '</button>' +
          '<div class="side side-r">' +
            '<button type="button" data-act="explore"><span class="port">' + ICON.explore + '</span><span class="lb">탐사</span>' + dot(exploreOpen() && exploreGain().h >= 1) + '</button>' +
            '<button type="button" data-act="openPage" data-arg="missions"><span class="port">' + ICON.mission + '</span><span class="lb">미션</span>' + dot(dailyClaimable()) + '</button>' +
            '<button type="button" data-act="openPage" data-arg="mail"><span class="port">' + ICON.mail + '</span><span class="lb">우편</span>' + dot(mailUnread()) + '</button>' +
          '</div>' +
          (S.day.freeChest ? '' : '<button class="gift-float" type="button" data-act="freeChest" data-arg="free" aria-label="오늘의 무료 보급 상자"><span class="bub"></span><img alt="" src="' + Art.url('chest', 'normal', 96) + '"></button>') +
        '</div>' +
        '<div class="lobby-low">' +
          '<div class="stage-plate">' +
            '<button class="arrow l" type="button" data-act="chapterStep" data-arg="-1" aria-label="이전 챕터"' + (S.chapter <= 1 ? ' disabled' : '') + '>' + ICON.back + '</button>' +
            '<button class="plate-main" type="button" data-act="openMap" aria-label="수심 지도 열기">' +
              '<span class="plate-art"><img alt="" src="' + Art.url('chapter', ch.no, 200) + '"></span>' +
              '<span class="plate-info">' +
                '<span class="plate-head"><span class="plate-no">' + ch.no + '</span><span class="plate-name">' + ch.name + '</span></span>' +
                '<span class="plate-sub">' + ICON.atk + '권장 <b class="' + (mine < need ? 'low' : '') + '">' + num(need) + '</b>' + (S.best[ch.no] ? '<span class="best">' + ICON.clock + fmt(S.best[ch.no]) + '</span>' : '') + '</span>' +
                '<span class="plate-pur"><span class="pur"><i style="width:' + pur + '%"></i></span><em>정화 ' + pur + '%</em></span>' +
              '</span>' +
            '</button>' +
            '<button class="arrow r" type="button" data-act="chapterStep" data-arg="1" aria-label="다음 챕터"' + (S.chapter >= Math.min(15, S.cleared + 1) ? ' disabled' : '') + '>' + ICON.fwd + '</button>' +
          '</div>' +
          '<div class="low-row">' +
            '<button class="daily" type="button" data-act="openPage" data-arg="missions"><span class="line"><span>일일 미션</span><span>' + dailyScore() + '/100</span></span>' + dailyTrack() + '</button>' +
            '<button class="btn btn-blue modes" type="button" data-act="openModes">' + ICON.boss + '도전 모드</button>' +
          '</div>' +
          '<button class="btn sortie" type="button" data-act="openPage" data-arg="prep">출격<small>' + ICON.oxygen + OXY_COST + '</small></button>' +
        '</div>' +
      '</div></div>' + tabBar();
  }

  /* ===== 수심 지도 ===== */
  function viewMap() {
    const rows = D.chapters.map(c => {
      const open = c.no <= S.cleared + 1, on = c.no === S.chapter, done = c.no <= S.cleared, pur = S.purity[c.no] || 0;
      let more = '';
      if (on) {
        const need = powerOf(c.refAtk, c.refHp);
        more = '<div class="ch-more">권장 전투력 ' + num(need) + ' · 최종 보스 ' + c.boss + (S.best[c.no] ? ' · 최고 ' + fmt(S.best[c.no]) : '') + (done ? '' : '<br><em>첫 클리어: 진주 200, 고급 상자</em>') + '</div>';
      }
      return '<button class="ch' + (on ? ' on' : '') + (done ? ' done' : '') + (open ? '' : ' off') + '" type="button" data-act="pickChapter" data-arg="' + c.no + '"' + (on ? ' id="chOn"' : '') + '>' +
        '<span class="no">' + c.no + '</span><img class="thumb" alt="" src="' + Art.url('chapter', c.no, 200) + '">' +
        '<div><h3>' + c.name + '</h3><p>' + num(c.from) + '~' + num(c.to) + 'm · ' + c.layer + '</p>' + (open ? '<span class="pur"><i style="width:' + pur + '%"></i></span>' : '') + '</div>' +
        (open ? (done ? ICON.check : '') : ICON.lock) + more + '</button>';
    }).join('');
    const MODE_ICON = { '골드 해구': 'gold', '설계도 창고': 'bp', '보스 러시': 'boss', '수압 시험': 'wave', '끝없는 잠항': 'tabPlay' };
    const modes = D.modes.map(m => {
      const open = S.cleared >= m.unlock;
      return '<button class="mode' + (open ? '' : ' off') + '" type="button" data-act="modeInfo" data-arg="' + m.name + '">' + ICON[MODE_ICON[m.name] || 'boss'] + '<div><b>' + m.name + '</b><span>' + (open ? m.limit : '챕터 ' + m.unlock + ' 클리어') + '</span></div></button>';
    }).join('');
    return topBar('수심 지도', 'closePage') +
      '<div class="body"><div class="page"><div class="list scroll" id="mapScroll">' +
        '<div class="dive">' + rows + '</div>' +
        '<h3 class="ribbon sec-title" id="modesTitle">도전 모드</h3><div class="mode-grid">' + modes + '</div>' +
      '</div></div></div>' + tabBar();
  }

  /* ===== 격납고 위 장비 슬롯 (출격 준비와 장비 탭이 같이 쓴다) ===== */
  function gearSlot(id) {
    const g = equipped(id);
    return '<button class="gslot" type="button" data-act="' + (g ? 'itemSheet' : 'slotSheet') + '" data-arg="' + (g ? g.uid : id) + '" aria-label="' + id + (g ? ' ' + itemOf(g).name : ' 비어 있음') + '"><img alt="" src="' + (g ? gearImg(g) : Art.url('slot', id, 116)) + '">' + (g ? '<em>' + g.lv + '</em>' : '') + '</button>';
  }
  function bay(extraAct) {
    return '<div class="bay"><div class="scene-box" data-fit="0.56"><button class="hero-hit" type="button" data-act="goSubs" data-arg="sub" aria-label="잠수함 교체"></button></div>' +
      '<div class="bay-col l">' + gearSlot('주포') + gearSlot('센서') + gearSlot('보조') + '</div>' +
      '<div class="bay-col r">' + gearSlot('장갑') + gearSlot('엔진') + gearSlot('특수모듈') + '</div>' +
      '<div class="cp">' + ICON.atk + '<span>전투력</span><b>' + num(myPower()) + '</b></div>' + (extraAct || '') + '</div>';
  }

  /* ===== 출격 준비 ===== */
  function viewPrep() {
    const st = playerStats(), sub = subOf(S.subId), pil = pilotOf(S.pilotId);
    return topBar('출격 준비', 'closePage', ['oxy', 'gold']) +
      '<div class="body"><div class="prep">' + bay() +
        '<div class="prep-low">' +
          '<div class="stat-row"><div>' + ICON.atk + num(st.atk) + '</div><div>' + ICON.hp + num(st.hp) + '</div><div>' + ICON.speed + st.speed + '</div></div>' +
          '<div class="who">' +
            '<button type="button" data-act="goSubs" data-arg="sub"><img alt="" src="' + Art.url('sub', sub.id, 96, pil.id) + '"><div><b>' + sub.name + '</b>' + STARS(S.subs[sub.id].star) + '</div></button>' +
            '<button type="button" data-act="goSubs" data-arg="pilot"><img alt="" src="' + Art.url('pilot', pil.id, 96) + '"><div><b>' + pil.name + '</b>' + STARS(S.pilots[pil.id].star) + '</div></button>' +
          '</div>' +
          '<button class="btn sortie" type="button" data-act="launch">최종 출격<small>' + ICON.oxygen + OXY_COST + '</small></button>' +
        '</div>' +
      '</div></div>';
  }

  /* ===== 잠수함 탭 ===== */
  function viewSubs() {
    const isSub = V.subMode === 'sub';
    const list = isSub ? D.subs : D.pilots, kind = isSub ? 'sub' : 'pilot', store = isSub ? S.subs : S.pilots;
    const selId = isSub ? V.subSel : V.pilotSel, sel = list.find(x => x.id === selId) || list[0];
    const curId = isSub ? S.subId : S.pilotId, have = owned(kind, sel.id);
    const star = have ? store[sel.id].star : 0;
    const cta = !have
      ? '<button class="btn btn-gray cta" type="button" disabled>' + ICON.lock + sel.unlockText + '</button>'
      : curId === sel.id
        ? '<div class="btn btn-teal cta">' + ICON.check + '출격 중</div>'
        : '<button class="btn btn-gold cta" type="button" data-act="activate">활성화</button>';
    const tags = isSub
      ? '<span class="tag">' + sel.type + '</span>'
      : '<span class="tag">' + sel.species + '</span>';
    const cards = list.map((x, i) => {
      const o = owned(kind, x.id), st = o ? store[x.id].star : 0, img = isSub ? Art.url('sub', x.id, 160, S.pilotId) : Art.url('pilot', x.id, 160);
      const rare = i >= (isSub ? 7 : 8) ? ' r2' : i >= (isSub ? 3 : 4) ? ' r1' : '';
      return '<button class="card' + rare + (x.id === sel.id ? ' on' : '') + (o ? '' : ' off') + '" type="button" data-act="pickRoster" data-arg="' + x.id + '" aria-label="' + x.name + '">' +
        '<img alt="" src="' + img + '">' + (o ? '' : '<span class="lock">' + ICON.lock + '</span>') + (x.id === curId ? '<span class="used">출격</span>' : '') + STARS(st) + '</button>';
    }).join('');
    return mainTop() +
      '<div class="body"><div class="hangar">' +
        '<div class="seg hangar-seg"><button type="button" class="' + (isSub ? 'on' : '') + '" data-act="subMode" data-arg="sub">잠수함</button><button type="button" class="' + (isSub ? '' : 'on') + '" data-act="subMode" data-arg="pilot">파일럿</button></div>' +
        '<div class="scene-box" data-fit="0.62"></div>' +
        '<div class="info"><div class="name">' + sel.name + '</div>' + STARS(star) + '<div class="tag-line">' + tags + '</div></div>' +
        '<button class="btn btn-blue mini" type="button" data-act="rosterSheet">상세</button>' + cta +
      '</div><div class="shelf scroll"><div class="grid4">' + cards + '</div></div></div>' + tabBar();
  }
  function rosterSheet() {
    const isSub = V.subMode === 'sub', kind = isSub ? 'sub' : 'pilot', store = isSub ? S.subs : S.pilots;
    const x = isSub ? subOf(V.subSel) : pilotOf(V.pilotSel), e = store[x.id] || { star: 0, shards: 0 };
    const star = e.star || 0, next = star >= 1 && star < 6 ? star : -1;
    const needShard = next > 0 ? D.starShards[next] : 0, needGold = next > 0 ? Math.round(D.starGold[next] * (isSub ? 1 : 0.5)) : 0;
    let body = '<div class="item-head"><img alt="" src="' + (isSub ? Art.url('sub', x.id, 180, S.pilotId) : Art.url('pilot', x.id, 180)) + '"><div><div class="name">' + x.name + '</div>' + STARS(star) + '<div class="small muted">' + (isSub ? x.type : x.species + '. ' + x.story) + '</div></div></div>';
    if (isSub) {
      body += '<dl class="kv"><dt>패시브</dt><dd>' + x.passive + '</dd><dt>액티브</dt><dd>' + x.active + '</dd><dt>수중 규칙</dt><dd>' + x.water + '</dd><dt>운영</dt><dd>' + x.tip + '</dd></dl>';
      body += '<div class="star-table">' + x.stars.map((t, i) => '<b class="' + (star >= i + 2 ? 'past' : '') + '">★' + (i + 2) + '</b><span class="' + (star >= i + 2 ? 'past' : '') + '">' + t + '</span>').join('') + '</div>';
    } else {
      body += '<dl class="kv"><dt>보너스</dt><dd>' + x.bonusText + '</dd><dt>시작 스킬</dt><dd>' + x.skill + '</dd><dt>패시브</dt><dd>' + x.passive + '</dd><dt>추천 기체</dt><dd>' + x.rec + '</dd></dl>';
    }
    let foot = '<button class="btn btn-blue" type="button" data-act="closeModal">닫기</button>';
    if (next > 0) foot += '<button class="btn btn-gold" type="button" data-act="starUp" data-arg="' + kind + '"' + (e.shards >= needShard && S.gold >= needGold ? '' : ' disabled') + '>★' + (star + 1) + ' 승급<small>조각 ' + e.shards + '/' + needShard + ', 골드 ' + short(needGold) + '</small></button>';
    openSheet(x.name, body, foot);
  }

  /* ===== 장비 탭 ===== */
  function viewGear() {
    const filters = ['전체', '주포', '보조', '센서', '장갑', '엔진', '특수모듈'];
    const rows = S.gear.filter(g => V.gearFilter === '전체' || itemOf(g).slot === V.gearFilter)
      .sort((a, b) => (isEquipped(b) - isEquipped(a)) || (b.tier - a.tier) || (b.lv - a.lv));
    const cards = rows.map(g => '<button class="gcard" type="button" data-act="itemSheet" data-arg="' + g.uid + '" aria-label="' + itemOf(g).name + '"><img alt="" src="' + gearImg(g) + '">' + (isEquipped(g) ? '<i>' + ICON.check + '</i>' : '') + '<b>' + g.lv + '</b></button>').join('');
    const blanks = Math.max(20 - rows.length, (5 - rows.length % 5) % 5);
    const cells = '<span class="gcell"></span>'.repeat(blanks);
    return mainTop() +
      '<div class="body">' + bay() + '<div class="shelf">' +
        '<div class="tools"><div class="filter">' + filters.map(f => '<button type="button" class="' + (V.gearFilter === f ? 'on' : '') + '" data-act="gearFilter" data-arg="' + f + '">' + (f === '특수모듈' ? '모듈' : f) + '</button>').join('') + '</div>' +
        '<button class="btn btn-gold" type="button" data-act="bulkMerge">일괄 합성</button></div>' +
        '<div class="scroll" style="flex:1;min-height:0">' + '<div class="grid5">' + cards + cells + '</div>' + '</div>' +
      '</div></div>' + tabBar();
  }
  function slotSheet(slot) {
    const cur = equipped(slot), cv = cur ? gearStat(cur) : 0;
    const rows = S.gear.filter(g => itemOf(g).slot === slot).sort((a, b) => (isEquipped(b) - isEquipped(a)) || (gearStat(b) - gearStat(a)));
    const body = rows.map(g => {
      const on = isEquipped(g), diff = gearStat(g) - cv;
      const dt = on ? statLabel(slot) + ' ' + gearStat(g) : statLabel(slot) + ' <span class="' + (diff >= 0 ? 'up' : 'down') + '">' + (diff >= 0 ? '+' : '−') + Math.abs(diff) + '</span>';
      return '<div class="row-item"><img alt="" src="' + gearImg(g) + '"><div><b>' + itemOf(g).name + '</b><span>' + D.tiers[g.tier].name + ' Lv' + g.lv + ', ' + dt + '</span></div>' +
        (on ? '<span class="tag">장착 중</span>' : '<button class="btn btn-gold" type="button" data-act="equip" data-arg="' + g.uid + '">장착</button>') + '</div>';
    }).join('');
    openSheet(slot + ' 장착', body || '<p class="empty">이 슬롯의 장비가 없습니다.</p>', '<button class="btn btn-blue" type="button" data-act="toGear">장비 탭으로</button>');
  }
  function mergeInfo(g) {
    if (g.tier >= D.merges.length) return null;
    const m = D.merges[g.tier], slot = itemOf(g).slot;
    const cands = S.gear.filter(x => x.uid !== g.uid && x.tier === m.mat && itemOf(x).slot === slot && !isEquipped(x)).sort((a, b) => a.lv - b.lv);
    return { m, cands, ok: cands.length >= m.n && S.gold >= m.gold };
  }
  function itemSheet(uid) {
    const g = gearByUid(uid);
    if (!g) { closeModal(); return; }
    const it = itemOf(g), t = D.tiers[g.tier], slot = it.slot, c = enhanceCost(g), set = D.sets[it.set], on = isEquipped(g), mi = mergeInfo(g), capped = g.lv >= t.cap;
    const setCount = D.slots.filter(sl => { const e = equipped(sl.id); return e && itemOf(e).set === it.set; }).length;
    let body = '<div class="item-head"><img alt="" src="' + gearImg(g, 180) + '"><div><div class="name">' + it.name + '</div>' + tag(g) + ' <span class="small">Lv ' + g.lv + '/' + t.cap + '</span><div class="small muted">' + slot + ' · ' + statLabel(slot) + ' +' + gearStat(g) + '</div></div></div>';
    body += '<dl class="kv"><dt>고유 효과</dt><dd>' + (g.tier >= 1 ? it.effect : '희귀부터 열림: ' + it.effect) + '</dd><dt>전설 효과</dt><dd>' + (g.tier >= 5 ? it.legend : '전설부터 열림: ' + it.legend) + '</dd><dt>세트</dt><dd>' + it.set + ' (' + setCount + '/6). 2개 ' + set.two + ', 4개 ' + set.four + ', 6개 ' + set.six + '</dd></dl>';
    if (mi) body += '<div class="row-item" style="display:block"><b>합성: ' + t.name + ' → ' + D.tiers[g.tier + 1].name + '</b><span>같은 슬롯 ' + D.tiers[mi.m.mat].name + ' ' + mi.m.n + '개, 보유 ' + mi.cands.length + '개 · 골드 ' + num(mi.m.gold) + '</span></div>';
    let foot = '<button class="btn btn-gold" type="button" data-act="enhance" data-arg="' + g.uid + '"' + (capped || S.gold < c.gold || (S.bp[slot] || 0) < c.bp ? ' disabled' : '') + '>' + (capped ? '레벨 상한' : '강화') + (capped ? '' : '<small>' + ICON.gold + short(c.gold) + ' ' + ICON.bp + (S.bp[slot] || 0) + '/' + c.bp + '</small>') + '</button>';
    foot += on ? '' : '<button class="btn btn-teal" type="button" data-act="equip" data-arg="' + g.uid + '">장착</button>';
    let foot2 = '';
    if (mi) foot2 += '<button class="btn btn-blue" type="button" data-act="merge" data-arg="' + g.uid + '"' + (mi.ok ? '' : ' disabled') + '>합성</button>';
    if (!on) foot2 += '<button class="btn btn-gray" type="button" data-act="dismantle" data-arg="' + g.uid + '">분해<small>합금 ' + t.common + '</small></button>';
    openSheet(it.name, body, foot + (foot2 ? '</div><div class="sheet-foot" style="border-top:0;padding-top:0">' + foot2 : ''));
  }
  function bulkPlan() {
    const plan = [];
    let gold = S.gold;
    const used = new Set();
    D.slots.forEach(sl => {
      for (const tier of [0, 1]) {
        const m = D.merges[tier];
        const pool = S.gear.filter(g => itemOf(g).slot === sl.id && g.tier === tier && !used.has(g.uid)).sort((a, b) => (isEquipped(b) - isEquipped(a)) || (b.lv - a.lv));
        while (pool.length >= m.n + 1 && gold >= m.gold) {
          const body = pool.shift(), mats = [];
          for (let i = 0; i < m.n && pool.length; i++) {
            const k = pool.findIndex(x => !isEquipped(x));
            if (k < 0) break;
            mats.push(pool.splice(k, 1)[0]);
          }
          if (mats.length < m.n) break;
          used.add(body.uid); mats.forEach(x => used.add(x.uid));
          gold -= m.gold;
          plan.push({ body, mats, gold: m.gold });
        }
      }
    });
    return plan;
  }

  /* ===== 상점 ===== */
  function priceTag(n) { return '<span class="price">' + ICON.pearl + num(n) + '</span>'; }
  function viewShop() {
    const tabs = [['gacha', '뽑기'], ['pearl', '진주'], ['goldTab', '골드'], ['pack', '패키지']];
    let inner = '';
    if (V.shopTab === 'gacha') {
      const ch = D.chests[V.banner];
      let pityLine = '', pityP = 0;
      if (V.banner === 'advanced') { pityLine = '전설 확정까지 ' + (ch.pityLegend - S.pity.adv) + '회 · 영웅 확정까지 ' + (ch.pityHero - S.pity.hero) + '회'; pityP = pct(S.pity.adv, ch.pityLegend); }
      if (ch.shard) { pityLine = '픽업 확정까지 ' + (60 - S.pity[ch.shard]) + '회'; pityP = pct(S.pity[ch.shard], 60); }
      const freeWeek = V.banner === 'subShard' ? !S.week.subBox : V.banner === 'pilotShard' ? !S.week.pilotBox : false;
      const buy = (n, price) => '<button class="btn btn-gold" type="button" data-act="openChest" data-arg="' + n + '"' + (S.pearl < price ? ' disabled' : '') + '>' + n + '회<small>' + priceTag(price) + '</small></button>';
      inner = '<div class="banner ' + V.banner + '"><div class="burst"></div><button class="btn btn-blue rate-btn" type="button" data-act="rates" data-arg="' + V.banner + '">확률</button>' +
        '<h3 class="ribbon">' + ch.name + '</h3><img class="art" alt="" src="' + Art.url('chest', V.banner, 260) + '">' +
        (pityLine ? '<div class="pity">' + pityLine + '</div><div class="pity-bar"><i style="width:' + pityP + '%"></i></div>' : '') +
        (freeWeek ? '<button class="btn btn-teal" style="width:100%" type="button" data-act="openChest" data-arg="free">주간 무료 1회</button>' : '') +
        '<div class="row">' + buy(1, ch.price) + (ch.price10 ? buy(10, ch.price10) : '') + '</div></div>' +
        '<div class="choice">' + [['advanced', '고급'], ['normal', '일반'], ['subShard', '잠수함'], ['pilotShard', '파일럿']].map(c => '<button type="button" class="' + (V.banner === c[0] ? 'on' : '') + '" data-act="banner" data-arg="' + c[0] + '"><img alt="" src="' + Art.url('chest', c[0], 96) + '">' + c[1] + '</button>').join('') + '</div>' +
        '<h3 class="ribbon sec-title">매일 무료</h3><div class="row">' +
          '<button class="btn btn-teal" type="button" data-act="freeChest" data-arg="free"' + (S.day.freeChest ? ' disabled' : '') + '>일반 상자<small>무료 ' + (S.day.freeChest ? 0 : 1) + '/1</small></button>' +
          '<button class="btn btn-blue" type="button" data-act="freeChest" data-arg="ad"' + (S.day.adChest ? ' disabled' : '') + '>일반 상자<small>' + ICON.ad + (S.day.adChest ? 0 : 1) + '/1</small></button></div>';
    } else if (V.shopTab === 'pearl') {
      inner = '<div class="goods-grid">' + D.shop.pearl.map((p, i) => '<div class="good">' + (p[2] ? '<span class="flag">2배</span>' : '') + '<img class="ico" alt="" src="' + Art.url('pearls', [1, 3, 5, 7, 9, 12][i], 120) + '"><h3>' + p[0].replace('진주 ', '') + '</h3><button class="btn btn-gold" type="button" data-act="noPay">₩' + num(p[1]) + '</button></div>').join('') + '</div>';
    } else if (V.shopTab === 'goldTab') {
      const rate = chapterOf(Math.max(1, S.cleared)).exploreGold * 8;
      inner = '<div class="panel goods">' + ICON.gold + '<div><h3>골드 자루</h3><span class="small muted">골드 ' + num(rate) + ' · 오늘 ' + S.day.goldBag + '/3</span></div><button class="btn btn-gold" type="button" data-act="goldBag"' + (S.pearl < 100 || S.day.goldBag >= 3 ? ' disabled' : '') + '>' + priceTag(100) + '</button></div>';
    } else {
      inner = D.shop.packages.map((p, i) => '<div class="panel goods"><img class="ico" alt="" src="' + Art.url('chest', ['subShard', 'normal', 'advanced', 'pilotShard'][i], 110) + '"><div><h3>' + p[0] + '</h3><span class="small">' + p[2] + '</span><br><span class="small muted">' + p[3] + '</span></div><button class="btn btn-gold" type="button" data-act="noPay">₩' + num(p[1]) + '</button></div>').join('');
    }
    return mainTop() + '<div class="body"><div class="shop"><div class="seg shop-seg">' + tabs.map(t => '<button type="button" class="' + (V.shopTab === t[0] ? 'on' : '') + '" data-act="shopTab" data-arg="' + t[0] + '">' + t[1] + '</button>').join('') + '</div><div class="list scroll" id="shopScroll">' + inner + '</div></div></div>' + tabBar();
  }
  function ratesTable(key) {
    const ch = D.chests[key];
    return '<h3 class="ribbon sec-title">' + ch.name + '</h3><table class="rate-table"><tr><th>결과</th><th>확률</th></tr>' + ch.rates.map(r => '<tr><td>' + r[0] + '</td><td>' + r[1] + '%</td></tr>').join('') + '<tr><td>천장</td><td>' + ch.pityText + '</td></tr></table>';
  }
  function rollChest(key) {
    const ch = D.chests[key];
    let r = Math.random() * 100, pick = ch.rates[ch.rates.length - 1];
    for (const x of ch.rates) { if (r < x[1]) { pick = x; break; } r -= x[1]; }
    if (ch.shard) {
      const list = ch.shard === 'sub' ? D.subs : D.pilots, store = ch.shard === 'sub' ? S.subs : S.pilots;
      S.pity[ch.shard]++;
      const pickup = list.find(x => !owned(ch.shard, x.id)) || list[1];
      const target = S.pity[ch.shard] >= 60 || Math.random() < 0.5 ? pickup : list[Math.floor(Math.random() * list.length)];
      if (target === pickup && S.pity[ch.shard] >= 60) S.pity[ch.shard] = 0;
      const e = store[target.id] || (store[target.id] = { star: 0, shards: 0 });
      e.shards += pick[2];
      if (e.star < 1 && e.shards >= 10) e.star = 1;
      return { img: ch.shard === 'sub' ? Art.url('sub', target.id, 120, S.pilotId) : Art.url('pilot', target.id, 120), label: target.name + ' 조각 ' + pick[2] };
    }
    let tier = pick[2];
    if (key === 'advanced') {
      S.pity.adv++; S.pity.hero++;
      if (S.pity.adv >= ch.pityLegend) tier = 5;
      else if (S.pity.hero >= ch.pityHero && tier < 2) tier = 2;
      if (tier >= 5) S.pity.adv = 0;
      if (tier >= 2) S.pity.hero = 0;
    }
    const g = addGear(anyItemId(), tier);
    return { img: gearImg(g), label: D.tiers[tier].name + ' ' + itemOf(g).name };
  }
  function showGains(title, gains) {
    openSheet(title, '<div class="gain-grid' + (gains.length < 4 ? ' few' : '') + '">' + gains.map((g, i) => '<div class="gain" style="animation-delay:' + i * 0.07 + 's"><img alt="" src="' + g.img + '">' + g.label + '</div>').join('') + '</div>', '<button class="btn btn-gold" type="button" data-act="closeModal">확인</button>', true);
  }

  /* ===== 더보기 ===== */
  function viewMore() {
    const tile = (act, arg, icon, title, on) => '<button class="tile" type="button" data-act="' + act + '" data-arg="' + arg + '">' + ICON[icon] + title + dot(on) + '</button>';
    const need = 100 + 40 * (S.acct.lv - 1), pil = pilotOf(S.pilotId);
    return mainTop() + '<div class="body"><div class="page"><div class="list scroll">' +
      '<div class="panel profile">' + avatar() + '<div><b>' + pil.name + ' 순찰대</b><span class="small muted">최고 도달 챕터 ' + Math.max(1, S.cleared) + ' · 전투력 ' + num(myPower()) + '</span><div class="xp-bar"><i style="width:' + pct(S.acct.xp, need) + '%"></i></div></div></div>' +
      '<div class="rec"><div>' + ICON.kills + short(S.ach.kills) + '<span>누적 처치</span></div><div>' + ICON.purify + D.chapters.filter(c => (S.purity[c.no] || 0) >= 100).length + '/15<span>정화한 바다</span></div><div>' + ICON.tabSub + Object.keys(S.subs).filter(k => S.subs[k].star >= 1).length + '/10<span>잠수함</span></div></div>' +
      '<div class="tiles">' +
        tile('openPage', 'missions', 'mission', '미션', dailyClaimable()) +
        tile('openPage', 'mail', 'mail', '우편함', mailUnread()) +
        tile('openPage', 'codex', 'book', '도감', false) +
        tile('openPage', 'settings', 'gearCfg', '설정', false) +
        tile('openPage', 'notice', 'notice', '공지', false) +
        tile('openPage', 'rates', 'dice', '확률 정보', false) +
      '</div></div></div></div>' + tabBar();
  }
  function viewMissions() {
    const tabs = [['daily', '일일'], ['weekly', '주간'], ['ach', '업적']];
    const MIS_ICON = { login: 'mail', sortie1: 'tabPlay', sortie3: 'tabPlay', kills: 'kills', upgrade: 'tabGear', explore: 'explore', mode: 'boss', gacha: 'chest' };
    let inner = '';
    if (V.misTab === 'daily') {
      const sc = dailyScore();
      inner = '<div class="panel score"><div class="score-line"><span>오늘 점수</span><span>' + sc + '/100</span></div><div class="xp-bar"><i style="width:' + sc + '%;background:var(--gold)"></i></div></div>' +
        '<div class="tier-bar">' + D.dailyTiers.map(t => {
          const got = S.daily.claimed.indexOf(t.at) >= 0, ready = sc >= t.at && !got;
          return '<button type="button" class="' + (got ? 'got' : ready ? 'ready' : '') + '" data-act="claimTier" data-arg="' + t.at + '"' + (ready ? '' : ' disabled') + ' aria-label="' + t.at + '점 보상 ' + t.text + '">' + ICON[t.gold ? 'gold' : t.bp ? 'bp' : t.oxygen ? 'oxygen' : 'pearl'] + t.at + '점</button>';
        }).join('') + '</div>' +
        D.dailyMissions.map(m => {
          const done = missionDone(m), p = m.id === 'login' ? 1 : Math.min(m.need, S.daily.prog[m.track] || 0);
          return '<div class="panel mis' + (done ? ' done' : '') + '">' + ICON[MIS_ICON[m.id] || 'mission'] + '<div><b>' + m.name + '</b><span class="bar-mini"><i style="width:' + pct(p, m.need) + '%"></i></span></div><em>' + m.pts + '</em></div>';
        }).join('');
    } else if (V.misTab === 'weekly') {
      const ready = S.weekly.pts >= 500 && !S.weekly.claimed;
      inner = '<div class="panel score"><div class="score-line"><span>이번 주 점수</span><span>' + S.weekly.pts + '/500</span></div><div class="xp-bar"><i style="width:' + Math.min(100, S.weekly.pts / 5) + '%;background:var(--gold)"></i></div>' +
        '<div class="rew" style="margin:10px 0"><span>' + ICON.pearl + '300</span><span>' + ICON.tabSub + '4</span><span>' + ICON.shard + '3</span></div>' +
        '<button class="btn btn-gold" style="width:100%" type="button" data-act="claimWeekly"' + (ready ? '' : ' disabled') + '>' + (S.weekly.claimed ? '받았습니다' : '보상 받기') + '</button></div>';
    } else {
      const ach = [{ id: 'k1000', name: '누적 처치 1,000체', have: S.ach.kills, need: 1000, pearl: 50 }, { id: 'k10000', name: '누적 처치 10,000체', have: S.ach.kills, need: 10000, pearl: 150 }, { id: 'c3', name: '챕터 3 클리어', have: S.cleared, need: 3, pearl: 100 }, { id: 'c5', name: '챕터 5 클리어', have: S.cleared, need: 5, pearl: 200 }];
      inner = ach.map(a => {
        const got = S.ach.claimed[a.id], ready = a.have >= a.need && !got;
        return '<div class="panel mis' + (got ? ' done' : '') + '">' + ICON.boss + '<div><b>' + a.name + '</b><span class="bar-mini"><i style="width:' + pct(a.have, a.need) + '%"></i></span></div>' + (ready ? '<button class="btn btn-gold" style="min-height:36px;font-size:15px" type="button" data-act="claimAch" data-arg="' + a.id + ':' + a.pearl + '">받기</button>' : got ? ICON.check : '<span class="rew"><span>' + ICON.pearl + a.pearl + '</span></span>') + '</div>';
      }).join('');
    }
    return topBar('미션', 'closePage') + '<div class="body"><div class="shop"><div class="seg shop-seg">' + tabs.map(t => '<button type="button" class="' + (V.misTab === t[0] ? 'on' : '') + '" data-act="misTab" data-arg="' + t[0] + '">' + t[1] + '</button>').join('') + '</div><div class="list scroll">' + inner + '</div></div></div>' + tabBar();
  }
  function viewMail() {
    const rewards = m => (m.gold ? '<span>' + ICON.gold + num(m.gold) + '</span>' : '') + (m.pearl ? '<span>' + ICON.pearl + num(m.pearl) + '</span>' : '') + (m.bp ? '<span>' + ICON.bp + m.bp + '</span>' : '');
    const rows = S.mail.map(m => '<div class="panel letter"><b>' + m.title + '</b><span class="small muted">' + m.body + '</span><div class="rew">' + rewards(m) + '</div>' + (m.read ? '<button class="btn btn-gray" type="button" disabled>받았습니다</button>' : '<button class="btn btn-gold" type="button" data-act="claimMail" data-arg="' + m.id + '">받기</button>') + '</div>').join('');
    return topBar('우편함', 'closePage') + '<div class="body"><div class="page"><div class="list scroll">' + (rows || '<p class="empty">우편이 없습니다.</p>') + '</div></div></div>' + tabBar();
  }
  function viewCodex() {
    const tabs = [['enemy', '적'], ['sub', '잠수함'], ['skill', '스킬'], ['heal', '회복']];
    let inner = '';
    if (V.codexTab === 'enemy') {
      const names = ['jelly', 'sardine', 'puffer', 'queenJelly', 'crabKing'];
      inner = D.enemies.map((e, i) => '<div class="panel codex' + (S.seenEnemy ? '' : ' off') + '"><img alt="" src="' + Art.url('enemy', names[i], 128) + '"><div><b>' + (S.seenEnemy ? e.name : '???') + '</b><span>' + (S.seenEnemy ? e.grade + ' · ' + e.action : '아직 만나지 못했습니다') + '</span></div></div>').join('');
    } else if (V.codexTab === 'sub') {
      inner = D.subs.map(x => '<div class="panel codex' + (owned('sub', x.id) ? '' : ' off') + '"><img alt="" src="' + Art.url('sub', x.id, 128, 'coral') + '"><div><b>' + x.name + '</b><span>' + x.type + (owned('sub', x.id) ? '' : ' · ' + x.unlockText) + '</span></div></div>').join('');
    } else if (V.codexTab === 'skill') {
      inner = D.skills.map(x => '<div class="panel codex"><img alt="" src="' + Art.url('skill', x.id, 128) + '"><div><b>' + x.name + '</b><span>' + x.text[0] + '</span></div></div>').join('');
    } else {
      inner = D.chapters.map(c => { const on = (S.purity[c.no] || 0) >= 100; return '<div class="panel codex' + (on ? '' : ' off') + '"><img alt="" src="' + Art.url('chapter', c.no, 128) + '" style="border:2px solid var(--ink);border-radius:8px' + (on ? '' : ';filter:grayscale(1) brightness(.6)') + '"><div><b>' + (on ? c.creature : '???') + '</b><span>' + c.name + ' · 정화 ' + (S.purity[c.no] || 0) + '%</span></div></div>'; }).join('');
    }
    return topBar('도감', 'closePage') + '<div class="body"><div class="shop"><div class="seg shop-seg">' + tabs.map(t => '<button type="button" class="' + (V.codexTab === t[0] ? 'on' : '') + '" data-act="codexTab" data-arg="' + t[0] + '">' + t[1] + '</button>').join('') + '</div><div class="list scroll">' + inner + '</div></div></div>' + tabBar();
  }
  function viewSettings() {
    return topBar('설정', 'closePage') + '<div class="body"><div class="page"><div class="list scroll">' +
      '<button class="btn btn-blue" type="button" data-act="toggleSound">' + (Snd.on ? '소리 켜짐' : '소리 꺼짐') + '</button>' +
      '<h3 class="ribbon sec-title blue">시험판 도구</h3>' +
      '<button class="btn btn-blue" type="button" data-act="stress">프레임 시험 (적 300체, 스킬 6개, 20초)</button>' +
      '<button class="btn btn-blue" type="button" data-act="cheatRes">시험용 재화 받기</button>' +
      '<button class="btn btn-blue" type="button" data-act="cheatGuns">새 주포 6종 받기</button>' +
      '<button class="btn btn-blue" type="button" data-act="cheatOpen">모든 챕터, 잠수함, 파일럿 열기</button>' +
      '<h3 class="ribbon sec-title red">데이터</h3>' +
      '<button class="btn btn-red" type="button" data-act="wipe">' + (V.wipeArmed ? '한 번 더 누르면 지웁니다' : '진행 데이터 지우기') + '</button>' +
      '<p class="small muted" style="text-align:center">데이터는 이 브라우저에만 저장됩니다.</p>' +
      '</div></div></div>' + tabBar();
  }
  function viewNotice() {
    const li = t => '<li style="margin:3px 0">' + t + '</li>';
    const box = (title, cls, items) => '<h3 class="ribbon sec-title ' + cls + '">' + title + '</h3><div class="panel" style="padding:8px 12px 10px"><ul class="small" style="margin:0;padding-left:18px">' + items.map(li).join('') + '</ul></div>';
    return topBar('공지', 'closePage') + '<div class="body"><div class="page"><div class="list scroll">' +
      box('들어간 것', '', ['이동, 슬로우, 소나 핑, 수압 방출, 주포 1종, 잡몹 3종', '레벨업 스킬 선택, 스킬 12종, 파일럿 시작 스킬', '정예 1종, 보스 왕집게, 보스 등장 연출, 상자', '로비, 수심 지도, 출격 준비, 결과, 다시 도전, 산소', '장비 강화·합성·분해, 잠수함·파일럿 교체와 승급', '뽑기, 미션, 우편, 자동 탐사, 오염 정화']) +
      box('아직 없는 것', 'red', ['스킬 진화, 다른 보스와 정예. 챕터 2부터도 왕집게 행동을 씁니다', '해류, 챕터 기믹, 나머지 적', '잠수함·파일럿 고유 능력, 장비 고유·세트 효과는 설명만 있고 전투에는 공격력과 내구도만 들어갑니다', '도전 모드, 출석, 시즌 패스, 실제 결제와 광고. 광고 자리는 바로 보상을 줍니다']) +
      box('기획서와 다른 임시 값', 'blue', ['스폰과 경험치는 docs/combat-fix-spec.md 값', '시간 계수 상한 ×4.5, 복어 비중과 독 구름 피해 축소', '수압 고리: 감지 3.5m, 피격 +6, 감소 −3']) +
      '</div></div></div>' + tabBar();
  }
  function viewRates() {
    return topBar('확률 정보', 'closePage') + '<div class="body"><div class="page"><div class="list scroll">' + Object.keys(D.chests).map(ratesTable).join('') + '<p class="small muted" style="text-align:center">강화와 합성은 100% 성공합니다.</p></div></div></div>' + tabBar();
  }

  /* ===== 결과 ===== */
  function viewResult() {
    const R = V.result;
    if (R.stress) {
      const f = R.res.fps;
      return '<div class="result ' + (f.avg >= 55 ? 'win' : 'lose') + '"><div class="burst" style="left:50%"></div><h2 class="ribbon res-banner' + (f.avg >= 55 ? '' : ' gray') + '">' + (f.avg >= 55 ? '60fps 통과' : f.avg >= 28 ? '30fps 통과' : '프레임 미달') + '</h2>' +
        '<div class="res-stats"><div>평균 ' + f.avg + '</div><div>최저 ' + f.low + '</div><div>×' + R.res.dpr.toFixed(2) + '</div></div>' +
        '<div class="res-list"></div><div class="res-actions"><button class="btn btn-gold" type="button" data-act="resHome">확인</button></div></div>';
    }
    const res = R.res, rows = R.rows.map((r, i) => '<div class="res-row' + (r.first ? ' first' : '') + '" style="animation-delay:' + (0.25 + i * 0.14) + 's">' + ICON[r.icon || 'star'] + '<span>' + r.label + '</span><b>' + r.value + '</b></div>').join('');
    const stats = '<div class="res-stats"><div>' + ICON.kills + num(res.stats.kills) + '</div><div>' + ICON.xp + 'Lv' + res.level + '</div><div>' + ICON.clock + fmt(res.clock) + '</div></div>' +
      (res.skills && res.skills.length ? '<div class="s-slots res-skills">' + slotCells(res.skills, 72) + '</div>' : '');
    const hero = '<img class="res-hero" alt="" src="' + Art.url('sub', S.subId, 360, S.pilotId) + '">';
    const actions = '<div class="res-actions"><button class="btn btn-gold" type="button" data-act="retry">다시 도전<small>' + ICON.oxygen + OXY_COST + ' / 보유 ' + S.oxygen + '</small></button><button class="btn btn-blue" type="button" data-act="resHome">로비로</button></div>';
    if (R.win) return '<div class="result win"><div class="burst" style="left:50%"></div>' + hero + '<h2 class="ribbon res-banner">챕터 ' + R.ch.no + ' 클리어!</h2>' + stats + '<div class="res-list scroll">' + rows + '</div>' + actions + '</div>';
    return '<div class="result lose">' + hero + '<h2 class="ribbon red res-banner">잠수함 파손</h2>' +
      '<div class="progress"><div class="line"><span>진행률 ' + Math.round(res.progress * 100) + '%</span><span>' + R.ch.name + '</span></div><div class="xp-bar"><i style="width:' + res.progress * 100 + '%"></i></div></div>' +
      stats + '<div class="res-list scroll">' + rows + '</div>' +
      '<div class="suggest"><button class="btn btn-blue" type="button" data-act="resGo" data-arg="gear">' + ICON.tabGear + '장비 강화</button><button class="btn btn-blue" type="button" data-act="resGo" data-arg="subs">' + ICON.tabSub + '잠수함 교체</button></div>' + actions + '</div>';
  }
  function settleRun(res) {
    const ch = chapterOf(V.runChapter), win = res.kind === 'clear', pil = pilotOf(S.pilotId), goldMul = 1 + (pil.gold || 0) / 100;
    const gold = Math.round(ch.gold * goldMul * (win ? 1 : 0.7 * res.progress)), bp = win ? 4 : 1, xp = Math.max(1, Math.round(120 * (win ? 1 : res.progress)));
    const before = S.purity[ch.no] || 0, gain = win ? 20 : Math.round(res.progress * 20), after = Math.min(100, before + gain);
    const rows = [{ icon: 'gold', label: '골드', value: num(gold) }, { icon: 'xp', label: '계정 경험치', value: '+' + xp }, { icon: 'bp', label: '설계도', value: bp + '개' }, { icon: 'purify', label: '오염 정화', value: '+' + gain + '% → ' + after + '%' }];
    S.gold += gold; addBp(bp); S.purity[ch.no] = after;
    if (res.stats.bonusGold) { S.gold += res.stats.bonusGold; rows.push({ icon: 'gold', label: '인양 골드', value: num(res.stats.bonusGold) }); }
    if (before < 100 && after >= 100) { S.pearl += 50; rows.push({ icon: 'wave', label: '바다 생물 귀환: ' + ch.creature, value: '진주 50', first: true }); }
    if (win) {
      if (ch.no > S.cleared) {
        S.cleared = ch.no;
        if (S.explore.last === 0) S.explore.last = Date.now();
        S.pearl += 200;
        rows.push({ icon: 'pearl', label: '첫 클리어 진주', value: '200', first: true });
        const box = rollChest('advanced');
        rows.push({ icon: 'chest', label: '고급 상자: ' + box.label, value: '1개', first: true });
        grantUnlocks().forEach(t => rows.push({ icon: 'lock', label: '새로 해금', value: t, first: true }));
        if (S.chapter === ch.no && ch.no < 15) S.chapter = ch.no + 1;
      }
      if (Math.random() < 0.15) { const g = addGear(anyItemId(), 0); rows.push({ icon: 'tabGear', label: '장비 발견: ' + itemOf(g).name, value: '일반' }); }
    }
    const up = addAcctXp(xp);
    if (up) rows.push({ icon: 'oxygen', label: '계정 레벨 ' + S.acct.lv + ' 달성', value: '+' + 30 * up, first: true });
    S.ach.kills += res.stats.kills;
    S.seenEnemy = true;
    track('kills', res.stats.kills);
    if (!S.best[ch.no] || res.clock > S.best[ch.no]) S.best[ch.no] = res.clock;
    persist();
    return { win, ch, rows, res };
  }

  /* ===== 스킬 카드: 레벨업은 반드시 여기를 거친다 ===== */
  const cardsEl = $('cards'), hudSkills = $('hudSkills');
  const KIND_NAME = { attack: '공격', summon: '소환', survive: '생존', filler: '보급' };
  let cardsAt = 0, cardsBusy = false;
  const skillImg = (c, px) => (c.filler ? Art.url('icon', c.icon, px) : Art.url('skill', c.id, px));
  function slotCells(slots, px) {
    let h = '';
    for (let i = 0; i < 6; i++) {
      const s = slots[i];
      h += s ? '<span class="s-slot k-' + s.kind + '"><img alt="" src="' + Art.url('skill', s.id, px) + '"><b>' + s.lv + '</b></span>' : '<span class="s-slot none"></span>';
    }
    return h;
  }
  function syncHudSkills(slots) { hudSkills.innerHTML = slotCells(slots, 56); }
  function showCards(info) {
    const dots = c => { let h = '<span class="s-dots">'; for (let i = 1; i <= 5; i++) h += '<i class="' + (i <= c.lv ? 'on' : i === c.next ? 'next' : '') + '"></i>'; return h + '</span>'; };
    const card = (c, i) => '<button class="s-card k-' + c.kind + (c.gold ? ' gold' : '') + '" type="button" data-act="pickSkill" data-arg="' + c.id + '" style="animation-delay:' + i * 0.05 + 's">' +
      '<span class="s-head">' + (c.gold ? '핵심 강화' : KIND_NAME[c.kind]) + '</span>' +
      (c.filler ? '' : c.isNew ? '<span class="s-badge">신규</span>' : '<span class="s-badge up">Lv' + c.lv + '→' + c.next + '</span>') +
      '<img class="s-ico" alt="" src="' + skillImg(c, 150) + '"><b class="s-name">' + c.name + '</b><span class="s-text">' + c.text + '</span>' + (c.filler ? '' : dots(c)) + '</button>';
    cardsEl.innerHTML = '<div class="cards-wrap"><h2 class="ribbon pick-title">스킬 선택<em>Lv ' + info.level + '</em></h2>' +
      '<div class="s-cards">' + info.cards.map(card).join('') + '</div>' +
      '<div class="s-slots">' + slotCells(info.slots, 72) + '</div>' +
      (info.rerolls > 0 ? '<button class="btn btn-blue s-reroll" type="button" data-act="rerollCards">다시 뽑기<small>' + info.rerolls + '회 남음</small></button>' : '') + '</div>';
    cardsEl.hidden = false;
    cardsBusy = false;
    cardsAt = performance.now() + 350; // 드래그하던 손가락이 카드를 잘못 누르지 않게 잠깐 잠근다.
    syncHudSkills(info.slots);
  }
  function showChest(info) {
    const got = info.got.map((g, i) => '<span class="s-slot k-' + g.kind + ' gain" style="animation-delay:' + (0.25 + i * 0.12) + 's"><img alt="" src="' + Art.url('skill', g.id, 72) + '"><b>' + g.lv + '</b></span>').join('');
    cardsEl.innerHTML = '<div class="cards-wrap chest-wrap"><div class="burst"></div><h2 class="ribbon pick-title">' + info.name + '</h2>' +
      '<img class="chest-art" alt="" src="' + Art.url('chest', 'advanced', 260) + '"><div class="chest-count">강화 ' + info.n + '회</div>' +
      '<div class="s-slots">' + (got || '<span class="small">더 올릴 스킬이 없어 골드 100을 받았습니다</span>') + '</div>' +
      '<button class="btn btn-gold s-ok" type="button" data-act="closeChest">확인</button></div>';
    cardsEl.hidden = false;
    cardsBusy = false;
    cardsAt = performance.now() + 350;
    syncHudSkills(info.slots);
  }
  function hideCards() { cardsEl.hidden = true; cardsEl.innerHTML = ''; cardsBusy = false; }

  /* ===== 시트와 알림 ===== */
  let modalLocked = false;
  function openSheet(title, body, foot, center, locked) {
    modalLocked = !!locked;
    modal.className = center ? 'center' : '';
    modal.innerHTML = '<div class="sheet" role="dialog" aria-label="' + title + '"><div class="sheet-head"><h3 class="ribbon">' + title + '</h3>' + (locked ? '' : '<button class="iconbtn x" type="button" data-act="closeModal" aria-label="닫기">' + ICON.close + '</button>') + '</div><div class="sheet-body scroll">' + body + '</div>' + (foot ? '<div class="sheet-foot">' + foot + '</div>' : '') + '</div>';
    modal.hidden = false;
  }
  function closeModal() { modal.hidden = true; modal.innerHTML = ''; modalLocked = false; }
  let toastTimer = 0;
  function toast(t) {
    toastEl.textContent = t; toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 1900);
  }

  /* ===== 그리기 ===== */
  const scrollMem = {};
  const viewKey = () => V.title ? 'title' : V.result ? 'result' : V.page || V.tab;
  let lastKey = '';
  function render() {
    const prev = shell.querySelector('.scroll');
    if (prev && lastKey) scrollMem[lastKey] = prev.scrollTop;
    let html;
    if (V.title) html = viewTitle();
    else if (V.result) html = viewResult();
    else if (V.page === 'map') html = viewMap();
    else if (V.page === 'prep') html = viewPrep();
    else if (V.page === 'missions') html = viewMissions();
    else if (V.page === 'mail') html = viewMail();
    else if (V.page === 'codex') html = viewCodex();
    else if (V.page === 'settings') html = viewSettings();
    else if (V.page === 'notice') html = viewNotice();
    else if (V.page === 'rates') html = viewRates();
    else if (V.tab === 'subs') html = viewSubs();
    else if (V.tab === 'gear') html = viewGear();
    else if (V.tab === 'shop') html = viewShop();
    else if (V.tab === 'more') html = viewMore();
    else html = viewLobby();
    shell.classList.remove('enter');
    shell.innerHTML = html;
    const key = viewKey(), now = shell.querySelector('.scroll');
    if (now && key === lastKey && scrollMem[key]) now.scrollTop = scrollMem[key];
    measureScene();
    if (key !== lastKey) { void shell.offsetWidth; shell.classList.add('enter'); }
    lastKey = key;
    updateOxyNext();
    if (V.page === 'map') {
      const target = V.focusModes ? $('modesTitle') : $('chOn');
      V.focusModes = false;
      if (target && target.scrollIntoView) target.scrollIntoView({ block: 'center' });
    }
  }
  function updateOxyNext() {
    const el = $('oxyNext');
    if (el) el.textContent = S.oxygen >= OXY_MAX ? '' : '다음 산소 ' + fmt((OXY_MS - (Date.now() - S.oxyT)) / 1000);
    const oxy = $('chipOxy');
    if (oxy) oxy.textContent = S.oxygen + '/' + OXY_MAX;
  }
  /* 격납고 장면은 화면에 놓인 칸(.scene-box) 크기에 맞춘다. 키가 작은 휴대폰에서도 버튼에 가리지 않게 하려는 것이다. */
  let sceneBox = null;
  function measureScene() {
    const el = shell.querySelector('.scene-box');
    if (!el) { sceneBox = null; return; }
    const r = el.getBoundingClientRect(), s = $('stage').getBoundingClientRect();
    sceneBox = s.height > 0 && r.height > 0 ? { x: (r.left - s.left) / s.width, y: (r.top - s.top) / s.height, w: r.width / s.width, h: r.height / s.height, fit: Number(el.dataset.fit) || 0.96 } : null;
  }
  const heroCache = new Map();
  function hero(kind, id, extra, px) {
    const key = kind + id + extra + px;
    let cv = heroCache.get(key);
    if (!cv) {
      cv = Art.heroCanvas(kind, id, extra, px);
      heroCache.set(key, cv);
      if (heroCache.size > 8) heroCache.delete(heroCache.keys().next().value);
    }
    return cv;
  }
  let sceneT = 0;
  function renderIdle(ctx, rdt, W, H) {
    sceneT += rdt;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (V.title) {
      const heroW = Math.min(W * 0.9, H * 0.46);
      Art.drawTitle(ctx, W, H, { hero: hero('sub', 'coral', S.pilotId, Math.round(heroW)), heroW, tail: Art.subTail('coral') }, sceneT);
      return;
    }
    if (V.result || !sceneBox) { ctx.fillStyle = '#123F63'; ctx.fillRect(0, 0, W, H); return; }
    const b = sceneBox, bw = b.w * W, bh = b.h * H, by = b.y * H, isSub = V.page === 'prep' || V.tab !== 'subs' || V.subMode === 'sub';
    const heroW = Math.min(bw * b.fit, bh / (isSub ? 1.06 : 1.04)), groupH = heroW * (isSub ? 1.03 : 1.01);
    const py = by + Math.max(0, bh - groupH) * 0.62 + heroW * (isSub ? 0.82 : 0.87), hy = py - heroW * (isSub ? 0.27 : 0.32);
    const o = {
      cx: b.x * W + bw / 2, wy: hy - heroW * 0.12, wr: Math.min(W * 0.42, heroW * 0.64, bh * 0.47), py, padW: heroW * (isSub ? 0.95 : 0.66), heroW, hy,
      no: S.chapter, purity: (S.purity[S.chapter] || 0) / 100,
    };
    if (isSub) {
      const id = !V.page && V.tab === 'subs' ? V.subSel : S.subId;
      o.hero = hero('sub', id, S.pilotId, Math.round(heroW));
      o.tail = Art.subTail(id);
    } else {
      o.hero = hero('pilot', V.pilotSel, '', Math.round(heroW));
    }
    Art.drawHangar(ctx, W, H, o, sceneT);
  }

  /* ===== 동작 ===== */
  const A = {
    enter() { V.title = false; render(); },
    pickSkill(id, el) {
      if (cardsBusy || performance.now() < cardsAt) return;
      cardsBusy = true;
      cardsEl.querySelectorAll('.s-card').forEach(c => { c.classList.add(c === el ? 'picked' : 'fade'); });
      setTimeout(() => Battle.pickSkill(id), 280);
    },
    rerollCards() { if (!cardsBusy && performance.now() >= cardsAt) Battle.rerollCards(); },
    closeChest() { if (!cardsBusy && performance.now() >= cardsAt) Battle.closeChest(); },
    chapterStep(d) {
      const n = S.chapter + Number(d);
      if (n < 1 || n > Math.min(15, S.cleared + 1)) return;
      S.chapter = n; persist(); render();
    },
    tab(t) { V.tab = t; V.page = null; V.wipeArmed = false; if (t === 'subs') { V.subSel = S.subId; V.pilotSel = S.pilotId; } render(); },
    closePage() { V.page = null; render(); },
    closeModal,
    openPage(p) { V.page = p; V.wipeArmed = false; render(); },
    openMap() { V.page = 'map'; render(); },
    openModes() { V.page = 'map'; V.focusModes = true; render(); },
    pickChapter(no) {
      const n = Number(no);
      if (n > S.cleared + 1) { toast('챕터 ' + (n - 1) + '을 먼저 클리어하세요.'); return; }
      S.chapter = n; persist(); render();
    },
    modeInfo(name) { const m = D.modes.find(x => x.name === name); toast(S.cleared >= m.unlock ? m.name + '은 다음 시험판에서 열립니다.' : '챕터 ' + m.unlock + ' 클리어 후 열립니다.'); },
    goSubs(mode) { V.tab = 'subs'; V.page = null; V.subMode = mode; V.subSel = S.subId; V.pilotSel = S.pilotId; render(); },
    goShop(t) { V.tab = 'shop'; V.page = null; V.shopTab = t; closeModal(); render(); },
    subMode(m) { V.subMode = m; render(); },
    pickRoster(id) { if (V.subMode === 'sub') V.subSel = id; else V.pilotSel = id; render(); },
    activate() { if (V.subMode === 'sub') S.subId = V.subSel; else S.pilotId = V.pilotSel; persist(); render(); toast('출격 ' + (V.subMode === 'sub' ? '잠수함' : '파일럿') + '을 바꿨습니다.'); },
    rosterSheet,
    starUp(kind) {
      const isSub = kind === 'sub', store = isSub ? S.subs : S.pilots, id = isSub ? V.subSel : V.pilotSel, e = store[id];
      const needGold = Math.round(D.starGold[e.star] * (isSub ? 1 : 0.5));
      if (e.shards < D.starShards[e.star] || S.gold < needGold) return;
      S.gold -= needGold; e.star++; persist(); render(); rosterSheet();
    },
    slotSheet,
    equip(uid) { const g = gearByUid(uid); S.eq[itemOf(g).slot] = g.uid; persist(); closeModal(); render(); },
    toGear() { closeModal(); V.tab = 'gear'; V.page = null; render(); },
    itemSheet,
    gearFilter(f) { V.gearFilter = f; render(); },
    enhance(uid) {
      const g = gearByUid(uid), c = enhanceCost(g), slot = itemOf(g).slot;
      if (g.lv >= D.tiers[g.tier].cap || S.gold < c.gold || (S.bp[slot] || 0) < c.bp) return;
      S.gold -= c.gold; S.bp[slot] -= c.bp; g.lv++;
      track('upgrade'); persist(); render(); itemSheet(uid);
    },
    merge(uid) {
      const g = gearByUid(uid), mi = mergeInfo(g);
      if (!mi || !mi.ok) return;
      S.gold -= mi.m.gold;
      mi.cands.slice(0, mi.m.n).forEach(x => { const sp = spentOn(x); S.gold += sp.gold; S.bp[itemOf(x).slot] += sp.bp; removeGear(x); });
      g.tier++;
      persist(); render(); itemSheet(uid); toast(D.tiers[g.tier].name + ' 등급이 되었습니다.');
    },
    dismantle(uid) {
      const g = gearByUid(uid);
      if (!g || isEquipped(g)) return;
      const sp = spentOn(g), a = D.tiers[g.tier].common;
      S.gold += sp.gold; S.bp[itemOf(g).slot] += sp.bp; S.alloy += a;
      removeGear(g); persist(); closeModal(); render(); toast('심해 합금 ' + a + '개를 받았습니다. 보유 ' + S.alloy + '개');
    },
    bulkMerge() {
      const plan = bulkPlan();
      if (!plan.length) { toast('지금 합성할 수 있는 장비가 없습니다.'); return; }
      const body = plan.map(p => '<div class="panel row-item"><img alt="" src="' + gearImg(p.body) + '"><div><b>' + itemOf(p.body).name + '</b><span>' + D.tiers[p.body.tier].name + ' → ' + D.tiers[p.body.tier + 1].name + ', 재료 ' + p.mats.length + '개, 골드 ' + num(p.gold) + '</span></div></div>').join('');
      openSheet('일괄 합성 미리보기', body, '<button class="btn btn-blue" type="button" data-act="closeModal">취소</button><button class="btn btn-gold" type="button" data-act="bulkDo">합성하기</button>');
    },
    bulkDo() {
      const plan = bulkPlan();
      plan.forEach(p => {
        S.gold -= p.gold;
        p.mats.forEach(x => { const sp = spentOn(x); S.gold += sp.gold; S.bp[itemOf(x).slot] += sp.bp; removeGear(x); });
        p.body.tier++;
      });
      persist(); closeModal(); render(); toast(plan.length + '건을 합성했습니다.');
    },
    shopTab(t) { V.shopTab = t; render(); },
    banner(b) { V.banner = b; render(); },
    rates(k) { openSheet('확률 보기', ratesTable(k), '<button class="btn btn-blue" type="button" data-act="closeModal">닫기</button>'); },
    openChest(arg) {
      const ch = D.chests[V.banner];
      if (arg === 'free') {
        if (V.banner === 'subShard') S.week.subBox = true; else S.week.pilotBox = true;
        const r = rollChest(V.banner); track('gacha'); persist(); render(); showGains(ch.name, [r]);
        return;
      }
      const n = Number(arg), price = n === 10 ? ch.price10 : ch.price;
      if (S.pearl < price) return;
      S.pearl -= price;
      const gains = [];
      for (let i = 0; i < n; i++) gains.push(rollChest(V.banner));
      persist(); render(); showGains(ch.name, gains);
    },
    freeChest(k) {
      if (k === 'free') { if (S.day.freeChest) return; S.day.freeChest = true; } else { if (S.day.adChest) return; S.day.adChest = true; }
      const r = rollChest('normal'); track('gacha'); persist(); render(); showGains('일반 보급 상자', [r]);
    },
    noPay() { toast('시험판에는 결제를 연결하지 않았습니다.'); },
    goldBag() {
      if (S.pearl < 100 || S.day.goldBag >= 3) return;
      const g = chapterOf(Math.max(1, S.cleared)).exploreGold * 8;
      S.pearl -= 100; S.day.goldBag++; S.gold += g; persist(); render(); toast('골드 ' + num(g) + '을 받았습니다.');
    },
    claimTier(at) {
      const t = D.dailyTiers.find(x => x.at === Number(at));
      if (!t || dailyScore() < t.at || S.daily.claimed.indexOf(t.at) >= 0) return;
      S.daily.claimed.push(t.at);
      if (t.gold) S.gold += Math.round(t.gold * (1 + 0.1 * (S.cleared)));
      if (t.pearl) S.pearl += t.pearl;
      if (t.oxygen) S.oxygen += t.oxygen;
      if (t.bp) addBp(t.bp);
      persist(); render();
    },
    claimWeekly() {
      if (S.weekly.pts < 500 || S.weekly.claimed) return;
      S.weekly.claimed = true; S.pearl += 300;
      const sub = S.subs[S.subId], pil = S.pilots[S.pilotId];
      sub.shards += 4; pil.shards += 3;
      persist(); render();
    },
    claimAch(arg) {
      const p = arg.split(':');
      if (S.ach.claimed[p[0]]) return;
      S.ach.claimed[p[0]] = true; S.pearl += Number(p[1]); persist(); render();
    },
    misTab(t) { V.misTab = t; render(); },
    codexTab(t) { V.codexTab = t; render(); },
    claimMail(id) {
      const m = S.mail.find(x => x.id === id);
      if (!m || m.read) return;
      m.read = true; S.gold += m.gold || 0; S.pearl += m.pearl || 0; if (m.bp) addBp(m.bp);
      persist(); render(); toast('우편 보상을 받았습니다.');
    },
    explore() {
      if (!exploreOpen()) { toast('챕터 1을 클리어하면 자동 탐사가 열립니다.'); return; }
      const e = exploreGain(), rate = chapterOf(Math.max(1, S.cleared)).exploreGold, q = S.day.quick;
      const body = '<dl class="kv"><dt>쌓인 시간</dt><dd>' + e.h.toFixed(1) + ' / 16시간</dd><dt>시간당</dt><dd>골드 ' + num(rate) + ', 설계도 0.8개</dd></dl><div class="rew" style="justify-content:center"><span>' + ICON.gold + num(e.gold) + '</span><span>' + ICON.bp + e.bp + '</span></div>' +
        '<p class="note" style="text-align:center">빠른 탐사: 2시간치 즉시 지급, 오늘 ' + q + '/3회</p>';
      const quickLabel = q === 0 ? '빠른 탐사<small>무료</small>' : q === 1 ? '빠른 탐사<small>' + ICON.ad + '광고</small>' : '빠른 탐사<small>' + ICON.pearl + '50</small>';
      openSheet('자동 탐사', body, '<button class="btn btn-blue" type="button" data-act="quickExplore"' + (q >= 3 || (q === 2 && S.pearl < 50) ? ' disabled' : '') + '>' + quickLabel + '</button><button class="btn btn-gold" type="button" data-act="claimExplore"' + (e.gold < 1 ? ' disabled' : '') + '>받기</button>');
    },
    claimExplore() {
      const e = exploreGain();
      S.gold += e.gold; addBp(e.bp); addAcctXp(Math.floor(e.h * 10)); S.explore.last = Date.now();
      track('explore'); persist(); closeModal(); render(); toast('골드 ' + num(e.gold) + ', 설계도 ' + e.bp + '개를 받았습니다.');
    },
    quickExplore() {
      const q = S.day.quick;
      if (q >= 3) return;
      if (q === 2) { if (S.pearl < 50) return; S.pearl -= 50; }
      S.day.quick++;
      const g = chapterOf(Math.max(1, S.cleared)).exploreGold * 2;
      S.gold += g; addBp(2); track('explore'); persist(); render(); A.explore(); toast('골드 ' + num(g) + ', 설계도 2개를 받았습니다.');
    },
    oxy() {
      const n = S.day.oxyPearl, prices = [100, 200, 300], price = prices[Math.min(2, n)];
      const next = S.oxygen >= OXY_MAX ? '가득 찼습니다' : '다음 회복까지 ' + fmt((OXY_MS - (Date.now() - S.oxyT)) / 1000);
      const body = '<dl class="kv"><dt>보유</dt><dd>' + S.oxygen + '/' + OXY_MAX + '</dd><dt>회복</dt><dd>15분당 1. ' + next + '</dd><dt>출격 소모</dt><dd>' + OXY_COST + '</dd></dl>';
      openSheet('산소 충전', body, '<button class="btn btn-blue" type="button" data-act="oxyAd"' + (S.day.oxyAd >= 2 ? ' disabled' : '') + '>광고 +5<small>오늘 ' + S.day.oxyAd + '/2 (시험판은 바로)</small></button><button class="btn btn-gold" type="button" data-act="oxyPearl"' + (n >= 3 || S.pearl < price ? ' disabled' : '') + '>30 충전<small>' + (n >= 3 ? '오늘 끝' : '진주 ' + price + ', 오늘 ' + n + '/3') + '</small></button>', true);
    },
    oxyAd() { if (S.day.oxyAd >= 2) return; S.day.oxyAd++; S.oxygen += 5; persist(); render(); A.oxy(); },
    oxyPearl() {
      const n = S.day.oxyPearl, price = [100, 200, 300][Math.min(2, n)];
      if (n >= 3 || S.pearl < price) return;
      S.pearl -= price; S.day.oxyPearl++; S.oxygen += 30; persist(); render(); A.oxy();
    },
    launch() {
      if (S.oxygen < OXY_COST) { A.oxy(); return; }
      if (S.oxygen >= OXY_MAX) S.oxyT = Date.now();
      S.oxygen -= OXY_COST;
      track('sortie');
      V.runChapter = S.chapter; V.result = null; V.page = null;
      persist(); closeModal();
      shell.innerHTML = '';
      Battle.start({ mode: 'run', chapter: chapterOf(V.runChapter), player: battlePlayer() });
    },
    retry() { if (S.oxygen < OXY_COST) { A.oxy(); return; } Battle.quit(); A.launch(); },
    resHome() { const stress = V.result && V.result.stress; Battle.quit(); V.result = null; V.page = stress ? 'settings' : null; if (!stress) V.tab = 'play'; render(); },
    resGo(t) { Battle.quit(); V.result = null; V.page = null; V.tab = t; if (t === 'subs') { V.subSel = S.subId; V.pilotSel = S.pilotId; V.subMode = 'sub'; } render(); },
    toggleSound() { Snd.init(); Snd.setOn(!Snd.on); S.sound = Snd.on; persist(); render(); syncPauseSound(); },
    stress() { V.page = null; shell.innerHTML = ''; Battle.start({ mode: 'stress', chapter: D.chapters[0], player: battlePlayer() }); },
    /* 아이콘 시안에서 더한 주포 6종을 한 개씩 넣는다. 포세이돈의 삼지창은 전설, 나머지는 희귀 */
    cheatGuns() {
      ['depthMortar', 'sonarCannon', 'trident', 'krakenCannon', 'laserTrident', 'pearlSniper'].forEach(id => addGear(id, id === 'trident' ? 5 : 1));
      persist(); render(); toast('새 주포 6종을 장비 가방에 넣었습니다.');
    },
    cheatRes() { S.gold += 100000; S.pearl += 5000; D.slots.forEach(s => { S.bp[s.id] += 50; }); S.oxygen += 30; persist(); render(); toast('시험용 재화를 넣었습니다.'); },
    cheatOpen() {
      S.cleared = 15; S.explore.last = S.explore.last || Date.now();
      D.subs.forEach(x => { S.subs[x.id] = S.subs[x.id] || { star: 1, shards: 0 }; if (!S.subs[x.id].star) S.subs[x.id].star = 1; });
      D.pilots.forEach(x => { S.pilots[x.id] = S.pilots[x.id] || { star: 1, shards: 0 }; if (!S.pilots[x.id].star) S.pilots[x.id].star = 1; });
      persist(); render(); toast('모두 열었습니다.');
    },
    wipe() {
      if (!V.wipeArmed) { V.wipeArmed = true; render(); return; }
      S = freshSave(); rollDay(); V.wipeArmed = false; V.page = null; V.tab = 'play'; Snd.setOn(true); persist(); render(); toast('진행 데이터를 지웠습니다.');
    },
  };

  $('stage').addEventListener('click', e => {
    const t = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!t || t.disabled) return;
    Snd.init(); Snd.click();
    const f = A[t.dataset.act];
    if (f) f(t.dataset.arg, t);
  });
  modal.addEventListener('click', e => { if (e.target === modal && !modalLocked) closeModal(); });
  function syncPauseSound() { $('pauseSound').textContent = Snd.on ? '소리 켜짐' : '소리 꺼짐'; }

  /* ===== 전투와 연결 ===== */
  const hooks = {
    renderIdle,
    onResize: () => { if (S) measureScene(); },
    onLevelUp: showCards,
    onChest: showChest,
    onRewardEnd(slots) { hideCards(); syncHudSkills(slots); },
    onFinish(res) {
      $('pausePanel').hidden = true;
      closeModal();
      hideCards();
      V.result = res.mode === 'stress' ? { stress: true, res } : settleRun(res);
      render();
    },
    onDown() {
      const can = S.pearl >= 50;
      openSheet('잠수함 파손', '<img alt="" src="' + Art.url('sub', S.subId, 240, S.pilotId) + '" style="display:block;width:130px;margin:0 auto;filter:saturate(.6);transform:rotate(10deg)"><p class="sub">내구도 50%로 돌아오고 주변 적을 쓸어냅니다. 한 판에 한 번만 됩니다.</p>', '<button class="btn btn-gray" type="button" data-act="giveUp">포기</button><button class="btn btn-blue" type="button" data-act="reviveAd">부활<small>' + Art.ico('ad') + '광고</small></button><button class="btn btn-gold" type="button" data-act="revivePearl"' + (can ? '' : ' disabled') + '>부활<small>' + Art.ico('pearl') + '50</small></button>', true, true);
    },
    onQuit() { $('pausePanel').hidden = true; if (Snd.c) Snd.c.resume(); if (Battle.finish) Battle.finish('fail'); },
    onSoundToggle() { Snd.init(); Snd.setOn(!Snd.on); S.sound = Snd.on; persist(); syncPauseSound(); },
  };
  A.giveUp = () => { closeModal(); Battle.giveUp(); };
  A.reviveAd = () => { closeModal(); Battle.revive(); };
  A.revivePearl = () => { if (S.pearl < 50) return; S.pearl -= 50; persist(); closeModal(); Battle.revive(); };

  function start(data) {
    loadSave(data);
    rollDay();
    tickOxygen();
    Snd.on = S.sound !== false;
    syncPauseSound();
    Battle.init(hooks);
    render();
    const fontsReady = document.fonts && document.fonts.load ? Promise.race([document.fonts.load('40px "Black Han Sans"', '해구순찰대'), new Promise(r => setTimeout(r, 1500))]) : Promise.resolve();
    fontsReady.catch(() => {}).then(() => { logoUrl = Art.logo(860).toDataURL('image/png'); if (V.title) render(); });
    setInterval(() => {
      if (Battle.state !== 'idle') { tickOxygen(); return; }
      rollDay(); tickOxygen(); updateOxyNext();
      const g = $('chipGold'), p = $('chipPearl');
      if (g) g.textContent = short(S.gold);
      if (p) p.textContent = short(S.pearl);
    }, 1000);
    if (window.claude && window.claude.hot && window.claude.hot.snapshot) window.claude.hot.snapshot(() => ({ save: S }));
    window.__menu = { S: () => S, V, A, render, settleRun, playerStats, battlePlayer, chapterOf, myPower };
  }
  /* 장비 아이콘(art-gear-svg.js)을 다 읽은 뒤 첫 화면을 그린다. 먼저 그리면 옛 그림이 캐시에 남는다. */
  const boot = data => (Art.gearReady || Promise.resolve()).then(() => start(data));
  const hot = window.claude && window.claude.hot;
  if (hot && hot.ready) hot.ready(boot); else boot((hot && hot.data) || {});
})();
