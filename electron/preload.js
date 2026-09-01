const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktop", {
  isElectron: true,
  onExportBackup: (cb) => ipcRenderer.on("menu:export-backup", cb),
  onImportBackup: (cb) => ipcRenderer.on("menu:import-backup", cb),
  onSavedPrograms: (cb) => ipcRenderer.on("menu:saved-programs", cb),
  onRestoreDefaults: (cb) => ipcRenderer.on("menu:restore-defaults", cb),
  saveBackupDialog: (defaultName) => ipcRenderer.invoke("dialog:save-backup", defaultName),
  openBackupDialog: () => ipcRenderer.invoke("dialog:open-backup"),
  writeFile: (filePath, content) => ipcRenderer.invoke("fs:write-file", filePath, content),
  readFile: (filePath) => ipcRenderer.invoke("fs:read-file", filePath),
  exportPdf: (defaultName) => ipcRenderer.invoke("export:pdf", defaultName),
  exportExcel: (defaultName, sheets) => ipcRenderer.invoke("export:excel", defaultName, sheets),
  exportWord: (defaultName, innerHtml) => ipcRenderer.invoke("export:word", defaultName, innerHtml),
  openXlsxDialog: () => ipcRenderer.invoke("dialog:open-xlsx"),
  importPlanXlsx: (filePath) => ipcRenderer.invoke("import:plan-xlsx", filePath),
  importEnvanterXlsx: (filePath) => ipcRenderer.invoke("import:envanter-xlsx", filePath),
  importPerformansXlsx: (filePath) => ipcRenderer.invoke("import:performans-xlsx", filePath),
  openPdfDialog: () => ipcRenderer.invoke("dialog:open-pdf"),
  importOgrenciPdf: (filePath) => ipcRenderer.invoke("import:ogrenci-pdf", filePath)
});
