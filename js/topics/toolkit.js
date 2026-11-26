// Раздел «toolkit»: как установить рабочие программы и что они умеют.
window.TOPICS.toolkit = {
  title: "Инструментарий",
  tag: "установка · ОС · базы · терминал · SSH · редакторы · Git · Docker",
  lead: "Как поставить программу с официального сайта, чем отличаются ОС, базы данных, терминалы, редакторы и Docker и что выбрать под конкретную задачу.",
  chapters: [
    {
      title: "Как безопасно установить программу",
      html: `
<div class="note"><b>Простыми словами</b>Ставьте программы с официального сайта или из штатного менеджера пакетов. Скачанный «сборник со взломом» — это не экономия, а риск потерять данные и рабочее место.</div>
<p><b>Сначала источник, потом установка.</b> Найдите сайт производителя, а не первую ссылку из поиска. У Python это <code>python.org</code>, у Git — <code>git-scm.com</code>, у DBeaver — <code>dbeaver.io</code>, у Power BI — сайт Microsoft. Проверьте домен, версию и дату публикации. Если сайт предлагает «универсальный установщик всего», закройте его.</p>
<p><b>Права и место.</b> Установка в системные папки требует прав администратора. На рабочем компьютере сначала уточните политику компании: некоторые программы нельзя ставить самостоятельно, а портал самообслуживания уже содержит проверенную версию. Личный ноутбук — ваша ответственность; рабочий — ещё и ответственность компании.</p>
<div class="table-wrap"><table><thead><tr><th>Система</th><th>Штатный способ</th><th>Когда удобен</th></tr></thead><tbody>
<tr><td>Windows</td><td><code>winget install ...</code></td><td>Быстрая установка и обновление из терминала</td></tr>
<tr><td>macOS</td><td>Homebrew: <code>brew install ...</code></td><td>Один менеджер для большинства утилит</td></tr>
<tr><td>Linux</td><td><code>apt</code>, <code>dnf</code> или пакет производителя</td><td>Зависит от дистрибутива и прав</td></tr>
</tbody></table></div>
<figure class="figure"><svg viewBox="0 0 360 84" role="img" aria-label="Проверка установки: источник, установка, команда и PATH"><g font-size="8.5" fill="currentColor" text-anchor="middle"><rect x="4" y="28" width="64" height="34" rx="5" fill="none" stroke="currentColor" opacity=".5"/><text x="36" y="43">Официальный</text><text x="36" y="55">источник</text><text x="76" y="48">→</text><rect x="84" y="28" width="64" height="34" rx="5" fill="none" stroke="currentColor" opacity=".5"/><text x="116" y="43">Установка</text><text x="116" y="55">по шагам</text><text x="156" y="48">→</text><rect x="164" y="28" width="64" height="34" rx="5" fill="currentColor" opacity=".1"/><text x="196" y="43">Команда</text><text x="196" y="55">--version</text><text x="236" y="48">→</text><rect x="244" y="28" width="72" height="34" rx="5" fill="none" stroke="currentColor" opacity=".5"/><text x="280" y="43">Работает</text><text x="280" y="55">в новом окне</text></g></svg><figcaption>Установка закончена не после кнопки «Готово», а после успешной команды в новом терминале.</figcaption></figure>
<div class="note"><b>Совет</b>Сохраните в README проекта версию программы и ссылку на официальный установщик. Через полгода это сэкономит поиск совместимой версии.</div>
<p><b>PATH</b> — список папок, где система ищет команды. Если после установки терминал пишет «команда не найдена», программа может быть установлена, но её папка не добавлена в PATH. Это не поломка: проверьте путь и перезапустите терминал.</p>
<p><b>Версии и окружения.</b> Для учебного проекта фиксируйте версии в файле зависимостей. Для Python используйте виртуальное окружение, чтобы библиотеки одного проекта не ломали другой. Для SQL-клиента сохраняйте параметры подключения отдельно от пароля.</p>
<div class="example"><b>Пример.</b> Нужен Python для pandas. Скачайте установщик с python.org, при установке на Windows отметьте «Add Python to PATH», проверьте <code>python --version</code>, создайте папку проекта и окружение <code>python -m venv .venv</code>. Только потом ставьте pandas через <code>pip</code>.</div>
<div class="note"><b>Проверка после установки</b>Откройте новый терминал и выполните команду версии. Если она работает, закройте и снова откройте терминал ещё раз: так вы убедитесь, что настройка PATH сохранилась, а не подхватилась из старой сессии.</div>
`
    },
    {
      title: "Python: интерпретатор, VS Code и Jupyter",
      html: `
<div class="note"><b>Простыми словами</b>Python — язык, интерпретатор — программа, которая его выполняет, а редактор помогает писать код. Jupyter нужен для пошагового исследования, VS Code — для проекта из нескольких файлов.</div>
<p><b>Установка.</b> Скачайте Python с <code>python.org</code>. На Windows при установке включите добавление в PATH. На macOS удобен установщик с сайта или Homebrew, но системный Python трогать не стоит. Проверка: <code>python --version</code> или <code>python3 --version</code>.</p>
<pre><code>python -m venv .venv
# Windows
.venv\\Scripts\\activate
# macOS и Linux
source .venv/bin/activate

python -m pip install --upgrade pip
pip install pandas jupyterlab</code></pre>
<p><b>Виртуальное окружение</b> — отдельная папка с интерпретатором и библиотеками проекта. Оно защищает от конфликтов версий: проект A может требовать pandas 2.x, а проект B — 1.x, и они не мешают друг другу.</p>
<figure class="figure"><svg viewBox="0 0 360 84" role="img" aria-label="Проект, виртуальное окружение, зависимости и код"><g font-size="8.5" fill="currentColor" text-anchor="middle"><rect x="4" y="28" width="64" height="34" rx="5" fill="none" stroke="currentColor" opacity=".5"/><text x="36" y="43">Папка</text><text x="36" y="55">проекта</text><text x="76" y="48">→</text><rect x="84" y="28" width="64" height="34" rx="5" fill="currentColor" opacity=".1"/><text x="116" y="43">.venv</text><text x="116" y="55">изоляция</text><text x="156" y="48">→</text><rect x="164" y="28" width="64" height="34" rx="5" fill="none" stroke="currentColor" opacity=".5"/><text x="196" y="43">pip</text><text x="196" y="55">пакеты</text><text x="236" y="48">→</text><rect x="244" y="28" width="72" height="34" rx="5" fill="none" stroke="currentColor" opacity=".5"/><text x="280" y="43">Код</text><text x="280" y="55">и данные</text></g></svg><figcaption>Окружение отделяет зависимости проекта от системного Python и от соседних проектов.</figcaption></figure>
<div class="note"><b>Совет</b>Начните с одной папки проекта и одного <code>.venv</code>. Не устанавливайте учебные библиотеки в системный Python: конфликт версий проявится позже и в другом проекте.</div>
<div class="table-wrap"><table><thead><tr><th>Инструмент</th><th>Что делает</th><th>Когда выбирать</th></tr></thead><tbody>
<tr><td>Интерпретатор Python</td><td>Выполняет код</td><td>Всегда, основа работы</td></tr>
<tr><td>VS Code</td><td>Редактор с расширениями, терминалом и отладчиком</td><td>Скрипты, проект, Git</td></tr>
<tr><td>JupyterLab</td><td>Блокнот из ячеек с выводом рядом</td><td>Исследование данных, обучение</td></tr>
<tr><td>Anaconda</td><td>Дистрибутив с Python и научными пакетами</td><td>Когда нужен готовый набор, но следите за размером</td></tr>
</tbody></table></div>
<p><b>VS Code.</b> После установки добавьте расширение Python, выберите интерпретатор из <code>.venv</code> и откройте папку проекта, а не отдельный файл. Встроенный терминал запускает код в том же окружении, что и редактор.</p>
<p><b>Jupyter.</b> Ячейки выполняются по одной, переменные сохраняются между запусками. Это удобно для графиков и проверки гипотез, но плохо для воспроизводимости: порядок запуска легко потерять. Перед сдачей работы выполните блокнот сверху вниз и сохраните вывод.</p>
<div class="example"><b>Пример.</b> Для разового анализа CSV откройте JupyterLab: прочитайте файл, постройте график, проверьте выбросы. Для скрипта, который будет запускаться каждую неделю, перенесите тот же код в <code>.py</code>-файл и запускайте из терминала или планировщика.</div>
`
    },
    {
      title: "SQL-клиент и база: DBeaver, PostgreSQL, SQLite",
      html: `
<div class="note"><b>Простыми словами</b>СУБД хранит данные и выполняет запросы, SQL-клиент — окно, через которое вы с ней общаетесь. Это разные программы, и путать их так же странно, как файл и программу для его просмотра.</div>
<p><b>СУБД</b> — сервер или файл, который хранит таблицы. <b>SQL-клиент</b> — приложение с редактором запросов, историей, схемой и выгрузкой результата. Для учёбы удобны DBeaver Community и встроенный SQLite; для командной работы — PostgreSQL, MySQL или облачное хранилище.</p>
<div class="table-wrap"><table><thead><tr><th>Вариант</th><th>Установка</th><th>Сильные стороны</th><th>Ограничения</th></tr></thead><tbody>
<tr><td>SQLite</td><td>Обычно уже входит в Python</td><td>Один файл, ничего не администрировать</td><td>Мало конкурентных записей, не для команды</td></tr>
<tr><td>PostgreSQL</td><td>Установщик с postgresql.org</td><td>Полноценная СУБД, оконные функции, расширения</td><td>Нужен сервер, пользователи и права</td></tr>
<tr><td>DBeaver</td><td>Установщик с dbeaver.io</td><td>Один клиент к разным базам, схема и экспорт</td><td>Построен на Java; standalone включает OpenJDK, интерфейс тяжелее простого редактора</td></tr>
</tbody></table></div>
<figure class="figure"><svg viewBox="0 0 360 92" role="img" aria-label="SQL-клиент подключается к СУБД, а СУБД хранит таблицы"><g font-size="8.5" fill="currentColor" text-anchor="middle"><rect x="4" y="28" width="86" height="38" rx="5" fill="none" stroke="currentColor" opacity=".5"/><text x="47" y="44">SQL-клиент</text><text x="47" y="57" opacity=".7">DBeaver</text><text x="102" y="49">→</text><text x="102" y="61" font-size="7.5" opacity=".6">запрос</text><rect x="126" y="28" width="86" height="38" rx="5" fill="currentColor" opacity=".1"/><text x="169" y="44">СУБД</text><text x="169" y="57" opacity=".7">PostgreSQL</text><text x="224" y="49">→</text><rect x="248" y="28" width="86" height="38" rx="5" fill="none" stroke="currentColor" opacity=".5"/><text x="291" y="44">Таблицы</text><text x="291" y="57" opacity=".7">данные</text></g></svg><figcaption>Клиент — это окно и редактор. Данные хранит и обрабатывает СУБД; клиент лишь отправляет запросы.</figcaption></figure>
<div class="note"><b>Совет</b>Начните с <code>SELECT ... LIMIT 100</code>, затем проверьте количество строк и только потом считайте агрегаты. Перед <code>UPDATE</code> или <code>DELETE</code> сделайте резервную копию.</div>
<p><b>Как подключиться.</b> В DBeaver создайте подключение, выберите тип базы, укажите хост, порт, базу и пользователя. Пароль лучше хранить в менеджере паролей, а не в тексте запроса. Для локального PostgreSQL хост часто <code>localhost</code>, порт <code>5432</code>.</p>
<pre><code>-- Проверка подключения и схемы
SELECT current_database(), current_user;

SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema');</code></pre>
<p><b>Чтение против записи.</b> В рабочей базе аналитик обычно получает роль только на чтение. <code>SELECT</code> безопасен, <code>UPDATE</code> и <code>DELETE</code> без <code>WHERE</code> могут испортить данные. Перед изменением проверьте количество строк и сделайте резервную копию.</p>
<div class="note"><b>Правило гигиены</b>Не сохраняйте пароли и строки подключения в Git. Используйте переменные окружения или профиль клиента; в README указывайте, какие переменные нужны, но не их значения.</div>
`
    },
    {
      title: "BI: Power BI, Tableau, Looker Studio, Metabase",
      html: `
<div class="note"><b>Простыми словами</b>BI-инструмент превращает таблицы в экран с показателями. Выбор зависит не от красоты, а от того, где живут данные, кто будет смотреть отчёт и можно ли публиковать его наружу.</div>
<p><b>Power BI</b> — экосистема Microsoft: Power BI Desktop для разработки на Windows и облачный сервис для публикации. Сильная сторона — интеграция с Excel и Azure, язык DAX. Ограничение: Desktop работает на Windows; для macOS нужна виртуальная машина или облачная среда.</p>
<p><b>Tableau</b> — сильная визуализация и исследование данных. Tableau Public бесплатен, но опубликованные книги видны всем; для закрытых данных нужна платная лицензия или сервер. <b>Looker Studio</b> работает в браузере, бесплатен, хорошо связан с Google Sheets и BigQuery, но хуже подходит для тяжёлой семантики.</p>
<p><b>Metabase</b> — open-source BI, который можно поставить на свой сервер. Он проще Tableau, умеет вопросы мышкой и SQL, подходит команде, которой нужен внутренний self-service без лицензии на каждого пользователя.</p>
<figure class="figure"><svg viewBox="0 0 360 112" role="img" aria-label="Выбор BI-инструмента по данным и среде"><g font-size="8.5" fill="currentColor"><rect x="4" y="8" width="104" height="26" rx="5" fill="none" stroke="currentColor" opacity=".45"/><text x="56" y="25" text-anchor="middle">Windows + Excel</text><text x="120" y="25">→</text><rect x="140" y="8" width="100" height="26" rx="5" fill="currentColor" opacity=".1"/><text x="190" y="25" text-anchor="middle">Power BI</text><rect x="4" y="43" width="104" height="26" rx="5" fill="none" stroke="currentColor" opacity=".45"/><text x="56" y="60" text-anchor="middle">Google Sheets</text><text x="120" y="60">→</text><rect x="140" y="43" width="100" height="26" rx="5" fill="currentColor" opacity=".1"/><text x="190" y="60" text-anchor="middle">Looker Studio</text><rect x="4" y="78" width="104" height="26" rx="5" fill="none" stroke="currentColor" opacity=".45"/><text x="56" y="95" text-anchor="middle">Свой сервер</text><text x="120" y="95">→</text><rect x="140" y="78" width="100" height="26" rx="5" fill="currentColor" opacity=".1"/><text x="190" y="95" text-anchor="middle">Metabase</text></g></svg><figcaption>Сначала среда и источник данных, потом интерфейс. Красивый демо-экран не компенсирует отсутствие подключения.</figcaption></figure>
<div class="note"><b>Совет</b>Проверьте не галерею примеров, а три вещи: подключается ли инструмент к вашим данным, можно ли ограничить доступ и сколько стоит лицензия для всех читателей.</div>
<div class="table-wrap"><table><thead><tr><th>Инструмент</th><th>Где работает</th><th>Сильная сторона</th><th>Проверить заранее</th></tr></thead><tbody>
<tr><td>Power BI</td><td>Windows + облако</td><td>Excel, DAX, корпоративная интеграция</td><td>Лицензии, Windows, шлюз к данным</td></tr>
<tr><td>Tableau</td><td>Desktop, Server, Cloud</td><td>Исследовательская визуализация</td><td>Стоимость, публичность Public</td></tr>
<tr><td>Looker Studio</td><td>Браузер</td><td>Бесплатно, Google-стек</td><td>Ограничения источников и прав</td></tr>
<tr><td>Metabase</td><td>Сервер или облако</td><td>Open-source, простой self-service</td><td>Администрирование и безопасность</td></tr>
</tbody></table></div>
<p><b>Что проверить до выбора.</b> Источники данных и способ подключения, права на строки, стоимость лицензий, возможность выгрузки, поддержка расписаний и мобильный вид. Инструмент, который не подключается к вашему хранилищу, бесполезен независимо от галереи примеров.</p>
<div class="example"><b>Пример.</b> Команда на Windows с Excel и Azure выбирает Power BI. Стартап на Google Sheets и BigQuery начинает с Looker Studio. Внутренней продуктовой команде без бюджета на лицензии подойдёт Metabase на своём сервере.</div>
`
    },
    {
      title: "Excel, Google Sheets, R и SPSS",
      html: `
<div class="note"><b>Простыми словами</b>Excel и Sheets хороши для быстрой таблицы и совместной правки; R и SPSS — для статистики. Выбор зависит от объёма данных, повторяемости и требований к проверке расчётов.</div>
<p><b>Excel</b> остаётся рабочим инструментом для небольших таблиц, сводных, финансовых моделей и быстрой проверки. Ограничения начинаются с ручных правок: формулу легко протянуть не туда, а версию файла — потерять. Для повторяемого расчёта лучше Python или SQL.</p>
<p><b>Google Sheets</b> удобен для совместной работы и ссылок на данные в Google-стеке. Ограничения — размер, скорость и зависимость от браузера. Для конфиденциальных данных проверьте настройки доступа: ссылка «всем, у кого есть ссылка» — это публикация.</p>
<div class="table-wrap"><table><thead><tr><th>Инструмент</th><th>Сильная сторона</th><th>Когда не подходит</th></tr></thead><tbody>
<tr><td>Excel</td><td>Сводные, формулы, знакомый интерфейс</td><td>Большие данные, сложная автоматизация</td></tr>
<tr><td>Google Sheets</td><td>Совместная работа, простые ссылки</td><td>Секретные данные, тяжёлые расчёты</td></tr>
<tr><td>R + RStudio</td><td>Статистика, графики, воспроизводимые скрипты</td><td>Команда не готова поддерживать код</td></tr>
<tr><td>SPSS</td><td>Меню для классической статистики, отчёты</td><td>Дорогая лицензия, ограниченная автоматизация</td></tr>
</tbody></table></div>
<figure class="figure"><svg viewBox="0 0 360 92" role="img" aria-label="Выбор инструмента: Excel, SQL, BI или R"><g font-size="8" fill="currentColor" text-anchor="middle"><rect x="4" y="12" width="80" height="28" rx="5" fill="none" stroke="currentColor" opacity=".45"/><text x="44" y="25">мало строк</text><text x="44" y="36" opacity=".7">разовый срез</text><text x="90" y="31">→</text><rect x="106" y="12" width="70" height="28" rx="5" fill="currentColor" opacity=".1"/><text x="141" y="31">Excel</text><rect x="190" y="12" width="80" height="28" rx="5" fill="none" stroke="currentColor" opacity=".45"/><text x="230" y="25">много строк</text><text x="230" y="36" opacity=".7">повторяемый</text><rect x="284" y="12" width="70" height="28" rx="5" fill="currentColor" opacity=".1"/><text x="319" y="31">SQL / Python</text><rect x="4" y="56" width="80" height="28" rx="5" fill="none" stroke="currentColor" opacity=".45"/><text x="44" y="69">нужен экран</text><text x="44" y="80" opacity=".7">для команды</text><rect x="106" y="56" width="70" height="28" rx="5" fill="currentColor" opacity=".1"/><text x="141" y="75">BI</text><rect x="190" y="56" width="80" height="28" rx="5" fill="none" stroke="currentColor" opacity=".45"/><text x="230" y="69">нужна</text><text x="230" y="80" opacity=".7">статистика</text><rect x="284" y="56" width="70" height="28" rx="5" fill="currentColor" opacity=".1"/><text x="319" y="75">R / SPSS</text></g></svg><figcaption>Инструмент выбирают по объёму, повторяемости и тому, кто будет читать результат.</figcaption></figure>
<div class="note"><b>Совет</b>Если отчёт нужно повторять каждую неделю, переносите расчёт из Excel в SQL или Python. Если его будут смотреть каждый день — добавляйте BI, а не новый файл.</div>
<p><b>R и RStudio.</b> R — язык статистики, RStudio — среда для него. Установите R с CRAN, затем RStudio Desktop с posit.co. Пакеты ставятся командой <code>install.packages("dplyr")</code>. Плюс — огромная статистическая экосистема; минус — ещё один язык в команде.</p>
<p><b>SPSS.</b> Коммерческий пакет с меню и таблицами вывода. Он удобен, когда статистику делает исследователь без программирования, но лицензия стоит денег, а автоматизация и версионирование слабее, чем в R или Python. Перед покупкой проверьте, какие методы реально нужны.</p>
<div class="example"><b>Пример.</b> Для опроса на 300 строк SPSS или R подойдут лучше Excel: там есть готовые критерии и проверка допущений. Для недельного отчёта по продажам из 20 строк хватит сводной таблицы Excel, а для ежедневного — SQL и BI.</div>
`
    },
    {
      title: "Git, терминал и воспроизводимость",
      html: `
<div class="note"><b>Простыми словами</b>Git хранит историю изменений проекта. Коммит — сохранённый шаг с объяснением, репозиторий — папка с этой историей, а GitHub — место, где ей можно поделиться.</div>
<p><b>Установка.</b> Скачайте Git с <code>git-scm.com</code>. На Windows установщик добавит Git Bash; на macOS проверьте <code>git --version</code>, при отсутствии поставьте через Homebrew или Xcode Command Line Tools. Для работы без терминала есть GitHub Desktop.</p>
<figure class="figure"><svg viewBox="0 0 360 84" role="img" aria-label="Git: файлы, индекс, коммит и удалённый репозиторий"><g font-size="8.5" fill="currentColor" text-anchor="middle"><rect x="4" y="28" width="64" height="34" rx="5" fill="none" stroke="currentColor" opacity=".5"/><text x="36" y="43">Файлы</text><text x="36" y="55" opacity=".7">проекта</text><text x="76" y="48">→</text><rect x="84" y="28" width="64" height="34" rx="5" fill="none" stroke="currentColor" opacity=".5"/><text x="116" y="43">git add</text><text x="116" y="55" opacity=".7">индекс</text><text x="156" y="48">→</text><rect x="164" y="28" width="64" height="34" rx="5" fill="currentColor" opacity=".1"/><text x="196" y="43">commit</text><text x="196" y="55" opacity=".7">история</text><text x="236" y="48">→</text><rect x="244" y="28" width="72" height="34" rx="5" fill="none" stroke="currentColor" opacity=".5"/><text x="280" y="43">push</text><text x="280" y="55" opacity=".7">GitHub</text></g></svg><figcaption>Коммит фиксирует изменения локально, push отправляет их в удалённый репозиторий. Это разные шаги.</figcaption></figure>
<div class="note"><b>Совет</b>Делайте маленькие коммиты с сообщением о причине изменения. «Исправить дубли в отчёте» полезнее, чем «обновить файлы».</div>
<pre><code>git --version
git config --global user.name "Имя"
git config --global user.email "you@example.com"

git init
git add README.md
git commit -m "Добавить описание проекта"
git remote add origin https://github.com/user/repo.git
git push -u origin main</code></pre>
<p><b>Что коммитить.</b> Код, SQL-модели, README, тесты и небольшие учебные данные. Что не коммитить: пароли, токены, большие выгрузки, папки окружений и временные файлы. Для исключений есть <code>.gitignore</code>.</p>
<div class="table-wrap"><table><thead><tr><th>Файл</th><th>Зачем</th></tr></thead><tbody>
<tr><td><code>README.md</code></td><td>Задача, запуск, данные и ограничения</td></tr>
<tr><td><code>requirements.txt</code></td><td>Версии Python-библиотек</td></tr>
<tr><td><code>.gitignore</code></td><td>Что не хранить в репозитории</td></tr>
<tr><td><code>.env.example</code></td><td>Какие переменные нужны, без секретов</td></tr>
</tbody></table></div>
<p><b>Терминал</b> нужен не для красоты: он показывает ошибки установки, запускает скрипты и повторяет команды без ручных кликов. Основы: <code>pwd</code>, <code>ls</code>, <code>cd</code>, <code>python</code>, <code>git status</code>. Не копируйте команду с <code>sudo</code> или удалением, если не понимаете, что она делает.</p>
<div class="example"><b>Пример.</b> Перед сдачей проекта проверьте: репозиторий клонируется в чистую папку, README объясняет запуск, <code>requirements.txt</code> фиксирует версии, секретов в истории нет, а блокнот или скрипт выполняется сверху вниз без ручных правок.</div>
<div class="note"><b>Docker — по необходимости</b>Контейнер помогает одинаково запускать проект на разных машинах, но для учебного анализа часто достаточно виртуального окружения и README. Не добавляйте Docker только ради слова в резюме.</div>
`
    },
    {
      title: "Операционные системы: краткая карта",
      html: `
<div class="note"><b>Простыми словами</b>Операционная система — среда, в которой работают программы. От неё зависят пути к файлам, способ установки, терминал и права доступа.</div>
<p><b>Три большие семьи.</b> Windows, macOS и Linux решают одни задачи по-разному. Программа может работать на одной системе и не работать на другой; это не «ошибка Python», а различие платформ. Перед установкой смотрите раздел Download и системные требования.</p>
<div class="table-wrap"><table><thead><tr><th>Система</th><th>Терминал</th><th>Пакеты</th><th>Пути</th><th>Особенность</th></tr></thead><tbody>
<tr><td>Windows</td><td>PowerShell, Git Bash, WSL</td><td><code>winget</code>, установщики</td><td><code>C:\\Users\\Имя</code></td><td>Права администратора и UAC</td></tr>
<tr><td>macOS</td><td>Terminal, zsh</td><td>Homebrew, установщики</td><td><code>/Users/Имя</code></td><td>Gatekeeper и подпись приложений</td></tr>
<tr><td>Linux</td><td>GNOME Terminal, bash/zsh</td><td><code>apt</code>, <code>dnf</code>, <code>pacman</code></td><td><code>/home/имя</code></td><td>Права root и <code>sudo</code></td></tr>
</tbody></table></div>
<figure class="figure"><svg viewBox="0 0 360 106" role="img" aria-label="Windows, macOS и Linux: терминал, пакеты и права"><g font-size="8.5" fill="currentColor" text-anchor="middle"><rect x="4" y="8" width="104" height="28" rx="5" fill="none" stroke="currentColor" opacity=".45"/><text x="56" y="26">Windows</text><rect x="128" y="8" width="104" height="28" rx="5" fill="none" stroke="currentColor" opacity=".45"/><text x="180" y="26">macOS</text><rect x="252" y="8" width="104" height="28" rx="5" fill="none" stroke="currentColor" opacity=".45"/><text x="304" y="26">Linux</text><text x="56" y="58" opacity=".7">PowerShell · WSL</text><text x="180" y="58" opacity=".7">zsh · Homebrew</text><text x="304" y="58" opacity=".7">bash · apt/dnf</text><text x="56" y="82" opacity=".7">NTFS · UAC</text><text x="180" y="82" opacity=".7">APFS · Gatekeeper</text><text x="304" y="82" opacity=".7">ext4/xfs · sudo</text></g></svg><figcaption>Одна и та же задача решается разными командами. Сначала определите систему, потом ищите инструкцию.</figcaption></figure>
<p><b>Пути и регистр.</b> В Windows путь начинается с диска, в macOS и Linux — с <code>/</code>. Linux чувствителен к регистру: <code>Data.csv</code> и <code>data.csv</code> — разные файлы. Пробелы в пути ломают команды, поэтому путь заключают в кавычки.</p>
<p><b>Переносы строк и кодировка.</b> Windows исторически использует CRLF, Unix — LF. Git умеет нормализовать это настройкой <code>core.autocrlf</code>. Текст лучше хранить в UTF-8, иначе русские буквы превращаются в «кракозябры».</p>
<p><b>WSL</b> — слой Linux внутри Windows. Он полезен, когда нужны Linux-команды, но не заменяет понимание прав и путей: файлы Windows и Linux доступны по разным путям.</p>
<div class="note"><b>Совет</b>Запишите свою систему и версию в README проекта. Команда установки для Windows часто не работает на macOS, и наоборот; явная платформа экономит время читателю.</div>
`
    },
    {
      title: "Типы баз данных: что выбрать",
      html: `
<div class="note"><b>Простыми словами</b>База данных — не просто «таблица в Excel». Тип базы определяет, как хранятся данные, какие запросы быстрые и какие ограничения придётся соблюдать.</div>
<p><b>Реляционные базы</b> хранят строки в таблицах со схемой и связями. Это PostgreSQL, MySQL, SQL Server и SQLite. Они сильны в целостности, транзакциях и SQL; подходят для заказов, пользователей, платежей и большинства учебных проектов.</p>
<div class="table-wrap"><table><thead><tr><th>Тип</th><th>Модель</th><th>Примеры</th><th>Когда выбирать</th></tr></thead><tbody>
<tr><td>Реляционная</td><td>Таблицы, строки, связи</td><td>PostgreSQL, MySQL, SQLite</td><td>Транзакции, отчёты, строгая схема</td></tr>
<tr><td>Документная</td><td>JSON-документы</td><td>MongoDB</td><td>Гибкая схема и вложенные объекты</td></tr>
<tr><td>Ключ-значение</td><td>Ключ → значение</td><td>Redis</td><td>Кэш, сессии, быстрый доступ</td></tr>
<tr><td>Колоночная</td><td>Колонки и сжатие</td><td>ClickHouse, BigQuery</td><td>Аналитика по миллионам строк</td></tr>
<tr><td>Графовая</td><td>Узлы и связи</td><td>Neo4j</td><td>Социальные графы, маршруты</td></tr>
<tr><td>Поисковая</td><td>Индексы текста</td><td>Elasticsearch</td><td>Полнотекстовый поиск и логи</td></tr>
</tbody></table></div>
<figure class="figure"><svg viewBox="0 0 360 104" role="img" aria-label="Типы баз данных: таблицы, документы, ключи, колонки и графы"><g font-size="8" fill="currentColor" text-anchor="middle"><rect x="4" y="12" width="64" height="30" rx="5" fill="none" stroke="currentColor" opacity=".45"/><text x="36" y="26">таблицы</text><text x="36" y="38" opacity=".7">SQL</text><rect x="76" y="12" width="64" height="30" rx="5" fill="none" stroke="currentColor" opacity=".45"/><text x="108" y="26">документы</text><text x="108" y="38" opacity=".7">JSON</text><rect x="148" y="12" width="64" height="30" rx="5" fill="none" stroke="currentColor" opacity=".45"/><text x="180" y="26">ключи</text><text x="180" y="38" opacity=".7">кэш</text><rect x="220" y="12" width="64" height="30" rx="5" fill="none" stroke="currentColor" opacity=".45"/><text x="252" y="26">колонки</text><text x="252" y="38" opacity=".7">аналитика</text><rect x="292" y="12" width="64" height="30" rx="5" fill="none" stroke="currentColor" opacity=".45"/><text x="324" y="26">графы</text><text x="324" y="38" opacity=".7">связи</text><text x="180" y="72" opacity=".65">OLTP: операции → OLAP: анализ</text><text x="180" y="90" opacity=".5" font-size="7.5">сначала задача, потом тип базы</text></g></svg><figcaption>Тип базы выбирают по форме данных и запросам, а не по популярности названия.</figcaption></figure>
<p><b>OLTP и OLAP.</b> OLTP обслуживает операции: создать заказ, оплатить, обновить профиль. OLAP отвечает на аналитические вопросы: сколько купили за месяц и почему. Нельзя бездумно гонять тяжёлые аналитические запросы по боевой операционной базе.</p>
<div class="note"><b>Совет</b>Для первого проекта берите реляционную базу: SQLite локально или PostgreSQL на сервере. Документную или ключ-значение выбирайте, когда есть конкретная причина, а не ради модного слова.</div>
`
    },
    {
      title: "Терминал, оболочка и SSH",
      html: `
<div class="note"><b>Простыми словами</b>Терминал — окно, оболочка — программа, которая понимает команды. SSH — защищённое подключение к другому компьютеру через терминал.</div>
<p><b>Терминал и оболочка — не одно и то же.</b> Терминал показывает окно и принимает ввод; оболочка (bash, zsh, PowerShell) разбирает команды и запускает программы. На Windows есть PowerShell, Git Bash и WSL; на macOS — Terminal и zsh; на Linux — GNOME Terminal, Konsole и другие.</p>
<div class="table-wrap"><table><thead><tr><th>Команда</th><th>Что делает</th></tr></thead><tbody>
<tr><td><code>pwd</code></td><td>Показывает текущую папку</td></tr>
<tr><td><code>ls -la</code></td><td>Показывает файлы, включая скрытые</td></tr>
<tr><td><code>cd папка</code></td><td>Переходит в папку; <code>cd ..</code> — на уровень выше</td></tr>
<tr><td><code>mkdir -p путь</code></td><td>Создаёт папку и родителей</td></tr>
<tr><td><code>cp</code>, <code>mv</code>, <code>rm</code></td><td>Копировать, переместить, удалить</td></tr>
<tr><td><code>cat</code>, <code>less</code></td><td>Показать файл или листать его</td></tr>
<tr><td><code>grep</code>, <code>find</code></td><td>Искать текст или файлы</td></tr>
<tr><td><code>man команда</code></td><td>Открыть справку</td></tr>
</tbody></table></div>
<figure class="figure"><svg viewBox="0 0 360 92" role="img" aria-label="Терминал подключается по SSH к удалённому серверу"><g font-size="8.5" fill="currentColor" text-anchor="middle"><rect x="4" y="28" width="86" height="38" rx="5" fill="none" stroke="currentColor" opacity=".5"/><text x="47" y="44">Терминал</text><text x="47" y="57" opacity=".7">локально</text><text x="102" y="49">→</text><text x="102" y="61" font-size="7.5" opacity=".6">SSH</text><rect x="126" y="28" width="86" height="38" rx="5" fill="currentColor" opacity=".1"/><text x="169" y="44">Сеть</text><text x="169" y="57" opacity=".7">шифрование</text><text x="224" y="49">→</text><rect x="248" y="28" width="86" height="38" rx="5" fill="none" stroke="currentColor" opacity=".5"/><text x="291" y="44">Сервер</text><text x="291" y="57" opacity=".7">команды</text></g></svg><figcaption>SSH открывает терминал на удалённой машине. Пароль или ключ проверяет сервер, а трафик шифруется.</figcaption></figure>
<p><b>SSH: минимум.</b> Подключение: <code>ssh user@host</code>. Ключ: <code>ssh-keygen -t ed25519</code>, затем <code>ssh-copy-id user@host</code>. Для регулярной работы настройте <code>~/.ssh/config</code>, чтобы не писать хост и пользователя каждый раз.</p>
<pre><code>ssh-keygen -t ed25519 -C "work"
ssh-copy-id user@server
ssh user@server

# копирование файлов
scp report.csv user@server:/home/user/
rsync -av data/ user@server:/home/user/data/</code></pre>
<p><b>Долгие задачи.</b> Если соединение оборвётся, процесс может завершиться. <code>tmux</code> или <code>screen</code> держат сессию на сервере: отключились, вернулись и продолжили. Для одноразовой проверки хватит <code>ssh</code> и <code>exit</code>.</p>
<div class="note"><b>Совет</b>Проверяйте отпечаток сервера при первом подключении, не передавайте приватный ключ и ставьте на него пароль. Пароль в командной строке и в истории терминала — плохая привычка.</div>
`
    },
    {
      title: "Редакторы в терминале: nano, vim и emacs",
      html: `
<div class="note"><b>Простыми словами</b>nano — простой редактор для быстрой правки, vim — мощный редактор с режимами, emacs — расширяемая среда. Начните с nano, потом выберите один из двух других.</div>
<p><b>nano</b> показывает подсказки внизу экрана. Откройте файл командой <code>nano file.txt</code>, правьте текст, сохраните <code>Ctrl+O</code>, подтвердите Enter и выйдите <code>Ctrl+X</code>. Этого достаточно для конфига, заметки или быстрой правки на сервере.</p>
<p><b>vim</b> работает в режимах. В обычном режиме клавиши — команды, в режиме вставки — текст. Нажмите <code>i</code> для ввода, <code>Esc</code> для возврата, <code>:w</code> для сохранения, <code>:q</code> для выхода, <code>:wq</code> — сохранить и выйти, <code>:q!</code> — выйти без сохранения. Учебник: <code>vimtutor</code>.</p>
<div class="table-wrap"><table><thead><tr><th>Редактор</th><th>Плюс</th><th>Минус</th><th>Когда выбирать</th></tr></thead><tbody>
<tr><td>nano</td><td>Простые подсказки, без режимов</td><td>Мало возможностей для больших проектов</td><td>Быстрая правка на сервере</td></tr>
<tr><td>vim</td><td>Быстрый, есть почти везде, мощные команды</td><td>Крутая кривая обучения и режимы</td><td>Регулярная работа в терминале</td></tr>
<tr><td>emacs</td><td>Расширяемость, org-mode, множество пакетов</td><td>Тяжелее и требует настройки</td><td>Долгая работа в одной среде</td></tr>
</tbody></table></div>
<figure class="figure"><svg viewBox="0 0 360 102" role="img" aria-label="nano, vim и emacs: простота, режимы и расширяемость"><g font-size="8.5" fill="currentColor" text-anchor="middle"><rect x="4" y="22" width="104" height="46" rx="6" fill="none" stroke="currentColor" opacity=".5"/><text x="56" y="41">nano</text><text x="56" y="56" opacity=".7">подсказки внизу</text><text x="128" y="45">→</text><rect x="150" y="22" width="58" height="46" rx="6" fill="currentColor" opacity=".1"/><text x="179" y="41">vim</text><text x="179" y="56" opacity=".7">режимы</text><text x="226" y="45">→</text><rect x="248" y="22" width="86" height="46" rx="6" fill="none" stroke="currentColor" opacity=".5"/><text x="291" y="41">emacs</text><text x="291" y="56" opacity=".7">расширения</text><text x="180" y="88" opacity=".6">сначала nano → потом один редактор глубоко</text></g></svg><figcaption>Не нужно учить все три сразу. Выберите nano для правки и один редактор для постоянной работы.</figcaption></figure>
<p><b>emacs</b> запускается командой <code>emacs -nw file.txt</code> в терминале. Сохранить — <code>Ctrl+X Ctrl+S</code>, выйти — <code>Ctrl+X Ctrl+C</code>, отменить команду — <code>Ctrl+G</code>. Комбинации записывают как <code>C-x C-s</code>. Emacs любят за org-mode и единую среду, но он требует времени на освоение.</p>
<div class="note"><b>Совет</b>Если вы правите файл на сервере и не уверены в редакторе, откройте nano. Если решили учить vim, начните с <code>vimtutor</code> и сначала освоьте <code>Esc</code>, <code>:wq</code> и <code>:q!</code>.</div>
`
    },
    {
      title: "Docker: контейнеры для проекта",
      html: `
<div class="note"><b>Простыми словами</b>Docker упаковывает программу и её зависимости в контейнер. На другой машине он запускается так же, как у вас, если есть Docker и совместимая архитектура.</div>
<p><b>Образ и контейнер.</b> Образ — неизменяемый шаблон с файлами и настройками. Контейнер — запущенный экземпляр образа. Из одного образа можно поднять несколько контейнеров; изменения внутри контейнера исчезают при удалении, если не подключён volume.</p>
<p><b>Установка.</b> На Windows и macOS ставят Docker Desktop с официального сайта, на Linux — Docker Engine из репозитория дистрибутива. После установки проверьте <code>docker --version</code> и <code>docker run hello-world</code>. На Windows может понадобиться WSL 2.</p>
<div class="table-wrap"><table><thead><tr><th>Команда</th><th>Что делает</th></tr></thead><tbody>
<tr><td><code>docker pull python:3.12-slim</code></td><td>Скачивает образ</td></tr>
<tr><td><code>docker images</code></td><td>Показывает локальные образы</td></tr>
<tr><td><code>docker run --rm -it образ</code></td><td>Запускает контейнер и удаляет его после выхода</td></tr>
<tr><td><code>docker ps -a</code></td><td>Показывает контейнеры, включая остановленные</td></tr>
<tr><td><code>docker build -t analytics-app .</code></td><td>Собирает образ из Dockerfile</td></tr>
<tr><td><code>docker compose up -d</code></td><td>Запускает несколько сервисов из compose-файла</td></tr>
</tbody></table></div>
<figure class="figure"><svg viewBox="0 0 360 94" role="img" aria-label="Dockerfile, образ, контейнер и volume"><g font-size="8.5" fill="currentColor" text-anchor="middle"><rect x="4" y="28" width="70" height="38" rx="5" fill="none" stroke="currentColor" opacity=".5"/><text x="39" y="44">Dockerfile</text><text x="39" y="57" opacity=".7">инструкции</text><text x="80" y="49">→</text><rect x="90" y="28" width="64" height="38" rx="5" fill="currentColor" opacity=".1"/><text x="122" y="44">Образ</text><text x="122" y="57" opacity=".7">шаблон</text><text x="160" y="49">→</text><rect x="170" y="28" width="70" height="38" rx="5" fill="none" stroke="currentColor" opacity=".5"/><text x="205" y="44">Контейнер</text><text x="205" y="57" opacity=".7">процесс</text><text x="246" y="49">→</text><rect x="256" y="28" width="70" height="38" rx="5" fill="currentColor" opacity=".1"/><text x="291" y="44">Volume</text><text x="291" y="57" opacity=".7">данные</text></g></svg><figcaption>Dockerfile собирает образ, из образа запускается контейнер, а volume сохраняет данные вне контейнера.</figcaption></figure>
<p><b>Dockerfile</b> описывает сборку. Порядок слоёв важен: сначала зависимости, потом код, чтобы изменения в коде не пересобирали установку библиотек.</p>
<pre><code>FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "script.py"]</code></pre>
<p><b>Данные и секреты.</b> Не храните базу и результаты внутри контейнера: подключайте volume или папку проекта. Пароли передавайте переменными окружения или секретами, а не строкой в Dockerfile. Файл <code>.dockerignore</code> исключает <code>.git</code>, <code>.venv</code> и большие выгрузки.</p>
<p><b>Когда Docker полезен.</b> Для воспроизводимой среды, CI, нескольких сервисов и одинакового запуска у команды. Для одного учебного скрипта часто достаточно <code>.venv</code> и README: контейнер добавляет слой инфраструктуры, который нужно понимать.</p>
<div class="note"><b>Совет</b>Фиксируйте версии образов и зависимостей, используйте <code>--rm</code> для одноразовых контейнеров и не запускайте образы из непроверенных источников. Для проекта с приложением и базой начинайте с <code>docker compose</code>, а не с длинной команды <code>docker run</code>.</div>
`
    }
  ],
  quiz: [
    {
      q: "Откуда безопаснее всего скачивать программу для анализа данных?",
      options: [
        "С официального сайта производителя",
        "С первого файлообменника в поиске",
        "Из архива с взломанными программами",
        "Из комментария под видео"
      ],
      correct: 0,
      explain: "Официальный сайт или корпоративный портал дают проверенную сборку и обновления; сторонние сборки могут содержать вредоносный код."
    },
    {
      q: "Терминал пишет «python: command not found». Что проверить первым делом?",
      options: [
        "Попала ли папка Python в PATH",
        "Есть ли у файла красивый значок",
        "Сколько места на рабочем столе",
        "Включён ли режим блокнота"
      ],
      correct: 0,
      explain: "Программа может быть установлена, но система не знает, где её искать. Проверяют PATH и перезапускают терминал."
    },
    {
      q: "Зачем нужно виртуальное окружение Python?",
      options: [
        "Чтобы библиотеки разных проектов не конфликтовали",
        "Чтобы код выполнялся быстрее в интернете",
        "Чтобы автоматически писать запросы SQL",
        "Чтобы заменить Git"
      ],
      correct: 0,
      explain: "Окружение изолирует зависимости проекта: версии pandas или numpy не ломают соседний проект."
    },
    {
      q: "Что делает Jupyter удобным для первого анализа данных?",
      options: [
        "Позволяет выполнять код по ячейкам и сразу видеть результат",
        "Автоматически исправляет статистические ошибки",
        "Гарантирует воспроизводимость без порядка запуска",
        "Заменяет SQL-клиент"
      ],
      correct: 0,
      explain: "Ячейки с выводом рядом ускоряют исследование, но порядок запуска нужно контролировать вручную."
    },
    {
      q: "Чем SQL-клиент отличается от СУБД?",
      options: [
        "Клиент — окно для запросов, СУБД хранит и обрабатывает данные",
        "Это одно и то же",
        "СУБД нужна только для графиков",
        "Клиент хранит все таблицы вместо сервера"
      ],
      correct: 0,
      explain: "PostgreSQL — СУБД, DBeaver — клиент. Клиент подключается к базе и отправляет запросы."
    },
    {
      q: "Когда SQLite удобнее PostgreSQL?",
      options: [
        "Для локального учебного проекта в одном файле",
        "Для одновременной работы большой команды",
        "Когда нужны сложные права доступа",
        "Когда требуется кластер серверов"
      ],
      correct: 0,
      explain: "SQLite не требует сервера и подходит для локальной практики; для командной работы и прав нужна полноценная СУБД."
    },
    {
      q: "Что важно проверить у Tableau Public перед публикацией данных?",
      options: [
        "Опубликованная книга будет видна другим",
        "Она работает только без интернета",
        "Она не умеет строить графики",
        "Она удаляет исходные данные"
      ],
      correct: 0,
      explain: "Tableau Public предназначен для публичных книг; конфиденциальные данные туда выкладывать нельзя."
    },
    {
      q: "Почему Power BI Desktop может не подойти пользователю macOS?",
      options: [
        "Desktop работает на Windows",
        "Он не подключается к Excel",
        "В нём нет визуализаций",
        "Он не поддерживает DAX"
      ],
      correct: 0,
      explain: "Power BI Desktop — приложение Windows; на macOS используют виртуальную машину или облачную среду."
    },
    {
      q: "Что такое коммит в Git?",
      options: [
        "Сохранённый шаг изменений с сообщением",
        "Резервная копия всей операционной системы",
        "Публикация сайта в интернете",
        "Удаление истории проекта"
      ],
      correct: 0,
      explain: "Коммит фиксирует набор изменений и объясняет, зачем они сделаны; push отправляет коммиты в удалённый репозиторий."
    },
    {
      q: "Что НЕ стоит хранить в Git-репозитории?",
      options: [
        "Пароли и токены доступа",
        "README с инструкцией",
        "SQL-модели",
        "Небольшие учебные CSV"
      ],
      correct: 0,
      explain: "Секреты в истории репозитория трудно удалить; их хранят в переменных окружения или менеджере секретов."
    },
    {
      q: "Зачем в проекте нужен requirements.txt?",
      options: [
        "Чтобы зафиксировать версии Python-зависимостей",
        "Чтобы хранить пароли к базе",
        "Чтобы заменить README",
        "Чтобы ускорить интернет"
      ],
      correct: 0,
      explain: "Файл позволяет другому человеку поставить те же библиотеки и воспроизвести расчёт."
    },
    {
      q: "Когда Excel лучше Python для отчёта?",
      options: [
        "Когда таблица небольшая и нужна быстрая ручная проверка",
        "Когда данных миллионы строк",
        "Когда требуется ежедневный автозапуск",
        "Когда нужна сложная статистическая модель"
      ],
      correct: 0,
      explain: "Excel силён в небольших таблицах и быстрой проверке; для больших и повторяемых расчётов лучше код."
    }
  ],
  terms: [
    { term: "Интерпретатор", def: "Программа, которая выполняет код на языке программирования." },
    { term: "PATH", def: "Список папок, в которых система ищет команды." },
    { term: "Виртуальное окружение", def: "Изолированный набор библиотек Python для одного проекта." },
    { term: "pip", def: "Менеджер пакетов Python." },
    { term: "Jupyter", def: "Блокнот с ячейками кода и выводом рядом." },
    { term: "СУБД", def: "Система управления базами данных: хранит и обрабатывает таблицы." },
    { term: "SQL-клиент", def: "Программа для подключения к базе и выполнения запросов." },
    { term: "BI-инструмент", def: "Программа для сборки интерактивных отчётов и дашбордов." },
    { term: "Git", def: "Система контроля версий: хранит историю изменений проекта." },
    { term: "Коммит", def: "Сохранённый набор изменений с сообщением." },
    { term: "Репозиторий", def: "Папка проекта вместе с историей изменений Git." },
    { term: "Воспроизводимость", def: "Возможность получить тот же результат по инструкции и фиксированным версиям." }
  ]
};
