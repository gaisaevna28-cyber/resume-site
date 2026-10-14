/* Страница «Тестирование»: сдавшие (рейтинг с раскрытием), ожидаемые ответы, без задания. */
(function () {
  'use strict';
  var A = window.App, esc = A.esc, icon = A.icon, D = A.D, S = A.stats();
  var by = function (st) { return D.candidates.filter(function (c) { return c.test.status === st; }); };
  var done = by('done').sort(function (a, b) { return b.test.score - a.test.score; }), wait = by('waiting'), none = by('none');
  var avg = done.length ? Math.round(done.reduce(function (s, c) { return s + c.test.score; }, 0) / done.length) : 0;

  document.getElementById('cDone').textContent = done.length;
  document.getElementById('cWait').textContent = wait.length;
  document.getElementById('cNone').textContent = none.length;

  var cards = [
    { n: S.issued, l: 'Получили задание', i: 'flask', c: 's-amber' },
    { n: done.length, l: 'Сдали и проверены', i: 'check', c: 's-green' },
    { n: wait.length, l: 'Ждём ответ', i: 'hourglass', c: 's-rose' },
    { n: avg, l: 'Средний балл сдавших', i: 'trend', c: '' }
  ];
  document.getElementById('tStats').innerHTML = cards.map(function (c, i) {
    return '<div class="card stat ' + c.c + '" data-reveal style="--d:' + (i * 60) + 'ms"><div class="ico">' + icon(c.i, 'ic-lg') + '</div><div class="num" data-count="' + c.n + '">0</div><div class="lbl">' + c.l + '</div></div>';
  }).join('');

  function body(c) {
    var t = c.test, links = c.files.filter(function (f) { return ['answer', 'review', 'task', 'checks'].indexOf(f.type) >= 0; });
    return '<p class="muted" style="margin-top:12px">' + esc(t.summary) + '</p>' +
      D.blockNames.map(function (n, i) { var p = Math.round(t.blocks[i] / D.blockMax[i] * 100); return '<div class="blk"><span class="nm">' + (i + 1) + '. ' + esc(n) + '</span><div class="bar ' + A.scoreBar(p) + '" style="--w:' + p + '%"><i></i></div><span class="pt">' + t.blocks[i] + ' / ' + D.blockMax[i] + '</span></div>'; }).join('') +
      '<div class="grid grid-2" style="margin-top:12px"><div><b class="small">Сильные стороны</b><ul class="list good" style="margin-top:6px">' + t.strong.map(function (x) { return '<li>' + icon('check') + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul></div><div><b class="small">Слабые места</b><ul class="list bad" style="margin-top:6px">' + t.weak.map(function (x) { return '<li>' + icon('alert') + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul></div></div>' +
      '<p class="muted small" style="margin:12px 0 0">' + icon('shield') + ' <b>ИИ:</b> ' + esc(t.aiNote) + '</p>' +
      '<div class="row" style="margin-top:14px">' + links.map(function (f) { return '<a class="btn btn-sm" href="' + esc(f.path) + '" download title="' + esc(f.label) + '">' + icon('download') + esc(f.label) + '</a>'; }).join('') + '<a class="btn btn-sm btn-ghost" href="candidate.html?id=' + encodeURIComponent(c.id) + '#tab=test">Профиль' + icon('right') + '</a></div>';
  }

  document.getElementById('pDone').innerHTML = done.length ? done.map(function (c, i) {
    var t = c.test;
    return '<div class="acc' + (i === 0 ? ' is-open' : '') + '" data-reveal style="--d:' + (i * 50) + 'ms"><button class="acc-head" aria-expanded="' + (i === 0) + '">' +
      '<span class="badge" style="min-width:28px;justify-content:center">' + (i + 1) + '</span>' +
      '<span style="flex:1;min-width:0"><span style="display:block">' + esc(c.name) + '</span><span class="bar ' + A.scoreBar(t.score) + '" style="--w:' + t.score + '%;display:block;height:7px;margin-top:6px;font-weight:400"><i></i></span></span>' +
      '<span class="ai ai' + t.ai + '">' + icon('shield') + esc(t.aiLabel) + '</span><b style="font-size:1.2rem;min-width:34px;text-align:right">' + t.score + '</b>' + icon('down', 'chev') + '</button>' +
      '<div class="acc-body"><div class="acc-inner"><div class="acc-content"><div class="row" style="margin-top:12px">' + A.groupBadge(c) + A.batchBadge(c) + '<b>' + esc(t.verdict) + '</b></div>' + body(c) + '</div></div></div></div>';
  }).join('') : '<div class="state-box"><p class="muted">Проверенных заданий пока нет.</p></div>';

  document.getElementById('pWait').innerHTML = wait.length ? '<div class="grid grid-2">' + wait.map(function (c, i) {
    return '<a class="card pad cand" style="gap:10px" href="candidate.html?id=' + encodeURIComponent(c.id) + '#tab=test" data-reveal style="--d:' + (i * 40) + 'ms"><div class="cand-top"><div class="avatar av' + c.group + '">' + esc(A.initials(c.name)) + '</div><div style="min-width:0"><h3>' + esc(c.name) + '</h3><div class="role">' + esc(c.role) + '</div></div><span class="spacer"></span><span class="pulse">' + icon('hourglass', 'ic-lg') + '</span></div>' +
      '<div class="cand-meta">' + A.groupBadge(c) + A.batchBadge(c) + '</div><div class="small"><b>Фокус задания:</b> ' + esc(c.test.focus || '—') + '</div></a>';
  }).join('') + '</div>' : '<div class="state-box"><p class="muted">Все ответы получены.</p></div>';

  document.getElementById('pNone').innerHTML = '<div class="card"><div class="table-wrap"><table class="tbl"><thead><tr><th>Кандидат</th><th>Уровень</th><th>Роль</th><th>Почему без задания</th></tr></thead><tbody>' + none.map(function (c) {
    return '<tr><td class="nm"><a href="candidate.html?id=' + encodeURIComponent(c.id) + '">' + esc(c.name) + '</a> ' + (c.batch === 'new' ? '<span class="badge b-new">Новый</span>' : '') + '</td><td class="nowrap">' + esc(c.level) + '</td><td>' + esc(c.role) + '</td><td>' + esc(c.short) + '</td></tr>';
  }).join('') + '</tbody></table></div></div>';
})();
