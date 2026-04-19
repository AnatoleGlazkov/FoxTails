/**
 * APP - Основная логика сайта Лиса
 * Поддерживает 4 страницы: index, watch, comics, gallery
 */

// ===== UTILITIES =====

function storageKey(type, id) {
  return `lisa_${type}_${id}`;
}

function loadFromStorage(key, defaultValue = []) {
  const raw = localStorage.getItem(key);
  try {
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// ===== LIKES SYSTEM =====

function getLikes(id) {
  return loadFromStorage(storageKey('likes', id), 0);
}

function addLike(id) {
  const likes = getLikes(id) + 1;
  saveToStorage(storageKey('likes', id), likes);
  return likes;
}

function hasLiked(id) {
  return loadFromStorage(storageKey('liked', id), false);
}

function setLiked(id) {
  saveToStorage(storageKey('liked', id), true);
}

function updateLikeButton(btn, countEl, id) {
  const liked = hasLiked(id);
  const count = getLikes(id);

  if (liked) {
    btn.classList.add('liked');
    btn.querySelector('.like-text').textContent = 'Понравилось!';
  } else {
    btn.classList.remove('liked');
    btn.querySelector('.like-text').textContent = 'Нравится';
  }

  if (countEl) {
    countEl.textContent = count.toLocaleString('ru-RU');
  }
}

function initLikeButton(btn, countEl, id) {
  updateLikeButton(btn, countEl, id);

  btn.addEventListener('click', () => {
    if (!hasLiked(id)) {
      addLike(id);
      setLiked(id);
      updateLikeButton(btn, countEl, id);

      // Animation
      btn.style.transform = 'scale(1.2)';
      setTimeout(() => btn.style.transform = '', 200);
    }
  });
}

// ===== COMMENTS SYSTEM =====

class CommentsManager {
  constructor(type, id) {
    this.type = type; // 'video' or 'comic'
    this.id = id;
    this.moderatorUnlocked = false;
  }

  storageKey(suffix) {
    return storageKey(`comments_${this.type}_${suffix}`, this.id);
  }

  loadComments(status) {
    return loadFromStorage(this.storageKey(status), []);
  }

  saveComments(status, comments) {
    saveToStorage(this.storageKey(status), comments);
  }

  addComment(name, text) {
    const pending = this.loadComments('pending');
    pending.unshift({
      name: name.trim(),
      text: text.trim(),
      date: new Date().toLocaleDateString('ru-RU')
    });
    this.saveComments('pending', pending);
  }

  approveComment(index) {
    const pending = this.loadComments('pending');
    const approved = this.loadComments('approved');

    if (index >= 0 && index < pending.length) {
      const [comment] = pending.splice(index, 1);
      approved.unshift(comment);
      this.saveComments('pending', pending);
      this.saveComments('approved', approved);
    }
  }

  render(approvedContainer, pendingContainer) {
    approvedContainer.innerHTML = '';
    pendingContainer.innerHTML = '';

    const approved = this.loadComments('approved');
    const pending = this.loadComments('pending');

    approved.forEach(comment => {
      approvedContainer.appendChild(this.createCommentCard(comment, false));
    });

    pending.forEach((comment, index) => {
      pendingContainer.appendChild(this.createCommentCard(comment, true, index));
    });
  }

  createCommentCard(comment, isPending, index) {
    const card = document.createElement('div');
    card.className = 'comment';

    card.innerHTML = `
      <div class="comment-header">
        <span class="comment-author">${escapeHtml(comment.name)}</span>
        <span class="comment-date">${comment.date}</span>
      </div>
      <div class="comment-text">${escapeHtml(comment.text)}</div>
    `;

    if (isPending && this.moderatorUnlocked) {
      const approveBtn = document.createElement('button');
      approveBtn.className = 'approve-btn';
      approveBtn.textContent = 'Одобрить';
      approveBtn.addEventListener('click', () => {
        this.approveComment(index);
        this.render(
          document.getElementById(`${this.type}ApprovedComments`),
          document.getElementById(`${this.type}PendingComments`)
        );
      });
      card.appendChild(approveBtn);
    }

    return card;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function initCommentsSection(config) {
  const {
    formId,
    nameInputId,
    textInputId,
    approvedContainerId,
    pendingContainerId,
    modToggleId,
    modCodeId,
    modEnterId,
    type,
    contentId
  } = config;

  const form = document.getElementById(formId);
  const nameInput = document.getElementById(nameInputId);
  const textInput = document.getElementById(textInputId);
  const approvedContainer = document.getElementById(approvedContainerId);
  const pendingContainer = document.getElementById(pendingContainerId);
  const modToggle = document.getElementById(modToggleId);
  const modCode = document.getElementById(modCodeId);
  const modEnter = document.getElementById(modEnterId);

  if (!form) return;

  const manager = new CommentsManager(type, contentId);

  // Initial render
  manager.render(approvedContainer, pendingContainer);

  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const text = textInput.value.trim();

    if (!name || !text) return;

    manager.addComment(name, text);
    nameInput.value = '';
    textInput.value = '';
    manager.render(approvedContainer, pendingContainer);
  });

  // Moderation
  modEnter.addEventListener('click', () => {
    const code = modCode.value.trim();
    manager.moderatorUnlocked = code === 'LISA-ADMIN' && modToggle.checked;
    modCode.value = '';
    manager.render(approvedContainer, pendingContainer);
  });

  modToggle.addEventListener('change', () => {
    if (!modToggle.checked) {
      manager.moderatorUnlocked = false;
      manager.render(approvedContainer, pendingContainer);
    }
  });

  return manager;
}

// ===== WATCH PAGE (Video) =====

function initWatchPage() {
  let activeSeason = null;
  let activeEpisode = null;
  let commentsManager = null;

  const seasonList = document.getElementById('seasonList');
  const episodeList = document.getElementById('episodeList');
  const seasonHint = document.getElementById('seasonHint');
  const episodeHint = document.getElementById('episodeHint');
  const episodeTitle = document.getElementById('episodeTitle');
  const episodeDesc = document.getElementById('episodeDesc');
  const videoPlayer = document.getElementById('videoPlayer');
  const castList = document.getElementById('castList');
  const reactionBar = document.getElementById('reactionBar');

  function renderSeasons() {
    seasonList.innerHTML = '';
    videoData.forEach(season => {
      const el = document.createElement('div');
      el.className = 'card' + (activeSeason?.id === season.id ? ' active' : '');
      el.textContent = season.title;
      el.addEventListener('click', () => {
        activeSeason = season;
        activeEpisode = null;
        renderSeasons();
        renderEpisodes();
        clearVideoSection();
      });
      seasonList.appendChild(el);
    });
  }

  function renderEpisodes() {
    episodeList.innerHTML = '';

    if (!activeSeason) {
      episodeHint.textContent = 'Сначала выбери сезон';
      episodeHint.style.color = '#9a7a5a';
      return;
    }

    episodeHint.textContent = `Сезон: ${activeSeason.title} — выбери серию`;
    episodeHint.style.color = 'var(--accent)';

    activeSeason.episodes.forEach(ep => {
      const el = document.createElement('div');
      el.className = 'card' + (activeEpisode?.id === ep.id ? ' active' : '');
      el.textContent = ep.title;
      el.addEventListener('click', () => {
        activeEpisode = ep;
        renderEpisodes();
        renderEpisodeDetails();
      });
      episodeList.appendChild(el);
    });
  }

  function clearVideoSection() {
    episodeTitle.textContent = 'Серия не выбрана';
    episodeDesc.textContent = 'Выбери сезон и серию выше, чтобы начать просмотр';
    videoPlayer.src = '';
    castList.innerHTML = '<li class="cast-empty">Выбери серию, чтобы увидеть актёров озвучки</li>';
    reactionBar.innerHTML = '<p class="reactions-hint">Выбери серию, чтобы оставить реакцию</p>';

    // Clear comments
    document.getElementById('approvedComments').innerHTML = '';
    document.getElementById('pendingComments').innerHTML = '';
  }

  function renderEpisodeDetails() {
    if (!activeEpisode) return;

    // Update title and description
    episodeTitle.textContent = activeEpisode.title;
    episodeDesc.textContent = activeEpisode.description;

    // Load video
    videoPlayer.src = activeEpisode.video;
    videoPlayer.load();

    // Render cast
    castList.innerHTML = '';
    activeEpisode.cast.forEach(member => {
      const li = document.createElement('li');
      li.textContent = member;
      castList.appendChild(li);
    });

    // Render reactions
    renderReactions();

    // Init comments with new episode ID
    if (commentsManager) {
      // Re-init comments section
    }
    commentsManager = initCommentsSection({
      formId: 'commentForm',
      nameInputId: 'commentName',
      textInputId: 'commentText',
      approvedContainerId: 'approvedComments',
      pendingContainerId: 'pendingComments',
      modToggleId: 'modToggle',
      modCodeId: 'modCode',
      modEnterId: 'modEnter',
      type: 'video',
      contentId: activeEpisode.id
    });

    // Scroll to video
    document.getElementById('episode').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderReactions() {
    if (!activeEpisode) return;

    const storageKey = `lisa_reactions_${activeEpisode.id}`;
    const counts = loadFromStorage(storageKey, {});

    reactionBar.innerHTML = '';
    reactionsData.forEach(reaction => {
      const el = document.createElement('div');
      el.className = 'reaction';
      const count = counts[reaction.id] || 0;
      el.innerHTML = `
        <span class="reaction-emoji">${reaction.label}</span>
        <span class="reaction-name">${reaction.name}</span>
        <span class="reaction-count">${count}</span>
      `;
      el.addEventListener('click', () => {
        counts[reaction.id] = (counts[reaction.id] || 0) + 1;
        saveToStorage(storageKey, counts);
        renderReactions();
      });
      reactionBar.appendChild(el);
    });
  }

  // Initialize
  renderSeasons();
  renderEpisodes();
}

// ===== COMICS PAGE =====

function initComicsPage() {
  let selectedComic = null;
  let currentPageIndex = 0;
  let comicsCommentsManager = null;

  const comicsGrid = document.getElementById('comicsGrid');
  const comicInfo = document.getElementById('comicInfo');
  const comicComments = document.getElementById('comicComments');
  const selectedComicTitle = document.getElementById('selectedComicTitle');
  const selectedComicDesc = document.getElementById('selectedComicDesc');
  const readComicBtn = document.getElementById('readComicBtn');
  const comicLikeBtn = document.getElementById('comicLikeBtn');
  const comicLikeCount = document.getElementById('comicLikeCount');

  // Reader elements
  const comicModal = document.getElementById('comicModal');
  const comicPage = document.getElementById('comicPage');
  const comicPageNum = document.getElementById('comicPageNum');
  const comicTotalPages = document.getElementById('comicTotalPages');
  const comicPrev = document.getElementById('comicPrev');
  const comicNext = document.getElementById('comicNext');
  const comicClose = document.getElementById('comicClose');

  function renderComics() {
    comicsGrid.innerHTML = '';
    comicsData.forEach(comic => {
      const card = document.createElement('div');
      card.className = 'comic-card' + (selectedComic?.id === comic.id ? ' active' : '');
      card.innerHTML = `
        <span class="comic-badge">${comic.pages.length} стр.</span>
        <img class="comic-cover" src="${comic.cover}" alt="${comic.title}"
             onerror="this.src='assets/logo.svg'; this.style.padding='20px'; this.style.background='linear-gradient(135deg, #ffe3c9, #ffc9e9)'">
        <div class="comic-info">
          <h3>${comic.title}</h3>
          <p>${comic.description.substring(0, 60)}...</p>
        </div>
      `;
      card.addEventListener('click', () => selectComic(comic));
      comicsGrid.appendChild(card);
    });
  }

  function selectComic(comic) {
    selectedComic = comic;
    renderComics();

    // Show info panel
    comicInfo.classList.remove('hidden');
    comicComments.classList.remove('hidden');

    // Update info
    selectedComicTitle.textContent = comic.title;
    selectedComicDesc.textContent = comic.description;

    // Initialize likes
    initLikeButton(comicLikeBtn, comicLikeCount, comic.id);

    // Initialize comments
    comicsCommentsManager = initCommentsSection({
      formId: 'comicCommentForm',
      nameInputId: 'comicCommentName',
      textInputId: 'comicCommentText',
      approvedContainerId: 'comicApprovedComments',
      pendingContainerId: 'comicPendingComments',
      modToggleId: 'comicModToggle',
      modCodeId: 'comicModCode',
      modEnterId: 'comicModEnter',
      type: 'comic',
      contentId: comic.id
    });

    // Scroll to info
    comicInfo.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Reader functions
  function openReader() {
    if (!selectedComic) return;
    currentPageIndex = 0;
    comicTotalPages.textContent = selectedComic.pages.length;
    comicModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    updatePage();
  }

  function closeReader() {
    comicModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updatePage() {
    if (!selectedComic) return;
    comicPage.src = selectedComic.pages[currentPageIndex];
    comicPageNum.textContent = currentPageIndex + 1;
    comicPrev.disabled = currentPageIndex === 0;
    comicNext.disabled = currentPageIndex === selectedComic.pages.length - 1;
  }

  function prevPage() {
    if (currentPageIndex > 0) {
      currentPageIndex--;
      updatePage();
    }
  }

  function nextPage() {
    if (selectedComic && currentPageIndex < selectedComic.pages.length - 1) {
      currentPageIndex++;
      updatePage();
    }
  }

  // Event listeners
  readComicBtn.addEventListener('click', openReader);
  comicPrev.addEventListener('click', prevPage);
  comicNext.addEventListener('click', nextPage);
  comicClose.addEventListener('click', closeReader);

  comicModal.addEventListener('click', (e) => {
    if (e.target === comicModal || e.target.classList.contains('comic-backdrop')) {
      closeReader();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!comicModal.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') prevPage();
    if (e.key === 'ArrowRight') nextPage();
    if (e.key === 'Escape') closeReader();
  });

  // Stage click zones
  document.querySelector('.comic-stage')?.addEventListener('click', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.3) prevPage();
    else if (x > rect.width * 0.7) nextPage();
  });

  // Initialize
  renderComics();
}

// ===== GALLERY PAGE =====

function initGalleryPage() {
  let currentFilter = 'all';
  let currentImageIndex = 0;
  let filteredImages = [];

  const galleryGrid = document.getElementById('galleryGrid');
  const galleryModal = document.getElementById('galleryModal');
  const galleryImage = document.getElementById('galleryImage');
  const galleryTitle = document.getElementById('galleryTitle');
  const galleryDesc = document.getElementById('galleryDesc');
  const galleryTag = document.getElementById('galleryTag');
  const galleryCurrent = document.getElementById('galleryCurrent');
  const galleryTotal = document.getElementById('galleryTotal');

  const filterButtons = document.querySelectorAll('.filter-btn');

  function filterImages() {
    if (currentFilter === 'all') {
      filteredImages = [...galleryData];
    } else {
      filteredImages = galleryData.filter(img => img.category === currentFilter);
    }
  }

  function renderGallery() {
    filterImages();
    galleryGrid.innerHTML = '';

    filteredImages.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'gallery-item';
      card.innerHTML = `
        <img src="${item.image}" alt="${item.title}"
             onerror="this.src='assets/logo.svg'; this.style.padding='40px'; this.style.background='linear-gradient(135deg, #ffe3c9, #ffc9e9)'">
        <div class="gallery-item-overlay">
          <h4>${item.title}</h4>
          <span class="gallery-category">${getCategoryName(item.category)}</span>
        </div>
      `;
      card.addEventListener('click', () => openLightbox(index));
      galleryGrid.appendChild(card);
    });
  }

  function getCategoryName(cat) {
    const names = {
      characters: 'Персонажи',
      scenes: 'Сцены',
      fanart: 'Фан-арты',
      sketches: 'Наброски'
    };
    return names[cat] || cat;
  }

  function openLightbox(index) {
    currentImageIndex = index;
    updateLightbox();
    galleryModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    galleryModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updateLightbox() {
    const item = filteredImages[currentImageIndex];
    if (!item) return;

    galleryImage.src = item.image;
    galleryImage.alt = item.title;
    galleryTitle.textContent = item.title;
    galleryDesc.textContent = item.description;
    galleryTag.textContent = getCategoryName(item.category);
    galleryCurrent.textContent = currentImageIndex + 1;
    galleryTotal.textContent = filteredImages.length;
  }

  function prevImage() {
    if (currentImageIndex > 0) {
      currentImageIndex--;
      updateLightbox();
    }
  }

  function nextImage() {
    if (currentImageIndex < filteredImages.length - 1) {
      currentImageIndex++;
      updateLightbox();
    }
  }

  // Filter buttons
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderGallery();
    });
  });

  // Navigation
  document.getElementById('galleryPrev').addEventListener('click', prevImage);
  document.getElementById('galleryNext').addEventListener('click', nextImage);
  document.getElementById('galleryClose').addEventListener('click', closeLightbox);

  galleryModal.addEventListener('click', (e) => {
    if (e.target === galleryModal || e.target.classList.contains('gallery-backdrop')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!galleryModal.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'Escape') closeLightbox();
  });

  // Initialize
  renderGallery();
}

