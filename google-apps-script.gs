/**
 * ============================================================================
 *  Google Apps Script — receives orders from the landing page
 *  and adds them to the "Commandes" sheet (in French).
 * ============================================================================
 *  HOW TO INSTALL (see README.md, step 4):
 *   1. Google Sheet → Extensions → Apps Script → paste this whole file → Save
 *   2. Run the function "setup" once (▷ Run, with "setup" selected): it creates
 *      and formats the "Commandes" sheet.
 *   3. Deploy → New deployment → type "Web app"
 *        Execute as: Me   ·   Who has access: Anyone
 *   4. Copy the Web app URL into src/config/product.ts → site.scriptUrl
 *  ⚠️ After ANY change to this code: Deploy → Manage deployments → ✏️ Edit →
 *     Version: "New version" → Deploy (otherwise the old code keeps running).
 * ============================================================================
 */

var SHEET_NAME = 'Commandes';
var TIMEZONE = 'Africa/Casablanca';

// Columns (order matters). width = column width in pixels, wrap = text on several lines
var COLUMNS = [
  { title: 'N°', width: 95 },
  { title: 'Date', width: 125 },
  { title: 'Nom', width: 170 },
  { title: 'Téléphone', width: 115 }, // click = opens WhatsApp with the customer
  { title: 'Ville', width: 120 },
  { title: 'Adresse', width: 260, wrap: true },
  { title: 'Articles', width: 130, wrap: true }, // one pair per line: "Noir – 42"
  { title: 'Qté', width: 50 },
  { title: 'Total (DH)', width: 90 },
  { title: 'Note', width: 200, wrap: true },
  { title: 'Langue', width: 85 },
  { title: 'Statut', width: 120 },
];

// Status list (drop-down menu), in the order an order goes through, with colors [background, text].
// The first one is given to every new order.
var STATUSES = [
  ['Nouveau', '#dbeafe', '#1e40af'], //     just received, not called yet
  ['Injoignable', '#e5e7eb', '#374151'], // customer doesn't answer (call again)
  ['Reporté', '#fce7f3', '#9d174d'], //     customer asks to deliver later
  ['Confirmé', '#fef3c7', '#92400e'], //    confirmed by phone / WhatsApp
  ['Expédié', '#ede9fe', '#5b21b6'], //     given to the delivery company
  ['Livré', '#dcfce7', '#166534'], //       delivered to the customer
  ['Payé', '#166534', '#ffffff'], //        cash received from the delivery company → order finished
  ['Échange', '#ccfbf1', '#115e59'], //     size exchange in progress
  ['Retourné', '#ffedd5', '#9a3412'], //    refused at delivery / sent back
  ['Annulé', '#fee2e2', '#991b1b'], //      cancelled before shipping
];
var LANGUAGES = { ar: 'Arabe', fr: 'Français', en: 'Anglais' };
var MAX_ROWS = 5000; // rows prepared with the status menu (more are added automatically)

/* ------------------------------------------------------------ Orders ---- */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // avoids two orders writing on the same row

    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // 1. Anti-spam: the hidden "website" field must stay empty
    if (data.website) return json({ result: 'error', error: 'spam' });

    // 2. Required fields
    var required = ['name', 'phone', 'city', 'address', 'pairs'];
    for (var i = 0; i < required.length; i++) {
      if (!data[required[i]] || String(data[required[i]]).trim() === '') {
        return json({ result: 'error', error: 'missing field: ' + required[i] });
      }
    }

    // 3. Moroccan mobile only (already normalized by the page to 06XXXXXXXX / 07XXXXXXXX)
    var phone = String(data.phone).replace(/\s/g, '');
    if (!/^0[67]\d{8}$/.test(phone)) return json({ result: 'error', error: 'invalid phone' });

    var sheet = getSheet();
    sheet.appendRow([
      nextOrderNumber(),
      new Date(),
      clean(data.name),
      // Clickable: opens a WhatsApp chat with the customer (phone = digits only, checked above)
      // (formulas written by a script always use commas, whatever the sheet's language)
      '=HYPERLINK("https://wa.me/212' + phone.slice(1) + '","' + phone + '")',
      clean(data.city),
      clean(data.address),
      clean(data.pairs), // ex: "Noir – 42\nBeige – 40"
      Number(data.pairsCount) || 1,
      Number(data.total) || 0,
      clean(data.note || ''),
      LANGUAGES[data.lang] || 'Arabe', // language of the page the customer used
      STATUSES[0][0], // "Nouveau"
    ]);

    return json({ result: 'success' });
  } catch (err) {
    return json({ result: 'error', error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Open the Web app URL in a browser to check it is online */
function doGet() {
  return json({ result: 'ok', message: 'Order endpoint is running' });
}

/* ------------------------------------------------------------- Setup ---- */
/**
 * Run ONCE from the editor (select "setup" → ▷ Run). Safe to run again: it only
 * (re)applies titles, widths, formats, the status menu and colors. Orders are kept.
 */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone(TIMEZONE);
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME, 0);
  formatSheet(sheet);
  ss.setActiveSheet(sheet);
  ss.moveActiveSheet(1); // first tab

  // Remove the empty default tab ("Sheet1" / "Feuille 1") and the old English "Orders" tab if empty
  ss.getSheets().forEach(function (s) {
    if (s.getName() !== SHEET_NAME && s.getLastRow() <= 1 && ss.getSheets().length > 1) {
      var name = s.getName();
      if (/^(Sheet|Feuille|Orders)/i.test(name)) ss.deleteSheet(s);
    }
  });
}

/** Returns the "Commandes" sheet, creating and formatting it if needed */
function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    ss.setSpreadsheetTimeZone(TIMEZONE);
    sheet = ss.insertSheet(SHEET_NAME, 0);
    formatSheet(sheet);
  }
  return sheet;
}

