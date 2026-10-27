/**
 * Приём статей на научную конференцию «Модель ШОС СКФУ 2026».
 * Сохраняет файл статьи в Google Диск:
 *   - русская версия сайта  -> папка RU_FOLDER_ID;
 *   - английская версия     -> папка EN_FOLDER_ID.
 * Анкеты уходят отдельно — в Google Формы (это делает сама страница).
 *
 * Развёртывание — см. ИНСТРУКЦИЯ.md.
 */
var CONFIG = {
  RU_FOLDER_ID: '1QFFXZJE7QLfwTpz4CPQ_4yYzQCnZiZVP',
  EN_FOLDER_ID: '14wWYbqoUpo-QtK2gKzyu1d6aoMze7mnU',
  // Должен совпадать с TOKEN в js/conference-form.js (подставлен автоматически).
  TOKEN: '99927afddf35a2127adb069aa33c4b9d',
  MAX_FILE_BYTES: 10 * 1024 * 1024,
  ALLOWED_EXT: {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
};

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    var data = JSON.parse(e.postData.contents);

    if (data.token !== CONFIG.TOKEN) return reply_({ ok: false, error: 'forbidden' });
    if (data.website) return reply_({ ok: true }); // «ловушка» для ботов — тихо игнорируем

    var folder = DriveApp.getFolderById(data.lang === 'en' ? CONFIG.EN_FOLDER_ID : CONFIG.RU_FOLDER_ID);
    var file = data.file;
    if (!file || !file.name || !file.base64) throw new Error('Нет файла статьи');

    var ext = extOf_(file.name);
    if (!CONFIG.ALLOWED_EXT[ext]) throw new Error('Недопустимый формат файла');
    // base64 занимает ~4/3 от исходного размера
    if (file.base64.length * 0.75 > CONFIG.MAX_FILE_BYTES * 1.05) throw new Error('Файл слишком большой');

    var name = uniqueName_(folder, safeBase_(file.name, ext), ext);
    var bytes = Utilities.base64Decode(file.base64);
    folder.createFile(Utilities.newBlob(bytes, CONFIG.ALLOWED_EXT[ext], name));

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

function extOf_(name) {
  var p = String(name).split('.');
  return p.length > 1 ? p.pop().toLowerCase() : '';
}

// Имя без расширения и без опасных символов; имя вида «Фамилия_ШОС» сохраняется как есть.
function safeBase_(name, ext) {
  var base = String(name).replace(/\.[^.]+$/, '').replace(/[\\\/:*?"<>|#%&{}$!'@+`=\n\t]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
  return base || 'article';
}

// Если файл с таким именем уже есть (однофамильцы, повторная отправка) — добавляем _2, _3 ...
function uniqueName_(folder, base, ext) {
  var name = base + '.' + ext, i = 2;
  while (folder.getFilesByName(name).hasNext()) { name = base + '_' + i + '.' + ext; i++; }
  return name;
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Запустите один раз вручную (▶), чтобы выдать скрипту права на Диск. */
function authorize() {
  DriveApp.getFolderById(CONFIG.RU_FOLDER_ID).getName();
  DriveApp.getFolderById(CONFIG.EN_FOLDER_ID).getName();
  console.log('OK');
}
