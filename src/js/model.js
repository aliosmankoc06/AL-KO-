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
      { id: "sert-1", code: "MKE", name: "Seçmeli Makine Elemanları", dal: "SERT", grade: 12, hours: 2, blocks: [2] },
      { id: "sert-2", code: "HPN", name: "Seçmeli Hidrolik-Pnömatik", dal: "SERT", grade: 12, hours: 2, blocks: [2] },
      { id: "sert-3", code: "MKÇ", name: "Seçmeli Mekanizma Çizimleri", dal: "SERT", grade: 12, hours: 3, blocks: [3] },
      { id: "pbo-10", code: "PBO", name: "Planlama Bakım Onarım (Alan Şefi)", dal: "IDARI", grade: 0, hours: 10, blocks: [10] },
      { id: "pbo-6", code: "PBO", name: "Planlama Bakım Onarım (Atölye Şefi)", dal: "IDARI", grade: 0, hours: 6, blocks: [6] }
    ],
    classes: [
      { id: "cl-9a", name: "9-A", grade: 9, dal: "ORTAK9", maxTeachersPerCourse: 2, assignments: [
        { id: "a-9a-1", courseId: "c9-2", eligibleTeacherIds: ["t1", "t2", "t3", "t4", "t5", "t6"], teacherCount: 2, roomIds: [] },
        { id: "a-9a-2", courseId: "c9-3", eligibleTeacherIds: ["t1", "t2", "t3", "t4", "t5", "t6"], teacherCount: 2, roomIds: [] },
        { id: "a-9a-3", courseId: "c9-1", eligibleTeacherIds: ["t1", "t2", "t3", "t4", "t5", "t6"], teacherCount: 2, roomIds: [] }
      ] },
      { id: "cl-10a", name: "10-A", grade: 10, dal: "MBO", maxTeachersPerCourse: 3, assignments: [
        { id: "a-10a-1", courseId: "c10mbo-1", eligibleTeacherIds: ["t1", "t2", "t3", "t4", "t5", "t6"], teacherCount: 3, roomIds: [] },
        { id: "a-10a-2", courseId: "c10mbo-2", eligibleTeacherIds: ["t1", "t2", "t3", "t4", "t5", "t6"], teacherCount: 3, roomIds: [] },
        { id: "a-10a-3", courseId: "c10mbo-3", eligibleTeacherIds: ["t1", "t2", "t3", "t4", "t5", "t6"], teacherCount: 3, roomIds: [] },
        { id: "a-10a-4", courseId: "c10mbo-4", eligibleTeacherIds: ["t1", "t2", "t3", "t4", "t5", "t6"], teacherCount: 3, roomIds: [] }
      ] },
      { id: "cl-11a", name: "11-A", grade: 11, dal: "MBO", maxTeachersPerCourse: 2, assignments: [
        { id: "a-11a-1", courseId: "c11mbo-1", eligibleTeacherIds: ["t1", "t2", "t3", "t4", "t5", "t6"], teacherCount: 2, roomIds: [] },
        { id: "a-11a-2", courseId: "c11mbo-2", eligibleTeacherIds: ["t1", "t2", "t3", "t4", "t5", "t6"], teacherCount: 3, roomIds: [] },
        { id: "a-11a-3", courseId: "c11mbo-3", eligibleTeacherIds: ["t1", "t2", "t3", "t4", "t5", "t6"], teacherCount: 2, roomIds: [] },
        { id: "a-11a-4", courseId: "c11mbo-4", eligibleTeacherIds: ["t1", "t2", "t3", "t4", "t5", "t6"], teacherCount: 2, roomIds: [] }
      ] },
      { id: "cl-12a", name: "12-A", grade: 12, dal: "MBO", schoolDays: [], maxTeachersPerCourse: 2, assignments: [
        { id: "a-12a-1", courseId: "sert-1", eligibleTeacherIds: ["t1", "t2", "t3", "t4", "t5", "t6"], teacherCount: 2, roomIds: [] },
        { id: "a-12a-2", courseId: "sert-2", eligibleTeacherIds: ["t1", "t2", "t3", "t4", "t5", "t6"], teacherCount: 2, roomIds: [] },
        { id: "a-12a-3", courseId: "sert-3", eligibleTeacherIds: ["t1", "t2", "t3", "t4", "t5", "t6"], teacherCount: 2, roomIds: [] }
      ] },
      { id: "cl-12b", name: "12-B", grade: 12, dal: "BMI", schoolDays: [], maxTeachersPerCourse: 1, assignments: [
        { id: "a-12b-1", courseId: "sert-1", eligibleTeacherIds: ["t1", "t2", "t3", "t4", "t5", "t6"], teacherCount: 1, roomIds: [] },
        { id: "a-12b-2", courseId: "sert-2", eligibleTeacherIds: ["t1", "t2", "t3", "t4", "t5", "t6"], teacherCount: 1, roomIds: [] },
        { id: "a-12b-3", courseId: "sert-3", eligibleTeacherIds: ["t1", "t2", "t3", "t4", "t5", "t6"], teacherCount: 1, roomIds: [] }
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
    isletmeTeacherAssign: {}
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
    isletmeTeacherAssign: {}
  };
}

function normalizeState(s) {
  s.hoursPerDay = 10;
  if (!s.blockedSlots) s.blockedSlots = {};
  if (!s.teacherBlockedSlots) s.teacherBlockedSlots = {};
  if (!s.coordAssignments) s.coordAssignments = [];
  if (!s.isletmeler) s.isletmeler = [];
  if (!s.isletmeTeacherAssign) s.isletmeTeacherAssign = {};
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
function save() { localStorage.setItem(LS_KEY, JSON.stringify(S)); }

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
