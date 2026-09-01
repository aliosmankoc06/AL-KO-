/* ============================================================
   VERİ MODELİ
   ------------------------------------------------------------
   Kural kaynağı: Millî Eğitim Bakanlığı Ortaöğretim Kurumları
   Yönetmeliği, Madde 88 (Koordinatör öğretmen görevlendirilmesi):
   "Bir öğretmene aynı gün için 8 saatten fazla ek ders görevi
   verilmez." Bu nedenle bir öğretmene koordinatörlük (işletme
   ziyareti) günü ayrıca okul dersi eklenmez — o gün tamamen
   koordinatörlüğe ayrılır, sadece 8 saati ücretlendirilir.
   ============================================================ */

const LS_KEY = "aok-sistem-v31";
const VERSIONS_KEY = "aok-versions-v1";
const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];

const KOORD_COURSE_ID = "crs-koordinatorluk";
const KOORD_START_HOUR = 1; // 2. ders saatinden başlar (0-indeksli)
const KOORD_BLOCK_LEN = 8;  // Madde 88: günde en fazla 8 saat ücretli koordinatörlük
const GROUP_DAYS = { psc: [0, 1, 2], cpc: [2, 3, 4], mesem: [0, 1, 3, 4] }; // psc: Pzt-Sal-Çar, cpc: Çar-Per-Cum, mesem: Pzt-Sal-Per-Cum (MESEM öğrencileri Çarşamba okula gelir)
const GROUP_LABELS = { psc: "Pazartesi-Salı-Çarşamba", cpc: "Çarşamba-Perşembe-Cuma", mesem: "Pazartesi-Salı-Perşembe-Cuma (MESEM)" };

const DAL_LABELS = {
  ORTAK9: "9. Sınıf Ortak",
  MBO: "Makine Bakım Onarım",
  BMI: "Bilgisayarlı Makine İmalatı",
  HERDAL: "Tüm Dallar",
  SERT: "Sertifika / Seçmeli",
  ORTAK: "Kültür Dersi",
  IDARI: "İdari Görev"
};

const GRADE_COLORS = {
  9: { bg: "#E8F1FC", ink: "#0D4A82", label: "9. Sınıf" },
  10: { bg: "#EAF5E9", ink: "#1F6B2F", label: "10. Sınıf" },
  11: { bg: "#FBEAF2", ink: "#7A2A4B", label: "11. Sınıf" },
  12: { bg: "#FCF0DC", ink: "#7A4A08", label: "12. Sınıf" },
  0: { bg: "#EEF0F4", ink: "#3C4356", label: "İdari" }
};
function gradeColor(grade) {
  return GRADE_COLORS[grade] !== undefined ? GRADE_COLORS[grade] : GRADE_COLORS[0];
}

function uid(prefix) { return prefix + Math.random().toString(36).slice(2, 9); }

