/* 격납고, 챕터 풍경 15종, 타이틀, 로고. 격납고 창밖은 고른 챕터의 바다이고 정화율이 오르면 맑아진다. */
(function (A) {
  'use strict';
  const { INK, TAU, E, R, mk, fill, line, cel, bake } = A;
  const WOOD = ['#B9743A', '#8A5026', '#E0A266'], STEEL = ['#8A97B2', '#5A6682', '#C2CEE0'], BRASS = ['#FFC93C', '#E08F1E', '#FFF0A0'];
  const pc = (c, d, p, o) => cel(c, d, p[0], p[1], p[2], Object.assign({ lw: 1.5, sx: -1.2, sy: -2, lx: 0.8, ly: 1 }, o || {}));

  /* ===== 챕터 풍경 ===== */
  function bands(c, a, b, d) {
    fill(c, 'M0 0H100V100H0Z', a);
    fill(c, 'M0 36C25 32 70 40 100 35V100H0Z', b);
    fill(c, 'M0 68C30 64 70 72 100 66V100H0Z', d);
  }
  function rays(c, alpha) {
    c.save(); c.globalAlpha = alpha === undefined ? 0.14 : alpha; c.fillStyle = '#fff';
    for (const r of [[6, 16, -8, 14], [34, 16, 22, 44], [66, 10, 66, 88]]) { c.beginPath(); c.moveTo(r[0], 0); c.lineTo(r[0] + r[1], 0); c.lineTo(r[3], 100); c.lineTo(r[2], 100); c.closePath(); c.fill(); }
    c.restore();
  }
  const bed = (c, color, d) => fill(c, d || 'M0 84C18 78 34 86 52 82C70 78 84 86 100 80V100H0Z', color);
  function drum(c, x, y, s, p, tilt) {
    c.save(); c.translate(x, y); c.rotate(tilt || 0); c.scale(s, s);
    pc(c, 'M-9 -13C-9 -17 9 -17 9 -13V13C9 17 -9 17 -9 13Z', p, { sy: -1.5, sx: -2.4, lx: 1.4, ly: 0 });
    fill(c, E(0, -13, 9, 3.2), p[2]); line(c, E(0, -13, 9, 3.2), 1.3);
    line(c, 'M-9 -3C-5 -1 5 -1 9 -3M-9 6C-5 8 5 8 9 6', 1.1);
    c.restore();
  }
  function kelp(c, x, top, color, dark) {
    const d = 'M' + x + ' 100C' + (x - 6) + ' 82 ' + (x + 6) + ' ' + (top + 28) + ' ' + x + ' ' + top;
    line(c, d, 4.2, dark); line(c, d, 2.2, color);
    for (let y = top + 8; y < 94; y += 13) {
      const s = (Math.round(y) % 2) ? 1 : -1;
      c.fillStyle = color; c.beginPath(); c.ellipse(x + s * 5, y, 5.4, 2.4, s * 0.5, 0, TAU); c.fill(); c.lineWidth = 0.9; c.strokeStyle = dark; c.stroke();
    }
  }
  function fishes(c, pts, color) {
    c.fillStyle = color;
    for (const p of pts) { c.beginPath(); c.ellipse(p[0], p[1], 2.6, 1.2, 0, 0, TAU); c.moveTo(p[0] - 2, p[1]); c.lineTo(p[0] - 4.2, p[1] - 1.4); c.lineTo(p[0] - 4.2, p[1] + 1.4); c.closePath(); c.fill(); }
  }
  function bolty(c, x, y, s, a) {
    c.save(); c.translate(x, y); c.scale(s, s); c.rotate(a || 0);
    cel(c, 'M2 -14L-7 2H-1L-4 14L8 -3H2L6 -14Z', '#FFEF5E', '#F2B92C', null, { lw: 0.9, sx: -0.5, sy: -0.8 });
    c.restore();
  }
  const CH_ART = [
    /* 1 오염된 항구 */ c => {
      bands(c, '#35CDBB', '#1FA5AB', '#16819A'); rays(c);
      for (const x of [10, 28, 46]) fill(c, R(x, 0, 5, 58 + x * 0.1, 0), '#0F6A78');
      fill(c, 'M0 0H62V9C50 16 12 16 0 11Z', '#0B4E60');
      fill(c, 'M58 0H100V8C92 12 88 7 80 11C72 15 66 8 58 6Z', '#6B3A9E');
      for (const q of [[72, 16, 3], [84, 22, 2], [66, 24, 1.600]]) fill(c, E(q[0], q[1], q[2]), '#6B3A9E');
      bed(c, '#E3C98A'); fill(c, 'M0 92C30 86 70 94 100 88V100H0Z', '#C9A968');
      drum(c, 70, 76, 0.85, ['#FFB02E', '#D97F16', '#FFD98A'], 0.3);
      line(c, E(24, 86, 7, 5), 4.400); line(c, E(24, 86, 7, 5), 2, '#39445E');
    },
    /* 2 기름띠 연안 */ c => {
      bands(c, '#46BEE0', '#2699C4', '#1C78A8'); rays(c);
      fill(c, 'M0 0H100V12C88 20 80 12 68 18C56 24 48 14 36 20C24 26 12 14 0 18Z', '#3B2570');
      fill(c, 'M0 0H100V6C84 10 70 5 52 9C36 12 16 5 0 9Z', '#5A3A9E');
      for (const q of [[22, 30, 2], [58, 28, 2.400], [40, 36, 1.400]]) fill(c, E(q[0], q[1], q[2]), '#3B2570');
      fishes(c, [[62, 50], [72, 46], [78, 54], [66, 58], [84, 48]], '#EAFBFF');
      bed(c, '#E8D49A'); drum(c, 28, 78, 0.8, ['#7A869E', '#55607A', '#AEB9CC'], -0.2);
    },
    /* 3 폐그물 해초숲 */ c => {
      bands(c, '#34B69A', '#208F85', '#177075'); rays(c, 0.1);
      for (const k of [[12, 18], [32, 34], [84, 24]]) kelp(c, k[0], k[1], '#6FCB52', '#1D6B3F');
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 0.8;
      for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(38 + i * 7, 10 + i * 2); c.lineTo(52 + i * 6, 70); c.moveTo(38, 16 + i * 10); c.lineTo(84, 20 + i * 9); c.stroke(); }
      bed(c, '#135A5C'); kelp(c, 62, 46, '#8ADB63', '#1D6B3F');
    },
    /* 4 난파선 묘지 */ c => {
      bands(c, '#3385BE', '#24659C', '#1A4A80'); rays(c, 0.1);
      fill(c, 'M72 0L76 0L60 52H56Z', '#143B63');
      c.save(); c.translate(50, 66); c.rotate(-0.22);
      pc(c, 'M-44 -14H44L34 18C20 24 -24 24 -36 18Z', ['#3D4A70', '#2A3454', '#5D6B94'], { sy: -4 });
      fill(c, R(-44, -14, 88, 5, 1), '#B8483F');
      for (const x of [-26, -10, 6, 22]) { fill(c, E(x, 2, 3.400), '#7DE5F2'); line(c, E(x, 2, 3.400), 1.2); }
      c.restore();
      bed(c, '#10325A');
    },
    /* 5 방전 산호초 */ c => {
      bands(c, '#5A5FE0', '#4346BC', '#32349A'); rays(c, 0.1);
      for (const b of [[20, 92, 26, '#FF7AB6', '#A8347C'], [52, 94, 32, '#FF9A5E', '#B84E2A'], [82, 92, 24, '#FFD23F', '#B87F12']]) {
        const d = 'M' + b[0] + ' ' + b[1] + 'V' + (b[1] - b[2]) + 'M' + b[0] + ' ' + (b[1] - b[2] * 0.4) + 'L' + (b[0] - 10) + ' ' + (b[1] - b[2] * 0.9) + 'M' + b[0] + ' ' + (b[1] - b[2] * 0.55) + 'L' + (b[0] + 10) + ' ' + (b[1] - b[2] * 1.05);
        line(c, d, 6, INK); line(c, d, 3.600, b[3]);
      }
      bolty(c, 36, 34, 1, 0.2); bolty(c, 70, 26, 0.8, -0.2);
      bed(c, '#23246E');
    },
    /* 6 심해 채굴장 */ c => {
      bands(c, '#2C4A80', '#203664', '#17284E');
      fill(c, 'M0 20L22 44L14 100H0Z', '#101D3C'); fill(c, 'M100 30L82 50L90 100H100Z', '#101D3C');
      fill(c, E(50, 30, 24), 'rgba(255,233,120,.12)');
      pc(c, 'M38 88L44 30H56L62 88Z', ['#5A6682', '#3C4560', '#8A97B2'], { sy: -1, sx: -2.400, lx: 1.400, ly: 0 });
      line(c, 'M41 76L59 64M42 60L58 48M43 46L57 36', 1.800);
      pc(c, R(40, 22, 20, 10, 2), BRASS, { sy: -2 }); fill(c, E(50, 36, 3), '#FFF3A0');
      bed(c, '#0C1630'); fill(c, 'M16 92L24 80L34 92Z', '#5A4634'); fill(c, 'M66 94L74 80L86 94Z', '#6E5640');
    },
    /* 7 먹물 해구 */ c => {
      bands(c, '#35295C', '#281E48', '#1C1436');
      for (const q of [[20, 26, 16], [36, 18, 12], [78, 36, 18], [62, 44, 11], [28, 66, 13]]) fill(c, E(q[0], q[1], q[2]), '#0F0A1E');
      cel(c, 'M50 28C62 28 66 40 64 50L72 72L60 62L58 78L50 66L42 78L40 62L28 72L36 50C34 40 38 28 50 28Z', '#C65AA8', '#8F3A7C', '#EE9AD0', { lw: 1.500, sx: -1.400, sy: -2.400, lx: 0.8, ly: 1 });
      for (const s of [-1, 1]) { fill(c, E(50 + s * 5.400, 44, 3, 3.600), '#fff'); fill(c, E(50 + s * 5.400, 45, 1.600), INK); }
      bed(c, '#0C0818');
    },
    /* 8 독성 열수 분출구 */ c => {
      bands(c, '#26506C', '#1C3C54', '#142C40');
      for (const v of [[24, 60, 10], [60, 50, 14], [84, 66, 8]]) {
        c.fillStyle = 'rgba(120,255,110,.3)'; c.beginPath(); c.moveTo(v[0] - v[2] * 0.5, v[1]); c.quadraticCurveTo(v[0] - v[2] * 2, v[1] * 0.4, v[0] - v[2], 0); c.lineTo(v[0] + v[2], 0); c.quadraticCurveTo(v[0] + v[2] * 2, v[1] * 0.4, v[0] + v[2] * 0.5, v[1]); c.closePath(); c.fill();
        pc(c, 'M' + (v[0] - v[2] * 0.5) + ' ' + v[1] + 'L' + (v[0] - v[2]) + ' 94H' + (v[0] + v[2]) + 'L' + (v[0] + v[2] * 0.5) + ' ' + v[1] + 'Z', ['#4A3A40', '#30262C', '#6E5862'], { sy: -1, sx: -2, lx: 1, ly: 0 });
        fill(c, E(v[0], v[1], v[2] * 0.5, 2), '#8CFF6E');
      }
      bed(c, '#0E1E2C');
    },
    /* 9 방사능 폐기장 */ c => {
      bands(c, '#3A5238', '#2A3E2C', '#1E2E20');
      fill(c, E(50, 72, 40, 18), 'rgba(160,255,80,.2)');
      bed(c, '#141E16');
      const Y = ['#FFD23F', '#D99A1E', '#FFEE9A'];
      drum(c, 26, 72, 1.2, Y, -0.1); drum(c, 54, 76, 1.200, Y, 0.16); drum(c, 80, 68, 1, Y, 0.5);
      for (const q of [[26, 72], [54, 76]]) { fill(c, E(q[0], q[1], 3.400), INK); fill(c, E(q[0], q[1], 1.200), Y[0]); }
    },
    /* 10 컨테이너 협곡 */ c => {
      bands(c, '#254A7E', '#1C3764', '#14284C');
      fill(c, 'M0 0H18L26 100H0Z', '#0E1C38'); fill(c, 'M100 0H82L74 100H100Z', '#0E1C38');
      const box = (x, y, w, h, p, a) => { c.save(); c.translate(x, y); c.rotate(a); pc(c, R(-w / 2, -h / 2, w, h, 1), p, { sy: -2 }); line(c, 'M' + (-w / 4) + ' ' + (-h / 2) + 'V' + h / 2 + 'M0 ' + (-h / 2) + 'V' + h / 2 + 'M' + w / 4 + ' ' + (-h / 2) + 'V' + h / 2, 0.8); c.restore(); };
      box(50, 82, 40, 16, ['#E8553F', '#B8352A', '#FF9A82'], 0.02);
      box(42, 64, 34, 15, ['#2F80E8', '#1F5FB8', '#7EB8FF'], -0.1);
      box(62, 46, 30, 14, ['#FFB02E', '#D97F16', '#FFD98A'], 0.26);
      box(40, 22, 26, 13, ['#2DBFA8', '#1E8E7C', '#7FE9D4'], -0.5);
    },
    /* 11 고래 무덤 */ c => {
      bands(c, '#20406C', '#182F56', '#112240');
      bed(c, '#0C1830');
      const B = ['#F2EEDC', '#C9C2A4', '#FFFFFF'];
      for (let i = 0; i < 5; i++) {
        const x = 26 + i * 12, h = 40 - Math.abs(i - 2) * 6;
        cel(c, 'M' + x + ' 88C' + (x - 12) + ' ' + (88 - h * 0.6) + ' ' + (x - 6) + ' ' + (88 - h) + ' ' + (x + 6) + ' ' + (88 - h) + 'C' + (x - 1) + ' ' + (88 - h * 0.8) + ' ' + (x - 4) + ' ' + (88 - h * 0.5) + ' ' + (x + 3) + ' 88Z', B[0], B[1], null, { lw: 1.300, sx: -0.8, sy: -1 });
      }
      cel(c, 'M4 88C4 70 18 62 28 68C30 76 26 84 22 90Z', B[0], B[1], B[2], { lw: 1.500, sx: -1, sy: -1.600, lx: 0.6, ly: 0.6 });
      fill(c, E(17, 76, 3.400), INK);
    },
    /* 12 얼어붙은 심층수 */ c => {
      bands(c, '#82D6F6', '#4BA6E2', '#2F7CC0'); rays(c, 0.2);
      const I = ['#D8F6FF', '#8AD2F0', '#FFFFFF'];
      for (const k of [[18, 94, 10, 46], [40, 94, 12, 62], [66, 94, 11, 52], [86, 94, 9, 36]]) {
        cel(c, 'M' + (k[0] - k[2]) + ' ' + k[1] + 'L' + (k[0] - k[2] * 0.6) + ' ' + (k[1] - k[3] * 0.8) + 'L' + k[0] + ' ' + (k[1] - k[3]) + 'L' + (k[0] + k[2] * 0.7) + ' ' + (k[1] - k[3] * 0.7) + 'L' + (k[0] + k[2]) + ' ' + k[1] + 'Z', I[0], I[1], I[2], { lw: 1.400, sx: -2, sy: -1, lx: 1, ly: 1 });
      }
      bed(c, '#E4F6FF', 'M0 90C20 86 40 92 60 88C78 86 90 90 100 88V100H0Z');
    },
    /* 13 수압 붕괴대 */ c => {
      bands(c, '#57294C', '#40203A', '#2E162A');
      fill(c, 'M0 0H30L22 20L34 38L18 60L28 100H0Z', '#170C18'); fill(c, 'M100 0H72L80 24L66 44L82 66L72 100H100Z', '#170C18');
      line(c, 'M32 10L24 22L36 38L20 60M68 6L80 24L66 44L84 66', 1.600, '#FF5A3C');
      c.save(); c.translate(50, 56); c.rotate(0.3);
      pc(c, 'M-18 -8C-10 -14 12 -12 18 -6L14 2L19 8C10 14 -10 14 -18 8L-13 0Z', ['#7A88A6', '#505C78', '#AEBBD2'], { sy: -2 });
      c.restore();
    },
    /* 14 검은 해류 */ c => {
      bands(c, '#16284A', '#101E38', '#0B1528');
      for (let i = 0; i < 5; i++) {
        const r = 14 + i * 12; c.strokeStyle = 'rgba(70,225,235,' + (0.5 - i * 0.07).toFixed(2) + ')'; c.lineWidth = 2.200;
        c.beginPath(); c.arc(50, 52, r, 0.4 + i, 3.6 + i); c.stroke();
      }
      fill(c, E(50, 52, 8), '#05070F'); line(c, E(50, 52, 8), 1.600, '#46E1EB');
    },
    /* 15 검은 해구 심층 */ c => {
      bands(c, '#0F1226', '#0B0D1C', '#070811');
      cel(c, 'M6 52C24 22 76 22 94 52C76 82 24 82 6 52Z', '#F2E9C8', '#C9B98A', null, { lw: 1.800, sx: -2, sy: -3 });
      cel(c, E(50, 52, 20), '#FF5A3C', '#C4281E', '#FFB02E', { lw: 1.600, sx: -2, sy: -3, lx: 1.400, ly: 1.800 });
      fill(c, E(50, 52, 5, 17), INK); fill(c, E(44, 44, 3.400), '#fff');
    },
  ];
  const chCache = {};
  function chapterCanvas(no, px) {
    const key = no + ':' + px;
    if (!chCache[key]) chCache[key] = bake(px, c => { c.save(); c.beginPath(); c.rect(0, 0, 100, 100); c.clip(); (CH_ART[no - 1] || CH_ART[0])(c); c.restore(); }, { pad: 0 });
    return chCache[key];
  }
  A.chapterCanvas = chapterCanvas;
  A.makers.chapter = (no, px) => chapterCanvas(Number(no), px);

  /* ===== 격납고 ===== */
  function crate(c) {
    pc(c, 'M6 34L64 34L64 94L6 94Z', WOOD, { sy: -4, lw: 2.400 });
    pc(c, 'M6 34L26 14H84L64 34Z', ['#E0A266', '#B9743A', '#F4C894'], { lw: 2.400, sy: -1, ly: 1 });
    pc(c, 'M64 34L84 14V74L64 94Z', ['#8A5026', '#6B3C1B', '#A8682F'], { lw: 2.400, sx: -1, sy: 0 });
    line(c, 'M6 34L64 94M64 34L6 94', 1.800, '#6B3C1B');
    line(c, 'M6 54H64M6 74H64', 1.400, '#6B3C1B');
    for (const q of [[6, 34], [64, 34], [6, 94], [64, 94]]) A.bolt(c, q[0], q[1], 3, BRASS[0]);
  }
  function barrel(c) {
    pc(c, 'M14 22C14 12 86 12 86 22V88C86 98 14 98 14 88Z', ['#FFB02E', '#D97F16', '#FFD98A'], { lw: 2.400, sx: -7, sy: -2, lx: 4, ly: 0 });
    fill(c, E(50, 22, 36, 10), '#FFD98A'); line(c, E(50, 22, 36, 10), 2.400); fill(c, E(50, 22, 26, 6.500), '#3C4560');
    c.save(); c.clip(A.P('M14 22C14 12 86 12 86 22V88C86 98 14 98 14 88Z'));
    fill(c, 'M14 48H86V72H14Z', INK);
    c.fillStyle = '#FFD23F';
    for (let x = 6; x < 96; x += 16) { c.beginPath(); c.moveTo(x, 72); c.lineTo(x + 8, 72); c.lineTo(x + 18, 48); c.lineTo(x + 10, 48); c.closePath(); c.fill(); }
    c.restore();
    line(c, 'M14 48C24 52 76 52 86 48M14 72C24 76 76 76 86 72', 2);
  }
  function hazard(c, x, y, w, h) {
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    c.fillStyle = '#FFD23F'; c.fillRect(x, y, w, h);
    c.fillStyle = INK;
    for (let i = x - h; i < x + w + h; i += h * 2) { c.beginPath(); c.moveTo(i, y + h); c.lineTo(i + h, y + h); c.lineTo(i + h * 2, y); c.lineTo(i + h, y); c.closePath(); c.fill(); }
    c.restore();
  }
  let wall = null, front = null, wallKey = '';
  const WALL = { base: '#1B6A9C', dark: '#134E78', deep: '#0E3A5C', hi: '#3A97C8' };
  /* o: cx, wy, wr, py, padW 는 모두 기기 픽셀 */
  function buildWall(W, H, o) {
    const key = [W, H, o.cx | 0, o.wy | 0, o.wr | 0, o.py | 0, o.padW | 0].join();
    if (key === wallKey) return;
    wallKey = key;
    wall = mk(W, H);
    let c = wall.getContext('2d');
    const u = W / 100;
    const floorY = Math.round(o.py - o.padW * 0.2);
    c.lineJoin = 'round'; c.lineCap = 'round';
    c.fillStyle = WALL.base; c.fillRect(0, 0, W, floorY);
    /* 철판 */
    const pw = W / 4, ph = pw * 0.8;
    for (let r = 0; r * ph < floorY; r++) {
      for (let k = 0; k < 5; k++) {
        const x = k * pw - (r % 2 ? pw / 2 : 0), y = r * ph;
        c.fillStyle = (k + r) % 3 === 0 ? '#1D73A8' : (k + r) % 3 === 1 ? WALL.base : '#185F8E';
        c.fillRect(x, y, pw, ph);
        c.fillStyle = WALL.hi; c.fillRect(x, y, pw, u * 0.4);
        c.fillStyle = WALL.deep; c.fillRect(x, y + ph - u * 0.5, pw, u * 0.5); c.fillRect(x + pw - u * 0.5, y, u * 0.5, ph);
        for (const q of [[2.4, 2.4], [pw / u - 2.4, 2.4], [2.4, ph / u - 2.4], [pw / u - 2.4, ph / u - 2.4]]) {
          c.fillStyle = WALL.deep; c.beginPath(); c.arc(x + q[0] * u, y + q[1] * u, u * 0.75, 0, TAU); c.fill();
          c.fillStyle = WALL.hi; c.beginPath(); c.arc(x + q[0] * u - u * 0.15, y + q[1] * u - u * 0.15, u * 0.34, 0, TAU); c.fill();
        }
      }
    }
    /* 창 주변 빛: 조명만 부드럽게 둔다 */
    const g = c.createRadialGradient(o.cx, o.wy, o.wr * 0.9, o.cx, o.wy, o.wr * 1.9);
    g.addColorStop(0, 'rgba(120,235,255,.55)'); g.addColorStop(1, 'rgba(120,235,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, W, floorY);
    /* 양옆 기둥과 배관 */
    for (const s of [0, 1]) {
      const X = x => (s ? W - x : x);
      const pipeX = X(u * 11), pr = u * 1.9;
      c.fillStyle = INK; c.fillRect(pipeX - pr - u * 0.5, 0, pr * 2 + u, floorY);
      c.fillStyle = '#E8953A'; c.fillRect(pipeX - pr, 0, pr * 2, floorY);
      c.fillStyle = '#FFC98A'; c.fillRect(pipeX - pr, 0, pr * 0.6, floorY);
      c.fillStyle = '#B8631C'; c.fillRect(pipeX + pr * 0.4, 0, pr * 0.6, floorY);
      for (let y = u * 18; y < floorY - u * 8; y += u * 26) {
        c.fillStyle = INK; c.fillRect(pipeX - pr * 1.6, y - u * 1.6, pr * 3.2, u * 3.2);
        c.fillStyle = '#8A97B2'; c.fillRect(pipeX - pr * 1.6 + u * 0.4, y - u * 1.2, pr * 3.2 - u * 0.8, u * 2.4);
      }
      const cw = u * 7, cx = s ? W - cw : 0;
      c.fillStyle = INK; c.fillRect(s ? cx - u * 0.6 : cw, 0, u * 0.6, floorY);
      c.fillStyle = '#2B3355'; c.fillRect(cx, 0, cw, floorY);
      c.fillStyle = '#454F7C'; c.fillRect(s ? cx : cx + cw - u * 1.1, 0, u * 1.1, floorY);
      hazard(c, cx, floorY - u * 13, cw, u * 3);
      for (let y = u * 8; y < floorY - u * 14; y += u * 14) {
        c.fillStyle = '#16192B'; c.beginPath(); c.arc(cx + cw / 2, y, u * 1.1, 0, TAU); c.fill();
        c.fillStyle = '#7C879A'; c.beginPath(); c.arc(cx + cw / 2 - u * 0.2, y - u * 0.2, u * 0.45, 0, TAU); c.fill();
      }
    }
    /* 천장 */
    const ceil = Math.min(u * 15, H * 0.1);
    c.fillStyle = WALL.deep; c.fillRect(0, 0, W, ceil);
    c.fillStyle = INK; c.fillRect(0, ceil, W, u * 0.7);
    hazard(c, 0, ceil + u * 0.7, W, u * 2);
    c.fillStyle = INK; c.fillRect(0, ceil + u * 2.7, W, u * 0.6);
    /* 창틀 */
    const R0 = o.wr, ring = R0 * 0.14;
    c.fillStyle = 'rgba(8,24,50,.42)'; c.beginPath(); c.arc(o.cx + u * 0.9, o.wy + u * 1.5, R0 + ring + u, 0, TAU); c.fill();
    c.fillStyle = INK; c.beginPath(); c.arc(o.cx, o.wy, R0 + ring + u * 0.9, 0, TAU); c.fill();
    c.fillStyle = BRASS[1]; c.beginPath(); c.arc(o.cx, o.wy, R0 + ring, 0, TAU); c.fill();
    c.save(); c.beginPath(); c.arc(o.cx, o.wy, R0 + ring, 0, TAU); c.clip();
    c.fillStyle = BRASS[0]; c.beginPath(); c.arc(o.cx - u * 0.7, o.wy - u * 1, R0 + ring, 0, TAU); c.fill();
    c.fillStyle = BRASS[2]; c.beginPath(); c.arc(o.cx, o.wy, R0 + ring, 0, TAU); c.arc(o.cx + u * 0.6, o.wy + u * 0.8, R0 + ring, 0, TAU, true); c.fill();
    c.restore();
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU + 0.26, x = o.cx + Math.cos(a) * (R0 + ring * 0.5), y = o.wy + Math.sin(a) * (R0 + ring * 0.5), r = ring * 0.22;
      c.fillStyle = INK; c.beginPath(); c.arc(x, y, r * 1.35, 0, TAU); c.fill();
      c.fillStyle = '#E8EEF6'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
      c.fillStyle = '#7C879A'; c.beginPath(); c.arc(x + r * 0.2, y + r * 0.25, r * 0.72, 0, TAU); c.fill();
      c.fillStyle = '#E8EEF6'; c.beginPath(); c.arc(x - r * 0.1, y - r * 0.1, r * 0.66, 0, TAU); c.fill();
    }
    /* 여기부터는 창 앞에 놓이는 층이다 */
    front = mk(W, H);
    c = front.getContext('2d');
    c.lineJoin = 'round'; c.lineCap = 'round';
    /* 바닥 */
    c.fillStyle = '#2B3B66'; c.fillRect(0, floorY, W, H - floorY);
    const vy = floorY - (H - floorY) * 0.7;
    c.save(); c.beginPath(); c.rect(0, floorY, W, H - floorY); c.clip();
    for (let i = -8; i < 8; i += 2) {
      const a = o.cx + i * u * 9, b = o.cx + (i + 1) * u * 9, k = (H - vy) / (floorY - vy);
      c.fillStyle = '#34457A'; c.beginPath(); c.moveTo(a, floorY); c.lineTo(b, floorY); c.lineTo(o.cx + (b - o.cx) * k, H); c.lineTo(o.cx + (a - o.cx) * k, H); c.closePath(); c.fill();
    }
    c.fillStyle = 'rgba(15,20,45,.45)';
    for (let y = floorY + u * 7, s = u * 5; y < H; y += s, s *= 1.5) c.fillRect(0, y, W, u * 0.6);
    c.restore();
    c.fillStyle = INK; c.fillRect(0, floorY - u * 0.6, W, u * 0.6);
    hazard(c, 0, floorY, W, u * 2.4);
    c.fillStyle = INK; c.fillRect(0, floorY + u * 2.4, W, u * 0.6);
    /* 받침대 */
    const rx = o.padW / 2, ry = rx * 0.3, th = rx * 0.16, px = o.cx, py = o.py;
    const hex = a => [px + Math.cos(a) * rx, py + Math.sin(a) * ry];
    const pts = []; for (let i = 0; i < 6; i++) pts.push(hex(i / 6 * TAU));
    c.lineWidth = u * 0.8; c.strokeStyle = INK;
    const face = (i, col) => { const a = pts[i], b = pts[(i + 1) % 6]; c.fillStyle = col; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(b[0], b[1] + th); c.lineTo(a[0], a[1] + th); c.closePath(); c.fill(); c.stroke(); };
    c.fillStyle = 'rgba(8,10,30,.5)'; c.beginPath(); c.ellipse(px, py + th + u * 1.6, rx * 1.08, ry * 1.08, 0, 0, TAU); c.fill();
    face(0, '#232C50'); face(1, '#2B3662'); face(2, '#3A4A7E');
    c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath();
    c.fillStyle = '#7C95C4'; c.fill(); c.stroke();
    c.save(); c.clip();
    c.fillStyle = '#A8BEE2'; c.fillRect(px - rx, py - ry, rx * 2, ry * 0.45);
    c.restore();
    const inner = []; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; inner.push([px + Math.cos(a) * rx * 0.76, py + Math.sin(a) * ry * 0.76]); }
    c.beginPath(); inner.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath();
    c.fillStyle = '#3F5288'; c.fill(); c.lineWidth = u * 0.6; c.stroke();
    /* 앞쪽 소품 */
    const sprite = (draw, x, y, s) => { c.save(); c.setTransform(s, 0, 0, s, x, y); draw(c); c.restore(); };
    const sc = Math.min(o.padW * 0.0034, W * 0.0028);
    sprite(crate, Math.max(-u * 2, px - rx * 1.32 - sc * 40), py - sc * 44, sc);
    sprite(barrel, Math.min(W - sc * 84, px + rx * 0.98), py - sc * 34, sc * 0.84);
  }

  const BUBBLES = [];
  for (let i = 0; i < 16; i++) BUBBLES.push({ x: Math.random(), y: Math.random(), r: 0.012 + Math.random() * 0.03, s: 0.03 + Math.random() * 0.06 });
  /* 창밖: 고른 챕터 풍경 위에 기름 안개, 돌아온 물고기, 공기방울을 얹는다 */
  function drawSeaWindow(c, cx, cy, Rw, no, purity, t) {
    c.save();
    c.beginPath(); c.arc(cx, cy, Rw, 0, TAU); c.clip();
    c.drawImage(chapterCanvas(no, 512), cx - Rw, cy - Rw, Rw * 2, Rw * 2);
    if (purity < 1) {
      c.fillStyle = 'rgba(70,30,110,' + (0.32 * (1 - purity)).toFixed(3) + ')';
      c.fillRect(cx - Rw, cy - Rw, Rw * 2, Rw * 2);
      c.fillStyle = 'rgba(122,63,160,' + (0.3 * (1 - purity)).toFixed(3) + ')';
      for (let i = 0; i < 3; i++) {
        const x = cx + Math.sin(t * 0.17 + i * 2.1) * Rw * 0.55, y = cy + Math.cos(t * 0.13 + i * 1.7) * Rw * 0.5;
        c.beginPath(); c.ellipse(x, y, Rw * (0.5 + i * 0.1), Rw * 0.22, i, 0, TAU); c.fill();
      }
    }
    const fish = Math.floor(purity * 6);
    for (let i = 0; i < fish; i++) {
      const w = (t * (0.05 + i * 0.012) + i * 0.37) % 1, x = cx - Rw * 1.1 + w * Rw * 2.2, y = cy - Rw * 0.5 + i * Rw * 0.2 + Math.sin(t + i) * Rw * 0.03, s = Rw * 0.06;
      c.fillStyle = '#FFE9A8';
      c.beginPath(); c.ellipse(x, y, s * 1.3, s * 0.65, 0, 0, TAU); c.moveTo(x - s * 1.1, y); c.lineTo(x - s * 2.1, y - s * 0.7); c.lineTo(x - s * 2.1, y + s * 0.7); c.closePath(); c.fill();
    }
    c.fillStyle = 'rgba(235,252,255,.65)';
    c.beginPath();
    for (let i = 0; i < BUBBLES.length; i++) {
      const b = BUBBLES[i], y = cy + Rw - (((b.y + t * b.s) % 1) * Rw * 2), x = cx - Rw + b.x * Rw * 2 + Math.sin(t + i) * Rw * 0.03, r = b.r * Rw;
      c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU);
    }
    c.fill();
    /* 유리 반사 */
    c.fillStyle = 'rgba(255,255,255,.1)';
    c.beginPath(); c.moveTo(cx - Rw * 0.7, cy - Rw); c.lineTo(cx - Rw * 0.2, cy - Rw); c.lineTo(cx - Rw * 0.9, cy + Rw * 0.6); c.lineTo(cx - Rw * 1.2, cy + Rw * 0.2); c.closePath(); c.fill();
    c.restore();
    c.lineWidth = Rw * 0.035; c.strokeStyle = INK; c.beginPath(); c.arc(cx, cy, Rw, 0, TAU); c.stroke();
  }
  /* o: cx, wy, wr, py, padW, heroW(기기 픽셀), hy(주인공 중심), hero(캔버스), tail, no(챕터), purity */
  function drawHangar(c, W, H, o, t) {
    buildWall(W, H, o);
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.drawImage(wall, 0, 0);
    drawSeaWindow(c, o.cx, o.wy, o.wr, o.no || 1, o.purity || 0, t);
    c.drawImage(front, 0, 0);
    const rx = o.padW / 2, ry = rx * 0.3;
    const pulse = 0.55 + 0.35 * Math.sin(t * 2.4);
    c.save(); c.lineCap = 'round';
    c.strokeStyle = 'rgba(70,255,225,' + pulse.toFixed(3) + ')'; c.lineWidth = rx * 0.05;
    c.beginPath(); c.ellipse(o.cx, o.py, rx * 0.58, ry * 0.58, 0, 0, TAU); c.stroke();
    /* 그림자 */
    c.fillStyle = 'rgba(10,14,40,.5)';
    c.beginPath(); c.ellipse(o.cx, o.py, rx * 0.5, ry * 0.42, 0, 0, TAU); c.fill();
    c.restore();
    if (o.hero) {
      const hw = o.heroW, bob = Math.sin(t * 1.5) * W * 0.008, tilt = Math.sin(t * 0.8) * 0.018;
      const hy = o.hy + bob;
      c.save(); c.translate(o.cx, hy); c.rotate(tilt);
      if (o.tail !== undefined) {
        const k = hw / 112;
        c.save(); c.scale(k, k); c.lineJoin = 'round'; c.lineCap = 'round';
        A.drawProp(c, o.tail * 112, 0, 13, t * 15);
        c.restore();
      }
      c.drawImage(o.hero, -hw / 2, -hw * 0.553, hw, hw);
      c.restore();
      /* 꼬리에서 오르는 공기방울 */
      if (o.tail !== undefined) {
        c.save(); c.fillStyle = 'rgba(235,252,255,.75)';
        for (let i = 0; i < 6; i++) {
          const f = ((t * 0.55 + i / 6) % 1), x = o.cx + o.tail * hw - hw * 0.05 - f * hw * 0.12 + Math.sin(t * 3 + i) * hw * 0.012, y = hy - f * hw * 0.5, r = hw * (0.008 + f * 0.012);
          c.globalAlpha = 1 - f; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
        }
        c.restore();
      }
    }
  }
  A.drawHangar = drawHangar;
  A.heroCanvas = (kind, id, extra, px) => {
    px = Math.min(640, px);
    return kind === 'sub' ? A.subCanvas(id, extra, px, { ink: 1.2, white: 1.8 }) : A.makers.pilot(id, px);
  };

  /* ===== 타이틀 ===== */
  let titleBg = null, titleKey = '';
  function buildTitle(W, H, pilot) {
    titleBg = mk(W, H);
    const c = titleBg.getContext('2d'), k = W / 100, hh = H / k;
    c.scale(k, k); c.lineJoin = 'round'; c.lineCap = 'round';
    fill(c, 'M0 0H100V' + hh + 'H0Z', '#3FD6E8');
    fill(c, 'M0 ' + hh * 0.3 + 'C30 ' + hh * 0.27 + ' 70 ' + hh * 0.33 + ' 100 ' + hh * 0.29 + 'V' + hh + 'H0Z', '#1FB0D8');
    fill(c, 'M0 ' + hh * 0.56 + 'C30 ' + hh * 0.53 + ' 70 ' + hh * 0.59 + ' 100 ' + hh * 0.55 + 'V' + hh + 'H0Z', '#1787C4');
    fill(c, 'M0 ' + hh * 0.76 + 'C30 ' + hh * 0.73 + ' 70 ' + hh * 0.79 + ' 100 ' + hh * 0.75 + 'V' + hh + 'H0Z', '#1465A8');
    c.save(); c.globalAlpha = 0.16; c.fillStyle = '#fff';
    for (const r of [[4, 14, -24, -6], [30, 12, 8, 26], [56, 16, 56, 80], [84, 10, 96, 110]]) { c.beginPath(); c.moveTo(r[0], 0); c.lineTo(r[0] + r[1], 0); c.lineTo(r[3], hh); c.lineTo(r[2], hh); c.closePath(); c.fill(); }
    c.restore();
    /* 먼 능선 */
    fill(c, 'M0 ' + hh * 0.8 + 'L14 ' + hh * 0.72 + 'L28 ' + hh * 0.79 + 'L46 ' + hh * 0.74 + 'L66 ' + hh * 0.8 + 'L84 ' + hh * 0.71 + 'L100 ' + hh * 0.78 + 'V' + hh + 'H0Z', '#0F4F8C');
    /* 멀리 있는 순찰대 */
    const far = (id, pil, x, y, w, flip) => {
      const cv = A.subCanvas(id, pil, Math.round(w * k), { ink: 1, white: 1.2 });
      c.save(); c.translate(x, y); if (flip) c.scale(-1, 1); c.drawImage(cv, -w / 2, -w / 2, w, w); c.restore();
    };
    far('current', 'bingo', 82, hh * 0.36, 28);
    far('bolt', 'jjirit', 18, hh * 0.71, 30);
    far('orca', 'parang', 80, hh * 0.72, 34, true);
    /* 바닥과 해초 */
    fill(c, 'M0 ' + hh * 0.9 + 'C22 ' + hh * 0.86 + ' 44 ' + hh * 0.92 + ' 62 ' + hh * 0.89 + 'C78 ' + hh * 0.86 + ' 90 ' + hh * 0.91 + ' 100 ' + hh * 0.88 + 'V' + hh + 'H0Z', '#F0D898');
    fill(c, 'M0 ' + hh * 0.95 + 'C30 ' + hh * 0.92 + ' 70 ' + hh * 0.97 + ' 100 ' + hh * 0.93 + 'V' + hh + 'H0Z', '#D9B872');
    c.save(); c.translate(0, hh - 100);
    kelp(c, 7, 36, '#6FCB52', '#1D6B3F'); kelp(c, 93, 30, '#6FCB52', '#1D6B3F'); kelp(c, 16, 58, '#8ADB63', '#1D6B3F'); kelp(c, 86, 62, '#8ADB63', '#1D6B3F');
    c.restore();
    /* 위쪽 물결 그림자 */
    fill(c, 'M0 0H100V12C86 17 74 10 60 14C46 18 34 11 20 15C12 17 6 14 0 15Z', 'rgba(255,255,255,.22)');
  }
  function drawTitle(c, W, H, o, t) {
    const key = W + 'x' + H;
    if (key !== titleKey) { titleKey = key; buildTitle(W, H); }
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.drawImage(titleBg, 0, 0);
    /* 돌아가는 빛살 */
    c.save(); c.translate(W / 2, H * 0.5); c.rotate(t * 0.06);
    c.fillStyle = 'rgba(255,255,255,.1)';
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * H, Math.sin(a) * H); c.lineTo(Math.cos(a + 0.22) * H, Math.sin(a + 0.22) * H); c.closePath(); c.fill(); }
    c.restore();
    c.save(); c.fillStyle = 'rgba(235,252,255,.7)'; c.beginPath();
    for (let i = 0; i < BUBBLES.length; i++) {
      const b = BUBBLES[i], y = H - (((b.y + t * b.s * 0.8) % 1) * H), x = b.x * W + Math.sin(t + i) * W * 0.02, r = b.r * W * 0.5;
      c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU);
    }
    c.fill(); c.restore();
    if (o.hero) {
      const hw = o.heroW, y = H * 0.56 + Math.sin(t * 1.4) * W * 0.012;
      c.save(); c.translate(W / 2, y); c.rotate(-0.06 + Math.sin(t * 0.8) * 0.02);
      const k = hw / 112;
      c.save(); c.scale(k, k); c.lineJoin = 'round'; A.drawProp(c, o.tail * 112, 0, 13, t * 15); c.restore();
      c.drawImage(o.hero, -hw / 2, -hw * 0.553, hw, hw);
      c.restore();
    }
  }
  A.drawTitle = drawTitle;

  /* ===== 로고 ===== */
  const fontFace = '"Black Han Sans", "Do Hyeon", "Apple SD Gothic Neo", sans-serif';
  function logo(px) {
    const W = px, H = Math.round(px * 0.56), cv = mk(W, H), c = cv.getContext('2d'), u = W / 100;
    const chars = [['해', 15, 0.1, -4], ['구', 31, -0.08, 0], ['순', 51, 0.07, -2], ['찰', 68, -0.06, 1], ['대', 85, 0.08, -3]];
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    c.font = (u * 20) + 'px ' + fontFace;
    const each = (fn) => chars.forEach(h => { c.save(); c.translate(h[1] * u, (24 + h[3]) * u); c.rotate(h[2]); fn(h[0]); c.restore(); });
    /* 그림자, 흰 테, 잉크 테 */
    each(ch => { c.strokeStyle = INK; c.lineWidth = u * 7; c.strokeText(ch, 0, u * 1.8); });
    each(ch => { c.strokeStyle = '#fff'; c.lineWidth = u * 6; c.strokeText(ch, 0, 0); });
    each(ch => { c.strokeStyle = INK; c.lineWidth = u * 3.6; c.strokeText(ch, 0, 0); });
    /* 글자 위는 밝은 노랑, 아래는 주황으로 또렷이 나눈다 */
    each(ch => {
      c.fillStyle = '#FF9A1F'; c.fillText(ch, 0, 0);
      c.save(); c.beginPath(); c.rect(-u * 14, -u * 14, u * 28, u * 13.4); c.clip();
      c.fillStyle = '#FFE14D'; c.fillText(ch, 0, 0);
      c.restore();
    });
    /* 아래 띠 */
    const by = 39, bx = 15;
    c.save();
    c.translate(0, by * u); c.rotate(-0.012);
    c.fillStyle = INK; c.beginPath(); c.moveTo((bx - 3) * u, -5.2 * u); c.lineTo((100 - bx + 3) * u, -5.2 * u); c.lineTo((100 - bx + 6.500) * u, 0); c.lineTo((100 - bx + 3) * u, 5.2 * u); c.lineTo((bx - 3) * u, 5.2 * u); c.lineTo((bx - 6.500) * u, 0); c.closePath(); c.fill();
    c.fillStyle = '#16A9C9'; c.beginPath(); c.moveTo((bx - 2) * u, -3.8 * u); c.lineTo((100 - bx + 2) * u, -3.8 * u); c.lineTo((100 - bx + 4.400) * u, 0); c.lineTo((100 - bx + 2) * u, 3.8 * u); c.lineTo((bx - 2) * u, 3.8 * u); c.lineTo((bx - 4.400) * u, 0); c.closePath(); c.fill();
    c.fillStyle = '#fff'; c.font = (u * 4.2) + 'px ' + fontFace; c.fillText('BLACK TRENCH PATROL', 50 * u, u * 0.3);
    c.restore();
    return cv;
  }
  A.logo = logo;
})(window.Art);
