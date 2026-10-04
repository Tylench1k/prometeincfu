(function () {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('[data-gallery]').forEach(function (gallery) {
    var viewport = gallery.querySelector('.gallery-viewport');
    var slides = gallery.querySelectorAll('.gallery-slide');
    var controls = gallery.querySelector('.gallery-controls');
    var previous = gallery.querySelector('[data-gallery-prev]');
    var next = gallery.querySelector('[data-gallery-next]');
    var caption = gallery.nextElementSibling;
    var status = caption ? caption.querySelector('[data-gallery-status]') : null;
    if (!viewport || slides.length < 2 || !controls || !previous || !next) return;

    var current = 0;
    var scrollTimer;
    controls.hidden = false;

    function updateStatus() {
      if (!viewport.clientWidth) return;
      current = Math.max(0, Math.min(slides.length - 1, Math.round(viewport.scrollLeft / viewport.clientWidth)));
      var text = (current + 1) + ' / ' + slides.length;
      if (status && status.textContent !== text) status.textContent = text;
    }

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      viewport.scrollTo({
        left: current * viewport.clientWidth,
        behavior: reducedMotion.matches ? 'auto' : 'smooth'
      });
    }

    previous.addEventListener('click', function () { goTo(current - 1); });
    next.addEventListener('click', function () { goTo(current + 1); });
    viewport.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') goTo(current - 1);
      else if (event.key === 'ArrowRight') goTo(current + 1);
      else if (event.key === 'Home') goTo(0);
      else if (event.key === 'End') goTo(slides.length - 1);
      else return;
      event.preventDefault();
    });

    viewport.addEventListener('scroll', function () {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(updateStatus, 120);
    }, { passive: true });

    // Native overflow and scroll snap handle finger swipes without blocking page scrolling.
    function alignAfterResize() {
      window.clearTimeout(scrollTimer);
      viewport.scrollTo({ left: current * viewport.clientWidth, behavior: 'auto' });
      updateStatus();
    }
    if ('ResizeObserver' in window) {
      new ResizeObserver(alignAfterResize).observe(viewport);
    } else {
      window.addEventListener('resize', alignAfterResize);
    }
    updateStatus();
  });
})();
