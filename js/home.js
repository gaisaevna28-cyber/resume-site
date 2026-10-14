/* Главная страница: статистика, воронка, лидеры, уровни, ожидание ответов. */
(function () {
  'use strict';
  var A = window.App, S = A.stats(), esc = A.esc, icon = A.icon;

  // Поиск: переход на список кандидатов
  var f = document.getElementById('heroSearch');
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = f.querySelector('input').value.trim();
    location.href = 'candidates.html' + (q ? '#q=' + encodeURIComponent(q) : '');
  });

  // Карточки статистики
  var cards = [
    { n: S.total, l: 'Кандидатов в отборе', i: 'users', c: '' },
    { n: S.fresh, l: 'Из них новых (партия 3)', i: 'sparkles', c: 's-lilac' },
    { n: S.issued, l: 'Получили задание', i: 'flask', c: 's-amber' },
    { n: S.done, l: 'Сдали и проверены', i: 'check', c: 's-green' },
    { n: S.waiting, l: 'Ждём ответ', i: 'hourglass', c: 's-rose' }
  ];
  document.getElementById('statCards').innerHTML = cards.map(function (c, i) {
    return '<div class="card stat ' + c.c + '" data-reveal style="--d:' + (i * 70) + 'ms"><div class="ico">' + icon(c.i, 'ic-lg') + '</div><div class="num" data-count="' + c.n + '">0</div><div class="lbl">' + c.l + '</div></div>';
  }).join('');

  // Воронка
  var rows = [
    { n: 'Все кандидаты', v: S.total, c: '' },
    { n: 'Уровень не ниже «Под вопросом»', v: S.total - S.byGroup[3].length, c: 'lilac' },
    { n: 'Получили задание', v: S.issued, c: 'amber' },
    { n: 'Сдали задание', v: S.done, c: 'green' },
    { n: 'Балл 70+ (можно на интервью)', v: S.recommended, c: 'green' }
  ];
  document.getElementById('funnel').innerHTML = rows.map(function (r) {
    return '<div class="funnel-row"><span class="name">' + r.n + '</span><div class="bar ' + r.c + '" style="--w:' + Math.max(4, Math.round(r.v / S.total * 100)) + '%"><i></i></div><b>' + r.v + '</b></div>';
  }).join('');

  // Лидеры
  var done = A.D.candidates.filter(function (c) { return c.test.status === 'done'; }).sort(function (a, b) { return b.test.score - a.test.score; });
  document.getElementById('leaders').innerHTML = done.length ? done.map(function (c, i) {
    return '<a class="leader" href="candidate.html?id=' + encodeURIComponent(c.id) + '#tab=test" style="color:inherit;text-decoration:none"><span class="rank">' + (i + 1) + '</span><div><b>' + esc(c.name) + '</b><div class="bar ' + A.scoreBar(c.test.score) + '" style="--w:' + c.test.score + '%"><i></i></div></div><span class="score">' + c.test.score + '</span></a>';
  }).join('') : '<p class="muted">Пока нет проверенных заданий.</p>';

  // Уровни
  var lv = '';
  [1, 2, 3, 4].forEach(function (g, i) {
    var list = S.byGroup[g - 1], G = A.GROUP[g];
    lv += '<a class="card level-card lvl' + g + '" href="candidates.html#g=' + g + '" data-reveal style="--d:' + (i * 70) + 'ms"><span class="big" data-count="' + list.length + '">0</span><h3>' + esc(G.name) + '</h3><span class="muted small">' + esc(G.hint) + '</span><ul>' +
      list.slice(0, 4).map(function (c) { return '<li>' + esc(c.name) + '</li>'; }).join('') + (list.length > 4 ? '<li class="muted">и ещё ' + (list.length - 4) + '…</li>' : '') + '</ul></a>';
  });
  document.getElementById('levels').innerHTML = lv;

  // Ожидание
  var wait = A.D.candidates.filter(function (c) { return c.test.status === 'waiting'; });
  document.getElementById('waitCount').innerHTML = icon('hourglass') + wait.length;
  document.getElementById('waiting').innerHTML = wait.length ? wait.map(function (c) {
    return '<a class="wait-item" href="candidate.html?id=' + encodeURIComponent(c.id) + '#tab=test"><span class="pulse">' + icon('hourglass') + '</span><div style="min-width:0"><div class="nm">' + esc(c.name) + '</div><div class="ft">' + esc(c.test.focus || '') + '</div></div><span class="spacer"></span>' + A.groupBadge(c) + '</a>';
  }).join('') : '<p class="muted">Все ответы получены.</p>';

  // Документы
  document.getElementById('reports').innerHTML = A.D.reports.map(function (r) {
    return '<div class="file"><div class="fi">' + icon('table') + '</div><div style="min-width:0"><div class="fn">' + esc(r.title) + '</div><div class="fm">' + esc(r.desc) + ' · ' + A.fmtSize(r.size) + '</div></div><span class="spacer"></span><a class="btn btn-sm" href="' + esc(r.path) + '" download title="' + esc(r.title) + '">' + icon('download') + 'Скачать</a></div>';
  }).join('');
})();
