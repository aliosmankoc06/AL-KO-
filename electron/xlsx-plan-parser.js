/* ============================================================
   Yıllık Plan / Günlük Plan Excel içe aktarma ayrıştırıcısı
   ------------------------------------------------------------
   Kullanıcının kendi hazırladığı YILLIK_PLANLAR.xlsx ve
   GUNLUK_PLANLAR.xlsx şablonlarının gerçek yapısına göre yazıldı
   (bkz. belgeler/ klasörü). Her iki şablonda da her ders bir sayfa,
   ilk birkaç satır meta bilgi (DERS/SINIF/ÖĞRETMEN/ALAN-DAL/DERS
   SAATİ), sonra TARİH ile başlayan bir başlık satırı ve altında
   veri satırları var. TAKVİM sayfası "Hafta No" ile başlayan 37-40
   haftalık resmî çalışma takvimini içeriyor.
   ============================================================ */

const AY_REGEX = /Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık/;

function cellText(v) {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toLocaleDateString("tr-TR");
  return String(v).trim();
}

function sheetMeta(rows) {
  const map = {
    "DERS": "ders", "SINIF": "sinif", "ÖĞRETMEN": "ogretmen", "ALAN/DAL": "alanDal",
    "DERS SAATİ": "dersSaati", "DERS SAATI": "dersSaati", "DERS GÜNÜ SEÇ": "dersGunu"
  };
  const meta = {};
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i] || [];
    for (let c = 0; c < row.length; c++) {
      const label = cellText(row[c]).toUpperCase().trim();
      const key = map[label];
      if (!key || meta[key]) continue;
      for (let c2 = c + 1; c2 < row.length; c2++) {
        let val = cellText(row[c2]).replace(/^:\s*/, "").trim();
        if (val) {
          if (key === "sinif") val = val.replace(/(\d{1,2})\s*\/\s*([A-ZİÖÜÇŞĞ])/, "$1-$2");
          meta[key] = val;
          break;
        }
      }
    }
  }
  return meta;
}

function findHeaderRow(rows, requiredCols) {
  for (let i = 0; i < rows.length; i++) {
    const row = (rows[i] || []).map(v => cellText(v).toUpperCase());
    if (requiredCols.every(col => row.some(cell => cell === col))) return { rowIndex: i, cols: row };
  }
  return null;
}

function sinifGrade(sinif) {
  const m = /(\d{1,2})/.exec(sinif || "");
  return m ? Number(m[1]) : null;
}
function sistemFromSinif(sinif) {
  return sinifGrade(sinif) === 9 ? "maarif" : "eski";
}

const SINAV_TARIHI_REGEX = /(\d)\.\s*Dönem\s*(\d)\.\s*Sınav\s*Tarihi/i;
const SINAV_TARIHI_KEY = { "1-1": "d1s1", "1-2": "d1s2", "2-1": "d2s1", "2-2": "d2s2" };

function parseTakvimSheet(ws, XLSX) {
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false });
  const haftalar = [];
  let ogretimYili = "";
  const sinavTarihleri = { d1s1: "", d1s2: "", d2s1: "", d2s2: "" };
  for (const row of rows) {
    if (!row || !row.length) continue;
    for (let c = 0; c < row.length; c++) {
      const label = cellText(row[c]);
      if (label === "ÖĞRETİM YILI SEÇ" && !ogretimYili) {
        for (let c2 = c + 1; c2 < row.length; c2++) {
          const val = cellText(row[c2]);
          if (val) { ogretimYili = val; break; }
        }
      }
      const m = SINAV_TARIHI_REGEX.exec(label);
      if (m) {
        const key = SINAV_TARIHI_KEY[m[1] + "-" + m[2]];
        if (key) {
          for (let c2 = c + 1; c2 < row.length; c2++) {
            const val = cellText(row[c2]).replace(/^:\s*/, "").trim();
            if (val) { sinavTarihleri[key] = val; break; }
          }
        }
      }
    }
    const no = Number(row[0]);
    if (Number.isInteger(no) && no > 0 && row[1]) {
      const c1 = cellText(row[1]);
      if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(c1)) {
        /* [Hafta No, Pazartesi tarihi, Tarih Aralığı, Tatil mi?, Tatil Adı] biçimi */
        haftalar.push({
          no, pazartesi: c1, tarihAraligi: cellText(row[2]),
          tatilMi: cellText(row[3]) === "EVET", tatilAdi: cellText(row[4])
        });
      } else if (c1) {
        /* [Hafta No, Tarih Aralığı, Tatil mi?, Tatil Adı] biçimi (Pazartesi sütunu yok) */
        haftalar.push({
          no, pazartesi: "", tarihAraligi: c1,
          tatilMi: cellText(row[2]) === "EVET", tatilAdi: cellText(row[3])
        });
      }
    }
  }
  return haftalar.length ? { ogretimYili, haftalar, sinavTarihleri } : null;
}

