const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktop", {
  isElectron: true,
  onExportBackup: (cb) => ipcRenderer.on("menu:export-backup", cb),
  onImportBackup: (cb) => ipcRenderer.on("menu:import-backup", cb),
  onSavedPrograms: (cb) => ipcRenderer.on("menu:saved-programs", cb),
  saveBackupDialog: (defaultName) => ipcRenderer.invoke("dialog:save-backup", defaultName),
  openBackupDialog: () => ipcRenderer.invoke("dialog:open-backup"),
  writeFile: (filePath, content) => ipcRenderer.invoke("fs:write-file", filePath, content),
  readFile: (filePath) => ipcRenderer.invoke("fs:read-file", filePath)
});
