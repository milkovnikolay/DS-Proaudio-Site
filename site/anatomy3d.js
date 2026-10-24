/* Анатомия TAURA 8: интерактивная 3D-взрыв-схема (страница «Производство», блок #anatomy).
   Модель: assets/3d/taura8.dat — сборка из CAD, упрощена и сжата meshopt.
   У каждой части в extras: g — группа, d — смещение в разобранном виде (м), f — крепёж (скрывается при разборке).
   Список цехов справа связан с моделью: наведение на строку подсвечивает детали, щелчок по детали — строку. */
const box = document.querySelector('#anatomy .an-pic');
if (box) init();

function init() {
  const DAT = './assets/3d/taura8.dat', SIZE = '2,7 МБ';
  const G = {
    cab:    { t: 'Корпус',                    li: 0, delay: .16 },
    back:   { t: 'Задняя панель с разъёмами', li: 0, delay: .12 },
    grille: { t: 'Защитная сетка',            li: 4, delay: 0 },
    sideL:  { t: 'Риггинг и боковина',        li: 5, delay: .06 },
    sideR:  { t: 'Риггинг и боковина',        li: 5, delay: .06 },
    wave:   { t: 'Волновод',                  li: 3, delay: .26 },
    lwL:    { t: 'НЧ-волновод',               li: 3, delay: .30 },
    lwR:    { t: 'НЧ-волновод',               li: 3, delay: .30 },
    lfL:    { t: 'НЧ-динамик 8″',             li: 1, delay: .32 },
    lfR:    { t: 'НЧ-динамик 8″',             li: 1, delay: .32 },
    hfT:    { t: 'ВЧ-драйвер',                li: 2, delay: .38 },
    hfB:    { t: 'ВЧ-драйвер',                li: 2, delay: .42 },
  };
  const LI = [...document.querySelectorAll('#anatomy .an-list .pa')];
  const LI_GROUPS = [['cab', 'back'], ['lfL', 'lfR'], ['hfT', 'hfB'], ['wave', 'lwL', 'lwR'], ['grille'], ['sideL', 'sideR'], [], Object.keys(G)];

  // ---- оболочка: постер, кнопка, панель управления ----
  box.classList.add('a3');
  box.innerHTML = `
    <img class="a3-poster" src="./assets/3d/taura8-poster.jpg" alt="TAURA 8 — 3D-модель" loading="lazy">
    <button type="button" class="a3-load">Открыть 3D-модель <span>${SIZE}</span></button>
    <div class="a3-tip" hidden></div>
    <div class="a3-ui" hidden>
      <button type="button" class="a3-play" aria-label="Собрать / разобрать">Разобрать</button>
      <input class="a3-range" type="range" min="0" max="1000" value="0" aria-label="Степень разборки">
      <span class="a3-hint">Тяните, чтобы повернуть</span>
    </div>
    <div class="a3-wait" hidden><i></i>Загрузка модели…</div>`;
  const $ = s => box.querySelector(s);
  const btn = $('.a3-load'), ui = $('.a3-ui'), range = $('.a3-range'), play = $('.a3-play'), tip = $('.a3-tip'), wait = $('.a3-wait');

  let started = false;
  const auto = window.innerWidth >= 760 && !(navigator.connection && navigator.connection.saveData);
  const io = new IntersectionObserver(es => {
    for (const e of es) if (e.isIntersecting && auto && !started) start();
  }, { rootMargin: '300px 0px' });
  io.observe(box);
  btn.addEventListener('click', start);

  async function start() {
    if (started) return; started = true;
    btn.hidden = true; wait.hidden = false;
    let THREE, GLTFLoader, OrbitControls, MeshoptDecoder, RoomEnvironment;
    try {
      [THREE, { GLTFLoader }, { OrbitControls }, { MeshoptDecoder }, { RoomEnvironment }] = await Promise.all([
        import('./vendor/three/three.module.min.js'), import('./vendor/three/GLTFLoader.js'), import('./vendor/three/OrbitControls.js'),
        import('./vendor/three/meshopt_decoder.module.js'), import('./vendor/three/RoomEnvironment.js')]);
    } catch (e) { wait.textContent = '3D-просмотр недоступен в этом браузере'; return; }

    const R = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.NeutralToneMapping; R.toneMappingExposure = 1.05;
    const cv = R.domElement; cv.className = 'a3-cv'; box.prepend(cv);
    const scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(R); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(1.5, 2.5, 2); scene.add(key);
    const cam = new THREE.PerspectiveCamera(28, 1, 0.01, 50);
    const ctl = new OrbitControls(cam, cv);
    ctl.enableZoom = false; ctl.enablePan = false; ctl.enableDamping = true; ctl.dampingFactor = .08;
    ctl.minPolarAngle = .15; ctl.maxPolarAngle = 1.75; ctl.autoRotate = !window.__a3NoAuto; ctl.autoRotateSpeed = .6;

    const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
    let gltf;
    try {
      const buf = await (await fetch(DAT)).arrayBuffer(), u = new Uint32Array(buf);
      let x = 0x5DA1C0DE >>> 0;
      for (let i = 0; i < u.length; i++) { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; u[i] ^= x; }
      gltf = await loader.parseAsync(buf, './assets/3d/');
    } catch (e) { wait.textContent = 'Не удалось загрузить модель'; return; }
    const root = gltf.scene; scene.add(root);
    const parts = [], meshes = [];
    root.children.forEach(n => {
      const d = n.userData.d || [0, 0, 0], g = n.userData.g;
      const p = { n, g, f: !!n.userData.f, d: new THREE.Vector3(...d), mats: [] };
      n.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.userData.part = p; p.mats.push(o.material); meshes.push(o); } });
      parts.push(p);
    });

    // рамки кадра: собранное и разобранное состояние
    const b0 = new THREE.Box3().setFromObject(root);
    setT(1); const b1 = new THREE.Box3().setFromObject(root); setT(0);
    const fit = (b) => { const s = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3()); return { c, r: s.length() / 2 }; };
    const F0 = fit(b0), F1 = fit(b1);
    const dir = new THREE.Vector3(Math.sin(.62) * Math.cos(.38), Math.sin(.38), Math.cos(.62) * Math.cos(.38));

    let T = 0, target = 0, anim = null, dist = 1;
    function ease(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
    function setT(t) {
      for (const p of parts) {
        const dl = (G[p.g] && G[p.g].delay) || 0, k = ease(Math.max(0, Math.min(1, (t - dl * .6) / (1 - .42 * .6))));
        p.n.position.copy(p.d).multiplyScalar(k);
        if (p.f) p.n.visible = t < .25;
      }
    }
    // кадрирование: подобрать дистанцию, чтобы все углы рамки вошли в кадр (снизу — место под панель)
    const corners = b => { const r = []; for (let i = 0; i < 8; i++) r.push(new THREE.Vector3(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z)); return r; };
    const partCorners = t => { setT(t); root.updateMatrixWorld(true); const r = [];
      for (const m of meshes) { if (m.userData.part.f) continue; m.geometry.computeBoundingBox(); r.push(...corners(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld))); }
      return r; };
    const C1 = partCorners(1), C0 = partCorners(0);
    function frame(t) {
      const pts = C0.map((p, i) => p.clone().lerp(C1[i], t));
      const off = cam.position.clone().sub(ctl.target); if (off.lengthSq() < 1e-6) off.copy(dir);
      off.normalize();
      const c = F0.c.clone().lerp(F1.c, t), Y0 = -.62, Y1 = .86, X = .9;
      const ext = () => { cam.updateMatrixWorld(); let a = [9, 9, -9, -9]; for (const p of pts) { const v = p.clone().project(cam); a = [Math.min(a[0], v.x), Math.min(a[1], v.y), Math.max(a[2], v.x), Math.max(a[3], v.y)]; } return a; };
      for (let it = 0; it < 3; it++) {
        let lo = .2, hi = 8;
        for (let k = 0; k < 22; k++) {
          const d = (lo + hi) / 2; cam.position.copy(c).addScaledVector(off, d); cam.lookAt(c);
          const e = ext(); if (e[0] < -X || e[2] > X || e[1] < Y0 || e[3] > Y1) lo = d; else hi = d;
        }
        cam.position.copy(c).addScaledVector(off, hi); cam.lookAt(c); dist = hi;
        const e = ext(), h = Math.tan(cam.fov * Math.PI / 360) * hi, w = h * cam.aspect;
        const dx = (e[0] + e[2]) / 2, dy = (e[1] + e[3]) / 2 - (Y0 + Y1) / 2;
        const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1);
        c.addScaledVector(right, dx * w).addScaledVector(up, dy * h);
      }
      ctl.target.copy(c); cam.position.copy(c).addScaledVector(off, dist); cam.lookAt(c);
    }
    cam.position.copy(dir);
    function resize() {
      const w = box.clientWidth, h = box.clientHeight; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); frame(T); dirty = true;
    }
    new ResizeObserver(resize).observe(box);

    // ---- подсветка ----
    let hl = null;
    function highlight(groups) {
      hl = groups && groups.length ? new Set(groups) : null;
      for (const p of parts) for (const m of p.mats) {
        const on = !hl || hl.has(p.g);
        m.transparent = !on; m.opacity = on ? 1 : .12; m.depthWrite = on; m.needsUpdate = true;
      }
      LI.forEach((li, i) => li.classList.toggle('a3-on', !!hl && i < 7 && LI_GROUPS[i].some(g => hl.has(g)) && LI_GROUPS[i].length));
      dirty = true;
    }
    LI.forEach((li, i) => {
      li.addEventListener('mouseenter', () => highlight(LI_GROUPS[i]));
      li.addEventListener('mouseleave', () => highlight(null));
      li.addEventListener('click', e => { if (!e.target.closest('a')) highlight(LI_GROUPS[i]); });
    });

    // ---- наведение и щелчок по детали ----
    const ray = new THREE.Raycaster(), mp = new THREE.Vector2();
    function pick(e) {
      const r = cv.getBoundingClientRect(); mp.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
      ray.setFromCamera(mp, cam);
      const hit = ray.intersectObjects(meshes.filter(m => m.visible && m.parent.parent.visible && (!hl || hl.has(m.userData.part.g))), false)[0];
      return hit ? hit.object : null;
    }
    let downXY = null;
    cv.addEventListener('pointerdown', e => { downXY = [e.clientX, e.clientY]; stopAuto(); });
    cv.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' || e.buttons) { tip.hidden = true; return; }
      const m = pick(e);
      if (!m) { tip.hidden = true; cv.style.cursor = 'grab'; return; }
      const p = m.userData.part, g = G[p.g] || { t: '' };
      tip.innerHTML = '<b>' + g.t + '</b>' + (m.name && m.name !== g.t && !/^mesh_\d/.test(m.name) ? '<span>' + m.name + '</span>' : '');
      const r = box.getBoundingClientRect(); tip.style.left = (e.clientX - r.left + 14) + 'px'; tip.style.top = (e.clientY - r.top + 14) + 'px';
      tip.hidden = false; cv.style.cursor = 'pointer';
    });
    cv.addEventListener('pointerleave', () => { tip.hidden = true; });
    cv.addEventListener('click', e => {
      if (downXY && Math.hypot(e.clientX - downXY[0], e.clientY - downXY[1]) > 5) return;
      const m = pick(e);
      if (!m) { highlight(null); return; }
      const g = m.userData.part.g, li = G[g] ? G[g].li : -1;
      highlight(li >= 0 ? LI_GROUPS[li] : [g]);
      if (li >= 0 && LI[li] && window.innerWidth < 760) LI[li].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    // ---- разборка: ползунок и кнопка ----
    function go(to, ms) { anim = { from: T, to, t0: performance.now(), ms: ms || 2200 }; play.textContent = to > .5 ? 'Собрать' : 'Разобрать'; }
    range.addEventListener('input', () => { anim = null; T = range.value / 1000; setT(T); frame(T); play.textContent = T > .5 ? 'Собрать' : 'Разобрать'; dirty = true; stopAuto(); });
    play.addEventListener('click', () => { stopAuto(); go(T > .5 ? 0 : 1); });
    function stopAuto() { ctl.autoRotate = false; }

    let dirty = true, visible = true;
    ctl.addEventListener('change', () => { dirty = true; });
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(box);
    function loop(now) {
      requestAnimationFrame(loop);
      if (!visible) return;
      if (anim) {
        const k = Math.min(1, (now - anim.t0) / anim.ms); T = anim.from + (anim.to - anim.from) * k;
        setT(T); frame(T); range.value = Math.round(T * 1000); dirty = true; if (k >= 1) anim = null;
      }
      ctl.update();
      if (dirty || ctl.autoRotate) { R.render(scene, cam); dirty = false; }
    }
    resize(); setT(0); frame(0);
    wait.hidden = true; ui.hidden = false; box.classList.add('a3-ready');
    requestAnimationFrame(loop);
    if (!window.__a3NoAuto) setTimeout(() => go(1, 2600), 500);
  }
}
