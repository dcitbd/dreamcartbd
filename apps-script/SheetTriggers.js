/**
 * ============================================================================
 * DREAM CART BD — REAL-TIME TWO-WAY SYNC TRIGGER (SheetTriggers.js)
 * ============================================================================
 */

/**
 * গুগল শীটে কোনো ইউজার ম্যানুয়ালি এডিট করলে এই ফাংশন স্বয়ংক্রিয়ভাবে এক্সিকিউট হয়
 */
function onEditTrigger(e) {
  if (!e || !e.range) return;

  const sheet = e.range.getSheet();
  const sheetName = sheet.getName();
  const row = e.range.getRow();
  const col = e.range.getColumn();

  // হেডার রো এডিট হলে ইগনোর করা হবে
  if (row <= 1) return;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const editedField = headers[col - 1];

  // ১. অ্যাপস স্ক্রিপ্টের ব্যাকএন্ড ক্যাশ ক্লিয়ার করা
  const cache = CacheService.getScriptCache();
  cache.remove("cache_" + sheetName);
  cache.remove("cache_all_products");
  cache.remove("cache_all_categories");

  // ২. লাইভ সাইটের ফ্রন্টএন্ড SWR চেকের জন্য লাস্ট আপডেট টাইমস্ট্যাম্প সেট করা
  const timestamp = new Date().toISOString();
  PropertiesService.getScriptProperties().setProperty("LAST_SHEET_UPDATE", timestamp);

  Logger.log(`[Two-Way Sync] Table '${sheetName}' Row ${row} (${editedField}) updated at ${timestamp}`);
}

/**
 * গুগল অ্যাপস স্ক্রিপ্ট কনসোলে এই ফাংশনটি একবার রান করে ইনস্টল করতে হবে
 */
function setupSheetTriggers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const triggers = ScriptApp.getProjectTriggers();

  // পূর্বের পুরনো ট্রিগার মুছে ফেলা
  triggers.forEach(t => ScriptApp.deleteTrigger(t));

  // নতুন onEdit ট্রিগার ইনস্টল করা
  ScriptApp.newTrigger("onEditTrigger")
    .forSpreadsheet(ss)
    .onEdit()
    .create();

  Logger.log("✅ Sheet ➔ Site Real-Time Sync Trigger Installed Successfully.");
}
