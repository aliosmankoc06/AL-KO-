/* ============================================================
   ARAYÜZ (VIEWS)
   ============================================================ */

const MODULES = [
  { id: "ana", label: "Ana Sayfa", icon: "home" },
  { id: "ders-programi", label: "Ders Programı", icon: "calendar" }
];
const DERS_PROGRAMI_TABS = [
  { id: "havuz", label: "Ders Havuzu", icon: "book" },
  { id: "ogretmen", label: "Öğretmenler", icon: "users" },
  { id: "sinif", label: "Sınıflar ve Ders Atama", icon: "school" },
  { id: "mekanlar", label: "Fiziki Mekanlar", icon: "room" },
  { id: "kurallar", label: "Ortak-Zıt Dersler", icon: "link" },
  { id: "koordinatorluk", label: "Koordinatörlük", icon: "building" },
  { id: "dagitim", label: "Ders Dağıtım", icon: "shuffle" },
  { id: "programlar", label: "Programlar", icon: "grid" }
];
let activeModule = "ana";
let activeTab = "havuz";
let activeClassId = S.classes[0] ? S.classes[0].id : null;
let activeTeacherId = S.teachers[0] ? S.teachers[0].id : null;
let programView = "ogretmen";
let multiSelectMode = false;
let selectedTeacherCells = new Set();
let activeOffTeacherId = null;

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
  if (activeTab === "havuz") el.innerHTML = viewHavuz();
  else if (activeTab === "ogretmen") el.innerHTML = viewOgretmen();
  else if (activeTab === "sinif") el.innerHTML = viewSinif();
  else if (activeTab === "mekanlar") el.innerHTML = viewMekanlar();
  else if (activeTab === "kurallar") el.innerHTML = viewKurallar();
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
    <h2>Ali Osman Koç — Alan Yönetim Sistemi</h2>
    <p class="small">Soma Mesleki ve Teknik Anadolu Lisesi · Makine Teknolojisi Alanı</p>
  </div>
  ${Object.keys(S.schedule).length > 0 ? systemHealthSummary() : ``}
  <div class="grid3">
    <div class="stat-card"><div class="dash-num">${S.classes.length}</div><div class="dash-lbl">Sınıf</div></div>
    <div class="stat-card"><div class="dash-num">${S.teachers.length}</div><div class="dash-lbl">Öğretmen</div></div>
    <div class="stat-card"><div class="dash-num">${S.isletmeler.length}</div><div class="dash-lbl">İşletme</div></div>
  </div>
  <div class="card">
    <h2>Devam edin</h2>
    <p class="small">Yukarıdaki <b>Ders Programı</b> sekmesinden çalışmaya devam edin.</p>
    <button class="btn primary" onclick="setModule('ders-programi')">Ders Programına Git</button>
  </div>
  <div class="card">
    <h2>Diğer Seçenekler</h2>
    <div class="row" style="max-width:560px;flex-wrap:wrap;">
      <button class="btn" onclick="restoreSchoolDefaults()">${icon('school')} Okulun Ders Havuzu/Öğretmen Listesiyle Başla</button>
      <button class="btn danger" onclick="startNewProgram()">${icon('new')} Tamamen Boş Bir Dosyayla Başla</button>
    </div>
  </div>
  ${renderSavedProgramsCard()}
  ${renderBackupCard()}`;
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
      <td><button class="btn danger" onclick="deleteCourse('${c.id}')">Sil</button></td>
    </tr>`).join("");
  return `
  <div class="card">
    <h2>Ders Havuzu</h2>
    <p class="small">Çerçeve öğretim programından alınan dersler. Yeni ders ekleyebilir veya düzenleyebilirsiniz.</p>
    <table><tr><th>Kod</th><th>Ders Adı</th><th>Dal</th><th>Sınıf</th><th>Haftalık Saat</th><th>Bloklar</th><th></th></tr>${rows}</table>
  </div>
  <div class="card">
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
      <td><button class="btn danger" onclick="deleteTeacher('${t.id}')">Sil</button></td>
    </tr>`;
  }).join("");

  return `
  <div class="card">
    <h2>Öğretmenler</h2>
    <p class="small">Buraya girdiğiniz saat <b>sadece ders (öğretim) saatidir</b> — koordinatörlük buna dahil değildir, "Programı Yenile" çalıştığınızda koordinatörlük saatleri bunun <b>üzerine ayrıca</b> eklenir (ör. 30 saat ders hedefi + 8 saat koordinatörlük = 38 saat genel toplam). "Koordinatörlük Alsın" kutusunu işaretlerseniz o öğretmen otomatik koordinatörlük dağıtımına dahil olur; hiç koordinatörlük almaması gerekenler için bu kutuyu boş bırakın. Belirli bir saati boşta bırakmak için <b>Programlar → Öğretmen Programı</b> ekranından ilgili hücreye tıklayıp "İzinli Yap" seçeneğini kullanın.</p>
    <table><tr><th>Ad Soyad</th><th>Ders Saati</th><th>Saat Hedefi</th><th>Tür</th><th>Koordinatörlük Alsın</th><th></th></tr>${rows}</table>
    <div class="row" style="max-width:400px">
      <input type="text" id="new-teacher" placeholder="Yeni öğretmen adı">
      <button class="btn primary" onclick="addTeacher()">Ekle</button>
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
      const roomChecks = S.rooms.map(r => `
        <label style="margin-right:10px;font-size:12px;">
          <input type="checkbox" ${(a.roomIds || []).includes(r.id) ? 'checked' : ''} onchange="toggleAssignmentRoom('${cls.id}','${a.id}','${r.id}')"> ${r.name}
        </label>`).join("") || `<p class="small">Önce Fiziki Mekanlar sekmesinden mekan ekleyin.</p>`;
      const roomNames = (a.roomIds || []).map(rid => { const r = roomById(rid); return r ? r.name : null; }).filter(Boolean);
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
          <details style="margin-top:6px;">
            <summary class="small" style="cursor:pointer;color:var(--ink-soft);">Bu ders belirli bir mekana bağlansın (opsiyonel) ${roomNames.length ? '<span class="pill info">' + roomNames.join(', ') + '</span>' : ''}</summary>
            <div style="margin-top:6px;">${roomChecks}</div>
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
      <div class="card" style="background:var(--teal-bg);border-color:var(--teal);padding:12px 14px;margin-bottom:16px;">
        <strong style="color:var(--teal-ink);">Bu sınıf okula hangi gün(ler) geliyor?</strong>
        <p class="small">İşletmede mesleki eğitime giden (staj) sınıflar için sadece okula geldikleri günler işaretlenmeli — dağıtım motoru derslerini sadece bu günlere yerleştirir. Okula her gün gelen sınıflar için hepsini işaretli bırakın.</p>
        <div>${dayChecks}</div>
      </div>
      <h2>${cls.name} — Atanmış Dersler</h2>
      ${assignedRows || '<p class="small">Henüz ders atanmadı.</p>'}
      <h2 style="margin-top:20px;">Ders Havuzundan Ekle</h2>
      ${availRows}
    `;
  }

  return `
  <div class="two-col">
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
      ${cls ? `<div class="row"><button class="btn danger" onclick="deleteClass('${cls.id}')">Seçili Sınıfı Sil</button></div>` : ""}
    </div>
    <div class="card">${detail}</div>
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
function addAssignment(classId, courseId) {
  const cls = classById(classId);
  const n = cls.maxTeachersPerCourse || 1;
  const allTeacherIds = S.teachers.map(t => t.id);
  cls.assignments.push({ id: uid("a"), courseId, eligibleTeacherIds: cls.id === "cl-idari" ? [] : allTeacherIds.slice(), teacherCount: cls.id === "cl-idari" ? 1 : n, roomIds: [] });
  save(); renderMain();
}
function removeAssignment(classId, assignmentId) {
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
function toggleAssignmentRoom(classId, assignmentId, roomId) {
  const cls = classById(classId);
  const a = cls.assignments.find(x => x.id === assignmentId);
  if (!a.roomIds) a.roomIds = [];
  if (a.roomIds.includes(roomId)) a.roomIds = a.roomIds.filter(x => x !== roomId);
  else a.roomIds.push(roomId);
  save(); renderMain();
}

/* ---- Fiziki Mekanlar ---- */
let activeRoomId = S.rooms[0] ? S.rooms[0].id : null;
function roomWeeklyUsage(roomId) {
  const grid = {};
  Object.values(S.schedule).forEach(cell => {
    if ((cell.roomIds || []).includes(roomId)) grid[cell.day + "_" + cell.hour] = cell;
  });
  return grid;
}
function roomAssignmentCount(roomId) {
  let n = 0;
  S.classes.forEach(cls => cls.assignments.forEach(a => { if ((a.roomIds || []).includes(roomId)) n++; }));
  return n;
}
function viewMekanlar() {
  const rows = S.rooms.map(r => `
    <tr>
      <td>${r.name}</td>
      <td>${roomAssignmentCount(r.id)} derse bağlı</td>
      <td><button class="btn" onclick="setActiveRoom('${r.id}')">Kullanım Tablosu</button> <button class="btn danger" onclick="deleteRoom('${r.id}')">Sil</button></td>
    </tr>`).join("") || `<tr><td colspan="3" class="small">Henüz mekan eklenmedi.</td></tr>`;

  let usageHtml = `<p class="small">Kullanım tablosunu görmek için soldan bir mekan seçin.</p>`;
  const room = roomById(activeRoomId);
  if (room) {
    const grid = roomWeeklyUsage(room.id);
    let html = `<h2>${room.name} — Haftalık Kullanım</h2>`;
    html += `<table class="sched-table"><tr><th>Saat</th>${DAYS.map(d => `<th>${d}</th>`).join("")}</tr>`;
    for (let h = 0; h < S.hoursPerDay; h++) {
      html += `<tr><td class="small" style="text-align:center;">${h + 1}</td>`;
      DAYS.forEach((d, day) => {
        const cell = grid[day + "_" + h];
        if (cell) {
          const course = courseById(cell.courseId);
          const cls = classById(cell.classId);
          html += `<td><div class="sched-cell filled"><div class="c1">${cls ? cls.name : '?'}</div><div class="c2">${course ? course.name : '?'}</div></div></td>`;
        } else {
          html += `<td><div class="sched-cell"></div></td>`;
        }
      });
      html += "</tr>";
    }
    html += "</table>";
    usageHtml = html;
  }

  return `
  <div class="card">
    <h2>Fiziki Mekanlar</h2>
    <p class="small">Atölye, laboratuvar, derslik gibi mekanları buraya ekleyin. Bir dersi belirli bir mekana bağlamak için <b>Sınıflar ve Ders Atama</b> ekranındaki ilgili dersin altındaki "Bu ders belirli bir mekana bağlansın" bölümünü kullanın — dağıtım motoru o mekanı aynı saatte başka bir derse vermez.</p>
    <table><tr><th>Mekan</th><th>Kullanım</th><th></th></tr>${rows}</table>
    <div class="row" style="max-width:400px">
      <input type="text" id="new-room-name" placeholder="Yeni mekan adı (örn. CNC Atölyesi)">
      <button class="btn primary" onclick="addRoom()">Ekle</button>
    </div>
  </div>
  <div class="card">${usageHtml}</div>`;
}
function setActiveRoom(id) { activeRoomId = id; renderMain(); }
function addRoom() {
  const input = document.getElementById("new-room-name");
  const name = input.value.trim();
  if (!name) return;
  const r = { id: uid("r"), name };
  S.rooms.push(r);
  activeRoomId = r.id;
  save(); renderMain();
}
function deleteRoom(id) {
  if (!confirm("Bu mekanı silmek istiyor musunuz? Bu mekana bağlı derslerin mekan bağlantısı kaldırılır.")) return;
  S.rooms = S.rooms.filter(r => r.id !== id);
  S.classes.forEach(cls => cls.assignments.forEach(a => { if (a.roomIds) a.roomIds = a.roomIds.filter(x => x !== id); }));
  Object.values(S.schedule).forEach(cell => { if (cell.roomIds) cell.roomIds = cell.roomIds.filter(x => x !== id); });
  if (activeRoomId === id) activeRoomId = S.rooms[0] ? S.rooms[0].id : null;
  save(); renderMain();
}

/* ---- Ortak-Zıt Dersler ---- */
function viewKurallar() {
  const realCourses = S.courses.filter(c => c.id !== KOORD_COURSE_ID);
  const courseOpts = realCourses.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  const pairRows = (S.noSameDayPairs || []).map(p => {
    const a = courseById(p.courseIdA), b = courseById(p.courseIdB);
    return `<tr><td>${a ? a.name : '?'}</td><td>${b ? b.name : '?'}</td><td><button class="btn danger" onclick="removeNoSameDayPair('${p.id}')">Kaldır</button></td></tr>`;
  }).join("") || `<tr><td colspan="3" class="small">Henüz kural eklenmedi.</td></tr>`;

  const lunchList = realCourses.map(c => `
    <div class="chk-row">
      <label style="flex:1;"><input type="checkbox" ${(S.noLunchSplitCourseIds || []).includes(c.id) ? 'checked' : ''} onchange="toggleNoLunchSplit('${c.id}')"> ${c.name}</label>
    </div>`).join("");

  return `
  <div class="card">
    <h2>Aynı Güne Gelmesin</h2>
    <p class="small">Seçtiğiniz iki ders, aynı sınıfta artık aynı güne denk gelmeyecek şekilde dağıtılır (ör. iki ağır atölye dersi aynı gün üst üste binmesin). Kural, o dersi alan her sınıf için otomatik uygulanır.</p>
    <div class="row" style="max-width:600px;">
      <select id="nsd-a" style="width:100%">${courseOpts}</select>
      <select id="nsd-b" style="width:100%">${courseOpts}</select>
      <button class="btn primary" onclick="addNoSameDayPair()">Kural Ekle</button>
    </div>
    <table style="margin-top:10px;"><tr><th>Ders</th><th>Aynı Güne Gelmesin</th><th></th></tr>${pairRows}</table>
  </div>
  <div class="card">
    <h2>Öğle Arasını Bölmesin</h2>
    <p class="small">İşaretlediğiniz dersler, blok hâlinde yerleştirilirken öğle arasının (günün ortasının) iki yakasına bölünmeden, öğleden önce ya da öğleden sonra tek parça olarak yerleştirilir.</p>
    ${lunchList}
  </div>`;
}
function addNoSameDayPair() {
  const a = document.getElementById("nsd-a").value;
  const b = document.getElementById("nsd-b").value;
  if (!a || !b || a === b) { alert("İki farklı ders seçin."); return; }
  const exists = (S.noSameDayPairs || []).some(p => (p.courseIdA === a && p.courseIdB === b) || (p.courseIdA === b && p.courseIdB === a));
  if (exists) { alert("Bu kural zaten ekli."); return; }
  S.noSameDayPairs.push({ id: uid("nsd"), courseIdA: a, courseIdB: b });
  save(); renderMain();
}
function removeNoSameDayPair(id) {
  S.noSameDayPairs = S.noSameDayPairs.filter(p => p.id !== id);
  save(); renderMain();
}
function toggleNoLunchSplit(courseId) {
  if (S.noLunchSplitCourseIds.includes(courseId)) S.noLunchSplitCourseIds = S.noLunchSplitCourseIds.filter(x => x !== courseId);
  else S.noLunchSplitCourseIds.push(courseId);
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
      const shared = isl.groups.length === 2;
      return `<div class="row" style="max-width:640px;align-items:center;">
        <span style="flex:2;">${isl.name}${shared ? ' <span class="pill info">ortak (her iki grupta da var)</span>' : ''}</span>
        <span class="small" style="flex:1;">${isletmeHoursEstimate(isl)}</span>
        <button class="btn danger" onclick="removeIsletmeGroup('${isl.id}','${groupKey}')">Kaldır</button>
      </div>`;
    }).join("");
  }

  const teacherAssignRows = S.isletmeler.map(isl => {
    return `<tr>
      <td>${isl.name}${isl.groups.length === 2 ? ' <span class="pill info">ortak</span>' : ''}</td>
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

  return `
  <div class="card" style="background:var(--teal-bg);border-color:var(--teal);">
    <h2 style="color:var(--teal-ink);">Koordinatörlük / İşletme Listesi</h2>
    <p class="small">
      Buraya sadece o gün grubuna giden <b>işletme adlarını</b> yazın — hangi öğretmenin gideceğini yazmak zorunda değilsiniz, "Programı Yenile" bunu otomatik, en dengeli şekilde dağıtır.
      Bir işletme adı <b>her iki listeye de</b> yazılırsa (ör. aynı işletmeye hem Pazartesi-Salı-Çarşamba hem Çarşamba-Perşembe-Cuma grubundan öğrenci gidiyorsa), sistem bunu <b>ortak</b> işaretler ve dağıtımda otomatik olarak ya tek bir Çarşamba ziyaretiyle (8 saat, daha az yük) ya da iki ayrı ziyaretle (16 saat) — hangisi genel programı daha dengeli/boşluksuz yapıyorsa o şekilde çözer.
      <br><span class="small" style="color:var(--ink-soft);">Dayanak: Ortaöğretim Kurumları Yönetmeliği Madde 88 — bir öğretmene aynı gün için 8 saatten fazla ek ders (koordinatörlük) görevi verilmez; bu nedenle koordinatörlük günü o öğretmene ayrıca okul dersi eklenmez.</span>
    </p>
    <div class="grid2">
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
    </div>
  </div>
  <div class="card">
    <h2>Öğretmen Ata (opsiyonel)</h2>
    <p class="small">İstemezseniz boş bırakın — "Programı Yenile" sırasında sistem her işletmeye, o günlerde tam gün müsait olan ve o an en az yüklü öğretmeni otomatik atar. Sadece belirli bir işletmeye mutlaka belirli bir öğretmenin gitmesini istiyorsanız burada seçin.</p>
    <table><tr><th>İşletme</th><th>Gün Grubu</th><th>Öğretmen</th></tr>${teacherAssignRows}</table>
  </div>
  <div class="card">
    <h2>Saat Dengesi (Ders + Koordinatörlük)</h2>
    <p class="small">Bu tablo en son "Programı Yenile" çalıştırıldığındaki sonucu gösterir. En yüksek ile en düşük genel toplam arasındaki fark: <b>${fark} saat</b> ${fark <= 3 ? '(uygun)' : '(hedef: en fazla 3 saat)'}</p>
    <table><tr><th>Öğretmen</th><th>Ders Saati</th><th>Koordinatörlük Saati</th><th>Genel Toplam</th><th>Durum</th></tr>${summaryHtml}</table>
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
  <div class="card">
    <h2>Ders Dağıtım</h2>
    <p class="small">Sistem tek denemeyle yetinmiyor — onlarca farklı sıralama/kombinasyon deneyip <b>en az boşta ders bırakan, en dengeli saat dağıtan</b> sonucu seçiyor. Bu birkaç saniye sürebilir. 12. sınıflar için önce "Sınıflar ve Ders Atama" ekranından okula geldikleri günleri seçmeniz gerekir. Koordinatörlük saatleri de bu dağıtıma dahildir — bkz. <b>Koordinatörlük</b> sekmesi.</p>
    <div class="row" style="max-width:460px"><button class="btn primary" onclick="refreshProgram()">Programı Yenile (baştan farklı kombinasyonla dağıt)</button>
    <button class="btn danger" onclick="resetAll()">Tüm Dağıtımı Sıfırla</button></div>
    <div id="dagitim-sonuc"></div>
    <table style="margin-top:14px;"><tr><th>Sınıf</th><th>Toplam Saat</th><th>Dağıtılmış</th><th>Durum</th><th></th></tr>${rows}</table>
  </div>
  <div class="card">
    <h2>Her Dersin Dağıtım Durumu (hangi ders kime, kaç öğretmenle atandı)</h2>
    <table><tr><th>Sınıf</th><th>Ders</th><th>Yerleşen/Toplam Saat</th><th>Atanan Öğretmen(ler)</th><th>Durum</th></tr>${assignmentStatusRows()}</table>
  </div>
  <div class="card">
    <h2>Öğretmen Haftalık Saat Kontrolü (ders + koordinatörlük, adalet hedefi: en fazla 3 saat fark)</h2>
    <p class="small">En yüksek ile en düşük genel toplam saat arasındaki fark şu an: <b>${spreadNow} saat</b> ${spreadNow <= 3 ? '(uygun)' : '(hedefin üzerinde — "Programı Yenile" ile yeniden dengelenebilir)'}</p>
    <table><tr><th>Öğretmen</th><th>Ders Saati</th><th>Koordinatörlük Saati</th><th>Genel Toplam</th><th>Hedef</th><th>Durum</th></tr>${teacherRows}</table>
  </div>
  <div class="card">
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
      S.schedule = {};
      distributeAllBestAsync(450,
        (r) => {
          hideWorkingOverlay();
          activeTab = "programlar";
          programView = "tumogretmen";
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
  const teacherOpts = S.teachers.map(t => `<option value="${t.id}" ${t.id === activeTeacherId ? 'selected' : ''}>${t.name}</option>`).join("");
  let body = "";
  if (programView === "ogretmen") {
    body = renderEditableTeacherGrid(activeTeacherId);
  } else if (programView === "tumogretmen") {
    body = renderAllTeachersCombined();
  }
  const hoursSummary = S.teachers.map(t => {
    const h = teacherTotalHours(t.id);
    const mode = t.hoursMode || "min";
    const target = t.hoursTarget;
    let ok;
    if (mode === "exact") ok = (h === target);
    else ok = (typeof target !== "number") || (h >= target);
    return `<span class="pill ${ok ? 'ok' : 'warn'}" style="margin-right:6px;">${t.name}: ${h} sa</span>`;
  }).join("");
  return `
  <div class="card no-print">
    <h2>Programlar</h2>
    ${programView === 'ogretmen'
      ? (multiSelectMode
          ? `<p class="small">Fareyle basılı tutup hücreler üzerinde gezdirin; bıraktığınızda seçtiğiniz hücreler için yapmak istediğiniz işlemi seçebileceğiniz bir pencere açılır. Tek bir hücreye tıklayıp bırakmak da o hücreyi tek başına seçer.</p>`
          : `<p class="small">Boş bir hücreye tıklayın: ders ekleyin ya da o saati boşta kilitleyin. Dolu bir hücreye tıklayın: dersi kilitleyin ya da kaldırın. Birden fazla hücrede aynı anda işlem yapmak için <b>Çoklu Seçim</b>'i açın.</p>`)
      : ``}
    <div style="margin-bottom:10px;">${hoursSummary}</div>
    <div class="row" style="max-width:600px;">
      <button class="btn ${programView === 'ogretmen' ? 'primary' : ''}" onclick="setProgramView('ogretmen')">Öğretmen Programı</button>
      <button class="btn ${programView === 'tumogretmen' ? 'primary' : ''}" onclick="setProgramView('tumogretmen')">Tüm Öğretmenler (birlikte)</button>
    </div>
    <div class="row" style="max-width:520px;">
      ${programView === 'ogretmen'
        ? `<select onchange="activeTeacherId=this.value; clearSelection(); renderMain();" style="width:100%">${teacherOpts}</select>`
        : ``}
      <button class="btn" onclick="window.print()">Yazdır</button>
    </div>
    ${programView === 'ogretmen' ? `
    <div class="row" style="max-width:520px;">
      <button class="btn ${multiSelectMode ? 'primary' : ''}" onclick="toggleMultiSelect()">${multiSelectMode ? '✓ Çoklu Seçim Açık' : 'Çoklu Seçim'}</button>
      ${multiSelectMode && selectedTeacherCells.size > 0 ? `<button class="btn" onclick="clearSelection()">Seçimi Temizle (${selectedTeacherCells.size})</button>` : ``}
    </div>
    ` : ``}
  </div>
  <div class="card">${body}</div>`;
}
function setProgramView(v) { programView = v; renderMain(); }

function renderAllTeachersCombined() {
  const legend = Object.values(GRADE_COLORS).map(c =>
    `<span style="display:inline-flex;align-items:center;gap:5px;margin-right:12px;font-size:11.5px;">
      <span style="width:12px;height:12px;border-radius:3px;background:${c.bg};border:1px solid ${c.ink};display:inline-block;"></span>${c.label}
    </span>`
  ).join("");
  let html = `<div style="margin-bottom:14px;">${legend}</div>`;
  html += `<table class="sched-table"><tr><th>Gün</th><th>Saat</th>${S.teachers.map(t => `<th>${t.name}</th>`).join("")}</tr>`;
  DAYS.forEach((d, day) => {
    for (let h = 0; h < S.hoursPerDay; h++) {
      html += "<tr>";
      if (h === 0) html += `<td rowspan="${S.hoursPerDay}" style="background:var(--panel-2);font-weight:600;text-align:center;vertical-align:middle;">${d}</td>`;
      html += `<td class="small" style="text-align:center;">${h + 1}</td>`;
      S.teachers.forEach(t => {
        const cell = Object.values(S.schedule).find(c => c.day === day && c.hour === h && c.teacherIds.includes(t.id));
        if (cell) {
          const course = courseById(cell.courseId);
          const cls = classById(cell.classId);
          const isKoord = cell.courseId === KOORD_COURSE_ID;
          const gc = isKoord ? { bg: "#EDE3F5", ink: "#5B3A85" } : gradeColor(cls ? cls.grade : 0);
          html += `<td><div class="sched-cell filled" style="background:${gc.bg};">
            <div class="c1" style="color:${gc.ink};font-size:10px;">${isKoord ? (cell.isletme || 'Koordinatörlük') : (cls ? cls.name : '')}</div>
            <div class="c2" style="font-size:9.5px;">${isKoord ? 'Koordinatörlük' : (course ? course.name : '?')}</div>
          </div></td>`;
        } else {
          html += `<td><div class="sched-cell"></div></td>`;
        }
      });
      html += "</tr>";
    }
  });
  html += "</table>";
  return html;
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
  let html = `<h2>${t.name} Haftalık Programı</h2><div style="margin-bottom:10px;">${legend}</div>`;
  html += `<table class="sched-table"><tr><th>Saat</th>${DAYS.map(d => `<th>${d}</th>`).join("")}</tr>`;
  for (let h = 0; h < S.hoursPerDay; h++) {
    html += `<tr><td class="small" style="text-align:center;">${h + 1}</td>`;
    DAYS.forEach((d, day) => {
      const cell = grid[day + "_" + h];
      const blocked = S.teacherBlockedSlots[teacherBlockKey(teacherId, day, h)];
      const off = isTeacherOffAt(teacherId, day, h);
      const selKey = day + "_" + h;
      const selected = selectedTeacherCells.has(selKey);
      const selStyle = selected ? "outline:2px solid var(--navy);outline-offset:-2px;" : "";
      const eventAttrs = multiSelectMode
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
  S.schedule[key] = { day, hour, classId, assignmentId: a.id, courseId: a.courseId, teacherIds: checked, roomIds: (a.roomIds || []).slice() };
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
