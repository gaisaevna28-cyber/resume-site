/* Страница «Файлы»: общие документы и таблица всех файлов кандидатов с фильтром по типу и поиском. */
(function () {
  'use strict';
  var A = window.App, esc = A.esc, icon = A.icon, D = A.D;

  document.getElementById('repBox').innerHTML = D.reports.map(function (r) {
    return '<div class="file" data-reveal><div class="fi">' + icon('table') + '</div><div style="min-width:0"><div class="fn">' + esc(r.title) + '</div><div class="fm"><span class="ext">docx</span> · ' + A.fmtSize(r.size) + ' · ' + esc(r.desc) + '</div></div><span class="spacer"></span><a class="btn btn-sm" href="' + esc(r.path) + '" download title="' + esc(r.title) + '">' + icon('download') + 'Скачать</a></div>';
  }).join('');

  var rows = [];
  D.candidates.forEach(function (c) { c.files.forEach(function (f) { rows.push({ c: c, f: f }); }); });
  var S = { q: '', t: 'all' };
  var order = ['resume', 'assessment', 'task', 'checks', 'answer', 'review'];
  var tabs = document.getElementById('typeTabs'), tbl = document.getElementById('lTbl'), cnt = document.getElementById('libCount');

  function base() { return rows.filter(function (r) { return !S.q || (r.c.name + ' ' + r.f.label + ' ' + r.f.path).toLowerCase().indexOf(S.q.toLowerCase()) >= 0; }); }
  function render() {
    var b = base(), shown = b.filter(function (r) { return S.t === 'all' || r.f.type === S.t; });
    tabs.innerHTML = '<button class="tab' + (S.t === 'all' ? ' is-active' : '') + '" data-t="all">Все<span class="count">' + b.length + '</span></button>' + order.map(function (t) {
      var n = b.filter(function (r) { return r.f.type === t; }).length;
      return '<button class="tab' + (S.t === t ? ' is-active' : '') + '" data-t="' + t + '">' + icon(A.FILE_TYPES[t].icon) + esc(A.FILE_TYPES[t].plural) + '<span class="count">' + n + '</span></button>';
    }).join('');
    cnt.textContent = 'Показано файлов: ' + shown.length + ' из ' + rows.length + ' · кандидатов: ' + D.candidates.length;
    tbl.innerHTML = '<thead><tr><th>Кандидат</th><th>Группа</th><th>Тип</th><th>Файл</th><th>Формат</th><th>Размер</th><th></th></tr></thead><tbody>' + (shown.length ? shown.map(function (r) {
      return '<tr><td class="nm"><a href="candidate.html?id=' + encodeURIComponent(r.c.id) + '">' + A.hl(r.c.name, S.q) + '</a></td><td>' + A.groupBadge(r.c) + '</td><td class="nowrap">' + icon(A.FILE_TYPES[r.f.type].icon) + ' ' + esc(A.FILE_TYPES[r.f.type].label) + '</td><td>' + esc(r.f.label) + '<div class="muted small">' + esc(r.f.path) + '</div></td><td><span class="ext">' + esc(r.f.ext) + '</span></td><td class="nowrap">' + A.fmtSize(r.f.size) + '</td><td>' + A.fileLink(r.f) + '</td></tr>';
    }).join('') : '<tr><td colspan="7" class="muted" style="text-align:center;padding:40px">Ничего не найдено</td></tr>') + '</tbody>';
  }
  tabs.addEventListener('click', function (e) { var b = e.target.closest('[data-t]'); if (b) { S.t = b.getAttribute('data-t'); render(); } });
  var timer; document.getElementById('lq').addEventListener('input', function (e) { clearTimeout(timer); timer = setTimeout(function () { S.q = e.target.value.trim(); render(); }, 120); });
  render();
})();
