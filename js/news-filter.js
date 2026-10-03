(function () {
  document.querySelectorAll('[data-news-feed]').forEach(function (feed) {
    var chips = feed.querySelectorAll('.filter-chip');
    var items = feed.querySelectorAll('.news-item[data-tags]');
    if (!chips.length) return;
    var limit = parseInt(feed.dataset.newsLimit, 10);
    if (!(limit > 0)) limit = Infinity;

    function applyFilter(filter) {
      var shown = 0;
      chips.forEach(function (chip) {
        var active = chip.dataset.filter === filter;
        chip.classList.toggle('is-active', active);
        chip.setAttribute('aria-pressed', String(active));
      });
      // Entries are listed newest first. Apply the topic before the home-page limit.
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
