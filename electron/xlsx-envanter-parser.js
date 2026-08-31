/* ============================================================
   Atölye / Envanter Excel içe aktarma ayrıştırıcısı
   ------------------------------------------------------------
   Kullanıcının Makine Envanteri Excel dosyasının gerçek yapısına
   göre yazıldı (bkz. belgeler/Makine_Envanteri_2026.xlsx):
   S.N / LABORATUVAR-ATÖLYE / MAKİNA ADI / MARKA / MODEL / SERİ NO /
   DURUM / NOTLAR başlıklı tek tablo.
   ============================================================ */

function cellText(v) {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toLocaleDateString("tr-TR");
  return String(v).trim();
}

const HEADER_MAP = {
  "LABORATUVAR/ATÖLYE": "lab",
  "LABORATUVAR / ATÖLYE": "lab",
  "MAKİNA ADI": "ad",
  "MAKİNE ADI": "ad",
  "MARKA": "marka",
  "MODEL": "model",
  "SERİ NO": "seriNo",
  "DURUM": "durum",
  "NOTLAR": "notlar"
};

function findHeaderRow(rows) {
  for (let i = 0; i < rows.length; i++) {
    const row = (rows[i] || []).map(v => cellText(v).toUpperCase());
    if (row.some(c => c === "MAKİNA ADI" || c === "MAKİNE ADI")) return { rowIndex: i, cols: row };
  }
  return null;
}

function parseEnvanterWorkbook(filePath, XLSX) {
  const wb = XLSX.readFile(filePath, { cellDates: true });
  const makineler = [];
  wb.SheetNames.forEach(sheetName => {
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: "" });
    const header = findHeaderRow(rows);
    if (!header) return;
    const colIndex = {};
    header.cols.forEach((label, i) => {
      const key = HEADER_MAP[label];
      if (key) colIndex[key] = i;
    });
    for (let r = header.rowIndex + 1; r < rows.length; r++) {
      const row = rows[r] || [];
      const ad = colIndex.ad !== undefined ? cellText(row[colIndex.ad]) : "";
      if (!ad || /^ÖZET/i.test(ad) || /^TOPLAM/i.test(ad)) continue;
      makineler.push({
        lab: colIndex.lab !== undefined ? cellText(row[colIndex.lab]) : "",
        ad,
        marka: colIndex.marka !== undefined ? cellText(row[colIndex.marka]) : "",
        model: colIndex.model !== undefined ? cellText(row[colIndex.model]) : "",
        seriNo: colIndex.seriNo !== undefined ? cellText(row[colIndex.seriNo]) : "",
        durum: colIndex.durum !== undefined ? cellText(row[colIndex.durum]) : "",
        notlar: colIndex.notlar !== undefined ? cellText(row[colIndex.notlar]) : ""
      });
    }
  });
  return { makineler };
}

module.exports = { parseEnvanterWorkbook };
