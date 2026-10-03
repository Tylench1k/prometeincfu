(function () {
  document.querySelectorAll('.article-quote').forEach(function (quote) {
    var summary = quote.querySelector('summary');
    var animation;
    var expanded = quote.open;

    summary.addEventListener('click', function (event) {
      if (!quote.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      event.preventDefault();
      var startHeight = quote.getBoundingClientRect().height;
      expanded = !expanded;
      if (animation) animation.cancel();

      quote.open = expanded;
      var endHeight = quote.getBoundingClientRect().height;
      // Keep the contents rendered until the closing animation finishes.
      quote.open = true;
      quote.style.overflow = 'hidden';
      animation = quote.animate([
        { height: startHeight + 'px' },
        { height: endHeight + 'px' }
      ], { duration: 320, easing: 'cubic-bezier(.2, .7, .3, 1)' });

      animation.onfinish = function () {
        quote.open = expanded;
        quote.style.overflow = '';
        animation = null;
      };
    });

    quote.addEventListener('toggle', function () {
      if (!animation) expanded = quote.open;
    });
  });
})();
