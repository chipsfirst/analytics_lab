// Демонстрации: интерактивные модели.
(function () {
  "use strict";
  var U = window.DEMO_UTILS;
  var gauss=U.gauss, accent=U.accent, makeCanvas=U.makeCanvas, drawHistogram=U.drawHistogram, sampleFrom=U.sampleFrom;
  var erf=U.erf, cdf=U.cdf, pdf=U.pdf, fit=U.fit, percentile=U.percentile, drawHistLines=U.drawHistLines;
  function mountCLT(root) {
    root.innerHTML =
      '<div class="card">' +
      '<p class="lead">Мы берём 4000 выборок объёма n из одного и того же распределения и смотрим ' +
      "не на сами значения, а на их средние. Меняйте n: при больших n форма распределения средних " +
      "приближается к нормальной, даже если исходные данные скошены.</p>" +
      '<div class="demo-controls">' +
      '<label>Распределение <select id="dist">' +
      '<option value="uniform">равномерное</option>' +
      '<option value="exp">экспоненциальное (сильно скошено)</option>' +
      '<option value="bimodal">двугорбое</option>' +
      "</select></label>" +
      '<label>Объём выборки n = <b id="nVal">1</b>' +
      '<input type="range" id="n" min="1" max="50" step="1" value="1"></label>' +
      "</div>" +
      '<div id="plot"></div>' +
      '<p class="demo-note" id="note"></p>' +
      "</div>";

    var plot = document.getElementById("plot");
    var canvas = makeCanvas(plot, 720, 320);
    var nEl = document.getElementById("n");
    var nVal = document.getElementById("nVal");
    var distEl = document.getElementById("dist");
    var note = document.getElementById("note");

    function render() {
      var n = Number(nEl.value);
      var dist = distEl.value;
      nVal.textContent = n;
      var means = [], single = [];
      for (var i = 0; i < 4000; i++) {
        var sum = 0;
        for (var j = 0; j < n; j++) {
          var v = sampleFrom(dist);
          sum += v;
          if (i === 0 && j === 0) single.push(v);
        }
        means.push(sum / n);
      }
      var m = means.reduce(function (s, x) { return s + x; }, 0) / means.length;
      var sd = Math.sqrt(means.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / means.length);
      drawHistogram(canvas, means, "Средние 4000 выборок, n = " + n);
      note.textContent = "Среднее средних: " + m.toFixed(3) + " · стандартное отклонение средних: " +
        sd.toFixed(3) + (n > 1 ? " (по ЦПТ ≈ σ/√n)" : "");
    }

    nEl.addEventListener("input", render);
    distEl.addEventListener("change", render);
    render();
  }

  // ---------- размер выборки для A/B ----------

  function mountSample(root) {
    root.innerHTML =
      '<div class="card">' +
      '<p class="lead">Сколько пользователей нужно на группу, чтобы заметить заданный эффект. ' +
      "Уровень значимости α = 0,05, мощность 0,8.</p>" +
      '<div class="demo-controls">' +
      '<label>Базовая конверсия, %<input type="number" id="p" value="10" min="0.1" max="99" step="0.1"></label>' +
      '<label>Ожидаемый прирост, п. п.<input type="number" id="d" value="1" min="0.05" max="50" step="0.05"></label>' +
      "</div>" +
      '<div class="stats"><div class="stat"><div class="k">на группу</div><div class="v" id="n1">—</div></div>' +
      '<div class="stat"><div class="k">всего</div><div class="v" id="n2">—</div></div>' +
      '<div class="stat"><div class="k">относительный прирост</div><div class="v" id="rel">—</div></div></div>' +
      '<div class="formula">n = (z₁₋α/₂ + z₁₋β)² · (p₁(1 − p₁) + p₂(1 − p₂)) / Δ²</div>' +
      '<p class="demo-note" id="note"></p>' +
      "</div>";

    var pEl = document.getElementById("p"), dEl = document.getElementById("d");
    var n1 = document.getElementById("n1"), n2 = document.getElementById("n2");
    var rel = document.getElementById("rel"), note = document.getElementById("note");

    function render() {
      var p = Number(pEl.value) / 100, d = Number(dEl.value) / 100;
      if (!(p > 0 && p < 1) || !(d > 0)) { n1.textContent = n2.textContent = rel.textContent = "—"; return; }
      if (p + d >= 1) { n1.textContent = n2.textContent = rel.textContent = "—"; note.textContent = "Сумма базовой конверсии и прироста должна быть меньше 100%."; return; }
      var p2 = p + d;
      var n = Math.ceil(Math.pow(1.96 + 0.8416, 2) * (p * (1 - p) + p2 * (1 - p2)) / (d * d));
      n1.textContent = n.toLocaleString("ru-RU");
      n2.textContent = (2 * n).toLocaleString("ru-RU");
      rel.textContent = (d / p * 100).toFixed(1).replace(".", ",") + "%";
      note.textContent = "Чем меньше эффект, тем дороже тест: размер выборки растёт как 1/Δ². " +
        "Уменьшить Δ вдвое — значит увеличить выборку вчетверо.";
    }

    pEl.addEventListener("input", render);
    dEl.addEventListener("input", render);
    render();
  }

  // ---------- регрессия к среднему ----------

  function mountRegression(root) {
    root.innerHTML =
      '<div class="card">' +
      '<p class="lead">Тест и повторный тест одной и той же группы. Отбираем худшие 10% по первому ' +
      "измерению — и при повторном они выглядят лучше, даже если ничего не менялось.</p>" +
      '<div id="plot"></div>' +
      '<div class="stats"><div class="stat"><div class="k">средний балл отобранных, 1-е измерение</div>' +
      '<div class="v" id="m1">—</div></div>' +
      '<div class="stat"><div class="k">их же средний балл, 2-е измерение</div><div class="v" id="m2">—</div></div>' +
      '<div class="stat"><div class="k">изменение</div><div class="v" id="diff">—</div></div></div>' +
      '<div class="btn-row"><button class="btn primary" id="again">Новая симуляция</button></div>' +
      '<p class="demo-note">Истинный уровень каждого человека не менялся: оба измерения — ' +
      "истинный балл плюс случайная ошибка. Улучшение создано отбором по краю распределения.</p>" +
      "</div>";

    var plot = document.getElementById("plot");
    var canvas = makeCanvas(plot, 720, 340);
    var m1el = document.getElementById("m1"), m2el = document.getElementById("m2"), diffel = document.getElementById("diff");

    function render() {
      var people = [];
      for (var i = 0; i < 300; i++) {
        var trueSkill = gauss(50, 15);
        people.push({ t1: trueSkill + gauss(0, 9), t2: trueSkill + gauss(0, 9) });
      }
      people.sort(function (a, b) { return a.t1 - b.t1; });
      var cut = Math.round(people.length * 0.1);
      var picked = people.slice(0, cut);
      var mean1 = picked.reduce(function (s, p) { return s + p.t1; }, 0) / cut;
      var mean2 = picked.reduce(function (s, p) { return s + p.t2; }, 0) / cut;

      m1el.textContent = mean1.toFixed(1);
      m2el.textContent = mean2.toFixed(1);
      diffel.textContent = (mean2 - mean1 > 0 ? "+" : "") + (mean2 - mean1).toFixed(1);

      var ctx = canvas.getContext("2d");
      var W = canvas.width, H = canvas.height, pad = 34;
      ctx.clearRect(0, 0, W, H);
      var lo = 0, hi = 110;
      function sx(v) { return pad + (v - lo) / (hi - lo) * (W - 2 * pad); }
      function sy(v) { return H - pad - (v - lo) / (hi - lo) * (H - 2 * pad); }

      ctx.strokeStyle = "#e2e5ea";
      ctx.lineWidth = 1;
      ctx.strokeRect(pad, pad, W - 2 * pad, H - 2 * pad);
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(sx(lo), sy(lo));
      ctx.lineTo(sx(hi), sy(hi));
      ctx.stroke();
      ctx.setLineDash([]);

      var color = accent();
      people.forEach(function (p) {
        var inPicked = picked.indexOf(p) >= 0;
        ctx.fillStyle = inPicked ? color : "rgba(120,130,150,.35)";
        ctx.beginPath();
        ctx.arc(sx(p.t1), sy(p.t2), inPicked ? 4 : 2.4, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = "#6b7280";
      ctx.font = "13px -apple-system, system-ui, sans-serif";
      ctx.fillText("1-е измерение →", pad, H - 12);
      ctx.save();
      ctx.translate(12, H - pad);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("2-е измерение →", 0, 0);
      ctx.restore();
      ctx.fillStyle = color;
      ctx.fillText("выделены худшие 10%", W - 190, pad + 16);
    }

    document.getElementById("again").addEventListener("click", render);
    render();
  }

  // ---------- доверительные интервалы ----------




  function mountIntervals(root) {
    root.innerHTML =
      '<div class="card">' +
      '<p class="lead">Истинное среднее μ = 50 нам известно — так видно, какие интервалы его накрывают. ' +
      "Каждая полоска — доверительный интервал, построенный по отдельной выборке.</p>" +
      '<div class="demo-controls">' +
      '<label>Доверительная вероятность, %<select id="conf">' +
      '<option value="80">80</option><option value="90">90</option>' +
      '<option value="95" selected>95</option><option value="99">99</option></select></label>' +
      '<label>Объём выборки n<input type="number" id="n" value="30" min="5" max="500" step="5"></label>' +
      "</div>" +
      '<div id="plot"></div>' +
      '<div class="stats"><div class="stat"><div class="k">накрыли μ</div><div class="v" id="hit">—</div></div>' +
      '<div class="stat"><div class="k">промахнулись</div><div class="v" id="miss">—</div></div></div>' +
      '<div class="btn-row"><button class="btn primary" id="again">Новые 50 выборок</button></div>' +
      '<p class="demo-note">В среднем 95% интервалов накрывают истинное значение, а 5% — нет. ' +
      "Это не ошибка расчёта, а сама природа частотной интерпретации.</p>" +
      "</div>";

    var plot = document.getElementById("plot");
    var canvas = makeCanvas(plot, 720, 340);
    var confEl = document.getElementById("conf");
    var nEl = document.getElementById("n");
    var hitEl = document.getElementById("hit"), missEl = document.getElementById("miss");

    function render() {
      var conf = confEl.value, z = Z[conf], n = Math.max(5, Number(nEl.value) || 30);
      var se = 10 / Math.sqrt(n);
      var mu = 50;
      var intervals = [], hits = 0;
      for (var i = 0; i < 50; i++) {
        var xbar = gauss(mu, se);
        var lo = xbar - z * se, hi = xbar + z * se;
        if (lo <= mu && mu <= hi) hits++;
        intervals.push([lo, hi, lo <= mu && mu <= hi]);
      }
      hitEl.textContent = hits + " из 50";
      missEl.textContent = (50 - hits) + " из 50";

      var ctx = canvas.getContext("2d");
      var W = canvas.width, H = canvas.height;
      var padL = 40, padR = 20, padT = 16, padB = 26;
      var lo = 40, hi = 60;
      function sx(v) { return padL + (v - lo) / (hi - lo) * (W - padL - padR); }
      ctx.clearRect(0, 0, W, H);

      var color = accent(), rowH = (H - padT - padB) / intervals.length;
      intervals.forEach(function (iv, i) {
        var y = padT + i * rowH + rowH / 2;
        ctx.strokeStyle = iv[2] ? color : "#c0392b";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(sx(iv[0]), y);
        ctx.lineTo(sx(iv[1]), y);
        ctx.stroke();
      });

      ctx.strokeStyle = "#6b7280";
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx(mu), padT);
      ctx.lineTo(sx(mu), H - padB);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#6b7280";
      ctx.font = "13px -apple-system, system-ui, sans-serif";
      ctx.fillText("μ = 50", sx(mu) + 6, H - 8);
      ctx.fillText(lo.toFixed(0), padL - 6, H - 8);
    }

    document.getElementById("again").addEventListener("click", render);
    confEl.addEventListener("change", render);
    nEl.addEventListener("change", render);
    render();
  }

  // ---------- парадокс Симпсона ----------


  function mountSimpson(root) {
    root.innerHTML =
      '<div class="card">' +
      '<p class="lead">Две подгруппы, в каждой метрика растёт с ростом x. Но если объединить их ' +
      "в один отчёт, тренд окажется падающим — группы просто лежат в разных диапазонах x.</p>" +
      '<div class="demo-controls">' +
      '<label>Наблюдений в группе A<input type="number" id="na" value="20" min="5" max="60" step="5"></label>' +
      '<label>в группе B<input type="number" id="nb" value="20" min="5" max="60" step="5"></label>' +
      "</div>" +
      '<div id="plot"></div>' +
      '<div class="stats">' +
      '<div class="stat"><div class="k">наклон внутри A</div><div class="v" id="sA">—</div></div>' +
      '<div class="stat"><div class="k">наклон внутри B</div><div class="v" id="sB">—</div></div>' +
      '<div class="stat"><div class="k">наклон по всем точкам</div><div class="v" id="sAll">—</div></div>' +
      "</div>" +
      '<div class="btn-row"><button class="btn primary" id="again">Пересчитать</button></div>' +
      '<p class="demo-note">Вывод «в целом метрика падает» формально верен для смешанной выборки, ' +
      "но управленческое решение по нему будет неверным: внутри каждой группы рост.</p>" +
      "</div>";

    var plot = document.getElementById("plot");
    var canvas = makeCanvas(plot, 720, 360);
    var A = [], B = [];
    var naEl = document.getElementById("na"), nbEl = document.getElementById("nb");

    function sample(na, nb) {
      A = []; B = [];
      for (var i = 0; i < na; i++) {
        var x = 1 + Math.random() * 2;
        A.push([x, 100 + 5 * x + gauss(0, 4)]);
      }
      for (var j = 0; j < nb; j++) {
        var x2 = 7 + Math.random() * 2;
        B.push([x2, 20 + 5 * x2 + gauss(0, 4)]);
      }
    }

    function render() {
      sample(Number(naEl.value), Number(nbEl.value));
      var all = A.concat(B);
      var fa = fit(A), fb = fit(B), fall = fit(all);
      document.getElementById("sA").textContent = "+" + fa.b.toFixed(1);
      document.getElementById("sB").textContent = "+" + fb.b.toFixed(1);
      document.getElementById("sAll").textContent = fall.b.toFixed(1);

      var ctx = canvas.getContext("2d");
      var W = canvas.width, H = canvas.height, pad = 36;
      var x0 = 0, x1 = 11, y0 = 0, y1 = 170;
      function sx(v) { return pad + (v - x0) / (x1 - x0) * (W - 2 * pad); }
      function sy(v) { return H - pad - (v - y0) / (y1 - y0) * (H - 2 * pad); }

      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "#e2e5ea";
      ctx.strokeRect(pad, pad, W - 2 * pad, H - 2 * pad);

      var color = accent();
      var muted = "rgba(120,130,150,.55)";
      A.forEach(function (p) {
        ctx.fillStyle = color; ctx.beginPath(); ctx.arc(sx(p[0]), sy(p[1]), 3, 0, Math.PI * 2); ctx.fill();
      });
      B.forEach(function (p) {
        ctx.fillStyle = muted; ctx.beginPath(); ctx.arc(sx(p[0]), sy(p[1]), 3, 0, Math.PI * 2); ctx.fill();
      });

      function line(f, from, to, style, width, dash) {
        ctx.strokeStyle = style;
        ctx.lineWidth = width;
        ctx.setLineDash(dash || []);
        ctx.beginPath();
        ctx.moveTo(sx(from), sy(f.a + f.b * from));
        ctx.lineTo(sx(to), sy(f.a + f.b * to));
        ctx.stroke();
        ctx.setLineDash([]);
      }
      line(fa, 0.5, 3.5, color, 2.5);
      line(fb, 6.5, 9.5, muted, 2.5);
      line(fall, 0.5, 9.5, "#c0392b", 2.5, [7, 6]);

      ctx.fillStyle = "#6b7280";
      ctx.font = "13px -apple-system, system-ui, sans-serif";
      ctx.fillText("группа A", pad + 4, pad + 16);
      ctx.fillText("группа B", W - 90, pad + 16);
      ctx.fillStyle = "#c0392b";
      ctx.fillText("общий тренд", pad + 4, pad + 34);
    }

    naEl.addEventListener("change", render);
    nbEl.addEventListener("change", render);
    document.getElementById("again").addEventListener("click", render);
    render();
  }

  // ---------- ошибки I и II рода ----------

  function mountErrors(root) {
    root.innerHTML =
      '<div class="card">' +
      '<p class="lead">Слева — распределение статистики, если H₀ верна, справа — если верна H₁. ' +
      "Порог задаёт, какую долю каждой ошибки вы готовы принять.</p>" +
      '<div class="demo-controls">' +
      '<label>Величина эффекта d<input type="range" id="d" min="0.5" max="4" step="0.1" value="2"></label>' +
      '<label>Порог<input type="range" id="t" min="0" max="4" step="0.05" value="1.96"></label>' +
      "</div>" +
      '<div id="plot"></div>' +
      '<div class="stats">' +
      '<div class="stat"><div class="k">α — ошибка I рода</div><div class="v" id="alpha">—</div></div>' +
      '<div class="stat"><div class="k">β — ошибка II рода</div><div class="v" id="beta">—</div></div>' +
      '<div class="stat"><div class="k">мощность 1 − β</div><div class="v" id="power">—</div></div>' +
      "</div>" +
      '<p class="demo-note">Сдвиньте порог вправо: α падает, β растёт. Единственный способ уменьшить ' +
      "обе ошибки сразу — увеличить выборку, то есть развести распределения сильнее.</p>" +
      "</div>";

    var plot = document.getElementById("plot");
    var canvas = makeCanvas(plot, 720, 340);
    var dEl = document.getElementById("d"), tEl = document.getElementById("t");
    var alphaEl = document.getElementById("alpha"), betaEl = document.getElementById("beta"), powerEl = document.getElementById("power");

    function fmtPct(v) { return (v * 100).toFixed(1).replace(".", ",") + "%"; }

    function render() {
      var d = Number(dEl.value), t = Number(tEl.value);
      var alpha = 1 - cdf(t), beta = cdf(t - d);
      alphaEl.textContent = fmtPct(alpha);
      betaEl.textContent = fmtPct(beta);
      powerEl.textContent = fmtPct(1 - beta);

      var ctx = canvas.getContext("2d");
      var W = canvas.width, H = canvas.height, pad = 30;
      var xmin = -4, xmax = Math.max(d + 4, 5), ymax = 0.45;
      function sx(x) { return pad + (x - xmin) / (xmax - xmin) * (W - 2 * pad); }
      function sy(y) { return H - pad - y / ymax * (H - 2 * pad); }
      ctx.clearRect(0, 0, W, H);

      var accentC = accent();
      function curve(mu, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (var px = 0; px <= W - 2 * pad; px += 2) {
          var x = xmin + px / (W - 2 * pad) * (xmax - xmin);
          var y = pdf(x, mu, 1);
          if (px === 0) ctx.moveTo(pad + px, sy(y));
          else ctx.lineTo(pad + px, sy(y));
        }
        ctx.stroke();
      }

      // заливка хвостов
      for (var px2 = 0; px2 <= W - 2 * pad; px2 += 2) {
        var x2 = xmin + px2 / (W - 2 * pad) * (xmax - xmin);
        if (x2 >= t) {
          ctx.fillStyle = "rgba(192,57,43,.25)";
          var h0 = pdf(x2, 0, 1);
          ctx.fillRect(pad + px2, sy(h0), 2, H - pad - sy(h0));
        } else {
          ctx.fillStyle = "rgba(47,91,215,.16)";
          var h1 = pdf(x2, d, 1);
          ctx.fillRect(pad + px2, sy(h1), 2, H - pad - sy(h1));
        }
      }

      curve(0, "#6b7280");
      curve(d, accentC);

      ctx.strokeStyle = "#171a20";
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(sx(t), pad);
      ctx.lineTo(sx(t), H - pad);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#6b7280";
      ctx.font = "13px -apple-system, system-ui, sans-serif";
      ctx.fillText("H₀", sx(0) - 8, H - 8);
      ctx.fillText("H₁", sx(d) - 8, H - 8);
      ctx.fillStyle = "#171a20";
      ctx.fillText("порог", sx(t) + 6, pad + 14);
    }

    dEl.addEventListener("input", render);
    tEl.addEventListener("input", render);
    render();
  }

  // ---------- бутстрап ----------



  function mountBootstrap(root) {
    root.innerHTML =
      '<div class="card">' +
      '<p class="lead">Одна выборка из 40 наблюдений со скошенным распределением (доходы). ' +
      "Бутстрап берёт из неё выборки с возвратом и показывает, насколько колеблется среднее.</p>" +
      '<div id="plot"></div>' +
      '<div class="stats">' +
      '<div class="stat"><div class="k">среднее по выборке</div><div class="v" id="mean">—</div></div>' +
      '<div class="stat"><div class="k">95% интервал</div><div class="v" id="ci" style="font-size:16px">—</div></div>' +
      "</div>" +
      '<div class="btn-row"><button class="btn primary" id="again">Новая выборка</button></div>' +
      '<p class="demo-note">Красные пунктиры — границы интервала, синий — среднее. ' +
      "Бутстрап не создаёт новых данных: он показывает, как вела бы себя оценка на других выборках такого же размера.</p>" +
      "</div>";

    var plot = document.getElementById("plot");
    var canvas = makeCanvas(plot, 720, 320);
    var meanEl = document.getElementById("mean"), ciEl = document.getElementById("ci");

    function render() {
      var n = 40, sample = [];
      for (var i = 0; i < n; i++) sample.push(Math.exp(gauss(3.9, 0.5)));

      var mean = sample.reduce(function (s, x) { return s + x; }, 0) / n;
      var means = [];
      for (var r = 0; r < 2000; r++) {
        var sum = 0;
        for (var j = 0; j < n; j++) sum += sample[Math.floor(Math.random() * n)];
        means.push(sum / n);
      }
      means.sort(function (a, b) { return a - b; });
      var lo = percentile(means, 0.025), hi = percentile(means, 0.975);

      meanEl.textContent = mean.toFixed(1);
      ciEl.textContent = lo.toFixed(1) + " – " + hi.toFixed(1);
      drawHistLines(canvas, means, [
        { x: lo, color: "#c0392b" },
        { x: hi, color: "#c0392b" },
        { x: mean, color: accent() }
      ], "2000 бутстраповских средних");
    }

    document.getElementById("again").addEventListener("click", render);
    render();
  }

  // ---------- перестановочный тест ----------

  function mountPermutation(root) {
    root.innerHTML =
      '<div class="card">' +
      '<p class="lead">Две группы по 40 наблюдений. Перестановочный тест перемешивает метки групп ' +
      "и смотрит, как часто случайная перетасовка даёт разницу не меньше наблюдённой.</p>" +
      '<div class="demo-controls"><label><input type="checkbox" id="effect" checked> в группах действительно есть эффект</label></div>' +
      '<div id="plot"></div>' +
      '<div class="stats">' +
      '<div class="stat"><div class="k">наблюдаемая разница</div><div class="v" id="diff">—</div></div>' +
      '<div class="stat"><div class="k">p-значение</div><div class="v" id="pval">—</div></div>' +
      "</div>" +
      '<div class="btn-row"><button class="btn primary" id="again">Новый эксперимент</button></div>' +
      '<p class="demo-note">Снимите галочку — эффекта нет, и p-значение станет равномерным: ' +
      "иногда оно всё равно окажется меньше 0,05. Это и есть ошибка I рода.</p>" +
      "</div>";

    var plot = document.getElementById("plot");
    var canvas = makeCanvas(plot, 720, 320);
    var diffEl = document.getElementById("diff"), pEl = document.getElementById("pval");
    var effectEl = document.getElementById("effect");

    function render() {
      var n = 40, shift = effectEl.checked ? 6 : 0;
      var A = [], B = [];
      for (var i = 0; i < n; i++) { A.push(gauss(50, 10)); B.push(gauss(50 + shift, 10)); }

      var meanA = A.reduce(function (s, x) { return s + x; }, 0) / n;
      var meanB = B.reduce(function (s, x) { return s + x; }, 0) / n;
      var obs = meanB - meanA;

      var pool = A.concat(B), diffs = [];
      for (var r = 0; r < 2000; r++) {
        var p = pool.slice();
        for (var k = p.length - 1; k > 0; k--) {
          var j = Math.floor(Math.random() * (k + 1));
          var t = p[k]; p[k] = p[j]; p[j] = t;
        }
        var sa = 0, sb = 0;
        for (var a = 0; a < n; a++) sa += p[a];
        for (var b = n; b < 2 * n; b++) sb += p[b];
        diffs.push(sb / n - sa / n);
      }

      var hits = diffs.filter(function (d) { return Math.abs(d) >= Math.abs(obs); }).length;
      var pv = hits / diffs.length;

      diffEl.textContent = (obs >= 0 ? "+" : "") + obs.toFixed(2);
      pEl.textContent = pv.toFixed(3).replace(".", ",");

      drawHistLines(canvas, diffs, [
        { x: obs, color: "#c0392b" },
        { x: -obs, color: "#c0392b" }
      ], "2000 разниц средних при случайных перестановках");
    }

    effectEl.addEventListener("change", render);
    document.getElementById("again").addEventListener("click", render);
    render();
  }

  // ---------- ROC-кривая и порог ----------

  function mountRoc(root) {
    root.innerHTML =
      '<div class="card">' +
      '<p class="lead">Модель выдаёт склонность от 0 до 1, а порог превращает её в метку. ' +
      "Двигайте порог: вместе с ним меняются ошибки, precision и recall.</p>" +
      '<div class="demo-controls"><label>Порог <b id="thrVal">0,50</b>' +
      '<input type="range" id="thr" min="0" max="100" step="1" value="50"></label></div>' +
      '<div id="plot"></div>' +
      '<div class="stats">' +
      '<div class="stat"><div class="k">precision</div><div class="v" id="prec">—</div></div>' +
      '<div class="stat"><div class="k">recall</div><div class="v" id="rec">—</div></div>' +
      '<div class="stat"><div class="k">AUC</div><div class="v" id="auc">—</div></div>' +
      "</div>" +
      '<p class="demo-note" id="cm"></p>' +
      "</div>";

    var plot = document.getElementById("plot");
    var canvas = makeCanvas(plot, 700, 420);
    var thrEl = document.getElementById("thr");
    var thrVal = document.getElementById("thrVal");
    var precEl = document.getElementById("prec"), recEl = document.getElementById("rec");
    var aucEl = document.getElementById("auc"), cmEl = document.getElementById("cm");

    function clamp(v) { return Math.max(0.01, Math.min(0.99, v)); }

    var pos = [], neg = [];
    for (var i = 0; i < 60; i++) pos.push(clamp(gauss(0.62, 0.18)));
    for (var j = 0; j < 110; j++) neg.push(clamp(gauss(0.34, 0.18)));

    var all = pos.map(function (s) { return { s: s, y: 1 }; })
      .concat(neg.map(function (s) { return { s: s, y: 0 }; }))
      .sort(function (a, b) { return b.s - a.s; });

    var tp = 0, fp = 0, pts = [{ fpr: 0, tpr: 0 }];
    all.forEach(function (it) {
      if (it.y === 1) tp++; else fp++;
      pts.push({ fpr: fp / neg.length, tpr: tp / pos.length });
    });

    var auc = 0;
    for (var k = 1; k < pts.length; k++) {
      auc += (pts[k].fpr - pts[k - 1].fpr) * (pts[k].tpr + pts[k - 1].tpr) / 2;
    }
    aucEl.textContent = auc.toFixed(3).replace(".", ",");

    function render() {
      var thr = Number(thrEl.value) / 100;
      thrVal.textContent = thr.toFixed(2).replace(".", ",");

      var TP = 0, FN = 0, FP = 0, TN = 0;
      pos.forEach(function (s) { if (s >= thr) TP++; else FN++; });
      neg.forEach(function (s) { if (s >= thr) FP++; else TN++; });
      var precision = TP + FP ? TP / (TP + FP) : 0;
      var recall = TP / (TP + FN);

      precEl.textContent = (precision * 100).toFixed(1).replace(".", ",") + "%";
      recEl.textContent = (recall * 100).toFixed(1).replace(".", ",") + "%";
      cmEl.textContent = "TP = " + TP + " · FP = " + FP + " · FN = " + FN + " · TN = " + TN;

      var ctx = canvas.getContext("2d");
      var size = 340, x0 = 70, y0 = 30;
      var color = accent();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      function sx(v) { return x0 + v * size; }
      function sy(v) { return y0 + (1 - v) * size; }

      ctx.strokeStyle = "#e2e5ea";
      ctx.lineWidth = 1;
      ctx.strokeRect(x0, y0, size, size);

      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = "#c9cdd6";
      ctx.beginPath();
      ctx.moveTo(sx(0), sy(0));
      ctx.lineTo(sx(1), sy(1));
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      pts.forEach(function (p, idx) {
        if (idx === 0) ctx.moveTo(sx(p.fpr), sy(p.tpr));
        else ctx.lineTo(sx(p.fpr), sy(p.tpr));
      });
      ctx.stroke();

      ctx.fillStyle = "#c0392b";
      ctx.beginPath();
      ctx.arc(sx(FP / neg.length), sy(recall), 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#6b7280";
      ctx.font = "13px -apple-system, system-ui, sans-serif";
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.fillText("0", x0 - 4, y0 + size + 8);
      ctx.fillText("1", x0 + size - 4, y0 + size + 8);
      ctx.fillText("доля ложных срабатываний →", x0 + 80, y0 + size + 26);

      ctx.save();
      ctx.translate(20, y0 + size - 120);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("recall →", 0, 0);
      ctx.restore();
    }

    thrEl.addEventListener("input", render);
    render();
  }

  // ---------- подглядывание в A/B ----------

  function mountPeek(root) {
    var state = { aC: 0, aN: 0, bC: 0, bN: 0, p: [], hits: 0 };
    root.innerHTML = '<div class="demo-controls"><button class="btn primary" id="pkDay">Следующий день</button>' +
      '<button class="btn" id="pkTen">Ещё 10 дней</button>' +
      '<button class="btn" id="pkReset">Сбросить</button></div>' +
      '<div class="demo-stats"><span>Дней: <b id="pkDays">0</b></span><span>p-value: <b id="pkP">—</b></span>' +
      '<span>Дней с p &lt; 0,05: <b id="pkHits">0</b></span></div>' +
      '<div id="pkCanvas"></div><p class="demo-note" id="pkNote">Оба варианта имеют одинаковую истинную конверсию 10%. Любое p &lt; 0,05 здесь — ложное срабатывание.</p>';
    var canvas = makeCanvas(root.querySelector("#pkCanvas"), 680, 250);
    var ctx = canvas.getContext("2d");
    function zCdf(z) {
      var t = 1 / (1 + 0.2316419 * Math.abs(z));
      var d = 0.3989423 * Math.exp(-z * z / 2);
      var p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
      return z > 0 ? 1 - p : p;
    }
    function pValue() {
      var p1 = state.aC / state.aN, p2 = state.bC / state.bN;
      var pooled = (state.aC + state.bC) / (state.aN + state.bN);
      var se = Math.sqrt(pooled * (1 - pooled) * (1 / state.aN + 1 / state.bN));
      if (!se) return 1;
      return Math.max(0, Math.min(1, 2 * (1 - zCdf(Math.abs((p2 - p1) / se)))));
    }
    function addDay() {
      for (var i = 0; i < 140; i++) {
        state.aN++; if (Math.random() < 0.10) state.aC++;
        state.bN++; if (Math.random() < 0.10) state.bC++;
      }
      var p = pValue();
      state.p.push(p);
      if (p < 0.05) state.hits++;
      draw();
    }
    function draw() {
      var W = canvas.width, H = canvas.height, padL = 34, padR = 14, padT = 16, padB = 28;
      ctx.clearRect(0, 0, W, H);
      var plotW = W - padL - padR, plotH = H - padT - padB;
      ctx.strokeStyle = "#c9cdd6"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH); ctx.lineTo(W - padR, padT + plotH); ctx.stroke();
      ctx.fillStyle = "#6b7280"; ctx.font = "12px -apple-system, system-ui, sans-serif";
      ctx.fillText("p-value", 2, 10);
      ctx.fillText("дни", W - 28, H - 8);
      var alphaY = padT + (1 - 0.05) * plotH;
      ctx.strokeStyle = "#c2410c"; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(padL, alphaY); ctx.lineTo(W - padR, alphaY); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "#c2410c"; ctx.fillText("α = 0,05", padL + 4, alphaY - 4);
      if (!state.p.length) { document.getElementById("pkDays").textContent = "0"; return; }
      var n = Math.max(30, state.p.length);
      ctx.strokeStyle = accent(); ctx.lineWidth = 2; ctx.beginPath();
      state.p.forEach(function (p, i) {
        var x = padL + (n === 1 ? 0 : i / (n - 1) * plotW);
        var y = padT + (1 - p) * plotH;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      state.p.forEach(function (p, i) {
        var x = padL + (n === 1 ? 0 : i / (n - 1) * plotW);
        var y = padT + (1 - p) * plotH;
        ctx.fillStyle = p < 0.05 ? "#c2410c" : accent();
        ctx.beginPath(); ctx.arc(x, y, p < 0.05 ? 4 : 2.5, 0, Math.PI * 2); ctx.fill();
      });
      document.getElementById("pkDays").textContent = state.p.length;
      document.getElementById("pkP").textContent = state.p[state.p.length - 1].toFixed(3).replace(".", ",");
      document.getElementById("pkHits").textContent = state.hits;
      var note = document.getElementById("pkNote");
      note.textContent = state.hits
        ? "За " + state.p.length + " дней p уже было ниже 0,05 в " + state.hits + " дне(й). Остановка на таком дне объявила бы эффект, которого нет."
        : "Пока p не опускался ниже 0,05. Продолжайте и смотрите, как случайный шум пересекает порог.";
    }
    document.getElementById("pkDay").addEventListener("click", addDay);
    document.getElementById("pkTen").addEventListener("click", function () { for (var i = 0; i < 10; i++) addDay(); });
    document.getElementById("pkReset").addEventListener("click", function () {
      state = { aC: 0, aN: 0, bC: 0, bN: 0, p: [], hits: 0 };
      draw();
    });
    draw();
    return function () { root.innerHTML = ""; };
  }

  // ---------- стоимость AI-фичи ----------

  function mountAiCost(root) {
    root.innerHTML =
      '<div class="card">' +
      '<p class="lead">Считайте не цену запроса, а цену решённой задачи. Экономия на токенах ' +
      "легко превращается в рост расходов, если ответы перестают решать задачу.</p>" +
      '<div class="demo-controls">' +
      '<label>Запросов в месяц<input type="number" id="aiReq" value="100000" min="1" step="1000"></label>' +
      '<label>Токенов на запрос<input type="number" id="aiTok" value="1200" min="1" step="100"></label>' +
      '<label>Цена за 1 млн токенов, ₽<input type="number" id="aiPrice" value="150" min="0" step="10"></label>' +
      '<label>Доля решённых задач, %<input type="number" id="aiOk" value="70" min="1" max="100" step="1"></label>' +
      "</div>" +
      '<div class="stats"><div class="stat"><div class="k">цена запроса</div><div class="v" id="aiCostReq">—</div></div>' +
      '<div class="stat"><div class="k">расходы в месяц</div><div class="v" id="aiMonth">—</div></div>' +
      '<div class="stat"><div class="k">цена решённой задачи</div><div class="v" id="aiResolved">—</div></div></div>' +
      '<div class="formula">цена запроса = токены / 1 000 000 × цена за 1 млн</div>' +
      '<p class="demo-note" id="aiNote"></p>' +
      "</div>";

    var reqEl = document.getElementById("aiReq"), tokEl = document.getElementById("aiTok");
    var priceEl = document.getElementById("aiPrice"), okEl = document.getElementById("aiOk");
    var costReq = document.getElementById("aiCostReq"), month = document.getElementById("aiMonth");
    var resolved = document.getElementById("aiResolved"), note = document.getElementById("aiNote");

    function rub(x) { return x.toLocaleString("ru-RU", { maximumFractionDigits: 2 }) + " ₽"; }

    function render() {
      var req = Number(reqEl.value), tok = Number(tokEl.value);
      var price = Number(priceEl.value), ok = Number(okEl.value);
      if (!(req > 0 && tok > 0 && price >= 0 && ok > 0)) {
        costReq.textContent = month.textContent = resolved.textContent = "—";
        return;
      }
      var perRequest = tok / 1000000 * price;
      var monthly = req * perRequest;
      var solved = req * ok / 100;
      costReq.textContent = rub(perRequest);
      month.textContent = rub(monthly);
      resolved.textContent = monthly / solved ? rub(monthly / solved) : "—";
      note.textContent = "Успешных задач: " + Math.round(solved).toLocaleString("ru-RU") +
        ". Если доля успеха упадёт при той же цене запроса, цена решённой задачи вырастет.";
    }

    reqEl.addEventListener("input", render);
    tokEl.addEventListener("input", render);
    priceEl.addEventListener("input", render);
    okEl.addEventListener("input", render);
    render();
  }

  // ---------- Монте-Карло для LTV ----------

  function mountMonteCarlo(root) {
    root.innerHTML =
      '<div class="card">' +
      '<p class="lead">Одна цифра LTV скрывает риск. Задайте удержание, чек и маржу — ' +
      "симуляция покажет не только среднее, но и нижний квартиль.</p>" +
      '<div class="demo-controls">' +
      '<label>Удержание в месяц, %<input type="number" id="mcRet" value="85" min="1" max="99" step="1"></label>' +
      '<label>Средний чек, ₽<input type="number" id="mcArpu" value="1500" min="1" step="100"></label>' +
      '<label>Маржа, %<input type="number" id="mcMargin" value="40" min="1" max="100" step="1"></label>' +
      '<label>Горизонт, мес.<input type="number" id="mcMonths" value="12" min="1" max="60" step="1"></label>' +
      "</div>" +
      '<div class="stats"><div class="stat"><div class="k">средний LTV</div><div class="v" id="mcMean">—</div></div>' +
      '<div class="stat"><div class="k">P10</div><div class="v" id="mcP10">—</div></div>' +
      '<div class="stat"><div class="k">P90</div><div class="v" id="mcP90">—</div></div></div>' +
      '<p class="demo-note" id="mcNote"></p></div>';

    var retEl = document.getElementById("mcRet"), arpuEl = document.getElementById("mcArpu");
    var marginEl = document.getElementById("mcMargin"), monthsEl = document.getElementById("mcMonths");
    var meanEl = document.getElementById("mcMean"), p10El = document.getElementById("mcP10");
    var p90El = document.getElementById("mcP90"), note = document.getElementById("mcNote");

    function rub(x) { return Math.round(x).toLocaleString("ru-RU") + " ₽"; }

    function render() {
      var ret = Number(retEl.value) / 100, arpu = Number(arpuEl.value);
      var margin = Number(marginEl.value) / 100, months = Number(monthsEl.value);
      if (!(ret > 0 && arpu > 0 && margin > 0 && months > 0)) { return; }
      var vals = [];
      for (var i = 0; i < 2000; i++) {
        var ltv = 0;
        for (var m = 0; m < months; m++) {
          ltv += arpu * margin;
          if (Math.random() > ret) break;
        }
        vals.push(ltv);
      }
      vals.sort(function (a, b) { return a - b; });
      var sum = vals.reduce(function (a, b) { return a + b; }, 0);
      meanEl.textContent = rub(sum / vals.length);
      p10El.textContent = rub(percentile(vals, 0.1));
      p90El.textContent = rub(percentile(vals, 0.9));
      note.textContent = "2000 клиентов, удержание " + Math.round(ret * 100) + "% в месяц. " +
        "P10 — плохой, но не катастрофический исход; решайте по нему, если цена ошибки велика.";
    }

    [retEl, arpuEl, marginEl, monthsEl].forEach(function (el) { el.addEventListener("input", render); });
    render();
  }

  // ---------- очередь поддержки ----------

  function mountQueue(root) {
    root.innerHTML =
      '<div class="card">' +
      '<p class="lead">Почасовая нагрузка на поддержку: 30 дней по 8 часов. ' +
      "Смотрите не только среднее ожидание, но и хвост.</p>" +
      '<div class="demo-controls">' +
      '<label>Обращений в час<input type="number" id="qArr" value="30" min="1" step="1"></label>' +
      '<label>Обращений на агента в час<input type="number" id="qSrv" value="8" min="1" step="1"></label>' +
      '<label>Агентов<input type="number" id="qAgents" value="5" min="1" max="50" step="1"></label>' +
      "</div>" +
      '<div class="stats"><div class="stat"><div class="k">среднее ожидание</div><div class="v" id="qMean">—</div></div>' +
      '<div class="stat"><div class="k">p95 ожидания</div><div class="v" id="qP95">—</div></div>' +
      '<div class="stat"><div class="k">загрузка</div><div class="v" id="qUtil">—</div></div></div>' +
      '<p class="demo-note" id="qNote"></p></div>';

    var arrEl = document.getElementById("qArr"), srvEl = document.getElementById("qSrv");
    var agEl = document.getElementById("qAgents");
    var meanEl = document.getElementById("qMean"), p95El = document.getElementById("qP95");
    var utilEl = document.getElementById("qUtil"), note = document.getElementById("qNote");

    function poisson(lambda) {
      var L = Math.exp(-lambda), k = 0, p = 1;
      do { k++; p *= Math.random(); } while (p > L);
      return k - 1;
    }
    function mins(x) { return x.toFixed(1).replace(".", ",") + " мин"; }

    function render() {
      var lambda = Number(arrEl.value), mu = Number(srvEl.value), c = Number(agEl.value);
      if (!(lambda > 0 && mu > 0 && c > 0)) return;
      var waits = [], busyMinutes = 0, totalMinutes = 0;
      for (var day = 0; day < 30; day++) {
        var q = [], busy = 0;
        for (var minute = 0; minute < 480; minute++) {
          var completed = 0;
          for (var b = 0; b < busy; b++) {
            if (Math.random() < mu / 60) completed++;
          }
          busy -= completed;
          busyMinutes += busy;
          totalMinutes += c;
          var arrivals = poisson(lambda / 60);
          for (var a = 0; a < arrivals; a++) q.push(minute);
          while (busy < c && q.length) {
            var arrived = q.shift();
            waits.push(minute - arrived);
            busy++;
          }
        }
      }
      waits.sort(function (a, b) { return a - b; });
      if (!waits.length) { meanEl.textContent = p95El.textContent = utilEl.textContent = "—"; return; }
      var sum = waits.reduce(function (a, b) { return a + b; }, 0);
      meanEl.textContent = mins(sum / waits.length);
      p95El.textContent = mins(percentile(waits, 0.95));
      var util = busyMinutes / totalMinutes;
      utilEl.textContent = Math.round(util * 100) + "%";
      note.textContent = "Загрузка " + Math.round(util * 100) + "%. При приближении к 100% очередь растёт " +
        "нелинейно: небольшой всплеск создаёт длинный хвост ожидания.";
    }

    [arrEl, srvEl, agEl].forEach(function (el) { el.addEventListener("input", render); });
    render();
  }

  window.DEMO_FNS.mountCLT = mountCLT;
  window.DEMO_FNS.mountSample = mountSample;
  window.DEMO_FNS.mountRegression = mountRegression;
  window.DEMO_FNS.mountIntervals = mountIntervals;
  window.DEMO_FNS.mountSimpson = mountSimpson;
  window.DEMO_FNS.mountErrors = mountErrors;
  window.DEMO_FNS.mountBootstrap = mountBootstrap;
  window.DEMO_FNS.mountPermutation = mountPermutation;
  window.DEMO_FNS.mountRoc = mountRoc;
  window.DEMO_FNS.mountPeek = mountPeek;
  window.DEMO_FNS.mountAiCost = mountAiCost;
  window.DEMO_FNS.mountMonteCarlo = mountMonteCarlo;
  window.DEMO_FNS.mountQueue = mountQueue;
})();
