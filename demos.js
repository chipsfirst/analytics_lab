// Демонстрации: интерактивные модели, которые показывают, а не рассказывают.

(function () {
  "use strict";

  function gauss(mu, sd) {
    var u = 0, v = 0;
    while (!u) u = Math.random();
    while (!v) v = Math.random();
    return mu + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function accent() {
    try {
      var v = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      return v || "#2f5bd7";
    } catch (e) { return "#2f5bd7"; }
  }

  function makeCanvas(parent, w, h) {
    var c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    c.className = "demo-canvas";
    parent.appendChild(c);
    return c;
  }

  function drawHistogram(canvas, values, caption) {
    var ctx = canvas.getContext("2d");
    var W = canvas.width, H = canvas.height;
    var padL = 16, padR = 16, padT = 18, padB = 34;
    ctx.clearRect(0, 0, W, H);

    var min = Math.min.apply(null, values), max = Math.max.apply(null, values);
    if (max === min) max = min + 1;
    var bins = 42, counts = new Array(bins).fill(0);
    values.forEach(function (v) {
      var k = Math.floor((v - min) / (max - min) * bins);
      counts[Math.min(bins - 1, Math.max(0, k))]++;
    });
    var peak = Math.max.apply(null, counts);
    var plotH = H - padT - padB, plotW = W - padL - padR;
    var bw = plotW / bins;

    var color = accent();
    ctx.fillStyle = color;
    for (var i = 0; i < bins; i++) {
      var h = counts[i] / peak * plotH;
      ctx.fillRect(padL + i * bw, padT + plotH - h, Math.max(1, bw - 1), h);
    }

    ctx.strokeStyle = "#c9cdd6";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT + plotH + 0.5);
    ctx.lineTo(W - padR, padT + plotH + 0.5);
    ctx.stroke();

    ctx.fillStyle = "#6b7280";
    ctx.font = "13px -apple-system, system-ui, sans-serif";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillText(min.toFixed(2), padL, H - padB + 8);
    ctx.textAlign = "right";
    ctx.fillText(max.toFixed(2), W - padR, H - padB + 8);
    ctx.textAlign = "left";
    ctx.fillText(caption, padL, 0);
  }

  // ---------- центральная предельная теорема ----------

  function sampleFrom(dist) {
    if (dist === "uniform") return Math.random();
    if (dist === "exp") return -Math.log(1 - Math.random());
    return Math.random() < 0.5 ? Math.random() * 0.22 : 0.62 + Math.random() * 0.34;
  }

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

  window.DEMOS = {
    clt: {
      title: "Центральная предельная теорема",
      tag: "Почему среднее становится нормальным, даже если данные нет",
      mount: mountCLT
    },
    sample: {
      title: "Размер выборки для A/B",
      tag: "Сколько пользователей нужно, чтобы заметить эффект",
      mount: mountSample
    },
    regression: {
      title: "Регрессия к среднему",
      tag: "Почему худшие и лучшие «исправляются» сами",
      mount: mountRegression
    }
  };
})();
