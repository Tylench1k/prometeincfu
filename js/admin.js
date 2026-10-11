(function () {
  'use strict';

  var USER = 'Prometei';
  var PASS = 'NCFU';
  var loginPanel = document.getElementById('loginPanel');
  var editorPanel = document.getElementById('editorPanel');
  var loginStatus = document.getElementById('loginStatus');
  var saveStatus = document.getElementById('saveStatus');
  var photoInput = document.querySelector('[name="photos"]');
  var photoList = document.getElementById('photoList');
  var photos = [];
  var directory = null;

  function showEditor() {
    loginPanel.hidden = true;
    editorPanel.hidden = false;
  }

  document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();
    var data = new FormData(event.currentTarget);
    if (data.get('login') === USER && data.get('password') === PASS) {
      sessionStorage.setItem('prometei-news-editor', 'open');
      loginStatus.textContent = '';
      showEditor();
    } else {
      loginStatus.textContent = 'Логин или пароль не подошли.';
    }
  });

  document.getElementById('logoutButton').addEventListener('click', function () {
    sessionStorage.removeItem('prometei-news-editor');
    editorPanel.hidden = true;
    loginPanel.hidden = false;
    document.getElementById('loginForm').reset();
  });

  if (sessionStorage.getItem('prometei-news-editor') === 'open') showEditor();

  function drawPhotos() {
    photoList.replaceChildren();
    photos.forEach(function (file, index) {
      var item = document.createElement('li');
      item.textContent = file.name + ' — перетащи, чтобы изменить порядок';
      item.draggable = true;
      item.dataset.index = index;
      item.addEventListener('dragstart', function () { item.classList.add('dragging'); });
      item.addEventListener('dragover', function (event) {
        event.preventDefault();
        var dragging = photoList.querySelector('.dragging');
        if (dragging && dragging !== item) {
          var bounds = item.getBoundingClientRect();
          photoList.insertBefore(dragging, event.clientY < bounds.top + bounds.height / 2 ? item : item.nextSibling);
        }
      });
      item.addEventListener('dragend', function () {
        item.classList.remove('dragging');
        var from = Number(item.dataset.index);
        var target = Array.from(photoList.children).indexOf(item);
        if (from !== target && target >= 0) {
          var moved = photos.splice(from, 1)[0];
          photos.splice(target, 0, moved);
          drawPhotos();
        }
      });
      photoList.appendChild(item);
    });
  }

  photoInput.addEventListener('change', function () {
    photos = Array.from(photoInput.files || []).filter(function (file) { return file.type.indexOf('image/') === 0; });
    drawPhotos();
  });

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function makeSlug(title) {
    var map = { а:'a', б:'b', в:'v', г:'g', д:'d', е:'e', ё:'e', ж:'zh', з:'z', и:'i', й:'y', к:'k', л:'l', м:'m', н:'n', о:'o', п:'p', р:'r', с:'s', т:'t', у:'u', ф:'f', х:'h', ц:'ts', ч:'ch', ш:'sh', щ:'sch', ъ:'', ы:'y', ь:'', э:'e', ю:'yu', я:'ya' };
    var slug = title.toLowerCase().split('').map(function (char) { return map[char] === undefined ? char : map[char]; }).join('')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64);
    return slug || 'novost';
  }

  function paragraphs(text) {
    return text.trim().split(/\n\s*\n/).map(function (part) {
      return part.trim().split('\n').map(escapeHtml).join('<br>');
    }).filter(Boolean).map(function (part) { return '<p>' + part + '</p>'; }).join('\n');
  }

  function makeArticle(title, category, body, eventDate, slug, imagePaths) {
    var imageBlock = imagePaths.length > 1
      ? '<div class="news-gallery" data-news-gallery><div class="gallery-viewport" tabindex="0" aria-label="Фотографии новости">' + imagePaths.map(function (path, i) {
        return '<figure class="gallery-slide"><img src="' + path + '" alt="' + escapeHtml(title) + ' — фото ' + (i + 1) + '" loading="lazy" decoding="async"></figure>';
      }).join('') + '</div><div class="gallery-controls"><button class="gallery-arrow gallery-prev" type="button" aria-label="Предыдущее фото" data-gallery-prev>‹</button><button class="gallery-arrow gallery-next" type="button" aria-label="Следующее фото" data-gallery-next>›</button></div></div><div class="gallery-caption"><span>' + escapeHtml(title) + '</span><span data-gallery-status>1 / ' + imagePaths.length + '</span></div>'
      : imagePaths.length ? '<img class="news-image" src="' + imagePaths[0] + '" alt="' + escapeHtml(title) + '" decoding="async">' : '';
    return '<!DOCTYPE html>\n<html lang="ru"><head><meta charset="UTF-8"><script>(function(){var t=localStorage.getItem(\'prometheus-theme\');if(!t){t=window.matchMedia(\'(prefers-color-scheme: dark)\').matches?\'dark\':\'light\';}document.documentElement.setAttribute(\'data-theme\',t);})();</script><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>' + escapeHtml(title) + ' — Прометей</title><meta name="theme-color" content="#FAF6EE"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="../css/tokens.css"><link rel="stylesheet" href="../css/buttons.css"><link rel="stylesheet" href="../css/header.css"><link rel="stylesheet" href="../css/animations.css"><link rel="stylesheet" href="../css/footer.css"><link rel="stylesheet" href="../css/page.css"><link rel="stylesheet" href="../css/news.css"></head><body><div class="site-header-wrap"><header class="site-header"><a href="../index.html" class="brand"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 40 52"><path d="M20 4 C 12 14 6 23 6 33 C 6 43 13 49 20 49 C 27 49 34 43 34 33 C 34 26 30 21 27 18 C 28 23 25 27 22 27 C 24 21 22 12 20 4 Z" fill="none" stroke="var(--color-accent)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="brand-text"><span class="brand-name">Прометей</span><span class="brand-sub">СНО · ФМО СКФУ</span></span></a><div class="header-actions"><button class="theme-toggle" id="themeToggle" aria-label="Переключить тему"><svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2m0 16v2M2 12h2m16 0h2"></path></svg><svg class="icon-moon" viewBox="0 0 24 24" fill="currentColor"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4 7 7 0 0 0 20 14.5Z"></path></svg></button></div></header></div><main class="page-main"><div class="section-inner"><article class="content-card"><a class="back-link" href="index.html">← Все новости</a><div class="content-header"><span class="news-tag">' + escapeHtml(category) + '</span>' + (eventDate ? '<p class="eyebrow" style="margin-top:1rem">' + escapeHtml(eventDate) + '</p>' : '') + '<h1>' + escapeHtml(title) + '</h1></div>' + imageBlock + '<div class="article-body news-article-body">' + paragraphs(body) + '</div></article></div></main><footer class="site-footer"><div class="footer-card"><div class="footer-bottom"><span>© 2026 СНО «Прометей» · ФМО СКФУ</span><div class="social-row"><a class="social-btn" href="https://vk.ru/prometeincfu" aria-label="Прометей ВКонтакте">VK</a><a class="social-btn" href="https://t.me/prometeincfu" aria-label="Прометей Telegram">TG</a></div></div></div></footer><script src="../js/theme.js"></script><script src="../js/news-gallery.js"></script></body></html>';
  }

  function makeHomeCard(slug, title, category, eventDate, published) {
    return '<a class="news-featured news-item reveal" data-tags="' + escapeHtml(category) + '" data-published="' + published + '" href="news/' + slug + '.html"><div class="news-meta"><span class="news-tag">' + escapeHtml(category) + '</span>' + (eventDate ? '<span class="news-date">' + escapeHtml(eventDate) + '</span>' : '') + '</div><h3 class="news-featured-title">' + escapeHtml(title) + '</h3></a>';
  }

  function makeArchiveCard(slug, title, category, eventDate, published, imagePath) {
    return '<li class="news-grid-item news-item reveal" data-tags="' + escapeHtml(category) + '" data-published="' + published + '"><a class="news-preview" href="../news/' + slug + '.html">' + (imagePath ? '<img class="news-preview-image" src="' + imagePath + '" alt="' + escapeHtml(title) + '" loading="lazy" decoding="async">' : '') + '<div class="news-preview-copy"><div class="news-meta">' + (eventDate ? '<span class="news-date">' + escapeHtml(eventDate) + '</span>' : '') + '<span class="news-tag">' + escapeHtml(category) + '</span></div><h3>' + escapeHtml(title) + '</h3><span class="news-read-more">Читать новость ↗</span></div></a></li>';
  }

  async function readFile(root, path) {
    var parts = path.split('/');
    var dir = root;
    for (var i = 0; i < parts.length - 1; i++) dir = await dir.getDirectoryHandle(parts[i]);
    var handle = await dir.getFileHandle(parts[parts.length - 1]);
    return { dir: dir, handle: handle, text: await (await handle.getFile()).text() };
  }

  async function writeFile(dir, name, content) {
    var handle = await dir.getFileHandle(name, { create: true });
    var writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  document.getElementById('newsForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    saveStatus.textContent = '';
    var form = event.currentTarget;
    var button = document.getElementById('publishButton');
    if (!window.showDirectoryPicker) {
      saveStatus.textContent = 'Для сохранения файлов открой редактор в актуальном Chrome или Edge.';
      return;
    }
    button.disabled = true;
    try {
      var data = new FormData(form);
      var title = String(data.get('title')).trim();
      var category = String(data.get('category'));
      var body = String(data.get('body')).trim();
      var eventDate = String(data.get('eventDate') || '').trim();
      var baseSlug = makeSlug(title);
      var published = new Date().toISOString();
      saveStatus.textContent = 'Выбери папку сайта на компьютере…';
      directory = await window.showDirectoryPicker({ mode: 'readwrite' });

      var homeFile = await readFile(directory, 'index.html');
      var archiveFile = await readFile(directory, 'news/index.html');
      var homeDoc = new DOMParser().parseFromString(homeFile.text, 'text/html');
      var archiveDoc = new DOMParser().parseFromString(archiveFile.text, 'text/html');
      var homeList = homeDoc.querySelector('.news-card');
      var archiveList = archiveDoc.querySelector('.news-grid--cards');
      if (!homeList || !archiveList) throw new Error('Не найдены списки новостей. Выбери корневую папку сайта.');

      var newsDir = await directory.getDirectoryHandle('news');
      var imageDir = await directory.getDirectoryHandle('images', { create: true });
      var slug = baseSlug;
      var suffix = 2;
      while (true) {
        try { await newsDir.getFileHandle(slug + '.html'); slug = baseSlug + '-' + suffix++; }
        catch (error) { if (error.name === 'NotFoundError') break; throw error; }
      }

      saveStatus.textContent = 'Сохраняю страницу и фотографии…';
      var imagePaths = [];
      for (var i = 0; i < photos.length; i++) {
        var photo = photos[i];
        var extension = (photo.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
        var imageName = slug + '-' + String(i + 1).padStart(2, '0') + '.' + extension;
        await writeFile(imageDir, imageName, photo);
        imagePaths.push('../images/' + imageName);
      }

      var homeItem = new DOMParser().parseFromString(makeHomeCard(slug, title, category, eventDate, published), 'text/html').body.firstElementChild;
      var archiveImage = imagePaths.length ? imagePaths[0].replace('../images/', '../images/') : '';
      var archiveItem = new DOMParser().parseFromString(makeArchiveCard(slug, title, category, eventDate, published, archiveImage), 'text/html').body.firstElementChild;
      homeList.prepend(homeItem);
      archiveList.prepend(archiveItem);

      await writeFile(newsDir, slug + '.html', makeArticle(title, category, body, eventDate, slug, imagePaths));
      await writeFile(homeFile.dir, 'index.html', '<!DOCTYPE html>\n' + homeDoc.documentElement.outerHTML);
      await writeFile(archiveFile.dir, 'index.html', '<!DOCTYPE html>\n' + archiveDoc.documentElement.outerHTML);
      saveStatus.textContent = 'Готово. Страница новости, фотографии, главная и архив обновлены в выбранной папке. Теперь загрузи изменённые файлы на GitHub.';
      form.reset();
      photos = [];
      drawPhotos();
    } catch (error) {
      if (error.name === 'AbortError') saveStatus.textContent = 'Сохранение отменено.';
      else saveStatus.textContent = 'Не удалось сохранить: ' + error.message;
    } finally {
      button.disabled = false;
    }
  });
})();