function formatSheet(sheet) {
  var n = COLUMNS.length;
  var col = function (title) {
    for (var i = 0; i < n; i++) if (COLUMNS[i].title === title) return i + 1;
  };
  if (sheet.getMaxRows() < MAX_ROWS) sheet.insertRowsAfter(sheet.getMaxRows(), MAX_ROWS - sheet.getMaxRows());

  // Title row
  var header = sheet.getRange(1, 1, 1, n);
  header
    .setValues([COLUMNS.map(function (c) { return c.title; })])
    .setFontWeight('bold')
    .setBackground('#3b2a1e')
    .setFontColor('#ffffff')
    .setVerticalAlignment('middle');
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 34);

  // Widths, wrapping, alignment
  COLUMNS.forEach(function (c, i) {
    sheet.setColumnWidth(i + 1, c.width);
    sheet.getRange(2, i + 1, MAX_ROWS - 1, 1).setWrap(!!c.wrap);
  });
  var body = sheet.getRange(2, 1, MAX_ROWS - 1, n);
  body.setVerticalAlignment('top').setHorizontalAlignment('left');
  sheet.getRange(2, col('Date'), MAX_ROWS - 1, 1).setNumberFormat('dd/MM/yyyy HH:mm');
  sheet.getRange(2, col('Qté'), MAX_ROWS - 1, 1).setHorizontalAlignment('center');
  sheet.getRange(2, col('Total (DH)'), MAX_ROWS - 1, 1).setNumberFormat('#,##0" DH"').setHorizontalAlignment('right');
  sheet.getRange(1, 1, MAX_ROWS, n).setFontFamily('Arial').setFontSize(10);

  // Status: drop-down menu + one color per status
  var statusRange = sheet.getRange(2, col('Statut'), MAX_ROWS - 1, 1);
  statusRange
    .setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireValueInList(STATUSES.map(function (s) { return s[0]; }), true)
        .setAllowInvalid(false)
        .build(),
    )
    .setFontWeight('bold');
  var rules = sheet.getConditionalFormatRules().filter(function (r) {
    // keep rules that are not about the status column (if the user added some)
    return !r.getRanges().some(function (rg) { return rg.getColumn() === col('Statut'); });
  });
  STATUSES.forEach(function (s) {
    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo(s[0])
        .setBackground(s[1])
        .setFontColor(s[2])
        .setRanges([statusRange])
        .build(),
    );
  });
  sheet.setConditionalFormatRules(rules);

  // Filter on the titles (sort / filter by status, city…)
  if (!sheet.getFilter()) sheet.getRange(1, 1, MAX_ROWS, n).createFilter();
}

/* ----------------------------------------------------------- Helpers ---- */
/** Order numbers CMD-0001, CMD-0002… (never reused, even if rows are deleted) */
function nextOrderNumber() {
  var props = PropertiesService.getScriptProperties();
  var next = Number(props.getProperty('lastOrder') || 0) + 1;
  props.setProperty('lastOrder', String(next));
  return 'CMD-' + ('000' + next).slice(-4);
}

/** Trims text, limits length, and blocks spreadsheet formulas (=, +, -, @) */
function clean(value) {
  var s = String(value).trim().slice(0, 500);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
