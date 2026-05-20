/**
 * ═══════════════════════════════════════════════════════════
 * LessonService.gs — 레슨 기록 비즈니스 로직
 * ═══════════════════════════════════════════════════════════
 * Agent: 🎻 Domain Expert + 🧪 QA
 * 하네스: 유효성 검증 → 저장 → 곡 상태 → 스킬갭 → 알림 파이프라인
 */

var LessonService = {

  // ── 레슨 저장 (전체 파이프라인) ──
  save(data) {
    return DB.withLock(function() {
      // 1) 유효성 검증
      var validated = LessonService.validate(data);

      // 2) 학생 이름/곡 제목 비정규화 (🗄 조인 회피)
      var student = DB.findById(SHEET.STUDENTS, 'student_id', validated.student_id);
      if (!student) throw new Error('학생 ID를 찾을 수 없습니다: ' + validated.student_id);
      validated.student_name = student.name;

      var piece = DB.findById(SHEET.CURRICULUM, 'piece_id', validated.piece_id);
      if (piece) validated.piece_title = piece.title;

      // 3) 레슨 번호 자동 계산
      var prevLessons = DB.findBy(SHEET.LESSONS, { student_id: validated.student_id });
      validated.lesson_num = prevLessons.length + 1;

      // 4) 평균 점수 계산
      var scoreSum = parseInt(validated.sc_posture) + parseInt(validated.sc_intonation) +
                     parseInt(validated.sc_rhythm) + parseInt(validated.sc_tone) +
                     parseInt(validated.sc_bow) + parseInt(validated.sc_musicality);
      validated.avg_score = (scoreSum / 6).toFixed(1);

      // 5) lesson_id 생성
      validated.lesson_id = 'L-' + validated.date + '-' + String(validated.lesson_num).padStart(3, '0');

      // 6) 배열 → 파이프 구분 문자열
      if (Array.isArray(validated.focus_tags)) validated.focus_tags = validated.focus_tags.join('|');
      if (Array.isArray(validated.corrections)) validated.corrections = validated.corrections.join('|');

      // 7) 레슨 기록 저장
      var lessonId = DB.append(SHEET.LESSONS, validated);

      // 8) 연습 과제 저장
      if (data.assignment) {
        data.assignment.assign_id = Utilities.getUuid().substr(0, 8);
        data.assignment.lesson_id = lessonId;
        data.assignment.student_id = validated.student_id;
        data.assignment.assigned_date = validated.date;
        // JSON 문자열 변환
        if (typeof data.assignment.review_pieces === 'object') {
          data.assignment.review_pieces = JSON.stringify(data.assignment.review_pieces);
        }
        if (typeof data.assignment.current_piece_sections === 'object') {
          data.assignment.current_piece_sections = JSON.stringify(data.assignment.current_piece_sections);
        }
        DB.append(SHEET.ASSIGNMENTS, data.assignment);
      }

      // 9) 곡 완료 처리
      if (validated.piece_status === PIECE_STATUS.COMPLETED) {
        LessonService._handlePieceCompletion(validated, student);
      }

      // 10) 스킬 갭 감지
      var gaps = ProgressService.detectSkillGaps(validated);

      // 11) 알림 발송 (비동기 — 실패해도 레슨 저장에 영향 없음)
      try { NotificationService.sendLessonSummary(validated); } catch(e) { Logger.log('Lesson summary email failed: ' + e.message); }
      if (gaps.length > 0) {
        try { NotificationService.sendSkillGapAlert(student, gaps); } catch(e) { Logger.log('Skill gap alert failed: ' + e.message); }
      }

      // 12) 감사 로그
      DB.log(Auth.getTeacherEmail(), 'LESSON_SAVE', { lesson_id: lessonId, student: student.name, piece: validated.piece_id });

      return { 
        success: true, 
        lessonId: lessonId, 
        lessonNum: validated.lesson_num,
        avgScore: validated.avg_score,
        skillGaps: gaps
      };
    });
  },

  // ── 유효성 검증 (🧪 QA 설계) ──
  validate(data) {
    var errors = [];

    if (!data.student_id) errors.push('학생을 선택하세요');
    if (!data.date) errors.push('날짜를 입력하세요');
    if (!data.piece_id) errors.push('곡을 선택하세요');

    var scoreFields = ['sc_posture','sc_intonation','sc_rhythm','sc_tone','sc_bow','sc_musicality'];
    scoreFields.forEach(function(f) {
      var v = parseInt(data[f]);
      if (isNaN(v) || v < 1 || v > 5) errors.push(f + ': 1~5 범위 필수');
    });

    if (!data.piece_status) data.piece_status = PIECE_STATUS.IN_PROGRESS;

    if (errors.length > 0) throw new Error(errors.join(', '));

    return data;
  },

  // ── 곡 완료 처리 ──
  _handlePieceCompletion(lesson, student) {
    // 성취 기록
    DB.append(SHEET.ACHIEVEMENTS, {
      student_id: lesson.student_id,
      type: ACHIEVEMENT_TYPES.PIECE_MASTER,
      title: '곡 완료: ' + (lesson.piece_title || lesson.piece_id),
      description: '평균 ' + lesson.avg_score,
      achieved_date: lesson.date,
      metadata: JSON.stringify({ piece_id: lesson.piece_id, avg: lesson.avg_score }),
      notified: false
    });

    // 다음 곡으로 학생 업데이트
    var curriculum = DB.readAll(SHEET.CURRICULUM);
    var currentIdx = -1;
    for (var i = 0; i < curriculum.length; i++) {
      if (String(curriculum[i].piece_id) === String(lesson.piece_id)) { currentIdx = i; break; }
    }

    if (currentIdx >= 0 && currentIdx < curriculum.length - 1) {
      var nextPiece = curriculum[currentIdx + 1];
      
      // 같은 Book 내 다음 곡
      if (parseInt(nextPiece.book) === parseInt(student.current_book)) {
        DB.update(SHEET.STUDENTS, lesson.student_id, { current_piece_id: nextPiece.piece_id });
      } else {
        // Book 졸업 체크
        if (parseFloat(lesson.avg_score) >= PROMOTION.BOOK_GRADUATION_AVG) {
          DB.append(SHEET.ACHIEVEMENTS, {
            student_id: lesson.student_id,
            type: ACHIEVEMENT_TYPES.BOOK_GRAD,
            title: 'Book ' + student.current_book + ' 졸업!',
            description: '졸업곡 평균 ' + lesson.avg_score,
            achieved_date: lesson.date,
            metadata: JSON.stringify({ book: student.current_book }),
            notified: false
          });
          DB.update(SHEET.STUDENTS, lesson.student_id, {
            current_book: parseInt(student.current_book) + 1,
            current_piece_id: nextPiece.piece_id
          });
        }
      }
    }
  },

  // ── 학생의 최근 레슨 조회 ──
  getRecentLessons(studentId, count) {
    if (!count) count = 20;
    var lessons = DB.findBy(SHEET.LESSONS, { student_id: studentId });
    lessons.sort(function(a, b) {
      return new Date(b.date) - new Date(a.date);
    });
    return lessons.slice(0, count);
  },

  // ── 레슨 수정 ──
  updateLesson(lessonId, updates) {
    return DB.withLock(function() {
      // 점수 재계산
      if (updates.sc_posture || updates.sc_intonation || updates.sc_rhythm ||
          updates.sc_tone || updates.sc_bow || updates.sc_musicality) {
        var existing = DB.findById(SHEET.LESSONS, 'lesson_id', lessonId);
        var merged = {};
        RUBRIC_CATEGORIES.forEach(function(cat) {
          merged[cat.col] = parseInt(updates[cat.col] || existing[cat.col]);
        });
        var sum = Object.values(merged).reduce(function(a, b) { return a + b; }, 0);
        updates.avg_score = (sum / 6).toFixed(1);
      }
      DB.update(SHEET.LESSONS, lessonId, updates);
      DB.log(Auth.getTeacherEmail(), 'LESSON_UPDATE', { lesson_id: lessonId, updates: updates });
      return { success: true };
    });
  }
};
