(function () {
  var toggle = document.getElementById('navToggle');
  var sheet = document.getElementById('mobileSheet');
  var backdrop = document.getElementById('sheetBackdrop');
  var handle = sheet ? sheet.querySelector('.sheet-handle') : null;
  if (!toggle || !sheet || !backdrop) return;

  function openSheet() {
    sheet.style.removeProperty('--drag-y');
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
    window.setTimeout(function () { sheet.style.removeProperty('--drag-y'); }, 400);
  }

  toggle.addEventListener('click', function () {
    sheet.classList.contains('is-open') ? closeSheet() : openSheet();
  });
  backdrop.addEventListener('click', closeSheet);
  sheet.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeSheet); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });

  if (handle && window.PointerEvent) {
    var startY = 0, dragY = 0, dragging = false;
    var CLOSE_THRESHOLD = 90;

    handle.addEventListener('pointerdown', function (e) {
      dragging = true;
      startY = e.clientY;
      sheet.classList.add('is-dragging');
      handle.setPointerCapture(e.pointerId);
    });

    handle.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      dragY = Math.max(0, e.clientY - startY);
      sheet.style.setProperty('--drag-y', dragY + 'px');
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      sheet.classList.remove('is-dragging');
      if (dragY > CLOSE_THRESHOLD) {
        closeSheet();
      } else {
        sheet.style.setProperty('--drag-y', '0px');
      }
      dragY = 0;
    }
    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);
  }
})();
