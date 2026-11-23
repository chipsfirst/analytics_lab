// Глобальный таймер 30-минутной сессии: переживает переходы и перезагрузку.
(function () {
  "use strict";

  var SESSION_KEY = "analytics-lab-session-v1";
  var SESSION_SECONDS = 30 * 60;

  function sessionLoad() {
    var base = { left: SESSION_SECONDS, running: false, startedAt: 0, steps: {} };
    try {
      var p = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      if (!p || typeof p !== "object") return base;
      var left = Number(p.left);
      return {
        left: isFinite(left) ? Math.max(0, Math.min(SESSION_SECONDS, left)) : SESSION_SECONDS,
        running: !!p.running && !!p.startedAt,
        startedAt: Number(p.startedAt) || 0,
        steps: p.steps && typeof p.steps === "object" ? p.steps : {}
      };
    } catch (e) { return base; }
  }

  var sessionState = sessionLoad();
  var sessionInterval = null;

  function sessionSave() {
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(sessionState)); } catch (e) {}
  }

  function sessionRemaining() {
    var left = sessionState.left;
    if (sessionState.running && sessionState.startedAt) {
      left -= Math.floor((Date.now() - sessionState.startedAt) / 1000);
    }
    return Math.max(0, left);
  }

  function sessionClockText(sec) {
    var m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  function sessionDone() {
    var done = 0;
    ["theory", "trainer", "quiz", "cheatsheet"].forEach(function (id) { if (sessionState.steps[id]) done++; });
    return done;
  }

  function sessionDraw() {
    var left = sessionRemaining();
    if (sessionState.running && left <= 0) {
      sessionState.left = 0;
      sessionState.running = false;
      sessionState.startedAt = 0;
      sessionSave();
    }
    Array.prototype.forEach.call(document.querySelectorAll("[data-session-clock]"), function (el) {
      el.textContent = sessionClockText(left);
      el.classList.toggle("done", left <= 0);
    });
    var btn = document.getElementById("sessionStart");
    if (btn) btn.textContent = sessionState.running ? "Пауза" : (left <= 0 ? "Ещё 30 минут" : "Старт");
    var prog = document.getElementById("sessionProgress");
    if (prog) prog.textContent = "Шаги: " + sessionDone() + " из 4";
    renderSessionDock();
  }

  function renderSessionDock() {
    if (!document.body) return;
    var dock = document.getElementById("sessionDock");
    if (!dock) {
      dock = document.createElement("a");
      dock.id = "sessionDock";
      dock.className = "session-dock";
      dock.href = "#/session";
      dock.innerHTML = "<span>30 минут</span><b data-session-clock>30:00</b>";
      document.body.appendChild(dock);
    }
    var active = sessionState.running || sessionState.left < SESSION_SECONDS || sessionState.left === 0;
    var here = (location.hash || "").indexOf("#/session") === 0;
    dock.hidden = !active || here;
    if (!dock.hidden) dock.querySelector("[data-session-clock]").textContent = sessionClockText(sessionRemaining());
  }

  function sessionTick() {
    if (sessionInterval) return;
    sessionInterval = setInterval(function () {
      if (sessionState.running) sessionDraw();
    }, 1000);
  }

  function sessionToggle() {
    if (sessionState.running) {
      sessionState.left = sessionRemaining();
      sessionState.running = false;
      sessionState.startedAt = 0;
    } else {
      if (sessionRemaining() <= 0) sessionState.left = SESSION_SECONDS;
      sessionState.running = true;
      sessionState.startedAt = Date.now();
    }
    sessionSave();
    sessionDraw();
  }

  function sessionReset() {
    sessionState.left = SESSION_SECONDS;
    sessionState.running = false;
    sessionState.startedAt = 0;
    sessionState.steps = {};
    sessionSave();
    Array.prototype.forEach.call(document.querySelectorAll("[data-session-step]"), function (box) {
      box.checked = false;
    });
    sessionDraw();
  }

  function sessionPage() {
    var last = window.PROGRESS.last();
    var topic = last && window.TOPICS[last.id] ? last.id : "analytics";
    var idx = last && window.TOPICS[last.id] && window.TOPICS[last.id].chapters[last.i] ? last.i : 0;
    function step(id, title, text, href, label) {
      return '<div class="card"><label class="session-step"><input type="checkbox" data-session-step="' + id + '"> ' +
        "<b>" + title + "</b></label><p>" + text + '</p><a class="btn" href="' + href + '">' + label + "</a></div>";
    }
    return "<h1>30 минут</h1>" +
      '<p class="lead">Короткая сессия без выбора «что делать дальше»: немного теории, один тренажёр, тест и шпаргалка. ' +
      "Таймер продолжает идти при переходах.</p>" +
      '<div class="session-clock" id="sessionClock" data-session-clock role="timer" aria-live="off">30:00</div>' +
      '<div class="btn-row"><button class="btn primary" id="sessionStart">Старт</button>' +
      '<button class="btn" id="sessionReset">Сброс</button><span class="meta" id="sessionProgress"></span></div>' +
      '<div class="grid">' +
      step("theory", "5 минут — теория", "Продолжите с последней главы или начните с введения.",
        last ? "#/theory/" + topic + "/" + idx : "#/theory/analytics/0", "Продолжить") +
      step("trainer", "10 минут — тренажёр", "Одна задача с автопроверкой: не скорость, а разбор ошибки.",
        "#/trainer/" + topic, "К тренажёру") +
      step("quiz", "10 минут — тест", "Восемь вопросов из банка раздела и разбор ответов.",
        "#/quiz/" + topic, "К тесту") +
      step("cheatsheet", "5 минут — шпаргалка", "Повторите формулы и термины перед следующим шагом.",
        "#/cheatsheet", "Открыть") +
      "</div>";
  }

  function bindSession() {
    var start = document.getElementById("sessionStart");
    var reset = document.getElementById("sessionReset");
    if (!start || !reset) return;
    start.addEventListener("click", sessionToggle);
    reset.addEventListener("click", sessionReset);
    Array.prototype.forEach.call(document.querySelectorAll("[data-session-step]"), function (box) {
      var id = box.getAttribute("data-session-step");
      box.checked = !!sessionState.steps[id];
      box.addEventListener("change", function () {
        if (box.checked) sessionState.steps[id] = 1; else delete sessionState.steps[id];
        sessionSave();
        sessionDraw();
      });
    });
    sessionTick();
    sessionDraw();
  }

  window.SESSION = {
    page: sessionPage,
    bind: bindSession,
    draw: sessionDraw,
    drawDock: renderSessionDock,
    tick: sessionTick
  };
})();
