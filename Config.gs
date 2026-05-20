/**
 * ═══════════════════════════════════════════════════════════
 * Config.gs — 시스템 설정 & 상수
 * ═══════════════════════════════════════════════════════════
 * Agent: 🏗 Architect + 🎻 Domain Expert
 * 역할: 모든 상수, 시트명, 커리큘럼 메타데이터를 중앙 관리
 * 규칙: 이 파일 외에서 하드코딩된 문자열 사용 금지
 */

// ── 스프레드시트 ID (Setup.gs 실행 후 자동 설정됨) ──
const SS_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '';

// ── 시트 이름 ──
const SHEET = {
  CONFIG:       'CONFIG',
  STUDENTS:     'STUDENTS',
  CURRICULUM:   'CURRICULUM',
  SKILLS:       'SKILLS',
  LESSONS:      'LESSONS',
  ASSIGNMENTS:  'ASSIGNMENTS',
  PRACTICE_LOG: 'PRACTICE_LOG',
  SNAPSHOTS:    'SNAPSHOTS',
  ACHIEVEMENTS: 'ACHIEVEMENTS',
  LOG:          'LOG'
};

// ── 시트 헤더 정의 (Setup.gs에서 시트 생성 시 사용) ──
const HEADERS = {
  CONFIG:       ['key','value','description'],
  STUDENTS:     ['student_id','name','age_group','teacher_email','parent_email','parent_pin_hash','start_date','current_book','current_piece_id','lesson_day','lesson_time','status','created_at'],
  CURRICULUM:   ['piece_id','book','seq','title','composer','key_sig','time_sig','teaching_points','prereq_skills','avg_days'],
  SKILLS:       ['tag','category','name_ko','description','first_piece_id'],
  LESSONS:      ['lesson_id','student_id','student_name','date','lesson_num','piece_id','piece_title','focus_tags','sc_posture','sc_intonation','sc_rhythm','sc_tone','sc_bow','sc_musicality','avg_score','corrections','corrections_free','teacher_comment','piece_status','created_at'],
  ASSIGNMENTS:  ['assign_id','lesson_id','student_id','assigned_date','due_date','scales','review_pieces','current_piece_sections','daily_reps','daily_minutes','notes'],
  PRACTICE_LOG: ['log_id','assign_id','student_id','log_date','actual_reps','actual_minutes','parent_verified'],
  SNAPSHOTS:    ['snap_id','student_id','period_type','period_start','period_end','avg_posture','avg_intonation','avg_rhythm','avg_tone','avg_bow','avg_musicality','overall_avg','pieces_completed','practice_rate','total_minutes','lesson_count','skill_gaps','created_at'],
  ACHIEVEMENTS: ['achieve_id','student_id','type','title','description','achieved_date','metadata','notified'],
  LOG:          ['timestamp','user','action','details']
};

// ── 루브릭 카테고리 ──
const RUBRIC_CATEGORIES = [
  { id: 'posture',    col: 'sc_posture',    name: '자세',       icon: '🧍' },
  { id: 'intonation', col: 'sc_intonation', name: '음정',       icon: '🎯' },
  { id: 'rhythm',     col: 'sc_rhythm',     name: '리듬',       icon: '🥁' },
  { id: 'tone',       col: 'sc_tone',       name: '톤',         icon: '🔔' },
  { id: 'bow',        col: 'sc_bow',        name: '활 컨트롤',  icon: '🏹' },
  { id: 'musicality', col: 'sc_musicality', name: '음악성',     icon: '✨' }
];

// ── 루브릭 레벨 설명 (Quick Reference) ──
const RUBRIC_LEVELS = {
  1: '도움 필요 — 독립적 수행 불가',
  2: '발전 중 — 간헐적 교정 필요',
  3: '안정적 — 기본 수준 달성',
  4: '능숙 — 고급 기술 적용',
  5: '자율적 — 프로페셔널 수준'
};

// ── 포커스 태그 ──
const FOCUS_TAGS = {
  보잉: ['SK_BOW_STAC','SK_BOW_LEGATO','SK_BOW_HOOKED','SK_BOW_LURE','SK_BOW_SPIC','SK_BOW_DIV'],
  왼손: ['SK_LHAND_POS','SK_LHAND_UNFURL','SK_LHAND_TRILL','SK_LHAND_4TH','SK_LHAND_SHIFT'],
  표현: ['SK_EXPRESS_DYN','SK_EXPRESS_VIB','SK_EXPRESS_PHRASE','SK_EXPRESS_RUBATO'],
  기초: ['SK_RHYTHM_DOT','SK_RHYTHM_SYNC','SK_INTON_RING','SK_INTON_SHIFT']
};

// ── 교정 프리셋 ──
const CORRECTION_PRESETS = [
  '왼손목 붕괴 → 넥에서 떨어뜨리기',
  '활 접촉점 이탈 → 브릿지 평행 확인',
  '엄지 잠김 → 엄지 끝 이완 연습',
  '4번 손가락 붕괴 → 핑거 탭핑',
  '활 체인지 잡음 → 손목 유연성 운동',
  '음정 이탈 → 개방현 울림 확인',
  '리듬 불안정 → 메트로놈 50% 속도',
  '톤 긁힘 → 활 속도↑ / 압력↓',
  '프레이징 단절 → 노래로 불러보기',
  '포지션 이동 미끄러짐 → 가이드 핑거'
];

