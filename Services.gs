/**
 * ═══════════════════════════════════════════════════════════
 * NotificationService.gs — 이메일 알림
 * ═══════════════════════════════════════════════════════════
 * Agent: 🎨 UX (이메일 템플릿) + 🔒 Security (발신 검증)
 */

var NotificationService = {
  // ── 레슨 요약 이메일 → 학부모 ──
  sendLessonSummary(lesson) {
    try {
      var student = DB.findById(SHEET.STUDENTS, 'student_id', lesson.student_id);
      if (!student || !student.parent_email) return;

      var piece = DB.findById(SHEET.CURRICULUM, 'piece_id', lesson.piece_id);
      var pieceName = piece ? piece.title : lesson.piece_id;

      var subject = '🎻 [레슨 요약] ' + student.name + ' — ' + pieceName;
      var scores = [
        '자세: ' + lesson.sc_posture + '/5',
        '음정: ' + lesson.sc_intonation + '/5',
        '리듬: ' + lesson.sc_rhythm + '/5',
        '톤: ' + lesson.sc_tone + '/5',
        '활: ' + lesson.sc_bow + '/5',
        '음악성: ' + lesson.sc_musicality + '/5'
      ].join(' | ');

      var body = [
        '안녕하세요, ' + student.name + ' 학부모님.',
        '',
        '오늘 레슨 요약입니다.',
        '',
        '📅 날짜: ' + lesson.date,
        '🎼 진행곡: ' + pieceName,
        '📊 평균 점수: ' + lesson.avg_score + '/5',
        '',
        scores,
        '',
        lesson.teacher_comment ? '💬 교사 코멘트: ' + lesson.teacher_comment : '',
        '',
        '감사합니다.'
      ].join('\n');

      GmailApp.sendEmail(student.parent_email, subject, body);
      DB.log('SYSTEM', 'EMAIL_SENT', 'lesson_summary to ' + student.parent_email);
    } catch(e) {
      Logger.log('Email send failed: ' + e.message);
    }
  },

  // ── 스킬 갭 알림 → 교사 ──
  sendSkillGapAlert(student, gaps) {
    if (!gaps || gaps.length === 0) return;
    try {
      var teacherEmail = student.teacher_email || Auth.getTeacherEmail();
      if (!teacherEmail) return;

      var gapText = gaps.map(function(g) {
        return '⚠ ' + g.category + ' (' + g.score + '/5) → 복습 권장: ' + g.remedialPieces.join(', ');
      }).join('\n');

      var subject = '⚠ [스킬 갭] ' + student.name;
      var body = student.name + ' 학생의 스킬 갭이 감지되었습니다.\n\n' + gapText;

      GmailApp.sendEmail(teacherEmail, subject, body);
    } catch(e) {
      Logger.log('Skill gap alert failed: ' + e.message);
    }
  },

  // ── 연습 리마인더 → 학부모 (일일) ──
  sendPracticeReminder() {
    var students = DB.readAll(SHEET.STUDENTS).filter(function(s) { return s.status === 'active'; });
    students.forEach(function(student) {
      if (!student.parent_email) return;
      try {
        var assigns = DB.findBy(SHEET.ASSIGNMENTS, { student_id: student.student_id });
        if (assigns.length === 0) return;
        
        var latest = assigns.sort(function(a,b) { return new Date(b.assigned_date) - new Date(a.assigned_date); })[0];
        var todayStr = new Date().toISOString().split('T')[0];
        var todayLogs = DB.findBy(SHEET.PRACTICE_LOG, { assign_id: latest.assign_id, log_date: todayStr });
        
        if (todayLogs.length === 0) {
          GmailApp.sendEmail(
            student.parent_email,
            '🎻 [연습 리마인더] ' + student.name,
            student.name + '의 오늘 연습이 아직 기록되지 않았어요!\n목표: ' + (latest.daily_minutes || 20) + '분, ' + (latest.daily_reps || 5) + '회 반복'
          );
        }
      } catch(e) {}
    });
  }
};


/**
 * ═══════════════════════════════════════════════════════════
 * Triggers.gs — 시간 기반 트리거
 * ═══════════════════════════════════════════════════════════
 * Agent: 🏗 Architect (6분 제한 관리)
 */