function parseGunlukSheet(ws, XLSX) {
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false });
  const meta = sheetMeta(rows);
  const header = findHeaderRow(rows, ["TARİH", "KONU", "KAZANIM"]);
  if (!header || !meta.ders) return null;
  const colIndex = name => header.cols.indexOf(name);
  const idx = {
    tarih: colIndex("TARİH"), konu: colIndex("KONU"), kazanim: colIndex("KAZANIM"),
    giris: colIndex("GİRİŞ"), gelisme: colIndex("GELİŞME"), sonuc: colIndex("SONUÇ"),
    yontem: colIndex("YÖNTEM VE TEKNİKLER"), arac: colIndex("ARAÇ VE GEREÇLER"),
    olcme: colIndex("ÖLÇME-DEĞERLENDİRME")
  };
  const kayitlar = [];
  for (let r = header.rowIndex + 1; r < rows.length; r++) {
    const row = rows[r] || [];
    const tarih = cellText(row[idx.tarih]);
    if (!/^\d{1,2}\.\d{1,2}\.\d{4}/.test(tarih)) continue;
    kayitlar.push({
      tarih, konu: cellText(row[idx.konu]), kazanim: cellText(row[idx.kazanim]),
      giris: cellText(row[idx.giris]), gelisme: cellText(row[idx.gelisme]), sonuc: cellText(row[idx.sonuc]),
      yontem: cellText(row[idx.yontem]), arac: cellText(row[idx.arac]), olcme: cellText(row[idx.olcme])
    });
  }
  if (!kayitlar.length) return null;
  return { ders: meta.ders, sinif: meta.sinif || "", ogretmen: meta.ogretmen || "", alanDal: meta.alanDal || "",
    dersSaati: meta.dersSaati || "", dersGunu: meta.dersGunu || "", sistem: sistemFromSinif(meta.sinif), kayitlar };
}

const YONTEM_BASLIK = "ÖĞRENME-ÖĞRETME\nYÖNTEM VE TEKNİKLERİ";
const ARAC_BASLIK = "KULLANILAN EĞİTİM TEKNOLOJİLERİ,\nARAÇ VE GEREÇLER";

function parseYillikSheet(ws, XLSX) {
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false });
  const meta = sheetMeta(rows);
  const header = findHeaderRow(rows, ["TARİH", "KAZANIMLAR", "KONULAR"]);
  if (!header || !meta.ders) return null;
  const colIndex = name => header.cols.indexOf(name);
  const idx = {
    tarih: colIndex("TARİH"), kazanimlar: colIndex("KAZANIMLAR"), konular: colIndex("KONULAR"),
    yontem: colIndex(YONTEM_BASLIK), arac: colIndex(ARAC_BASLIK), degerlendirme: colIndex("DEĞERLENDİRME")
  };
  const haftalar = [];
  for (let r = header.rowIndex + 1; r < rows.length; r++) {
    const row = rows[r] || [];
    const tarih = cellText(row[idx.tarih]);
    if (!tarih || !AY_REGEX.test(tarih)) continue;
    haftalar.push({
      tarih, kazanimlar: cellText(row[idx.kazanimlar]), konular: cellText(row[idx.konular]),
      yontem: cellText(row[idx.yontem]), arac: cellText(row[idx.arac]), degerlendirme: cellText(row[idx.degerlendirme])
    });
  }
  if (!haftalar.length) return null;
  return { ders: meta.ders, sinif: meta.sinif || "", alanDal: meta.alanDal || "", dersSaati: meta.dersSaati || "",
    sistem: sistemFromSinif(meta.sinif), haftalar };
}

function parsePlanWorkbook(filePath, XLSX) {
  const wb = XLSX.readFile(filePath);
  const result = { takvim: null, yillikPlanlar: [], gunlukPlanlar: [] };
  for (const sn of wb.SheetNames) {
    const ws = wb.Sheets[sn];
    if (/TAKVİM/i.test(sn)) {
      const t = parseTakvimSheet(ws, XLSX);
      if (t) result.takvim = t;
      continue;
    }
    const g = parseGunlukSheet(ws, XLSX);
    if (g) { result.gunlukPlanlar.push(g); continue; }
    const y = parseYillikSheet(ws, XLSX);
    if (y) { result.yillikPlanlar.push(y); continue; }
  }
  return result;
}

module.exports = { parsePlanWorkbook };