// ── 곡 상태 ──
const PIECE_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED:   'completed',
  REVIEW:      'review'
};

// ── 성취 유형 ──
const ACHIEVEMENT_TYPES = {
  BOOK_GRAD:   'book_graduation',
  SKILL_MILE:  'skill_milestone',
  STREAK:      'streak',
  PIECE_MASTER:'piece_mastery'
};

// ── 진급/졸업 기준 (🎻 Domain Expert 설정) ──
const PROMOTION = {
  NEXT_PIECE_MIN_SCORES: { intonation: 3, rhythm: 3, tone: 3 },  // 이 3개 ≥3 이면 다음 곡
  BOOK_GRADUATION_AVG: 4.0   // 졸업곡 평균 ≥ 4.0
};

// ── Book 1 커리큘럼 데이터 (🎻 Domain Expert 검증) ──
const CURRICULUM_BOOK1 = [
  { piece_id:'1.01', book:1, seq:1,  title:'Twinkle Variations',    composer:'Suzuki',  key_sig:'A Major', time_sig:'4/4', teaching_points:'활 잡기 기초|오른팔 무게 이동|리듬 변주 4종|개방현 A-E', prereq_skills:'', avg_days:30 },
  { piece_id:'1.02', book:1, seq:2,  title:'Lightly Row',           composer:'Folk',    key_sig:'A Major', time_sig:'4/4', teaching_points:'0-1번 손가락 교대|레가토 기초|반복 구조 인식', prereq_skills:'SK_BOW_LEGATO', avg_days:7 },
  { piece_id:'1.03', book:1, seq:3,  title:'Song of the Wind',      composer:'Folk',    key_sig:'A Major', time_sig:'2/4', teaching_points:'스타카토 도입|2/4 박자|E현→A현 교차', prereq_skills:'SK_BOW_STAC', avg_days:7 },
  { piece_id:'1.04', book:1, seq:4,  title:'Go Tell Aunt Rhody',    composer:'Rousseau',key_sig:'A Major', time_sig:'4/4', teaching_points:'점음표 리듬|타이 처리|노래하는 톤', prereq_skills:'SK_RHYTHM_DOT', avg_days:7 },
  { piece_id:'1.05', book:1, seq:5,  title:'O Come Little Children', composer:'Folk',   key_sig:'A Major', time_sig:'2/4', teaching_points:'레가토 프레이징|크레센도 기초', prereq_skills:'SK_EXPRESS_DYN', avg_days:5 },
  { piece_id:'1.06', book:1, seq:6,  title:'May Song',              composer:'Folk',    key_sig:'A Major', time_sig:'4/4', teaching_points:'3번 손가락 도입|아르페지오 패턴|D현 추가', prereq_skills:'SK_LHAND_POS', avg_days:7 },
  { piece_id:'1.07', book:1, seq:7,  title:'Long Long Ago',         composer:'Bayly',   key_sig:'A Major', time_sig:'4/4', teaching_points:'다이내믹 대비 f/p|반복 시 변화|노래하듯 연주', prereq_skills:'SK_EXPRESS_DYN', avg_days:7 },
  { piece_id:'1.08', book:1, seq:8,  title:'Allegro',               composer:'Suzuki',  key_sig:'A Major', time_sig:'2/4', teaching_points:'빠른 템포 스타카토|활 배분 계획|G현 도입', prereq_skills:'SK_BOW_STAC|SK_BOW_DIV', avg_days:10 },
  { piece_id:'1.09', book:1, seq:9,  title:'Perpetual Motion',      composer:'Suzuki',  key_sig:'A Major', time_sig:'4/4', teaching_points:'연속 8분음표|크로스 스트링 반복|지구력', prereq_skills:'SK_BOW_DIV', avg_days:10 },
  { piece_id:'1.10', book:1, seq:10, title:'Allegretto',            composer:'Suzuki',  key_sig:'A Major', time_sig:'3/4', teaching_points:'3/4 박자 도입|왈츠 느낌|4번 손가락 준비', prereq_skills:'SK_LHAND_4TH', avg_days:7 },
  { piece_id:'1.11', book:1, seq:11, title:'Andantino',             composer:'Suzuki',  key_sig:'A Major', time_sig:'4/4', teaching_points:'서정적 프레이징|활 속도 조절|음악적 호흡', prereq_skills:'SK_EXPRESS_PHRASE', avg_days:7 },
  { piece_id:'1.12', book:1, seq:12, title:'Etude',                 composer:'Suzuki',  key_sig:'G Major', time_sig:'4/4', teaching_points:'G장조 핑거 패턴|2번 손가락 낮은 위치|크로스 스트링', prereq_skills:'SK_LHAND_POS|SK_INTON_RING', avg_days:10 },
  { piece_id:'1.13', book:1, seq:13, title:'Minuet 1',              composer:'Bach',    key_sig:'G Major', time_sig:'3/4', teaching_points:'바로크 스타일|3/4 첫 박 강조|크로스 스트링 레가토', prereq_skills:'SK_BOW_LEGATO|SK_RHYTHM_DOT', avg_days:14 },
  { piece_id:'1.14', book:1, seq:14, title:'Minuet 2',              composer:'Bach',    key_sig:'G Major', time_sig:'3/4', teaching_points:'단조 구간(G minor)|슬러 내 배분|다이내믹 대비', prereq_skills:'SK_EXPRESS_DYN|SK_INTON_RING', avg_days:14 },
  { piece_id:'1.15', book:1, seq:15, title:'Minuet 3',              composer:'Bach',    key_sig:'G Major', time_sig:'3/4', teaching_points:'후크드 보잉 도입|복합 리듬|조성 변화', prereq_skills:'SK_BOW_HOOKED', avg_days:14 },
  { piece_id:'1.16', book:1, seq:16, title:'Happy Farmer',          composer:'Schumann',key_sig:'G Major', time_sig:'4/4', teaching_points:'후크드 보잉 활용|점음표+16분음표|활기찬 캐릭터', prereq_skills:'SK_BOW_HOOKED|SK_RHYTHM_DOT', avg_days:14 },
  { piece_id:'1.17', book:1, seq:17, title:'Gavotte',               composer:'Gossec',  key_sig:'G Major', time_sig:'4/4', teaching_points:'아우프탁트|전체 활 사용|졸업곡 종합 평가', prereq_skills:'SK_BOW_DIV|SK_EXPRESS_PHRASE', avg_days:21 }
];