// ── 트리거 등록 (1회 실행) ──
function setupTriggers() {
  // 기존 트리거 삭제
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(t) { ScriptApp.deleteTrigger(t); });

  // 주간 스냅샷: 매주 일요일 오전 2시
  ScriptApp.newTrigger('triggerWeeklySnapshot')
    .timeBased().onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(2).create();

  // 월간 스냅샷: 매월 1일 오전 3시
  ScriptApp.newTrigger('triggerMonthlySnapshot')
    .timeBased().onMonthDay(1).atHour(3).create();

  // 연습 리마인더: 매일 오후 6시
  ScriptApp.newTrigger('triggerPracticeReminder')
    .timeBased().everyDays(1).atHour(18).create();

  Logger.log('트리거 설정 완료');
}

function triggerWeeklySnapshot() {
  try {
    ProgressService.generateWeeklySnapshots();
  } catch(e) {
    Logger.log('Weekly snapshot failed: ' + e.message);
  }
}

function triggerMonthlySnapshot() {
  try {
    ProgressService.generateMonthlySnapshots();
  } catch(e) {
    Logger.log('Monthly snapshot failed: ' + e.message);
  }
}

function triggerPracticeReminder() {
  try {
    NotificationService.sendPracticeReminder();
  } catch(e) {
    Logger.log('Practice reminder failed: ' + e.message);
  }
}


/**
 * ═══════════════════════════════════════════════════════════
 * Setup.gs — 초기 설정 (최초 1회 실행)
 * ═══════════════════════════════════════════════════════════
 * Agent: 🗄 Data Engineer
 * 실행 방법: Apps Script 에디터에서 initialSetup() 직접 실행
 */