// ===== INDEX PAGE =====

function renderNews() {
  const newsGrid = document.getElementById('newsGrid');
  if (!newsGrid) return;

  newsGrid.innerHTML = '';
  newsData.forEach(news => {
    const card = document.createElement('article');
    card.className = 'news-card';
    card.innerHTML = `
      <div class="news-image">
        <img src="${news.image}" alt="${news.title}"
             onerror="this.style.display='none'; this.parentElement.style.background='linear-gradient(135deg, #ff7a1a, #ff3d8f)'">
      </div>
      <div class="news-content">
        <span class="news-category">${getNewsCategoryName(news.category)}</span>
        <h3>${news.title}</h3>
        <p>${news.summary}</p>
        <time>${formatDate(news.date)}</time>
      </div>
    `;
    newsGrid.appendChild(card);
  });
}

function getNewsCategoryName(cat) {
  const names = {
    announcement: 'Анонс',
    comics: 'Комиксы',
    community: 'Сообщество',
    backstage: 'За кулисами'
  };
  return names[cat] || cat;
}

function renderLatestComments() {
  const container = document.getElementById('latestComments');
  if (!container) return;

  // Collect all comments from localStorage
  const allComments = [];

  // Scan localStorage for video and comic comments
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.includes('comments_approved')) {
      const comments = loadFromStorage(key, []);
      comments.forEach(c => allComments.push(c));
    }
  }

  // Sort by date (newest first) and take first 5
  const latest = allComments.slice(0, 5);

  if (latest.length === 0) {
    container.innerHTML = '<p class="no-comments">Пока нет комментариев. Будь первым!</p>';
    return;
  }

  container.innerHTML = '';
  latest.forEach(comment => {
    const card = document.createElement('div');
    card.className = 'latest-comment';
    card.innerHTML = `
      <div class="latest-comment-header">
        <strong>${escapeHtml(comment.name)}</strong>
        <span>${comment.date}</span>
      </div>
      <p>${escapeHtml(comment.text.substring(0, 100))}${comment.text.length > 100 ? '...' : ''}</p>
    `;
    container.appendChild(card);
  });
}

// ===== ACTIVE NAV LINK =====

function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.top-nav a');

  navLinks.forEach(link => {
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Initialize nav on all pages
document.addEventListener('DOMContentLoaded', setActiveNavLink);
