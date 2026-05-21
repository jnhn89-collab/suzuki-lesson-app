import { DIMENSION_LABELS_KO, SCORING_DIMENSIONS } from "@/lib/scoring/priors";
import type { ReportData, ScoreCategoryId } from "./types";

export const scoreCategories: Array<{ id: ScoreCategoryId; label: string }> = SCORING_DIMENSIONS.map((id) => ({
  id,
  label: DIMENSION_LABELS_KO[id],
}));

export const focusOptions = [
  "활 접촉점",
  "활 배분",
  "손목 이완",
  "왼손 모양",
  "4번 손가락",
  "음정 안정",
  "개방현 울림",
  "리듬 유지",
  "느린 템포",
  "프레이징",
  "톤 만들기",
  "암보",
  "무대 태도",
  "집중력",
  "복습 연결",
];

export const presetGroups = {
  "좋아진 점": {
    target: "strengths",
    items: [
      "활이 현 위에 안정적으로 올라오는 시간이 늘었고, 소리의 출발이 차분해졌습니다.",
      "멜로디의 방향을 기억하며 프레이즈 끝을 자연스럽게 정리하는 힘이 좋아졌습니다.",
      "어려운 마디에서 멈추지 않고 다시 시도하는 태도가 꾸준히 보였습니다.",
      "리듬을 말로 먼저 확인한 뒤 연주할 때 박자가 더 안정되었습니다.",
      "왼손 손가락 모양이 학기 초보다 둥글게 유지되는 시간이 늘었습니다.",
      "개방현 소리를 듣고 음정을 맞추려는 반응이 좋아졌습니다.",
      "활을 길게 쓰는 구간에서 소리가 끊기지 않고 이어졌습니다.",
      "빠르게 치기보다 좋은 소리를 먼저 찾으려는 모습이 좋았습니다.",
      "곡의 분위기를 이해하고 조금씩 표현을 넣기 시작했습니다.",
      "반복 연습한 부분은 손이 먼저 기억할 만큼 자연스러워졌습니다.",
      "선생님이 짚어준 부분을 바로 고쳐보려는 집중력이 좋았습니다.",
      "마지막까지 자세가 무너지지 않고 잘 버티는 힘이 생겼습니다.",
    ],
  },
  "성장 포인트": {
    target: "growthArea",
    items: [
      "현을 바꿀 때 팔꿈치 높이가 늦게 따라오면서 소리가 살짝 흔들립니다. 현을 바꾸기 전에 팔의 위치를 먼저 준비해 보겠습니다.",
      "빠른 부분에서 왼손이 먼저 급해지며 음정이 올라가는 경향이 있습니다. 손가락을 누르기 전에 귀로 기준음을 떠올리는 연습이 필요합니다.",
      "활 끝으로 갈수록 힘이 빠지면서 소리가 얇아집니다. 끝까지 팔 무게를 조금 남겨두는 연습을 하겠습니다.",
      "점음표 리듬에서 짧은 음이 길어지는 습관이 있습니다. 말리듬으로 먼저 확인한 뒤 연주하면 좋아집니다.",
      "프레이즈 중간에서 호흡이 끊기는 부분이 있습니다. 두 마디씩 연결해서 노래하듯 연습해 보겠습니다.",
      "4번 손가락을 사용할 때 손목이 안쪽으로 접히는 모습이 보입니다. 손목을 세우고 손가락 끝으로 가볍게 누르는 연습이 필요합니다.",
      "활이 브릿지와 평행하지 않을 때 톤이 거칠어집니다. 거울을 보며 활 길을 확인하면 좋겠습니다.",
      "익숙한 구간은 잘 지나가지만 새 구간에서 템포가 빨라집니다. 새 구간만 따로 느리게 반복하겠습니다.",
      "쉼표 직후 들어오는 타이밍이 조금 늦습니다. 쉬는 동안에도 속으로 박을 세는 연습이 필요합니다.",
      "다이내믹 표현은 이해하고 있지만 실제 소리 차이는 아직 작습니다. 활 속도 차이를 더 분명히 만들어 보겠습니다.",
    ],
  },
  "가정 도움": {
    target: "homeSupport",
    items: [
      "연습을 시작하기 전 활이 브릿지와 평행한지 한 번만 같이 확인해 주세요.",
      "틀린 부분을 바로 지적하기보다, 좋은 소리가 난 순간을 먼저 짚어주시면 도움이 됩니다.",
      "빠르게 끝까지 치는 것보다 어려운 두 마디를 천천히 반복하는 날이 더 좋은 연습이 될 수 있습니다.",
      "연습 시간은 길지 않아도 괜찮습니다. 이번 기간에 정리한 핵심 구간을 같은 순서로 해보면 좋겠습니다.",
      "아이에게 먼저 어떤 부분을 연습할지 말로 설명하게 해주세요. 스스로 목표를 말하면 집중이 좋아집니다.",
      "음정이 흔들릴 때는 바로 고치기보다 개방현 소리를 한 번 듣고 다시 시작하게 해주세요.",
      "자세를 오래 지적하면 부담이 될 수 있으니, 시작 전과 끝난 뒤 두 번만 확인해 주세요.",
      "성공한 반복을 표시할 수 있게 작은 체크표를 만들어 주시면 동기부여가 됩니다.",
      "힘들어하는 날에는 전체 곡보다 가장 자신 있는 구간을 예쁘게 한 번 연주하고 마무리해도 좋습니다.",
      "연습 후에는 이번에 가장 좋아진 부분을 아이가 직접 고르게 해주세요.",
    ],
  },
  "연습 처방": {
    target: "practicePlan",
    items: [
      "첫 4마디를 아주 느린 속도로 두 번 연습한 뒤, 원래 속도에 가깝게 한 번 연결합니다.",
      "현이 바뀌는 마디만 따로 떼어 활 각도를 확인하며 반복합니다.",
      "어려운 리듬은 악기 없이 말로 세 번 말한 뒤 바로 연주합니다.",
      "개방현을 먼저 울린 뒤 같은 손가락 음을 연주하며 음정을 맞춥니다.",
      "마지막 두 마디부터 거꾸로 시작해서 앞부분으로 붙여 갑니다.",
      "프레이즈 끝 음을 길게 듣고, 활을 급하게 멈추지 않도록 연습합니다.",
      "4번 손가락이 나오는 부분은 손목 모양을 확인한 뒤 짧게 반복합니다.",
      "메트로놈을 느린 템포에 두고 박자가 흔들리지 않는 반복만 세어 봅니다.",
      "곡 전체는 한 번만 연결하고, 대부분의 시간은 핵심 구간에 씁니다.",
      "연습 마지막에는 가장 좋아진 소리로 한 번만 녹음해 들어봅니다.",
    ],
  },
} as const;

