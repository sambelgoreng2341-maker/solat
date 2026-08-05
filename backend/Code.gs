// =========================================================================
// ⚙️ KONFIGURASI UTAMA SISTEM ABSENSI
// =========================================================================

// ID SPREADSHEET (PENTING): 
// ISI dengan ID Spreadsheet Anda (dapat dilihat pada URL browser Google Sheets Anda)
const SPREADSHEET_ID = "1PBuOxCEtbaJ5V2I6Tx6U_tV7wPLwqDpgQuKT7V8zHVU"; 

// Nama Tab Sheet utama untuk mencatat riwayat kehadiran dan perilaku santri
const SHEET_ABSENSI = "Absensi & Perilaku Shalat Santri (HTML Ready)";

// Nama Tab Sheet yang menyimpan database master nama-nama santri
const SHEET_SANTRI = "Sheet1";

// =========================================================================
// 🚀 FUNGSI API (UNTUK DEPLOY SEBAGAI WEB APP)
// =========================================================================

/**
 * Endpoint POST untuk menerima request dari eksternal (GitHub Pages)
 */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === "getInitialData") {
      const data = getInitialData();
      return ContentService.createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
    } 
    else if (action === "saveBulkAttendance") {
      const data = saveBulkAttendance(body.records, body.waktuShalat, body.tanggal);
      return ContentService.createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({success: false, error: "Aksi tidak dikenal"}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Endpoint GET (Opsional) jika diperlukan untuk testing API
 */
function doGet(e) {
  if (e && e.parameter && e.parameter.action === "getInitialData") {
    const data = getInitialData();
    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(JSON.stringify({
    success: true, 
    message: "Google Apps Script API Aktif! Gunakan method POST untuk mengirim dan mengambil data dari Aplikasi Anda."
  })).setMimeType(ContentService.MimeType.JSON);
}


// =========================================================================
// 🚀 FUNGSI PEMROSESAN DATA
// =========================================================================

/**
 * Helper khusus untuk mengambil Spreadsheet
 */
function getActiveSpreadsheetSecure() {
  let ss = null;
  try {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    throw new Error("Gagal membuka Spreadsheet berdasarkan SPREADSHEET_ID. Periksa kembali ID Spreadsheet Anda dan pastikan akun Google Anda memiliki akses.");
  }
  return ss;
}

/**
 * Mengambil database santri dari "Sheet1" dan daftar riwayat untuk Dashboard/Laporan.
 */
function getInitialData() {
  try {
    const ss = getActiveSpreadsheetSecure();
    
    // 1. Ambil / Buat Sheet1 (Master Santri) jika belum ada
    let sheetSantri = ss.getSheetByName(SHEET_SANTRI);
    if (!sheetSantri) {
      sheetSantri = ss.insertSheet(SHEET_SANTRI);
      sheetSantri.appendRow(["nisn", "nama", "kelas", "kamar"]);
      
      sheetSantri.appendRow(["2023005", "Muhammad Ghaisan As Sakhiy", "Kelas 10", "Lantai 2"]);
      sheetSantri.appendRow(["2023006", "Muhammad Syaifulloh", "Kelas 10", "Lantai 2"]);
      sheetSantri.appendRow(["2024001", "Abdul Azis Marwan Baraba", "Kelas 9", "Lantai 2"]);
    }
    
    const dataSantriRaw = sheetSantri.getDataRange().getValues();
    const headersSantri = dataSantriRaw[0].map(h => h.toString().toLowerCase().trim());
    const students = [];
    
    const idxNisn = headersSantri.indexOf("nisn") !== -1 ? headersSantri.indexOf("nisn") : 0;
    const idxNama = headersSantri.indexOf("nama") !== -1 ? headersSantri.indexOf("nama") : 1;
    const idxKelas = headersSantri.indexOf("kelas") !== -1 ? headersSantri.indexOf("kelas") : 2;
    const idxKamar = headersSantri.indexOf("kamar") !== -1 ? headersSantri.indexOf("kamar") : 3;
    
    for (let i = 1; i < dataSantriRaw.length; i++) {
      const row = dataSantriRaw[i];
      if (row[idxNisn] !== undefined && row[idxNisn] !== "") {
        students.push({
          nisn: row[idxNisn].toString(),
          nama: row[idxNama] ? row[idxNama].toString() : "",
          kelas: row[idxKelas] ? row[idxKelas].toString() : "Umum",
          kamar: row[idxKamar] ? row[idxKamar].toString() : "Utama"
        });
      }
    }
    
    // 2. Ambil / Buat Sheet Absensi
    let sheetAbsen = ss.getSheetByName(SHEET_ABSENSI);
    if (!sheetAbsen) {
      sheetAbsen = ss.insertSheet(SHEET_ABSENSI);
      sheetAbsen.appendRow([
        "timestemp", "nisn", "Nama Santri", "kelas", "kamar", 
        "Waktu Shalat", "Status Kehadiran", "Terlambat", 
        "Seragam Lengkap", "Menghormati Masjid", "Catatan Perilaku"
      ]);
    }
    
    const dataAbsenRaw = sheetAbsen.getDataRange().getValues();
    const history = [];
    
    if (dataAbsenRaw.length > 1) {
      for (let j = 1; j < dataAbsenRaw.length; j++) {
        const row = dataAbsenRaw[j];
        if (row[1] !== undefined && row[1] !== "") {
          let ts = row[0];
          let formattedDate = "";
          if (ts instanceof Date) {
            formattedDate = Utilities.formatDate(ts, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
          } else {
            formattedDate = ts ? ts.toString() : "";
          }
          
          history.push({
            timestamp: formattedDate,
            nisn: row[1] ? row[1].toString() : "",
            nama: row[2] ? row[2].toString() : "",
            kelas: row[3] ? row[3].toString() : "",
            kamar: row[4] ? row[4].toString() : "",
            waktuShalat: row[5] ? row[5].toString() : "",
            statusKehadiran: row[6] ? row[6].toString() : "Hadir",
            terlambat: row[7] ? row[7].toString() : "Tidak",
            seragamLengkap: row[8] ? row[8].toString() : "Ya",
            menghormatiMasjid: row[9] ? row[9].toString() : "Ya",
            catatanPerilaku: row[10] ? row[10].toString() : ""
          });
        }
      }
    }
    
    return {
      success: true,
      students: students,
      history: history.reverse()
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Menyimpan data absensi massal (bulk)
 */
function saveBulkAttendance(records, waktuShalat, tanggal) {
  try {
    const ss = getActiveSpreadsheetSecure();
    let sheetAbsen = ss.getSheetByName(SHEET_ABSENSI);
    
    if (!sheetAbsen) {
      sheetAbsen = ss.insertSheet(SHEET_ABSENSI);
      sheetAbsen.appendRow([
        "timestemp", "nisn", "Nama Santri", "kelas", "kamar", 
        "Waktu Shalat", "Status Kehadiran", "Terlambat", 
        "Seragam Lengkap", "Menghormati Masjid", "Catatan Perilaku"
      ]);
    }
    
    let timestamp = new Date();
    if (tanggal) {
      const dateParts = tanggal.split('-');
      if (dateParts.length === 3) {
        timestamp.setFullYear(parseInt(dateParts[0], 10));
        timestamp.setMonth(parseInt(dateParts[1], 10) - 1);
        timestamp.setDate(parseInt(dateParts[2], 10));
      }
    }
    
    const rowsToAdd = [];
    records.forEach(function(rec) {
      rowsToAdd.push([
        timestamp,                  
        rec.nisn,                   
        rec.nama,                   
        rec.kelas,                  
        rec.kamar,                  
        waktuShalat,                
        rec.statusKehadiran,        
        rec.terlambat,              
        rec.seragamLengkap,         
        rec.menghormatiMasjid,      
        rec.catatanPerilaku || ""   
      ]);
    });
    
    if (rowsToAdd.length > 0) {
      const lastRow = sheetAbsen.getLastRow();
      const range = sheetAbsen.getRange(lastRow + 1, 1, rowsToAdd.length, 11);
      range.setValues(rowsToAdd);
    }
    
    return { success: true, count: rowsToAdd.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
