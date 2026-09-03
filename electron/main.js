const { app, BrowserWindow, Menu, dialog, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");
const ExcelJS = require("exceljs");
const { parsePlanWorkbook } = require("./xlsx-plan-parser");
const { parseEnvanterWorkbook } = require("./xlsx-envanter-parser");
const { parsePerformansWorkbook } = require("./xlsx-performans-parser");
const pdfParse = require("pdf-parse");
const { parseOgrenciPdf } = require("./pdf-ogrenci-parser");
const mammoth = require("mammoth");
const WordExtractor = require("word-extractor");

let mainWindow;

/* Portable .exe'nin aynı anda iki kez açılmasını engelliyoruz — iki
   pencere aynı localStorage'a bağımsız yazarsa, biri diğerinin daha
   yeni kaydettiği değişiklikleri (ör. bir sınıfın silinmesi) fark
   etmeden üzerine yazıp "geri getirebilir". İkinci açılışta yeni
   pencere oluşturmak yerine var olan pencereyi öne getiriyoruz. */
const tekAcilisKilitAlindi = app.requestSingleInstanceLock();
if (!tekAcilisKilitAlindi) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function backupFileFilters() {
  return [{ name: "Yedek Dosyası (JSON)", extensions: ["json"] }];
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: "#EDEBE2",
    icon: path.join(__dirname, "..", "build", "icon.png"),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.setMenu(buildMenu());
  mainWindow.loadFile(path.join(__dirname, "..", "src", "index.html"));
}

function buildMenu() {
  const template = [
    {
      label: "Dosya",
      submenu: [
        { label: "Verilerimi Dışa Aktar (Yedek Al)", click: () => mainWindow.webContents.send("menu:export-backup") },
        { label: "Yedek Dosyasından Yükle", click: () => mainWindow.webContents.send("menu:import-backup") },
        { label: "Kayıtlı Programlarım", click: () => mainWindow.webContents.send("menu:saved-programs") },
        { type: "separator" },
        { label: "Okulun Ders Havuzu/Öğretmen Listesiyle Başla (Sıfırla)", click: () => mainWindow.webContents.send("menu:restore-defaults") },
        { type: "separator" },
        { label: "Yazdır", click: () => mainWindow.webContents.print() },
        { type: "separator" },
        { role: "quit", label: "Çıkış" }
      ]
    },
    {
      label: "Görünüm",
      submenu: [
        { role: "reload", label: "Yenile" },
        { role: "toggleDevTools", label: "Geliştirici Araçları" },
        { type: "separator" },
        { role: "resetZoom", label: "Yakınlaştırmayı Sıfırla" },
        { role: "zoomIn", label: "Yakınlaştır" },
        { role: "zoomOut", label: "Uzaklaştır" },
        { type: "separator" },
        { role: "togglefullscreen", label: "Tam Ekran" }
      ]
    }
  ];
  return Menu.buildFromTemplate(template);
}

ipcMain.handle("dialog:save-backup", async (evt, defaultName) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: "Yedeği Kaydet",
    defaultPath: defaultName,
    filters: backupFileFilters()
  });
  return result.canceled ? null : result.filePath;
});

ipcMain.handle("dialog:open-backup", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Yedek Dosyasını Seç",
    properties: ["openFile"],
    filters: backupFileFilters()
  });
  return result.canceled || result.filePaths.length === 0 ? null : result.filePaths[0];
});

ipcMain.handle("fs:write-file", async (evt, filePath, content) => {
  fs.writeFileSync(filePath, content, "utf-8");
  return true;
});

ipcMain.handle("fs:read-file", async (evt, filePath) => {
  return fs.readFileSync(filePath, "utf-8");
});

ipcMain.handle("dialog:open-xlsx", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Excel Dosyası Seç",
    properties: ["openFile"],
    filters: [{ name: "Excel Dosyası", extensions: ["xlsx", "xls"] }]
  });
  return result.canceled || result.filePaths.length === 0 ? null : result.filePaths[0];
});

