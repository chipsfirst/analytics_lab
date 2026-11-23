// Раздел «python»: главы и банк вопросов.
window.TOPICS.python = {
    title: "Python",
    tag: "Типы · строки · списки · условия · pandas",
    lead: "Язык для анализа данных: от типов и срезов до условных конструкций и первых шагов в pandas.",
    chapters: [
      {
        title: "Что такое Python и зачем он аналитику",
        html: `
<p><b>Python</b> — универсальный язык программирования. Его создал Гвидо ван Россум, первая версия вышла в 1991 году. Python интерпретируемый: вы пишете код в файле или ячейке блокнота, а интерпретатор выполняет его строка за строкой.</p>
<p>Аналитику Python нужен там, где SQL и Excel упираются в ограничения: сложная очистка, повторяемые расчёты, несколько источников, API, модели и графики. SQL достаёт данные, Excel показывает результат, а Python связывает шаги в воспроизводимый процесс.</p>
<figure class="figure"><svg viewBox="0 0 360 96" role="img" aria-label="Как выполняется Python: код, интерпретатор, результат"><g font-size="9" fill="currentColor" text-anchor="middle"><rect x="8" y="28" width="90" height="40" rx="7" fill="none" stroke="currentColor" opacity=".55"/><text x="53" y="45">Код</text><text x="53" y="58" opacity=".7">analysis.py</text><text x="118" y="52">→</text><rect x="134" y="28" width="92" height="40" rx="7" fill="none" stroke="currentColor" opacity=".55"/><text x="180" y="45">Интерпретатор</text><text x="180" y="58" opacity=".7">Python 3</text><text x="246" y="52">→</text><rect x="262" y="28" width="90" height="40" rx="7" fill="none" stroke="currentColor" opacity=".55"/><text x="307" y="45">Результат</text><text x="307" y="58" opacity=".7">таблица, файл</text></g></svg><figcaption>Python не компилируется в отдельный файл вручную: интерпретатор читает код и сразу выполняет его. Ошибка в строке останавливает выполнение.</figcaption></figure>
<h3>Где Python сильнее</h3>
<div class="table-wrap"><table><thead><tr><th>Задача</th><th>Python</th><th>Альтернатива</th></tr></thead><tbody>
<tr><td>Сложная очистка</td><td>гибко, воспроизводимо</td><td>Power Query, dbt</td></tr>
<tr><td>Повторяемый расчёт</td><td>скрипт или блокнот</td><td>SQL, Excel</td></tr>
<tr><td>Несколько источников</td><td>CSV, API, база, JSON</td><td>ETL-инструмент</td></tr>
<tr><td>Модель или график</td><td>scikit-learn, matplotlib</td><td>BI, специализированный сервис</td></tr>
</tbody></table></div>
<h3>Что понадобится</h3>
<div class="table-wrap"><table><thead><tr><th>Инструмент</th><th>Зачем</th></tr></thead><tbody>
<tr><td><code>pandas</code></td><td>таблицы, фильтры, группировки, join</td></tr>
<tr><td><code>numpy</code></td><td>массивы и быстрые вычисления</td></tr>
<tr><td><code>matplotlib</code>/<code>seaborn</code></td><td>графики</td></tr>
<tr><td>Jupyter Notebook</td><td>код, текст и результаты в одном файле</td></tr>
</tbody></table></div>
<p><b>Переменная</b> — имя, которое ссылается на значение: <code>orders = 1200</code>. Тип хранится в объекте, поэтому одна и та же переменная может сначала быть числом, потом строкой. Это гибко, но требует внимательности: <code>"42" + 1</code> даст ошибку.</p>
<div class="example"><b>Пример.</b> Чтение CSV и сумма по городам занимают несколько строк: <code>df = pd.read_csv("orders.csv")</code>, затем <code>df.groupby("city")["amount"].sum()</code>. Это не заменяет SQL, но позволяет быстро проверить данные и повторить расчёт.</div>
<div class="note"><b>Не начинайте с моделей</b>Сначала научитесь читать данные, проверять типы и пропуски, считать метрики и сохранять результат. Модель без проверенных данных только ускоряет неверный вывод.</div>
`
      },
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
<figure class="figure"><svg viewBox="0 0 360 104" role="img" aria-label="Срез списка a[1:4]: элементы с индексами 1, 2 и 3"><g font-size="9" fill="currentColor" text-anchor="middle"><text x="20" y="18">a</text><rect x="104" y="30" width="156" height="30" rx="4" fill="currentColor" opacity=".14"/><rect x="52" y="30" width="52" height="30" rx="3" fill="none" stroke="currentColor" opacity=".55"/><rect x="104" y="30" width="52" height="30" rx="0" fill="none" stroke="currentColor" opacity=".55"/><rect x="156" y="30" width="52" height="30" rx="0" fill="none" stroke="currentColor" opacity=".55"/><rect x="208" y="30" width="52" height="30" rx="0" fill="none" stroke="currentColor" opacity=".55"/><rect x="260" y="30" width="52" height="30" rx="3" fill="none" stroke="currentColor" opacity=".55"/><text x="78" y="49">10</text><text x="130" y="49">20</text><text x="182" y="49">30</text><text x="234" y="49">40</text><text x="286" y="49">50</text><text x="78" y="24" opacity=".7">0</text><text x="130" y="24" opacity=".7">1</text><text x="182" y="24" opacity=".7">2</text><text x="234" y="24" opacity=".7">3</text><text x="286" y="24" opacity=".7">4</text><text x="78" y="74" opacity=".7">−5</text><text x="130" y="74" opacity=".7">−4</text><text x="182" y="74" opacity=".7">−3</text><text x="234" y="74" opacity=".7">−2</text><text x="286" y="74" opacity=".7">−1</text><text x="182" y="94">a[1:4] → [20, 30, 40]</text></g></svg><figcaption>Срез [1:4] берёт элементы с индексами 1, 2 и 3. Граница 4 не входит; отрицательные индексы считают с конца.</figcaption></figure>
<p><b>Полезные методы:</b> <code>append</code>, <code>extend</code>, <code>insert</code>, <code>remove</code>, <code>pop</code>, <code>sort</code>, <code>reverse</code>, <code>index</code>, <code>count</code>. <code>sorted(a)</code> возвращает новый список, <code>a.sort()</code> меняет существующий.</p>
<div class="note"><b>Копирование</b><code>b = a</code> не копирует список, а даёт второе имя тому же объекту: изменения через <code>b</code> видны в <code>a</code>. Копия — это <code>b = a[:]</code>, <code>list(a)</code> или <code>a.copy()</code>.</div>
<p><b>Списковые включения</b> заменяют цикл с <code>append</code>:</p>
<div class="formula">squares = [x ** 2 for x in range(5)]        # [0, 1, 4, 9, 16]
even = [x for x in range(10) if x % 2 == 0] # [0, 2, 4, 6, 8]</div>
<p>Для агрегатов есть <code>sum</code>, <code>min</code>, <code>max</code>, <code>sorted</code>. Среднее списка — <code>sum(a) / len(a)</code>.</p>

<div class="example"><b>Пример.</b> a = [10, 20, 30]; a[1] = 25 даёт [10, 25, 30]; a.append(40) — [10, 25, 30, 40]; sum(a) = 105, а 20 in a после замены — False.</div>`
      },
      {
        title: "Словари и JSON",
        html: `
<p><b>Словарь</b> (<code>dict</code>) хранит пары «ключ — значение». Ключом обычно бывает строка или число, значением — что угодно: число, список, другой словарь. Словари удобны, когда нужно обращаться к данным по имени, а не по номеру.</p>
<div class="formula">user = {"id": 42, "city": "Казань", "active": True}
user["city"]        # "Казань"
user.get("age", 0)  # 0, если ключа нет</div>
<div class="table-wrap"><table><thead><tr><th>Действие</th><th>Код</th><th>Результат</th></tr></thead><tbody>
<tr><td>Создать</td><td><code>{"a": 1}</code></td><td>словарь</td></tr>
<tr><td>Прочитать</td><td><code>d["a"]</code></td><td>1 или KeyError</td></tr>
<tr><td>Безопасно</td><td><code>d.get("b", 0)</code></td><td>0</td></tr>
<tr><td>Добавить</td><td><code>d["b"] = 2</code></td><td>новый ключ</td></tr>
<tr><td>Перебрать</td><td><code>for k, v in d.items()</code></td><td>ключ и значение</td></tr>
</tbody></table></div>
<p><b>JSON</b> — текстовый формат обмена данными. Он похож на словари и списки Python, поэтому после <code>json.loads()</code> с ним работают как с обычным словарём. Ответ API часто выглядит так:</p>
<div class="formula">{"user": {"id": 42, "city": "Казань"},
 "orders": [{"id": 101, "amount": 1200}]}</div>
<figure class="figure"><svg viewBox="0 0 360 126" role="img" aria-label="Структура JSON: объект user и массив orders"><g font-size="9" fill="currentColor" text-anchor="middle"><rect x="12" y="12" width="336" height="102" rx="8" fill="none" stroke="currentColor" opacity=".5"/><text x="180" y="30">ответ API</text><rect x="32" y="44" width="128" height="54" rx="5" fill="currentColor" opacity=".1"/><text x="96" y="60">user</text><text x="96" y="76" opacity=".7">id: 42</text><text x="96" y="90" opacity=".7">city: Казань</text><rect x="186" y="44" width="142" height="54" rx="5" fill="currentColor" opacity=".1"/><text x="257" y="60">orders[]</text><text x="257" y="76" opacity=".7">id: 101</text><text x="257" y="90" opacity=".7">amount: 1200</text></g></svg><figcaption>JSON — это вложенные словари и списки. Путь к городу: response["user"]["city"].</figcaption></figure>
<p><b>Чтение и запись.</b> <code>json.loads(text)</code> разбирает строку, <code>json.dumps(data, ensure_ascii=False)</code> делает строку. <code>ensure_ascii=False</code> сохраняет русские буквы, а не превращает их в Unicode-последовательности.</p>
<div class="example"><b>Пример.</b> <code>data = json.loads(response_text)</code>, затем <code>data["user"]["city"]</code> и <code>data["orders"][0]["amount"]</code>. Если ключа нет, обычное обращение даст <code>KeyError</code>, а <code>.get()</code> вернёт значение по умолчанию.</div>
<div class="note"><b>Словарь — не таблица</b>Для расчётов по многим записям словарь часто превращают в DataFrame: <code>pd.DataFrame(data["orders"])</code>. Так проще фильтровать и группировать.</div>
`
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
      },
      {
        title: "pandas: чтение, типы и память",
        html: `
<p><b>Чтение CSV</b> — первый источник ошибок. Явные <code>dtype</code> и <code>parse_dates</code> дешевле, чем исправление последствий: ведущие нули в идентификаторах, даты-строки, числа с запятой вместо точки.</p>
<pre><code>df = pd.read_csv(
    path,
    usecols=["user_id", "order_date", "amount", "channel"],
    dtype={"user_id": "string", "channel": "category"},
    parse_dates=["order_date"],
)</code></pre>
<p><b>Категории</b> экономят память, когда строк мало, а повторов много: вместо объекта на каждую строку хранится код и справочник. <b>Chunksize</b> позволяет обрабатывать файл частями, если он не помещается в RAM.</p>
<p><b>Память</b> проверяют через <code>df.info(memory_usage="deep")</code>. Числа по умолчанию часто <code>int64</code>/<code>float64</code>; при необходимости используют <code>int32</code>, <code>float32</code>, <code>category</code> и <code>string</code>. Понижение типа — компромисс точности и памяти.</p>
<div class="example"><b>Пример.</b> 10 млн строк с текстовым каналом из пяти значений в <code>object</code> занимают сотни мегабайт; <code>category</code> обычно в разы меньше. Но для уникальных идентификаторов категория почти бесполезна.</div>
<div class="note"><b>Сначала схема</b>Задайте типы при чтении, а не после. Тогда код падает на неожиданном формате сразу, а не на середине анализа.</div>
`
      },
      {
        title: "pandas: группировки и соединения",
        html: `
<p><b>Groupby</b> делит строки на группы и считает агрегат в каждой. Именованные агрегаты читаются лучше кортежей и сразу задают имя результата.</p>
<pre><code>daily = (df
    .groupby("order_date", as_index=False)
    .agg(revenue=("amount", "sum"), orders=("order_id", "nunique")))</code></pre>
<p><b>agg</b> сворачивает группу до одной строки, <b>transform</b> возвращает результат той же длины: например, долю заказа в выручке дня. <b>pivot_table</b> строит разрез, <b>melt</b> возвращает длинный формат.</p>
<p><b>Merge</b> — главный источник задвоений. Всегда задавайте <code>validate=</code> и проверяйте кардинальность: <code>many_to_one</code> для справочника, <code>one_to_one</code> для уникального соответствия. После join сверяют число строк и контрольную сумму.</p>
<div class="example"><b>Пример.</b> Заказы соединяют с городами по <code>city_id</code>. В справочнике оказался дубль города: выручка выросла на 12%, хотя данные не изменились. <code>validate="many_to_one"</code> падает сразу и экономит отчёт.</div>
<div class="note"><b>merge_asof</b>Для ближайшего события по времени (например, тариф на дату заказа) нужен <code>merge_asof</code>, а не обычный merge: он ищет ближайший ключ, а не точное совпадение.</div>
`
      },
      {
        title: "pandas: время, окна и качество",
        html: `
<p><b>Время</b> должно быть <code>datetime</code>, отсортировано и с понятным часовым поясом. <code>resample("D").sum()</code> меняет частоту, <code>rolling(7).mean()</code> считает скользящее среднее, <code>shift(1)</code> даёт предыдущее значение для сравнения периодов.</p>
<pre><code>df = df.sort_values("order_date")
df["revenue_7d"] = df.set_index("order_date")["amount"].rolling(7).sum().values
df["prev_day"] = df["amount"].shift(1)</code></pre>
<p><b>Окно</b> по умолчанию включает текущую строку и предыдущие <code>window − 1</code>. Центрированное окно использует будущее и для прогноза не годится. Пропуски внутри окна pandas обрабатывает по правилу <code>min_periods</code>.</p>
<p><b>Качество</b> проверяют до агрегатов: дубли ключа, пропуски, выбросы, диапазон дат, отрицательные суммы и разрывы в календаре. После — сверяют итог с источником.</p>
<div class="example"><b>Пример.</b> После <code>resample("D")</code> появились дни без продаж с <code>NaN</code>. Для выручки их заполняют нулём, для среднего чека — оставляют пропуском: ноль и «нет данных» — разные вещи.</div>
<div class="note"><b>Не цепляйтесь за одну метрику</b>Сравнивайте число строк, сумму, минимум/максимум и количество уникальных ключей. Одна цифра почти всегда что-то скрывает.</div>
`
      },
      {
        title: "NumPy: массивы и векторизация",
        html: `
<p><b>NumPy</b> — библиотека для числовых массивов. Список Python хранит любые объекты и обрабатывается циклом, а <code>ndarray</code> хранит числа одного типа и умеет применять операцию сразу ко всем элементам. Для таблиц NumPy часто работает под капотом pandas.</p>
<div class="formula">import numpy as np
sales = np.array([120, 90, 150])
sales * 1.2          # [144. 108. 180.]
sales.mean()         # 120.0
sales[sales > 100]   # [120 150]</div>
<figure class="figure"><svg viewBox="0 0 360 104" role="img" aria-label="NumPy применяет умножение ко всем элементам массива одной операцией"><g font-size="9" fill="currentColor" text-anchor="middle"><rect x="8" y="30" width="86" height="34" rx="6" fill="none" stroke="currentColor" opacity=".5"/><text x="51" y="44">[120, 90, 150]</text><text x="51" y="57" opacity=".7">ndarray</text><text x="105" y="51">× 1.2</text><text x="139" y="51">→</text><rect x="150" y="30" width="98" height="34" rx="6" fill="currentColor" opacity=".1"/><text x="199" y="44">[144, 108, 180]</text><text x="199" y="57" opacity=".7">без цикла</text><text x="267" y="51">→</text><rect x="278" y="30" width="74" height="34" rx="6" fill="none" stroke="currentColor" opacity=".5"/><text x="315" y="44">результат</text><text x="315" y="57" opacity=".7">mean, max</text></g></svg><figcaption>Векторизация применяет операцию ко всему массиву. Цикл в Python делает то же самое, но медленнее и длиннее.</figcaption></figure>
<div class="table-wrap"><table><thead><tr><th>Действие</th><th>Код</th><th>Результат</th></tr></thead><tbody>
<tr><td>Создать</td><td><code>np.array([1, 2, 3])</code></td><td>массив</td></tr>
<tr><td>Форма</td><td><code>a.shape</code></td><td>например, <code>(3,)</code></td></tr>
<tr><td>Тип</td><td><code>a.dtype</code></td><td><code>int64</code> или <code>float64</code></td></tr>
<tr><td>Фильтр</td><td><code>a[a &gt; 2]</code></td><td>элементы больше 2</td></tr>
<tr><td>Сумма по оси</td><td><code>m.sum(axis=0)</code></td><td>итог по столбцам</td></tr>
<tr><td>Пропуски</td><td><code>np.nanmean(a)</code></td><td>среднее без NaN</td></tr>
</tbody></table></div>
<p><b>Broadcasting</b> — выравнивание форм. Число <code>1.2</code> растягивается на весь массив, а массив формы <code>(3,)</code> может сложиться с таблицей <code>(2, 3)</code> по последней оси. Если формы несовместимы, NumPy выбрасывает <code>ValueError</code>.</p>
<div class="example"><b>Пример.</b> Выручка <code>revenue = df["amount"].to_numpy()</code>. Доля города: <code>revenue / revenue.sum()</code>. Средний чек без нулей: <code>revenue[revenue &gt; 0].mean()</code>. Такой расчёт короче цикла и не создаёт промежуточный список.</div>
<div class="note"><b>Где остановиться</b>NumPy хорош для числовых массивов и матриц. Для таблиц с подписями, join и пропусками оставайтесь в pandas: она использует NumPy внутри, но даёт понятные имена колонок.</div>
`
      },
      {
        title: "matplotlib: график с нуля",
        html: `
<p><b>matplotlib</b> — базовая библиотека графиков Python. У неё есть два уровня: <code>Figure</code> — весь холст, <code>Axes</code> — область с осями, линиями и подписями. Надёжнее сразу создавать <code>fig, ax</code> и рисовать на <code>ax</code>, а не полагаться на глобальное состояние.</p>
<div class="formula">import matplotlib.pyplot as plt
fig, ax = plt.subplots(figsize=(6, 3))
ax.plot(months, revenue, marker="o")
ax.set_title("Выручка по месяцам")
ax.set_xlabel("Месяц")
ax.set_ylabel("Выручка, ₽")
ax.grid(alpha=0.3)
fig.tight_layout()
fig.savefig("revenue.png", dpi=150, bbox_inches="tight")</div>
<figure class="figure"><svg viewBox="0 0 360 148" role="img" aria-label="Устройство графика matplotlib: фигура, область осей, заголовок, подписи и легенда"><g font-size="9" fill="currentColor" text-anchor="middle"><rect x="12" y="8" width="336" height="126" rx="7" fill="none" stroke="currentColor" opacity=".5"/><text x="180" y="22">Figure — весь холст</text><rect x="52" y="40" width="236" height="70" rx="4" fill="currentColor" opacity=".08"/><text x="170" y="56">Axes — область графика</text><text x="170" y="78" opacity=".65">линия, точки, сетка</text><text x="170" y="94" opacity=".65">заголовок и подписи</text><text x="170" y="126">X: месяц</text><text x="26" y="78" transform="rotate(-90 26 78)">Y: выручка</text><text x="300" y="58">легенда</text><rect x="290" y="66" width="44" height="8" rx="2" fill="currentColor" opacity=".25"/><rect x="290" y="80" width="44" height="8" rx="2" fill="currentColor" opacity=".45"/></g></svg><figcaption>Сначала создают Figure, внутри неё — Axes. Заголовок, подписи и легенда относятся к осям, а размер и сохранение — к фигуре.</figcaption></figure>
<div class="table-wrap"><table><thead><tr><th>Задача</th><th>Метод</th><th>Когда использовать</th></tr></thead><tbody>
<tr><td>Динамика</td><td><code>ax.plot()</code></td><td>ряд по времени</td></tr>
<tr><td>Сравнение категорий</td><td><code>ax.bar()</code></td><td>выручка по городам</td></tr>
<tr><td>Связь двух чисел</td><td><code>ax.scatter()</code></td><td>цена и спрос</td></tr>
<tr><td>Распределение</td><td><code>ax.hist()</code></td><td>разброс сумм заказа</td></tr>
</tbody></table></div>
<div class="example"><b>Пример.</b> Если на одном графике две линии, подпишите их и добавьте <code>ax.legend()</code>. Для читаемости задайте <code>figsize</code>, уберите лишнюю сетку и сохраните PNG с <code>dpi=150</code>. В блокноте перед новым графиком вызывайте <code>plt.close(fig)</code>, чтобы фигуры не накапливались.</div>
<div class="note"><b>PNG или SVG</b>PNG проще вставить в отчёт и чат, SVG масштабируется без пикселей. Для презентации обычно нужен PNG с запасом по размеру, для сайта — SVG.</div>
`
      },
      {
        title: "seaborn: статистические графики",
        html: `
<p><b>seaborn</b> строит графики поверх matplotlib, но принимает DataFrame и названия колонок. Он сам группирует данные, рисует доверительные интервалы и подбирает палитру. Это удобно для разведочного анализа: меньше кода — быстрее посмотреть на распределения и связи.</p>
<div class="formula">import seaborn as sns
sns.set_theme(style="whitegrid")
sns.boxplot(data=df, x="city", y="amount")
sns.histplot(data=df, x="amount", hue="channel", bins=30)
sns.scatterplot(data=df, x="visits", y="revenue", hue="city")</div>
<figure class="figure"><svg viewBox="0 0 360 108" role="img" aria-label="Seaborn принимает DataFrame, группирует по колонкам и строит статистический график"><g font-size="9" fill="currentColor" text-anchor="middle"><rect x="8" y="28" width="94" height="46" rx="6" fill="none" stroke="currentColor" opacity=".5"/><text x="55" y="46">DataFrame</text><text x="55" y="60" opacity=".7">city, amount</text><text x="116" y="54">→</text><rect x="132" y="28" width="98" height="46" rx="6" fill="none" stroke="currentColor" opacity=".5"/><text x="181" y="46">sns.boxplot</text><text x="181" y="60" opacity=".7">x, y, hue</text><text x="242" y="54">→</text><rect x="258" y="28" width="94" height="46" rx="6" fill="currentColor" opacity=".1"/><text x="305" y="46">Axes</text><text x="305" y="60" opacity=".7">график готов</text></g></svg><figcaption>Seaborn связывает колонки таблицы с осями и группировкой. Результат — обычный matplotlib Axes, который можно донастроить.</figcaption></figure>
<div class="table-wrap"><table><thead><tr><th>Функция</th><th>Что показывает</th><th>Пример</th></tr></thead><tbody>
<tr><td><code>histplot</code></td><td>распределение</td><td>суммы заказов</td></tr>
<tr><td><code>boxplot</code></td><td>медиану, квартили, выбросы</td><td>чек по городам</td></tr>
<tr><td><code>scatterplot</code></td><td>связь двух метрик</td><td>визиты и выручка</td></tr>
<tr><td><code>heatmap</code></td><td>матрицу корреляций</td><td>числовые колонки</td></tr>
</tbody></table></div>
<div class="example"><b>Пример.</b> <code>sns.boxplot(data=df, x="city", y="amount", hue="channel")</code> покажет распределение чека по городам и каналам. Если график нужен в отчёте, сохраните его через <code>ax = sns.boxplot(...)</code>, затем <code>ax.figure.savefig("box.png", bbox_inches="tight")</code>.</div>
<div class="note"><b>Доверительный интервал</b>По умолчанию многие функции seaborn добавляют интервал вокруг оценки. Для маленькой выборки он может быть широким и почти неинформативным — проверяйте число наблюдений.</div>
`
      },
      {
        title: "plotly: интерактивные графики",
        html: `
<p><b>plotly</b> делает графики для браузера: наведение показывает точные значения, колесо мыши масштабирует, легенда включает и выключает серии. Это удобно для дашбордов и исследования, но тяжелее статичного PNG.</p>
<div class="formula">import plotly.express as px
fig = px.line(df, x="date", y="revenue", color="city",
              title="Выручка по городам")
fig.update_layout(hovermode="x unified")
fig.write_html("revenue.html", include_plotlyjs="cdn")
fig.show()</div>
<figure class="figure"><svg viewBox="0 0 360 100" role="img" aria-label="Plotly превращает DataFrame в интерактивный HTML-график в браузере"><g font-size="9" fill="currentColor" text-anchor="middle"><rect x="8" y="28" width="82" height="38" rx="6" fill="none" stroke="currentColor" opacity=".5"/><text x="49" y="44">DataFrame</text><text x="49" y="57" opacity=".7">date, revenue</text><text x="102" y="51">→</text><rect x="116" y="28" width="84" height="38" rx="6" fill="none" stroke="currentColor" opacity=".5"/><text x="158" y="44">px.line</text><text x="158" y="57" opacity=".7">фигура</text><text x="212" y="51">→</text><rect x="226" y="28" width="56" height="38" rx="6" fill="none" stroke="currentColor" opacity=".5"/><text x="254" y="44">HTML</text><text x="254" y="57" opacity=".7">+ JS</text><text x="294" y="51">→</text><rect x="306" y="28" width="46" height="38" rx="6" fill="currentColor" opacity=".1"/><text x="329" y="44">Браузер</text><text x="329" y="57" opacity=".7">hover</text></g></svg><figcaption>Plotly сохраняет график как HTML со встроенным JavaScript. В браузере появляются наведение, масштаб и переключение серий.</figcaption></figure>
<div class="table-wrap"><table><thead><tr><th>Инструмент</th><th>Сильная сторона</th><th>Ограничение</th></tr></thead><tbody>
<tr><td>matplotlib</td><td>полный контроль, PNG/SVG</td><td>статичный график</td></tr>
<tr><td>seaborn</td><td>статистика из DataFrame</td><td>меньше нестандартных настроек</td></tr>
<tr><td>plotly express</td><td>интерактив в одну строку</td><td>файл тяжелее, нужен браузер</td></tr>
<tr><td>plotly graph_objects</td><td>тонкая настройка</td><td>больше кода</td></tr>
</tbody></table></div>
<div class="example"><b>Пример.</b> Для отчёта в PowerPoint сохраните статичную картинку, для исследования оставьте HTML. <code>include_plotlyjs="cdn"</code> уменьшает файл, но требует интернет; <code>True</code> встраивает библиотеку и работает офлайн, зато файл весит больше.</div>
<div class="note"><b>Не всё интерактивно</b>Интерактив помогает изучать данные, но не заменяет подпись «что здесь важно». В отчёте всё равно нужны заголовок, единицы измерения и вывод.</div>
`
      },
      {
        title: "Ошибки и отладка",
        html: `
<p>Ошибка в Python — это не конец света, а сообщение. Внизу traceback написано, <b>что</b> случилось, выше — <b>где</b> и цепочка вызовов. Читать его удобнее снизу вверх: сначала тип и текст, потом последняя строка вашего кода.</p>
<figure class="figure"><svg viewBox="0 0 360 104" role="img" aria-label="Путь ошибки: код, traceback, строка, исправление"><g font-size="9" fill="currentColor" text-anchor="middle"><rect x="8" y="30" width="76" height="38" rx="6" fill="none" stroke="currentColor" opacity=".5"/><text x="46" y="46">Код</text><text x="46" y="60" opacity=".7">запуск</text><text x="92" y="54">→</text><rect x="102" y="30" width="84" height="38" rx="6" fill="none" stroke="currentColor" opacity=".55"/><text x="144" y="46">Traceback</text><text x="144" y="60" opacity=".7">тип и текст</text><text x="194" y="54">→</text><rect x="204" y="30" width="72" height="38" rx="6" fill="none" stroke="currentColor" opacity=".55"/><text x="240" y="46">Строка</text><text x="240" y="60" opacity=".7">номер</text><text x="284" y="54">→</text><rect x="294" y="30" width="58" height="38" rx="6" fill="none" stroke="currentColor" opacity=".55"/><text x="323" y="46">Фикс</text><text x="323" y="60" opacity=".7">проверка</text></g></svg><figcaption>Traceback показывает не «кто виноват», а где программа остановилась. Начинайте с последней строки, затем ищите свой файл.</figcaption></figure>
<div class="table-wrap"><table><thead><tr><th>Ошибка</th><th>Что означает</th><th>Что проверить</th></tr></thead><tbody>
<tr><td><code>NameError</code></td><td>имя не определено</td><td>опечатка, переменная не создана</td></tr>
<tr><td><code>TypeError</code></td><td>неподходящий тип</td><td>строка вместо числа, None в выражении</td></tr>
<tr><td><code>ValueError</code></td><td>тип верный, значение нет</td><td><code>int("4,2")</code>, пустая строка</td></tr>
<tr><td><code>KeyError</code></td><td>ключа нет в словаре</td><td>опечатка или <code>.get()</code></td></tr>
<tr><td><code>IndexError</code></td><td>индекс за пределами</td><td>длина списка, пустой результат</td></tr>
<tr><td><code>FileNotFoundError</code></td><td>файл не найден</td><td>путь и рабочая папка</td></tr>
</tbody></table></div>
<p><b>Ожидаемые ошибки</b> можно обработать через <code>try/except</code>. Например, пользователь ввёл не число, а программе нужно продолжить работу.</p>
<div class="formula">try:
    age = int(input("Возраст: "))
except ValueError:
    age = None
    print("Это не число")</div>
<p><b>Не ловите всё подряд.</b> <code>except Exception</code> скрывает и опечатки, и ошибки логики. Ловите конкретный тип и только там, где действительно можете восстановиться. Для проверки предположений используйте <code>assert</code>, для явного сигнала — <code>raise ValueError(...)</code>.</p>
<div class="example"><b>Пример.</b> <code>int("42,5")</code> даёт <code>ValueError</code>: строка не является целым числом. Сначала замените запятую на точку и используйте <code>float()</code>, затем проверьте результат.</div>
<div class="note"><b>Отладка</b>Сначала прочитайте traceback, затем выведите промежуточные значения. <code>print(type(x), x)</code> часто полезнее, чем десять догадок.</div>
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
      },
      {
        q: "Что делает parse_dates в read_csv?",
        options: [
          "Разбирает указанные столбцы как даты",
          "Удаляет строки с датами",
          "Сортирует файл по дате",
          "Меняет часовой пояс на московский"
        ],
        correct: 0,
        explain: "parse_dates приводит столбцы к datetime; без него даты останутся строками и сравнения будут лексикографическими."
      },
      {
        q: "Когда dtype category экономит память?",
        options: [
          "Когда значений мало, а повторов много",
          "Когда все значения уникальны",
          "Когда в колонке только числа с плавающей точкой",
          "Когда таблица пустая"
        ],
        correct: 0,
        explain: "Категория хранит коды и справочник; при малом числе уникальных значений это дешевле объектов."
      },
      {
        q: "Чем agg отличается от transform в groupby?",
        options: [
          "agg сворачивает группу, transform возвращает результат той же длины",
          "transform всегда удаляет группы",
          "agg работает только с датами",
          "Они полностью одинаковы"
        ],
        correct: 0,
        explain: "agg даёт одну строку на группу, transform — новую колонку с результатом для каждой исходной строки."
      },
      {
        q: "Что проверяет validate=\"many_to_one\" в merge?",
        options: [
          "Что ключ в правой таблице уникален",
          "Что все строки совпали",
          "Что таблицы отсортированы",
          "Что пропусков нет ни в одной колонке"
        ],
        correct: 0,
        explain: "Валидация кардинальности не даёт join размножить строки и задвоить суммы."
      },
      {
        q: "Что делает rolling(7).mean()?",
        options: [
          "Среднее по текущей и шести предыдущим строкам",
          "Среднее по семи случайным строкам",
          "Удаляет каждую седьмую строку",
          "Считает среднее по всей таблице"
        ],
        correct: 0,
        explain: "Окно по умолчанию включает текущую строку и шесть предыдущих; данные должны быть отсортированы по времени."
      },
      {
        q: "Для чего нужен merge_asof?",
        options: [
          "Для соединения по ближайшему ключу или времени, а не по точному совпадению",
          "Для удаления дублей",
          "Для сортировки перед merge",
          "Для замены groupby"
        ],
        correct: 0,
        explain: "merge_asof ищет ближайшее событие: например, действующий тариф на дату заказа."
      },
      {
        q: "Что произойдёт при обращении d[\"age\"], если ключа age нет в словаре?",
        options: ["Будет KeyError", "Вернётся None", "Вернётся 0", "Ошибки не будет"],
        correct: 0,
        explain: "Обычное обращение по ключу выбрасывает KeyError, если ключ отсутствует. Безопасный вариант — .get(\"age\", 0)."
      },
      {
        q: "JSON — это:",
        options: ["Текстовый формат обмена данными", "Тип данных в pandas", "Встроенный график", "Способ подключения к базе"],
        correct: 0,
        explain: "JSON — текст, похожий на словари и списки Python. После json.loads() с ним работают как с обычным объектом."
      },
      {
        q: "Что делает ensure_ascii=False в json.dumps()?",
        options: [
          "Сохраняет русские буквы, а не превращает их в Unicode-последовательности",
          "Убирает пробелы",
          "Сортирует ключи",
          "Сжимает файл"
        ],
        correct: 0,
        explain: "Без ensure_ascii=False русские буквы ушли бы в escape-последовательности, и файл стало бы неудобно читать."
      },
      {
        q: "Какая ошибка возникнет при int(\"42,5\")?",
        options: ["ValueError", "NameError", "KeyError", "NoError"],
        correct: 0,
        explain: "Тип строковый, но значение \"42,5\" нельзя перевести в целое число. Сначала замените запятую и используйте float()."
      },
      {
        q: "Где читать traceback, чтобы понять причину ошибки?",
        options: [
          "Снизу вверх: тип и текст, потом строка кода",
          "Сверху вниз: имя модуля",
          "Только последнюю строку",
          "Traceback бесполезен"
        ],
        correct: 0,
        explain: "Внизу тип и сообщение, выше — строка вашего кода и цепочка вызовов. Читать удобнее снизу вверх."
      },
      {
        q: "Зачем нужен try/except?",
        options: [
          "Чтобы обработать ожидаемую ошибку и продолжить работу",
          "Чтобы ускорить выполнение цикла",
          "Чтобы объявить переменную",
          "Чтобы удалить файл"
        ],
        correct: 0,
        explain: "try выполняет код, except перехватывает конкретную ошибку. Ловить все исключения подряд не стоит: так скрываются опечатки и ошибки логики."
      },
      {
        q: "Что даёт векторизация NumPy?",
        options: [
          "Операцию сразу над всем массивом без явного цикла",
          "Автоматическое удаление пропусков",
          "Сохранение таблицы в Excel",
          "Построение графика"
        ],
        correct: 0,
        explain: "Векторизованная операция применяется ко всем элементам массива и обычно работает быстрее цикла Python."
      },
      {
        q: "Что вернёт a[a > 2], если a = np.array([1, 2, 3])?",
        options: ["[3]", "[1, 2]", "[2, 3]", "Ошибку"],
        correct: 0,
        explain: "Логическая маска a > 2 даёт [False, False, True], поэтому остаётся только элемент 3."
      },
      {
        q: "Чем Figure отличается от Axes в matplotlib?",
        options: [
          "Figure — весь холст, Axes — область графика внутри него",
          "Axes — весь холст, Figure — легенда",
          "Это одно и то же",
          "Figure хранит только цвета"
        ],
        correct: 0,
        explain: "Figure — холст и размер картинки, Axes — система координат с линиями, подписями и легендой."
      },
      {
        q: "Какой метод matplotlib лучше выбрать для выручки по городам?",
        options: ["ax.bar()", "ax.plot()", "ax.hist()", "ax.imshow()"],
        correct: 0,
        explain: "Столбцы сравнивают категории. Линия нужна для динамики, гистограмма — для распределения."
      },
      {
        q: "Что seaborn принимает чаще всего?",
        options: [
          "DataFrame и названия колонок",
          "Только списки Python",
          "Только SQL-запросы",
          "Только изображения"
        ],
        correct: 0,
        explain: "Seaborn работает с DataFrame: x, y и hue — это имена колонок, по которым он группирует данные."
      },
      {
        q: "Что показывает sns.boxplot?",
        options: [
          "Медиану, квартили, размах и выбросы",
          "Только среднее значение",
          "Точный прогноз на будущее",
          "Матрицу корреляций"
        ],
        correct: 0,
        explain: "Ящик с усами показывает распределение: медиану, квартили, границы и отдельные выбросы."
      },
      {
        q: "Чем график plotly отличается от matplotlib?",
        options: [
          "Он интерактивный и открывается в браузере",
          "Он не умеет строить линии",
          "Он работает только с массивами NumPy",
          "Он всегда чёрно-белый"
        ],
        correct: 0,
        explain: "Plotly делает HTML с наведением, масштабом и переключением серий; matplotlib по умолчанию статичен."
      },
      {
        q: "Что делает include_plotlyjs=\"cdn\" при сохранении plotly в HTML?",
        options: [
          "Подключает библиотеку с CDN, уменьшая файл",
          "Удаляет все подписи",
          "Сохраняет только PNG",
          "Отключает интерактивность"
        ],
        correct: 0,
        explain: "CDN уменьшает размер HTML, но для открытия нужен интернет. Встраивание библиотеки работает офлайн, но файл тяжелее."
      }
    ],
    terms: [
      { term: "Словарь (dict)", def: "Пары «ключ — значение» для доступа по имени вместо номера." },
      { term: "JSON", def: "Текстовый формат обмена данными, похожий на словари и списки Python." },
      { term: "Срез [start:end]", def: "Выделяет часть строки или списка; end не входит в результат." },
      { term: "Список (list)", def: "Изменяемая последовательность значений с индексацией и срезами." },
      { term: "f-строка", def: "Строка с подстановкой значений: f\"...{var}...\"" },
      { term: "pandas", def: "Библиотека для таблиц, фильтров, группировок и соединений." },
      { term: "DataFrame", def: "Основная таблица pandas: строки, столбцы, индексы и типы." },
      { term: "groupby", def: "Группировка строк по значениям колонки с агрегацией." },
      { term: "merge", def: "Соединение таблиц по ключу; требует проверки кардинальности." },
      { term: "TypeError", def: "Несовместимые типы: например, строка и число в одном выражении." },
      { term: "ValueError", def: "Тип верный, а значение нет: int(\"4,2\") или пустая строка." },
      { term: "traceback", def: "Сообщение об ошибке: тип, текст и путь выполнения кода." },
      { term: "try/except", def: "Обработка ожидаемой ошибки без остановки всей программы." },
      { term: "Формат в f-строке", def: "Например, {rate:.1%} выводит долю в процентах с одним знаком." },
      { term: "list comprehension", def: "Короткая запись цикла с результатом в список: [x for x in data if x]." },
      { term: "Кодировка", def: "utf-8 для русского текста при чтении файлов; иначе кракозябры." },
      { term: "NumPy", def: "Библиотека числовых массивов и векторных вычислений." },
      { term: "ndarray", def: "Массив NumPy с одним типом данных, формой и осями." },
      { term: "Векторизация", def: "Операция сразу над массивом вместо цикла по элементам." },
      { term: "Broadcasting", def: "Автоматическое выравнивание форм массивов при операции." },
      { term: "matplotlib", def: "Базовая библиотека статических графиков: Figure, Axes, линии и подписи." },
      { term: "Axes", def: "Область графика с осями, линиями и легендой внутри Figure." },
      { term: "seaborn", def: "Надстройка над matplotlib для статистических графиков по DataFrame." },
      { term: "plotly", def: "Библиотека интерактивных графиков для браузера и HTML." },
      { term: "hover", def: "Всплывающая подсказка при наведении на точку интерактивного графика." }
    ]
  };
