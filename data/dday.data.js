// D-day 내비게이션 시드 — 학년별 '다음 결정'의 시즌 기준일 + 오늘의 5분 몫 풀
// 날짜 원칙: 기준일은 제도상 통상 시즌의 시작 무렵(단정 아님). 정확한 일정은 학교·공고 확인을 항상 병기한다.
// 5분 몫 원칙: 1개만, 5분 이내, 앱 안 기능 또는 앱 밖 초소형 행동. 압박 문구 금지.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MAPSI_DDAY_DATA = factory();
})(typeof self !== "undefined" ? self : this, function () {
  return {
    // 학년별 결정 이벤트 (연중 반복). events가 빈 배열이면 카운트다운 없음(탐색 시기)
    events: {
      중1: [],
      중2: [],
      중3: [
        { month: 12, day: 1, label: "고입 원서 시즌", note: "학교·전형마다 일정이 달라요. 마이스터고는 10월부터 시작돼요 — 정확한 날짜는 학교 공지로 확인해요." },
      ],
      고1: [
        { month: 9, day: 1, label: "선택과목 결정 시즌", note: "학교마다 수요조사 시기가 달라요. 담임 선생님 안내가 기준이에요." },
      ],
      고2: [
        { month: 9, day: 1, label: "선택과목 확정·전형 방향 시즌", note: "학교 일정이 기준이에요. 내 성적 구조부터 봐요." },
      ],
      고3: [
        { month: 9, day: 1, label: "수시 원서 시즌", note: "정확한 접수 기간은 대학·어디가 공지로 확인해요." },
      ],
      학교밖: [
        { month: 4, day: 1, label: "검정고시 시즌(상반기)", note: "보통 4월에 시행돼요. 공고는 시·도 교육청에서 확인해요." },
        { month: 8, day: 1, label: "검정고시 시즌(하반기)", note: "보통 8월에 시행돼요. 공고는 시·도 교육청에서 확인해요." },
      ],
    },

    // 오늘의 5분 몫 — 학년별 풀 (날짜 기반 회전). route는 앱 내 이동(선택)
    tasks: {
      중1: [
        { text: "오늘의 낯선 직업 1명 만나기", route: "jobdex" },
        { text: "시간이 빨리 갔던 순간 한 줄 남기기", route: "journal" },
        { text: "나침반 안 해봤다면 2분 해보기", route: "compass" },
        { text: "3분 미션 하나 골라서 심어두기", route: "quests" },
        { text: "오늘 제일 덜 지겨웠던 과목 하나 떠올려보기 (역방향 지도에 표시)", route: "reverse" },
      ],
      중2: [
        { text: "오늘의 낯선 직업 1명 만나기", route: "jobdex" },
        { text: "강점 저널 한 줄 — 오늘 몰입한 순간", route: "journal" },
        { text: "관심 직업군 하나의 조건 카드 열어보기", route: "jobs" },
        { text: "체험 지도에서 가까운 곳 1곳만 구경하기", route: "explore" },
        { text: "내 신호 리포트 확인하기", route: "signal" },
      ],
      중3: [
        { text: "학교알리미에서 관심 고교 1곳의 선택과목 목록 열어보기 (5분)" },
        { text: "고입 기준 셋 중 '통학 시간' 하나만 지도 앱으로 재보기" },
        { text: "특성화고·마이스터고 조건 비교 답변 읽기 → 전체 질문의 중3 코너", route: "browse" },
        { text: "오늘의 낯선 직업 1명 만나기", route: "jobdex" },
        { text: "부모님과 질문 하나 나누기 — 대화 카드에서 고르기", route: "parents" },
      ],
      고1: [
        { text: "지금 듣는 과목 취향 표시하기 (3분)", route: "reverse" },
        { text: "관심 계열의 권장과목 답변(D2) 읽기", route: "q/D2" },
        { text: "오늘의 낯선 직업 1명 만나기", route: "jobdex" },
        { text: "강점 저널 한 줄 — 시간이 빨리 간 수업", route: "journal" },
        { text: "조건 카드 1장 열어 '구조 한 줄'만 읽기", route: "jobs" },
      ],
      고2: [
        { text: "수시/정시 판단 기준 답변(E3) 읽기", route: "q/E3" },
        { text: "세특 재료 — 이번 주 수업에서 이어볼 주제 1개 적기", route: "journal" },
        { text: "오늘의 낯선 직업 1명 만나기", route: "jobdex" },
        { text: "포트폴리오에서 핵심 3개 골라보기", route: "portfolio" },
        { text: "내 신호 리포트 확인하기", route: "signal" },
      ],
      고3: [
        { text: "비진학 포함 경로 답변(E4) 한 번 읽기", route: "q/E4" },
        { text: "포트폴리오 문장 초안 다듬기 (5분)", route: "portfolio" },
        { text: "오늘의 낯선 직업 1명 만나기", route: "jobdex" },
        { text: "오늘 컨디션 체크인 1탭 — 그거면 충분해요", route: "journal" },
        { text: "N수 판단 기준 답변(E7) 읽어두기", route: "q/E7" },
      ],
      학교밖: [
        { text: "꿈드림 프로그램 1개 구경하기", route: "explore" },
        { text: "검정고시→대학 경로 답변(H2) 읽기", route: "q/H2" },
        { text: "오늘의 낯선 직업 1명 만나기", route: "jobdex" },
        { text: "내 활동 기록을 포트폴리오로 묶어보기", route: "portfolio" },
        { text: "강점 저널 한 줄 — 오늘의 나", route: "journal" },
      ],
    },
  };
});
