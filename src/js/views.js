/* ============================================================
   ARAYÜZ (VIEWS)
   ============================================================ */

const MODULES = [
  { id: "ana", label: "Ana Sayfa", icon: "home", group: "Genel" },
  { id: "ders-programi", label: "Ders Programı", icon: "calendar", group: "Ders Planlama" },
  { id: "yillik-plan", label: "Yıllık Plan", icon: "note", group: "Ders Planlama" },
  { id: "gunluk-plan", label: "Günlük Plan", icon: "book", group: "Ders Planlama" },
  { id: "ders-bilgi-formu", label: "Ders Bilgi Formları", icon: "stack", group: "Ders Planlama" },
  { id: "ogrenci-listesi", label: "Öğrenci Listesi", icon: "school", group: "Öğrenci & Kadro" },
  { id: "norm-kadro", label: "Norm Kadro", icon: "chart", group: "Öğrenci & Kadro" },
  { id: "toplantilar", label: "Toplantılar", icon: "users", group: "Toplantılar" },
  { id: "staj-yerlestirme", label: "Staj Yerleştirme", icon: "briefcase", group: "Staj" },
  { id: "atolye-envanter", label: "Atölye / Envanter", icon: "tool", group: "Atölye" },
  { id: "performans", label: "Performans Kriterleri", icon: "star", group: "Sınav & Değerlendirme" },
  { id: "sinav-havuzu", label: "Sınav Havuzu", icon: "question", group: "Sınav & Değerlendirme" },
  { id: "sinav-notlari", label: "Sınav Notları", icon: "penSquare", group: "Sınav & Değerlendirme" },
  { id: "performans-notlari", label: "Performans Notları", icon: "percent", group: "Sınav & Değerlendirme" },
  { id: "sonuc-karnesi", label: "Sonuç Karnesi", icon: "badge", group: "Sınav & Değerlendirme" },
  { id: "kalfalik-ustalik", label: "Kalfalık / Ustalık Sınavı", icon: "medal", group: "Sınav & Değerlendirme" },
  { id: "beceri-sinavi", label: "Beceri Sınavı", icon: "clipboardCheck", group: "Sınav & Değerlendirme" },
  { id: "donem-raporlari", label: "Ders Kesim / Yazılı Teslim", icon: "report", group: "Dönem Raporları" },
  { id: "seflik-raporu", label: "Şeflik Aylık Raporu", icon: "calendarCheck", group: "Dönem Raporları" },
  { id: "ayarlar", label: "Ayarlar", icon: "settings", group: "Sistem" }
];
const DERS_PROGRAMI_TABS = [
  { id: "havuz", label: "Ders Havuzu", icon: "book" },
  { id: "ogretmen", label: "Öğretmenler", icon: "users" },
  { id: "sinif", label: "Sınıflar ve Ders Atama", icon: "school" },
  { id: "koordinatorluk", label: "Koordinatörlük", icon: "building" },
  { id: "dagitim", label: "Ders Dağıtım", icon: "shuffle" },
  { id: "programlar", label: "Programlar", icon: "grid" }
];
const STAJ_TABS = [
  { id: "ogrenciler", label: "Öğrenciler", icon: "school" },
  { id: "not-ortalamalari", label: "Not Ortalamaları", icon: "percent" },
  { id: "tercihler", label: "Tercihler", icon: "star" },
  { id: "kontenjanlar", label: "İşletme Kontenjanları", icon: "building" },
  { id: "sonuc", label: "Sonuç / Yerleştirme", icon: "badge" }
];
const TOPLANTI_TABS = [
  { id: "okul", label: "Okul Zümresi", icon: "users" },
  { id: "il", label: "İl Zümresi", icon: "building" }
];
let activeModule = "ana";
let activeTab = "havuz";
let activeStajTab = "ogrenciler";
let activeToplantiTab = "okul";
let activeClassId = S.classes[0] ? S.classes[0].id : null;
let activeTeacherId = S.teachers[0] ? S.teachers[0].id : null;
let multiSelectMode = false;
let selectedTeacherCells = new Set();
let activeOffTeacherId = null;
let activePlanSistem = "maarif";
let activePlanEntryId = { yillik: null, gunluk: null };

/* ---- Sol Menü: kategori akordeonu ----
   Modüller MODULES[].group alanına göre kategorilere ayrılır; her an
   yalnızca bir kategori açık gösterilir (expandedGroup), diğerleri
   başlığa küçültülmüş halde durur — kalabalığı azaltır. Bir modül
   seçildiğinde kategorisi otomatik açılır. Alt modülü olan modüller
   (Ders Programı, Staj Yerleştirme, Toplantılar) aktifken alt
   sekmeleri kendi düğmesinin hemen altında satır içi açılır. */
let expandedGroup = "Genel";
function moduleGroupOf(id) {
  const mod = MODULES.find(m => m.id === id) || (id === "ders-programi-secim" ? MODULES.find(m => m.id === "ders-programi") : null);
  return mod ? mod.group : null;
}
function toggleGroup(g) {
  expandedGroup = (expandedGroup === g) ? null : g;
  renderTabbar();
}
function subTabButtonsFor(moduleId) {
  if (moduleId === "ders-programi") {
    return DERS_PROGRAMI_TABS.map(t =>
      `<button class="nav-btn sub ${t.id === activeTab ? 'active' : ''}" onclick="setTab('${t.id}')">${icon(t.icon)}<span>${t.label}</span></button>`
    ).join("");
  }
  if (moduleId === "staj-yerlestirme") {
    return STAJ_TABS.map(t =>
      `<button class="nav-btn sub ${t.id === activeStajTab ? 'active' : ''}" onclick="setStajTab('${t.id}')">${icon(t.icon)}<span>${t.label}</span></button>`
    ).join("");
  }
  if (moduleId === "toplantilar") {
    return TOPLANTI_TABS.map(t =>
      `<button class="nav-btn sub ${t.id === activeToplantiTab ? 'active' : ''}" onclick="setToplantiTab('${t.id}')">${icon(t.icon)}<span>${t.label}</span></button>`
    ).join("");
  }
  return "";
}
function renderTabbar() {
  let lastGroup = null;
  const parts = [];
  MODULES.forEach(m => {
    if (m.group !== lastGroup) {
      lastGroup = m.group;
      const open = m.group === expandedGroup;
      parts.push(`<button class="nav-group-header ${open ? 'open' : ''}" onclick="toggleGroup('${jsq(m.group)}')"><span>${m.group}</span>${icon("chevron")}</button>`);
    }
    if (m.group !== expandedGroup) return;
    const isActive = m.id === activeModule || (m.id === 'ders-programi' && activeModule === 'ders-programi-secim');
    parts.push(`<button class="nav-btn ${isActive ? 'active' : ''}" onclick="setModule('${m.id}')">${icon(m.icon)}<span>${m.label}</span></button>`);
    if (isActive) parts.push(subTabButtonsFor(m.id));
  });
  document.getElementById("tabbar").innerHTML = parts.join("");
  renderSubTabbar();
}
function renderSubTabbar() {
  document.getElementById("subtabbar").innerHTML = "";
}
function setModule(id) {
  activeModule = id;
  if (id === "ders-programi" && !DERS_PROGRAMI_TABS.some(t => t.id === activeTab)) activeTab = "havuz";
  if (id === "staj-yerlestirme" && !STAJ_TABS.some(t => t.id === activeStajTab)) activeStajTab = "ogrenciler";
  if (id === "toplantilar" && !TOPLANTI_TABS.some(t => t.id === activeToplantiTab)) activeToplantiTab = "okul";
  expandedGroup = moduleGroupOf(id);
  selectedTeacherCells.clear();
  multiSelectMode = false;
  renderTabbar();
  renderMain();
}
function setTab(id) { activeTab = id; selectedTeacherCells.clear(); multiSelectMode = false; renderTabbar(); renderMain(); }
function setStajTab(id) { activeStajTab = id; renderTabbar(); renderMain(); }
function setToplantiTab(id) { activeToplantiTab = id; renderTabbar(); renderMain(); }

