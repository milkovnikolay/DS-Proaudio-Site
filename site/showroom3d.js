/* DS PROAUDIO — 3D-шоу-рум. Свой лёгкий WebGL-движок без внешних библиотек.
   Модель восстановлена по фотографиям и видео помещения (пропорции приблизительные).
   Оси: x — вдоль зала (−12 сцена … +12 бар), z — поперёк (−7 стена с «чешуёй» и антресолью … +7 окна), y — вверх. */
(function () {
  'use strict';
  var root = document.getElementById('sr3d');
  if (!root) return;
  var canvas = root.querySelector('canvas');
  var gl = canvas.getContext('webgl', { antialias: true, alpha: false, powerPreference: 'high-performance' }) || canvas.getContext('experimental-webgl');
  if (!gl) { root.classList.add('sr-nogl'); return; }
  var TEX = root.getAttribute('data-tex') || './assets/showroom/tex/';

  /* ================= математика ================= */
  function v3(x, y, z) { return [x, y, z]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function mul(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function len(a) { return Math.sqrt(dot(a, a)); }
  function norm(a) { var l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function persp(f, a, n, fa) { var t = 1 / Math.tan(f / 2), nf = 1 / (n - fa); return [t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (fa + n) * nf, -1, 0, 0, 2 * fa * n * nf, 0]; }
  function lookAt(e, c, u) {
    var z = norm(sub(e, c)), x = norm(cross(u, z)), y = cross(z, x);
    return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1];
  }
  function mm(a, b) { var o = new Array(16); for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) { var s = 0; for (var k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; }

  /* ================= материалы ================= */
  // c — цвет (множитель текстуры), e — свечение, uv — метров на повтор текстуры, fit — растянуть текстуру на грань
  var M = {
    floor: { t: 'floor', c: [1, .96, .9], uv: 2.4 },
    brick: { t: 'brick', c: [1, 1, 1], uv: 2.2 },
    reveal: { t: 'brick', c: [.8, .8, .8], uv: 2.2 },
    ceil: { t: 'ceiling', c: [1.05, 1, .95], uv: 1.6 },
    beam: { t: 'ceiling', c: [.78, .68, .58], uv: 1.2 },
    plaster: { t: 'plaster', c: [1, 1, 1], uv: 2.5 },
    scales: { t: 'scales', c: [1.05, .95, .85], uv: .8 },
    tiles: { t: 'tiles', c: [1, 1, 1], uv: 1.2 },
    darkwall: { c: [.12, .12, .13] },
    steel: { c: [.07, .07, .075] },
    steel2: { c: [.16, .16, .17] },
    wood: { c: [.42, .25, .13] },
    woodd: { c: [.22, .13, .07] },
    antique: { c: [.55, .36, .14] },
    leather: { c: [.42, .07, .06] },
    leatherb: { c: [.05, .05, .055] },
    chair: { c: [.035, .04, .05] },
    chairleg: { c: [.55, .4, .25] },
    cushion: { c: [.7, .2, .16] },
    plant: { c: [.13, .3, .09] },
    plant2: { c: [.2, .38, .12] },
    pot: { c: [.16, .14, .13] },
    spk: { c: [.045, .045, .05] },
    grille: { t: 'grille', c: [1, 1, 1], fit: 1 },
    chrome: { c: [.6, .6, .62] },
    drum: { c: [.45, .07, .06] },
    cymbal: { c: [.72, .55, .2] },
    screen: { c: [.85, .85, .86] },
    rug_red: { t: 'rug_red', c: [.62, .55, .55], fit: 1 },
    rug_blue: { t: 'rug_blue', c: [.6, .56, .58], fit: 1 },
    rug_rose: { t: 'rug_rose', c: [.62, .56, .56], fit: 1 },
    cur_wine: { t: 'curtain_wine', c: [1, 1, 1], uv: 2.2, dbl: 1 },
    cur_dark: { t: 'curtain_dark', c: [1, 1, 1], uv: 2.2, dbl: 1 },
    cur_beige: { t: 'curtain_beige', c: [1, 1, 1], uv: 2.2, dbl: 1 },
    painting: { t: 'painting', c: [1, 1, 1], fit: 1, e: [.12, .12, .12] },
    window: { t: 'window', c: [0, 0, 0], fit: 1, e: [2.4, 2.3, 2.15] },
    barfront: { t: 'barfront', c: [.2, .14, .1], fit: 1, e: [.5, .28, .1] },
    lampw: { c: [0, 0, 0], e: [3.2, 2.2, 1.2] },
    lens: { c: [0, 0, 0], e: [1.6, 1.6, 1.8] },
    lensb: { c: [0, 0, 0], e: [.4, .7, 2.6] },
    lensr: { c: [0, 0, 0], e: [2.4, .4, .5] },
    bottle: { c: [.06, .16, .08], e: [.03, .08, .03] },
    bottle2: { c: [.25, .12, .04], e: [.1, .05, .02] },
    sun: { t: 'sun', c: [0, 0, 0], fit: 1, e: [.55, .42, .3], blend: 'add' },
    glass: { c: [.5, .55, .6], a: .14, blend: 'alpha', dbl: 1 },
    marker: { c: [0, 0, 0], e: [1.5, 1.5, 1.5], a: .85, blend: 'alpha', dbl: 1 }
  };

  /* ================= построитель геометрии ================= */
  var B = {};   // имя материала → {p:[], n:[], u:[]}
  function bucket(m) { return B[m] || (B[m] = { p: [], n: [], u: [] }); }
  // треугольник с нужной нормалью: порядок вершин подбирается сам
  function tri(m, a, b, c, na, nb, nc, ua, ub, uc) {
    var g = bucket(m), fn = cross(sub(b, a), sub(c, a)), avg = add(add(na, nb), nc);
    if (dot(fn, avg) < 0) { var t = b; b = c; c = t; t = nb; nb = nc; nc = t; t = ub; ub = uc; uc = t; }
    g.p.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    g.n.push(na[0], na[1], na[2], nb[0], nb[1], nb[2], nc[0], nc[1], nc[2]);
    g.u.push(ua[0], ua[1], ub[0], ub[1], uc[0], uc[1]);
  }
  function quad(m, a, b, c, d, n, uvs) { // a-b-c-d по кругу; uvs — 4 пары
    tri(m, a, b, c, n, n, n, uvs[0], uvs[1], uvs[2]); tri(m, a, c, d, n, n, n, uvs[0], uvs[2], uvs[3]);
  }
  // преобразование: масштаб → поворот X → поворот Y → перенос
  function X(T) {
    T = T || {}; var cy = Math.cos(T.ry || 0), sy = Math.sin(T.ry || 0), cx = Math.cos(T.rx || 0), sx = Math.sin(T.rx || 0), cz = Math.cos(T.rz || 0), sz = Math.sin(T.rz || 0);
    var o = [T.x || 0, T.y || 0, T.z || 0];
    function r(p) { var x = p[0], y = p[1], z = p[2], t;
      t = x * cz - y * sz; y = x * sz + y * cz; x = t;
      t = y * cx - z * sx; z = y * sx + z * cx; y = t;
      t = x * cy + z * sy; z = -x * sy + z * cy; x = t; return [x, y, z]; }
    return { p: function (p) { return add(r(p), o); }, n: function (n) { return r(n); } };
  }
  // плоскость, заданная углом, двумя векторами сторон и нормалью (uv по метрам или «на всю грань»)
  function face(m, o, eu, ev, n, tf) {
    var mat = M[m], lu = len(eu), lv = len(ev), s = mat.uv || 1;
    var U = mat.fit ? 1 : lu / s, V = mat.fit ? 1 : lv / s, u0 = mat.fit ? 0 : (tf && tf.u0 || 0), v0 = mat.fit ? 0 : (tf && tf.v0 || 0);
    var a = o, b = add(o, eu), c = add(add(o, eu), ev), d = add(o, ev);
    if (tf && tf.x) { a = tf.x.p(a); b = tf.x.p(b); c = tf.x.p(c); d = tf.x.p(d); n = tf.x.n(n); }
    quad(m, a, b, c, d, n, [[u0, v0], [u0 + U, v0], [u0 + U, v0 + V], [u0, v0 + V]]);
  }
  // коробка с центром основания в (0,0,0) локально; skip — какие грани не строить
  function box(m, T, w, h, d, opt) {
    opt = opt || {}; var x = X(T), hw = w / 2, hd = d / 2, sk = opt.skip || '', mf = opt.front || m;
    var F = {
      px: [[hw, 0, hd], [0, 0, -d], [0, h, 0], [1, 0, 0]], nx: [[-hw, 0, -hd], [0, 0, d], [0, h, 0], [-1, 0, 0]],
      pz: [[-hw, 0, hd], [w, 0, 0], [0, h, 0], [0, 0, 1]], nz: [[hw, 0, -hd], [-w, 0, 0], [0, h, 0], [0, 0, -1]],
      py: [[-hw, h, hd], [w, 0, 0], [0, 0, -d], [0, 1, 0]], ny: [[-hw, 0, -hd], [w, 0, 0], [0, 0, d], [0, -1, 0]]
    };
    for (var k in F) if (sk.indexOf(k) < 0) face(k === (opt.frontFace || '') ? mf : m, F[k][0], F[k][1], F[k][2], F[k][3], { x: x });
  }
  function cyl(m, T, r, h, seg, opt) {
    opt = opt || {}; var x = X(T); seg = seg || 14; var r2 = opt.r2 === undefined ? r : opt.r2;
    for (var i = 0; i < seg; i++) {
      var a0 = i / seg * Math.PI * 2, a1 = (i + 1) / seg * Math.PI * 2;
      var p0 = [Math.cos(a0) * r, 0, Math.sin(a0) * r], p1 = [Math.cos(a1) * r, 0, Math.sin(a1) * r];
      var q0 = [Math.cos(a0) * r2, h, Math.sin(a0) * r2], q1 = [Math.cos(a1) * r2, h, Math.sin(a1) * r2];
      var n0 = [Math.cos(a0), 0, Math.sin(a0)], n1 = [Math.cos(a1), 0, Math.sin(a1)];
      tri(m, x.p(p0), x.p(p1), x.p(q1), x.n(n0), x.n(n1), x.n(n1), [0, 0], [1, 0], [1, 1]);
      tri(m, x.p(p0), x.p(q1), x.p(q0), x.n(n0), x.n(n1), x.n(n0), [0, 0], [1, 1], [0, 1]);
      if (!opt.open) {
        tri(opt.cap || m, x.p([0, h, 0]), x.p(q0), x.p(q1), x.n([0, 1, 0]), x.n([0, 1, 0]), x.n([0, 1, 0]), [.5, .5], [0, 0], [1, 0]);
        tri(opt.cap || m, x.p([0, 0, 0]), x.p(p1), x.p(p0), x.n([0, -1, 0]), x.n([0, -1, 0]), x.n([0, -1, 0]), [.5, .5], [0, 0], [1, 0]);
      }
    }
  }
  // кольцо-труба (люстры-обручи)
  function ring(m, T, R, r, seg) {
    var x = X(T); seg = seg || 64; var sg = 6;
    for (var i = 0; i < seg; i++) for (var j = 0; j < sg; j++) {
      var P = function (a, b) { var ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b); return [[(R + r * cb) * ca, r * sb, (R + r * cb) * sa], [cb * ca, sb, cb * sa]]; };
      var a0 = i / seg * 6.2832, a1 = (i + 1) / seg * 6.2832, b0 = j / sg * 6.2832, b1 = (j + 1) / sg * 6.2832;
      var A = P(a0, b0), Bq = P(a1, b0), C = P(a1, b1), D = P(a0, b1);
      tri(m, x.p(A[0]), x.p(Bq[0]), x.p(C[0]), x.n(A[1]), x.n(Bq[1]), x.n(C[1]), [0, 0], [1, 0], [1, 1]);
      tri(m, x.p(A[0]), x.p(C[0]), x.p(D[0]), x.n(A[1]), x.n(C[1]), x.n(D[1]), [0, 0], [1, 1], [0, 1]);
    }
  }
  // эллипсоид (кроны растений, подушки)
  function blob(m, T, rx, ry, rz, inv, half) {
    var x = X(T), R = half ? 5 : 7, C = half ? 28 : 10, PH = half ? Math.PI / 2 : Math.PI;
    for (var i = 0; i < R; i++) for (var j = 0; j < C; j++) {
      var S = function (a, b) { var n = [Math.sin(a) * Math.cos(b), Math.cos(a), Math.sin(a) * Math.sin(b)]; return [[n[0] * rx, n[1] * ry, n[2] * rz], inv ? mul(n, -1) : n]; };
      var a0 = i / R * PH, a1 = (i + 1) / R * PH, b0 = j / C * 6.2832, b1 = (j + 1) / C * 6.2832;
      var A = S(a0, b0), Bq = S(a1, b0), Cq = S(a1, b1), D = S(a0, b1);
      tri(m, x.p(A[0]), x.p(Bq[0]), x.p(Cq[0]), x.n(A[1]), x.n(Bq[1]), x.n(Cq[1]), [j / C, i / R], [j / C, (i + 1) / R], [(j + 1) / C, (i + 1) / R]);
      tri(m, x.p(A[0]), x.p(Cq[0]), x.p(D[0]), x.n(A[1]), x.n(Cq[1]), x.n(D[1]), [j / C, i / R], [(j + 1) / C, (i + 1) / R], [(j + 1) / C, i / R]);
    }
  }
  // штора со складками: вдоль локальной оси x, висит от y0 до y1
  function curtain(m, T, w, y0, y1, folds, amp) {
    var x = X(T), n = Math.max(8, folds * 6), s = M[m].uv || 2;
    for (var i = 0; i < n; i++) {
      var t0 = i / n, t1 = (i + 1) / n, z0 = Math.sin(t0 * folds * 6.2832) * amp, z1 = Math.sin(t1 * folds * 6.2832) * amp;
      var nn0 = norm([-Math.cos(t0 * folds * 6.2832) * amp * folds * 6.2832 / w, 0, 1]), nn1 = norm([-Math.cos(t1 * folds * 6.2832) * amp * folds * 6.2832 / w, 0, 1]);
      var a = [t0 * w, y0, z0], b = [t1 * w, y0, z1], c = [t1 * w, y1, z1], d = [t0 * w, y1, z0];
      var ua = [t0 * w / s, y0 / s], ub = [t1 * w / s, y0 / s], uc = [t1 * w / s, y1 / s], ud = [t0 * w / s, y1 / s];
      tri(m, x.p(a), x.p(b), x.p(c), x.n(nn0), x.n(nn1), x.n(nn1), ua, ub, uc);
      tri(m, x.p(a), x.p(c), x.p(d), x.n(nn0), x.n(nn1), x.n(nn0), ua, uc, ud);
    }
  }

  /* ================= помещение ================= */
  var L0 = -12, L1 = 12, W0 = -7, W1 = 7, H = 6.6, MZ = 3.3, GW = -4.6, GN = 9;
  var WIN = [-9, -4.5, 0, 4.5, 9.3], WW = 2.3, WY0 = .95, WY1 = 5.5, WT = .4;
  var DOMES = [[-2, 0, 1.55], [5.2, .4, 1.4]];

  // пол
  face('floor', [L0, 0, W0], [L1 - L0, 0, 0], [0, 0, W1 - W0], [0, 1, 0]);
  // потолок с проёмами под купола (сетка ячеек 0.25 м)
  (function () {
    var st = .25;
    for (var x = L0; x < L1 - 1e-6; x += st) for (var z = W0; z < W1 - 1e-6; z += st) {
      var cx = x + st / 2, cz = z + st / 2, hole = false;
      DOMES.forEach(function (d) { if ((cx - d[0]) * (cx - d[0]) + (cz - d[1]) * (cz - d[1]) < d[2] * d[2]) hole = true; });
      if (!hole) face('ceil', [x, H, z], [st, 0, 0], [0, 0, st], [0, -1, 0], { u0: x / 1.6, v0: z / 1.6 });
    }
    DOMES.forEach(function (d) {
      blob('plaster', { x: d[0], y: H - .01, z: d[1] }, d[2] + .05, .9, d[2] + .05, true, true);
      ring('beam', { x: d[0], y: H - .06, z: d[1] }, d[2] + .05, .09, 48);
    });
  })();
  // деревянные балки-кессоны и стальные балки
  for (var bx = L0 + 2; bx < L1; bx += 3.4) box('beam', { x: bx, y: H - .34, z: 0 }, .26, .34, W1 - W0, { skip: 'py' });
  for (var bz = -3.5; bz <= 3.6; bz += 3.5) box('beam', { x: 0, y: H - .3, z: bz }, L1 - L0, .3, .22, { skip: 'py' });
  box('steel', { x: 0, y: H - .42, z: GW }, L1 - L0, .42, .22, { skip: 'py' });

  // восточная стена: кирпич с окнами
  (function () {
    var z = W1, xs = [L0].concat(WIN.reduce(function (a, c) { a.push(c - WW / 2, c + WW / 2); return a; }, [])).concat([L1]);
    for (var i = 0; i < xs.length; i += 2) face('brick', [xs[i], 0, z], [xs[i + 1] - xs[i], 0, 0], [0, H, 0], [0, 0, -1], { u0: xs[i] / 2.2 });
    WIN.forEach(function (cx) {
      var a = cx - WW / 2, b = cx + WW / 2;
      face('brick', [a, 0, z], [WW, 0, 0], [0, WY0, 0], [0, 0, -1], { u0: a / 2.2 });
      face('brick', [a, WY1, z], [WW, 0, 0], [0, H - WY1, 0], [0, 0, -1], { u0: a / 2.2, v0: WY1 / 2.2 });
      // откосы проёма
      face('reveal', [a, WY0, z], [0, 0, WT], [0, WY1 - WY0, 0], [1, 0, 0]);
      face('reveal', [b, WY0, z], [0, 0, WT], [0, WY1 - WY0, 0], [-1, 0, 0]);
      face('reveal', [a, WY1, z], [WW, 0, 0], [0, 0, WT], [0, -1, 0]);
      face('wood', [a, WY0, z], [WW, 0, 0], [0, 0, WT], [0, 1, 0]);
      face('window', [a, WY0, z + WT], [WW, 0, 0], [0, WY1 - WY0, 0], [0, 0, -1]);
      // пятно солнца на полу
      face('sun', [a - .2, .012, z - 3.6], [WW + .4, 0, 0], [0, 0, 3.4], [0, 1, 0]);
    });
    // шторы винного цвета в простенках и настенные лампы
    for (var i2 = 0; i2 < WIN.length; i2++) {
      var left = (i2 === 0 ? L0 + .2 : WIN[i2 - 1] + WW / 2 - .35), right = WIN[i2] - WW / 2 + .35;
      if (WIN[i2] > 8) continue;
      curtain('cur_wine', { x: left, y: 0, z: W1 - .28 }, right - left, 0, H - .25, Math.max(2, Math.round((right - left) * 2.2)), .08);
      var pc = (left + right) / 2;
      if (i2 > 0) { cyl('steel', { x: pc, y: 3.0, z: W1 - .08 }, .05, .45, 8); cyl('lampw', { x: pc, y: 3.08, z: W1 - .18 }, .045, .3, 10); }
    }
    box('steel', { x: 0, y: H - .25, z: W1 - .3 }, L1 - L0, .04, .04);   // карниз
  })();

  // западная стена: тёмные панели с бронзовой «чешуёй»; картина под антресолью
  face('scales', [L0, 0, W0], [L1 - L0, 0, 0], [0, H, 0], [0, 0, 1]);
  face('painting', [-1.2, .7, W0 + .03], [1.3, 0, 0], [0, 1.8, 0], [0, 0, 1]);
  box('woodd', { x: -.55, y: .65, z: W0 + .03 }, 1.42, .05, .06);
  // северная стена: внизу тёмная, сверху серая плитка
  face('darkwall', [L1, 0, W1], [0, 0, W0 - W1], [0, MZ, 0], [-1, 0, 0]);
  face('tiles', [L1, MZ, W1], [0, 0, W0 - W1], [0, H - MZ, 0], [-1, 0, 0]);
  // южная стена: сценический задник (тёмные шторы)
  face('darkwall', [L0, 0, W0], [0, 0, W1 - W0], [0, H, 0], [1, 0, 0]);
  curtain('cur_dark', { x: L0 + .25, y: 0, z: W1 - .3, ry: Math.PI / 2 }, W1 - W0 - .6, 0, H - .3, 18, .1);

  // ===== антресоль: вдоль западной стены и вдоль северной (с балконом) =====
  function deck(x0, x1, z0, z1) { box('steel2', { x: (x0 + x1) / 2, y: MZ - .22, z: (z0 + z1) / 2 }, x1 - x0, .22, z1 - z0); face('floor', [x0, MZ + .001, z0], [x1 - x0, 0, 0], [0, 0, z1 - z0], [0, 1, 0]); }
  deck(L0, GN, W0, GW); deck(GN, L1, W0, W1); deck(7.6, GN, 2.4, 6.2);
  function rail(a, b) { // перила: стойки, поручень, тросы, стекло
    var d = sub(b, a), l = len(d), n = Math.max(1, Math.round(l / 1.3)), ry = Math.atan2(-d[2], d[0]);
    for (var i = 0; i <= n; i++) { var p = lerp(a, b, i / n); box('steel', { x: p[0], y: MZ, z: p[2] }, .05, 1.05, .05); }
    var c = lerp(a, b, .5);
    box('steel', { x: c[0], y: MZ + 1.03, z: c[2], ry: ry }, l, .045, .06);
    box('steel', { x: c[0], y: MZ + .55, z: c[2], ry: ry }, l, .015, .015);
    box('glass', { x: c[0], y: MZ + .08, z: c[2], ry: ry }, l, .9, .01);
  }
  rail([L0, 0, GW], [GN, 0, GW]); rail([GN, 0, GW], [GN, 0, 2.4]); rail([GN, 0, 2.4], [7.6, 0, 2.4]); rail([7.6, 0, 2.4], [7.6, 0, 6.2]); rail([7.6, 0, 6.2], [GN, 0, 6.2]); rail([GN, 0, 6.2], [GN, 0, W1]);
  // стальные стойки: до антресоли и сквозные до потолка
  [-10, -6, -2, 2, 6].forEach(function (x) { box('steel', { x: x, y: 0, z: GW }, .16, H, .16); });
  [[GN, -1], [GN, 2.4], [7.6, 2.4], [7.6, 6.2]].forEach(function (p) { box('steel', { x: p[0], y: 0, z: p[1] }, .09, MZ - .2, .09); });
  // лестница на антресоль (у южного торца)
  (function () { var n = 15; for (var i = 0; i < n; i++) box('steel2', { x: -11.0 + i * .26, y: (i + 1) * MZ / n - .05, z: -4.05 }, .28, .05, 1.0); box('steel', { x: -9.1, y: .5, z: -3.55, rz: -.9 }, 4.6, .05, .05); })();

  // ===== под северной антресолью: бар, полки, шкаф, проход со шторами =====
  box('wood', { x: 9.95, y: 0, z: 2.5 }, .7, 1.08, 3.4, { front: 'barfront', frontFace: 'nx' });
  box('woodd', { x: 9.9, y: 1.08, z: 2.5 }, .9, .06, 3.6);
  [1.3, 2.3, 3.3].forEach(function (z) { cyl('steel', { x: 9.25, y: 0, z: z }, .03, .75, 8); cyl('leatherb', { x: 9.25, y: .75, z: z }, .2, .06, 14); });
  box('woodd', { x: 11.75, y: 1.95, z: 2.4 }, .3, .04, 4.6);
  for (var bi = 0; bi < 22; bi++) { var bz2 = .3 + bi * .2; cyl(bi % 3 ? 'bottle' : 'bottle2', { x: 11.75, y: 1.99, z: bz2 }, .04, .3, 8, { r2: .02 }); }
  box('woodd', { x: 11.75, y: 2.6, z: 2.4 }, .3, .04, 4.6);
  box('antique', { x: 11.55, y: 0, z: -5.4 }, .8, 2.3, 1.3);
  box('woodd', { x: 11.55, y: 2.3, z: -5.4 }, .9, .12, 1.4);
  curtain('cur_beige', { x: 11.85, y: 0, z: -1.2, ry: Math.PI / 2 }, 2.2, 0, MZ - .25, 5, .09);
  cyl('lampw', { x: 10.2, y: 1.14, z: 3.9 }, .12, .25, 14, { r2: .07 });
  // на антресоли: чёрный кожаный диван и столик у перил
  box('leatherb', { x: 11.4, y: MZ, z: -1.5 }, .9, .45, 2.4); box('leatherb', { x: 11.8, y: MZ + .45, z: -1.5 }, .2, .45, 2.4);
  box('woodd', { x: 8.4, y: MZ + .75, z: 4.3 }, 1.1, .05, 1.1); cyl('steel', { x: 8.4, y: MZ, z: 4.3 }, .04, .75, 8);

  // ===== лаунж: красный кожаный угловой диван, столик, растения, мотоцикл =====
  face('rug_rose', [5.6, .01, 2.6], [3.6, 0, 0], [0, 0, 3.2], [0, 1, 0]);
  box('leather', { x: 7.7, y: 0, z: 6.1 }, 3.0, .42, .95); box('leather', { x: 7.7, y: .42, z: 6.48 }, 3.0, .42, .22);
  box('leather', { x: 6.25, y: 0, z: 4.6 }, .95, .42, 2.3); box('leather', { x: 5.9, y: .42, z: 4.6 }, .22, .42, 2.3);
  [[7.0, 6.35], [8.2, 6.35], [6.0, 4.0]].forEach(function (p) { blob('cushion', { x: p[0], y: .72, z: p[1] }, .26, .22, .1); });
  box('woodd', { x: 7.6, y: .38, z: 4.5 }, 1.6, .07, .8); box('woodd', { x: 7.6, y: 0, z: 4.5 }, 1.3, .38, .5);
  function plant(x, z, s) { cyl('pot', { x: x, y: 0, z: z }, .28 * s, .55 * s, 12, { r2: .24 * s }); cyl('woodd', { x: x, y: .5 * s, z: z }, .03, 1.0 * s, 6);
    [[0, 1.5, 0, .55], [.3, 1.25, .2, .42], [-.28, 1.3, -.1, .45], [.1, 1.8, -.2, .38]].forEach(function (b, i) { blob(i % 2 ? 'plant2' : 'plant', { x: x + b[0] * s, y: b[1] * s, z: z + b[2] * s }, b[3] * s, b[3] * .8 * s, b[3] * s); }); }
  plant(9.2, 6.4, 1.2); plant(4.9, 6.45, .9); plant(-6.2, -6.5, 1.1); plant(2.8, -6.4, .8); plant(11.3, -3.6, .9);
  // мотоцикл
  (function () { var T = { x: 4.3, z: 5.9 }; ring('leatherb', { x: T.x - .7, y: .33, z: T.z, rx: Math.PI / 2 }, .27, .07, 28); ring('leatherb', { x: T.x + .7, y: .33, z: T.z, rx: Math.PI / 2 }, .27, .07, 28);
    box('leatherb', { x: T.x, y: .45, z: T.z, rz: .08 }, 1.1, .32, .3); box('steel2', { x: T.x + .2, y: .78, z: T.z }, .5, .2, .34); box('leatherb', { x: T.x - .35, y: .78, z: T.z }, .55, .1, .28);
    box('chrome', { x: T.x + .75, y: .55, z: T.z, rz: -.4 }, .05, .55, .05); box('chrome', { x: T.x + .62, y: 1.0, z: T.z }, .05, .05, .7); })();

  // ===== зал: ковры и стулья =====
  face('rug_blue', [-5.2, .01, -3.4], [3.2, 0, 0], [0, 0, 3.4], [0, 1, 0]);
  face('rug_red', [-5.2, .01, .4], [3.2, 0, 0], [0, 0, 3.6], [0, 1, 0]);
  face('rug_red', [.2, .01, -3.6], [3.0, 0, 0], [0, 0, 4.2], [0, 1, 0]);
  function chair(x, z, ry) { var T = { x: x, z: z, ry: ry };
    var xf = X(T); [[-.18, -.18], [.18, -.18], [-.18, .18], [.18, .18]].forEach(function (l) { var p = xf.p([l[0], 0, l[1]]); cyl('chairleg', { x: p[0], y: 0, z: p[2] }, .014, .44, 5); });
    box('chair', { x: x, y: .44, z: z, ry: ry }, .46, .05, .46); var bp = xf.p([.21, 0, 0]); box('chair', { x: bp[0], y: .49, z: bp[2], ry: ry, rz: .12 }, .05, .42, .46); }
  for (var r = 0; r < 3; r++) for (var c = 0; c < 6; c++) chair(-4.6 + r * 1.05, -2.9 + c * 1.12 + (r % 2) * .1, 0);
  for (var k2 = 0; k2 < 5; k2++) chair(1.0 + (k2 % 3) * .9, -2.8 + k2 * .9, .2 * (k2 % 2 ? 1 : -1));

  // ===== сцена (южный торец): ковёр, барабаны, мониторы, сабвуферы, подвесные линейные массивы =====
  face('rug_red', [-11.4, .01, -2.6], [4.0, 0, 0], [0, 0, 5.2], [0, 1, 0]);
  (function () { var T = { x: -10.4, z: 2.0 }; cyl('drum', { x: T.x, y: .15, z: T.z, rx: Math.PI / 2 }, .28, .5, 18); cyl('drum', { x: T.x + .45, y: .45, z: T.z - .35 }, .18, .3, 14); cyl('drum', { x: T.x + .45, y: .45, z: T.z + .3 }, .17, .3, 14); cyl('drum', { x: T.x - .5, y: 0, z: T.z + .5 }, .22, .55, 14);
    [[.8, 1.0, -.6], [.7, 1.1, .8], [-.4, .95, -.6]].forEach(function (c) { cyl('steel', { x: T.x + c[0], y: 0, z: T.z + c[2] }, .015, c[1], 5); cyl('cymbal', { x: T.x + c[0], y: c[1], z: T.z + c[2] }, .26, .012, 18, { r2: .05 }); }); })();
  // мониторы-«клинья»
  [[-8.4, -1.2], [-8.4, 1.2]].forEach(function (p) { box('spk', { x: p[0], y: 0, z: p[1], rz: .5 }, .45, .35, .62, { front: 'grille', frontFace: 'px' }); });
  // сабвуферы и АС на них
  [-4.4, 4.4].forEach(function (z) { box('spk', { x: -8.2, y: 0, z: z }, .75, .62, .9, { front: 'grille', frontFace: 'px' }); box('spk', { x: -8.2, y: .62, z: z }, .75, .62, .9, { front: 'grille', frontFace: 'px' }); box('spk', { x: -8.2, y: 1.24, z: z }, .42, .7, .48, { front: 'grille', frontFace: 'px' }); });
  // подвесные линейные массивы (кабинеты с нарастающим углом раскрытия)
  function array(x, z, n, w, yaw) {
    var y = 5.55, ang = 0, cx = x;
    box('steel', { x: x, y: y, z: z, ry: yaw }, .7, .08, w + .1);
    cyl('steel', { x: x, y: y + .08, z: z }, .012, H - y - .08, 4);
    var spl = [0, 1, 2, 3, 4, 6, 8, 10];
    for (var i = 0; i < n; i++) { ang += spl[i] * Math.PI / 180; y -= .34 * Math.cos(ang); cx += .34 * Math.sin(ang) * .5;
      box('spk', { x: cx, y: y, z: z, ry: yaw, rz: -ang }, .55, .32, w, { front: 'grille', frontFace: 'px' }); }
  }
  array(-8.9, -2.7, 7, 1.05, 0); array(-8.9, 2.7, 7, 1.05, 0); array(-8.6, -4.9, 4, .7, .35); array(-8.6, 4.9, 4, .7, -.35);
  // экран на треноге
  box('screen', { x: -6.0, y: .9, z: 5.2, ry: -.5 }, .03, 1.4, 2.0); cyl('steel', { x: -6.0, y: 0, z: 5.2 }, .02, 2.35, 5);

  // ===== свет: обручи под куполом, ферма с приборами =====
  ring('steel', { x: -2, y: 5.0, z: 0 }, 2.6, .028, 72); ring('steel', { x: -2, y: 4.75, z: 0 }, 1.8, .028, 60);
  [0, 1.57, 3.14, 4.71].forEach(function (a) { cyl('steel', { x: -2 + Math.cos(a) * 2.6, y: 5.0, z: Math.sin(a) * 2.6 }, .008, H - 5.0, 4); });
  ring('steel', { x: 5.2, y: 5.1, z: .4 }, 2.2, .025, 64);
  for (var tz = -3; tz <= 3; tz += 3) cyl('steel', { x: L0 + .3, y: 5.9, z: tz, rz: -Math.PI / 2 }, .035, L1 - L0 - 3, 8);
  [-9.5, -6, -2, 2, 6].forEach(function (x) { cyl('steel', { x: x, y: 5.9, z: W0 + 2.6, rx: Math.PI / 2 }, .035, 10.6, 8); });
  [[-9.5, -3, 'lens'], [-9.5, 3, 'lensb'], [-6, 0, 'lensr'], [-6, -3, 'lens'], [-6, 3, 'lens'], [-2, -3, 'lensb'], [-2, 3, 'lens'], [2, 0, 'lens'], [2, -3, 'lensr'], [6, 3, 'lens'], [6, -3, 'lensb']].forEach(function (f) {
    box('spk', { x: f[0], y: 5.55, z: f[1] }, .3, .32, .3); cyl(f[2], { x: f[0], y: 5.5, z: f[1] }, .11, .05, 12); });

  /* ================= свет сцены ================= */
  var LIGHTS = [
    [[-2, 4.7, 0], [2.6, 2.0, 1.5], 7.5],      // под обручами
    [[5.2, 4.8, .4], [1.6, 1.25, .95], 6.5],
    [[9.0, .7, 2.5], [1.8, 1.0, .45], 2.6],     // подсветка бара
    [[8.6, 1.5, 6.0], [1.6, 1.1, .6], 3.2],     // лаунж
    [[-6.75, 3.1, 6.5], [1.3, .85, .45], 3.0], [[-2.25, 3.1, 6.5], [1.3, .85, .45], 3.0], [[2.25, 3.1, 6.5], [1.3, .85, .45], 3.0], [[6.75, 3.1, 6.5], [1.3, .85, .45], 3.0],
    [[-9.5, 5.3, 0], [1.9, 1.75, 1.6], 7],     // сцена
    [[10.5, 5.4, 0], [1.0, .9, .8], 6],        // северная антресоль
    [[0, 2.9, -6], [1.1, .8, .55], 6.5],       // под западной антресолью
    [[0, 5.8, 3], [.8, .72, .62], 14]          // общий фон
  ];
  var SUN_D = norm([.25, -.45, -1]), SUN_C = [.75, .62, .48];

  /* ================= шейдеры ================= */
  var VS = 'attribute vec3 aP;attribute vec3 aN;attribute vec2 aU;uniform mat4 uVP;uniform vec3 uOff;varying vec3 vP;varying vec3 vN;varying vec2 vU;' +
    'void main(){vP=aP+uOff;vN=aN;vU=aU;gl_Position=uVP*vec4(vP,1.0);}';
  var FS = 'precision highp float;varying vec3 vP;varying vec3 vN;varying vec2 vU;uniform sampler2D uT;uniform float uHasT;uniform vec3 uC;uniform vec3 uE;uniform float uA;' +
    'uniform vec3 uLP[12];uniform vec3 uLC[12];uniform float uLR[12];uniform vec3 uSunD;uniform vec3 uSunC;uniform vec3 uCam;uniform float uExp;uniform float uAO;' +
    'vec3 aces(vec3 x){return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0);}' +
    'void main(){vec4 tx=uHasT>0.5?texture2D(uT,vU):vec4(1.0);vec3 tc=pow(tx.rgb,vec3(2.2));vec3 base=uC*tc;' +
    'vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;' +
    'vec3 L=mix(vec3(0.045,0.038,0.032),vec3(0.17,0.15,0.13),N.y*0.5+0.5);' +
    'float win=smoothstep(-7.5,6.5,vP.z);L+=uSunC*max(dot(N,-uSunD),0.0)*(0.25+0.75*win);' +
    'for(int i=0;i<12;i++){vec3 d=uLP[i]-vP;float dl=length(d);float at=1.0/(1.0+dl*dl/(uLR[i]*uLR[i]*0.35));at*=clamp(1.0-dl/(uLR[i]*2.2),0.0,1.0);L+=uLC[i]*at*(0.35+0.65*max(dot(N,d/dl),0.0));}' +
    // дешёвое затенение углов: ближе к полу/стенам/потолку — темнее
    'float e=min(min(vP.x+12.0,12.0-vP.x),min(vP.z+7.0,7.0-vP.z));e=min(e,min(vP.y+0.6,6.6-vP.y));float ao=mix(1.0,0.55+0.45*smoothstep(0.0,1.6,e),uAO);' +
    'vec3 col=base*L*ao+uE*tc;' +
    'float fd=length(vP-uCam);col=mix(col,vec3(0.05,0.04,0.035),clamp((fd-14.0)/40.0,0.0,0.55));' +
    'col=aces(col*uExp);col=pow(col,vec3(1.0/2.2));gl_FragColor=vec4(col,uA*tx.a);}';
  function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
  var prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { root.classList.add('sr-nogl'); return; }
  gl.useProgram(prog);
  var A = { p: gl.getAttribLocation(prog, 'aP'), n: gl.getAttribLocation(prog, 'aN'), u: gl.getAttribLocation(prog, 'aU') };
  var U = {}; ['uVP', 'uOff', 'uT', 'uHasT', 'uC', 'uE', 'uA', 'uSunD', 'uSunC', 'uCam', 'uExp', 'uAO'].forEach(function (k) { U[k] = gl.getUniformLocation(prog, k); });
  var LP = [], LC = [], LR = []; LIGHTS.forEach(function (l) { LP.push.apply(LP, l[0]); LC.push.apply(LC, l[1]); LR.push(l[2]); });
  gl.uniform3fv(gl.getUniformLocation(prog, 'uLP'), LP); gl.uniform3fv(gl.getUniformLocation(prog, 'uLC'), LC); gl.uniform1fv(gl.getUniformLocation(prog, 'uLR'), LR);
  gl.uniform3fv(U.uSunD, SUN_D); gl.uniform3fv(U.uSunC, SUN_C);

  // буферы
  var DRAW = [];
  function upload(name, g) {
    var b = {}, f = function (arr) { var o = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, o); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW); return o; };
    b.p = f(g.p); b.n = f(g.n); b.u = f(g.u); b.count = g.p.length / 3; b.m = M[name]; b.name = name; return b;
  }
  Object.keys(B).forEach(function (k) { DRAW.push(upload(k, B[k])); });
  DRAW.sort(function (a, b) { return (a.m.blend ? 1 : 0) - (b.m.blend ? 1 : 0); });

  // текстуры
  var TX = {}, pending = 0;
  var white = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, white); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
  var aniso = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
  function loadTex(name) {
    if (TX[name]) return; var t = gl.createTexture(); TX[name] = { t: t, ok: false }; pending++;
    var im = new Image(); im.onload = function () {
      try {
      gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
      gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
      TX[name].ok = true; } catch (er) { }
      pending--; dirty = true; if (!pending) root.classList.add('sr-ready');
    };
    im.onerror = function () { pending--; if (!pending) root.classList.add('sr-ready'); };
    im.src = (window.SR_TEX && window.SR_TEX[name]) || (TEX + name + (name === 'sun' ? '.png' : '.jpg'));
  }
  for (var mk in M) if (M[mk].t) loadTex(M[mk].t);

  // маркер «куда идти» на полу
  var MK = (function () { var g = { p: [], n: [], u: [] }, s = 28; for (var i = 0; i < s; i++) { var a0 = i / s * 6.2832, a1 = (i + 1) / s * 6.2832;
    [[.22, a0], [.3, a0], [.3, a1], [.22, a0], [.3, a1], [.22, a1]].forEach(function (v) { g.p.push(Math.cos(v[1]) * v[0], .02, Math.sin(v[1]) * v[0]); g.n.push(0, 1, 0); g.u.push(0, 0); }); }
    return upload('marker', g); })();
  var marker = null;

  /* ================= камера и управление ================= */
  var cam = { eye: [-7.6, 2.1, 1.4], look: [8, 2.5, -1.2], fov: 62 }, mode = 'orbit', tween = null, dirty = true;
  var LIM = { x0: L0 + .5, x1: L1 - .5, z0: W0 + .5, z1: W1 - .5 };
  function dirOf() { return norm(sub(cam.look, cam.eye)); }
  function clampWalk(p) { return [Math.max(LIM.x0, Math.min(LIM.x1, p[0])), p[1], Math.max(LIM.z0, Math.min(LIM.z1, p[2]))]; }
  function setYP(yaw, pitch, aroundLook) { // повернуть: в «обзоре» — вокруг точки взгляда, в «прогулке» — вокруг глаз
    pitch = Math.max(-1.45, Math.min(1.45, pitch));
    var d = [Math.cos(pitch) * Math.cos(yaw), Math.sin(pitch), Math.cos(pitch) * Math.sin(yaw)];
    if (aroundLook) { var r = len(sub(cam.eye, cam.look)); cam.eye = sub(cam.look, mul(d, r)); } else cam.look = add(cam.eye, d);
  }
  function getYP() { var d = dirOf(); return { yaw: Math.atan2(d[2], d[0]), pitch: Math.asin(Math.max(-1, Math.min(1, d[1]))) }; }
  function go(eye, look, ms) { tween = { e0: cam.eye.slice(), l0: cam.look.slice(), e1: eye, l1: look, t0: performance.now(), d: ms || 1400 }; dirty = true; }

  var drag = null, keys = {};
  canvas.addEventListener('pointerdown', function (e) { canvas.setPointerCapture(e.pointerId); var yp = getYP(); drag = { x: e.clientX, y: e.clientY, yaw: yp.yaw, pitch: yp.pitch, moved: 0, id: e.pointerId }; tween = null; });
  canvas.addEventListener('pointermove', function (e) {
    if (drag && drag.id === e.pointerId) {
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.moved = Math.max(drag.moved, Math.abs(dx) + Math.abs(dy));
      if (pinch) return;
      if (mode === 'orbit') setYP(drag.yaw + dx * .006, drag.pitch - dy * .005, true);
      else setYP(drag.yaw - dx * .0042, drag.pitch + dy * .0042, false);
      dirty = true;
    } else if (mode === 'walk' && e.pointerType === 'mouse') { var h = floorHit(e); marker = h; dirty = true; }
  });
  canvas.addEventListener('pointerup', function (e) {
    if (drag && drag.moved < 6 && mode === 'walk') { var h = floorHit(e); if (h) { var p = clampWalk([h[0], 1.65, h[2]]), d = sub(p, cam.eye); go(p, add(cam.look, d), 900); } }
    drag = null;
  });
  canvas.addEventListener('pointerleave', function () { marker = null; dirty = true; });
  canvas.addEventListener('wheel', function (e) { if (e.ctrlKey) return; e.preventDefault(); zoom(e.deltaY > 0 ? 1.12 : 1 / 1.12); }, { passive: false });
  function zoom(k) {
    tween = null;
    if (mode === 'orbit') { var r = sub(cam.eye, cam.look), l = Math.max(1.5, Math.min(34, len(r) * k)); cam.eye = add(cam.look, mul(norm(r), l)); }
    else { cam.fov = Math.max(35, Math.min(80, cam.fov * k)); }
    dirty = true;
  }
  // щипок двумя пальцами — масштаб
  var pinch = null, tps = {};
  canvas.addEventListener('touchstart', function (e) { if (e.touches.length === 2) { var a = e.touches[0], b = e.touches[1]; pinch = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); } }, { passive: true });
  canvas.addEventListener('touchmove', function (e) { if (pinch && e.touches.length === 2) { var a = e.touches[0], b = e.touches[1], d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); zoom(pinch / d); pinch = d; } }, { passive: true });
  canvas.addEventListener('touchend', function (e) { if (e.touches.length < 2) pinch = null; }, { passive: true });
  window.addEventListener('keydown', function (e) { if (!root.contains(document.activeElement) && document.activeElement !== document.body) return; keys[e.key.toLowerCase()] = 1; if (/^arrow/.test(e.key.toLowerCase()) && inView()) e.preventDefault(); });
  window.addEventListener('keyup', function (e) { keys[e.key.toLowerCase()] = 0; });
  function inView() { var r = root.getBoundingClientRect(); return r.top < innerHeight * .5 && r.bottom > innerHeight * .5; }

  function floorHit(e) {
    var r = canvas.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width * 2 - 1, ny = 1 - (e.clientY - r.top) / r.height * 2;
    var f = dirOf(), rt = norm(cross(f, [0, 1, 0])), up = cross(rt, f), t = Math.tan(cam.fov * Math.PI / 360);
    var d = norm(add(add(f, mul(rt, nx * t * r.width / r.height)), mul(up, ny * t)));
    if (d[1] > -.01) return null; var k = -cam.eye[1] / d[1], p = add(cam.eye, mul(d, k));
    if (p[0] < LIM.x0 || p[0] > LIM.x1 || p[2] < LIM.z0 || p[2] > LIM.z1) return null; return p;
  }

  /* ================= точки интереса ================= */
  var spots = [].slice.call(root.querySelectorAll('.sr-spot'));
  spots.forEach(function (s) { s._p = s.getAttribute('data-p').split(',').map(Number); });
  var VP = null;
  function project(p) {
    var x = VP[0] * p[0] + VP[4] * p[1] + VP[8] * p[2] + VP[12], y = VP[1] * p[0] + VP[5] * p[1] + VP[9] * p[2] + VP[13], w = VP[3] * p[0] + VP[7] * p[1] + VP[11] * p[2] + VP[15];
    if (w < .1) return null; return [(x / w * .5 + .5) * canvas.clientWidth, (1 - (y / w * .5 + .5)) * canvas.clientHeight, w];
  }

  /* ================= кадр ================= */
  var last = performance.now();
  function frame(now) {
    var dt = Math.min(.05, (now - last) / 1000); last = now;
    if (tween) { var t = Math.min(1, (now - tween.t0) / tween.d), s = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      cam.eye = lerp(tween.e0, tween.e1, s); cam.look = lerp(tween.l0, tween.l1, s); dirty = true; if (t >= 1) tween = null; }
    if (mode === 'walk') {
      var f = dirOf(), fw = norm([f[0], 0, f[2]]), rt = norm(cross(fw, [0, 1, 0])), mv = [0, 0, 0], sp = 2.6 * dt;
      if (keys.w || keys['arrowup'] || keys['ц']) mv = add(mv, fw); if (keys.s || keys['arrowdown'] || keys['ы']) mv = sub(mv, fw);
      if (keys.d || keys['в']) mv = add(mv, rt); if (keys.a || keys['ф']) mv = sub(mv, rt);
      if (keys['arrowleft']) { var yp = getYP(); setYP(yp.yaw - 1.6 * dt, yp.pitch); dirty = true; }
      if (keys['arrowright']) { var yp2 = getYP(); setYP(yp2.yaw + 1.6 * dt, yp2.pitch); dirty = true; }
      if (len(mv) > 0) { var ne = clampWalk(add(cam.eye, mul(norm(mv), sp))), dd = sub(ne, cam.eye); cam.eye = ne; cam.look = add(cam.look, dd); dirty = true; tween = null; }
    }
    if (dirty) { render(); dirty = false; }
    requestAnimationFrame(frame);
  }
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2), w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); dirty = true; }
  }
  function render() {
    resize(); gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(.03, .028, .026, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.enable(gl.DEPTH_TEST);
    var P = persp(cam.fov * Math.PI / 180, canvas.width / canvas.height, .05, 120), V = lookAt(cam.eye, cam.look, [0, 1, 0]); VP = mm(P, V);
    gl.uniformMatrix4fv(U.uVP, false, VP); gl.uniform3fv(U.uCam, cam.eye); gl.uniform1f(U.uExp, 1.15); gl.uniform3fv(U.uOff, [0, 0, 0]);
    var list = DRAW.slice(); if (marker && mode === 'walk') list.push(MK);
    list.forEach(function (d) {
      var m = d.m;
      if (m.dbl || m.blend) gl.disable(gl.CULL_FACE); else { gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK); }
      if (m.blend) { gl.enable(gl.BLEND); gl.depthMask(false); if (m.blend === 'add') gl.blendFunc(gl.SRC_ALPHA, gl.ONE); else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); } else { gl.disable(gl.BLEND); gl.depthMask(true); }
      var tx = m.t && TX[m.t] && TX[m.t].ok ? TX[m.t].t : null;
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tx || white); gl.uniform1i(U.uT, 0); gl.uniform1f(U.uHasT, tx ? 1 : 0);
      var c = m.c || [1, 1, 1]; if (m.t && !tx) c = [c[0] * .45, c[1] * .4, c[2] * .35];
      gl.uniform3fv(U.uC, c); gl.uniform3fv(U.uE, m.e || [0, 0, 0]); gl.uniform1f(U.uA, m.a === undefined ? 1 : m.a); gl.uniform1f(U.uAO, m.e ? 0 : 1);
      gl.uniform3fv(U.uOff, d === MK ? [marker[0], 0, marker[2]] : [0, 0, 0]);
      gl.bindBuffer(gl.ARRAY_BUFFER, d.p); gl.enableVertexAttribArray(A.p); gl.vertexAttribPointer(A.p, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, d.n); gl.enableVertexAttribArray(A.n); gl.vertexAttribPointer(A.n, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, d.u); gl.enableVertexAttribArray(A.u); gl.vertexAttribPointer(A.u, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, d.count);
    });
    gl.depthMask(true);
    // точки интереса
    spots.forEach(function (s) { var q = project(s._p); if (!q || q[0] < -40 || q[1] < -40 || q[0] > canvas.clientWidth + 40 || q[1] > canvas.clientHeight + 40) { s.style.display = 'none'; return; }
      s.style.display = ''; s.style.transform = 'translate(' + q[0].toFixed(1) + 'px,' + q[1].toFixed(1) + 'px)'; s.style.opacity = Math.max(.35, Math.min(1, 16 / q[2])).toFixed(2); });
  }
  window.addEventListener('resize', function () { dirty = true; });

  /* ================= интерфейс ================= */
  var VIEWS = {
    hall: [[-7.6, 2.1, 1.4], [8, 2.5, -1.2]],
    stage: [[1.5, 1.7, 1.2], [-9.5, 3.2, 0]],
    lounge: [[2.4, 1.65, 1.6], [8.4, 1.0, 5.2]],
    bar: [[4.6, 1.65, -.6], [10.5, 1.4, 2.6]],
    mezz: [[11.0, 4.95, -5.4], [-2, 1.2, 2]],
    top: [[0.01, 20, 14], [0, 0, 0]],
    rig: [[-5.8, 1.7, -1.2], [-8.9, 4.7, -2.7]]
  };
  function setMode(m) {
    mode = m; root.classList.toggle('sr-walk', m === 'walk');
    [].forEach.call(root.querySelectorAll('[data-mode]'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-mode') === m ? 'true' : 'false'); });
    if (m === 'walk') { var p = clampWalk([cam.eye[0], 1.65, cam.eye[2]]); var yp = getYP(); var d = [Math.cos(yp.yaw), -.05, Math.sin(yp.yaw)]; if (cam.eye[1] > 3 || cam.eye[1] < 1) go(p, add(p, d), 900); }
    else { cam.fov = 62; }
    dirty = true;
  }
  [].forEach.call(root.querySelectorAll('[data-mode]'), function (b) { b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); }); });
  [].forEach.call(root.querySelectorAll('[data-view]'), function (b) { b.addEventListener('click', function () {
    var v = VIEWS[b.getAttribute('data-view')]; if (!v) return; if (b.getAttribute('data-view') === 'top' || b.getAttribute('data-view') === 'mezz') setMode('orbit'); go(v[0], v[1]); }); });
  [].forEach.call(root.querySelectorAll('[data-zoom]'), function (b) { b.addEventListener('click', function () { zoom(b.getAttribute('data-zoom') === 'in' ? 1 / 1.25 : 1.25); }); });

  // панель с фотографиями
  var panel = root.querySelector('.sr-panel'), pImg = panel.querySelector('img'), pT = panel.querySelector('.sr-pt'), pD = panel.querySelector('.sr-pd'), pN = panel.querySelector('.sr-pn'), cur = null, ci = 0;
  function showPh() { var ph = cur.ph[ci]; pImg.src = ph; pN.textContent = (ci + 1) + ' / ' + cur.ph.length; panel.querySelector('.sr-pprev').hidden = panel.querySelector('.sr-pnext').hidden = cur.ph.length < 2; }
  spots.forEach(function (s) { s.addEventListener('click', function () {
    cur = { ph: s.getAttribute('data-ph').split(','), t: s.querySelector('b').textContent, d: s.getAttribute('data-d') }; ci = 0;
    pT.textContent = cur.t; pD.textContent = cur.d; showPh(); panel.hidden = false; root.classList.add('sr-pan');
    var v = VIEWS[s.getAttribute('data-view')]; if (v) go(v[0], v[1]);
  }); });
  panel.querySelector('.sr-pclose').addEventListener('click', function () { panel.hidden = true; root.classList.remove('sr-pan'); });
  panel.querySelector('.sr-pprev').addEventListener('click', function () { ci = (ci - 1 + cur.ph.length) % cur.ph.length; showPh(); });
  panel.querySelector('.sr-pnext').addEventListener('click', function () { ci = (ci + 1) % cur.ph.length; showPh(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { panel.hidden = true; root.classList.remove('sr-pan'); } });

  // полноэкранный режим
  var fsb = root.querySelector('[data-fs]');
  if (fsb) fsb.addEventListener('click', function () { if (document.fullscreenElement) document.exitFullscreen(); else if (root.requestFullscreen) root.requestFullscreen(); });
  document.addEventListener('fullscreenchange', function () { dirty = true; });

  window.__sr = { cam: cam, go: go, setMode: setMode, VIEWS: VIEWS, redraw: function () { dirty = true; } };
  requestAnimationFrame(frame);
})();
