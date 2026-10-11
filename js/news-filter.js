(function () {
  document.querySelectorAll('[data-news-feed]').forEach(function (feed) {
    var chips = feed.querySelectorAll('.filter-chip');
    var list = feed.querySelector ? feed.querySelector('.news-card, .news-grid--cards') : null;
    var items = Array.from(feed.querySelectorAll('.news-item[data-tags]'));
    if (!chips.length) return;
    var limit = parseInt(feed.dataset.newsLimit, 10);
    if (!(limit > 0)) limit = Infinity;

    // New entries carry their publication time; older static stories retain their existing order.
    items = items.map(function (item, index) {
      return { item: item, index: index, published: Date.parse(item.dataset.published || '') || 0 };
    }).sort(function (a, b) {
      return b.published - a.published || a.index - b.index;
    }).map(function (entry) { return entry.item; });
    if (list) items.forEach(function (item) { list.appendChild(item); });

    function applyFilter(filter) {
      var shown = 0;
      chips.forEach(function (chip) {
        var active = chip.dataset.filter === filter;
        chip.classList.toggle('is-active', active);
        chip.setAttribute('aria-pressed', String(active));
      });
      // Apply the topic before the home-page limit so every filter has its own latest three.
      items.forEach(function (item) {
        var tags = item.dataset.tags.split(',').map(function (tag) { return tag.trim(); });
        var matches = filter === 'all' || tags.includes(filter);
        item.hidden = !matches || shown >= limit;
        if (!item.hidden) shown++;
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () { applyFilter(chip.dataset.filter); });
    });
    applyFilter('all');
  });
})();
