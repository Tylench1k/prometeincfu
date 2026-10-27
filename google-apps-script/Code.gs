/**
 * Приём заявок на научную конференцию «Модель ШОС СКФУ 2026».
 * Сохраняет в Google Диск (папка «ШОС_научки»):
 *   - анкету участника в формате Word (.docx);
 *   - файл научной статьи.
 * Для каждой заявки создаётся своя подпапка «ФИО_дата_время».
 *
 * Развёртывание — см. ИНСТРУКЦИЯ.md.
 */
var CONFIG = {
  // ID папки «ШОС_научки» (часть адреса папки после /folders/). Если пусто —
  // скрипт найдёт папку с именем FOLDER_NAME в «Мой диск» или создаст её.
  FOLDER_ID: '',
  FOLDER_NAME: 'ШОС_научки',
  // Должен совпадать с TOKEN в js/conference-form.js (подставлен автоматически).
  TOKEN: '2574897af634631fab1473a7b91cbfa8',
  TIMEZONE: 'Europe/Moscow',
  MAX_FILE_BYTES: 10 * 1024 * 1024,
  ALLOWED_EXT: { pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
};

var DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

var I18N = {
  ru: {
    title: 'Заявка на участие в конференции',
    conf: 'Международная конференция «Укрепление мира, безопасности и стабильности в евразийском регионе: теория и практика ШОС»',
    event: '3 Модель ШОС СКФУ 2026 · 2–3 декабря · г. Ставрополь',
    fields: [
      ['fullName', 'ФИО (полностью)'],
      ['city', 'Город, страна'],
      ['organization', 'Место работы / учёбы (полное наименование организации)'],
      ['position', 'Должность, учёная степень, звание. Для обучающихся (школьников, студентов, аспирантов) — класс / курс, направление подготовки'],
      ['supervisor', 'Научный руководитель (для обучающихся): ФИО (полностью), учёная степень, учёное звание, должность'],
      ['title', 'Название доклада'],
      ['section', 'Название секции'],
      ['format', 'Форма участия (очно / заочно / дистанционно)'],
      ['address', 'Почтовый адрес, индекс'],
      ['phone', 'Телефон'],
      ['email', 'E-mail']
    ],
    file: 'Файл статьи', date: 'Дата и время подачи', consent: 'Согласие на обработку персональных данных: получено'
  },
  en: {
    title: 'Conference Application Form',
    conf: 'International Conference “Strengthening Peace, Security and Stability in the Eurasian Region: Theory and Practice of the SCO”',
    event: '3rd NCFU Model SCO 2026 · 2–3 December · Stavropol, Russian Federation',
    fields: [
      ['fullName', 'Full name'],
      ['city', 'City, country'],
      ['organization', 'Place of employment / study (full official name of the institution)'],
      ['position', 'Position, academic degree and academic title. For students (school students, university students, postgraduate students) – class / year of study and field of study'],
      ['supervisor', 'Academic supervisor (for students): full name, academic degree, academic title and position'],
      ['title', 'Title of the paper'],
      ['section', 'Conference section'],
      ['format', 'Form of participation (in person / by correspondence / remote)'],
      ['address', 'Postal address, postal code'],
      ['phone', 'Telephone'],
      ['email', 'E-mail']
    ],
    file: 'Paper file', date: 'Submitted at', consent: 'Consent to personal data processing: given'
  }
};

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    var data = JSON.parse(e.postData.contents);

    if (data.token !== CONFIG.TOKEN) return reply_({ ok: false, error: 'forbidden' });
    if (data.website) return reply_({ ok: true }); // «ловушка» для ботов — тихо игнорируем

    var lang = data.lang === 'en' ? 'en' : 'ru';
    var f = clean_(data);
    validate_(f, data.file);

    var now = new Date();
    var stamp = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd_HH-mm');
    var base = safeName_(f.fullName) + '_' + stamp;

    var sub = getRootFolder_().createFolder(base);

    // 1) Анкета в формате Word
    var docx = buildDocx_(lang, f, data.file.name, now, 'Анкета_' + base);
    sub.createFile(docx);

    // 2) Файл статьи
    var ext = extOf_(data.file.name);
    var bytes = Utilities.base64Decode(data.file.base64);
    sub.createFile(Utilities.newBlob(bytes, CONFIG.ALLOWED_EXT[ext], 'Статья_' + base + '.' + ext));

    return reply_({ ok: true });
  } catch (err) {
    console.error(err);
    return reply_({ ok: false, error: String(err && err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

// Проверка, что веб-приложение работает (открыть адрес в браузере).
function doGet() {
  return reply_({ ok: true, service: 'SCO conference intake' });
}

function clean_(d) {
  var keys = ['fullName', 'city', 'organization', 'position', 'supervisor', 'title', 'section', 'format', 'address', 'phone', 'email'];
  var out = {};
  keys.forEach(function (k) { out[k] = String(d[k] == null ? '' : d[k]).replace(/\r/g, '').trim().slice(0, 1000); });
  return out;
}

function validate_(f, file) {
  var required = ['fullName', 'city', 'organization', 'position', 'title', 'section', 'format', 'address', 'phone', 'email'];
  required.forEach(function (k) { if (!f[k]) throw new Error('Не заполнено поле: ' + k); });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) throw new Error('Некорректный e-mail');
  if (!file || !file.name || !file.base64) throw new Error('Нет файла статьи');
  var ext = extOf_(file.name);
  if (!CONFIG.ALLOWED_EXT[ext]) throw new Error('Недопустимый формат файла');
  // base64 занимает ~4/3 от исходного размера
  if (file.base64.length * 0.75 > CONFIG.MAX_FILE_BYTES * 1.05) throw new Error('Файл слишком большой');
}

function extOf_(name) {
  var p = String(name).split('.');
  return p.length > 1 ? p.pop().toLowerCase() : '';
}

function safeName_(s) {
  return String(s).replace(/[\\\/:*?"<>|#%&{}$!'@+`=\n\t]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60).replace(/ /g, '_') || 'zayavka';
}

function getRootFolder_() {
  if (CONFIG.FOLDER_ID) return DriveApp.getFolderById(CONFIG.FOLDER_ID);
  var it = DriveApp.getFoldersByName(CONFIG.FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(CONFIG.FOLDER_NAME);
}

/** Собирает документ Word: заголовок + таблица «вопрос — ответ». */
function buildDocx_(lang, f, fileName, when, docName) {
  var t = I18N[lang];
  var doc = DocumentApp.create(docName);
  var body = doc.getBody();
  body.setAttributes({
    [DocumentApp.Attribute.FONT_FAMILY]: 'Times New Roman',
    [DocumentApp.Attribute.FONT_SIZE]: 12,
    [DocumentApp.Attribute.MARGIN_LEFT]: 56,
    [DocumentApp.Attribute.MARGIN_RIGHT]: 56
  });

  var h = body.getParagraphs()[0];
  h.setText(t.title).setHeading(DocumentApp.ParagraphHeading.HEADING1).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  h.editAsText().setBold(true).setFontSize(16);
  var p1 = body.appendParagraph(t.conf).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  p1.editAsText().setItalic(true).setFontSize(12);
  var p2 = body.appendParagraph(t.event).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  p2.editAsText().setFontSize(11);
  p2.setSpacingAfter(12);

  var rows = t.fields.map(function (pair) { return [pair[1], f[pair[0]] || '—']; });
  rows.push([t.file, fileName]);
  rows.push([t.date, Utilities.formatDate(when, CONFIG.TIMEZONE, 'dd.MM.yyyy HH:mm') + ' (MSK)']);
  rows.push([t.consent, '✓']);

  var table = body.appendTable(rows);
  table.setBorderColor('#999999').setBorderWidth(0.75);
  table.setColumnWidth(0, 200);
  table.setColumnWidth(1, 280);
  for (var r = 0; r < table.getNumRows(); r++) {
    var left = table.getCell(r, 0);
    left.setBackgroundColor('#F1EDE4');
    left.editAsText().setBold(true).setFontSize(10.5);
    table.getCell(r, 1).editAsText().setFontSize(11.5);
    left.setPaddingTop(5).setPaddingBottom(5);
    table.getCell(r, 1).setPaddingTop(5).setPaddingBottom(5);
  }
  doc.saveAndClose();

  var gdoc = DriveApp.getFileById(doc.getId());
  var blob = gdoc.getAs(DOCX_MIME).setName(docName + '.docx');
  gdoc.setTrashed(true); // временный Google-документ не нужен: остаётся только .docx
  return blob;
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Запустите один раз вручную (▶), чтобы выдать скрипту права на Диск и Документы. */
function authorize() {
  getRootFolder_();
  var d = DocumentApp.create('tmp'); DriveApp.getFileById(d.getId()).setTrashed(true);
  console.log('OK');
}
