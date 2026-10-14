/* Общие функции сайта: вкладки, раскрытие, анимации, помощники отрисовки. */
(function () {
  'use strict';
  var D = window.SITE_DATA || { candidates: [], groups: [], reports: [], blockMax: [], blockNames: [] };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var icon = function (n, cls) { return '<svg class="ic ' + (cls || '') + '" aria-hidden="true"><use href="#i-' + n + '"/></svg>'; };

  var GROUP = {
    1: { cls: 'g1', name: 'Сильный кандидат', short: 'Сильные', hint: 'Подтверждённый Senior, приоритет для задания и интервью' },
    2: { cls: 'g2', name: 'Стоит рассматривать', short: 'Рассматриваем', hint: 'Подходит по уровню, есть вопросы для проверки' },
    3: { cls: 'g3', name: 'Под вопросом', short: 'Под вопросом', hint: 'Пограничный уровень, решение даёт задание' },
    4: { cls: 'g4', name: 'Не соответствует Senior', short: 'Не Senior', hint: 'Задание не выдавалось' }
  };
  var STATUS = {
    done: { cls: 'b-done', icon: 'check', label: 'Задание сдано' },
    waiting: { cls: 'b-wait', icon: 'hourglass', label: 'Ждём ответ' },
    none: { cls: 'b-none', icon: 'x', label: 'Задание не выдавалось' }
  };
  var FILE_TYPES = {
    resume: { label: 'Резюме', plural: 'Резюме', icon: 'file' },
    assessment: { label: 'Первичная оценка', plural: 'Первичные оценки', icon: 'filetext' },
    task: { label: 'Тестовое задание', plural: 'Тестовые задания', icon: 'flask' },
    checks: { label: 'Что проверяем', plural: 'Что проверяем', icon: 'target' },
    answer: { label: 'Ответ кандидата', plural: 'Ответы кандидатов', icon: 'check' },
    review: { label: 'Проверка ответа', plural: 'Проверки ответов', icon: 'award' }
  };

  function initials(name) {
    var w = String(name).replace(/[()]/g, '').split(/\s+/).filter(Boolean);
    return ((w[0] || '?')[0] + (w[1] ? w[1][0] : '')).toUpperCase();
  }
  function fmtSize(b) { if (b < 1024) { return b + ' Б'; } if (b < 1048576) { return Math.round(b / 1024) + ' КБ'; } return (b / 1048576).toFixed(1) + ' МБ'; }
  function scoreCls(s) { return s >= 85 ? 'sc-high' : s >= 70 ? 'sc-good' : s >= 55 ? 'sc-mid' : 'sc-low'; }
  function scoreBar(s) { return s >= 85 ? 'green' : s >= 70 ? '' : s >= 55 ? 'amber' : 'rose'; }
  function byId(id) { return D.candidates.filter(function (c) { return c.id === id; })[0]; }
  function fileOf(c, type) { return (c.files || []).filter(function (f) { return f.type === type; }); }

  function groupBadge(c) { var g = GROUP[c.group]; return '<span class="badge b-' + g.cls + '">' + esc(g.name) + '</span>'; }
  function batchBadge(c) { return c.batch === 'new' ? '<span class="badge b-new">' + icon('sparkles') + 'Новый</span>' : '<span class="badge b-old">Основная база</span>'; }
  function statusBadge(c) { var s = STATUS[c.test.status]; var ic = c.test.status === 'waiting' ? '<span class="pulse">' + icon('hourglass') + '</span>' : icon(s.icon); return '<span class="badge ' + s.cls + '">' + ic + s.label + '</span>'; }
  function skillMark(v) { var m = v === '✓' ? ['y', '✓'] : v === '~' ? ['p', '~'] : ['n', '–']; return '<span class="sk ' + m[0] + '" title="' + (v === '✓' ? 'Есть подтверждение' : v === '~' ? 'Упомянуто поверхностно' : 'Нет') + '">' + m[1] + '</span>'; }
  function ring(score, size) {
    return '<div class="ring ' + (size || '') + ' ' + scoreCls(score) + '" style="--val:' + score + '" title="Балл: ' + score + ' из 100"><svg viewBox="0 0 64 64"><circle class="trk" cx="32" cy="32" r="26.2"/><circle class="val" cx="32" cy="32" r="26.2"/></svg><b>' + score + '</b></div>';
  }
  function hl(text, q) {
    var t = esc(text); if (!q) { return t; }
    var i = String(text).toLowerCase().indexOf(q.toLowerCase()); if (i < 0) { return t; }
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
  }
  function fileLink(f, cls) {
    return '<a class="' + (cls || 'icon-btn') + '" href="' + esc(f.path) + '" download title="' + esc(f.label) + ' (' + esc(f.ext.toUpperCase()) + ')">' + icon('download') + '</a>';
  }

  function cardHTML(c, q) {
    var t = c.test;
    var score = t.status === 'done' ? '<div class="cand-score">' + ring(t.score) + '</div>' : '';
    var status = '<span class="status">' + (t.status === 'waiting' ? '<span class="pulse">' + icon('hourglass') + '</span><span class="dots">Ждём ответ</span>' : t.status === 'done' ? icon('check') + ' Сдано · ' + esc(t.verdict) : icon('x') + ' Задание не выдавалось') + '</span>';
    return '<a class="card cand" href="candidate.html?id=' + encodeURIComponent(c.id) + '" data-reveal>' + score +
      '<div class="cand-top"><div class="avatar av' + c.group + '">' + esc(initials(c.name)) + '</div><div style="min-width:0;padding-right:' + (score ? '58px' : '0') + '"><h3>' + hl(c.name, q) + '</h3><div class="role">' + esc(c.role || '—') + '</div></div></div>' +
      '<div class="cand-meta">' + groupBadge(c) + batchBadge(c) + '<span class="badge">' + esc(c.level || '—') + '</span>' + (c.exp && c.exp !== '—' ? '<span class="badge">' + icon('briefcase') + esc(c.exp) + '</span>' : '') + '</div>' +
      '<div class="short">' + esc(c.short) + '</div>' +
      '<div class="cand-foot">' + status + '<span class="spacer"></span>' + '</div></a>';
  }

  /* ---------- Вкладки ---------- */
  function initTabs(root) {
    $$('[data-tabs]', root || document).forEach(function (box) {
      if (box.__tabs) { return; } box.__tabs = true;
      var tabs = $$('.tab', box), panels = $$('.tab-panel', box);
      function show(id, silent) {
        tabs.forEach(function (t) { var on = t.getAttribute('data-tab') === id; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', on); });
        panels.forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-panel') === id); });
        if (!silent && box.getAttribute('data-hash')) { try { history.replaceState(null, '', '#' + box.getAttribute('data-hash') + '=' + id); } catch (e) { location.hash = box.getAttribute('data-hash') + '=' + id; } }
        reveal(box); box.dispatchEvent(new CustomEvent('tabchange', { detail: id }));
      }
      tabs.forEach(function (t) { t.addEventListener('click', function () { show(t.getAttribute('data-tab')); }); });
      var key = box.getAttribute('data-hash'), start = null;
      if (key) { var m = location.hash.match(new RegExp('[#&]' + key + '=([^&]+)')); if (m) { start = decodeURIComponent(m[1]); } }
      if (!start || !tabs.some(function (t) { return t.getAttribute('data-tab') === start; })) { start = (tabs.filter(function (t) { return t.classList.contains('is-active'); })[0] || tabs[0]).getAttribute('data-tab'); }
      show(start, true);
    });
  }

  /* ---------- Аккордеон (делегирование) ---------- */
  document.addEventListener('click', function (e) {
    var h = e.target.closest('.acc-head'); if (!h) { return; }
    var acc = h.parentElement; var open = !acc.classList.contains('is-open');
    acc.classList.toggle('is-open', open); h.setAttribute('aria-expanded', open);
    if (open) { reveal(acc); }
  });

  /* ---------- Появление при прокрутке, полосы, кольца, счётчики ---------- */
  var io = null;
  function animateCount(el) {
    var to = parseFloat(el.getAttribute('data-count')) || 0, t0 = null, dur = 900;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = to; return; }
    function step(ts) { if (!t0) { t0 = ts; } var p = Math.min(1, (ts - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) { requestAnimationFrame(step); } }
    requestAnimationFrame(step);
    setTimeout(function () { el.textContent = to; }, dur + 250);
  }
  function mark(el) { el.classList.add('is-in'); if (el.hasAttribute('data-count')) { animateCount(el); } }
  function reveal(root) {
    var els = $$('[data-reveal], .bar, .ring, [data-count]', root || document);
    els.forEach(function (el) {
      if (el.__seen) { return; }
      if (!('IntersectionObserver' in window)) { mark(el); el.__seen = true; return; }
      if (!io) { io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { mark(x.target); io.unobserve(x.target); } }); }, { threshold: 0.12 }); }
      el.__seen = true; io.observe(el);
    });
  }

  /* ---------- Уведомление ---------- */
  var toastEl, toastT;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; document.body.appendChild(toastEl); }
    toastEl.innerHTML = icon('check') + esc(msg); toastEl.classList.add('show'); clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[download]'); if (a) { toast('Скачивание: ' + (a.getAttribute('title') || 'файл')); }
  });

  /* ---------- Шапка: меню, активная ссылка, наверх ---------- */
  function initChrome() {
    var page = document.body.getAttribute('data-page');
    $$('.nav a').forEach(function (a) { if (a.getAttribute('data-nav') === page) { a.classList.add('is-active'); } });
    var tg = $('.nav-toggle');
    if (tg) { tg.addEventListener('click', function () { var o = document.body.classList.toggle('nav-open'); tg.setAttribute('aria-expanded', o); }); }
    var up = document.createElement('button'); up.className = 'icon-btn to-top'; up.title = 'Наверх'; up.innerHTML = icon('arrowup');
    up.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); }); document.body.appendChild(up);
    window.addEventListener('scroll', function () { up.classList.toggle('show', window.scrollY > 500); }, { passive: true });
    var g = $('[data-generated]'); if (g) { g.textContent = D.generated; }
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '')) { var s = $('[data-search]'); if (s) { e.preventDefault(); s.focus(); } }
    });
  }

  function stats() {
    var cs = D.candidates, done = cs.filter(function (c) { return c.test.status === 'done'; });
    return {
      total: cs.length,
      fresh: cs.filter(function (c) { return c.batch === 'new'; }).length,
      issued: cs.filter(function (c) { return c.test.status !== 'none'; }).length,
      done: done.length,
      waiting: cs.filter(function (c) { return c.test.status === 'waiting'; }).length,
      none: cs.filter(function (c) { return c.test.status === 'none'; }).length,
      recommended: done.filter(function (c) { return c.test.score >= 70; }).length,
      byGroup: [1, 2, 3, 4].map(function (g) { return cs.filter(function (c) { return c.group === g; }); })
    };
  }

  window.App = { D: D, $: $, $$: $$, esc: esc, icon: icon, GROUP: GROUP, STATUS: STATUS, FILE_TYPES: FILE_TYPES, initials: initials, fmtSize: fmtSize, scoreCls: scoreCls, scoreBar: scoreBar, byId: byId, fileOf: fileOf,
    groupBadge: groupBadge, batchBadge: batchBadge, statusBadge: statusBadge, skillMark: skillMark, ring: ring, hl: hl, fileLink: fileLink, cardHTML: cardHTML,
    initTabs: initTabs, reveal: reveal, toast: toast, stats: stats };

  document.addEventListener('DOMContentLoaded', function () { initChrome(); initTabs(); reveal(); });
})();
