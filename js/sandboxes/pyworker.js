// Python в WebAssembly: Pyodide живёт в отдельном воркере,
// чтобы долгий цикл не подвешивал интерфейс.
var BASES = [
  "https://cdn.jsdelivr.net/pyodide/v0.28.0/full/",
  "https://fastly.jsdelivr.net/pyodide/v0.28.0/full/",
  "https://unpkg.com/pyodide@0.28.0/"
];
var CORE = ["pyodide.asm.wasm", "python_stdlib.zip"];
var base = null;
var pyodide = null;

function send(msg) { self.postMessage(msg); }

var loaded = false;
for (var i = 0; i < BASES.length && !loaded; i++) {
  try {
    importScripts(BASES[i] + "pyodide.js");
    base = BASES[i];
    loaded = true;
  } catch (e) {
    // пробуем следующее зеркало
  }
}

if (!loaded) {
  send({ type: "fatal", text: "не удалось загрузить pyodide.js ни с одного зеркала" });
}

// Скачиваем ядро сами: так видно, сколько байт уже пришло.
// Дальше loadPyodide берёт эти же файлы из HTTP-кеша.
async function preload() {
  var got = 0;
  for (var i = 0; i < CORE.length; i++) {
    try {
      var resp = await fetch(base + CORE[i], { cache: "force-cache" });
      if (!resp.ok || !resp.body) continue;
      var reader = resp.body.getReader();
      for (;;) {
        var part = await reader.read();
        if (part.done) break;
        got += part.value.byteLength;
        send({ type: "progress", loaded: got, file: CORE[i] });
      }
    } catch (e) { /* файла нет — грузим как обычно */ }
  }
}

self.onmessage = function (e) {
  var msg = e.data;

  if (msg.type === "init" && loaded) {
    preload()
      .then(function () {
        return loadPyodide({ indexURL: base });
      })
      .then(function (p) {
        pyodide = p;
        if (msg.packages && msg.packages.length) {
          send({ type: "status", text: "Загрузка пакетов…" });
          return pyodide.loadPackage(msg.packages, {
            messageCallback: function (text) { send({ type: "status", text: String(text) }); }
          });
        }
        return null;
      })
      .then(function () {
        if (!pyodide) return;
        try {
          if (msg.files && pyodide.FS) {
            Object.keys(msg.files).forEach(function (name) {
              pyodide.FS.writeFile("/home/pyodide/" + name, msg.files[name], { encoding: "utf8" });
            });
          }
        } catch (err) {
          send({ type: "fatal", text: "не удалось положить данные в песочницу: " + String(err && err.message || err) });
          return;
        }
        pyodide.setStdout({ batched: function (text) { send({ type: "stdout", text: text }); } });
        pyodide.setStderr({ batched: function (text) { send({ type: "stderr", text: text }); } });

        // Изоляция: после загрузки ядра сеть и скрипты из кода пользователя недоступны.
        var blocked = function () { throw new Error("Сеть в песочнице отключена"); };
        self.fetch = blocked;
        self.XMLHttpRequest = blocked;
        self.WebSocket = blocked;
        self.importScripts = blocked;

        send({ type: "ready" });
      })
      .catch(function (err) {
        send({ type: "fatal", text: String(err && err.message || err) });
      });
    return;
  }

  if (msg.type === "run" && pyodide) {
    pyodide.runPythonAsync(msg.code)
      .then(function (result) {
        var rows = null;
        try {
          var json = pyodide.runPython(
            "import json as _json\n" +
            "_payload = result\n" +
            "if hasattr(_payload, 'to_dict'):\n" +
            "    _payload = _payload.to_dict('records')\n" +
            "if isinstance(_payload, list):\n" +
            "    _payload = _payload[:2000]\n" +
            "_json.dumps(_payload, ensure_ascii=False, default=str)"
          );
          if (json && json !== "null") rows = JSON.parse(json);
        } catch (e) { /* переменной result нет — это обычная ячейка */ }
        send({ type: "data", rows: rows });
        send({ type: "done", result: result === undefined ? "" : String(result) });
      })
      .catch(function (err) {
        send({ type: "error", text: String(err && err.message || err) });
      });
  }
};
