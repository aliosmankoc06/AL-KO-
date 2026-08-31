/* ============ BAŞLAT ============ */
document.addEventListener("mouseup", endCellDrag);

if (window.desktop && window.desktop.isElectron) {
  window.desktop.onExportBackup(() => exportDataFile());
  window.desktop.onImportBackup(() => triggerImportFile());
}

renderTabbar();
renderMain();
