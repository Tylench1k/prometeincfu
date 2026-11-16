(function () {
  var root = document.documentElement;
  var btn = document.getElementById('themeToggle');
  var metaTheme = document.querySelector('meta[name="theme-color"]');
  if (!btn) return;

  var COLORS = { light: '#FAF6EE', dark: '#101B33' };
  var english = root.lang === 'en';
  var switchTimer = null;

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('prometheus-theme', theme); } catch (e) {}
    if (metaTheme) metaTheme.setAttribute('content', COLORS[theme] || COLORS.light);
    btn.setAttribute('aria-label', english ? (theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme') : (theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'));
  }

  apply(root.getAttribute('data-theme') || 'light');

  btn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    // на время смены темы включаем плавные переходы цветов у всех элементов
    root.classList.add('theme-switching');
    window.clearTimeout(switchTimer);
    switchTimer = window.setTimeout(function () { root.classList.remove('theme-switching'); }, 650);
    apply(next);
  });
})();
