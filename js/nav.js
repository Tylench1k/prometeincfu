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
    // убираем смещение сразу: лист плавно доедет вниз из текущей точки
    sheet.style.removeProperty('--drag-y');
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

  /* Перетаскивание листа за «ручку»: тянется за пальцем, закрывается по броску или по расстоянию,
     вверх — «резиновое» сопротивление, как в iOS. */
  if (handle && window.PointerEvent) {
    var startY = 0, dragY = 0, dragging = false;
    var lastY = 0, lastT = 0, velocity = 0;
    var CLOSE_DISTANCE = 100;
    var CLOSE_VELOCITY = 0.6; // px/мс

    handle.addEventListener('pointerdown', function (e) {
      dragging = true;
      startY = lastY = e.clientY;
      lastT = e.timeStamp;
      velocity = 0;
      sheet.classList.add('is-dragging');
      handle.setPointerCapture(e.pointerId);
    });

    handle.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var delta = e.clientY - startY;
      dragY = delta >= 0 ? delta : -Math.pow(-delta, 0.7); // сопротивление при движении вверх
      var dt = e.timeStamp - lastT;
      if (dt > 0) velocity = 0.8 * velocity + 0.2 * ((e.clientY - lastY) / dt);
      lastY = e.clientY;
      lastT = e.timeStamp;
      sheet.style.setProperty('--drag-y', dragY + 'px');
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      sheet.classList.remove('is-dragging');
      if (dragY > CLOSE_DISTANCE || velocity > CLOSE_VELOCITY) {
        closeSheet();
      } else {
        sheet.style.setProperty('--drag-y', '0px'); // пружинит обратно на место
      }
      dragY = 0;
    }
    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);
  }
})();
