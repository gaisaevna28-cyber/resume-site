/* Список кандидатов: поиск, фильтры (уровень, партия, статус), сортировка, карточки/таблица. Состояние хранится в адресе (#g=1&b=new...). */
(function () {
  'use strict';
  var A = window.App, esc = A.esc, icon = A.icon;
  var all = A.D.candidates;
  var S = { q: '', g: 0, b: 'all', s: 'all', o: 'group', v: 'cards' };

  var elQ = document.getElementById('q'), elCards = document.getElementById('cards'), elTbl = document.getElementById('tbl'), elTblBox = document.getElementById('tableBox');
  var elInfo = document.getElementById('info'), elSort = document.getElementById('sort'), elTabs = document.getElementById('groupTabs');

  function readHash() {
    var h = location.hash.replace(/^#/, ''); if (!h) { return; }
    h.split('&').forEach(function (p) {
      var kv = p.split('='), k = kv[0], v = decodeURIComponent(kv[1] || '');
      if (k === 'q') { S.q = v; } else if (k === 'g') { S.g = parseInt(v, 10) || 0; } else if (k === 'b' || k === 's' || k === 'o' || k === 'v') { S[k] = v; }
    });
  }
  function writeHash() {
    var p = [];
    if (S.q) { p.push('q=' + encodeURIComponent(S.q)); } if (S.g) { p.push('g=' + S.g); } if (S.b !== 'all') { p.push('b=' + S.b); }
    if (S.s !== 'all') { p.push('s=' + S.s); } if (S.o !== 'group') { p.push('o=' + S.o); } if (S.v !== 'cards') { p.push('v=' + S.v); }
    try { history.replaceState(null, '', p.length ? '#' + p.join('&') : location.pathname + location.search); } catch (e) { /* file:// в некоторых браузерах */ }
  }

  function match(c, skipGroup) {
    if (!skipGroup && S.g && c.group !== S.g) { return false; }
    if (S.b !== 'all' && c.batch !== S.b) { return false; }
    if (S.s !== 'all' && c.test.status !== S.s) { return false; }
    if (S.q) {
      var hay = (c.name + ' ' + c.role + ' ' + c.level + ' ' + c.short + ' ' + c.id).toLowerCase();
      if (hay.indexOf(S.q.toLowerCase()) < 0) { return false; }
    }
    return true;
  }
  function sorted(list) {
    var l = list.slice();
    l.sort(function (a, b) {
      if (S.o === 'name') { return a.name.localeCompare(b.name, 'ru'); }
      if (S.o === 'score') { var x = a.test.score == null ? -1 : a.test.score, y = b.test.score == null ? -1 : b.test.score; return y - x || a.group - b.group; }
      return a.group - b.group || (b.test.score || 0) - (a.test.score || 0) || a.name.localeCompare(b.name, 'ru');
    });
    return l;
  }

  function renderTabs() {
    var base = all.filter(function (c) { return match(c, true); });
    var html = '<button class="tab' + (S.g === 0 ? ' is-active' : '') + '" data-g="0">Все<span class="count">' + base.length + '</span></button>';
    [1, 2, 3, 4].forEach(function (g) {
      var n = base.filter(function (c) { return c.group === g; }).length;
      html += '<button class="tab' + (S.g === g ? ' is-active' : '') + '" data-g="' + g + '">' + esc(A.GROUP[g].short) + '<span class="count">' + n + '</span></button>';
    });
    elTabs.innerHTML = html;
  }

  function renderTable(list) {
    var h = '<thead><tr><th>Кандидат</th><th>Группа</th><th>Уровень</th><th>Роль</th><th>Опыт</th><th>Задание</th><th>Балл</th><th>Файлы</th></tr></thead><tbody>';
    list.forEach(function (c) {
      var rs = A.fileOf(c, 'resume')[0], as = A.fileOf(c, 'assessment')[0], tk = A.fileOf(c, 'task')[0], an = A.fileOf(c, 'answer')[0];
      h += '<tr><td class="nm"><a href="candidate.html?id=' + encodeURIComponent(c.id) + '">' + A.hl(c.name, S.q) + '</a> ' + (c.batch === 'new' ? '<span class="badge b-new">Новый</span>' : '') + '</td><td>' + A.groupBadge(c) + '</td><td class="nowrap">' + esc(c.level) + '</td><td>' + esc(c.role) + '</td><td class="nowrap">' + esc(c.exp) + '</td><td>' + A.statusBadge(c) + '</td><td><b>' + (c.test.score != null ? c.test.score : '—') + '</b></td>' +
        '<td class="nowrap"><span class="row" style="gap:6px;flex-wrap:nowrap">' + [rs, as, tk, an].filter(Boolean).map(function (f) { return A.fileLink(f); }).join('') + '</span></td></tr>';
    });
    elTbl.innerHTML = h + '</tbody>';
  }

  function render() {
    var list = sorted(all.filter(function (c) { return match(c, false); }));
    renderTabs();
    elInfo.textContent = 'Найдено: ' + list.length + ' из ' + all.length;
    if (S.v === 'table') {
      elCards.classList.add('hidden'); elTblBox.classList.remove('hidden'); renderTable(list);
      if (!list.length) { elTbl.innerHTML = '<tbody><tr><td class="muted" style="text-align:center;padding:40px">Ничего не найдено</td></tr></tbody>'; }
    } else {
      elTblBox.classList.add('hidden'); elCards.classList.remove('hidden');
      elCards.innerHTML = list.length ? list.map(function (c) { return A.cardHTML(c, S.q); }).join('') : '<div class="empty">' + icon('search') + '<p>Никого не найдено. Попробуйте изменить поиск или фильтры.</p></div>';
      A.reveal(elCards);
    }
    syncUI(); writeHash();
  }

  function syncUI() {
    ['segView', 'segBatch', 'segStatus'].forEach(function (id) {
      var key = id === 'segView' ? 'v' : id === 'segBatch' ? 'b' : 's';
      Array.prototype.forEach.call(document.querySelectorAll('#' + id + ' button'), function (b) { b.classList.toggle('is-active', b.getAttribute('data-v') === S[key]); });
    });
    elSort.value = S.o; if (elQ.value !== S.q) { elQ.value = S.q; }
  }

  // События
  var timer;
  elQ.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { S.q = elQ.value.trim(); render(); }, 120); });
  elSort.addEventListener('change', function () { S.o = elSort.value; render(); });
  elTabs.addEventListener('click', function (e) { var b = e.target.closest('[data-g]'); if (b) { S.g = parseInt(b.getAttribute('data-g'), 10); render(); } });
  [['segView', 'v'], ['segBatch', 'b'], ['segStatus', 's']].forEach(function (p) {
    document.getElementById(p[0]).addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { S[p[1]] = b.getAttribute('data-v'); render(); } });
  });
  document.getElementById('reset').addEventListener('click', function () { S = { q: '', g: 0, b: 'all', s: 'all', o: 'group', v: S.v }; render(); });
  window.addEventListener('hashchange', function () { readHash(); render(); });

  readHash(); render();
})();