function defaultState() {
  return {
    hoursPerDay: 10,
    rooms: [
      { id: "r1", name: "CAD-CAM Laboratuvarı" },
      { id: "r2", name: "İmalat Yöntemleri Atölyesi" },
      { id: "r3", name: "İmalat İşlemleri Atölyesi" },
      { id: "r4", name: "Derslik" }
    ],
    teachers: [
      { id: "t1", name: "Ali Osman Koç", timeOff: {}, hoursMode: "min", hoursTarget: 20 },
      { id: "t2", name: "Arzu Kırıcı", timeOff: {}, hoursMode: "min", hoursTarget: 20 },
      { id: "t3", name: "Gökhan Arslan", timeOff: {}, hoursMode: "min", hoursTarget: 20 },
      { id: "t4", name: "Şerif Yetim", timeOff: {}, hoursMode: "min", hoursTarget: 20 },
      { id: "t5", name: "Seyit Ömer Şeker", timeOff: {}, hoursMode: "min", hoursTarget: 20 },
      { id: "t6", name: "Levent Ergin", timeOff: {}, hoursMode: "exact", hoursTarget: 6, coordEligible: false }
    ],
    courses: [
      { id: "c9-1", code: "MGA", name: "Mesleki Gelişim Atölyesi", dal: "ORTAK9", grade: 9, hours: 2, blocks: [2] },
      { id: "c9-2", code: "TRS", name: "Teknik Resim", dal: "ORTAK9", grade: 9, hours: 2, blocks: [2] },
      { id: "c9-3", code: "TIİ", name: "Temel İmalat İşlemleri", dal: "ORTAK9", grade: 9, hours: 8, blocks: [4, 4] },
      { id: "c10mbo-1", code: "İYT", name: "İmalat Yöntemleri", dal: "MBO", grade: 10, hours: 6, blocks: [3, 3] },
      { id: "c10mbo-2", code: "BOM", name: "Bakım Onarım Meslek Resmi", dal: "MBO", grade: 10, hours: 3, blocks: [3] },
      { id: "c10mbo-3", code: "ÖLÇ", name: "Ölçme ve Kontrol", dal: "MBO", grade: 10, hours: 2, blocks: [2] },
      { id: "c10mbo-4", code: "MLZ", name: "Malzeme Bilgisi", dal: "MBO", grade: 10, hours: 2, blocks: [2] },
      { id: "c11mbo-1", code: "MBO", name: "Mekanik Bakım Onarım", dal: "MBO", grade: 11, hours: 6, blocks: [3, 3] },
      { id: "c11mbo-2", code: "OKS", name: "Otomatik Kontrol Sistemleri", dal: "MBO", grade: 11, hours: 6, blocks: [3, 3] },
      { id: "c11mbo-3", code: "MKZ", name: "Mekanizmalar", dal: "MBO", grade: 11, hours: 3, blocks: [3] },
      { id: "c11mbo-4", code: "TEL", name: "Temel Elektrik", dal: "MBO", grade: 11, hours: 2, blocks: [2] },
      { id: "sec-3", code: "SEÇ3", name: "Seçmeli Dersler (3 Saat)", dal: "SERT", grade: 12, hours: 3, blocks: [3] },
      { id: "sec-4", code: "SEÇ4", name: "Seçmeli Dersler (4 Saat)", dal: "SERT", grade: 12, hours: 4, blocks: [4] },
      { id: "pbo-10", code: "PBO", name: "Planlama Bakım Onarım (Alan Şefi)", dal: "IDARI", grade: 0, hours: 10, blocks: [10] },
      { id: "pbo-6", code: "PBO", name: "Planlama Bakım Onarım (Atölye Şefi)", dal: "IDARI", grade: 0, hours: 6, blocks: [6] }
    ],
    classes: [
      { id: "cl-9a", name: "9-A", grade: 9, dal: "ORTAK9", maxTeachersPerCourse: 2, assignments: [
        { id: "a-9a-1", courseId: "c9-2", eligibleTeacherIds: ["t1", "t5"], teacherCount: 2, roomIds: [] },
        { id: "a-9a-2", courseId: "c9-3", eligibleTeacherIds: ["t1", "t5"], teacherCount: 2, roomIds: [] },
        { id: "a-9a-3", courseId: "c9-1", eligibleTeacherIds: ["t1", "t5"], teacherCount: 2, roomIds: [] }
      ] },
      { id: "cl-9b", name: "9-B", grade: 9, dal: "ORTAK9", maxTeachersPerCourse: 2, excludeFromDistribution: true, assignments: [] },
      { id: "cl-10a", name: "10-A", grade: 10, dal: "MBO", maxTeachersPerCourse: 3, assignments: [
        { id: "a-10a-1", courseId: "c10mbo-1", eligibleTeacherIds: ["t3", "t2", "t4"], teacherCount: 3, roomIds: [] },
        { id: "a-10a-2", courseId: "c10mbo-2", eligibleTeacherIds: ["t3", "t6"], teacherCount: 2, roomIds: [] },
        { id: "a-10a-3", courseId: "c10mbo-3", eligibleTeacherIds: ["t3", "t2", "t4"], teacherCount: 3, roomIds: [] },
        { id: "a-10a-4", courseId: "c10mbo-4", eligibleTeacherIds: ["t3", "t2", "t4"], teacherCount: 3, roomIds: [] }
      ] },
      { id: "cl-10b", name: "10-B", grade: 10, dal: "MBO", maxTeachersPerCourse: 3, excludeFromDistribution: true, assignments: [] },
      { id: "cl-11a", name: "11-A", grade: 11, dal: "MBO", maxTeachersPerCourse: 2, assignments: [
        { id: "a-11a-1", courseId: "c11mbo-1", eligibleTeacherIds: ["t1", "t5"], teacherCount: 2, roomIds: [] },
        { id: "a-11a-2", courseId: "c11mbo-2", eligibleTeacherIds: ["t2", "t4"], teacherCount: 2, roomIds: [] },
        { id: "a-11a-3", courseId: "c11mbo-3", eligibleTeacherIds: ["t5", "t6"], teacherCount: 2, roomIds: [] },
        { id: "a-11a-4", courseId: "c11mbo-4", eligibleTeacherIds: ["t1", "t5"], teacherCount: 2, roomIds: [] }
      ] },
      { id: "cl-11b", name: "11-B", grade: 11, dal: "MBO", maxTeachersPerCourse: 2, excludeFromDistribution: true, assignments: [] },
      { id: "cl-12a", name: "12-A", grade: 12, dal: "MBO", schoolDays: [], maxTeachersPerCourse: 2, assignments: [
        { id: "a-12a-1", courseId: "sec-3", eligibleTeacherIds: ["t3", "t2"], teacherCount: 2, roomIds: [] },
        { id: "a-12a-2", courseId: "sec-4", eligibleTeacherIds: ["t2", "t4"], teacherCount: 2, roomIds: [] }
      ] },
      { id: "cl-12b", name: "12-B", grade: 12, dal: "BMI", schoolDays: [], maxTeachersPerCourse: 1, assignments: [
        { id: "a-12b-1", courseId: "sec-3", eligibleTeacherIds: ["t3"], teacherCount: 1, roomIds: [] },
        { id: "a-12b-2", courseId: "sec-4", eligibleTeacherIds: ["t3"], teacherCount: 1, roomIds: [] }
      ] },
      { id: "cl-idari", name: "İdari Görevler (Alan/Atölye Şefliği)", grade: 0, dal: "IDARI", schoolDays: [0, 1, 2, 3, 4], assignments: [
        { id: "a-idari-1", courseId: "pbo-10", eligibleTeacherIds: ["t1"], teacherCount: 1, roomIds: [] },
        { id: "a-idari-2", courseId: "pbo-6", eligibleTeacherIds: ["t2"], teacherCount: 1, roomIds: [] },
        { id: "a-idari-3", courseId: "pbo-6", eligibleTeacherIds: ["t4"], teacherCount: 1, roomIds: [] },
        { id: "a-idari-4", courseId: "pbo-6", eligibleTeacherIds: ["t3"], teacherCount: 1, roomIds: [] }
      ] }
    ],
    schedule: {},
    blockedSlots: {},
    teacherBlockedSlots: {},
    coordAssignments: [],
    isletmeler: [],
    isletmeTeacherAssign: {},
    students: [],
    akademikTakvim: null,
    yillikPlanlar: [],
    gunlukPlanlar: [],
    normKadro: { ogrenciSayilari: {}, koordinatorlukSatirlari: [] },
    toplantilar: [],
    envanter: { makineler: [] },
    durumTespitFormlari: [],
    performansKayitlari: [],
    performansAgirliklari: { dersici: [10, 10, 10, 10, 10, 30, 10, 10], odev: [10, 10, 10, 10, 10, 30, 10, 10] },
    donemRaporlari: { dersKesim: [], yaziliTeslim: [] },
    sinavHavuzu: { sorular: [] },
    sinavKagitlari: [],
    imzaSirkuleri: [],
    kalfalikUstalik: { kayitlar: [] },
    beceriSinavi: { kayitlar: [] },
    ogrenciListesi: [],
    seflikRaporlari: [],
    sinavNotlari: [],
    performansNotlari: [],
    donemArsivi: [],
    sinavTutanaklari: [],
    kurumBilgileri: {
      okulAdi: "Soma Mesleki ve Teknik Anadolu Lisesi",
      sehir: "SOMA",
      alanAdi: "Makine Teknolojisi Alanı",
      mudurAdi: "Ahmet Açar",
      alanSefiAdi: "Ali Osman Koç",
      alanSefiUnvani: "Makine Teknolojisi Alan Şefi",
      logo: null
    }
  };
}

