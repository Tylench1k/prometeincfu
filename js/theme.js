(function () {
  var root = document.documentElement;
  var btn = document.getElementById('themeToggle');
  var metaTheme = document.querySelector('meta[name="theme-color"]');
  if (!btn) return;

  var COLORS = { light: '#FAF6EE', dark: '#101B33' };

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('prometheus-theme', theme);
    if (metaTheme) metaTheme.setAttribute('content', COLORS[theme] || COLORS.light);
    btn.setAttribute('aria-label', theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему');
  }

  apply(root.getAttribute('data-theme') || 'light');

  btn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
  });
})();
