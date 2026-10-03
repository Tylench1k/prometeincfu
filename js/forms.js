(function () {
  document.querySelectorAll('[data-native-form]').forEach(function (form) {
    var card = form.closest('.form-card');
    var response = card.querySelector('[data-form-response]');
    var frame = card.querySelector('[data-form-frame]');
    var status = form.querySelector('[data-form-status]');
    var submit = form.querySelector('[type="submit"]');
    var pending = false;
    var english = form.dataset.formLanguage === 'en';
    var timer;
    response.hidden = true;

    form.querySelectorAll('[data-other-toggle]').forEach(function (toggle) {
      var answer = document.getElementById(toggle.dataset.otherToggle);
      if (!answer) return;
      function syncOther() { answer.disabled = !toggle.checked; answer.required = toggle.checked; }
      toggle.addEventListener('change', syncOther);
      syncOther();
    });

    form.addEventListener('submit', function (event) {
      if (pending) { event.preventDefault(); return; }
      form.querySelectorAll('input[type="text"], textarea').forEach(function (input) { input.value = input.value.trim(); });
      if (!form.reportValidity()) { event.preventDefault(); return; }
      pending = true;
      submit.disabled = true;
      status.textContent = english ? 'Sending…' : 'Отправляем…';
      timer = window.setTimeout(function () {
        if (pending) status.textContent = english ? 'Waiting for a response. Please do not submit again until confirmation appears.' : 'Ожидаем ответ. Не отправляй анкету повторно, пока не появится подтверждение.';
      }, 20000);
      // Keep the POST response inside the site without displaying the provider's interface.
    });

    frame.addEventListener('load', function () {
      if (!pending) return;
      pending = false;
      window.clearTimeout(timer);
      submit.disabled = false;
      status.textContent = '';
      form.hidden = true;
      response.hidden = false;
      response.querySelector('h2').focus({ preventScroll: true });
      response.scrollIntoView({ behavior: 'auto', block: 'start' });
    });

  });
})();