// ── 스킬 분류 체계 ──
const SKILLS_DATA = [
  { tag:'SK_BOW_STAC',       category:'bowControl',  name_ko:'스타카토',         description:'짧고 분리된 활 스트로크', first_piece_id:'1.03' },
  { tag:'SK_BOW_LEGATO',     category:'bowControl',  name_ko:'레가토',           description:'매끄럽고 연결된 활 스트로크', first_piece_id:'1.02' },
  { tag:'SK_BOW_HOOKED',     category:'bowControl',  name_ko:'후크드 보잉',      description:'같은 방향 2음 연결', first_piece_id:'1.15' },
  { tag:'SK_BOW_LURE',       category:'bowControl',  name_ko:'루레/포르타토',    description:'한 활에 여러 음 분리', first_piece_id:'2.01' },
  { tag:'SK_BOW_SPIC',       category:'bowControl',  name_ko:'스피카토',         description:'활이 현에서 튀는 주법', first_piece_id:'4.01' },
  { tag:'SK_BOW_DIV',        category:'bowControl',  name_ko:'활 배분',          description:'활 길이 계획적 사용', first_piece_id:'1.08' },
  { tag:'SK_LHAND_POS',      category:'posture',     name_ko:'왼손 자세',        description:'손가락 곡선, 손목 직선', first_piece_id:'1.01' },
  { tag:'SK_LHAND_UNFURL',   category:'posture',     name_ko:'핑거 스트레칭',    description:'손가락 간격 확장', first_piece_id:'2.01' },
  { tag:'SK_LHAND_TRILL',    category:'posture',     name_ko:'트릴',             description:'빠른 손가락 교대', first_piece_id:'3.01' },
  { tag:'SK_LHAND_4TH',      category:'posture',     name_ko:'4번 손가락',       description:'새끼손가락 강화', first_piece_id:'1.10' },
  { tag:'SK_LHAND_SHIFT',    category:'posture',     name_ko:'포지션 이동',      description:'1st→3rd 포지션', first_piece_id:'3.05' },
  { tag:'SK_EXPRESS_DYN',    category:'musicality',  name_ko:'다이내믹',         description:'pp~ff 음량 대비', first_piece_id:'1.05' },
  { tag:'SK_EXPRESS_VIB',    category:'musicality',  name_ko:'비브라토',         description:'음 떨림 표현', first_piece_id:'3.04' },
  { tag:'SK_EXPRESS_PHRASE',  category:'musicality',  name_ko:'프레이징',         description:'음악적 문장 구분', first_piece_id:'1.11' },
  { tag:'SK_EXPRESS_RUBATO', category:'musicality',  name_ko:'루바토',           description:'의도적 템포 변화', first_piece_id:'3.04' },
  { tag:'SK_RHYTHM_DOT',     category:'rhythm',      name_ko:'점음표',           description:'점음표+8분음표 리듬', first_piece_id:'1.04' },
  { tag:'SK_RHYTHM_SYNC',    category:'rhythm',      name_ko:'싱코페이션',       description:'약박 강조 리듬', first_piece_id:'3.04' },
  { tag:'SK_INTON_RING',     category:'intonation',  name_ko:'울림음',           description:'개방현 공명 활용', first_piece_id:'1.12' },
  { tag:'SK_INTON_SHIFT',    category:'intonation',  name_ko:'이동 음정',        description:'포지션 이동 시 정확도', first_piece_id:'3.05' }
];
