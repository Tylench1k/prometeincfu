// Header hamburger + full-menu bottom sheet — identical behaviour on every page
(function () {
  var toggle = document.getElementById('navToggle');
  var sheet = document.getElementById('mobileSheet');
  var backdrop = document.getElementById('sheetBackdrop');
  if (!toggle || !sheet || !backdrop) return;

  function openSheet() {
    sheet.classList.add('is-open');
    backdrop.classList.add('is-open');
    toggle.classList.add('is-active');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeSheet() {
    sheet.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    toggle.classList.remove('is-active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', function () {
    sheet.classList.contains('is-open') ? closeSheet() : openSheet();
  });
  backdrop.addEventListener('click', closeSheet);
  sheet.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeSheet); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });
})();
