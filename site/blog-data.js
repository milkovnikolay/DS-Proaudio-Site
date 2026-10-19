/* DS PROAUDIO — материалы блога. Единый источник для страницы «Блог» (blog.html),
   блока «Блог» на главной (4 последних) и шаблона статьи (blog-post.html?id=…).

   Как добавить материал: скопируйте любую запись, поменяйте поля и сохраните файл.
   Порядок в списке не важен — сайт сортирует по дате (новые сверху).
     id     — латиница/цифры/дефис, станет адресом: blog-post.html?id=<id>
     type   — рубрика: 'projects' (Проекты и события) · 'engineering' (Инженерные разборы) · 'interviews' (Интервью)
     title  — название
     date   — дата публикации, ГГГГ-ММ-ДД
     img    — картинка карточки (лучше 4:3 или шире, от 1000 px по ширине); pos — кадрирование (object-position), необязательно
     lead   — 1–2 предложения: подзаголовок статьи
     body   — текст статьи: массив абзацев (строка = абзац; строка с «## » в начале = подзаголовок). Пусто — показывается заглушка «готовится»
     link   — необязательно: связанная страница сайта {href, label}

   ВНИМАНИЕ: записи ниже — ШАБЛОНЫ первых карточек. Названия, даты и картинки подобраны по материалам сайта,
   тексты статей ещё не написаны (body пустой). Замените даты на реальные даты публикации. */
window.DS_BLOG_TYPES = {
  projects:    { label: 'Проекты и события',  one: 'Проекты и события' },
  engineering: { label: 'Инженерные разборы', one: 'Инженерный разбор' },
  interviews:  { label: 'Интервью',           one: 'Интервью' }
};

window.DS_BLOG = [
  { id: 'milkov-interview', type: 'interviews', date: '2026-10-05',
    title: 'Николай Мильков: как рождается акустическая система DS PROAUDIO',
    img: './assets/faces/milkov.jpg', pos: '50% 30%',
    lead: 'Главный конструктор — о том, как идея новой модели проходит путь от расчёта до серийного кабинета.',
    link: { href: './faces.html#face-milkov', label: 'Карточка в разделе «Лица компании»' }, body: [] },

  { id: 'cardioid-sub-18', type: 'engineering', date: '2026-09-22',
    title: 'Кардиоидный сабвуфер TAURA C-Sub 18: почему бас не уходит за сцену',
    img: './assets/technologies/taura-c-sub-18-section-card.jpg', pos: '50% 50%',
    lead: 'Разбираем по разрезу корпуса, как два излучателя формируют кардиоидную диаграмму направленности.',
    link: { href: './tech-cardioid-sub.html', label: 'Технология «Кардиоидный сабвуфер»' }, body: [] },

  { id: 'ranepa-auditoriums', type: 'projects', date: '2026-09-08',
    title: 'РАНХиГС: звук для аудиторий и лекционных залов',
    img: './assets/portfolio/pf-001/cover.jpg',
    lead: 'Как мы подбирали акустику для учебных пространств академии в Москве.',
    link: { href: './portfolio.html#pf-001', label: 'Проект в портфолио' }, body: [] },

  { id: 'kaliningrad-cathedral', type: 'projects', date: '2026-08-25',
    title: 'Кафедральный собор в Калининграде: разборчивость речи под высокими сводами',
    img: './assets/portfolio/pf-042/cover.jpg',
    lead: 'Длинная реверберация храма и задача, чтобы каждое слово было слышно в любой точке зала.',
    link: { href: './portfolio.html#pf-042', label: 'Проект в портфолио' }, body: [] },

  { id: 'rigging-without-pins', type: 'engineering', date: '2026-08-11',
    title: 'Риггинг без пинов: как собирается массив TAURA',
    img: './assets/technologies/rigging-card.jpg',
    lead: 'Почему мы отказались от съёмных пинов и что это даёт монтажной бригаде на площадке.',
    link: { href: './tech-rigging.html', label: 'Технология «Риггинг без пинов»' }, body: [] },

  { id: 'starchenko-interview', type: 'interviews', date: '2026-07-28',
    title: 'Юрий Старченко — о собственном производстве и независимости от импорта',
    img: './assets/faces/starchenko.jpg', pos: '50% 30%',
    lead: 'Сооснователь компании — о том, почему DS PROAUDIO делает ключевые компоненты сама.',
    link: { href: './faces.html#face-starchenko', label: 'Карточка в разделе «Лица компании»' }, body: [] },

  { id: 'coaxial-arrays', type: 'engineering', date: '2026-07-14',
    title: 'Коаксиальные массивы ERA и TAURA 10: как устроен волновод',
    img: './assets/technologies/coaxial-waves.jpg',
    lead: 'Одна ось для ВЧ и СЧ: что это меняет в звучании массива и в его расчёте.',
    link: { href: './tech-coaxial-waveguide.html', label: 'Технология «Коаксиальные массивы»' }, body: [] },

  { id: 'bessonnitsa-stage', type: 'projects', date: '2026-06-30',
    title: 'Фестиваль «Бессонница»: малая музыкальная сцена',
    img: './assets/news-ds/bessonnitsa-2024-stage.jpg',
    lead: 'Открытая площадка, плотный график выступлений и звук, который должен работать весь день.',
    link: { href: './outdoor.html', label: 'Раздел «Открытые площадки»' }, body: [] },

  { id: 'yaroslavl-tyuz', type: 'projects', date: '2026-06-16',
    title: 'ТЮЗ имени В. С. Розова в Ярославле: звук для театральной сцены',
    img: './assets/portfolio/pf-030/cover.jpg',
    lead: 'Театральная акустика: голос актёра на первом плане и прозрачная фонограмма.',
    link: { href: './portfolio.html#pf-030', label: 'Проект в портфолио' }, body: [] }
];
