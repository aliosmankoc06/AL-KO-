/* ============================================================
   Performans Kriterleri Excel içe aktarma ayrıştırıcısı
   ------------------------------------------------------------
   Kullanıcının gerçek 1.Performans_Ders_İçi_Kriter.xlsx ve
   2.Performans_Ödev.xlsx dosyalarının yapısına göre yazıldı: her
   ders/sınıf bir sayfa; "Ders :", "Sınıf / Şube :", "Dönem :" ile
   başlayan meta satırları, aynı satırda kriter başlıkları ve
   "Toplam Puan" sütunu, altında Sıra No/Okul No/Adı ve Soyadı/
   kriter ağırlıkları başlık satırı, sonra öğrenci satırları.
   İkinci satırdaki "1. Performans..." / "2. Performans..." metni
   türü (ders içi / ödev) belirler.
   ============================================================ */

function cellText(v) {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toLocaleDateString("tr-TR");
  return String(v).trim();
}

function findLabelRowIndex(rows, prefix) {
  const target = prefix.toUpperCase();
  for (let i = 0; i < Math.min(rows.length, 8); i++) {
    const row = rows[i] || [];
    for (let c = 0; c < row.length; c++) {
      if (cellText(row[c]).toUpperCase().startsWith(target)) return i;
    }
  }
  return -1;
}
function labelValue(rows, prefix) {
  const i = findLabelRowIndex(rows, prefix);
  if (i < 0) return "";
  const row = rows[i] || [];
  for (let c = 0; c < row.length; c++) {
    const t = cellText(row[c]);
    if (!t.toUpperCase().startsWith(prefix.toUpperCase())) continue;
    const rest = t.slice(t.indexOf(":") + 1).trim();
    if (rest) return rest;
    for (let c2 = c + 1; c2 < row.length; c2++) {
      const v = cellText(row[c2]).replace(/^:\s*/, "").trim();
      if (v) return v;
    }
  }
  return "";
}
function findHeaderRowIndex(rows) {
  for (let i = 0; i < rows.length; i++) {
    const row = (rows[i] || []).map(v => cellText(v).toUpperCase());
    if (row.some(c => c.includes("SIRA")) && row.some(c => c.includes("OKUL NO"))) return i;
  }
  return -1;
}

function parsePerformansWorkbook(filePath, XLSX) {
  const wb = XLSX.readFile(filePath, { cellDates: true });
  const kayitlar = [];
  wb.SheetNames.forEach(sheetName => {
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: "" });
    const turMetin = cellText(rows[1] && rows[1][0]);
    const tur = /^\s*2\./.test(turMetin) ? "odev" : "dersici";
    const ders = labelValue(rows, "Ders");
    const sinif = labelValue(rows, "Sınıf").replace(/\//g, "-");
    const donem = labelValue(rows, "Dönem");
    if (!ders || !sinif) return;

    const dersRowIdx = findLabelRowIndex(rows, "Ders");
    const dersRow = rows[dersRowIdx] || [];
    let colToplam = dersRow.findIndex(v => cellText(v).toUpperCase().includes("TOPLAM"));
    if (colToplam < 0) colToplam = 11;

    const headerIdx = findHeaderRowIndex(rows);
    if (headerIdx < 0) return;

    const ogrenciler = [];
    for (let r = headerIdx + 1; r < rows.length; r++) {
      const row = rows[r] || [];
      const ad = cellText(row[2]);
      if (!ad) continue;
      const toplamRaw = row[colToplam];
      const toplamPuan = typeof toplamRaw === "number" ? toplamRaw : (parseFloat(toplamRaw) || 0);
      ogrenciler.push({
        sira: cellText(row[0]),
        okulNo: cellText(row[1]),
        ad,
        toplamPuan
      });
    }
    if (ogrenciler.length) kayitlar.push({ tur, ders, sinif, donem, ogrenciler });
  });
  return { kayitlar };
}

module.exports = { parsePerformansWorkbook };
