// Демонстрации: общие помощники рисования и симуляций.
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

  function erf(x) {
    var s = x < 0 ? -1 : 1;
    x = Math.abs(x);
    var a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741,
        a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    var t = 1 / (1 + p * x);
    var y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return s * y;
  }

  function cdf(x) { return 0.5 * (1 + erf(x / Math.SQRT2)); }
  function pdf(x, mu, sd) { return Math.exp(-0.5 * Math.pow((x - mu) / sd, 2)) / (sd * Math.sqrt(2 * Math.PI)); }

  var Z = { "80": 1.2816, "90": 1.6449, "95": 1.96, "99": 2.5758 };

  function fit(points) {
    var n = points.length;
    if (!n) return { a: 0, b: 0 };
    var sx = 0, sy = 0;
    points.forEach(function (p) { sx += p[0]; sy += p[1]; });
    var mx = sx / n, my = sy / n, num = 0, den = 0;
    points.forEach(function (p) {
      num += (p[0] - mx) * (p[1] - my);
      den += (p[0] - mx) * (p[0] - mx);
    });
    var b = den ? num / den : 0;
    return { a: my - b * mx, b: b };
  }

  function percentile(sorted, p) {
    var pos = (sorted.length - 1) * p;
    var lo = Math.floor(pos), hi = Math.ceil(pos);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
  }

  function drawHistLines(canvas, values, lines, caption) {
    var ctx = canvas.getContext("2d");
    var W = canvas.width, H = canvas.height;
    var padL = 16, padR = 16, padT = 18, padB = 34;
    ctx.clearRect(0, 0, W, H);

    var min = Math.min.apply(null, values), max = Math.max.apply(null, values);
    (lines || []).forEach(function (l) { min = Math.min(min, l.x); max = Math.max(max, l.x); });
    if (max === min) max = min + 1;

    var bins = 42, counts = new Array(bins).fill(0);
    values.forEach(function (v) {
      var k = Math.floor((v - min) / (max - min) * bins);
      counts[Math.min(bins - 1, Math.max(0, k))]++;
    });
    var peak = Math.max.apply(null, counts);
    var plotH = H - padT - padB, plotW = W - padL - padR, bw = plotW / bins;

    ctx.fillStyle = accent();
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

    (lines || []).forEach(function (l) {
      var x = padL + (l.x - min) / (max - min) * plotW;
      ctx.strokeStyle = l.color;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    ctx.fillStyle = "#6b7280";
    ctx.font = "13px -apple-system, system-ui, sans-serif";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillText(caption, padL, 0);
    ctx.fillText(min.toFixed(1), padL, H - padB + 8);
    ctx.textAlign = "right";
    ctx.fillText(max.toFixed(1), W - padR, H - padB + 8);
    ctx.textAlign = "left";
  }
  window.DEMO_UTILS = { gauss: gauss, accent: accent, makeCanvas: makeCanvas, drawHistogram: drawHistogram,
    sampleFrom: sampleFrom, erf: erf, cdf: cdf, pdf: pdf, fit: fit, percentile: percentile, drawHistLines: drawHistLines };
  window.DEMO_FNS = window.DEMO_FNS || {};
})();
