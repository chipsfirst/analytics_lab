// Раздел «sql»: главы и банк вопросов.
window.TOPICS.sql = {
    title: "SQL",
    tag: "SELECT · JOIN · окна · NULL · даты · качество · транзакции",
    lead: "Как достать нужные строки из таблицы, соединить данные и понять, почему запрос работает медленно. Примеры — для PostgreSQL, если не указано иное.",
    chapters: [
      {
        title: "Что такое SQL и зачем он нужен",
        html: `
<p><b>SQL</b> (Structured Query Language) — язык запросов к реляционным базам данных. Он декларативный: вы описываете, <i>что</i> хотите получить, а СУБД сама решает, как это сделать. Поэтому один и тот же запрос может выполняться разными способами и с разной скоростью.</p>
<p>SQL появился в 1970-х в IBM как SEQUEL, а в 1986 году стал международным стандартом. Сегодня его понимают PostgreSQL, MySQL, SQLite, SQL Server, Oracle, BigQuery, ClickHouse и другие системы. Синтаксис диалектов расходится в деталях, но ядро — таблицы, фильтры, группировки и соединения — общее.</p>
<p>Аналитику SQL нужен почти каждый день: достать данные из хранилища, собрать срез, проверить качество, посчитать метрику, подготовить витрину для BI или dbt-модели. Даже если вы работаете в Python или Excel, данные чаще всего приходят из базы через SQL.</p>
<h3>Таблицы, строки и ключи</h3>
<p>Реляционная база хранит данные в таблицах. Строка — один объект: заказ, пользователь, платёж. Столбец — признак. <b>Первичный ключ</b> (primary key) уникально определяет строку, а <b>внешний ключ</b> (foreign key) ссылается на строку в другой таблице.</p>
<figure class="figure"><svg viewBox="0 0 360 126" role="img" aria-label="Связь users и orders по user_id"><g font-size="9" fill="currentColor" text-anchor="middle"><rect x="8" y="16" width="142" height="88" rx="8" fill="none" stroke="currentColor" opacity=".55"/><text x="79" y="34">users</text><text x="79" y="52" opacity=".75">id — primary key</text><text x="79" y="66" opacity=".7">name</text><text x="79" y="80" opacity=".7">city</text><rect x="210" y="16" width="142" height="88" rx="8" fill="none" stroke="currentColor" opacity=".55"/><text x="281" y="34">orders</text><text x="281" y="52" opacity=".75">id — primary key</text><text x="281" y="66" opacity=".7">user_id — foreign key</text><text x="281" y="80" opacity=".7">amount</text><path d="M150 60h60" stroke="currentColor" opacity=".5"/><path d="M204 55l6 5-6 5" fill="none" stroke="currentColor" opacity=".7"/></g></svg><figcaption>Один пользователь может иметь много заказов. Связь задаётся через user_id, а не через хранение города в каждой строке заказа.</figcaption></figure>
<p>У одной строки users может быть много строк orders — это связь <b>один ко многим</b>. Если соединить такие таблицы и потом сложить выручку, заказ может посчитаться несколько раз. Поэтому перед JOIN важно понимать, сколько строк справа соответствует одной строке слева.</p>
<h3>Какие команды бывают</h3>
<div class="table-wrap"><table><thead><tr><th>Группа</th><th>Команды</th><th>Зачем аналитику</th></tr></thead><tbody>
<tr><td>Запросы</td><td><code>SELECT</code></td><td>достать срез, метрику, список</td></tr>
<tr><td>Изменение данных</td><td><code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code></td><td>исправить или загрузить данные</td></tr>
<tr><td>Схема</td><td><code>CREATE</code>, <code>ALTER</code>, <code>DROP</code></td><td>создать таблицу или колонку</td></tr>
<tr><td>Права</td><td><code>GRANT</code>, <code>REVOKE</code></td><td>выдать доступ коллеге или сервису</td></tr>
</tbody></table></div>
<p>В аналитике чаще всего используют <code>SELECT</code>, но понимать остальные команды полезно: данные часто нужно не только прочитать, но и проверить, обновить или объяснить, откуда они взялись.</p>
<h3>Какие бывают данные</h3>
<p>В таблицах встречаются числа, текст, даты и время, логические значения и JSON. Для денег используют точные десятичные типы, для измерений — приближённые. Отдельно стоит <code>NULL</code> — не ноль и не пустая строка, а отсутствие значения. Подробнее типы разобраны в <a href="#/theory/sql/2">следующей главе</a>.</p>
<div class="example"><b>Пример.</b> Запрос «выручка по городам без возвратов» читается почти как вопрос: <code>SELECT city, SUM(amount) FROM orders WHERE returned = 0 GROUP BY city;</code>. Сначала выбираем таблицу, потом фильтруем строки, затем группируем и считаем сумму.</div>
<div class="note"><b>Диалекты</b>Ядро SQL общее, но функции дат, строк и окон отличаются. Если запрос работает в PostgreSQL, это не значит, что он без изменений пойдёт в BigQuery или ClickHouse.</div>
`
      },
      {
        title: "Как устроен запрос",
        html: `
<p>Запрос удобнее читать, если помнить: вы пишете его сверху вниз, а база выполняет почти наоборот. Сначала она берёт таблицы, потом фильтрует строки, и только затем считает агрегаты. Шаблон выглядит так:</p>
<p>Дальше в примерах используется маленькая таблица <code>orders</code>. В ней одна строка — один заказ.</p>
<div class="table-wrap"><table><thead><tr><th>order_id</th><th>city</th><th>amount</th><th>returned</th></tr></thead><tbody>
<tr><td>1</td><td>Казань</td><td>1200</td><td>0</td></tr>
<tr><td>2</td><td>Казань</td><td>900</td><td>0</td></tr>
<tr><td>3</td><td>Москва</td><td>1500</td><td>0</td></tr>
<tr><td>4</td><td>Москва</td><td>700</td><td>1</td></tr>
<tr><td>5</td><td>Казань</td><td>1100</td><td>1</td></tr>
</tbody></table></div>

<div class="formula">SELECT [DISTINCT] столбцы
FROM таблица
[WHERE условие]
[GROUP BY поле]
[HAVING условие после группировки]
[ORDER BY поле [ASC | DESC]]
[LIMIT n];</div>
<p>Порядок выполнения отличается от порядка строк в запросе:</p>
<div class="formula">FROM → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT</div>
<figure class="figure"><svg viewBox="0 0 360 150" role="img" aria-label="Порядок выполнения SQL: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY и LIMIT"><g font-size="9" fill="currentColor" text-anchor="middle"><rect x="80" y="4" width="200" height="18" rx="5" fill="none" stroke="currentColor" opacity=".5"/><text x="180" y="17">FROM / JOIN</text><path d="M180 22v6" stroke="currentColor" opacity=".4"/><rect x="80" y="28" width="200" height="18" rx="5" fill="none" stroke="currentColor" opacity=".5"/><text x="180" y="41">WHERE</text><path d="M180 46v6" stroke="currentColor" opacity=".4"/><rect x="80" y="52" width="200" height="18" rx="5" fill="none" stroke="currentColor" opacity=".5"/><text x="180" y="65">GROUP BY</text><path d="M180 70v6" stroke="currentColor" opacity=".4"/><rect x="80" y="76" width="200" height="18" rx="5" fill="none" stroke="currentColor" opacity=".5"/><text x="180" y="89">HAVING</text><path d="M180 94v6" stroke="currentColor" opacity=".4"/><rect x="80" y="100" width="200" height="18" rx="5" fill="none" stroke="currentColor" opacity=".5"/><text x="180" y="113">SELECT</text><path d="M180 118v6" stroke="currentColor" opacity=".4"/><rect x="80" y="124" width="200" height="18" rx="5" fill="none" stroke="currentColor" opacity=".5"/><text x="180" y="137">ORDER BY / LIMIT</text></g></svg><figcaption>Запрос пишут сверху вниз, начиная с SELECT, но выполняют почти наоборот. Поэтому алиас из SELECT не виден в WHERE.</figcaption></figure>
<p>Отсюда два правила. Первое: псевдоним из SELECT не работает в WHERE — на момент фильтрации его ещё нет. Второе: LIMIT применяется последним, поэтому «первые 10 строк» без ORDER BY означают «какие попались».</p>
<p><b>SELECT *</b> удобен, когда вы впервые смотрите на таблицу. В постоянном запросе он может потянуть лишние столбцы и сломать зависимый код, когда в таблицу добавляют поле. Перечисляйте нужные столбцы явно.</p>
<div class="example"><b>Пример.</b> SELECT city, COUNT(*) AS orders FROM orders WHERE amount &gt; 1000 GROUP BY city HAVING COUNT(*) &gt;= 5 ORDER BY orders DESC LIMIT 3;</div>

<h3>Дополнительно: порядок выполнения и типичные ошибки</h3>
<p>Запрос пишется сверху вниз, но логически выполняется иначе. Псевдонимы из <code>SELECT</code> обычно ещё не существуют в <code>WHERE</code>, зато доступны в <code>ORDER BY</code>.</p>
<div class="table-wrap"><table><thead><tr><th>Шаг</th><th>Что происходит</th></tr></thead><tbody>
<tr><td>FROM / JOIN</td><td>Собираются строки и соединяются таблицы</td></tr>
<tr><td>WHERE</td><td>Фильтруются отдельные строки</td></tr>
<tr><td>GROUP BY</td><td>Строки собираются в группы</td></tr>
<tr><td>HAVING</td><td>Фильтруются уже группы</td></tr>
<tr><td>SELECT</td><td>Вычисляются выражения и псевдонимы</td></tr>
<tr><td>ORDER BY / LIMIT</td><td>Сортировка и ограничение результата</td></tr>
</tbody></table></div>
<pre><code>SELECT city, COUNT(*) AS orders
FROM orders
WHERE returned = 0
GROUP BY city
HAVING COUNT(*) &gt;= 3
ORDER BY orders DESC;</code></pre>
<p><code>WHERE</code> не может ссылаться на агрегат <code>COUNT(*)</code> — для этого нужен <code>HAVING</code>. А <code>COUNT(*)</code> считает строки, тогда как <code>COUNT(discount)</code> пропускает NULL: это разные вопросы к данным.</p>
`
      },
      {
        title: "Типы данных и фильтрация",
        html: `
<table>
<thead><tr><th>Тип</th><th>Что хранит</th><th>Пример</th></tr></thead>
<tbody>
<tr><td>INTEGER, BIGINT</td><td>целые числа</td><td>42</td></tr>
<tr><td>NUMERIC(p, s), DECIMAL</td><td>точные десятичные — для денег</td><td>1999.90</td></tr>
<tr><td>REAL, DOUBLE</td><td>приближённые дробные — для измерений</td><td>0.333333</td></tr>
<tr><td>VARCHAR(n), TEXT</td><td>строки</td><td>'Казань'</td></tr>
<tr><td>DATE</td><td>дата</td><td>'2026-05-01'</td></tr>
<tr><td>TIMESTAMP</td><td>дата и время</td><td>'2026-05-01 12:30:00'</td></tr>
<tr><td>BOOLEAN</td><td>истина или ложь</td><td>TRUE</td></tr>
</tbody>
</table>
<p>Тип столбца — не формальность. От него зависит, можно ли складывать значения, как сравнивать даты и не потеряются ли копейки. Деньги хранят в точном десятичном типе, а не в DOUBLE: иначе 1999,90 может превратиться в 1999,8999.</p>
<p><b>Операторы фильтрации.</b> Сравнения <code>=</code>, <code>&lt;&gt;</code>, <code>&lt;</code>, <code>&gt;</code>; диапазон <code>BETWEEN a AND b</code>; перечисление <code>IN (...)</code>; шаблон <code>LIKE</code>, где <code>%</code> — любая последовательность символов, <code>_</code> — ровно один символ.</p>
<div class="note"><b>NULL — это не значение, а отсутствие значения</b>Сравнение с NULL даёт не TRUE и не FALSE, а NULL. Поэтому <code>WHERE discount = NULL</code> не вернёт ничего, нужно <code>IS NULL</code>. И условие <code>discount &lt;&gt; 0</code> отбросит строки с NULL: неизвестно, равно ли неизвестное число нулю.</div>
<p>Приоритет операторов: сначала <code>NOT</code>, затем <code>AND</code>, затем <code>OR</code>. Поэтому смешивая <code>AND</code> и <code>OR</code>, ставьте скобки — иначе получите не тот фильтр, который имели в виду.</p>

<div class="example"><b>Пример.</b> Цены хранят в NUMERIC(10, 2), а не в REAL: 1999.90 не превращается в 1999.8999. Фильтр WHERE price > 1000 AND city = 'Казань' отбросит строки с NULL в city — для них условие не истинно, а неизвестно.</div>`
      },
      {
        title: "Группировка: COUNT, SUM, AVG",
        html: `
<p><b>GROUP BY</b> нужен, когда вопрос звучит как «сколько», «в среднем» или «максимум» по каждой группе. Агрегаты — <code>COUNT</code>, <code>SUM</code>, <code>AVG</code>, <code>MIN</code>, <code>MAX</code>. Внутри можно ставить <code>DISTINCT</code>: <code>COUNT(DISTINCT city)</code> считает уникальные города.</p>
<figure class="figure"><svg viewBox="0 0 360 112" role="img" aria-label="GROUP BY собирает строки в группы и считает агрегат"><g font-size="9" fill="currentColor"><text x="8" y="14">строки</text><rect x="8" y="22" width="150" height="20" rx="4" fill="currentColor" opacity=".08"/><text x="18" y="36">Казань · 1200</text><rect x="8" y="46" width="150" height="20" rx="4" fill="currentColor" opacity=".08"/><text x="18" y="60">Казань · 900</text><rect x="8" y="70" width="150" height="20" rx="4" fill="currentColor" opacity=".08"/><text x="18" y="84">Москва · 1500</text><text x="178" y="58" opacity=".7">→ GROUP BY city →</text><rect x="276" y="26" width="76" height="24" rx="5" fill="currentColor" opacity=".16"/><text x="314" y="42">Казань: 2</text><rect x="276" y="66" width="76" height="24" rx="5" fill="currentColor" opacity=".16"/><text x="314" y="82">Москва: 1</text></g></svg><figcaption>GROUP BY схлопывает строки в группы: три заказа превращаются в две строки результата — по одной на город.</figcaption></figure>
<p><b>COUNT(*) и COUNT(столбец).</b> Первый считает строки, второй — только непустые значения столбца. Разница равна числу NULL и часто оказывается главным открытием при знакомстве с таблицей.</p>
<p><b>GROUP BY.</b> Все столбцы в SELECT, не обёрнутые в агрегат, обязаны быть в GROUP BY. Иначе значение столбца в группе не определено.</p>
<div class="formula">SELECT city, COUNT(*) AS cnt, AVG(amount) AS avg_amount
FROM orders
WHERE amount &gt; 0
GROUP BY city
HAVING COUNT(*) &gt;= 10;</div>
<p><b>WHERE и HAVING.</b> WHERE фильтрует строки до группировки и не знает про агрегаты. HAVING фильтрует уже собранные группы. Поэтому «города с более чем 10 заказами» — это HAVING, а «заказы дороже 1000» — WHERE.</p>
<p><b>AVG игнорирует NULL</b> и делит на число непустых значений, а не на общее число строк. Если NULL означает ноль, сумму и среднее придётся считать по-разному: <code>SUM(COALESCE(x, 0))</code>.</p>

<div class="example"><b>Пример.</b> В таблице 1 000 строк, но COUNT(city) = 950: у 50 клиентов город не указан. GROUP BY city даёт по строке на город, а строки с NULL попадают в отдельную группу, и COUNT(*) в ней даст 50.</div>`
      },
      {
        title: "JOIN: как соединять таблицы",
        html: `
<p><b>JOIN</b> нужен, когда данные лежат в разных таблицах: пользователи в одной, заказы в другой. Соединение склеивает строки по общему ключу. Виды соединений:</p>
<table>
<thead><tr><th>Тип</th><th>Что остаётся</th></tr></thead>
<tbody>
<tr><td>INNER JOIN</td><td>только пары с совпадением в обеих таблицах</td></tr>
<tr><td>LEFT JOIN</td><td>все строки левой таблицы; где нет пары — NULL справа</td></tr>
<tr><td>RIGHT JOIN</td><td>все строки правой таблицы</td></tr>
<tr><td>FULL JOIN</td><td>все строки обеих таблиц</td></tr>
<tr><td>CROSS JOIN</td><td>декартово произведение: каждая с каждой</td></tr>
</tbody>
</table>
<div class="formula">SELECT u.city, COUNT(o.id) AS orders
FROM users AS u
LEFT JOIN orders AS o ON o.user_id = u.id
GROUP BY u.city;</div>
<p><b>Условие в ON и в WHERE.</b> Для LEFT JOIN это разные запросы. Условие в ON не отбрасывает пользователей без заказов — оно лишь ограничивает, что считать совпадением. Условие в WHERE отбрасывает: строка, где справа NULL, не проходит фильтр, и LEFT JOIN превращается во внутренний.</p>
<p><b>Размножение строк.</b> Соединение «многие ко многим» даёт произведение: две строки слева и три справа — шесть строк. Если после JOIN сумма выручки выросла, сначала проверьте, не задвоились ли строки. Помогает предварительная агрегация в подзапросе или проверка уникальности ключа.</p>
<p><b>COUNT(o.id) вместо COUNT(*)</b> в LEFT JOIN считает именно совпадения: NULL справа не учитывается. Это приём для «сколько у каждого пользователя заказов, включая ноль».</p>

<div class="example"><b>Пример.</b> 100 пользователей и 300 заказов. INNER JOIN вернёт только заказы с существующим пользователем, LEFT JOIN — все 300 заказов плюс пользователей без заказов с NULL в полях заказа. Пользователь без заказов в INNER-выборке исчезает.</div>
<div class="table-wrap"><table><thead><tr><th>user_id</th><th>name</th><th>order_id</th><th>amount</th></tr></thead><tbody><tr><td>1</td><td>Аня</td><td>101</td><td>1200</td></tr><tr><td>1</td><td>Аня</td><td>102</td><td>900</td></tr><tr><td>2</td><td>Борис</td><td>—</td><td>—</td></tr><tr><td>3</td><td>Вера</td><td>—</td><td>—</td></tr></tbody></table></div>`
      },
      {
        title: "JOIN на практике: пять запросов",
        html: `
<p>Синтаксис JOIN запоминается быстро. Сложности начинаются, когда нужно понять, сколько строк получится и не задвоилась ли сумма. Ниже пять типовых задач, с которых начинается почти любая работа с двумя таблицами.</p>
<h3>1. Сколько заказов у каждого пользователя</h3>
<p>Нужны все пользователи, включая тех, кто ещё ничего не купил. Значит, LEFT JOIN и <code>COUNT(o.id)</code>, а не <code>COUNT(*)</code>: у пользователя без заказов справа будет NULL, и <code>COUNT(*)</code> посчитает эту строку как один заказ.</p>
<div class="formula">SELECT u.name, COUNT(o.id) AS orders
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.name;</div>
<p>Если у пользователя три заказа, LEFT JOIN даст три строки, и GROUP BY свернёт их в одну. Но <code>COUNT(DISTINCT o.id)</code> нужен, если JOIN успел размножить заказы из-за ещё одного соединения.</p>
<h3>2. Пользователи без заказов</h3>
<p>После LEFT JOIN строки без пары имеют NULL в правой таблице. Их можно найти через <code>WHERE o.id IS NULL</code>. Это называют анти-джойном: «есть слева, нет справа».</p>
<div class="formula">SELECT u.*
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NULL;</div>
<p>Тот же результат даёт <code>NOT EXISTS</code>. Он обычно понятнее и безопаснее, если справа могут быть NULL.</p>
<h3>3. Заказы и город пользователя</h3>
<p>Если город хранится только в users, JOIN добавляет его к каждому заказу. Связь «один пользователь — много заказов» не размножает заказы: у одного заказа один пользователь.</p>
<div class="formula">SELECT o.id, o.amount, u.city
FROM orders o
JOIN users u ON u.id = o.user_id;</div>
<p>А вот если после этого присоединить таблицу позиций заказа, заказ начнёт повторяться по позициям. Тогда сумму по <code>orders.amount</code> считать уже нельзя — нужна отдельная агрегация.</p>
<h3>4. Self-join: сотрудники и руководители</h3>
<p>Иногда обе стороны соединения — одна и та же таблица. Например, у сотрудника есть <code>manager_id</code>, который ссылается на другого сотрудника. Нужны два псевдонима:</p>
<div class="formula">SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON m.id = e.manager_id;</div>
<p>Без псевдонимов база не поймёт, какой из двух экземпляров таблицы вы имеете в виду.</p>
<h3>5. Почему NOT IN иногда возвращает пусто</h3>
<p><code>WHERE user_id NOT IN (SELECT user_id FROM bans)</code> может вернуть ноль строк, если в <code>bans.user_id</code> есть NULL. Сравнение с NULL даёт «неизвестно», а не TRUE. Надёжнее <code>NOT EXISTS</code>.</p>
<div class="formula">SELECT u.* FROM users u
WHERE NOT EXISTS (SELECT 1 FROM bans b WHERE b.user_id = u.id);</div>
<div class="table-wrap"><table><thead><tr><th>Связь</th><th>Пример</th><th>Что проверить</th></tr></thead><tbody>
<tr><td>1:1</td><td>пользователь — профиль</td><td>ключ уникален с обеих сторон</td></tr>
<tr><td>1:N</td><td>пользователь — заказы</td><td>справа может быть много строк</td></tr>
<tr><td>N:N</td><td>заказы — товары</td><td>обычно нужна таблица-связка</td></tr>
</tbody></table></div>
<div class="note"><b>Проверка перед JOIN</b>Сравните <code>COUNT(*)</code> и <code>COUNT(DISTINCT key)</code> в обеих таблицах. Если ключ не уникален, сначала решите, как агрегировать справа, иначе строки и суммы размножатся.</div>
`
      },
      {
        title: "Подзапросы и CTE",
        html: `
<p><b>Подзапрос</b> — это запрос внутри другого запроса. Он может вернуть одно число, список значений или целую таблицу. <b>EXISTS</b> проверяет, есть ли хотя бы одна строка, и часто быстрее, чем <code>IN</code> с длинным списком.</p>
<div class="formula">SELECT * FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);</div>
<p><b>CTE</b> (общее табличное выражение) — именованный подзапрос перед основным:</p>
<div class="formula">WITH monthly AS (
  SELECT user_id, DATE_TRUNC('month', created_at) AS m, SUM(amount) AS total
  FROM orders GROUP BY 1, 2
)
SELECT * FROM monthly WHERE total &gt; 10000;</div>
<p>CTE читаются сверху вниз и позволяют разбить сложный запрос на шаги. Они не ускоряют запрос сами по себе — это инструмент читаемости, хотя в некоторых СУБД материализуются.</p>
<p><b>UNION и UNION ALL.</b> UNION склеивает результаты и удаляет дубликаты (это дороже), UNION ALL оставляет всё как есть. По умолчанию выбирайте UNION ALL и добавляйте DISTINCT только осознанно.</p>

<div class="example"><b>Пример.</b> CTE с суммой покупок по клиентам, затем SELECT из него клиентов с суммой выше 100 000 — читается сверху вниз, без вложенных скобок. EXISTS по индексу останавливается на первой найденной строке, а IN с длинным списком значений работает медленнее.</div>`
      },
      {
        title: "Оконные функции: считать, не сворачивая строки",
        html: `
<p>Оконная функция считает по группе строк, но, в отличие от <code>GROUP BY</code>, <b>не склеивает</b> их в одну. Результат просто добавляется к каждой строке — детализация остаётся.</p>
<div class="formula">функция(...) OVER (
  [PARTITION BY столбцы]
  [ORDER BY столбцы]
)</div>
<p><b>PARTITION BY</b> задаёт группы, внутри которых идёт расчёт, <b>ORDER BY</b> — порядок строк внутри группы. Без PARTITION BY окно — вся выборка.</p>
<div class="formula">SELECT id, city, amount,
       ROW_NUMBER() OVER (PARTITION BY city ORDER BY amount DESC) AS rn
FROM orders;</div>
<figure class="figure"><svg viewBox="0 0 360 116" role="img" aria-label="Оконная функция: нумерация строк внутри каждого города"><g font-size="9" fill="currentColor"><text x="12" y="14">PARTITION BY city</text><rect x="10" y="24" width="340" height="24" rx="4" fill="currentColor" opacity=".08"/><rect x="10" y="54" width="340" height="24" rx="4" fill="currentColor" opacity=".08"/><rect x="10" y="84" width="340" height="24" rx="4" fill="currentColor" opacity=".08"/><text x="24" y="40">Казань · 1200</text><text x="250" y="40">rn = 1</text><text x="24" y="70">Казань · 900</text><text x="250" y="70">rn = 2</text><text x="24" y="100">Москва · 1500</text><text x="250" y="100">rn = 1</text></g></svg><figcaption>PARTITION BY city делит строки на независимые группы, а ORDER BY amount DESC задаёт порядок внутри каждой. Строки при этом не исчезают.</figcaption></figure>
<div class="table-wrap"><table><thead><tr><th>city</th><th>amount</th><th>rn</th></tr></thead><tbody><tr><td>Казань</td><td>1200</td><td>1</td></tr><tr><td>Казань</td><td>900</td><td>2</td></tr><tr><td>Москва</td><td>1500</td><td>1</td></tr></tbody></table></div>
<p><b>Нумерация.</b> ROW_NUMBER выдаёт 1, 2, 3 без повторов даже при равных значениях. RANK при равенстве даёт одинаковый номер с пропуском (1, 1, 3), DENSE_RANK — без пропуска (1, 1, 2).</p>
<p><b>Смещение и накопление.</b> LAG и LEAD дают значение предыдущей или следующей строки — так считают прирост к прошлому периоду. <code>SUM(amount) OVER (PARTITION BY city ORDER BY created_at)</code> даёт накопительный итог.</p>
<p><b>Доля от целого.</b> <code>amount / SUM(amount) OVER (PARTITION BY city)</code> — доля строки в сумме по городу, без отдельного подзапроса и без потери детализации.</p>
<div class="note"><b>Классическая задача</b>«Топ-1 заказ в каждом городе»: пронумеровать строки внутри города и отфильтровать rn = 1. Фильтровать окно в WHERE нельзя — оно вычисляется после WHERE, поэтому нужен подзапрос или CTE.</div>

<div class="example"><b>Пример.</b> SUM(amount) OVER (PARTITION BY user_id ORDER BY dt) добавляет к каждому заказу накопленную сумму по клиенту: первая строка — сам заказ, вторая — сумма двух, третья — трёх. GROUP BY свернул бы заказы в одну строку и потерял детализацию.</div>`
      },
      {
        title: "Как разобраться в чужой таблице",
        html: `
<p>Незнакомая таблица — не повод сразу писать сложный JOIN. Сначала потратьте пять минут на разведку. Алгоритм:</p>
<ol>
<li>Вывести первые строки: <code>SELECT * FROM t LIMIT 10;</code></li>
<li>Оценить объём: <code>SELECT COUNT(*) FROM t;</code></li>
<li>Найти кандидатов в первичный ключ — столбцы, которые выглядят уникальными.</li>
<li>Проверить уникальность: <code>SELECT COUNT(*) AS rows, COUNT(DISTINCT id) AS uniq FROM t;</code> Если uniq меньше rows, ключ не уникален.</li>
</ol>
<p><b>Служебные таблицы.</b> В PostgreSQL и MySQL метаданные лежат в схеме information_schema: <code>information_schema.tables</code> — список таблиц, <code>information_schema.columns</code> — столбцы с типами. Это отвечает на вопрос «что вообще есть в базе» без чтения документации.</p>
<div class="formula">SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';</div>
<p><b>Профилирование столбца.</b> Минимум, максимум, число NULL и число уникальных значений дают представление о данных быстрее, чем сотня строк глазами:</p>
<div class="formula">SELECT COUNT(*) AS rows, COUNT(DISTINCT city) AS cities,
       COUNT(*) - COUNT(city) AS nulls
FROM orders;</div>
<p>Если в столбце внезапно 3 уникальных значения вместо 300, вероятно, часть данных потерялась при загрузке — и любой отчёт по этой таблице врёт.</p>

<div class="example"><b>Пример.</b> COUNT(*) = 1 000, COUNT(DISTINCT id) = 980 — значит, в столбце id есть дубли, и как первичный ключ он не годится. Следующий шаг — GROUP BY id HAVING COUNT(*) > 1, чтобы увидеть повторяющиеся записи.</div>`
      },
      {
        title: "Почему запрос медленный",
        html: `
  <p>Медленный запрос не всегда плохо написан. Сначала смотрят <b>план</b>: <code>EXPLAIN</code> показывает оценки, <code>EXPLAIN ANALYZE</code> — фактические строки и время. Если оценка сильно расходится с фактом, возможно, устарела статистика или соединение выбрано неудачно.</p>
  <div class="formula">EXPLAIN (ANALYZE, BUFFERS) SELECT ...
  Seq Scan → фильтр по всей таблице
  Index Scan → доступ по индексу</div>
<figure class="figure"><svg viewBox="0 0 360 104" role="img" aria-label="Seq Scan читает всю таблицу, Index Scan — только нужные строки"><g font-size="9" fill="currentColor" text-anchor="middle"><rect x="8" y="18" width="160" height="64" rx="7" fill="none" stroke="currentColor" opacity=".5"/><text x="88" y="36">Seq Scan</text><text x="88" y="52" opacity=".75">читает все строки</text><rect x="26" y="62" width="124" height="8" rx="4" fill="currentColor" opacity=".18"/><text x="88" y="86" opacity=".65">1000 строк</text><rect x="192" y="18" width="160" height="64" rx="7" fill="none" stroke="currentColor" opacity=".5"/><text x="272" y="36">Index Scan</text><text x="272" y="52" opacity=".75">идёт по индексу</text><rect x="210" y="62" width="16" height="8" rx="4" fill="currentColor" opacity=".55"/><text x="272" y="86" opacity=".65">10 строк</text></g></svg><figcaption>Индекс полезен, когда фильтр выбирает мало строк. Если условие обёрнуто в функцию, индекс по колонке может не сработать.</figcaption></figure>
  <p><b>Sargability</b>: индекс по колонке не поможет, если к ней применили функцию в условии — <code>date_trunc('day', created_at) = ...</code> часто читает всю таблицу. Переписывают в диапазон <code>created_at &gt;= ... AND created_at &lt; ...</code>.</p>
  <ul>
  <li>Индекс подбирают под фильтр, сортировку и join, а не «на всякий случай».</li>
  <li>Партиционирование помогает на больших диапазонах дат, но не заменяет индекс.</li>
  <li><code>SELECT *</code> тянет лишние столбцы и мешает covering index.</li>
  <li>Оконные функции и CTE могут материализоваться; проверяйте план, а не верьте синтаксису.</li>
  </ul>
  <div class="example"><b>Пример.</b> Отчёт по заказам за день шёл 40 секунд: условие оборачивало дату в функцию. Диапазон дат и индекс по <code>order_date</code> сократили до 0,8 секунды; <code>EXPLAIN ANALYZE</code> подтвердил переход с Seq Scan на Index Scan.</div>
  `
      },
      {
        title: "NULL и трёхзначная логика",
        html: `
<div class="note"><b>Простыми словами</b>NULL — не ноль и не пустая строка, а «значение неизвестно». Поэтому NULL не равен даже самому себе, а условие может быть не истинным и не ложным, а неизвестным.</div>
<p><b>Три состояния.</b> В SQL логическое выражение возвращает <code>TRUE</code>, <code>FALSE</code> или <code>UNKNOWN</code>. <code>WHERE</code> оставляет только строки, где условие истинно; <code>UNKNOWN</code> отбрасывается так же, как ложь.</p>
<div class="table-wrap"><table><thead><tr><th>Выражение</th><th>Результат</th></tr></thead><tbody>
<tr><td><code>NULL = NULL</code></td><td><code>UNKNOWN</code></td></tr>
<tr><td><code>NULL &lt;&gt; 5</code></td><td><code>UNKNOWN</code></td></tr>
<tr><td><code>TRUE AND UNKNOWN</code></td><td><code>UNKNOWN</code></td></tr>
<tr><td><code>FALSE AND UNKNOWN</code></td><td><code>FALSE</code></td></tr>
<tr><td><code>TRUE OR UNKNOWN</code></td><td><code>TRUE</code></td></tr>
</tbody></table></div>
<figure class="figure"><svg viewBox="0 0 360 94" role="img" aria-label="NULL не равен NULL: сравнение даёт UNKNOWN"><g font-size="9" fill="currentColor" text-anchor="middle"><rect x="8" y="24" width="92" height="34" rx="6" fill="none" stroke="currentColor" opacity=".5"/><text x="54" y="45">NULL</text><text x="112" y="45">=</text><rect x="126" y="24" width="92" height="34" rx="6" fill="none" stroke="currentColor" opacity=".5"/><text x="172" y="45">NULL</text><text x="230" y="45">→</text><rect x="244" y="24" width="108" height="34" rx="6" fill="currentColor" opacity=".1"/><text x="298" y="45">UNKNOWN</text><text x="180" y="80" opacity=".65">NULL проверяют через IS NULL, а не через =</text></g></svg><figcaption>Сравнение с NULL не доказывает ни равенство, ни неравенство. Для проверки используют IS NULL и IS NOT NULL.</figcaption></figure>
<p><b>Где это ломает отчёты.</b> <code>WHERE discount != 10</code> не вернёт строки, где <code>discount IS NULL</code>. <code>NOT IN (SELECT ...)</code> с NULL в подзапросе может вернуть пустой результат. Для анти-джойна надёжнее <code>NOT EXISTS</code>:</p>
<pre><code>SELECT u.id
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
);</code></pre>
<p><b>Агрегаты и NULL.</b> <code>COUNT(*)</code> считает строки, <code>COUNT(col)</code> — только непустые значения. <code>SUM</code>, <code>AVG</code>, <code>MIN</code> и <code>MAX</code> пропускают NULL; <code>AVG</code> делит на число непустых значений, а не всех строк.</p>
<p><b>Подстановка значений.</b> <code>COALESCE(col, 0)</code> возвращает первое непустое значение, <code>NULLIF(x, 0)</code> превращает ноль в NULL — удобно перед делением. Но подстановка меняет смысл: «нет данных» и «ноль» — разные вещи, поэтому решение фиксируют в определении метрики.</p>
<div class="example"><b>Пример.</b> Средний чек по заказам со скидкой: <code>AVG(amount)</code> по строкам, где <code>discount IS NOT NULL</code>. Если заменить NULL на 0 через COALESCE, среднее изменится и перестанет отвечать на исходный вопрос.</div>
<div class="note"><b>Совет</b>Проверяя отчёт, отдельно посчитайте <code>COUNT(*)</code> и <code>COUNT(ключевой_столбец)</code>. Разница показывает, сколько строк выпадет из метрик, где NULL не учитывается.</div>
`
      },
      {
        title: "Даты, время и границы периода",
        html: `
<div class="note"><b>Простыми словами</b>Период — это не «февраль», а конкретный полуинтервал времени: от начала месяца включительно до начала следующего месяца не включая. Такой интервал не теряет и не задваивает события на границе.</div>
<p><b>Типы.</b> <code>DATE</code> хранит дату, <code>TIMESTAMP</code> — дату и время без часового пояса, <code>TIMESTAMPTZ</code> в PostgreSQL — момент времени с учётом зоны. Для событий, которые происходят в разных регионах, обычно нужен timestamp с зоной; для календарных дней — date.</p>
<div class="table-wrap"><table><thead><tr><th>Задача</th><th>Безопасный приём</th></tr></thead><tbody>
<tr><td>Заказы за февраль</td><td><code>ts &gt;= '2026-02-01' AND ts &lt; '2026-03-01'</code></td></tr>
<tr><td>Начало месяца</td><td><code>date_trunc('month', ts)</code></td></tr>
<tr><td>Последние 7 дней</td><td><code>ts &gt;= current_date - interval '7 days'</code></td></tr>
<tr><td>Местное время</td><td><code>ts AT TIME ZONE 'Europe/Moscow'</code></td></tr>
</tbody></table></div>
<figure class="figure"><svg viewBox="0 0 360 96" role="img" aria-label="Полуинтервал периода: начало включительно, следующий месяц не включая"><g font-size="9" fill="currentColor"><line x1="20" y1="52" x2="340" y2="52" stroke="currentColor" opacity=".35"/><rect x="82" y="44" width="176" height="16" rx="4" fill="currentColor" opacity=".15"/><text x="82" y="34">1 февраля</text><text x="258" y="34">1 марта</text><text x="82" y="78">включительно</text><text x="258" y="78">не включая</text><text x="18" y="78" opacity=".6">31 января</text><text x="310" y="78" opacity=".6">2 марта</text></g></svg><figcaption>Полуинтервал <code>[начало; следующее начало)</code> покрывает месяц без двойного учёта события ровно в полночь.</figcaption></figure>
<p><b>Почему не BETWEEN.</b> <code>BETWEEN '2026-02-01' AND '2026-02-28'</code> для timestamp часто теряет события 28 февраля после 00:00. Если очень нужен BETWEEN, берите конец периода как <code>&lt; следующий день</code>, а не «последний день месяца».</p>
<p><b>Часовые пояса.</b> Один и тот же момент в Москве и Лондоне — разные локальные даты. Сначала решите, по какой зоне считается день в отчёте, затем применяйте <code>AT TIME ZONE</code>. Иначе ночные заказы попадут не в тот день, а «сегодня» у аналитика и у базы разойдутся.</p>
<div class="example"><b>Пример.</b> Отчёт по дням: <code>SELECT date_trunc('day', created_at AT TIME ZONE 'Europe/Moscow') AS day, COUNT(*) ...</code>. Если убрать приведение зоны, сервер посчитает дни по UTC и вечерние заказы уедут в следующий день.</div>
<div class="note"><b>Совет</b>Для каждого отчёта зафиксируйте три вещи: часовой пояс, границы периода и включает ли конец периода последнюю секунду. Эти три строки в определении метрики предотвращают большинство расхождений.</div>
`
      },
      {
        title: "UNION, CASE и условные агрегаты",
        html: `
<div class="note"><b>Простыми словами</b>UNION склеивает строки, CASE выбирает значение по условию, а условный агрегат превращает строки в колонки. Вместе они позволяют собрать сводку без Excel.</div>
<p><b>Операции над результатами.</b> <code>UNION</code> склеивает два запроса и удаляет дубликаты, <code>UNION ALL</code> оставляет все строки. <code>INTERSECT</code> возвращает общие строки, <code>EXCEPT</code> — строки первого запроса, которых нет во втором. Количество и типы столбцов должны совпадать.</p>
<div class="table-wrap"><table><thead><tr><th>Операция</th><th>Что оставляет</th><th>Когда нужна</th></tr></thead><tbody>
<tr><td><code>UNION ALL</code></td><td>Все строки</td><td>Склеить периоды или источники</td></tr>
<tr><td><code>UNION</code></td><td>Уникальные строки</td><td>Убрать повторы, если это действительно нужно</td></tr>
<tr><td><code>INTERSECT</code></td><td>Совпадения</td><td>Найти общих клиентов</td></tr>
<tr><td><code>EXCEPT</code></td><td>Только слева</td><td>Сравнить две выгрузки</td></tr>
</tbody></table></div>
<p><b>CASE.</b> Выражение <code>CASE WHEN ... THEN ... ELSE ... END</code> работает как if. Его можно использовать в SELECT, WHERE, ORDER BY и внутри агрегата.</p>
<pre><code>SELECT
  SUM(CASE WHEN channel = 'ads' THEN revenue ELSE 0 END) AS ads,
  SUM(CASE WHEN channel = 'organic' THEN revenue ELSE 0 END) AS organic
FROM orders
WHERE returned = 0;</code></pre>
<figure class="figure"><svg viewBox="0 0 360 96" role="img" aria-label="Условный агрегат превращает строки каналов в колонки"><g font-size="8.5" fill="currentColor" text-anchor="middle"><rect x="6" y="18" width="98" height="52" rx="5" fill="none" stroke="currentColor" opacity=".45"/><text x="55" y="34">ads</text><text x="55" y="48">organic</text><text x="55" y="62">ads</text><text x="132" y="46">→</text><rect x="158" y="18" width="190" height="52" rx="5" fill="currentColor" opacity=".1"/><text x="253" y="34">ads | organic</text><text x="253" y="52">сумма | сумма</text><text x="253" y="68" opacity=".65">одна строка вместо списка</text></g></svg><figcaption>CASE внутри SUM не сворачивает строки заранее: каждая строка попадает в свою колонку, а SUM складывает только нужные значения.</figcaption></figure>
<p><b>Не склеивайте без нужды.</b> Если нужны разные агрегаты по одним данным, обычно лучше условные агрегаты, чем три запроса с UNION ALL. Если объединяете периоды, заранее приведите колонки к одному порядку и типу.</p>
<div class="example"><b>Пример.</b> Сводка «канал × месяц»: <code>SUM(CASE WHEN channel = 'ads' THEN revenue ELSE 0 END)</code> по месяцам. Один проход по таблице вместо отдельного запроса на каждый канал.</div>
<div class="note"><b>Совет</b>Для проверки двух выгрузок используйте <code>EXCEPT</code> в обе стороны. Если оба результата пусты, наборы строк совпадают; если нет — вы увидите конкретные расхождения, а не «где-то не сходится».</div>
`
      },
      {
        title: "Проверка качества данных запросами",
        html: `
<div class="note"><b>Простыми словами</b>Перед отчётом проверяют не «выглядит ли красиво», а конкретные свойства: ключ уникален, обязательные поля заполнены, даты в разумном диапазоне, связи не потеряны.</div>
<p><b>Пять базовых проверок.</b> Они занимают минуты, но ловят большинство ошибок, которые потом выглядят как «странная метрика».</p>
<div class="table-wrap"><table><thead><tr><th>Проверка</th><th>Запрос</th><th>Что означает</th></tr></thead><tbody>
<tr><td>Дубли ключа</td><td><code>GROUP BY id HAVING COUNT(*) &gt; 1</code></td><td>Строка задваивается</td></tr>
<tr><td>Пропуски</td><td><code>COUNT(*) - COUNT(col)</code></td><td>NULL в обязательном поле</td></tr>
<tr><td>Сироты</td><td><code>LEFT JOIN ... WHERE right.id IS NULL</code></td><td>Нет родительской записи</td></tr>
<tr><td>Диапазон дат</td><td><code>MIN(ts), MAX(ts)</code></td><td>Данные не за период</td></tr>
<tr><td>Сверка сумм</td><td><code>SUM(amount)</code> в двух источниках</td><td>Расхождение выручки</td></tr>
</tbody></table></div>
<figure class="figure"><svg viewBox="0 0 360 92" role="img" aria-label="Проверка данных: ключ, пропуски, связи, диапазоны, сверка"><g font-size="8" fill="currentColor" text-anchor="middle"><rect x="4" y="24" width="58" height="34" rx="5" fill="none" stroke="currentColor" opacity=".45"/><text x="33" y="39">ключ</text><text x="33" y="51" opacity=".65">дубли</text><text x="70" y="45">→</text><rect x="78" y="24" width="58" height="34" rx="5" fill="none" stroke="currentColor" opacity=".45"/><text x="107" y="39">NULL</text><text x="107" y="51" opacity=".65">пропуски</text><text x="144" y="45">→</text><rect x="152" y="24" width="58" height="34" rx="5" fill="none" stroke="currentColor" opacity=".45"/><text x="181" y="39">связи</text><text x="181" y="51" opacity=".65">сироты</text><text x="218" y="45">→</text><rect x="226" y="24" width="58" height="34" rx="5" fill="none" stroke="currentColor" opacity=".45"/><text x="255" y="39">даты</text><text x="255" y="51" opacity=".65">период</text><text x="292" y="45">→</text><rect x="300" y="24" width="56" height="34" rx="5" fill="currentColor" opacity=".1"/><text x="328" y="39">суммы</text><text x="328" y="51" opacity=".65">сверка</text></g></svg><figcaption>Проверки идут от структуры к смыслу: сначала ключи и связи, затем диапазоны и итоговые суммы.</figcaption></figure>
<pre><code>-- дубли ключа
SELECT order_id, COUNT(*) AS n
FROM orders
GROUP BY order_id
HAVING COUNT(*) &gt; 1;

-- сироты: заказы без пользователя
SELECT o.order_id
FROM orders o
LEFT JOIN users u ON u.id = o.user_id
WHERE u.id IS NULL;</code></pre>
<p><b>Сверка двух источников.</b> Сравнивайте не только итог, но и набор ключей: <code>EXCEPT</code> покажет строки, которые есть в одном источнике и отсутствуют в другом. Совпавшая сумма при разных наборах строк — плохой знак.</p>
<div class="note"><b>Важно</b>Зелёная проверка не доказывает, что данные правильные. Она доказывает только, что выбранное свойство выполнено. Определение метрики, период и источник всё равно нужно фиксировать отдельно.</div>
<div class="example"><b>Пример.</b> Выручка в SQL 268 100 ₽, в дашборде 296 700 ₽. Сначала проверяют дубли заказов и фильтр возвратов, затем период и валюту. Только после этого ищут «ошибку в BI».</div>
`
      },
      {
        title: "Транзакции и безопасные изменения",
        html: `
<div class="note"><b>Простыми словами</b>Транзакция — набор изменений, который применяется целиком или не применяется вообще. Это защита от ситуации «обновили половину строк и остановились».</div>
<p><b>Запись в базу.</b> <code>INSERT</code> добавляет строки, <code>UPDATE</code> меняет, <code>DELETE</code> удаляет. Аналитик чаще работает в режиме чтения, но иногда нужно загрузить справочник или исправить тестовые данные. В рабочей базе такие операции должны быть согласованы с владельцем.</p>
<div class="table-wrap"><table><thead><tr><th>Команда</th><th>Риск</th><th>Защита</th></tr></thead><tbody>
<tr><td><code>INSERT</code></td><td>Дубли и неверные типы</td><td>Ключи, проверка схемы, тестовая таблица</td></tr>
<tr><td><code>UPDATE</code></td><td>Затронуты лишние строки</td><td><code>WHERE</code>, <code>SELECT</code> с тем же условием, транзакция</td></tr>
<tr><td><code>DELETE</code></td><td>Удалено больше, чем нужно</td><td>Архив, ограничение по ключу, транзакция</td></tr>
</tbody></table></div>
<pre><code>BEGIN;
UPDATE orders
SET status = 'cancelled'
WHERE order_id = 42 AND status = 'new';
-- проверьте, что изменилась ровно одна строка
COMMIT;</code></pre>
<figure class="figure"><svg viewBox="0 0 360 92" role="img" aria-label="Транзакция: BEGIN, изменения, COMMIT или ROLLBACK"><g font-size="9" fill="currentColor" text-anchor="middle"><rect x="6" y="28" width="76" height="34" rx="5" fill="none" stroke="currentColor" opacity=".45"/><text x="44" y="48">BEGIN</text><text x="92" y="49">→</text><rect x="102" y="28" width="92" height="34" rx="5" fill="currentColor" opacity=".1"/><text x="148" y="48">изменения</text><text x="204" y="49">→</text><rect x="216" y="6" width="136" height="26" rx="5" fill="none" stroke="currentColor" opacity=".45"/><text x="284" y="23">COMMIT — сохранить</text><rect x="216" y="58" width="136" height="26" rx="5" fill="none" stroke="currentColor" opacity=".45"/><text x="284" y="75">ROLLBACK — отменить</text></g></svg><figcaption>До COMMIT изменения можно отменить. После COMMIT они становятся видимыми другим и откат требует отдельного решения.</figcaption></figure>
<p><b>Уровни изоляции</b> определяют, какие параллельные изменения видны транзакции. Чем слабее изоляция, тем выше скорость и тем больше риск прочитать несогласованные данные. Для аналитических выгрузок часто используют согласованный снимок или read-only транзакцию.</p>
<p><b>Перед UPDATE или DELETE</b> выполните тот же <code>SELECT</code> с <code>WHERE</code>, посмотрите количество строк и сохраните его. Проверьте, что условие однозначно, а ключ уникален. В PostgreSQL помогает <code>RETURNING</code>, в других СУБД — отдельный SELECT до и после.</p>
<div class="note"><b>Совет</b>Не выполняйте <code>UPDATE</code> или <code>DELETE</code> без <code>WHERE</code> в общей базе. Если сомневаетесь, начните транзакцию, проверьте строки и сделайте <code>ROLLBACK</code>; это дешевле восстановления из резервной копии.</div>
`
      }
    ],
    quiz: [
      {
        q: "На каком этапе выполняется HAVING?",
        options: [
          "После GROUP BY и до SELECT",
          "До WHERE, самым первым",
          "После ORDER BY",
          "Вместо WHERE, если есть агрегаты"
        ],
        correct: 0,
        explain: "Логический порядок: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. HAVING работает с уже собранными группами."
      },
      {
        q: "Чем WHERE отличается от HAVING?",
        options: [
          "WHERE фильтрует строки до группировки, HAVING — группы после",
          "WHERE работает только с числами, HAVING — с текстом",
          "Разницы нет, это синонимы",
          "HAVING применяется только с JOIN"
        ],
        correct: 0,
        explain: "WHERE не знает про агрегаты. Условие на COUNT(*) или SUM() ставится в HAVING."
      },
      {
        q: "В таблице 100 строк, в столбце discount 12 значений NULL. Что вернёт COUNT(discount)?",
        options: ["88", "100", "12", "0"],
        correct: 0,
        explain: "COUNT(столбец) считает только непустые значения: 100 − 12 = 88. COUNT(*) вернул бы 100."
      },
      {
        q: "LEFT JOIN users и orders. Что окажется в столбцах orders для пользователя без заказов?",
        options: ["NULL во всех столбцах orders", "Строка не попадёт в результат", "Нули", "Ошибка соединения"],
        correct: 0,
        explain: "LEFT JOIN сохраняет все строки левой таблицы и подставляет NULL там, где пары нет."
      },
      {
        q: "SELECT city, COUNT(*) FROM t GROUP BY city. Почему нельзя добавить в SELECT столбец amount без агрегата?",
        options: [
          "Значение не определено в группе: в ней много разных amount",
          "СУБД не поддерживает более двух столбцов",
          "amount нужно добавить в HAVING",
          "Можно, если добавить DISTINCT"
        ],
        correct: 0,
        explain: "Все неагрегированные столбцы обязаны быть в GROUP BY — иначе непонятно, какое из значений группы выводить."
      },
      {
        q: "Что найдёт условие LIKE '%ов'?",
        options: [
          "Строки, заканчивающиеся на «ов»",
          "Строки, начинающиеся на «ов»",
          "Строки, содержащие «ов» в любом месте",
          "Строки ровно из двух символов"
        ],
        correct: 0,
        explain: "% — любая последовательность символов. Знак в начале шаблона означает «заканчивается на»."
      },
      {
        q: "Почему условие WHERE cnt = 1 не работает, если cnt — это алиас COUNT(*)?",
        options: [
          "WHERE вычисляется до агрегации, алиаса ещё не существует",
          "Алиасы нельзя использовать в SQL вообще",
          "COUNT(*) нельзя сравнивать с числом",
          "Работает, но только в PostgreSQL"
        ],
        correct: 0,
        explain: "На момент WHERE агрегаты не посчитаны. Нужен HAVING (или подзапрос)."
      },
      {
        q: "Чем UNION отличается от UNION ALL?",
        options: [
          "UNION удаляет дубликаты, UNION ALL оставляет все строки",
          "UNION работает только с числами",
          "UNION ALL сортирует результат",
          "Разницы нет"
        ],
        correct: 0,
        explain: "UNION делает дополнительную работу по дедупликации и потому дороже. По умолчанию берут UNION ALL."
      },
      {
        q: "SUM(x) OVER (PARTITION BY city) в отличие от SUM(x) с GROUP BY…",
        options: [
          "не схлопывает строки: результат добавляется к каждой строке",
          "считает только уникальные значения",
          "работает быстрее в любом случае",
          "требует обязательного ORDER BY"
        ],
        correct: 0,
        explain: "Оконная функция сохраняет детализацию: строк столько же, сколько было, плюс новый столбец."
      },
      {
        q: "Что произойдёт при INNER JOIN двух таблиц со связью «многие ко многим»?",
        options: [
          "Число строк может вырасти: каждая с каждой",
          "Число строк всегда уменьшится",
          "Появится ошибка",
          "Число строк останется прежним"
        ],
        correct: 0,
        explain: "Соединение даёт декартово произведение совпавших групп. Отсюда типичное задвоение сумм после JOIN."
      },
      {
        q: "Запрос WHERE user_id NOT IN (SELECT user_id FROM bans) вернул 0 строк, хотя банов мало. В чём причина?",
        options: [
          "В подзапросе есть NULL: NOT IN с NULL не возвращает ничего",
          "Нужно было использовать JOIN",
          "Таблица bans пустая",
          "Слишком маленькая выборка"
        ],
        correct: 0,
        explain: "Любое сравнение с NULL даёт неизвестно; для анти-джойна надёжнее NOT EXISTS."
      },
      {
        q: "Нужно оставить последний заказ каждого клиента. Какой инструмент уместнее?",
        options: [
          "Оконная функция ROW_NUMBER() с разбиением по клиенту и сортировкой по дате",
          "GROUP BY client_id с MAX(дата)",
          "DISTINCT по client_id",
          "LIMIT 1"
        ],
        correct: 0,
        explain: "ROW_NUMBER нумерует строки внутри группы; берут строку с номером 1. MAX(дата) без join теряет остальные поля заказа."
      },
      {
        q: "Что показывает EXPLAIN ANALYZE?",
        options: [
          "Фактический план, число строк и время выполнения",
          "Только синтаксис запроса",
          "Содержимое таблицы",
          "Права пользователя"
        ],
        correct: 0,
        explain: "ANALYZE выполняет запрос и добавляет фактические метрики к плану."
      },
      {
        q: "Почему условие с функцией по индексированной колонке может быть медленным?",
        options: [
          "Функция мешает использовать индекс по колонке",
          "Функция всегда возвращает NULL",
          "Индекс перестаёт обновляться",
          "СУБД удаляет индекс"
        ],
        correct: 0,
        explain: "Sargability теряется: СУБД не может сопоставить вычисленное значение с индексом."
      },
      {
        q: "Что означает, что SQL — декларативный язык?",
        options: [
          "Вы описываете, что получить, а СУБД решает, как это сделать",
          "Запрос выполняется только вручную",
          "В SQL нельзя использовать условия",
          "Данные хранятся только в текстовом виде"
        ],
        correct: 0,
        explain: "SQL описывает результат. План выполнения — последовательность сканирований и соединений — выбирает СУБД."
      },
      {
        q: "Чем внешний ключ отличается от первичного?",
        options: [
          "Первичный уникально определяет строку, внешний ссылается на строку в другой таблице",
          "Внешний ключ всегда уникален, а первичный — нет",
          "Это одно и то же",
          "Внешний ключ бывает только у текстовых полей"
        ],
        correct: 0,
        explain: "Primary key уникален внутри своей таблицы; foreign key связывает строку с записью в другой таблице."
      },
      {
        q: "В LEFT JOIN users → orders у пользователя нет заказов. Что вернёт COUNT(*) и COUNT(o.id)?",
        options: [
          "COUNT(*) — 1, COUNT(o.id) — 0",
          "Оба — 1",
          "Оба — 0",
          "COUNT(*) — 0, COUNT(o.id) — 1"
        ],
        correct: 0,
        explain: "LEFT JOIN сохраняет пользователя, поэтому COUNT(*) считает строку, а COUNT(o.id) пропускает NULL справа."
      },
      {
        q: "Почему NOT IN с подзапросом иногда возвращает пустой результат?",
        options: [
          "В подзапросе есть NULL: сравнение с ним даёт «неизвестно»",
          "NOT IN не поддерживается в SQL",
          "Подзапрос всегда должен быть пустым",
          "Нужно обязательно использовать RIGHT JOIN"
        ],
        correct: 0,
        explain: "Если в списке есть NULL, NOT IN не может доказать истинность условия. Надёжнее NOT EXISTS или анти-джойн."
      },
      {
        q: "Что вернёт выражение NULL = NULL в SQL?",
        options: [
          "UNKNOWN, а не TRUE",
          "TRUE",
          "FALSE",
          "Ошибку синтаксиса"
        ],
        correct: 0,
        explain: "NULL означает неизвестное значение. Сравнение с ним даёт UNKNOWN; для проверки используют IS NULL."
      },
      {
        q: "В таблице 10 строк, в колонке discount у 4 строк NULL. Что вернут COUNT(*) и COUNT(discount)?",
        options: [
          "COUNT(*) — 10, COUNT(discount) — 6",
          "Оба — 10",
          "Оба — 6",
          "COUNT(*) — 6, COUNT(discount) — 10"
        ],
        correct: 0,
        explain: "COUNT(*) считает строки, а COUNT(col) пропускает NULL. Разница показывает число пропусков."
      },
      {
        q: "Чем опасен NOT IN с подзапросом, где встречается NULL?",
        options: [
          "Сравнение с NULL даёт UNKNOWN, и результат может оказаться пустым",
          "NOT IN всегда удаляет таблицу",
          "Подзапрос обязан возвращать больше одной колонки",
          "Он работает только с числами"
        ],
        correct: 0,
        explain: "При NULL в списке NOT IN не может доказать истинность. Надёжнее NOT EXISTS или анти-джойн."
      },
      {
        q: "Как безопаснее всего задать февральский период для timestamp?",
        options: [
          "created_at >= '2026-02-01' AND created_at < '2026-03-01'",
          "created_at BETWEEN '2026-02-01' AND '2026-02-28'",
          "MONTH(created_at) = 2",
          "created_at = '2026-02-01'"
        ],
        correct: 0,
        explain: "Полуинтервал включает начало и не включает следующее начало, поэтому не теряет и не задваивает события на границе."
      },
      {
        q: "Зачем в отчёте по дням явно указывать часовой пояс?",
        options: [
          "Иначе один момент времени попадёт в разные календарные дни",
          "Иначе SQL перестанет считать строки",
          "Часовой пояс нужен только для текстовых полей",
          "Это ускоряет любой запрос"
        ],
        correct: 0,
        explain: "День зависит от зоны: вечерний заказ в Москве может быть другим днём по UTC. Зону фиксируют в определении отчёта."
      },
      {
        q: "Чем UNION ALL отличается от UNION?",
        options: [
          "UNION ALL оставляет все строки, UNION удаляет дубликаты",
          "UNION ALL работает только с числами",
          "UNION всегда быстрее",
          "Они полностью одинаковы"
        ],
        correct: 0,
        explain: "Дедупликация в UNION стоит дополнительной работы. Если повторы допустимы, выбирают UNION ALL."
      },
      {
        q: "Как одной строкой посчитать выручку отдельно по каналам ads и organic?",
        options: [
          "SUM(CASE WHEN channel = 'ads' THEN revenue ELSE 0 END) и SUM(CASE WHEN channel = 'organic' THEN revenue ELSE 0 END)",
          "SELECT revenue FROM orders",
          "ORDER BY channel",
          "COUNT(DISTINCT channel)"
        ],
        correct: 0,
        explain: "Условный агрегат относит каждую строку в нужную колонку и суммирует только подходящие значения."
      },
      {
        q: "Как найти заказы без существующего пользователя?",
        options: [
          "LEFT JOIN users и фильтр WHERE users.id IS NULL",
          "INNER JOIN users",
          "ORDER BY user_id",
          "COUNT(*) без JOIN"
        ],
        correct: 0,
        explain: "LEFT JOIN сохраняет заказы без пары, а IS NULL оставляет именно сирот."
      },
      {
        q: "Что произойдёт при UPDATE orders SET status = 'cancelled' без WHERE?",
        options: [
          "Изменится каждая строка таблицы",
          "Изменится только первая строка",
          "СУБД попросит подтверждение",
          "Запрос выполнится только для NULL"
        ],
        correct: 0,
        explain: "UPDATE без WHERE применяется ко всей таблице. Перед изменением проверяют условие и число строк."
      },
      {
        q: "Что делает ROLLBACK в транзакции?",
        options: [
          "Отменяет изменения текущей транзакции",
          "Сохраняет изменения навсегда",
          "Удаляет таблицу",
          "Создаёт резервную копию"
        ],
        correct: 0,
        explain: "ROLLBACK откатывает изменения до BEGIN. COMMIT, наоборот, фиксирует их."
      }
    ],
    terms: [
      { term: "SELECT", def: "Какие столбцы и выражения вернуть." },
      { term: "FROM / JOIN", def: "Откуда берутся строки и как соединяются таблицы." },
      { term: "WHERE", def: "Фильтр отдельных строк до группировки." },
      { term: "GROUP BY", def: "Собирает строки в группы по одинаковым значениям." },
      { term: "HAVING", def: "Фильтр уже собранных групп, обычно по агрегату." },
      { term: "NULL", def: "Не значение, а отсутствие значения. Сравнение с NULL даёт «неизвестно»." },
      { term: "Агрегат", def: "Функция, которая сворачивает много строк в одно число: COUNT, SUM, AVG." },
      { term: "INNER JOIN", def: "Оставляет только строки, у которых есть пара в обеих таблицах." },
      { term: "LEFT JOIN", def: "Оставляет все строки левой таблицы, а справа подставляет NULL, если пары нет." },
      { term: "Подзапрос", def: "Запрос внутри другого запроса. Может возвращать число, список или таблицу." },
      { term: "CTE", def: "Именованный подзапрос перед основным запросом. Помогает разбить сложный SQL на шаги." },
      { term: "Оконная функция", def: "Считает по группе строк, но не сворачивает их: результат добавляется к каждой строке." },
      { term: "PARTITION BY", def: "Делит строки на независимые группы для оконной функции." },
      { term: "ROW_NUMBER", def: "Нумерует строки внутри окна: 1, 2, 3 без повторов." },
      { term: "EXPLAIN", def: "Показывает план запроса: какие сканирования и соединения выбрала СУБД." },
      { term: "Индекс", def: "Структура для быстрого поиска строк по колонке. Ускоряет чтение, но занимает место." },
      { term: "Sargability", def: "Возможность использовать индекс в условии. Функция по колонке часто её ломает." },
      { term: "UNION ALL", def: "Склеивает результаты двух запросов и оставляет все строки, включая повторы." },
      { term: "Первичный ключ", def: "Поле или набор полей, которые уникально определяют строку таблицы." },
      { term: "Внешний ключ", def: "Поле, которое ссылается на ключ в другой таблице и задаёт связь." },
      { term: "Кардинальность", def: "Сколько строк одной таблицы соответствует одной строке другой: 1:1, 1:N или N:N." },
      { term: "Анти-джойн", def: "Поиск строк, для которых нет пары в другой таблице: LEFT JOIN + IS NULL или NOT EXISTS." },
      { term: "UNKNOWN", def: "Третье логическое состояние SQL: условие нельзя признать ни истинным, ни ложным." },
      { term: "COALESCE", def: "Возвращает первое непустое значение из списка." },
      { term: "NULLIF", def: "Возвращает NULL, если два значения равны; удобен перед делением." },
      { term: "TIMESTAMPTZ", def: "Момент времени с учётом часового пояса." },
      { term: "date_trunc", def: "Округляет дату или время до начала периода: дня, месяца, года." },
      { term: "AT TIME ZONE", def: "Переводит timestamp между часовыми поясами." },
      { term: "INTERSECT", def: "Оставляет строки, которые есть в обоих результатах." },
      { term: "EXCEPT", def: "Оставляет строки первого результата, которых нет во втором." },
      { term: "Условный агрегат", def: "SUM или COUNT с CASE внутри: строки распределяются по колонкам." },
      { term: "Транзакция", def: "Набор изменений, который применяется целиком или отменяется." },
      { term: "ROLLBACK", def: "Отмена изменений текущей транзакции." },
      { term: "COMMIT", def: "Фиксация изменений транзакции." },
      { term: "Self-join", def: "Соединение таблицы с самой собой через два разных псевдонима." }
    ]
  };