function emptyState() {
  return {
    hoursPerDay: 10,
    rooms: [],
    courses: [],
    teachers: [],
    classes: [],
    schedule: {},
    blockedSlots: {},
    teacherBlockedSlots: {},
    coordAssignments: [],
    isletmeler: [],
    isletmeTeacherAssign: {},
    students: [],
    akademikTakvim: null,
    yillikPlanlar: [],
    gunlukPlanlar: [],
    normKadro: { ogrenciSayilari: {}, koordinatorlukSatirlari: [] },
    toplantilar: [],
    envanter: { makineler: [] },
    durumTespitFormlari: [],
    performansKayitlari: [],
    performansAgirliklari: { dersici: [10, 10, 10, 10, 10, 30, 10, 10], odev: [10, 10, 10, 10, 10, 30, 10, 10] },
    donemRaporlari: { dersKesim: [], yaziliTeslim: [] },
    sinavHavuzu: { sorular: [] },
    sinavKagitlari: [],
    imzaSirkuleri: [],
    kalfalikUstalik: { kayitlar: [] },
    beceriSinavi: { kayitlar: [] },
    ogrenciListesi: [],
    seflikRaporlari: [],
    sinavNotlari: [],
    performansNotlari: [],
    donemArsivi: [],
    sinavTutanaklari: [],
    kurumBilgileri: {
      okulAdi: "Soma Mesleki ve Teknik Anadolu Lisesi",
      sehir: "SOMA",
      alanAdi: "Makine Teknolojisi Alanı",
      mudurAdi: "Ahmet Açar",
      alanSefiAdi: "Ali Osman Koç",
      alanSefiUnvani: "Makine Teknolojisi Alan Şefi",
      logo: null
    }
  };
}

