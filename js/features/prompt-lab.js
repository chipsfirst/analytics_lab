// Тренажёр промптов: справка, критерии, попытки и короткие сессии.
(function () {
  "use strict";
  var LAB = window.LAB;
  var KEY = "analytics-lab-prompt-lab-v2";
  var LEGACY = "analytics-lab-prompts-v1";
  var state = load();

  function blank() {
    return { drafts: {}, checks: {}, attempts: {}, best: {}, open: {}, filters: { skill: "", level: "" }, sessions: 0 };
  }

  function load() {
    var s = blank();
    try {
      var raw = window.localStorage.getItem(KEY);
      if (raw) {
        var p = JSON.parse(raw) || {};
        s.drafts = p.drafts || {};
        s.checks = p.checks || {};
        s.attempts = p.attempts || {};
        s.best = p.best || {};
        s.open = p.open || {};
        s.filters = p.filters || { skill: "", level: "" };
        s.sessions = Number(p.sessions) || 0;
      } else {
        var old = JSON.parse(window.localStorage.getItem(LEGACY) || "null");
        if (old && typeof old === "object") s.drafts = old;
      }
    } catch (e) {}
    return s;
  }

  function save() {
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function esc(s) { return LAB.esc(s); }

  function metaFor(title) {
    return (window.PROMPT_META && window.PROMPT_META[title]) ||
      { skill: "Структура", level: "base", hint: "Сформулируйте роль, контекст, задачу, ограничения и формат." };
  }

  function levelLabel(level) { return level === "advanced" ? "Продвинутый" : "База"; }

  function checks(i) {
    var list = state.checks[i];
    return Array.isArray(list) ? list : [];
  }

  function score(i) {
    return checks(i).filter(Boolean).length;
  }

  function attemptText(i, total) {
    var n = Number(state.attempts[i]) || 0;
    var best = Number(state.best[i]) || 0;
    return n ? "Попыток: " + n + " · лучший: " + best + " из " + total : "Попыток: 0";
  }

  function savedText(i, total) {
    var n = Number(state.attempts[i]) || 0;
    return n ? "Сохранено: лучший " + (Number(state.best[i]) || 0) + " из " + total : "Попытка ещё не сохранена";
  }

  function skillList() {
    var out = [];
    (window.PROMPT_TASKS || []).forEach(function (t) {
      var skill = metaFor(t[0]).skill;
      if (out.indexOf(skill) === -1) out.push(skill);
    });
    return out;
  }

  function promptLabPage() {
    var tasks = window.PROMPT_TASKS || [];
    var skills = skillList();
    return "<h1>Тренажёр промптов</h1>" +
      '<p class="lead">' + tasks.length + " рабочих ситуаций. Напишите промпт, отметьте критерии, сохраните попытку и проверьте себя. " +
      "Это не автопроверка: хороший промпт зависит от задачи и контекста.</p>" +
      '<details class="card prompt-guide"><summary><b>Краткая справка: как писать промпт</b></summary>' +
      '<p>Сильный промпт задаёт не только вопрос, но и рамки ответа. Проверяйте его по шести частям.</p>' +
      '<div class="formula">роль + контекст + задача + ограничения + формат + критерии качества</div>' +
      '<ol>' +
      "<li><b>Роль и аудитория.</b> Кто отвечает и для кого: аналитик, редактор, ревьюер; руководитель или коллега.</li>" +
      "<li><b>Контекст.</b> Какие данные, схема, период и известные ограничения есть у задачи.</li>" +
      "<li><b>Задача.</b> Один проверяемый результат: таблица, SQL, письмо, решение, список рисков.</li>" +
      "<li><b>Ограничения.</b> Что нельзя делать: выдумывать, менять данные, выходить за источники.</li>" +
      "<li><b>Формат.</b> Колонки, разделы, JSON-схема, длина и язык ответа.</li>" +
      "<li><b>Критерии.</b> По каким признакам вы поймёте, что ответ готов.</li>" +
      "</ol>" +
      '<div class="table-wrap"><table><thead><tr><th>Слабо</th><th>Сильнее</th></tr></thead><tbody>' +
      "<tr><td>«Сделай анализ продаж»</td><td>«Ты аналитик. Ниже CSV. Найди падение выручки за февраль, проверь возвраты и покажи три гипотезы с данными»</td></tr>" +
      "<tr><td>«Напиши SQL»</td><td>«PostgreSQL, схема orders(...). Сумма revenue без returned за февраль по city. Только SELECT, с комментариями»</td></tr>" +
      "<tr><td>«Сделай красиво»</td><td>«Верни Markdown-таблицу: канал, расход, CAC. Пропуски — «—», без новых каналов»</td></tr>" +
      "</tbody></table></div>" +
      '<p class="meta">Совет: сначала проверьте, что в промпте есть задача и ограничения. Стиль и вежливость вторичны; важнее проверяемый результат.</p></details>' +
      '<div class="prompt-toolbar">' +
      '<label>Навык<select id="promptSkill"><option value="">Все навыки</option>' + skills.map(function (s) {
        return '<option value="' + esc(s) + '"' + (state.filters.skill === s ? " selected" : "") + ">" + esc(s) + "</option>";
      }).join("") + "</select></label>" +
      '<label>Уровень<select id="promptLevel"><option value="">Все уровни</option>' +
      '<option value="base"' + (state.filters.level === "base" ? " selected" : "") + ">База</option>" +
      '<option value="advanced"' + (state.filters.level === "advanced" ? " selected" : "") + ">Продвинутый</option></select></label>" +
      '<button class="btn small" id="promptSession">Сессия: 3 задачи</button>' +
      '<button class="btn small" id="promptShowAll" hidden>Показать все</button>' +
      '<span class="meta" id="promptSummary"></span></div>' +
      '<div class="card prompt-session" id="promptSessionInfo" hidden><b>Короткая сессия</b>' +
      '<span class="meta" id="promptSessionProgress"></span>' +
      '<button class="btn small" id="promptFinishSession">Завершить сессию</button></div>' +
      '<div class="grid" id="promptGrid">' + tasks.map(function (task, i) {
        var m = metaFor(task[0]);
        var ck = checks(i);
        var count = task[3].length;
        return '<article class="card prompt-card" data-prompt="' + i + '" data-skill="' + esc(m.skill) + '" data-level="' + esc(m.level) + '">' +
          '<p class="meta">Задача ' + (i + 1) + " · " + esc(m.skill) + " · " + levelLabel(m.level) + "</p>" +
          "<h3>" + esc(task[0]) + "</h3><p>" + esc(task[1]) + "</p>" +
          '<label class="sr-only" for="prompt-' + i + '">Ваш промпт</label>' +
          '<textarea id="prompt-' + i + '" rows="4" placeholder="Напишите промпт…">' + esc(state.drafts[i] || "") + "</textarea>" +
          '<div class="prompt-meta"><span data-count>' + String(state.drafts[i] || "").length + " символов</span>" +
          '<span data-attempts>' + esc(attemptText(i, count)) + "</span></div>" +
          '<div class="btn-row"><button class="btn small" data-prompt-show="' + i + '">' +
          (state.open[i] ? "Скрыть разбор" : "Показать разбор") + "</button>" +
          '<button class="btn small" data-prompt-copy="' + i + '">Копировать</button>' +
          '<button class="btn small" data-prompt-clear="' + i + '">Очистить</button></div>' +
          '<div class="prompt-review" data-prompt-review="' + i + '"' + (state.open[i] ? "" : " hidden") + ">" +
          "<p><b>Каркас:</b> " + esc(task[2]) + "</p>" +
          '<ul class="prompt-criteria">' + task[3].map(function (x, j) {
            return '<li><label><input type="checkbox" data-check="' + i + '" data-criterion="' + j + '"' +
              (ck[j] ? " checked" : "") + "> " + esc(x) + "</label></li>";
          }).join("") + "</ul>" +
          '<p class="meta" data-score>Закрыто ' + score(i) + " из " + count + "</p>" +
          '<p class="prompt-hint"><b>Подсказка:</b> ' + esc(m.hint) + "</p>" +
          '<div class="prompt-actions"><button class="btn small" data-prompt-save="' + i + '">Сохранить попытку</button>' +
          '<span class="meta" data-save-status>' + esc(savedText(i, count)) + "</span></div></div></article>";
      }).join("") + "</div>";
  }

  function bindPromptLab() {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".prompt-card"));
    var skillSel = document.getElementById("promptSkill");
    var levelSel = document.getElementById("promptLevel");
    var sessionBtn = document.getElementById("promptSession");
    var showAll = document.getElementById("promptShowAll");
    var sessionInfo = document.getElementById("promptSessionInfo");
    var sessionProgress = document.getElementById("promptSessionProgress");
    var finishBtn = document.getElementById("promptFinishSession");
    var summary = document.getElementById("promptSummary");
    if (!cards.length) return;

    function cardAt(i) {
      return cards.filter(function (c) { return Number(c.getAttribute("data-prompt")) === Number(i); })[0];
    }

    function criteriaCount(i) {
      var t = (window.PROMPT_TASKS || [])[Number(i)];
      return t ? t[3].length : 4;
    }

    function syncCard(card) {
      var i = Number(card.getAttribute("data-prompt"));
      var scoreEl = card.querySelector("[data-score]");
      var statusEl = card.querySelector("[data-save-status]");
      var attemptEl = card.querySelector("[data-attempts]");
      var count = criteriaCount(i);
      if (scoreEl) scoreEl.textContent = "Закрыто " + score(i) + " из " + count;
      if (attemptEl) attemptEl.textContent = attemptText(i, count);
      if (statusEl) statusEl.textContent = savedText(i, count);
    }

    function saveAttempt(card) {
      var i = Number(card.getAttribute("data-prompt"));
      var total = criteriaCount(i);
      state.attempts[i] = (Number(state.attempts[i]) || 0) + 1;
      state.best[i] = Math.max(Number(state.best[i]) || 0, score(i));
      save();
      syncCard(card);
      var status = card.querySelector("[data-save-status]");
      if (status) status.textContent = "Попытка " + state.attempts[i] + ": " + score(i) + " из " + total;
      if (window.ACHIEVEMENTS) window.ACHIEVEMENTS.checkAndToast();
      updateSession();
    }

    function visibleIndexes() {
      var skill = skillSel ? skillSel.value : "";
      var level = levelSel ? levelSel.value : "";
      return cards.map(function (c) { return Number(c.getAttribute("data-prompt")); }).filter(function (i) {
        var c = cardAt(i);
        return (!skill || c.getAttribute("data-skill") === skill) && (!level || c.getAttribute("data-level") === level);
      });
    }

    function applyView() {
      var list = state.session && state.session.length ? state.session : visibleIndexes();
      var seen = {};
      list.forEach(function (i) { seen[i] = 1; });
      cards.forEach(function (c) {
        c.hidden = !seen[Number(c.getAttribute("data-prompt"))];
      });
      if (summary) {
        if (state.session && state.session.length) {
          summary.textContent = "Сессия: " + state.session.length + " задачи";
        } else {
          summary.textContent = "Показано " + list.length + " из " + cards.length + " · попыток: " +
            Object.keys(state.attempts).reduce(function (n, k) { return n + (Number(state.attempts[k]) || 0); }, 0);
        }
      }
      if (sessionInfo) sessionInfo.hidden = !(state.session && state.session.length);
      if (showAll) showAll.hidden = !(state.session && state.session.length);
      if (sessionBtn) sessionBtn.textContent = state.session && state.session.length ? "Новая сессия" : "Сессия: 3 задачи";
      if (skillSel) skillSel.disabled = !!(state.session && state.session.length);
      if (levelSel) levelSel.disabled = !!(state.session && state.session.length);
      updateSession();
    }

    function updateSession() {
      if (!sessionProgress || !(state.session && state.session.length)) return;
      var checked = 0, total = 0;
      state.session.forEach(function (i) {
        total += criteriaCount(i);
        checked += score(i);
      });
      sessionProgress.textContent = checked + " из " + total + " критериев · " +
        (state.sessionFinished ? "сессия завершена" : "отмечайте критерии и сохраняйте попытки");
      if (finishBtn) {
        finishBtn.disabled = !!state.sessionFinished;
        finishBtn.textContent = state.sessionFinished ? "Сессия завершена" : "Завершить сессию";
      }
    }

    function startSession() {
      var pool = visibleIndexes();
      for (var i = pool.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
      }
      state.session = pool.slice(0, Math.min(3, pool.length));
      state.sessionFinished = false;
      save();
      applyView();
    }

    function stopSession() {
      state.session = [];
      state.sessionFinished = false;
      save();
      applyView();
    }

    cards.forEach(function (card) {
      var i = Number(card.getAttribute("data-prompt"));
      var ta = card.querySelector("textarea");
      var countEl = card.querySelector("[data-count]");
      if (ta && countEl) {
        ta.addEventListener("input", function () {
          state.drafts[i] = ta.value;
          countEl.textContent = ta.value.length + " символов";
          save();
        });
      }
      var show = card.querySelector("[data-prompt-show]");
      if (show) show.addEventListener("click", function () {
        var rev = card.querySelector("[data-prompt-review]");
        if (!rev) return;
        rev.hidden = !rev.hidden;
        state.open[i] = !rev.hidden;
        show.textContent = rev.hidden ? "Показать разбор" : "Скрыть разбор";
        save();
      });
      Array.prototype.forEach.call(card.querySelectorAll("[data-check]"), function (box) {
        box.addEventListener("change", function () {
          var j = Number(box.getAttribute("data-criterion"));
          var list = checks(i).slice();
          while (list.length < criteriaCount(i)) list.push(false);
          list[j] = box.checked;
          state.checks[i] = list;
          save();
          syncCard(card);
          updateSession();
        });
      });
      var copy = card.querySelector("[data-prompt-copy]");
      if (copy) copy.addEventListener("click", function () {
        var text = ta ? ta.value : "";
        var done = function () {
          copy.textContent = "Скопировано";
          setTimeout(function () { copy.textContent = "Копировать"; }, 1200);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(function () {});
        } else if (ta) {
          ta.select();
          try { document.execCommand("copy"); done(); } catch (e) {}
        }
      });
      var clear = card.querySelector("[data-prompt-clear]");
      if (clear) clear.addEventListener("click", function () {
        if (ta && ta.value && !confirm("Очистить промпт и отметки критериев?")) return;
        if (ta) ta.value = "";
        state.drafts[i] = "";
        state.checks[i] = [];
        save();
        if (countEl) countEl.textContent = "0 символов";
        Array.prototype.forEach.call(card.querySelectorAll("[data-check]"), function (box) { box.checked = false; });
        syncCard(card);
        updateSession();
        if (ta) ta.focus();
      });
      var saveBtn = card.querySelector("[data-prompt-save]");
      if (saveBtn) saveBtn.addEventListener("click", function () { saveAttempt(card); });
      syncCard(card);
    });

    if (skillSel) skillSel.addEventListener("change", function () {
      state.filters.skill = skillSel.value;
      state.session = [];
      state.sessionFinished = false;
      save();
      applyView();
    });
    if (levelSel) levelSel.addEventListener("change", function () {
      state.filters.level = levelSel.value;
      state.session = [];
      state.sessionFinished = false;
      save();
      applyView();
    });
    if (sessionBtn) sessionBtn.addEventListener("click", startSession);
    if (showAll) showAll.addEventListener("click", stopSession);
    if (finishBtn) finishBtn.addEventListener("click", function () {
      if (!state.session || !state.session.length || state.sessionFinished) return;
      state.sessionFinished = true;
      state.sessions = (Number(state.sessions) || 0) + 1;
      save();
      updateSession();
      if (window.ACHIEVEMENTS) window.ACHIEVEMENTS.checkAndToast();
    });

    applyView();
  }

  function stats() {
    var attempts = 0, perfect = 0;
    Object.keys(state.attempts).forEach(function (k) { attempts += Number(state.attempts[k]) || 0; });
    Object.keys(state.best).forEach(function (k) { if (Number(state.best[k]) >= 4) perfect++; });
    return { attempts: attempts, perfect: perfect, sessions: Number(state.sessions) || 0 };
  }

  window.PROMPT_LAB = { page: promptLabPage, bind: bindPromptLab, stats: stats };
})();
