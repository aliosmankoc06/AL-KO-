const { app, BrowserWindow, Menu, dialog, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");
const { parsePlanWorkbook } = require("./xlsx-plan-parser");
const { parseEnvanterWorkbook } = require("./xlsx-envanter-parser");
const { parsePerformansWorkbook } = require("./xlsx-performans-parser");
const pdfParse = require("pdf-parse");
const { parseOgrenciPdf } = require("./pdf-ogrenci-parser");

let mainWindow;

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
    const name = (sheet.name || ("Sayfa" + (i + 1))).slice(0, 31).replace(/[\\/*?:[\]]/g, " ");
    XLSX.utils.book_append_sheet(wb, ws, name || ("Sayfa" + (i + 1)));
  });
  XLSX.writeFile(wb, result.filePath);
  return result.filePath;
});

function buildWordHtml(innerHtml) {
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
  @page { size: 21cm 29.7cm; margin: 2cm 1.8cm; }
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color:#000; }
  h2 { font-family: Georgia, 'Times New Roman', serif; font-size: 15pt; color:#0E1B33; margin: 0 0 8pt; }
  h3 { font-family: Georgia, 'Times New Roman', serif; font-size: 12.5pt; color:#0E1B33; margin: 0 0 6pt; }
  table { border-collapse: collapse; width: 100%; font-size: 10.5pt; margin-bottom: 8pt; }
  th, td { border: 1px solid #666; padding: 4pt 6pt; text-align: left; vertical-align: top; }
  th { background: #EEF0F4; font-weight: 700; }
  .card { border: 1px solid #999; padding: 10pt; margin-bottom: 10pt; }
  .small { font-size: 9.5pt; color:#333; }
  .print-doc-header { border-bottom: 2pt solid #000; padding-bottom: 8pt; margin-bottom: 14pt; }
  .print-doc-header .okul { font-weight: 700; font-size: 12.5pt; }
  .print-doc-header .alan { font-size: 10.5pt; color:#333; }
  .print-doc-header .tarih { font-size: 10pt; color:#333; }
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

ipcMain.handle("export:word", async (evt, defaultName, innerHtml) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: "Word Olarak Kaydet",
    defaultPath: defaultName,
    filters: [{ name: "Word Belgesi", extensions: ["doc"] }]
  });
  if (result.canceled || !result.filePath) return null;
  fs.writeFileSync(result.filePath, buildWordHtml(innerHtml), "utf-8");
  return result.filePath;
});

ipcMain.handle("export:pdf", async (evt, defaultName) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: "PDF Olarak Kaydet",
    defaultPath: defaultName,
    filters: [{ name: "PDF Belgesi", extensions: ["pdf"] }]
  });
  if (result.canceled || !result.filePath) return null;
  const data = await mainWindow.webContents.printToPDF({ printBackground: true, pageSize: "A4" });
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
