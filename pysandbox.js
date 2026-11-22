// Песочница Python: блокнот в стиле Jupyter на Pyodide.
// Код выполняется в воркере pyworker.js, состояние ячеек хранится в localStorage.

(function () {
  "use strict";

  var KEY = "analytics-lab-pysandbox-v1";
  var EXAMPLE = 'print("Привет!")\n\ntotal = 0\nfor i in range(1, 6):\n    total += i\n\nprint("Сумма чисел от 1 до 5:", total)';

  function loadCells() {
    try {
      var raw = window.localStorage.getItem(KEY);
      var list = raw ? JSON.parse(raw) : null;
      if (Array.isArray(list) && list.length) return list.map(String);
    } catch (e) {}
    return [EXAMPLE];
  }

  function saveCells(cells) {
    try { window.localStorage.setItem(KEY, JSON.stringify(cells)); } catch (e) {}
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function mb(n) {
    return (n / 1048576).toFixed(1).replace(".", ",") + " МБ";
  }

  function mount(root) {
    var cells = loadCells();
    var worker = null;
    var ready = false;
    var running = false;
    var currentOut = null;
    var fatal = false;

    root.innerHTML =
      '<div class="nb-bar">' +
        '<button class="btn primary" id="nbStart">Загрузить Python</button>' +
        '<button class="btn" id="nbRunAll">Запустить всё</button>' +
        '<button class="btn" id="nbAdd">+ ячейка</button>' +
        '<button class="btn" id="nbClear">Очистить</button>' +
        '<button class="btn" id="nbRetry" hidden>Повторить</button>' +
        '<button class="btn" id="nbStop" hidden>Остановить</button>' +
        '<span class="nb-status" id="nbStatus">Python не загружен</span>' +
      "</div>" +
      '<div class="nb-progress" id="nbProgress"><div></div></div>' +
      '<div class="nb-cells" id="nbCells"></div>' +
      '<p class="demo-note">Первый запуск скачивает около 10 МБ — ядро Python. Дальше браузер держит его в памяти вкладки. ' +
      "Код выполняется в отдельном воркере: страница, localStorage и сеть ему недоступны, зацикливание останавливает кнопка «Остановить», " +
      "а ввод с клавиатуры (input) не поддерживается. Это изоляция от страницы, но не полноценная песочница безопасности — не запускайте сюда чужой код.</p>";

    var cellsBox = root.querySelector("#nbCells");
    var status = root.querySelector("#nbStatus");
    var bar = root.querySelector("#nbProgress");
    var retry = root.querySelector("#nbRetry");
    var stop = root.querySelector("#nbStop");
    var startBtn = root.querySelector("#nbStart");
    var pendingRun = null;
    var pendingAll = false;

    function setStatus(text, bad) {
      status.textContent = text;
      status.className = "nb-status" + (bad ? " bad" : "");
    }

    function draw() {
      cellsBox.innerHTML = cells.map(function (code, i) {
        return '<div class="nb-cell" data-i="' + i + '">' +
          '<div class="nb-head"><span class="nb-num">In [' + (i + 1) + "]</span>" +
          '<button class="btn small" data-run="' + i + '">Выполнить</button></div>' +
          '<textarea class="nb-code" spellcheck="false" data-code="' + i + '">' + esc(code) + "</textarea>" +
          '<pre class="nb-out" data-out="' + i + '"></pre></div>';
      }).join("");
    }

    function cellOutput(i) {
      return cellsBox.querySelector('[data-out="' + i + '"]');
    }

    function write(text) {
      if (!currentOut) return;
      currentOut.textContent += text;
      currentOut.classList.remove("empty");
    }

    function run(index) {
      if (fatal) return;
      if (!worker) { pendingRun = index; startWorker(); return; }
      if (!ready) { pendingRun = index; setStatus("Python ещё загружается…"); return; }
      if (running) return;
      var code = cells[index];
      running = true;
      currentOut = cellOutput(index);
      currentOut.textContent = "";
      currentOut.classList.add("empty");
      setStatus("Выполняется…");
      worker.postMessage({ type: "run", code: code });
    }

    function runAll() {
      if (!worker) { pendingAll = true; startWorker(); return; }
      if (!ready) { pendingAll = true; setStatus("Python ещё загружается…"); return; }
      if (running) return;
      var i = 0;
      (function next() {
        while (i < cells.length && !cells[i].trim()) i++;
        if (i >= cells.length) { setStatus("Готово"); return; }
        var idx = i++;
        var out = cellOutput(idx);
        running = true;
        currentOut = out;
        out.textContent = "";
        out.classList.add("empty");
        setStatus("Выполняется ячейка " + (idx + 1) + "…");
        worker.postMessage({ type: "run", code: cells[idx] });
        pendingNext = next;
      })();
    }
    var pendingNext = null;

    cellsBox.addEventListener("input", function (e) {
      var t = e.target;
      if (t && t.hasAttribute("data-code")) {
        cells[Number(t.getAttribute("data-code"))] = t.value;
        saveCells(cells);
      }
    });

    cellsBox.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-run]");
      if (b) run(Number(b.getAttribute("data-run")));
    });

    cellsBox.addEventListener("keydown", function (e) {
      var t = e.target;
      if (!t || !t.hasAttribute("data-code")) return;
      if (e.key === "Enter" && (e.shiftKey || e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        run(Number(t.getAttribute("data-code")));
      }
    });

    root.querySelector("#nbAdd").addEventListener("click", function () {
      cells.push("");
      saveCells(cells);
      draw();
      var last = cellsBox.querySelectorAll("textarea");
      if (last.length) last[last.length - 1].focus();
    });

    root.querySelector("#nbClear").addEventListener("click", function () {
      if (!confirm("Очистить все ячейки? Код будет удалён.")) return;
      cells = [""];
      saveCells(cells);
      draw();
    });

    root.querySelector("#nbRunAll").addEventListener("click", runAll);

    draw();

    function startWorker() {
      if (worker) { try { worker.terminate(); } catch (e) {} }
      worker = null;
      ready = false;
      fatal = false;
      running = false;
      if (startBtn) startBtn.hidden = true;
      if (bar) bar.classList.remove("done");
      if (retry) retry.hidden = true;
      setStatus("Загрузка Python…");

      try {
        worker = new Worker("pyworker.js");
      } catch (e) {
        setStatus("Браузер не разрешает воркеры на этой странице. Откройте сайт по http:// или https://, а не через файл.", true);
        if (retry) retry.hidden = false;
        return;
      }

      worker.onmessage = function (e) {
        var msg = e.data;
        if (msg.type === "stdout" || msg.type === "stderr") {
          write(msg.text);
          return;
        }
        if (msg.type === "progress") {
          setStatus("Загрузка Python: " + mb(msg.loaded));
          return;
        }
        if (msg.type === "ready") {
          ready = true;
          if (bar) bar.classList.add("done");
          if (retry) retry.hidden = true;
          if (stop) stop.hidden = false;
          setStatus("Python готов");
          if (pendingRun !== null) {
            var pr = pendingRun;
            pendingRun = null;
            run(pr);
          } else if (pendingAll) {
            pendingAll = false;
            runAll();
          }
          return;
        }
        if (msg.type === "fatal") {
          fatal = true;
          running = false;
          if (bar) bar.classList.add("done");
          if (retry) retry.hidden = false;
          if (stop) stop.hidden = true;
          setStatus("Не удалось загрузить Python: " + (msg.text || "неизвестная ошибка"), true);
          return;
        }
        if (msg.type === "done") {
          if (msg.result) write(msg.result + "\n");
          running = false;
          setStatus("Готово");
          if (pendingNext) { var n = pendingNext; pendingNext = null; n(); }
          return;
        }
        if (msg.type === "error") {
          if (currentOut) {
            currentOut.classList.add("err");
            currentOut.textContent += msg.text;
          }
          running = false;
          setStatus("Ошибка выполнения", true);
          if (pendingNext) { var p = pendingNext; pendingNext = null; p(); }
        }
      };

      worker.onerror = function (e) {
        if (e && e.preventDefault) e.preventDefault();
        var text = (e && e.message) ? e.message : "неизвестная ошибка";
        if (bar) bar.classList.add("done");
        if (retry) retry.hidden = false;
        setStatus("Ошибка загрузки Python: " + text + ". Проверьте интернет и нажмите «Повторить».", true);
      };

      worker.postMessage({ type: "init" });
    }

    if (retry) retry.addEventListener("click", startWorker);
    if (startBtn) startBtn.addEventListener("click", startWorker);

    if (stop) stop.addEventListener("click", function () {
      if (worker) { try { worker.terminate(); } catch (e) {} }
      worker = null;
      ready = false;
      running = false;
      fatal = false;
      if (bar) bar.classList.remove("done");
      stop.hidden = true;
      startWorker();
    });

    return function cleanup() {
      try { worker.terminate(); } catch (e) {}
    };
  }

  window.PYSANDBOX = { mount: mount };
})();
