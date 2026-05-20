/**
 * ═══════════════════════════════════════════════════════════
 * Auth.gs — 인증 & 세션 관리
 * ═══════════════════════════════════════════════════════════
 * Agent: 🔒 Security
 * 하네스: PIN 해시(SHA-256+솔트), 5회 실패 잠금, 세션 24시간 만료
 */

const Auth = {
  SALT: 'suzuki_violin_2026',
  MAX_FAILS: 5,
  LOCKOUT_MS: 30 * 60 * 1000,    // 30분
  SESSION_TTL_MS: 24 * 60 * 60 * 1000, // 24시간

  // ── PIN → SHA-256 해시 ──
  hashPin(pin) {
    var input = String(pin) + ':' + this.SALT;
    var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input);
    return digest.map(function(b) {
      return ('0' + (b & 0xFF).toString(16)).slice(-2);
    }).join('');
  },

  // ── 학부모 PIN 검증 ──
  verifyParentPin(studentId, pin) {
    var props = PropertiesService.getScriptProperties();

    // 잠금 체크
    var failKey = 'FAIL_' + studentId;
    var failData = props.getProperty(failKey);
    var fails = failData ? JSON.parse(failData) : { count: 0, lastFail: 0 };

    if (fails.count >= this.MAX_FAILS) {
      var elapsed = Date.now() - fails.lastFail;
      if (elapsed < this.LOCKOUT_MS) {
        var remaining = Math.ceil((this.LOCKOUT_MS - elapsed) / 60000);
        return { success: false, error: 'LOCKED', message: remaining + '분 후 재시도', remaining: remaining };
      }
      fails.count = 0;
    }

    // 학생 조회
    var student = DB.findById(SHEET.STUDENTS, 'student_id', studentId);
    if (!student) return { success: false, error: 'NOT_FOUND', message: '학생을 찾을 수 없습니다' };

    var hash = this.hashPin(pin);
    if (hash === student.parent_pin_hash) {
      // 성공
      props.deleteProperty(failKey);
      var token = Utilities.getUuid();
      var session = { token: token, studentId: studentId, studentName: student.name, created: Date.now() };
      props.setProperty('SES_' + token, JSON.stringify(session));
      DB.log('parent:' + studentId, 'LOGIN_SUCCESS', '');
      return { success: true, token: token, studentName: student.name };
    } else {
      // 실패
      fails.count++;
      fails.lastFail = Date.now();
      props.setProperty(failKey, JSON.stringify(fails));
      DB.log('parent:' + studentId, 'LOGIN_FAIL', 'attempt ' + fails.count);
      return { success: false, error: 'WRONG_PIN', message: 'PIN이 올바르지 않습니다', remaining: this.MAX_FAILS - fails.count };
    }
  },

  // ── 세션 검증 ──
  verifySession(token) {
    if (!token) return null;
    var props = PropertiesService.getScriptProperties();
    var data = props.getProperty('SES_' + token);
    if (!data) return null;
    
    var session = JSON.parse(data);
    if (Date.now() - session.created > this.SESSION_TTL_MS) {
      props.deleteProperty('SES_' + token);
      return null;
    }
    return session;
  },

  // ── 교사 인증 (Google OAuth) ──
  getTeacherEmail() {
    return Session.getActiveUser().getEmail();
  },

  isTeacher() {
    var email = this.getTeacherEmail();
    if (!email) return false;
    var config = DB.readAll(SHEET.CONFIG);
    for (var i = 0; i < config.length; i++) {
      if (config[i].key === 'TEACHER_EMAIL' && config[i].value === email) return true;
    }
    // 첫 사용 시: 어떤 이메일이든 교사로 허용 (테스트용)
    if (config.filter(function(c) { return c.key === 'TEACHER_EMAIL'; }).length === 0) return true;
    return false;
  }
};
