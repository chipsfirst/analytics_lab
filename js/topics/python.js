// Раздел «python»: главы и банк вопросов.
window.TOPICS.python = {
    title: "Python",
    tag: "Типы · строки · списки · условия · pandas",
    lead: "Язык для анализа данных: от типов и срезов до условных конструкций и первых шагов в pandas.",
    chapters: [
      {
        title: "Данные и их типы",
        html: `
<p>Python — язык с динамической типизацией: тип хранится в объекте, а не в переменной. Узнать тип можно функцией <code>type()</code>.</p>
<table>
<thead><tr><th>Тип</th><th>Пример</th><th>Что хранит</th></tr></thead>
<tbody>
<tr><td><code>int</code></td><td><code>42</code></td><td>целые числа</td></tr>
<tr><td><code>float</code></td><td><code>3.14</code></td><td>вещественные числа</td></tr>
<tr><td><code>str</code></td><td><code>"Казань"</code></td><td>строки</td></tr>
<tr><td><code>bool</code></td><td><code>True</code></td><td>логические значения</td></tr>
<tr><td><code>list</code></td><td><code>[1, 2, 3]</code></td><td>списки</td></tr>
<tr><td><code>dict</code></td><td><code>{"city": "Казань"}</code></td><td>словари — пары «ключ — значение»</td></tr>
</tbody>
</table>
<p><b>Преобразование типов.</b> <code>int()</code>, <code>float()</code>, <code>str()</code>, <code>bool()</code>. <code>int("42")</code> даёт 42, а <code>int("4.2")</code> падает с ошибкой: сначала нужен <code>float()</code>.</p>
<p><b>Логика и числа.</b> <code>True</code> — это 1, <code>False</code> — 0, поэтому <code>True + True</code> равно 2. Обратное неверно: <code>bool("0")</code> даёт <code>True</code>, потому что строка непустая.</p>
<div class="note"><b>Ловушка пустоты</b><code>bool()</code> возвращает <code>False</code> для <code>0</code>, <code>0.0</code>, <code>""</code>, <code>[]</code>, <code>{}</code>, <code>None</code>. Всё остальное — <code>True</code>, включая строку <code>"0"</code> и список <code>[0]</code>.</div>
<p><b>Арифметика.</b> <code>//</code> — целочисленное деление, <code>%</code> — остаток, <code>**</code> — степень. <code>7 // 2</code> равно 3, <code>7 % 2</code> равно 1, <code>2 ** 10</code> равно 1024.</p>

<div class="example"><b>Пример.</b> type(42) — int, type("42") — str, поэтому "42" + 1 даёт ошибку, а int("42") + 1 = 43. Деление 7 / 2 = 3.5, целочисленное 7 // 2 = 3.</div>`
      },
      {
        title: "Строки",
        html: `
<p>Строка задаётся в одинарных, двойных или тройных кавычках. <code>len()</code> возвращает длину, <code>+</code> склеивает, <code>*</code> повторяет.</p>
<div class="formula">s = "аналитика"
len(s)        # 9
s[0]          # "а"
s[-1]         # "а" — последний символ
s[2:5]        # "али" — с индекса 2 до 5, не включая 5</div>
<p><b>Срезы.</b> Конструкция <code>[start:end:step]</code>: <code>start</code> входит в результат, <code>end</code> — нет. Отрицательные индексы считают с конца, <code>s[::-1]</code> переворачивает строку.</p>
<p><b>Методы.</b> <code>upper()</code> и <code>lower()</code> меняют регистр, <code>replace()</code> заменяет подстроку, <code>find()</code> возвращает индекс первого вхождения или <code>-1</code>, <code>split()</code> режет по разделителю, <code>strip()</code> убирает пробелы по краям, <code>join()</code> собирает строку из списка. Строки неизменяемы: методы возвращают новую строку.</p>
<div class="example"><b>Пример.</b> «  Иван Петров  ».strip().lower().split(" ") даёт ["иван", "петров"].</div>
<p><b>f-строки</b> — самый читаемый способ подставить значения:</p>
<div class="formula">city = "Казань"
rate = 0.0734
print(f"Конверсия в {city}: {rate:.1%}")   # Конверсия в Казань: 7.3%</div>

<h3>Дополнительно: неизменяемость и рабочие методы</h3>
<p>Строка в Python неизменяема: <code>s[0] = "A"</code> вызовет ошибку. Методы возвращают новую строку, поэтому результат нужно присвоить или использовать сразу.</p>
<div class="table-wrap"><table><thead><tr><th>Операция</th><th>Пример</th><th>Результат</th></tr></thead><tbody>
<tr><td>Очистка</td><td><code>"  да ".strip()</code></td><td><code>"да"</code></td></tr>
<tr><td>Регистр</td><td><code>"Да".lower()</code></td><td><code>"да"</code></td></tr>
<tr><td>Разбиение</td><td><code>"a,b".split(",")</code></td><td><code>["a","b"]</code></td></tr>
<tr><td>Сборка</td><td><code>"-".join(["a","b"])</code></td><td><code>"a-b"</code></td></tr>
<tr><td>Срез</td><td><code>"аналитика"[:4]</code></td><td><code>"анал"</code></td></tr>
</tbody></table></div>
<div class="example"><b>Пример.</b> Строку <code>"  Анна, 34 "</code> разбирают так: <code>name, age = "  Анна, 34 ".strip().split(", ")</code>, затем <code>age = int(age)</code>. Для вывода — <code>f"{name}: {age} лет"</code>. f-строки удобнее склейки через <code>+</code> и сразу приводят значения к тексту.</div>
<p>Для русского текста указывайте кодировку при чтении файлов: <code>open(path, encoding="utf-8")</code>. Иначе на Windows можно получить кракозябры или ошибку декодирования.</p>
`
      },
      {
        title: "Списки",
        html: `
<p>Список — изменяемая последовательность: <code>[1, 2, 3]</code>. Индексация и срезы работают как у строк, но элементы можно менять.</p>
<div class="formula">a = [10, 20, 30]
a[1] = 25          # [10, 25, 30]
a.append(40)       # [10, 25, 30, 40]
a.sort()           # по возрастанию
len(a), sum(a)     # 4, 105
20 in a            # False</div>
<p><b>Полезные методы:</b> <code>append</code>, <code>extend</code>, <code>insert</code>, <code>remove</code>, <code>pop</code>, <code>sort</code>, <code>reverse</code>, <code>index</code>, <code>count</code>. <code>sorted(a)</code> возвращает новый список, <code>a.sort()</code> меняет существующий.</p>
<div class="note"><b>Копирование</b><code>b = a</code> не копирует список, а даёт второе имя тому же объекту: изменения через <code>b</code> видны в <code>a</code>. Копия — это <code>b = a[:]</code>, <code>list(a)</code> или <code>a.copy()</code>.</div>
<p><b>Списковые включения</b> заменяют цикл с <code>append</code>:</p>
<div class="formula">squares = [x ** 2 for x in range(5)]        # [0, 1, 4, 9, 16]
even = [x for x in range(10) if x % 2 == 0] # [0, 2, 4, 6, 8]</div>
<p>Для агрегатов есть <code>sum</code>, <code>min</code>, <code>max</code>, <code>sorted</code>. Среднее списка — <code>sum(a) / len(a)</code>.</p>

<div class="example"><b>Пример.</b> a = [10, 20, 30]; a[1] = 25 даёт [10, 25, 30]; a.append(40) — [10, 25, 30, 40]; sum(a) = 105, а 20 in a после замены — False.</div>`
      },
      {
        title: "Условия и логика",
        html: `
<p>Логическое выражение сравнивает данные и даёт <code>True</code> или <code>False</code>. Операторы сравнения: <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code>, <code>&gt;=</code>, <code>!=</code>, <code>==</code>.</p>
<table>
<thead><tr><th>A</th><th>B</th><th>A and B</th><th>A or B</th><th>not A</th></tr></thead>
<tbody>
<tr><td>True</td><td>True</td><td>True</td><td>True</td><td>False</td></tr>
<tr><td>True</td><td>False</td><td>False</td><td>True</td><td>False</td></tr>
<tr><td>False</td><td>False</td><td>False</td><td>False</td><td>True</td></tr>
</tbody>
</table>
<p><b>Порядок вычислений:</b> скобки, возведение в степень, умножение и деление, сложение и вычитание, сравнения, затем <code>not</code>, <code>and</code>, <code>or</code>. Операторы одного приоритета выполняются слева направо.</p>
<div class="formula">if score >= 90:
    grade = "5"
elif score >= 75:
    grade = "4"
elif score >= 60:
    grade = "3"
else:
    grade = "2"</div>
<p>Отступы — часть синтаксиса: тело условия выделяется четырьмя пробелами.</p>
<p><b>Функции-предикаты</b> проверяют содержимое строки: <code>islower()</code> — нет прописных букв, <code>isdigit()</code> — только цифры, <code>isalpha()</code> — только буквы, <code>isspace()</code> — только пробелы. Возвращают <code>True</code> или <code>False</code>.</p>
<div class="example"><b>Пример.</b> Проверка, что ввели число: <code>"42".isdigit()</code> — True, <code>"4.2".isdigit()</code> — False, потому что точка не цифра.</div>
`
      },
      {
        title: "Циклы, функции и pandas",
        html: `
<p><b>Циклы.</b> <code>for</code> перебирает последовательность, <code>while</code> повторяет по условию. <code>range(a, b, step)</code> задаёт арифметическую последовательность, где <code>b</code> не включается: <code>range(1, 6)</code> даёт 1, 2, 3, 4, 5.</p>
<div class="formula">total = 0
for x in [10, 20, 30]:
    total += x

while total > 30:
    total //= 2</div>
<p><code>break</code> выходит из цикла, <code>continue</code> переходит к следующей итерации.</p>
<p><b>Функции.</b> <code>def</code> объявляет функцию, <code>return</code> возвращает результат (без него — <code>None</code>). Значения по умолчанию задаются в заголовке.</p>
<div class="formula">def conversion(clicks, shows=0):
    if not shows:
        return None
    return clicks / shows</div>
<p><b>pandas</b> — основная библиотека табличного анализа. Таблица называется <code>DataFrame</code>, столбец — <code>Series</code>.</p>
<div class="formula">import pandas as pd

df = pd.read_csv("orders.csv")
df.head()                      # первые 5 строк
df.info()                      # типы и пропуски
df["amount"].mean()            # среднее по столбцу
df["city"].value_counts()      # частота городов
df[df["amount"] > 1000]        # фильтр строк
df.groupby("city")["amount"].sum()
df.merge(users, on="user_id", how="left")</div>
<p><b>loc и iloc.</b> <code>loc</code> обращается по метке, <code>iloc</code> — по номеру строки: <code>df.loc[0, "amount"]</code>, <code>df.iloc[0, 2]</code>.</p>
<p><b>Пропуски.</b> <code>df.isna().sum()</code> показывает их количество по столбцам, <code>df.dropna()</code> удаляет строки, <code>df.fillna(0)</code> заменяет. Любая агрегация в pandas по умолчанию игнорирует <code>NaN</code> — как и <code>AVG</code> в SQL.</p>

<div class="example"><b>Пример.</b> Сумма [10, 20, 30] в цикле — 60, та же сумма через sum() — 60. В pandas таблица продаж по городам: df.groupby("city")["amount"].sum() возвращает сумму по каждому городу одной строкой.</div>`
      },
      {
        title: "pandas: рабочий цикл анализа",
        html: `
  <p>Рабочий цикл начинается с <b>чтения и проверки</b>, а не с графиков: <code>read_csv</code> с явными <code>dtype</code> и <code>parse_dates</code>, затем <code>info()</code>, пропуски, дубли ключа и диапазоны дат. Иначе ведущие нули станут числами, а даты — строками.</p>
  <div class="formula">df = pd.read_csv(path, dtype={"user_id": "string"}, parse_dates=["order_date"])
  df.groupby("city", dropna=False).agg(revenue=("amount", "sum"))</div>
  <p><b>Merge</b> проверяют через <code>validate=</code>: <code>one_to_many</code>, <code>many_to_one</code>, <code>one_to_one</code>. Если ожидание не выполняется, pandas бросит ошибку до того, как суммы задвоятся. После join всегда сверяют число строк и сумму.</p>
  <p><b>Groupby + agg</b> задаёт именованные агрегаты, <code>pivot_table</code> — разрез, <code>sort_values</code> — порядок. Цепочки методов читаемы, но промежуточные проверки (форма, пропуски, контрольная сумма) важнее краткости.</p>
  <div class="example"><b>Пример.</b> После merge заказов с городами выручка выросла на 12%: у города было два дубля в справочнике. <code>validate="many_to_one"</code> поймал бы это до отчёта.</div>
  `
      }
    ],
    quiz: [
      {
        q: "Что вернёт type(\"42\")?",
        options: ["str", "int", "float", "bool"],
        correct: 0,
        explain: "«42» записано в кавычках, значит это строка. Числом она станет только после int(\"42\")."
      },
      {
        q: "Чему равно int(\"7\") + 5?",
        options: ["12", "75", "«75»", "Ошибка"],
        correct: 0,
        explain: "int(\"7\") превращает строку в число 7, дальше обычное сложение: 7 + 5 = 12."
      },
      {
        q: "Что вернёт \"abcdef\"[1:4]?",
        options: ["\"bcd\"", "\"bcde\"", "\"abcd\"", "\"cde\""],
        correct: 0,
        explain: "Срез включает start (1 → b) и не включает end (4 → e), поэтому символы с индексами 1, 2, 3."
      },
      {
        q: "Чему равно len(\"аналитика\")?",
        options: ["9", "8", "10", "Ошибка"],
        correct: 0,
        explain: "а-н-а-л-и-т-и-к-а: девять символов."
      },
      {
        q: "Что вернёт bool(\"0\")?",
        options: ["True", "False", "0", "Ошибка"],
        correct: 0,
        explain: "Строка «0» непустая, а значит истинная. False даёт только пустая строка \"\"."
      },
      {
        q: "Чему равно 7 // 2?",
        options: ["3", "3.5", "4", "1"],
        correct: 0,
        explain: "// — целочисленное деление с отбрасыванием дробной части: 7 // 2 = 3."
      },
      {
        q: "Чему равна сумма чисел range(1, 6)?",
        options: ["15", "21", "14", "10"],
        correct: 0,
        explain: "range(1, 6) — это 1, 2, 3, 4, 5; правая граница не включается. Сумма 15."
      },
      {
        q: "a = [1, 2]; b = a; b.append(3). Что станет с a?",
        options: ["[1, 2, 3]", "[1, 2]", "Ошибка", "[3, 1, 2]"],
        correct: 0,
        explain: "b = a не копирует список, а ссылается на тот же объект. Копия — a[:] или list(a)."
      },
      {
        q: "Что делает df.groupby(\"city\")[\"amount\"].sum()?",
        options: [
          "Суммирует amount по каждому городу",
          "Считает города",
          "Сортирует заказы по сумме",
          "Оставляет только города с суммой больше нуля"
        ],
        correct: 0,
        explain: "groupby группирует строки по городу, а sum агрегирует сумму заказов внутри каждой группы."
      },
      {
        q: "Что возвращает df.head()?",
        options: ["Первые пять строк", "Пять последних строк", "Число строк", "Список столбцов"],
        correct: 0,
        explain: "head() по умолчанию показывает первые 5 строк; аргумент меняет количество: df.head(10)."
      },
      {
        q: "Зачем указывать dtype при чтении CSV?",
        options: [
          "Чтобы не потерять ведущие нули и получить предсказуемые типы",
          "Чтобы ускорить интернет",
          "Чтобы удалить пропуски",
          "Чтобы переименовать столбцы"
        ],
        correct: 0,
        explain: "Автоопределение типов может превратить идентификаторы в числа и испортить ключи."
      },
      {
        q: "Что делает validate=\"many_to_one\" в merge?",
        options: [
          "Проверяет, что ключ справа уникален, и падает при нарушении",
          "Оставляет только совпавшие строки",
          "Сортирует результат",
          "Заполняет пропуски нулём"
        ],
        correct: 0,
        explain: "Валидация кардинальности защищает от размножения строк и задвоения сумм."
      }
    ]
  };