function renderMain() {
  const el = document.getElementById("main");
  if (activeModule === "ana") { el.innerHTML = viewAna(); return; }
  if (activeModule === "ders-programi-secim") { el.innerHTML = viewDersProgramiChooser(); return; }
  if (activeModule === "yillik-plan") { el.innerHTML = viewPlanModule("yillik"); return; }
  if (activeModule === "gunluk-plan") { el.innerHTML = viewPlanModule("gunluk"); return; }
  if (activeModule === "ders-bilgi-formu") { el.innerHTML = viewDersBilgiFormu(); return; }
  if (activeModule === "ogrenci-listesi") { el.innerHTML = viewOgrenciListesi(); return; }
  if (activeModule === "norm-kadro") { el.innerHTML = viewNormKadro(); return; }
  if (activeModule === "toplantilar") {
    el.innerHTML = activeToplantiTab === "il" ? viewPlaceholderModule("İl Zümresi", "İl zümre toplantı tutanaklarınızı buraya birlikte kuracağız.") : viewOkulZumresi();
    return;
  }
  if (activeModule === "staj-yerlestirme") {
    el.innerHTML = activeStajTab === "not-ortalamalari" ? viewStajNotOrtalamalari()
      : activeStajTab === "tercihler" ? viewStajTercihler()
      : activeStajTab === "kontenjanlar" ? viewStajKontenjanlar()
      : activeStajTab === "sonuc" ? viewStajSonuc()
      : viewStajOgrenciler();
    return;
  }
  if (activeModule === "atolye-envanter") { el.innerHTML = viewAtolyeEnvanter(); return; }
  if (activeModule === "performans") { el.innerHTML = viewPerformans(); return; }
  if (activeModule === "sinav-notlari") { el.innerHTML = viewSinavNotlari(); return; }
  if (activeModule === "performans-notlari") { el.innerHTML = viewPerformansNotlari(); return; }
  if (activeModule === "sonuc-karnesi") { el.innerHTML = viewSonucKarnesi(); return; }
  if (activeModule === "kalfalik-ustalik") { el.innerHTML = viewKalfalikUstalik(); return; }
  if (activeModule === "beceri-sinavi") { el.innerHTML = viewBeceriSinavi(); return; }
  if (activeModule === "donem-raporlari") { el.innerHTML = viewDonemRaporlari(); return; }
  if (activeModule === "seflik-raporu") { el.innerHTML = viewSeflikRaporlari(); return; }
  if (activeModule === "sinav-havuzu") { el.innerHTML = viewSinavHavuzu(); return; }
  if (activeModule === "ayarlar") { el.innerHTML = viewAyarlar(); return; }
  const govde = activeTab === "havuz" ? viewHavuz()
    : activeTab === "ogretmen" ? viewOgretmen()
    : activeTab === "sinif" ? viewSinif()
    : activeTab === "dagitim" ? viewDagitim()
    : activeTab === "koordinatorluk" ? viewKoordinatorluk()
    : activeTab === "programlar" ? viewProgramlar()
    : "";
  el.innerHTML = dersProgramiArsivBar() + govde;
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

/* ---- Ders Programı Dönem Arşivi ----
   Ders Programı (havuz, öğretmenler, sınıflar, koordinatörlük, dağıtım)
   her öğretim yılı başında sıfırdan hazırlanır. Bu arşiv, o alanları bir
   isimle (ör. "2025-2026 Eğitim-Öğretim Yılı") anlık görüntü olarak
   saklamayı, yeni bir döneme sıfırdan başlamayı ve eski bir dönemi geri
   yükleyip üzerinde çalışarak farklı bir isimle tekrar kaydetmeyi sağlar.
   Yıllık Plan/Günlük Plan/Toplantı Tutanakları gibi diğer modüller
   etkilenmez — onlar zaten kendi geçmiş kayıtlarını liste olarak tutar. */
const DERS_PROGRAMI_ARSIV_ALANLARI = ["rooms", "courses", "teachers", "classes", "schedule", "blockedSlots", "teacherBlockedSlots", "coordAssignments", "isletmeler", "isletmeTeacherAssign"];
function dersProgramiSnapshotAl() {
  const veri = {};
  DERS_PROGRAMI_ARSIV_ALANLARI.forEach(k => { veri[k] = JSON.parse(JSON.stringify(S[k])); });
  return veri;
}
function dersProgramiBosSnapshot() {
  return { rooms: [], courses: [], teachers: [], classes: [], schedule: {}, blockedSlots: {}, teacherBlockedSlots: {}, coordAssignments: [], isletmeler: [], isletmeTeacherAssign: {} };
}
function dersProgramiSnapshotUygula(veri) {
  DERS_PROGRAMI_ARSIV_ALANLARI.forEach(k => { S[k] = JSON.parse(JSON.stringify(veri[k] !== undefined ? veri[k] : dersProgramiBosSnapshot()[k])); });
}
function dersProgramiFarkliKaydet() {
  const varsayilan = S.akademikTakvim && S.akademikTakvim.ogretimYili ? S.akademikTakvim.ogretimYili + " Eğitim-Öğretim Yılı" : "Ders Programı - " + new Date().toLocaleDateString("tr-TR");
  const etiket = prompt("Şu anki ders programını (havuz, öğretmenler, sınıflar, koordinatörlük, dağıtım) hangi isimle arşivlemek istiyorsunuz?", varsayilan);
  if (!etiket || !etiket.trim()) return;
  if (!S.donemArsivi) S.donemArsivi = [];
  S.donemArsivi.push({ id: uid("da"), etiket: etiket.trim(), tarih: new Date().toLocaleDateString("tr-TR"), veri: dersProgramiSnapshotAl() });
  save();
  renderMain();
  alert('"' + etiket.trim() + '" adıyla arşivlendi. Arşivden Yükle listesinden istediğiniz zaman geri çağırabilirsiniz.');
}
function dersProgramiArsivdenYukle(id) {
  const kayit = (S.donemArsivi || []).find(a => a.id === id);
  if (!kayit) return;
  if (!confirm('"' + kayit.etiket + '" arşivi şu anki ders programının (havuz, öğretmenler, sınıflar, koordinatörlük, dağıtım) yerine yüklenecek. Şu anki çalışmanızı önce "Farklı Kaydet (Arşivle)" ile kaydetmediyseniz kaybolacak. Devam edilsin mi?')) return;
  dersProgramiSnapshotUygula(kayit.veri);
  activeClassId = S.classes[0] ? S.classes[0].id : null;
  activeTeacherId = S.teachers[0] ? S.teachers[0].id : null;
  save();
  renderTabbar();
  renderMain();
}
function dersProgramiArsivSil(id) {
  if (!confirm("Bu arşiv kalıcı olarak silinsin mi? Bu işlem geri alınamaz.")) return;
  S.donemArsivi = (S.donemArsivi || []).filter(a => a.id !== id);
  save();
  renderMain();
}
function dersProgramiSifirla() {
  if (!confirm("Ders Programı (havuz, öğretmenler, sınıflar, koordinatörlük, dağıtım) sıfırlanacak. Diğer modülleriniz (Yıllık Plan, Zümre, Envanter vb.) etkilenmeyecek. Önce \"Farklı Kaydet (Arşivle)\" ile kaydetmediyseniz şu anki ders programı kaybolacak. Devam edilsin mi?")) return;
  dersProgramiSnapshotUygula(dersProgramiBosSnapshot());
  activeClassId = null;
  activeTeacherId = null;
  save();
  renderTabbar();
  renderMain();
}
function dersProgramiArsivDropdown() {
  const arsiv = S.donemArsivi || [];
  const items = arsiv.map(a => `
    <div class="tab-dropdown-item" style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
      <span onclick="dersProgramiArsivdenYukle('${jsq(a.id)}'); toggleTabDropdown('ders-arsiv');" style="flex:1;cursor:pointer;">${escHtml(a.etiket)}<br><span class="small">${escHtml(a.tarih)}</span></span>
      <span onclick="event.stopPropagation(); dersProgramiArsivSil('${jsq(a.id)}');" style="cursor:pointer;" title="Arşivden sil">✕</span>
    </div>`).join("");
  return `<div class="tab-dropdown no-print">
    <button class="btn" onclick="toggleTabDropdown('ders-arsiv')">Arşivden Yükle ▾</button>
    <div id="tabdd-ders-arsiv" class="tab-dropdown-menu">${items || '<div class="tab-dropdown-item small">Henüz arşiv yok</div>'}</div>
  </div>`;
}
function dersProgramiArsivBar() {
  return `
  <div class="card no-print">
    <div class="row" style="flex-wrap:wrap;align-items:center;justify-content:space-between;">
      <div class="small" style="font-weight:600;">Dönem Arşivi</div>
      <div class="row" style="flex-wrap:wrap;margin:0;">
        ${dersProgramiArsivDropdown()}
        <button class="btn" onclick="dersProgramiFarkliKaydet()">Farklı Kaydet (Arşivle)</button>
        <button class="btn danger" onclick="dersProgramiSifirla()">Yeni Döneme Başla (Sıfırla)</button>
      </div>
    </div>
    <p class="small" style="margin-top:6px;">Şu anki ders programını bir isimle (ör. "2025-2026 Eğitim-Öğretim Yılı") arşivleyin; sonra yeni döneme sıfırdan başlayın ya da eski bir arşivi geri yükleyip üzerinde çalışıp yeni bir isimle tekrar kaydedin. Diğer modülleriniz (Yıllık Plan, Zümre, Envanter vb.) bundan etkilenmez.</p>
  </div>`;
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
function stajBySinif() {
  const bySinif = {};
  S.students.forEach(st => {
    const key = st.sinif || "—";
    if (!bySinif[key]) bySinif[key] = [];
    bySinif[key].push(st);
  });
  return bySinif;
}
/* -- Sekme 1: Öğrenciler (roster + ekleme) -- */
function viewStajOgrenciler() {
  const bySinif = stajBySinif();
  const sinifKeys = Object.keys(bySinif).sort();
  const listHtml = sinifKeys.length ? sinifKeys.map(sinif => {
    const rows = bySinif[sinif].map(st => `
      <tr>
        <td>${st.okulNo || ''}</td>
        <td>${escHtml(st.ad)}</td>
        <td>${st.dal || ''}</td>
        <td class="no-print"><div class="row" style="margin:0;"><button class="btn" onclick="editStudent('${st.id}')">Düzenle</button><button class="btn danger" onclick="deleteStudent('${st.id}')">Sil</button></div></td>
      </tr>`).join("");
    return `<div class="card"><h2 style="margin-top:0;">${escHtml(sinif)}</h2><table><tr><th>Okul No</th><th>Ad Soyad</th><th>Dal</th><th class="no-print"></th></tr>${rows}</table></div>`;
  }).join("") : `<div class="card"><p class="small">Henüz öğrenci eklenmedi.</p></div>`;

  return `
  <div class="card no-print">
    <h2>Staj Yerleştirme — Öğrenciler</h2>
    <p class="small">Staj yerleştirmesi yapılacak öğrenci listesi. Not ortalamalarını "Not Ortalamaları", işletme tercihlerini "Tercihler" sekmesinden girin; sonuç ve yerleştirme "Sonuç / Yerleştirme" sekmesinde.</p>
    ${belgeAracCubugu("Staj Yerleştirme - Öğrenciler")}
  </div>
  <div class="print-area">
    ${belgeYazdirmaBasligi("Staj Yerleştirme — Öğrenciler")}
    ${listHtml}
  </div>
  <div class="card no-print">
    <h2>Öğrenci Listesinden Ekle</h2>
    <p class="small">Öğrenci Listesi modülüne aktardığınız e-Okul listesinden bu sınıfın tüm öğrencilerini tek seferde ekleyin.</p>
    <div class="row" style="max-width:260px"><button class="btn primary" onclick="stajListedenTopluEkleModal()">Öğrenci Listesinden Toplu Ekle</button></div>
  </div>
  <div class="card no-print">
    <h2>Öğrenci Ekle</h2>
    <div class="grid3">
      <div><label class="small">Sınıf</label><input type="text" id="ns-sinif" placeholder="örn. 12/A" style="width:100%"></div>
      <div><label class="small">Okul No</label><input type="text" id="ns-okulno" style="width:100%"></div>
      <div><label class="small">Ad Soyad</label><input type="text" id="ns-ad" style="width:100%"></div>
      <div><label class="small">Dal</label><input type="text" id="ns-dal" placeholder="örn. MBO" style="width:100%"></div>
      <div><label class="small">İşletme (opsiyonel)</label><select id="ns-isletme" style="width:100%">${studentIsletmeOptions()}</select></div>
    </div>
    <div class="row" style="max-width:200px"><button class="btn primary" onclick="addStudent()">Ekle</button></div>
  </div>
  <div class="card no-print">
    <h2>Excel / Word'den Toplu Ekle</h2>
    <p class="small">Excel veya Word dosyanızdaki Sınıf, Okul No, Ad Soyad, Dal, İşletme sütunlarını doğrudan "Word Yükle" ile yükleyebilir, ya da seçip kopyalayıp (Ctrl+C) aşağıya yapıştırıp (Ctrl+V) "Evrak Yükle"ye basabilirsiniz. Her satır bir öğrenci olmalı.</p>
    <textarea id="bulk-student-paste" style="width:100%;height:120px;font-family:monospace;font-size:11.5px;" placeholder="12/A&#9;23014&#9;Ramazan Övek&#9;MBO&#9;TKİ Ege Linyitleri İşletmesi Müdürlüğü"></textarea>
    <div class="row" style="max-width:320px"><button class="btn" onclick="wordDosyasiniTextareayaYukle('bulk-student-paste', bulkImportStudents)">Word Yükle</button><button class="btn primary" onclick="bulkImportStudents()">Evrak Yükle</button></div>
  </div>`;
}
/* -- Sekme 2: Not Ortalamaları -- */
function viewStajNotOrtalamalari() {
  const bySinif = stajBySinif();
  const sinifKeys = Object.keys(bySinif).sort();
  const listHtml = sinifKeys.length ? sinifKeys.map(sinif => {
    const rows = bySinif[sinif].map(st => `
      <tr>
        <td>${st.okulNo || ''}</td>
        <td>${escHtml(st.ad)}</td>
        <td>${st.dal || ''}</td>
        <td class="no-print"><input type="text" value="${escHtml(st.not)}" style="width:70px;text-align:center;" onchange="updateStudentAlan('${st.id}','not',this.value)"></td>
        <td class="print-only-cell">${escHtml(st.not || '—')}</td>
      </tr>`).join("");
    return `<div class="card"><h2 style="margin-top:0;">${escHtml(sinif)}</h2><table><tr><th>Okul No</th><th>Ad Soyad</th><th>Dal</th><th>Not Ortalaması</th></tr>${rows}</table></div>`;
  }).join("") : `<div class="card"><p class="small">Henüz öğrenci eklenmedi — önce Öğrenciler sekmesinden ekleyin.</p></div>`;
  return `
  <div class="card no-print">
    <h2>Not Ortalamaları</h2>
    <p class="small">Her öğrencinin staj yerleştirmesinde önceliğini belirleyecek not ortalamasını girin — "Sonuç / Yerleştirme" sekmesindeki Otomatik Yerleştir, öğrencileri bu nota göre yüksekten düşüğe sıralayarak tercihleriyle eşleştirir.</p>
    ${belgeAracCubugu("Staj Yerleştirme - Not Ortalamaları")}
  </div>
  <div class="print-area">
    ${belgeYazdirmaBasligi("Staj Yerleştirme — Not Ortalamaları")}
    ${listHtml}
  </div>
  <div class="card no-print">
    <h2>e-Okul'dan Not Ortalamalarını Yükle</h2>
    <p class="small">Programın e-Okul'a doğrudan bağlantısı yok (e-Okul'un böyle bir açık bağlantı/API imkanı yok, giriş bilgilerinizi de isteyip saklamayız). Ama e-Okul'dan indirdiğiniz not çizelgesi Excel dosyasını doğrudan buraya yükleyebilirsiniz — dosyada bir yerde <b>Okul No</b> ve <b>Not/Ortalama</b> sütunlarını arar, okul numarası burada kayıtlı bir öğrenciyle eşleşince notunu otomatik günceller.</p>
    <div class="row" style="max-width:400px"><button class="btn primary" onclick="notOrtalamalariExcelYukle()">Excel Yükle</button><button class="btn" onclick="wordDosyasiniTextareayaYukle('not-ort-paste', () => notOrtalamalariIceAktar())">Word Yükle</button></div>
    <p class="small" style="margin-top:14px;">Excel/Word dosyanız yoksa, Okul No ve Not sütunlarını elle kopyalayıp (Ctrl+C) aşağıya yapıştırabilirsiniz (Ctrl+V):</p>
    <textarea id="not-ort-paste" style="width:100%;height:80px;font-family:monospace;font-size:11.5px;" placeholder="57&#9;90&#10;68&#9;50"></textarea>
    <div class="row" style="max-width:200px"><button class="btn" onclick="notOrtalamalariIceAktar()">Yapıştırılanı Yükle</button></div>
  </div>`;
}
/* -- Sekme 3: Tercihler -- */
function viewStajTercihler() {
  const bySinif = stajBySinif();
  const sinifKeys = Object.keys(bySinif).sort();
  const listHtml = sinifKeys.length ? sinifKeys.map(sinif => {
    const rows = bySinif[sinif].map(st => `
      <tr>
        <td>${st.okulNo || ''}</td>
        <td>${escHtml(st.ad)}</td>
        <td class="no-print"><input type="text" value="${escHtml(st.tercihler)}" placeholder="1. tercih, 2. tercih, ..." style="width:100%;" onchange="updateStudentAlan('${st.id}','tercihler',this.value)"></td>
        <td class="print-only-cell">${escHtml(st.tercihler || '—')}</td>
        <td class="no-print"><input type="text" value="${escHtml(st.istemiyor)}" placeholder="istemediği işletmeler" style="width:100%;" onchange="updateStudentAlan('${st.id}','istemiyor',this.value)"></td>
        <td class="print-only-cell">${escHtml(st.istemiyor || '—')}</td>
      </tr>`).join("");
    return `<div class="card" style="overflow-x:auto;"><h2 style="margin-top:0;">${escHtml(sinif)}</h2><table><tr><th>Okul No</th><th>Ad Soyad</th><th>Tercihleri (öncelik sırasıyla virgülle)</th><th>İstemediği İşletmeler (virgülle)</th></tr>${rows}</table></div>`;
  }).join("") : `<div class="card"><p class="small">Henüz öğrenci eklenmedi — önce Öğrenciler sekmesinden ekleyin.</p></div>`;
  return `
  <div class="card no-print">
    <h2>Tercihler</h2>
    <p class="small">Her öğrencinin hangi işletmeleri, hangi sırayla tercih ettiğini girin (1. tercih önce). Otomatik Yerleştirme önce bu tercihlere göre eşleştirme dener, kontenjan dolmuşsa sıradaki tercihe bakar.</p>
    ${belgeAracCubugu("Staj Yerleştirme - Tercihler")}
  </div>
  <div class="print-area">
    ${belgeYazdirmaBasligi("Staj Yerleştirme — Tercihler")}
    ${listHtml}
  </div>`;
}
/* -- Sekme 4: İşletme Kontenjanları -- */
function viewStajKontenjanlar() {
  const dallar = [...new Set(S.students.map(s => s.dal).filter(Boolean))];
  const kontenjanRows = S.isletmeler.map(isl => `
    <tr>
      <td>${escHtml(isl.name)}</td>
      ${dallar.map(d => `<td><input type="number" min="0" value="${escHtml(isl.kontenjanlar[d] || '')}" style="width:60px;" onchange="setIsletmeKontenjan('${isl.id}','${jsq(d)}',this.value)"></td>`).join("")}
      <td><input type="text" value="${escHtml(isl.talep)}" placeholder="örn. Ali Rıza Yetim, Mehmet Mamak" style="width:220px;" onchange="setIsletmeTalep('${isl.id}',this.value)"></td>
    </tr>`).join("") || `<tr><td colspan="${dallar.length + 2}" class="small">Önce Ders Programı &gt; Koordinatörlük'ten işletme ekleyin.</td></tr>`;
  return `
  <div class="card no-print">
    <h2>İşletme Kontenjanları</h2>
    <p class="small">Her işletmenin dal başına kaç öğrenci alabileceğini ve varsa özellikle istediği (isimle talep ettiği) öğrencileri buradan girin. İşletme listesi <b>Koordinatörlük</b> sekmesine eklediğiniz işletmelerden gelir.</p>
    ${belgeAracCubugu("Staj Yerleştirme - İşletme Kontenjanları")}
  </div>
  <div class="print-area">
    ${belgeYazdirmaBasligi("Staj Yerleştirme — İşletme Kontenjanları")}
    <div class="card">
      <table><thead><tr><th>İşletme</th>${dallar.map(d => `<th>${escHtml(d)} Kontenjanı</th>`).join("")}<th>Talep Ettiği Öğrenciler</th></tr></thead>
      <tbody>${kontenjanRows}</tbody></table>
    </div>
  </div>`;
}
/* -- Sekme 5: Sonuç / Yerleştirme (çıktı) -- */
function viewStajSonuc() {
  const bySinif = stajBySinif();
  const sinifKeys = Object.keys(bySinif).sort();
  const listHtml = sinifKeys.length ? sinifKeys.map(sinif => {
    const rows = bySinif[sinif].map(st => `
      <tr>
        <td>${st.okulNo || ''}</td>
        <td>${escHtml(st.ad)}</td>
        <td>${st.dal || ''}</td>
        <td class="no-print"><select onchange="setStudentIsletme('${st.id}', this.value)">${studentIsletmeOptions(st.isletme)}</select>${st.yerlestirmeSirasi ? `<div class="small">${yerlestirmeSirasiPill(st.yerlestirmeSirasi)}</div>` : ""}</td>
        <td class="print-only-cell">${escHtml(st.isletme || '—')}</td>
      </tr>`).join("");
    return `<div class="card"><h2 style="margin-top:0;">${escHtml(sinif)}</h2><table><tr><th>Okul No</th><th>Ad Soyad</th><th>Dal</th><th>İşletme</th></tr>${rows}</table></div>`;
  }).join("") : `<div class="card"><p class="small">Henüz öğrenci eklenmedi.</p></div>`;

  const k = S.kurumBilgileri;
  return `
  <div class="card no-print">
    <h2>Sonuç / Yerleştirme</h2>
    <p class="small">Not Ortalamaları ve Tercihler sekmelerinden girdiğiniz bilgilere göre, İşletme Kontenjanları sekmesindeki kontenjanları dikkate alarak otomatik işletme ataması yapar. Sırasıyla: önce işletmenin özellikle istediği öğrenciler, sonra nota göre sıralı tercih eşleştirmesi, sonra kalan kontenjana göre döngüsel dağıtım (istemediği işletmeler elenir), son çare olarak zorunlu atama. <b>Zaten işletmesi atanmış öğrenciler değiştirilmez</b>. İstediğiniz öğrencinin işletmesini buradan elle de değiştirebilirsiniz. İşlem bitince kaç öğrencinin nasıl yerleştiği size ayrıca bildirilir.</p>
    <div class="row" style="max-width:260px"><button class="btn primary" onclick="stajOtomatikYerlestir()">Otomatik Yerleştir</button></div>
    ${belgeAracCubugu("Staj Yerleştirme - Sonuç")}
  </div>
  <div class="print-area">
    ${belgeYazdirmaBasligi("Staj Yerleştirme — Sonuç")}
    ${listHtml}
    <div style="margin-top:16px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:20px;">
      <div>
        <div>.../…/....</div>
        <div style="margin-top:24px;font-weight:600;">${escHtml(k.alanSefiAdi)}</div>
        <div>${escHtml(k.alanSefiUnvani)}</div>
      </div>
      <div style="text-align:right;">
        <div>UYGUNDUR</div>
        <div style="margin-top:24px;font-weight:600;">${escHtml(k.mudurAdi)}</div>
        <div>Okul Müdürü</div>
      </div>
    </div>
  </div>`;
}
function dalForSinif(sinif) {
  const cls = S.classes.find(c => c.name === sinif);
  return cls ? cls.dal : "";
}
function stajListedenTopluEkleModal() {
  const siniflar = ogrenciListesiSiniflari();
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:380px;">
        <h3>Öğrenci Listesinden Toplu Ekle</h3>
        <p class="small">Öğrenci Listesi modülünde kayıtlı bir sınıf seçin — o sınıftaki, burada henüz olmayan tüm öğrenciler tek seferde eklensin (işletme ataması boş gelir, siz atarsınız).</p>
        <label class="small">Sınıf</label>
        <select id="staj-liste-sinif" style="width:100%">
          ${siniflar.map(s => `<option value="${jsq(s)}">${escHtml(s)} (${ogrencilerForSinif(s).length} öğrenci)</option>`).join("")}
        </select>
        <div class="row">
          <button class="btn primary" onclick="stajListedenTopluEkleUygula()">Ekle</button>
          <button class="btn" onclick="closeModal()">İptal</button>
        </div>
      </div>
    </div>`;
}
function stajListedenTopluEkleUygula() {
  const secim = document.getElementById("staj-liste-sinif");
  if (!secim) return;
  const sinif = secim.value;
  const mevcut = new Set(S.students.filter(s => s.sinif === sinif && s.okulNo).map(s => s.okulNo));
  const dal = dalForSinif(sinif);
  let eklenen = 0;
  ogrencilerForSinif(sinif).forEach(o => {
    if (mevcut.has(o.okulNo)) return;
    S.students.push({ id: uid("st"), sinif, okulNo: o.okulNo, ad: (o.ad + " " + o.soyad).trim(), dal, isletme: "" });
    eklenen++;
  });
  save(); closeModal(); renderMain();
  alert(eklenen ? `${eklenen} öğrenci eklendi.` : "Eklenecek yeni öğrenci bulunamadı (hepsi zaten listede ya da seçilen sınıfta kayıt yok).");
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
      <div class="modal" style="width:420px;">
        <h3>Öğrenciyi Düzenle</h3>
        <label class="small">Sınıf</label><input type="text" id="es-sinif" value="${escHtml(st.sinif || '')}" style="width:100%">
        <label class="small">Okul No</label><input type="text" id="es-okulno" value="${escHtml(st.okulNo || '')}" style="width:100%">
        <label class="small">Ad Soyad</label><input type="text" id="es-ad" value="${escHtml(st.ad || '')}" style="width:100%">
        <label class="small">Dal</label><input type="text" id="es-dal" value="${escHtml(st.dal || '')}" style="width:100%">
        <p class="small">Not ortalaması "Not Ortalamaları", tercihleri "Tercihler" sekmesinden girilir.</p>
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
  if (st) { st.isletme = isletme; st.yerlestirmeSirasi = ""; }
  save(); renderMain();
}
function updateStudentAlan(id, field, value) {
  const st = S.students.find(s => s.id === id);
  if (st) st[field] = value.trim();
  save();
}
function setIsletmeKontenjan(isletmeId, dal, value) {
  const isl = isletmeById(isletmeId);
  if (!isl) return;
  if (!isl.kontenjanlar) isl.kontenjanlar = {};
  isl.kontenjanlar[dal] = value.trim();
  save();
}
function setIsletmeTalep(isletmeId, value) {
  const isl = isletmeById(isletmeId);
  if (!isl) return;
  isl.talep = value.trim();
  save();
}
function yerlestirmeSirasiPill(sira) {
  const cls = sira === "Zorunlu Atama" ? "warn" : sira === "Otomatik" ? "info" : "ok";
  return `<span class="pill ${cls}">${escHtml(sira)}</span>`;
}
/* ---- Staj Otomatik Yerleştirme ----
   Kullanıcının bize verdiği gerçek VBA makrosundaki algoritmanın (5 adım:
   işletme talebi → nota göre sıralı tercih eşleştirme → döngüsel otomatik
   dağıtım → zorunlu atama) JavaScript'e taşınmış hâli — artık Excel/VBA
   kurulumuna gerek kalmadan program içinde çalışıyor. Sadece işletmesi
   BOŞ olan öğrencilere uygulanır; elle atanmış işletmeler korunur. */
function trIcerir(hedef, aranan) {
  const a = trLower(hedef), b = trLower(aranan);
  return a.indexOf(b) >= 0 || b.indexOf(a) >= 0;
}
function stajOtomatikYerlestir() {
  const bosOgrenciler = S.students.filter(s => !s.isletme);
  if (!bosOgrenciler.length) { alert("İşletmesi boş öğrenci yok — hepsi zaten atanmış."); return; }
  if (!confirm(bosOgrenciler.length + " öğrenci için otomatik yerleştirme yapılacak. Devam edilsin mi?")) return;

  const dallar = [...new Set(bosOgrenciler.map(s => s.dal).filter(Boolean))];
  let talepSayisi = 0, tercihSayisi = 0, otomatikSayisi = 0, zorunluSayisi = 0;
  const yerlesemeyenler = [];

  dallar.forEach(dal => {
    const ogrenciler = bosOgrenciler.filter(s => s.dal === dal);
    const kalanKontenjan = {};
    S.isletmeler.forEach(isl => { kalanKontenjan[isl.id] = parseInt(isl.kontenjanlar[dal], 10) || 0; });
    const yerlesti = new Set();

    // Adım 1: İşletme Talebi
    S.isletmeler.forEach(isl => {
      if (!isl.talep) return;
      isl.talep.split(",").map(s => s.trim()).filter(Boolean).forEach(aranan => {
        if (kalanKontenjan[isl.id] <= 0) return;
        const ogr = ogrenciler.find(o => !yerlesti.has(o.id) && trIcerir(o.ad, aranan));
        if (ogr) {
          ogr.isletme = isl.name; ogr.yerlestirmeSirasi = "İşletme Talebi";
          yerlesti.add(ogr.id); kalanKontenjan[isl.id]--; talepSayisi++;
        }
      });
    });

    // Adım 2: Nota göre sıralı, tercihe göre yerleştirme
    const siraliOgrenciler = ogrenciler.filter(o => !yerlesti.has(o.id))
      .slice().sort((a, b) => (parseFloat(String(b.not).replace(",", ".")) || 0) - (parseFloat(String(a.not).replace(",", ".")) || 0));
    siraliOgrenciler.forEach(ogr => {
      if (yerlesti.has(ogr.id)) return;
      const tercihler = (ogr.tercihler || "").split(",").map(s => s.trim()).filter(Boolean);
      for (let t = 0; t < tercihler.length; t++) {
        const isl = S.isletmeler.find(i => kalanKontenjan[i.id] > 0 && trIcerir(i.name, tercihler[t]));
        if (isl) {
          ogr.isletme = isl.name; ogr.yerlestirmeSirasi = (t + 1) + ". Tercih";
          yerlesti.add(ogr.id); kalanKontenjan[isl.id]--; tercihSayisi++;
          break;
        }
      }
    });

    // Adım 3: Döngüsel otomatik dağıtım (istemiyor'u dikkate al), sonra zorunlu atama
    let pointer = 0;
    const islListesi = S.isletmeler;
    ogrenciler.filter(o => !yerlesti.has(o.id)).forEach(ogr => {
      const istemiyor = (ogr.istemiyor || "").split(",").map(s => s.trim()).filter(Boolean);
      let atandi = false;
      for (let pass = 0; pass < 2 && !atandi; pass++) {
        for (let d = 0; d < islListesi.length; d++) {
          const idx = (pointer + d) % islListesi.length;
          const isl = islListesi[idx];
          if (kalanKontenjan[isl.id] <= 0) continue;
          const istenmiyorMu = pass === 0 && istemiyor.some(x => trIcerir(isl.name, x));
          if (istenmiyorMu) continue;
          ogr.isletme = isl.name;
          ogr.yerlestirmeSirasi = pass === 0 ? "Otomatik" : "Zorunlu Atama";
          if (pass === 0) otomatikSayisi++; else zorunluSayisi++;
          yerlesti.add(ogr.id);
          kalanKontenjan[isl.id]--;
          pointer = (idx + 1) % islListesi.length;
          atandi = true;
          break;
        }
      }
      if (!atandi) yerlesemeyenler.push(ogr.ad);
    });
  });

  save();
  renderMain();
  let mesaj = `Otomatik yerleştirme tamamlandı:\n${talepSayisi} öğrenci işletme talebiyle\n${tercihSayisi} öğrenci tercihiyle\n${otomatikSayisi} öğrenci otomatik dağıtımla\n${zorunluSayisi} öğrenci zorunlu atamayla yerleşti.`;
  if (yerlesemeyenler.length) mesaj += `\n\nHiç yerleştirilemeyen (${yerlesemeyenler.length}): ${yerlesemeyenler.join(", ")} — bu öğrencilerin dalında hiçbir işletmede kontenjan kalmamış olabilir, yukarıdaki kontenjan tablosunu kontrol edin.`;
  alert(mesaj);
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
function notOrtalamalariUygula(kayitlar) {
  let guncellenen = 0, eslesmeyen = 0;
  kayitlar.forEach(k => {
    const okulNo = String(k.okulNo || "").trim();
    const not = String(k.not !== undefined ? k.not : "").trim();
    if (!okulNo) return;
    const st = S.students.find(s => s.okulNo === okulNo);
    if (st) { st.not = not; guncellenen++; } else { eslesmeyen++; }
  });
  save();
  renderMain();
  alert(`${guncellenen} öğrencinin not ortalaması güncellendi.` + (eslesmeyen ? ` ${eslesmeyen} okul numarası burada kayıtlı öğrenciyle eşleşmedi — önce Öğrenciler sekmesinden ekleyin.` : ""));
}
function notOrtalamalariIceAktar() {
  const raw = document.getElementById("not-ort-paste").value;
  const lines = raw.split("\n").map(l => l.replace(/\r$/, "")).filter(l => l.trim());
  const kayitlar = lines.map(line => {
    const cols = line.split("\t");
    return { okulNo: cols[0], not: cols[1] };
  }).filter(k => k.okulNo !== undefined && k.not !== undefined);
  document.getElementById("not-ort-paste").value = "";
  notOrtalamalariUygula(kayitlar);
}
function notOrtalamalariExcelYukle() {
  if (!window.desktop || !window.desktop.isElectron) { alert("Excel yükleme sadece masaüstü uygulamasında çalışır."); return; }
  window.desktop.openXlsxDialog().then(filePath => {
    if (!filePath) return;
    window.desktop.importNotOrtalamaXlsx(filePath).then(result => {
      const kayitlar = result.kayitlar || [];
      if (!kayitlar.length) { alert("Bu dosyada Okul No ve Not/Ortalama sütunları bulunamadı."); return; }
      notOrtalamalariUygula(kayitlar);
    }).catch(e => alert("Yükleme hatası: " + e.message));
  });
}
function wordDosyasiniTextareayaYukle(textareaId, uygulaFn) {
  if (!window.desktop || !window.desktop.isElectron) { alert("Word yükleme sadece masaüstü uygulamasında çalışır."); return; }
  window.desktop.openWordDialog().then(filePath => {
    if (!filePath) return;
    window.desktop.importWordTable(filePath).then(result => {
      const text = (result && result.text) || "";
      if (!text.trim()) { alert("Bu Word dosyasında okunabilir bir tablo/metin bulunamadı."); return; }
      document.getElementById(textareaId).value = text;
      uygulaFn();
    }).catch(e => alert("Yükleme hatası: " + e.message));
  });
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
async function exportCurrentViewAsWord(dosyaAdi) {
  if (!window.desktop || !window.desktop.isElectron) { alert("Word olarak indirme sadece masaüstü uygulamasında çalışır."); return; }
  const area = document.querySelector(".print-area");
  const html = area ? area.innerHTML : "";
  if (!html.trim()) { alert("Bu sayfada indirilecek bir belge içeriği bulunamadı."); return; }
  const path = await window.desktop.exportWord(guvenliDosyaAdi(dosyaAdi) + ".doc", html);
  if (path) alert("Word olarak kaydedildi:\n" + path);
}
let indirMenuDosyaAdi = "";
function toggleIndirMenu(dosyaAdi) {
  indirMenuDosyaAdi = dosyaAdi;
  const menu = document.getElementById("indir-menu");
  if (!menu) return;
  const willOpen = menu.style.display !== "block";
  document.querySelectorAll(".indir-menu").forEach(m => { m.style.display = "none"; });
  menu.style.display = willOpen ? "block" : "none";
}
function runIndirOption(format) {
  document.querySelectorAll(".indir-menu").forEach(m => { m.style.display = "none"; });
  if (format === "pdf") exportCurrentViewAsPdf(indirMenuDosyaAdi);
  else if (format === "excel") exportCurrentViewAsExcel(indirMenuDosyaAdi);
  else if (format === "word") exportCurrentViewAsWord(indirMenuDosyaAdi);
}
document.addEventListener("click", (e) => {
  if (!e.target.closest(".indir-dropdown")) {
    document.querySelectorAll(".indir-menu").forEach(m => { m.style.display = "none"; });
  }
});
function belgeAracCubugu(dosyaAdi) {
  return `<div class="row no-print" style="margin-top:10px;">
    <button class="btn primary" onclick="printCurrentView()">Yazdır</button>
    <div class="indir-dropdown">
      <button class="btn" onclick="toggleIndirMenu('${jsq(dosyaAdi)}')">İndir ▾</button>
      <div id="indir-menu" class="indir-menu">
        <div onclick="runIndirOption('pdf')">PDF Olarak Kaydet</div>
        <div onclick="runIndirOption('excel')">Excel Olarak İndir</div>
        <div onclick="runIndirOption('word')">Word Olarak İndir</div>
      </div>
    </div>
  </div>`;
}
/* ---- Sekme Dropdown (genel amaçlı) ----
   Çok sayıda seçenek olduğunda (sınıf, ay, ders listesi vb.) yan yana
   dizilmiş onlarca buton yerine, İndir menüsüyle aynı mantıkta tek bir
   açılır/kapanır liste gösterir: butona tıklayınca seçenekler alt alta
   açılır, bir seçenek tıklanınca ya da dışarı tıklanınca kapanır. */
document.addEventListener("click", (e) => {
  if (!e.target.closest(".tab-dropdown")) {
    document.querySelectorAll(".tab-dropdown-menu.show").forEach(m => m.classList.remove("show"));
  }
});
function toggleTabDropdown(groupId) {
  const menu = document.getElementById("tabdd-" + groupId);
  if (!menu) return;
  const willOpen = !menu.classList.contains("show");
  document.querySelectorAll(".tab-dropdown-menu.show").forEach(m => m.classList.remove("show"));
  if (willOpen) menu.classList.add("show");
}
function sekmeDropdown(groupId, secenekler, aktifDeger, onSelectExprSablonu) {
  const aktif = secenekler.find(s => String(s.value) === String(aktifDeger));
  const items = secenekler.map(s => {
    const expr = onSelectExprSablonu.split("{v}").join(jsq(s.value));
    return `<div class="tab-dropdown-item ${String(s.value) === String(aktifDeger) ? 'active' : ''}" onclick="${expr}; toggleTabDropdown('${jsq(groupId)}');">${escHtml(s.label)}</div>`;
  }).join("");
  return `<div class="tab-dropdown no-print">
    <button class="btn primary" onclick="toggleTabDropdown('${jsq(groupId)}')">${escHtml(aktif ? aktif.label : "Seçiniz")} ▾</button>
    <div id="tabdd-${groupId}" class="tab-dropdown-menu">${items || '<div class="tab-dropdown-item small">Seçenek yok</div>'}</div>
  </div>`;
}
function belgeYazdirmaBasligi(altBaslik) {
  const tarih = new Date().toLocaleDateString("tr-TR");
  const k = S.kurumBilgileri;
  return `<div class="print-doc-header print-only">
    <div style="display:flex;align-items:center;gap:10px;">
      ${k.logo ? `<img src="${k.logo}" style="height:34px;width:auto;max-width:90px;object-fit:contain;">` : ""}
      <div>
        <div class="okul">${escHtml(k.okulAdi)}</div>
        <div class="alan">${escHtml(k.alanAdi)}${altBaslik ? " · " + escHtml(altBaslik) : ""}</div>
      </div>
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
  p.haftalar.push({ tarih: "", kazanimlar: "", konular: "", yontem: "", arac: "", degerlendirme: "" });
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
      .map(h => ({ tarih: h.tarihAraligi, kazanimlar: "", konular: "", yontem: "", arac: "", degerlendirme: "" }));
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
function planiYeniYilaKopyala(kind, id) {
  const p = (kind === "yillik" ? S.yillikPlanlar : S.gunlukPlanlar).find(x => x.id === id);
  if (!p) return;
  const kopya = JSON.parse(JSON.stringify(p));
  kopya.id = uid(kind === "yillik" ? "yp" : "gp");
  let mesaj;
  if (kind === "yillik") {
    if (S.akademikTakvim && S.akademikTakvim.haftalar.length) {
      const yeniTarihler = S.akademikTakvim.haftalar.filter(h => !h.tatilMi).map(h => h.tarihAraligi);
      kopya.haftalar = kopya.haftalar.map((h, i) => Object.assign({}, h, { tarih: yeniTarihler[i] || "" }));
      mesaj = "Plan kopyalandı, tarihler Ayarlar > Akademik Takvim'deki güncel haftalarla eşleştirildi. Kazanım/konu/yöntem içeriğini gözden geçirip gerekirse düzenleyin.";
    } else {
      kopya.haftalar = kopya.haftalar.map(h => Object.assign({}, h, { tarih: "" }));
      mesaj = "Plan kopyalandı. Akademik Takvim henüz girilmediği için tarih sütunu boş bırakıldı — önce Ayarlar > Akademik Takvim'den yeni öğretim yılının haftalarını girip tekrar deneyebilir, ya da tarihleri elle doldurabilirsiniz.";
    }
    S.yillikPlanlar.push(kopya);
  } else {
    kopya.kayitlar = kopya.kayitlar.map(k => Object.assign({}, k, { tarih: "" }));
    S.gunlukPlanlar.push(kopya);
    mesaj = "Plan kopyalandı, içerik aynı kaldı — tarihleri elle güncelleyin.";
  }
  activePlanEntryId[kind] = kopya.id;
  save();
  renderMain();
  alert(mesaj);
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
  if (!window.desktop || !window.desktop.isElectron) { alert("Excel yükleme sadece masaüstü uygulamasında çalışır."); return; }
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
      alert("Yüklendi: " + parcalar.join(", ") + ".");
    }).catch(e => alert("Yükleme hatası: " + e.message));
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
      <td><textarea class="no-print" rows="3" style="width:100%;border:none;resize:vertical;font-family:inherit;font-size:11.5px;" oninput="updateYillikHafta('${p.id}',${i},'yontem',this.value)" onblur="save()">${escHtml(h.yontem)}</textarea><div class="print-only">${nlToBr(h.yontem)}</div></td>
      <td><textarea class="no-print" rows="3" style="width:100%;border:none;resize:vertical;font-family:inherit;font-size:11.5px;" oninput="updateYillikHafta('${p.id}',${i},'arac',this.value)" onblur="save()">${escHtml(h.arac)}</textarea><div class="print-only">${nlToBr(h.arac)}</div></td>
      <td><textarea class="no-print" rows="3" style="width:100%;border:none;resize:vertical;font-family:inherit;font-size:11.5px;" oninput="updateYillikHafta('${p.id}',${i},'degerlendirme',this.value)" onblur="save()">${escHtml(h.degerlendirme)}</textarea><div class="print-only">${nlToBr(h.degerlendirme)}</div></td>
      <td class="no-print"><button class="btn danger" onclick="removeYillikHafta('${p.id}',${i})">Sil</button></td>
    </tr>`).join("");
  const st = S.akademikTakvim && S.akademikTakvim.sinavTarihleri;
  const sinavHtml = st && (st.d1s1 || st.d1s2 || st.d2s1 || st.d2s2) ? `
  <div class="card no-print" style="margin-top:10px;">
    <div class="row small" style="flex-wrap:wrap;gap:14px;">
      <span><b>1. Dönem 1. Sınav:</b> ${escHtml(st.d1s1 || "-")}</span>
      <span><b>1. Dönem 2. Sınav:</b> ${escHtml(st.d1s2 || "-")}</span>
      <span><b>2. Dönem 1. Sınav:</b> ${escHtml(st.d2s1 || "-")}</span>
      <span><b>2. Dönem 2. Sınav:</b> ${escHtml(st.d2s2 || "-")}</span>
    </div>
  </div>
  <div class="print-only" style="margin-bottom:10px;">
    <b>1.D 1.Sınav:</b> ${escHtml(st.d1s1 || "-")} · <b>1.D 2.Sınav:</b> ${escHtml(st.d1s2 || "-")} · <b>2.D 1.Sınav:</b> ${escHtml(st.d2s1 || "-")} · <b>2.D 2.Sınav:</b> ${escHtml(st.d2s2 || "-")}
  </div>` : "";
  const ogretimYili = S.akademikTakvim ? S.akademikTakvim.ogretimYili : "";
  return `
  <div class="card no-print">
    <div class="row small" style="flex-wrap:wrap;gap:14px;align-items:center;">
      <span><b>Eğitim-Öğretim Yılı:</b> ${escHtml(ogretimYili || "-")}</span>
      <span><b>Ders:</b> ${escHtml(p.ders)}</span>
      <span><b>Sınıf:</b> ${escHtml(p.sinif)}</span>
      <span><b>Ders Saati:</b> ${escHtml(p.dersSaati || "-")}</span>
      <span><b>Alan/Dal:</b> ${escHtml(p.alanDal || "-")}</span>
      <button class="btn" onclick="editPlanEntryMeta('yillik','${p.id}')">Bilgileri Düzenle</button>
    </div>
  </div>
  <div class="print-only" style="margin-bottom:10px;">
    <b>Eğitim-Öğretim Yılı:</b> ${escHtml(ogretimYili || "-")} · <b>Ders:</b> ${escHtml(p.ders)} · <b>Sınıf:</b> ${escHtml(p.sinif)} · <b>Ders Saati:</b> ${escHtml(p.dersSaati || "-")} · <b>Alan/Dal:</b> ${escHtml(p.alanDal || "-")}
  </div>
  ${sinavHtml}
  <div class="card" style="overflow-x:auto;">
    <table style="width:100%;"><thead><tr><th style="width:90px;">Tarih</th><th>Kazanımlar</th><th>Konular</th><th>Öğrenme-Öğretme Yöntem ve Teknikleri</th><th>Kullanılan Eğitim Teknolojileri, Araç ve Gereçler</th><th>Değerlendirme</th><th class="no-print"></th></tr></thead>
    <tbody>${rows}</tbody></table>
    <div class="row no-print"><button class="btn" onclick="addYillikHafta('${p.id}')">Hafta Ekle</button></div>
  </div>
  <div class="card">
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:20px;">
      <div>
        <div>.../…/....</div>
        <div style="margin-top:24px;font-weight:600;">${escHtml(S.kurumBilgileri.alanSefiAdi || "")}</div>
        <div>Alan Şefi</div>
      </div>
      <div style="text-align:right;">
        <div>UYGUNDUR</div>
        <div style="margin-top:24px;font-weight:600;">${escHtml(S.kurumBilgileri.mudurAdi || "")}</div>
        <div>Okul Müdürü</div>
      </div>
    </div>
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
      <span><b>Alan/Dal:</b> ${escHtml(p.alanDal || "-")}</span>
      <span><b>Sınıf:</b> ${escHtml(p.sinif)}</span>
      <span><b>Öğretmen:</b> ${escHtml(p.ogretmen || "-")}</span>
      <span><b>Ders Saati:</b> ${escHtml(p.dersSaati || "-")}</span>
      <span><b>Ders Günü:</b> ${escHtml(p.dersGunu || "-")}</span>
      <button class="btn" onclick="editPlanEntryMeta('gunluk','${p.id}')">Bilgileri Düzenle</button>
    </div>
  </div>
  <div class="print-only" style="margin-bottom:10px;">
    <b>Ders:</b> ${escHtml(p.ders)} · <b>Alan/Dal:</b> ${escHtml(p.alanDal || "-")} · <b>Sınıf:</b> ${escHtml(p.sinif)} · <b>Öğretmen:</b> ${escHtml(p.ogretmen || "-")} · <b>Ders Saati:</b> ${escHtml(p.dersSaati || "-")} · <b>Ders Günü:</b> ${escHtml(p.dersGunu || "-")}
  </div>
  ${kayitlarHtml}
  <div class="row no-print"><button class="btn" onclick="addGunlukKayit('${p.id}')">Ders Kaydı Ekle</button></div>
  <div class="card">
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:20px;">
      <div>
        <div>.../…/....</div>
        <div style="margin-top:24px;font-weight:600;">${escHtml(S.kurumBilgileri.alanSefiAdi || "")}</div>
        <div>Alan Şefi / Öğretmen</div>
      </div>
      <div style="text-align:right;">
        <div>UYGUNDUR</div>
        <div style="margin-top:24px;font-weight:600;">${escHtml(S.kurumBilgileri.mudurAdi || "")}</div>
        <div>Okul Müdürü</div>
      </div>
    </div>
  </div>`;
}
function viewPlanModule(kind) {
  const title = kind === "yillik" ? "Yıllık Plan" : "Günlük Plan";
  const aciklama = kind === "yillik"
    ? "Her dersin haftalık kazanım/konu dağılımı. Kendi Excel dosyanızı yükleyerek veya elle düzenleyerek doldurabilirsiniz."
    : "Her dersin konu/kazanım/giriş-gelişme-sonuç/yöntem/ölçme-değerlendirme detayları. Kendi Excel dosyanızı yükleyerek veya elle düzenleyerek doldurabilirsiniz.";
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
        ${sekmeDropdown("plan-ders-" + kind, entries.map(e => ({ value: e.id, label: e.sinif + " — " + e.ders })), activePlanEntryId[kind], `selectPlanEntry('${jsq(kind)}','{v}')`)}
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
      Bu sistem için henüz yüklenmiş ${title.toLowerCase()} yok — yukarıda öğrenme birimi özetini görüyorsunuz. "Excel Yükle" ile kendi ${kaynakDosya} dosyanızı yükleyerek tam, düzenlenebilir planı oluşturabilirsiniz.
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
      <button class="btn" onclick="importPlanFromExcel()">Excel Yükle</button>
      ${activeEntry ? `<button class="btn" onclick="planiYeniYilaKopyala('${kind}','${activeEntry.id}')">Yeni Öğretim Yılı İçin Kopyala</button><button class="btn danger" onclick="deletePlanEntry('${kind}','${activeEntry.id}')">Bu Planı Sil</button>` : ""}
    </div>
    ${belgeAracCubugu(dosyaAdi)}
  </div>
  ${listHtml}
  <div class="print-area">
    ${belgeYazdirmaBasligi(dosyaAdi)}
    ${contentHtml}
  </div>`;
}

/* ---- Ders Bilgi Formları (MEB çerçeve öğretim programı kaynak belgeleri) ----
   src/js/ders-bilgi-formu-data.js içindeki DERS_BILGI_FORMLARI dizisinden
   okunur — kaydedilebilir bir S alanı değil, sadece MEB'in yayınladığı
   ders bilgi formu belgelerinin (AMP ve MESEM) programa gömülmüş, salt
   okunur bir kopyası. Üç farklı belge şekli var: (1) MESEM tam formlar —
   amaç/kazanım/modül tablosu hepsi ayrı ayrı; (2) AMP tablo formatlı
   belgeler — aynı alanlar var ama bazı alt alanlar (konular, modül süresi
   vb.) o belge biçiminde ayrı sütun olarak yer almıyor; (3) bazı kaynak
   PDF'ler sadece ham metin olarak çıkarılabildi (yapılandırılmış tablo
   yok) — bu durumda kaynak metin olduğu gibi gösterilir. */
let activeDbfProgram = null;
let activeDbfSinif = null;
let activeDbfDersAdi = null;
function dbfKayitlar() { return (typeof DERS_BILGI_FORMLARI !== "undefined" ? DERS_BILGI_FORMLARI : []); }
function dbfProgramlar() { return [...new Set(dbfKayitlar().map(r => r.program))]; }
function dbfSiniflar(program) {
  return [...new Set(dbfKayitlar().filter(r => r.program === program).map(r => r.sinif))]
    .sort((a, b) => a.localeCompare(b, "tr", { numeric: true }));
}
function dbfDersler(program, sinif) {
  return dbfKayitlar().filter(r => r.program === program && r.sinif === sinif)
    .sort((a, b) => a.dersAdi.localeCompare(b.dersAdi, "tr"));
}
function dbfKayit(program, sinif, dersAdi) {
  return dbfKayitlar().find(r => r.program === program && r.sinif === sinif && r.dersAdi === dersAdi);
}
function selectDbfProgram(v) { activeDbfProgram = v; activeDbfSinif = null; activeDbfDersAdi = null; renderMain(); }
function selectDbfSinif(v) { activeDbfSinif = v; activeDbfDersAdi = null; renderMain(); }
function selectDbfDers(v) { activeDbfDersAdi = v; renderMain(); }
function renderDbfDetay(r) {
  const yapilandirilmisVarMi = !!(r.dersAmaci || (r.modulTablosu && r.modulTablosu.length) || (r.moduller && r.moduller.length));
  if (!yapilandirilmisVarMi) {
    return `
    <div class="card small no-print" style="margin-bottom:10px;background:var(--bg-2, #f4f4f8);">
      Bu ders için kaynak belgeden çıkarılan ham metin bulunuyor; belge biçimi nedeniyle amaç/kazanım/modül tablosu ayrı ayrı ayrıştırılamadı. Aşağıda kaynak belgenin metni olduğu gibi gösteriliyor.
    </div>
    <div style="white-space:pre-wrap;font-family:inherit;font-size:12.5px;line-height:1.5;">${nlToBr(r.metinIcerik || "")}</div>
    <p class="small" style="margin-top:14px;">Kaynak: ${escHtml(r.kaynakDosya || "")}</p>`;
  }
  const kazanimlarHtml = (r.kazanimlar && r.kazanimlar.length)
    ? `<ul style="margin:6px 0 14px 18px;">${r.kazanimlar.map(k => `<li>${escHtml(k)}</li>`).join("")}</ul>`
    : `<p class="small" style="margin-bottom:14px;">Kazanım bilgisi bu belge biçiminde ayrı olarak listelenmemiş.</p>`;
  const tabloHtml = (r.modulTablosu && r.modulTablosu.length) ? `
    <table style="margin-top:6px;"><thead><tr><th>Modül Adı</th><th>Konular</th><th>Kazanım Sayısı (Modül)</th><th>Kazanım Sayısı (Ders)</th><th>Ders Saati</th><th>Ağırlık (%)</th></tr></thead>
    <tbody>${r.modulTablosu.map(m => `<tr><td>${escHtml(m.modulAdi)}</td><td>${escHtml(m.konular)}</td><td>${escHtml(m.kazanimSayisiModul)}</td><td>${escHtml(m.kazanimSayisiDers)}</td><td>${escHtml(m.dersSaati)}</td><td>${escHtml(m.agirlik)}</td></tr>`).join("")}</tbody></table>` : "";
  const modullerHtml = (r.moduller && r.moduller.length) ? r.moduller.map(m => `
    <div style="margin-top:14px;">
      <div style="font-weight:600;">${escHtml(m.modulAdi)}${m.modulSuresi ? " (" + escHtml(m.modulSuresi) + ")" : ""}</div>
      ${m.modulAmaci ? `<p class="small" style="margin:4px 0;">${escHtml(m.modulAmaci)}</p>` : ""}
      ${(m.kazanimlar && m.kazanimlar.length) ? `<div class="small" style="margin-top:4px;"><b>Kazanımlar:</b><ul style="margin:4px 0 0 18px;">${m.kazanimlar.map(k => `<li>${escHtml(k)}</li>`).join("")}</ul></div>` : ""}
      ${(m.aciklamalar && m.aciklamalar.length) ? `<div class="small" style="margin-top:4px;"><b>Açıklamalar:</b><ul style="margin:4px 0 0 18px;">${m.aciklamalar.map(a => `<li>${escHtml(a)}</li>`).join("")}</ul></div>` : ""}
    </div>`).join("") : "";
  return `
  <div style="margin-bottom:10px;"><b>Dersin Adı:</b> ${escHtml(r.dersAdi)}</div>
  <div class="row small" style="flex-wrap:wrap;gap:16px;margin-bottom:10px;">
    ${r.dersSuresi ? `<span><b>Ders Süresi:</b> ${escHtml(r.dersSuresi)}</span>` : ""}
    ${r.dersSinifi ? `<span><b>Dersin Sınıfı:</b> ${escHtml(r.dersSinifi)}</span>` : ""}
  </div>
  ${r.dersAmaci ? `<p style="margin-bottom:10px;"><b>Dersin Amacı:</b> ${escHtml(r.dersAmaci)}</p>` : ""}
  <div style="font-weight:600;margin-top:10px;">Dersin Kazanımları</div>
  ${kazanimlarHtml}
  ${tabloHtml ? `<div style="font-weight:600;margin-top:14px;">Modül-Kazanım-Süre Tablosu</div>${tabloHtml}` : ""}
  ${modullerHtml ? `<div style="font-weight:600;margin-top:16px;">Modüller</div>${modullerHtml}` : ""}
  <p class="small no-print" style="margin-top:16px;">Kaynak: ${escHtml(r.kaynakDosya || "")}</p>`;
}
function viewDersBilgiFormu() {
  const programlar = dbfProgramlar();
  if (programlar.length === 0) {
    return `<div class="card no-print"><h2>Ders Bilgi Formları</h2><p class="small">Henüz kaynak belge yüklenmemiş.</p></div>`;
  }
  if (activeDbfProgram && !programlar.includes(activeDbfProgram)) activeDbfProgram = null;

  const ustBar = `
  <div class="card no-print">
    <h2>Ders Bilgi Formları</h2>
    <p class="small">MEB çerçeve öğretim programlarına ait ders bilgi formları — dersin amacı, kazanımları ve modül/konu tablosu. Yıllık Plan ve Günlük Plan hazırlarken referans olarak kullanabilirsiniz. Program, sonra sınıf, sonra ders seçin.</p>
  </div>`;

  const programBar = `
  <div class="card no-print">
    <div class="small" style="margin-bottom:6px;font-weight:600;">1) Program</div>
    <div class="row" style="flex-wrap:wrap;">
      ${sekmeDropdown("dbf-program", programlar.map(p => ({ value: p, label: p })), activeDbfProgram, "selectDbfProgram('{v}')")}
    </div>
  </div>`;

  if (!activeDbfProgram) return ustBar + programBar;

  const siniflar = dbfSiniflar(activeDbfProgram);
  if (activeDbfSinif && !siniflar.includes(activeDbfSinif)) activeDbfSinif = null;
  const sinifBar = `
  <div class="card no-print">
    <div class="small" style="margin-bottom:6px;font-weight:600;">2) Sınıf</div>
    <div class="row" style="flex-wrap:wrap;">
      ${sekmeDropdown("dbf-sinif", siniflar.map(s => ({ value: s, label: s })), activeDbfSinif, "selectDbfSinif('{v}')")}
    </div>
  </div>`;

  if (!activeDbfSinif) return ustBar + programBar + sinifBar;

  const dersler = dbfDersler(activeDbfProgram, activeDbfSinif);
  if (activeDbfDersAdi && !dersler.some(d => d.dersAdi === activeDbfDersAdi)) activeDbfDersAdi = null;
  const dersBar = `
  <div class="card no-print">
    <div class="small" style="margin-bottom:6px;font-weight:600;">3) Ders</div>
    <div class="row" style="flex-wrap:wrap;">
      ${sekmeDropdown("dbf-ders", dersler.map(d => ({ value: d.dersAdi, label: d.dersAdi })), activeDbfDersAdi, "selectDbfDers('{v}')")}
    </div>
  </div>`;

  if (!activeDbfDersAdi) return ustBar + programBar + sinifBar + dersBar;

  const kayit = dbfKayit(activeDbfProgram, activeDbfSinif, activeDbfDersAdi);
  const dosyaAdi = "Ders Bilgi Formu - " + activeDbfDersAdi + " - " + activeDbfSinif;
  return `
  ${ustBar}
  ${programBar}
  ${sinifBar}
  ${dersBar}
  <div class="card no-print">${belgeAracCubugu(dosyaAdi)}</div>
  <div class="print-area">
    ${belgeYazdirmaBasligi("Ders Bilgi Formu")}
    <div class="card" style="overflow-x:auto;">${kayit ? renderDbfDetay(kayit) : '<p class="small">Kayıt bulunamadı.</p>'}</div>
  </div>`;
}

/* ---- Öğrenci Listesi (tek merkezi kaynak) ----
   Her öğretim yılı başında e-Okul'dan alınan "Sınıf Listesi" PDF'i buraya
   içe aktarılır; Beceri Sınavı, Kalfalık/Ustalık Sınavı ve Norm Kadro gibi
   öğrenci listesine ihtiyaç duyan modüller listeyi buradan çeker — her
   modülde ayrı ayrı öğrenci girmeye gerek kalmaz. */
let activeOgrenciListesiSinif = null;
function ogrencilerForSinif(sinif) {
  return S.ogrenciListesi.filter(o => o.sinif === sinif).sort((a, b) => (Number(a.okulNo) || 0) - (Number(b.okulNo) || 0));
}
function ogrenciListesiSiniflari() {
  const set = new Set(S.ogrenciListesi.map(o => o.sinif));
  S.classes.filter(c => c.grade > 0 && !c.excludeFromDistribution).forEach(c => set.add(c.name));
  return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
}
function mergeOgrenciListesiImport(result) {
  let eklenen = 0, guncellenen = 0;
  (result.siniflar || []).forEach(s => {
    s.ogrenciler.forEach(o => {
      const existing = S.ogrenciListesi.find(x => x.sinif === s.sinif && x.okulNo === o.okulNo);
      if (existing) {
        Object.assign(existing, { ad: o.ad, soyad: o.soyad, cinsiyet: o.cinsiyet, pansiyon: o.pansiyon });
        guncellenen++;
      } else {
        S.ogrenciListesi.push(Object.assign({ id: uid("og"), sinif: s.sinif }, o));
        eklenen++;
      }
    });
  });
  return { eklenen, guncellenen };
}
function importOgrenciListesiFromPdf() {
  if (!window.desktop || !window.desktop.isElectron) { alert("PDF yükleme sadece masaüstü uygulamasında çalışır."); return; }
  window.desktop.openPdfDialog().then(filePath => {
    if (!filePath) return;
    window.desktop.importOgrenciPdf(filePath).then(result => {
      if (!result.siniflar || !result.siniflar.length) {
        alert("Bu PDF'te tanıdığım bir e-Okul Sınıf Listesi bulunamadı. Dosyanın e-Okul'dan alınan \"Sınıf Listesi\" raporu olduğundan emin olun.");
        return;
      }
      const sonuc = mergeOgrenciListesiImport(result);
      activeOgrenciListesiSinif = result.siniflar[0].sinif;
      save();
      renderMain();
      alert(`Yüklendi: ${result.siniflar.length} sınıf, ${sonuc.eklenen} yeni öğrenci eklendi, ${sonuc.guncellenen} öğrenci güncellendi.`);
    }).catch(e => alert("Yükleme hatası: " + e.message));
  });
}
function importOgrenciListesiFromWord() {
  if (!window.desktop || !window.desktop.isElectron) { alert("Word yükleme sadece masaüstü uygulamasında çalışır."); return; }
  window.desktop.openWordDialog().then(filePath => {
    if (!filePath) return;
    window.desktop.importOgrenciWord(filePath).then(result => {
      if (!result.siniflar || !result.siniflar.length) {
        alert("Bu Word dosyasında tanıdığım bir e-Okul Sınıf Listesi bulunamadı. Dosyanın e-Okul'dan alınan \"Sınıf Listesi\" raporu olduğundan emin olun.");
        return;
      }
      const sonuc = mergeOgrenciListesiImport(result);
      activeOgrenciListesiSinif = result.siniflar[0].sinif;
      save();
      renderMain();
      alert(`Yüklendi: ${result.siniflar.length} sınıf, ${sonuc.eklenen} yeni öğrenci eklendi, ${sonuc.guncellenen} öğrenci güncellendi.`);
    }).catch(e => alert("Yükleme hatası: " + e.message));
  });
}
function addOgrenci(sinif) {
  S.ogrenciListesi.push({ id: uid("og"), sinif, okulNo: "", ad: "", soyad: "", cinsiyet: "Erkek", pansiyon: "" });
  save(); renderMain();
}
function updateOgrenci(id, field, value) {
  const o = S.ogrenciListesi.find(x => x.id === id);
  if (!o) return;
  o[field] = value;
  save();
}
function deleteOgrenci(id) {
  if (!confirm("Bu öğrenci listeden silinsin mi?")) return;
  S.ogrenciListesi = S.ogrenciListesi.filter(x => x.id !== id);
  save(); renderMain();
}
function setOgrenciListesiSinif(sinif) { activeOgrenciListesiSinif = sinif; renderMain(); }
function viewOgrenciListesi() {
  const siniflar = ogrenciListesiSiniflari();
  if (!activeOgrenciListesiSinif || !siniflar.includes(activeOgrenciListesiSinif)) activeOgrenciListesiSinif = siniflar[0] || null;
  const sinifBar = `<div class="row no-print" style="flex-wrap:wrap;">${sekmeDropdown("ogrenci-sinif", siniflar.map(s => ({ value: s, label: s + " (" + ogrencilerForSinif(s).length + ")" })), activeOgrenciListesiSinif, "setOgrenciListesiSinif('{v}')")}</div>`;
  const ogrenciler = activeOgrenciListesiSinif ? ogrencilerForSinif(activeOgrenciListesiSinif) : [];
  const rows = ogrenciler.map((o, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><input class="no-print" type="text" value="${escHtml(o.okulNo)}" style="width:70px" onchange="updateOgrenci('${o.id}','okulNo',this.value)"><span class="print-only-inline">${escHtml(o.okulNo)}</span></td>
      <td><input class="no-print" type="text" value="${escHtml(o.ad)}" style="width:130px" onchange="updateOgrenci('${o.id}','ad',this.value)"><span class="print-only-inline">${escHtml(o.ad)}</span></td>
      <td><input class="no-print" type="text" value="${escHtml(o.soyad)}" style="width:130px" onchange="updateOgrenci('${o.id}','soyad',this.value)"><span class="print-only-inline">${escHtml(o.soyad)}</span></td>
      <td class="no-print"><select onchange="updateOgrenci('${o.id}','cinsiyet',this.value)">
        <option value="Erkek" ${o.cinsiyet === "Erkek" ? "selected" : ""}>Erkek</option>
        <option value="Kız" ${o.cinsiyet === "Kız" ? "selected" : ""}>Kız</option>
      </select></td>
      <td class="print-only-cell">${escHtml(o.cinsiyet)}</td>
      <td><input class="no-print" type="text" value="${escHtml(o.pansiyon)}" placeholder="-" style="width:80px" onchange="updateOgrenci('${o.id}','pansiyon',this.value)"><span class="print-only-inline">${escHtml(o.pansiyon || "-")}</span></td>
      <td class="no-print"><button class="btn danger" onclick="deleteOgrenci('${o.id}')">Sil</button></td>
    </tr>`).join("");
  const erkek = ogrenciler.filter(o => o.cinsiyet === "Erkek").length;
  const kiz = ogrenciler.filter(o => o.cinsiyet === "Kız").length;
  const dosyaAdi = "Sınıf Listesi - " + (activeOgrenciListesiSinif || "");
  return `
  <div class="card no-print">
    <h2>Öğrenci Listesi</h2>
    <p class="small">Her öğretim yılı başında e-Okul'dan aldığınız "Sınıf Listesi" raporunu (PDF veya Word) buraya yükleyin (birden fazla sınıf/şube aynı dosyada olabilir, hepsi tek seferde işlenir). Beceri Sınavı, Kalfalık/Ustalık Sınavı ve Norm Kadro gibi öğrenci listesine ihtiyaç duyan modüller bu listeyi buradan çeker — yıl değiştiğinde tek yapmanız gereken, yeni dosyayı buradan yüklemek.</p>
    <div class="row">
      <button class="btn primary" onclick="importOgrenciListesiFromPdf()">Sınıf Listesi PDF Yükle</button>
      <button class="btn primary" onclick="importOgrenciListesiFromWord()">Sınıf Listesi Word Yükle</button>
      ${activeOgrenciListesiSinif ? `<button class="btn" onclick="addOgrenci('${jsq(activeOgrenciListesiSinif)}')">Elle Öğrenci Ekle</button>` : ""}
    </div>
    ${sinifBar}
    ${activeOgrenciListesiSinif ? belgeAracCubugu(dosyaAdi) : ""}
  </div>
  ${activeOgrenciListesiSinif ? `
  <div class="print-area">
    ${belgeYazdirmaBasligi(dosyaAdi)}
    <div class="card" style="overflow-x:auto;">
      <table style="width:100%;">
        <thead><tr><th>S.No</th><th>Öğrenci No</th><th>Adı</th><th>Soyadı</th><th>Cinsiyeti</th><th>Pansiyon</th><th class="no-print"></th></tr></thead>
        <tbody>${rows || `<tr><td colspan="7" class="small">Bu sınıfta henüz öğrenci yok.</td></tr>`}</tbody>
      </table>
      <div class="print-only" style="margin-top:14px;">
        <div>Sınıf Öğretmeni: ..................................</div>
        <div style="margin-top:8px;">Sınıf Müdür Yrd: ..................................</div>
        <div style="margin-top:8px;">Sınıf Başkan Yrd: ..................................</div>
        <div style="margin-top:8px;">Sınıf Başkanı: ..................................</div>
      </div>
      <p class="small" style="margin-top:8px;">Kız Öğrenci Sayısı: ${kiz} · Erkek Öğrenci Sayısı: ${erkek} · Toplam: ${ogrenciler.length}</p>
    </div>
  </div>` : `<div class="card small" style="text-align:center;padding:30px 20px;">Henüz hiçbir sınıf için öğrenci listesi yok. Yukarıdan PDF yükleyebilir ya da bir sınıf seçip elle ekleyebilirsiniz.</div>`}`;
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
function setNormKadroSayisi(value) {
  S.normKadro.normKadroSayisi = value;
  save(); renderMain();
}
function setNormKadroOgrenciSayisi(classId, value) {
  const n = parseInt(value);
  if (Number.isFinite(n) && n >= 0) S.normKadro.ogrenciSayilari[classId] = n;
  else delete S.normKadro.ogrenciSayilari[classId];
  save(); renderMain();
}
function normKadroOgrenciSayisiniListedenDoldur(classId, sinifAdi) {
  const n = ogrencilerForSinif(sinifAdi).length;
  if (!n) { alert(`"${sinifAdi}" için Öğrenci Listesi'nde henüz kayıt yok. Önce Öğrenci Listesi modülünden PDF yükleyin.`); return; }
  S.normKadro.ogrenciSayilari[classId] = n;
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
    <div class="card">
      <div class="row no-print" style="align-items:center;margin-top:0;">
        <h3 style="margin:0;">${escHtml(cls.name)} Sınıfı</h3>
        <label class="small" style="margin-left:10px;">Öğrenci Sayısı:</label>
        <input type="number" min="0" value="${ogrenciSayisi !== undefined ? ogrenciSayisi : ''}" style="width:70px" onchange="setNormKadroOgrenciSayisi('${cls.id}',this.value)">
        <button class="btn" style="padding:4px 8px;font-size:11px;" onclick="normKadroOgrenciSayisiniListedenDoldur('${cls.id}','${jsq(cls.name)}')" title="Öğrenci Listesi modülündeki güncel sayıyla doldur">Listeden Doldur</button>
        <span class="small">(Grup Sayısı: ${grup === null ? '—' : grup}, norm formülüne göre otomatik)</span>
      </div>
      <p class="print-only" style="font-weight:700;margin:10px 0 4px;">${escHtml(cls.name)} Sınıfı — Öğrenci Sayısı: ${ogrenciSayisi !== undefined ? ogrenciSayisi : '—'}</p>
      <table><thead><tr><th>No</th><th>Sınıf</th><th>Ders Adı</th><th>Haftalık Saat</th><th>Grup Sayısı</th><th>Toplam Ders Saati</th></tr></thead>
      <tbody>${rows}</tbody></table>
    </div>`;
  }).join("") || `<div class="card"><p class="small">Ders Programı → Sınıflar ve Ders Atama'dan sınıflara ders atadıkça burada otomatik listelenecek.</p></div>`;

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
    <h2 style="margin-top:0;">AMP Mesleki Alan Dersleri</h2>
    ${sinifBlocks}
    <div class="card" style="text-align:right;">
      <b>AMP Mesleki Alan Dersleri Toplamı: ${ampToplam} saat</b>
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
      <div class="no-print" style="margin-top:10px;"><label class="small">NORM KADRO: <input type="text" value="${escHtml(S.normKadro.normKadroSayisi)}" style="width:60px;text-align:center;" onchange="setNormKadroSayisi(this.value)"></label></div>
      ${S.normKadro.normKadroSayisi ? `<p class="print-only" style="font-weight:700;margin-top:8px;">NORM KADRO: ${escHtml(S.normKadro.normKadroSayisi)}</p>` : ""}
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
const VELI_GUNDEM_STANDART = [
  "Açılış ve yoklama",
  "Sınıf/alan öğretmeninin ve okul idaresinin tanıtılması",
  "Okulun ve alanın fiziki imkanları, atölye/laboratuvar olanakları hakkında bilgilendirme",
  "Eğitim-öğretim yılı akademik takvimi, ders programı ve haftalık ders saatleri hakkında bilgilendirme",
  "Ölçme-değerlendirme sistemi, sınav ve performans değerlendirme kriterleri hakkında bilgilendirme",
  "Öğrencilerin genel akademik ve davranışsal durumu hakkında bilgilendirme",
  "Devam-devamsızlık kuralları ve önemi",
  "Okul kuralları, kılık-kıyafet ve disiplin yönetmeliği hakkında bilgilendirme",
  "İş sağlığı ve güvenliği, atölye çalışma kuralları ve kişisel koruyucu donanım kullanımı hakkında bilgilendirme",
  "Staj / işletmede mesleki eğitim süreci hakkında bilgilendirme (varsa)",
  "Veli-öğretmen iletişim yöntemleri (e-Okul, görüşme saatleri, telefon/e-posta)",
  "Ders dışı etkinlikler, sosyal kulüpler ve geziler hakkında bilgilendirme",
  "Veli görüş, öneri ve talepleri",
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
          <option value="veli">Veli Toplantısı</option>
        </select>
        <label class="small">Başlık</label><input type="text" id="at-baslik" placeholder="örn. 10-A Sınıfı 1. Dönem Şube Öğretmenler Kurulu" style="width:100%">
        <label class="small">Sınıf / Ders (opsiyonel)</label><input type="text" id="at-sinifders" style="width:100%">
        <label class="small">Öğretim Yılı</label><input type="text" id="at-yil" value="${S.akademikTakvim ? S.akademikTakvim.ogretimYili : ''}" style="width:100%">
        <label class="small">Dönem</label><input type="text" id="at-donem" placeholder="örn. 1. Dönem" style="width:100%">
        <label class="small">Toplantıyı Yöneten (Başkan / Sınıf Öğretmeni)</label><input type="text" id="at-baskan" style="width:100%">
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
  const standart = tur === "sube" ? SUBE_GUNDEM_STANDART : tur === "veli" ? VELI_GUNDEM_STANDART : ZUMRE_GUNDEM_STANDART;
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
function toplantiYeniDonemeKopyala(id) {
  const top = toplantiById(id);
  if (!top) return;
  const varsayilan = (S.akademikTakvim && S.akademikTakvim.ogretimYili ? S.akademikTakvim.ogretimYili : "") + " " + (top.baslik || "");
  const yeniBaslik = prompt('Bu tutanak, içeriği (katılımcılar, gündem maddeleri, kararlar) korunarak yeni bir tutanak olarak kopyalanacak — orijinali silinmeyecek. Yeni tutanağa hangi başlığı vermek istersiniz?', varsayilan.trim());
  if (!yeniBaslik || !yeniBaslik.trim()) return;
  const kopya = JSON.parse(JSON.stringify(top));
  kopya.id = uid("top");
  kopya.baslik = yeniBaslik.trim();
  kopya.ogretimYili = S.akademikTakvim && S.akademikTakvim.ogretimYili ? S.akademikTakvim.ogretimYili : top.ogretimYili;
  kopya.tarih = ""; kopya.yer = ""; kopya.saat = ""; kopya.zumreNo = "";
  kopya.katilimcilar = kopya.katilimcilar.map(k => Object.assign({}, k, { id: uid("kt") }));
  kopya.gorevDagilimi = kopya.gorevDagilimi.map(g => Object.assign({}, g, { id: uid("gd") }));
  kopya.gundemMaddeleri = kopya.gundemMaddeleri.map(g => Object.assign({}, g, { id: uid("gm") }));
  S.toplantilar.push(kopya);
  activeToplantiId = kopya.id;
  save();
  renderMain();
  alert('"' + kopya.baslik + '" adıyla yeni bir tutanak olarak kaydedildi. Gündem/katılımcı içeriği kopyalandı, tarih/yer/saat alanlarını güncelleyin. Orijinal tutanak olduğu gibi duruyor.');
}
function addKatilimci(topId) {
  const top = toplantiById(topId);
  if (!top) return;
  top.katilimcilar.push({ id: uid("kt"), ad: "", brans: "" });
  save(); renderMain();
}
function addKatilimciFromSirku(topId, imzaId) {
  const top = toplantiById(topId);
  const im = S.imzaSirkuleri.find(x => x.id === imzaId);
  if (!top || !im) return;
  top.katilimcilar.push({ id: uid("kt"), ad: im.adSoyad, brans: im.unvan });
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
  const isVeli = top.tur === "veli";
  const katilimciAdPlaceholder = isVeli ? "Veli Adı Soyadı" : "Ad Soyad";
  const katilimciIkinciPlaceholder = isVeli ? "Öğrencinin Adı Soyadı / Sınıfı" : "Branş/Görev";
  const katilimciRows = top.katilimcilar.map(k => `
    <tr>
      <td class="no-print"><input type="text" value="${escHtml(k.ad)}" placeholder="${katilimciAdPlaceholder}" style="width:100%" onchange="updateKatilimci('${top.id}','${k.id}','ad',this.value)"></td>
      <td class="print-only-cell">${escHtml(k.ad)}</td>
      <td class="no-print"><input type="text" value="${escHtml(k.brans)}" placeholder="${katilimciIkinciPlaceholder}" style="width:100%" onchange="updateKatilimci('${top.id}','${k.id}','brans',this.value)"></td>
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

  const turEtiket = top.tur === 'sube' ? 'Şube Öğretmenler Kurulu' : top.tur === 'veli' ? 'Veli Toplantısı' : 'Zümre Toplantısı';
  const sirkuOptions = S.imzaSirkuleri.map(im => `<option value="${im.id}">${escHtml(im.adSoyad)} — ${escHtml(im.unvan)}</option>`).join("");
  const baskanEtiket = isVeli ? 'Sınıf Öğretmeni' : (top.tur === 'sube' ? 'Kurul Başkanı' : 'Zümre Başkanı');
  const gundemListesi = top.gundemMaddeleri.map((g, i) => `<li>${escHtml(g.baslik)}</li>`).join("");
  return `
  <div class="card no-print">
    <div class="row small" style="flex-wrap:wrap;gap:14px;align-items:center;">
      <span><b>Tür:</b> ${turEtiket}</span>
      <span><b>Sınıf/Ders:</b> ${escHtml(top.sinifVeyaDers || '-')}</span>
      <span><b>Öğretim Yılı:</b> ${escHtml(top.ogretimYili || '-')}</span>
      <span><b>Dönem:</b> ${escHtml(top.donem || '-')}</span>
      <span><b>${baskanEtiket}:</b> ${escHtml(top.baskan || '-')}</span>
      <span><b>Tarih:</b> ${escHtml(top.tarih || '-')}</span>
      <span><b>Yer:</b> ${escHtml(top.yer || '-')}</span>
      <span><b>Saat:</b> ${escHtml(top.saat || '-')}</span>
      <button class="btn" onclick="editToplantiMeta('${top.id}')">Bilgileri Düzenle</button>
    </div>
  </div>
  <div class="print-only" style="text-align:center;margin-bottom:12px;">
    <div style="font-weight:700;">${escHtml((S.kurumBilgileri.okulAdi || "").toLocaleUpperCase("tr-TR"))}</div>
    <div style="font-weight:700;">${escHtml(top.ogretimYili || '')} EĞİTİM-ÖĞRETİM YILI ${escHtml((S.kurumBilgileri.alanAdi || "").toLocaleUpperCase("tr-TR"))} ALANI ${turEtiket.toLocaleUpperCase("tr-TR")} TUTANAĞIDIR</div>
  </div>
  <table class="print-only" style="margin-bottom:12px;">
    <tr><td><b>Zümre No</b></td><td>${escHtml(top.zumreNo || '-')}</td><td><b>Dersin Adı</b></td><td>${escHtml(top.sinifVeyaDers || '-')}</td></tr>
    <tr><td><b>${baskanEtiket}</b></td><td>${escHtml(top.baskan || '-')}</td><td><b>Toplantı Yeri</b></td><td>${escHtml(top.yer || '-')}</td></tr>
    <tr><td><b>Toplantı Tarihi</b></td><td>${escHtml(top.tarih || '-')}</td><td><b>Toplantı Saati</b></td><td>${escHtml(top.saat || '-')}</td></tr>
  </table>
  <div class="card">
    <h2>${isVeli ? 'Toplantıya Katılan Veliler' : 'Toplantıya Katılanlar'}</h2>
    <table><thead><tr><th>${katilimciAdPlaceholder}</th><th>${katilimciIkinciPlaceholder}</th><th class="print-only">İmza</th><th class="no-print"></th></tr></thead>
    <tbody>${katilimciRows || `<tr><td colspan="4" class="small">Henüz katılımcı eklenmedi.</td></tr>`}</tbody></table>
    <div class="row no-print" style="align-items:center;">
      <button class="btn" onclick="addKatilimci('${top.id}')">Katılımcı Ekle</button>
      ${!isVeli && S.imzaSirkuleri.length ? `
      <select onchange="if(this.value){addKatilimciFromSirku('${top.id}', this.value); this.value='';}">
        <option value="">İmza Sirkülerinden Ekle...</option>
        ${sirkuOptions}
      </select>` : ''}
    </div>
    <p class="small print-only" style="margin-top:8px;">Toplam Katılımcı: ${top.katilimcilar.length}</p>
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
  <div class="card print-only">
    <h2>GÜNDEM</h2>
    <ol>${gundemListesi || '<li class="small">—</li>'}</ol>
  </div>
  <h2 class="print-only" style="margin-top:6px;">GÜNDEM MADDELERİNİN GÖRÜŞÜLMESİ</h2>
  ${gundemHtml}
  <div class="card">
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:20px;">
      <div>
        <div>${escHtml(top.tarih || ".../.../....")}</div>
        <div style="margin-top:24px;font-weight:600;">${escHtml(top.baskan)}</div>
        <div>${baskanEtiket}</div>
      </div>
      <div style="text-align:right;">
        <div>UYGUNDUR</div>
        <div style="margin-top:24px;font-weight:600;">${escHtml(S.kurumBilgileri.mudurAdi)}</div>
        <div>Okul Müdürü</div>
      </div>
    </div>
  </div>`;
}
function viewOkulZumresi() {
  const entries = S.toplantilar.slice().sort((a, b) => (a.baslik || "").localeCompare(b.baslik || "", "tr"));
  if (entries.length && !entries.some(e => e.id === activeToplantiId)) activeToplantiId = entries[0].id;
  if (!entries.length) activeToplantiId = null;
  const active = toplantiById(activeToplantiId);

  const listHtml = entries.length === 0 ? "" : `
    <div class="card no-print">
      <div class="row" style="flex-wrap:wrap;">
        ${sekmeDropdown("toplanti", entries.map(e => ({ value: e.id, label: (e.tur === 'sube' ? '📋 ' : e.tur === 'veli' ? '👪 ' : '🏭 ') + e.baslik })), activeToplantiId, "selectToplanti('{v}')")}
      </div>
    </div>`;

  const dosyaAdi = active ? active.baslik : "Toplantı Tutanağı";
  const content = active ? renderToplantiDetay(active) : `<div class="card small" style="text-align:center;padding:30px 20px;">Henüz bir toplantı tutanağı eklenmedi. "Yeni Toplantı Ekle" ile Şube Öğretmenler Kurulu, Zümre Toplantısı ya da Veli Toplantısı tutanağı oluşturabilirsiniz — standart gündem maddeleri otomatik hazırlanır.</div>`;

  return `
  <div class="card no-print">
    <h2>Toplantı Tutanakları</h2>
    <p class="small">Şube Öğretmenler Kurulu, Zümre Toplantısı ve Veli Toplantısı tutanaklarınızı burada tutun — katılımcılar, gündem maddeleri, görüşmeler ve kararlar. Yeni bir toplantı eklediğinizde standart gündem maddeleri otomatik geliyor, dilediğiniz gibi düzenleyip Yazdır/PDF/Word/Excel alabilirsiniz.</p>
    <div class="row"><button class="btn primary" onclick="addToplanti()">Yeni Toplantı Ekle</button>
      ${active ? `<button class="btn" onclick="toplantiYeniDonemeKopyala('${active.id}')" title="İçeriği koruyarak yeni bir dönem için kopyala, orijinali silinmez">Kopyala (Yeni Döneme)</button><button class="btn danger" onclick="deleteToplanti('${active.id}')">Bu Toplantıyı Sil</button>` : ""}
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
  const arizali = list.filter(m => /ar[ıi]z/i.test(m.durum || "")).length;
  return `
  <div class="card">
    <h2>Tüm Makine Listesi</h2>
    <div style="overflow-x:auto;">
    <table><thead><tr><th>S.N</th><th>Laboratuvar/Atölye</th><th>Makine Adı</th><th>Marka</th><th>Model</th><th>Seri No</th><th>Durum</th><th>Notlar</th><th class="no-print"></th></tr></thead>
    <tbody>${rows || `<tr><td colspan="9" class="small">Henüz makine eklenmedi.</td></tr>`}</tbody></table>
    </div>
    <div style="margin-top:12px;">
      <div style="font-weight:700;">ÖZET</div>
      <div>Toplam Makine: ${list.length}</div>
      <div>Çalışan: ${list.length - arizali}</div>
      <div>Arızalı: ${arizali}</div>
    </div>
  </div>`;
}
function importEnvanterFromExcel() {
  if (!window.desktop || !window.desktop.isElectron) { alert("Excel yükleme sadece masaüstü uygulamasında çalışır."); return; }
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
      alert("Yüklendi: " + eklenen + " yeni makine, " + guncellenen + " güncellenen makine.");
    }).catch(e => alert("Yükleme hatası: " + e.message));
  });
}
function viewMakinelerBolumu() {
  const list = S.envanter.makineler.slice().sort((a, b) => (a.lab || "").localeCompare(b.lab || "", "tr") || (a.ad || "").localeCompare(b.ad || "", "tr"));
  if (activeMakineId !== "__ALL__" && list.length && !list.some(m => m.id === activeMakineId)) activeMakineId = "__ALL__";
  if (!list.length) activeMakineId = "__ALL__";
  const active = activeMakineId === "__ALL__" ? null : makineById(activeMakineId);

  const makineSecenekleri = [{ value: "__ALL__", label: "📋 Tüm Liste" }].concat(list.map(m => ({ value: m.id, label: m.ad })));
  const listHtml = list.length === 0 ? "" : `
    <div class="card no-print">
      <div class="row" style="flex-wrap:wrap;">
        ${sekmeDropdown("makine", makineSecenekleri, activeMakineId, "selectMakine('{v}')")}
      </div>
    </div>`;

  const dosyaAdi = active ? active.ad : "Makine Envanteri";
  const content = active ? renderMakineDetay(active) : renderMakineOzetTablosu(list);

  return `
  <div class="card no-print">
    <h2>Makine Envanteri</h2>
    <p class="small">Atölye/laboratuvar makinelerinizi burada tutun — genel bilgiler, arıza/onarım/bakım kayıtları, yedek parça listesi ve kullanım talimatı. Elle ekleyebilir ya da mevcut Excel envanter listenizi yükleyebilirsiniz.</p>
    <div class="row">
      <button class="btn primary" onclick="addMakine()">Makine Ekle</button>
      <button class="btn" onclick="importEnvanterFromExcel()">Excel Yükle</button>
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
        <label class="small">Alan Şefi</label><input type="text" id="dt-alansefi" value="${escHtml(S.kurumBilgileri.alanSefiAdi)}" style="width:100%">
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
  </div>
  <div class="card" style="text-align:right;">
    <div style="font-weight:600;">${escHtml(f.atolyeSefi || '')}</div>
    <div>Laboratuvar Şefi</div>
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
        ${sekmeDropdown("durum-tespit", entries.map(e => ({ value: e.id, label: e.atolye + (e.tarih ? " · " + e.tarih : "") })), activeDurumTespitId, "selectDurumTespit('{v}')")}
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
  if (!window.desktop || !window.desktop.isElectron) { alert("Excel yükleme sadece masaüstü uygulamasında çalışır."); return; }
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
      alert("Yüklendi: " + eklenen + " yeni kayıt, " + guncellenen + " güncellenen kayıt.\n\nNot: yüklenen sınıf/şube adlarını kontrol edin — kaynak Excel dosyasında bazen elle yazım hatası olabiliyor (örn. \"123/A\" gibi), \"Bilgileri Düzenle\" ile düzeltebilirsiniz.");
    }).catch(e => alert("Yükleme hatası: " + e.message));
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
      <button class="btn" onclick="importPerformansFromExcel()">Excel Yükle</button>
    </div>
  </div>`;

  const sinifBar = `
  <div class="card no-print">
    <div class="small" style="margin-bottom:6px;font-weight:600;">1) Sınıf</div>
    <div class="row" style="flex-wrap:wrap;">
      ${siniflar.length ? sekmeDropdown("perf-sinif", siniflar.map(s => ({ value: s, label: s })), activePerformansSinif, "selectPerformansSinif('{v}')")
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
    <div class="row" style="flex-wrap:wrap;align-items:center;">
      ${dersEntries.length ? sekmeDropdown("perf-ders", dersEntries.map(e => ({ value: e.id, label: e.ders })), activePerformansId[tur], `selectPerformansKayit('${jsq(tur)}','{v}')`) : ""}
      <button class="btn" onclick="addPerformansKayit('${tur}')">+ Ders Ekle</button>
      ${active ? `<button class="btn danger" onclick="deletePerformansKayit('${active.id}')">Bu Dersi Sil</button>` : ""}
    </div>
  </div>`;

  if (!active) {
    return ustBar + sinifBar + donemBar + dersBar + `<div class="card small" style="text-align:center;padding:30px 20px;">Bu sınıf ve dönem için henüz ders eklenmedi. "+ Ders Ekle" ile elle oluşturabilir ya da yukarıdan Excel dosyanızı yükleyebilirsiniz.</div>`;
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

/* ---- Sınav Notları / Performans Notları / Sonuç Karnesi ----
   Notlandırma üç ayrı, bağımsız dosyalanabilir modüle bölündü (grup
   ayrımı olmadan, düz liste): Sınav Notları ve Performans Notları
   modüllerine notlar buradan girilir; Sonuç Karnesi ise bu ikisinden
   okulNo eşleşmesiyle otomatik derlenen, salt-okunur bir özet — kendi
   başına düzenlenmez, kaynağı iki modül. Üçü de aynı Sınıf/Ders/Dönem
   seçimini paylaşır (birinde seçim yapınca diğerinde de hatırlanır).
   Öğrenci Listesi modülündeki merkezi listeden otomatik doldurulur. */
let activeNotSinifId = null;
let activeNotCourseId = null;
let activeNotDonem = "1";
function selectNotSinif(id) { activeNotSinifId = id; activeNotCourseId = null; renderMain(); }
function selectNotCourse(id) { activeNotCourseId = id; renderMain(); }
function setNotDonem(d) { activeNotDonem = d; renderMain(); }
function notSecimBarlari(baslik, aciklama) {
  const siniflar = sinavSiniflari();
  if (activeNotSinifId && !siniflar.some(c => c.id === activeNotSinifId)) { activeNotSinifId = null; activeNotCourseId = null; }
  const ustBar = `<div class="card no-print"><h2>${escHtml(baslik)}</h2><p class="small">${aciklama}</p></div>`;
  const sinifBar = `
  <div class="card no-print">
    <div class="small" style="margin-bottom:6px;font-weight:600;">1) Sınıf</div>
    <div class="row" style="flex-wrap:wrap;">
      ${siniflar.length ? sekmeDropdown("not-sinif", siniflar.map(c => ({ value: c.id, label: c.name })), activeNotSinifId, "selectNotSinif('{v}')")
        : '<span class="small">Henüz tanımlı sınıf yok — Ders Programı &gt; Sınıflar bölümünden sınıf ekleyebilirsiniz.</span>'}
    </div>
  </div>`;
  if (!activeNotSinifId) return { html: ustBar + sinifBar, cls: null, course: null, done: false };

  const cls = classById(activeNotSinifId);
  const dersler = cls ? coursesForClass(cls) : [];
  if (activeNotCourseId && !dersler.some(c => c.id === activeNotCourseId)) activeNotCourseId = null;
  const dersBar = `
  <div class="card no-print">
    <div class="small" style="margin-bottom:6px;font-weight:600;">2) Ders — ${escHtml(cls ? cls.name : '')}</div>
    <div class="row" style="flex-wrap:wrap;">
      ${dersler.length ? sekmeDropdown("not-ders", dersler.map(c => ({ value: c.id, label: c.name })), activeNotCourseId, "selectNotCourse('{v}')")
        : '<span class="small">Bu sınıf için tanımlı ders yok — Ders Programı &gt; Ders Havuzu bölümünden ders ekleyebilirsiniz.</span>'}
    </div>
  </div>`;
  if (!activeNotCourseId) return { html: ustBar + sinifBar + dersBar, cls, course: null, done: false };

  const donemBar = `
  <div class="row no-print" style="flex-wrap:wrap;">
    <button class="btn ${activeNotDonem === '1' ? 'primary' : ''}" onclick="setNotDonem('1')">1. Dönem</button>
    <button class="btn ${activeNotDonem === '2' ? 'primary' : ''}" onclick="setNotDonem('2')">2. Dönem</button>
  </div>`;
  return { html: ustBar + sinifBar + dersBar + donemBar, cls, course: courseById(activeNotCourseId), done: true };
}

/* -- Sınav Notları -- */
function sinavNotlariById(id) { return S.sinavNotlari.find(x => x.id === id); }
function sinavNotlariBul(sinif, ders, donem) { return S.sinavNotlari.find(n => n.sinif === sinif && n.ders === ders && n.donem === donem); }
function sinavNotlariOlusturVeyaGetir(sinif, ders, donem) {
  let n = sinavNotlariBul(sinif, ders, donem);
  if (!n) {
    const kayitlar = ogrencilerForSinif(sinif).map(o => ({ id: uid("snk"), okulNo: o.okulNo, ad: (o.ad + " " + o.soyad).trim(), sinav1: "", sinav2: "", uygulama: "", grup: "1" }));
    n = { id: uid("sn"), sinif, ders, donem, uygulamaSinaviVarMi: true, kayitlar };
    S.sinavNotlari.push(n);
    save();
  }
  return n;
}
function sinavNotlariSenkronizeEt(entryId) {
  const n = sinavNotlariById(entryId);
  if (!n) return;
  let eklenen = 0;
  ogrencilerForSinif(n.sinif).forEach(o => {
    const varMi = n.kayitlar.some(k => k.okulNo === o.okulNo && k.ad === (o.ad + " " + o.soyad).trim());
    if (varMi) return;
    n.kayitlar.push({ id: uid("snk"), okulNo: o.okulNo, ad: (o.ad + " " + o.soyad).trim(), sinav1: "", sinav2: "", uygulama: "", grup: "1" });
    eklenen++;
  });
  save(); renderMain();
  alert(eklenen ? eklenen + " öğrenci Öğrenci Listesi'nden eklendi." : "Eklenecek yeni öğrenci yok — liste zaten güncel.");
}
function updateSinavNotuAlan(entryId, kayitId, field, value) {
  const n = sinavNotlariById(entryId);
  const k = n && n.kayitlar.find(x => x.id === kayitId);
  if (!k) return;
  k[field] = value;
  save();
  if (field === "grup") renderMain();
}
function addSinavNotuKayitManuel(entryId) {
  const n = sinavNotlariById(entryId);
  if (!n) return;
  n.kayitlar.push({ id: uid("snk"), okulNo: "", ad: "", sinav1: "", sinav2: "", uygulama: "", grup: "1" });
  save(); renderMain();
}
function removeSinavNotuKayit(entryId, kayitId) {
  const n = sinavNotlariById(entryId);
  if (!n) return;
  n.kayitlar = n.kayitlar.filter(k => k.id !== kayitId);
  save(); renderMain();
}
function deleteSinavNotlari(entryId) {
  if (!confirm("Bu sınav notları çizelgesi silinsin mi? Bu işlem geri alınamaz.")) return;
  S.sinavNotlari = S.sinavNotlari.filter(n => n.id !== entryId);
  save(); renderMain();
}
function setSinavNotlariUygulama(entryId, value) {
  const n = sinavNotlariById(entryId);
  if (!n) return;
  n.uygulamaSinaviVarMi = value;
  save(); renderMain();
}
function grupluKayitlar(kayitlar) {
  const gruplar = {};
  kayitlar.forEach(k => { const g = k.grup || "1"; (gruplar[g] = gruplar[g] || []).push(k); });
  return Object.keys(gruplar).sort((a, b) => (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0) || a.localeCompare(b, "tr")).map(g => ({ grup: g, kayitlar: gruplar[g] }));
}
function grupBasligiSatiri(grup, kolonSayisi) {
  return `<tr><td colspan="${kolonSayisi}" style="background:var(--panel-2);font-weight:700;">${escHtml(grup)}. GRUP</td></tr>`;
}
function renderSinavNotlariDetay(n) {
  let siraNo = 0;
  const kolonSayisi = n.uygulamaSinaviVarMi ? 7 : 6;
  const satirlar = grupluKayitlar(n.kayitlar).map(blok => grupBasligiSatiri(blok.grup, kolonSayisi) + blok.kayitlar.map(k => {
    siraNo++;
    return `<tr>
      <td>${siraNo}</td>
      <td><input class="no-print" type="text" value="${escHtml(k.okulNo)}" style="width:56px;" onchange="updateSinavNotuAlan('${n.id}','${k.id}','okulNo',this.value)"><span class="print-only-inline">${escHtml(k.okulNo)}</span></td>
      <td><input class="no-print" type="text" value="${escHtml(k.ad)}" style="width:180px;" onchange="updateSinavNotuAlan('${n.id}','${k.id}','ad',this.value)"><span class="print-only-inline">${escHtml(k.ad)}</span></td>
      <td><input class="no-print" type="text" value="${escHtml(k.sinav1)}" style="width:50px;text-align:center;" onchange="updateSinavNotuAlan('${n.id}','${k.id}','sinav1',this.value)"><span class="print-only-inline">${escHtml(k.sinav1)}</span></td>
      <td><input class="no-print" type="text" value="${escHtml(k.sinav2)}" style="width:50px;text-align:center;" onchange="updateSinavNotuAlan('${n.id}','${k.id}','sinav2',this.value)"><span class="print-only-inline">${escHtml(k.sinav2)}</span></td>
      ${n.uygulamaSinaviVarMi ? `<td><input class="no-print" type="text" value="${escHtml(k.uygulama)}" style="width:50px;text-align:center;" onchange="updateSinavNotuAlan('${n.id}','${k.id}','uygulama',this.value)"><span class="print-only-inline">${escHtml(k.uygulama)}</span></td>` : ""}
      <td class="no-print"><input type="text" value="${escHtml(k.grup)}" style="width:32px;text-align:center;" title="Grup" onchange="updateSinavNotuAlan('${n.id}','${k.id}','grup',this.value)"><button class="btn danger" onclick="removeSinavNotuKayit('${n.id}','${k.id}')">Sil</button></td>
    </tr>`;
  }).join("")).join("");
  return `
  <div class="card no-print">
    <div class="row small" style="flex-wrap:wrap;gap:14px;align-items:center;">
      <span><b>Sınıf:</b> ${escHtml(n.sinif)}</span><span><b>Ders:</b> ${escHtml(n.ders)}</span><span><b>Dönem:</b> ${n.donem}. Dönem</span>
      <label class="small"><input type="checkbox" ${n.uygulamaSinaviVarMi ? "checked" : ""} onchange="setSinavNotlariUygulama('${n.id}',this.checked)"> Uygulama Sınavı sütunu olsun</label>
    </div>
    <div class="row" style="margin-top:8px;">
      <button class="btn" onclick="sinavNotlariSenkronizeEt('${n.id}')" title="Öğrenci Listesi'ndeki güncel sınıf listesiyle eşitle">Öğrenci Listesinden Senkronize Et</button>
      <button class="btn" onclick="addSinavNotuKayitManuel('${n.id}')">Satır Ekle</button>
      <button class="btn danger" onclick="deleteSinavNotlari('${n.id}')">Bu Çizelgeyi Sil</button>
    </div>
  </div>
  <div style="text-align:center;margin-bottom:6px;">
    <div style="font-weight:700;">${escHtml((S.kurumBilgileri.okulAdi || "").toLocaleUpperCase("tr-TR"))}</div>
    <div style="font-weight:700;">${escHtml((n.ders || "").toLocaleUpperCase("tr-TR"))} DERSİ — ${escHtml(n.sinif)} — ${n.donem}. DÖNEM — SINAV NOTLARI</div>
  </div>
  <table style="font-size:11px;">
    <thead><tr><th style="width:34px;">Sıra<br>No</th><th style="width:56px;">Okul<br>No</th><th>Adı ve Soyadı</th><th style="width:50px;">1.<br>Sınav</th><th style="width:50px;">2.<br>Sınav</th>${n.uygulamaSinaviVarMi ? '<th style="width:56px;">Uygulama<br>Sınavı</th>' : ""}<th class="no-print"></th></tr></thead>
    <tbody>${satirlar || `<tr><td colspan="7" class="small">Bu sınıfta Öğrenci Listesi'nde kayıtlı öğrenci bulunamadı. Önce Öğrenci Listesi modülünden bu sınıfın öğrencilerini ekleyin (PDF/Word/Excel yükleyerek ya da elle) — sonra "Öğrenci Listesinden Senkronize Et"e basın, ya da "Satır Ekle" ile burada elle de girebilirsiniz.</td></tr>`}</tbody>
  </table>`;
}
function viewSinavNotlari() {
  const bar = notSecimBarlari("Sınav Notları", "Dersin 1./2. Sınav ve Uygulama Sınavı notlarını buradan girin. Öğrenci listesi Öğrenci Listesi modülünden otomatik gelir. Sonuç Karnesi bu notları otomatik çeker.");
  if (!bar.done) return bar.html;
  const n = sinavNotlariOlusturVeyaGetir(bar.cls.name, bar.course.name, activeNotDonem);
  const dosyaAdi = "Sınav Notları - " + bar.course.name + " - " + bar.cls.name + " - " + n.donem + ". Dönem";
  return `${bar.html}
  <div class="card no-print">${belgeAracCubugu(dosyaAdi)}</div>
  <div class="print-area"><div class="card" style="overflow-x:auto;">${renderSinavNotlariDetay(n)}</div></div>`;
}

/* -- Performans Notları -- */
function performansNotlariById(id) { return S.performansNotlari.find(x => x.id === id); }
function performansNotlariBul(sinif, ders, donem) { return S.performansNotlari.find(n => n.sinif === sinif && n.ders === ders && n.donem === donem); }
function performansNotlariOlusturVeyaGetir(sinif, ders, donem) {
  let n = performansNotlariBul(sinif, ders, donem);
  if (!n) {
    const kayitlar = ogrencilerForSinif(sinif).map(o => ({ id: uid("pnk"), okulNo: o.okulNo, ad: (o.ad + " " + o.soyad).trim(), perf1: new Array(3).fill(""), perf2: new Array(3).fill(""), grup: "1" }));
    n = { id: uid("pn"), sinif, ders, donem, perf1Sayisi: 3, perf2Sayisi: 3, kayitlar };
    S.performansNotlari.push(n);
    save();
  }
  return n;
}
function performansOrt(arr) {
  const sayilar = arr.map(v => parseFloat(String(v).replace(",", "."))).filter(v => !isNaN(v));
  if (!sayilar.length) return "";
  return Math.round((sayilar.reduce((a, b) => a + b, 0) / sayilar.length) * 10) / 10;
}
function performansNotlariSenkronizeEt(entryId) {
  const n = performansNotlariById(entryId);
  if (!n) return;
  let eklenen = 0;
  ogrencilerForSinif(n.sinif).forEach(o => {
    const varMi = n.kayitlar.some(k => k.okulNo === o.okulNo && k.ad === (o.ad + " " + o.soyad).trim());
    if (varMi) return;
    n.kayitlar.push({ id: uid("pnk"), okulNo: o.okulNo, ad: (o.ad + " " + o.soyad).trim(), perf1: new Array(n.perf1Sayisi).fill(""), perf2: new Array(n.perf2Sayisi).fill(""), grup: "1" });
    eklenen++;
  });
  save(); renderMain();
  alert(eklenen ? eklenen + " öğrenci Öğrenci Listesi'nden eklendi." : "Eklenecek yeni öğrenci yok — liste zaten güncel.");
}
function updatePerformansAlan(entryId, kayitId, field, value) {
  const n = performansNotlariById(entryId);
  const k = n && n.kayitlar.find(x => x.id === kayitId);
  if (!k) return;
  k[field] = value;
  save();
  if (field === "grup") renderMain();
}
function updatePerformansPerf(entryId, kayitId, hangi, idx, value) {
  const n = performansNotlariById(entryId);
  const k = n && n.kayitlar.find(x => x.id === kayitId);
  if (!k) return;
  k[hangi][idx] = value;
  save(); renderMain();
}
function addPerformansKayitManuel(entryId) {
  const n = performansNotlariById(entryId);
  if (!n) return;
  n.kayitlar.push({ id: uid("pnk"), okulNo: "", ad: "", perf1: new Array(n.perf1Sayisi).fill(""), perf2: new Array(n.perf2Sayisi).fill(""), grup: "1" });
  save(); renderMain();
}
function removePerformansKayit(entryId, kayitId) {
  const n = performansNotlariById(entryId);
  if (!n) return;
  n.kayitlar = n.kayitlar.filter(k => k.id !== kayitId);
  save(); renderMain();
}
function deletePerformansNotlari(entryId) {
  if (!confirm("Bu performans notları çizelgesi silinsin mi? Bu işlem geri alınamaz.")) return;
  S.performansNotlari = S.performansNotlari.filter(n => n.id !== entryId);
  save(); renderMain();
}
function setPerformansSayisi(entryId, field, value) {
  const n = performansNotlariById(entryId);
  if (!n) return;
  const sayi = Math.max(1, Math.min(6, parseInt(value, 10) || 1));
  n[field] = sayi;
  const hangi = field === "perf1Sayisi" ? "perf1" : "perf2";
  n.kayitlar.forEach(k => {
    while (k[hangi].length < sayi) k[hangi].push("");
    k[hangi] = k[hangi].slice(0, sayi);
  });
  save(); renderMain();
}
function renderPerformansNotlariDetay(n) {
  const perfBaslik = sayi => new Array(sayi).fill(0).map((_, i) => `<th style="width:30px;">${i + 1}</th>`).join("") + `<th style="width:56px;">Ort. /<br>Girildi</th>`;
  const kolonSayisi = 3 + (n.perf1Sayisi + 1) + (n.perf2Sayisi + 1) + 1;
  let siraNo = 0;
  const satirlar = grupluKayitlar(n.kayitlar).map(blok => grupBasligiSatiri(blok.grup, kolonSayisi) + blok.kayitlar.map(k => {
    siraNo++;
    const perf1Dolu = k.perf1.filter(v => v !== "").length;
    const perf2Dolu = k.perf2.filter(v => v !== "").length;
    const perf1Cells = k.perf1.map((v, i) => `<td><input class="no-print" type="text" value="${escHtml(v)}" style="width:28px;text-align:center;" onchange="updatePerformansPerf('${n.id}','${k.id}','perf1',${i},this.value)"><span class="print-only-inline">${escHtml(v)}</span></td>`).join("");
    const perf2Cells = k.perf2.map((v, i) => `<td><input class="no-print" type="text" value="${escHtml(v)}" style="width:28px;text-align:center;" onchange="updatePerformansPerf('${n.id}','${k.id}','perf2',${i},this.value)"><span class="print-only-inline">${escHtml(v)}</span></td>`).join("");
    return `<tr>
      <td>${siraNo}</td>
      <td><input class="no-print" type="text" value="${escHtml(k.okulNo)}" style="width:56px;" onchange="updatePerformansAlan('${n.id}','${k.id}','okulNo',this.value)"><span class="print-only-inline">${escHtml(k.okulNo)}</span></td>
      <td><input class="no-print" type="text" value="${escHtml(k.ad)}" style="width:160px;" onchange="updatePerformansAlan('${n.id}','${k.id}','ad',this.value)"><span class="print-only-inline">${escHtml(k.ad)}</span></td>
      ${perf1Cells}<td><b>${performansOrt(k.perf1)}</b><div class="small">${perf1Dolu}/${n.perf1Sayisi} girildi</div></td>
      ${perf2Cells}<td><b>${performansOrt(k.perf2)}</b><div class="small">${perf2Dolu}/${n.perf2Sayisi} girildi</div></td>
      <td class="no-print"><input type="text" value="${escHtml(k.grup)}" style="width:32px;text-align:center;" title="Grup" onchange="updatePerformansAlan('${n.id}','${k.id}','grup',this.value)"><button class="btn danger" onclick="removePerformansKayit('${n.id}','${k.id}')">Sil</button></td>
    </tr>`;
  }).join("")).join("");
  return `
  <div class="card no-print">
    <div class="row small" style="flex-wrap:wrap;gap:14px;align-items:center;">
      <span><b>Sınıf:</b> ${escHtml(n.sinif)}</span><span><b>Ders:</b> ${escHtml(n.ders)}</span><span><b>Dönem:</b> ${n.donem}. Dönem</span>
      <label class="small">1. Performans girişi sayısı: <input type="number" min="1" max="6" value="${n.perf1Sayisi}" style="width:44px;" onchange="setPerformansSayisi('${n.id}','perf1Sayisi',this.value)"></label>
      <label class="small">2. Performans girişi sayısı: <input type="number" min="1" max="6" value="${n.perf2Sayisi}" style="width:44px;" onchange="setPerformansSayisi('${n.id}','perf2Sayisi',this.value)"></label>
    </div>
    <div class="row" style="margin-top:8px;">
      <button class="btn" onclick="performansNotlariSenkronizeEt('${n.id}')" title="Öğrenci Listesi'ndeki güncel sınıf listesiyle eşitle">Öğrenci Listesinden Senkronize Et</button>
      <button class="btn" onclick="addPerformansKayitManuel('${n.id}')">Satır Ekle</button>
      <button class="btn danger" onclick="deletePerformansNotlari('${n.id}')">Bu Çizelgeyi Sil</button>
    </div>
  </div>
  <div style="text-align:center;margin-bottom:6px;">
    <div style="font-weight:700;">${escHtml((S.kurumBilgileri.okulAdi || "").toLocaleUpperCase("tr-TR"))}</div>
    <div style="font-weight:700;">${escHtml((n.ders || "").toLocaleUpperCase("tr-TR"))} DERSİ — ${escHtml(n.sinif)} — ${n.donem}. DÖNEM — PERFORMANS NOTLARI</div>
  </div>
  <table style="font-size:11px;">
    <thead>
      <tr>
        <th rowspan="2" style="width:34px;">Sıra<br>No</th>
        <th rowspan="2" style="width:56px;">Okul<br>No</th>
        <th rowspan="2">Adı ve Soyadı</th>
        <th colspan="${n.perf1Sayisi + 1}">1. Performans Notu</th>
        <th colspan="${n.perf2Sayisi + 1}">2. Performans Notu</th>
        <th class="no-print" rowspan="2"></th>
      </tr>
      <tr>${perfBaslik(n.perf1Sayisi)}${perfBaslik(n.perf2Sayisi)}</tr>
    </thead>
    <tbody>${satirlar || `<tr><td colspan="${kolonSayisi}" class="small">Bu sınıfta Öğrenci Listesi'nde kayıtlı öğrenci bulunamadı. Önce Öğrenci Listesi modülünden bu sınıfın öğrencilerini ekleyin (PDF/Word/Excel yükleyerek ya da elle) — sonra "Öğrenci Listesinden Senkronize Et"e basın, ya da "Satır Ekle" ile burada elle de girebilirsiniz.</td></tr>`}</tbody>
  </table>`;
}
function viewPerformansNotlari() {
  const bar = notSecimBarlari("Performans Notları", "Dersin performans notlarını (1./2. Performans, girilecek not sayısı ayarlanabilir) buradan girin — ortalama otomatik hesaplanır, kaç notun girildiği her satırda görünür. Sonuç Karnesi bu notları otomatik çeker.");
  if (!bar.done) return bar.html;
  const n = performansNotlariOlusturVeyaGetir(bar.cls.name, bar.course.name, activeNotDonem);
  const dosyaAdi = "Performans Notları - " + bar.course.name + " - " + bar.cls.name + " - " + n.donem + ". Dönem";
  return `${bar.html}
  <div class="card no-print">${belgeAracCubugu(dosyaAdi)}</div>
  <div class="print-area"><div class="card" style="overflow-x:auto;">${renderPerformansNotlariDetay(n)}</div></div>`;
}

/* -- Sonuç Karnesi (salt okunur, Sınav Notları + Performans Notları'ndan derlenir) -- */
function karneGenelOrtalama(o) {
  const degerler = [o.sinav1, o.sinav2, o.uygulamaVarMi ? o.uygulama : undefined, o.perf1Ort, o.perf2Ort]
    .map(v => parseFloat(String(v).replace(",", ".")))
    .filter(v => !isNaN(v));
  if (!degerler.length) return "";
  return Math.round((degerler.reduce((a, b) => a + b, 0) / degerler.length) * 10) / 10;
}
function renderSonucKarnesi(bar, sn, pn) {
  if (!sn && !pn) return `<p class="small" style="text-align:center;padding:24px 10px;">Bu sınıf/ders/dönem için henüz Sınav Notları ya da Performans Notları girilmemiş. Önce o modüllerden not girin, karne burada otomatik oluşsun.</p>`;
  const birlesik = {};
  (sn ? sn.kayitlar : []).forEach(k => {
    const key = k.okulNo || k.ad;
    birlesik[key] = Object.assign({ okulNo: k.okulNo, ad: k.ad }, birlesik[key] || {}, { sinav1: k.sinav1, sinav2: k.sinav2, uygulama: k.uygulama, uygulamaVarMi: sn.uygulamaSinaviVarMi });
  });
  (pn ? pn.kayitlar : []).forEach(k => {
    const key = k.okulNo || k.ad;
    birlesik[key] = Object.assign({ okulNo: k.okulNo, ad: k.ad }, birlesik[key] || {}, { perf1Ort: performansOrt(k.perf1), perf2Ort: performansOrt(k.perf2) });
  });
  const liste = Object.values(birlesik).sort((a, b) => (Number(a.okulNo) || 0) - (Number(b.okulNo) || 0));
  const uygulamaVarMi = sn ? sn.uygulamaSinaviVarMi : false;
  let siraNo = 0;
  const satirlar = liste.map(o => {
    siraNo++;
    return `<tr>
      <td>${siraNo}</td><td>${escHtml(o.okulNo || "")}</td><td>${escHtml(o.ad || "")}</td>
      <td>${o.sinav1 !== undefined ? escHtml(o.sinav1) : '<span class="small">—</span>'}</td>
      <td>${o.sinav2 !== undefined ? escHtml(o.sinav2) : '<span class="small">—</span>'}</td>
      ${uygulamaVarMi ? `<td>${o.uygulama !== undefined ? escHtml(o.uygulama) : '<span class="small">—</span>'}</td>` : ""}
      <td>${o.perf1Ort !== undefined ? o.perf1Ort : '<span class="small">—</span>'}</td>
      <td>${o.perf2Ort !== undefined ? o.perf2Ort : '<span class="small">—</span>'}</td>
      <td><b>${karneGenelOrtalama(o)}</b></td>
    </tr>`;
  }).join("");
  return `
  ${(!sn || !pn) ? `<p class="small no-print" style="margin-bottom:10px;">Not: ${!sn ? "Sınav Notları" : "Performans Notları"} bu sınıf/ders/dönem için henüz girilmemiş — ilgili sütunlar boş görünüyor.</p>` : ""}
  <div style="text-align:center;margin-bottom:6px;">
    <div style="font-weight:700;">${escHtml((S.kurumBilgileri.okulAdi || "").toLocaleUpperCase("tr-TR"))}</div>
    <div style="font-weight:700;">${escHtml((bar.course.name || "").toLocaleUpperCase("tr-TR"))} DERSİ — ${escHtml(bar.cls.name)} — ${activeNotDonem}. DÖNEM — SONUÇ KARNESİ</div>
  </div>
  <p class="small no-print" style="margin-bottom:8px;">Genel Ortalama, o öğrenci için girilmiş olan tüm notların (sınavlar + performans ortalamaları) basit ortalamasıdır — okulunuzun resmi ağırlıklandırma formülü farklıysa referans olarak kullanıp gerekirse e-Okul'a elle işleyin.</p>
  <table style="font-size:11px;">
    <thead><tr><th>Sıra No</th><th>Okul No</th><th>Adı ve Soyadı</th><th>1. Sınav</th><th>2. Sınav</th>${uygulamaVarMi ? "<th>Uygulama Sınavı</th>" : ""}<th>1. Perf. Ort.</th><th>2. Perf. Ort.</th><th>Genel Ortalama</th></tr></thead>
    <tbody>${satirlar || `<tr><td colspan="9" class="small">Kayıt yok.</td></tr>`}</tbody>
  </table>`;
}
function viewSonucKarnesi() {
  const bar = notSecimBarlari("Sonuç Karnesi", "Sınav Notları ve Performans Notları modüllerinden okul numarasına göre otomatik derlenen, dosyalanabilir sonuç özeti. <b>Burada düzenleme yapılmaz</b> — notları ilgili modülden girin, karne kendini otomatik günceller.");
  if (!bar.done) return bar.html;
  const sn = sinavNotlariBul(bar.cls.name, bar.course.name, activeNotDonem);
  const pn = performansNotlariBul(bar.cls.name, bar.course.name, activeNotDonem);
  const dosyaAdi = "Sonuç Karnesi - " + bar.course.name + " - " + bar.cls.name + " - " + activeNotDonem + ". Dönem";
  return `${bar.html}
  <div class="card no-print">${belgeAracCubugu(dosyaAdi)}</div>
  <div class="print-area"><div class="card" style="overflow-x:auto;">${renderSonucKarnesi(bar, sn, pn)}</div></div>`;
}

/* ---- Kalfalık/Ustalık Sınavı ve Beceri Sınavı (ortak hesaplama motoru) ----
   MEB Mesleki Eğitim Genel Müdürlüğü'nün gerçek "Kalfalık/Ustalık Beceri Sınavı
   Değerlendirme Çizelgesi" ve "İşletmelerde Beceri Eğitimi Yıl Sonu Beceri Sınavı
   Değerlendirme Çizelgesi" belgelerindeki formüller birebir uygulanır:
   Dönem Ort. = 6 işletme notunun (Temrin1/2, İş-Hizmet1/2, Proje, Deney) ortalaması;
   Genel Dönem Ort. = (1.Dönem Ort.+2.Dönem Ort.)/2; İş Dosyası Puanı = 4 kriterin
   (her biri max 25) toplamı; Beceri Sınav Puanı = İş Dosyası×%20 + Sınav Puanı×%80;
   Yıl Sonu = (Genel Dönem Ort.+Beceri Sınav Puanı)/2; Sonuç, Beceri Sınav Puanı
   50 ve üzeriyse BAŞARILI sayılır (devamsızsa doğrudan DEVAMSIZLIK). */
function snSayi(v) { const n = Number(v); return v === "" || v === null || v === undefined || isNaN(n) ? null : n; }
function snOrtalama(vals) {
  const nums = vals.map(snSayi).filter(v => v !== null);
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}
function snDonemOrt(d) { return snOrtalama([d.t1, d.t2, d.ih1, d.ih2, d.proje, d.deney]); }
function snIsDosyasiPuani(k) {
  if (k.isDosyasiTeslimEtmedi) return 0;
  return ["k1", "k2", "k3", "k4"].reduce((sum, f) => sum + (snSayi(k.isDosyasi[f]) || 0), 0);
}
function snKayitHesapla(k) {
  const ort1 = snDonemOrt(k.d1), ort2 = snDonemOrt(k.d2);
  const genelOrt = (ort1 + ort2) / 2;
  const isDosyasiPuani = snIsDosyasiPuani(k);
  const sinavPuani = snSayi(k.sinavPuani) || 0;
  const beceriPuani = isDosyasiPuani * 0.2 + sinavPuani * 0.8;
  const yilSonu = (genelOrt + beceriPuani) / 2;
  const yilSonuYazi = yilSonu >= 85 ? "PEKİYİ" : yilSonu >= 70 ? "İYİ" : yilSonu >= 50 ? "ORTA" : "BAŞARISIZ";
  const sonuc = k.kod === "D" ? "DEVAMSIZLIK" : (beceriPuani >= 50 ? "BAŞARILI" : "BAŞARISIZ");
  return { ort1, ort2, genelOrt, isDosyasiPuani, beceriPuani, yilSonu, yilSonuYazi, sonuc };
}
function snSonucRengi(sonuc) {
  if (sonuc === "BAŞARILI") return "background:var(--teal-bg);color:var(--teal-ink);";
  if (sonuc === "DEVAMSIZLIK") return "background:var(--panel-2);color:var(--ink-soft);";
  return "background:var(--warn-bg);color:var(--warn);";
}
function snDeposu(kind) { return kind === "ku" ? S.kalfalikUstalik : S.beceriSinavi; }
function snYeniKayitNesnesi(kind, ekAlanlar) {
  return Object.assign({
    id: uid(kind), ogrenciNo: "", ad: "", soyad: "", kod: "", tckn: "",
    d1: { t1: "", t2: "", ih1: "", ih2: "", proje: "", deney: "" },
    d2: { t1: "", t2: "", ih1: "", ih2: "", proje: "", deney: "" },
    isDosyasi: { k1: "", k2: "", k3: "", k4: "" }, isDosyasiTeslimEtmedi: false,
    sinavPuani: "", aciklama: "", kagitAdedi: "",
    degerlendirici1: "", degerlendirici2: "", degerlendirici3: "",
    isletmeAdi: "", isletmeTel: "", isletmeEmail: "", telafiEgitimPuani: "", beceriYarismaPuani: ""
  }, ekAlanlar);
}
function sayiYaziIleTr(n) {
  const birler = ["", "BİR", "İKİ", "ÜÇ", "DÖRT", "BEŞ", "ALTI", "YEDİ", "SEKİZ", "DOKUZ"];
  const onlar = ["", "ON", "YİRMİ", "OTUZ", "KIRK", "ELLİ", "ALTMIŞ", "YETMİŞ", "SEKSEN", "DOKSAN"];
  if (n === 100) return "YÜZ";
  if (n < 0 || n > 100 || isNaN(n)) return "";
  const on = Math.floor(n / 10), bir = n % 10;
  return (onlar[on] + (bir ? " " + birler[bir] : "")).trim();
}
function snDegerlendiriciOrtalama(k) {
  const vals = [k.degerlendirici1, k.degerlendirici2, k.degerlendirici3]
    .map(v => parseFloat(String(v).replace(",", "."))).filter(v => !isNaN(v));
  if (!vals.length) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}
function snGuncelleDegerlendirici(kind, id, alan, value) {
  const k = snDeposu(kind).kayitlar.find(x => x.id === id);
  if (!k) return;
  k[alan] = value;
  const ort = snDegerlendiriciOrtalama(k);
  if (ort !== null) k.sinavPuani = String(ort);
  save(); renderMain();
}
function snEkleKayit(kind, ekAlanlar) {
  snDeposu(kind).kayitlar.push(snYeniKayitNesnesi(kind, ekAlanlar));
  save(); renderMain();
}
function snEkAlanlariHesapla(kind) {
  return kind === "ku" ? { tur: activeKuTur, dal: activeKuDal } : { sinif: activeBeceriSinif, dal: aktifDalIcinEkle() };
}
function snListedenTopluEkleModal(kind) {
  const siniflar = ogrenciListesiSiniflari();
  const onerilenSinif = kind === "bs" ? activeBeceriSinif : (siniflar[0] || "");
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:380px;">
        <h3>Öğrenci Listesinden Toplu Ekle</h3>
        <p class="small">Öğrenci Listesi modülünde kayıtlı bir sınıf seçin — o sınıftaki, bu çizelgede henüz olmayan tüm öğrenciler tek seferde eklensin.</p>
        <label class="small">Sınıf</label>
        <select id="sn-liste-sinif" style="width:100%">
          ${siniflar.map(s => `<option value="${jsq(s)}" ${s === onerilenSinif ? "selected" : ""}>${escHtml(s)} (${ogrencilerForSinif(s).length} öğrenci)</option>`).join("")}
        </select>
        <div class="row">
          <button class="btn primary" onclick="snListedenTopluEkleUygula('${kind}')">Ekle</button>
          <button class="btn" onclick="closeModal()">İptal</button>
        </div>
      </div>
    </div>`;
}
function snListedenTopluEkleUygula(kind) {
  const sinifSecim = document.getElementById("sn-liste-sinif");
  if (!sinifSecim) return;
  const sinif = sinifSecim.value;
  const dep = snDeposu(kind);
  const mevcutNolar = new Set(dep.kayitlar.filter(k => k.ogrenciNo).map(k => k.ogrenciNo));
  const ekAlanlar = snEkAlanlariHesapla(kind);
  let eklenen = 0;
  ogrencilerForSinif(sinif).forEach(o => {
    if (mevcutNolar.has(o.okulNo)) return;
    dep.kayitlar.push(snYeniKayitNesnesi(kind, Object.assign({ ogrenciNo: o.okulNo, ad: o.ad, soyad: o.soyad }, ekAlanlar)));
    eklenen++;
  });
  save(); closeModal(); renderMain();
  alert(eklenen ? `${eklenen} öğrenci eklendi.` : "Eklenecek yeni öğrenci bulunamadı (hepsi zaten listede ya da seçilen sınıfta kayıt yok).");
}
function snSilKayit(kind, id) {
  if (!confirm("Bu öğrencinin kaydı silinsin mi?")) return;
  const dep = snDeposu(kind);
  dep.kayitlar = dep.kayitlar.filter(k => k.id !== id);
  save(); renderMain();
}
function snGuncelleAlan(kind, id, path, value) {
  const dep = snDeposu(kind);
  const k = dep.kayitlar.find(x => x.id === id);
  if (!k) return;
  const parts = path.split(".");
  let obj = k;
  for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
  obj[parts[parts.length - 1]] = value;
  save();
}
function snGuncelleCheckbox(kind, id, field, checked) {
  const dep = snDeposu(kind);
  const k = dep.kayitlar.find(x => x.id === id);
  if (!k) return;
  k[field] = checked;
  save(); renderMain();
}
function snRosterTablo(kind, kayitlar) {
  const numCell = (kind2, id, path, value, w) =>
    `<input class="no-print sn-cell" type="number" value="${value === "" ? "" : escHtml(String(value))}" style="width:${w || 46}px" onchange="snGuncelleAlan('${kind2}','${id}','${path}',this.value)">` +
    `<span class="print-only-inline">${value === "" || value === null || value === undefined ? "-" : escHtml(String(value))}</span>`;
  const rows = kayitlar.map((k, i) => {
    const h = snKayitHesapla(k);
    return `
    <tr>
      <td>${i + 1}</td>
      <td><input class="no-print sn-cell" type="text" value="${escHtml(k.ogrenciNo)}" style="width:52px" onchange="snGuncelleAlan('${kind}','${k.id}','ogrenciNo',this.value)"><span class="print-only-inline">${escHtml(k.ogrenciNo || "-")}</span></td>
      <td class="no-print"><input type="text" placeholder="Adı" value="${escHtml(k.ad)}" style="width:90px" onchange="snGuncelleAlan('${kind}','${k.id}','ad',this.value)"></td>
      <td class="no-print"><input type="text" placeholder="Soyadı" value="${escHtml(k.soyad)}" style="width:90px" onchange="snGuncelleAlan('${kind}','${k.id}','soyad',this.value)"></td>
      <td class="print-only-cell">${escHtml(k.ad)} ${escHtml(k.soyad)}</td>
      <td class="no-print"><select onchange="snGuncelleAlan('${kind}','${k.id}','kod',this.value); renderMain();" style="width:44px">
        <option value="" ${k.kod === "" ? "selected" : ""}>-</option>
        <option value="D" ${k.kod === "D" ? "selected" : ""}>D</option>
        <option value="M" ${k.kod === "M" ? "selected" : ""}>M</option>
      </select></td>
      <td class="print-only-cell">${escHtml(k.kod || "-")}</td>
      <td>${numCell(kind, k.id, "d1.t1", k.d1.t1)}</td>
      <td>${numCell(kind, k.id, "d1.t2", k.d1.t2)}</td>
      <td>${numCell(kind, k.id, "d1.ih1", k.d1.ih1)}</td>
      <td>${numCell(kind, k.id, "d1.ih2", k.d1.ih2)}</td>
      <td>${numCell(kind, k.id, "d1.proje", k.d1.proje)}</td>
      <td>${numCell(kind, k.id, "d1.deney", k.d1.deney)}</td>
      <td style="font-weight:600;">${h.ort1.toFixed(1)}</td>
      <td>${numCell(kind, k.id, "d2.t1", k.d2.t1)}</td>
      <td>${numCell(kind, k.id, "d2.t2", k.d2.t2)}</td>
      <td>${numCell(kind, k.id, "d2.ih1", k.d2.ih1)}</td>
      <td>${numCell(kind, k.id, "d2.ih2", k.d2.ih2)}</td>
      <td>${numCell(kind, k.id, "d2.proje", k.d2.proje)}</td>
      <td>${numCell(kind, k.id, "d2.deney", k.d2.deney)}</td>
      <td style="font-weight:600;">${h.ort2.toFixed(1)}</td>
      <td style="font-weight:600;">${h.genelOrt.toFixed(1)}</td>
      <td>${numCell(kind, k.id, "isDosyasi.k1", k.isDosyasi.k1, 40)}</td>
      <td>${numCell(kind, k.id, "isDosyasi.k2", k.isDosyasi.k2, 40)}</td>
      <td>${numCell(kind, k.id, "isDosyasi.k3", k.isDosyasi.k3, 40)}</td>
      <td>${numCell(kind, k.id, "isDosyasi.k4", k.isDosyasi.k4, 40)}</td>
      <td class="no-print" style="text-align:center;"><input type="checkbox" title="İş dosyasını teslim etmedi" ${k.isDosyasiTeslimEtmedi ? "checked" : ""} onchange="snGuncelleCheckbox('${kind}','${k.id}','isDosyasiTeslimEtmedi',this.checked)"></td>
      <td style="font-weight:600;">${h.isDosyasiPuani.toFixed(1)}</td>
      <td>${numCell(kind, k.id, "sinavPuani", k.sinavPuani, 46)}</td>
      <td style="font-weight:600;">${h.beceriPuani.toFixed(1)}</td>
      <td style="font-weight:700;">${h.yilSonu.toFixed(1)}</td>
      <td>${h.yilSonuYazi}</td>
      <td><span class="pill" style="${snSonucRengi(h.sonuc)}">${h.sonuc}</span></td>
      <td class="no-print"><input type="text" value="${escHtml(k.aciklama)}" style="width:100px" onchange="snGuncelleAlan('${kind}','${k.id}','aciklama',this.value)"></td>
      <td class="no-print"><button class="btn danger" onclick="snSilKayit('${kind}','${k.id}')">Sil</button></td>
    </tr>`;
  }).join("");
  return `
  <p class="small no-print" style="margin:6px 0;">↔ Tablo geniş — sağa/sola kaydırarak diğer sütunları görebilirsiniz.</p>
  <div class="card" style="overflow-x:auto;">
    <table style="width:100%;font-size:11px;">
      <thead>
        <tr>
          <th rowspan="2">Sıra</th>
          <th rowspan="2">Öğr. No</th>
          <th colspan="2" class="no-print">Adı Soyadı</th>
          <th class="print-only-cell" rowspan="2">Adı Soyadı</th>
          <th rowspan="2">Kod<br>D/M</th>
          <th colspan="6">◀ 1. Dönem İşletme Notları ▶</th>
          <th rowspan="2">1.D<br>Ort.</th>
          <th colspan="6">◀ 2. Dönem İşletme Notları ▶</th>
          <th rowspan="2">2.D<br>Ort.</th>
          <th rowspan="2">Genel<br>Dönem<br>Ort.</th>
          <th colspan="4">İş Dosyası (Kriter 1-4, max 25)</th>
          <th class="no-print" rowspan="2">Teslim<br>Etmedi</th>
          <th rowspan="2">İş Dosy.<br>Puanı</th>
          <th rowspan="2">Sınav<br>Puanı</th>
          <th rowspan="2">Beceri<br>Sınav<br>Puanı<br>(%20+%80)</th>
          <th rowspan="2">Yıl Sonu<br>(Sayı)</th>
          <th rowspan="2">Yıl Sonu<br>(Yazı)</th>
          <th rowspan="2">Sonuç</th>
          <th class="no-print" rowspan="2">Açıklama</th>
          <th class="no-print" rowspan="2"></th>
        </tr>
        <tr>
          <th>Temrin1</th><th>Temrin2</th><th>İş/Hzm1</th><th>İş/Hzm2</th><th>Proje</th><th>Deney</th>
          <th>Temrin1</th><th>Temrin2</th><th>İş/Hzm1</th><th>İş/Hzm2</th><th>Proje</th><th>Deney</th>
          <th>K1</th><th>K2</th><th>K3</th><th>K4</th>
        </tr>
      </thead>
      <tbody>${rows || `<tr><td colspan="30" class="small">Henüz öğrenci eklenmedi.</td></tr>`}</tbody>
    </table>
    <div class="row no-print" style="margin-top:8px;">
      <p class="small">Kod: D = Devamsız, M = Mazeretli. Sonuç, Beceri Sınav Puanı 50 ve üzeriyse BAŞARILI sayılır (kritik beceriler hariç — komisyon kararına göre elle de düzeltebilirsiniz).</p>
    </div>
  </div>`;
}
function snIsDosyasiKriterAciklamasi() {
  return `
  <div class="card no-print">
    <h3>İş Dosyası (Staj Defteri) Derecelendirme Ölçütleri</h3>
    <p class="small"><b>Kriter 1 — Sayfa Düzeni ve Temizliği:</b> 0-5 Çok dağınık ve kirli · 6-12 Kısmen düzenli · 13-19 Büyük ölçüde düzenli · 20-24 Düzenli ve temiz · 25 Mükemmel düzen</p>
    <p class="small"><b>Kriter 2 — Teknik Resim ve Çizim Kuralları:</b> 0-5 Hiç kural yok · 6-12 Kısmen uygun · 13-19 Büyük ölçüde uygun · 20-24 Kurallara uygun · 25 Tam ve eksiksiz</p>
    <p class="small"><b>Kriter 3 — Yapılan İşlerin Anlatımı:</b> 0-5 Yok / çok yetersiz · 6-12 Kısmen açıklama var · 13-19 Yeterli açıklama · 20-24 Detaylı anlatım · 25 Eksiksiz ve detaylı</p>
    <p class="small"><b>Kriter 4 — Usta Öğretici İmzaları:</b> 0-5 İmza çok eksik · 6-12 Kısmen imzalı · 13-19 Büyük bölümü imzalı · 20-24 Neredeyse tamamı · 25 Tamamı imzalı</p>
  </div>`;
}

/* ---- Kalfalık / Ustalık Sınavı (MESEM öğrencileri) ---- */
let activeKuTur = "kalfalik";
let activeKuDal = "MBO";
function setKuTur(t) { activeKuTur = t; renderMain(); }
function setKuDal(d) { activeKuDal = d; renderMain(); }
function viewKalfalikUstalik() {
  const turlar = [{ id: "kalfalik", label: "Kalfalık Sınavı" }, { id: "ustalik", label: "Ustalık Sınavı" }];
  const dallar = [{ id: "MBO", label: DAL_LABELS.MBO }, { id: "BMI", label: DAL_LABELS.BMI }];
  const turBar = `<div class="row no-print" style="flex-wrap:wrap;">${turlar.map(t => `<button class="btn ${t.id === activeKuTur ? 'primary' : ''}" onclick="setKuTur('${t.id}')">${t.label}</button>`).join("")}</div>`;
  const dalBar = `<div class="row no-print" style="flex-wrap:wrap;margin-top:6px;">${dallar.map(d => `<button class="btn ${d.id === activeKuDal ? 'primary' : ''}" onclick="setKuDal('${d.id}')">${d.label}</button>`).join("")}</div>`;
  const kayitlar = S.kalfalikUstalik.kayitlar.filter(k => k.tur === activeKuTur && k.dal === activeKuDal);
  const baslik = (activeKuTur === "kalfalik" ? "MESEM Kalfalık" : "MESEM Ustalık") + " Beceri Sınavı Değerlendirme Çizelgesi — " + DAL_LABELS[activeKuDal];
  const dosyaAdi = baslik;
  return `
  <div class="card no-print">
    <h2>Kalfalık / Ustalık Sınavı</h2>
    <p class="small">MESEM (mesleki eğitim merkezi) öğrencilerinin Kalfalık ve Ustalık Beceri Sınavı değerlendirme çizelgesi. Meslek dalına ve sınav seviyesine göre öğrenci ekleyip işletme dönem notlarını, iş dosyası puanını ve sınav puanını girin — genel ortalama, beceri sınav puanı, yıl sonu notu ve sonuç MEB formülüyle otomatik hesaplanır.</p>
    ${turBar}
    ${dalBar}
    <div class="row" style="margin-top:8px;">
      <button class="btn primary" onclick="snEkleKayit('ku',{tur:activeKuTur,dal:activeKuDal})">Öğrenci Ekle</button>
      <button class="btn" onclick="snListedenTopluEkleModal('ku')">Öğrenci Listesinden Toplu Ekle</button>
    </div>
    ${snBelgeSeciciBar("ku")}
    ${belgeAracCubugu(dosyaAdi)}
  </div>
  ${activeSnBelge === "cizelge" ? snIsDosyasiKriterAciklamasi() : ""}
  <div class="print-area">
    ${activeSnBelge === "cizelge" ? belgeYazdirmaBasligi(baslik) + snRosterTablo("ku", kayitlar) : snEkBelgeGovde("ku", kayitlar, { tur: activeKuTur, dal: activeKuDal }, baslik)}
  </div>`;
}

/* ---- Beceri Sınavı (İşletmelerde Beceri Eğitimi — AMP 12. sınıf) ---- */
let activeBeceriSinif = "12-A";
function setBeceriSinif(s) { activeBeceriSinif = s; renderMain(); }
function viewBeceriSinavi() {
  const siniflarKaynagi = S.classes.filter(c => c.grade === 12 && !c.excludeFromDistribution);
  const siniflar = siniflarKaynagi.length ? siniflarKaynagi.map(c => ({ id: c.name, dal: c.dal })) : [{ id: "12-A", dal: "MBO" }, { id: "12-B", dal: "BMI" }];
  if (!siniflar.some(s => s.id === activeBeceriSinif)) activeBeceriSinif = siniflar[0].id;
  const aktifSinifTanimi = siniflar.find(s => s.id === activeBeceriSinif) || siniflar[0];
  const sinifBar = `<div class="row no-print" style="flex-wrap:wrap;">${sekmeDropdown("beceri-sinif", siniflar.map(s => ({ value: s.id, label: s.id + " — " + (DAL_LABELS[s.dal] || s.dal) })), activeBeceriSinif, "setBeceriSinif('{v}')")}</div>`;
  const kayitlar = S.beceriSinavi.kayitlar.filter(k => k.sinif === activeBeceriSinif);
  const baslik = "İşletmelerde Beceri Eğitimi Yıl Sonu Beceri Sınavı Değerlendirme Çizelgesi — " + activeBeceriSinif + " — " + (DAL_LABELS[aktifSinifTanimi.dal] || aktifSinifTanimi.dal);
  const dosyaAdi = baslik;
  return `
  <div class="card no-print">
    <h2>Beceri Sınavı</h2>
    <p class="small">İşletmelerde beceri eğitimi gören 12. sınıf (AMP) öğrencilerinin yıl sonu beceri sınavı değerlendirme çizelgesi. Sınıfa göre öğrenci ekleyip işletme dönem notlarını, iş dosyası puanını ve sınav puanını girin — genel ortalama, beceri sınav puanı, yıl sonu notu ve sonuç MEB formülüyle otomatik hesaplanır.</p>
    ${sinifBar}
    <div class="row" style="margin-top:8px;">
      <button class="btn primary" onclick="snEkleKayit('bs',{sinif:activeBeceriSinif,dal:aktifDalIcinEkle()})">Öğrenci Ekle</button>
      <button class="btn" onclick="snListedenTopluEkleModal('bs')">Öğrenci Listesinden Toplu Ekle</button>
    </div>
    ${snBelgeSeciciBar("bs")}
    ${belgeAracCubugu(dosyaAdi)}
  </div>
  ${activeSnBelge === "cizelge" ? snIsDosyasiKriterAciklamasi() : ""}
  <div class="print-area">
    ${activeSnBelge === "cizelge" ? belgeYazdirmaBasligi(baslik) + snRosterTablo("bs", kayitlar) : snEkBelgeGovde("bs", kayitlar, { sinif: activeBeceriSinif, dal: aktifSinifTanimi.dal }, baslik)}
  </div>`;
}
function aktifDalIcinEkle() {
  const siniflarKaynagi = S.classes.filter(c => c.grade === 12 && !c.excludeFromDistribution);
  const siniflar = siniflarKaynagi.length ? siniflarKaynagi.map(c => ({ id: c.name, dal: c.dal })) : [{ id: "12-A", dal: "MBO" }, { id: "12-B", dal: "BMI" }];
  const t = siniflar.find(s => s.id === activeBeceriSinif);
  return t ? t.dal : "MBO";
}
function beceriKomisyonKararKarti(sinif, dal) {
  const k = S.kurumBilgileri;
  const ogretimYili = S.akademikTakvim ? S.akademikTakvim.ogretimYili : "";
  return `
  <div style="text-align:center;margin-bottom:12px;">
    <div style="font-weight:700;">${escHtml((k.okulAdi || "").toLocaleUpperCase("tr-TR"))}</div>
    <div style="font-weight:700;">BECERİ SINAVI KOMİSYONU KARAR TUTANAĞI</div>
  </div>
  <table style="margin-bottom:12px;">
    <tr><td><b>Sınıf</b></td><td>${escHtml(sinif || '-')}</td><td><b>Alan/Dal</b></td><td>${escHtml(dal ? (DAL_LABELS[dal] || dal) : '-')}</td></tr>
    <tr><td><b>Eğitim Yılı</b></td><td>${escHtml(ogretimYili || '-')}</td><td><b>Sınav Türü</b></td><td>Yazılı (Çoktan Seçmeli)</td></tr>
  </table>
  <p class="small" style="margin-bottom:14px;">${escHtml(k.okulAdi)} ${escHtml(k.alanAdi)} ${escHtml(dal ? (DAL_LABELS[dal] || dal) + " Dalı" : "")} ${escHtml(sinif)} sınıfı öğrencilerinin ${escHtml(ogretimYili)} Eğitim-Öğretim Yılı İşletmelerde Beceri Eğitimi Yıl Sonu Beceri Sınavının, Millî Eğitim Bakanlığı Ortaöğretim Kurumları Yönetmeliği'nin 46. maddesinin 1. fıkrası hükmü uyarınca komisyonumuzun takdir yetkisi dahilinde yazılı sınav biçiminde yapılmasına; söz konusu sınavın 9, 10, 11 ve 12. sınıf öğretim programlarını kapsayan konulardan oluşan 50 (elli) soruluk çoktan seçmeli (4 şıklı) olarak uygulanmasına ve değerlendirmenin 100 (yüz) tam puan üzerinden yapılmasına komisyonumuzca oybirliği ile karar verilmiştir.</p>
  <p class="small" style="margin-bottom:20px;">Dayanak: MEB Ortaöğretim Kurumları Yönetmeliği Madde 46/1 — "Bu sınav, dersin özelliğine göre komisyonca alınacak karar doğrultusunda uygulamalı ve/veya yazılı olarak yapılır."</p>
  <p class="small no-print">İmza için Ayarlar &gt; İmza Sirküsü'nden komisyon üyelerini ekleyip belgeyi yazdırırken elle tamamlayabilirsiniz; aşağıdaki alan şefi/okul müdürü bilgileri Ayarlar'dan otomatik gelir.</p>
  <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:20px;margin-top:20px;">
    <div>
      <div style="margin-top:24px;font-weight:600;">${escHtml(k.alanSefiAdi || "")}</div>
      <div>${escHtml(k.alanSefiUnvani || "Alan Şefi")}</div>
    </div>
    <div style="text-align:right;">
      <div>Komisyon Başkanı</div>
      <div style="margin-top:24px;font-weight:600;">${escHtml(k.mudurAdi || "")}</div>
      <div>Okul Müdürü</div>
    </div>
  </div>`;
}

/* ---- Kalfalık/Ustalık ve Beceri Sınavı için ek resmi belgeler ----
   Gönderilen gerçek sınav evraklarından (Sınav Tutanağı, Sınav Sonuç
   Tutanağı, Sarf/Not Çizelgesi) yola çıkılarak eklendi. Sınav Tutanağı
   oturum bazlı (tur+dal ya da sınıf) ayrı bir kayıt tutar; katılan/
   başarılı/başarısız sayıları çizelgedeki kayıtlardan otomatik
   hesaplanır, saat bilgileri elle girilir. Sınav Sonuç Tutanağı'ndaki
   3 değerlendirici puanı girildiğinde ortalaması otomatik olarak
   çizelgedeki Sınav Puanı'na işlenir — aynı bilgiyi iki yerde ayrı ayrı
   girmeye gerek kalmaz. */
let activeSnBelge = "cizelge";
function setSnBelge(id) { activeSnBelge = id; renderMain(); }
function snBelgeSeciciBar(kind) {
  const secenekler = [
    { id: "cizelge", label: "Değerlendirme Çizelgesi" },
    { id: "tutanak", label: "Sınav Tutanağı" },
    { id: "sonuc-tutanak", label: "Sınav Sonuç Tutanağı" },
    { id: "sarf-not", label: "Sarf / Not Çizelgesi" },
    { id: "is-dosyasi", label: "İş Dosyası Derecelendirme" },
    { id: "aday-gelmedi", label: "Aday Gelmedi Tutanağı" },
    { id: "not-fisi", label: "Not Fişi" },
    { id: "sinav-kagidi", label: "Sınav Kağıdı (Uygulama Sorusu)" }
  ];
  if (kind === "bs") secenekler.push({ id: "komisyon-karar", label: "Komisyon Karar Tutanağı" });
  return `<div class="row no-print" style="flex-wrap:wrap;">${secenekler.map(s => `<button class="btn ${s.id === activeSnBelge ? 'primary' : ''}" onclick="setSnBelge('${s.id}')">${s.label}</button>`).join("")}</div>`;
}
function sinavTutanagiAnahtari(kind, ekAlanlar) {
  return kind === "ku" ? "ku|" + ekAlanlar.tur + "|" + ekAlanlar.dal : "bs|" + ekAlanlar.sinif;
}
function sinavTutanagiOlusturVeyaGetir(kind, ekAlanlar) {
  const anahtar = sinavTutanagiAnahtari(kind, ekAlanlar);
  let t = S.sinavTutanaklari.find(x => sinavTutanagiAnahtari(x.kind, x) === anahtar);
  if (!t) {
    t = Object.assign({ id: uid("st"), kind,
      ogretimYili: S.akademikTakvim ? S.akademikTakvim.ogretimYili : "", sinavDonemi: "", sinavTarihi: "", dersinAdi: "",
      komisyonToplanmaSaati: "", hazirlikSaati: "", sinavBaslamaSaati: "", katilmayanSayisi: "",
      kullanilanKagitSayisi: "", sinavBitisSaati: "", degerlendirmeTarihSaati: "" }, ekAlanlar);
    S.sinavTutanaklari.push(t);
  }
  return t;
}
function updateSinavTutanagiAlan(id, alan, value) {
  const t = S.sinavTutanaklari.find(x => x.id === id);
  if (!t) return;
  t[alan] = value;
  save();
}
function snImzaBlogu(baslikSayisi) {
  const k = S.kurumBilgileri;
  const hucreler = new Array(baslikSayisi).fill(0).map((_, i) => i === 0 ? `<td>${escHtml(k.mudurAdi)}</td>` : `<td>…………………..</td>`).join("");
  const etiketler = ["Sınav Kom. Bşk.", "Üye", "Üye", "Üye", "Üye"].slice(0, baslikSayisi);
  return `<table style="margin-top:10px;"><tr>${etiketler.map(e => `<th>${e}</th>`).join("")}</tr><tr>${hucreler}</tr><tr><td colspan="${baslikSayisi}" class="small">Okul/Kurum Müdürü</td></tr></table>`;
}
function renderSinavTutanagi(kind, kayitlar, t, baslik) {
  const katilan = kayitlar.length;
  const basarili = kayitlar.filter(k => snKayitHesapla(k).sonuc === "BAŞARILI").length;
  const basarisiz = kayitlar.filter(k => snKayitHesapla(k).sonuc === "BAŞARISIZ").length;
  const devamsiz = kayitlar.filter(k => k.kod === "D").length;
  const alan = (etiket, field, w) => `<tr><td>${etiket}</td><td class="no-print"><input type="text" value="${escHtml(t[field])}" style="width:${w || 140}px" onchange="updateSinavTutanagiAlan('${t.id}','${field}',this.value)"></td><td class="print-only-cell">${escHtml(t[field] || '…')}</td></tr>`;
  return `
  <div style="text-align:center;margin-bottom:10px;">
    <div style="font-weight:700;">${escHtml((S.kurumBilgileri.okulAdi || "").toLocaleUpperCase("tr-TR"))}</div>
    <div style="font-weight:700;">SINAV TUTANAĞI</div>
  </div>
  <table style="margin-bottom:10px;">
    ${alan("Öğretim Yılı", "ogretimYili")}
    <tr><td>Sınav Seviyesi</td><td colspan="2">${escHtml(baslik)}</td></tr>
    ${alan("Sınav Dönemi", "sinavDonemi")}
    ${alan("Sınav Tarihi", "sinavTarihi")}
    ${alan("Dersin Adı", "dersinAdi", 220)}
  </table>
  <h3>Sınav Hazırlığı</h3>
  <table style="margin-bottom:10px;">
    ${alan("Sınav Komisyonunun Toplandığı Saat", "komisyonToplanmaSaati", 90)}
    ${alan("Soruların ve Cevap Anahtarının Hazırlandığı Saat", "hazirlikSaati", 90)}
  </table>
  <p class="small">1- Sınav Komisyonu, Okul/Kurum Müdürünün başkanlığında toplanarak sınav sorularını ve cevap anahtarını hazırlamıştır.<br>2- Sınav soruları ve cevap anahtarı imzalanıp onaylandıktan sonra bir nüshaları sınav komisyon başkanlığına teslim edilmiştir.</p>
  ${snImzaBlogu(5)}
  <h3 style="margin-top:16px;">Sınav Başlama, Katılma ve Sınav Bilgileri</h3>
  <table style="margin-bottom:10px;">
    ${alan("Sınavın Başladığı Saat", "sinavBaslamaSaati", 90)}
    <tr><td>Sınava Katılan Öğrenci Sayısı</td><td colspan="2">${katilan}</td></tr>
    ${alan("Sınava Katılmayan Öğrenci Sayısı", "katilmayanSayisi", 60)}
    <tr><td>Toplam Öğrenci Sayısı</td><td colspan="2">${katilan}</td></tr>
    ${alan("Sınavda Kullanılan Kağıt Sayısı", "kullanilanKagitSayisi", 60)}
    ${alan("Sınavın Sona Erdiği Saat", "sinavBitisSaati", 90)}
  </table>
  ${snImzaBlogu(5)}
  <h3 style="margin-top:16px;">Değerlendirme</h3>
  <table style="margin-bottom:10px;">
    ${alan("Değerlendirmenin Yapıldığı Tarih ve Saat", "degerlendirmeTarihSaati", 140)}
    <tr><td>Başarılı Öğrenci Sayısı</td><td colspan="2">${basarili}</td></tr>
    <tr><td>Başarısız Öğrenci Sayısı</td><td colspan="2">${basarisiz}${devamsiz ? " (" + devamsiz + " devamsız dahil)" : ""}</td></tr>
    <tr><td>Toplam Öğrenci Sayısı</td><td colspan="2">${katilan}</td></tr>
  </table>
  <p class="small">1- Sınav Kağıtlarının Değerlendirilmesi Tamamlanmıştır.<br>2- Sınav Evrakları Komisyon Huzurunda Okul/Kurum Müdürlüğüne Teslim Edilmiştir.</p>
  ${snImzaBlogu(5)}`;
}
function renderSinavSonucTutanagi(kind, kayitlar, baslik) {
  let siraNo = 0;
  const satirlar = kayitlar.map(k => {
    siraNo++;
    const ort = snDegerlendiriciOrtalama(k);
    const yazi = ort !== null ? sayiYaziIleTr(Math.round(ort)) : "";
    const basariliMi = ort !== null && ort >= 50;
    return `<tr>
      <td>${siraNo}</td>
      <td>${escHtml(k.ad)} ${escHtml(k.soyad)}</td>
      <td><input class="no-print" type="text" value="${escHtml(k.degerlendirici1)}" style="width:44px;text-align:center;" onchange="snGuncelleDegerlendirici('${kind}','${k.id}','degerlendirici1',this.value)"><span class="print-only-inline">${escHtml(k.degerlendirici1 || '-')}</span></td>
      <td><input class="no-print" type="text" value="${escHtml(k.degerlendirici2)}" style="width:44px;text-align:center;" onchange="snGuncelleDegerlendirici('${kind}','${k.id}','degerlendirici2',this.value)"><span class="print-only-inline">${escHtml(k.degerlendirici2 || '-')}</span></td>
      <td><input class="no-print" type="text" value="${escHtml(k.degerlendirici3)}" style="width:44px;text-align:center;" onchange="snGuncelleDegerlendirici('${kind}','${k.id}','degerlendirici3',this.value)"><span class="print-only-inline">${escHtml(k.degerlendirici3 || '-')}</span></td>
      <td>${ort !== null ? ort : "-"}</td>
      <td>${escHtml(yazi)}</td>
      <td>${ort !== null ? (basariliMi ? "BAŞARILI" : "BAŞARISIZ") : "-"}</td>
    </tr>`;
  }).join("");
  return `
  <div style="text-align:center;margin-bottom:10px;">
    <div style="font-weight:700;">${escHtml((S.kurumBilgileri.okulAdi || "").toLocaleUpperCase("tr-TR"))}</div>
    <div style="font-weight:700;">SINAV SONUÇ TUTANAĞI — ${escHtml(baslik)}</div>
  </div>
  <table>
    <thead><tr><th>Sıra No</th><th>Adayın Adı Soyadı</th><th>1. Değ.</th><th>2. Değ.</th><th>3. Değ.</th><th colspan="2">Sınav Puanı</th><th>Sonuç</th></tr></thead>
    <tbody>${satirlar || `<tr><td colspan="8" class="small">Henüz aday yok.</td></tr>`}</tbody>
  </table>
  <p class="small" style="margin-top:10px;">En az 2 değerlendirici olması gerekir. Değerlendiricilerin verdiği puanların aritmetik ortalaması adayın sınav sonuç notudur. Kritik becerilerden başarılı olmak kaydıyla toplam 50 puan ve üzeri alanlar BAŞARILI sayılır.</p>
  <table style="margin-top:14px;"><tr><th>Değerlendirici</th><th>Adı Soyadı</th><th>İmzası</th></tr><tr><td>1</td><td></td><td></td></tr><tr><td>2</td><td></td><td></td></tr><tr><td>3</td><td></td><td></td></tr></table>`;
}
function renderSarfNotCizelgesi(kind, kayitlar, t, baslik) {
  let siraNo = 0;
  const satirlar = kayitlar.map(k => {
    siraNo++;
    return `<tr>
      <td>${siraNo}</td>
      <td class="no-print"><input type="text" value="${escHtml(k.tckn)}" style="width:100px;" onchange="snGuncelleAlan('${kind}','${k.id}','tckn',this.value)"><span class="print-only-inline">${escHtml(k.tckn || '-')}</span></td>
      <td>${escHtml(k.ad)} ${escHtml(k.soyad)}</td>
      <td class="no-print"><input type="text" value="${escHtml(k.kagitAdedi)}" style="width:44px;text-align:center;" onchange="snGuncelleAlan('${kind}','${k.id}','kagitAdedi',this.value)"><span class="print-only-inline">${escHtml(k.kagitAdedi || '-')}</span></td>
      <td>${escHtml(String(k.sinavPuani || '-'))}</td>
    </tr>`;
  }).join("");
  return `
  <div style="text-align:center;margin-bottom:10px;">
    <div style="font-weight:700;">${escHtml((S.kurumBilgileri.okulAdi || "").toLocaleUpperCase("tr-TR"))}</div>
    <div style="font-weight:700;">SINAV SARF / NOT ÇİZELGESİ</div>
  </div>
  <table style="margin-bottom:10px;">
    <tr><td>Dersin Adı</td><td colspan="2">${escHtml(baslik)}</td></tr>
    <tr><td>Sınav Tarihi/Saati</td><td class="no-print" colspan="2"><input type="text" value="${escHtml(t.sinavTarihi)}" style="width:140px;" onchange="updateSinavTutanagiAlan('${t.id}','sinavTarihi',this.value)"></td><td class="print-only-cell">${escHtml(t.sinavTarihi || '…')}</td></tr>
  </table>
  <table>
    <thead><tr><th>Sıra No</th><th>T.C. Kimlik No</th><th>Adayın Adı Soyadı</th><th>Kağıt Adedi</th><th>Sınav Notu</th></tr></thead>
    <tbody>${satirlar || `<tr><td colspan="5" class="small">Henüz aday yok.</td></tr>`}</tbody>
  </table>`;
}

/* ---- İş Dosyası (Staj Defteri) Derecelendirme Anahtarı ----
   Gerçek Is_Dosyasi_Derecelendirme_2025-2026.xlsx dosyalarından: aynı
   veri (isDosyasi.k1-4, aciklama) zaten ana çizelgede tutuluyor — burada
   sadece kendi başlığı, kriter açıklamaları, sınıf ortalaması ve imza
   bloğuyla bağımsız bir belge olarak yeniden dizilir. */
function renderIsDosyasiDerecelendirme(kind, kayitlar, baslik) {
  const dalEtiket = kayitlar.length ? (DAL_LABELS[kayitlar[0].dal] || kayitlar[0].dal) : "";
  const ogretimYili = S.akademikTakvim ? S.akademikTakvim.ogretimYili : "";
  let siraNo = 0;
  const toplamlar = [0, 0, 0, 0, 0];
  const rows = kayitlar.map(k => {
    siraNo++;
    const puanlar = ["k1", "k2", "k3", "k4"].map(f => snSayi(k.isDosyasi[f]) || 0);
    const toplam = snIsDosyasiPuani(k);
    puanlar.forEach((v, i) => { toplamlar[i] += v; });
    toplamlar[4] += toplam;
    const hucre = (f) => `<td><input class="no-print" type="text" value="${escHtml(k.isDosyasi[f])}" style="width:40px;text-align:center;" onchange="snGuncelleAlan('${kind}','${k.id}','isDosyasi.${f}',this.value)"><span class="print-only-inline">${escHtml(k.isDosyasi[f])}</span></td>`;
    return `<tr>
      <td>${siraNo}</td>
      <td>${escHtml(k.ogrenciNo)}</td>
      <td>${escHtml(k.ad)}</td>
      <td>${escHtml(k.soyad)}</td>
      ${hucre("k1")}${hucre("k2")}${hucre("k3")}${hucre("k4")}
      <td style="font-weight:600;">${toplam}</td>
      <td class="no-print"><input type="text" value="${escHtml(k.aciklama)}" style="width:110px;" onchange="snGuncelleAlan('${kind}','${k.id}','aciklama',this.value)"><span class="print-only-inline">${escHtml(k.aciklama)}</span></td>
    </tr>`;
  }).join("");
  const n = kayitlar.length || 1;
  const ort = toplamlar.map(t => (t / n).toFixed(2));
  return `
  <div style="text-align:center;margin-bottom:10px;">
    <div style="font-weight:700;">${escHtml((S.kurumBilgileri.okulAdi || "").toLocaleUpperCase("tr-TR"))}</div>
    <div style="font-weight:700;">${escHtml((S.kurumBilgileri.alanAdi || "").toLocaleUpperCase("tr-TR"))}${dalEtiket ? " — " + escHtml(dalEtiket) + " DALI" : ""}</div>
    <div style="font-weight:700;">İŞ DOSYASI (STAJ DEFTERİ) DERECELENDİRME ANAHTARI — ${escHtml(ogretimYili)} EĞİTİM-ÖĞRETİM YILI</div>
  </div>
  <p class="small">${escHtml(baslik)}</p>
  <table style="font-size:10.5px;">
    <thead>
      <tr><th rowspan="2">Sıra<br>No</th><th rowspan="2">Öğrenci<br>No</th><th rowspan="2">Adı</th><th rowspan="2">Soyadı</th>
      <th>Kriter 1<br>Sayfa Düzeni ve Temizliği (Max: 25)</th><th>Kriter 2<br>Teknik Resim ve Çizim Kuralları (Max: 25)</th><th>Kriter 3<br>Yapılan İşlerin Anlatımı (Max: 25)</th><th>Kriter 4<br>Usta Öğretici İmzaları (Max: 25)</th>
      <th rowspan="2">TOPLAM<br>(Max: 100)</th><th rowspan="2">Açıklama /<br>Komisyon Notu</th></tr>
      <tr></tr>
    </thead>
    <tbody>${rows || `<tr><td colspan="10" class="small">Henüz öğrenci yok.</td></tr>`}
    <tr style="font-weight:700;"><td colspan="4">SINIF ORTALAMASI</td><td>${ort[0]}</td><td>${ort[1]}</td><td>${ort[2]}</td><td>${ort[3]}</td><td>${ort[4]}</td><td></td></tr>
    </tbody>
  </table>
  <div class="small" style="margin-top:10px;">
    <p><b>Kriter 1 — Sayfa Düzeni ve Temizliği:</b> 0-5 Çok dağınık ve kirli · 6-12 Kısmen düzenli · 13-19 Büyük ölçüde düzenli · 20-24 Düzenli ve temiz · 25 Mükemmel düzen</p>
    <p><b>Kriter 2 — Teknik Resim ve Çizim Kuralları:</b> 0-5 Hiç kural yok · 6-12 Kısmen uygun · 13-19 Büyük ölçüde uygun · 20-24 Kurallara uygun · 25 Tam ve eksiksiz</p>
    <p><b>Kriter 3 — Yapılan İşlerin Anlatımı:</b> 0-5 Yok / çok yetersiz · 6-12 Kısmen açıklama var · 13-19 Yeterli açıklama · 20-24 Detaylı anlatım · 25 Eksiksiz ve detaylı</p>
    <p><b>Kriter 4 — Usta Öğretici İmzaları:</b> 0-5 İmza çok eksik · 6-12 Kısmen imzalı · 13-19 Büyük bölümü imzalı · 20-24 Neredeyse tamamı · 25 Tamamı imzalı</p>
  </div>
  ${snImzaBlogu(3)}`;
}

/* ---- Sınav Yapılamadığına İlişkin Tutanak (Aday Gelmedi) ----
   TUTANAK ADAY GELMEDİ.doc gerçek şablonundan birebir. ---- */
function adayGelmediTutanagiOlusturVeyaGetir(kind, ekAlanlar) {
  const anahtar = sinavTutanagiAnahtari(kind, ekAlanlar);
  let t = S.adayGelmediTutanaklari.find(x => sinavTutanagiAnahtari(x.kind, x) === anahtar);
  if (!t) {
    t = Object.assign({ id: uid("agt"), kind,
      ogretimYili: S.akademikTakvim ? S.akademikTakvim.ogretimYili : "", sinavDonemi: "", sinavTarihi: "", dersinAdi: "",
      sinavCesidi: "Yazılı", toplanmaTarihi: "", toplanmaGunu: "", toplanmaSaati: "", beklemeSaati: "" }, ekAlanlar);
    S.adayGelmediTutanaklari.push(t);
  }
  return t;
}
function updateAdayGelmediAlan(id, alan, value) {
  const t = S.adayGelmediTutanaklari.find(x => x.id === id);
  if (!t) return;
  t[alan] = value;
  save();
}
function setAdayGelmediCesidi(id, value) {
  const t = S.adayGelmediTutanaklari.find(x => x.id === id);
  if (!t) return;
  t.sinavCesidi = value;
  save(); renderMain();
}
function renderAdayGelmediTutanagi(kind, ekAlanlar, dalEtiket) {
  const t = adayGelmediTutanagiOlusturVeyaGetir(kind, ekAlanlar);
  const alan = (etiket, field, w) => `<tr><td>${etiket}</td><td class="no-print"><input type="text" value="${escHtml(t[field])}" style="width:${w || 160}px" onchange="updateAdayGelmediAlan('${t.id}','${field}',this.value)"></td><td class="print-only-cell">${escHtml(t[field] || '…')}</td></tr>`;
  const sinavAdi = kind === "ku"
    ? "Kalfalık-Ustalık Denklik (" + (t.sinavDonemi || "……………") + " Dönemi)"
    : "İşletmelerde Beceri Eğitimi Yıl Sonu Beceri Sınavı";
  const cesitler = ["Yazılı", "Sözlü", "Uygulama"];
  const turEtiket = kind === "ku" ? (ekAlanlar.tur === "ustalik" ? "USTALIK" : "KALFALIK") : "BECERİ SINAVI";
  return `
  <div style="text-align:center;margin-bottom:14px;">
    <div style="font-weight:700;">SINAV YAPILAMADIĞINA İLİŞKİN TUTANAK</div>
  </div>
  <table style="margin-bottom:14px;">
    <tr><td>Okulun Adı</td><td colspan="2">${escHtml(S.kurumBilgileri.okulAdi)}</td></tr>
    ${alan("Öğretim Yılı", "ogretimYili")}
    ${alan("Sınav Dönemi", "sinavDonemi")}
    ${alan("Sınav Tarihi", "sinavTarihi")}
    <tr><td>Sınavın Adı</td><td colspan="2">${escHtml(sinavAdi)}</td></tr>
    ${alan("Sınavı Yapılacak Dersin Adı", "dersinAdi", 220)}
    <tr><td>Sınavın Çeşidi</td><td colspan="2" class="no-print">${cesitler.map(c => `<button class="btn ${t.sinavCesidi === c ? 'primary' : ''}" style="padding:4px 9px;font-size:11px;margin-right:4px;" onclick="setAdayGelmediCesidi('${t.id}','${c}')">${c}</button>`).join("")}</td>
    <td class="print-only-cell">${cesitler.map(c => (t.sinavCesidi === c ? "[X] " : "[  ] ") + c).join("   ")}</td></tr>
  </table>
  <p class="small" style="margin-bottom:16px;">Komisyonumuz ${escHtml(t.toplanmaTarihi || ".…./…../" + (t.ogretimYili || "….."))} tarih ve ${escHtml(t.toplanmaGunu || "……………")} günü saat ${escHtml(t.toplanmaSaati || "…..:….")}'te ${turEtiket} ${escHtml(dalEtiket || "……………………………")} Meslek Dalı sınavını yapmak üzere toplanmış ve gerekli hazırlıkları yapmıştır. Ancak sınava girecek öğrenci/öğrencilerin gelmediğinin anlaşılması üzerine komisyon saat ${escHtml(t.beklemeSaati || "…..:…..")}'a kadar bekledikten sonra dağılmıştır.</p>
  <div class="row no-print" style="flex-wrap:wrap;gap:10px;margin-bottom:16px;">
    <label class="small">Toplanma Tarihi <input type="text" value="${escHtml(t.toplanmaTarihi)}" style="width:100px;" onchange="updateAdayGelmediAlan('${t.id}','toplanmaTarihi',this.value)"></label>
    <label class="small">Günü <input type="text" value="${escHtml(t.toplanmaGunu)}" style="width:100px;" onchange="updateAdayGelmediAlan('${t.id}','toplanmaGunu',this.value)"></label>
    <label class="small">Toplanma Saati <input type="text" value="${escHtml(t.toplanmaSaati)}" style="width:70px;" onchange="updateAdayGelmediAlan('${t.id}','toplanmaSaati',this.value)"></label>
    <label class="small">Bekleme Saati <input type="text" value="${escHtml(t.beklemeSaati)}" style="width:70px;" onchange="updateAdayGelmediAlan('${t.id}','beklemeSaati',this.value)"></label>
  </div>
  <div style="text-align:center;font-weight:700;margin-bottom:10px;">S I N A V   K O M İ S Y O N U</div>
  <table>
    <tr><td style="font-weight:600;">${escHtml(S.kurumBilgileri.mudurAdi)}</td></tr>
    <tr><td>Okul Müdürü / Sınava Kom. Başkanı</td></tr>
    <tr><td style="height:26px;">ÜYE</td></tr>
    <tr><td style="height:26px;">ÜYE</td></tr>
    <tr><td style="height:26px;">ÜYE</td></tr>
  </table>`;
}

/* ---- İşletmelerde Meslek Eğitimi Gören Öğrencilere Ait Dönem Not Fişi ----
   NOT FİŞİ.xlsx gerçek şablonundan; her öğrenci için ayrı bir fiş basılır
   (İşletmelerde Verilen Puanlar bölümü zaten ana çizelgedeki d1/d2 dönem
   verilerinden gelir — Telafi Eğitim ve Beceri Yarışması puanları buradan
   girilir). ---- */
let activeNotFisiDonem = "1";
function setNotFisiDonem(d) { activeNotFisiDonem = d; renderMain(); }
function renderNotFisiTek(kind, k, donem) {
  const d = donem === "2" ? k.d2 : k.d1;
  const temrin = snOrtalama([d.t1, d.t2]);
  const isHizmet = snOrtalama([d.ih1, d.ih2]);
  const proje = snSayi(d.proje) || 0;
  const deney = snSayi(d.deney) || 0;
  const degerler = [temrin, isHizmet, proje, deney];
  if (k.telafiEgitimPuani !== "") degerler.push(snSayi(k.telafiEgitimPuani) || 0);
  if (k.beceriYarismaPuani !== "") degerler.push(snSayi(k.beceriYarismaPuani) || 0);
  const donemOrt = Math.round((degerler.reduce((a, b) => a + b, 0) / degerler.length) * 10) / 10;
  const donemOrtTamsayi = Math.min(100, Math.max(0, Math.round(donemOrt)));
  const kurum = S.kurumBilgileri;
  return `
  <div class="card" style="page-break-inside:avoid;margin-bottom:16px;">
    <div style="text-align:center;margin-bottom:10px;">
      <div style="font-weight:700;">İŞLETMELERDE MESLEK EĞİTİMİ GÖREN ÖĞRENCİLERE AİT DÖNEM NOT FİŞİ</div>
    </div>
    <table style="margin-bottom:10px;">
      <tr><td>Okul/Kurumun Adı</td><td colspan="3">${escHtml(kurum.okulAdi)} / MESEM PROGRAMI</td></tr>
      <tr><td>Öğretim Yılı</td><td>${escHtml(S.akademikTakvim ? S.akademikTakvim.ogretimYili : '')}</td><td>Dönemi</td><td>${donem}. Dönem</td></tr>
      <tr><td>İşletmenin Adı</td><td class="no-print"><input type="text" value="${escHtml(k.isletmeAdi)}" style="width:160px;" onchange="snGuncelleAlan('${kind}','${k.id}','isletmeAdi',this.value)"><span class="print-only-inline"></span></td><td class="print-only-cell">${escHtml(k.isletmeAdi || '…')}</td>
        <td>Tel: <span class="no-print"><input type="text" value="${escHtml(k.isletmeTel)}" style="width:90px;" onchange="snGuncelleAlan('${kind}','${k.id}','isletmeTel',this.value)"></span><span class="print-only-inline">${escHtml(k.isletmeTel || '…')}</span></td></tr>
      <tr><td>Dersin Adı</td><td colspan="3">İşletmede Beceri Eğitimi</td></tr>
    </table>
    <table style="font-size:10.5px;">
      <thead><tr><th>Öğrenci No</th><th>Adı Soyadı</th><th>Meslek Alan/Dalı</th><th>Temrin</th><th>İş-Hizmet</th><th>Proje</th><th>Deney</th><th>Telafi Eğitim Puanı (*)</th><th>Beceri Yarışması Puanı (*)</th><th>Dönem Puanı<br>Rakam ile</th><th>Dönem Puanı<br>Yazı ile</th></tr></thead>
      <tbody><tr>
        <td>${escHtml(k.ogrenciNo)}</td><td>${escHtml(k.ad)} ${escHtml(k.soyad)}</td><td>${escHtml(DAL_LABELS[k.dal] || k.dal || '')}</td>
        <td>${temrin.toFixed(1)}</td><td>${isHizmet.toFixed(1)}</td><td>${proje}</td><td>${deney}</td>
        <td class="no-print"><input type="text" value="${escHtml(k.telafiEgitimPuani)}" style="width:44px;text-align:center;" onchange="snGuncelleAlan('${kind}','${k.id}','telafiEgitimPuani',this.value)"><span class="print-only-inline">${escHtml(k.telafiEgitimPuani || '-')}</span></td>
        <td class="no-print"><input type="text" value="${escHtml(k.beceriYarismaPuani)}" style="width:44px;text-align:center;" onchange="snGuncelleAlan('${kind}','${k.id}','beceriYarismaPuani',this.value)"><span class="print-only-inline">${escHtml(k.beceriYarismaPuani || '-')}</span></td>
        <td style="font-weight:600;">${donemOrt}</td><td>${sayiYaziIleTr(donemOrtTamsayi)}</td>
      </tr></tbody>
    </table>
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-top:26px;text-align:center;font-size:11px;">
      <div>…………………………………<div style="margin-top:4px;">Usta Öğretici<br>Eğitici Personel</div></div>
      <div>…………………………………<div style="margin-top:4px;">İşletme Yetkilisi</div></div>
      <div><div style="font-weight:600;">${escHtml(kurum.mudurAdi)}</div><div style="margin-top:4px;">Okul/Kurum Müdürü</div></div>
      <div>…………………………………<div style="margin-top:4px;">Koor. Müdür Yardımcısı</div></div>
    </div>
    <p class="small" style="margin-top:14px;">AÇIKLAMALAR: 1) Bu çizelge; Mesleki ve Teknik Eğitim Yönetmeliğinin 82'inci maddesine göre, işletme yetkilisi tarafından doldurulacak ve dönem sona ermeden beş (5) gün önceden kapalı zarf içinde okul/kurum müdürlüğüne teslim edilecektir. 2) (*) işareti bölümler okul/kurum müdürlüğümüzce doldurulacak ve puan ortalaması alınarak dönem notu belirlenecektir.</p>
  </div>`;
}
function renderNotFisi(kind, kayitlar) {
  const donemBar = `<div class="row no-print" style="margin-bottom:10px;"><button class="btn ${activeNotFisiDonem === '1' ? 'primary' : ''}" onclick="setNotFisiDonem('1')">1. Dönem</button><button class="btn ${activeNotFisiDonem === '2' ? 'primary' : ''}" onclick="setNotFisiDonem('2')">2. Dönem</button></div>`;
  const govde = kayitlar.length ? kayitlar.map(k => renderNotFisiTek(kind, k, activeNotFisiDonem)).join("") : `<div class="card"><p class="small">Henüz öğrenci yok.</p></div>`;
  return donemBar + govde;
}

/* ---- Sınav Kağıdı (Uygulama Sorusu) ----
   SINAV KAĞITLARI/*.xlsx gerçek örneklerinden: soru metni + puan
   unsurları tur/dal (ya da sınıf) bazında bir kez tanımlanır, her
   öğrenci için ayrı bir uygulama kağıdı basılır. ---- */
function sinavKagidiOlusturVeyaGetir(kind, ekAlanlar) {
  const anahtar = sinavTutanagiAnahtari(kind, ekAlanlar);
  let sk = S.beceriSinavKagitlari.find(x => sinavTutanagiAnahtari(x.kind, x) === anahtar);
  if (!sk) {
    sk = Object.assign({ id: uid("bsk"), kind, soruMetni: "", unsurlar: [] }, ekAlanlar);
    S.beceriSinavKagitlari.push(sk);
  }
  return sk;
}
function updateSinavKagidiAlan(id, alan, value) {
  const sk = S.beceriSinavKagitlari.find(x => x.id === id);
  if (!sk) return;
  sk[alan] = value;
  save();
}
function sinavKagidiUnsurEkle(id) {
  const sk = S.beceriSinavKagitlari.find(x => x.id === id);
  if (!sk) return;
  sk.unsurlar.push({ id: uid("bsu"), ad: "", puan: "" });
  save(); renderMain();
}
function sinavKagidiUnsurSil(id, unsurId) {
  const sk = S.beceriSinavKagitlari.find(x => x.id === id);
  if (!sk) return;
  sk.unsurlar = sk.unsurlar.filter(u => u.id !== unsurId);
  save(); renderMain();
}
function updateSinavKagidiUnsur(id, unsurId, alan, value) {
  const sk = S.beceriSinavKagitlari.find(x => x.id === id);
  const u = sk && sk.unsurlar.find(x => x.id === unsurId);
  if (!u) return;
  u[alan] = value;
  save();
}
function renderSinavKagidi(kind, kayitlar, ekAlanlar, baslik, dalEtiket) {
  const sk = sinavKagidiOlusturVeyaGetir(kind, ekAlanlar);
  const toplamPuan = sk.unsurlar.reduce((s, u) => s + (snSayi(u.puan) || 0), 0);
  const belgeBasligi = kind === "ku"
    ? (ekAlanlar.tur === "ustalik" ? "USTALIK" : "KALFALIK") + " BECERİ SINAVI UYGULAMA SORUSU"
    : "BECERİ SINAVI UYGULAMA SORUSU";
  const editor = `
  <div class="card no-print">
    <h3>Uygulama Sorusu ve Değerlendirme Unsurları</h3>
    <label class="small">Soru Metni / Uygulama Görevi Tanımı</label>
    <textarea rows="6" style="width:100%;border:1px solid var(--line);border-radius:4px;padding:6px;font-family:inherit;font-size:11.5px;" oninput="updateSinavKagidiAlan('${sk.id}','soruMetni',this.value)" onblur="save()">${escHtml(sk.soruMetni)}</textarea>
    <table style="margin-top:10px;">
      <thead><tr><th>Değerlendirme Unsuru</th><th style="width:70px;">Puan</th><th></th></tr></thead>
      <tbody>${sk.unsurlar.map(u => `<tr>
        <td><input type="text" value="${escHtml(u.ad)}" style="width:100%;" onchange="updateSinavKagidiUnsur('${sk.id}','${u.id}','ad',this.value)"></td>
        <td><input type="text" value="${escHtml(u.puan)}" style="width:60px;text-align:center;" onchange="updateSinavKagidiUnsur('${sk.id}','${u.id}','puan',this.value); renderMain();"></td>
        <td><button class="btn danger" onclick="sinavKagidiUnsurSil('${sk.id}','${u.id}')">Sil</button></td>
      </tr>`).join("") || `<tr><td colspan="3" class="small">Henüz unsur eklenmedi.</td></tr>`}</tbody>
    </table>
    <div class="row" style="margin-top:8px;align-items:center;"><button class="btn" onclick="sinavKagidiUnsurEkle('${sk.id}')">Unsur Ekle</button><span class="small">Toplam: ${toplamPuan}p</span></div>
  </div>`;
  const sayfalar = kayitlar.length ? kayitlar.map(k => `
  <div class="card" style="page-break-inside:avoid;margin-bottom:16px;">
    <div style="text-align:center;margin-bottom:10px;">
      <div style="font-weight:700;">${escHtml((S.kurumBilgileri.okulAdi || "").toLocaleUpperCase("tr-TR"))}</div>
      <div style="font-weight:700;">${escHtml((S.kurumBilgileri.alanAdi || "").toLocaleUpperCase("tr-TR"))}</div>
      ${dalEtiket ? `<div style="font-weight:700;">${escHtml(dalEtiket).toLocaleUpperCase("tr-TR")} DALI</div>` : ""}
      <div style="font-weight:700;">${escHtml(belgeBasligi)}</div>
    </div>
    <div style="min-height:160px;border:1px solid var(--line);padding:8px;margin-bottom:14px;white-space:pre-wrap;">${nlToBr(sk.soruMetni) || '<span class="small">—</span>'}</div>
    <table style="margin-bottom:10px;">
      <tr><td>Öğrenci Adı Soyadı / Sınıf / No</td><td>${escHtml(k.ad)} ${escHtml(k.soyad)} — ${escHtml(k.dal ? (DAL_LABELS[k.dal] || k.dal) : '')} — ${escHtml(k.ogrenciNo)}</td></tr>
      <tr><td>Başlama Tarihi</td><td>…</td></tr>
      <tr><td>Bitiş Tarihi</td><td>…</td></tr>
      <tr><td>Verilen Süre</td><td>…</td></tr>
    </table>
    <table>
      <thead><tr><th>Değerlendirme Unsurları</th>${sk.unsurlar.map(u => `<th>${escHtml(u.ad)}</th>`).join("")}<th>Toplam</th></tr></thead>
      <tbody>
        <tr><td>Takdir edilen puan</td>${sk.unsurlar.map(u => `<td>${escHtml(String(u.puan))}p</td>`).join("")}<td>${toplamPuan}p</td></tr>
        <tr><td>Öğrencinin aldığı puan</td>${sk.unsurlar.map(() => `<td></td>`).join("")}<td></td></tr>
      </tbody>
    </table>
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-top:30px;text-align:center;font-size:11px;">
      <div>…………………<div style="margin-top:4px;">Komisyon Üyesi</div></div>
      <div>…………………<div style="margin-top:4px;">Komisyon Üyesi</div></div>
      <div>…………………<div style="margin-top:4px;">Komisyon Üyesi</div></div>
      <div><div style="font-weight:600;">${escHtml(S.kurumBilgileri.mudurAdi)}</div><div style="margin-top:4px;">Komisyon Başkanı</div></div>
    </div>
  </div>`).join("") : `<div class="card"><p class="small">Henüz öğrenci yok.</p></div>`;
  return editor + sayfalar;
}
function snEkBelgeGovde(kind, kayitlar, ekAlanlar, baslik) {
  if (activeSnBelge === "tutanak") {
    const t = sinavTutanagiOlusturVeyaGetir(kind, ekAlanlar);
    return renderSinavTutanagi(kind, kayitlar, t, baslik);
  }
  if (activeSnBelge === "sonuc-tutanak") return renderSinavSonucTutanagi(kind, kayitlar, baslik);
  if (activeSnBelge === "sarf-not") {
    const t = sinavTutanagiOlusturVeyaGetir(kind, ekAlanlar);
    return renderSarfNotCizelgesi(kind, kayitlar, t, baslik);
  }
  if (activeSnBelge === "komisyon-karar" && kind === "bs") return beceriKomisyonKararKarti(ekAlanlar.sinif, ekAlanlar.dal);
  if (activeSnBelge === "is-dosyasi") return renderIsDosyasiDerecelendirme(kind, kayitlar, baslik);
  if (activeSnBelge === "aday-gelmedi") return renderAdayGelmediTutanagi(kind, ekAlanlar, DAL_LABELS[ekAlanlar.dal] || ekAlanlar.dal || "");
  if (activeSnBelge === "not-fisi") return renderNotFisi(kind, kayitlar);
  if (activeSnBelge === "sinav-kagidi") return renderSinavKagidi(kind, kayitlar, ekAlanlar, baslik, DAL_LABELS[ekAlanlar.dal] || ekAlanlar.dal || "");
  return null;
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
    <div>${escHtml((S.kurumBilgileri.okulAdi || "").toLocaleUpperCase("tr-TR"))} MÜDÜRLÜĞÜ'NE</div>
    <div>${escHtml(S.kurumBilgileri.sehir || "")}</div>
  </div>
  <p class="small" style="margin-bottom:14px;">${paragraf}</p>
  <table><thead><tr>
    <th>Sınıfı</th><th>Dersi</th>
    ${isYazili ? '<th>1.YAZILI SINAVI</th><th>2.YAZILI SINAVI</th>' : '<th>Konular</th>'}
    <th class="no-print"></th>
  </tr></thead>
  <tbody>${rows || `<tr><td colspan="${isYazili ? 5 : 4}" class="small">Henüz satır yok. "Ders Programından Yenile" ile öğretmenin ders atamalarından otomatik doldurabilirsiniz.</td></tr>`}
  ${isYazili ? `<tr><td colspan="2"><b>TOPLAM</b></td><td colspan="2"><b>${toplam} ADET</b></td><td class="no-print"></td></tr>` : ''}
  </tbody></table>
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
        ${sekmeDropdown("donem-rapor-" + tur, entries.map(e => ({ value: e.id, label: e.ogretmenAdi + " · " + (e.donem || "") + " " + (e.ogretimYili || "") })), activeDonemRaporId[tur], `selectDonemRapor('${jsq(tur)}','{v}')`)}
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

/* ---- Şeflik Aylık Raporu ----
   Alan Şefliği görevi kapsamında okul müdürlüğüne sunulan aylık
   Planlama ve Bakım Onarım raporu (gerçek örnek: Seflik_NISAN_2026.docx). */
let activeSeflikRaporId = null;
function seflikRaporById(id) { return S.seflikRaporlari.find(r => r.id === id); }
function seflikToplamSaat(r) {
  return r.kayitlar.reduce((sum, k) => sum + (Number(k.saat) || 0), 0);
}
/* ---- Alan Şefi Aylık Görev Havuzu (öneri metinleri) ----
   MEB Ortaöğretim Kurumları Yönetmeliği Madde 85'te (Alan/bölüm, atölye
   ve laboratuvar şeflerinin görev ve sorumlulukları) tanımlanan görev
   kategorilerine (bakım-onarım, İSG, kayıt tutma, staj/işletme koordi-
   nasyonu, mezun izleme) ve gerçek örnek raporunuzdaki (Nisan 2026)
   çalışma diline dayanarak hazırlanmış, aya göre değişen ÖNERİ metin
   havuzu. Bunlar resmi yönetmelik metni DEĞİL, siz düzenleyip kendi
   gerçek çalışmanıza göre değiştireceğiniz taslak cümlelerdir — atölye
   envanterinizde o tarih aralığına denk gelen gerçek bir bakım kaydı
   varsa, öneri onun yerine gerçek kaydı kullanır. */
const ALAN_SEFI_AYLIK_GOREV_HAVUZU = {
  "Eylül": [
    "Yeni eğitim-öğretim yılına ait staj/işletmede mesleki eğitim programının planlanması çalışmalarına başlandı; staj yapılacak işletmelerin tespiti ve staj takviminin hazırlanmasına yönelik ön çalışmalar yürütüldü.",
    "Atölye ve laboratuvarların yeni döneme hazırlığı kapsamında genel temizlik, düzen ve güvenlik kontrolü yapıldı; eksik/arızalı makine-teçhizat tespit edilerek bakım-onarım planlaması yapıldı.",
    "Alan/bölüm, atölye ve laboratuvar kayıtlarının (demirbaş, makine kartları, kullanma talimatları) güncellenmesi çalışmaları yürütüldü."
  ],
  "Ekim": [
    "Öğrenci-işletme eşleştirme çalışmaları sürdürüldü; staj sözleşmeleri ve ilgili evrakların hazırlanmasına devam edildi.",
    "Atölye tezgahlarının periyodik bakımı yapıldı; tespit edilen eksiklikler giderildi, atölye şeflerine teknik destek verildi.",
    "İş sağlığı ve güvenliği denetimi kapsamında koruyucu muhafazalar, acil stop butonları ve kişisel koruyucu donanım (KKD) durumu kontrol edildi."
  ],
  "Kasım": [
    "1. dönem sınavlarına yönelik atölye ve laboratuvar hazırlıkları tamamlandı.",
    "Atölye makinelerinin periyodik bakımı ve küçük onarımları yapıldı; makine kartları güncellendi.",
    "Staj/işletmede mesleki eğitim gören öğrencilerin işletme ziyaretleri koordine edildi, devam-devamsızlık durumları takip edildi."
  ],
  "Aralık": [
    "1. dönem sonuna doğru atölye/laboratuvar genel bakım ve düzenleme çalışmaları yapıldı.",
    "Öğrencilerin dönem sonu beceri/performans değerlendirmeleri için gerekli atölye düzenlemeleri yapıldı.",
    "Yılbaşı tatiline hazırlık kapsamında makine-teçhizatın güvenli şekilde kapatılması ve envanter kontrolü yapıldı."
  ],
  "Ocak": [
    "1. dönem değerlendirmesi yapıldı; atölye/laboratuvar kullanım ve bakım kayıtları gözden geçirildi.",
    "2. döneme hazırlık kapsamında atölye tezgahlarının genel bakımı ve güvenlik kontrolü yapıldı.",
    "Yarıyıl tatili döneminde ihtiyaç duyulan büyük bakım-onarım çalışmaları planlandı ve yürütüldü."
  ],
  "Şubat": [
    "2. dönem başlangıcında atölye ve laboratuvarların eğitime hazır hâle getirilmesi sağlandı.",
    "Staj/işletmede mesleki eğitim programının 2. dönem takvimi ve öğrenci-işletme durumları gözden geçirildi.",
    "Atölye makinelerinin periyodik bakımı yapıldı; eksik yedek parça ihtiyaçları tespit edildi."
  ],
  "Mart": [
    "Atölye ve laboratuvarların periyodik bakım ve iş sağlığı-güvenliği denetimleri sürdürüldü.",
    "Staj yapan öğrencilerin işletme ziyaretleri ve değerlendirmeleri koordine edildi.",
    "2. dönem sınavlarına yönelik atölye/laboratuvar hazırlıkları yapıldı."
  ],
  "Nisan": [
    "Bir sonraki eğitim-öğretim yılına ait staj/işletmede mesleki eğitim programının planlanması çalışmalarına başlandı.",
    "Atölye tezgahlarının periyodik bakımı ve iş sağlığı-güvenliği denetimi yapıldı; tespit edilen eksiklikler giderildi.",
    "Alan şefleri toplantısına katılım sağlandı; staj programı ve İSG eksiklikleri gibi gündem maddeleri değerlendirildi."
  ],
  "Mayıs": [
    "12. sınıf öğrencilerinin işletmelerde beceri eğitimi / kalfalık-ustalık beceri sınavlarına yönelik hazırlık ve koordinasyon çalışmaları yürütüldü.",
    "Yeni öğretim yılı staj/işletmede mesleki eğitim programı kapsamında öğrenci-işletme eşleştirme çalışmaları sürdürüldü.",
    "Atölye ve laboratuvarların yıl sonu genel bakımı ve envanter sayımı planlanmaya başlandı."
  ],
  "Haziran": [
    "Yıl sonu değerlendirmesi yapıldı; atölye/laboratuvar demirbaş ve makine envanteri sayımı tamamlandı.",
    "Mezun olacak öğrencilerin işe yerleştirme ve mezunları izleme çalışmaları ilgili alan öğretmenleriyle birlikte yürütüldü.",
    "Yaz döneminde yapılacak büyük bakım-onarım çalışmaları planlandı; gelecek öğretim yılı hazırlıkları başlatıldı."
  ]
};
function seflikTarihinAyi(tarihStr) {
  const ilkTarih = (tarihStr || "").split("\n")[0];
  const d = parseTrTarih(ilkTarih);
  if (d) return TR_AYLAR[d.getMonth()];
  const m = /(Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık)/.exec(tarihStr || "");
  return m ? m[1] : null;
}
function seflikGercekBakimMetni(pzt, gunSonIndex) {
  if (!pzt) return "";
  const sonTarih = new Date(pzt);
  sonTarih.setDate(sonTarih.getDate() + gunSonIndex);
  const cumleler = [];
  S.envanter.makineler.forEach(m => {
    (m.bakimKayitlari || []).forEach(b => {
      const bd = parseTrTarih(b.tarih);
      if (bd && bd >= pzt && bd <= sonTarih) {
        cumleler.push(`${m.ad} makinesine${b.tip ? " " + b.tip : ""} bakım yapıldı${b.islemler ? " (" + b.islemler + ")" : ""}.`);
      }
    });
  });
  return cumleler.join(" ");
}
function seflikOneriMetni(ay, pzt, gunSonIndex) {
  const gercek = seflikGercekBakimMetni(pzt, gunSonIndex);
  if (gercek) return gercek;
  const havuz = ALAN_SEFI_AYLIK_GOREV_HAVUZU[ay];
  if (!havuz || !havuz.length) return "";
  return havuz[Math.floor(Math.random() * havuz.length)];
}
function seflikIslerOneriDegistir(raporId, kayitId) {
  const r = seflikRaporById(raporId);
  if (!r) return;
  const k = r.kayitlar.find(x => x.id === kayitId);
  if (!k) return;
  const ay = seflikTarihinAyi(k.tarih);
  const havuz = ay ? ALAN_SEFI_AYLIK_GOREV_HAVUZU[ay] : null;
  if (!havuz || !havuz.length) { alert("Bu satır için otomatik öneri havuzu bulunamadı — elle yazabilirsiniz."); return; }
  const mevcutIdx = havuz.indexOf(k.isler);
  k.isler = havuz[(mevcutIdx + 1) % havuz.length];
  save(); renderMain();
}
/* ---- Ders Programından Otomatik Oluşturma ----
   "Planlama Bakım Onarım (Alan Şefi)" dersinin haftalık hangi gün(ler)e
   kaç saat yerleştiğini Ders Dağıtım'ın ürettiği S.schedule'dan okuyup,
   seçilen ay için Akademik Takvim'deki haftalara göre tarih/gün/saat
   satırlarını otomatik üretir. Tatil haftaları otomatik işaretlenir;
   tek günlük resmi bayramlar (takvimde ayrı hafta olarak tutulmadığı
   için) otomatik yakalanmaz — o satırı elle düzeltmeniz gerekir. */
function alanSefiPlanlamaKursu() {
  return S.courses.find(c => /alan\s*şefi/i.test(c.name || "") && /planlama/i.test(c.name || "")) || null;
}
function alanSefiGunlukSaatler() {
  const kurs = alanSefiPlanlamaKursu();
  const gunSaat = [0, 0, 0, 0, 0];
  if (!kurs) return gunSaat;
  Object.keys(S.schedule).forEach(key => {
    const cell = S.schedule[key];
    if (cell.courseId === kurs.id && cell.day >= 0 && cell.day <= 4) gunSaat[cell.day]++;
  });
  return gunSaat;
}
function seflikGunGruplariOlustur(gunSaat) {
  const gruplar = [];
  let i = 0;
  while (i < 5) {
    if (!gunSaat[i]) { i++; continue; }
    let j = i;
    while (j + 1 < 5 && gunSaat[j + 1] === gunSaat[i]) j++;
    gruplar.push({ gunIndexleri: Array.from({ length: j - i + 1 }, (_, k) => i + k), saatGunluk: gunSaat[i] });
    i = j + 1;
  }
  return gruplar;
}
function seflikAySecenekleri() {
  const t = S.akademikTakvim;
  if (!t || !Array.isArray(t.haftalar)) return [];
  const map = new Map();
  t.haftalar.forEach(h => {
    if (!h.pazartesi) return;
    const d = parseTrTarih(h.pazartesi);
    if (!d) return;
    const ay = TR_AYLAR[d.getMonth()], yil = d.getFullYear();
    map.set(ay + " " + yil, { ay, yil });
  });
  return Array.from(map.values()).sort((a, b) => a.yil - b.yil || TR_AYLAR.indexOf(a.ay) - TR_AYLAR.indexOf(b.ay));
}
function seflikOtomatikOlusturModal() {
  const secenekler = seflikAySecenekleri();
  const root = document.getElementById("modal-root");
  if (!secenekler.length) {
    root.innerHTML = `
      <div class="modal-bg" onclick="if(event.target===this) closeModal()">
        <div class="modal" style="width:360px;">
          <h3>Ders Programından Otomatik Oluştur</h3>
          <p class="small">Bunun çalışması için Ayarlar &gt; Akademik Takvim'de Pazartesi tarihli haftalık takvim bulunmalı. "Haftaları Otomatik Oluştur" ile hemen kurabilirsiniz.</p>
          <div class="row"><button class="btn" onclick="closeModal()">Tamam</button></div>
        </div>
      </div>`;
    return;
  }
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:380px;">
        <h3>Ders Programından Otomatik Oluştur</h3>
        <p class="small">Seçtiğiniz ay için, Ders Programı'ndaki "Planlama Bakım Onarım (Alan Şefi)" gününüze göre tarih/gün/egzersiz saati satırları otomatik oluşturulur; tatil haftaları da işaretlenir. "Yapılan İşler" sütunu, o tarihe denk gelen gerçek bir makine bakım kaydınız varsa onunla, yoksa alan şefliği görevlerine dayalı genel bir öneriyle otomatik doldurulur — beğenmezseniz her satırdaki "Öneri Değiştir" ile başka bir öneriye geçebilir, ya da doğrudan elle değiştirebilirsiniz. (Tek günlük resmi bayramlar takvimde ayrı hafta olmadığı için otomatik yakalanmaz, o satırı elle düzeltebilirsiniz.)</p>
        <label class="small">Ay</label>
        <select id="sr-oto-ay" style="width:100%">
          ${secenekler.map(s => `<option value="${s.ay} ${s.yil}">${s.ay} ${s.yil}</option>`).join("")}
        </select>
        <div class="row">
          <button class="btn primary" onclick="seflikOtomatikOlustur(document.getElementById('sr-oto-ay').value)">Oluştur</button>
          <button class="btn" onclick="closeModal()">İptal</button>
        </div>
      </div>
    </div>`;
}
function seflikOtomatikOlustur(aySecim) {
  const parcalar = aySecim.split(" ");
  const yil = Number(parcalar.pop());
  const ay = parcalar.join(" ");
  const t = S.akademikTakvim;
  const gunSaat = alanSefiGunlukSaatler();
  const gunAdlari = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
  const gunGruplari = seflikGunGruplariOlustur(gunSaat);
  if (!gunGruplari.length) {
    closeModal();
    alert('Ders Programı\'nda "Planlama Bakım Onarım (Alan Şefi)" dersi için henüz bir gün ataması bulunamadı. Önce Ders Programı > Ders Dağıtım\'dan programı oluşturun.');
    return;
  }
  let r = S.seflikRaporlari.find(x => x.ay === aySecim);
  if (!r) { r = { id: uid("sr"), ay: aySecim, kayitlar: [] }; S.seflikRaporlari.push(r); }

  const ilgiliHaftalar = t.haftalar.filter(h => {
    if (!h.pazartesi) return false;
    const d = parseTrTarih(h.pazartesi);
    return d && TR_AYLAR[d.getMonth()] === ay && d.getFullYear() === yil;
  });

  let eklenen = 0;
  ilgiliHaftalar.forEach(h => {
    const pzt = parseTrTarih(h.pazartesi);
    if (h.tatilMi) {
      const varMi = r.kayitlar.some(k => k.tarih === h.tarihAraligi);
      if (!varMi) {
        r.kayitlar.push({ id: uid("srk"), tarih: h.tarihAraligi, gun: "", saat: "-", isler: h.tatilAdi || "TATİL" });
        eklenen++;
      }
      return;
    }
    gunGruplari.forEach(g => {
      const tarihStr = g.gunIndexleri.map(gi => { const d = new Date(pzt); d.setDate(d.getDate() + gi); return formatTrTarih(d); }).join("\n");
      if (r.kayitlar.some(k => k.tarih === tarihStr)) return;
      const gunStr = g.gunIndexleri.map(gi => gunAdlari[gi]).join("\n");
      const isler = seflikOneriMetni(ay, pzt, g.gunIndexleri[g.gunIndexleri.length - 1]);
      r.kayitlar.push({ id: uid("srk"), tarih: tarihStr, gun: gunStr, saat: String(g.saatGunluk * g.gunIndexleri.length), isler });
      eklenen++;
    });
  });

  activeSeflikRaporId = r.id;
  save(); closeModal(); renderMain();
  alert(eklenen ? `${eklenen} satır eklendi. "Yapılan İşler" sütunu otomatik önerilerle dolduruldu — gözden geçirip beğenmediklerinizi "Öneri Değiştir" ile başka bir öneriyle değiştirebilir ya da elle düzenleyebilirsiniz.` : "Eklenecek yeni satır bulunamadı (bu ay için satırlar zaten mevcut).");
}
function addSeflikRaporu() {
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:360px;">
        <h3>Yeni Aylık Rapor</h3>
        <label class="small">Ay (örn. Mayıs 2026)</label>
        <input type="text" id="sr-ay" style="width:100%">
        <div class="row">
          <button class="btn primary" onclick="saveNewSeflikRaporu()">Ekle</button>
          <button class="btn" onclick="closeModal()">İptal</button>
        </div>
      </div>
    </div>`;
}
function saveNewSeflikRaporu() {
  const ay = document.getElementById("sr-ay").value.trim();
  if (!ay) { alert("Ay girin."); return; }
  const r = { id: uid("sr"), ay, kayitlar: [] };
  S.seflikRaporlari.push(r);
  activeSeflikRaporId = r.id;
  save(); closeModal(); renderMain();
}
function deleteSeflikRaporu(id) {
  if (!confirm("Bu aylık rapor silinsin mi?")) return;
  S.seflikRaporlari = S.seflikRaporlari.filter(r => r.id !== id);
  if (activeSeflikRaporId === id) activeSeflikRaporId = null;
  save(); renderMain();
}
function selectSeflikRaporu(id) { activeSeflikRaporId = id; renderMain(); }
function addSeflikKayit(raporId) {
  const r = seflikRaporById(raporId);
  if (!r) return;
  r.kayitlar.push({ id: uid("srk"), tarih: "", gun: "", saat: "", isler: "" });
  save(); renderMain();
}
function updateSeflikKayit(raporId, kayitId, field, value) {
  const r = seflikRaporById(raporId);
  if (!r) return;
  const k = r.kayitlar.find(x => x.id === kayitId);
  if (!k) return;
  k[field] = value;
  save();
}
function removeSeflikKayit(raporId, kayitId) {
  if (!confirm("Bu satır silinsin mi?")) return;
  const r = seflikRaporById(raporId);
  if (!r) return;
  r.kayitlar = r.kayitlar.filter(x => x.id !== kayitId);
  save(); renderMain();
}
function renderSeflikRaporDetay(r) {
  const k = S.kurumBilgileri;
  const rows = r.kayitlar.map(k2 => `
    <tr>
      <td><textarea class="no-print" rows="2" style="width:110px;border:none;resize:vertical;font-family:inherit;font-size:11.5px;" oninput="updateSeflikKayit('${r.id}','${k2.id}','tarih',this.value)" onblur="save()">${escHtml(k2.tarih)}</textarea><div class="print-only">${nlToBr(k2.tarih)}</div></td>
      <td><textarea class="no-print" rows="2" style="width:100px;border:none;resize:vertical;font-family:inherit;font-size:11.5px;" oninput="updateSeflikKayit('${r.id}','${k2.id}','gun',this.value)" onblur="save()">${escHtml(k2.gun)}</textarea><div class="print-only">${nlToBr(k2.gun)}</div></td>
      <td><input class="no-print" type="text" value="${escHtml(String(k2.saat))}" style="width:44px" onchange="updateSeflikKayit('${r.id}','${k2.id}','saat',this.value); renderMain();"><span class="print-only-inline">${escHtml(String(k2.saat))}</span></td>
      <td><textarea class="no-print" rows="2" style="width:100%;border:none;resize:vertical;font-family:inherit;font-size:11.5px;" oninput="updateSeflikKayit('${r.id}','${k2.id}','isler',this.value)" onblur="save()">${escHtml(k2.isler)}</textarea><div class="print-only">${nlToBr(k2.isler)}</div>
        <button class="btn no-print" style="padding:3px 8px;font-size:10.5px;margin-top:3px;" onclick="seflikIslerOneriDegistir('${r.id}','${k2.id}')" title="Bu ay için başka bir öneri metni getirir">Öneri Değiştir</button></td>
      <td class="no-print"><button class="btn danger" onclick="removeSeflikKayit('${r.id}','${k2.id}')">Sil</button></td>
    </tr>`).join("");
  const toplam = seflikToplamSaat(r);
  return `
  <div class="card no-print">
    <div class="row small" style="flex-wrap:wrap;gap:14px;align-items:center;">
      <span><b>Ay:</b> ${escHtml(r.ay)}</span>
      <span><b>Toplam Egzersiz Saati:</b> ${toplam}</span>
      <button class="btn" onclick="addSeflikKayit('${r.id}')">Satır Ekle</button>
    </div>
  </div>
  <div style="margin-bottom:14px;">
    <div>${escHtml((k.okulAdi || "").toLocaleUpperCase("tr-TR"))} MÜDÜRLÜĞÜNE</div>
  </div>
  <p class="small" style="margin-bottom:14px;">Okulunuzda ${escHtml(k.alanAdi)} Alan Şefliği görevini yürütmekteyim. Görevimle ilgili olarak ${escHtml((r.ay || "").toLocaleUpperCase("tr-TR"))} ayına ait Planlama ve Bakım Onarım raporu aşağıdaki gibidir.</p>
  <p class="small" style="margin-bottom:14px;">Bilgilerinize arz ederim.</p>
  <div style="text-align:right;margin-bottom:20px;">
    <div style="font-weight:600;">${escHtml(k.alanSefiAdi)}</div>
    <div>${escHtml(k.alanSefiUnvani)}</div>
  </div>
  <table><thead><tr><th style="width:110px;">Tarih</th><th style="width:100px;">Gün</th><th style="width:60px;">Egzersiz Saati</th><th>Yapılan İşler</th><th class="no-print"></th></tr></thead>
  <tbody>${rows || `<tr><td colspan="5" class="small">Henüz satır yok.</td></tr>`}
  <tr><td colspan="4" class="small">Not: Rapor, izin veya tatil saatleri Egzersiz Saatinden düşülecektir.</td><td class="no-print"></td></tr>
  <tr><td colspan="2" style="font-weight:700;">AYLIK TOPLAM EGZERSİZ SAATİ:</td><td style="font-weight:700;">${toplam}</td><td style="font-weight:700;">SAAT</td><td class="no-print"></td></tr>
  </tbody></table>
  <div style="margin-top:30px;">
    <div>UYGUNDUR</div>
    <div>.../…/....</div>
    <div style="margin-top:24px;font-weight:600;">${escHtml(k.mudurAdi)}</div>
    <div>Okul Müdürü</div>
  </div>`;
}
function viewSeflikRaporlari() {
  const entries = S.seflikRaporlari.slice();
  if (entries.length && !entries.some(e => e.id === activeSeflikRaporId)) activeSeflikRaporId = entries[0].id;
  if (!entries.length) activeSeflikRaporId = null;
  const active = seflikRaporById(activeSeflikRaporId);
  const listHtml = entries.length === 0 ? "" : `
    <div class="card no-print">
      <div class="row" style="flex-wrap:wrap;">
        ${sekmeDropdown("seflik-ay", entries.map(e => ({ value: e.id, label: e.ay })), activeSeflikRaporId, "selectSeflikRaporu('{v}')")}
      </div>
    </div>`;
  const dosyaAdi = active ? "Şeflik Aylık Raporu - " + active.ay : "Şeflik Aylık Raporu";
  const content = active ? renderSeflikRaporDetay(active) : `<div class="card small" style="text-align:center;padding:30px 20px;">Henüz aylık rapor oluşturulmadı. "Yeni Ay Ekle" ile başlayın.</div>`;
  return `
  <div class="card no-print">
    <h2>Şeflik Aylık Raporu</h2>
    <p class="small">Alan Şefliği görevi kapsamında her ay okul müdürlüğüne sunulan Planlama ve Bakım Onarım raporu. Her satır bir tarih/tarih aralığı için yapılan işleri ve egzersiz saatini gösterir; aylık toplam otomatik hesaplanır.</p>
    <div class="row" style="margin-top:8px;">
      <button class="btn primary" onclick="seflikOtomatikOlusturModal()">Ders Programından Otomatik Oluştur</button>
      <button class="btn" onclick="addSeflikRaporu()">Boş Ay Ekle</button>
      ${active ? `<button class="btn danger" onclick="deleteSeflikRaporu('${active.id}')">Bu Ayı Sil</button>` : ""}
    </div>
    ${active ? belgeAracCubugu(dosyaAdi) : ""}
  </div>
  ${listHtml}
  <div class="print-area">
    <div class="card" style="overflow-x:auto;">${content}</div>
  </div>`;
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
        ${sekmeDropdown("sinav-kagit", entries.map(e => ({ value: e.id, label: e.baslik })), activeSinavKagitId, "selectKagit('{v}')")}
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
      ${siniflar.length ? sekmeDropdown("sinav-sinif", siniflar.map(c => ({ value: c.id, label: c.name })), activeSinavSinifId, "selectSinavSinif('{v}')")
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
      ${dersler.length ? sekmeDropdown("sinav-ders", dersler.map(c => ({ value: c.id, label: c.name })), activeSinavCourseId, "selectSinavCourse('{v}')")
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

/* ---- Ayarlar (Kurum Bilgileri) ---- */
function updateKurumBilgi(field, value) {
  S.kurumBilgileri[field] = value.trim();
  save();
  renderSidebarBrand();
}
function logoDosyaSecildi(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    S.kurumBilgileri.logo = reader.result;
    save();
    renderSidebarBrand();
    renderMain();
  };
  reader.readAsDataURL(file);
}
function logoKaldir() {
  if (!confirm("Okul logosu kaldırılsın mı?")) return;
  S.kurumBilgileri.logo = null;
  save();
  renderSidebarBrand();
  renderMain();
}
function renderSidebarBrand() {
  const k = S.kurumBilgileri;
  const subtitleEl = document.getElementById("sidebar-subtitle");
  const schoolEl = document.getElementById("sidebar-school-line");
  const logoEl = document.getElementById("sidebar-logo");
  if (subtitleEl) subtitleEl.textContent = k.alanSefiAdi || "";
  if (schoolEl) schoolEl.innerHTML = escHtml(k.okulAdi) + "<br>" + escHtml(k.alanAdi);
  if (logoEl) {
    logoEl.innerHTML = k.logo
      ? `<img src="${k.logo}" style="width:100%;height:100%;object-fit:contain;border-radius:8px;">`
      : `<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/><path d="M19.4 13.5c.1-.5.1-1 0-1.5l1.6-1.2-1.5-2.6-1.9.6a5.7 5.7 0 0 0-1.3-.8l-.3-2H10l-.3 2c-.5.2-.9.5-1.3.8l-1.9-.6-1.5 2.6L6.6 12c-.1.5-.1 1 0 1.5l-1.6 1.2 1.5 2.6 1.9-.6c.4.3.8.6 1.3.8l.3 2h4l.3-2c.5-.2.9-.5 1.3-.8l1.9.6 1.5-2.6-1.6-1.2Z"/></svg>`;
  }
}
/* ---- Karanlık Mod ---- */
const THEME_KEY = "aok-theme-v1";
function currentTheme() {
  try { return localStorage.getItem(THEME_KEY) || "light"; } catch (e) { return "light"; }
}
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const icon = document.getElementById("theme-toggle-icon");
  if (icon) {
    icon.innerHTML = theme === "dark"
      ? '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>'
      : '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>';
  }
}
function toggleTheme() {
  const next = currentTheme() === "dark" ? "light" : "dark";
  try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  applyTheme(next);
}

/* ---- Kaydedildi Bildirimi / Geri Al ----
   showSaveToast her save() çağrısında (yani hemen hemen her alan
   değişikliğinde) otomatik çalışır — kısa süreli bir "Kaydedildi"
   uyarısı gösterir. Ama bu uyarı birkaç saniyede kayboluyor; sol
   menüdeki "Son kayıt" yazısı ise KALICI — istediğiniz an bakıp son
   kaydın ne zaman olduğunu görebilirsiniz, kaçırma endişesi olmadan. */
function showSaveToast(offerUndo) {
  sonKayitZamaniniGuncelle();
  const root = document.getElementById("toast-root");
  if (!root) return;
  let el = document.getElementById("save-toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "save-toast";
    el.className = "toast";
    root.appendChild(el);
  }
  el.innerHTML = offerUndo
    ? `<span class="check">✓</span> Kaydedildi <button class="toast-undo" onclick="undoLastChange()">Geri Al</button>`
    : `<span class="check">✓</span> Kaydedildi`;
  requestAnimationFrame(() => el.classList.add("show"));
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => { el.classList.remove("show"); }, offerUndo ? 5000 : 1400);
}
function sonKayitZamaniniGuncelle() {
  const el = document.getElementById("son-kayit-metni");
  if (!el) return;
  const saat = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  el.textContent = "✓ Son kayıt: " + saat;
}
function sonKayitBaslangicDurumunuGoster() {
  const el = document.getElementById("son-kayit-metni");
  if (!el) return;
  let varOlanKayit = false;
  try { varOlanKayit = !!localStorage.getItem(LS_KEY); } catch (e) {}
  el.textContent = varOlanKayit ? "✓ Kayıtlı verilerle açıldı" : "Henüz kayıt yok";
}
function kaydetManuel() {
  save();
  const btn = document.getElementById("kaydet-btn");
  if (!btn) return;
  const eski = btn.textContent;
  btn.textContent = "✓ Kaydedildi";
  setTimeout(() => { btn.textContent = eski; }, 1200);
}

/* ---- Genel Arama ---- */
let globalSearchResults = [];
function trLower(s) { return String(s || "").toLocaleLowerCase("tr-TR"); }
function globalSearch(query) {
  const q = trLower(query).trim();
  if (!q) return [];
  const results = [];
  S.classes.filter(c => c.grade > 0).forEach(c => {
    if (trLower(c.name).includes(q)) {
      results.push({ tip: "Sınıf", ad: c.name, action: () => { setModule("ders-programi"); setTab("sinif"); activeClassId = c.id; } });
    }
  });
  S.teachers.forEach(t => {
    if (trLower(t.name).includes(q)) {
      results.push({ tip: "Öğretmen", ad: t.name, action: () => { setModule("ders-programi"); setTab("ogretmen"); activeTeacherId = t.id; } });
    }
  });
  S.courses.filter(c => c.id !== KOORD_COURSE_ID).forEach(c => {
    if (trLower(c.name).includes(q) || trLower(c.code).includes(q)) {
      results.push({ tip: "Ders", ad: c.name, action: () => { setModule("ders-programi"); setTab("havuz"); } });
    }
  });
  S.isletmeler.forEach(i => {
    if (trLower(i.name).includes(q)) {
      results.push({ tip: "İşletme", ad: i.name, action: () => { setModule("ders-programi"); setTab("koordinatorluk"); } });
    }
  });
  S.students.forEach(s => {
    if (trLower(s.ad).includes(q)) {
      results.push({ tip: "Öğrenci (Staj)", ad: s.ad + (s.sinif ? " · " + s.sinif : ""), action: () => setModule("staj-yerlestirme") });
    }
  });
  S.envanter.makineler.forEach(m => {
    if (trLower(m.ad).includes(q)) {
      results.push({ tip: "Makine", ad: m.ad + (m.lab ? " · " + m.lab : ""), action: () => { setModule("atolye-envanter"); activeEnvanterTab = "makineler"; activeMakineId = m.id; } });
    }
  });
  S.sinavHavuzu.sorular.forEach(sr => {
    if (trLower(sr.soruMetni).includes(q)) {
      results.push({ tip: "Sınav Sorusu", ad: sr.soruMetni.length > 60 ? sr.soruMetni.slice(0, 60) + "…" : sr.soruMetni, action: () => { setModule("sinav-havuzu"); activeSinavSinifId = sr.classId; activeSinavCourseId = sr.courseId; activeSinavTab = "havuz"; } });
    }
  });
  S.performansKayitlari.forEach(k => {
    if (trLower(k.sinif).includes(q) || trLower(k.ders).includes(q)) {
      results.push({ tip: "Performans Kaydı", ad: k.sinif + " · " + k.ders, action: () => { setModule("performans"); activePerformansTab = k.tur; activePerformansSinif = k.sinif; activePerformansDonem = k.donem; activePerformansId[k.tur] = k.id; } });
    }
  });
  dbfKayitlar().forEach(r => {
    if (trLower(r.dersAdi).includes(q)) {
      results.push({ tip: "Ders Bilgi Formu", ad: r.dersAdi + " · " + r.program + " " + r.sinif, action: () => { setModule("ders-bilgi-formu"); selectDbfProgram(r.program); selectDbfSinif(r.sinif); selectDbfDers(r.dersAdi); } });
    }
  });
  return results.slice(0, 20);
}
function onGlobalSearchInput(value) {
  globalSearchResults = globalSearch(value);
  const el = document.getElementById("global-search-results");
  if (!el) return;
  if (!value.trim()) { el.innerHTML = ""; el.style.display = "none"; return; }
  el.style.display = "block";
  el.innerHTML = globalSearchResults.length
    ? globalSearchResults.map((r, i) => `<div class="search-result-item" onclick="runGlobalSearchResult(${i})"><span class="tip">${escHtml(r.tip)}</span>${escHtml(r.ad)}</div>`).join("")
    : `<div class="search-result-empty small">Sonuç bulunamadı.</div>`;
}
function runGlobalSearchResult(i) {
  const r = globalSearchResults[i];
  if (!r) return;
  r.action();
  const input = document.getElementById("global-search-input");
  const el = document.getElementById("global-search-results");
  if (input) input.value = "";
  if (el) { el.innerHTML = ""; el.style.display = "none"; }
  renderTabbar();
  renderMain();
}
document.addEventListener("click", (e) => {
  const box = document.querySelector(".sidebar-search");
  const results = document.getElementById("global-search-results");
  if (box && results && !box.contains(e.target)) { results.style.display = "none"; }
});

/* ---- Akademik Takvim ---- */
const TR_AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
function parseTrTarih(s) {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(String(s || "").trim());
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return isNaN(d.getTime()) ? null : d;
}
function formatTrTarih(d) {
  return String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + d.getFullYear();
}
function haftaTarihAraligi(pazartesi) {
  const cuma = new Date(pazartesi);
  cuma.setDate(cuma.getDate() + 4);
  const g1 = String(pazartesi.getDate()).padStart(2, "0"), g2 = String(cuma.getDate()).padStart(2, "0");
  const ay1 = TR_AYLAR[pazartesi.getMonth()], ay2 = TR_AYLAR[cuma.getMonth()];
  return pazartesi.getMonth() === cuma.getMonth() ? `${g1}-${g2} ${ay1}` : `${g1} ${ay1} - ${g2} ${ay2}`;
}
function haftalariOlustur(baslangicStr, sayi) {
  const baslangic = parseTrTarih(baslangicStr);
  if (!baslangic || !sayi || sayi < 1) return null;
  const haftalar = [];
  for (let i = 0; i < sayi; i++) {
    const pzt = new Date(baslangic);
    pzt.setDate(pzt.getDate() + i * 7);
    haftalar.push({ no: i + 1, pazartesi: formatTrTarih(pzt), tarihAraligi: haftaTarihAraligi(pzt), tatilMi: false, tatilAdi: "" });
  }
  return haftalar;
}
function ensureAkademikTakvim() {
  if (!S.akademikTakvim) S.akademikTakvim = { ogretimYili: "", haftalar: [], sinavTarihleri: { d1s1: "", d1s2: "", d2s1: "", d2s2: "" } };
  if (!S.akademikTakvim.sinavTarihleri) S.akademikTakvim.sinavTarihleri = { d1s1: "", d1s2: "", d2s1: "", d2s2: "" };
  if (!Array.isArray(S.akademikTakvim.haftalar)) S.akademikTakvim.haftalar = [];
  return S.akademikTakvim;
}
function updateTakvimYili(value) {
  ensureAkademikTakvim().ogretimYili = value.trim();
  save();
}
function updateSinavTarihi(key, value) {
  ensureAkademikTakvim().sinavTarihleri[key] = value.trim();
  save();
}
function updateTakvimHafta(idx, field, value) {
  const t = ensureAkademikTakvim();
  if (!t.haftalar[idx]) return;
  t.haftalar[idx][field] = field === "no" ? (Number(value) || 0) : value;
  save();
}
function addTakvimHafta() {
  const t = ensureAkademikTakvim();
  const no = t.haftalar.length ? Math.max(...t.haftalar.map(h => h.no || 0)) + 1 : 1;
  t.haftalar.push({ no, pazartesi: "", tarihAraligi: "", tatilMi: false, tatilAdi: "" });
  save(); renderMain();
}
function removeTakvimHafta(idx) {
  if (!confirm("Bu hafta akademik takvimden silinsin mi?")) return;
  const t = ensureAkademikTakvim();
  t.haftalar.splice(idx, 1);
  save(); renderMain();
}
function olusturTakvimHaftalari() {
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this) closeModal()">
      <div class="modal" style="width:380px;">
        <h3>Haftaları Otomatik Oluştur</h3>
        <p class="small">1. haftanın Pazartesi tarihini girin, hafta sayısını belirtin — 37-40 haftalık ders takvimi otomatik oluşturulsun. Ardından tatil haftalarını işaretleyip tarih aralıklarını gerektiği gibi düzeltebilirsiniz.</p>
        <label class="small">1. Hafta Pazartesi Tarihi (gg.aa.yyyy)</label>
        <input type="text" id="tk-baslangic" placeholder="14.09.2026" style="width:100%">
        <label class="small">Hafta Sayısı</label>
        <input type="number" id="tk-sayi" value="40" style="width:100%">
        <div class="row">
          <button class="btn primary" onclick="uygulaTakvimOlustur()">Oluştur</button>
          <button class="btn" onclick="closeModal()">İptal</button>
        </div>
      </div>
    </div>`;
}
function uygulaTakvimOlustur() {
  const baslangic = document.getElementById("tk-baslangic").value.trim();
  const sayi = Number(document.getElementById("tk-sayi").value) || 40;
  const haftalar = haftalariOlustur(baslangic, sayi);
  if (!haftalar) { alert("Tarih biçimi gg.aa.yyyy olmalı, örn. 14.09.2026"); return; }
  const t = ensureAkademikTakvim();
  if (t.haftalar.length && !confirm("Mevcut haftalar bu yeni listeyle değiştirilecek. Devam edilsin mi?")) return;
  t.haftalar = haftalar;
  save(); closeModal(); renderMain();
}
function renderAkademikTakvimKarti() {
  const t = S.akademikTakvim;
  const st = (t && t.sinavTarihleri) || { d1s1: "", d1s2: "", d2s1: "", d2s2: "" };
  const haftaRows = ((t && t.haftalar) || []).map((h, i) => `
    <tr>
      <td><input type="text" value="${escHtml(String(h.no || ""))}" style="width:44px" onchange="updateTakvimHafta(${i},'no',this.value)"></td>
      <td><input type="text" value="${escHtml(h.tarihAraligi)}" style="width:130px" onchange="updateTakvimHafta(${i},'tarihAraligi',this.value)"></td>
      <td style="text-align:center;"><input type="checkbox" ${h.tatilMi ? "checked" : ""} onchange="updateTakvimHafta(${i},'tatilMi',this.checked)"></td>
      <td><input type="text" value="${escHtml(h.tatilAdi)}" placeholder="örn. Yarıyıl Tatili" style="width:100%" onchange="updateTakvimHafta(${i},'tatilAdi',this.value)"></td>
      <td><button class="btn danger" onclick="removeTakvimHafta(${i})">Sil</button></td>
    </tr>`).join("");
  return `
  <div class="card">
    <h2>Akademik Takvim</h2>
    <p class="small">Her öğretim yılı başında burayı güncelleyin — Yıllık Plan, Günlük Plan, Norm Kadro, Ders Kesim/Yazılı Teslim ve diğer belgeler bu bilgiyi otomatik kullanır. Excel'den yükleyerek da doldurabilirsiniz (bkz. Yıllık Plan / Günlük Plan sayfası), ama Excel dosyası hazırlamak zorunda değilsiniz — aşağıdan doğrudan da düzenleyebilirsiniz.</p>
    <div class="row" style="flex-wrap:wrap;gap:14px;">
      <div>
        <label class="small">Öğretim Yılı</label>
        <input type="text" placeholder="2026-2027" value="${escHtml(t ? t.ogretimYili : "")}" style="width:160px" onchange="updateTakvimYili(this.value)">
      </div>
      <div><label class="small">1. Dönem 1. Sınav</label><input type="text" placeholder="gg.aa.yyyy" value="${escHtml(st.d1s1)}" style="width:120px" onchange="updateSinavTarihi('d1s1',this.value)"></div>
      <div><label class="small">1. Dönem 2. Sınav</label><input type="text" placeholder="gg.aa.yyyy" value="${escHtml(st.d1s2)}" style="width:120px" onchange="updateSinavTarihi('d1s2',this.value)"></div>
      <div><label class="small">2. Dönem 1. Sınav</label><input type="text" placeholder="gg.aa.yyyy" value="${escHtml(st.d2s1)}" style="width:120px" onchange="updateSinavTarihi('d2s1',this.value)"></div>
      <div><label class="small">2. Dönem 2. Sınav</label><input type="text" placeholder="gg.aa.yyyy" value="${escHtml(st.d2s2)}" style="width:120px" onchange="updateSinavTarihi('d2s2',this.value)"></div>
    </div>
    <div class="row" style="margin-top:10px;">
      <button class="btn primary" onclick="olusturTakvimHaftalari()">Haftaları Otomatik Oluştur</button>
      <button class="btn" onclick="addTakvimHafta()">Tek Hafta Ekle</button>
    </div>
    <div style="overflow-x:auto;margin-top:10px;">
      <table><thead><tr><th style="width:50px;">No</th><th>Tarih Aralığı</th><th>Tatil mi?</th><th>Tatil / Not Adı</th><th></th></tr></thead>
      <tbody>${haftaRows || `<tr><td colspan="5" class="small">Henüz hafta eklenmedi. "Haftaları Otomatik Oluştur" ile hızlıca 37-40 haftalık takvim kurabilirsiniz.</td></tr>`}</tbody></table>
    </div>
  </div>`;
}
function viewAyarlar() {
  const k = S.kurumBilgileri;
  return `
  <div class="card">
    <h2>Kurum Bilgileri</h2>
    <p class="small">Bu bilgiler programın ürettiği tüm resmi belgelerde (yazdırma başlığı, raporlar, imza blokları) ve sol menüde otomatik kullanılır — burada bir kez girip güncel tutmanız yeterli, her belgeye tek tek yazmanıza gerek yok.</p>
    <label class="small">Okul Adı</label>
    <input type="text" value="${escHtml(k.okulAdi)}" style="width:100%;max-width:480px;" onchange="updateKurumBilgi('okulAdi', this.value)">
    <label class="small">İlçe / Şehir</label>
    <input type="text" value="${escHtml(k.sehir)}" style="width:100%;max-width:480px;" onchange="updateKurumBilgi('sehir', this.value)">
    <label class="small">Alan Adı</label>
    <input type="text" value="${escHtml(k.alanAdi)}" style="width:100%;max-width:480px;" onchange="updateKurumBilgi('alanAdi', this.value)">
    <label class="small">Okul Müdürü</label>
    <input type="text" value="${escHtml(k.mudurAdi)}" style="width:100%;max-width:480px;" onchange="updateKurumBilgi('mudurAdi', this.value)">
    <label class="small">Alan Şefi Adı Soyadı</label>
    <input type="text" value="${escHtml(k.alanSefiAdi)}" style="width:100%;max-width:480px;" onchange="updateKurumBilgi('alanSefiAdi', this.value)">
    <label class="small">Alan Şefi Unvanı</label>
    <input type="text" value="${escHtml(k.alanSefiUnvani)}" style="width:100%;max-width:480px;" onchange="updateKurumBilgi('alanSefiUnvani', this.value)">
    <div style="margin-top:16px;">
      <label class="small">Okul Logosu (opsiyonel — belgelerde ve sol menüde kullanılır)</label><br>
      ${k.logo ? `<img src="${k.logo}" style="max-height:70px;max-width:160px;display:block;margin:8px 0;border:1px solid var(--line);border-radius:6px;padding:4px;">` : `<p class="small">Henüz logo eklenmedi.</p>`}
      <input type="file" id="ay-logo-input" accept="image/*" style="display:none" onchange="logoDosyaSecildi(event)">
      <div class="row">
        <button class="btn" onclick="document.getElementById('ay-logo-input').click()">Logo Seç</button>
        ${k.logo ? `<button class="btn danger" onclick="logoKaldir()">Logoyu Kaldır</button>` : ""}
      </div>
    </div>
  </div>
  ${renderAkademikTakvimKarti()}
  ${renderImzaSirkuleriKarti()}`;
}
function renderImzaSirkuleriKarti() {
  const rows = S.imzaSirkuleri.map(k => `
    <tr>
      <td><input type="text" placeholder="Ad Soyad" value="${escHtml(k.adSoyad)}" style="width:100%" onchange="updateImzaSirku('${k.id}','adSoyad',this.value)"></td>
      <td><input type="text" placeholder="Unvan" value="${escHtml(k.unvan)}" style="width:100%" onchange="updateImzaSirku('${k.id}','unvan',this.value)"></td>
      <td><button class="btn danger" onclick="deleteImzaSirku('${k.id}')">Sil</button></td>
    </tr>`).join("");
  return `
  <div class="card">
    <h2>İmza Sirküsü</h2>
    <p class="small">Belgelerde imza bloklarına ve katılımcı listelerine hızlıca eklemek için sık kullandığınız imza sahiplerini (okul müdürü, müdür yardımcısı, alan şefi, atölye şefi, zümre başkanı vb.) burada tutun.</p>
    <table><thead><tr><th>Ad Soyad</th><th>Unvan</th><th></th></tr></thead>
    <tbody>${rows || `<tr><td colspan="3" class="small">Henüz imza sahibi eklenmedi.</td></tr>`}</tbody></table>
    <div class="row"><button class="btn" onclick="addImzaSirku()">İmza Sahibi Ekle</button></div>
  </div>`;
}
function addImzaSirku() {
  S.imzaSirkuleri.push({ id: uid("imza"), adSoyad: "", unvan: "" });
  save(); renderMain();
}
function updateImzaSirku(id, field, value) {
  const k = S.imzaSirkuleri.find(x => x.id === id);
  if (k) k[field] = value;
  save();
}
function deleteImzaSirku(id) {
  if (!confirm("Bu imza sahibi silinsin mi?")) return;
  S.imzaSirkuleri = S.imzaSirkuleri.filter(x => x.id !== id);
  save(); renderMain();
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

function anaSayfaUyarilari() {
  const uyarilar = [];
  const gercekSiniflar = S.classes.filter(c => c.grade > 0);
  gercekSiniflar.forEach(c => {
    if (!c.excludeFromDistribution && S.normKadro.ogrenciSayilari[c.id] === undefined) {
      uyarilar.push({ text: `${c.name} sınıfının Norm Kadro'da öğrenci sayısı girilmemiş`, moduleId: "norm-kadro" });
    }
  });
  const arizaliMakineler = S.envanter.makineler.filter(m => /ar[ıi]z/i.test(m.durum || ""));
  if (arizaliMakineler.length) {
    uyarilar.push({ text: `${arizaliMakineler.length} makine "Arızalı" durumda`, moduleId: "atolye-envanter" });
  }
  const isletmesizOgrenci = S.students.filter(s => !s.isletme).length;
  if (isletmesizOgrenci) {
    uyarilar.push({ text: `${isletmesizOgrenci} öğrencinin staj işletmesi henüz atanmamış`, moduleId: "staj-yerlestirme" });
  }
  if (!S.akademikTakvim) {
    uyarilar.push({ text: `Akademik takvim henüz yüklenmedi (Yıllık Plan'dan Excel yükleyebilirsiniz)`, moduleId: "yillik-plan" });
  }
  return uyarilar;
}
function anaSayfaIstatistikKarti(deger, etiket, moduleId) {
  return `<div class="card" style="text-align:center;cursor:pointer;" onclick="setModule('${moduleId}')">
    <div class="dash-num">${deger}</div>
    <div class="small">${escHtml(etiket)}</div>
  </div>`;
}
function viewAna() {
  const k = S.kurumBilgileri;
  const istatistikler = [
    [S.classes.filter(c => c.grade > 0).length, "Sınıf", "ders-programi"],
    [S.teachers.length, "Öğretmen", "ders-programi"],
    [S.envanter.makineler.length, "Atölye Makinesi", "atolye-envanter"],
    [S.sinavKagitlari.length, "Sınav Kağıdı", "sinav-havuzu"],
    [S.performansKayitlari.length, "Performans Kaydı", "performans"],
    [S.students.length, "Staj Öğrencisi", "staj-yerlestirme"]
  ];
  const uyarilar = anaSayfaUyarilari();
  return `
  <div class="hero-card">
    <h2>Alan Yönetim Sistemi</h2>
    <p class="small">${escHtml(k.okulAdi)} · ${escHtml(k.alanAdi)}</p>
    <button class="btn primary" style="margin-top:14px;" onclick="setModule('ders-programi')">Ders Programına Git</button>
  </div>
  <div class="grid3" style="margin-top:14px;">
    ${istatistikler.map(([d, e, m]) => anaSayfaIstatistikKarti(d, e, m)).join("")}
  </div>
  ${systemHealthSummary()}
  <div class="card">
    <h3 style="margin-top:0;">${uyarilar.length ? "Dikkat Gerektirenler" : "Her Şey Yolunda"}</h3>
    ${uyarilar.length ? `
    <ul class="small" style="margin:0;padding-left:18px;">
      ${uyarilar.map(u => `<li style="margin-bottom:5px;"><a href="#" onclick="setModule('${u.moduleId}');return false;">${escHtml(u.text)}</a></li>`).join("")}
    </ul>` : `<p class="small" style="margin:0;">Şu an dikkat gerektiren bir eksik görünmüyor.</p>`}
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
let activeProgramlarOgretmenId = "__ALL__";
function selectProgramlarOgretmen(id) { activeProgramlarOgretmenId = id; renderMain(); }
function viewProgramlar() {
  if (activeProgramlarOgretmenId !== "__ALL__" && !S.teachers.some(t => t.id === activeProgramlarOgretmenId)) activeProgramlarOgretmenId = "__ALL__";
  const hoursSummary = S.teachers.map(t => {
    const h = teacherTotalHours(t.id);
    const mode = t.hoursMode || "min";
    const target = t.hoursTarget;
    let ok;
    if (mode === "exact") ok = (h === target);
    else ok = (typeof target !== "number") || (h >= target);
    return `<span class="pill ${ok ? 'ok' : 'warn'}" style="margin-right:6px;">${t.name}: ${h} sa</span>`;
  }).join("");
  const secilenOgretmen = teacherById(activeProgramlarOgretmenId);
  const gosterilecekOgretmenler = secilenOgretmen ? [secilenOgretmen] : S.teachers;
  const secenekler = [{ value: "__ALL__", label: "Tümü (" + S.teachers.length + " öğretmen)" }].concat(S.teachers.map(t => ({ value: t.id, label: t.name })));
  const body = gosterilecekOgretmenler.map(t => renderEditableTeacherGrid(t.id)).join('<hr style="margin:22px 0;border:none;border-top:1px solid var(--line);">');
  const dosyaAdi = secilenOgretmen ? "Öğretmen Programı - " + secilenOgretmen.name : "Öğretmen Programları";
  return `
  <div class="card no-print">
    <h2>Programlar</h2>
    <p class="small">Boş bir hücreye tıklayın: ders ekleyin ya da o saati boşta kilitleyin. Dolu bir hücreye tıklayın: dersi kilitleyin ya da kaldırın. Bir öğretmenin programında birden fazla hücrede aynı anda işlem yapmak için o öğretmenin başlığındaki <b>Çoklu Seçim</b>'i açın.</p>
    <div style="margin-bottom:10px;">${hoursSummary}</div>
    <div class="row" style="flex-wrap:wrap;margin-bottom:6px;">
      <span class="small" style="align-self:center;font-weight:600;">Ekranda göster:</span>
      ${sekmeDropdown("programlar-ogretmen", secenekler, activeProgramlarOgretmenId, "selectProgramlarOgretmen('{v}')")}
    </div>
    <p class="small no-print" style="margin-bottom:6px;">Tek bir öğretmen seçerseniz sayfa çok kısalır, okuması kolaylaşır. Hepsini birden yazdırmak/indirmek isterseniz "Tümü"nü seçin.</p>
    ${belgeAracCubugu(dosyaAdi)}
  </div>
  <div class="print-area">
    ${belgeYazdirmaBasligi(dosyaAdi)}
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