function normalizeState(s) {
  s.hoursPerDay = 10;
  if (!s.blockedSlots) s.blockedSlots = {};
  if (!s.teacherBlockedSlots) s.teacherBlockedSlots = {};
  if (!s.coordAssignments) s.coordAssignments = [];
  if (!s.isletmeler) s.isletmeler = [];
  s.isletmeler.forEach(isl => {
    if (!isl.kontenjanlar || typeof isl.kontenjanlar !== "object") isl.kontenjanlar = {};
    if (typeof isl.talep !== "string") isl.talep = "";
  });
  if (!s.isletmeTeacherAssign) s.isletmeTeacherAssign = {};
  if (!Array.isArray(s.students)) s.students = [];
  s.students.forEach(st => {
    if (typeof st.not !== "string") st.not = st.not !== undefined && st.not !== null ? String(st.not) : "";
    if (typeof st.tercihler !== "string") st.tercihler = "";
    if (typeof st.istemiyor !== "string") st.istemiyor = "";
    if (typeof st.yerlestirmeSirasi !== "string") st.yerlestirmeSirasi = "";
  });
  if (typeof s.eskiSistemKaldirildi !== "boolean") s.eskiSistemKaldirildi = false;
  if (s.akademikTakvim === undefined) s.akademikTakvim = null;
  if (s.akademikTakvim && (!s.akademikTakvim.sinavTarihleri || typeof s.akademikTakvim.sinavTarihleri !== "object")) {
    s.akademikTakvim.sinavTarihleri = { d1s1: "", d1s2: "", d2s1: "", d2s2: "" };
  }
  if (s.akademikTakvim && !Array.isArray(s.akademikTakvim.haftalar)) s.akademikTakvim.haftalar = [];
  if (!Array.isArray(s.yillikPlanlar)) s.yillikPlanlar = [];
  if (!Array.isArray(s.gunlukPlanlar)) s.gunlukPlanlar = [];
  s.yillikPlanlar.forEach(p => {
    if (!p.id) p.id = uid("yp");
    if (!Array.isArray(p.haftalar)) p.haftalar = [];
    p.haftalar.forEach(h => {
      if (typeof h.yontem !== "string") h.yontem = "";
      if (typeof h.arac !== "string") h.arac = "";
      if (typeof h.degerlendirme !== "string") h.degerlendirme = "";
    });
  });
  s.gunlukPlanlar.forEach(p => { if (!p.id) p.id = uid("gp"); });
  if (!s.normKadro || typeof s.normKadro !== "object") s.normKadro = {};
  if (!s.normKadro.ogrenciSayilari || typeof s.normKadro.ogrenciSayilari !== "object") s.normKadro.ogrenciSayilari = {};
  if (!Array.isArray(s.normKadro.koordinatorlukSatirlari)) s.normKadro.koordinatorlukSatirlari = [];
  if (!Array.isArray(s.toplantilar)) s.toplantilar = [];
  s.toplantilar.forEach(top => {
    if (!top.id) top.id = uid("top");
    if (!Array.isArray(top.katilimcilar)) top.katilimcilar = [];
    if (!Array.isArray(top.gorevDagilimi)) top.gorevDagilimi = [];
    if (!Array.isArray(top.gundemMaddeleri)) top.gundemMaddeleri = [];
  });
  if (!s.envanter || typeof s.envanter !== "object") s.envanter = {};
  if (!Array.isArray(s.envanter.makineler)) s.envanter.makineler = [];
  s.envanter.makineler.forEach(m => {
    if (!m.id) m.id = uid("mk");
    if (!Array.isArray(m.arizaKayitlari)) m.arizaKayitlari = [];
    if (!Array.isArray(m.onarimKayitlari)) m.onarimKayitlari = [];
    if (!Array.isArray(m.bakimKayitlari)) m.bakimKayitlari = [];
    if (!Array.isArray(m.yedekParcalar)) m.yedekParcalar = [];
    if (!m.talimat || typeof m.talimat !== "object") m.talimat = {};
    ["teknik", "hazirlik", "calistirma", "guvenlik", "bakim", "sikSorular", "acilDurum"].forEach(f => {
      if (typeof m.talimat[f] !== "string") m.talimat[f] = "";
    });
  });
  if (!Array.isArray(s.durumTespitFormlari)) s.durumTespitFormlari = [];
  s.durumTespitFormlari.forEach(f => {
    if (!f.id) f.id = uid("dtf");
    if (!Array.isArray(f.satirlar)) f.satirlar = [];
    f.satirlar.forEach(r => { if (!r.id) r.id = uid("dtr"); });
  });
  if (!Array.isArray(s.performansKayitlari)) s.performansKayitlari = [];
  s.performansKayitlari.forEach(k => {
    if (!k.id) k.id = uid("pf");
    if (k.tur !== "odev") k.tur = "dersici";
    if (!Array.isArray(k.ogrenciler)) k.ogrenciler = [];
    k.ogrenciler.forEach(o => {
      if (!o.id) o.id = uid("og");
      if (typeof o.toplamPuan !== "number") o.toplamPuan = Number(o.toplamPuan) || 0;
    });
  });
  if (!s.performansAgirliklari || typeof s.performansAgirliklari !== "object") s.performansAgirliklari = {};
  ["dersici", "odev"].forEach(tur => {
    const arr = s.performansAgirliklari[tur];
    if (!Array.isArray(arr) || arr.length !== 8 || arr.some(v => typeof v !== "number")) {
      s.performansAgirliklari[tur] = [10, 10, 10, 10, 10, 30, 10, 10];
    }
  });
  if (!s.donemRaporlari || typeof s.donemRaporlari !== "object") s.donemRaporlari = {};
  if (!Array.isArray(s.donemRaporlari.dersKesim)) s.donemRaporlari.dersKesim = [];
  if (!Array.isArray(s.donemRaporlari.yaziliTeslim)) s.donemRaporlari.yaziliTeslim = [];
  s.donemRaporlari.dersKesim.forEach(r => {
    if (!r.id) r.id = uid("dk");
    if (!Array.isArray(r.satirlar)) r.satirlar = [];
    r.satirlar.forEach(x => { if (!x.id) x.id = uid("dkr"); });
  });
  s.donemRaporlari.yaziliTeslim.forEach(r => {
    if (!r.id) r.id = uid("yt");
    if (!Array.isArray(r.satirlar)) r.satirlar = [];
    r.satirlar.forEach(x => { if (!x.id) x.id = uid("ytr"); });
  });
  if (!s.sinavHavuzu || typeof s.sinavHavuzu !== "object") s.sinavHavuzu = {};
  if (!Array.isArray(s.sinavHavuzu.sorular)) s.sinavHavuzu.sorular = [];
  s.sinavHavuzu.sorular.forEach(q => {
    if (!q.id) q.id = uid("sr");
    if (!Array.isArray(q.secenekler)) q.secenekler = [];
    q.secenekler.forEach(o => { if (!o.id) o.id = uid("sc"); });
    if (typeof q.puan !== "number") q.puan = Number(q.puan) || 10;
  });
  if (!Array.isArray(s.sinavKagitlari)) s.sinavKagitlari = [];
  s.sinavKagitlari.forEach(k => {
    if (!k.id) k.id = uid("sk");
    if (!Array.isArray(k.soruIdleri)) k.soruIdleri = [];
  });
  if (!Array.isArray(s.imzaSirkuleri)) s.imzaSirkuleri = [];
  s.imzaSirkuleri.forEach(k => { if (!k.id) k.id = uid("imza"); });
  function normalizeSinavKayitListesi(liste, prefix) {
    if (!Array.isArray(liste)) return [];
    liste.forEach(k => {
      if (!k.id) k.id = uid(prefix);
      if (typeof k.ogrenciNo !== "string") k.ogrenciNo = String(k.ogrenciNo || "");
      if (typeof k.ad !== "string") k.ad = "";
      if (typeof k.soyad !== "string") k.soyad = "";
      if (typeof k.kod !== "string") k.kod = "";
      if (!k.d1 || typeof k.d1 !== "object") k.d1 = {};
      if (!k.d2 || typeof k.d2 !== "object") k.d2 = {};
      ["t1", "t2", "ih1", "ih2", "proje", "deney"].forEach(f => {
        if (typeof k.d1[f] !== "string" && typeof k.d1[f] !== "number") k.d1[f] = "";
        if (typeof k.d2[f] !== "string" && typeof k.d2[f] !== "number") k.d2[f] = "";
      });
      if (!k.isDosyasi || typeof k.isDosyasi !== "object") k.isDosyasi = {};
      ["k1", "k2", "k3", "k4"].forEach(f => {
        if (typeof k.isDosyasi[f] !== "string" && typeof k.isDosyasi[f] !== "number") k.isDosyasi[f] = "";
      });
      if (typeof k.isDosyasiTeslimEtmedi !== "boolean") k.isDosyasiTeslimEtmedi = false;
      if (typeof k.sinavPuani !== "string" && typeof k.sinavPuani !== "number") k.sinavPuani = "";
      if (typeof k.aciklama !== "string") k.aciklama = "";
      if (typeof k.tckn !== "string") k.tckn = "";
      if (typeof k.kagitAdedi !== "string") k.kagitAdedi = "";
      ["degerlendirici1", "degerlendirici2", "degerlendirici3"].forEach(f => {
        if (typeof k[f] !== "string" && typeof k[f] !== "number") k[f] = "";
      });
    });
    return liste;
  }
  if (!s.kalfalikUstalik || typeof s.kalfalikUstalik !== "object") s.kalfalikUstalik = { kayitlar: [] };
  s.kalfalikUstalik.kayitlar = normalizeSinavKayitListesi(s.kalfalikUstalik.kayitlar, "ku").map(k => {
    if (k.tur !== "kalfalik" && k.tur !== "ustalik") k.tur = "kalfalik";
    if (typeof k.dal !== "string" || !k.dal) k.dal = "MBO";
    return k;
  });
  if (!s.beceriSinavi || typeof s.beceriSinavi !== "object") s.beceriSinavi = { kayitlar: [] };
  s.beceriSinavi.kayitlar = normalizeSinavKayitListesi(s.beceriSinavi.kayitlar, "bs").map(k => {
    if (typeof k.sinif !== "string" || !k.sinif) k.sinif = "12-A";
    if (typeof k.dal !== "string" || !k.dal) k.dal = "MBO";
    return k;
  });
  if (!Array.isArray(s.ogrenciListesi)) s.ogrenciListesi = [];
  s.ogrenciListesi.forEach(o => {
    if (!o.id) o.id = uid("og");
    if (typeof o.sinif !== "string") o.sinif = "";
    if (typeof o.okulNo !== "string") o.okulNo = String(o.okulNo || "");
    if (typeof o.ad !== "string") o.ad = "";
    if (typeof o.soyad !== "string") o.soyad = "";
    if (typeof o.cinsiyet !== "string") o.cinsiyet = "";
    if (typeof o.pansiyon !== "string") o.pansiyon = "";
  });
  if (!Array.isArray(s.seflikRaporlari)) s.seflikRaporlari = [];
  s.seflikRaporlari.forEach(r => {
    if (!r.id) r.id = uid("sr");
    if (typeof r.ay !== "string") r.ay = "";
    if (!Array.isArray(r.kayitlar)) r.kayitlar = [];
    r.kayitlar.forEach(k => {
      if (!k.id) k.id = uid("srk");
      if (typeof k.tarih !== "string") k.tarih = "";
      if (typeof k.gun !== "string") k.gun = "";
      if (typeof k.saat !== "string" && typeof k.saat !== "number") k.saat = "";
      if (typeof k.isler !== "string") k.isler = "";
    });
  });
  if (!Array.isArray(s.sinavNotlari)) s.sinavNotlari = [];
  s.sinavNotlari.forEach(n => {
    if (!n.id) n.id = uid("sn");
    if (typeof n.sinif !== "string") n.sinif = "";
    if (typeof n.ders !== "string") n.ders = "";
    if (n.donem !== "1" && n.donem !== "2") n.donem = "1";
    if (typeof n.uygulamaSinaviVarMi !== "boolean") n.uygulamaSinaviVarMi = true;
    if (!Array.isArray(n.kayitlar)) n.kayitlar = [];
    n.kayitlar.forEach(k => {
      if (!k.id) k.id = uid("snk");
      if (typeof k.okulNo !== "string") k.okulNo = String(k.okulNo || "");
      if (typeof k.ad !== "string") k.ad = "";
      if (typeof k.sinav1 !== "string") k.sinav1 = String(k.sinav1 !== undefined ? k.sinav1 : "");
      if (typeof k.sinav2 !== "string") k.sinav2 = String(k.sinav2 !== undefined ? k.sinav2 : "");
      if (typeof k.uygulama !== "string") k.uygulama = String(k.uygulama !== undefined ? k.uygulama : "");
    });
  });
  if (!Array.isArray(s.performansNotlari)) s.performansNotlari = [];
  s.performansNotlari.forEach(n => {
    if (!n.id) n.id = uid("pn");
    if (typeof n.sinif !== "string") n.sinif = "";
    if (typeof n.ders !== "string") n.ders = "";
    if (n.donem !== "1" && n.donem !== "2") n.donem = "1";
    if (typeof n.perf1Sayisi !== "number") n.perf1Sayisi = 3;
    if (typeof n.perf2Sayisi !== "number") n.perf2Sayisi = 3;
    if (!Array.isArray(n.kayitlar)) n.kayitlar = [];
    n.kayitlar.forEach(k => {
      if (!k.id) k.id = uid("pnk");
      if (typeof k.okulNo !== "string") k.okulNo = String(k.okulNo || "");
      if (typeof k.ad !== "string") k.ad = "";
      if (!Array.isArray(k.perf1)) k.perf1 = [];
      if (!Array.isArray(k.perf2)) k.perf2 = [];
      while (k.perf1.length < n.perf1Sayisi) k.perf1.push("");
      while (k.perf2.length < n.perf2Sayisi) k.perf2.push("");
      k.perf1 = k.perf1.slice(0, n.perf1Sayisi).map(v => String(v !== undefined && v !== null ? v : ""));
      k.perf2 = k.perf2.slice(0, n.perf2Sayisi).map(v => String(v !== undefined && v !== null ? v : ""));
    });
  });
  if (!Array.isArray(s.donemArsivi)) s.donemArsivi = [];
  s.donemArsivi.forEach(a => {
    if (!a.id) a.id = uid("da");
    if (typeof a.etiket !== "string") a.etiket = "";
    if (typeof a.tarih !== "string") a.tarih = "";
    if (!a.veri || typeof a.veri !== "object") a.veri = {};
  });
  if (!Array.isArray(s.sinavTutanaklari)) s.sinavTutanaklari = [];
  s.sinavTutanaklari.forEach(t => {
    if (!t.id) t.id = uid("st");
    ["kind", "tur", "dal", "sinif", "ogretimYili", "sinavDonemi", "sinavTarihi", "dersinAdi",
      "komisyonToplanmaSaati", "hazirlikSaati", "sinavBaslamaSaati", "katilmayanSayisi",
      "kullanilanKagitSayisi", "sinavBitisSaati", "degerlendirmeTarihSaati"].forEach(f => {
      if (typeof t[f] !== "string") t[f] = "";
    });
  });
  if (!s.kurumBilgileri || typeof s.kurumBilgileri !== "object") s.kurumBilgileri = {};
  {
    const kb = s.kurumBilgileri;
    if (typeof kb.okulAdi !== "string" || !kb.okulAdi) kb.okulAdi = "Soma Mesleki ve Teknik Anadolu Lisesi";
    if (typeof kb.sehir !== "string" || !kb.sehir) kb.sehir = "SOMA";
    if (typeof kb.alanAdi !== "string" || !kb.alanAdi) kb.alanAdi = "Makine Teknolojisi Alanı";
    if (typeof kb.mudurAdi !== "string") kb.mudurAdi = "";
    if (typeof kb.alanSefiAdi !== "string") kb.alanSefiAdi = "";
    if (typeof kb.alanSefiUnvani !== "string") kb.alanSefiUnvani = "";
    if (typeof kb.logo !== "string") kb.logo = null;
  }
  if (!s.seededIsletmeler2026) {
    s.seededIsletmeler2026 = true;
    const seed = [
      ["TKİ Ege Linyitleri İşletmesi Müdürlüğü", ["psc", "cpc"]],
      ["Defas Madencilik San. ve Tic. A.Ş.", ["psc"]],
      ["Hidro-Gen Enerji", ["psc", "cpc"]],
      ["Arıksan Metal", ["psc", "cpc"]],
      ["İmbat Madencilik", ["psc", "cpc"]],
      ["Bulut Metal", ["psc", "cpc", "mesem"]],
      ["Zinba Makina Sanayi", ["psc"]],
      ["Zirve Makina", ["psc", "mesem"]],
      ["Uysal Torna (Muhammet Uysal)", ["psc"]],
      ["Ürün Taşlama (Aycan Ürün)", ["psc"]],
      ["Özaltınbay Mermer", ["mesem"]]
    ];
    seed.forEach(([name, groups]) => {
      const existing = s.isletmeler.find(i => i.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        groups.forEach(g => { if (!existing.groups.includes(g)) existing.groups.push(g); });
      } else {
        s.isletmeler.push({ id: uid("isletme"), name, groups: groups.slice() });
      }
    });
    const studentSeed = [
      ["12/A", "1008", "Zafer Sarı", "MBO", "TKİ Ege Linyitleri İşletmesi Müdürlüğü"],
      ["12/A", "23014", "Ramazan Övek", "MBO", "TKİ Ege Linyitleri İşletmesi Müdürlüğü"],
      ["12/A", "23100", "Mert Kocabıyık", "MBO", "TKİ Ege Linyitleri İşletmesi Müdürlüğü"],
      ["12/A", "23107", "Hasan Mert Anaç", "MBO", "TKİ Ege Linyitleri İşletmesi Müdürlüğü"],
      ["12/A", "23245", "Ahmet Cemil Yıldız", "MBO", "TKİ Ege Linyitleri İşletmesi Müdürlüğü"],
      ["12/A", "23060", "Mehmet Kazım Uzun", "MBO", "Defas Madencilik San. ve Tic. A.Ş."],
      ["12/A", "23068", "Sadettin Aksu", "MBO", ""],
      ["12/A", "23081", "Batıkan Alemdar Taşpınar", "MBO", "Defas Madencilik San. ve Tic. A.Ş."],
      ["12/A", "23046", "Tunahan Teker", "MBO", "Hidro-Gen Enerji"],
      ["12/A", "23077", "Cengizhan Gezgin", "MBO", "Hidro-Gen Enerji"],
      ["12/A", "23050", "Yaşar Arda Cal", "MBO", "Arıksan Metal"],
      ["12/A", "23087", "Yusuf Efe Cal", "MBO", "Arıksan Metal"],
      ["12/A", "23238", "Arda Yılmaz", "MBO", "Arıksan Metal"],
      ["12/A", "23104", "Ali Han Çelik", "MBO", "İmbat Madencilik"],
      ["12/A", "23117", "Salih Agcık", "MBO", "İmbat Madencilik"],
      ["12/A", "23113", "Muhammet Emin Kılıç", "MBO", "Bulut Metal"],
      ["12/A", "23034", "Ali Yılmaz", "MBO", "Zinba Makina Sanayi"],
      ["12/A", "23110", "Süleyman Çoban", "MBO", "Zirve Makina"],
      ["12/A", "23015", "İsmail Sivri", "MBO", "Uysal Torna (Muhammet Uysal)"],
      ["12/A", "23102", "Hüseyin Yekta Şenlik", "MBO", ""],
      ["12/A", "23112", "Emirhan Ertürk", "MBO", "Ürün Taşlama (Aycan Ürün)"],
      ["12/A", "22", "Halil Yanık", "MBO", "Bulut Metal"],
      ["12/B", "23010", "Emirhan Yaslan", "BMİ", "TKİ Ege Linyitleri İşletmesi Müdürlüğü"],
      ["12/B", "23021", "Yiğit Afacan", "BMİ", "TKİ Ege Linyitleri İşletmesi Müdürlüğü"],
      ["12/B", "23026", "Yağız Şenhan", "BMİ", "TKİ Ege Linyitleri İşletmesi Müdürlüğü"],
      ["12/B", "23054", "Samet Yalın", "BMİ", "TKİ Ege Linyitleri İşletmesi Müdürlüğü"],
      ["12/B", "23105", "Efe Eşref Özdılkural", "BMİ", "TKİ Ege Linyitleri İşletmesi Müdürlüğü"],
      ["12/B", "23058", "Mehmet Can Çelebi", "BMİ", ""],
      ["12/B", "23109", "Eren Olum", "BMİ", ""],
      ["12/B", "23085", "Muhammet Toprak", "BMİ", "Arıksan Metal"],
      ["12/B", "23249", "Ege Genç", "BMİ", "Arıksan Metal"],
      ["12/B", "22117", "Hüseyin Anıl Koç", "BMİ", "Hidro-Gen Enerji"],
      ["12/B", "23053", "Mert Berat Varlı", "BMİ", "İmbat Madencilik"],
      ["12/B", "23093", "Fahri Can Ilgaz", "BMİ", "İmbat Madencilik"],
      ["12/B", "22102", "Ramazan Doganer", "BMİ", "Bulut Metal"],
      ["12/B", "23007", "Talha Ömer Yağmur", "BMİ", "Bulut Metal"],
      ["12/B", "202501", "Bülent Alp Özkan", "BMİ", "Zirve Makina"],
      ["11/C", "713", "Emirhan Türkmen", "MBO", "Özaltınbay Mermer"]
    ];
    studentSeed.forEach(([sinif, okulNo, ad, dal, isletme]) => {
      s.students.push({ id: uid("st"), sinif, okulNo, ad, dal, isletme });
    });
  }
  if (s.coordAssignments.length > 0 || s.classes.some(c => c.id && c.id.startsWith("koord-"))) {
    s.coordAssignments = [];
    s.classes = s.classes.filter(c => !(c.id && c.id.startsWith("koord-")));
    Object.keys(s.schedule || {}).forEach(k => {
      const cell = s.schedule[k];
      if (cell.classId && cell.classId.startsWith("koord-")) delete s.schedule[k];
    });
  }
  if (!s.courses.find(c => c.id === "crs-koordinatorluk")) {
    s.courses.push({ id: "crs-koordinatorluk", code: "KOORD", name: "Koordinatörlük (İşletme Ziyareti)", dal: "KOORD", grade: 0, hours: 8, blocks: [8] });
  }
  [9, 10, 11, 12].forEach(grade => {
    const id = "c-reh-" + grade;
    if (!s.courses.find(c => c.id === id)) {
      s.courses.push({ id, code: "REH", name: "Rehberlik", dal: "ORTAK", grade, hours: 1, blocks: [1] });
    }
  });
  [["cl-9b", "9-B", 9, "ORTAK9", 2], ["cl-10b", "10-B", 10, "MBO", 3], ["cl-11b", "11-B", 11, "MBO", 2]].forEach(([id, name, grade, dal, maxT]) => {
    if (!s.classes.find(c => c.id === id)) {
      s.classes.push({ id, name, grade, dal, maxTeachersPerCourse: maxT, excludeFromDistribution: true, assignments: [] });
    }
  });
  s.teachers.forEach(t => {
    if (!t.timeOff) t.timeOff = {};
    if (typeof t.hoursMode !== "string") {
      if (typeof t.maxHours === "number") { t.hoursMode = "exact"; t.hoursTarget = t.maxHours; }
      else { t.hoursMode = "min"; t.hoursTarget = 20; }
    }
    if (typeof t.coordEligible !== "boolean") t.coordEligible = true;
  });
  s.classes.forEach(cl => {
    cl.assignments.forEach(a => {
      if (!Array.isArray(a.eligibleTeacherIds)) a.eligibleTeacherIds = [];
      if (typeof a.teacherCount !== "number") a.teacherCount = a.eligibleTeacherIds.length > 0 ? 1 : 0;
      if (!Array.isArray(a.roomIds)) a.roomIds = a.roomId ? [a.roomId] : [];
    });
  });
  const c12a = s.classes.find(c => c.id === "cl-12a");
  if (c12a && (!c12a.schoolDays || c12a.schoolDays.length === 0)) c12a.schoolDays = [0, 1];
  const c12b = s.classes.find(c => c.id === "cl-12b");
  if (c12b && (!c12b.schoolDays || c12b.schoolDays.length === 0)) c12b.schoolDays = [3, 4];
  Object.values(s.schedule || {}).forEach(cell => {
    if (!Array.isArray(cell.teacherIds)) cell.teacherIds = [];
    if (!Array.isArray(cell.roomIds)) cell.roomIds = cell.roomId ? [cell.roomId] : [];
  });
  return s;
}

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return normalizeState(defaultState());
    return normalizeState(JSON.parse(raw));
  } catch (e) { return normalizeState(defaultState()); }
}

