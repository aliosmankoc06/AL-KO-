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
  openXlsxDialog: () => ipcRenderer.invoke("dialog:open-xlsx"),
  importPlanXlsx: (filePath) => ipcRenderer.invoke("import:plan-xlsx", filePath)
});
