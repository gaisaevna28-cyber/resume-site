/* Методика: блок с баллами по структуре задания (из data.js). */
(function () {
  'use strict';
  var A = window.App, D = A.D, esc = A.esc;
  var total = D.blockMax.reduce(function (s, x) { return s + x; }, 0);
  document.getElementById('blocksBox').innerHTML = D.blockNames.map(function (n, i) {
    return '<div class="blk"><span class="nm">' + (i + 1) + '. ' + esc(n) + '</span><div class="bar ' + (i === 5 ? 'lilac' : '') + '" style="--w:' + Math.round(D.blockMax[i] / 20 * 100) + '%"><i></i></div><span class="pt">' + D.blockMax[i] + '</span></div>';
  }).join('') + '<div class="blk" style="border-top:1px solid var(--line);margin-top:6px;padding-top:12px"><b>Итого</b><span></span><span class="pt">' + total + '</span></div>';
})();
