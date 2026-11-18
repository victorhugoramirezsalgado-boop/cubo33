// © 2026 Víctor Hugo Ramírez Salgado — CUBO33 · Propuesta F «Verde fino»
// Botón «Regresar» al sitio de origen, cubo 33, etapas, pronunciación, Morse sonoro y selector de idiomas.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // ---- Origen: ?origen=clave o la página de la familia que abrió CUBO33 ----
  const ORIGENES = {
    sosistem: { nombre: 'SOSistem', url: 'https://sosistem.com', hosts: ['sosistem.com'] },
    intertopia: { nombre: 'Intertopía', url: 'https://xn--intertopa-n5a.com', hosts: ['xn--intertopa-n5a.com', 'intertopia.com'] },
    econotopia: { nombre: 'Econotopía', url: 'https://xn--econotopa-n5a.com', hosts: ['xn--econotopa-n5a.com', 'econotopia.com'] },
    unoint: { nombre: '1ntertopía', url: 'https://xn--1ntertopa-n5a.com', hosts: ['xn--1ntertopa-n5a.com', '1ntertopia.com'] },
    codigocubico: { nombre: 'Código Cúbico', url: 'https://codigocubico.com', hosts: ['codigocubico.com'] },
    tcontenedores: { nombre: 'Trazabilidad de contenedores', url: 'https://tcontenedores.com', hosts: ['tcontenedores.com'] },
    contenedorens: { nombre: 'ContenedorEns', url: 'https://contenedorens.com', hosts: ['contenedorens.com'] },
    arsa: { nombre: 'Arsa Bodegas', url: 'https://arsabodegas.com', hosts: ['arsabodegas.com'] },
    vhrs: { nombre: 'VHRS', url: 'https://victorhugoramirezsalgado.com', hosts: ['victorhugoramirezsalgado.com'] },
  };
  const guarda = (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} };
  const lee = (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } };

  function detectaOrigen() {
    let clave = null, url = null;
    try {
      const q = new URLSearchParams(location.search);
      clave = (q.get('origen') || '').toLowerCase();
      url = q.get('volver');
    } catch (e) {}
    if (!ORIGENES[clave]) {
      clave = null;
      try {
        const ref = document.referrer ? new URL(document.referrer) : null;
        if (ref && ref.hostname !== location.hostname) {
          const h = ref.hostname.replace(/^www\./, '');
          for (const [k, o] of Object.entries(ORIGENES)) if (o.hosts.includes(h)) { clave = k; url = ref.href; break; }
        }
      } catch (e) {}
    }
    if (clave) { guarda('c33-origen', clave); if (url) guarda('c33-volver', url); }
    else { clave = lee('c33-origen'); url = lee('c33-volver'); }
    return ORIGENES[clave] ? { clave, ...ORIGENES[clave], url: seguro(url, ORIGENES[clave]) } : null;
  }
  // Solo se acepta una liga de regreso que pertenezca al mismo sitio de la familia
  function seguro(url, o) {
    try { const u = new URL(url); if (u.protocol === 'https:' && o.hosts.includes(u.hostname.replace(/^www\./, ''))) return u.href; } catch (e) {}
    return o.url;
  }

  const origen = detectaOrigen();
  const barra = $('#regreso');
  if (origen && barra) {
    barra.removeAttribute('data-sin-origen');
    $$('.origen-nombre').forEach((el) => { el.textContent = origen.nombre; });
    const b = $('#btn-regresar'); b.href = origen.url;
    const p = $('#pie-regresar'); if (p) { p.href = origen.url; p.textContent = 'Regresar a ' + origen.nombre; }
    $$('[data-sitio]').forEach((a) => a.classList.toggle('on', a.dataset.sitio === origen.clave));
    // Si la página de origen sigue abierta en otra pestaña, se vuelve a ella; si no, se abre su liga
    b.addEventListener('click', (e) => {
      try { if (window.opener && !window.opener.closed) { e.preventDefault(); window.opener.focus(); window.close(); } } catch (err) {}
    });
  }

  // ---- Cubo 33: girar o detenerse en una cara ----
  const cubo = $('#cubo33');
  const POS = ['rotateX(-10deg) rotateY(0deg)', 'rotateX(-10deg) rotateY(-90deg)', 'rotateX(-10deg) rotateY(-180deg)',
    'rotateX(-10deg) rotateY(-270deg)', 'rotateX(-90deg) rotateY(0deg)', 'rotateX(90deg) rotateY(0deg)'];
  $$('[data-cara]').forEach((btn) => btn.addEventListener('click', () => {
    const i = Number(btn.dataset.cara);
    $$('[data-cara]').forEach((x) => x.setAttribute('aria-pressed', String(x === btn)));
    if (i < 0) { cubo.style.transform = ''; cubo.classList.add('gira'); }
    else {
      const actual = getComputedStyle(cubo).transform;
      cubo.classList.remove('gira');
      cubo.style.transform = actual === 'none' ? '' : actual;
      requestAnimationFrame(() => requestAnimationFrame(() => { cubo.style.transform = POS[i]; }));
    }
  }));

  // ---- Etapas del juego ----
  $$('[data-etapa]').forEach((tab) => tab.addEventListener('click', () => {
    $$('[data-etapa]').forEach((t) => {
      const on = t === tab; t.setAttribute('aria-selected', String(on));
      const panel = document.getElementById('etapa-' + t.dataset.etapa); if (panel) panel.hidden = !on;
    });
  }));

  // ---- Voz del teléfono ----
  function hablar(texto, voz) {
    try {
      const s = window.speechSynthesis; if (!s) return;
      s.cancel(); const u = new SpeechSynthesisUtterance(texto); u.lang = voz; u.rate = 0.85; s.speak(u);
    } catch (e) {}
  }
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-decir]'); if (el) hablar(el.dataset.decir, el.dataset.voz);
  });
  let sel = $('[data-lang][aria-pressed="true"]');
  $$('[data-lang]').forEach((b) => b.addEventListener('click', () => {
    $$('[data-lang]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    sel = b;
    $('#sel-escrito').textContent = b.dataset.texto;
    $('#sel-lectura').textContent = b.dataset.lectura;
    $('#sel-ipa').textContent = b.dataset.ipa;
    hablar(b.dataset.texto, b.dataset.voz);
  }));
  const hs = $('#hablar-sel'); if (hs) hs.addEventListener('click', () => { if (sel) hablar(sel.dataset.texto, sel.dataset.voz); });

  // ---- Morse sonoro (al tocar) ----
  const M = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
    0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.' };
  const limpia = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
  const aMorse = (t) => limpia(t).split(' ').map((p) => p.split('').map((c) => M[c] || '').filter(Boolean).join(' ')).join(' / ');
  const salida = $('#morse');
  let ctx = null, hasta = 0;
  function toca(texto) {
    const codigo = aMorse(texto);
    if (salida) salida.textContent = codigo.replace(/\./g, '·').replace(/-/g, '–');
    try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    if (ctx.state === 'suspended') ctx.resume();
    const u = 0.07; let t = Math.max(ctx.currentTime + 0.05, hasta);
    for (const s of codigo) {
      if (s === '.' || s === '-') {
        const o = ctx.createOscillator(), g = ctx.createGain(), d = s === '.' ? u : 3 * u;
        o.frequency.value = 640; o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.25, t + 0.005);
        g.gain.setValueAtTime(0.25, t + d - 0.005); g.gain.linearRampToValueAtTime(0, t + d);
        o.start(t); o.stop(t + d + 0.02); t += d + u;
      } else if (s === ' ') t += 2 * u; else if (s === '/') t += 4 * u;
    }
    hasta = t;
  }
  document.addEventListener('click', (e) => { const el = e.target.closest('[data-morse]'); if (el) toca(el.dataset.morse); });

  // ---- Selector de idiomas (traducción automática de Google) ----
  const idioma = $('#idioma');
  if (idioma) idioma.addEventListener('change', (e) => {
    const l = e.target.value; if (!l) return;
    const host = location.hostname.replace(/-/g, '--').replace(/\./g, '-');
    location.href = `https://${host}.translate.goog${location.pathname}?_x_tr_sl=es&_x_tr_tl=${l}&_x_tr_hl=${l}`;
  });
})();
