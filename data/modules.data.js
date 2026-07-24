// 나침반·역방향 시드 데이터 (앱 저작 콘텐츠 — 안내 성격, 출처 칩 비주장)
// 표현 원칙: 단정 금지("맞는 직업은 ~입니다" 금지). "이런 하루를 사는 사람이 많은 직업군"으로만 말한다.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MAPSI_MODULES_DATA = factory();
})(typeof self !== "undefined" ? self : this, function () {
  return {
    // ---- 나침반: 6축 (개발참고자료 §6 모듈 A) ----
    axes: [
      { key: "rhythm", q: "하루의 리듬, 어느 쪽이 더 편해요?", left: "정해진 시간표대로", right: "내 리듬대로 자유롭게" },
      { key: "social", q: "힘이 나는 순간은 어느 쪽이에요?", left: "혼자 몰입할 때", right: "사람들과 함께할 때" },
      { key: "space", q: "어떤 공간에 있는 내가 그려져요?", left: "실내에서 차분하게", right: "현장에서 움직이며" },
      { key: "risk", q: "둘 중 고르라면 어느 쪽이에요?", left: "예측 가능한 안정", right: "새로운 도전" },
      { key: "mode", q: "더 재밌는 쪽은 어느 쪽이에요?", left: "만들고 표현하기", right: "따져보고 분석하기" },
      { key: "object", q: "더 끌리는 대상은 어느 쪽이에요?", left: "사람을 만나고 돕는 일", right: "사물·시스템을 다루는 일" },
    ],

    // ---- 직업군 14선: 축 성향 벡터 (L/R/null=무관) ----
    clusters: [
      { id: "content", name: "콘텐츠·창작", day: "혼자 몰입해 만들고, 마감으로 완성하는 하루",
        vector: { rhythm: "R", social: "L", space: "L", risk: "R", mode: "L", object: null },
        jobs: ["작가·시나리오", "영상 크리에이터", "웹툰 작가", "콘텐츠 기획자"] },
      { id: "design", name: "디자인", day: "쓸 사람을 상상하며 형태와 화면을 다듬는 하루",
        vector: { rhythm: null, social: null, space: "L", risk: null, mode: "L", object: "R" },
        jobs: ["그래픽 디자이너", "UX 디자이너", "제품 디자이너", "패션 디자이너"] },
      { id: "dev", name: "개발·데이터", day: "문제를 쪼개고 코드와 데이터로 푸는 하루",
        vector: { rhythm: null, social: "L", space: "L", risk: null, mode: "R", object: "R" },
        jobs: ["소프트웨어 개발자", "데이터 분석가", "게임 개발자", "AI 엔지니어"] },
      { id: "research", name: "연구·과학", day: "한 주제를 깊게 파고 실험으로 확인하는 하루",
        vector: { rhythm: "L", social: "L", space: "L", risk: "L", mode: "R", object: "R" },
        jobs: ["연구원", "생명과학자", "실험 분석가", "대학교수"] },
      { id: "care", name: "의료·돌봄", day: "사람의 회복을 곁에서 지키는 하루",
        vector: { rhythm: "L", social: "R", space: "L", risk: "L", mode: null, object: "L" },
        jobs: ["간호사", "물리치료사", "응급구조사", "상담사"] },
      { id: "edu", name: "교육", day: "아는 것을 전하고 성장을 지켜보는 하루",
        vector: { rhythm: "L", social: "R", space: "L", risk: "L", mode: "L", object: "L" },
        jobs: ["교사", "특수교사", "강사", "교육 콘텐츠 개발자"] },
      { id: "plan", name: "기획·마케팅", day: "사람들의 마음을 읽고 판을 짜는 하루",
        vector: { rhythm: null, social: "R", space: "L", risk: "R", mode: null, object: "L" },
        jobs: ["서비스 기획자", "마케터", "MD(상품기획)", "브랜드 매니저"] },
      { id: "service", name: "서비스·환대", day: "현장에서 사람을 맞이하고 순간을 만드는 하루",
        vector: { rhythm: "L", social: "R", space: "R", risk: null, mode: null, object: "L" },
        jobs: ["승무원", "호텔리어", "이벤트 플래너", "매장 매니저"] },
      { id: "tech", name: "기술·엔지니어링", day: "기계와 설비를 만지고 원인을 찾아내는 하루",
        vector: { rhythm: "L", social: null, space: "R", risk: null, mode: "R", object: "R" },
        jobs: ["전기·기계 엔지니어", "설비 정비 기술자", "스마트팩토리 기술자", "드론 정비사"] },
      { id: "build", name: "건축·공간", day: "공간을 그리고 현장에서 세워지는 걸 보는 하루",
        vector: { rhythm: null, social: "R", space: "R", risk: null, mode: "L", object: "R" },
        jobs: ["건축가", "인테리어 디자이너", "토목 엔지니어", "조경가"] },
      { id: "public", name: "공공·안전", day: "정해진 규칙 위에서 누군가를 지키는 하루",
        vector: { rhythm: "L", social: "R", space: "R", risk: "L", mode: null, object: "L" },
        jobs: ["경찰관", "소방관", "군 간부", "사회복지 공무원"] },
      { id: "founder", name: "창업·1인 비즈니스", day: "작게 실험하고 반응을 보며 키우는 하루",
        vector: { rhythm: "R", social: null, space: null, risk: "R", mode: "L", object: null },
        jobs: ["1인 브랜드 운영", "스마트스토어 셀러", "스타트업 창업가", "프리랜서"] },
      { id: "sports", name: "스포츠·야외", day: "몸을 쓰고 바깥에서 에너지를 얻는 하루",
        vector: { rhythm: "L", social: "R", space: "R", risk: "R", mode: null, object: "L" },
        jobs: ["스포츠 지도자", "재활 트레이너", "레저 가이드", "농생명 기술자"] },
      { id: "finance", name: "금융·법·행정", day: "숫자와 규정으로 신뢰를 만드는 하루",
        vector: { rhythm: "L", social: null, space: "L", risk: "L", mode: "R", object: null },
        jobs: ["회계사", "금융 분석가", "법률 사무 전문가", "행정 전문가"] },
    ],

    // ---- 결과 리포트의 렌즈 한 줄 (최대 1개, 열린 연결만) ----
    lensLines: [
      { when: { social: "L", mode: "L" }, line: "혼자·창작 성향 — 마침 조직 없이 일하는 방식이 늘어나는 중이에요. (→ 렌즈 ③ 고용 vs 프로젝트)" },
      { when: { mode: "R", object: "R" }, line: "분석·시스템 성향 — 어느 산업이든 데이터를 읽는 사람을 찾는 중이에요. (→ 렌즈 ⑤ 인간 vs AI 협업)" },
      { when: { object: "L" }, line: "사람을 향한 성향 — AI가 못 하는 부분이 가장 많이 남는 자리예요. (→ 렌즈 ⑤ 인간 vs AI 협업)" },
      { when: { risk: "R" }, line: "도전 성향 — 새 직업은 구조가 바뀌는 자리에서 태어나요. (→ 렌즈 ① 플랫폼 vs 프로토콜)" },
    ],

    // ---- 역방향: 과목 → 계열 ----
    tracks: [
      { id: "hum", name: "인문", majors: ["국어국문", "영어영문", "사학", "철학"] },
      { id: "soc", name: "사회", majors: ["경영", "경제", "미디어커뮤니케이션", "심리", "정치외교"] },
      { id: "edu", name: "교육", majors: ["교육학", "초등교육", "교과교육(국·영·수 등)"] },
      { id: "nat", name: "자연", majors: ["수학", "화학", "생명과학", "지구환경과학"], stem: true },
      { id: "eng", name: "공학", majors: ["컴퓨터공학", "기계공학", "전기전자", "건축"], stem: true },
      { id: "med", name: "의약·보건", majors: ["간호", "물리치료", "임상병리", "약학"], stem: true },
      { id: "art", name: "예체능", majors: ["디자인", "실용음악", "체육", "공연예술"] },
    ],
    // links: P(주 연결)=2점, S(부 연결)=1점
    subjects: [
      { id: "kor", name: "국어·문학", links: { hum: "P", edu: "S", soc: "S" } },
      { id: "eng2", name: "영어", links: { hum: "P", soc: "S" } },
      { id: "lang", name: "제2외국어·한문", links: { hum: "P" } },
      { id: "hist", name: "역사", links: { hum: "P", soc: "S", edu: "S" } },
      { id: "ethic", name: "윤리·철학", links: { hum: "P", edu: "S" } },
      { id: "social", name: "사회·정치와 법", links: { soc: "P", edu: "S" } },
      { id: "econ", name: "경제", links: { soc: "P" } },
      { id: "geo", name: "지리", links: { soc: "P", nat: "S" } },
      { id: "math", name: "수학", links: { nat: "P", eng: "P", soc: "S" } },
      { id: "phys", name: "물리학", links: { eng: "P", nat: "P" } },
      { id: "chem", name: "화학", links: { nat: "P", eng: "S", med: "S" } },
      { id: "bio", name: "생명과학", links: { med: "P", nat: "P" } },
      { id: "earth", name: "지구과학", links: { nat: "P" } },
      { id: "info", name: "정보(프로그래밍)", links: { eng: "P", soc: "S" } },
      { id: "techhome", name: "기술·가정", links: { eng: "S", nat: "S" } },
      { id: "pe", name: "체육", links: { art: "P", edu: "S", med: "S" } },
      { id: "artv", name: "미술", links: { art: "P", eng: "S" } },
      { id: "music", name: "음악", links: { art: "P", edu: "S" } },
    ],
  };
});