ipcMain.handle("import:plan-xlsx", async (evt, filePath) => {
  return parsePlanWorkbook(filePath, XLSX);
});

ipcMain.handle("import:envanter-xlsx", async (evt, filePath) => {
  return parseEnvanterWorkbook(filePath, XLSX);
});

ipcMain.handle("import:performans-xlsx", async (evt, filePath) => {
  return parsePerformansWorkbook(filePath, XLSX);
});

ipcMain.handle("import:not-ortalama-xlsx", async (evt, filePath) => {
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  let okulNoCol = 0, notCol = 1, basladi = 0;
  for (let r = 0; r < Math.min(rows.length, 5); r++) {
    const row = rows[r].map(c => String(c).trim().toLocaleLowerCase("tr-TR"));
    const oIdx = row.findIndex(c => c.includes("okul") && c.includes("no"));
    const nIdx = row.findIndex(c => c.includes("not") || c.includes("ortalama") || c.includes("puan"));
    if (oIdx >= 0 && nIdx >= 0) { okulNoCol = oIdx; notCol = nIdx; basladi = r + 1; break; }
  }
  const kayitlar = [];
  for (let r = basladi; r < rows.length; r++) {
    const okulNo = String(rows[r][okulNoCol] !== undefined ? rows[r][okulNoCol] : "").trim();
    const not_ = String(rows[r][notCol] !== undefined ? rows[r][notCol] : "").trim();
    if (!okulNo) continue;
    kayitlar.push({ okulNo, not: not_ });
  }
  return { kayitlar };
});

ipcMain.handle("dialog:open-pdf", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Sınıf Listesi PDF Seç",
    properties: ["openFile"],
    filters: [{ name: "PDF Dosyası", extensions: ["pdf"] }]
  });
  return result.canceled || result.filePaths.length === 0 ? null : result.filePaths[0];
});

ipcMain.handle("import:ogrenci-pdf", async (evt, filePath) => {
  return parseOgrenciPdf(filePath, pdfParse);
});

ipcMain.handle("dialog:open-word", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Word Dosyası Seç",
    properties: ["openFile"],
    filters: [{ name: "Word Belgesi", extensions: ["doc", "docx"] }]
  });
  return result.canceled || result.filePaths.length === 0 ? null : result.filePaths[0];
});

function cleanCellText(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();
}

function htmlTableRows(html) {
  const rows = [];
  const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let trM;
  while ((trM = trRe.exec(html))) {
    const cellRe = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
    const cells = [];
    let cM;
    while ((cM = cellRe.exec(trM[1]))) {
      cells.push(cleanCellText(cM[1]));
    }
    if (cells.length) rows.push(cells);
  }
  return rows;
}

/* Belgeyi baştan sona tarar; tablo satırlarını hücrelere, tablo dışındaki
   paragrafları tek hücreli satırlara çevirir — böylece tablonun üstündeki
   başlık paragrafı (örn. e-Okul Sınıf Listesi'nin "AMP - 10. Sınıf / A
   Şubesi (...)" satırı) da tablo satırlarıyla aynı sırada yakalanır. */
function htmlToRows(html) {
  const rows = [];
  const blockRe = /<table[^>]*>[\s\S]*?<\/table>|<p[^>]*>[\s\S]*?<\/p>/gi;
  let m;
  while ((m = blockRe.exec(html))) {
    const block = m[0];
    if (/^<table/i.test(block)) {
      htmlTableRows(block).forEach(r => rows.push(r));
    } else {
      const text = cleanCellText(block);
      if (text) rows.push([text]);
    }
  }
  return rows;
}

async function extractWordRows(filePath) {
  if (/\.docx$/i.test(filePath)) {
    const { value: html } = await mammoth.convertToHtml({ path: filePath });
    const rows = htmlToRows(html);
    if (rows.length) return rows;
    const { value: text } = await mammoth.extractRawText({ path: filePath });
    return text.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(l => l.split(/\t+/));
  }
  const doc = await new WordExtractor().extract(filePath);
  const body = doc.getBody() || "";
  return body.split(/\r?\n/).map(l => l.replace(/\t+$/, "")).filter(l => l.trim()).map(l => l.split("\t"));
}

