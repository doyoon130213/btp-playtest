/* 잠수함 10종. 앞쪽이 오른쪽이고 빛은 왼쪽 위에서 온다. 형태가 멀리서도 구별되도록 실루엣부터 다르게 잡는다. */
(function (A) {
  'use strict';
  const { INK, E, R, fill, line, cel, bolt, glint, bake } = A;
  const STEEL = ['#7A88A6', '#505C78', '#AEBBD2'], DARK = ['#3C4560', '#272E45', '#5D6885'], BRASS = ['#F4BC42', '#BF7E1E', '#FFE699'];
  const pc = (c, d, p, o) => cel(c, d, p[0], p[1], p[2], o);

  /* 프로펠러: 날개를 가로로 눌러 도는 것처럼 보이게 한다. 매 프레임 그리므로 경로 문자열을 고정한다 */
  const BLADE = 'M0 -10C5 -6 5 -1.500 0 0C-5 -1.500 -5 -6 0 -10Z';
  function prop(c, x, y, r, t) {
    const w = 0.28 + 0.72 * Math.abs(Math.sin(t || 0.9)), k = r / 10;
    c.save(); c.translate(x, y); c.scale(k * w, k);
    cel(c, BLADE, BRASS[0], BRASS[1], null, { lw: 1.3, sx: -0.6, sy: -0.8 });
    c.scale(1, -1);
    cel(c, BLADE, BRASS[0], BRASS[1], null, { lw: 1.3, sx: -0.6, sy: 0.8 });
    c.restore();
  }
  function lamp(c, x, y, r) {
    pc(c, E(x, y, r), BRASS, { lw: 1.5, sx: -0.8, sy: -1, lx: 0.5, ly: 0.5 });
    cel(c, E(x, y, r * 0.66), '#FFFBD6', '#FFD65A', null, { lw: 1.1, sx: -0.6, sy: -0.8 });
    fill(c, E(x - r * 0.2, y - r * 0.22, r * 0.2), '#fff');
  }
  function port(c, x, y, r) {
    pc(c, E(x, y, r), STEEL, { lw: 1.4, sx: -0.6, sy: -0.8, lx: 0.4, ly: 0.4 });
    const g = E(x, y, r * 0.62);
    cel(c, g, '#5FD8EE', '#1E7FA8', null, { lw: 1, sx: -0.6, sy: -0.9 });
    glint(c, g, x - r * 0.5, y - r, r * 0.34, r * 2, 0.9);
  }
  /* 유리 돔과 파일럿. x, y는 돔 바닥 중심. dark가 true면 깔때기 없이 납작하게 앉힌다 */
  function dome(c, x, y, r, pilot, o) {
    o = o || {};
    const d = 'M' + (x - r) + ' ' + y + 'C' + (x - r) + ' ' + (y - r * 1.74) + ' ' + (x + r) + ' ' + (y - r * 1.74) + ' ' + (x + r) + ' ' + y + 'Z';
    fill(c, d, '#1A6F93');
    c.save(); c.clip(A.P(d));
    fill(c, 'M' + (x - r) + ' ' + y + 'C' + (x - r) + ' ' + (y - r * 0.8) + ' ' + (x + r) + ' ' + (y - r * 0.8) + ' ' + (x + r) + ' ' + y + 'Z', '#135A7C');
    A.drawPilotSeat(c, pilot, x + (o.px || 0), y - r * 0.66, r / 45, o.wave);
    c.fillStyle = 'rgba(120,235,255,.14)'; c.fill(A.P(d));
    glint(c, d, x - r * 0.66, y - r * 1.3, r * 0.2, r * 1.05, 0.7);
    c.restore();
    line(c, d, 1.7);
    /* 돔 받침 */
    pc(c, R(x - r - 2.2, y - 2.2, r * 2 + 4.4, 5.5, 2.4), BRASS, { lw: 1.6, sx: -0.6, sy: -1.2, lx: 0.5, ly: 0.5 });
  }
  function rivets(c, pts, r) { for (const p of pts) bolt(c, p[0], p[1], r || 1.05); }
  /* 포신 */
  function gun(c, x, y, l, h) {
    pc(c, R(x, y - h / 2, l, h, h * 0.25), STEEL, { lw: 1.5, sx: -0.5, sy: -1.2, lx: 0.5, ly: 0.4 });
    pc(c, R(x + l - 2.4, y - h / 2 - 1, 3.2, h + 2, 1), DARK, { lw: 1.3, sx: -0.3, sy: -0.6 });
  }
  /* 사선 줄무늬 */
  function stripes(c, x, y, w, h, gap, color) {
    c.fillStyle = color;
    for (let i = -h; i < w + h; i += gap * 2) { c.beginPath(); c.moveTo(x + i, y + h); c.lineTo(x + i + gap, y + h); c.lineTo(x + i + gap + h, y); c.lineTo(x + i + h, y); c.closePath(); c.fill(); }
  }

  const SUB = {
    /* 균형형: 땅딸막한 예인선 */
    coral: { tail: -0.34, draw(c, p, o) {
      const H = ['#FF7A4D', '#D94F2E', '#FFB18C'];
      line(c, 'M24 38V20H16', 5.2); line(c, 'M24 38V20H16', 2.8, STEEL[0]);
      pc(c, R(9, 16, 8, 8, 2), DARK, { lw: 1.5, sx: -0.5, sy: -1 }); fill(c, E(11, 20, 1.7), '#6FE3F2');
      cel(c, 'M22 44L4 32H19L34 38Z', H[0], H[1], H[2], { lw: 1.7, sx: -1.2, sy: -1.8, lx: 0.7, ly: 0.8 });
      cel(c, 'M18 68L5 88H19L32 72Z', H[1], '#AE3A22', H[0], { lw: 1.7, sx: -1, sy: -1.6, lx: 0.5, ly: 0.6 });
      dome(c, 54, 37, 24, p, o);
      const hull = 'M13 57C13 44 24 35 38 34.500L68 34.500C84 34.500 95 44 95 57.500C95 71 84 80 68 80L38 80C24 80 13 70 13 57Z';
      cel(c, hull, H[0], H[1], H[2], { lw: 2, sx: -2.4, sy: -5, lx: 1.2, ly: 1.8, paint(q) {
        fill(q, 'M0 66C24 69 52 70 100 64V100H0Z', '#FFE9C8');
        fill(q, 'M0 74C26 77 56 78 100 72V100H0Z', '#E8C698');
        fill(q, R(26, 30, 7, 56, 0), BRASS[0]); fill(q, R(31.500, 30, 1.500, 56, 0), BRASS[1]);
        fill(q, 'M76 30C86 40 86 74 76 84H100V30Z', STEEL[0]);
        fill(q, 'M90 30C95 44 95 70 90 84H100V30Z', STEEL[1]);
      } });
      line(c, 'M26 35.500C24.500 48 24.500 68 26 79M33 35C31.500 48 31.500 68 33 79.500M76 35C81 48 81 68 76 79.500', 1.3);
      fill(c, 'M40 40C50 38.500 62 38.500 72 40C72 42 71 43 70 43C60 41.800 52 41.800 42 43C41 43 40 42 40 40Z', '#FFD9C4');
      lamp(c, 88, 54, 6.5);
      port(c, 42, 58, 4.8); port(c, 56, 58, 4.8); port(c, 70, 58, 4.8);
      rivets(c, [[29.500, 42], [29.500, 52], [29.500, 62], [29.500, 72]]);
      pc(c, 'M47 76C47 72 67 72 68 76L72 90C72 93 58 93 56 90Z', STEEL, { lw: 1.7, sx: -1, sy: -2, lx: 0.5, ly: 0.5 });
      gun(c, 68, 76.500, 22, 5.5);
    } },
    /* 기동형: 바늘처럼 긴 쾌속선 */
    current: { tail: -0.42, draw(c, p, o) {
      const H = ['#3EA6F2', '#1F6FC4', '#9ADAFF'];
      cel(c, 'M34 42L10 18H26L52 40Z', H[1], '#164F96', H[0], { lw: 1.700, sx: -1, sy: -1.800, lx: 0.6, ly: 0.7 });
      dome(c, 60, 45, 18.5, p, o);
      const hull = 'M6 56C14 45 30 43 46 43C66 43 86 48 98 58C86 67 66 71 46 71C30 71 14 67 6 56Z';
      cel(c, hull, H[0], H[1], H[2], { lw: 2, sx: -1.800, sy: -3.600, lx: 1, ly: 1.400, paint(q) {
        fill(q, 'M0 61C30 63 60 63 100 58V100H0Z', '#F4FAFF');
        fill(q, 'M0 66C30 68 60 68 100 62V100H0Z', '#C5DDF0');
        fill(q, 'M20 40L34 40L24 72L10 72Z', '#FFD23F'); fill(q, 'M28 40L33 40L23 72L18 72Z', '#E8953A');
        fill(q, 'M80 40L100 40V80H70Z', '#FF5A5F');
      } });
      line(c, 'M12 62C36 65 62 65 92 60', 1.300);
      cel(c, 'M36 62L18 86H34L54 66Z', H[1], '#164F96', H[0], { lw: 1.700, sx: -1, sy: -1.800, lx: 0.5, ly: 0.6 });
      cel(c, 'M40 56C50 52 62 52 70 56L60 60C54 59 48 59 42 60Z', DARK[0], DARK[1], null, { lw: 1.400, sx: -0.5, sy: -1 });
      port(c, 74, 56, 3.600);
      pc(c, R(4, 49, 12, 14, 3), DARK, { lw: 1.700, sx: -0.800, sy: -1.800, lx: 0.5, ly: 0.5 });
      gun(c, 76, 66, 16, 3.800);
    } },
    /* 장갑형: 등딱지를 얹은 납작한 탱크 */
    turtle: { tail: -0.36, draw(c, p, o) {
      const H = ['#5FA24C', '#3F7A36', '#9AD074'];
      for (const f of ['M22 72C14 76 8 84 8 90C14 92 26 90 32 80Z', 'M70 74C76 80 84 88 92 90C96 86 92 76 82 70Z']) pc(c, f, ['#7E97A8', '#556A7B', '#A6BCCB'], { lw: 1.800, sx: -1, sy: -2, lx: 0.5, ly: 0.6 });
      const shell = 'M10 66C10 42 28 28 50 28C66 28 80 40 84 62C84 70 80 76 72 78L24 78C16 78 10 74 10 66Z';
      cel(c, shell, H[0], H[1], H[2], { lw: 2.200, sx: -2.400, sy: -4.600, lx: 1.200, ly: 1.800, paint(q) {
        for (const h of [[30, 44], [52, 40], [20, 62], [42, 60], [64, 58], [76, 42]]) {
          const d = 'M' + (h[0] - 10) + ' ' + h[1] + 'L' + (h[0] - 5) + ' ' + (h[1] - 9) + 'H' + (h[0] + 5) + 'L' + (h[0] + 10) + ' ' + h[1] + 'L' + (h[0] + 5) + ' ' + (h[1] + 9) + 'H' + (h[0] - 5) + 'Z';
          cel(q, d, '#8FBE66', '#6C9B48', '#B7DC8E', { lw: 1.300, sx: -0.800, sy: -1.400, lx: 0.5, ly: 0.6 });
        }
      } });
      cel(c, 'M6 72C6 67 90 67 90 72C90 80 82 84 74 84H22C14 84 6 80 6 72Z', STEEL[0], STEEL[1], STEEL[2], { lw: 2, sx: -1.400, sy: -2.600, lx: 0.8, ly: 0.8 });
      rivets(c, [[16, 75], [30, 76], [44, 76], [58, 76], [72, 76], [84, 74]], 1.200);
      dome(c, 54, 33, 19, p, o);
      gun(c, 84, 66, 13, 6);
      lamp(c, 86, 75, 4);
    } },
    /* 화력형: 앞이 망치처럼 넓다 */
    hammer: { tail: -0.36, draw(c, p, o) {
      const H = ['#8497AE', '#5B6D85', '#BCCBDB'];
      cel(c, 'M14 44C12 32 12 18 20 8C24 20 30 32 38 42Z', H[1], '#3F4E63', H[0], { lw: 1.900, sx: -1.200, sy: -2, lx: 0.7, ly: 0.8 });
      cel(c, 'M18 44L6 28H20L30 40Z', H[1], '#3F4E63', H[0], { lw: 1.700, sx: -1, sy: -1.600, lx: 0.5, ly: 0.6 });
      cel(c, 'M18 68L6 84H20L32 72Z', H[1], '#3F4E63', H[0], { lw: 1.700, sx: -1, sy: -1.600, lx: 0.5, ly: 0.6 });
      dome(c, 44, 44, 19, p, o);
      const hull = 'M10 58C12 46 26 42 40 42L70 44V72L40 76C26 76 12 70 10 58Z';
      cel(c, hull, H[0], H[1], H[2], { lw: 2, sx: -2, sy: -4, lx: 1, ly: 1.600, paint(q) {
        fill(q, 'M0 66C24 68 50 68 80 64V100H0Z', '#EDF2F7');
        fill(q, 'M0 72C24 74 50 74 80 70V100H0Z', '#C6D2DE');
      } });
      /* 상어 입 */
      cel(c, 'M42 62C50 66 62 66 70 60V68C62 74 50 74 44 70Z', '#7C2233', '#5C1626', null, { lw: 1.500, sx: 0, sy: -1 });
      fill(c, 'M44 63.500L47 68L49.500 65L52.500 70L55.500 65.500L58.500 70L61.500 64.500L64 68.500L68.500 61.500C62 65.500 50 66 44 63.500Z', '#fff');
      /* 망치 머리 */
      const head = 'M64 40C64 30 72 26 80 26C90 26 94 30 94 36V80C94 86 90 90 80 90C72 90 64 86 64 76Z';
      cel(c, head, H[0], H[1], H[2], { lw: 2.200, sx: -2.400, sy: -4, lx: 1.200, ly: 1.800 });
      line(c, 'M70 30V86M86 28V88', 1.200);
      gun(c, 88, 36, 12, 6); gun(c, 88, 80, 12, 6);
      lamp(c, 79, 58, 6);
      port(c, 79, 38, 3.400); port(c, 79, 78, 3.400);
      rivets(c, [[67, 44], [67, 72], [91, 50], [91, 66]]);
    } },
    /* 전류형: 길쭉한 뱀장어와 코일 */
    bolt: { tail: -0.42, draw(c, p, o) {
      const H = ['#FFD63C', '#E09A1E', '#FFF08E'];
      for (const a of [[28, 20, 3.800], [42, 12, 4.400]]) {
        line(c, 'M' + a[0] + ' 42V' + a[1], 5.200); line(c, 'M' + a[0] + ' 42V' + a[1], 2.600, DARK[2]);
        for (let y = a[1] + 6; y < 40; y += 4) line(c, 'M' + (a[0] - 2.400) + ' ' + y + 'H' + (a[0] + 2.400), 1.500, BRASS[0]);
        fill(c, E(a[0], a[1] - 1, a[2] + 3), 'rgba(90,240,255,.32)');
        cel(c, E(a[0], a[1] - 1, a[2]), '#A8F7FF', '#35C8E8', '#FFFFFF', { lw: 1.500, sx: -0.8, sy: -1, lx: 0.7, ly: 0.7 });
      }
      cel(c, 'M18 48L4 40V70L18 64Z', DARK[0], DARK[1], DARK[2], { lw: 1.800, sx: -0.8, sy: -1.800, lx: 0.5, ly: 0.5 });
      dome(c, 66, 43, 18.5, p, o);
      const hull = 'M14 56C14 46 30 41 50 41C72 41 92 44 97 56C92 67 72 72 50 72C30 72 14 66 14 56Z';
      cel(c, hull, H[0], H[1], H[2], { lw: 2, sx: -2, sy: -3.800, lx: 1, ly: 1.500, paint(q) {
        fill(q, 'M0 62C30 65 60 65 100 60V100H0Z', DARK[0]);
        fill(q, 'M0 67C30 70 60 70 100 65V100H0Z', DARK[1]);
      } });
      cel(c, 'M36 44L24 58H33L27 70L46 53H36L44 44Z', DARK[0], DARK[1], null, { lw: 1.400, sx: -0.5, sy: -1 });
      line(c, 'M52 46V62M60 46V63', 1.200);
      port(c, 84, 55, 4.200);
      for (const x of [16, 24]) cel(c, E(x, 66, 1.900), '#FFD63C', '#E09A1E', null, { lw: 0.900, sx: -0.3, sy: -0.4 });
      gun(c, 82, 66, 13, 4.200);
    } },
    /* 어뢰형: 범고래 */
    orca: { tail: -0.42, draw(c, p, o) {
      const H = ['#343C52', '#20263A', '#5A6684'];
      cel(c, 'M28 40C26 26 24 14 14 6C30 8 44 22 46 40Z', H[0], H[1], H[2], { lw: 2, sx: -1.400, sy: -2, lx: 0.8, ly: 0.8 });
      cel(c, 'M18 56L3 42V50L8 58L3 66V74Z', H[0], H[1], H[2], { lw: 1.800, sx: -0.8, sy: -1.800, lx: 0.5, ly: 0.5 });
      dome(c, 62, 40, 20, p, o);
      const hull = 'M12 58C14 44 30 38 50 38C74 38 94 44 97 60C94 76 72 84 50 84C30 84 14 74 12 58Z';
      cel(c, hull, H[0], H[1], H[2], { lw: 2.200, sx: -2, sy: -3, lx: 1.200, ly: 1.600, paint(q) {
        fill(q, 'M0 66C20 62 30 66 44 66C58 66 72 62 100 58V100H0Z', '#F4F7FB');
        fill(q, 'M0 76C30 80 60 80 100 70V100H0Z', '#CAD4E0');
        fill(q, E(36, 52, 9, 5.500), '#F4F7FB');
      } });
      line(c, 'M74 66C84 66 92 64 96 60', 1.600);
      cel(c, 'M42 72C38 80 42 90 54 92C58 86 58 78 54 72Z', H[0], H[1], H[2], { lw: 1.800, sx: -0.800, sy: -1.600, lx: 0.5, ly: 0.5 });
      /* 어뢰관 */
      for (const y of [72, 80]) {
        pc(c, R(68, y - 3, 14, 6, 2), DARK, { lw: 1.400, sx: -0.5, sy: -1, lx: 0.3, ly: 0.3 });
        fill(c, E(82, y, 1.500, 2.400), '#FF5A5F');
      }
      port(c, 86, 54, 3.600);
    } },
    /* 지원형: 종 모양 */
    medi: { tail: -0.2, draw(c, p, o) {
      const H = ['#F6FBFB', '#BFD8DC', '#FFFFFF'];
      line(c, 'M50 18V6', 4.600); line(c, 'M50 18V6', 2.200, STEEL[0]);
      fill(c, E(50, 5, 5.500), 'rgba(90,255,190,.35)');
      cel(c, E(50, 5, 3), '#7DFFC8', '#2FC58D', '#fff', { lw: 1.300, sx: -0.5, sy: -0.7, lx: 0.5, ly: 0.5 });
      const bell = 'M22 72C22 44 28 16 50 16C72 16 78 44 78 72Z';
      for (const s of [-1, 1]) cel(c, 'M' + (50 + s * 24) + ' 52C' + (50 + s * 36) + ' 52 ' + (50 + s * 40) + ' 60 ' + (50 + s * 40) + ' 70C' + (50 + s * 32) + ' 72 ' + (50 + s * 24) + ' 70 ' + (50 + s * 22) + ' 66Z', '#2DBFA8', '#1E8E7C', '#7FE9D4', { lw: 1.800, sx: -1, sy: -1.800, lx: 0.5, ly: 0.5 });
      cel(c, bell, H[0], H[1], H[2], { lw: 2.200, sx: -2.400, sy: -3, lx: 1, ly: 1 });
      dome(c, 50, 56, 18.5, p, o);
      /* 띠와 십자 */
      cel(c, 'M18 68C18 64 82 64 82 68V78C82 84 18 84 18 78Z', '#2DBFA8', '#1E8E7C', '#7FE9D4', { lw: 2, sx: -1.400, sy: -2.600, lx: 0.7, ly: 0.7 });
      cel(c, 'M47 66H53V70H57V76H53V80H47V76H43V70H47Z', '#FFFFFF', '#CFE7E6', null, { lw: 1.300, sx: -0.4, sy: -0.8 });
      rivets(c, [[25, 72], [34, 74], [66, 74], [75, 72]]);
      for (const s of [-1, 1]) pc(c, R(50 + s * 18 - 5, 82, 10, 8, 2.400), STEEL, { lw: 1.600, sx: -0.6, sy: -1.200, lx: 0.4, ly: 0.4 });
    } },
    /* 은신형: 넓적한 가오리 */
    ray: { tail: -0.3, draw(c, p, o) {
      const H = ['#5B3F9E', '#3B2775', '#8D6CD0'];
      line(c, 'M16 62C10 68 6 76 2 86', 3.800); line(c, 'M16 62C10 68 6 76 2 86', 1.800, H[0]);
      cel(c, 'M60 52C46 34 26 20 8 16C14 28 16 42 20 54Z', H[1], '#2A1B58', H[0], { lw: 1.900, sx: -1.200, sy: -2, lx: 0.7, ly: 0.8 });
      dome(c, 62, 47, 17, p, o);
      const body = 'M14 60C24 50 44 46 66 46C80 46 92 50 97 58C90 66 78 70 66 70C44 70 24 68 14 60Z';
      cel(c, body, H[0], H[1], H[2], { lw: 2, sx: -1.600, sy: -3, lx: 1, ly: 1.200 });
      cel(c, 'M66 64C50 80 30 92 8 96C14 84 18 76 22 66Z', H[0], H[1], H[2], { lw: 2, sx: -1.400, sy: -2.600, lx: 0.8, ly: 1 });
      line(c, 'M56 70C44 78 32 84 20 88', 1.100, '#2A1B58');
      for (const q of [[30, 58], [40, 55], [50, 54]]) cel(c, E(q[0], q[1], 2), '#7DF9FF', '#2FBAD0', null, { lw: 0.900, sx: -0.3, sy: -0.5 });
      for (const q of [[28, 78], [36, 74], [44, 70]]) cel(c, E(q[0], q[1], 1.700), '#7DF9FF', '#2FBAD0', null, { lw: 0.800, sx: -0.3, sy: -0.4 });
      /* 눈처럼 보이는 앞 등 */
      cel(c, 'M84 50C88 52 92 55 95 58C91 59 87 58 84 56Z', '#7DF9FF', '#2FBAD0', null, { lw: 1.300, sx: -0.5, sy: -0.8 });
      gun(c, 78, 66, 12, 3.200);
    } },
    /* 채굴형: 앞에 큰 드릴 */
    drill: { tail: -0.36, draw(c, p, o) {
      const H = ['#F08A2C', '#BF5C1B', '#FFBE7A'];
      cel(c, 'M18 40L8 26H20L30 38Z', H[1], '#8E4212', H[0], { lw: 1.700, sx: -0.8, sy: -1.400, lx: 0.5, ly: 0.5 });
      dome(c, 40, 38, 19.5, p, o);
      /* 드릴 */
      const dr = 'M68 34L100 58L68 82Z';
      cel(c, dr, '#C9D3DF', '#8592A4', '#F0F5FA', { lw: 2.200, sx: -1.400, sy: -3.400, lx: 1, ly: 1.400, paint(q) {
        for (const x of [66, 73, 80, 87]) { q.lineWidth = 2.600; q.strokeStyle = '#6A7788'; q.stroke(A.P('M' + x + ' 30L' + (x + 14) + ' 86')); q.lineWidth = 0.900; q.strokeStyle = '#fff'; q.stroke(A.P('M' + (x - 1.600) + ' 30L' + (x + 12.400) + ' 86')); }
      } });
      const hull = 'M10 58C10 44 22 36 36 36H68C72 36 74 42 74 58C74 74 72 80 68 80H36C22 80 10 72 10 58Z';
      cel(c, hull, H[0], H[1], H[2], { lw: 2.200, sx: -2.400, sy: -4.400, lx: 1.200, ly: 1.800, paint(q) {
        fill(q, R(0, 64, 100, 8, 0), '#2B2F45');
        q.save(); q.beginPath(); q.rect(0, 64, 100, 8); q.clip(); stripes(q, 0, 64, 100, 8, 3, '#FFD23F'); q.restore();
      } });
      pc(c, R(64, 32, 10, 52, 3), STEEL, { lw: 2, sx: -1, sy: -2.400, lx: 0.6, ly: 0.8 });
      rivets(c, [[69, 38], [69, 50], [69, 66], [69, 78]]);
      port(c, 26, 52, 4); lamp(c, 56, 54, 5);
      /* 궤도 */
      cel(c, R(16, 78, 48, 12, 6), DARK[0], DARK[1], DARK[2], { lw: 2, sx: -1, sy: -2.200, lx: 0.5, ly: 0.5 });
      for (const x of [23, 33, 43, 53]) cel(c, E(x, 84, 3), STEEL[0], STEEL[1], null, { lw: 1.100, sx: -0.5, sy: -0.8 });
    } },
    /* 모함형: 큰 머리와 드론을 든 촉수 */
    octo: { tail: -0.2, draw(c, p, o) {
      const H = ['#D66BD8', '#A23FAE', '#F2A8F2'];
      const tent = [['M28 62C18 66 10 72 6 84C4 90 12 94 16 88C20 80 28 76 36 72Z', 14, 86], ['M40 68C36 76 34 84 34 92C34 97 44 98 44 92C44 84 48 78 52 72Z', 40, 94], ['M60 68C64 76 66 84 66 92C66 97 76 96 76 92C76 84 72 76 68 70Z', 70, 94], ['M72 62C82 66 90 72 94 84C96 90 88 94 84 88C80 80 72 76 64 72Z', 88, 86]];
      for (const t of tent) cel(c, t[0], H[1], '#7E2C8A', H[0], { lw: 1.900, sx: -1, sy: -1.800, lx: 0.5, ly: 0.5 });
      /* 작은 드론 */
      for (const q of [[9, 72], [91, 72]]) {
        pc(c, R(q[0] - 7, q[1] - 3.500, 14, 7, 3), STEEL, { lw: 1.500, sx: -0.5, sy: -1, lx: 0.4, ly: 0.4 });
        fill(c, E(q[0], q[1], 1.700), '#FF5A5F');
      }
      const head = 'M16 44C16 18 32 2 50 2C68 2 84 18 84 44C84 62 72 74 50 74C28 74 16 62 16 44Z';
      cel(c, head, H[0], H[1], H[2], { lw: 2.200, sx: -2.800, sy: -5, lx: 1.400, ly: 2 });
      for (const q of [[24, 30, 2.400], [33, 14, 1.800], [76, 30, 2.400], [67, 14, 1.800], [21, 46, 1.800], [79, 46, 1.800]]) fill(c, E(q[0], q[1], q[2]), H[1]);
      dome(c, 50, 56, 20, p, o);
      cel(c, 'M22 58C22 54 78 54 78 58C78 66 66 72 50 72C34 72 22 66 22 58Z', STEEL[0], STEEL[1], STEEL[2], { lw: 2, sx: -1.400, sy: -2.600, lx: 0.7, ly: 0.7 });
      rivets(c, [[30, 62], [41, 65], [59, 65], [70, 62]]);
      gun(c, 72, 56, 13, 4.200);
    } },
  };

  function drawSub(c, id, pilot, o) { (SUB[id] || SUB.coral).draw(c, pilot, o || {}); }
  function subCanvas(id, pilot, px, o) {
    o = o || {};
    return bake(px, c => drawSub(c, id, pilot, o), { ink: o.ink === undefined ? 1 : o.ink, white: o.white === undefined ? 1.4 : o.white });
  }
  A.drawSub = drawSub;
  A.subCanvas = subCanvas;
  A.makers.sub = (id, px, pilot) => subCanvas(id, pilot || 'coral', px);
  A.subTail = id => (SUB[id] || SUB.coral).tail;
  A.drawProp = prop;
  /* 전투용: 흰 테두리 없이 잉크선만 두른다 */
  A.subSprite = (subId, pilotId, px) => {
    const img = subCanvas(subId, pilotId, px, { white: 0, ink: 1.4 });
    return { img, white: A.whiteOf(img), px, tail: A.subTail(subId) };
  };
})(window.Art);
