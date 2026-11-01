/* 화면 아이콘, 재화, 상자, 장비, 적. 아이콘은 작게 쓰이므로 선을 굵게 하고 형태 하나로 읽히게 한다. */
(function (A) {
  'use strict';
  const { INK, E, R, fill, line, cel, glint, bake, mk } = A;
  const LW = 4;
  const STEEL = ['#8A97B2', '#5A6682', '#C2CEE0'], DARK = ['#3C4560', '#272E45', '#5D6885'], BRASS = ['#FFC93C', '#E08F1E', '#FFF0A0'], WOOD = ['#B9743A', '#8A5026', '#E0A266'];
  const pc = (c, d, p, o) => cel(c, d, p[0], p[1], p[2], Object.assign({ lw: LW, sx: -3, sy: -5, lx: 2, ly: 2.5 }, o || {}));
  const STAR = 'M50 7L62 35L92 38L69 58L76 88L50 72L24 88L31 58L8 38L38 35Z';
  const BOLT = 'M58 6L24 54H46L38 94L78 40H55L68 6Z';
  const COG = (() => {
    let d = '';
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * A.TAU, s = 0.2, p = (r, o) => (50 + Math.cos(a + o) * r).toFixed(1) + ' ' + (50 + Math.sin(a + o) * r).toFixed(1);
      d += (i ? 'L' : 'M') + p(32, -0.26) + 'L' + p(44, -s) + 'L' + p(44, s) + 'L' + p(32, 0.26);
    }
    return d + 'Z';
  })();
  function chestArt(c, pal, emblem) {
    /* 몸통 */
    pc(c, 'M12 50H88V84C88 88 85 90 82 90H18C15 90 12 88 12 84Z', pal.body, { sx: -3, sy: -6 });
    /* 빛 틈 */
    fill(c, 'M15 50H85V57H15Z', '#FFF3A8');
    line(c, 'M12 50H88', LW);
    /* 뚜껑 */
    pc(c, 'M10 50C10 26 22 16 34 16H66C78 16 90 26 90 50Z', pal.lid, { sy: -5 });
    for (const x of [28, 72]) {
      pc(c, 'M' + (x - 6) + ' 17H' + (x + 6) + 'V50H' + (x - 6) + 'Z', pal.band, { lw: 3, sx: -1.6, sy: 0, lx: 1.4, ly: 0 });
      pc(c, 'M' + (x - 6) + ' 57H' + (x + 6) + 'V90H' + (x - 6) + 'Z', pal.band, { lw: 3, sx: -1.6, sy: 0, lx: 1.4, ly: 0 });
    }
    /* 자물쇠 */
    pc(c, R(39, 40, 22, 25, 5), BRASS, { lw: 3.5, sx: -2, sy: -3, lx: 1.4, ly: 1.4 });
    if (emblem) emblem(c); else { fill(c, E(50, 50, 3.6), INK); fill(c, 'M48 51H52L53.500 59H46.500Z', INK); }
    fill(c, 'M18 26C20 22 28 20 36 20V24C30 24 24 26 22 30Z', 'rgba(255,255,255,.55)');
  }
  const CHEST = {
    normal: { body: WOOD, lid: ['#CF8848', '#A0602C', '#F0B880'], band: STEEL },
    advanced: { body: ['#3B6FE0', '#254DAE', '#7CA6FA'], lid: ['#4F86F2', '#3060C4', '#9CC2FF'], band: BRASS },
    subShard: { body: ['#E8553F', '#B8352A', '#FF9A82'], lid: ['#FF6E50', '#D0452F', '#FFB29C'], band: BRASS },
    pilotShard: { body: ['#8E4FD8', '#6432A8', '#C49BF5'], lid: ['#A566EE', '#7C42C4', '#D6B4FA'], band: STEEL },
  };

  const ICON = {
    gold(c) {
      cel(c, E(53, 55, 40), '#C4761A', '#955410', null, { lw: LW, sx: -3, sy: -3 });
      cel(c, E(47, 47, 40), BRASS[0], BRASS[1], BRASS[2], { lw: LW, sx: -4, sy: -6, lx: 3, ly: 3.4 });
      line(c, E(47, 47, 27), 3.4, '#D08418');
      line(c, 'M47 32V64M38 39H56', 5, '#B86F10');
      line(c, 'M33 53C35 62 41 65 47 65C53 65 59 62 61 53', 5, '#B86F10');
      fill(c, E(47, 30, 4.4), '#B86F10');
    },
    pearl(c) {
      cel(c, 'M6 58C6 28 26 10 50 10C74 10 94 28 94 58C94 62 90 64 86 62C80 72 66 72 62 64C56 74 44 74 38 64C34 72 20 72 14 62C10 64 6 62 6 58Z', '#FF8FB2', '#E2608C', '#FFC4D6', { lw: LW, sx: -3, sy: -5, lx: 2, ly: 2.6 });
      line(c, 'M50 12V40M28 18L38 42M72 18L62 42', 2.8, '#D84E7E');
      cel(c, E(50, 62, 22), '#FFFFFF', '#CFD6F2', null, { lw: LW, sx: -3, sy: -4 });
      fill(c, E(42, 54, 6, 4.6), '#fff');
      cel(c, 'M10 74C24 94 76 94 90 74C90 68 84 66 80 70C70 82 30 82 20 70C16 66 10 68 10 74Z', '#E2608C', '#BC4570', null, { lw: LW, sx: -2, sy: -3 });
    },
    oxygen(c) {
      pc(c, R(38, 4, 26, 16, 4), STEEL, { sx: -1.4, sy: -3, lx: 1, ly: 1 });
      pc(c, R(44, 12, 14, 12, 2), DARK, { lw: 3, sx: -1, sy: -2 });
      pc(c, 'M24 40C24 26 36 20 51 20C66 20 78 26 78 40V82C78 92 70 96 51 96C32 96 24 92 24 82Z', ['#37C4F5', '#1F8FD0', '#A3ECFF'], { sx: -4, sy: -5, lx: 3, ly: 2 });
      fill(c, 'M26 54H76V70H26Z', '#fff'); fill(c, 'M66 54H76V70H66Z', '#CFE2EE'); line(c, 'M25 54H77M25 70H77', 3);
      c.font = '700 13px sans-serif'; c.textAlign = 'center'; c.fillStyle = INK; c.fillText('O2', 50, 66.500);
    },
    bp(c) {
      pc(c, 'M12 22C12 14 22 10 30 12L84 12C92 12 92 22 88 26L88 80C88 90 78 92 72 90L18 90C10 90 8 82 12 78Z', ['#2F80E8', '#1F5FB8', '#7EB8FF'], { sx: -3, sy: -4, lx: 2, ly: 2 });
      line(c, 'M28 34H72M28 50H72M28 66H72M42 22V80M58 22V80', 2.4, '#A8D2FF');
      line(c, 'M32 72L48 40L60 58L68 44', 4, '#fff');
    },
    alloy(c) {
      pc(c, 'M50 8L88 28V70L50 92L12 70V28Z', STEEL, { sy: -4 });
      cel(c, 'M50 8L88 28L50 48L12 28Z', '#DCE6F2', '#B4C2D6', '#fff', { lw: 3.6, sx: -2, sy: -3, lx: 1, ly: 1 });
      line(c, 'M50 48V92', 3.6);
    },
    star(c) { cel(c, STAR, BRASS[0], BRASS[1], BRASS[2], { lw: 5, sx: -3, sy: -5, lx: 2.4, ly: 3 }); },
    starOff(c) { cel(c, STAR, '#2C3046', '#1E2134', '#3F4460', { lw: 5, sx: -3, sy: -5, lx: 2.4, ly: 3 }); },
    lock(c) {
      line(c, 'M30 46V30C30 4 70 4 70 30V46', 16); line(c, 'M30 46V30C30 4 70 4 70 30V46', 8, STEEL[2]);
      pc(c, R(16, 42, 68, 50, 10), BRASS, { sy: -6 });
      fill(c, E(50, 62, 8), INK); fill(c, 'M46 62H54L57 80H43Z', INK);
    },
    back(c) { line(c, 'M64 16L30 50L64 84', 26); line(c, 'M64 16L30 50L64 84', 13, '#fff'); },
    fwd(c) { line(c, 'M36 16L70 50L36 84', 26); line(c, 'M36 16L70 50L36 84', 13, '#fff'); },
    close(c) { line(c, 'M22 22L78 78M78 22L22 78', 26); line(c, 'M22 22L78 78M78 22L22 78', 13, '#fff'); },
    plus(c) { line(c, 'M50 18V82M18 50H82', 26); line(c, 'M50 18V82M18 50H82', 13, '#fff'); },
    check(c) { line(c, 'M14 54L40 80L88 24', 26); line(c, 'M14 54L40 80L88 24', 13, '#5CF08E'); },
    tabPlay(c) {
      pc(c, E(50, 50, 44), BRASS, { sy: -5 });
      cel(c, E(50, 50, 32), '#0F5A66', '#0A3F4A', null, { lw: LW, sx: -2, sy: -3 });
      c.save(); c.clip(A.P(E(50, 50, 32)));
      fill(c, 'M50 50L50 14C66 14 82 28 84 44Z', '#3DF0C8');
      c.restore();
      line(c, E(50, 50, 17), 2.8, '#3DF0C8'); line(c, 'M50 18V82M18 50H82', 2.4, '#3DF0C8');
      fill(c, E(36, 62, 5), '#FF5A5F'); fill(c, E(64, 36, 4), '#FFE14D');
      line(c, E(50, 50, 32), LW);
    },
    tabSub(c) {
      cel(c, 'M18 46L4 26H20L34 42Z', '#D94F2E', '#AE3A22', null, { lw: LW, sx: -2, sy: -2 });
      cel(c, 'M18 76L4 96H20L34 80Z', '#D94F2E', '#AE3A22', null, { lw: LW, sx: -2, sy: -2 });
      cel(c, E(56, 40, 21), '#6FE3F2', '#2FA8C4', null, { lw: LW, sx: -2, sy: -3 });
      glint(c, E(56, 40, 21), 44, 22, 5, 20, 0.9);
      cel(c, 'M10 62C10 46 26 38 44 38H66C84 38 96 48 96 62C96 76 84 84 66 84H44C26 84 10 78 10 62Z', '#FF7A4D', '#D94F2E', '#FFB18C', { lw: LW, sx: -3, sy: -6, lx: 2, ly: 2.6 });
      fill(c, E(36, 60, 7), '#fff'); line(c, E(36, 60, 7), 3); fill(c, E(60, 60, 7), '#fff'); line(c, E(60, 60, 7), 3);
    },
    tabGear(c) {
      c.save(); c.translate(6, 6); c.scale(0.72, 0.72);
      cel(c, COG, BRASS[0], BRASS[1], BRASS[2], { lw: 5.5, sx: -3, sy: -5, lx: 2.4, ly: 3 });
      cel(c, E(50, 50, 13), '#3C4560', '#272E45', null, { lw: 5, sx: -1, sy: -2 });
      c.restore();
      const w = 'M34 92C26 100 12 88 20 78L58 42C52 28 62 12 78 12L84 14L72 28L76 38L88 40L96 28C100 44 90 60 72 58Z';
      c.save(); c.translate(2, -4); cel(c, w, STEEL[0], STEEL[1], STEEL[2], { lw: LW, sx: -3, sy: -4, lx: 2, ly: 2.4 }); c.restore();
    },
    tabShop(c) { chestArt(c, CHEST.advanced); },
    tabMore(c) {
      cel(c, COG, STEEL[0], STEEL[1], STEEL[2], { lw: LW, sx: -3, sy: -5, lx: 2.4, ly: 3 });
      cel(c, E(50, 50, 13), BRASS[0], BRASS[1], null, { lw: LW, sx: -1, sy: -2 });
    },
    explore(c) {
      pc(c, E(50, 52, 42), BRASS, { sy: -5 });
      pc(c, R(42, 2, 16, 12, 4), BRASS, { sx: -1, sy: -2, lx: 1, ly: 1 });
      cel(c, E(50, 52, 30), '#FFF8E0', '#E0D6B4', null, { lw: LW, sx: -2, sy: -3 });
      cel(c, 'M64 32L56 56L36 72L44 48Z', '#E8473F', null, null, { lw: 3 });
      fill(c, 'M44 48L56 56L36 72Z', '#2F80E8'); line(c, 'M64 32L56 56L36 72L44 48Z', 3);
      fill(c, E(50, 52, 4), INK);
    },
    mission(c) {
      pc(c, R(14, 12, 72, 84, 8), WOOD, { sy: -5 });
      cel(c, R(23, 22, 54, 66, 3), '#FFFDF2', '#E4DEC4', null, { lw: 3, sx: -1.400, sy: -2.400 });
      pc(c, R(34, 4, 32, 18, 5), STEEL, { lw: 3.600, sx: -1.600, sy: -3, lx: 1, ly: 1 });
      line(c, 'M30 42L36 48L46 36M30 68L36 74L46 62', 4.400, '#1FB46B');
      line(c, 'M54 43H70M54 69H70', 4.400, '#8A92A8');
    },
    mail(c) {
      pc(c, R(6, 22, 88, 62, 8), ['#FFFFFF', '#CBD6E6', '#FFFFFF'], { sy: -5 });
      cel(c, 'M8 26C8 22 92 22 92 26L52 56C50 58 50 58 48 56Z', '#EAF1F8', '#CBD6E6', null, { lw: LW, sx: 0, sy: -3 });
      cel(c, E(50, 54, 11), '#E8473F', '#B92E33', '#FF8B7F', { lw: 3.600, sx: -1.400, sy: -2, lx: 1, ly: 1.200 });
    },
    book(c) {
      pc(c, 'M50 22C40 12 22 12 8 16V84C22 80 40 80 50 90Z', ['#2CC6A6', '#1B9580', '#8DF0DA'], { sx: -2, sy: -4 });
      pc(c, 'M50 22C60 12 78 12 92 16V84C78 80 60 80 50 90Z', ['#1FAE92', '#148071', '#6DE0C8'], { sx: -2, sy: -4 });
      line(c, 'M20 32C28 30 34 30 40 34M20 48C28 46 34 46 40 50M60 34C66 30 72 30 80 32M60 50C66 46 72 46 80 48', 3.200, '#fff');
    },
    gearCfg(c) { ICON.tabMore(c); },
    notice(c) {
      pc(c, 'M12 40C12 36 14 34 18 34H34L72 12C76 10 80 12 80 16V80C80 84 76 86 72 84L34 62H18C14 62 12 60 12 56Z', ['#FF7A4D', '#D94F2E', '#FFB18C'], { sy: -5 });
      pc(c, 'M28 62H44L50 88C50 92 36 94 34 90Z', STEEL, { sx: -2, sy: -3, lx: 1.400, ly: 1.400 });
      line(c, 'M88 34C94 42 94 54 88 62', 5.500);
    },
    dice(c) {
      pc(c, R(12, 12, 76, 76, 16), ['#FFFFFF', '#CBD6E6', '#FFFFFF'], { sy: -6 });
      for (const q of [[32, 32], [68, 32], [50, 50], [32, 68], [68, 68]]) fill(c, E(q[0], q[1], 7.500), '#E8473F');
    },
    chest(c) { chestArt(c, CHEST.normal); },
    ad(c) {
      pc(c, R(8, 20, 84, 64, 12), DARK, { sy: -5 });
      cel(c, 'M38 36L68 52L38 68Z', '#FFD23F', '#E0A42A', null, { lw: 3.600, sx: -1.400, sy: -2 });
    },
    atk(c) {
      cel(c, 'M50 6L60 34L88 40L66 58L72 90L50 74L28 90L34 58L12 40L40 34Z', '#FF5A5F', '#C8343B', '#FF9C9E', { lw: LW, sx: -2, sy: -4, lx: 2, ly: 2.400 });
      cel(c, E(50, 50, 12), '#FFF3C9', '#F0D48E', null, { lw: 3, sx: -1, sy: -1.600 });
    },
    hp(c) { cel(c, 'M50 92C14 66 6 46 8 32C10 12 36 6 50 28C64 6 90 12 92 32C94 46 86 66 50 92Z', '#FF5A7A', '#D0355A', '#FFA6B8', { lw: LW, sx: -3, sy: -5, lx: 2.400, ly: 2.800 }); },
    speed(c) {
      for (let i = 0; i < 3; i++) { c.save(); c.translate(50, 50); c.rotate(i / 3 * A.TAU - 0.6); cel(c, 'M-4 -6C-22 -22-16 -44 0 -46C16 -44 18 -22 4 -6Z', '#4FD6F2', '#1F9CC4', '#B2F2FF', { lw: LW, sx: -2.400, sy: -3 }); c.restore(); }
      cel(c, E(50, 50, 11), BRASS[0], BRASS[1], null, { lw: LW, sx: -1, sy: -2 });
    },
    kills(c) {
      pc(c, 'M50 8C74 8 90 24 90 46C90 58 84 66 74 70V88C74 92 26 92 26 88V70C16 66 10 58 10 46C10 24 26 8 50 8Z', ['#FFFFFF', '#C8D2E2', '#FFFFFF'], { sy: -5 });
      fill(c, E(34, 48, 11, 12), INK); fill(c, E(66, 48, 11, 12), INK);
      fill(c, 'M50 58L56 70H44Z', INK); line(c, 'M40 78V90M50 78V90M60 78V90', 3);
    },
    clock(c) {
      pc(c, E(50, 52, 42), ['#FFFFFF', '#CBD6E6', '#FFFFFF'], { sy: -5 });
      pc(c, R(40, 2, 20, 12, 3), BRASS, { sx: -1, sy: -2, lx: 1, ly: 1 });
      line(c, 'M50 28V54L66 62', 6);
    },
    xp(c) {
      cel(c, 'M50 8L88 50H66V92H34V50H12Z', '#5CE07E', '#2FA858', '#B8F7C8', { lw: LW, sx: -3, sy: -4, lx: 2.400, ly: 2.800 });
    },
    purify(c) {
      cel(c, 'M50 6C64 28 84 44 84 62C84 80 68 94 50 94C32 94 16 80 16 62C16 44 36 28 50 6Z', '#46D5F5', '#1F97D0', '#BAF4FF', { lw: LW, sx: -3, sy: -6, lx: 2.600, ly: 2.800 });
      fill(c, 'M34 60C34 72 42 80 52 80', 'rgba(0,0,0,0)'); line(c, 'M34 60C34 72 42 80 52 80', 5, '#fff');
    },
    shard(c) {
      cel(c, 'M50 6L84 34L70 92L26 86L14 36Z', '#A566EE', '#7C42C4', '#D6B4FA', { lw: LW, sx: -2.400, sy: -4, lx: 2, ly: 2.400 });
      fill(c, 'M50 6L50 50L14 36Z', 'rgba(255,255,255,.28)'); fill(c, 'M50 50L84 34L70 92Z', 'rgba(0,0,0,.14)');
      line(c, 'M50 6V50L14 36M50 50L84 34M50 50L70 92M50 50L26 86', 2.400);
    },
    boss(c) {
      pc(c, 'M12 34L30 48L50 16L70 48L88 34L80 84H20Z', BRASS, { sy: -5 });
      for (const x of [34, 50, 66]) fill(c, E(x, 68, 5), '#E8473F');
    },
    wave(c) {
      cel(c, 'M6 58C18 34 36 30 48 42C42 44 40 50 44 56C56 44 72 40 94 58V86C94 90 92 92 88 92H12C8 92 6 90 6 86Z', '#3EA6F2', '#1F6FC4', '#A8DEFF', { lw: LW, sx: -3, sy: -5 });
      line(c, 'M20 74C30 68 38 80 50 74C60 68 68 80 80 74', 4.400, '#fff');
    },
    gift(c) { chestArt(c, CHEST.subShard); },
  };

  /* 장비 그림: a는 세트 색 */
  const SET_COLOR = { '심연 사냥꾼': ['#FF5A5F', '#C8343B', '#FF9C9E'], '강철 고래': ['#4FB2F2', '#2478C4', '#A8DEFF'], '번개 해파리': ['#FFD23F', '#E0961E', '#FFF2A6'], '유령 잠수정': ['#B07CF2', '#7C4AC8', '#DCC2FF'] };
  const GEAR = {
    twinHarpoon(c, a) {
      c.save(); c.translate(50, 50); c.rotate(-0.62); c.translate(-50, -50);
      for (const y of [32, 58]) {
        pc(c, R(6, y, 66, 11, 3), STEEL, { sy: -3, lx: 1, ly: 1.400 });
        cel(c, 'M72 ' + (y - 5) + 'L98 ' + (y + 5.500) + 'L72 ' + (y + 16) + 'L78 ' + (y + 5.500) + 'Z', a[0], a[1], a[2], { lw: LW, sx: -1.400, sy: -2.600 });
      }
      pc(c, R(14, 26, 22, 48, 5), DARK, { sx: -2, sy: -4, lx: 1.400, ly: 1.400 });
      c.restore();
    },
    scatter(c, a) {
      c.save(); c.translate(50, 50); c.rotate(-0.5); c.translate(-50, -50);
      pc(c, R(10, 40, 34, 22, 5), DARK, { sy: -4 });
      pc(c, 'M40 38H62L92 18V84L62 64H40Z', STEEL, { sy: -6, lx: 2, ly: 2 });
      cel(c, 'M78 26L92 18V84L78 76Z', a[0], a[1], a[2], { lw: LW, sx: -2, sy: -4 });
      c.restore();
    },
    coilGun(c, a) {
      c.save(); c.translate(50, 50); c.rotate(-0.55); c.translate(-50, -50);
      pc(c, R(4, 42, 92, 16, 5), DARK, { sy: -3 });
      for (const x of [26, 44, 62, 80]) cel(c, R(x - 5, 28, 10, 44, 4), a[0], a[1], a[2], { lw: 3.600, sx: -1.400, sy: -3 });
      c.restore();
    },
    torpedo(c, a) {
      c.save(); c.translate(50, 50); c.rotate(-0.62); c.translate(-50, -50);
      for (const f of ['M16 42L4 18H20L32 38Z', 'M16 58L4 82H20L32 62Z']) pc(c, f, DARK, { sx: -2, sy: -2.400 });
      pc(c, 'M14 36H66C82 36 96 42 96 50C96 58 82 64 66 64H14Z', STEEL, { sy: -6, lx: 2, ly: 2.400 });
      c.save(); c.clip(A.P('M14 36H66C82 36 96 42 96 50C96 58 82 64 66 64H14Z')); fill(c, 'M68 30H100V70H68Z', a[0]); fill(c, 'M68 58H100V70H68Z', a[1]); c.restore();
      line(c, 'M68 37V63M14 36H66C82 36 96 42 96 50C96 58 82 64 66 64H14Z', LW);
      c.restore();
    },
    sideGun(c, a) {
      pc(c, R(18, 64, 64, 22, 6), DARK, { sy: -4 });
      for (const x of [34, 66]) { pc(c, R(x - 10, 16, 20, 52, 4), STEEL, { sy: 0, sx: -3, lx: 2, ly: 0 }); line(c, 'M' + x + ' 18V60', 2.600); cel(c, R(x - 12, 10, 24, 12, 3), a[0], a[1], a[2], { lw: 3.600, sx: -1, sy: -2.400 }); }
    },
    shieldDrone(c, a) {
      pc(c, E(44, 54, 30), STEEL, { sy: -5 });
      fill(c, E(44, 54, 12), '#FF5A5F'); line(c, E(44, 54, 12), 3.600); fill(c, E(40, 50, 3.600), '#fff');
      cel(c, 'M70 14C82 18 92 26 94 34V70C92 78 82 86 70 90C74 66 74 38 70 14Z', a[0], a[1], a[2], { lw: LW, sx: -2.400, sy: -4 });
      line(c, 'M26 26L20 10M60 26L66 10', 5);
    },
    tesla(c, a) {
      pc(c, 'M28 92L40 42H60L72 92Z', STEEL, { sy: -4 });
      for (const y of [50, 62, 74]) line(c, 'M' + (42 - (y - 50) * 0.16) + ' ' + y + 'H' + (58 + (y - 50) * 0.16), 4.400, BRASS[1]);
      fill(c, E(50, 24, 22), 'rgba(90,240,255,.3)');
      cel(c, E(50, 24, 15), a[0], a[1], a[2], { lw: LW, sx: -2, sy: -3 });
      line(c, 'M14 10L24 20L16 28M86 10L76 20L84 28', 3.600, '#7DF9FF');
    },
    smoke(c, a) {
      for (const q of [[66, 22, 16], [80, 40, 12], [50, 12, 11]]) cel(c, E(q[0], q[1], q[2]), '#E4ECF4', '#B6C4D4', '#fff', { lw: LW, sx: -2, sy: -3 });
      c.save(); c.translate(50, 50); c.rotate(0.5); c.translate(-50, -50);
      pc(c, R(30, 34, 36, 62, 8), a, { sx: -3, sy: -4 });
      pc(c, R(34, 22, 28, 14, 3), DARK, { sx: -2, sy: -2.600 });
      line(c, 'M30 56H66M30 72H66', 3);
      c.restore();
    },
    aim(c, a) {
      line(c, E(50, 50, 32), 14); line(c, E(50, 50, 32), 7, STEEL[2]);
      line(c, 'M50 4V30M50 70V96M4 50H30M70 50H96', 12); line(c, 'M50 6V28M50 72V94M6 50H28M72 50H94', 5.500, a[0]);
      fill(c, E(50, 50, 8), a[0]); line(c, E(50, 50, 8), 3.600);
    },
    sonar(c, a) {
      line(c, 'M34 66L18 92M18 92H50', 7.500); line(c, 'M34 66L18 92', 3.400, STEEL[2]);
      pc(c, 'M14 26C12 56 38 80 72 74Z', STEEL, { sy: -4 });
      line(c, 'M44 46L60 22', 5);
      cel(c, E(62, 19, 6), a[0], a[1], null, { lw: 3, sx: -1, sy: -1.400 });
      line(c, 'M72 10C80 14 84 20 84 28M80 2C90 8 96 18 96 28', 4.400, a[0]);
    },
    magnet(c, a) {
      line(c, 'M26 16V50C26 86 74 86 74 50V16', 36); line(c, 'M26 16V50C26 86 74 86 74 50V16', 26, a[0]);
      line(c, 'M20 52C22 76 42 82 50 82', 5, a[1]);
      for (const x of [26, 74]) pc(c, R(x - 15, 6, 30, 24, 3), ['#E8EEF6', '#B6C4D4', '#fff'], { sx: -2, sy: -4 });
    },
    thermal(c, a) {
      line(c, 'M6 54C22 34 78 34 94 54', 7); line(c, 'M6 54C22 34 78 34 94 54', 2.800, DARK[2]);
      for (const x of [30, 70]) { pc(c, E(x, 54, 22), DARK, { sy: -3 }); const g = E(x, 54, 15); cel(c, g, a[0], a[1], a[2], { lw: 3.400, sx: -2, sy: -3 }); glint(c, g, x - 8, 38, 5, 30, 0.8); }
      pc(c, R(46, 48, 8, 10, 2), STEEL, { lw: 3 });
    },
    sawArmor(c, a) {
      let d = '';
      for (let i = 0; i < 14; i++) { const t = i / 14 * A.TAU, r = i % 2 ? 44 : 34; d += (i ? 'L' : 'M') + (50 + Math.cos(t) * r).toFixed(1) + ' ' + (50 + Math.sin(t) * r).toFixed(1); }
      cel(c, d + 'Z', STEEL[0], STEEL[1], STEEL[2], { lw: LW, sx: -2.400, sy: -4, lx: 1.600, ly: 2 });
      cel(c, 'M30 32H70V54C70 66 60 72 50 76C40 72 30 66 30 54Z', a[0], a[1], a[2], { lw: LW, sx: -2, sy: -3 });
    },
    whaleArmor(c, a) {
      cel(c, 'M14 16H86V52C86 72 66 86 50 94C34 86 14 72 14 52Z', a[0], a[1], a[2], { lw: LW, sx: -3, sy: -5, lx: 2.400, ly: 2.800 });
      fill(c, 'M50 72C44 58 42 46 44 38C36 44 26 42 24 30C36 30 46 32 50 36C54 32 64 30 76 30C74 42 64 44 56 38C58 46 56 58 50 72Z', '#fff');
    },
    insulated(c, a) {
      cel(c, 'M14 16H86V52C86 72 66 86 50 94C34 86 14 72 14 52Z', DARK[0], DARK[1], DARK[2], { lw: LW, sx: -3, sy: -5, lx: 2.400, ly: 2.800 });
      c.save(); c.translate(19, 17); c.scale(0.62, 0.62); cel(c, BOLT, a[0], a[1], a[2], { lw: 6, sx: -2, sy: -3 }); c.restore();
    },
    ghostCoat(c, a) {
      cel(c, 'M16 92V42C16 18 32 8 50 8C68 8 84 18 84 42V92L72 80L60 92L50 80L40 92L28 80Z', a[0], a[1], a[2], { lw: LW, sx: -3, sy: -5, lx: 2.400, ly: 2.800 });
      fill(c, E(38, 42, 7, 9), INK); fill(c, E(62, 42, 7, 9), INK); fill(c, E(36, 39, 2.400), '#fff'); fill(c, E(60, 39, 2.400), '#fff');
    },
    supercharge(c, a) {
      for (let i = 0; i < 3; i++) { c.save(); c.translate(52, 50); c.rotate(i / 3 * A.TAU - 0.5); cel(c, 'M-5 -6C-24 -18-20 -44 2 -46C20 -44 18 -18 5 -6Z', a[0], a[1], a[2], { lw: LW, sx: -2.400, sy: -3 }); c.restore(); }
      cel(c, E(52, 50, 11), BRASS[0], BRASS[1], null, { lw: LW, sx: -1, sy: -2 });
      line(c, 'M4 34H14M2 50H10M4 66H14', 4.400);
    },
    diesel(c, a) {
      pc(c, R(14, 40, 72, 50, 8), STEEL, { sy: -5 });
      for (const x of [32, 50, 68]) { pc(c, R(x - 7, 16, 14, 26, 3), DARK, { sx: -2, sy: -2 }); cel(c, R(x - 9, 10, 18, 9, 2), a[0], a[1], a[2], { lw: 3.400, sx: -1, sy: -2 }); }
      cel(c, 'M50 80C36 70 32 64 34 58C36 52 46 52 50 60C54 52 64 52 66 58C68 64 64 70 50 80Z', a[0], a[1], a[2], { lw: 3.400, sx: -1.400, sy: -2.400 });
    },
    turbine(c, a) {
      pc(c, E(50, 50, 44), STEEL, { sy: -5 });
      for (let i = 0; i < 8; i++) { const t = i / 8 * A.TAU; line(c, 'M' + (50 + Math.cos(t) * 14).toFixed(1) + ' ' + (50 + Math.sin(t) * 14).toFixed(1) + 'L' + (50 + Math.cos(t + 0.5) * 34).toFixed(1) + ' ' + (50 + Math.sin(t + 0.5) * 34).toFixed(1), 5, DARK[1]); }
      c.save(); c.translate(29, 29); c.scale(0.42, 0.42); cel(c, BOLT, a[0], a[1], null, { lw: 7, sx: -2, sy: -3 }); c.restore();
    },
    silent(c, a) {
      for (let i = 0; i < 4; i++) { c.save(); c.translate(50, 50); c.rotate(i / 4 * A.TAU + 0.3); cel(c, 'M-3 -6C-14 -18-10 -44 0 -46C10 -44 14 -18 3 -6Z', a[0], a[1], a[2], { lw: LW, sx: -1.800, sy: -3 }); c.restore(); }
      cel(c, E(50, 50, 10), DARK[0], DARK[1], null, { lw: LW, sx: -1, sy: -2 });
    },
    overload(c, a) {
      cel(c, 'M28 40C20 26 34 22 36 6C46 14 48 22 52 14C62 22 74 28 70 42Z', '#FFB02E', '#F2711C', '#FFE680', { lw: 3.600, sx: -2, sy: -3 });
      pc(c, 'M24 38H76L70 92C70 96 30 96 30 92Z', DARK, { sy: -4 });
      for (const x of [36, 50, 64]) cel(c, R(x - 5, 46, 10, 24, 4), a[0], a[1], a[2], { lw: 3, sx: -1.400, sy: -2.400 });
    },
    repair(c, a) {
      pc(c, R(30, 12, 40, 18, 5), DARK, { sy: -2.400, sx: -1 });
      cel(c, R(8, 24, 84, 66, 10), a[0], a[1], a[2], { lw: LW, sx: -3, sy: -6, lx: 2.400, ly: 2.800 });
      fill(c, 'M42 38H58V50H70V66H58V78H42V66H30V50H42Z', '#fff'); line(c, 'M42 38H58V50H70V66H58V78H42V66H30V50H42Z', 3.400);
    },
    emp(c, a) {
      line(c, 'M66 24C72 12 82 8 92 12', 6);
      cel(c, E(92, 12, 6), '#FF7A4D', '#D94F2E', null, { lw: 3, sx: -1, sy: -1 });
      cel(c, E(46, 58, 36), DARK[0], DARK[1], DARK[2], { lw: LW, sx: -3, sy: -6, lx: 2.400, ly: 2.800 });
      pc(c, R(58, 18, 18, 14, 4), STEEL, { lw: 3.400, sx: -1, sy: -2 });
      c.save(); c.translate(25, 33); c.scale(0.46, 0.5); cel(c, BOLT, a[0], a[1], null, { lw: 7, sx: -2, sy: -3 }); c.restore();
    },
    decoy(c, a) {
      cel(c, 'M6 52C18 28 50 22 72 40L94 24V78L72 62C50 82 18 76 6 52Z', a[0], a[1], a[2], { lw: LW, sx: -3, sy: -5, lx: 2.400, ly: 2.800 });
      fill(c, E(30, 46, 7), '#fff'); line(c, E(30, 46, 7), 3); fill(c, E(29, 47, 2.800), INK);
      line(c, 'M52 40C56 48 56 58 52 66', 3);
    },
  };
  const TIER_COLOR = [['#9AA6BA', '#6E7A90', '#C6D0DE'], ['#3F96F0', '#2468C0', '#8CCBFF'], ['#A85FEE', '#7A38C4', '#D6AEFF'], ['#F59A2B', '#CC6E12', '#FFCF85'], ['#F04E52', '#BE2C36', '#FF9C9C']];
  /* 등급 색 칸 위에 장비를 올린다 */
  function tile(c, group) {
    const t = TIER_COLOR[group] || TIER_COLOR[0], box = R(0, 0, 100, 100, 15);
    cel(c, box, t[0], t[1], t[2], { lw: 0, sx: 0, sy: -11, lx: 0, ly: 4 });
    c.save(); c.clip(A.P(box));
    c.fillStyle = 'rgba(255,255,255,.16)'; c.beginPath(); c.moveTo(0, 0); c.lineTo(58, 0); c.lineTo(0, 58); c.closePath(); c.fill();
    c.fillStyle = 'rgba(0,0,0,.14)';
    for (let x = 58; x < 104; x += 8) for (let y = 58; y < 104; y += 8) { c.beginPath(); c.arc(x, y, (x + y - 110) * 0.03, 0, A.TAU); c.fill(); }
    c.restore();
    line(c, box, 5);
  }
  function drawGear(c, id, group) {
    const it = window.DATA.items[id], svg = A.gearIcon && A.gearIcon(id);
    tile(c, group);
    if (svg) { c.drawImage(svg, 7, 5, 86, 86); return; }
    c.save(); c.translate(13, 11); c.scale(0.74, 0.74);
    (GEAR[id] || GEAR.twinHarpoon)(c, SET_COLOR[it.set] || SET_COLOR['강철 고래']);
    c.restore();
  }

  /* 적: 전투와 도감이 함께 쓴다 */
  const ENEMY = {
    jelly(c) {
      for (const x of [26, 38, 50, 62, 74]) line(c, 'M' + x + ' 52C' + (x - 7) + ' 66 ' + (x + 7) + ' 76 ' + x + ' 92', 6, INK);
      for (const x of [26, 38, 50, 62, 74]) line(c, 'M' + x + ' 52C' + (x - 7) + ' 66 ' + (x + 7) + ' 76 ' + x + ' 92', 2.800, '#8E55C8');
      cel(c, 'M12 58C8 22 32 8 50 8C68 8 92 22 88 58C80 66 62 62 50 66C38 62 20 66 12 58Z', '#B06FE0', '#7C42B4', '#E0B6FF', { lw: LW, sx: -3, sy: -6, lx: 2.400, ly: 3 });
      fill(c, E(70, 28, 6, 8), '#2DE2C5'); fill(c, E(26, 44, 4), '#2DE2C5');
      fill(c, E(36, 42, 7.500, 8.500), INK); fill(c, E(62, 42, 7.500, 8.500), INK); fill(c, E(34, 39, 2.800), '#fff'); fill(c, E(60, 39, 2.800), '#fff');
    },
    sardine(c) {
      cel(c, 'M22 50L4 28V72Z', '#6D8098', '#4F6078', null, { lw: LW, sx: -1.400, sy: -3 });
      cel(c, 'M14 50C26 26 60 20 96 50C60 80 26 74 14 50Z', '#9FB4C8', '#6D8098', '#DCE8F0', { lw: LW, sx: -2, sy: -5, lx: 1.800, ly: 2.400, paint(q) { fill(q, 'M0 56C30 60 66 60 100 52V100H0Z', '#D7B8E8'); } });
      line(c, 'M64 32C70 42 70 58 64 68', 3);
      fill(c, E(78, 44, 6.500), '#FFB22E'); line(c, E(78, 44, 6.500), 2.600); fill(c, E(79, 44, 2.800), INK);
    },
    puffer(c) {
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * A.TAU, p = (r, o) => (50 + Math.cos(a + o) * r).toFixed(1) + ' ' + (50 + Math.sin(a + o) * r).toFixed(1);
        cel(c, 'M' + p(30, -0.2) + 'L' + p(47, 0) + 'L' + p(30, 0.2) + 'Z', '#8D9A2C', '#6E7A1E', null, { lw: 3, sx: -1, sy: -1 });
      }
      cel(c, E(50, 50, 34), '#C7D44C', '#94A52E', '#EEF39A', { lw: LW, sx: -3, sy: -6, lx: 2.400, ly: 3 });
      for (const q of [[30, 70, 5], [68, 72, 4], [72, 34, 3.400]]) fill(c, E(q[0], q[1], q[2]), '#8E55C8');
      for (const s of [38, 62]) { fill(c, E(s, 42, 8.500), '#fff'); line(c, E(s, 42, 8.500), 3); fill(c, E(s + 1, 43, 4), INK); }
      line(c, 'M42 62C46 58 54 58 58 62', 3.600);
    },
  };

  /* 정예와 보스는 크게 쓰이므로 선을 조금 가늘게 둔다 */
  function queenBell(c, f, sh, li) {
    for (const x of [24, 37, 50, 63, 76]) line(c, 'M' + x + ' 54C' + (x - 8) + ' 68 ' + (x + 8) + ' 78 ' + x + ' 94', 7, INK);
    for (const x of [24, 37, 50, 63, 76]) line(c, 'M' + x + ' 54C' + (x - 8) + ' 68 ' + (x + 8) + ' 78 ' + x + ' 94', 3.4, sh);
    cel(c, 'M10 60C6 26 30 14 50 14C70 14 94 26 90 60C80 68 62 64 50 68C38 64 20 68 10 60Z', f, sh, li, { lw: LW, sx: -3, sy: -6, lx: 2.4, ly: 3 });
    fill(c, E(72, 36, 6, 8), '#2DE2C5'); fill(c, E(24, 48, 4), '#2DE2C5');
    for (const x of [35, 65]) { fill(c, E(x, 44, 8, 9.5), INK); fill(c, E(x - 2.4, 40, 3), '#fff'); }
    line(c, 'M26 34L42 40M74 34L58 40', 4.4);
  }
  Object.assign(ENEMY, {
    queenJelly(c) {
      queenBell(c, '#D0486E', '#8E2348', '#FF9DB4');
      cel(c, 'M30 22L34 6L44 16L50 2L56 16L66 6L70 22C60 16 40 16 30 22Z', BRASS[0], BRASS[1], BRASS[2], { lw: 3.4, sx: -1.6, sy: -2.4, lx: 1, ly: 1.2 });
    },
    miniQueen(c) { queenBell(c, '#D0486E', '#8E2348', '#FF9DB4'); },
    crabKing(c) {
      const H = ['#F2553E', '#C2352B', '#FF8E73'];
      /* 다리 */
      for (const s of [-1, 1]) for (const k of [0, 1, 2]) {
        const y = 66 + k * 8, d = 'M' + (50 + s * 28) + ' ' + y + 'L' + (50 + s * (40 + k * 2)) + ' ' + (y + 4) + 'L' + (50 + s * (46 + k)) + ' ' + (y + 15);
        line(c, d, 8, INK); line(c, d, 3.8, H[1]);
      }
      /* 집게 */
      for (const s of [-1, 1]) {
        const m = x => 50 + s * x;
        const arm = 'M' + m(24) + ' 56L' + m(36) + ' 44';
        line(c, arm, 11, INK); line(c, arm, 6, H[1]);
        cel(c, 'M' + m(34) + ' 48C' + m(50) + ' 52 ' + m(52) + ' 26 ' + m(46) + ' 6L' + m(40) + ' 22L' + m(28) + ' 8C' + m(20) + ' 22 ' + m(22) + ' 42 ' + m(34) + ' 48Z', H[0], H[1], H[2], { lw: 3.6, sx: -2.4, sy: -4, lx: 1.6, ly: 2 });
        /* 눈자루 */
        const st = 'M' + m(9) + ' 34L' + m(10) + ' 20';
        line(c, st, 7, INK); line(c, st, 3.4, H[0]);
        cel(c, E(m(11), 16, 7.5), '#FFFFFF', '#D5DFEE', null, { lw: 3, sx: -1, sy: -1.6 });
        fill(c, E(m(11) - s * 1, 17, 3.6, 4.4), INK); fill(c, E(m(11) - s * 1 - 1.2, 15.2, 1.4), '#fff');
      }
      /* 몸통과 폐그물 */
      const body = 'M18 56C18 38 34 30 50 30C66 30 82 38 82 56C82 74 66 84 50 84C34 84 18 74 18 56Z';
      cel(c, body, H[0], H[1], H[2], { lw: LW, sx: -3, sy: -6, lx: 2.2, ly: 2.8, paint(q) {
        q.strokeStyle = 'rgba(245,250,255,.72)'; q.lineWidth = 1.5;
        for (let i = -3; i < 7; i++) { q.beginPath(); q.moveTo(10 + i * 11, 26); q.lineTo(40 + i * 11, 88); q.moveTo(90 - i * 11, 26); q.lineTo(60 - i * 11, 88); q.stroke(); }
      } });
      /* 찡그린 눈썹과 입 */
      line(c, 'M34 46L46 52M66 46L54 52', 4.6);
      cel(c, 'M32 62C42 68 58 68 68 62C66 74 58 78 50 78C42 78 34 74 32 62Z', '#5C1626', '#3E0E1A', null, { lw: 3, sx: 0, sy: -1.4 });
      fill(c, 'M35 63.500L39 70L43 65.500L47 71.500L50 66L53 71.500L57 65.500L61 70L65 63.500C58 67.500 42 67.500 35 63.500Z', '#fff');
    },
  });

  /* 스킬 아이콘. 카드, HUD, 전투 속 소환물이 같이 쓴다 */
  const arcs = (c, d, color) => { line(c, d, 8.5); line(c, d, 4.4, color); };
  const SKILL = {
    abyssCry(c) {
      cel(c, 'M8 30L2 14L18 22C24 18 34 16 42 18C56 20 66 34 64 50C62 68 48 82 32 80C16 78 6 64 8 46Z', '#5A3FA8', '#3B2775', '#9A7BE0', { lw: LW, sx: -3, sy: -5, lx: 2, ly: 2.6 });
      cel(c, 'M14 54C26 58 44 58 58 50C56 62 46 72 34 72C24 72 16 64 14 54Z', '#1C1336', '#120C24', null, { lw: 3, sx: 0, sy: -1 });
      fill(c, 'M18 55.500L22 62L26 57L30 63L34 57L38 63L42 56L46 61L52 52.500C42 57 28 57.500 18 55.500Z', '#fff');
      fill(c, E(40, 36, 6), '#fff'); fill(c, E(41.500, 37, 3.200), INK);
      arcs(c, 'M72 32C78 44 78 58 72 70', '#D6AEFF');
      arcs(c, 'M84 22C94 40 94 62 84 80', '#A97BF0');
    },
    ghostTorpedo(c) {
      c.save(); c.translate(50, 50); c.rotate(-0.62); c.translate(-50, -50);
      /* 꼬리가 흐릿하게 끌린다 */
      for (const k of [[2, 26, 0.3], [12, 30, 0.5]]) { c.save(); c.globalAlpha = k[2]; fill(c, R(k[0], 50 - k[1] / 2, 26, k[1], 10), '#B9EEFF'); c.restore(); }
      cel(c, 'M18 36H62C80 36 96 42 96 50C96 58 80 64 62 64H18C14 58 14 42 18 36Z', '#E6FBFF', '#A5DDF2', '#FFFFFF', { lw: LW, sx: -2, sy: -5, lx: 1.4, ly: 2 });
      fill(c, E(74, 45, 3.4, 4), INK); fill(c, E(84, 45, 3, 3.6), INK);
      line(c, 'M30 36V64M42 36V64', 2.6, '#7CC6E2');
      c.restore();
    },
    coralMine(c) {
      let d = '';
      for (let i = 0; i < 18; i++) { const t = i / 18 * A.TAU, r = i % 2 ? 46 : 28; d += (i ? 'L' : 'M') + (50 + Math.cos(t) * r).toFixed(1) + ' ' + (50 + Math.sin(t) * r).toFixed(1); }
      cel(c, d + 'Z', '#FF6E8A', '#D13E62', '#FFB0C0', { lw: LW, sx: -3, sy: -5, lx: 2, ly: 2.4 });
      cel(c, E(50, 50, 19), '#FFE1C8', '#F2B79A', null, { lw: 3.4, sx: -2, sy: -3 });
      for (const q of [[43, 44], [57, 46], [50, 58]]) fill(c, E(q[0], q[1], 3.6), '#D13E62');
    },
    pressureWave(c) {
      cel(c, E(50, 50, 44), '#2F80E8', '#1F5FB8', '#7EB8FF', { lw: LW, sx: -3, sy: -5, lx: 2, ly: 2.4 });
      line(c, E(50, 50, 31), 4, '#BFE4FF');
      cel(c, E(50, 50, 16), '#E6F6FF', '#A8D2F2', null, { lw: 3.4, sx: -1.6, sy: -2.4 });
      for (let i = 0; i < 4; i++) {
        c.save(); c.translate(50, 50); c.rotate(i / 4 * A.TAU + 0.785);
        cel(c, 'M-9 -30L0 -46L9 -30Z', '#FFD23F', '#E0961E', null, { lw: 3, sx: -1, sy: -1 });
        c.restore();
      }
    },
    babyOcto(c) {
      for (const x of [22, 40, 60, 78]) cel(c, 'M' + (x - 9) + ' 60C' + (x - 11) + ' 76 ' + (x - 12) + ' 88 ' + (x - 2) + ' 92C' + (x + 8) + ' 92 ' + (x + 9) + ' 74 ' + (x + 9) + ' 60Z', '#E2608C', '#BC4570', null, { lw: LW, sx: -2, sy: -3 });
      cel(c, 'M12 50C12 22 30 8 50 8C70 8 88 22 88 50C88 70 70 78 50 78C30 78 12 70 12 50Z', '#FF8FB2', '#E2608C', '#FFC4D6', { lw: LW, sx: -3, sy: -6, lx: 2.2, ly: 2.8 });
      for (const x of [34, 66]) { fill(c, E(x, 46, 7.5, 9), INK); fill(c, E(x - 2.2, 42.500, 2.800), '#fff'); }
      fill(c, E(24, 58, 6, 3.4), 'rgba(255,70,110,.5)'); fill(c, E(76, 58, 6, 3.4), 'rgba(255,70,110,.5)');
      line(c, 'M44 60C47 64 53 64 56 60', 3.4);
    },
    lumaJelly(c) {
      for (const x of [28, 42, 58, 72]) { const d = 'M' + x + ' 56C' + (x - 7) + ' 68 ' + (x + 7) + ' 78 ' + x + ' 92'; line(c, d, 7.5); line(c, d, 3.6, '#5CE8E0'); }
      fill(c, E(50, 42, 44, 36), 'rgba(110,255,240,.22)');
      cel(c, 'M14 58C10 24 32 10 50 10C68 10 90 24 86 58C76 66 62 62 50 66C38 62 24 66 14 58Z', '#6FF5E4', '#2FC6BE', '#D2FFF8', { lw: LW, sx: -3, sy: -6, lx: 2.2, ly: 3 });
      for (const x of [37, 63]) { fill(c, E(x, 42, 5.500, 6.500), INK); fill(c, E(x - 1.600, 39.500, 2), '#fff'); }
      cel(c, 'M84 6L88 16L98 20L88 24L84 34L80 24L70 20L80 16Z', '#FFF3A0', '#FFC93F', null, { lw: 2.6, sx: -1, sy: -1 });
    },
    ancientDrone(c) {
      for (const f of ['M30 30L14 10H32L46 26Z', 'M30 70L14 90H32L46 74Z']) cel(c, f, '#8A5A2B', '#5F3C1B', null, { lw: LW, sx: -2, sy: -2 });
      cel(c, 'M10 50C10 34 28 24 50 24C72 24 92 34 92 50C92 66 72 76 50 76C28 76 10 66 10 50Z', '#C7893F', '#94602A', '#E9B878', { lw: LW, sx: -3, sy: -6, lx: 2, ly: 2.6 });
      line(c, 'M34 26C30 40 30 60 34 74M52 24C50 40 50 60 52 76', 2.8, '#7A4E22');
      cel(c, E(70, 50, 13), '#3C4560', '#272E45', null, { lw: 3.4, sx: -1, sy: -2 });
      fill(c, E(71, 50, 7), '#FF5A5F'); fill(c, E(68.500, 47.500, 2.400), '#fff');
      for (const y of [36, 64]) A.bolt(c, 22, y, 2.6, BRASS[0]);
    },
    inkVeil(c) {
      const d = 'M22 72C8 72 4 54 16 48C10 32 28 20 40 28C46 12 72 14 74 32C90 30 98 50 86 60C92 72 74 80 66 74C58 84 34 84 22 72Z';
      cel(c, d, '#3B2F5C', '#241B3E', '#6A5A96', { lw: LW, sx: -3, sy: -6, lx: 2.2, ly: 2.8 });
      for (const q of [[30, 80, 4, 8], [50, 86, 4.5, 9], [68, 82, 3.5, 7]]) { fill(c, E(q[0], q[1], q[2], q[3]), '#241B3E'); }
      for (const x of [40, 62]) { fill(c, E(x, 48, 6, 7.5), '#fff'); fill(c, E(x + 1, 49, 3, 4), INK); }
    },
    buoyOverload(c) {
      const bub = (x, y, r) => { cel(c, E(x, y, r), '#7FE4FF', '#37B4E8', '#E6FBFF', { lw: 3.6, sx: -r * 0.2, sy: -r * 0.28, lx: r * 0.12, ly: r * 0.14 }); fill(c, E(x - r * 0.34, y - r * 0.36, r * 0.2), '#fff'); };
      bub(66, 70, 22); bub(30, 76, 14); bub(30, 44, 10);
      cel(c, 'M62 4L88 34H72V52H52V34H36Z', '#FFD23F', '#E0961E', '#FFF2A6', { lw: LW, sx: -2.4, sy: -3.4, lx: 1.6, ly: 2 });
    },
    abyssDrain(c) {
      cel(c, E(50, 50, 44), '#2A1F4E', '#1A1336', '#4A3A80', { lw: LW, sx: -3, sy: -5, lx: 2, ly: 2.4 });
      line(c, 'M50 50C58 42 70 50 62 62C52 76 28 70 28 50C28 26 62 20 76 40', 5, '#8D6CD0');
      fill(c, E(50, 50, 7), INK);
      for (const q of [[80, 22, 8], [14, 26, 6.5], [20, 82, 6.5]]) { cel(c, E(q[0], q[1], q[2]), '#7FF5C8', '#2FC58D', '#E6FFF6', { lw: 3, sx: -1.2, sy: -1.6, lx: 0.8, ly: 0.8 }); }
    },
    carapace(c) {
      for (const p of [[20, 40, 6, 14], [38, 22, 32, 2], [62, 22, 68, 2], [80, 40, 94, 14]]) cel(c, 'M' + (p[0] - 9) + ' ' + (p[1] + 8) + 'L' + p[2] + ' ' + p[3] + 'L' + (p[0] + 9) + ' ' + (p[1] - 6) + 'Z', '#E8EEF6', '#B6C4D4', null, { lw: 3.4, sx: -1.2, sy: -1.4 });
      cel(c, 'M8 66C8 36 28 18 50 18C72 18 92 36 92 66C92 80 72 86 50 86C28 86 8 80 8 66Z', '#F59A2B', '#CC6E12', '#FFCF85', { lw: LW, sx: -3, sy: -6, lx: 2.4, ly: 3 });
      line(c, 'M50 20V84M28 28C22 44 22 66 26 82M72 28C78 44 78 66 74 82', 3, '#A85A10');
    },
    currentRide(c) {
      for (const k of [[-14, 0.3], [-7, 0.55]]) { c.save(); c.globalAlpha = k[1]; c.translate(k[0], 0); fill(c, 'M16 72C30 40 50 32 64 44C56 46 52 54 58 62C68 50 78 48 92 58V84H16Z', '#5EC2EE'); c.restore(); }
      cel(c, 'M16 72C30 40 50 32 64 44C56 46 52 54 58 62C68 50 78 48 92 58V84C92 88 90 90 86 90H22C18 90 16 88 16 84Z', '#3EA6F2', '#1F6FC4', '#A8DEFF', { lw: LW, sx: -3, sy: -5 });
      line(c, 'M28 78C38 72 46 84 58 78C68 72 76 84 84 78', 4.4, '#fff');
      for (const y of [18, 30]) line(c, 'M12 ' + y + 'H38', 5, '#5EC2EE');
    },
  };
  /* 어뢰 파편과 작은 탄 */
  const TORP = c => {
    cel(c, 'M6 36H62C80 36 96 42 96 50C96 58 80 64 62 64H6C2 58 2 42 6 36Z', '#E6FBFF', '#A5DDF2', '#FFFFFF', { lw: 6, sx: -2, sy: -6, lx: 1.4, ly: 2 });
    line(c, 'M22 36V64', 4, '#7CC6E2');
  };

  function ico(name, cls) { return '<img class="ico' + (cls ? ' ' + cls : '') + '" alt="" src="' + A.url('icon', name, 96) + '">'; }
  A.makers.icon = (id, px) => bake(px, c => (ICON[id] || ICON.star)(c), { pad: 4, ink: 0 });
  A.makers.gear = (id, px, group) => bake(px, c => drawGear(c, id, group || 0), { pad: 2 });
  A.makers.gearBare = (id, px) => bake(px, c => {
    const svg = A.gearIcon && A.gearIcon(id);
    if (svg) c.drawImage(svg, 0, 0, 100, 100);
    else (GEAR[id] || GEAR.twinHarpoon)(c, SET_COLOR[window.DATA.items[id].set]);
  }, { pad: 4 });
  A.makers.slot = (id, px) => bake(px, c => {
    const box = R(0, 0, 100, 100, 15), rep = { 주포: 'twinHarpoon', 보조: 'sideGun', 센서: 'aim', 장갑: 'whaleArmor', 엔진: 'supercharge', 특수모듈: 'repair' }[id];
    fill(c, box, '#2A2F47'); line(c, box, 5);
    const svg = A.gearIcon && A.gearIcon(rep);
    c.save(); c.globalAlpha = 0.35;
    /* 빈 칸에는 대표 장비를 흐린 회색으로 깐다 */
    if (svg) { c.filter = 'grayscale(1) brightness(1.5)'; c.drawImage(svg, 7, 5, 86, 86); }
    else { c.translate(13, 11); c.scale(0.74, 0.74); (GEAR[rep] || GEAR.twinHarpoon)(c, ['#AAB6CC', '#7C879A', '#C2CEE0']); }
    c.restore();
  }, { pad: 2 });
  A.makers.chest = (id, px) => bake(px, c => chestArt(c, CHEST[id] || CHEST.normal), { pad: 6, ink: 1, white: 2 });
  /* 진주 묶음: 비쌀수록 쌓인다 */
  const PILE = [[50, 66, 15], [32, 74, 13], [68, 74, 13], [50, 50, 13], [20, 82, 11], [80, 82, 11], [38, 88, 11], [62, 88, 11], [30, 56, 11], [70, 56, 11], [50, 34, 11], [50, 78, 12]];
  A.makers.pearls = (n, px) => bake(px, c => {
    c.save(); c.translate(0, -8);
    cel(c, 'M6 58C6 28 26 10 50 10C74 10 94 28 94 58C94 62 90 64 86 62C80 72 66 72 62 64C56 74 44 74 38 64C34 72 20 72 14 62C10 64 6 62 6 58Z', '#FF8FB2', '#E2608C', '#FFC4D6', { lw: LW, sx: -3, sy: -5, lx: 2, ly: 2.6 });
    line(c, 'M50 12V40M28 18L38 42M72 18L62 42', 2.8, '#D84E7E');
    c.restore();
    PILE.slice(0, Number(n)).sort((a, b) => a[1] - b[1]).forEach(p => {
      cel(c, E(p[0], p[1], p[2]), '#FFFFFF', '#CFD6F2', null, { lw: 3.4, sx: -2, sy: -3 });
      fill(c, E(p[0] - p[2] * 0.32, p[1] - p[2] * 0.34, p[2] * 0.26), '#fff');
    });
  }, { pad: 4 });
  A.makers.enemy = (id, px) => bake(px, c => ENEMY[id](c), { pad: 8, ink: 1 });
  A.enemySprite = (name, px) => {
    const img = bake(px, c => ENEMY[name](c), { pad: 8, ink: 1 });
    return { img, white: A.whiteOf(img), px };
  };
  A.makers.skill = (id, px) => bake(px, c => SKILL[id](c), { pad: 4 });
  /* 전투에서 찍어 내는 소환물과 설치물 */
  A.fxSprite = (id, px) => bake(px, c => (id === 'torp' ? TORP(c) : SKILL[id](c)), { pad: 4, ink: 1.4 });
  A.ico = ico;
  A.TIER_COLOR = TIER_COLOR;
})(window.Art);