export const sampleReport: ReportData = {
  studentName: "김지우",
  periodName: "이번 학기",
  periodStart: "2026-03-01",
  periodEnd: "2026-05-20",
  totalLessons: 10,
  completedPieces: 2,
  teacherName: "이선생",
  ageGroup: "8-10",
  currentPiece: "Book 1 · Minuet 1",
  scores: {
    intonation: 3,
    rhythm: 4,
    tone: 4,
    musicality: 4,
    technique: 3.5,
  },
  focusTags: ["활 접촉점", "음정 안정", "프레이징"],
  strengths:
    "멜로디의 방향을 기억하며 프레이즈 끝을 자연스럽게 정리하는 힘이 좋아졌습니다.\n어려운 마디에서 멈추지 않고 다시 시도하는 태도가 꾸준히 보였습니다.",
  growthArea:
    "현을 바꿀 때 팔꿈치 높이가 늦게 따라오면서 소리가 살짝 흔들립니다. 현을 바꾸기 전에 팔의 위치를 먼저 준비해 보겠습니다.",
  homeSupport:
    "연습을 시작하기 전 활이 브릿지와 평행한지 한 번만 같이 확인해 주세요. 빠르게 끝까지 치는 것보다 어려운 두 마디를 천천히 반복하는 날이 더 좋은 연습이 될 수 있습니다.",
  practicePlan:
    "첫 4마디를 아주 느린 속도로 두 번 연습한 뒤, 원래 속도에 가깝게 한 번 연결합니다.",
  dailyMinutes: 20,
  dailyReps: 5,
  status: "draft",
};

export const sampleStudent = {
  id: "demo-student",
  studentCode: "2026-HANBIT-001",
  name: "김지우",
  schoolName: "한빛초등학교",
  enrollmentYear: 2026,
  registrationYear: 2026,
  registrationSequence: 1,
  ageGroup: "8-10",
  currentPiece: "Book 1 · Minuet 1",
  status: "active" as const,
};

export const sampleReports = [
  { ...sampleReport, id: "demo-report-2026-spring", status: "published" as const },
  {
    ...sampleReport,
    id: "demo-report-2025-winter",
    periodName: "2025 겨울학기",
    periodStart: "2025-12-01",
    periodEnd: "2026-02-28",
    totalLessons: 8,
    completedPieces: 1,
    currentPiece: "Book 1 · Allegretto",
    scores: {
      intonation: 3,
      rhythm: 4,
      tone: 3,
      musicality: 3,
      technique: 3,
    },
    focusTags: ["리듬 유지", "왼손 모양", "느린 템포"],
    strengths:
      "리듬을 말로 먼저 확인하고 연주하는 습관이 생겼습니다.\n익숙한 구간에서는 박자 흐름이 안정적으로 이어졌습니다.",
    growthArea:
      "새 구간에서는 왼손 모양이 급하게 무너지는 경우가 있습니다. 느린 속도에서 손가락을 현 가까이에 두는 연습을 이어가겠습니다.",
    homeSupport:
      "처음부터 끝까지 연결하기보다 새로 배운 두 마디를 천천히 반복하도록 도와주세요.",
    practicePlan:
      "새 구간 두 마디를 느린 속도로 세 번 반복한 뒤, 앞뒤 마디와 연결합니다.",
    dailyMinutes: 15,
    dailyReps: 4,
    status: "published" as const,
  },
];
