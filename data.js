/**
 * DATA - Все данные сайта
 * Этот файл содержит все данные: сезоны, серии, комиксы, новости, галерею
 */

// Видео-контент: сезоны и серии
const videoData = [
  {
    id: 's1',
    title: 'Сезон 1',
    episodes: [
      {
        id: 's1e1',
        title: 'Серия 1. Лес',
        description: 'Зина и Макс на летних каникулах впервые встречают Лису.',
        video: 'videos/season1/episode1.mp4',
        cast: [
          'Лиса — Лена Г.',
          'Зина — Маша Ц.',
          'Макс — Даша Г.'
        ],
        thumbnail: 'assets/thumbnails/s1e1.jpg'
      },
      {
        id: 's1e2',
        title: 'Серия 2. Лесной концерт',
        description: 'Лиса собирает друзей, чтобы устроить самый громкий концерт в лесу.',
        video: 'videos/season1/episode2.mp4',
        cast: [
          'Лиса — Марина К.',
          'Белка — Саша М.',
          'Медведь — Антон П.'
        ],
        thumbnail: 'assets/thumbnails/s1e2.jpg'
      }
    ]
  },
  {
    id: 's2',
    title: 'Сезон 2',
    episodes: [
      {
        id: 's2e1',
        title: 'Серия 1. Пирог для луны',
        description: 'Лиса решает испечь пирог, который долетит до луны.',
        video: 'videos/season2/episode1.mp4',
        cast: [
          'Лиса — Марина К.',
          'Заяц — Лена Г.'
        ],
        thumbnail: 'assets/thumbnails/s2e1.jpg'
      }
    ]
  }
];

// Комиксы
const comicsData = [
  {
    id: 'comic1',
    title: 'Лиса и Загадочный Орех',
    description: 'Однажды утром Лиса нашла орех, который светился волшебным светом. Что же в нём такого особенного?',
    cover: 'assets/comics/comic1/cover.jpg',
    pages: [
      'assets/comics/comic1/page1.jpg',
      'assets/comics/comic1/page2.jpg',
      'assets/comics/comic1/page3.jpg',
      'assets/comics/comic1/page4.jpg'
    ]
  },
  {
    id: 'comic2',
    title: 'Приключения в Облачном Городе',
    description: 'Лиса и Заяц построили воздушный шар и полетели выше облаков! Что они там увидели?',
    cover: 'assets/comics/comic2/cover.jpg',
    pages: [
      'assets/comics/comic2/page1.jpg',
      'assets/comics/comic2/page2.jpg',
      'assets/comics/comic2/page3.jpg',
      'assets/comics/comic2/page4.jpg',
      'assets/comics/comic2/page5.jpg'
    ]
  },
  {
    id: 'comic3',
    title: 'Тайна Звёздной Ночи',
    description: 'Почему звёзды мигают? Лиса отправилась выяснять и нашла кое-что удивительное!',
    cover: 'assets/comics/comic3/cover.jpg',
    pages: [
      'assets/comics/comic3/page1.jpg',
      'assets/comics/comic3/page2.jpg',
      'assets/comics/comic3/page3.jpg',
      'assets/comics/comic3/page4.jpg'
    ]
  },
  {
    id: 'comic4',
    title: 'День Рождения Лисы',
    description: 'Все друзья собрались поздравить Лису. Но где же сам именинник?',
    cover: 'assets/comics/comic4/cover.jpg',
    pages: [
      'assets/comics/comic4/page1.jpg',
      'assets/comics/comic4/page2.jpg',
      'assets/comics/comic4/page3.jpg',
      'assets/comics/comic4/page4.jpg',
      'assets/comics/comic4/page5.jpg',
      'assets/comics/comic4/page6.jpg'
    ]
  }
];

// Новости для главной страницы
const newsData = [
  {
    id: 'news1',
    title: 'Новый сезон уже в разработке!',
    date: '2025-01-15',
    summary: 'Мы начали работу над 3 сезоном. Лиса ждёт новые приключения!',
    image: 'assets/news/season3-announce.jpg',
    category: 'announcement'
  },
  {
    id: 'news2',
    title: 'Новый комикс: День Рождения Лисы',
    date: '2025-01-10',
    summary: 'Встречайте новую историю в картинках! 6 страниц веселья.',
    image: 'assets/news/comic4-release.jpg',
    category: 'comics'
  },
  {
    id: 'news3',
    title: 'Фан-арт месяца',
    date: '2025-01-05',
    summary: 'Лучшие рисунки от наших зрителей. Спасибо за ваше творчество!',
    image: 'assets/news/fanart-january.jpg',
    category: 'community'
  },
  {
    id: 'news4',
    title: 'За кулисами: как мы озвучиваем серии',
    date: '2024-12-28',
    summary: 'Рассказываем, как создаётся звук для Лисы.',
    image: 'assets/news/behind-scenes.jpg',
    category: 'backstage'
  }
];

// Галерея рисунков
const galleryData = [
  {
    id: 'art1',
    title: 'Лиса в лесу',
    description: 'Акварель, 2024',
    image: 'assets/gallery/fox-forest.jpg',
    category: 'characters'
  },
  {
    id: 'art2',
    title: 'Заяц читает книгу',
    description: 'Цифровой рисунок',
    image: 'assets/gallery/hare-reading.jpg',
    category: 'characters'
  },
  {
    id: 'art3',
    title: 'Ночной пикник',
    description: 'Сцена из 2 сезона',
    image: 'assets/gallery/night-picnic.jpg',
    category: 'scenes'
  },
  {
    id: 'art4',
    title: 'Лиса-волшебница',
    description: 'Фан-арт от Маши, 10 лет',
    image: 'assets/gallery/fox-magician.jpg',
    category: 'fanart'
  },
  {
    id: 'art5',
    title: 'Эскизы персонажей',
    description: 'Первые наброски Лисы',
    image: 'assets/gallery/fox-sketches.jpg',
    category: 'sketches'
  },
  {
    id: 'art6',
    title: 'Друзья навсегда',
    description: 'Акварель',
    image: 'assets/gallery/friends.jpg',
    category: 'characters'
  },
  {
    id: 'art7',
    title: 'Лесной концерт',
    description: 'Сцена из 1 сезона',
    image: 'assets/gallery/forest-concert.jpg',
    category: 'scenes'
  },
  {
    id: 'art8',
    title: 'Зимняя Лиса',
    description: 'Фан-арт',
    image: 'assets/gallery/winter-fox.jpg',
    category: 'fanart'
  }
];

// Реакции для видео
const reactionsData = [
  { id: 'smile', label: '😄', name: 'Весело' },
  { id: 'wow', label: '🤩', name: 'Вау' },
  { id: 'heart', label: '🧡', name: 'Люблю' },
  { id: 'spark', label: '✨', name: 'Магия' },
  { id: 'fox', label: '🦊', name: 'Лиса' }
];
