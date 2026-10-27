(function () {
  'use strict';

  // ВСТАВЬТЕ СЮДА адрес веб-приложения Google Apps Script (см. ИНСТРУКЦИЯ.md, шаг 4).
  var ENDPOINT = 'PASTE_WEB_APP_URL_HERE';
  // Должен совпадать с TOKEN в Code.gs (уже подставлен автоматически).
  var TOKEN = '2574897af634631fab1473a7b91cbfa8';
  var MAX_BYTES = 10 * 1024 * 1024;
  var ALLOWED = ['pdf', 'doc', 'docx'];
  var MSG = {
  "ru": {
    "sending": "Отправляем… Не закрывайте страницу.",
    "slow": "Загрузка файла может занять до минуты. Не отправляйте анкету повторно.",
    "errExt": "Допустимые форматы файла: PDF, DOC, DOCX.",
    "errSize": "Файл слишком большой: максимум 10 МБ.",
    "errNoFile": "Прикрепите файл со статьёй.",
    "errRead": "Не удалось прочитать файл. Выберите его ещё раз.",
    "errSend": "Не удалось отправить анкету. Проверьте интернет и попробуйте ещё раз. Если ошибка повторяется — напишите организаторам.",
    "errConf": "Форма ещё не настроена (не указан адрес приёма заявок).",
    "chosen": "Выбран файл: "
  },
  "en": {
    "sending": "Sending… Please do not close the page.",
    "slow": "Uploading the file may take up to a minute. Please do not submit again.",
    "errExt": "Allowed file formats: PDF, DOC, DOCX.",
    "errSize": "The file is too large: 10 MB maximum.",
    "errNoFile": "Please attach your paper.",
    "errRead": "Could not read the file. Please select it again.",
    "errSend": "Could not send the application. Check your connection and try again. If the error persists, contact the organisers.",
    "errConf": "The form is not configured yet (no receiving address set).",
    "chosen": "Selected file: "
  }
};

  var form = document.querySelector('[data-conf-form]');
  if (!form) return;
  var lang = form.dataset.formLanguage === 'en' ? 'en' : 'ru';
  var m = MSG[lang];
  var card = form.closest('.form-card');
  var response = card.querySelector('[data-form-response]');
  var status = form.querySelector('[data-form-status]');
  var submit = form.querySelector('[type="submit"]');
  var fileInput = form.querySelector('input[type="file"]');
  var chosen = form.querySelector('[data-file-chosen]');
  var pending = false;
  var timer;
  response.hidden = true;

  function ext(name) { var p = String(name).split('.'); return p.length > 1 ? p.pop().toLowerCase() : ''; }

  function checkFile() {
    var f = fileInput.files[0];
    fileInput.setCustomValidity('');
    chosen.textContent = '';
    if (!f) return null;
    if (ALLOWED.indexOf(ext(f.name)) === -1) { fileInput.setCustomValidity(m.errExt); return null; }
    if (f.size > MAX_BYTES) { fileInput.setCustomValidity(m.errSize); return null; }
    chosen.textContent = m.chosen + f.name + ' (' + (f.size / 1048576).toFixed(1) + ' MB)';
    return f;
  }
  fileInput.addEventListener('change', function () {
    checkFile();
    if (!fileInput.validity.valid) fileInput.reportValidity();
  });

  function readBase64(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(String(r.result).split(',')[1] || ''); };
      r.onerror = function () { reject(new Error('read')); };
      r.readAsDataURL(file);
    });
  }

  function fail(text) {
    pending = false;
    window.clearTimeout(timer);
    submit.disabled = false;
    status.textContent = text;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (pending) return;
    form.querySelectorAll('input[type="text"], input[type="tel"], input[type="email"], textarea').forEach(function (el) { el.value = el.value.trim(); });
    var file = checkFile();
    if (!fileInput.files[0]) fileInput.setCustomValidity(m.errNoFile);
    if (!form.reportValidity()) return;
    if (!file) return;
    if (!ENDPOINT || ENDPOINT.indexOf('PASTE_') === 0) { status.textContent = m.errConf; return; }

    pending = true;
    submit.disabled = true;
    status.textContent = m.sending;
    timer = window.setTimeout(function () { if (pending) status.textContent = m.slow; }, 15000);

    var d = new FormData(form);
    var data = { token: TOKEN, lang: lang, website: d.get('website') || '' };
    ['fullName', 'city', 'organization', 'position', 'supervisor', 'title', 'section', 'format', 'address', 'phone', 'email'].forEach(function (k) {
      data[k] = String(d.get(k) || '');
    });

    readBase64(file).then(function (b64) {
      data.file = { name: file.name, mime: file.type || '', base64: b64 };
      // text/plain keeps this a "simple" request, so no CORS preflight is needed for Apps Script.
      return fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) });
    }, function () { throw new Error('read'); }).then(function (r) { return r.json(); }).then(function (res) {
      if (!res || !res.ok) throw new Error((res && res.error) || 'server');
      pending = false;
      window.clearTimeout(timer);
      form.hidden = true;
      response.hidden = false;
      response.querySelector('h2').focus({ preventScroll: true });
      response.scrollIntoView({ behavior: 'auto', block: 'start' });
    }).catch(function (err) {
      fail(err && err.message === 'read' ? m.errRead : m.errSend);
    });
  });
})();
