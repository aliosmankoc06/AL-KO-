/* ============================================================
   ZAMANLAMA / DAĞITIM MOTORU
   ============================================================ */

function scheduleKey(classId, day, hour) { return classId + "_" + day + "_" + hour; }
function blockKey(classId, day, hour) { return classId + "_" + day + "_" + hour; }
function teacherBlockKey(teacherId, day, hour) { return teacherId + "_" + day + "_" + hour; }

function isClassFree(classId, day, hour) {
  if (S.blockedSlots[blockKey(classId, day, hour)]) return false;
  return !S.schedule[scheduleKey(classId, day, hour)];
}

function isTeacherOffAt(teacherId, day, hour) {
  const t = teacherById(teacherId);
  if (!t || !t.timeOff) return false;
  const status = t.timeOff[day];
  if (!status || status === "none") return false;
  if (status === "full") return true;
  const half = Math.floor(S.hoursPerDay / 2);
  if (status === "am") return hour < half;
  if (status === "pm") return hour >= half;
  return false;
}

function isTeacherFreeAt(teacherId, day, hour) {
  if (isTeacherOffAt(teacherId, day, hour)) return false;
  if (S.teacherBlockedSlots[teacherBlockKey(teacherId, day, hour)]) return false;
  for (const key in S.schedule) {
    const cell = S.schedule[key];
    if (cell.day === day && cell.hour === hour && cell.teacherIds.includes(teacherId)) return false;
  }
  return true;
}

