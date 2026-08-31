const { app, BrowserWindow, Menu, dialog, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");
const { parsePlanWorkbook } = require("./xlsx-plan-parser");
const { parseEnvanterWorkbook } = require("./xlsx-envanter-parser");
const { parsePerformansWorkbook } = require("./xlsx-performans-parser");

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