let S = loadState();
let lastSnapshot = null;
let lastSnapshotWasDelete = false;
let undoing = false;
function save() {
  const prevRaw = localStorage.getItem(LS_KEY);
  if (!undoing) {
    lastSnapshot = prevRaw;
    lastSnapshotWasDelete = !!window.__lastActionWasDelete;
  }
  window.__lastActionWasDelete = false;
  localStorage.setItem(LS_KEY, JSON.stringify(S));
  if (typeof showSaveToast === "function") showSaveToast(!undoing && lastSnapshotWasDelete);
}
function undoLastChange() {
  if (!lastSnapshot) return;
  let restored;
  try { restored = normalizeState(JSON.parse(lastSnapshot)); } catch (e) { return; }
  S = restored;
  lastSnapshot = null;
  undoing = true;
  save();
  undoing = false;
  if (typeof renderTabbar === "function") renderTabbar();
  if (typeof renderMain === "function") renderMain();
}

function loadVersions() {
  try { return JSON.parse(localStorage.getItem(VERSIONS_KEY)) || []; } catch (e) { return []; }
}
function saveVersionsList(v) { localStorage.setItem(VERSIONS_KEY, JSON.stringify(v)); }

function courseById(id) { return S.courses.find(c => c.id === id); }
function teacherById(id) { return S.teachers.find(t => t.id === id); }
function roomById(id) { return S.rooms.find(r => r.id === id); }
function classById(id) { return S.classes.find(c => c.id === id); }
function isletmeById(id) { return S.isletmeler.find(i => i.id === id); }

function coursesForClass(cls) {
  return S.courses.filter(c =>
    (c.grade === cls.grade && (c.dal === cls.dal || c.dal === "HERDAL" || c.dal === "ORTAK9" || c.dal === "ORTAK")) ||
    (c.dal === "SERT" && cls.grade >= 11)
  );
}
