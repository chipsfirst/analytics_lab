// Игры. Каждая mount(el) рисует себя в переданном контейнере
// и возвращает функцию очистки (для таймеров).

(function () {
  "use strict";

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function pct(x, n) { return (x / n * 100).toFixed(1).replace(".", ",") + "%"; }

  // ---------- Монти Холл ----------

  function montyHall(root) {
    var state = { car: 0, pick: -1, opened: -1, phase: "pick", rounds: 0, wins: 0, switched: 0 };

    function newRound() {
      state.car = Math.floor(Math.random() * 3);
      state.pick = -1;
      state.opened = -1;
      state.phase = "pick";
      draw();
    }

    function draw() {
      var doors = [0, 1, 2].map(function (d) {
        var cls = "door", label = "Дверь " + (d + 1), small = "";
        if (state.pick === d) cls += " picked";
        if (state.opened === d) { cls += " open"; small = "коза"; }
        if (state.phase === "result") {
          if (d === state.car) { cls += " win"; small = "автомобиль"; }
          else if (small !== "коза") small = "коза";
        }
        return '<button class="' + cls + '" data-d="' + d + '"' + (state.phase !== "pick" ? " disabled" : "") + ">" +
          label + '<span class="small">' + small + "</span></button>";
      }).join("");

      var msg = "";
      if (state.phase === "pick") msg = "<p>Выберите дверь. За одной — автомобиль, за двумя — козы.</p>";
      else if (state.phase === "decide") msg = "<p>Ведущий открыл дверь с козой. Останетесь при своём выборе или смените дверь?</p>";
      else msg = state.won ? "<p><b>Вы выиграли автомобиль.</b></p>" : "<p><b>Вы промахнулись — там коза.</b></p>";

      var actions = "";
      if (state.phase === "decide") {
        actions = '<div class="btn-row"><button class="btn primary" id="switch">Сменить дверь</button>' +
          '<button class="btn" id="stay">Остаться</button></div>';
      } else if (state.phase === "result") {
        actions = '<div class="btn-row"><button class="btn primary" id="again">Новый раунд</button>' +
          '<button class="btn" id="sim">Смоделировать 10 000 раундов</button></div>';
      } else {
        actions = '<div class="btn-row"><button class="btn" id="sim">Смоделировать 10 000 раундов</button></div>';
      }

      root.innerHTML = '<div class="card">' + msg + '<div class="doors">' + doors + "</div>" + actions +
        '<div class="stats"><div class="stat"><div class="k">раундов</div><div class="v">' + state.rounds +
        '</div></div><div class="stat"><div class="k">побед</div><div class="v">' + state.wins +
        '</div></div><div class="stat"><div class="k">доля побед</div><div class="v">' +
        (state.rounds ? pct(state.wins, state.rounds) : "—") + "</div></div></div>" +
        "<p class=\"lead\">При стратегии «всегда менять» выигрыш ≈ 2/3, при «всегда оставаться» ≈ 1/3. " +
        "После первого выбора ваша дверь верна с вероятностью 1/3, а группа из двух других — с 2/3; " +
        "ведущий убирает из этой группы заведомо проигрышную дверь.</p></div>";

      Array.prototype.forEach.call(root.querySelectorAll(".door"), function (b) {
        b.addEventListener("click", function () {
          state.pick = Number(b.getAttribute("data-d"));
          var free = [0, 1, 2].filter(function (d) { return d !== state.pick && d !== state.car; });
          state.opened = free[Math.floor(Math.random() * free.length)];
          state.phase = "decide";
          draw();
        });
      });

      var sw = document.getElementById("switch");
      if (sw) sw.addEventListener("click", function () {
        state.pick = [0, 1, 2].filter(function (d) { return d !== state.pick && d !== state.opened; })[0];
        finish();
      });

      var st = document.getElementById("stay");
      if (st) st.addEventListener("click", finish);

      function finish() {
        state.won = state.pick === state.car;
        state.rounds++;
        if (state.won) state.wins++;
        state.phase = "result";
        draw();
      }

      var sim = document.getElementById("sim");
      if (sim) sim.addEventListener("click", function () {
        var N = 10000, stayWin = 0, switchWin = 0;
        for (var i = 0; i < N; i++) {
          var car = Math.floor(Math.random() * 3);
          var pick = Math.floor(Math.random() * 3);
          if (pick === car) stayWin++; else switchWin++;
        }
        alert("За 10 000 раундов:\nОставаться — " + pct(stayWin, N) + "\nМенять — " + pct(switchWin, N) +
          "\n\nТеория: 33,3% и 66,7%.");
      });

      var again = document.getElementById("again");
      if (again) again.addEventListener("click", newRound);
    }

    draw();
    newRound();
  }

  // ---------- Дилемма заключённого ----------

  var OPPONENTS = {
    tit: { name: "Око за око", first: "C", move: function (hist) { return hist.length ? hist[hist.length - 1].mine : "C"; } },
    defect: { name: "Всегда предаёт", first: "D", move: function () { return "D"; } },
    coop: { name: "Всегда сотрудничает", first: "C", move: function () { return "C"; } },
    random: { name: "Случайно", first: "C", move: function () { return Math.random() < 0.5 ? "C" : "D"; } }
  };

  function payoff(mine, theirs) {
    if (mine === "C" && theirs === "C") return [3, 3];
    if (mine === "C" && theirs === "D") return [0, 5];
    if (mine === "D" && theirs === "C") return [5, 0];
    return [1, 1];
  }

  function prisoners(root) {
    var state = { opp: "tit", rounds: 10, hist: [], my: 0, their: 0 };

    function draw() {
      var o = OPPONENTS[state.opp];
      var table = state.hist.length
        ? '<table class="history"><thead><tr><th>Раунд</th><th>Вы</th><th>Соперник</th><th>Счёт</th></tr></thead><tbody>' +
          state.hist.map(function (h, i) {
            return "<tr><td>" + (i + 1) + "</td><td>" + (h.mine === "C" ? "Сотрудничать" : "Предать") +
              "</td><td>" + (h.theirs === "C" ? "Сотрудничать" : "Предать") + "</td><td>" + h.p + " : " + h.q + "</td></tr>";
          }).join("") + "</tbody></table>"
        : '<p class="lead">Раунды ещё не сыграны.</p>';

      var finished = state.hist.length >= state.rounds;

      root.innerHTML = '<div class="card">' +
        "<p>Каждый раунд вы и соперник одновременно выбираете: <b>сотрудничать</b> или <b>предать</b>. " +
        "Оба сотрудничают — по 3. Оба предают — по 1. Один предаёт — 5 и 0.</p>" +
        '<div class="answer-row"><label>Соперник: <select id="opp">' +
        Object.keys(OPPONENTS).map(function (k) {
          return '<option value="' + k + '"' + (k === state.opp ? " selected" : "") + ">" + OPPONENTS[k].name + "</option>";
        }).join("") + "</select></label>" +
        '<label>Раундов: <select id="rounds">' + [5, 10, 20].map(function (n) {
          return '<option value="' + n + '"' + (n === state.rounds ? " selected" : "") + ">" + n + "</option>";
        }).join("") + "</select></label></div>" +
        '<div class="stats"><div class="stat"><div class="k">ваш счёт</div><div class="v">' + state.my +
        '</div></div><div class="stat"><div class="k">счёт соперника</div><div class="v">' + state.their +
        '</div></div><div class="stat"><div class="k">раунд</div><div class="v">' +
        Math.min(state.hist.length + 1, state.rounds) + " / " + state.rounds + "</div></div></div>" +
        (finished
          ? '<p><b>Игра окончена.</b> ' + (state.my > state.their ? "Вы впереди." :
             state.my < state.their ? "Соперник впереди." : "Ничья.") + "</p>" +
            '<div class="btn-row"><button class="btn primary" id="reset">Сыграть снова</button></div>'
          : '<div class="btn-row"><button class="btn primary" id="c">Сотрудничать</button>' +
            '<button class="btn" id="d">Предать</button></div>') +
        table +
        '<div class="note"><b>Что смотреть</b>Против «око за око» взаимное сотрудничество даёт 3 за раунд. ' +
        "Однократное предательство приносит 5, но следующий раунд — 1 и потеря доверия. " +
        "Против «всегда предаёт» кооперация — донорство: единственный разумный ответ — предавать.</div>" +
        "</div>";

      document.getElementById("opp").addEventListener("change", function (e) {
        state.opp = e.target.value;
        state.hist = []; state.my = 0; state.their = 0;
        draw();
      });
      document.getElementById("rounds").addEventListener("change", function (e) {
        state.rounds = Number(e.target.value);
        state.hist = []; state.my = 0; state.their = 0;
        draw();
      });

      function move(mine) {
        var theirs = state.hist.length === 0 ? OPPONENTS[state.opp].first : OPPONENTS[state.opp].move(state.hist);
        var p = payoff(mine, theirs);
        state.my += p[0];
        state.their += p[1];
        state.hist.push({ mine: mine, theirs: theirs, p: p[0], q: p[1] });
        draw();
      }

      var c = document.getElementById("c");
      if (c) c.addEventListener("click", function () { move("C"); });
      var d = document.getElementById("d");
      if (d) d.addEventListener("click", function () { move("D"); });
      var r = document.getElementById("reset");
      if (r) r.addEventListener("click", function () {
        state.hist = []; state.my = 0; state.their = 0; draw();
      });
    }

    draw();
  }

  // ---------- Блиц ----------

  function blitz(root) {
    var state = { pool: [], i: 0, left: 45, score: 0, running: false, picked: -1 };
    var timer = null;

    function buildPool() {
      var all = [];
      Object.keys(window.TOPICS).forEach(function (id) {
        window.TOPICS[id].quiz.forEach(function (q) {
          all.push({
            q: q.q,
            explain: q.explain,
            topic: window.TOPICS[id].title,
            options: shuffle(q.options.map(function (text, k) { return { text: text, ok: k === q.correct }; }))
          });
        });
      });
      for (var i = all.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = all[i]; all[i] = all[j]; all[j] = t;
      }
      return all;
    }

    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
      state.running = false;
    }

    function start() {
      stop();
      state.pool = buildPool();
      state.i = 0; state.left = 45; state.score = 0; state.picked = -1; state.running = true;
      draw();
      timer = setInterval(function () {
        state.left--;
        var el = document.getElementById("clock");
        if (el) el.textContent = state.left + " с";
        if (state.left <= 0) { stop(); state.running = false; draw(); }
      }, 1000);
    }

    function draw() {
      if (!state.running && state.i === 0) {
        root.innerHTML = '<div class="card center"><p>45 секунд, вопросы из всех четырёх разделов. ' +
          "Один правильный ответ — одно очко.</p>" +
          '<div class="btn-row" style="justify-content:center"><button class="btn primary" id="start">Начать</button></div></div>';
        document.getElementById("start").addEventListener("click", start);
        return;
      }

      if (!state.running && state.i > 0) {
        root.innerHTML = '<div class="card center"><h2 style="margin-top:0">' + state.score + " правильных ответов</h2>" +
          '<p class="lead" style="margin:0 auto 16px">' + (state.score >= 12 ? "Отличный результат." :
            state.score >= 8 ? "Хорошо, но есть куда расти." : "Стоит вернуться к теории и тренажёрам.") + "</p>" +
          '<div class="btn-row" style="justify-content:center"><button class="btn primary" id="start">Ещё раз</button>' +
          '<a class="btn" href="#/theory">К теории</a></div></div>';
        document.getElementById("start").addEventListener("click", start);
        return;
      }

      var q = state.pool[state.i % state.pool.length];
      root.innerHTML = '<div class="card">' +
        '<div class="progress"><span id="clock">' + state.left + " с</span><span>Счёт: " + state.score +
        '</span></div><p class="q-text">' + esc(q.q) + "</p>" +
        '<div class="options">' + q.options.map(function (o, k) {
          var cls = "option";
          if (state.picked >= 0) {
            if (o.ok) cls += " right";
            else if (k === state.picked) cls += " wrong";
          }
          return '<button class="' + cls + '" data-k="' + k + '"' + (state.picked >= 0 ? " disabled" : "") + ">" +
            esc(o.text) + "</button>";
        }).join("") + "</div></div>";

      Array.prototype.forEach.call(root.querySelectorAll(".option"), function (b) {
        b.addEventListener("click", function () {
          if (state.picked >= 0) return;
          state.picked = Number(b.getAttribute("data-k"));
          if (q.options[state.picked].ok) state.score++;
          draw();
          setTimeout(function () {
            if (!state.running) return;
            state.i++;
            state.picked = -1;
            draw();
          }, 450);
        });
      });
    }

    draw();
    return stop;
  }

  // ---------- калибровка вероятностей ----------

  function rndInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  var CALIB = [
    { q: "Сумма на двух кубиках равна 7", p: 1 / 6, sim: function () { return rndInt(1, 6) + rndInt(1, 6) === 7; } },
    { q: "Хотя бы один орёл за три броска монеты", p: 7 / 8, sim: function () {
      for (var i = 0; i < 3; i++) if (Math.random() < 0.5) return true;
      return false;
    } },
    { q: "Ровно два орла из пяти бросков", p: 10 / 32, sim: function () {
      var n = 0;
      for (var i = 0; i < 5; i++) if (Math.random() < 0.5) n++;
      return n === 2;
    } },
    { q: "Хотя бы одна шестёрка за четыре броска кубика", p: 1 - Math.pow(5 / 6, 4), sim: function () {
      for (var i = 0; i < 4; i++) if (rndInt(1, 6) === 6) return true;
      return false;
    } },
    { q: "Сумма на двух кубиках больше 9", p: 6 / 36, sim: function () { return rndInt(1, 6) + rndInt(1, 6) > 9; } },
    { q: "Случайная карта из колоды 52 — пиковой масти", p: 0.25, sim: function () { return Math.random() < 0.25; } }
  ];

  function calibration(root) {
    var state = { i: 0, score: 0, guess: "", checked: false, freq: 0, rounds: 5, list: [] };
    var TRIALS = 5000;

    function start() {
      state = { i: 0, score: 0, guess: "", checked: false, freq: 0, rounds: 5, list: shuffle(CALIB).slice(0, 5) };
      draw();
    }

    function draw() {
      if (state.i >= state.list.length) {
        root.innerHTML = '<div class="card center"><h2 style="margin-top:0">' + state.score + " из " + (state.rounds * 10) +
          "</h2><p class=\"lead\" style=\"margin:0 auto 16px\">" +
          (state.score >= 35 ? "Калибровка хорошая: ваши оценки близки к реальным частотам." :
           state.score >= 20 ? "Оценки колеблются вокруг истины, но разброс большой." :
           "Оценки далеко от реальности — стоит потренироваться на тренажёре вероятностей.") + "</p>" +
          '<div class="btn-row" style="justify-content:center"><button class="btn primary" id="start">Ещё раз</button></div></div>';
        document.getElementById("start").addEventListener("click", start);
        return;
      }

      var ev = state.list[state.i];
      var diff = Math.abs(Number(state.guess) - state.freq * 100);
      var points = state.checked ? Math.max(0, 10 - Math.round(diff / 3)) : 0;

      root.innerHTML = '<div class="card">' +
        '<div class="progress"><span>Раунд ' + (state.i + 1) + " из " + state.rounds +
        "</span><span>Очки: " + state.score + "</span></div>" +
        '<p class="q-text">' + esc(ev.q) + "</p>" +
        '<p class="lead">Ваша оценка вероятности и затем 5000 испытаний.</p>' +
        '<div class="answer-row"><label class="sr-only" for="guess">Ваша оценка в процентах</label>' +
        '<input type="text" id="guess" inputmode="decimal" placeholder="0–100" value="' + esc(state.guess) + '"' +
        (state.checked ? " disabled" : "") + "><span class=\"meta\">%</span>" +
        '<button class="btn primary" id="check"' + (state.checked ? " disabled" : "") + ">Проверить</button></div>" +
        (state.checked
          ? '<div class="verdict ' + (points >= 7 ? "ok" : "bad") + '" role="status" aria-live="polite">' +
            "Вы: " + esc(state.guess) + "% · факт: " + (state.freq * 100).toFixed(1).replace(".", ",") +
            "% · +" + points + " очков</div>" +
            '<div class="explain"><b>Точный ответ</b>Теоретическая вероятность — ' + (ev.p * 100).toFixed(1).replace(".", ",") +
            "%. Частота за 5000 испытаний близка к ней: закон больших чисел.</div>" +
            '<div class="btn-row"><button class="btn primary" id="next">Дальше</button></div>'
          : "") +
        "</div>";

      var input = document.getElementById("guess");
      var check = document.getElementById("check");

      function submit() {
        var g = parseFloat(String(input.value).replace(",", "."));
        if (!isFinite(g) || g < 0 || g > 100) return;
        state.guess = String(input.value).trim();
        var hits = 0;
        for (var t = 0; t < TRIALS; t++) if (ev.sim()) hits++;
        state.freq = hits / TRIALS;
        state.score += Math.max(0, 10 - Math.round(Math.abs(g - state.freq * 100) / 3));
        state.checked = true;
        draw();
      }

      if (check) {
        check.addEventListener("click", submit);
        input.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
        input.focus();
      }

      var next = document.getElementById("next");
      if (next) next.addEventListener("click", function () {
        state.i++; state.checked = false; state.guess = ""; state.freq = 0; draw();
      });
    }

    start();
  }

  // ---------- аудитор отчёта ----------

  var AUDIT = [
    {
      claim: "Конверсия была 5%, стала 7%. В отчёте: «конверсия выросла на 2%».",
      options: [
        "Это рост на 2 п. п., или на 40% относительно: смешаны процентные пункты и проценты",
        "Всё верно: 7 − 5 = 2",
        "Нельзя считать без размера выборки"
      ],
      ok: 0,
      explain: "Абсолютный рост — 2 процентных пункта, относительный — 2 / 5 = 40%. Эти числа нельзя подменять друг другом."
    },
    {
      claim: "Средний чек вырос с 1 200 до 1 500 ₽, медиана не изменилась. Вывод: «покупать стали больше».",
      options: [
        "Рост среднего при неизменной медиане даёт несколько крупных заказов, а не массовый сдвиг",
        "Всё верно: среднее и есть основной показатель",
        "Медиана всегда занижает реальную картину"
      ],
      ok: 0,
      explain: "Медиана устойчива к выбросам. Расхождение среднего и медианы — сигнал посмотреть распределение заказов."
    },
    {
      claim: "p-value = 0,04. Вывод: «гипотеза верна с вероятностью 96%».",
      options: [
        "p-value — вероятность таких данных при верной H₀, а не вероятность самой гипотезы",
        "Верно, это дополнение до 100%",
        "Надо просто снизить α до 0,01"
      ],
      ok: 0,
      explain: "p-value считается в предположении, что H₀ верна. Вероятность гипотезы из неё не следует."
    },
    {
      claim: "A/B-тест: прирост 0,3%, по 300 пользователей в группе, p = 0,04. Решение: раскатываем на всех.",
      options: [
        "Выборка не позволяет надёжно оценить эффект такого размера, а сам прирост может не окупать внедрение",
        "Всё верно: p < 0,05 — достаточно",
        "Надо просто продлить тест вдвое"
      ],
      ok: 0,
      explain: "Нужно сравнивать эффект с MDE и считать размер выборки заранее; значимость при малой выборке нестабильна."
    },
    {
      claim: "Корреляция расходов на рекламу и выручки 0,9. Вывод: «удвоим бюджет — выручка почти удвоится».",
      options: [
        "Корреляция не даёт коэффициента пересчёта и не доказывает причинность",
        "Верно: 0,9 близко к единице",
        "Выручка вырастет ровно на 90%"
      ],
      ok: 0,
      explain: "Коэффициент корреляции измеряет силу линейной связи в долях σ, а не эластичность. Причинность проверяют экспериментом."
    },
    {
      claim: "Все успешные компании отрасли запускали подписочную модель — значит, она и привела к успеху.",
      options: [
        "Ошибка выжившего: не видно компаний, которые делали так же и закрылись",
        "Верно: выборка успешных компаний репрезентативна",
        "Подписка всегда повышает LTV"
      ],
      ok: 0,
      explain: "Сравнивать нужно и успешные, и неуспешные компании. Иначе вывод строится только по выжившим."
    },
    {
      claim: "В каждом сегменте метрика выросла, а в целом упала. Вывод: «в расчётах ошибка».",
      options: [
        "Это парадокс Симпсона: изменился состав сегментов, а не арифметика",
        "Верно, такого не бывает",
        "Нужно усреднить сегменты без весов"
      ],
      ok: 0,
      explain: "При сдвиге доли сегментов общий показатель может двигаться в противоположную сторону."
    },
    {
      claim: "Опрос 30 клиентов: 80% довольны. Вывод: «довольны 80% всех клиентов».",
      options: [
        "Выборка мала и, скорее всего, смещена: доверительный интервал очень широкий",
        "Верно: 80% — достаточная точность",
        "Нужно опросить тех же 30 повторно"
      ],
      ok: 0,
      explain: "При n = 30 и доле 80% стандартная ошибка около 7 п. п. — интервал накрывает и 66%, и 94%."
    }
  ];

  function audit(root) {
    var state = { i: 0, score: 0, picked: -1, opened: false };

    function start() { state = { i: 0, score: 0, picked: -1, opened: false }; draw(); }

    function draw() {
      if (state.i >= AUDIT.length) {
        root.innerHTML = '<div class="card center"><h2 style="margin-top:0">' + state.score + " из " + AUDIT.length +
          "</h2><p class=\"lead\" style=\"margin:0 auto 16px\">" +
          (state.score >= 7 ? "Отчёт читаете внимательно." : "Стоит вернуться к главам про ловушки анализа и A/B-тесты.") +
          "</p><div class=\"btn-row\" style=\"justify-content:center\"><button class=\"btn primary\" id=\"start\">Ещё раз</button>" +
          '<a class="btn" href="#/theory/analytics">К теории</a></div></div>';
        document.getElementById("start").addEventListener("click", start);
        return;
      }

      var item = AUDIT[state.i];
      var opts = item.options.map(function (text, k) { return { text: text, ok: k === item.ok }; });

      root.innerHTML = '<div class="card">' +
        '<div class="progress"><span>Отчёт ' + (state.i + 1) + " из " + AUDIT.length +
        "</span><span>Верно: " + state.score + "</span></div>" +
        '<p class="q-text">' + esc(item.claim) + "</p>" +
        '<p class="meta">Что не так с выводом?</p>' +
        '<div class="options">' + opts.map(function (o, k) {
          var cls = "option";
          if (state.picked >= 0) {
            if (o.ok) cls += " right";
            else if (k === state.picked) cls += " wrong";
          }
          return '<button class="' + cls + '" data-k="' + k + '"' + (state.picked >= 0 ? " disabled" : "") + ">" +
            esc(o.text) + "</button>";
        }).join("") + "</div>" +
        (state.picked >= 0
          ? '<div class="explain" aria-live="polite"><b>' + (opts[state.picked].ok ? "Верно" : "Неверно") +
            "</b>" + esc(item.explain) + "</div>" +
            '<div class="btn-row"><button class="btn primary" id="next">' +
            (state.i + 1 < AUDIT.length ? "Следующий отчёт" : "Итог") + "</button></div>"
          : "") +
        "</div>";

      Array.prototype.forEach.call(root.querySelectorAll(".option"), function (b) {
        b.addEventListener("click", function () {
          state.picked = Number(b.getAttribute("data-k"));
          if (opts[state.picked].ok) state.score++;
          draw();
        });
      });

      var next = document.getElementById("next");
      if (next) next.addEventListener("click", function () { state.i++; state.picked = -1; draw(); });
    }

    start();
  }

  // ---------- многорукий бандит ----------

  function bandit(root) {
    var state = { pA: 0.45, pB: 0.25, eps: 10, run: null };

    function newArms() {
      var best = 0.40 + Math.random() * 0.15;
      var worst = 0.15 + Math.random() * 0.15;
      if (Math.random() < 0.5) { state.pA = best; state.pB = worst; }
      else { state.pA = worst; state.pB = best; }
      state.run = null;
    }

    function simulate(eps) {
      var n = 500, wins = 0, shownA = 0;
      var countA = 0, countB = 0, meanA = 0, meanB = 0;

      for (var t = 0; t < n; t++) {
        var pickA;
        if (Math.random() < eps) pickA = Math.random() < 0.5;
        else if (!countA && !countB) pickA = Math.random() < 0.5;
        else if (!countA) pickA = true;
        else if (!countB) pickA = false;
        else pickA = meanA >= meanB;

        var p = pickA ? state.pA : state.pB;
        var win = Math.random() < p;
        if (win) wins++;

        if (pickA) {
          shownA++; countA++;
          meanA += ((win ? 1 : 0) - meanA) / countA;
        } else {
          countB++;
          meanB += ((win ? 1 : 0) - meanB) / countB;
        }
      }

      return {
        n: n, wins: wins, shownA: shownA, shownB: n - shownA,
        fixed: n * (state.pA + state.pB) / 2,
        best: n * Math.max(state.pA, state.pB)
      };
    }

    function draw() {
      var r = state.run;
      root.innerHTML = '<div class="card">' +
        '<p class="lead">Два заголовка с разной истинной конверсией. Жадный алгоритм показывает лучший чаще, ' +
        "но оставляет долю трафика на исследование.</p>" +
        '<div class="demo-controls"><label>Доля исследования ε: <b>' + state.eps + "%</b>" +
        '<input type="range" id="eps" min="0" max="50" step="5" value="' + state.eps + '"></label></div>' +
        '<div class="btn-row"><button class="btn primary" id="run">Прогнать 500 показов</button>' +
        '<button class="btn" id="again">Новые варианты</button></div>' +
        (r
          ? '<div class="stats">' +
            '<div class="stat"><div class="k">побед</div><div class="v">' + r.wins + "</div></div>" +
            '<div class="stat"><div class="k">при делении 50/50</div><div class="v">' + Math.round(r.fixed) + "</div></div>" +
            '<div class="stat"><div class="k">максимум возможного</div><div class="v">' + Math.round(r.best) + "</div></div>" +
            "</div>" +
            '<p class="demo-note">Трафик: A — ' + Math.round(r.shownA / r.n * 100) + "%, B — " +
            Math.round(r.shownB / r.n * 100) + "%. Истинные конверсии: A — " +
            (state.pA * 100).toFixed(0) + "%, B — " + (state.pB * 100).toFixed(0) + "%.</p>"
          : '<p class="demo-note">Истинные вероятности скрыты, пока не запустите симуляцию.</p>') +
        "</div>";

      document.getElementById("eps").addEventListener("input", function (e) {
        state.eps = Number(e.target.value);
        draw();
      });
      document.getElementById("run").addEventListener("click", function () {
        state.run = simulate(state.eps / 100);
        draw();
      });
      document.getElementById("again").addEventListener("click", function () {
        newArms();
        draw();
      });
    }

    newArms();
    draw();
  }

  // ---------- Ультиматум ----------

  function ultimatum(root) {
    var OFFERS = [10, 20, 30, 40, 50, 60];
    var state = { i: 0, total: 0, accepted: 0, rejected: 0, list: [] };

    function start() {
      state = { i: 0, total: 0, accepted: 0, rejected: 0, list: shuffle(OFFERS) };
      draw();
    }

    function draw() {
      if (state.i >= state.list.length) {
        root.innerHTML = '<div class="card center"><h2 style="margin-top:0">Вы получили ' + state.total + ' из ' + (state.list.length * 100) + '</h2>' +
          '<p class="lead center">Принято ' + state.accepted + ', отклонено ' + state.rejected + '.</p>' +
          '<p class="meta">Рациональный ответчик принимает любое положительное предложение: отказ даёт 0. Но отказ от низких предложений — сигнал, который может улучшить будущие предложения.</p>' +
          '<div class="btn-row" style="justify-content:center"><button class="btn primary" id="again">Ещё раз</button></div></div>';
        document.getElementById("again").addEventListener("click", start);
        return;
      }
      var offer = state.list[state.i];
      root.innerHTML = '<div class="card"><div class="progress"><span>Раунд ' + (state.i + 1) + ' из ' + state.list.length +
        '</span><span>Получено: ' + state.total + '</span></div>' +
        '<p class="q-text">Вам предлагают ' + offer + ' из 100. Принять?</p>' +
        '<div class="btn-row"><button class="btn primary" id="accept">Принять ' + offer + '</button>' +
        '<button class="btn" id="reject">Отклонить</button></div></div>';
      document.getElementById("accept").addEventListener("click", function () {
        state.total += offer; state.accepted++; state.i++; draw();
      });
      document.getElementById("reject").addEventListener("click", function () {
        state.rejected++; state.i++; draw();
      });
    }

    start();
    return function () {};
  }

  // ---------- Аукцион второй цены ----------

  function auction(root) {
    var ROUNDS = 5;
    var state = { round: 0, profit: 0, value: 0, rival: 0, bid: 0, done: false };

    function newRound() {
      state.value = rndInt(50, 150);
      state.rival = rndInt(50, 150);
      state.bid = state.value;
      state.done = false;
      draw();
    }

    function draw() {
      if (state.round >= ROUNDS) {
        root.innerHTML = '<div class="card center"><h2 style="margin-top:0">Прибыль: ' + state.profit + '</h2>' +
          '<p class="lead center">Во второй цене правдивая ставка — доминирующая стратегия: победитель платит ставку соперника, а не свою.</p>' +
          '<div class="btn-row" style="justify-content:center"><button class="btn primary" id="again">Ещё раз</button></div></div>';
        document.getElementById("again").addEventListener("click", function () {
          state = { round: 0, profit: 0, value: 0, rival: 0, bid: 0, done: false };
          newRound();
        });
        return;
      }
      if (!state.done) {
        root.innerHTML = '<div class="card"><div class="progress"><span>Раунд ' + (state.round + 1) + ' из ' + ROUNDS +
          '</span><span>Прибыль: ' + state.profit + '</span></div>' +
          '<p>Лот ценен вам в <b>' + state.value + '</b>. Победитель платит ставку соперника.</p>' +
          '<div class="answer-row"><label class="sr-only" for="bid">Ваша ставка</label>' +
          '<input type="number" id="bid" min="0" max="200" value="' + state.bid + '">' +
          '<button class="btn primary" id="place">Сделать ставку</button></div></div>';
        document.getElementById("place").addEventListener("click", function () {
          state.bid = Number(document.getElementById("bid").value) || 0;
          state.done = true;
          if (state.bid > state.rival) state.profit += Math.max(0, state.value - state.rival);
          draw();
        });
        return;
      }
      var won = state.bid > state.rival;
      var gain = won ? Math.max(0, state.value - state.rival) : 0;
      root.innerHTML = '<div class="card"><div class="progress"><span>Раунд ' + (state.round + 1) + ' из ' + ROUNDS +
        '</span><span>Прибыль: ' + state.profit + '</span></div>' +
        '<p>Ваша ставка ' + state.bid + ', соперник поставил ' + state.rival + '.</p>' +
        '<p class="q-text">' + (won ? "Вы выиграли, платите " + state.rival + ". Прибыль " + gain + "." : "Вы не выиграли. Прибыль 0.") + '</p>' +
        '<div class="btn-row"><button class="btn primary" id="next">Следующий лот</button></div></div>';
      document.getElementById("next").addEventListener("click", function () {
        state.round++;
        if (state.round >= ROUNDS) { draw(); return; }
        newRound();
      });
    }

    newRound();
    return function () {};
  }

  window.GAMES = {
    montyhall: {
      title: "Парадокс Монти Холла",
      tag: "Три двери и проверка интуиции: стоит ли менять выбор",
      mount: montyHall
    },
    prisoners: {
      title: "Дилемма заключённого",
      tag: "Десять раундов против четырёх стратегий",
      mount: prisoners
    },
    blitz: {
      title: "Блиц на 45 секунд",
      tag: "Вопросы из всех разделов на скорость",
      mount: blitz
    },
    calibration: {
      title: "Ставка на вероятность",
      tag: "Оцените шанс события, затем 5000 испытаний",
      mount: calibration
    },
    audit: {
      title: "Аудитор отчёта",
      tag: "Найдите ошибку в чужом выводе",
      mount: audit
    },
    ultimatum: {
      title: "Ультиматум",
      tag: "Принимайте или отклоняйте предложения о дележе 100",
      mount: ultimatum
    },
    auction: {
      title: "Аукцион второй цены",
      tag: "Пять лотов: какую ставку выбрать, если платит соперник",
      mount: auction
    },
    bandit: {
      title: "Многорукий бандит",
      tag: "Сравните ε-жадный алгоритм с делением трафика 50/50",
      mount: bandit
    }
  };
})();