function teacherLoad(teacherId) {
  return Object.values(S.schedule).filter(c => c.teacherIds.includes(teacherId) && (c.courseId !== KOORD_COURSE_ID || c.paid)).length;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function areRoomsFree(roomIds, day, hour, exceptKey) {
  const rooms = (roomIds || []).filter(Boolean);
  if (rooms.length === 0) return true;
  for (const key in S.schedule) {
    if (key === exceptKey) continue;
    const cell = S.schedule[key];
    if (cell.day === day && cell.hour === hour) {
      const cellRooms = (cell.roomIds || []).filter(Boolean);
      if (cellRooms.some(r => rooms.includes(r))) return false;
    }
  }
  return true;
}

function placeBlockFixed(cls, assignment, blockLen, teacherIds) {
  const schoolDays = (cls.schoolDays && cls.schoolDays.length) ? cls.schoolDays : [0, 1, 2, 3, 4];
  for (const day of schoolDays) {
    for (let hour = 0; hour <= S.hoursPerDay - blockLen; hour++) {
      let ok = true;
      for (let h = hour; h < hour + blockLen; h++) {
        if (!isClassFree(cls.id, day, h)) { ok = false; break; }
        if (!areRoomsFree(assignment.roomIds, day, h, null)) { ok = false; break; }
        for (const tid of teacherIds) {
          if (!isTeacherFreeAt(tid, day, h)) { ok = false; break; }
        }
        if (!ok) break;
      }
      if (ok) {
        for (let h = hour; h < hour + blockLen; h++) {
          S.schedule[scheduleKey(cls.id, day, h)] = {
            day, hour: h, classId: cls.id, assignmentId: assignment.id,
            courseId: assignment.courseId, teacherIds: teacherIds.slice(),
            roomIds: (assignment.roomIds || []).slice()
          };
        }
        return true;
      }
    }
  }
  return false;
}

function clearClassSchedule(classId) {
  Object.keys(S.schedule).forEach(k => { if (S.schedule[k].classId === classId) delete S.schedule[k]; });
}

function diagnoseFailure(cls, assignment, blockLen) {
  if ((assignment.teacherCount || 0) > 0 && (!assignment.eligibleTeacherIds || assignment.eligibleTeacherIds.length === 0)) {
    return "bu derse henüz öğretmen havuzu seçilmedi";
  }
  const schoolDays = (cls.schoolDays && cls.schoolDays.length) ? cls.schoolDays : [0, 1, 2, 3, 4];
  if (schoolDays.length === 0) return "sınıfın okula geldiği günler henüz belirlenmedi (Sınıflar ve Ders Atama ekranından ayarlayın)";
  let classBlocked = 0, roomBlocked = 0, teacherBlocked = 0, totalSlots = 0;
  for (const day of schoolDays) {
    for (let hour = 0; hour <= S.hoursPerDay - blockLen; hour++) {
      totalSlots++;
      let classOk = true;
      for (let h = hour; h < hour + blockLen; h++) { if (!isClassFree(cls.id, day, h)) { classOk = false; break; } }
      if (!classOk) { classBlocked++; continue; }
      let roomOk = true;
      for (let h = hour; h < hour + blockLen; h++) { if (!areRoomsFree(assignment.roomIds, day, h, null)) { roomOk = false; break; } }
      if (!roomOk) { roomBlocked++; continue; }
      if ((assignment.teacherCount || 0) > 0) {
        const avail = (assignment.eligibleTeacherIds || []).filter(tid => {
          for (let h = hour; h < hour + blockLen; h++) { if (!isTeacherFreeAt(tid, day, h)) return false; }
          return true;
        });
        if (avail.length === 0) { teacherBlocked++; continue; }
      }
    }
  }
  if (classBlocked === totalSlots) return "sınıfın okula geldiği günlerdeki programda bu derse ayıracak boş saat kalmadı";
  if (teacherBlocked >= roomBlocked && teacherBlocked > 0) return "havuzdaki öğretmenlerin hiçbiri o uzunlukta uygun/boş bir zaman dilimine denk gelmiyor (izinli günler veya başka derslerle çakışma)";
  if (roomBlocked > 0) return "seçili fiziki mekan uygun saatlerde sürekli dolu";
  return "bilinmeyen bir çakışma nedeniyle yerleştirilemedi";
}

function runChunked(totalAttempts, attemptFn, onProgress, onDone, batchSize) {
  let i = 0;
  const size = batchSize || 3;
  function step() {
    const end = Math.min(i + size, totalAttempts);
    for (; i < end; i++) { attemptFn(); }
    if (onProgress) onProgress(i, totalAttempts);
    if (i < totalAttempts) setTimeout(step, 0);
    else onDone();
  }
  step();
}

function distributeClassAsync(classId, onDone, onProgress) {
  const cls = classById(classId);
  if (!cls) { onDone({ placed: 0, failed: 0 }); return; }
  const attempts = 150;
  const frozenSnapshot = {};
  const lockedAssignmentIds = new Set();
  Object.keys(S.schedule).forEach(k => {
    const cell = S.schedule[k];
    if (cell.classId === classId && cell.locked) {
      frozenSnapshot[k] = JSON.parse(JSON.stringify(cell));
      lockedAssignmentIds.add(cell.assignmentId);
    }
  });
  const freeAssignments = cls.assignments.filter(a => !lockedAssignmentIds.has(a.id));
  let bestScoreValue = null;
  let candidates = [];
  function attempt() {
    clearClassSchedule(classId);
    Object.keys(frozenSnapshot).forEach(k => { S.schedule[k] = JSON.parse(JSON.stringify(frozenSnapshot[k])); });
    const sorted = shuffleTasksByTier(freeAssignments.map(a => ({ cls, assignment: a })));
    let placed = 0, failed = 0, failedList = [];
    sorted.forEach(({ assignment: a }) => {
      const course = courseById(a.courseId);
      if (!course) return;
      const blocks = (course.blocks && course.blocks.length) ? course.blocks : [course.hours];
      const team = findBestTeamForAssignment(cls, a, blocks);
      if (team === null) {
        blocks.forEach(len => {
          failed++;
          failedList.push({ classId: cls.id, assignmentId: a.id, blockLen: len });
        });
        return;
      }
      tryPlaceAssignmentWithTeam(cls, a, blocks, team, true);
      placed += blocks.length;
    });
    const q = scheduleQualityScore();
    const snapshotForClass = {};
    Object.keys(S.schedule).forEach(k => { if (S.schedule[k].classId === classId) snapshotForClass[k] = JSON.parse(JSON.stringify(S.schedule[k])); });
    if (bestScoreValue === null || q.score < bestScoreValue) {
      bestScoreValue = q.score;
      candidates = [{ snapshot: snapshotForClass, result: { placed, failed, failedList } }];
    } else if (q.score === bestScoreValue) {
      if (candidates.length < 20) candidates.push({ snapshot: snapshotForClass, result: { placed, failed, failedList } });
    }
  }
  runChunked(attempts, attempt, onProgress, () => {
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    clearClassSchedule(classId);
    Object.keys(chosen ? chosen.snapshot : frozenSnapshot).forEach(k => { S.schedule[k] = (chosen ? chosen.snapshot : frozenSnapshot)[k]; });
    save();
    onDone(chosen ? chosen.result : { placed: 0, failed: 0, failedList: [] });
  });
}

function combinations(arr, k) {
  const result = [];
  function helper(start, combo) {
    if (combo.length === k) { result.push(combo.slice()); return; }
    for (let i = start; i < arr.length; i++) { combo.push(arr[i]); helper(i + 1, combo); combo.pop(); }
  }
  helper(0, []);
  return result;
}
function sumLoad(combo) { return combo.reduce((s, id) => s + teacherLoad(id), 0); }

function tryPlaceAssignmentWithTeam(cls, assignment, blocks, team, commit) {
  const reservations = [];
  const rooms = (assignment.roomIds || []).filter(Boolean);
  function classFreeSim(day, hour) {
    if (!isClassFree(cls.id, day, hour)) return false;
    return !reservations.some(r => r.type === 'class' && r.day === day && r.hour === hour);
  }
  function teacherFreeSim(tid, day, hour) {
    if (!isTeacherFreeAt(tid, day, hour)) return false;
    return !reservations.some(r => r.type === 'teacher' && r.id === tid && r.day === day && r.hour === hour);
  }
  function roomFreeSim(day, hour) {
    if (!areRoomsFree(assignment.roomIds, day, hour, null)) return false;
    if (rooms.length === 0) return true;
    return !reservations.some(r => r.type === 'room' && rooms.includes(r.id) && r.day === day && r.hour === hour);
  }
  const schoolDays = (cls.schoolDays && cls.schoolDays.length) ? cls.schoolDays : [0, 1, 2, 3, 4];
  const placements = [];
  for (const len of blocks) {
    let placed = false;
    for (const day of schoolDays) {
      for (let hour = 0; hour <= S.hoursPerDay - len; hour++) {
        let ok = true;
        for (let h = hour; h < hour + len; h++) {
          if (!classFreeSim(day, h)) { ok = false; break; }
          if (!roomFreeSim(day, h)) { ok = false; break; }
          for (const tid of team) { if (!teacherFreeSim(tid, day, h)) { ok = false; break; } }
          if (!ok) break;
        }
        if (ok) {
          for (let h = hour; h < hour + len; h++) {
            reservations.push({ type: 'class', day, hour: h });
            rooms.forEach(rid => reservations.push({ type: 'room', id: rid, day, hour: h }));
            team.forEach(tid => reservations.push({ type: 'teacher', id: tid, day, hour: h }));
          }
          placements.push({ day, hourStart: hour, len });
          placed = true;
          break;
        }
      }
      if (placed) break;
    }
    if (!placed) return null;
  }
  if (commit) {
    placements.forEach(p => {
      for (let h = p.hourStart; h < p.hourStart + p.len; h++) {
        S.schedule[scheduleKey(cls.id, p.day, h)] = {
          day: p.day, hour: h, classId: cls.id, assignmentId: assignment.id,
          courseId: assignment.courseId, teacherIds: team.slice(), roomIds: rooms.slice()
        };
      }
    });
  }
  return placements;
}

function teacherMaxHours(teacherId) {
  const t = teacherById(teacherId);
  return (t && t.hoursMode === "exact" && typeof t.hoursTarget === "number") ? t.hoursTarget : null;
}
function teacherDersLoad(teacherId) {
  return teacherLoad(teacherId) - teacherCoordHours(teacherId);
}

function teacherGapCount(teacherId) {
  let gaps = 0;
  for (let day = 0; day < DAYS.length; day++) {
    let busyHours = [];
    for (let h = 0; h < S.hoursPerDay; h++) {
      const busy = Object.values(S.schedule).some(c => c.day === day && c.hour === h && c.teacherIds.includes(teacherId));
      busyHours.push(busy);
    }
    const first = busyHours.indexOf(true);
    const last = busyHours.lastIndexOf(true);
    if (first === -1) continue;
    for (let h = first; h <= last; h++) { if (!busyHours[h]) gaps++; }
  }
  return gaps;
}
function teacherLateStartSum(teacherId) {
  let sum = 0;
  for (let day = 0; day < DAYS.length; day++) {
    let first = -1;
    for (let h = 0; h < S.hoursPerDay; h++) {
      const busy = Object.values(S.schedule).some(c => c.day === day && c.hour === h && c.teacherIds.includes(teacherId));
      if (busy) { first = h; break; }
    }
    if (first > 0) sum += first;
  }
  return sum;
}
function totalLateStartSum() {
  return S.teachers.reduce((s, t) => s + teacherLateStartSum(t.id), 0);
}
function totalGapCount() {
  return S.teachers.reduce((s, t) => s + teacherGapCount(t.id), 0);
}
function classGapCount(classId) {
  const cls = classById(classId);
  const schoolDays = (cls.schoolDays && cls.schoolDays.length) ? cls.schoolDays : [0, 1, 2, 3, 4];
  let gaps = 0;
  schoolDays.forEach(day => {
    let busyHours = [];
    for (let h = 0; h < S.hoursPerDay; h++) { busyHours.push(!!S.schedule[scheduleKey(classId, day, h)]); }
    const first = busyHours.indexOf(true);
    const last = busyHours.lastIndexOf(true);
    if (first === -1) return;
    for (let h = first; h <= last; h++) { if (!busyHours[h]) gaps++; }
  });
  return gaps;
}
function totalClassGapCount() {
  return S.classes.reduce((s, c) => s + classGapCount(c.id), 0);
}

function scheduleQualityScore() {
  let unplaced = 0;
  S.classes.forEach(cls => {
    cls.assignments.forEach(a => {
      const course = courseById(a.courseId);
      if (!course) return;
      const placed = Object.values(S.schedule).filter(c => c.classId === cls.id && c.assignmentId === a.id).length;
      unplaced += Math.max(0, course.hours - placed);
    });
  });
  const poolTeachers = S.teachers.filter(t => t.coordEligible !== false);
  const poolHours = poolTeachers.map(t => teacherTotalHours(t.id));
  const maxH = poolHours.length ? Math.max(...poolHours) : 0;
  const minH = poolHours.length ? Math.min(...poolHours) : 0;
  const spread = maxH - minH;
  const under20 = poolTeachers.map(t => teacherTotalHours(t.id) - teacherCoordHours(t.id)).filter(h => h < 20).length;
  const koordHoursArr = poolTeachers.map(t => teacherCoordHours(t.id));
  const koordMax = koordHoursArr.length ? Math.max(...koordHoursArr) : 0;
  const koordMin = koordHoursArr.length ? Math.min(...koordHoursArr) : 0;
  const koordSpread = koordMax - koordMin;
  let capPenalty = 0;
  S.teachers.forEach(t => {
    const dersSaat = teacherTotalHours(t.id) - teacherCoordHours(t.id); // hedef sadece ders saatini kapsar, koordinatörlük ayrıca üstüne eklenir
    if (t.hoursMode === "exact" && typeof t.hoursTarget === "number") {
      capPenalty += Math.abs(dersSaat - t.hoursTarget) * 800;
    } else if (t.hoursMode === "min" && typeof t.hoursTarget === "number") {
      capPenalty += Math.max(0, t.hoursTarget - dersSaat) * 30;
    }
  });
  const spreadPenalty = spread <= 3 ? spread : (spread - 3) * 120 + 3;
  const koordSpreadPenalty = koordSpread <= 4 ? koordSpread * 2 : (koordSpread - 4) * 100 + 8;
  return { unplaced, spread, koordSpread, under20, capPenalty, gaps: totalGapCount(), score: unplaced * 1000 + totalGapCount() * 80 + under20 * 40 + totalClassGapCount() * 15 + totalLateStartSum() * 3 + spreadPenalty + koordSpreadPenalty + capPenalty };
}

function taskDifficulty(t) {
  // Küçük sayı = daha zor/kısıtlı, önce yerleştirilmeli
  const poolSize = (t.assignment.eligibleTeacherIds || []).length || 999;
  const days = (t.cls.schoolDays && t.cls.schoolDays.length) ? t.cls.schoolDays.length : 5;
  return poolSize * 10 + days;
}
function shuffleTasksByTier(tasks) {
  const idariTasks = shuffle(tasks.filter(t => t.cls.id === "cl-idari"));
  const otherTasks = tasks.filter(t => t.cls.id !== "cl-idari");
  const tiers = {};
  otherTasks.forEach(t => {
    const k = t.assignment.teacherCount || 0;
    if (!tiers[k]) tiers[k] = [];
    tiers[k].push(t);
  });
  const keys = Object.keys(tiers).map(Number).sort((a, b) => b - a);
  let result = idariTasks.slice();
  keys.forEach(k => {
    const buckets = {};
    tiers[k].forEach(t => {
      const d = taskDifficulty(t);
      if (!buckets[d]) buckets[d] = [];
      buckets[d].push(t);
    });
    const dKeys = Object.keys(buckets).map(Number).sort((a, b) => a - b);
    dKeys.forEach(d => result = result.concat(shuffle(buckets[d])));
  });
  return result;
}

function findBestTeamForAssignment(cls, assignment, blocks) {
  const maxT = assignment.teacherCount || 0;
  if (maxT === 0) {
    const ok = tryPlaceAssignmentWithTeam(cls, assignment, blocks, [], false);
    return ok ? [] : null;
  }
  const totalCourseHours = blocks.reduce((s, l) => s + l, 0);
  const pool = (assignment.eligibleTeacherIds || []).filter(id => {
    const max = teacherMaxHours(id);
    if (max === null) return true;
    return teacherDersLoad(id) + totalCourseHours <= max;
  });
  for (let size = Math.min(maxT, pool.length); size >= 1; size--) {
    let combos = combinations(pool, size);
    combos = shuffle(combos);
    combos.sort((a, b) => sumLoad(a) - sumLoad(b));
    for (const combo of combos) {
      if (tryPlaceAssignmentWithTeam(cls, assignment, blocks, combo, false)) {
        return combo;
      }
    }
  }
  return null;
}

function distributeAllBestAsync(attempts, onDone, onProgress) {
  Object.keys(S.schedule).forEach(k => { if (S.schedule[k].courseId === KOORD_COURSE_ID) delete S.schedule[k]; });
  const frozenSnapshot = {};
  const lockedAssignmentKeys = new Set();
  Object.keys(S.schedule).forEach(k => {
    const cell = S.schedule[k];
    const cls = classById(cell.classId);
    if ((cls && cls.excludeFromDistribution) || cell.locked) {
      frozenSnapshot[k] = JSON.parse(JSON.stringify(cell));
      if (cell.locked) lockedAssignmentKeys.add(cell.classId + "|" + cell.assignmentId);
    }
  });
  let bestScoreValue = null;
  let candidates = [];
  function attempt() {
    S.schedule = JSON.parse(JSON.stringify(frozenSnapshot));
    const koordFailed = placeCoordinatorTasks();
    let tasks = [];
    S.classes.forEach(cls => {
      if (cls.excludeFromDistribution) return;
      cls.assignments.forEach(a => {
        if (lockedAssignmentKeys.has(cls.id + "|" + a.id)) return;
        tasks.push({ cls, assignment: a });
      });
    });
    tasks = shuffleTasksByTier(tasks);
    let placed = 0, failed = koordFailed.length, failedList = koordFailed.map(name => ({ isletmeName: name }));
    tasks.forEach(({ cls, assignment: a }) => {
      const course = courseById(a.courseId);
      if (!course) return;
      const blocks = (course.blocks && course.blocks.length) ? course.blocks : [course.hours];
      const team = findBestTeamForAssignment(cls, a, blocks);
      if (team === null) {
        blocks.forEach(len => {
          failed++;
          failedList.push({ classId: cls.id, assignmentId: a.id, blockLen: len });
        });
        return;
      }
      tryPlaceAssignmentWithTeam(cls, a, blocks, team, true);
      placed += blocks.length;
    });
    const q = scheduleQualityScore();
    const snapshot = JSON.parse(JSON.stringify(S.schedule));
    if (bestScoreValue === null || q.score < bestScoreValue) {
      bestScoreValue = q.score;
      candidates = [{ schedule: snapshot, result: { placed, failed, failedList, score: q.score } }];
    } else if (q.score === bestScoreValue) {
      if (candidates.length < 25) candidates.push({ schedule: snapshot, result: { placed, failed, failedList, score: q.score } });
    }
  }
  runChunked(attempts, attempt, (done, total) => { if (onProgress) onProgress(done, total, bestScoreValue); }, () => {
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    S.schedule = chosen ? chosen.schedule : frozenSnapshot;
    save();
    onDone(chosen ? chosen.result : { placed: 0, failed: 0, failedList: [] });
  });
}

/* ------------------------------------------------------------
   KOORDİNATÖRLÜK (İŞLETME) — Madde 88: aynı gün en fazla 8 saat
   ek ders, o gün ayrıca okul dersi eklenmez. Bu yüzden bir
   öğretmene koordinatörlük verilen gün tamamen bloklanır; sadece
   ortadaki 8 saat (KOORD_START_HOUR..+8) ücretli (paid) sayılır.
   ------------------------------------------------------------ */

function addIsletme(groupKey, name) {
  name = (name || "").trim();
  if (!name) return;
  const existing = S.isletmeler.find(i => i.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    if (!existing.groups.includes(groupKey)) existing.groups.push(groupKey);
  } else {
    S.isletmeler.push({ id: uid("isletme"), name, groups: [groupKey] });
  }
  save(); renderMain();
}
function removeIsletmeGroup(id, groupKey) {
  const isl = isletmeById(id);
  if (!isl) return;
  isl.groups = isl.groups.filter(g => g !== groupKey);
  if (isl.groups.length === 0) {
    S.isletmeler = S.isletmeler.filter(i => i.id !== id);
    delete S.isletmeTeacherAssign[id];
  }
  save(); renderMain();
}
function setIsletmeTeacher(isletmeId, teacherId) {
  if (teacherId) S.isletmeTeacherAssign[isletmeId] = teacherId;
  else delete S.isletmeTeacherAssign[isletmeId];
  save(); renderMain();
}
function isTeacherFullyFreeOnDay(teacherId, day) {
  for (let h = 0; h < S.hoursPerDay; h++) {
    if (isTeacherOffAt(teacherId, day, h)) return false;
    for (const key in S.schedule) {
      const cell = S.schedule[key];
      if (cell.day === day && cell.hour === h && cell.teacherIds.includes(teacherId)) return false;
    }
  }
  return true;
}
function isletmeHoursEstimate(isl) {
  return isl.groups.length === 2 ? "8 (birleşik) – 16 (ayrı)" : (KOORD_BLOCK_LEN + " saat");
}
function placeCoordinatorTasks() {
  const failed = [];
  let tasks = [];
  S.isletmeler.forEach(isl => {
    const shared = isl.groups.length === 2;
    if (shared && Math.random() < 0.5) {
      tasks.push({ isl, allowedDays: [2], label: "ortak (Çarşamba)" });
    } else {
      isl.groups.forEach(g => {
        const days = shared ? GROUP_DAYS[g].filter(d => d !== 2) : GROUP_DAYS[g];
        tasks.push({ isl, allowedDays: days, label: GROUP_LABELS[g] });
      });
    }
  });
  const buckets = {};
  tasks.forEach(t => {
    const key = (S.isletmeTeacherAssign[t.isl.id] ? 0 : 1) * 10 + t.allowedDays.length;
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(t);
  });
  tasks = Object.keys(buckets).map(Number).sort((a, b) => a - b).reduce((acc, k) => acc.concat(shuffle(buckets[k])), []);
  tasks.forEach(task => {
    const isl = task.isl;
    const fixedTeacherId = S.isletmeTeacherAssign[isl.id];
    const pool = fixedTeacherId ? [fixedTeacherId] : S.teachers.filter(t => t.coordEligible !== false).map(t => t.id);
    let placed = false;
    for (const day of task.allowedDays) {
      const candidates = pool.filter(tid => isTeacherFullyFreeOnDay(tid, day));
      if (candidates.length === 0) continue;
      candidates.sort((a, b) => teacherLoad(a) - teacherLoad(b));
      const chosen = candidates[0];
      const classId = "isletme-" + isl.id;
      if (!classById(classId)) {
        S.classes.push({ id: classId, name: isl.name, grade: 0, dal: "KOORD", excludeFromDistribution: true, maxTeachersPerCourse: 1, assignments: [] });
      }
      for (let h = 0; h < S.hoursPerDay; h++) {
        const paid = (h >= KOORD_START_HOUR && h < KOORD_START_HOUR + KOORD_BLOCK_LEN);
        S.schedule[scheduleKey(classId, day, h)] = {
          day, hour: h, classId, assignmentId: isl.id + "-" + task.label, courseId: KOORD_COURSE_ID,
          teacherIds: [chosen], roomIds: [], locked: true, isletme: isl.name, paid
        };
      }
      placed = true;
      break;
    }
    if (!placed) failed.push(isl.name + " (" + task.label + ")");
  });
  return failed;
}
function teacherCoordHours(teacherId) {
  return Object.values(S.schedule).filter(c => c.courseId === KOORD_COURSE_ID && c.paid && c.teacherIds.includes(teacherId)).length;
}

function teacherWeeklySchedule(teacherId) {
  const grid = {};
  Object.values(S.schedule).forEach(cell => {
    if (cell.teacherIds.includes(teacherId)) {
      grid[cell.day + "_" + cell.hour] = cell;
    }
  });
  return grid;
}
function teacherTotalHours(teacherId) {
  return Object.values(S.schedule).filter(c => c.teacherIds.includes(teacherId) && (c.courseId !== KOORD_COURSE_ID || c.paid)).length;
}