function rowsToTabText(rows) {
  return rows.map(r => r.join("\t")).join("\n");
}

ipcMain.handle("import:word-table", async (evt, filePath) => {
  const rows = await extractWordRows(filePath);
  return { text: rowsToTabText(rows) };
});

const BASLIK_REGEX_WORD = /(AMP|MESEM)\s*-\s*(\d{1,2})\.\s*Sınıf\s*\/\s*([A-ZÇĞİÖŞÜ])\s*Şubesi\s*\(([^)]*)\)/i;

/* Word'de gerçek hücre sınırları bilindiği için (PDF'teki gibi x/y konumu
   tahmin etmeye gerek yok) sütunları başlık satırındaki metinlerden
   (Öğrenci No / Adı / Soyadı / Cinsiyeti / Pansiyon Durum) eşleştiriyoruz. */
function parseOgrenciWordRows(rows) {
  const sonuclar = [];
  let mevcut = null;
  let colIdx = null;
  rows.forEach(cells => {
    const joined = cells.join(" ");
    const baslikM = BASLIK_REGEX_WORD.exec(joined);
    if (baslikM) {
      if (mevcut && mevcut.ogrenciler.length) sonuclar.push(mevcut);
      const program = baslikM[1].toUpperCase();
      const grade = Number(baslikM[2]);
      const sube = baslikM[3].toUpperCase();
      const alanAdi = baslikM[4].trim();
      mevcut = { program, sinif: grade + "-" + sube, grade, sube, alanAdi, ogrenciler: [] };
      colIdx = null;
      return;
    }
    if (!mevcut) return;
    const norm = cells.map(c => c.toLocaleLowerCase("tr-TR").replace(/[.\s]+/g, ""));
    const oIdx = norm.findIndex(c => c.includes("öğrenci") && c.includes("no"));
    const adIdx = norm.findIndex(c => c === "adı" || c === "adi" || c === "ad");
    if (oIdx >= 0 && adIdx >= 0) {
      colIdx = {
        okulNo: oIdx,
        ad: adIdx,
        soyad: norm.findIndex(c => c.includes("soyad")),
        cinsiyet: norm.findIndex(c => c.includes("cinsiyet")),
        pansiyon: norm.findIndex(c => c.includes("pansiyon"))
      };
      return;
    }
    if (!colIdx) return;
    const okulNo = (cells[colIdx.okulNo] || "").trim();
    if (!/^\d+$/.test(okulNo)) return;
    const ad = (cells[colIdx.ad] || "").trim();
    const soyad = colIdx.soyad >= 0 ? (cells[colIdx.soyad] || "").trim() : "";
    if (!ad && !soyad) return;
    let cinsiyet = colIdx.cinsiyet >= 0 ? (cells[colIdx.cinsiyet] || "").trim() : "";
    cinsiyet = /^(Erkek|Kız)$/i.test(cinsiyet) ? cinsiyet[0].toUpperCase() + cinsiyet.slice(1).toLowerCase() : "";
    const pansiyon = colIdx.pansiyon >= 0 ? (cells[colIdx.pansiyon] || "").trim() : "";
    mevcut.ogrenciler.push({ okulNo, ad, soyad, cinsiyet, pansiyon });
  });
  if (mevcut && mevcut.ogrenciler.length) sonuclar.push(mevcut);
  return { siniflar: sonuclar };
}

ipcMain.handle("import:ogrenci-word", async (evt, filePath) => {
  const rows = await extractWordRows(filePath);
  return parseOgrenciWordRows(rows);
});