function initialSetup() {
  // 1) 새 스프레드시트 생성 또는 기존 사용
  var ss;
  var existingId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  
  if (existingId) {
    try {
      ss = SpreadsheetApp.openById(existingId);
      Logger.log('기존 스프레드시트 사용: ' + ss.getUrl());
    } catch(e) {
      ss = SpreadsheetApp.create('🎻 스즈키 레슨 시스템');
      PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
    }
  } else {
    ss = SpreadsheetApp.create('🎻 스즈키 레슨 시스템');
    PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  }

  Logger.log('스프레드시트 URL: ' + ss.getUrl());

  // 2) 시트 생성 + 헤더 설정
  Object.keys(HEADERS).forEach(function(name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    // 헤더 설정 (첫 행이 비어있을 때만)
    if (sheet.getLastRow() === 0 || (sheet.getLastRow() === 1 && sheet.getRange(1,1).getValue() === '')) {
      sheet.getRange(1, 1, 1, HEADERS[name].length).setValues([HEADERS[name]]);
      sheet.getRange(1, 1, 1, HEADERS[name].length)
        .setFontWeight('bold')
        .setBackground('#e8f0fe');
      sheet.setFrozenRows(1);
    }
  });

  // 기본 Sheet1 삭제
  try {
    var sheet1 = ss.getSheetByName('Sheet1') || ss.getSheetByName('시트1');
    if (sheet1 && ss.getSheets().length > 1) ss.deleteSheet(sheet1);
  } catch(e) {}

  // 3) CONFIG 초기 데이터
  var configSheet = ss.getSheetByName(SHEET.CONFIG);
  if (configSheet.getLastRow() <= 1) {
    var teacherEmail = Session.getActiveUser().getEmail();
    var configs = [
      ['TEACHER_EMAIL', teacherEmail, '교사 이메일 (Google OAuth)'],
      ['PIN_SALT', Auth.SALT, 'PIN 해시용 솔트'],
      ['STUDIO_NAME', '스즈키 바이올린 스튜디오', '스튜디오 이름'],
      ['CURRICULUM_VERSION', '1.0', '커리큘럼 버전']
    ];
    configs.forEach(function(row) { configSheet.appendRow(row); });
  }

  // 3.5) ID 컬럼을 텍스트 포맷으로 설정 (숫자 자동변환 방지)
  var textFormatSheets = [
    { name: SHEET.CURRICULUM, cols: [1] },         // piece_id
    { name: SHEET.SKILLS,     cols: [1, 5] },      // tag, first_piece_id
    { name: SHEET.STUDENTS,   cols: [1, 9] },      // student_id, current_piece_id
    { name: SHEET.LESSONS,    cols: [1, 2, 6] },   // lesson_id, student_id, piece_id
    { name: SHEET.ASSIGNMENTS, cols: [1, 2, 3] },  // assign_id, lesson_id, student_id
    { name: SHEET.PRACTICE_LOG, cols: [1, 2, 3] }, // log_id, assign_id, student_id
    { name: SHEET.SNAPSHOTS,  cols: [1, 2] },      // snap_id, student_id
    { name: SHEET.ACHIEVEMENTS, cols: [1, 2] }     // achieve_id, student_id
  ];
  textFormatSheets.forEach(function(item) {
    var sh = ss.getSheetByName(item.name);
    if (sh) {
      item.cols.forEach(function(col) {
        sh.getRange(1, col, sh.getMaxRows(), 1).setNumberFormat('@');
      });
    }
  });
  Logger.log('ID 컬럼 텍스트 포맷 설정 완료');

  // 4) CURRICULUM 초기 데이터
  var currSheet = ss.getSheetByName(SHEET.CURRICULUM);
  if (currSheet.getLastRow() <= 1) {
    var currData = CURRICULUM_BOOK1.map(function(piece) {
      return HEADERS.CURRICULUM.map(function(h) { return piece[h] !== undefined ? String(piece[h]) : ''; });
    });
    if (currData.length > 0) {
      currSheet.getRange(2, 1, currData.length, currData[0].length).setValues(currData);
    }
    Logger.log('Book 1 커리큘럼 (' + CURRICULUM_BOOK1.length + '곡) 로드 완료');
  }

  // 5) SKILLS 초기 데이터
  var skillSheet = ss.getSheetByName(SHEET.SKILLS);
  if (skillSheet.getLastRow() <= 1) {
    var skillData = SKILLS_DATA.map(function(skill) {
      return HEADERS.SKILLS.map(function(h) { return skill[h] !== undefined ? String(skill[h]) : ''; });
    });
    if (skillData.length > 0) {
      skillSheet.getRange(2, 1, skillData.length, skillData[0].length).setValues(skillData);
    }
    Logger.log('스킬 데이터 (' + SKILLS_DATA.length + '개) 로드 완료');
  }

  // 6) 테스트 학생 데이터 (🧪 QA)
  var studSheet = ss.getSheetByName(SHEET.STUDENTS);
  if (studSheet.getLastRow() <= 1) {
    var testStudents = [
      { student_id: 'STU001', name: '김지우', age_group: '8-10', teacher_email: Session.getActiveUser().getEmail(), parent_email: '', parent_pin_hash: Auth.hashPin('1234'), start_date: '2025-09-01', current_book: 1, current_piece_id: '1.13', lesson_day: 3, lesson_time: '14:00', status: 'active' },
      { student_id: 'STU002', name: '박서연', age_group: '6-8', teacher_email: Session.getActiveUser().getEmail(), parent_email: '', parent_pin_hash: Auth.hashPin('5678'), start_date: '2025-10-15', current_book: 1, current_piece_id: '1.08', lesson_day: 3, lesson_time: '15:00', status: 'active' },
      { student_id: 'STU003', name: '이하준', age_group: '10-12', teacher_email: Session.getActiveUser().getEmail(), parent_email: '', parent_pin_hash: Auth.hashPin('0000'), start_date: '2025-06-01', current_book: 1, current_piece_id: '1.17', lesson_day: 4, lesson_time: '16:00', status: 'active' }
    ];
    testStudents.forEach(function(s) {
      s.created_at = new Date().toISOString();
      var row = HEADERS.STUDENTS.map(function(h) {
        var val = s[h];
        return val !== undefined && val !== null ? String(val) : '';
      });
      studSheet.appendRow(row);
    });
    Logger.log('테스트 학생 3명 생성 완료 (PIN: 김지우=1234, 박서연=5678, 이하준=0000)');
  }

  // 7) 트리거 설정
  setupTriggers();

  Logger.log('===== 초기 설정 완료 =====');
  Logger.log('스프레드시트: ' + ss.getUrl());
  Logger.log('Web App 배포 후 사용 가능');
}
