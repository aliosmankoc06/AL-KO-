/* ============================================================
   ARAYÜZ (VIEWS)
   ============================================================ */

const MODULES = [
  { id: "ana", label: "Ana Sayfa", icon: "home" },
  { id: "ders-programi", label: "Ders Programı", icon: "calendar" },
  { id: "yillik-plan", label: "Yıllık Plan", icon: "note" },
  { id: "gunluk-plan", label: "Günlük Plan", icon: "book" },
  { id: "norm-kadro", label: "Norm Kadro", icon: "chart" },
  { id: "okul-zumresi", label: "Okul Zümresi", icon: "users" },
  { id: "il-zumresi", label: "İl Zümresi", icon: "building" },
  { id: "staj-yerlestirme", label: "Staj Yerleştirme", icon: "briefcase" },
  { id: "atolye-envanter", label: "Atölye / Envanter", icon: "tool" },
  { id: "performans", label: "Performans Kriterleri", icon: "star" },
  { id: "donem-raporlari", label: "Ders Kesim / Yazılı Teslim", icon: "report" },
  { id: "sinav-havuzu", label: "Sınav Havuzu", icon: "question" }
];
const DERS_PROGRAMI_TABS = [
  { id: "havuz", label: "Ders Havuzu", icon: "book" },
  { id: "ogretmen", label: "Öğretmenler", icon: "users" },
  { id: "sinif", label: "Sınıflar ve Ders Atama", icon: "school" },
  { id: "koordinatorluk", label: "Koordinatörlük", icon: "building" },
  { id: "dagitim", label: "Ders Dağıtım", icon: "shuffle" },
  { id: "programlar", label: "Programlar", icon: "grid" }
];
let activeModule = "ana";
let activeTab = "havuz";
let activeClassId = S.classes[0] ? S.classes[0].id : null;
let activeTeacherId = S.teachers[0] ? S.teachers[0].id : null;
let multiSelectMode = false;
let selectedTeacherCells = new Set();
let activeOffTeacherId = null;
let activePlanSistem = "maarif";
let activePlanEntryId = { yillik: null, gunluk: null };

function renderTabbar() {
  document.getElementById("tabbar").innerHTML = MODULES.map(m =>
    `<button class="nav-btn ${(m.id === activeModule || (m.id === 'ders-programi' && activeModule === 'ders-programi-secim')) ? 'active' : ''}" onclick="setModule('${m.id}')">${icon(m.icon)}<span>${m.label}</span></button>`
  ).join("");
  renderSubTabbar();
}
function renderSubTabbar() {
  const el = document.getElementById("subtabbar");
  if (activeModule === "ders-programi") {
    el.innerHTML = `<div class="nav-section-label">Ders Programı</div>` + DERS_PROGRAMI_TABS.map(t =>
      `<button class="nav-btn sub ${t.id === activeTab ? 'active' : ''}" onclick="setTab('${t.id}')">${icon(t.icon)}<span>${t.label}</span></button>`
    ).join("");
  } else {
    el.innerHTML = "";
  }
}
function setModule(id) {
  activeModule = id;
  if (id === "ders-programi" && !DERS_PROGRAMI_TABS.some(t => t.id === activeTab)) activeTab = "havuz";
  selectedTeacherCells.clear();
  multiSelectMode = false;
  renderTabbar();
  renderMain();
}
function setTab(id) { activeTab = id; selectedTeacherCells.clear(); multiSelectMode = false; renderSubTabbar(); renderMain(); }

function renderMain() {
  const el = document.getElementById("main");
  if (activeModule === "ana") { el.innerHTML = viewAna(); return; }
  if (activeModule === "ders-programi-secim") { el.innerHTML = viewDersProgramiChooser(); return; }
  if (activeModule === "yillik-plan") { el.innerHTML = viewPlanModule("yillik"); return; }
  if (activeModule === "gunluk-plan") { el.innerHTML = viewPlanModule("gunluk"); return; }
  if (activeModule === "norm-kadro") { el.innerHTML = viewNormKadro(); return; }
  if (activeModule === "okul-zumresi") { el.innerHTML = viewOkulZumresi(); return; }
  if (activeModule === "il-zumresi") { el.innerHTML = viewPlaceholderModule("İl Zümresi", "İl zümre toplantı tutanaklarınızı buraya birlikte kuracağız."); return; }
  if (activeModule === "staj-yerlestirme") { el.innerHTML = viewStajYerlestirme(); return; }
  if (activeModule === "atolye-envanter") { el.innerHTML = viewAtolyeEnvanter(); return; }
  if (activeModule === "performans") { el.innerHTML = viewPerformans(); return; }
  if (activeModule === "donem-raporlari") { el.innerHTML = viewDonemRaporlari(); return; }
  if (activeModule === "sinav-havuzu") { el.innerHTML = viewSinavHavuzu(); return; }
  if (activeTab === "havuz") el.innerHTML = viewHavuz();
  else if (activeTab === "ogretmen") el.innerHTML = viewOgretmen();
  else if (activeTab === "sinif") el.innerHTML = viewSinif();
  else if (activeTab === "dagitim") el.innerHTML = viewDagitim();
  else if (activeTab === "koordinatorluk") el.innerHTML = viewKoordinatorluk();
  else if (activeTab === "programlar") el.innerHTML = viewProgramlar();
}

function hasUnsavedWork() {
  return S.classes.length > 0 || S.teachers.length > 0 || Object.keys(S.schedule).length > 0;
}
function confirmDestructive(message, onConfirm) {
  if (!hasUnsavedWork()) { onConfirm(); return; }
  window._confirmProceed = () => { closeModal(); onConfirm(); };
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg">
      <div class="modal" style="width:380px;">
        <h3 style="color:var(--warn);">Dikkat</h3>
        <p class="small">${message}</p>
        <div class="row">
          <button class="btn" onclick="closeModal()">Vazgeç</button>
          <button class="btn danger" onclick="window._confirmProceed();">Evet, Devam Et</button>
        </div>
      </div>
    </div>`;
}
function startNewProgram() {
  confirmDestructive("Şu anki çalışmanız (ders havuzu, öğretmenler, sınıflar, koordinatörlük — hepsi) silinip tertemiz, boş bir programla başlanacak. Bunun yerine mevcut verilerinizi korumak istiyorsanız Vazgeç deyip önce \"Kaydet\" yapın.", () => {
    S = normalizeState(emptyState());
    save();
    activeModule = "ders-programi";
    activeTab = "havuz";
    renderTabbar();
    renderMain();
  });
}
function continueCurrentProgram() {
  activeModule = "ders-programi";
  if (!DERS_PROGRAMI_TABS.some(t => t.id === activeTab)) activeTab = "havuz";
  renderTabbar();
  renderMain();
}
function viewDersProgramiChooser() {
  return `
  <div class="card">
    <h2>Ders Programı</h2>
    <p class="small">Nasıl devam etmek istiyorsunuz?</p>
    <div class="row" style="max-width:560px;flex-wrap:wrap;">
      <button class="btn primary" onclick="continueCurrentProgram()">${icon('play')} Kaldığım Yerden Devam Et</button>
      <button class="btn" onclick="restoreSchoolDefaults()">${icon('school')} Okulun Ders Havuzu/Öğretmen Listesiyle Başla</button>
      <button class="btn danger" onclick="startNewProgram()">${icon('new')} Tamamen Boş Bir Dosyayla Başla</button>
    </div>
    <p class="small" style="margin-top:8px;">Ortadaki buton, ders havuzunuzu (9-12. sınıf müfredatı) ve öğretmen listenizi (Ali Osman Koç, Arzu Kırıcı, Gökhan Arslan, Şerif Yetim, Seyit Ömer Şeker, Levent Ergin) hazır getirir — çalışma alanınız boşaldıysa kullanın.</p>
  </div>
  ${renderSavedProgramsCard()}
  ${renderBackupCard()}`;
}
function restoreSchoolDefaults() {
  confirmDestructive("Şu anki çalışma alanınızın üzerine, okulun standart ders havuzu ve öğretmen listesi yüklenecek (dağıtım/atamalarınız varsa onlar silinir). Devam edilsin mi?", () => {
    S = normalizeState(defaultState());
    save();
    activeModule = "ders-programi";
    activeTab = "havuz";
    renderTabbar();
    renderMain();
  });
}
function openSavedProgram(id) {
  confirmDestructive("Şu anki çalışmanız, açacağınız kayıtlı programın üzerine yazılıp değişecek. Önce mevcut hâlini korumak istiyorsanız Vazgeç deyip önce \"Kaydet\" yapın.", () => {
    const versions = loadVersions();
    const v = versions.find(x => x.id === id);
    if (!v) return;
    S = normalizeState(JSON.parse(JSON.stringify(v.data)));
    save();
    activeModule = "ders-programi";
    activeTab = "dagitim";
    renderTabbar();
    renderMain();
  });
}
function exportDataFile() {
  const payload = { exportedAt: new Date().toISOString(), state: S, versions: loadVersions() };
  const json = JSON.stringify(payload, null, 2);
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `ali-osman-koc-yedek-${dateStr}.json`;
  if (window.desktop && window.desktop.isElectron) {
    window.desktop.saveBackupDialog(filename).then(filePath => {
      if (!filePath) return;
      window.desktop.writeFile(filePath, json).then(() => alert("Yedek kaydedildi: " + filePath));
    });
    return;
  }
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function applyImportedPayload(raw) {
  try {
    const payload = JSON.parse(raw);
    const importedState = payload.state || payload;
    confirmDestructive("Bu yedek dosyası yüklenirse, şu anki çalışma alanınızın üzerine yazılacak. Devam edilsin mi?", () => {
      S = normalizeState(importedState);
      save();
      if (payload.versions && Array.isArray(payload.versions)) {
        saveVersionsList(payload.versions);
      }
      setModule("ana");
      alert("Yedek başarıyla yüklendi.");
    });
  } catch (err) {
    alert("Bu dosya okunamadı — geçerli bir yedek dosyası olduğundan emin olun.");
  }
}
function triggerImportFile() {
  if (window.desktop && window.desktop.isElectron) {
    window.desktop.openBackupDialog().then(filePath => {
      if (!filePath) return;
      window.desktop.readFile(filePath).then(raw => applyImportedPayload(raw));
    });
    return;
  }
  document.getElementById("import-file-input").click();
}
function handleImportFile(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    applyImportedPayload(e.target.result);
    input.value = "";
  };
  reader.readAsText(file);
}
function renderBackupCard() {
  const fileInputHtml = (window.desktop && window.desktop.isElectron) ? "" :
    `<input type="file" id="import-file-input" accept=".json" style="display:none" onchange="handleImportFile(this)">`;
  return `
  <div class="card">
    <h2>Yedekle / Yükle</h2>
    <p class="small">Verilerinizi (ders havuzu, öğretmenler, sınıflar, koordinatörlük, kayıtlı programların hepsi) bir dosyaya indirip saklayabilir, farklı bir cihazda ya da farklı bir sürümde bu dosyadan geri yükleyebilirsiniz. Bu, bilgisayar/sürüm değiştiğinde verilerinizin kaybolmamasını sağlar.</p>
    <div class="row" style="max-width:500px;">
      <button class="btn primary" onclick="exportDataFile()">Verilerimi İndir (Yedek Al)</button>
      <button class="btn" onclick="triggerImportFile()">Yedek Dosyasından Yükle</button>
      ${fileInputHtml}
    </div>
  </div>`;
}
function renderSavedProgramsCard() {
  const versions = loadVersions();
  const rows = versions.slice().reverse().map(v => {
    const d = new Date(v.savedAt);
    const dateStr = isNaN(d.getTime()) ? "" : d.toLocaleString('tr-TR');
    return `<tr>
      <td>${v.name}</td>
      <td class="small">${dateStr}</td>
      <td>
        <button class="btn" onclick="openSavedProgram('${v.id}')">Aç</button>
        <button class="btn danger" onclick="deleteVersion('${v.id}')">Sil</button>
      </td>
    </tr>`;
  }).join("") || `<tr><td colspan="3" class="small">Henüz kayıtlı bir kopyanız yok.</td></tr>`;
  return `
  <div class="card">
    <h2>Kayıtlı Programlarım</h2>
    <p class="small">"Kaydet" dediğinizde çalışma alanınız <b>silinmez</b> — sadece o anki hâlin isimli bir kopyası burada saklanır, siz aynı yerden çalışmaya devam edersiniz. Farklı bir kayıtlı kopyayı buradan <b>açabilir</b> (o anki çalışmanızın üzerine yazar) ya da silebilirsiniz.</p>
    <table><tr><th>Ad</th><th>Kaydedilme Tarihi</th><th></th></tr>${rows}</table>
    <p class="small" style="margin-top:10px;">Tamamen sıfırdan, boş bir programla başlamak isterseniz: <button class="btn danger" onclick="startNewProgram()">Boş Bir Programla Başla</button></p>
  </div>`;
}

/* ---- Staj Yerleştirme ---- */
function studentIsletmeOptions(selected) {
  const names = S.isletmeler.map(i => i.name);
  if (selected && !names.includes(selected)) names.unshift(selected);
  return `<option value="">— seçilmedi —</option>` + names.map(n => `<option value="${n}" ${n === selected ? 'selected' : ''}>${n}</option>`).join("");
}
function viewStajYerlestirme() {
  const bySinif = {};
  S.students.forEach(st => {
    const key = st.sinif || "—";
    if (!bySinif[key]) bySinif[key] = [];
    bySinif[key].push(st);
  });
  const sinifKeys = Object.keys(bySinif).sort();
  const listHtml = sinifKeys.map(sinif => {
    const rows = bySinif[sinif].map(st => `
      <tr>
        <td>${st.okulNo || ''}</td>
        <td>${escHtml(st.ad)}</td>
        <td>${st.dal || ''}</td>
        <td class="no-print"><select onchange="setStudentIsletme('${st.id}', this.value)">${studentIsletmeOptions(st.isletme)}</select></td>
        <td class="print-only-cell">${escHtml(st.isletme || '—')}</td>
        <td class="no-print"><div class="row" style="margin:0;"><button class="btn" onclick="editStudent('${st.id}')">Düzenle</button><button class="btn danger" onclick="deleteStudent('${st.id}')">Sil</button></div></td>
      </tr>`).join("");
    return `<h2 style="margin-top:16px;">${escHtml(sinif)}</h2><table><tr><th>Okul No</th><th>Ad Soyad</th><th>Dal</th><th>İşletme</th><th class="no-print"></th></tr>${rows}</table>`;
  }).join("") || `<p class="small">Henüz öğrenci eklenmedi.</p>`;

  return `
  <div class="card no-print">
    <h2>Staj Yerleştirme — Öğrenci Listesi</h2>
    <p class="small">Hangi öğrencinin hangi işletmede staj yaptığını burada takip edin. İşletme sütunundaki listeyi <b>Koordinatörlük</b> sekmesine eklediğiniz işletmeler doldurur.</p>
    ${belgeAracCubugu("Staj Yerleştirme - Öğrenci Listesi")}
  </div>
  <div class="print-area">
    ${belgeYazdirmaBasligi("Staj Yerleştirme — Öğrenci Listesi")}
    <div class="card">${listHtml}</div>
  </div>
  <div class="card no-print">
    <h2>Öğrenci Ekle</h2>
    <div class="grid3">
      <div><label class="small">Sınıf</label><input type="text" id="ns-sinif" placeholder="örn. 12/A" style="width:100%"></div>
      <div><label class="small">Okul No</label><input type="text" id="ns-okulno" style="width:100%"></div>
      <div><label class="small">Ad Soyad</label><input type="text" id="ns-ad" style="width:100%"></div>
      <div><label class="small">Dal</label><input type="text" id="ns-dal" placeholder="örn. MBO" style="width:100%"></div>
      <div><label class="small">İşletme</label><select id="ns-isletme" style="width:100%">${studentIsletmeOptions()}</select></div>
    </div>
    <div class="row" style="max-width:200px"><button class="btn primary" onclick="addStudent()">Ekle</button></div>
  </div>
  <div class="card no-print">
    <h2>Excel'den Toplu Ekle</h2>
    <p class="small">Excel dosyanızdaki Sınıf, Okul No, Ad Soyad, Dal, İşletme sütunlarını seçip kopyalayın (Ctrl+C), aşağıya yapıştırın (Ctrl+V) ve "İçe Aktar"a basın. Her satır bir öğrenci olmalı.</p>
    <textarea id="bulk-student-paste" style="width:100%;height:120px;font-family:monospace;font-size:11.5px;" placeholder="12/A&#9;23014&#9;Ramazan Övek&#9;MBO&#9;TKİ Ege Linyitleri İşletmesi Müdürlüğü"></textarea>
    <div class="row" style="max-width:200px"><button class="btn primary" onclick="bulkImportStudents()">İçe Aktar</button></div>
  </div>`;
}
function addStudent() {
  const sinif = document.getElementById("ns-sinif").value.trim();
  const okulNo = document.getElementById("ns-okulno").value.trim();
  const ad = document.getElementById("ns-ad").value.trim();
  const dal = document.getElementById("ns-dal").value.trim();
  const isletme = document.getElementById("ns-isletme").value;
  if (!ad) { alert("Öğrenci adı girin."); return; }
  S.students.push({ id: uid("st"), sinif, okulNo, ad, dal, isletme });
  save(); renderMain();
}
function deleteStudent(id) {
  if (!confirm("Bu öğrenciyi listeden silmek istiyor musunuz?")) return;
  S.students = S.students.filter(s => s.id !== id);
  save(); renderMain();
}
function editStudent(id) {
  const st = S.students.find(s => s.id === id);
  if (!st) return;
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:380px;">
        <h3>Öğrenciyi Düzenle</h3>
        <label class="small">Sınıf</label><input type="text" id="es-sinif" value="${escHtml(st.sinif || '')}" style="width:100%">
        <label class="small">Okul No</label><input type="text" id="es-okulno" value="${escHtml(st.okulNo || '')}" style="width:100%">
        <label class="small">Ad Soyad</label><input type="text" id="es-ad" value="${escHtml(st.ad || '')}" style="width:100%">
        <label class="small">Dal</label><input type="text" id="es-dal" value="${escHtml(st.dal || '')}" style="width:100%">
        <div class="row">
          <button class="btn primary" onclick="saveStudentEdit('${id}')">Kaydet</button>
          <button class="btn" onclick="closeModal()">İptal</button>
        </div>
      </div>
    </div>`;
}
function saveStudentEdit(id) {
  const st = S.students.find(s => s.id === id);
  if (!st) return;
  const ad = document.getElementById("es-ad").value.trim();
  if (!ad) { alert("Ad soyad girin."); return; }
  st.sinif = document.getElementById("es-sinif").value.trim();
  st.okulNo = document.getElementById("es-okulno").value.trim();
  st.ad = ad;
  st.dal = document.getElementById("es-dal").value.trim();
  save(); closeModal(); renderMain();
}
function setStudentIsletme(id, isletme) {
  const st = S.students.find(s => s.id === id);
  if (st) st.isletme = isletme;
  save(); renderMain();
}
function bulkImportStudents() {
  const raw = document.getElementById("bulk-student-paste").value;
  const lines = raw.split("\n").map(l => l.replace(/\r$/, "")).filter(l => l.trim());
  let added = 0;
  lines.forEach(line => {
    const cols = line.split("\t");
    if (cols.length < 3) return;
    const [sinif, okulNo, ad, dal, isletme] = cols;
    if (!ad || !ad.trim()) return;
    S.students.push({ id: uid("st"), sinif: (sinif || "").trim(), okulNo: (okulNo || "").trim(), ad: ad.trim(), dal: (dal || "").trim(), isletme: (isletme || "").trim() });
    added++;
  });
  save();
  document.getElementById("bulk-student-paste").value = "";
  renderMain();
  alert(`${added} öğrenci eklendi.`);
}

function viewPlaceholderModule(title, hint) {
  return `
  <div class="card" style="text-align:center;padding:50px 20px;">
    <h2>${title}</h2>
    <p class="small">Bu bölüm şimdilik boş — ${hint}</p>
    <p class="small">Kullandığınız gerçek belge/şablonu (Word, PDF, Excel — boş şablon olsa yeter) gönderin, birebir buna göre dolduralım.</p>
  </div>`;
}