ipcMain.handle("export:excel", async (evt, defaultName, sheets) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: "Excel Olarak Kaydet",
    defaultPath: defaultName,
    filters: [{ name: "Excel Dosyası", extensions: ["xlsx"] }]
  });
  if (result.canceled || !result.filePath) return null;
  const wb = XLSX.utils.book_new();
  sheets.forEach((sheet, i) => {
    const ws = XLSX.utils.aoa_to_sheet(sheet.rows);
    if (sheet.colWidths) ws["!cols"] = sheet.colWidths.map(wch => ({ wch }));
    const name = (sheet.name || ("Sayfa" + (i + 1))).slice(0, 31).replace(/[\\/*?:[\]]/g, " ");
    XLSX.utils.book_append_sheet(wb, ws, name || ("Sayfa" + (i + 1)));
  });
  XLSX.writeFile(wb, result.filePath);
  return result.filePath;
});

// Programlar (öğretmen ders programı) Excel'i — sınıf/ders renklerini ve
// hücre çerçevelerini gerçekten taşıyabilmek için "xlsx" kütüphanesinin
// ücretsiz sürümü stil yazamıyor, bu yüzden burada exceljs kullanılıyor.
ipcMain.handle("export:schedule-excel", async (evt, defaultName, teacherBlocks) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: "Excel Olarak Kaydet",
    defaultPath: defaultName,
    filters: [{ name: "Excel Dosyası", extensions: ["xlsx"] }]
  });
  if (result.canceled || !result.filePath) return null;

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Programlar");
  const dayHeaders = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
  const thin = { style: "thin", color: { argb: "FF999999" } };
  const borderAll = { top: thin, bottom: thin, left: thin, right: thin };

  // Not: exceljs bu sürümde 3+ farklı sütun genişliği grubu verildiğinde
  // ortadaki grubu sessizce siliyor (kütüphanenin kendi hatası, doğrulandı).
  // Bu yüzden tek bir açık genişlik (kenar boşluğu sütunu) + sayfa geneli
  // varsayılan genişlik (Saat + gün sütunları, hepsi eşit) kullanıyoruz.
  ws.properties.defaultColWidth = 16;
  ws.getColumn(1).width = 3;
  const baseFontSize = 9;

  let r = 1;
  (teacherBlocks || []).forEach((block, bi) => {
    if (bi > 0) r += 2;
    r += 1;
    const titleCell = ws.getRow(r).getCell(2);
    titleCell.value = block.name;
    titleCell.font = { bold: true, size: 12 };
    r += 1;

    const headerRow = ws.getRow(r);
    headerRow.getCell(2).value = "Saat";
    dayHeaders.forEach((d, i) => { headerRow.getCell(3 + i).value = d; });
    for (let c = 2; c <= 7; c++) {
      const cell = headerRow.getCell(c);
      cell.font = { bold: true, size: baseFontSize };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF4F6FA" } };
      cell.border = borderAll;
      cell.alignment = { vertical: "middle", horizontal: "left" };
    }
    headerRow.height = 16;
    r += 1;

    (block.rows || []).forEach(rowData => {
      const excelRow = ws.getRow(r);
      const hourCell = excelRow.getCell(2);
      hourCell.value = rowData.hour;
      hourCell.font = { size: baseFontSize };
      hourCell.alignment = { vertical: "middle", horizontal: "center" };
      hourCell.border = borderAll;
      (rowData.cells || []).forEach((cellData, i) => {
        const cell = excelRow.getCell(3 + i);
        cell.value = cellData.text || "";
        cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
        cell.border = borderAll;
        cell.font = { size: baseFontSize, color: cellData.ink ? { argb: "FF" + cellData.ink } : undefined };
        if (cellData.bg) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + cellData.bg } };
      });
      excelRow.height = 24;
      r += 1;
    });
  });

  await wb.xlsx.writeFile(result.filePath);
  return result.filePath;
});

/* Yıllık Plan'ın Excel çıktısı — kullanıcının kendi YILLIK_PLANLAR.xlsx
   dosyasındaki görünüme (iki logo, başlık, bilgi tablosu, sınav tarihleri,
   önemli gün ve haftalar, işgünü takvimi, hafta hafta kazanım/konu/yöntem/
   araç/değerlendirme, imza bloğu) yakın, gerçek biçimlendirmeli tek sayfa
   üretir. Veri (payload) tarayıcı tarafında S üzerinden derlenip buraya
   gönderiliyor (bkz. views.js extractYillikPlanForExcel). */
ipcMain.handle("export:yillik-plan-excel", async (evt, defaultName, payload) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: "Excel Olarak Kaydet",
    defaultPath: defaultName,
    filters: [{ name: "Excel Dosyası", extensions: ["xlsx"] }]
  });
  if (result.canceled || !result.filePath) return null;

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Yıllık Plan");
  // Kullanıcının kendi YILLIK_PLANLAR.xlsx dosyasıyla BİREBİR aynı sütun
  // sayısı ve aynı birleştirme (merge) sınırları — A'dan AE'ye (31 sütun).
  // Aşağıdaki bütün sütun aralıkları o dosyadan hücre hücre okunarak
  // belirlendi, tahmini/orantılı bir bölüştürme DEĞİL.
  const COLS = 31; // A..AE
  // Orijinal dosyanın <cols> tanımı ham XML'den okundu: A sütunu (1) width=9,
  // B'den AE'ye (2-31) HEPSİ width=4.3 — "geri kalanı varsayılan genişlikte"
  // sanmak yanlıştı, bütün dosyada bu iki grup dışında sütun yok.
  // NOT: exceljs'in kendi iç sabiti DEFAULT_COLUMN_WIDTH=9 olduğu için, tam
  // 9.0 yazılırsa "özel genişlik değil" sanıp satırı sessizce siliyor
  // (bilinen exceljs hatası) — görsel olarak fark etmeyecek kadar küçük bir
  // ofsetle bu hatayı atlatıyoruz.
  ws.getColumn(1).width = 9.001; // orijinal dosyada A sütunu (9.0)
  for (let c = 2; c <= COLS; c++) ws.getColumn(c).width = 4.3; // orijinal dosyada B..AE
  // Orijinal dosyanın kenar boşlukları (Sayfa Düzeni > Kenar Boşlukları) ve
  // yatay/tek sayfaya sığdır ayarı — inç cinsinden, dosyadan birebir okundu.
  ws.pageSetup = {
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    scale: 96,
    margins: { left: 0.3, right: 0.3, top: 0.4, bottom: 0.4, header: 0.511811023622047, footer: 0.511811023622047 }
  };
  const thin = { style: "thin", color: { argb: "FF999999" } };
  const border = { top: thin, bottom: thin, left: thin, right: thin };
  const headerFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF4F6FA" } };
  const tatilFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEDE3F5" } };

  function mergeSet(r1, c1, r2, c2, value, opts) {
    opts = opts || {};
    if (r1 !== r2 || c1 !== c2) ws.mergeCells(r1, c1, r2, c2);
    const cell = ws.getCell(r1, c1);
    cell.value = value === undefined ? "" : value;
    cell.font = Object.assign({ size: 10 }, opts.font || {});
    cell.alignment = Object.assign({ vertical: "middle", horizontal: "left", wrapText: true }, opts.alignment || {});
    if (opts.border !== false) cell.border = border;
    if (opts.fill) cell.fill = opts.fill;
    return cell;
  }
  // Bilgi tablosu / sınav tarihleri / önemli gün ve haftalar satırları —
  // orijinal dosyadaki A:F(etiket) G:O(değer) P:T(etiket) U:AE(değer)
  // birleştirmesiyle birebir aynı.
  function labelValueRow(r, pairs, rowHeight) {
    mergeSet(r, 1, r, 6, pairs[0][0], { font: { bold: true } });
    mergeSet(r, 7, r, 15, pairs[0][1] || "-");
    if (pairs[1]) {
      mergeSet(r, 16, r, 20, pairs[1][0], { font: { bold: true } });
      mergeSet(r, 21, r, 31, pairs[1][1] || "-");
    }
    ws.getRow(r).height = rowHeight || 15;
  }

  let r = 1;
  // Logolar + başlık — orijinal dosyada tek satır (row 1, yükseklik 75),
  // MEB logosu A sütununda (col 0), okul logosu AC sütununda (col 28),
  // başlık H1:X1 birleşimi. Sonra bir boş satır (row 2, yükseklik 15),
  // bilgi tablosu 3. satırdan başlıyor — birebir orijinal dosyadan.
  if (payload.logos && payload.logos.meb) {
    const m = /^data:image\/(\w+);base64,/.exec(payload.logos.meb);
    if (m) {
      const imgId = wb.addImage({ base64: payload.logos.meb, extension: m[1] === "jpeg" ? "jpeg" : m[1] });
      ws.addImage(imgId, { tl: { col: 0, row: r - 1 }, ext: { width: 85, height: 85 } });
    }
  }
  if (payload.logos && payload.logos.okul) {
    const m = /^data:image\/(\w+);base64,/.exec(payload.logos.okul);
    if (m) {
      const imgId = wb.addImage({ base64: payload.logos.okul, extension: m[1] === "jpeg" ? "jpeg" : m[1] });
      ws.addImage(imgId, { tl: { col: 28, row: r - 1 }, ext: { width: 85, height: 85 } });
    }
  }
  mergeSet(r, 8, r, 24, "YILLIK DERS PLANI", {
    font: { bold: true, size: 16 }, alignment: { vertical: "middle", horizontal: "center" }, border: false
  });
  ws.getRow(r).height = 75;
  r += 1;
  ws.getRow(r).height = 15;
  r += 1;

  // Bilgi tablosu
  const meta = payload.meta || {};
  labelValueRow(r++, [["EĞİTİM-ÖĞRETİM YILI", meta.ogretimYili], ["OKUL", meta.okulAdi]]);
  labelValueRow(r++, [["DERS", meta.ders], ["ALAN/DAL", meta.alanDal]]);
  labelValueRow(r++, [["DERS SAATİ", meta.dersSaati], ["SINIF", meta.sinif]]);
  r += 1;

  // Sınav tarihleri
  const sinav = payload.sinav || {};
  mergeSet(r, 1, r, 15, "1.DÖNEM SINAV TARİHLERİ", { font: { bold: true }, alignment: { horizontal: "center" }, fill: headerFill });
  mergeSet(r, 16, r, 31, "2.DÖNEM SINAV TARİHLERİ", { font: { bold: true }, alignment: { horizontal: "center" }, fill: headerFill });
  r += 1;
  labelValueRow(r++, [["1.Dönem 1.Sınav Tarihi", sinav.d1s1], ["2.Dönem 1.Sınav Tarihi", sinav.d2s1]]);
  labelValueRow(r++, [["1.Dönem 2.Sınav Tarihi", sinav.d1s2], ["2.Dönem 2.Sınav Tarihi", sinav.d2s2]]);
  r += 1;

  // Önemli gün ve haftalar
  mergeSet(r, 1, r, 15, "1.DÖNEM ÖNEMLİ GÜN VE HAFTALAR", { font: { bold: true }, alignment: { horizontal: "center" }, fill: headerFill });
  mergeSet(r, 16, r, 31, "2.DÖNEM ÖNEMLİ GÜN VE HAFTALAR", { font: { bold: true }, alignment: { horizontal: "center" }, fill: headerFill });
  r += 1;
  const d1 = (payload.onemliGunler && payload.onemliGunler.d1) || [];
  const d2 = (payload.onemliGunler && payload.onemliGunler.d2) || [];
  for (let i = 0; i < 6; i++) {
    labelValueRow(r++, [[(d1[i] || {}).label || "", (d1[i] || {}).value || ""], [(d2[i] || {}).label || "", (d2[i] || {}).value || ""]]);
  }
  r += 1;

  // İşgünü takvimi (sadeleştirilmiş: ay başına tek sütun, gün numaraları virgülle)
  const takvim = payload.isguluTakvimi;
  if (takvim) {
    mergeSet(r, 1, r, COLS, (meta.ogretimYili || "") + " EĞİTİM-ÖĞRETİM YILI İŞGÜNÜ TAKVİMİ", { font: { bold: true }, alignment: { horizontal: "center" }, fill: headerFill });
    r += 1;
    mergeSet(r, 1, r, 1, "Günler", { font: { bold: true }, fill: headerFill });
    takvim.aylar.forEach((a, i) => mergeSet(r, 2 + i, r, 2 + i, a.ad + " " + a.yil, { font: { bold: true }, alignment: { horizontal: "center" }, fill: headerFill }));
    r += 1;
    takvim.gunler.forEach((gun, gunIdx) => {
      mergeSet(r, 1, r, 1, gun, { font: { bold: true } });
      takvim.aylar.forEach((a, ayIdx) => {
        mergeSet(r, 2 + ayIdx, r, 2 + ayIdx, (takvim.grid[gunIdx][ayIdx] || []).join(", "), { alignment: { horizontal: "center", wrapText: true } });
      });
      r += 1;
    });
    r += 1;
  }

  // Haftalık plan tablosu — orijinal dosyayla birebir aynı sütun genişliği:
  // TARİH(A:C,3) + KAZANIMLAR(D:K,8) + KONULAR(L:Q,6) + YÖNTEM(R:V,5) +
  // ARAÇ(W:AC,7) + DEĞERLENDİRME(AD:AE,2) = 31 sütun.
  const haftaColSpans = [["TARİH", 3], ["KAZANIMLAR", 8], ["KONULAR", 6],
    ["ÖĞRENME-ÖĞRETME YÖNTEM VE TEKNİKLERİ", 5], ["KULLANILAN EĞİTİM TEKNOLOJİLERİ, ARAÇ VE GEREÇLER", 7], ["DEĞERLENDİRME", 2]];
  const headerRow = r;
  let hc = 1;
  const haftaColStarts = [];
  haftaColSpans.forEach(([h, span]) => {
    haftaColStarts.push(hc);
    mergeSet(headerRow, hc, headerRow, hc + span - 1, h, { font: { bold: true }, alignment: { horizontal: "center" }, fill: headerFill });
    hc += span;
  });
  r += 1;
  const haftaFields = ["tarihAraligi", "kazanimlar", "konular", "yontem", "arac", "degerlendirme"];
  (payload.haftalar || []).forEach(h => {
    if (h.tatilMi) {
      mergeSet(r, haftaColStarts[0], r, haftaColStarts[0] + haftaColSpans[0][1] - 1, h.tarihAraligi);
      mergeSet(r, haftaColStarts[1], r, COLS, h.tatilAdi, { font: { bold: true }, alignment: { horizontal: "center" }, fill: tatilFill });
    } else {
      haftaColSpans.forEach(([, span], i) => {
        mergeSet(r, haftaColStarts[i], r, haftaColStarts[i] + span - 1, h[haftaFields[i]]);
      });
    }
    // Yükseklik özellikle sabitlenmiyor — orijinal dosyada olduğu gibi Excel,
    // metin uzunluğuna göre satırı kendisi otomatik sığdırıyor (wrapText açık).
    r += 1;
  });
  r += 1;

  // İmza bloğu — orijinal dosyayla aynı: A:J(10) / L:T(9, K boşluk) /
  // V:AE(10, U boşluk) — 3 kişi/satır.
  const imzaKolonlari = [[1, 10], [12, 20], [22, 31]];
  const teachers = payload.teachers || [];
  for (let i = 0; i < teachers.length; i += 3) {
    const grup = teachers.slice(i, i + 3);
    grup.forEach((t, gi) => {
      const [c1, c2] = imzaKolonlari[gi];
      mergeSet(r, c1, r, c2, t.ad, { font: { bold: true }, alignment: { horizontal: "center" }, border: false });
      mergeSet(r + 1, c1, r + 1, c2, t.brans, { alignment: { horizontal: "center" }, border: false });
      mergeSet(r + 2, c1, r + 2, c2, t.unvan, { alignment: { horizontal: "center" }, border: false });
    });
    r += 4;
  }
  r += 1;
  mergeSet(r, 1, r, COLS, "…../…../..........", { alignment: { horizontal: "center" }, border: false });
  r += 1;
  mergeSet(r, 1, r, COLS, "UYGUNDUR", { font: { bold: true }, alignment: { horizontal: "center" }, border: false });
  r += 1;
  mergeSet(r, 1, r, COLS, payload.mudurAdi || "", { font: { bold: true }, alignment: { horizontal: "center" }, border: false });
  r += 1;
  mergeSet(r, 1, r, COLS, "OKUL MÜDÜRÜ", { alignment: { horizontal: "center" }, border: false });

  await wb.xlsx.writeFile(result.filePath);
  return result.filePath;
});

function buildWordHtml(innerHtml, landscape) {
  const pageSize = landscape ? "29.7cm 21cm" : "21cm 29.7cm";
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<!--[if gte mso 9]>
<xml>
<w:WordDocument>
<w:View>Print</w:View>
<w:Zoom>100</w:Zoom>
<w:DoNotOptimizeForBrowser/>
</w:WordDocument>
</xml>
<![endif]-->
<style>
  @page { size: ${pageSize}; margin: 2cm 1.8cm; }
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color:#000; }
  h2 { font-family: Georgia, 'Times New Roman', serif; font-size: 15pt; color:#0E1B33; margin: 0 0 8pt; }
  h3 { font-family: Georgia, 'Times New Roman', serif; font-size: 12.5pt; color:#0E1B33; margin: 0 0 6pt; }
  table { border-collapse: collapse; width: 100%; font-size: 10.5pt; margin-bottom: 8pt; }
  th, td { border: 1px solid #666; padding: 4pt 6pt; text-align: left; vertical-align: top; }
  th { background: #EEF0F4; font-weight: 700; }
  .card { border: 1px solid #999; padding: 10pt; margin-bottom: 10pt; }
  .sched-print-page { padding-top: 60pt; padding-bottom: 60pt; }
  .sched-table { table-layout: fixed; }
  .sched-table th:first-child, .sched-table td:first-child { width: 40pt; }
  .small { font-size: 9.5pt; color:#333; }
  .print-doc-header { border-bottom: 2pt solid #000; padding-bottom: 8pt; margin-bottom: 14pt; }
  .print-doc-header .okul { font-weight: 700; font-size: 12.5pt; }
  .print-doc-header .alan { font-size: 10.5pt; color:#333; }
  .print-doc-header .tarih { font-size: 10pt; color:#333; }
  .print-page-break { page-break-before: always; mso-break-type: page-break; }
  .no-print { display: none; }
  .print-only { display: block; }
  .print-only-cell { display: table-cell; }
  .print-only-inline { display: inline; }
  input, textarea, select, button { display: none; }
</style>
</head>
<body>
${innerHtml}
</body>
</html>`;
}

ipcMain.handle("export:word", async (evt, defaultName, innerHtml, landscape) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: "Word Olarak Kaydet",
    defaultPath: defaultName,
    filters: [{ name: "Word Belgesi", extensions: ["doc"] }]
  });
  if (result.canceled || !result.filePath) return null;
  fs.writeFileSync(result.filePath, buildWordHtml(innerHtml, landscape), "utf-8");
  return result.filePath;
});

ipcMain.handle("export:pdf", async (evt, defaultName, landscape) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: "PDF Olarak Kaydet",
    defaultPath: defaultName,
    filters: [{ name: "PDF Belgesi", extensions: ["pdf"] }]
  });
  if (result.canceled || !result.filePath) return null;
  // Not: Electron'un printToPDF({landscape:true}) parametresi bu sürümde
  // güvenilir çalışmıyor (test edildi, portre çıkıyor) — bunun yerine
  // sayfanın kendi CSS'indeki "@page{size:A4 landscape}" kuralını
  // (renderer tarafında yazdırmadan hemen önce enjekte edilir) okuması
  // için preferCSSPageSize kullanıyoruz.
  const opts = landscape
    ? { printBackground: true, preferCSSPageSize: true }
    : { printBackground: true, pageSize: "A4" };
  const data = await mainWindow.webContents.printToPDF(opts);
  fs.writeFileSync(result.filePath, data);
  return result.filePath;
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
