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
            options: q.options.map(function (text, k) { return { text: text, ok: k === q.correct }; })
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
      state.pool = buildPool();
      state.i = 0; state.left = 45; state.score = 0; state.picked = -1; state.running = true;
      draw();
      stop();
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
    }
  };
})();
