(function () {
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- шапка: после прокрутки получает более плотный «стеклянный» вид (как панели iOS) --- */
  var headerWrap = document.querySelector('.site-header-wrap');
  if (headerWrap) {
    var ticking = false;
    var update = function () {
      headerWrap.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* --- плавное появление блоков при прокрутке --- */
  var els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  if (prefersReduced || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('is-visible', 'is-settled'); });
    return;
  }

  var batchTimer = null;
  var batchIndex = 0;

  function show(el, i) {
    el.style.setProperty('--reveal-delay', (i * 0.08) + 's');
    el.classList.add('is-visible');
    // когда появление закончилось — возвращаем обычные «живые» переходы наведения
    window.setTimeout(function () {
      el.classList.add('is-settled');
      el.style.removeProperty('--reveal-delay');
    }, 1100 + i * 80);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      show(entry.target, batchIndex++);
    });
    // каскад (задержка по порядку) действует только внутри одной «пачки» блоков
    window.clearTimeout(batchTimer);
    batchTimer = window.setTimeout(function () { batchIndex = 0; }, 120);
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  els.forEach(function (el) { io.observe(el); });
})();
