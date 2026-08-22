// Filters .news-item elements by their data-tags attribute using the .filter-chip buttons
(function () {
  var chips = document.querySelectorAll('.filter-chip');
  var items = document.querySelectorAll('.news-item[data-tags]');
  if (!chips.length) return;

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('is-active'); });
      chip.classList.add('is-active');
      var filter = chip.dataset.filter;
      items.forEach(function (item) {
        var tags = item.dataset.tags.split(',');
        item.style.display = (filter === 'all' || tags.includes(filter)) ? '' : 'none';
      });
    });
  });
})();
