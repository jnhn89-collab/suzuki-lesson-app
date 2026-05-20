/**
 * ═══════════════════════════════════════════════════════════
 * ProgressService.gs — 진행 추적 & 스킬갭 감지
 * ═══════════════════════════════════════════════════════════
 * Agent: 🎻 Domain Expert + 🗄 Data Engineer
 * 하네스: 스냅샷 배치 생성, 스킬갭 자동 감지, 복습곡 추천
 */

var ProgressService = {

  // ── 스킬 갭 감지 (레슨 저장 시 실시간) ──
  detectSkillGaps(lesson) {
    var gaps = [];
    var scores = {
      posture:    parseInt(lesson.sc_posture),
      intonation: parseInt(lesson.sc_intonation),
      rhythm:     parseInt(lesson.sc_rhythm),
      tone:       parseInt(lesson.sc_tone),
      bowControl: parseInt(lesson.sc_bow),
      musicality: parseInt(lesson.sc_musicality)
    };

    var skills = DB.readAll(SHEET.SKILLS);
    var piece = DB.findById(SHEET.CURRICULUM, 'piece_id', lesson.piece_id);

    Object.keys(scores).forEach(function(cat) {
      if (scores[cat] <= 2) {
        // 해당 카테고리의 선행 기술이 처음 도입된 곡 찾기
        var catSkills = skills.filter(function(s) { return s.category === cat; });
        var remedialPieces = catSkills
          .map(function(s) { return s.first_piece_id; })
          .filter(function(p) { return p && p !== lesson.piece_id; });

        gaps.push({
          category: cat,
          score: scores[cat],
          currentPiece: lesson.piece_id,
          remedialPieces: remedialPieces.slice(0, 3),
          message: cat + ' 점수 ' + scores[cat] + '/5 → 복습 권장'
        });
      }
    });

    return gaps;
  },

  // ── 주간 스냅샷 생성 (트리거에서 호출) ──
  generateWeeklySnapshots() {
    var students = DB.readAll(SHEET.STUDENTS).filter(function(s) {
      return s.status === 'active';
    });
    var today = new Date();
    var weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);
    var todayStr = today.toISOString().split('T')[0];
    var weekStartStr = weekStart.toISOString().split('T')[0];

    students.forEach(function(student) {
      // 중복 체크
      var existing = DB.findBy(SHEET.SNAPSHOTS, {
        student_id: student.student_id,
        period_type: 'weekly',
        period_start: weekStartStr
      });
      if (existing.length > 0) return;

      var lessons = DB.findBy(SHEET.LESSONS, { student_id: student.student_id })
        .filter(function(l) {
          var d = new Date(l.date);
          return d >= weekStart && d <= today;
        });

      if (lessons.length === 0) return;

      var scoreKeys = ['sc_posture','sc_intonation','sc_rhythm','sc_tone','sc_bow','sc_musicality'];
      var avgKeys   = ['avg_posture','avg_intonation','avg_rhythm','avg_tone','avg_bow','avg_musicality'];
      var snapshot = {
        student_id: student.student_id,
        period_type: 'weekly',
        period_start: weekStartStr,
        period_end: todayStr,
        pieces_completed: lessons.filter(function(l) { return l.piece_status === 'completed'; }).length,
        lesson_count: lessons.length
      };

      var totalAvg = 0;
      scoreKeys.forEach(function(sk, i) {
        var vals = lessons.map(function(l) { return parseInt(l[sk]) || 0; });
        var avg = vals.reduce(function(a,b){ return a+b; }, 0) / vals.length;
        snapshot[avgKeys[i]] = avg.toFixed(1);
        totalAvg += avg;
      });
      snapshot.overall_avg = (totalAvg / 6).toFixed(1);

      // 연습 달성률
      var assigns = DB.findBy(SHEET.ASSIGNMENTS, { student_id: student.student_id });
      var weekAssigns = assigns.filter(function(a) {
        var d = new Date(a.assigned_date);
        return d >= weekStart && d <= today;
      });
      var logs = [];
      weekAssigns.forEach(function(a) {
        var al = DB.findBy(SHEET.PRACTICE_LOG, { assign_id: a.assign_id });
        logs = logs.concat(al);
      });
      
      var expectedLogs = weekAssigns.length * 7;
      snapshot.practice_rate = expectedLogs > 0 ? (logs.length / expectedLogs).toFixed(2) : '0.00';
      snapshot.total_minutes = logs.reduce(function(sum, l) { return sum + (parseInt(l.actual_minutes) || 0); }, 0);

      // 스킬 갭 (최근 레슨 기반)
      var allGaps = [];
      lessons.forEach(function(l) {
        var g = ProgressService.detectSkillGaps(l);
        allGaps = allGaps.concat(g);
      });
      snapshot.skill_gaps = JSON.stringify(allGaps);

      DB.append(SHEET.SNAPSHOTS, snapshot);
    });

    DB.log('SYSTEM', 'WEEKLY_SNAPSHOTS', 'Generated for ' + students.length + ' students');
  },

  // ── 월간 스냅샷 생성 ──
  generateMonthlySnapshots() {
    var students = DB.readAll(SHEET.STUDENTS).filter(function(s) {
      return s.status === 'active';
    });
    var today = new Date();
    var monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    var monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    students.forEach(function(student) {
      var monthStartStr = monthStart.toISOString().split('T')[0];
      var existing = DB.findBy(SHEET.SNAPSHOTS, {
        student_id: student.student_id,
        period_type: 'monthly',
        period_start: monthStartStr
      });
      if (existing.length > 0) return;

      // 주간 스냅샷에서 집계
      var weeklySnaps = DB.findBy(SHEET.SNAPSHOTS, {
        student_id: student.student_id,
        period_type: 'weekly'
      }).filter(function(s) {
        var d = new Date(s.period_start);
        return d >= monthStart && d <= monthEnd;
      });

      if (weeklySnaps.length === 0) return;

      var avgKeys = ['avg_posture','avg_intonation','avg_rhythm','avg_tone','avg_bow','avg_musicality'];
      var snapshot = {
        student_id: student.student_id,
        period_type: 'monthly',
        period_start: monthStartStr,
        period_end: monthEnd.toISOString().split('T')[0],
        pieces_completed: weeklySnaps.reduce(function(s,w){ return s + (parseInt(w.pieces_completed)||0); }, 0),
        lesson_count: weeklySnaps.reduce(function(s,w){ return s + (parseInt(w.lesson_count)||0); }, 0),
        total_minutes: weeklySnaps.reduce(function(s,w){ return s + (parseInt(w.total_minutes)||0); }, 0)
      };

      var totalAvg = 0;
      avgKeys.forEach(function(ak) {
        var vals = weeklySnaps.map(function(w) { return parseFloat(w[ak]) || 0; });
        var avg = vals.reduce(function(a,b){ return a+b; }, 0) / vals.length;
        snapshot[ak] = avg.toFixed(1);
        totalAvg += avg;
      });
      snapshot.overall_avg = (totalAvg / 6).toFixed(1);

      var rates = weeklySnaps.map(function(w){ return parseFloat(w.practice_rate) || 0; });
      snapshot.practice_rate = (rates.reduce(function(a,b){ return a+b; }, 0) / rates.length).toFixed(2);
      snapshot.skill_gaps = '[]';

      DB.append(SHEET.SNAPSHOTS, snapshot);
    });

    DB.log('SYSTEM', 'MONTHLY_SNAPSHOTS', 'Generated');
  },

  // ── 학생 진행 현황 조회 (대시보드용) ──
  getStudentProgress(studentId) {
    var student = DB.findById(SHEET.STUDENTS, 'student_id', studentId);
    if (!student) return null;

    var lessons = LessonService.getRecentLessons(studentId, 50);
    var achievements = DB.findBy(SHEET.ACHIEVEMENTS, { student_id: studentId });
    var snapshots = DB.findBy(SHEET.SNAPSHOTS, { student_id: studentId });

    // 현재 Book 진행률
    var curriculum = DB.readAll(SHEET.CURRICULUM);
    var bookPieces = curriculum.filter(function(p) { return parseInt(p.book) === parseInt(student.current_book); });
    var completedPieces = lessons.filter(function(l) { return l.piece_status === 'completed'; });
    var completedIds = {};
    completedPieces.forEach(function(l) { completedIds[l.piece_id] = true; });
    var bookCompleted = bookPieces.filter(function(p) { return completedIds[p.piece_id]; }).length;

    // 최근 4회 레슨 점수
    var recentScores = lessons.slice(0, 4).map(function(l) {
      return {
        date: l.date,
        piece: l.piece_title || l.piece_id,
        scores: {
          posture: parseInt(l.sc_posture),
          intonation: parseInt(l.sc_intonation),
          rhythm: parseInt(l.sc_rhythm),
          tone: parseInt(l.sc_tone),
          bow: parseInt(l.sc_bow),
          musicality: parseInt(l.sc_musicality)
        },
        avg: parseFloat(l.avg_score)
      };
    });

    // 주간 스냅샷 (최근 4주)
    var weeklySnaps = snapshots
      .filter(function(s) { return s.period_type === 'weekly'; })
      .sort(function(a, b) { return new Date(b.period_start) - new Date(a.period_start); })
      .slice(0, 4);

    return {
      student: student,
      bookProgress: { total: bookPieces.length, completed: bookCompleted, percent: bookPieces.length > 0 ? Math.round(bookCompleted / bookPieces.length * 100) : 0 },
      recentScores: recentScores,
      weeklyTrend: weeklySnaps,
      achievements: achievements,
      totalLessons: lessons.length,
      currentPiece: DB.findById(SHEET.CURRICULUM, 'piece_id', student.current_piece_id)
    };
  },

  // ── 복습곡 추천 (Spaced Repetition) ──
  getReviewRecommendations(studentId, count) {
    if (!count) count = 3;
    var lessons = DB.findBy(SHEET.LESSONS, { student_id: studentId });
    var student = DB.findById(SHEET.STUDENTS, 'student_id', studentId);

    // 완료된 곡 목록 (최근 레슨 기준)
    var pieceMap = {};
    lessons.forEach(function(l) {
      if (l.piece_status === 'completed' || l.piece_status === 'review') {
        if (!pieceMap[l.piece_id] || new Date(l.date) > new Date(pieceMap[l.piece_id].date)) {
          pieceMap[l.piece_id] = { piece_id: l.piece_id, lastPlayed: l.date, avg: parseFloat(l.avg_score) };
        }
      }
    });

    var completedPieces = Object.values(pieceMap);
    if (completedPieces.length === 0) return [];

    // 가중치: (1) 오래 안 한 곡 우선 (2) 현재곡과 기술 태그 공유하는 곡 우선
    var currentPiece = DB.findById(SHEET.CURRICULUM, 'piece_id', student.current_piece_id);
    var currentSkills = currentPiece && currentPiece.prereq_skills ? currentPiece.prereq_skills.split('|') : [];

    completedPieces.forEach(function(p) {
      var daysSince = Math.floor((Date.now() - new Date(p.lastPlayed).getTime()) / 86400000);
      p.recencyWeight = Math.min(daysSince / 30, 1); // 30일 이상이면 최대

      var pieceCurr = DB.findById(SHEET.CURRICULUM, 'piece_id', p.piece_id);
      var pieceSkills = pieceCurr && pieceCurr.prereq_skills ? pieceCurr.prereq_skills.split('|') : [];
      var overlap = pieceSkills.filter(function(s) { return currentSkills.indexOf(s) >= 0; }).length;
      p.skillWeight = overlap * 0.3;

      p.totalWeight = p.recencyWeight + p.skillWeight;
      p.title = pieceCurr ? pieceCurr.title : p.piece_id;
    });

    completedPieces.sort(function(a, b) { return b.totalWeight - a.totalWeight; });
    return completedPieces.slice(0, count);
  }
};
