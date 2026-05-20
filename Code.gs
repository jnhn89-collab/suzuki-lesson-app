/**
 * ═══════════════════════════════════════════════════════════
 * Code.gs — 메인 라우터 & API 엔드포인트
 * ═══════════════════════════════════════════════════════════
 * Agent: 🏗 Architect
 * 하네스: doGet()은 역할별 HTML 분기, API는 google.script.run 경유
 * 
 * ★ 사용법 ★
 * 1. initialSetup() 실행 (최초 1회)
 * 2. 배포 > 새 배포 > 웹 앱 > '나' + '모든 사용자' 선택
 * 3. URL 접속:
 *    - 교사: {URL}?role=teacher
 *    - 학부모: {URL}?role=parent
 *    - 학생: {URL}?role=student
 */

function doGet(e) {
  var role = (e && e.parameter && e.parameter.role) ? e.parameter.role : 'teacher';
  
  var htmlFile;
  switch(role) {
    case 'parent':  htmlFile = 'ParentApp';  break;
    case 'student': htmlFile = 'StudentApp'; break;
    default:        htmlFile = 'TeacherApp'; break;
  }

  return HtmlService.createTemplateFromFile(htmlFile)
    .evaluate()
    .setTitle('🎻 스즈키 레슨 시스템')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ═══════════════════════════════════════════════
// 교사 API
// ═══════════════════════════════════════════════

function api_getStudents() {
  return DB.readAll(SHEET.STUDENTS).filter(function(s) { return s.status === 'active'; });
}

function api_getCurriculum() {
  return DB.readAll(SHEET.CURRICULUM);
}

function api_getSkills() {
  return DB.readAll(SHEET.SKILLS);
}

function api_getStudentProgress(studentId) {
  return ProgressService.getStudentProgress(studentId);
}

function api_saveLessonRecord(data) {
  try {
    return LessonService.save(data);
  } catch(e) {
    return { success: false, error: e.message };
  }
}

function api_updateLesson(lessonId, updates) {
  try {
    return LessonService.updateLesson(lessonId, updates);
  } catch(e) {
    return { success: false, error: e.message };
  }
}

function api_getRecentLessons(studentId) {
  return LessonService.getRecentLessons(studentId, 20);
}

function api_addStudent(data) {
  return DB.withLock(function() {
    data.student_id = 'STU' + String(Date.now()).substr(-6);
    data.parent_pin_hash = Auth.hashPin(data.pin || '1234');
    data.status = 'active';
    data.current_book = data.current_book || 1;
    data.current_piece_id = data.current_piece_id || '1.01';
    data.teacher_email = Auth.getTeacherEmail();
    delete data.pin;
    var id = DB.append(SHEET.STUDENTS, data);
    DB.log(Auth.getTeacherEmail(), 'STUDENT_ADD', data.name);
    return { success: true, student_id: id };
  });
}

function api_getFocusTags() { return FOCUS_TAGS; }
function api_getCorrectionPresets() { return CORRECTION_PRESETS; }
function api_getRubricCategories() { return RUBRIC_CATEGORIES; }

// ═══════════════════════════════════════════════
// 학부모 API
// ═══════════════════════════════════════════════

function api_parentLogin(studentId, pin) {
  return Auth.verifyParentPin(studentId, pin);
}

function api_parentGetStudents() {
  // 학부모는 student_id 목록만 (이름 포함)
  return DB.readAll(SHEET.STUDENTS)
    .filter(function(s) { return s.status === 'active'; })
    .map(function(s) { return { student_id: s.student_id, name: s.name }; });
}

function api_parentGetProgress(token) {
  var session = Auth.verifySession(token);
  if (!session) return { error: 'SESSION_EXPIRED' };
  return ProgressService.getStudentProgress(session.studentId);
}

function api_parentGetAssignment(token) {
  var session = Auth.verifySession(token);
  if (!session) return { error: 'SESSION_EXPIRED' };
  
  var assigns = DB.findBy(SHEET.ASSIGNMENTS, { student_id: session.studentId });
  assigns.sort(function(a,b) { return new Date(b.assigned_date) - new Date(a.assigned_date); });
  return assigns[0] || null;
}

function api_parentGetLessons(token) {
  var session = Auth.verifySession(token);
  if (!session) return { error: 'SESSION_EXPIRED' };
  return LessonService.getRecentLessons(session.studentId, 10);
}

// ═══════════════════════════════════════════════
// 학생 API
// ═══════════════════════════════════════════════

function api_studentLogin(studentId, pin) {
  return Auth.verifyParentPin(studentId, pin); // 같은 PIN 사용
}

function api_studentGetAssignment(token) {
  return api_parentGetAssignment(token);
}

function api_studentLogPractice(token, logData) {
  var session = Auth.verifySession(token);
  if (!session) return { error: 'SESSION_EXPIRED' };
  
  return DB.withLock(function() {
    logData.student_id = session.studentId;
    logData.log_date = logData.log_date || new Date().toISOString().split('T')[0];
    var id = DB.append(SHEET.PRACTICE_LOG, logData);

    // 연속 연습 스트릭 체크
    var logs = DB.findBy(SHEET.PRACTICE_LOG, { student_id: session.studentId });
    var streak = _calculateStreak(logs);
    if (streak >= 7 && streak % 7 === 0) {
      DB.append(SHEET.ACHIEVEMENTS, {
        student_id: session.studentId,
        type: ACHIEVEMENT_TYPES.STREAK,
        title: streak + '일 연속 연습!',
        description: '대단해요! ' + streak + '일 연속으로 연습했어요.',
        achieved_date: logData.log_date,
        metadata: JSON.stringify({ days: streak }),
        notified: false
      });
    }

    return { success: true, logId: id, streak: streak };
  });
}

function api_studentGetReview(token) {
  var session = Auth.verifySession(token);
  if (!session) return { error: 'SESSION_EXPIRED' };
  return ProgressService.getReviewRecommendations(session.studentId, 3);
}

function api_studentGetAchievements(token) {
  var session = Auth.verifySession(token);
  if (!session) return { error: 'SESSION_EXPIRED' };
  return DB.findBy(SHEET.ACHIEVEMENTS, { student_id: session.studentId });
}

// ═══════════════════════════════════════════════
// 진단 도구 (에디터에서 직접 실행)
// ═══════════════════════════════════════════════

function diagnose() {
  var results = [];

  // 1) SPREADSHEET_ID 확인
  var ssId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  results.push('1. SPREADSHEET_ID: ' + (ssId ? '✅ ' + ssId : '❌ 설정 안 됨 → initialSetup() 실행 필요'));

  if (!ssId) {
    Logger.log(results.join('\n'));
    return results.join('\n');
  }

  // 2) 스프레드시트 접근 확인
  try {
    var ss = SpreadsheetApp.openById(ssId);
    results.push('2. 스프레드시트 접근: ✅ ' + ss.getName());
    results.push('   URL: ' + ss.getUrl());
  } catch(e) {
    results.push('2. 스프레드시트 접근: ❌ ' + e.message);
    Logger.log(results.join('\n'));
    return results.join('\n');
  }

  // 3) 시트 존재 여부
  var requiredSheets = Object.values(SHEET);
  requiredSheets.forEach(function(name) {
    var sheet = ss.getSheetByName(name);
    if (sheet) {
      results.push('3. 시트 [' + name + ']: ✅ 행=' + sheet.getLastRow() + ', 열=' + sheet.getLastColumn());
    } else {
      results.push('3. 시트 [' + name + ']: ❌ 없음');
    }
  });

  // 4) STUDENTS 데이터 확인
  try {
    var students = DB.readAll(SHEET.STUDENTS, false);
    results.push('4. 전체 학생 수: ' + students.length);
    var active = students.filter(function(s) { return s.status === 'active'; });
    results.push('   활성 학생 수: ' + active.length);
    students.forEach(function(s, i) {
      results.push('   [' + i + '] id=' + s.student_id + ', name=' + s.name + ', status="' + s.status + '", book=' + s.current_book + ', piece=' + s.current_piece_id);
    });
  } catch(e) {
    results.push('4. STUDENTS 읽기 실패: ' + e.message);
  }

  // 5) CURRICULUM 데이터 확인
  try {
    var curriculum = DB.readAll(SHEET.CURRICULUM, false);
    results.push('5. 커리큘럼 곡 수: ' + curriculum.length);
    if (curriculum.length > 0) {
      results.push('   첫 곡: ' + curriculum[0].piece_id + ' ' + curriculum[0].title + ' (타입: ' + typeof curriculum[0].piece_id + ')');
    }
  } catch(e) {
    results.push('5. CURRICULUM 읽기 실패: ' + e.message);
  }

  // 6) 교사 이메일
  results.push('6. 현재 사용자: ' + Session.getActiveUser().getEmail());
  results.push('   유효 사용자: ' + Session.getEffectiveUser().getEmail());

  // 7) api_getStudents 테스트
  try {
    var apiResult = api_getStudents();
    results.push('7. api_getStudents(): ✅ 반환 ' + apiResult.length + '명');
  } catch(e) {
    results.push('7. api_getStudents(): ❌ ' + e.message);
  }

  var output = results.join('\n');
  Logger.log(output);
  return output;
}

// ── 헬퍼: 연속 연습 스트릭 계산 ──
function _calculateStreak(logs) {
  if (logs.length === 0) return 0;
  var dates = logs.map(function(l) { return l.log_date; });
  dates = dates.filter(function(d, i, a) { return a.indexOf(d) === i; }); // 중복 제거
  dates.sort(function(a, b) { return new Date(b) - new Date(a); }); // 내림차순

  // 오늘 또는 어제 연습했는지 확인 (스트릭 유효성)
  var today = new Date().toISOString().split('T')[0];
  var yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  var streak = 1;
  for (var i = 0; i < dates.length - 1; i++) {
    var diff = Math.round((new Date(dates[i]) - new Date(dates[i + 1])) / 86400000);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}
