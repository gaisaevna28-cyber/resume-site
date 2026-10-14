/* Сводные таблицы: по уровням (аккордеоны), общая сортируемая таблица, документы для скачивания. */
(function () {
  'use strict';
  var A = window.App, esc = A.esc, icon = A.icon, D = A.D;

  // --- По уровням ---
  function miniTable(list) {
    return '<div class="table-wrap"><table class="tbl"><thead><tr><th>Кандидат</th><th>Роль</th><th>Опыт</th><th>Уровень</th><th>SQL</th><th>API</th><th>BPMN</th><th>Jira</th><th>Задание</th></tr></thead><tbody>' + list.map(function (c) {
      return '<tr><td class="nm"><a href="candidate.html?id=' + encodeURIComponent(c.id) + '">' + esc(c.name) + '</a> ' + (c.batch === 'new' ? '<span class="badge b-new">Новый</span>' : '') + '</td><td>' + esc(c.role) + '</td><td class="nowrap">' + esc(c.exp) + '</td><td class="nowrap">' + esc(c.level) + '</td><td>' + A.skillMark(c.sql) + '</td><td>' + A.skillMark(c.api) + '</td><td>' + A.skillMark(c.bpmn) + '</td><td>' + A.skillMark(c.jira) + '</td><td>' + A.statusBadge(c) + (c.test.score != null ? ' <b>' + c.test.score + '</b>' : '') + '</td></tr>';
    }).join('') + '</tbody></table></div>';
  }
  document.getElementById('pLevels').innerHTML = [1, 2, 3, 4].map(function (g, i) {
    var list = D.candidates.filter(function (c) { return c.group === g; }), G = A.GROUP[g];
    return '<div class="acc' + (g === 1 ? ' is-open' : '') + '" data-reveal style="--d:' + (i * 50) + 'ms"><button class="acc-head" aria-expanded="' + (g === 1) + '"><span class="badge b-' + G.cls + '">' + g + '</span>' + esc(G.name) + '<span class="muted small" style="font-weight:500">' + list.length + ' · ' + esc(G.hint) + '</span>' + icon('down', 'chev') + '</button><div class="acc-body"><div class="acc-inner"><div class="acc-content" style="padding:0">' + miniTable(list) + '</div></div></div></div>';
  }).join('');

  // --- Общая таблица ---
  var cols = [
    { k: 'name', t: 'Кандидат' }, { k: 'groupName', t: 'Группа', sk: 'group' }, { k: 'role', t: 'Роль / компания' }, { k: 'exp', t: 'Опыт' }, { k: 'level', t: 'Уровень' },
    { k: 'sql', t: 'SQL' }, { k: 'api', t: 'API' }, { k: 'bpmn', t: 'BPMN' }, { k: 'jira', t: 'Jira' }, { k: 'salary', t: 'ЗП, ₸' }, { k: 'score', t: 'Балл' }, { k: 'short', t: 'Коротко', ns: true }
  ];
  var st = { q: '', b: 'all', key: 'group', dir: 1 };
  var tbl = document.getElementById('sTbl'), info = document.getElementById('sInfo');

  function val(c, k) { return k === 'score' ? (c.test.score == null ? -1 : c.test.score) : k === 'group' ? c.group : c[k]; }
  function renderAll() {
    var list = D.candidates.filter(function (c) {
      if (st.b !== 'all' && c.batch !== st.b) { return false; }
      return !st.q || (c.name + ' ' + c.role + ' ' + c.level + ' ' + c.short).toLowerCase().indexOf(st.q.toLowerCase()) >= 0;
    });
    list.sort(function (a, b) {
      var x = val(a, st.key), y = val(b, st.key);
      var r = (typeof x === 'number' && typeof y === 'number') ? x - y : String(x).localeCompare(String(y), 'ru');
      return (r || a.group - b.group || a.name.localeCompare(b.name, 'ru')) * st.dir * (r ? 1 : 1);
    });
    info.textContent = 'Строк: ' + list.length;
    var h = '<thead><tr><th>№</th>' + cols.map(function (c) {
      var key = c.sk || c.k, on = st.key === key;
      return '<th class="sortable' + (on ? ' sorted' + (st.dir < 0 ? ' desc' : '') : '') + '" data-k="' + key + '">' + c.t + '<span class="arrow">▲</span></th>';
    }).join('') + '</tr></thead><tbody>';
    list.forEach(function (c, i) {
      h += '<tr><td class="muted">' + (i + 1) + '</td><td class="nm"><a href="candidate.html?id=' + encodeURIComponent(c.id) + '">' + A.hl(c.name, st.q) + '</a> ' + (c.batch === 'new' ? '<span class="badge b-new">Новый</span>' : '') + '</td><td>' + A.groupBadge(c) + '</td><td>' + esc(c.role) + '</td><td class="nowrap">' + esc(c.exp) + '</td><td class="nowrap">' + esc(c.level) + '</td>' +
        '<td>' + A.skillMark(c.sql) + '</td><td>' + A.skillMark(c.api) + '</td><td>' + A.skillMark(c.bpmn) + '</td><td>' + A.skillMark(c.jira) + '</td><td class="nowrap">' + esc(c.salary) + '</td><td><b>' + (c.test.score != null ? c.test.score : '—') + '</b></td><td style="min-width:260px">' + esc(c.short) + '</td></tr>';
    });
    tbl.innerHTML = h + '</tbody>';
  }
  tbl.addEventListener('click', function (e) {
    var th = e.target.closest('th.sortable'); if (!th) { return; }
    var k = th.getAttribute('data-k'); if (st.key === k) { st.dir *= -1; } else { st.key = k; st.dir = k === 'score' ? -1 : 1; }
    renderAll();
  });
  var timer;
  document.getElementById('sq').addEventListener('input', function (e) { clearTimeout(timer); timer = setTimeout(function () { st.q = e.target.value.trim(); renderAll(); }, 120); });
  document.getElementById('sBatch').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) { return; } st.b = b.getAttribute('data-v');
    Array.prototype.forEach.call(this.querySelectorAll('button'), function (x) { x.classList.toggle('is-active', x === b); }); renderAll();
  });
  renderAll();

  // --- Документы ---
  document.getElementById('pDocs').innerHTML = D.reports.map(function (r, i) {
    return '<div class="card pad" data-reveal style="--d:' + (i * 50) + 'ms"><div class="row"><div class="stat" style="padding:0"><div class="ico">' + icon('table', 'ic-lg') + '</div></div><div style="flex:1;min-width:0"><h3>' + esc(r.title) + '</h3><div class="muted small">' + esc(r.desc) + ' · DOCX · ' + A.fmtSize(r.size) + '</div></div></div><div style="margin-top:14px"><a class="btn btn-primary btn-sm" href="' + esc(r.path) + '" download title="' + esc(r.title) + '">' + icon('download') + 'Скачать</a></div></div>';
  }).join('');
})();