/* ---- Belge Araç Çubuğu (Yazdır / PDF) — tüm belge görünümlerinde ortak ---- */
function printCurrentView() { window.print(); }
function guvenliDosyaAdi(dosyaAdi) { return dosyaAdi.replace(/[\\/:*?"<>|]/g, "-"); }
async function exportCurrentViewAsPdf(dosyaAdi) {
  if (!window.desktop || !window.desktop.isElectron) { window.print(); return; }
  const path = await window.desktop.exportPdf(guvenliDosyaAdi(dosyaAdi) + ".pdf");
  if (path) alert("PDF olarak kaydedildi:\n" + path);
}
function cellPrintText(cell) {
  const printOnly = cell.querySelector(".print-only, .print-only-inline, .print-only-cell");
  if (printOnly) return printOnly.innerText.trim();
  const input = cell.querySelector("input, textarea, select");
  if (input) return input.value;
  return cell.innerText.trim();
}
function extractPrintTables() {
  const area = document.querySelector(".print-area");
  if (!area) return [];
  return Array.from(area.querySelectorAll("table")).map(table =>
    Array.from(table.rows).map(row =>
      Array.from(row.cells).filter(cell => !cell.classList.contains("no-print")).map(cellPrintText)
    )
  );
}
async function exportCurrentViewAsExcel(dosyaAdi) {
  if (!window.desktop || !window.desktop.isElectron) { alert("Excel olarak indirme sadece masaüstü uygulamasında çalışır."); return; }
  const tables = extractPrintTables().filter(rows => rows.length > 0);
  if (tables.length === 0) { alert("Bu sayfada indirilecek bir tablo bulunamadı."); return; }
  const sheets = tables.map((rows, i) => ({ name: tables.length > 1 ? "Tablo " + (i + 1) : "Sayfa1", rows }));
  const path = await window.desktop.exportExcel(guvenliDosyaAdi(dosyaAdi) + ".xlsx", sheets);
  if (path) alert("Excel olarak kaydedildi:\n" + path);
}
function belgeAracCubugu(dosyaAdi) {
  return `<div class="row no-print" style="margin-top:10px;">
    <button class="btn primary" onclick="printCurrentView()">Yazdır</button>
    <button class="btn" onclick="exportCurrentViewAsPdf('${dosyaAdi}')">PDF Olarak Kaydet</button>
    <button class="btn" onclick="exportCurrentViewAsExcel('${dosyaAdi}')">Excel Olarak İndir</button>
  </div>`;
}
function belgeYazdirmaBasligi(altBaslik) {
  const tarih = new Date().toLocaleDateString("tr-TR");
  return `<div class="print-doc-header print-only">
    <div>
      <div class="okul">Soma Mesleki ve Teknik Anadolu Lisesi</div>
      <div class="alan">Makine Teknolojisi Alanı${altBaslik ? " · " + altBaslik : ""}</div>
    </div>
    <div class="tarih">Yazdırma Tarihi<br>${tarih}</div>
  </div>`;
}

/* ---- Yıllık Plan / Günlük Plan (Eski Sistem / Maarif Model) ---- */
function escHtml(s) { return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function nlToBr(s) { return escHtml(s).replace(/\n/g, "<br>"); }
function sinifGrade(sinif) { const m = /(\d{1,2})/.exec(sinif || ""); return m ? Number(m[1]) : null; }

function setPlanSistem(id) { activePlanSistem = id; renderMain(); }
function removeEskiSistem() {
  if (!confirm("Eski Sistem sekmesi Yıllık Plan ve Günlük Plan'dan kalıcı olarak kaldırılacak, sadece Maarif Model kalacak. Devam etmeden önce Dosya menüsünden yedek almanızı öneririz. Devam edilsin mi?")) return;
  S.eskiSistemKaldirildi = true;
  activePlanSistem = "maarif";
  save();
  renderMain();
}
function selectPlanEntry(kind, id) { activePlanEntryId[kind] = id; renderMain(); }
function updateYillikHafta(id, idx, field, value) {
  const p = S.yillikPlanlar.find(x => x.id === id);
  if (p && p.haftalar[idx]) p.haftalar[idx][field] = value;
}
function updateGunlukKayit(id, idx, field, value) {
  const p = S.gunlukPlanlar.find(x => x.id === id);
  if (p && p.kayitlar[idx]) p.kayitlar[idx][field] = value;
}
function deletePlanEntry(kind, id) {
  if (!confirm("Bu plan silinsin mi? Bu işlem geri alınamaz.")) return;
  if (kind === "yillik") S.yillikPlanlar = S.yillikPlanlar.filter(x => x.id !== id);
  else S.gunlukPlanlar = S.gunlukPlanlar.filter(x => x.id !== id);
  if (activePlanEntryId[kind] === id) activePlanEntryId[kind] = null;
  save();
  renderMain();
}
function addYillikHafta(id) {
  const p = S.yillikPlanlar.find(x => x.id === id);
  if (!p) return;
  p.haftalar.push({ tarih: "", kazanimlar: "", konular: "" });
  save(); renderMain();
}
function removeYillikHafta(id, idx) {
  if (!confirm("Bu hafta satırı silinsin mi?")) return;
  const p = S.yillikPlanlar.find(x => x.id === id);
  if (!p) return;
  p.haftalar.splice(idx, 1);
  save(); renderMain();
}
function addGunlukKayit(id) {
  const p = S.gunlukPlanlar.find(x => x.id === id);
  if (!p) return;
  p.kayitlar.push({ tarih: "", konu: "", kazanim: "", giris: "", gelisme: "", sonuc: "", yontem: "", arac: "", olcme: "" });
  save(); renderMain();
}
function removeGunlukKayit(id, idx) {
  if (!confirm("Bu ders kaydı silinsin mi?")) return;
  const p = S.gunlukPlanlar.find(x => x.id === id);
  if (!p) return;
  p.kayitlar.splice(idx, 1);
  save(); renderMain();
}
function addPlanEntry(kind) {
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:400px;">
        <h3>Yeni ${kind === 'yillik' ? 'Yıllık' : 'Günlük'} Plan Ekle</h3>
        <label class="small">Ders Adı</label><input type="text" id="ap-ders" style="width:100%">
        <label class="small">Sınıf (örn. 9-A, AMP 10-A)</label><input type="text" id="ap-sinif" style="width:100%">
        <label class="small">Alan/Dal</label><input type="text" id="ap-alandal" value="Makine ve Tasarım Teknolojisi Alanı" style="width:100%">
        <label class="small">Ders Saati</label><input type="text" id="ap-dershaat" style="width:100%">
        ${kind === 'gunluk' ? `<label class="small">Öğretmen</label><input type="text" id="ap-ogretmen" style="width:100%">
        <label class="small">Ders Günü</label><input type="text" id="ap-dersgunu" style="width:100%">` : ''}
        <div class="row">
          <button class="btn primary" onclick="saveNewPlanEntry('${kind}')">Ekle</button>
          <button class="btn" onclick="closeModal()">İptal</button>
        </div>
      </div>
    </div>`;
}
function saveNewPlanEntry(kind) {
  const ders = document.getElementById("ap-ders").value.trim();
  const sinif = document.getElementById("ap-sinif").value.trim();
  if (!ders || !sinif) { alert("Ders adı ve sınıf girin."); return; }
  const alanDal = document.getElementById("ap-alandal").value.trim();
  const dersSaati = document.getElementById("ap-dershaat").value.trim();
  const sistem = sinifGrade(sinif) === 9 ? "maarif" : "eski";
  if (kind === "yillik") {
    const haftalar = (S.akademikTakvim ? S.akademikTakvim.haftalar : [])
      .filter(h => !h.tatilMi)
      .map(h => ({ tarih: h.tarihAraligi, kazanimlar: "", konular: "" }));
    const p = { id: uid("yp"), ders, sinif, alanDal, dersSaati, sistem, haftalar };
    S.yillikPlanlar.push(p);
    activePlanEntryId.yillik = p.id;
  } else {
    const ogretmen = document.getElementById("ap-ogretmen").value.trim();
    const dersGunu = document.getElementById("ap-dersgunu").value.trim();
    const p = { id: uid("gp"), ders, sinif, ogretmen, alanDal, dersSaati, dersGunu, sistem, kayitlar: [] };
    S.gunlukPlanlar.push(p);
    activePlanEntryId.gunluk = p.id;
  }
  activePlanSistem = sistem;
  save(); closeModal(); renderMain();
}
function editPlanEntryMeta(kind, id) {
  const p = (kind === "yillik" ? S.yillikPlanlar : S.gunlukPlanlar).find(x => x.id === id);
  if (!p) return;
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:400px;">
        <h3>Plan Bilgilerini Düzenle</h3>
        <label class="small">Ders Adı</label><input type="text" id="ap-ders" value="${escHtml(p.ders)}" style="width:100%">
        <label class="small">Sınıf</label><input type="text" id="ap-sinif" value="${escHtml(p.sinif)}" style="width:100%">
        <label class="small">Alan/Dal</label><input type="text" id="ap-alandal" value="${escHtml(p.alanDal || '')}" style="width:100%">
        <label class="small">Ders Saati</label><input type="text" id="ap-dershaat" value="${escHtml(p.dersSaati || '')}" style="width:100%">
        ${kind === 'gunluk' ? `<label class="small">Öğretmen</label><input type="text" id="ap-ogretmen" value="${escHtml(p.ogretmen || '')}" style="width:100%">
        <label class="small">Ders Günü</label><input type="text" id="ap-dersgunu" value="${escHtml(p.dersGunu || '')}" style="width:100%">` : ''}
        <div class="row">
          <button class="btn primary" onclick="saveEditedPlanEntry('${kind}','${id}')">Kaydet</button>
          <button class="btn" onclick="closeModal()">İptal</button>
        </div>
      </div>
    </div>`;
}
function saveEditedPlanEntry(kind, id) {
  const p = (kind === "yillik" ? S.yillikPlanlar : S.gunlukPlanlar).find(x => x.id === id);
  if (!p) return;
  const ders = document.getElementById("ap-ders").value.trim();
  const sinif = document.getElementById("ap-sinif").value.trim();
  if (!ders || !sinif) { alert("Ders adı ve sınıf girin."); return; }
  p.ders = ders;
  p.sinif = sinif;
  p.alanDal = document.getElementById("ap-alandal").value.trim();
  p.dersSaati = document.getElementById("ap-dershaat").value.trim();
  p.sistem = sinifGrade(sinif) === 9 ? "maarif" : "eski";
  if (kind === "gunluk") {
    p.ogretmen = document.getElementById("ap-ogretmen").value.trim();
    p.dersGunu = document.getElementById("ap-dersgunu").value.trim();
  }
  activePlanSistem = p.sistem;
  save(); closeModal(); renderMain();
}
function mergePlanImportResult(result) {
  if (result.takvim) S.akademikTakvim = result.takvim;
  let yillik = 0, gunluk = 0;
  (result.yillikPlanlar || []).forEach(p => {
    const existing = S.yillikPlanlar.find(x => x.ders.toLowerCase() === p.ders.toLowerCase() && x.sinif.toLowerCase() === p.sinif.toLowerCase());
    if (existing) Object.assign(existing, p);
    else S.yillikPlanlar.push(Object.assign({ id: uid("yp") }, p));
    yillik++;
  });
  (result.gunlukPlanlar || []).forEach(p => {
    const existing = S.gunlukPlanlar.find(x => x.ders.toLowerCase() === p.ders.toLowerCase() && x.sinif.toLowerCase() === p.sinif.toLowerCase());
    if (existing) Object.assign(existing, p);
    else S.gunlukPlanlar.push(Object.assign({ id: uid("gp") }, p));
    gunluk++;
  });
  return { yillik, gunluk };
}
function importPlanFromExcel() {
  if (!window.desktop || !window.desktop.isElectron) { alert("Excel'den içe aktarma sadece masaüstü uygulamasında çalışır."); return; }
  window.desktop.openXlsxDialog().then(filePath => {
    if (!filePath) return;
    window.desktop.importPlanXlsx(filePath).then(result => {
      const eklenen = mergePlanImportResult(result);
      if (eklenen.yillik === 0 && eklenen.gunluk === 0 && !result.takvim) {
        alert("Bu dosyada tanıdığım bir Yıllık Plan / Günlük Plan / Takvim sayfası bulunamadı.");
        return;
      }
      save();
      renderMain();
      const parcalar = [];
      if (eklenen.yillik) parcalar.push(eklenen.yillik + " yıllık plan");
      if (eklenen.gunluk) parcalar.push(eklenen.gunluk + " günlük plan");
      if (result.takvim) parcalar.push("akademik takvim (" + result.takvim.haftalar.length + " hafta)");
      alert("İçe aktarıldı: " + parcalar.join(", ") + ".");
    }).catch(e => alert("İçe aktarma hatası: " + e.message));
  });
}
function renderYillikPlanTable(p) {
  const rows = p.haftalar.map((h, i) => `
    <tr>
      <td style="white-space:nowrap;">
        <input class="no-print" type="text" value="${escHtml(h.tarih)}" style="width:100px;border:none;font-family:inherit;font-size:11.5px;" onchange="updateYillikHafta('${p.id}',${i},'tarih',this.value); renderMain();">
        <span class="print-only-inline">${escHtml(h.tarih)}</span>
      </td>
      <td><textarea class="no-print" rows="3" style="width:100%;border:none;resize:vertical;font-family:inherit;font-size:11.5px;" oninput="updateYillikHafta('${p.id}',${i},'kazanimlar',this.value)" onblur="save()">${escHtml(h.kazanimlar)}</textarea><div class="print-only">${nlToBr(h.kazanimlar)}</div></td>
      <td><textarea class="no-print" rows="3" style="width:100%;border:none;resize:vertical;font-family:inherit;font-size:11.5px;" oninput="updateYillikHafta('${p.id}',${i},'konular',this.value)" onblur="save()">${escHtml(h.konular)}</textarea><div class="print-only">${nlToBr(h.konular)}</div></td>
      <td class="no-print"><button class="btn danger" onclick="removeYillikHafta('${p.id}',${i})">Sil</button></td>
    </tr>`).join("");
  return `
  <div class="card no-print">
    <div class="row small" style="flex-wrap:wrap;gap:14px;align-items:center;">
      <span><b>Ders:</b> ${escHtml(p.ders)}</span>
      <span><b>Sınıf:</b> ${escHtml(p.sinif)}</span>
      <span><b>Ders Saati:</b> ${escHtml(p.dersSaati || "-")}</span>
      <span><b>Alan/Dal:</b> ${escHtml(p.alanDal || "-")}</span>
      <button class="btn" onclick="editPlanEntryMeta('yillik','${p.id}')">Bilgileri Düzenle</button>
    </div>
  </div>
  <div class="print-only" style="margin-bottom:10px;">
    <b>Ders:</b> ${escHtml(p.ders)} · <b>Sınıf:</b> ${escHtml(p.sinif)} · <b>Ders Saati:</b> ${escHtml(p.dersSaati || "-")} · <b>Alan/Dal:</b> ${escHtml(p.alanDal || "-")}
  </div>
  <div class="card" style="overflow-x:auto;">
    <table style="width:100%;"><thead><tr><th style="width:100px;">Tarih</th><th>Kazanımlar</th><th>Konular</th><th class="no-print"></th></tr></thead>
    <tbody>${rows}</tbody></table>
    <div class="row no-print"><button class="btn" onclick="addYillikHafta('${p.id}')">Hafta Ekle</button></div>
  </div>`;
}
function renderGunlukPlanTable(p) {
  const alanlar = [
    ["konu", "Konu"], ["kazanim", "Kazanım"], ["giris", "Giriş"], ["gelisme", "Gelişme"],
    ["sonuc", "Sonuç"], ["yontem", "Yöntem ve Teknikler"], ["arac", "Araç ve Gereçler"], ["olcme", "Ölçme-Değerlendirme"]
  ];
  const kayitlarHtml = p.kayitlar.map((k, i) => `
    <div class="card" style="page-break-inside:avoid;">
      <div class="row small" style="justify-content:space-between;align-items:center;">
        <input class="no-print" type="text" value="${escHtml(k.tarih)}" style="font-weight:600;border:1px solid var(--line);border-radius:4px;padding:3px 6px;" onchange="updateGunlukKayit('${p.id}',${i},'tarih',this.value); renderMain();">
        <b class="print-only-inline">${escHtml(k.tarih)}</b>
        <button class="btn danger no-print" onclick="removeGunlukKayit('${p.id}',${i})">Sil</button>
      </div>
      ${alanlar.map(([field, label]) => `
        <div style="margin-top:6px;">
          <div class="small" style="font-weight:600;">${label}</div>
          <textarea class="no-print" rows="${field === "konu" || field === "kazanim" ? 2 : 3}" style="width:100%;border:1px solid var(--line);border-radius:4px;padding:4px;resize:vertical;font-family:inherit;font-size:11.5px;" oninput="updateGunlukKayit('${p.id}',${i},'${field}',this.value)" onblur="save()">${escHtml(k[field])}</textarea>
          <div class="print-only" style="font-size:10.5px;">${nlToBr(k[field])}</div>
        </div>`).join("")}
    </div>`).join("");
  return `
  <div class="card no-print">
    <div class="row small" style="flex-wrap:wrap;gap:14px;align-items:center;">
      <span><b>Ders:</b> ${escHtml(p.ders)}</span>
      <span><b>Sınıf:</b> ${escHtml(p.sinif)}</span>
      <span><b>Öğretmen:</b> ${escHtml(p.ogretmen || "-")}</span>
      <span><b>Ders Saati:</b> ${escHtml(p.dersSaati || "-")}</span>
      <span><b>Ders Günü:</b> ${escHtml(p.dersGunu || "-")}</span>
      <button class="btn" onclick="editPlanEntryMeta('gunluk','${p.id}')">Bilgileri Düzenle</button>
    </div>
  </div>
  <div class="print-only" style="margin-bottom:10px;">
    <b>Ders:</b> ${escHtml(p.ders)} · <b>Sınıf:</b> ${escHtml(p.sinif)} · <b>Öğretmen:</b> ${escHtml(p.ogretmen || "-")} · <b>Ders Saati:</b> ${escHtml(p.dersSaati || "-")} · <b>Ders Günü:</b> ${escHtml(p.dersGunu || "-")}
  </div>
  ${kayitlarHtml}
  <div class="row no-print"><button class="btn" onclick="addGunlukKayit('${p.id}')">Ders Kaydı Ekle</button></div>`;
}
function viewPlanModule(kind) {
  const title = kind === "yillik" ? "Yıllık Plan" : "Günlük Plan";
  const aciklama = kind === "yillik"
    ? "Her dersin haftalık kazanım/konu dağılımı. Kendi Excel dosyanızı içe aktararak veya elle düzenleyerek doldurabilirsiniz."
    : "Her dersin konu/kazanım/giriş-gelişme-sonuç/yöntem/ölçme-değerlendirme detayları. Kendi Excel dosyanızı içe aktararak veya elle düzenleyerek doldurabilirsiniz.";
  if (S.eskiSistemKaldirildi) activePlanSistem = "maarif";
  const sistemler = S.eskiSistemKaldirildi ? ["maarif"] : ["maarif", "eski"];
  const tabs = sistemler.map(id =>
    `<button class="btn ${activePlanSistem === id ? 'primary' : ''}" onclick="setPlanSistem('${id}')">${CURRICULUM[id].label}</button>`
  ).join(" ");
  const eskiSistemButon = (activePlanSistem === "eski" && !S.eskiSistemKaldirildi)
    ? `<button class="btn danger" style="margin-left:8px;" onclick="removeEskiSistem()">Eski Sistemi Kalıcı Olarak Kaldır</button>`
    : "";

  const allEntries = kind === "yillik" ? S.yillikPlanlar : S.gunlukPlanlar;
  const entries = allEntries.filter(p => p.sistem === activePlanSistem)
    .sort((a, b) => (a.sinif + a.ders).localeCompare(b.sinif + b.ders, "tr"));
  if (entries.length && !entries.some(e => e.id === activePlanEntryId[kind])) activePlanEntryId[kind] = entries[0].id;
  if (!entries.length) activePlanEntryId[kind] = null;
  const activeEntry = entries.find(e => e.id === activePlanEntryId[kind]) || null;

  const listHtml = entries.length === 0 ? "" : `
    <div class="card no-print">
      <div class="row" style="flex-wrap:wrap;">
        ${entries.map(e => `<button class="btn ${e.id === activePlanEntryId[kind] ? 'primary' : ''}" onclick="selectPlanEntry('${kind}','${e.id}')">${escHtml(e.sinif)} — ${escHtml(e.ders)}</button>`).join("")}
      </div>
    </div>`;

  let contentHtml;
  if (activeEntry) {
    contentHtml = kind === "yillik" ? renderYillikPlanTable(activeEntry) : renderGunlukPlanTable(activeEntry);
  } else {
    const data = CURRICULUM[activePlanSistem];
    const grades = Object.keys(data.grades).sort((a, b) => a - b);
    const gradeCards = grades.map(g => {
      const gr = data.grades[g];
      const dersHtml = gr.dersler.length === 0
        ? `<p class="small">${gr.not || "Bu sınıf seviyesi için okulda ayrı ders/öğrenme birimi bulunmuyor."}</p>`
        : gr.dersler.map(d => `
          <div style="margin-bottom:10px;">
            <div class="row" style="justify-content:space-between;">
              <b>${d.ad}</b><span class="pill info">${d.saat} sa/hafta</span>
            </div>
            ${d.ogrenmeBirimleri.length ? `<p class="small" style="margin-top:4px;">${d.ogrenmeBirimleri.join(" · ")}</p>` : ""}
          </div>`).join("");
      return `<div class="card"><h3>${g}. Sınıf <span class="small">(${gr.dal})</span></h3>${dersHtml}</div>`;
    }).join("");
    const kaynakDosya = kind === "yillik" ? "YILLIK_PLANLAR.xlsx" : "GÜNLÜK_PLANLAR.xlsx";
    contentHtml = gradeCards + `<div class="card small no-print" style="text-align:center;padding:30px 20px;">
      Bu sistem için henüz içe aktarılmış ${title.toLowerCase()} yok — yukarıda öğrenme birimi özetini görüyorsunuz. "Excel'den İçe Aktar" ile kendi ${kaynakDosya} dosyanızı yükleyerek tam, düzenlenebilir planı oluşturabilirsiniz.
    </div>`;
  }

  const dosyaAdi = activeEntry ? (title + " - " + activeEntry.sinif + " - " + activeEntry.ders) : title;

  return `
  <div class="card no-print">
    <h2>${title}</h2>
    <p class="small">${aciklama}</p>
    <p class="small">MEB müfredat reformu kademeli işliyor: 2025-2026'da sadece 9. sınıf Maarif Model'e geçti, 10-12. sınıflar hâlâ eski çerçeve programa tabi. Bütün sınıflar Maarif Model'e geçtiğinde "Eski Sistem" sekmesini kalıcı olarak kaldırabilirsiniz.</p>
    <div class="row" style="margin-top:10px;">${tabs}${eskiSistemButon}</div>
    <div class="row" style="margin-top:8px;">
      <button class="btn primary" onclick="addPlanEntry('${kind}')">Yeni Ders Planı Ekle</button>
      <button class="btn" onclick="importPlanFromExcel()">Excel'den İçe Aktar</button>
      ${activeEntry ? `<button class="btn danger" onclick="deletePlanEntry('${kind}','${activeEntry.id}')">Bu Planı Sil</button>` : ""}
    </div>
    ${belgeAracCubugu(dosyaAdi)}
  </div>
  ${listHtml}
  <div class="print-area">
    ${belgeYazdirmaBasligi(dosyaAdi)}
    ${contentHtml}
  </div>`;
}

/* ---- Norm Kadro ----
   Grup sayısı öğretmenin ders programındaki fiili atama sayısına DEĞİL,
   öğrenci sayısına endeksli resmi norm formülüne göre hesaplanır (kullanıcı
   tarafından kesinleştirildi -- 10, 11 ve 12. sınıf AYNI formülü paylaşır,
   sadece 9. sınıf farklıdır):
   - 9. sınıf: 20 öğrenciye kadar 1 grup, sonra her +10 öğrencide 1 grup artar
     (10-20→1, 21-30→2, 31-40→3, ...).
   - 10, 11 ve 12. sınıf: 16 öğrenciye kadar 1 grup, sonra her +8 öğrencide 1
     grup artar (8-16→1, 17-24→2, 25-32→3, 33-40→4, ...).
   Bu, kullanıcının gerçek 2026-2027 Norm Kadro dosyasındaki 4 veri
   noktasıyla (10-A 27 öğr.→3, 11-A 20 öğr.→2, 12-A 21 öğr.→2, 12-B 14
   öğr.→1) birebir örtüşüyor.
   ------------------------------------------------------------ */
function normKadroGrupSayisi(grade, ogrenciSayisi) {
  if (!ogrenciSayisi || ogrenciSayisi <= 0) return null;
  if (grade === 9) return ogrenciSayisi <= 20 ? 1 : Math.ceil((ogrenciSayisi - 20) / 10) + 1;
  return ogrenciSayisi <= 16 ? 1 : Math.ceil((ogrenciSayisi - 16) / 8) + 1;
}
function setNormKadroOgrenciSayisi(classId, value) {
  const n = parseInt(value);
  if (Number.isFinite(n) && n >= 0) S.normKadro.ogrenciSayilari[classId] = n;
  else delete S.normKadro.ogrenciSayilari[classId];
  save(); renderMain();
}
function addKoordSatir() {
  S.normKadro.koordinatorlukSatirlari.push({ id: uid("nk"), dal: "", sinif: "", ogrenciSayisi: "", haftalikSaat: 24 });
  save(); renderMain();
}
function updateKoordSatir(id, field, value) {
  const row = S.normKadro.koordinatorlukSatirlari.find(r => r.id === id);
  if (!row) return;
  row[field] = (field === "dal" || field === "sinif") ? value : (parseInt(value) || 0);
  save(); renderMain();
}
function deleteKoordSatir(id) {
  if (!confirm("Bu koordinatörlük satırı silinsin mi?")) return;
  S.normKadro.koordinatorlukSatirlari = S.normKadro.koordinatorlukSatirlari.filter(r => r.id !== id);
  save(); renderMain();
}
function viewNormKadro() {
  const relevantClasses = S.classes.filter(c => c.id !== "cl-idari" && c.assignments.length > 0 && !c.id.startsWith("isletme-"));
  let siraNo = 0;
  let ampToplam = 0;

  const sinifBlocks = relevantClasses.map(cls => {
    const ogrenciSayisi = S.normKadro.ogrenciSayilari[cls.id];
    const grup = normKadroGrupSayisi(cls.grade, ogrenciSayisi);
    const rows = cls.assignments.map(a => {
      const course = courseById(a.courseId);
      if (!course) return "";
      siraNo++;
      const toplam = grup === null ? null : course.hours * grup;
      if (toplam !== null) ampToplam += toplam;
      return `<tr>
        <td>${siraNo}</td><td>${escHtml(cls.name)}</td><td>${escHtml(course.name)}</td>
        <td>${course.hours}</td><td>${grup === null ? '<span class="pill warn">öğrenci sayısı girin</span>' : grup}</td>
        <td><b>${toplam === null ? '—' : toplam}</b></td>
      </tr>`;
    }).join("");
    return `
    <div style="margin-bottom:14px;">
      <div class="row no-print" style="align-items:center;margin-top:0;">
        <h3 style="margin:0;">${escHtml(cls.name)} Sınıfı</h3>
        <label class="small" style="margin-left:10px;">Öğrenci Sayısı:</label>
        <input type="number" min="0" value="${ogrenciSayisi !== undefined ? ogrenciSayisi : ''}" style="width:70px" onchange="setNormKadroOgrenciSayisi('${cls.id}',this.value)">
        <span class="small">(Grup Sayısı: ${grup === null ? '—' : grup}, norm formülüne göre otomatik)</span>
      </div>
      <p class="print-only" style="font-weight:700;margin:10px 0 4px;">${escHtml(cls.name)} Sınıfı — Öğrenci Sayısı: ${ogrenciSayisi !== undefined ? ogrenciSayisi : '—'}</p>
      <table><thead><tr><th>No</th><th>Sınıf</th><th>Ders Adı</th><th>Haftalık Saat</th><th>Grup Sayısı</th><th>Toplam Ders Saati</th></tr></thead>
      <tbody>${rows}</tbody></table>
    </div>`;
  }).join("") || `<p class="small">Ders Programı → Sınıflar ve Ders Atama'dan sınıflara ders atadıkça burada otomatik listelenecek.</p>`;

  let koordToplam = 0;
  const koordRows = S.normKadro.koordinatorlukSatirlari.map(r => {
    const grup = normKadroGrupSayisi(sinifGrade(r.sinif) || 12, r.ogrenciSayisi);
    const toplam = grup === null ? null : (r.haftalikSaat || 0) * grup;
    if (toplam !== null) koordToplam += toplam;
    return `<tr>
      <td class="no-print"><input type="text" value="${escHtml(r.sinif)}" placeholder="örn. 12-A" style="width:70px" onchange="updateKoordSatir('${r.id}','sinif',this.value)"></td>
      <td class="print-only-cell">${escHtml(r.sinif)}</td>
      <td class="no-print"><input type="number" min="0" value="${r.ogrenciSayisi}" style="width:60px" onchange="updateKoordSatir('${r.id}','ogrenciSayisi',this.value)"></td>
      <td class="print-only-cell">${r.ogrenciSayisi}</td>
      <td class="no-print"><input type="text" value="${escHtml(r.dal)}" placeholder="örn. Koordinatörlük – Makine Bakım Onarım Dalı" style="width:100%" onchange="updateKoordSatir('${r.id}','dal',this.value)"></td>
      <td class="print-only-cell">${escHtml(r.dal)}</td>
      <td class="no-print"><input type="number" min="0" value="${r.haftalikSaat}" style="width:60px" onchange="updateKoordSatir('${r.id}','haftalikSaat',this.value)"></td>
      <td class="print-only-cell">${r.haftalikSaat}</td>
      <td>${grup === null ? '<span class="pill warn">öğr. sayısı girin</span>' : grup} <span class="small">(otomatik)</span></td>
      <td><b>${toplam === null ? '—' : toplam}</b></td>
      <td class="no-print"><button class="btn danger" onclick="deleteKoordSatir('${r.id}')">Sil</button></td>
    </tr>`;
  }).join("");

  const idari = classById("cl-idari");
  let seflikToplam = 0;
  const seflikRows = (idari ? idari.assignments : []).map(a => {
    const course = courseById(a.courseId);
    if (!course) return "";
    const teacherNames = (a.eligibleTeacherIds || []).map(id => { const t = S.teachers.find(x => x.id === id); return t ? t.name : ""; }).filter(Boolean).join(", ");
    const grup = a.teacherCount || 1;
    const toplam = course.hours * grup;
    seflikToplam += toplam;
    return `<tr><td>${escHtml(course.name)}</td><td>${escHtml(teacherNames || "—")}</td><td>${course.hours}</td><td><b>${toplam}</b></td></tr>`;
  }).join("");

  const genelToplam = ampToplam + koordToplam + seflikToplam;
  const alanSefi = S.teachers.find(t => (idari ? idari.assignments : []).some(a => a.courseId === "pbo-10" && (a.eligibleTeacherIds || []).includes(t.id)));

  return `
  <div class="card no-print">
    <h2>Norm Kadro Hesabı</h2>
    <p class="small">Ders Programı'ndaki güncel ders atamalarınızdan otomatik hesaplanır — sınıflara ders/öğretmen ekledikçe/çıkardıkça burası da güncellenir. Öğrenci sayılarını ve koordinatörlük satırlarını elle girin.</p>
    ${belgeAracCubugu("Norm Kadro " + (S.akademikTakvim ? S.akademikTakvim.ogretimYili : ""))}
  </div>
  <div class="print-area">
    ${belgeYazdirmaBasligi("Norm Kadro Hesabı" + (S.akademikTakvim ? " · " + S.akademikTakvim.ogretimYili : ""))}
    <div class="card">
      <h2 class="print-only">AMP Mesleki Alan Dersleri</h2>
      ${sinifBlocks}
      <p class="small" style="text-align:right;"><b>AMP Mesleki Alan Dersleri Toplamı: ${ampToplam} saat</b></p>
    </div>
    <div class="card">
      <h2>Koordinatörlük Dersleri</h2>
      <p class="small no-print">12. sınıfların işletmede mesleki eğitim (staj) koordinatörlüğü buraya elle eklenir — dal adı, sınıf, öğrenci sayısı, haftalık saat (genelde 24), grup sayısı.</p>
      <table><thead><tr><th>Sınıf</th><th>Öğrenci Sayısı</th><th>Dal</th><th>Haftalık Saat</th><th>Grup Sayısı</th><th>Toplam</th><th class="no-print"></th></tr></thead>
      <tbody>${koordRows || `<tr><td colspan="7" class="small">Henüz satır eklenmedi.</td></tr>`}</tbody></table>
      <div class="row no-print"><button class="btn" onclick="addKoordSatir()">Satır Ekle</button></div>
      <p class="small" style="text-align:right;"><b>Koordinatörlük Toplamı: ${koordToplam} saat</b></p>
    </div>
    <div class="card">
      <h2>Şeflik Ders Yükleri</h2>
      <table><thead><tr><th>Görev</th><th>Öğretmen</th><th>Haftalık Saat</th><th>Toplam</th></tr></thead>
      <tbody>${seflikRows || `<tr><td colspan="4" class="small">Ders Programı → Sınıflar ve Ders Atama → İdari Görevler'den ekleyin.</td></tr>`}</tbody></table>
      <p class="small" style="text-align:right;"><b>Şeflik Ders Yükleri Toplamı: ${seflikToplam} saat</b></p>
    </div>
    <div class="card" style="text-align:center;">
      <h2 style="margin:0;">GENEL TOPLAM DERS YÜKÜ: ${genelToplam} SAAT</h2>
      <p class="small print-only" style="margin-top:16px;">Makine ve Tasarım Teknolojisi Alan Şefi<br><b>${alanSefi ? escHtml(alanSefi.name) : ''}</b></p>
    </div>
  </div>`;
}

/* ---- Okul Zümresi (Şube Öğretmenler Kurulu + Zümre Toplantısı) ---- */
let activeToplantiId = null;
const SUBE_GUNDEM_STANDART = [
  "Öğrencilerin başarı durumlarının incelenmesi ve başarıyı artırıcı önlemlerin alınması",
  "Derslerin öğretim programlarıyla uyumlu olarak yürütülmesi",
  "Öğrencilerin sınıf geçme ve sınıf tekrarı durumları",
  "Özel eğitim ihtiyacı olan kaynaştırma/bütünleştirme yoluyla eğitimlerine devam eden öğrencilerin başarısının artırılması ve eğitim hizmetlerinden daha etkin yararlanmalarının sağlanması amacıyla alınacak tedbirler, yapılması gereken iş, işlem ve planlamalar",
  "Eğitim kaynaklarıyla atölye, laboratuvar ve diğer birimlerden güvenli bir şekilde yararlanma ve planlama",
  "Okul çevre iş birliği",
  "Üretim etkinliklerinin eğitim ve öğretimi destekleyecek şekilde planlanması",
  "Eğitim kurumu, ilçe, il, yurtiçi ve yurtdışında düzenlenecek bilimsel, sosyal, kültürel, sanatsal ve sportif etkinlikler ve yarışmalar ile geziler, öğrenci kulüp ve sosyal sorumluluk programı kapsamındaki çalışmaları",
  "Öğrencilerde girişimcilik bilincinin kazandırılmasına yönelik çalışmalar",
  "Öğrencilerin kişilik ve sosyal gelişimlerinin desteklenmesi, sağlıklarının korunması ve dengeli beslenmelerinin sağlanması",
  "Okul sağlığı çalışmalarına yer verilmesi",
  "Değerler eğitimi çalışmalarına yer verilmesi",
  "İş sağlığı ve güvenliği tedbirleri doğrultusunda eğitim ve öğretim faaliyetlerinin planlanması",
  "Temenniler ve kapanış"
];
const ZUMRE_GUNDEM_STANDART = [
  "Açılış ve yoklama",
  "Alan Şefi, Atölye/Laboratuvar Şefleri ve Öğretmenlerin görev dağılımının belirlenmesi",
  "Öğrenci devamsızlık ve başarı takibi",
  "Atölyelerdeki makine bakım-onarım formlarının tutulması ve arızalı tezgâhların bildirilmesi",
  "Makine kullanma talimatlarının kontrolü ve güncellenmesi",
  "Seçmeli derslerin belirlenmesi",
  "Sınıf öğretmenliği (rehberlik) görevlendirmesi",
  "Atölye İSG kuralları ve uyulmaması hâlinde uygulanacak yaptırımların belirlenmesi",
  "Makine ve Tasarım Teknolojisi Alanı derslerinde sınav değerlendirmesi ve rotasyon uygulaması",
  "Atölye düzeni ve kullanılan ekipmanın öğrenci tarafından temizlenmesi",
  "Girişimcilik ve döner sermaye üretim çalışmalarının değerlendirilmesi",
  "Alan tanıtımı (ortaokul öğrencilerine yönelik) çalışmalarının planlanması",
  "Başarılı ve özendirici öğrenci çalışmalarının değerlendirilmesi",
  "Dilek, temenniler ve kapanış"
];
function toplantiById(id) { return S.toplantilar.find(x => x.id === id); }
function addToplanti() {
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:420px;">
        <h3>Yeni Toplantı Ekle</h3>
        <label class="small">Toplantı Türü</label>
        <select id="at-tur" style="width:100%">
          <option value="sube">Şube Öğretmenler Kurulu</option>
          <option value="zumre">Zümre Toplantısı</option>
        </select>
        <label class="small">Başlık</label><input type="text" id="at-baslik" placeholder="örn. 10-A Sınıfı 1. Dönem Şube Öğretmenler Kurulu" style="width:100%">
        <label class="small">Sınıf / Ders (opsiyonel)</label><input type="text" id="at-sinifders" style="width:100%">
        <label class="small">Öğretim Yılı</label><input type="text" id="at-yil" value="${S.akademikTakvim ? S.akademikTakvim.ogretimYili : ''}" style="width:100%">
        <label class="small">Dönem</label><input type="text" id="at-donem" placeholder="örn. 1. Dönem" style="width:100%">
        <label class="small">Kurul/Zümre Başkanı</label><input type="text" id="at-baskan" style="width:100%">
        <div class="row">
          <button class="btn primary" onclick="saveNewToplanti()">Ekle</button>
          <button class="btn" onclick="closeModal()">İptal</button>
        </div>
      </div>
    </div>`;
}
function saveNewToplanti() {
  const baslik = document.getElementById("at-baslik").value.trim();
  if (!baslik) { alert("Başlık girin."); return; }
  const tur = document.getElementById("at-tur").value;
  const standart = tur === "sube" ? SUBE_GUNDEM_STANDART : ZUMRE_GUNDEM_STANDART;
  const top = {
    id: uid("top"), tur, baslik,
    sinifVeyaDers: document.getElementById("at-sinifders").value.trim(),
    ogretimYili: document.getElementById("at-yil").value.trim(),
    donem: document.getElementById("at-donem").value.trim(),
    baskan: document.getElementById("at-baskan").value.trim(),
    zumreNo: "", tarih: "", yer: "", saat: "",
    katilimcilar: [], gorevDagilimi: [],
    gundemMaddeleri: standart.map(baslik => ({ id: uid("gm"), baslik, notlar: "" }))
  };
  S.toplantilar.push(top);
  activeToplantiId = top.id;
  save(); closeModal(); renderMain();
}
function editToplantiMeta(id) {
  const top = toplantiById(id);
  if (!top) return;
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:420px;">
        <h3>Toplantı Bilgilerini Düzenle</h3>
        <label class="small">Başlık</label><input type="text" id="at-baslik" value="${escHtml(top.baslik)}" style="width:100%">
        <label class="small">Sınıf / Ders</label><input type="text" id="at-sinifders" value="${escHtml(top.sinifVeyaDers || '')}" style="width:100%">
        <label class="small">Öğretim Yılı</label><input type="text" id="at-yil" value="${escHtml(top.ogretimYili || '')}" style="width:100%">
        <label class="small">Dönem</label><input type="text" id="at-donem" value="${escHtml(top.donem || '')}" style="width:100%">
        <label class="small">Kurul/Zümre Başkanı</label><input type="text" id="at-baskan" value="${escHtml(top.baskan || '')}" style="width:100%">
        <label class="small">Zümre No</label><input type="text" id="at-zumreno" value="${escHtml(top.zumreNo || '')}" style="width:100%">
        <label class="small">Toplantı Tarihi</label><input type="text" id="at-tarih" value="${escHtml(top.tarih || '')}" style="width:100%">
        <label class="small">Toplantı Yeri</label><input type="text" id="at-yer" value="${escHtml(top.yer || '')}" style="width:100%">
        <label class="small">Toplantı Saati</label><input type="text" id="at-saat" value="${escHtml(top.saat || '')}" style="width:100%">
        <div class="row">
          <button class="btn primary" onclick="saveToplantiMeta('${id}')">Kaydet</button>
          <button class="btn" onclick="closeModal()">İptal</button>
        </div>
      </div>
    </div>`;
}
function saveToplantiMeta(id) {
  const top = toplantiById(id);
  if (!top) return;
  const baslik = document.getElementById("at-baslik").value.trim();
  if (!baslik) { alert("Başlık girin."); return; }
  top.baslik = baslik;
  top.sinifVeyaDers = document.getElementById("at-sinifders").value.trim();
  top.ogretimYili = document.getElementById("at-yil").value.trim();
  top.donem = document.getElementById("at-donem").value.trim();
  top.baskan = document.getElementById("at-baskan").value.trim();
  top.zumreNo = document.getElementById("at-zumreno").value.trim();
  top.tarih = document.getElementById("at-tarih").value.trim();
  top.yer = document.getElementById("at-yer").value.trim();
  top.saat = document.getElementById("at-saat").value.trim();
  save(); closeModal(); renderMain();
}
function deleteToplanti(id) {
  if (!confirm("Bu toplantı tutanağı silinsin mi? Bu işlem geri alınamaz.")) return;
  S.toplantilar = S.toplantilar.filter(x => x.id !== id);
  if (activeToplantiId === id) activeToplantiId = null;
  save(); renderMain();
}
function addKatilimci(topId) {
  const top = toplantiById(topId);
  if (!top) return;
  top.katilimcilar.push({ id: uid("kt"), ad: "", brans: "" });
  save(); renderMain();
}
function updateKatilimci(topId, id, field, value) {
  const top = toplantiById(topId);
  const k = top && top.katilimcilar.find(x => x.id === id);
  if (k) k[field] = value;
  save();
}
function removeKatilimci(topId, id) {
  if (!confirm("Bu katılımcı silinsin mi?")) return;
  const top = toplantiById(topId);
  if (!top) return;
  top.katilimcilar = top.katilimcilar.filter(x => x.id !== id);
  save(); renderMain();
}
function addGorevSatiri(topId) {
  const top = toplantiById(topId);
  if (!top) return;
  top.gorevDagilimi.push({ id: uid("gd"), kisi: "", gorev: "", sorumluluk: "" });
  save(); renderMain();
}
function updateGorevSatiri(topId, id, field, value) {
  const top = toplantiById(topId);
  const g = top && top.gorevDagilimi.find(x => x.id === id);
  if (g) g[field] = value;
  save();
}
function removeGorevSatiri(topId, id) {
  if (!confirm("Bu görev satırı silinsin mi?")) return;
  const top = toplantiById(topId);
  if (!top) return;
  top.gorevDagilimi = top.gorevDagilimi.filter(x => x.id !== id);
  save(); renderMain();
}
function addGundemMaddesi(topId) {
  const top = toplantiById(topId);
  if (!top) return;
  top.gundemMaddeleri.push({ id: uid("gm"), baslik: "", notlar: "" });
  save(); renderMain();
}
function updateGundemMaddesi(topId, id, field, value) {
  const top = toplantiById(topId);
  const g = top && top.gundemMaddeleri.find(x => x.id === id);
  if (g) g[field] = value;
  save();
}
function removeGundemMaddesi(topId, id) {
  if (!confirm("Bu gündem maddesi silinsin mi?")) return;
  const top = toplantiById(topId);
  if (!top) return;
  top.gundemMaddeleri = top.gundemMaddeleri.filter(x => x.id !== id);
  save(); renderMain();
}
function selectToplanti(id) { activeToplantiId = id; renderMain(); }
function renderToplantiDetay(top) {
  const katilimciRows = top.katilimcilar.map(k => `
    <tr>
      <td class="no-print"><input type="text" value="${escHtml(k.ad)}" placeholder="Ad Soyad" style="width:100%" onchange="updateKatilimci('${top.id}','${k.id}','ad',this.value)"></td>
      <td class="print-only-cell">${escHtml(k.ad)}</td>
      <td class="no-print"><input type="text" value="${escHtml(k.brans)}" placeholder="Branş/Görev" style="width:100%" onchange="updateKatilimci('${top.id}','${k.id}','brans',this.value)"></td>
      <td class="print-only-cell">${escHtml(k.brans)}</td>
      <td class="print-only" style="width:80px;"></td>
      <td class="no-print"><button class="btn danger" onclick="removeKatilimci('${top.id}','${k.id}')">Sil</button></td>
    </tr>`).join("");
  const gorevRows = top.gorevDagilimi.map(g => `
    <tr>
      <td class="no-print"><input type="text" value="${escHtml(g.kisi)}" style="width:100%" onchange="updateGorevSatiri('${top.id}','${g.id}','kisi',this.value)"></td>
      <td class="print-only-cell">${escHtml(g.kisi)}</td>
      <td class="no-print"><input type="text" value="${escHtml(g.gorev)}" style="width:100%" onchange="updateGorevSatiri('${top.id}','${g.id}','gorev',this.value)"></td>
      <td class="print-only-cell">${escHtml(g.gorev)}</td>
      <td class="no-print"><textarea rows="2" style="width:100%;" onchange="updateGorevSatiri('${top.id}','${g.id}','sorumluluk',this.value)">${escHtml(g.sorumluluk)}</textarea></td>
      <td class="print-only-cell">${escHtml(g.sorumluluk)}</td>
      <td class="no-print"><button class="btn danger" onclick="removeGorevSatiri('${top.id}','${g.id}')">Sil</button></td>
    </tr>`).join("");
  const gundemHtml = top.gundemMaddeleri.map((g, i) => `
    <div class="card" style="page-break-inside:avoid;">
      <div class="row" style="justify-content:space-between;align-items:center;margin-top:0;">
        <input class="no-print" type="text" value="${escHtml(g.baslik)}" style="font-weight:700;flex:1;border:1px solid var(--line);border-radius:4px;padding:4px 6px;" onchange="updateGundemMaddesi('${top.id}','${g.id}','baslik',this.value)">
        <b class="print-only-inline">MADDE ${i + 1}: ${escHtml(g.baslik)}</b>
        <button class="btn danger no-print" onclick="removeGundemMaddesi('${top.id}','${g.id}')">Sil</button>
      </div>
      <div class="small no-print" style="margin-top:4px;font-weight:600;">Görüşmeler / Alınan Kararlar</div>
      <textarea class="no-print" rows="4" style="width:100%;margin-top:4px;border:1px solid var(--line);border-radius:4px;padding:6px;resize:vertical;font-family:inherit;font-size:11.5px;" oninput="updateGundemMaddesi('${top.id}','${g.id}','notlar',this.value)" onblur="save()">${escHtml(g.notlar)}</textarea>
      <div class="print-only" style="margin-top:4px;">${nlToBr(g.notlar) || '<span class="small">—</span>'}</div>
    </div>`).join("");

  return `
  <div class="card no-print">
    <div class="row small" style="flex-wrap:wrap;gap:14px;align-items:center;">
      <span><b>Tür:</b> ${top.tur === 'sube' ? 'Şube Öğretmenler Kurulu' : 'Zümre Toplantısı'}</span>
      <span><b>Sınıf/Ders:</b> ${escHtml(top.sinifVeyaDers || '-')}</span>
      <span><b>Öğretim Yılı:</b> ${escHtml(top.ogretimYili || '-')}</span>
      <span><b>Dönem:</b> ${escHtml(top.donem || '-')}</span>
      <span><b>Başkan:</b> ${escHtml(top.baskan || '-')}</span>
      <span><b>Tarih:</b> ${escHtml(top.tarih || '-')}</span>
      <span><b>Yer:</b> ${escHtml(top.yer || '-')}</span>
      <span><b>Saat:</b> ${escHtml(top.saat || '-')}</span>
      <button class="btn" onclick="editToplantiMeta('${top.id}')">Bilgileri Düzenle</button>
    </div>
  </div>
  <div class="print-only" style="margin-bottom:10px;">
    <b>Öğretim Yılı:</b> ${escHtml(top.ogretimYili || '-')} · <b>Dönem:</b> ${escHtml(top.donem || '-')} · <b>Başkan:</b> ${escHtml(top.baskan || '-')} ·
    <b>Zümre No:</b> ${escHtml(top.zumreNo || '-')} · <b>Tarih:</b> ${escHtml(top.tarih || '-')} · <b>Yer:</b> ${escHtml(top.yer || '-')} · <b>Saat:</b> ${escHtml(top.saat || '-')}
  </div>
  <div class="card">
    <h2>Toplantıya Katılanlar</h2>
    <table><thead><tr><th>Ad Soyad</th><th>Branş/Görev</th><th class="print-only">İmza</th><th class="no-print"></th></tr></thead>
    <tbody>${katilimciRows || `<tr><td colspan="4" class="small">Henüz katılımcı eklenmedi.</td></tr>`}</tbody></table>
    <div class="row no-print"><button class="btn" onclick="addKatilimci('${top.id}')">Katılımcı Ekle</button></div>
  </div>
  ${top.tur === 'zumre' ? `
  <div class="card">
    <h2>Görev Dağılımı</h2>
    <table><thead><tr><th>Kişi</th><th>Görev</th><th>Sorumluluk</th><th class="no-print"></th></tr></thead>
    <tbody>${gorevRows || `<tr><td colspan="4" class="small">Henüz satır eklenmedi.</td></tr>`}</tbody></table>
    <div class="row no-print"><button class="btn" onclick="addGorevSatiri('${top.id}')">Satır Ekle</button></div>
  </div>` : ''}
  <div class="card no-print">
    <h2>Gündem Maddeleri</h2>
    <div class="row"><button class="btn" onclick="addGundemMaddesi('${top.id}')">Gündem Maddesi Ekle</button></div>
  </div>
  ${gundemHtml}`;
}
function viewOkulZumresi() {
  const entries = S.toplantilar.slice().sort((a, b) => (a.baslik || "").localeCompare(b.baslik || "", "tr"));
  if (entries.length && !entries.some(e => e.id === activeToplantiId)) activeToplantiId = entries[0].id;
  if (!entries.length) activeToplantiId = null;
  const active = toplantiById(activeToplantiId);

  const listHtml = entries.length === 0 ? "" : `
    <div class="card no-print">
      <div class="row" style="flex-wrap:wrap;">
        ${entries.map(e => `<button class="btn ${e.id === activeToplantiId ? 'primary' : ''}" onclick="selectToplanti('${e.id}')">${e.tur === 'sube' ? '📋 ' : '🏭 '}${escHtml(e.baslik)}</button>`).join("")}
      </div>
    </div>`;

  const dosyaAdi = active ? active.baslik : "Okul Zümresi";
  const content = active ? renderToplantiDetay(active) : `<div class="card small" style="text-align:center;padding:30px 20px;">Henüz bir toplantı tutanağı eklenmedi. "Yeni Toplantı Ekle" ile Şube Öğretmenler Kurulu ya da Zümre Toplantısı tutanağı oluşturabilirsiniz — standart gündem maddeleri otomatik hazırlanır.</div>`;

  return `
  <div class="card no-print">
    <h2>Okul Zümresi</h2>
    <p class="small">Şube Öğretmenler Kurulu ve Zümre Toplantısı tutanaklarınızı burada tutun — katılımcılar, gündem maddeleri, görüşmeler ve kararlar. Yeni bir toplantı eklediğinizde standart gündem maddeleri otomatik geliyor, dilediğiniz gibi düzenleyip Yazdır/PDF/Excel alabilirsiniz.</p>
    <div class="row"><button class="btn primary" onclick="addToplanti()">Yeni Toplantı Ekle</button>
      ${active ? `<button class="btn danger" onclick="deleteToplanti('${active.id}')">Bu Toplantıyı Sil</button>` : ""}
    </div>
    ${belgeAracCubugu(dosyaAdi)}
  </div>
  ${listHtml}
  <div class="print-area">
    ${belgeYazdirmaBasligi(dosyaAdi)}
    ${content}
  </div>`;
}

/* ---- Atölye / Envanter ---- */
let activeEnvanterTab = "makineler";
let activeMakineId = "__ALL__";
let activeDurumTespitId = null;

function makineById(id) { return S.envanter.makineler.find(x => x.id === id); }
function durumTespitById(id) { return S.durumTespitFormlari.find(x => x.id === id); }

function readMakineForm() {
  return {
    lab: document.getElementById("mk-lab").value.trim(),
    ad: document.getElementById("mk-ad").value.trim(),
    marka: document.getElementById("mk-marka").value.trim(),
    model: document.getElementById("mk-model").value.trim(),
    seriNo: document.getElementById("mk-serino").value.trim(),
    durum: document.getElementById("mk-durum").value.trim(),
    satinAlmaTarihi: document.getElementById("mk-satinalma").value.trim(),
    tedarikci: document.getElementById("mk-tedarikci").value.trim(),
    garantiSuresi: document.getElementById("mk-garanti").value.trim(),
    motorGucu: document.getElementById("mk-motorgucu").value.trim(),
    calismaGerilimi: document.getElementById("mk-gerilim").value.trim(),
    agirlik: document.getElementById("mk-agirlik").value.trim(),
    sorumluPersonel: document.getElementById("mk-sorumlu").value.trim(),
    notlar: document.getElementById("mk-notlar").value.trim()
  };
}
function makineFormAlanlari(m) {
  const v = f => escHtml(m ? m[f] || "" : "");
  return `
    <label class="small">Laboratuvar / Atölye</label><input type="text" id="mk-lab" value="${v('lab')}" placeholder="örn. B3 - İmalat İşlemleri Atölyesi" style="width:100%">
    <label class="small">Makine Adı</label><input type="text" id="mk-ad" value="${v('ad')}" style="width:100%">
    <label class="small">Marka</label><input type="text" id="mk-marka" value="${v('marka')}" style="width:100%">
    <label class="small">Model</label><input type="text" id="mk-model" value="${v('model')}" style="width:100%">
    <label class="small">Seri No</label><input type="text" id="mk-serino" value="${v('seriNo')}" style="width:100%">
    <label class="small">Durum</label><input type="text" id="mk-durum" value="${v('durum')}" placeholder="Çalışıyor / Arızalı" style="width:100%">
    <label class="small">Satın Alma Tarihi</label><input type="text" id="mk-satinalma" value="${v('satinAlmaTarihi')}" style="width:100%">
    <label class="small">Tedarikçi Firma</label><input type="text" id="mk-tedarikci" value="${v('tedarikci')}" style="width:100%">
    <label class="small">Garanti Süresi</label><input type="text" id="mk-garanti" value="${v('garantiSuresi')}" style="width:100%">
    <label class="small">Motor Gücü</label><input type="text" id="mk-motorgucu" value="${v('motorGucu')}" style="width:100%">
    <label class="small">Çalışma Gerilimi</label><input type="text" id="mk-gerilim" value="${v('calismaGerilimi')}" style="width:100%">
    <label class="small">Ağırlık</label><input type="text" id="mk-agirlik" value="${v('agirlik')}" style="width:100%">
    <label class="small">Sorumlu Personel</label><input type="text" id="mk-sorumlu" value="${v('sorumluPersonel')}" style="width:100%">
    <label class="small">Özel Notlar</label><textarea id="mk-notlar" rows="3" style="width:100%">${v('notlar')}</textarea>`;
}
function addMakine() {
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:460px;">
        <h3>Yeni Makine Ekle</h3>
        ${makineFormAlanlari(null)}
        <div class="row">
          <button class="btn primary" onclick="saveNewMakine()">Ekle</button>
          <button class="btn" onclick="closeModal()">İptal</button>
        </div>
      </div>
    </div>`;
}
function saveNewMakine() {
  const data = readMakineForm();
  if (!data.ad) { alert("Makine adı girin."); return; }
  const m = Object.assign({ id: uid("mk"), arizaKayitlari: [], onarimKayitlari: [], bakimKayitlari: [], yedekParcalar: [],
    talimat: { teknik: "", hazirlik: "", calistirma: "", guvenlik: "", bakim: "", sikSorular: "", acilDurum: "" } }, data);
  S.envanter.makineler.push(m);
  activeMakineId = m.id;
  save(); closeModal(); renderMain();
}
function editMakineGenel(id) {
  const m = makineById(id);
  if (!m) return;
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:460px;">
        <h3>Makine Bilgilerini Düzenle</h3>
        ${makineFormAlanlari(m)}
        <div class="row">
          <button class="btn primary" onclick="saveMakineGenel('${id}')">Kaydet</button>
          <button class="btn" onclick="closeModal()">İptal</button>
        </div>
      </div>
    </div>`;
}
function saveMakineGenel(id) {
  const m = makineById(id);
  if (!m) return;
  const data = readMakineForm();
  if (!data.ad) { alert("Makine adı girin."); return; }
  Object.assign(m, data);
  save(); closeModal(); renderMain();
}
function deleteMakine(id) {
  if (!confirm("Bu makine ve tüm arıza/bakım/talimat kayıtları silinsin mi? Bu işlem geri alınamaz.")) return;
  S.envanter.makineler = S.envanter.makineler.filter(x => x.id !== id);
  if (activeMakineId === id) activeMakineId = "__ALL__";
  save(); renderMain();
}
function selectMakine(id) { activeMakineId = id; renderMain(); }
function setEnvanterTab(id) { activeEnvanterTab = id; renderMain(); }
function updateMakineField(id, field, value) {
  const m = makineById(id);
  if (m) m[field] = value;
  save();
}
function updateMakineTalimat(makineId, field, value) {
  const m = makineById(makineId);
  if (m) m.talimat[field] = value;
  save();
}
function makineLogAdd(makineId, listName, blank) {
  const m = makineById(makineId);
  if (!m) return;
  m[listName].push(Object.assign({ id: uid("log") }, blank));
  save(); renderMain();
}
function makineLogUpdate(makineId, listName, id, field, value) {
  const m = makineById(makineId);
  const row = m && m[listName].find(x => x.id === id);
  if (row) row[field] = value;
  save();
}
function makineLogRemove(makineId, listName, id) {
  if (!confirm("Bu kayıt silinsin mi?")) return;
  const m = makineById(makineId);
  if (!m) return;
  m[listName] = m[listName].filter(x => x.id !== id);
  save(); renderMain();
}
function addAriza(makineId) { makineLogAdd(makineId, "arizaKayitlari", { tarih: "", tanim: "", tespitEden: "", aciliyet: "", durum: "" }); }
function addOnarim(makineId) { makineLogAdd(makineId, "onarimKayitlari", { tarih: "", islem: "", degisenParca: "", ucret: "", yapan: "" }); }
function addBakim(makineId) { makineLogAdd(makineId, "bakimKayitlari", { tarih: "", tip: "", islemler: "", sonuc: "", yapan: "" }); }
function addParca(makineId) { makineLogAdd(makineId, "yedekParcalar", { parcaAdi: "", parcaKodu: "", miktar: "", minStok: "", tedarikci: "" }); }
function renderMakineLogTablosu(makineId, listName, columns, rows, title, ekleFn) {
  const body = rows.map(r => `
    <tr>
      ${columns.map(c => `
      <td class="no-print">${c.type === "textarea"
        ? `<textarea rows="2" style="width:100%;" onchange="makineLogUpdate('${makineId}','${listName}','${r.id}','${c.key}',this.value)">${escHtml(r[c.key])}</textarea>`
        : `<input type="text" value="${escHtml(r[c.key])}" style="width:100%" onchange="makineLogUpdate('${makineId}','${listName}','${r.id}','${c.key}',this.value)">`}</td>
      <td class="print-only-cell">${escHtml(r[c.key])}</td>`).join("")}
      <td class="no-print"><button class="btn danger" onclick="makineLogRemove('${makineId}','${listName}','${r.id}')">Sil</button></td>
    </tr>`).join("");
  return `
  <div class="card">
    <h2>${escHtml(title)}</h2>
    <div style="overflow-x:auto;">
    <table><thead><tr>${columns.map(c => `<th>${escHtml(c.label)}</th>`).join("")}<th class="no-print"></th></tr></thead>
    <tbody>${body || `<tr><td colspan="${columns.length + 1}" class="small">Henüz kayıt eklenmedi.</td></tr>`}</tbody></table>
    </div>
    <div class="row no-print"><button class="btn" onclick="${ekleFn}('${makineId}')">Kayıt Ekle</button></div>
  </div>`;
}
function talimatBlok(m, field, label) {
  return `
  <div class="card" style="page-break-inside:avoid;">
    <div class="small no-print" style="font-weight:600;">${escHtml(label)}</div>
    <b class="print-only-inline">${escHtml(label)}</b>
    <textarea class="no-print" rows="5" style="width:100%;margin-top:4px;border:1px solid var(--line);border-radius:4px;padding:6px;resize:vertical;font-family:inherit;font-size:11.5px;" oninput="updateMakineTalimat('${m.id}','${field}',this.value)" onblur="save()">${escHtml(m.talimat[field])}</textarea>
    <div class="print-only" style="margin-top:4px;">${nlToBr(m.talimat[field]) || '<span class="small">—</span>'}</div>
  </div>`;
}
function renderMakineDetay(m) {
  const genel = `
  <div class="card">
    <div class="row" style="justify-content:space-between;align-items:flex-start;flex-wrap:wrap;">
      <table style="flex:1;min-width:260px;">
        <tbody>
          <tr><th style="width:180px;text-align:left;">Laboratuvar/Atölye</th><td>${escHtml(m.lab) || "-"}</td></tr>
          <tr><th style="text-align:left;">Marka</th><td>${escHtml(m.marka) || "-"}</td></tr>
          <tr><th style="text-align:left;">Model</th><td>${escHtml(m.model) || "-"}</td></tr>
          <tr><th style="text-align:left;">Seri No</th><td>${escHtml(m.seriNo) || "-"}</td></tr>
          <tr><th style="text-align:left;">Durum</th><td>${escHtml(m.durum) || "-"}</td></tr>
          <tr><th style="text-align:left;">Satın Alma Tarihi</th><td>${escHtml(m.satinAlmaTarihi) || "-"}</td></tr>
          <tr><th style="text-align:left;">Tedarikçi Firma</th><td>${escHtml(m.tedarikci) || "-"}</td></tr>
          <tr><th style="text-align:left;">Garanti Süresi</th><td>${escHtml(m.garantiSuresi) || "-"}</td></tr>
          <tr><th style="text-align:left;">Motor Gücü</th><td>${escHtml(m.motorGucu) || "-"}</td></tr>
          <tr><th style="text-align:left;">Çalışma Gerilimi</th><td>${escHtml(m.calismaGerilimi) || "-"}</td></tr>
          <tr><th style="text-align:left;">Ağırlık</th><td>${escHtml(m.agirlik) || "-"}</td></tr>
          <tr><th style="text-align:left;">Sorumlu Personel</th><td>${escHtml(m.sorumluPersonel) || "-"}</td></tr>
        </tbody>
      </table>
      <button class="btn no-print" onclick="editMakineGenel('${m.id}')">Bilgileri Düzenle</button>
    </div>
    <div style="margin-top:10px;"><b>Özel Notlar:</b><div>${nlToBr(m.notlar) || '<span class="small">—</span>'}</div></div>
  </div>`;

  const arizaTablo = renderMakineLogTablosu(m.id, "arizaKayitlari",
    [{ key: "tarih", label: "Tarih" }, { key: "tanim", label: "Arıza Tanımı", type: "textarea" }, { key: "tespitEden", label: "Tespit Eden" }, { key: "aciliyet", label: "Aciliyet" }, { key: "durum", label: "Durum" }],
    m.arizaKayitlari, "Arıza Kayıtları", "addAriza");
  const onarimTablo = renderMakineLogTablosu(m.id, "onarimKayitlari",
    [{ key: "tarih", label: "Tarih" }, { key: "islem", label: "Yapılan İşlem", type: "textarea" }, { key: "degisenParca", label: "Değişen Parça" }, { key: "ucret", label: "Ücret" }, { key: "yapan", label: "Yapan" }],
    m.onarimKayitlari, "Onarım ve Değişim Kayıtları", "addOnarim");
  const bakimTablo = renderMakineLogTablosu(m.id, "bakimKayitlari",
    [{ key: "tarih", label: "Tarih" }, { key: "tip", label: "Bakım Tipi" }, { key: "islemler", label: "Yapılan İşlemler", type: "textarea" }, { key: "sonuc", label: "Sonuç" }, { key: "yapan", label: "Yapan" }],
    m.bakimKayitlari, "Periyodik Bakım Kayıtları", "addBakim");
  const parcaTablo = renderMakineLogTablosu(m.id, "yedekParcalar",
    [{ key: "parcaAdi", label: "Parça Adı" }, { key: "parcaKodu", label: "Parça Kodu" }, { key: "miktar", label: "Miktar" }, { key: "minStok", label: "Min. Stok" }, { key: "tedarikci", label: "Tedarikçi" }],
    m.yedekParcalar, "Yedek Parça Listesi", "addParca");

  const talimatBaslik = `<div class="card no-print" style="text-align:center;"><h2 style="margin:0;">Kullanım Talimatı</h2></div>`;
  const talimatIcerik = [
    ["teknik", "Teknik Bilgiler"], ["hazirlik", "Hazırlık Adımları"], ["calistirma", "Çalıştırma Adımları"],
    ["guvenlik", "Güvenlik Uyarıları"], ["bakim", "Bakım ve Temizlik"], ["sikSorular", "Sıkça Karşılaşılan Sorunlar"],
    ["acilDurum", "Acil Durum İletişim Bilgileri"]
  ].map(([field, label]) => talimatBlok(m, field, label)).join("");

  return genel + arizaTablo + onarimTablo + bakimTablo + parcaTablo + talimatBaslik + talimatIcerik;
}
function renderMakineOzetTablosu(list) {
  const rows = list.map((m, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="no-print"><input type="text" value="${escHtml(m.lab)}" style="width:100%" onchange="updateMakineField('${m.id}','lab',this.value)"></td>
      <td class="print-only-cell">${escHtml(m.lab)}</td>
      <td class="no-print"><input type="text" value="${escHtml(m.ad)}" style="width:100%" onchange="updateMakineField('${m.id}','ad',this.value)"></td>
      <td class="print-only-cell">${escHtml(m.ad)}</td>
      <td class="no-print"><input type="text" value="${escHtml(m.marka)}" style="width:100%" onchange="updateMakineField('${m.id}','marka',this.value)"></td>
      <td class="print-only-cell">${escHtml(m.marka)}</td>
      <td class="no-print"><input type="text" value="${escHtml(m.model)}" style="width:100%" onchange="updateMakineField('${m.id}','model',this.value)"></td>
      <td class="print-only-cell">${escHtml(m.model)}</td>
      <td class="no-print"><input type="text" value="${escHtml(m.seriNo)}" style="width:100%" onchange="updateMakineField('${m.id}','seriNo',this.value)"></td>
      <td class="print-only-cell">${escHtml(m.seriNo)}</td>
      <td class="no-print"><input type="text" value="${escHtml(m.durum)}" style="width:100%" onchange="updateMakineField('${m.id}','durum',this.value)"></td>
      <td class="print-only-cell">${escHtml(m.durum)}</td>
      <td class="no-print"><input type="text" value="${escHtml(m.notlar)}" style="width:100%" onchange="updateMakineField('${m.id}','notlar',this.value)"></td>
      <td class="print-only-cell">${escHtml(m.notlar)}</td>
      <td class="no-print"><button class="btn" onclick="selectMakine('${m.id}')">Detay</button> <button class="btn danger" onclick="deleteMakine('${m.id}')">Sil</button></td>
    </tr>`).join("");
  return `
  <div class="card">
    <h2>Tüm Makine Listesi</h2>
    <div style="overflow-x:auto;">
    <table><thead><tr><th>S.N</th><th>Laboratuvar/Atölye</th><th>Makine Adı</th><th>Marka</th><th>Model</th><th>Seri No</th><th>Durum</th><th>Notlar</th><th class="no-print"></th></tr></thead>
    <tbody>${rows || `<tr><td colspan="9" class="small">Henüz makine eklenmedi.</td></tr>`}</tbody></table>
    </div>
  </div>`;
}
function importEnvanterFromExcel() {
  if (!window.desktop || !window.desktop.isElectron) { alert("Excel'den içe aktarma sadece masaüstü uygulamasında çalışır."); return; }
  window.desktop.openXlsxDialog().then(filePath => {
    if (!filePath) return;
    window.desktop.importEnvanterXlsx(filePath).then(result => {
      const makineler = result.makineler || [];
      if (!makineler.length) { alert("Bu dosyada tanıdığım bir makine envanteri tablosu bulunamadı."); return; }
      let eklenen = 0, guncellenen = 0;
      makineler.forEach(data => {
        const existing = S.envanter.makineler.find(x => x.ad.toLowerCase() === data.ad.toLowerCase() && (x.lab || "").toLowerCase() === (data.lab || "").toLowerCase());
        if (existing) { Object.assign(existing, data); guncellenen++; }
        else {
          S.envanter.makineler.push(Object.assign({ id: uid("mk"), arizaKayitlari: [], onarimKayitlari: [], bakimKayitlari: [], yedekParcalar: [],
            talimat: { teknik: "", hazirlik: "", calistirma: "", guvenlik: "", bakim: "", sikSorular: "", acilDurum: "" } }, data));
          eklenen++;
        }
      });
      save(); renderMain();
      alert("İçe aktarıldı: " + eklenen + " yeni makine, " + guncellenen + " güncellenen makine.");
    }).catch(e => alert("İçe aktarma hatası: " + e.message));
  });
}
function viewMakinelerBolumu() {
  const list = S.envanter.makineler.slice().sort((a, b) => (a.lab || "").localeCompare(b.lab || "", "tr") || (a.ad || "").localeCompare(b.ad || "", "tr"));
  if (activeMakineId !== "__ALL__" && list.length && !list.some(m => m.id === activeMakineId)) activeMakineId = "__ALL__";
  if (!list.length) activeMakineId = "__ALL__";
  const active = activeMakineId === "__ALL__" ? null : makineById(activeMakineId);

  const listHtml = list.length === 0 ? "" : `
    <div class="card no-print">
      <div class="row" style="flex-wrap:wrap;">
        <button class="btn ${activeMakineId === '__ALL__' ? 'primary' : ''}" onclick="selectMakine('__ALL__')">📋 Tüm Liste</button>
        ${list.map(m => `<button class="btn ${m.id === activeMakineId ? 'primary' : ''}" onclick="selectMakine('${m.id}')">${escHtml(m.ad)}</button>`).join("")}
      </div>
    </div>`;

  const dosyaAdi = active ? active.ad : "Makine Envanteri";
  const content = active ? renderMakineDetay(active) : renderMakineOzetTablosu(list);

  return `
  <div class="card no-print">
    <h2>Makine Envanteri</h2>
    <p class="small">Atölye/laboratuvar makinelerinizi burada tutun — genel bilgiler, arıza/onarım/bakım kayıtları, yedek parça listesi ve kullanım talimatı. Elle ekleyebilir ya da mevcut Excel envanter listenizi içe aktarabilirsiniz.</p>
    <div class="row">
      <button class="btn primary" onclick="addMakine()">Makine Ekle</button>
      <button class="btn" onclick="importEnvanterFromExcel()">Excel'den İçe Aktar</button>
      ${active ? `<button class="btn danger" onclick="deleteMakine('${active.id}')">Bu Makineyi Sil</button>` : ""}
    </div>
    ${belgeAracCubugu(dosyaAdi)}
  </div>
  ${listHtml}
  <div class="print-area">
    ${belgeYazdirmaBasligi(dosyaAdi)}
    ${content}
  </div>`;
}

const DURUM_TESPIT_KONTROL_ALANLARI = [
  ["talimat", "Kullanma Talimatı Mevcut mu?"], ["stop", "Acil STOP Butonu Çalışıyor mu?"],
  ["siperlik", "Koruyucu Siperlikleri Takılı mı?"], ["topraklama", "Topraklama Bağlantısı Var mı?"],
  ["kablo", "Elektrik Kabloları Sağlam mı?"], ["temizlik", "Makine Temizliği Uygun mu?"], ["bakim", "Genel Bakım Yapıldı mı?"]
];
function addDurumTespit() {
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:420px;">
        <h3>Yeni Durum Tespit Formu</h3>
        <label class="small">Atölye / Laboratuvar</label><input type="text" id="dt-atolye" placeholder="örn. B3 - İmalat İşlemleri Atölyesi" style="width:100%">
        <label class="small">Tarih</label><input type="text" id="dt-tarih" style="width:100%">
        <label class="small">Atölye/Lab. Şefi</label><input type="text" id="dt-atolyesefi" style="width:100%">
        <label class="small">Okul Müdürü</label><input type="text" id="dt-okulmuduru" style="width:100%">
        <label class="small">Alan Şefi</label><input type="text" id="dt-alansefi" value="Ali Osman Koç" style="width:100%">
        <div class="row">
          <button class="btn primary" onclick="saveNewDurumTespit()">Ekle</button>
          <button class="btn" onclick="closeModal()">İptal</button>
        </div>
      </div>
    </div>`;
}
function saveNewDurumTespit() {
  const atolye = document.getElementById("dt-atolye").value.trim();
  if (!atolye) { alert("Atölye/Laboratuvar adı girin."); return; }
  const f = {
    id: uid("dtf"), atolye,
    tarih: document.getElementById("dt-tarih").value.trim(),
    atolyeSefi: document.getElementById("dt-atolyesefi").value.trim(),
    okulMuduru: document.getElementById("dt-okulmuduru").value.trim(),
    alanSefi: document.getElementById("dt-alansefi").value.trim(),
    satirlar: [], aciklamaGorus: ""
  };
  S.durumTespitFormlari.push(f);
  activeDurumTespitId = f.id;
  save(); closeModal(); renderMain();
}
function editDurumTespitMeta(id) {
  const f = durumTespitById(id);
  if (!f) return;
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:420px;">
        <h3>Form Bilgilerini Düzenle</h3>
        <label class="small">Atölye / Laboratuvar</label><input type="text" id="dt-atolye" value="${escHtml(f.atolye)}" style="width:100%">
        <label class="small">Tarih</label><input type="text" id="dt-tarih" value="${escHtml(f.tarih)}" style="width:100%">
        <label class="small">Atölye/Lab. Şefi</label><input type="text" id="dt-atolyesefi" value="${escHtml(f.atolyeSefi)}" style="width:100%">
        <label class="small">Okul Müdürü</label><input type="text" id="dt-okulmuduru" value="${escHtml(f.okulMuduru)}" style="width:100%">
        <label class="small">Alan Şefi</label><input type="text" id="dt-alansefi" value="${escHtml(f.alanSefi)}" style="width:100%">
        <div class="row">
          <button class="btn primary" onclick="saveDurumTespitMeta('${id}')">Kaydet</button>
          <button class="btn" onclick="closeModal()">İptal</button>
        </div>
      </div>
    </div>`;
}
function saveDurumTespitMeta(id) {
  const f = durumTespitById(id);
  if (!f) return;
  const atolye = document.getElementById("dt-atolye").value.trim();
  if (!atolye) { alert("Atölye/Laboratuvar adı girin."); return; }
  f.atolye = atolye;
  f.tarih = document.getElementById("dt-tarih").value.trim();
  f.atolyeSefi = document.getElementById("dt-atolyesefi").value.trim();
  f.okulMuduru = document.getElementById("dt-okulmuduru").value.trim();
  f.alanSefi = document.getElementById("dt-alansefi").value.trim();
  save(); closeModal(); renderMain();
}
function deleteDurumTespit(id) {
  if (!confirm("Bu durum tespit formu silinsin mi? Bu işlem geri alınamaz.")) return;
  S.durumTespitFormlari = S.durumTespitFormlari.filter(x => x.id !== id);
  if (activeDurumTespitId === id) activeDurumTespitId = null;
  save(); renderMain();
}
function selectDurumTespit(id) { activeDurumTespitId = id; renderMain(); }
function addDurumSatir(formId, makineId) {
  const f = durumTespitById(formId);
  if (!f) return;
  const m = makineId ? makineById(makineId) : null;
  f.satirlar.push({
    id: uid("dtr"),
    makineAdi: m ? m.ad : "", marka: m ? m.marka : "", model: m ? m.model : "", seriNo: m ? m.seriNo : "",
    talimat: "", stop: "", siperlik: "", topraklama: "", kablo: "", temizlik: "", bakim: "",
    genelDurum: "", notlar: ""
  });
  save(); renderMain();
}
function updateDurumSatir(formId, id, field, value) {
  const f = durumTespitById(formId);
  const r = f && f.satirlar.find(x => x.id === id);
  if (r) r[field] = value;
  save();
}
function removeDurumSatir(formId, id) {
  if (!confirm("Bu satır silinsin mi?")) return;
  const f = durumTespitById(formId);
  if (!f) return;
  f.satirlar = f.satirlar.filter(x => x.id !== id);
  save(); renderMain();
}
function updateDurumTespitAciklama(formId, value) {
  const f = durumTespitById(formId);
  if (f) f.aciklamaGorus = value;
  save();
}
function renderDurumTespitDetay(f) {
  const kontrolAlanlari = DURUM_TESPIT_KONTROL_ALANLARI;
  const rows = f.satirlar.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="no-print"><input type="text" value="${escHtml(r.makineAdi)}" style="width:120px" onchange="updateDurumSatir('${f.id}','${r.id}','makineAdi',this.value)"></td>
      <td class="print-only-cell">${escHtml(r.makineAdi)}</td>
      <td class="no-print"><input type="text" value="${escHtml(r.marka)}" style="width:90px" onchange="updateDurumSatir('${f.id}','${r.id}','marka',this.value)"></td>
      <td class="print-only-cell">${escHtml(r.marka)}</td>
      <td class="no-print"><input type="text" value="${escHtml(r.model)}" style="width:80px" onchange="updateDurumSatir('${f.id}','${r.id}','model',this.value)"></td>
      <td class="print-only-cell">${escHtml(r.model)}</td>
      <td class="no-print"><input type="text" value="${escHtml(r.seriNo)}" style="width:80px" onchange="updateDurumSatir('${f.id}','${r.id}','seriNo',this.value)"></td>
      <td class="print-only-cell">${escHtml(r.seriNo)}</td>
      ${kontrolAlanlari.map(([key]) => `
      <td class="no-print"><input type="text" value="${escHtml(r[key])}" placeholder="Evet/Hayır" style="width:70px" onchange="updateDurumSatir('${f.id}','${r.id}','${key}',this.value)"></td>
      <td class="print-only-cell">${escHtml(r[key])}</td>`).join("")}
      <td class="no-print"><input type="text" value="${escHtml(r.genelDurum)}" placeholder="İyi/Orta/Kötü" style="width:70px" onchange="updateDurumSatir('${f.id}','${r.id}','genelDurum',this.value)"></td>
      <td class="print-only-cell">${escHtml(r.genelDurum)}</td>
      <td class="no-print"><input type="text" value="${escHtml(r.notlar)}" style="width:120px" onchange="updateDurumSatir('${f.id}','${r.id}','notlar',this.value)"></td>
      <td class="print-only-cell">${escHtml(r.notlar)}</td>
      <td class="no-print"><button class="btn danger" onclick="removeDurumSatir('${f.id}','${r.id}')">Sil</button></td>
    </tr>`).join("");

  const toplam = f.satirlar.length;
  const eksik = f.satirlar.filter(r => /ariz|eksik|k[öo]t[üu]|hay[iı]r|yok/i.test(r.genelDurum || "")).length;
  const makineOptions = S.envanter.makineler.map(m => `<option value="${m.id}">${escHtml(m.ad)}</option>`).join("");

  return `
  <div class="card no-print">
    <div class="row small" style="flex-wrap:wrap;gap:14px;align-items:center;">
      <span><b>Atölye/Lab:</b> ${escHtml(f.atolye)}</span>
      <span><b>Tarih:</b> ${escHtml(f.tarih || '-')}</span>
      <span><b>Atölye/Lab. Şefi:</b> ${escHtml(f.atolyeSefi || '-')}</span>
      <span><b>Okul Müdürü:</b> ${escHtml(f.okulMuduru || '-')}</span>
      <span><b>Alan Şefi:</b> ${escHtml(f.alanSefi || '-')}</span>
      <button class="btn" onclick="editDurumTespitMeta('${f.id}')">Bilgileri Düzenle</button>
    </div>
  </div>
  <div class="print-only" style="margin-bottom:10px;">
    <b>${escHtml(f.atolye)}</b> · Tarih: ${escHtml(f.tarih || '-')} · Atölye/Lab. Şefi: ${escHtml(f.atolyeSefi || '-')} ·
    Okul Müdürü: ${escHtml(f.okulMuduru || '-')} · Alan Şefi: ${escHtml(f.alanSefi || '-')}
  </div>
  <div class="card">
    <p class="small">VAR / YOK — EVET / HAYIR — TAMAM / EKSİK şeklinde doldurunuz. Eksiklik veya arıza varsa NOTLAR sütununa açıklama yazınız.</p>
    <div style="overflow-x:auto;">
    <table><thead><tr>
      <th>S.N</th><th>Makine Adı</th><th>Marka</th><th>Model</th><th>Seri No</th>
      ${kontrolAlanlari.map(([, label]) => `<th>${escHtml(label)}</th>`).join("")}
      <th>Genel Durum</th><th>Notlar/Açıklama</th><th class="no-print"></th>
    </tr></thead>
    <tbody>${rows || `<tr><td colspan="15" class="small">Henüz satır eklenmedi.</td></tr>`}</tbody></table>
    </div>
    <div class="row no-print" style="align-items:center;">
      <select onchange="if(this.value){addDurumSatir('${f.id}', this.value); this.value='';}">
        <option value="">Makineden Satır Ekle...</option>
        ${makineOptions}
      </select>
      <button class="btn" onclick="addDurumSatir('${f.id}')">Boş Satır Ekle</button>
    </div>
    <div class="small" style="margin-top:8px;">Toplam Makine Sayısı: ${toplam} &nbsp;·&nbsp; Eksiklik/Arıza Tespit Edilen Makine Sayısı: ${eksik}</div>
  </div>
  <div class="card">
    <h2 class="no-print">Açıklama ve Görüş</h2>
    <b class="print-only-inline">Açıklama ve Görüş</b>
    <textarea class="no-print" rows="4" style="width:100%;margin-top:6px;border:1px solid var(--line);border-radius:4px;padding:6px;resize:vertical;font-family:inherit;font-size:11.5px;" oninput="updateDurumTespitAciklama('${f.id}',this.value)" onblur="save()">${escHtml(f.aciklamaGorus)}</textarea>
    <div class="print-only" style="margin-top:4px;">${nlToBr(f.aciklamaGorus) || '<span class="small">—</span>'}</div>
  </div>`;
}
function viewDurumTespitBolumu() {
  const entries = S.durumTespitFormlari.slice().sort((a, b) => (a.atolye || "").localeCompare(b.atolye || "", "tr"));
  if (entries.length && !entries.some(e => e.id === activeDurumTespitId)) activeDurumTespitId = entries[0].id;
  if (!entries.length) activeDurumTespitId = null;
  const active = durumTespitById(activeDurumTespitId);

  const listHtml = entries.length === 0 ? "" : `
    <div class="card no-print">
      <div class="row" style="flex-wrap:wrap;">
        ${entries.map(e => `<button class="btn ${e.id === activeDurumTespitId ? 'primary' : ''}" onclick="selectDurumTespit('${e.id}')">${escHtml(e.atolye)}${e.tarih ? ' · ' + escHtml(e.tarih) : ''}</button>`).join("")}
      </div>
    </div>`;

  const dosyaAdi = active ? "Durum Tespit Formu - " + active.atolye : "Makine Durum Tespit Formu";
  const content = active ? renderDurumTespitDetay(active) : `<div class="card small" style="text-align:center;padding:30px 20px;">Henüz bir durum tespit formu eklenmedi. "Yeni Form Ekle" ile atölye/laboratuvar bazında makine durum tespit ve eksiklik belirleme formu oluşturabilirsiniz.</div>`;

  return `
  <div class="card no-print">
    <h2>Makine Durum Tespit ve Eksiklik Belirleme Formu</h2>
    <p class="small">Atölye/laboratuvar bazında periyodik makine durum tespit formlarınızı burada tutun.</p>
    <div class="row">
      <button class="btn primary" onclick="addDurumTespit()">Yeni Form Ekle</button>
      ${active ? `<button class="btn danger" onclick="deleteDurumTespit('${active.id}')">Bu Formu Sil</button>` : ""}
    </div>
    ${belgeAracCubugu(dosyaAdi)}
  </div>
  ${listHtml}
  <div class="print-area">
    ${belgeYazdirmaBasligi(dosyaAdi)}
    ${content}
  </div>`;
}
function viewAtolyeEnvanter() {
  const tabs = [
    { id: "makineler", label: "Makine Envanteri" },
    { id: "durum-tespit", label: "Durum Tespit Formları" }
  ];
  const tabBar = `<div class="row no-print" style="flex-wrap:wrap;">${tabs.map(t => `<button class="btn ${t.id === activeEnvanterTab ? 'primary' : ''}" onclick="setEnvanterTab('${t.id}')">${escHtml(t.label)}</button>`).join("")}</div>`;
  const body = activeEnvanterTab === "durum-tespit" ? viewDurumTespitBolumu() : viewMakinelerBolumu();
  return tabBar + body;
}

/* ---- Performans Kriterleri ---- */
const DERSICI_ETIKETLERI = [
  "Derse gerekli hazırlıkları yaparak gelme",
  "Ders araç ve gereçlerini yanında bulundurma",
  "Ders içi etkinliklere katılım",
  "Sorumluluk almada istekli olma",
  "Verilen görevleri zamanında yapma",
  "Öğretmenlerine karşı davranış ve tutumları",
  "Arkadaşlarına karşı davranış ve tutumlar",
  "Ders giriş çıkış saatlerine özen gösterme"
];
const ODEV_ETIKETLERI = [
  "Ödeve uygun çalışma planı",
  "Farklı kaynaklardan bilgi toplama",
  "Ödevdeki bilgilerin doğruluğu ve özgünlüğü",
  "Ödevi anlaşılır biçimde yazma, yazım ve dilbilgisi kurallarına uyma",
  "Ödevi yeterince materyalle (grafik, fotoğraf, karikatür, sunum) destekleme",
  "Performans çalışmasını sınıfta anlatma",
  "Ödevi zamanında teslim etme",
  "Ders öğretmeni ile işbirliği"
];
let activePerformansTab = "dersici";
let activePerformansId = { dersici: null, odev: null };
let activePerformansSinif = null;
let activePerformansDonem = null;

function jsq(s) { return String(s === null || s === undefined ? "" : s).replace(/\\/g, "\\\\").replace(/'/g, "\\'"); }
function performansEtiketleri(tur) { return tur === "odev" ? ODEV_ETIKETLERI : DERSICI_ETIKETLERI; }
function performansKriterleri(tur) {
  const etiketler = performansEtiketleri(tur);
  const agirliklar = S.performansAgirliklari[tur];
  return etiketler.map((label, i) => [label, agirliklar[i]]);
}
function performansSinifListesi(tur) {
  const gercekSiniflar = S.classes.filter(c => c.grade > 0).map(c => c.name);
  const kayitSiniflari = S.performansKayitlari.filter(x => x.tur === tur).map(x => x.sinif);
  return Array.from(new Set(gercekSiniflar.concat(kayitSiniflari))).sort((a, b) => a.localeCompare(b, "tr", { numeric: true }));
}
function donemEtiketi(d) {
  const s = String(d || "");
  if (/2/.test(s)) return "2. Dönem";
  if (/1/.test(s)) return "1. Dönem";
  return "";
}
function selectPerformansSinif(sinif) {
  activePerformansSinif = sinif;
  activePerformansDonem = null;
  activePerformansId[activePerformansTab] = null;
  renderMain();
}
function selectPerformansDonem(donem) {
  activePerformansDonem = donem;
  activePerformansId[activePerformansTab] = null;
  renderMain();
}
function editPerformansAgirliklari(tur) {
  const etiketler = performansEtiketleri(tur);
  const agirliklar = S.performansAgirliklari[tur];
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:480px;">
        <h3>Kriter Ağırlıklarını Düzenle</h3>
        <p class="small">Öğrenciye girdiğiniz toplam puan, bu ağırlıklar oranında kriterlere dağıtılır. Öğrencinin daha kolay/başarılı olabileceği kriterlere daha yüksek, zor olanlara daha düşük ağırlık verebilirsiniz — toplam mutlaka 100 olmalı.</p>
        ${etiketler.map((label, i) => `
          <div class="row" style="align-items:center;gap:8px;margin-top:4px;">
            <label class="small" style="flex:1;">${escHtml(label)}</label>
            <input type="number" min="0" max="100" id="pa-w${i}" value="${agirliklar[i]}" style="width:70px" oninput="performansAgirlikToplamGuncelle()">
          </div>`).join("")}
        <div class="small" id="pa-toplam" style="margin-top:8px;font-weight:600;">Toplam: ${agirliklar.reduce((a, b) => a + b, 0)} / 100</div>
        <div class="row">
          <button class="btn primary" onclick="savePerformansAgirliklari('${tur}')">Kaydet</button>
          <button class="btn" onclick="closeModal()">İptal</button>
        </div>
      </div>
    </div>`;
}
function performansAgirlikToplamGuncelle() {
  let toplam = 0;
  for (let i = 0; i < 8; i++) toplam += Number(document.getElementById("pa-w" + i).value) || 0;
  const el = document.getElementById("pa-toplam");
  el.textContent = "Toplam: " + toplam + " / 100";
  el.style.color = toplam === 100 ? "" : "#B23A3A";
}
function savePerformansAgirliklari(tur) {
  const vals = [];
  let toplam = 0;
  for (let i = 0; i < 8; i++) {
    const v = Math.max(0, Math.round(Number(document.getElementById("pa-w" + i).value) || 0));
    vals.push(v); toplam += v;
  }
  if (toplam !== 100) { alert("Ağırlıkların toplamı 100 olmalı (şu an " + toplam + "). Lütfen düzeltin."); return; }
  S.performansAgirliklari[tur] = vals;
  save(); closeModal(); renderMain();
}
/* Öğrenci için girilen TEK bir Toplam Puan (0-100), "en büyük kalan"
   yöntemiyle kriterlere dağıtılır: önce her kriterin tam orantılı payı
   hesaplanıp aşağı yuvarlanır, sonra yuvarlamadan kalan puanlar,
   küsuratı en büyük olan kriterlerden başlanarak birer birer dağıtılır.
   Böylece hangi kriterin "fazladan" alacağı öğrenciden öğrenciye
   değişir — tek bir kriter sürekli avantajlı çıkmaz. */
function performansPuanlariDagit(toplam, weights) {
  const total = Math.max(0, Math.min(100, Math.round(Number(toplam) || 0)));
  const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
  const exact = weights.map(w => total * w / totalWeight);
  const result = exact.map(Math.floor);
  let kalan = total - result.reduce((a, b) => a + b, 0);
  const siraliIndeksler = weights.map((w, i) => i).sort((a, b) => (exact[b] - result[b]) - (exact[a] - result[a]));
  for (let i = 0; i < kalan; i++) result[siraliIndeksler[i % siraliIndeksler.length]] += 1;
  return result;
}
function kayitById(id) { return S.performansKayitlari.find(x => x.id === id); }
function addPerformansKayit(tur) {
  if (!activePerformansSinif || !activePerformansDonem) { alert("Önce sınıf ve dönem seçin."); return; }
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:380px;">
        <h3>${tur === 'odev' ? 'Yeni Performans Ödevi Dersi' : 'Yeni Ders İçi Performans Dersi'}</h3>
        <p class="small">${escHtml(activePerformansSinif)} · ${escHtml(activePerformansDonem)}</p>
        <input type="hidden" id="pf-tur" value="${tur}">
        <label class="small">Ders</label><input type="text" id="pf-ders" placeholder="örn. Temel İmalat İşlemleri" style="width:100%">
        <div class="row">
          <button class="btn primary" onclick="saveNewPerformansKayit()">Ekle</button>
          <button class="btn" onclick="closeModal()">İptal</button>
        </div>
      </div>
    </div>`;
}
function saveNewPerformansKayit() {
  const ders = document.getElementById("pf-ders").value.trim();
  if (!ders) { alert("Ders adı girin."); return; }
  const tur = document.getElementById("pf-tur").value;
  const k = {
    id: uid("pf"), tur, ders, sinif: activePerformansSinif, donem: activePerformansDonem,
    ogretimYili: S.akademikTakvim ? S.akademikTakvim.ogretimYili : "",
    ogrenciler: []
  };
  S.performansKayitlari.push(k);
  activePerformansId[tur] = k.id;
  save(); closeModal(); renderMain();
}
function editPerformansKayitMeta(id) {
  const k = kayitById(id);
  if (!k) return;
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:420px;">
        <h3>Kayıt Bilgilerini Düzenle</h3>
        <p class="small">Sınıf/dönem yanlış geldiyse (örn. Excel'de yazım hatası varsa) burada düzeltebilirsiniz.</p>
        <label class="small">Ders</label><input type="text" id="pf-ders" value="${escHtml(k.ders)}" style="width:100%">
        <label class="small">Sınıf / Şube</label><input type="text" id="pf-sinif" value="${escHtml(k.sinif)}" style="width:100%">
        <label class="small">Dönem</label>
        <select id="pf-donem" style="width:100%">
          <option value="1. Dönem" ${k.donem === '1. Dönem' ? 'selected' : ''}>1. Dönem</option>
          <option value="2. Dönem" ${k.donem === '2. Dönem' ? 'selected' : ''}>2. Dönem</option>
        </select>
        <label class="small">Öğretim Yılı</label><input type="text" id="pf-yil" value="${escHtml(k.ogretimYili || '')}" style="width:100%">
        <div class="row">
          <button class="btn primary" onclick="savePerformansKayitMeta('${id}')">Kaydet</button>
          <button class="btn" onclick="closeModal()">İptal</button>
        </div>
      </div>
    </div>`;
}
function savePerformansKayitMeta(id) {
  const k = kayitById(id);
  if (!k) return;
  const ders = document.getElementById("pf-ders").value.trim();
  const sinif = document.getElementById("pf-sinif").value.trim();
  if (!ders || !sinif) { alert("Ders ve sınıf/şube girin."); return; }
  k.ders = ders; k.sinif = sinif;
  k.donem = document.getElementById("pf-donem").value;
  k.ogretimYili = document.getElementById("pf-yil").value.trim();
  if (activePerformansSinif !== sinif || activePerformansDonem !== k.donem) {
    activePerformansSinif = sinif;
    activePerformansDonem = k.donem;
  }
  save(); closeModal(); renderMain();
}
function deletePerformansKayit(id) {
  if (!confirm("Bu performans kaydı ve tüm öğrenci puanları silinsin mi? Bu işlem geri alınamaz.")) return;
  const k = kayitById(id);
  const tur = k ? k.tur : null;
  S.performansKayitlari = S.performansKayitlari.filter(x => x.id !== id);
  if (tur && activePerformansId[tur] === id) activePerformansId[tur] = null;
  save(); renderMain();
}
function selectPerformansKayit(tur, id) { activePerformansId[tur] = id; renderMain(); }
function addOgrenci(kayitId) {
  const k = kayitById(kayitId);
  if (!k) return;
  k.ogrenciler.push({ id: uid("og"), sira: String(k.ogrenciler.length + 1), okulNo: "", ad: "", toplamPuan: 0 });
  save(); renderMain();
}
function updateOgrenci(kayitId, id, field, value) {
  const k = kayitById(kayitId);
  const o = k && k.ogrenciler.find(x => x.id === id);
  if (o) o[field] = value;
  save();
}
function updateOgrenciToplam(kayitId, id, value) {
  const k = kayitById(kayitId);
  const o = k && k.ogrenciler.find(x => x.id === id);
  if (o) o.toplamPuan = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  save(); renderMain();
}
function removeOgrenci(kayitId, id) {
  if (!confirm("Bu öğrenci satırı silinsin mi?")) return;
  const k = kayitById(kayitId);
  if (!k) return;
  k.ogrenciler = k.ogrenciler.filter(x => x.id !== id);
  save(); renderMain();
}
function importPerformansFromExcel() {
  if (!window.desktop || !window.desktop.isElectron) { alert("Excel'den içe aktarma sadece masaüstü uygulamasında çalışır."); return; }
  window.desktop.openXlsxDialog().then(filePath => {
    if (!filePath) return;
    window.desktop.importPerformansXlsx(filePath).then(result => {
      const kayitlar = result.kayitlar || [];
      if (!kayitlar.length) { alert("Bu dosyada tanıdığım bir performans değerlendirme tablosu bulunamadı."); return; }
      let eklenen = 0, guncellenen = 0;
      kayitlar.forEach(data => {
        const donem = donemEtiketi(data.donem) || data.donem;
        const existing = S.performansKayitlari.find(x => x.tur === data.tur && x.ders.toLowerCase() === data.ders.toLowerCase() && x.sinif.toLowerCase() === data.sinif.toLowerCase());
        const ogrenciler = data.ogrenciler.map(o => Object.assign({ id: uid("og") }, o));
        if (existing) {
          existing.donem = donem || existing.donem;
          existing.ogrenciler = ogrenciler;
          guncellenen++;
        } else {
          S.performansKayitlari.push({ id: uid("pf"), tur: data.tur, ders: data.ders, sinif: data.sinif, donem, ogretimYili: S.akademikTakvim ? S.akademikTakvim.ogretimYili : "", ogrenciler });
          eklenen++;
        }
      });
      save(); renderMain();
      alert("İçe aktarıldı: " + eklenen + " yeni kayıt, " + guncellenen + " güncellenen kayıt.\n\nNot: içe aktarılan sınıf/şube adlarını kontrol edin — kaynak Excel dosyasında bazen elle yazım hatası olabiliyor (örn. \"123/A\" gibi), \"Bilgileri Düzenle\" ile düzeltebilirsiniz.");
    }).catch(e => alert("İçe aktarma hatası: " + e.message));
  });
}
function renderPerformansKayitDetay(k) {
  const kriterler = performansKriterleri(k.tur);
  const weights = kriterler.map(c => c[1]);
  const rows = k.ogrenciler.map((o, i) => {
    const dagitim = performansPuanlariDagit(o.toplamPuan, weights);
    return `
    <tr>
      <td>${i + 1}</td>
      <td class="no-print"><input type="text" value="${escHtml(o.okulNo)}" style="width:70px" onchange="updateOgrenci('${k.id}','${o.id}','okulNo',this.value)"></td>
      <td class="print-only-cell">${escHtml(o.okulNo)}</td>
      <td class="no-print"><input type="text" value="${escHtml(o.ad)}" style="width:160px" onchange="updateOgrenci('${k.id}','${o.id}','ad',this.value)"></td>
      <td class="print-only-cell">${escHtml(o.ad)}</td>
      ${dagitim.map(v => `<td>${v}</td>`).join("")}
      <td class="no-print"><input type="number" min="0" max="100" value="${o.toplamPuan}" style="width:60px" onchange="updateOgrenciToplam('${k.id}','${o.id}',this.value)"></td>
      <td class="print-only-cell">${o.toplamPuan}</td>
      <td class="no-print"><button class="btn danger" onclick="removeOgrenci('${k.id}','${o.id}')">Sil</button></td>
    </tr>`;
  }).join("");

  return `
  <div class="card no-print">
    <div class="row small" style="flex-wrap:wrap;gap:14px;align-items:center;">
      <span><b>Ders:</b> ${escHtml(k.ders)}</span>
      <span><b>Sınıf/Şube:</b> ${escHtml(k.sinif)}</span>
      <span><b>Dönem:</b> ${escHtml(k.donem || '-')}</span>
      <span><b>Öğretim Yılı:</b> ${escHtml(k.ogretimYili || '-')}</span>
      <button class="btn" onclick="editPerformansKayitMeta('${k.id}')">Bilgileri Düzenle</button>
    </div>
  </div>
  <div class="print-only" style="margin-bottom:10px;">
    <b>Ders:</b> ${escHtml(k.ders)} · <b>Sınıf/Şube:</b> ${escHtml(k.sinif)} · <b>Dönem:</b> ${escHtml(k.donem || '-')} · <b>Öğretim Yılı:</b> ${escHtml(k.ogretimYili || '-')}
  </div>
  <div class="card">
    <p class="small">Her öğrenci için TEK bir Toplam Puan (0-100) girin — aşağıdaki kriter kutuları, ağırlıklarına oranlı olarak otomatik hesaplanır.</p>
    <div style="overflow-x:auto;">
    <table><thead><tr>
      <th>S.N</th><th>Okul No</th><th>Adı ve Soyadı</th>
      ${kriterler.map(([label, w]) => `<th>${escHtml(label)}<br><span class="small">(${w})</span></th>`).join("")}
      <th>Toplam Puan<br><span class="small">(100)</span></th><th class="no-print"></th>
    </tr></thead>
    <tbody>${rows || `<tr><td colspan="${5 + kriterler.length}" class="small">Henüz öğrenci eklenmedi.</td></tr>`}</tbody></table>
    </div>
    <div class="row no-print"><button class="btn" onclick="addOgrenci('${k.id}')">Öğrenci Ekle</button></div>
  </div>`;
}
function viewPerformansBolum(tur) {
  const baslik = tur === "odev" ? "Performans Ödevi Değerlendirme Ölçeği" : "Ders İçi Performans Değerlendirme Ölçeği";
  const siniflar = performansSinifListesi(tur);
  if (activePerformansSinif && !siniflar.includes(activePerformansSinif)) { activePerformansSinif = null; activePerformansDonem = null; }

  const ustBar = `
  <div class="card no-print">
    <h2>${escHtml(baslik)}</h2>
    <p class="small">Önce sınıf, sonra dönem, sonra ders seçin — her ders için öğrenci listesi ve puan çizelgesi açılır.</p>
    <div class="row">
      <button class="btn" onclick="editPerformansAgirliklari('${tur}')">Kriter Ağırlıklarını Düzenle</button>
      <button class="btn" onclick="importPerformansFromExcel()">Excel'den İçe Aktar</button>
    </div>
  </div>`;

  const sinifBar = `
  <div class="card no-print">
    <div class="small" style="margin-bottom:6px;font-weight:600;">1) Sınıf</div>
    <div class="row" style="flex-wrap:wrap;">
      ${siniflar.length ? siniflar.map(s => `<button class="btn ${s === activePerformansSinif ? 'primary' : ''}" onclick="selectPerformansSinif('${jsq(s)}')">${escHtml(s)}</button>`).join("")
        : '<span class="small">Henüz tanımlı sınıf yok — Ders Programı &gt; Sınıflar bölümünden sınıf ekleyebilirsiniz.</span>'}
    </div>
  </div>`;

  if (!activePerformansSinif) return ustBar + sinifBar;

  const donemBar = `
  <div class="card no-print">
    <div class="small" style="margin-bottom:6px;font-weight:600;">2) Dönem — ${escHtml(activePerformansSinif)}</div>
    <div class="row">
      <button class="btn ${activePerformansDonem === '1. Dönem' ? 'primary' : ''}" onclick="selectPerformansDonem('1. Dönem')">1. Dönem</button>
      <button class="btn ${activePerformansDonem === '2. Dönem' ? 'primary' : ''}" onclick="selectPerformansDonem('2. Dönem')">2. Dönem</button>
    </div>
  </div>`;

  if (!activePerformansDonem) return ustBar + sinifBar + donemBar;

  const dersEntries = S.performansKayitlari.filter(x => x.tur === tur && x.sinif === activePerformansSinif && x.donem === activePerformansDonem)
    .slice().sort((a, b) => (a.ders || "").localeCompare(b.ders || "", "tr"));
  if (dersEntries.length && !dersEntries.some(e => e.id === activePerformansId[tur])) activePerformansId[tur] = dersEntries[0].id;
  if (!dersEntries.length) activePerformansId[tur] = null;
  const active = kayitById(activePerformansId[tur]);

  const dersBar = `
  <div class="card no-print">
    <div class="small" style="margin-bottom:6px;font-weight:600;">3) Ders — ${escHtml(activePerformansSinif)} · ${escHtml(activePerformansDonem)}</div>
    <div class="row" style="flex-wrap:wrap;">
      ${dersEntries.map(e => `<button class="btn ${e.id === activePerformansId[tur] ? 'primary' : ''}" onclick="selectPerformansKayit('${tur}','${e.id}')">${escHtml(e.ders)}</button>`).join("")}
      <button class="btn" onclick="addPerformansKayit('${tur}')">+ Ders Ekle</button>
      ${active ? `<button class="btn danger" onclick="deletePerformansKayit('${active.id}')">Bu Dersi Sil</button>` : ""}
    </div>
  </div>`;

  if (!active) {
    return ustBar + sinifBar + donemBar + dersBar + `<div class="card small" style="text-align:center;padding:30px 20px;">Bu sınıf ve dönem için henüz ders eklenmedi. "+ Ders Ekle" ile elle oluşturabilir ya da yukarıdan Excel dosyanızı içe aktarabilirsiniz.</div>`;
  }

  const dosyaAdi = baslik + " - " + active.sinif + " " + active.donem + " " + active.ders;
  return ustBar + sinifBar + donemBar + dersBar + `
  <div class="card no-print">${belgeAracCubugu(dosyaAdi)}</div>
  <div class="print-area">
    ${belgeYazdirmaBasligi(dosyaAdi)}
    ${renderPerformansKayitDetay(active)}
  </div>`;
}
function setPerformansTab(id) { activePerformansTab = id; renderMain(); }
function viewPerformans() {
  const tabs = [
    { id: "dersici", label: "Ders İçi Performans" },
    { id: "odev", label: "Performans Ödevi" }
  ];
  const tabBar = `<div class="row no-print" style="flex-wrap:wrap;">${tabs.map(t => `<button class="btn ${t.id === activePerformansTab ? 'primary' : ''}" onclick="setPerformansTab('${t.id}')">${escHtml(t.label)}</button>`).join("")}</div>`;
  return tabBar + viewPerformansBolum(activePerformansTab);
}

/* ---- Ders Kesim Raporu / Yazılı Kağıtları Teslim Raporu ---- */
let activeDonemRaporTab = "dersKesim";
let activeDonemRaporId = { dersKesim: null, yaziliTeslim: null };

function ogretmenSiniflariDersler(ogretmenId) {
  const sonuc = [];
  S.classes.forEach(cls => {
    if (!cls.grade) return;
    (cls.assignments || []).forEach(a => {
      if (!(a.eligibleTeacherIds || []).includes(ogretmenId)) return;
      const course = courseById(a.courseId);
      if (course) sonuc.push({ sinif: cls.name, ders: course.name });
    });
  });
  return sonuc;
}
function donemRaporListesi(tur) { return tur === "yaziliTeslim" ? S.donemRaporlari.yaziliTeslim : S.donemRaporlari.dersKesim; }
function donemRaporById(tur, id) { return donemRaporListesi(tur).find(x => x.id === id); }
function addDonemRapor(tur) {
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:420px;">
        <h3>${tur === 'yaziliTeslim' ? 'Yeni Yazılı Kağıtları Teslim Raporu' : 'Yeni Ders Kesim Raporu'}</h3>
        <input type="hidden" id="dr-tur" value="${tur}">
        <label class="small">Öğretmen</label>
        <select id="dr-ogretmen" style="width:100%">
          ${S.teachers.map(t => `<option value="${t.id}">${escHtml(t.name)}</option>`).join("")}
        </select>
        <label class="small">Unvan</label><input type="text" id="dr-unvan" placeholder="örn. Mak. ve Tek. Tas. Öğrt." style="width:100%">
        <label class="small">Öğretim Yılı</label><input type="text" id="dr-yil" value="${S.akademikTakvim ? escHtml(S.akademikTakvim.ogretimYili) : ''}" style="width:100%">
        <label class="small">Dönem</label>
        <select id="dr-donem" style="width:100%">
          <option value="1. Dönem">1. Dönem</option>
          <option value="2. Dönem" selected>2. Dönem</option>
        </select>
        <label class="small">Tarih</label><input type="text" id="dr-tarih" placeholder="örn. 20.06.2025" style="width:100%">
        <div class="row">
          <button class="btn primary" onclick="saveNewDonemRapor()">Oluştur</button>
          <button class="btn" onclick="closeModal()">İptal</button>
        </div>
      </div>
    </div>`;
}
function saveNewDonemRapor() {
  const tur = document.getElementById("dr-tur").value;
  const ogretmenId = document.getElementById("dr-ogretmen").value;
  const ogretmen = teacherById(ogretmenId);
  if (!ogretmen) { alert("Öğretmen seçin."); return; }
  const dersSinif = ogretmenSiniflariDersler(ogretmenId);
  const satirlar = dersSinif.map(x => tur === "yaziliTeslim"
    ? { id: uid("ytr"), sinif: x.sinif, ders: x.ders, yazili1: "", yazili2: "" }
    : { id: uid("dkr"), sinif: x.sinif, ders: x.ders, durum: "TAMAMLANDI" });
  const rapor = {
    id: uid(tur === "yaziliTeslim" ? "yt" : "dk"),
    ogretmenId, ogretmenAdi: ogretmen.name,
    unvan: document.getElementById("dr-unvan").value.trim(),
    ogretimYili: document.getElementById("dr-yil").value.trim(),
    donem: document.getElementById("dr-donem").value,
    tarih: document.getElementById("dr-tarih").value.trim(),
    satirlar
  };
  donemRaporListesi(tur).push(rapor);
  activeDonemRaporId[tur] = rapor.id;
  save(); closeModal(); renderMain();
}
function editDonemRaporMeta(tur, id) {
  const r = donemRaporById(tur, id);
  if (!r) return;
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:420px;">
        <h3>Rapor Bilgilerini Düzenle</h3>
        <label class="small">Öğretmen</label>
        <select id="dr-ogretmen" style="width:100%">
          ${S.teachers.map(t => `<option value="${t.id}" ${t.id === r.ogretmenId ? 'selected' : ''}>${escHtml(t.name)}</option>`).join("")}
        </select>
        <label class="small">Unvan</label><input type="text" id="dr-unvan" value="${escHtml(r.unvan || '')}" style="width:100%">
        <label class="small">Öğretim Yılı</label><input type="text" id="dr-yil" value="${escHtml(r.ogretimYili || '')}" style="width:100%">
        <label class="small">Dönem</label>
        <select id="dr-donem" style="width:100%">
          <option value="1. Dönem" ${r.donem === '1. Dönem' ? 'selected' : ''}>1. Dönem</option>
          <option value="2. Dönem" ${r.donem === '2. Dönem' ? 'selected' : ''}>2. Dönem</option>
        </select>
        <label class="small">Tarih</label><input type="text" id="dr-tarih" value="${escHtml(r.tarih || '')}" style="width:100%">
        <div class="row">
          <button class="btn primary" onclick="saveDonemRaporMeta('${tur}','${id}')">Kaydet</button>
          <button class="btn" onclick="closeModal()">İptal</button>
        </div>
      </div>
    </div>`;
}
function saveDonemRaporMeta(tur, id) {
  const r = donemRaporById(tur, id);
  if (!r) return;
  const ogretmenId = document.getElementById("dr-ogretmen").value;
  const ogretmen = teacherById(ogretmenId);
  r.ogretmenId = ogretmenId;
  r.ogretmenAdi = ogretmen ? ogretmen.name : r.ogretmenAdi;
  r.unvan = document.getElementById("dr-unvan").value.trim();
  r.ogretimYili = document.getElementById("dr-yil").value.trim();
  r.donem = document.getElementById("dr-donem").value;
  r.tarih = document.getElementById("dr-tarih").value.trim();
  save(); closeModal(); renderMain();
}
function deleteDonemRapor(tur, id) {
  if (!confirm("Bu rapor silinsin mi? Bu işlem geri alınamaz.")) return;
  const arr = donemRaporListesi(tur);
  const idx = arr.findIndex(x => x.id === id);
  if (idx >= 0) arr.splice(idx, 1);
  if (activeDonemRaporId[tur] === id) activeDonemRaporId[tur] = null;
  save(); renderMain();
}
function selectDonemRapor(tur, id) { activeDonemRaporId[tur] = id; renderMain(); }
function donemRaporSatirlariYenile(tur, id) {
  const r = donemRaporById(tur, id);
  if (!r) return;
  const guncel = ogretmenSiniflariDersler(r.ogretmenId);
  let eklendi = 0;
  guncel.forEach(g => {
    const varMi = r.satirlar.some(s => s.sinif === g.sinif && s.ders === g.ders);
    if (!varMi) {
      r.satirlar.push(tur === "yaziliTeslim"
        ? { id: uid("ytr"), sinif: g.sinif, ders: g.ders, yazili1: "", yazili2: "" }
        : { id: uid("dkr"), sinif: g.sinif, ders: g.ders, durum: "TAMAMLANDI" });
      eklendi++;
    }
  });
  save(); renderMain();
  alert(eklendi ? ("Ders programından " + eklendi + " yeni satır eklendi.") : "Ders programında bu rapora eklenecek yeni bir sınıf/ders bulunamadı.");
}
function addDonemRaporSatir(tur, id) {
  const r = donemRaporById(tur, id);
  if (!r) return;
  r.satirlar.push(tur === "yaziliTeslim"
    ? { id: uid("ytr"), sinif: "", ders: "", yazili1: "", yazili2: "" }
    : { id: uid("dkr"), sinif: "", ders: "", durum: "TAMAMLANDI" });
  save(); renderMain();
}
function updateDonemRaporSatir(tur, raporId, satirId, field, value) {
  const r = donemRaporById(tur, raporId);
  const s = r && r.satirlar.find(x => x.id === satirId);
  if (s) s[field] = value;
  save();
}
function removeDonemRaporSatir(tur, raporId, satirId) {
  if (!confirm("Bu satır silinsin mi?")) return;
  const r = donemRaporById(tur, raporId);
  if (!r) return;
  r.satirlar = r.satirlar.filter(x => x.id !== satirId);
  save(); renderMain();
}
function renderDonemRaporDetay(tur, r) {
  const isYazili = tur === "yaziliTeslim";
  const rows = r.satirlar.map(s => `
    <tr>
      <td class="no-print"><input type="text" value="${escHtml(s.sinif)}" style="width:70px" onchange="updateDonemRaporSatir('${tur}','${r.id}','${s.id}','sinif',this.value)"></td>
      <td class="print-only-cell">${escHtml(s.sinif)}</td>
      <td class="no-print"><input type="text" value="${escHtml(s.ders)}" style="width:220px" onchange="updateDonemRaporSatir('${tur}','${r.id}','${s.id}','ders',this.value)"></td>
      <td class="print-only-cell">${escHtml(s.ders)}</td>
      ${isYazili ? `
      <td class="no-print"><input type="text" value="${escHtml(s.yazili1)}" placeholder="örn. 1 ADET" style="width:90px" onchange="updateDonemRaporSatir('${tur}','${r.id}','${s.id}','yazili1',this.value)"></td>
      <td class="print-only-cell">${escHtml(s.yazili1)}</td>
      <td class="no-print"><input type="text" value="${escHtml(s.yazili2)}" placeholder="örn. 1 ADET" style="width:90px" onchange="updateDonemRaporSatir('${tur}','${r.id}','${s.id}','yazili2',this.value)"></td>
      <td class="print-only-cell">${escHtml(s.yazili2)}</td>` : `
      <td class="no-print"><input type="text" value="${escHtml(s.durum)}" placeholder="TAMAMLANDI" style="width:160px" onchange="updateDonemRaporSatir('${tur}','${r.id}','${s.id}','durum',this.value)"></td>
      <td class="print-only-cell">${escHtml(s.durum)}</td>`}
      <td class="no-print"><button class="btn danger" onclick="removeDonemRaporSatir('${tur}','${r.id}','${s.id}')">Sil</button></td>
    </tr>`).join("");

  const toplam = isYazili ? r.satirlar.reduce((a, s) => a + (parseInt(s.yazili1) || 0) + (parseInt(s.yazili2) || 0), 0) : null;
  const paragraf = isYazili
    ? `${escHtml(r.ogretimYili || '.......')} Eğitim ve Öğretim yılında dersine girdiğim sınıflarda müfredat programına ve Zümre toplantı kararlarına uygun olarak toplam yazılı adetleri aşağıya çıkarılmıştır. Gereğini bilgilerinize arz ederim.`
    : `${escHtml(r.ogretimYili || '.......')} Eğitim ve Öğretim Yılı ${escHtml(r.donem || '')}inde dersine girdiğim sınıflarda müfredat programının bitirilip bitirilmediğine ait bilgiler aşağıya çıkarılmıştır. Gereğini bilgilerinize arz ederim.`;

  return `
  <div class="card no-print">
    <div class="row small" style="flex-wrap:wrap;gap:14px;align-items:center;">
      <span><b>Öğretmen:</b> ${escHtml(r.ogretmenAdi)}</span>
      <span><b>Unvan:</b> ${escHtml(r.unvan || '-')}</span>
      <span><b>Öğretim Yılı:</b> ${escHtml(r.ogretimYili || '-')}</span>
      <span><b>Dönem:</b> ${escHtml(r.donem || '-')}</span>
      <span><b>Tarih:</b> ${escHtml(r.tarih || '-')}</span>
      <button class="btn" onclick="editDonemRaporMeta('${tur}','${r.id}')">Bilgileri Düzenle</button>
      <button class="btn" onclick="donemRaporSatirlariYenile('${tur}','${r.id}')">Ders Programından Yenile</button>
    </div>
  </div>
  <div style="margin-bottom:14px;">
    <div>SOMA MESLEKİ VE TEKNİK ANADOLU LİSESİ MÜDÜRLÜĞÜ'NE</div>
    <div>SOMA</div>
  </div>
  <p class="small" style="margin-bottom:14px;">${paragraf}</p>
  <table><thead><tr>
    <th>Sınıfı</th><th>Dersi</th>
    ${isYazili ? '<th>1. Yazılı</th><th>2. Yazılı</th>' : '<th>Konular</th>'}
    <th class="no-print"></th>
  </tr></thead>
  <tbody>${rows || `<tr><td colspan="${isYazili ? 5 : 4}" class="small">Henüz satır yok. "Ders Programından Yenile" ile öğretmenin ders atamalarından otomatik doldurabilirsiniz.</td></tr>`}</tbody></table>
  ${isYazili ? `<div class="small" style="margin-top:8px;font-weight:600;">TOPLAM ${toplam} ADET</div>` : ''}
  <div class="row no-print" style="margin-top:10px;"><button class="btn" onclick="addDonemRaporSatir('${tur}','${r.id}')">Satır Ekle</button></div>
  <div style="margin-top:36px;text-align:right;">
    <div>${escHtml(r.tarih || '')}</div>
    <div style="margin-top:30px;font-weight:600;">${escHtml(r.ogretmenAdi)}</div>
    <div>${escHtml(r.unvan || '')}</div>
  </div>`;
}
function viewDonemRaporBolum(tur) {
  const entries = donemRaporListesi(tur).slice().sort((a, b) => (a.ogretmenAdi || "").localeCompare(b.ogretmenAdi || "", "tr") || (b.ogretimYili || "").localeCompare(a.ogretimYili || "", "tr"));
  if (entries.length && !entries.some(e => e.id === activeDonemRaporId[tur])) activeDonemRaporId[tur] = entries[0].id;
  if (!entries.length) activeDonemRaporId[tur] = null;
  const active = donemRaporById(tur, activeDonemRaporId[tur]);

  const baslik = tur === "yaziliTeslim" ? "Yazılı Kağıtları Teslim Raporu" : "Ders Kesim Raporu";
  const listHtml = entries.length === 0 ? "" : `
    <div class="card no-print">
      <div class="row" style="flex-wrap:wrap;">
        ${entries.map(e => `<button class="btn ${e.id === activeDonemRaporId[tur] ? 'primary' : ''}" onclick="selectDonemRapor('${tur}','${e.id}')">${escHtml(e.ogretmenAdi)} · ${escHtml(e.donem || '')} ${escHtml(e.ogretimYili || '')}</button>`).join("")}
      </div>
    </div>`;

  const dosyaAdi = active ? baslik + " - " + active.ogretmenAdi + " " + active.donem : baslik;
  const content = active ? renderDonemRaporDetay(tur, active) : `<div class="card small" style="text-align:center;padding:30px 20px;">Henüz rapor oluşturulmadı. "Yeni Rapor Oluştur" ile öğretmen seçip oluşturun — sınıf/ders satırları ders programından otomatik gelir.</div>`;

  return `
  <div class="card no-print">
    <h2>${escHtml(baslik)}</h2>
    <p class="small">Okul müdürlüğüne sunulan resmi rapor formatında — sınıf/ders satırları öğretmenin ders programındaki atamalarından otomatik gelir, dilediğiniz gibi düzenleyip Yazdır/PDF/Excel alabilirsiniz.</p>
    <div class="row">
      <button class="btn primary" onclick="addDonemRapor('${tur}')">Yeni Rapor Oluştur</button>
      ${active ? `<button class="btn danger" onclick="deleteDonemRapor('${tur}','${active.id}')">Bu Raporu Sil</button>` : ""}
    </div>
    ${belgeAracCubugu(dosyaAdi)}
  </div>
  ${listHtml}
  <div class="print-area">
    ${content}
  </div>`;
}
function setDonemRaporTab(id) { activeDonemRaporTab = id; renderMain(); }
function viewDonemRaporlari() {
  const tabs = [
    { id: "dersKesim", label: "Ders Kesim Raporu" },
    { id: "yaziliTeslim", label: "Yazılı Kağıtları Teslim Raporu" }
  ];
  const tabBar = `<div class="row no-print" style="flex-wrap:wrap;">${tabs.map(t => `<button class="btn ${t.id === activeDonemRaporTab ? 'primary' : ''}" onclick="setDonemRaporTab('${t.id}')">${escHtml(t.label)}</button>`).join("")}</div>`;
  return tabBar + viewDonemRaporBolum(activeDonemRaporTab);
}

/* ---- Sınav Havuzu ---- */
const TUR_ETIKETLERI = { klasik: "Klasik", test: "Test", uygulamali: "Uygulamalı" };
const FORMAT_ETIKETLERI = { klasik: "Klasik", test: "Test", uygulamali: "Uygulamalı", karma: "Karma" };
let activeSinavSinifId = null;
let activeSinavCourseId = null;
let activeSinavTab = "havuz";
let activeSinavKagitId = null;

function soruById(id) { return S.sinavHavuzu.sorular.find(x => x.id === id); }
function kagitById(id) { return S.sinavKagitlari.find(x => x.id === id); }
function sinavSiniflari() { return S.classes.filter(c => c.grade > 0).slice().sort((a, b) => a.name.localeCompare(b.name, "tr", { numeric: true })); }
function selectSinavSinif(classId) { activeSinavSinifId = classId; activeSinavCourseId = null; activeSinavTab = "havuz"; renderMain(); }
function selectSinavCourse(courseId) { activeSinavCourseId = courseId; activeSinavTab = "havuz"; renderMain(); }
function setSinavTab(id) { activeSinavTab = id; renderMain(); }
function selectKagit(id) { activeSinavKagitId = id; renderMain(); }

function sinavTurDegisti() {
  const tur = document.getElementById("sr-tur").value;
  document.getElementById("sr-secenekler-alani").style.display = tur === "test" ? "" : "none";
  document.getElementById("sr-cevap-alani").style.display = tur === "test" ? "none" : "";
}
function soruFormAlanlari(q) {
  const tur = q ? q.tur : "klasik";
  const secYedek = q ? q.secenekler : [];
  return `
    <label class="small">Soru Türü</label>
    <select id="sr-tur" style="width:100%" onchange="sinavTurDegisti()">
      <option value="klasik" ${tur === 'klasik' ? 'selected' : ''}>Klasik (Açık Uçlu)</option>
      <option value="test" ${tur === 'test' ? 'selected' : ''}>Test (Çoktan Seçmeli)</option>
      <option value="uygulamali" ${tur === 'uygulamali' ? 'selected' : ''}>Uygulamalı</option>
    </select>
    <label class="small">Soru Metni</label><textarea id="sr-metin" rows="3" style="width:100%">${q ? escHtml(q.soruMetni) : ''}</textarea>
    <div id="sr-secenekler-alani">
      <label class="small">Seçenekler (doğru olanı işaretleyin)</label>
      ${["A", "B", "C", "D", "E"].map((h, i) => {
        const mevcut = secYedek[i];
        return `
        <div class="row" style="align-items:center;gap:6px;">
          <input type="radio" name="sr-dogru" value="${i}" ${mevcut ? (mevcut.dogru ? 'checked' : '') : (i === 0 ? 'checked' : '')}>
          <b style="width:16px;">${h}</b>
          <input type="text" id="sr-sec${i}" style="flex:1;" value="${mevcut ? escHtml(mevcut.metin) : ''}">
        </div>`;
      }).join("")}
    </div>
    <div id="sr-cevap-alani" style="display:none;">
      <label class="small">Cevap Anahtarı / Değerlendirme Ölçütü (opsiyonel)</label>
      <textarea id="sr-cevap" rows="2" style="width:100%">${q ? escHtml(q.cevapAnahtari || '') : ''}</textarea>
    </div>
    <label class="small">Puan</label><input type="number" id="sr-puan" value="${q ? q.puan : 10}" min="0" style="width:100%">
    <label class="small">Konu (opsiyonel)</label><input type="text" id="sr-konu" value="${q ? escHtml(q.konu || '') : ''}" style="width:100%">`;
}
function addSoru(classId, courseId) {
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:480px;">
        <h3>Yeni Soru Ekle</h3>
        <input type="hidden" id="sr-classid" value="${classId}">
        <input type="hidden" id="sr-courseid" value="${courseId}">
        ${soruFormAlanlari(null)}
        <div class="row">
          <button class="btn primary" onclick="saveNewSoru()">Ekle</button>
          <button class="btn" onclick="closeModal()">İptal</button>
        </div>
      </div>
    </div>`;
  sinavTurDegisti();
}
function editSoru(id) {
  const q = soruById(id);
  if (!q) return;
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:480px;">
        <h3>Soruyu Düzenle</h3>
        ${soruFormAlanlari(q)}
        <div class="row">
          <button class="btn primary" onclick="saveSoruEdit('${id}')">Kaydet</button>
          <button class="btn" onclick="closeModal()">İptal</button>
        </div>
      </div>
    </div>`;
  sinavTurDegisti();
}
function readSoruForm() {
  const tur = document.getElementById("sr-tur").value;
  let secenekler = [];
  if (tur === "test") {
    const checkedEl = document.querySelector('input[name="sr-dogru"]:checked');
    const dogruIdx = checkedEl ? Number(checkedEl.value) : 0;
    ["A", "B", "C", "D", "E"].forEach((h, i) => {
      const v = document.getElementById("sr-sec" + i).value.trim();
      if (v) secenekler.push({ id: uid("sc"), harf: h, metin: v, dogru: i === dogruIdx });
    });
  }
  return {
    tur,
    soruMetni: document.getElementById("sr-metin").value.trim(),
    secenekler,
    cevapAnahtari: tur !== "test" ? document.getElementById("sr-cevap").value.trim() : "",
    puan: Number(document.getElementById("sr-puan").value) || 0,
    konu: document.getElementById("sr-konu").value.trim()
  };
}
function saveNewSoru() {
  const data = readSoruForm();
  if (!data.soruMetni) { alert("Soru metni girin."); return; }
  const classId = document.getElementById("sr-classid").value;
  const courseId = document.getElementById("sr-courseid").value;
  const soru = Object.assign({ id: uid("sr"), classId, courseId }, data);
  S.sinavHavuzu.sorular.push(soru);
  save(); closeModal(); renderMain();
}
function saveSoruEdit(id) {
  const q = soruById(id);
  if (!q) return;
  const data = readSoruForm();
  if (!data.soruMetni) { alert("Soru metni girin."); return; }
  Object.assign(q, data);
  save(); closeModal(); renderMain();
}
function deleteSoru(id) {
  if (!confirm("Bu soru silinsin mi? Bu soruyu içeren sınav kağıtlarından da kaldırılacak.")) return;
  S.sinavHavuzu.sorular = S.sinavHavuzu.sorular.filter(x => x.id !== id);
  S.sinavKagitlari.forEach(k => { k.soruIdleri = k.soruIdleri.filter(sid => sid !== id); });
  save(); renderMain();
}
function viewSoruHavuzuBolum(classId, courseId) {
  const course = courseById(courseId);
  const cls = classById(classId);
  const sorular = S.sinavHavuzu.sorular.filter(q => q.classId === classId && q.courseId === courseId);
  const dosyaAdi = (cls ? cls.name + " " : "") + (course ? course.name : "") + " Soru Havuzu";
  const cards = sorular.map((q, i) => {
    const turEtiket = TUR_ETIKETLERI[q.tur] || q.tur;
    const secHtml = q.tur === "test" ? `<ul class="small">${q.secenekler.map(s => `<li>${escHtml(s.harf)}) ${escHtml(s.metin)}${s.dogru ? ' ✓' : ''}</li>`).join("")}</ul>` : "";
    return `
    <div class="card" style="page-break-inside:avoid;">
      <div class="row" style="justify-content:space-between;align-items:flex-start;">
        <div><b>${i + 1}.</b> ${escHtml(q.soruMetni)} <span class="small">(${turEtiket} · ${q.puan} puan${q.konu ? ' · ' + escHtml(q.konu) : ''})</span></div>
        <div class="row no-print">
          <button class="btn" onclick="editSoru('${q.id}')">Düzenle</button>
          <button class="btn danger" onclick="deleteSoru('${q.id}')">Sil</button>
        </div>
      </div>
      ${secHtml}
      ${q.cevapAnahtari ? `<div class="small"><b>Cevap Anahtarı:</b> ${nlToBr(q.cevapAnahtari)}</div>` : ""}
    </div>`;
  }).join("");
  return `
  <div class="card no-print">
    <div class="row"><button class="btn primary" onclick="addSoru('${classId}','${courseId}')">Soru Ekle</button></div>
    ${belgeAracCubugu(dosyaAdi)}
  </div>
  <div class="print-area">
    ${belgeYazdirmaBasligi(dosyaAdi)}
    ${cards || `<div class="card small" style="text-align:center;padding:30px 20px;">Bu ders için henüz soru eklenmedi.</div>`}
  </div>`;
}
function addKagit(classId, courseId) {
  const course = courseById(courseId);
  const cls = classById(classId);
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:420px;">
        <h3>Sınav Kağıdı Hazırla</h3>
        <input type="hidden" id="sk-classid" value="${classId}">
        <input type="hidden" id="sk-courseid" value="${courseId}">
        <label class="small">Başlık</label><input type="text" id="sk-baslik" value="${cls && course ? escHtml(cls.name + ' ' + course.name + ' Yazılı Sınavı') : ''}" style="width:100%">
        <label class="small">Format</label>
        <select id="sk-format" style="width:100%">
          <option value="klasik">Klasik</option>
          <option value="test">Test</option>
          <option value="uygulamali">Uygulamalı</option>
          <option value="karma">Karma</option>
        </select>
        <label class="small">Dönem</label>
        <select id="sk-donem" style="width:100%">
          <option value="1. Dönem">1. Dönem</option>
          <option value="2. Dönem">2. Dönem</option>
        </select>
        <label class="small">Öğretim Yılı</label><input type="text" id="sk-yil" value="${S.akademikTakvim ? escHtml(S.akademikTakvim.ogretimYili) : ''}" style="width:100%">
        <label class="small">Tarih</label><input type="text" id="sk-tarih" placeholder="gg.aa.yyyy" style="width:100%">
        <label class="small">Süre (dakika)</label><input type="number" id="sk-sure" value="40" min="0" style="width:100%">
        <div class="row">
          <button class="btn primary" onclick="saveNewKagit()">Oluştur</button>
          <button class="btn" onclick="closeModal()">İptal</button>
        </div>
      </div>
    </div>`;
}
function saveNewKagit() {
  const baslik = document.getElementById("sk-baslik").value.trim();
  if (!baslik) { alert("Başlık girin."); return; }
  const kagit = {
    id: uid("sk"),
    classId: document.getElementById("sk-classid").value,
    courseId: document.getElementById("sk-courseid").value,
    baslik,
    format: document.getElementById("sk-format").value,
    donem: document.getElementById("sk-donem").value,
    ogretimYili: document.getElementById("sk-yil").value.trim(),
    tarih: document.getElementById("sk-tarih").value.trim(),
    sure: Number(document.getElementById("sk-sure").value) || 0,
    soruIdleri: []
  };
  S.sinavKagitlari.push(kagit);
  activeSinavKagitId = kagit.id;
  save(); closeModal(); renderMain();
}
function editKagitMeta(id) {
  const k = kagitById(id);
  if (!k) return;
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:420px;">
        <h3>Sınav Kağıdı Bilgilerini Düzenle</h3>
        <label class="small">Başlık</label><input type="text" id="sk-baslik" value="${escHtml(k.baslik)}" style="width:100%">
        <label class="small">Format</label>
        <select id="sk-format" style="width:100%">
          <option value="klasik" ${k.format === 'klasik' ? 'selected' : ''}>Klasik</option>
          <option value="test" ${k.format === 'test' ? 'selected' : ''}>Test</option>
          <option value="uygulamali" ${k.format === 'uygulamali' ? 'selected' : ''}>Uygulamalı</option>
          <option value="karma" ${k.format === 'karma' ? 'selected' : ''}>Karma</option>
        </select>
        <label class="small">Dönem</label>
        <select id="sk-donem" style="width:100%">
          <option value="1. Dönem" ${k.donem === '1. Dönem' ? 'selected' : ''}>1. Dönem</option>
          <option value="2. Dönem" ${k.donem === '2. Dönem' ? 'selected' : ''}>2. Dönem</option>
        </select>
        <label class="small">Öğretim Yılı</label><input type="text" id="sk-yil" value="${escHtml(k.ogretimYili || '')}" style="width:100%">
        <label class="small">Tarih</label><input type="text" id="sk-tarih" value="${escHtml(k.tarih || '')}" style="width:100%">
        <label class="small">Süre (dakika)</label><input type="number" id="sk-sure" value="${k.sure || 0}" min="0" style="width:100%">
        <div class="row">
          <button class="btn primary" onclick="saveKagitMeta('${id}')">Kaydet</button>
          <button class="btn" onclick="closeModal()">İptal</button>
        </div>
      </div>
    </div>`;
}
function saveKagitMeta(id) {
  const k = kagitById(id);
  if (!k) return;
  const baslik = document.getElementById("sk-baslik").value.trim();
  if (!baslik) { alert("Başlık girin."); return; }
  k.baslik = baslik;
  k.format = document.getElementById("sk-format").value;
  k.donem = document.getElementById("sk-donem").value;
  k.ogretimYili = document.getElementById("sk-yil").value.trim();
  k.tarih = document.getElementById("sk-tarih").value.trim();
  k.sure = Number(document.getElementById("sk-sure").value) || 0;
  save(); closeModal(); renderMain();
}
function deleteKagit(id) {
  if (!confirm("Bu sınav kağıdı silinsin mi? Bu işlem geri alınamaz.")) return;
  S.sinavKagitlari = S.sinavKagitlari.filter(x => x.id !== id);
  if (activeSinavKagitId === id) activeSinavKagitId = null;
  save(); renderMain();
}
function toggleKagitSoru(kagitId, soruId) {
  const k = kagitById(kagitId);
  if (!k) return;
  const idx = k.soruIdleri.indexOf(soruId);
  if (idx >= 0) k.soruIdleri.splice(idx, 1);
  else k.soruIdleri.push(soruId);
  save(); renderMain();
}
function renderKagitDetay(kagit) {
  const classObj = classById(kagit.classId);
  const course = courseById(kagit.courseId);
  const havuz = S.sinavHavuzu.sorular.filter(q => q.classId === kagit.classId && q.courseId === kagit.courseId && (kagit.format === "karma" || q.tur === kagit.format));
  const secimHtml = havuz.length === 0 ? `<div class="small">Bu format için soru havuzunda uygun soru yok. Önce "Soru Havuzu" sekmesinden soru ekleyin.</div>` : havuz.map(q => `
    <label class="row small" style="align-items:flex-start;gap:8px;">
      <input type="checkbox" ${kagit.soruIdleri.includes(q.id) ? 'checked' : ''} onchange="toggleKagitSoru('${kagit.id}','${q.id}')">
      <span>${escHtml(q.soruMetni)} <i>(${q.puan} puan)</i></span>
    </label>`).join("<br>");

  const seciliSorular = kagit.soruIdleri.map(soruById).filter(Boolean);
  const toplamPuan = seciliSorular.reduce((a, q) => a + (q.puan || 0), 0);
  const soruBlok = seciliSorular.map((q, i) => {
    if (q.tur === "test") {
      return `
      <div style="margin-top:14px;">
        <div><b>${i + 1}.</b> ${escHtml(q.soruMetni)} <span class="small">(${q.puan} puan)</span></div>
        ${q.secenekler.map(s => `<div style="margin-left:18px;">${escHtml(s.harf)}) ${escHtml(s.metin)}</div>`).join("")}
      </div>`;
    }
    return `
    <div style="margin-top:14px;">
      <div><b>${i + 1}.</b> ${escHtml(q.soruMetni)} <span class="small">(${q.puan} puan)</span></div>
      <div style="border-bottom:1px solid #ccc;height:22px;margin-top:8px;"></div>
      <div style="border-bottom:1px solid #ccc;height:22px;margin-top:8px;"></div>
      <div style="border-bottom:1px solid #ccc;height:22px;margin-top:8px;"></div>
    </div>`;
  }).join("");

  return `
  <div class="card no-print">
    <div class="row small" style="flex-wrap:wrap;gap:14px;align-items:center;">
      <span><b>Sınıf:</b> ${classObj ? escHtml(classObj.name) : '-'}</span>
      <span><b>Ders:</b> ${course ? escHtml(course.name) : '-'}</span>
      <span><b>Format:</b> ${escHtml(FORMAT_ETIKETLERI[kagit.format] || kagit.format)}</span>
      <span><b>Dönem:</b> ${escHtml(kagit.donem || '-')}</span>
      <span><b>Süre:</b> ${kagit.sure || '-'} dk</span>
      <button class="btn" onclick="editKagitMeta('${kagit.id}')">Bilgileri Düzenle</button>
    </div>
  </div>
  <div class="card no-print">
    <h3 style="margin-top:0;">Soru Seç (${seciliSorular.length} soru seçili, toplam ${toplamPuan} puan)</h3>
    ${secimHtml}
  </div>
  <div class="print-area">
    ${belgeYazdirmaBasligi(kagit.baslik)}
    <div style="text-align:center;margin-bottom:14px;">
      <div style="font-weight:700;">${classObj ? escHtml(classObj.name) : ''} · ${course ? escHtml(course.name) : ''}</div>
      <div style="font-weight:700;">${escHtml(kagit.baslik)}</div>
    </div>
    <div class="row small" style="justify-content:space-between;flex-wrap:wrap;">
      <span>Adı Soyadı: ......................................</span>
      <span>No: ..........</span>
      <span>Tarih: ${escHtml(kagit.tarih) || '..../..../........'}</span>
      <span>Süre: ${kagit.sure || '.....'} dk</span>
    </div>
    ${soruBlok || '<div class="small">Henüz soru seçilmedi.</div>'}
    <div style="margin-top:20px;font-weight:600;">TOPLAM: ${toplamPuan} PUAN</div>
  </div>`;
}
function viewKagitlarBolum(classId, courseId) {
  const entries = S.sinavKagitlari.filter(k => k.classId === classId && k.courseId === courseId).slice().sort((a, b) => (a.baslik || "").localeCompare(b.baslik || "", "tr"));
  if (entries.length && !entries.some(e => e.id === activeSinavKagitId)) activeSinavKagitId = entries[0].id;
  if (!entries.length) activeSinavKagitId = null;
  const active = kagitById(activeSinavKagitId);

  const listHtml = entries.length === 0 ? "" : `
    <div class="card no-print">
      <div class="row" style="flex-wrap:wrap;">
        ${entries.map(e => `<button class="btn ${e.id === activeSinavKagitId ? 'primary' : ''}" onclick="selectKagit('${e.id}')">${escHtml(e.baslik)}</button>`).join("")}
      </div>
    </div>`;

  const dosyaAdi = active ? active.baslik : "Sınav Kağıdı";
  const content = active ? renderKagitDetay(active) : `<div class="card small" style="text-align:center;padding:30px 20px;">Henüz sınav kağıdı oluşturulmadı. "Sınav Kağıdı Hazırla" ile oluşturup soru havuzundan sorularınızı seçebilirsiniz.</div>`;

  return `
  <div class="card no-print">
    <div class="row">
      <button class="btn primary" onclick="addKagit('${classId}','${courseId}')">Sınav Kağıdı Hazırla</button>
      ${active ? `<button class="btn danger" onclick="deleteKagit('${active.id}')">Bu Kağıdı Sil</button>` : ""}
    </div>
    ${active ? belgeAracCubugu(dosyaAdi) : ""}
  </div>
  ${listHtml}
  ${content}`;
}
function viewSinavHavuzu() {
  const siniflar = sinavSiniflari();
  if (activeSinavSinifId && !siniflar.some(c => c.id === activeSinavSinifId)) { activeSinavSinifId = null; activeSinavCourseId = null; }

  const ustBar = `
  <div class="card no-print">
    <h2>Sınav Havuzu</h2>
    <p class="small">Önce sınıf, sonra ders seçin — o ders için soru havuzunuzu oluşturup istediğiniz sorularla sınav kağıdı hazırlayabilirsiniz.</p>
  </div>`;

  const sinifBar = `
  <div class="card no-print">
    <div class="small" style="margin-bottom:6px;font-weight:600;">1) Sınıf</div>
    <div class="row" style="flex-wrap:wrap;">
      ${siniflar.length ? siniflar.map(c => `<button class="btn ${c.id === activeSinavSinifId ? 'primary' : ''}" onclick="selectSinavSinif('${c.id}')">${escHtml(c.name)}</button>`).join("")
        : '<span class="small">Henüz tanımlı sınıf yok — Ders Programı &gt; Sınıflar bölümünden sınıf ekleyebilirsiniz.</span>'}
    </div>
  </div>`;

  if (!activeSinavSinifId) return ustBar + sinifBar;

  const cls = classById(activeSinavSinifId);
  const dersler = cls ? coursesForClass(cls) : [];
  if (activeSinavCourseId && !dersler.some(c => c.id === activeSinavCourseId)) activeSinavCourseId = null;

  const dersBar = `
  <div class="card no-print">
    <div class="small" style="margin-bottom:6px;font-weight:600;">2) Ders — ${escHtml(cls ? cls.name : '')}</div>
    <div class="row" style="flex-wrap:wrap;">
      ${dersler.length ? dersler.map(c => `<button class="btn ${c.id === activeSinavCourseId ? 'primary' : ''}" onclick="selectSinavCourse('${c.id}')">${escHtml(c.name)}</button>`).join("")
        : '<span class="small">Bu sınıf için tanımlı ders yok — Ders Programı &gt; Ders Havuzu bölümünden ders ekleyebilirsiniz.</span>'}
    </div>
  </div>`;

  if (!activeSinavCourseId) return ustBar + sinifBar + dersBar;

  const tabBar = `
  <div class="row no-print" style="flex-wrap:wrap;">
    <button class="btn ${activeSinavTab === 'havuz' ? 'primary' : ''}" onclick="setSinavTab('havuz')">Soru Havuzu</button>
    <button class="btn ${activeSinavTab === 'kagitlar' ? 'primary' : ''}" onclick="setSinavTab('kagitlar')">Sınav Kağıtları</button>
  </div>`;

  const govde = activeSinavTab === "kagitlar" ? viewKagitlarBolum(activeSinavSinifId, activeSinavCourseId) : viewSoruHavuzuBolum(activeSinavSinifId, activeSinavCourseId);

  return ustBar + sinifBar + dersBar + tabBar + govde;
}

/* ---- Ana Sayfa ---- */
function systemHealthSummary() {
  const q = scheduleQualityScore();
  const hasSchedule = Object.keys(S.schedule).length > 0;
  let status, color, bg, text;
  if (!hasSchedule) {
    status = "Henüz Dağıtılmadı"; color = "var(--ink-soft)"; bg = "var(--panel-2)";
    text = "Ders Programı → Ders Dağıtım'dan \"Programı Yenile\"ye basarak ilk dağıtımı oluşturun.";
  } else if (q.unplaced > 0) {
    status = "Sorunlu"; color = "var(--warn)"; bg = "var(--warn-bg)";
    text = `${q.unplaced} saatlik ders/işletme henüz yerleştirilemedi. Ders Dağıtım ekranından "Programı Yenile"yi tekrar deneyin ya da uyarıları kontrol edin.`;
  } else if (q.gaps > 0 || q.spread > 3) {
    status = "Dikkat Gerekiyor"; color = "var(--accent-ink)"; bg = "var(--accent-bg)";
    text = `Her ders yerleşti ama ${q.gaps > 0 ? `${q.gaps} saatlik boşluk var` : ''}${q.gaps > 0 && q.spread > 3 ? ' ve ' : ''}${q.spread > 3 ? `öğretmenler arası saat farkı ${q.spread} saat (hedef: 3)` : ''}. "Programı Yenile"yi tekrar çalıştırmak farklı bir kombinasyon bulabilir.`;
  } else {
    status = "Mükemmel"; color = "var(--teal-ink)"; bg = "var(--teal-bg)";
    text = "Tüm dersler yerleşti, boşluk yok, öğretmenler arası saat dengesi hedef içinde (en fazla 3 saat fark).";
  }
  return `
  <div class="card" style="background:${bg};border-color:${color};">
    <h2 style="color:${color};margin-bottom:6px;">Genel Sağlık Skoru: ${status}</h2>
    <p class="small" style="margin-bottom:8px;">${text}</p>
    ${hasSchedule ? `<div class="row small" style="max-width:600px;flex-wrap:wrap;gap:14px;display:flex;">
      <span>Yerleştirilemeyen: <b>${q.unplaced} saat</b></span>
      <span>Boşluk: <b>${q.gaps} saat</b></span>
      <span>Öğretmen saat farkı: <b>${q.spread} saat</b> (hedef ≤3)</span>
    </div>` : ``}
  </div>`;
}

function viewAna() {
  return `
  <div class="hero-card">
    <h2>Alan Yönetim Sistemi</h2>
    <p class="small">Soma Mesleki ve Teknik Anadolu Lisesi · Makine Teknolojisi Alanı</p>
    <button class="btn primary" style="margin-top:14px;" onclick="setModule('ders-programi')">Ders Programına Git</button>
  </div>`;
}
function openSavedProgramsModal() {
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:520px;">
        ${renderSavedProgramsCard()}
        <div class="row"><button class="btn" onclick="closeModal()">Kapat</button></div>
      </div>
    </div>`;
}

/* ---- Ders Havuzu ---- */
function viewHavuz() {
  const rows = S.courses.filter(c => c.id !== KOORD_COURSE_ID).map(c => `
    <tr>
      <td>${c.code}</td>
      <td>${c.name}</td>
      <td>${DAL_LABELS[c.dal] || c.dal}</td>
      <td>${c.grade}</td>
      <td>${c.hours}</td>
      <td>${(c.blocks || []).join("+")}</td>
      <td class="no-print"><div class="row" style="margin:0;"><button class="btn" onclick="editCourse('${c.id}')">Düzenle</button><button class="btn danger" onclick="deleteCourse('${c.id}')">Sil</button></div></td>
    </tr>`).join("");
  return `
  <div class="card no-print">
    <h2>Ders Havuzu</h2>
    <p class="small">Çerçeve öğretim programından alınan dersler. Yeni ders ekleyebilir veya düzenleyebilirsiniz.</p>
    ${belgeAracCubugu("Ders Havuzu")}
  </div>
  <div class="print-area">
    ${belgeYazdirmaBasligi("Ders Havuzu")}
    <div class="card">
      <table><tr><th>Kod</th><th>Ders Adı</th><th>Dal</th><th>Sınıf</th><th>Haftalık Saat</th><th>Bloklar</th><th class="no-print"></th></tr>${rows}</table>
    </div>
  </div>
  <div class="card no-print">
    <h2>Yeni Ders Ekle</h2>
    <div class="grid3">
      <div><label class="small">Kod</label><input type="text" id="nc-code" style="width:100%"></div>
      <div><label class="small">Ders Adı</label><input type="text" id="nc-name" style="width:100%"></div>
      <div><label class="small">Dal</label>
        <select id="nc-dal" style="width:100%">
          <option value="ORTAK9">9. Sınıf Ortak</option>
          <option value="MBO">Makine Bakım Onarım</option>
          <option value="BMI">Bilgisayarlı Makine İmalatı</option>
          <option value="SERT">Sertifika / Seçmeli</option>
          <option value="HERDAL">Tüm Dallar</option>
        </select>
      </div>
      <div><label class="small">Sınıf Seviyesi</label>
        <select id="nc-grade" style="width:100%"><option>9</option><option>10</option><option selected>11</option><option>12</option></select>
      </div>
      <div><label class="small">Haftalık Saat</label><input type="number" id="nc-hours" value="2" style="width:100%"></div>
      <div><label class="small">Bloklar (örn. 3,3)</label><input type="text" id="nc-blocks" placeholder="örn: 3,3" style="width:100%"></div>
    </div>
    <div class="row" style="max-width:200px"><button class="btn primary" onclick="addCourse()">Ekle</button></div>
  </div>`;
}
function addCourse() {
  const code = document.getElementById("nc-code").value.trim();
  const name = document.getElementById("nc-name").value.trim();
  const dal = document.getElementById("nc-dal").value;
  const grade = parseInt(document.getElementById("nc-grade").value);
  const hours = parseInt(document.getElementById("nc-hours").value) || 1;
  const blocksRaw = document.getElementById("nc-blocks").value.trim();
  const blocks = blocksRaw ? blocksRaw.split(",").map(x => parseInt(x.trim())).filter(x => x > 0) : [hours];
  if (!name) { alert("Ders adı girin."); return; }
  S.courses.push({ id: uid("c"), code: code || name.slice(0, 3).toUpperCase(), name, dal, grade, hours, blocks });
  save(); renderMain();
}
function deleteCourse(id) {
  if (!confirm("Bu dersi ders havuzundan silmek istiyor musunuz? (Sınıflara yapılmış atamalar da etkilenir)")) return;
  S.courses = S.courses.filter(c => c.id !== id);
  S.classes.forEach(cl => { cl.assignments = cl.assignments.filter(a => a.courseId !== id); });
  save(); renderMain();
}
function editCourse(id) {
  const c = courseById(id);
  if (!c) return;
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:420px;">
        <h3>Dersi Düzenle</h3>
        <label class="small">Kod</label><input type="text" id="ec-code" value="${escHtml(c.code)}" style="width:100%">
        <label class="small">Ders Adı</label><input type="text" id="ec-name" value="${escHtml(c.name)}" style="width:100%">
        <label class="small">Dal</label>
        <select id="ec-dal" style="width:100%">
          <option value="ORTAK9" ${c.dal === 'ORTAK9' ? 'selected' : ''}>9. Sınıf Ortak</option>
          <option value="MBO" ${c.dal === 'MBO' ? 'selected' : ''}>Makine Bakım Onarım</option>
          <option value="BMI" ${c.dal === 'BMI' ? 'selected' : ''}>Bilgisayarlı Makine İmalatı</option>
          <option value="SERT" ${c.dal === 'SERT' ? 'selected' : ''}>Sertifika / Seçmeli</option>
          <option value="HERDAL" ${c.dal === 'HERDAL' ? 'selected' : ''}>Tüm Dallar</option>
        </select>
        <label class="small">Sınıf Seviyesi</label>
        <select id="ec-grade" style="width:100%">${[9,10,11,12].map(g => `<option ${c.grade === g ? 'selected' : ''}>${g}</option>`).join("")}</select>
        <label class="small">Haftalık Saat</label><input type="number" id="ec-hours" value="${c.hours}" style="width:100%">
        <label class="small">Bloklar (örn. 3,3)</label><input type="text" id="ec-blocks" value="${(c.blocks || []).join(",")}" style="width:100%">
        <div class="row">
          <button class="btn primary" onclick="saveCourseEdit('${id}')">Kaydet</button>
          <button class="btn" onclick="closeModal()">İptal</button>
        </div>
      </div>
    </div>`;
}
function saveCourseEdit(id) {
  const c = courseById(id);
  if (!c) return;
  const name = document.getElementById("ec-name").value.trim();
  if (!name) { alert("Ders adı girin."); return; }
  c.code = document.getElementById("ec-code").value.trim() || name.slice(0, 3).toUpperCase();
  c.name = name;
  c.dal = document.getElementById("ec-dal").value;
  c.grade = parseInt(document.getElementById("ec-grade").value);
  c.hours = parseInt(document.getElementById("ec-hours").value) || 1;
  const blocksRaw = document.getElementById("ec-blocks").value.trim();
  c.blocks = blocksRaw ? blocksRaw.split(",").map(x => parseInt(x.trim())).filter(x => x > 0) : [c.hours];
  save(); closeModal(); renderMain();
}

/* ---- Öğretmenler ---- */
function teacherTitleLabel(teacherId) {
  const idari = classById("cl-idari");
  if (!idari) return "Öğretmen";
  const a = idari.assignments.find(x => (x.eligibleTeacherIds || []).includes(teacherId));
  if (!a) return "Öğretmen";
  const course = courseById(a.courseId);
  if (!course) return "Öğretmen";
  if (course.id === "pbo-10") return "Alan Şefi";
  if (course.id === "pbo-6") return "Atölye Şefi";
  return "Öğretmen";
}
function viewOgretmen() {
  const rows = S.teachers.map(t => {
    const hrs = teacherTotalHours(t.id);
    const dersSaat = hrs - teacherCoordHours(t.id);
    const target = (typeof t.hoursTarget === "number") ? t.hoursTarget : "";
    const mode = t.hoursMode || "min";
    const coordEligible = t.coordEligible !== false;
    const title = teacherTitleLabel(t.id);
    return `<tr>
      <td>${t.name} ${title !== 'Öğretmen' ? `<span class="pill info">${title}</span>` : ''}</td>
      <td>${dersSaat}</td>
      <td><input type="number" min="0" placeholder="—" value="${target}" style="width:70px" onchange="setTeacherHoursTarget('${t.id}',this.value)"></td>
      <td><select onchange="setTeacherHoursMode('${t.id}',this.value)">
            <option value="min" ${mode === 'min' ? 'selected' : ''}>En az (asgari)</option>
            <option value="exact" ${mode === 'exact' ? 'selected' : ''}>Tam bu kadar (sabit)</option>
          </select></td>
      <td style="text-align:center;"><input type="checkbox" ${coordEligible ? 'checked' : ''} onchange="setTeacherCoordEligible('${t.id}', this.checked)"></td>
      <td class="no-print"><div class="row" style="margin:0;"><button class="btn" onclick="editTeacher('${t.id}')">Düzenle</button><button class="btn danger" onclick="deleteTeacher('${t.id}')">Sil</button></div></td>
    </tr>`;
  }).join("");

  return `
  <div class="card no-print">
    <h2>Öğretmenler</h2>
    <p class="small">Buraya girdiğiniz saat <b>sadece ders (öğretim) saatidir</b> — koordinatörlük buna dahil değildir, "Programı Yenile" çalıştığınızda koordinatörlük saatleri bunun <b>üzerine ayrıca</b> eklenir (ör. 30 saat ders hedefi + 8 saat koordinatörlük = 38 saat genel toplam). "Koordinatörlük Alsın" kutusunu işaretlerseniz o öğretmen otomatik koordinatörlük dağıtımına dahil olur; hiç koordinatörlük almaması gerekenler için bu kutuyu boş bırakın. Belirli bir saati boşta bırakmak için <b>Programlar → Öğretmen Programı</b> ekranından ilgili hücreye tıklayıp "İzinli Yap" seçeneğini kullanın.</p>
    <div class="row" style="max-width:400px">
      <input type="text" id="new-teacher" placeholder="Yeni öğretmen adı">
      <button class="btn primary" onclick="addTeacher()">Ekle</button>
    </div>
    ${belgeAracCubugu("Öğretmenler")}
  </div>
  <div class="print-area">
    ${belgeYazdirmaBasligi("Öğretmenler")}
    <div class="card">
      <table><tr><th>Ad Soyad</th><th>Ders Saati</th><th>Saat Hedefi</th><th>Tür</th><th>Koordinatörlük Alsın</th><th class="no-print"></th></tr>${rows}</table>
    </div>
  </div>`;
}
function setActiveOffTeacher(id) { activeOffTeacherId = id; selectedTeacherCells.clear(); renderMain(); }
function setTeacherHoursTarget(teacherId, value) {
  const t = teacherById(teacherId);
  if (value === "") { t.hoursTarget = null; }
  else { t.hoursTarget = Math.max(0, parseInt(value) || 0); }
  save(); renderMain();
}
function setTeacherHoursMode(teacherId, mode) {
  const t = teacherById(teacherId);
  t.hoursMode = mode;
  save(); renderMain();
}
function setTeacherCoordEligible(teacherId, checked) {
  const t = teacherById(teacherId);
  t.coordEligible = !!checked;
  save(); renderMain();
}
function setTeacherTimeOff(teacherId, day, value) {
  const t = teacherById(teacherId);
  if (!t.timeOff) t.timeOff = {};
  t.timeOff[day] = value;
  save(); renderMain();
}

function findTeacherCell(teacherId, day, hour) {
  for (const key in S.schedule) {
    const cell = S.schedule[key];
    if (cell.day === day && cell.hour === hour && cell.teacherIds.includes(teacherId)) return cell;
  }
  return null;
}

function openOffCellModal(teacherId, day, hour) {
  const t = teacherById(teacherId);
  const cell = findTeacherCell(teacherId, day, hour);
  const dayOff = isTeacherOffAt(teacherId, day, hour);
  const hourBlocked = S.teacherBlockedSlots[teacherBlockKey(teacherId, day, hour)];
  const root = document.getElementById("modal-root");

  if (cell && cell.courseId === KOORD_COURSE_ID) {
    root.innerHTML = `
      <div class="modal-bg" onclick="if(event.target===this) closeModal()">
        <div class="modal">
          <h3>${t.name} · ${DAYS[day]} · ${hour + 1}. saat</h3>
          <p class="small">Bu gün <b>Koordinatörlük</b> günü (${cell.isletme || 'işletme belirlenmedi'}). Değiştirmek için <b>Koordinatörlük</b> sekmesini kullanın.</p>
          <div class="row"><button class="btn" onclick="closeModal()">Kapat</button></div>
        </div>
      </div>`;
    return;
  }
  if (cell) {
    const course = courseById(cell.courseId);
    const cls = classById(cell.classId);
    root.innerHTML = `
      <div class="modal-bg" onclick="if(event.target===this) closeModal()">
        <div class="modal">
          <h3>${t.name} · ${DAYS[day]} · ${hour + 1}. saat</h3>
          <p class="small">Bu saatte <b>${course ? course.name : '?'}</b> dersi var (${cls ? cls.name : '?'}). İzin işaretlemek için önce Programlar ekranından bu dersi kaldırın.</p>
          <div class="row"><button class="btn" onclick="closeModal()">Kapat</button></div>
        </div>
      </div>`;
    return;
  }
  if (dayOff) {
    root.innerHTML = `
      <div class="modal-bg" onclick="if(event.target===this) closeModal()">
        <div class="modal">
          <h3>${t.name} · ${DAYS[day]} · ${hour + 1}. saat</h3>
          <p class="small">Bu saat, gün bazlı izin ayarı (Sabah/Öğleden sonra/Tüm gün) nedeniyle kapalı. Değiştirmek için soldaki gün butonlarını kullanın.</p>
          <div class="row"><button class="btn" onclick="closeModal()">Kapat</button></div>
        </div>
      </div>`;
    return;
  }
  if (hourBlocked) {
    root.innerHTML = `
      <div class="modal-bg" onclick="if(event.target===this) closeModal()">
        <div class="modal">
          <h3>${t.name} · ${DAYS[day]} · ${hour + 1}. saat</h3>
          <p class="small">Bu saat şu anda <b>izinli</b> olarak işaretli.</p>
          <div class="row"><button class="btn primary" onclick="teacherUnblockSlot('${teacherId}',${day},${hour})">Müsait Yap</button></div>
          <div class="row"><button class="btn" onclick="closeModal()">Kapat</button></div>
        </div>
      </div>`;
    return;
  }
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal">
        <h3>${t.name} · ${DAYS[day]} · ${hour + 1}. saat</h3>
        <p class="small">Bu saat şu anda müsait.</p>
        <div class="row"><button class="btn primary" onclick="teacherBlockSlot('${teacherId}',${day},${hour})">İzinli Yap</button></div>
        <div class="row"><button class="btn" onclick="closeModal()">Kapat</button></div>
      </div>
    </div>`;
}

function openOffBulkModal(teacherId) {
  const t = teacherById(teacherId);
  const cells = selectedDayHours();
  const available = cells.filter(({ day, hour }) => !findTeacherCell(teacherId, day, hour) && !isTeacherOffAt(teacherId, day, hour) && !S.teacherBlockedSlots[teacherBlockKey(teacherId, day, hour)]);
  const hourOff = cells.filter(({ day, hour }) => !!S.teacherBlockedSlots[teacherBlockKey(teacherId, day, hour)]);
  const filled = cells.filter(({ day, hour }) => !!findTeacherCell(teacherId, day, hour));
  const dayOff = cells.filter(({ day, hour }) => isTeacherOffAt(teacherId, day, hour) && !S.teacherBlockedSlots[teacherBlockKey(teacherId, day, hour)]);
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal">
        <h3>${t.name} · ${cells.length} saat seçili</h3>
        <p class="small">Müsait: ${available.length} · İzinli (saat bazlı): ${hourOff.length} · İzinli (gün bazlı): ${dayOff.length} · Ders var: ${filled.length}</p>
        ${available.length > 0 ? `<div class="row"><button class="btn primary" onclick="bulkBlockEmpty('${teacherId}'); closeModal();">Seçilenleri İzinli Yap (${available.length})</button></div>` : ``}
        ${hourOff.length > 0 ? `<div class="row"><button class="btn" onclick="bulkUnblock('${teacherId}'); closeModal();">Seçilenleri Müsait Yap (${hourOff.length})</button></div>` : ``}
        <div class="row"><button class="btn" onclick="closeModal()">Kapat (seçim kalsın)</button></div>
      </div>
    </div>`;
}
function addTeacher() {
  const name = document.getElementById("new-teacher").value.trim();
  if (!name) return;
  S.teachers.push({ id: uid("t"), name, timeOff: {} });
  save(); renderMain();
}
function editTeacher(id) {
  const t = S.teachers.find(x => x.id === id);
  if (!t) return;
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:360px;">
        <h3>Öğretmeni Düzenle</h3>
        <label class="small">Ad Soyad</label><input type="text" id="et-name" value="${escHtml(t.name)}" style="width:100%">
        <div class="row">
          <button class="btn primary" onclick="saveTeacherEdit('${id}')">Kaydet</button>
          <button class="btn" onclick="closeModal()">İptal</button>
        </div>
      </div>
    </div>`;
}
function saveTeacherEdit(id) {
  const t = S.teachers.find(x => x.id === id);
  if (!t) return;
  const name = document.getElementById("et-name").value.trim();
  if (!name) { alert("Ad soyad girin."); return; }
  t.name = name;
  save(); closeModal(); renderMain();
}
function deleteTeacher(id) {
  if (!confirm("Bu öğretmeni silmek istiyor musunuz?")) return;
  S.teachers = S.teachers.filter(t => t.id !== id);
  S.classes.forEach(cl => cl.assignments.forEach(a => { if (a.eligibleTeacherIds) a.eligibleTeacherIds = a.eligibleTeacherIds.filter(x => x !== id); }));
  Object.keys(S.schedule).forEach(k => { S.schedule[k].teacherIds = S.schedule[k].teacherIds.filter(x => x !== id); });
  save(); renderMain();
}

/* ---- Sınıflar ve Ders Atama ---- */
function viewSinif() {
  const listHtml = S.classes.filter(c => !c.id.startsWith("isletme-")).map(c => `
    <div class="list-item ${c.id === activeClassId ? 'active' : ''}" onclick="setActiveClass('${c.id}')">
      <span>${c.name} <span class="small">(${DAL_LABELS[c.dal] || c.dal})</span> ${c.excludeFromDistribution ? '<span class="pill warn">Dahil değil</span>' : ''}</span>
    </div>`).join("");

  const cls = classById(activeClassId);
  let detail = `<p class="small">Soldan bir sınıf seçin.</p>`;
  if (cls) {
    const available = coursesForClass(cls).filter(c => !cls.assignments.some(a => a.courseId === c.id));
    const availRows = available.map(c => `
      <div class="chk-row">
        <span style="flex:1">${c.name} <span class="small">(${c.hours} sa)</span></span>
        <button class="btn" onclick="addAssignment('${cls.id}','${c.id}')">Ekle</button>
      </div>`).join("") || `<p class="small">Eklenebilecek başka ders yok.</p>`;

    const assignedRows = cls.assignments.map(a => {
      const course = courseById(a.courseId);
      if (!course) return "";
      const allTeacherIds = S.teachers.map(t => t.id);
      const isRestricted = (a.eligibleTeacherIds || []).length < allTeacherIds.length;
      const teacherChecks = S.teachers.map(t => `
        <label style="margin-right:10px;font-size:12px;">
          <input type="checkbox" ${(a.eligibleTeacherIds || []).includes(t.id) ? 'checked' : ''} onchange="toggleEligibleTeacher('${cls.id}','${a.id}','${t.id}')"> ${t.name}
        </label>`).join("");
      const locked = isAssignmentLocked(cls.id, a.id);
      const placement = assignmentPlacementSummary(cls.id, a.id);
      return `
        <div class="card" style="padding:10px 14px;margin-bottom:8px;${locked ? 'border-color:var(--teal);background:var(--teal-bg);' : ''}">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
            <span><strong>${course.name}</strong> <span class="small">— ${course.hours} saat/hafta · bloklar: ${(course.blocks || []).join("+")}</span></span>
            <div style="display:flex;align-items:center;gap:8px;">
              <label class="small">Öğretmen sayısı:</label>
              <input type="number" min="1" max="6" value="${a.teacherCount || 1}" style="width:60px" onchange="setAssignmentTeacherCount('${cls.id}','${a.id}',this.value)" ${locked ? 'disabled' : ''}>
              <button class="btn danger" onclick="removeAssignment('${cls.id}','${a.id}')">Kaldır</button>
            </div>
          </div>
          <div class="small" style="margin-top:6px;">
            <b>Yerleşim:</b> ${placement}
            ${locked
              ? `<span class="pill ok">Kilitli</span> <button class="btn" style="padding:3px 8px;font-size:11px;" onclick="unlockAssignment('${cls.id}','${a.id}')">Kilidi Kaldır</button>`
              : `<button class="btn" style="padding:3px 8px;font-size:11px;" onclick="lockAssignment('${cls.id}','${a.id}')" ${placement === 'Henüz dağıtılmadı' ? 'disabled' : ''}>Bu dersi burada kilitle</button>`}
          </div>
          <details style="margin-top:8px;" ${isRestricted ? 'open' : ''}>
            <summary class="small" style="cursor:pointer;color:var(--ink-soft);">Bu derse özel öğretmen kilitle (opsiyonel — açmazsanız herkes girebilir) ${isRestricted ? '<span class="pill info">Kısıtlı</span>' : ''}</summary>
            <div style="margin-top:6px;">
              <button class="btn" style="padding:4px 9px;font-size:11.5px;" onclick="setAllEligible('${cls.id}','${a.id}',true)">Herkese Aç</button>
              <button class="btn" style="padding:4px 9px;font-size:11.5px;" onclick="setAllEligible('${cls.id}','${a.id}',false)">Hepsini Kaldır (tek tek seç)</button>
              <div style="margin-top:6px;">${teacherChecks}</div>
            </div>
          </details>
        </div>`;
    }).join("");

    const totalHours = cls.assignments.reduce((s, a) => { const c = courseById(a.courseId); return s + (c ? c.hours : 0); }, 0);
    const dagitilmis = Object.values(S.schedule).filter(x => x.classId === cls.id).length;
    const schoolDays = cls.schoolDays || [0, 1, 2, 3, 4];
    const dayChecks = DAYS.map((d, i) => `
      <label style="margin-right:10px;font-size:12.5px;">
        <input type="checkbox" ${schoolDays.includes(i) ? 'checked' : ''} onchange="toggleSchoolDay('${cls.id}',${i})"> ${d}
      </label>`).join("");
    const isIdari = cls.id === "cl-idari";

    detail = `
      <div style="display:flex;gap:16px;margin-bottom:14px;align-items:center;flex-wrap:wrap;">
        <span class="pill info">Toplam: ${totalHours} sa</span>
        <span class="pill ${dagitilmis === totalHours && totalHours > 0 ? 'ok' : 'warn'}">Dağıtılmış: ${dagitilmis} sa</span>
        <label class="small" style="display:flex;align-items:center;gap:5px;">
          <input type="checkbox" ${cls.excludeFromDistribution ? 'checked' : ''} onchange="toggleClassExclude('${cls.id}')">
          Bu sınıfı programa dahil etme (Programı Yenile bu sınıfa dokunmasın, olduğu gibi kalsın)
        </label>
      </div>
      ${isIdari ? '' : `
      <div class="card" style="background:var(--accent-bg);border-color:var(--accent);padding:12px 14px;margin-bottom:16px;">
        <strong style="color:var(--accent-ink);">Bu sınıfın derslerine kaç öğretmen birden girebilir?</strong>
        <p class="small">Herkes her derse girebilir; sistem dağıtım sırasında bu sayıya kadar (uygunsa tam sayı, değilse müsait olduğu kadarı) öğretmen atar. Bu sınıfın <b>tüm derslerine</b> uygulanır.</p>
        <input type="number" min="1" max="6" value="${cls.maxTeachersPerCourse || 1}" style="width:80px" onchange="applyClassTeacherRule('${cls.id}',this.value)">
      </div>`}
      ${cls.grade === 12 ? `
      <div class="card" style="background:var(--teal-bg);border-color:var(--teal);padding:12px 14px;margin-bottom:16px;">
        <strong style="color:var(--teal-ink);">Bu sınıf okula hangi gün(ler) geliyor?</strong>
        <p class="small">İşletmede mesleki eğitime giden (staj) sınıflar için sadece okula geldikleri günler işaretlenmeli — dağıtım motoru derslerini sadece bu günlere yerleştirir. Okula her gün gelen sınıflar için hepsini işaretli bırakın.</p>
        <div>${dayChecks}</div>
      </div>` : ``}
      <h2>${cls.name} — Atanmış Dersler</h2>
      ${assignedRows || '<p class="small">Henüz ders atanmadı.</p>'}
      <h2 style="margin-top:20px;">Ders Havuzundan Ekle</h2>
      ${availRows}
    `;
  }

  const printRows = cls ? cls.assignments.map(a => {
    const course = courseById(a.courseId);
    if (!course) return "";
    const teacherNames = (a.eligibleTeacherIds || []).map(id => { const t = S.teachers.find(x => x.id === id); return t ? t.name : ""; }).filter(Boolean).join(", ") || "—";
    return `<tr><td>${escHtml(course.name)}</td><td>${course.hours}</td><td>${escHtml(teacherNames)}</td><td>${escHtml(assignmentPlacementSummary(cls.id, a.id))}</td></tr>`;
  }).join("") : "";

  return `
  <div class="two-col no-print">
    <div class="card">
      <h2>Sınıflar</h2>
      ${listHtml}
      <div class="row">
        <input type="text" id="new-class-name" placeholder="Sınıf adı (örn. 10-A)" style="width:100%">
      </div>
      <div class="row">
        <select id="new-class-grade" style="width:100%"><option>9</option><option>10</option><option>11</option><option>12</option></select>
        <select id="new-class-dal" style="width:100%">
          <option value="MBO">Makine Bakım Onarım</option>
          <option value="BMI">Bilgisayarlı Makine İmalatı</option>
        </select>
      </div>
      <div class="row"><button class="btn primary" onclick="addClass()">Sınıf Ekle</button></div>
      ${cls ? `<div class="row"><button class="btn" onclick="editClass('${cls.id}')">Seçili Sınıfı Düzenle</button><button class="btn danger" onclick="deleteClass('${cls.id}')">Seçili Sınıfı Sil</button></div>` : ""}
    </div>
    <div class="card">${detail}</div>
  </div>
  <div class="card no-print">${belgeAracCubugu(cls ? "Sınıflar ve Ders Atama - " + cls.name : "Sınıflar ve Ders Atama")}</div>
  <div class="print-area">
    ${belgeYazdirmaBasligi(cls ? "Sınıflar ve Ders Atama · " + cls.name : "Sınıflar ve Ders Atama")}
    ${cls ? `<div class="card"><table><tr><th>Ders</th><th>Haftalık Saat</th><th>Öğretmen(ler)</th><th>Yerleşim</th></tr>${printRows}</table></div>` : `<p class="small">Soldan bir sınıf seçin.</p>`}
  </div>`;
}
function setActiveClass(id) { activeClassId = id; renderMain(); }
function toggleClassExclude(classId) {
  const cls = classById(classId);
  cls.excludeFromDistribution = !cls.excludeFromDistribution;
  save(); renderMain();
}
function applyClassTeacherRule(classId, count) {
  const cls = classById(classId);
  const n = Math.max(1, parseInt(count) || 1);
  cls.maxTeachersPerCourse = n;
  const allTeacherIds = S.teachers.map(t => t.id);
  cls.assignments.forEach(a => {
    a.eligibleTeacherIds = allTeacherIds.slice();
    a.teacherCount = n;
  });
  save(); renderMain();
}
function setAssignmentTeacherCount(classId, assignmentId, value) {
  const cls = classById(classId);
  const a = cls.assignments.find(x => x.id === assignmentId);
  a.teacherCount = Math.max(1, parseInt(value) || 1);
  if (!a.eligibleTeacherIds || a.eligibleTeacherIds.length === 0) {
    a.eligibleTeacherIds = S.teachers.map(t => t.id);
  }
  save(); renderMain();
}
function lockAssignment(classId, assignmentId) {
  Object.values(S.schedule).forEach(cell => {
    if (cell.classId === classId && cell.assignmentId === assignmentId) cell.locked = true;
  });
  save(); renderMain();
}
function unlockAssignment(classId, assignmentId) {
  Object.values(S.schedule).forEach(cell => {
    if (cell.classId === classId && cell.assignmentId === assignmentId) cell.locked = false;
  });
  save(); renderMain();
}
function isAssignmentLocked(classId, assignmentId) {
  const cells = Object.values(S.schedule).filter(c => c.classId === classId && c.assignmentId === assignmentId);
  return cells.length > 0 && cells.every(c => c.locked);
}
function assignmentPlacementSummary(classId, assignmentId) {
  const cells = Object.values(S.schedule).filter(c => c.classId === classId && c.assignmentId === assignmentId);
  if (cells.length === 0) return "Henüz dağıtılmadı";
  const byDay = {};
  cells.forEach(c => { if (!byDay[c.day]) byDay[c.day] = []; byDay[c.day].push(c.hour + 1); });
  return Object.keys(byDay).map(d => {
    const hrs = byDay[d].sort((a, b) => a - b);
    return DAYS[d] + " " + hrs.join("-") + ". saat";
  }).join(", ");
}

function toggleSchoolDay(classId, day) {
  const cls = classById(classId);
  if (!cls.schoolDays) cls.schoolDays = [0, 1, 2, 3, 4];
  if (cls.schoolDays.includes(day)) cls.schoolDays = cls.schoolDays.filter(d => d !== day);
  else { cls.schoolDays.push(day); cls.schoolDays.sort(); }
  save(); renderMain();
}
function addClass() {
  const name = document.getElementById("new-class-name").value.trim();
  const grade = parseInt(document.getElementById("new-class-grade").value);
  const dal = document.getElementById("new-class-dal").value;
  if (!name) { alert("Sınıf adı girin."); return; }
  const id = uid("cl");
  S.classes.push({ id, name, grade, dal, assignments: [] });
  activeClassId = id;
  save(); renderMain();
}
function deleteClass(id) {
  if (!confirm("Bu sınıfı silmek istiyor musunuz?")) return;
  S.classes = S.classes.filter(c => c.id !== id);
  clearClassSchedule(id);
  activeClassId = S.classes[0] ? S.classes[0].id : null;
  save(); renderMain();
}
function editClass(id) {
  const cls = classById(id);
  if (!cls) return;
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:360px;">
        <h3>Sınıfı Düzenle</h3>
        <label class="small">Sınıf Adı</label><input type="text" id="ecl-name" value="${escHtml(cls.name)}" style="width:100%">
        <label class="small">Sınıf Seviyesi</label>
        <select id="ecl-grade" style="width:100%">${[9,10,11,12].map(g => `<option ${cls.grade === g ? 'selected' : ''}>${g}</option>`).join("")}</select>
        <label class="small">Dal</label>
        <select id="ecl-dal" style="width:100%">
          <option value="MBO" ${cls.dal === 'MBO' ? 'selected' : ''}>Makine Bakım Onarım</option>
          <option value="BMI" ${cls.dal === 'BMI' ? 'selected' : ''}>Bilgisayarlı Makine İmalatı</option>
        </select>
        <div class="row">
          <button class="btn primary" onclick="saveClassEdit('${id}')">Kaydet</button>
          <button class="btn" onclick="closeModal()">İptal</button>
        </div>
      </div>
    </div>`;
}
function saveClassEdit(id) {
  const cls = classById(id);
  if (!cls) return;
  const name = document.getElementById("ecl-name").value.trim();
  if (!name) { alert("Sınıf adı girin."); return; }
  cls.name = name;
  cls.grade = parseInt(document.getElementById("ecl-grade").value);
  cls.dal = document.getElementById("ecl-dal").value;
  save(); closeModal(); renderMain();
}
function addAssignment(classId, courseId) {
  const cls = classById(classId);
  const n = cls.maxTeachersPerCourse || 1;
  const allTeacherIds = S.teachers.map(t => t.id);
  cls.assignments.push({ id: uid("a"), courseId, eligibleTeacherIds: cls.id === "cl-idari" ? [] : allTeacherIds.slice(), teacherCount: cls.id === "cl-idari" ? 1 : n, roomIds: [] });
  save(); renderMain();
}
function removeAssignment(classId, assignmentId) {
  if (!confirm("Bu ders ataması sınıftan kaldırılsın mı? (Bu derse ait dağıtılmış saatler de silinir)")) return;
  const cls = classById(classId);
  cls.assignments = cls.assignments.filter(a => a.id !== assignmentId);
  Object.keys(S.schedule).forEach(k => { if (S.schedule[k].classId === classId && S.schedule[k].assignmentId === assignmentId) delete S.schedule[k]; });
  save(); renderMain();
}
function toggleEligibleTeacher(classId, assignmentId, teacherId) {
  const cls = classById(classId);
  const a = cls.assignments.find(x => x.id === assignmentId);
  if (!a.eligibleTeacherIds) a.eligibleTeacherIds = [];
  if (a.eligibleTeacherIds.includes(teacherId)) a.eligibleTeacherIds = a.eligibleTeacherIds.filter(x => x !== teacherId);
  else a.eligibleTeacherIds.push(teacherId);
  save(); renderMain();
}
function setAllEligible(classId, assignmentId, on) {
  const cls = classById(classId);
  const a = cls.assignments.find(x => x.id === assignmentId);
  a.eligibleTeacherIds = on ? S.teachers.map(t => t.id) : [];
  save(); renderMain();
}

/* ---- Ders Dağıtım ---- */
function assignmentStatusRows() {
  let rows = [];
  S.classes.forEach(cls => {
    cls.assignments.forEach(a => {
      const course = courseById(a.courseId);
      if (!course) return;
      const cells = Object.values(S.schedule).filter(c => c.classId === cls.id && c.assignmentId === a.id);
      const placedHours = cells.length;
      const totalHours = course.hours;
      const teamIds = cells.length ? cells[0].teacherIds : [];
      const teamNames = teamIds.map(id => { const t = teacherById(id); return t ? t.name : "?"; }).join(", ") || "—";
      const requested = a.teacherCount || 0;
      const actual = teamIds.length;
      let statusPill;
      if (placedHours === 0 && totalHours > 0) statusPill = '<span class="pill warn">Hiç yerleşmedi</span>';
      else if (placedHours < totalHours) statusPill = '<span class="pill warn">Kısmi</span>';
      else if (requested > 0 && actual < requested) statusPill = '<span class="pill warn">Eksik ekip (' + actual + '/' + requested + ')</span>';
      else statusPill = '<span class="pill ok">Tam</span>';
      rows.push(`<tr><td>${cls.name}</td><td>${course.name}</td><td>${placedHours}/${totalHours}</td><td>${teamNames}</td><td>${statusPill}</td></tr>`);
    });
  });
  return rows.join("");
}

function viewKoordinatorluk() {
  const teacherOpts = (isl) => `<option value="">— Otomatik (fark etmez) —</option>` + S.teachers.filter(t => t.coordEligible !== false).map(t => `<option value="${t.id}" ${S.isletmeTeacherAssign[isl.id] === t.id ? 'selected' : ''}>${t.name}</option>`).join("");

  function isletmeListHtml(groupKey) {
    const items = S.isletmeler.filter(i => i.groups.includes(groupKey));
    if (items.length === 0) return `<p class="small">Henüz işletme eklenmedi.</p>`;
    return items.map(isl => {
      const shared = isPscCpcShared(isl);
      return `<div class="row" style="max-width:640px;align-items:center;">
        <span style="flex:2;">${isl.name}${shared ? ' <span class="pill info">ortak (her iki grupta da var)</span>' : ''}</span>
        <span class="small" style="flex:1;">${isletmeHoursEstimate(isl)}</span>
        <button class="btn" onclick="editIsletme('${isl.id}')">Düzenle</button>
        <button class="btn danger" onclick="removeIsletmeGroup('${isl.id}','${groupKey}')">Kaldır</button>
      </div>`;
    }).join("");
  }

  const teacherAssignRows = S.isletmeler.map(isl => {
    return `<tr>
      <td>${isl.name}${isPscCpcShared(isl) ? ' <span class="pill info">ortak</span>' : ''}</td>
      <td>${isl.groups.map(g => GROUP_LABELS[g]).join(" + ")}</td>
      <td><select onchange="setIsletmeTeacher('${isl.id}', this.value)" style="width:100%">${teacherOpts(isl)}</select></td>
    </tr>`;
  }).join("") || `<tr><td colspan="3" class="small">Önce yukarıya işletme ekleyin.</td></tr>`;

  const summaryRows = S.teachers.map(t => {
    const dersSaat = teacherTotalHours(t.id) - teacherCoordHours(t.id);
    const koordSaat = teacherCoordHours(t.id);
    const genel = dersSaat + koordSaat;
    return { name: t.name, dersSaat, koordSaat, genel };
  });
  const genelToplamlar = summaryRows.map(r => r.genel);
  const maxGenel = genelToplamlar.length ? Math.max(...genelToplamlar) : 0;
  const minGenel = genelToplamlar.length ? Math.min(...genelToplamlar) : 0;
  const fark = maxGenel - minGenel;
  const summaryHtml = summaryRows.map(r => {
    const sapma = maxGenel - r.genel;
    const ok = sapma <= 3;
    return `<tr>
      <td>${r.name}</td>
      <td>${r.dersSaat}</td>
      <td>${r.koordSaat}</td>
      <td><b>${r.genel}</b></td>
      <td><span class="pill ${ok ? 'ok' : 'warn'}">${ok ? 'Dengede' : 'Fark büyük (' + sapma + ' saat)'}</span></td>
    </tr>`;
  }).join("");

  const isletmePrintRows = S.isletmeler.map(isl =>
    `<tr><td>${escHtml(isl.name)}</td><td>${isl.groups.map(g => GROUP_LABELS[g]).join(" + ")}</td><td>${isletmeHoursEstimate(isl)}</td></tr>`
  ).join("") || `<tr><td colspan="3" class="small">Henüz işletme eklenmedi.</td></tr>`;

  return `
  <div class="card no-print" style="background:var(--teal-bg);border-color:var(--teal);">
    <h2 style="color:var(--teal-ink);">Koordinatörlük / İşletme Listesi</h2>
    <p class="small">
      Buraya sadece o gün grubuna giden <b>işletme adlarını</b> yazın — hangi öğretmenin gideceğini yazmak zorunda değilsiniz, "Programı Yenile" bunu otomatik, en dengeli şekilde dağıtır.
      Bir işletme adı <b>her iki listeye de</b> yazılırsa (ör. aynı işletmeye hem Pazartesi-Salı-Çarşamba hem Çarşamba-Perşembe-Cuma grubundan öğrenci gidiyorsa), sistem bunu <b>ortak</b> işaretler ve dağıtımda otomatik olarak ya tek bir Çarşamba ziyaretiyle (8 saat, daha az yük) ya da iki ayrı ziyaretle (16 saat) — hangisi genel programı daha dengeli/boşluksuz yapıyorsa o şekilde çözer.
      <br><span class="small" style="color:var(--ink-soft);">Dayanak: Ortaöğretim Kurumları Yönetmeliği Madde 88 — bir öğretmene aynı gün için 8 saatten fazla ek ders (koordinatörlük) görevi verilmez; bu nedenle koordinatörlük günü o öğretmene ayrıca okul dersi eklenmez.</span>
    </p>
    <div class="grid3">
      <div>
        <h2>Pazartesi-Salı-Çarşamba grubu işletmeleri</h2>
        <div class="row" style="max-width:420px;">
          <input type="text" id="isl-psc-name" placeholder="İşletme adı" style="width:100%">
          <button class="btn primary" onclick="addIsletme('psc', document.getElementById('isl-psc-name').value); document.getElementById('isl-psc-name').value='';">Ekle</button>
        </div>
        ${isletmeListHtml('psc')}
      </div>
      <div>
        <h2>Çarşamba-Perşembe-Cuma grubu işletmeleri</h2>
        <div class="row" style="max-width:420px;">
          <input type="text" id="isl-cpc-name" placeholder="İşletme adı" style="width:100%">
          <button class="btn primary" onclick="addIsletme('cpc', document.getElementById('isl-cpc-name').value); document.getElementById('isl-cpc-name').value='';">Ekle</button>
        </div>
        ${isletmeListHtml('cpc')}
      </div>
      <div>
        <h2>MESEM işletmeleri</h2>
        <p class="small">MESEM öğrencileri Pazartesi, Salı, Perşembe ve Cuma günleri işletmededir; okula sadece Çarşamba günü gelirler. Koordinatör öğretmen bu 4 günden birinde ziyaret eder.</p>
        <div class="row" style="max-width:420px;">
          <input type="text" id="isl-mesem-name" placeholder="İşletme adı" style="width:100%">
          <button class="btn primary" onclick="addIsletme('mesem', document.getElementById('isl-mesem-name').value); document.getElementById('isl-mesem-name').value='';">Ekle</button>
        </div>
        ${isletmeListHtml('mesem')}
      </div>
    </div>
  </div>
  <div class="card no-print">
    <h2>Öğretmen Ata (opsiyonel)</h2>
    <p class="small">İstemezseniz boş bırakın — "Programı Yenile" sırasında sistem her işletmeye, o günlerde tam gün müsait olan ve o an en az yüklü öğretmeni otomatik atar. Sadece belirli bir işletmeye mutlaka belirli bir öğretmenin gitmesini istiyorsanız burada seçin.</p>
    <table><tr><th>İşletme</th><th>Gün Grubu</th><th>Öğretmen</th></tr>${teacherAssignRows}</table>
    ${belgeAracCubugu("Koordinatörlük")}
  </div>
  <div class="print-area">
    ${belgeYazdirmaBasligi("Koordinatörlük / İşletme Listesi")}
    <div class="card">
      <h2>İşletmeler</h2>
      <table><tr><th>İşletme</th><th>Gün Grubu</th><th>Tahmini Saat</th></tr>${isletmePrintRows}</table>
    </div>
    <div class="card">
      <h2>Saat Dengesi (Ders + Koordinatörlük)</h2>
      <p class="small">Bu tablo en son "Programı Yenile" çalıştırıldığındaki sonucu gösterir. En yüksek ile en düşük genel toplam arasındaki fark: <b>${fark} saat</b> ${fark <= 3 ? '(uygun)' : '(hedef: en fazla 3 saat)'}</p>
      <table><tr><th>Öğretmen</th><th>Ders Saati</th><th>Koordinatörlük Saati</th><th>Genel Toplam</th><th>Durum</th></tr>${summaryHtml}</table>
    </div>
  </div>`;
}

function viewDagitim() {
  const rows = S.classes.filter(c => !c.id.startsWith("isletme-")).map(c => {
    const total = c.assignments.reduce((s, a) => { const co = courseById(a.courseId); return s + (co ? co.hours : 0); }, 0);
    const placed = Object.values(S.schedule).filter(x => x.classId === c.id).length;
    return `<tr>
      <td>${c.name}</td><td>${total}</td><td>${placed}</td>
      <td><span class="pill ${placed === total && total > 0 ? 'ok' : 'warn'}">${placed === total && total > 0 ? 'Tamam' : 'Eksik'}</span></td>
      <td><button class="btn" onclick="runDistributeClass('${c.id}')">Bu Sınıfı Dağıt</button></td>
    </tr>`;
  }).join("");
  const teacherRows = S.teachers.map(t => {
    const hrs = teacherTotalHours(t.id);
    const koordH = teacherCoordHours(t.id);
    const dersH = hrs - koordH;
    const mode = t.hoursMode || "min";
    const target = t.hoursTarget;
    let ok;
    if (mode === "exact") ok = (hrs === target);
    else ok = (typeof target !== "number") || (hrs >= target);
    const modeLabel = mode === "exact" ? "tam " + target + " saat hedefi" : (typeof target === "number" ? "en az " + target + " saat" : "hedef yok");
    return `<tr><td>${t.name}</td><td>${dersH}</td><td>${koordH}</td><td><b>${hrs}</b></td><td>${modeLabel}</td><td><span class="pill ${ok ? 'ok' : 'warn'}">${ok ? 'Uygun' : 'Hedefte değil'}</span></td></tr>`;
  }).join("");
  const allHours = S.teachers.map(t => teacherTotalHours(t.id));
  const spreadNow = allHours.length ? Math.max(...allHours) - Math.min(...allHours) : 0;
  return `
  <div class="card no-print">
    <h2>Ders Dağıtım</h2>
    <p class="small">Sistem tek denemeyle yetinmiyor — onlarca farklı sıralama/kombinasyon deneyip <b>en az boşta ders bırakan, en dengeli saat dağıtan</b> sonucu seçiyor. Bu birkaç saniye sürebilir. 12. sınıflar için önce "Sınıflar ve Ders Atama" ekranından okula geldikleri günleri seçmeniz gerekir. Koordinatörlük saatleri de bu dağıtıma dahildir — bkz. <b>Koordinatörlük</b> sekmesi.</p>
    <div class="row" style="max-width:460px"><button class="btn primary" onclick="refreshProgram()">Programı Yenile (baştan farklı kombinasyonla dağıt)</button>
    <button class="btn danger" onclick="resetAll()">Tüm Dağıtımı Sıfırla</button></div>
    <div id="dagitim-sonuc"></div>
    <table style="margin-top:14px;"><tr><th>Sınıf</th><th>Toplam Saat</th><th>Dağıtılmış</th><th>Durum</th><th></th></tr>${rows}</table>
    ${belgeAracCubugu("Ders Dağıtım Durumu")}
  </div>
  <div class="print-area">
    ${belgeYazdirmaBasligi("Ders Dağıtım Durumu")}
    <div class="card">
      <h2>Her Dersin Dağıtım Durumu (hangi ders kime, kaç öğretmenle atandı)</h2>
      <table><tr><th>Sınıf</th><th>Ders</th><th>Yerleşen/Toplam Saat</th><th>Atanan Öğretmen(ler)</th><th>Durum</th></tr>${assignmentStatusRows()}</table>
    </div>
    <div class="card">
      <h2>Öğretmen Haftalık Saat Kontrolü (ders + koordinatörlük, adalet hedefi: en fazla 3 saat fark)</h2>
      <p class="small">En yüksek ile en düşük genel toplam saat arasındaki fark şu an: <b>${spreadNow} saat</b> ${spreadNow <= 3 ? '(uygun)' : '(hedefin üzerinde — "Programı Yenile" ile yeniden dengelenebilir)'}</p>
      <table><tr><th>Öğretmen</th><th>Ders Saati</th><th>Koordinatörlük Saati</th><th>Genel Toplam</th><th>Hedef</th><th>Durum</th></tr>${teacherRows}</table>
    </div>
  </div>
  <div class="card no-print">
    <h2>İsimli Bir Kopya Olarak Kaydet</h2>
    <p class="small">Örneğin dönem sonunda ya da önemli bir aşamada, o anki hâlin isimli bir kopyasını saklayın (ör. "2026-2027 Güz Dönemi"). Çalışma alanınız <b>silinmez</b>, aynı yerden çalışmaya devam edersiniz — ders havuzu, öğretmenler, koordinatörlük hep kalır. Kaydettiğiniz kopyaları Ana Sayfa'da görüp istediğiniz an açabilirsiniz.</p>
    <button class="btn primary" onclick="saveCurrentVersion()">Bu Anki Hâli Kaydet</button>
  </div>`;
}
function showWorkingOverlay(text) {
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg">
      <div class="modal" style="text-align:center;width:320px;">
        <div class="spinner"></div>
        <p id="working-text" style="font-weight:600;margin:0 0 4px;">${text}</p>
        <p class="small" id="working-sub">Başlıyor…</p>
      </div>
    </div>`;
}
function updateWorkingOverlay(sub) {
  const s = document.getElementById("working-sub");
  if (s) s.textContent = sub;
}
function hideWorkingOverlay() { closeModal(); }

function runDistributeClass(id) {
  showWorkingOverlay("Sınıf dağıtılıyor…");
  setTimeout(() => {
    distributeClassAsync(id,
      (r) => { hideWorkingOverlay(); renderMain(); showDagitimSonuc(r); },
      (done, total) => { updateWorkingOverlay(`Deneme ${done} / ${total}`); }
    );
  }, 20);
}
function refreshProgram() {
  showPreDistributionWarnings(() => {
    showWorkingOverlay("Program hesaplanıyor…");
    setTimeout(() => {
      distributeAllBestAsync(900,
        (r) => {
          hideWorkingOverlay();
          activeTab = "programlar";
          renderTabbar();
          renderMain();
          showDistributionIssuesModal(r);
        },
        (done, total, bestScore) => { updateWorkingOverlay(`Deneme ${done} / ${total} — en iyi kombinasyon aranıyor${bestScore != null ? ` (en iyi skor: ${bestScore})` : ''}`); }
      );
    }, 20);
  });
}
function resetAll() {
  if (!confirm("Tüm haftalık dağıtım silinsin mi?")) return;
  S.schedule = {};
  save(); renderMain();
}

/* ============ KAYDEDİLMİŞ SÜRÜMLER ============ */
function saveCurrentVersion() {
  const name = prompt("Bu anki hâli hangi isimle kaydedeyim? (ör. '2026-2027 Güz Dönemi')\n\nÇalışma alanınız SİLİNMEZ — sadece bu isimle bir kopya saklanır, siz aynı yerden çalışmaya devam edersiniz.");
  if (!name || !name.trim()) return;
  const versions = loadVersions();
  versions.push({ id: uid("ver"), name: name.trim(), savedAt: new Date().toISOString(), data: JSON.parse(JSON.stringify(S)) });
  saveVersionsList(versions);
  alert(`"${name.trim()}" olarak kaydedildi. Çalışmanıza aynı yerden devam edebilirsiniz.`);
  renderMain();
}
function deleteVersion(id) {
  if (!confirm("Bu kayıtlı sürüm kalıcı olarak silinsin mi?")) return;
  saveVersionsList(loadVersions().filter(x => x.id !== id));
  renderMain();
}
function preDistributionChecks() {
  const warnings = [];
  S.classes.forEach(cls => {
    if (cls.excludeFromDistribution) return;
    cls.assignments.forEach(a => {
      const course = courseById(a.courseId);
      if (!course) return;
      const poolSize = (a.eligibleTeacherIds || []).length;
      if ((a.teacherCount || 0) > 0 && poolSize === 0) {
        warnings.push({
          text: `${cls.name} — ${course.name}: hiç öğretmen seçilmemiş, bu ders kesinlikle yerleşemeyecek.`,
          buttonLabel: "Sınıflar ve Ders Atama'ya git, şimdi seç",
          buttonAction: `setModule('ders-programi'); setTab('sinif'); activeClassId='${cls.id}'; closeModal();`
        });
      } else if ((a.teacherCount || 0) > poolSize) {
        warnings.push({
          text: `${cls.name} — ${course.name}: ${a.teacherCount} öğretmen gerekiyor ama havuzda sadece ${poolSize} kişi var.`,
          buttonLabel: "Sınıflar ve Ders Atama'ya git, havuzu genişlet",
          buttonAction: `setModule('ders-programi'); setTab('sinif'); activeClassId='${cls.id}'; closeModal();`
        });
      }
    });
  });
  S.isletmeler.forEach(isl => {
    const fixedTeacherId = S.isletmeTeacherAssign[isl.id];
    if (fixedTeacherId) {
      const allowedDaysUnion = isl.groups.length === 2 ? [0, 1, 2, 3, 4] : GROUP_DAYS[isl.groups[0]];
      const anyFree = allowedDaysUnion.some(d => isTeacherFullyFreeOnDay(fixedTeacherId, d));
      if (!anyFree) {
        const t = teacherById(fixedTeacherId);
        warnings.push({
          text: `${isl.name} işletmesi için atadığınız ${t ? t.name : '?'} öğretmeni, uygun günlerin hiçbirinde şu anda tam gün boş görünmüyor — bu işletme yerleşemeyebilir.`,
          buttonLabel: "Çözüm önerisi: sabit atamayı kaldır, otomatik seçime bırak",
          buttonAction: `setIsletmeTeacher('${isl.id}', ''); closeModal();`
        });
      }
    }
  });
  return warnings;
}
function showPreDistributionWarnings(onProceed) {
  const warnings = preDistributionChecks();
  if (warnings.length === 0) { onProceed(); return; }
  window._pendingDistribute = onProceed;
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg">
      <div class="modal" style="width:440px;">
        <h3 style="color:var(--warn);">Dağıtmadan önce ${warnings.length} uyarı var</h3>
        <p class="small">Bunlar dağıtımı çalıştırmadan önce fark ettiğim, muhtemelen sorun çıkaracak noktalar:</p>
        <ul style="max-height:240px;overflow:auto;padding-left:18px;">${warnings.map(w => `<li class="small" style="margin-bottom:8px;">${w.text}${w.buttonAction ? `<div style="margin-top:4px;"><button class="btn primary" onclick="${w.buttonAction}">${w.buttonLabel}</button></div>` : ``}</li>`).join("")}</ul>
        <div class="row">
          <button class="btn" onclick="closeModal()">Vazgeç, düzelteyim</button>
          <button class="btn primary" onclick="window._pendingDistribute();">Yine de Devam Et</button>
        </div>
      </div>
    </div>`;
}

function findRescueTeacherCandidate(cls, assignment, blockLen) {
  const schoolDays = (cls.schoolDays && cls.schoolDays.length) ? cls.schoolDays : [0, 1, 2, 3, 4];
  const currentPool = new Set(assignment.eligibleTeacherIds || []);
  const candidates = S.teachers.filter(t => !currentPool.has(t.id));
  for (const t of candidates) {
    for (const day of schoolDays) {
      for (let hour = 0; hour <= S.hoursPerDay - blockLen; hour++) {
        let ok = true;
        for (let h = hour; h < hour + blockLen; h++) { if (!isTeacherFreeAt(t.id, day, h)) { ok = false; break; } }
        if (ok) return t;
      }
    }
  }
  return null;
}
function addTeacherToAssignmentPool(classId, assignmentId, teacherId) {
  const cls = classById(classId);
  if (!cls) return;
  const a = cls.assignments.find(x => x.id === assignmentId);
  if (!a) return;
  if (!a.eligibleTeacherIds) a.eligibleTeacherIds = [];
  if (!a.eligibleTeacherIds.includes(teacherId)) a.eligibleTeacherIds.push(teacherId);
  save();
  closeModal();
  refreshProgram();
}
function clearAssignmentRooms(classId, assignmentId) {
  const cls = classById(classId);
  if (!cls) return;
  const a = cls.assignments.find(x => x.id === assignmentId);
  if (!a) return;
  a.roomIds = [];
  save();
  closeModal();
  refreshProgram();
}
function diagnoseAndSuggest(fail) {
  if (fail.isletmeName) {
    return {
      text: `Koordinatörlük — ${fail.isletmeName}: o günlerde tam gün boş, uygun (sabit hedefi olmayan) bir öğretmen bulunamadı.`,
      buttonLabel: "Koordinatörlük ekranına git (öğretmen atamasını gözden geçirin)",
      buttonAction: "setModule('ders-programi'); setTab('koordinatorluk'); closeModal();"
    };
  }
  const cls = classById(fail.classId);
  const a = cls ? cls.assignments.find(x => x.id === fail.assignmentId) : null;
  const course = a ? courseById(a.courseId) : null;
  const label = `${cls ? cls.name : '?'} — ${course ? course.name : '?'} (${fail.blockLen} saatlik blok)`;
  if (!a) {
    return { text: `${label}: ders artık mevcut değil (silinmiş olabilir).` };
  }
  if ((a.teacherCount || 0) > 0 && (!a.eligibleTeacherIds || a.eligibleTeacherIds.length === 0)) {
    return {
      text: `${label}: bu derse henüz hiç öğretmen seçilmemiş.`,
      buttonLabel: "Sınıflar ve Ders Atama'ya git, şimdi seç",
      buttonAction: `setModule('ders-programi'); setTab('sinif'); activeClassId='${cls.id}'; closeModal();`
    };
  }
  const schoolDays = (cls.schoolDays && cls.schoolDays.length) ? cls.schoolDays : [0, 1, 2, 3, 4];
  if (schoolDays.length === 0) {
    return {
      text: `${label}: sınıfın okula geldiği günler henüz belirlenmedi.`,
      buttonLabel: "Sınıflar ve Ders Atama'ya git, günleri seç",
      buttonAction: `setModule('ders-programi'); setTab('sinif'); activeClassId='${cls.id}'; closeModal();`
    };
  }
  const text = diagnoseFailure(cls, a, fail.blockLen);
  const rescue = findRescueTeacherCandidate(cls, a, fail.blockLen);
  if (rescue) {
    return {
      text: `${label}: ${text}.`,
      buttonLabel: `Çözüm önerisi: ${rescue.name} bu derse eklensin (o saatlerde uygun görünüyor) ve program yeniden dağıtılsın`,
      buttonAction: `addTeacherToAssignmentPool('${cls.id}','${a.id}','${rescue.id}')`
    };
  }
  if ((a.roomIds || []).length > 0) {
    return {
      text: `${label}: ${text}.`,
      buttonLabel: "Çözüm önerisi: bu dersteki mekan şartını kaldır ve yeniden dağıt",
      buttonAction: `clearAssignmentRooms('${cls.id}','${a.id}')`
    };
  }
  return { text: `${label}: ${text}. Şu an otomatik bir çözüm bulamadım — öğretmen havuzunu genişletmeniz ya da elle yerleştirmeniz gerekebilir.` };
}

function showDistributionIssuesModal(r) {
  if (!r || !r.failed || r.failed === 0) return;
  const root = document.getElementById("modal-root");
  const items = (r.failedList || []).map(f => {
    const s = diagnoseAndSuggest(f);
    return `<li class="small" style="margin-bottom:8px;">${s.text}${s.buttonAction ? `<div style="margin-top:4px;"><button class="btn primary" onclick="${s.buttonAction}">${s.buttonLabel}</button></div>` : ``}</li>`;
  }).join("");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:440px;">
        <h3 style="color:var(--warn);">Program tamamlandı ama ${r.failed} yer yerleştirilemedi</h3>
        <ul style="max-height:340px;overflow:auto;padding-left:18px;">${items}</ul>
        <div class="row"><button class="btn" onclick="closeModal()">Kapat</button></div>
      </div>
    </div>`;
}

function showDagitimSonuc(r) {
  const el = document.getElementById("dagitim-sonuc");
  if (!el) return;
  let html = `<p class="small">Yerleştirilen blok: ${r.placed} · Yerleştirilemeyen blok: ${r.failed}</p>`;
  if (r.failed > 0 && r.failedList) {
    const items = r.failedList.map(f => {
      const s = diagnoseAndSuggest(f);
      return `<li class="small" style="margin-bottom:8px;">${s.text}${s.buttonAction ? `<div style="margin-top:4px;"><button class="btn primary" onclick="${s.buttonAction}">${s.buttonLabel}</button></div>` : ``}</li>`;
    }).join("");
    html += `<div class="card" style="background:var(--warn-bg);border-color:var(--warn);">
      <strong style="color:var(--warn);">Yerleştirilemeyen dersler:</strong>
      <ul style="padding-left:18px;">${items}</ul>
    </div>`;
  }
  el.innerHTML = html;
}

/* ---- Programlar (Çıktılar) ---- */
function viewProgramlar() {
  const hoursSummary = S.teachers.map(t => {
    const h = teacherTotalHours(t.id);
    const mode = t.hoursMode || "min";
    const target = t.hoursTarget;
    let ok;
    if (mode === "exact") ok = (h === target);
    else ok = (typeof target !== "number") || (h >= target);
    return `<span class="pill ${ok ? 'ok' : 'warn'}" style="margin-right:6px;">${t.name}: ${h} sa</span>`;
  }).join("");
  const body = S.teachers.map(t => renderEditableTeacherGrid(t.id)).join('<hr style="margin:22px 0;border:none;border-top:1px solid var(--line);">');
  return `
  <div class="card no-print">
    <h2>Programlar</h2>
    <p class="small">Boş bir hücreye tıklayın: ders ekleyin ya da o saati boşta kilitleyin. Dolu bir hücreye tıklayın: dersi kilitleyin ya da kaldırın. Bir öğretmenin programında birden fazla hücrede aynı anda işlem yapmak için o öğretmenin başlığındaki <b>Çoklu Seçim</b>'i açın.</p>
    <div style="margin-bottom:10px;">${hoursSummary}</div>
    ${belgeAracCubugu("Öğretmen Programları")}
  </div>
  <div class="print-area">
    ${belgeYazdirmaBasligi("Öğretmen Programları")}
    <div class="card">${body}</div>
  </div>`;
}
function toggleMultiSelectFor(teacherId) {
  if (multiSelectMode && activeTeacherId === teacherId) {
    multiSelectMode = false;
  } else {
    activeTeacherId = teacherId;
    multiSelectMode = true;
  }
  selectedTeacherCells.clear();
  renderMain();
}

/* ---- Öğretmen programı — doğrudan düzenleme (hücreye tıklayınca) ---- */
function renderEditableTeacherGrid(teacherId) {
  const t = teacherById(teacherId);
  if (!t) return `<p class="small">Öğretmen seçin.</p>`;
  const grid = teacherWeeklySchedule(teacherId);
  const legend = Object.values(GRADE_COLORS).map(c =>
    `<span style="display:inline-flex;align-items:center;gap:5px;margin-right:12px;font-size:11.5px;">
      <span style="width:12px;height:12px;border-radius:3px;background:${c.bg};border:1px solid ${c.ink};display:inline-block;"></span>${c.label}
    </span>`
  ).join("");
  const gridMultiSelect = multiSelectMode && activeTeacherId === teacherId;
  let html = `<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
    <h2 style="margin:0;">${t.name} Haftalık Programı</h2>
    <div class="no-print" style="display:flex;gap:6px;align-items:center;">
      <button class="btn ${gridMultiSelect ? 'primary' : ''}" style="padding:4px 9px;font-size:11px;" onclick="toggleMultiSelectFor('${teacherId}')">${gridMultiSelect ? '✓ Çoklu Seçim Açık' : 'Çoklu Seçim'}</button>
      ${gridMultiSelect && selectedTeacherCells.size > 0 ? `<button class="btn" style="padding:4px 9px;font-size:11px;" onclick="clearSelection()">Seçimi Temizle (${selectedTeacherCells.size})</button>` : ``}
    </div>
  </div>
  <div style="margin:8px 0 10px;">${legend}</div>`;
  html += `<table class="sched-table"><tr><th>Saat</th>${DAYS.map(d => `<th>${d}</th>`).join("")}</tr>`;
  for (let h = 0; h < S.hoursPerDay; h++) {
    html += `<tr><td class="small" style="text-align:center;">${h + 1}</td>`;
    DAYS.forEach((d, day) => {
      const cell = grid[day + "_" + h];
      const blocked = S.teacherBlockedSlots[teacherBlockKey(teacherId, day, h)];
      const off = isTeacherOffAt(teacherId, day, h);
      const selKey = day + "_" + h;
      const selected = gridMultiSelect && selectedTeacherCells.has(selKey);
      const selStyle = selected ? "outline:2px solid var(--navy);outline-offset:-2px;" : "";
      const eventAttrs = gridMultiSelect
        ? `onmousedown="startCellDrag(event,${day},${h})" onmouseenter="continueCellDrag(${day},${h})" ondragstart="return false"`
        : `onclick="openTeacherCellModal('${teacherId}',${day},${h})"`;
      if (cell) {
        const course = courseById(cell.courseId);
        const cls = classById(cell.classId);
        const isKoord = cell.courseId === KOORD_COURSE_ID;
        const gc = isKoord ? { bg: "#EDE3F5", ink: "#5B3A85" } : gradeColor(cls ? cls.grade : 0);
        html += `<td><div class="sched-cell filled" style="background:${gc.bg};${selStyle}" ${eventAttrs}>
          <div class="c1" style="color:${gc.ink};">${isKoord ? 'Koordinatörlük' : (course ? course.name : '?')}${cell.locked ? ' 🔒' : ''}</div>
          <div class="c2">${isKoord ? (cell.isletme || 'İşletme belirlenmedi') : (cls ? cls.name : '')}</div>
        </div></td>`;
      } else if (off) {
        html += `<td><div class="sched-cell" style="background:var(--panel-2);">
          <div class="c2" style="text-align:center;">İzinli</div>
        </div></td>`;
      } else if (blocked) {
        html += `<td><div class="sched-cell" style="background:var(--panel-3);${selStyle}" ${eventAttrs}>
          <div class="c2" style="text-align:center;">Kilitli · Boş</div>
        </div></td>`;
      } else {
        html += `<td><div class="sched-cell" style="${selStyle}" ${eventAttrs}></div></td>`;
      }
    });
    html += "</tr>";
  }
  html += `</table>`;
  return html;
}

/* ---- Çoklu seçim (öğretmen programı) ---- */
function toggleMultiSelect() {
  multiSelectMode = !multiSelectMode;
  selectedTeacherCells.clear();
  renderMain();
}
function clearSelection() {
  selectedTeacherCells.clear();
  renderMain();
}
let isDragging = false;
function startCellDrag(e, day, hour) {
  if (e && e.preventDefault) e.preventDefault();
  isDragging = true;
  selectedTeacherCells = new Set([day + "_" + hour]);
  renderMain();
}
function continueCellDrag(day, hour) {
  if (!isDragging) return;
  const key = day + "_" + hour;
  if (!selectedTeacherCells.has(key)) {
    selectedTeacherCells.add(key);
    renderMain();
  }
}
function endCellDrag() {
  if (!isDragging) return;
  isDragging = false;
  if (!multiSelectMode || selectedTeacherCells.size === 0) return;
  if (activeTab === "ogretmen") {
    openOffBulkModal(activeOffTeacherId);
  } else if (activeTab === "programlar") {
    openBulkActionModal(activeTeacherId);
  }
}
function selectedDayHours() {
  return Array.from(selectedTeacherCells).map(k => {
    const [day, hour] = k.split("_").map(Number);
    return { day, hour };
  });
}
function bulkBlockEmpty(teacherId) {
  selectedDayHours().forEach(({ day, hour }) => {
    if (isTeacherOffAt(teacherId, day, hour)) return;
    const cell = findTeacherCell(teacherId, day, hour);
    if (cell) return;
    S.teacherBlockedSlots[teacherBlockKey(teacherId, day, hour)] = true;
  });
  selectedTeacherCells.clear();
  save(); renderMain();
}
function bulkUnblock(teacherId) {
  selectedDayHours().forEach(({ day, hour }) => {
    delete S.teacherBlockedSlots[teacherBlockKey(teacherId, day, hour)];
  });
  selectedTeacherCells.clear();
  save(); renderMain();
}
function bulkLockFilled(teacherId) {
  selectedDayHours().forEach(({ day, hour }) => {
    const cell = findTeacherCell(teacherId, day, hour);
    if (cell) cell.locked = true;
  });
  selectedTeacherCells.clear();
  save(); renderMain();
}
function bulkUnlockFilled(teacherId) {
  selectedDayHours().forEach(({ day, hour }) => {
    const cell = findTeacherCell(teacherId, day, hour);
    if (cell) cell.locked = false;
  });
  selectedTeacherCells.clear();
  save(); renderMain();
}
function bulkRemoveFilled(teacherId) {
  if (!confirm("Seçili dolu hücrelerdeki dersler kaldırılsın mı?")) return;
  selectedDayHours().forEach(({ day, hour }) => {
    const cell = findTeacherCell(teacherId, day, hour);
    if (cell) delete S.schedule[scheduleKey(cell.classId, day, hour)];
  });
  selectedTeacherCells.clear();
  save(); renderMain();
}
function bulkAddCourseToSelected(teacherId) {
  const sel = document.getElementById('bulk-assignment');
  if (!sel || !sel.value) { alert("Geçerli bir ders seçin."); return; }
  const [classId, assignmentId] = sel.value.split("|");
  const cls = classById(classId);
  const a = cls.assignments.find(x => x.id === assignmentId);
  if (!a) { alert("Geçerli bir ders seçin."); return; }
  let placed = 0;
  const skipped = [];
  selectedDayHours().forEach(({ day, hour }) => {
    if (findTeacherCell(teacherId, day, hour)) { skipped.push(`${DAYS[day]} ${hour + 1}. saat (dolu)`); return; }
    if (isTeacherOffAt(teacherId, day, hour)) { skipped.push(`${DAYS[day]} ${hour + 1}. saat (izinli)`); return; }
    if (S.teacherBlockedSlots[teacherBlockKey(teacherId, day, hour)]) { skipped.push(`${DAYS[day]} ${hour + 1}. saat (kilitli-boş)`); return; }
    if (!isClassFree(classId, day, hour)) { skipped.push(`${DAYS[day]} ${hour + 1}. saat (sınıfın başka dersi var)`); return; }
    const key = scheduleKey(classId, day, hour);
    if (!areRoomsFree(a.roomIds, day, hour, key)) { skipped.push(`${DAYS[day]} ${hour + 1}. saat (mekan dolu)`); return; }
    S.schedule[key] = { day, hour, classId, assignmentId: a.id, courseId: a.courseId, teacherIds: [teacherId], roomIds: (a.roomIds || []).slice() };
    placed++;
  });
  selectedTeacherCells.clear();
  save(); closeModal(); renderMain();
  if (skipped.length > 0) { alert(`${placed} hücreye eklendi. ${skipped.length} hücre atlandı:\n` + skipped.join("\n")); }
}

function eligibleOpenAssignmentsForTeacher(teacherId) {
  const list = [];
  S.classes.forEach(cls => {
    cls.assignments.forEach(a => {
      if (!(a.eligibleTeacherIds || []).includes(teacherId)) return;
      const course = courseById(a.courseId);
      if (!course) return;
      const placed = Object.values(S.schedule).filter(c => c.classId === cls.id && c.assignmentId === a.id).length;
      if (placed >= course.hours) return;
      list.push({ cls, assignment: a, course });
    });
  });
  return list;
}

function openBulkActionModal(teacherId) {
  const t = teacherById(teacherId);
  const cells = selectedDayHours();
  const emptyCells = cells.filter(({ day, hour }) => !findTeacherCell(teacherId, day, hour) && !S.teacherBlockedSlots[teacherBlockKey(teacherId, day, hour)] && !isTeacherOffAt(teacherId, day, hour));
  const filledCells = cells.filter(({ day, hour }) => !!findTeacherCell(teacherId, day, hour));
  const blockedCells = cells.filter(({ day, hour }) => !!S.teacherBlockedSlots[teacherBlockKey(teacherId, day, hour)]);
  const openList = eligibleOpenAssignmentsForTeacher(teacherId);
  const courseOptions = openList.map(({ cls, assignment, course }) =>
    `<option value="${cls.id}|${assignment.id}">${cls.name} — ${course.name}</option>`
  ).join("");
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this){ closeModal(); }">
      <div class="modal" style="width:420px;">
        <h3>${t.name} · ${cells.length} hücre seçili</h3>
        <p class="small">Boş: ${emptyCells.length} · Dolu: ${filledCells.length} · Kilitli-boş: ${blockedCells.length}</p>
        ${emptyCells.length > 0 ? `
        <div style="border-top:1px solid var(--line);padding-top:8px;margin-top:8px;">
          <label>Seçili boş hücrelere ders ekle (${emptyCells.length} hücre)</label>
          <select id="bulk-assignment" style="width:100%">${courseOptions || '<option value="">Bu öğretmen için açık ders yok</option>'}</select>
          <div class="row"><button class="btn primary" onclick="bulkAddCourseToSelected('${teacherId}')">Seçili Boşlara Ekle</button></div>
          <div class="row"><button class="btn" onclick="bulkBlockEmpty('${teacherId}'); closeModal();">Seçili Boşları Kilitle</button></div>
        </div>` : ``}
        ${blockedCells.length > 0 ? `
        <div style="border-top:1px solid var(--line);padding-top:8px;margin-top:8px;">
          <div class="row"><button class="btn" onclick="bulkUnblock('${teacherId}'); closeModal();">Kilitli-Boşların Kilidini Kaldır (${blockedCells.length})</button></div>
        </div>` : ``}
        ${filledCells.length > 0 ? `
        <div style="border-top:1px solid var(--line);padding-top:8px;margin-top:8px;">
          <div class="row"><button class="btn" onclick="bulkLockFilled('${teacherId}'); closeModal();">Dolu Olanları Kilitle (${filledCells.length})</button></div>
          <div class="row"><button class="btn" onclick="bulkUnlockFilled('${teacherId}'); closeModal();">Dolu Olanların Kilidini Kaldır</button></div>
          <div class="row"><button class="btn danger" onclick="bulkRemoveFilled('${teacherId}'); closeModal();">Dolu Olanları Kaldır</button></div>
        </div>` : ``}
        <div class="row"><button class="btn" onclick="closeModal()">Kapat (seçim kalsın)</button></div>
      </div>
    </div>`;
}

function openTeacherCellModal(teacherId, day, hour) {
  const t = teacherById(teacherId);
  const bKey = teacherBlockKey(teacherId, day, hour);
  const cell = findTeacherCell(teacherId, day, hour);
  const blocked = S.teacherBlockedSlots[bKey];
  const root = document.getElementById("modal-root");

  if (cell && cell.courseId === KOORD_COURSE_ID) {
    root.innerHTML = `
      <div class="modal-bg" onclick="if(event.target===this) closeModal()">
        <div class="modal">
          <h3>${t.name} · ${DAYS[day]} · ${hour + 1}. saat</h3>
          <p class="small">Bu gün <b>Koordinatörlük</b> günü (${cell.isletme || 'işletme belirlenmedi'}). Değiştirmek veya kaldırmak için <b>Koordinatörlük</b> sekmesini kullanın.</p>
          <div class="row"><button class="btn" onclick="closeModal()">Kapat</button></div>
        </div>
      </div>`;
    return;
  }

  if (cell) {
    const course = courseById(cell.courseId);
    const cls = classById(cell.classId);
    root.innerHTML = `
      <div class="modal-bg" onclick="if(event.target===this) closeModal()">
        <div class="modal">
          <h3>${t.name} · ${DAYS[day]} · ${hour + 1}. saat</h3>
          <p class="small"><b>${course ? course.name : '?'}</b> — ${cls ? cls.name : '?'}<br>${cell.teacherIds.map(id => { const tt = teacherById(id); return tt ? tt.name : '?'; }).join(", ")}</p>
          <div class="row">
            ${cell.locked
              ? `<button class="btn" onclick="unlockAssignment('${cell.classId}','${cell.assignmentId}'); closeModal();">Kilidi Kaldır</button>`
              : `<button class="btn" onclick="lockAssignment('${cell.classId}','${cell.assignmentId}'); closeModal();">Kilitle</button>`}
            <button class="btn danger" onclick="teacherGridRemoveCell('${cell.classId}',${day},${hour})">Kaldır</button>
          </div>
          <div class="row"><button class="btn" onclick="closeModal()">Kapat</button></div>
        </div>
      </div>`;
    return;
  }

  if (blocked) {
    root.innerHTML = `
      <div class="modal-bg" onclick="if(event.target===this) closeModal()">
        <div class="modal">
          <h3>${t.name} · ${DAYS[day]} · ${hour + 1}. saat</h3>
          <p class="small">Bu saat şu anda <b>boşta kilitli</b> — dağıtım bu saate ${t.name} için hiç ders koymaz.</p>
          <div class="row"><button class="btn primary" onclick="teacherUnblockSlot('${teacherId}',${day},${hour})">Kilidi Kaldır</button></div>
          <div class="row"><button class="btn" onclick="closeModal()">Kapat</button></div>
        </div>
      </div>`;
    return;
  }

  const openList = eligibleOpenAssignmentsForTeacher(teacherId);
  const options = openList.map(({ cls, assignment, course }) =>
    `<option value="${cls.id}|${assignment.id}">${cls.name} — ${course.name}</option>`
  ).join("");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal">
        <h3>${t.name} · ${DAYS[day]} · ${hour + 1}. saat (boş)</h3>
        <label>Buraya ders ekle</label>
        <select id="tgrid-assignment" style="width:100%" onchange="renderTeacherGridPicker('${teacherId}',${day},${hour})">${options || '<option value="">Bu öğretmen için açık ders yok</option>'}</select>
        <div id="tgrid-teacher-picker"></div>
        <div class="row"><button class="btn primary" onclick="teacherGridAddCell('${teacherId}',${day},${hour})">Ekle</button></div>
        <div class="row"><button class="btn danger" onclick="teacherBlockSlot('${teacherId}',${day},${hour})">Bu saati boşta kilitle</button></div>
        <div class="row"><button class="btn" onclick="closeModal()">Kapat</button></div>
      </div>
    </div>`;
  renderTeacherGridPicker(teacherId, day, hour);
}

function renderTeacherGridPicker(teacherId, day, hour) {
  const sel = document.getElementById("tgrid-assignment");
  const el = document.getElementById("tgrid-teacher-picker");
  if (!sel || !el) return;
  if (!sel.value) { el.innerHTML = ""; return; }
  const [classId, assignmentId] = sel.value.split("|");
  const cls = classById(classId);
  const a = cls.assignments.find(x => x.id === assignmentId);
  if (!a) return;
  const checks = (a.eligibleTeacherIds || []).map(tid => {
    const t = teacherById(tid);
    const free = (tid === teacherId) ? true : isTeacherFreeAt(tid, day, hour);
    const checked = (tid === teacherId) ? true : false;
    return `<label style="display:block;font-size:12px;margin:4px 0;${free ? '' : 'color:var(--warn);'}">
      <input type="checkbox" class="tgrid-t-check" value="${tid}" ${checked ? 'checked' : ''} ${(tid === teacherId || !free) ? 'disabled' : ''}> ${t ? t.name : '?'} ${free ? '' : ' (müsait değil)'}
    </label>`;
  }).join("") || '<p class="small">Havuzda öğretmen yok.</p>';
  el.innerHTML = `<label>Kim girecek (gerekli: ${a.teacherCount || 0})</label>${checks}<input type="hidden" id="tgrid-fixed-teacher" value="${teacherId}">`;
}

function teacherGridAddCell(teacherId, day, hour) {
  const sel = document.getElementById("tgrid-assignment");
  if (!sel || !sel.value) { alert("Geçerli bir ders seçin."); return; }
  const [classId, assignmentId] = sel.value.split("|");
  const cls = classById(classId);
  const a = cls.assignments.find(x => x.id === assignmentId);
  if (!a) { alert("Geçerli bir ders seçin."); return; }
  const checked = Array.from(document.querySelectorAll(".tgrid-t-check:checked")).map(el => el.value);
  if (!checked.includes(teacherId)) checked.push(teacherId);
  const key = scheduleKey(classId, day, hour);
  if (!isClassFree(classId, day, hour)) { alert("Bu saatte sınıfın başka bir dersi var."); return; }
  if (!areRoomsFree(a.roomIds, day, hour, key)) { alert("Bu saatte seçili mekan(lar)dan biri kullanılıyor."); return; }
  S.schedule[key] = { day, hour, classId, assignmentId: a.id, courseId: a.courseId, teacherIds: checked, roomIds: (a.roomIds || []).slice(), locked: true };
  save(); closeModal(); renderMain();
}
function teacherGridRemoveCell(classId, day, hour) {
  delete S.schedule[scheduleKey(classId, day, hour)];
  save(); closeModal(); renderMain();
}
function teacherBlockSlot(teacherId, day, hour) {
  S.teacherBlockedSlots[teacherBlockKey(teacherId, day, hour)] = true;
  save(); closeModal(); renderMain();
}
function teacherUnblockSlot(teacherId, day, hour) {
  delete S.teacherBlockedSlots[teacherBlockKey(teacherId, day, hour)];
  save(); closeModal(); renderMain();
}
function closeModal() { document.getElementById("modal-root").innerHTML = ""; }
