/**
 * ============================================================================
 *  Google Apps Script — receives orders from the landing page
 *  and adds them to the "Orders" sheet.
 * ============================================================================
 *  HOW TO INSTALL (see README.md, step 4):
 *   1. Google Sheet → Extensions → Apps Script → paste this whole file → Save
 *   2. Deploy → New deployment → type "Web app"
 *        Execute as: Me   ·   Who has access: Anyone
 *   3. Copy the Web app URL into src/config/product.ts → site.scriptUrl
 *  ⚠️ After ANY change to this code: Deploy → Manage deployments → Edit →
 *     Version: "New version" → Deploy (otherwise the old code keeps running).
 * ============================================================================
 */

var SHEET_NAME = 'Orders';
var TIMEZONE = 'Africa/Casablanca';
var HEADERS = [
  'Date/time',
  'Name',
  'Phone',
  'City',
  'Address',
  'Pairs',
  'Number of pairs',
  'Total (MAD)',
  'Note',
  'Language',
  'Status',
];
var DEFAULT_STATUS = 'جديد'; // New
var LANGUAGES = { ar: 'العربية', fr: 'Français', en: 'English' };

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

    // 3. Basic phone check (Moroccan mobile, already normalized by the page)
    var phone = String(data.phone).replace(/\s/g, '');
    if (!/^0[67]\d{8}$/.test(phone)) return json({ result: 'error', error: 'invalid phone' });

    var sheet = getSheet();
    sheet.appendRow([
      Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd HH:mm:ss'),
      clean(data.name),
      "'" + phone, // the apostrophe keeps the leading 0
      clean(data.city),
      clean(data.address),
      clean(data.pairs), // ex: "أسود 42 | بيج 38"
      Number(data.pairsCount) || 1,
      Number(data.total) || 0,
      clean(data.note || ''),
      LANGUAGES[data.lang] || 'العربية', // language of the page the customer used
      DEFAULT_STATUS,
    ]);

    return json({ result: 'success' });
  } catch (err) {
    return json({ result: 'error', error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Open the browser on the Web app URL to check it is online */
function doGet() {
  return json({ result: 'ok', message: 'Order endpoint is running' });
}

/** Returns the "Orders" sheet, creating it (with the header row) if needed */
function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#f3ece2');
    sheet.setFrozenRows(1);
  }
  return sheet;
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
