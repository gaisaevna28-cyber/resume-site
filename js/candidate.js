/* Профиль кандидата: обзор, тестирование, файлы. Адрес: candidate.html?id=<id>#tab=overview|test|files */
(function () {
  'use strict';
  var A = window.App, esc = A.esc, icon = A.icon, D = A.D;
  var root = document.getElementById('root');
  var id = new URLSearchParams(location.search).get('id');
  var c = A.byId(id);

  if (!c) {
    root.innerHTML = '<div class="empty card pad">' + icon('search') + '<h2 style="margin:10px 0">Кандидат не найден</h2><p class="muted">Проверьте ссылку или выберите кандидата из списка.</p><a class="btn btn-primary" href="candidates.html">' + icon('left') + 'К списку кандидатов</a></div>';
    return;
  }
  document.title = c.name + ' — Отбор аналитиков';
  var t = c.test, a = c.assess || {};

  function listHTML(items, cls, ic) { return '<ul class="list ' + cls + '">' + (items || []).map(function (x) { return '<li>' + icon(ic) + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul>'; }
  function acc(title, ic, body, open) {
    return '<div class="acc' + (open ? ' is-open' : '') + '"><button class="acc-head" aria-expanded="' + !!open + '">' + icon(ic) + esc(title) + icon('down', 'chev') + '</button><div class="acc-body"><div class="acc-inner"><div class="acc-content">' + body + '</div></div></div></div>';
  }
  function fileRow(f) {
    var T = A.FILE_TYPES[f.type] || { icon: 'file' };
    return '<div class="file"><div class="fi t-' + f.type + '">' + icon(T.icon) + '</div><div style="min-width:0"><div class="fn">' + esc(f.label) + '</div><div class="fm"><span class="ext">' + esc(f.ext) + '</span> · ' + A.fmtSize(f.size) + '</div></div><span class="spacer"></span><a class="btn btn-sm" href="' + esc(f.path) + '" download title="' + esc(f.label) + '">' + icon('download') + 'Скачать</a></div>';
  }
  function filesOf(types) { return D.candidates && c.files.filter(function (f) { return types.indexOf(f.type) >= 0; }); }

  /* ---------- Обзор ---------- */
  var overview =
    '<div class="facts" data-reveal>' +
    '<div class="fact"><div class="k">Роль / компания</div><div class="v">' + esc(c.role || '—') + '</div></div>' +
    '<div class="fact"><div class="k">Опыт аналитиком</div><div class="v">' + esc(c.exp || '—') + '</div></div>' +
    '<div class="fact"><div class="k">Предполагаемый уровень</div><div class="v">' + esc(c.level || '—') + '</div></div>' +
    '<div class="fact"><div class="k">Ожидания, ₸</div><div class="v">' + esc(c.salary || '—') + '</div></div></div>' +
    '<div class="skills" style="margin:16px 0" data-reveal>' +
    [['SQL', c.sql], ['API / XML / JSON', c.api], ['BPMN / UML', c.bpmn], ['Jira / Confluence', c.jira]].map(function (s) { return '<span class="skill">' + A.skillMark(s[1]) + s[0] + '</span>'; }).join('') + '</div>' +
    '<div class="conclusion" data-reveal><div class="row" style="margin-bottom:6px">' + icon('award') + '<b>Предварительный вывод: ' + esc(a.conclusion || c.groupName) + '</b></div><p style="margin:0">' + esc(a.comment || c.short) + '</p>' +
    (a.notes && a.notes.length ? '<p class="muted small" style="margin:8px 0 0">' + a.notes.map(esc).join(' ') + '</p>' : '') + '</div>' +
    '<div style="margin-top:16px" data-reveal>' +
    acc('Ключевой опыт', 'briefcase', listHTML(a.experience, 'info', 'right'), true) +
    acc('Сильные стороны', 'star', listHTML(a.strengths, 'good', 'check'), true) +
    acc('Риски и вопросы для проверки', 'alert', listHTML(a.risks, 'bad', 'alert'), true) + '</div>';

  /* ---------- Тестирование ---------- */
  var test = '';
  var tf = filesOf(['task', 'checks', 'answer', 'review']);
  if (t.status === 'done') {
    var names = D.blockNames, max = D.blockMax;
    test += '<div class="card pad" data-reveal><div class="score-box">' + A.ring(t.score, 'lg') +
      '<div style="flex:1;min-width:240px"><div class="row" style="margin-bottom:6px"><span class="badge b-done">' + icon('check') + 'Задание проверено</span><span class="ai ai' + t.ai + '" title="Риск использования ИИ">' + icon('shield') + 'Риск ИИ: ' + esc(t.aiLabel) + '</span></div>' +
      '<h2>' + t.score + ' из 100</h2><p style="margin:6px 0 0"><b>' + esc(t.verdict) + '</b></p><p class="muted" style="margin-top:6px">' + esc(t.summary) + '</p></div></div></div>' +
      '<div class="card pad" style="margin-top:16px" data-reveal><h3 style="margin-bottom:8px">Баллы по блокам</h3>' +
      names.map(function (n, i) { var v = t.blocks[i], m = max[i], p = Math.round(v / m * 100); return '<div class="blk"><span class="nm">' + (i + 1) + '. ' + esc(n) + '</span><div class="bar ' + A.scoreBar(p) + '" style="--w:' + p + '%"><i></i></div><span class="pt">' + v + ' / ' + m + '</span></div>'; }).join('') + '</div>' +
      '<div class="grid grid-2" style="margin-top:16px"><div class="card pad" data-reveal><h3 style="margin-bottom:10px">Сильные стороны ответа</h3>' + listHTML(t.strong, 'good', 'check') + '</div><div class="card pad" data-reveal style="--d:70ms"><h3 style="margin-bottom:10px">Слабые места</h3>' + listHTML(t.weak, 'bad', 'alert') + '</div></div>' +
      '<div style="margin-top:16px" data-reveal>' + acc('Проверка на использование ИИ', 'shield', '<p style="margin:0">' + esc(t.aiNote) + '</p><p class="muted small" style="margin:8px 0 0">Это оценка по служебным данным файла и тексту, а не доказательство. Авторство проверяется на собеседовании.</p>', false) + '</div>';
  } else if (t.status === 'waiting') {
    test += '<div class="state-box" data-reveal><div class="big-ic pulse">' + icon('hourglass', 'ic-lg') + '</div><h2><span class="dots">Ждём ответ на задание</span></h2><p class="muted" style="max-width:560px;margin:8px auto 0">Задание выдано, ответ пока не получен. После получения здесь появятся баллы по блокам, оценка риска ИИ и ссылка на ответ.</p></div>' +
      '<div class="card pad" style="margin-top:16px" data-reveal><div class="row" style="margin-bottom:6px">' + icon('target') + '<b>Фокус индивидуального блока</b></div><p style="margin:0">' + esc(t.focus || '—') + '</p></div>';
  } else {
    test += '<div class="state-box none" data-reveal><div class="big-ic">' + icon('x', 'ic-lg') + '</div><h2>Задание не выдавалось</h2><p class="muted" style="max-width:560px;margin:8px auto 0">По первичной оценке кандидат относится к группе «' + esc(c.groupName) + '». Тестовое задание готовится только кандидатам, которые подходят по уровню.</p></div>';
  }
  if (tf.length) { test += '<div class="section-head" style="margin-top:26px;margin-bottom:12px"><h3>Документы по заданию</h3></div><div class="files">' + tf.map(fileRow).join('') + '</div>'; }

  /* ---------- Файлы ---------- */
  var order = ['resume', 'assessment', 'task', 'checks', 'answer', 'review'], files = '';
  order.forEach(function (ty) {
    var fs = c.files.filter(function (f) { return f.type === ty; }); if (!fs.length) { return; }
    files += '<div style="margin-bottom:18px"><div class="muted small" style="font-weight:650;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">' + esc(A.FILE_TYPES[ty].plural) + '</div><div class="files">' + fs.map(fileRow).join('') + '</div></div>';
  });

  /* ---------- Соседние кандидаты ---------- */
  var same = D.candidates.filter(function (x) { return x.group === c.group; }), i = same.indexOf(c);
  var prev = same[i - 1], next = same[i + 1];
  var pager = '<div class="pager">' + (prev ? '<a class="btn" href="candidate.html?id=' + encodeURIComponent(prev.id) + '">' + icon('left') + esc(prev.name) + '</a>' : '<span></span>') + (next ? '<a class="btn" href="candidate.html?id=' + encodeURIComponent(next.id) + '">' + esc(next.name) + icon('right') + '</a>' : '') + '</div>';

  /* ---------- Сборка страницы ---------- */
  var statusBtn = c.test.status === 'done' ? '<span class="count">' + t.score + '</span>' : '';
  root.innerHTML =
    '<div class="crumbs"><a href="index.html">Главная</a>' + icon('right') + '<a href="candidates.html">Кандидаты</a>' + icon('right') + '<a href="candidates.html#g=' + c.group + '">' + esc(c.groupName) + '</a></div>' +
    '<div class="cand-head" data-reveal><div class="avatar av' + c.group + '">' + esc(A.initials(c.name)) + '</div><div style="flex:1;min-width:240px"><h1>' + esc(c.name) + '</h1><div class="row" style="margin-top:8px">' + A.groupBadge(c) + A.batchBadge(c) + A.statusBadge(c) + '</div></div>' +
    '<div class="row">' + (A.fileOf(c, 'resume')[0] ? '<a class="btn btn-primary" href="' + esc(A.fileOf(c, 'resume')[0].path) + '" download title="Резюме">' + icon('download') + 'Резюме</a>' : '') + (A.fileOf(c, 'assessment')[0] ? '<a class="btn" href="' + esc(A.fileOf(c, 'assessment')[0].path) + '" download title="Первичная оценка">' + icon('filetext') + 'Оценка</a>' : '') + '</div></div>' +
    '<div data-tabs data-hash="tab" style="margin-top:22px"><div class="tab-list" role="tablist">' +
    '<button class="tab is-active" data-tab="overview">' + icon('user') + 'Обзор</button>' +
    '<button class="tab" data-tab="test">' + icon('flask') + 'Тестирование' + statusBtn + '</button>' +
    '<button class="tab" data-tab="files">' + icon('folder') + 'Файлы<span class="count">' + c.files.length + '</span></button></div>' +
    '<div style="margin-top:18px"><div class="tab-panel is-active" data-panel="overview">' + overview + '</div><div class="tab-panel" data-panel="test">' + test + '</div><div class="tab-panel" data-panel="files">' + files + '</div></div></div>' + pager;
})();
