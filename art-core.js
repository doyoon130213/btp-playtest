/* 그림 엔진. 규칙은 docs/art-direction.md에 있다: 잉크선, 경계가 또렷한 셀 음영, 왼쪽 위 광원, 스티커 테두리.
   그림은 모두 코드로 그린다. 좌표는 100칸 상자 기준이고 경로는 SVG 문자열로 쓴다. */
window.Art = (function () {
  'use strict';
  const TAU = Math.PI * 2;
  const INK = '#15131F';
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h === undefined ? w : h)); return c; };

  const paths = new Map();
  function P(d) {
    let p = paths.get(d);
    if (!p) { p = new Path2D(d); paths.set(d, p); }
    return p;
  }
  /* 타원 경로 문자열 */
  const E = (x, y, rx, ry) => {
    ry = ry === undefined ? rx : ry;
    return 'M' + (x - rx) + ' ' + y + 'a' + rx + ' ' + ry + ' 0 1 0 ' + 2 * rx + ' 0a' + rx + ' ' + ry + ' 0 1 0 ' + -2 * rx + ' 0Z';
  };
  /* 둥근 사각형 경로 문자열 */
  const R = (x, y, w, h, r) => 'M' + (x + r) + ' ' + y + 'h' + (w - 2 * r) + 'a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + r + 'v' + (h - 2 * r) + 'a' + r + ' ' + r + ' 0 0 1 ' + -r + ' ' + r + 'h' + (2 * r - w) + 'a' + r + ' ' + r + ' 0 0 1 ' + -r + ' ' + -r + 'v' + (2 * r - h) + 'a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + -r + 'Z';

  function fill(c, d, color) { c.fillStyle = color; c.fill(P(d)); }
  function line(c, d, lw, color) { c.lineWidth = lw; c.strokeStyle = color || INK; c.stroke(P(d)); }

  /* 도형을 (dx, dy)로 민 자리의 바깥쪽만 칠한다. 초승달 모양의 음영과 빛이 형태를 따라 나온다. */
  function crescent(c, d, dx, dy, color) {
    const q = new Path2D();
    q.addPath(P(d), new DOMMatrix([1, 0, 0, 1, dx, dy]));
    q.rect(-2000, -2000, 4000, 4000);
    c.fillStyle = color;
    c.fill(q, 'evenodd');
  }
  /* 셀 음영 도형. f 바탕, s 음영, l 빛. o: lw, sx, sy, lx, ly, paint(안쪽을 칠하는 함수) */
  function cel(c, d, f, s, l, o) {
    o = o || {};
    c.fillStyle = f; c.fill(P(d));
    if (s || l || o.paint) {
      c.save(); c.clip(P(d));
      if (s) crescent(c, d, o.sx === undefined ? -2 : o.sx, o.sy === undefined ? -4 : o.sy, s);
      if (l) crescent(c, d, o.lx === undefined ? 1.2 : o.lx, o.ly === undefined ? 1.6 : o.ly, l);
      if (o.paint) o.paint(c);
      c.restore();
    }
    if (o.lw !== 0) { c.lineWidth = o.lw || 1.5; c.strokeStyle = INK; c.stroke(P(d)); }
  }
  /* 금속 나사 */
  function bolt(c, x, y, r, f) {
    cel(c, E(x, y, r), f || '#C7D0DC', '#7C879A', null, { lw: r * 0.5, sx: -r * 0.35, sy: -r * 0.45 });
    fill(c, E(x - r * 0.25, y - r * 0.3, r * 0.3), '#fff');
  }
  /* 유리 번쩍임: 사선 두 줄 */
  function glint(c, d, x, y, w, h, a) {
    c.save(); c.clip(P(d)); c.globalAlpha = a === undefined ? 0.75 : a; c.fillStyle = '#fff';
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.lineTo(x + w - h * 0.5, y + h); c.lineTo(x - h * 0.5, y + h); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(x + w * 1.35, y); c.lineTo(x + w * 1.65, y); c.lineTo(x + w * 1.65 - h * 0.5, y + h); c.lineTo(x + w * 1.35 - h * 0.5, y + h); c.closePath(); c.fill();
    c.restore();
  }

  /* 불투명한 부분을 r만큼 두껍게 한 실루엣 */
  function dilate(src, r, color, steps) {
    const out = mk(src.width, src.height), o = out.getContext('2d');
    const n = steps || Math.min(64, Math.max(16, Math.round(r * 2.4)));
    for (let i = 0; i < n; i++) { const a = i / n * TAU; o.drawImage(src, Math.cos(a) * r, Math.sin(a) * r); }
    o.globalCompositeOperation = 'source-in';
    o.fillStyle = color; o.fillRect(0, 0, out.width, out.height);
    return out;
  }
  /* 100칸 상자에 그린 그림을 S 크기 캔버스로 굽는다. ink는 바깥 잉크선, white는 스티커 테두리 두께(100칸 기준). */
  function bake(S, draw, o) {
    o = o || {};
    const pad = o.pad === undefined ? 6 : o.pad, scale = S / (100 + pad * 2);
    const raw = mk(S), r = raw.getContext('2d');
    r.setTransform(scale, 0, 0, scale, pad * scale, pad * scale);
    r.lineJoin = 'round'; r.lineCap = 'round';
    draw(r);
    r.setTransform(1, 0, 0, 1, 0, 0);
    if (!o.ink && !o.white) return raw;
    const out = mk(S), g = out.getContext('2d');
    if (o.white) g.drawImage(dilate(raw, ((o.ink || 0) + o.white) * scale, o.whiteColor || '#fff'), 0, 0);
    if (o.ink) g.drawImage(dilate(raw, o.ink * scale, INK), 0, 0);
    g.drawImage(raw, 0, 0);
    return out;
  }
  /* 흰 실루엣 (피격 번쩍임용) */
  function whiteOf(src) {
    const w = mk(src.width, src.height), g = w.getContext('2d');
    g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = '#fff'; g.fillRect(0, 0, w.width, w.height);
    return w;
  }

  /* DOM용 이미지 주소. kind별 그리기 함수는 다른 파일이 등록한다. */
  const urlCache = {};
  const makers = {};
  function url(kind, id, px, extra) {
    const key = kind + ':' + id + ':' + px + ':' + (extra === undefined ? '' : extra);
    if (urlCache[key]) return urlCache[key];
    const out = makers[kind](id, px, extra).toDataURL('image/png');
    urlCache[key] = out;
    return out;
  }

  return { TAU, INK, mk, P, E, R, fill, line, crescent, cel, bolt, glint, dilate, bake, whiteOf, url, makers };
})();
