// 맵시 콘텐츠 로직 (Deep Module)
// 인터페이스: rotationFor(content, grade, dayKey) / periodNavFor(grade) / groupsFor(content, grade)
// 원칙 구현: 고정 8장(무한 피드 없음), I군 회전 비노출, H군은 '학교밖' 시기에서만 회전.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MapsiContent = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const GRADES = ["중1", "중2", "중3", "고1", "고2", "고3", "학교밖"];
  const CARD_COUNT = 8;

  // "다음에 닥칠 결정" 한 줄 — 시기 내비게이션 (통합설계 v2 표층)
  const PERIOD_NAV = {
    중1: "지금은 결정보다 탐색의 시기예요. 다음 결정(고입)은 중3에 와요.",
    중2: "다음에 닥칠 결정: 내년 고등학교 선택. 지금은 성향 데이터를 모을 때예요.",
    중3: "다음에 닥칠 결정: 고등학교 원서. 꿈→학교가 아니라 성향→학교 순서로 가요.",
    고1: "다음에 닥칠 결정: 선택과목. 과목 취향이 먼저, 진로는 나중이에요.",
    고2: "다음에 닥칠 결정: 전형 방향. 내 성적 구조부터 봐요.",
    고3: "다음에 닥칠 결정: 원서 접수. 판단 기준표와 함께 가요.",
    학교밖: "경로가 다른 것과 늦은 것은 달라요. 탐색은 오늘 시작하는 게 가장 빨라요.",
  };

  function periodNavFor(grade) {
    return PERIOD_NAV[grade] || PERIOD_NAV["중2"];
  }

  function eligible(q, grade) {
    return q.rotation && q.grades.includes(grade);
  }

  // 결정적 회전: 같은 날·같은 학년이면 같은 카드 세트 (셔플 아님 — 순환 슬라이스)
  function pick(pool, count, offset) {
    if (pool.length === 0) return [];
    const out = [];
    for (let i = 0; i < Math.min(count, pool.length); i++) {
      out.push(pool[(offset + i) % pool.length]);
    }
    return out;
  }

  function dayIndex(dayKey) {
    // dayKey: "YYYY-MM-DD" → 정수. 테스트 가능하도록 외부 주입.
    return Math.floor(Date.parse(dayKey + "T00:00:00Z") / 86400000);
  }

  function rotationFor(content, grade, dayKey) {
    const qs = content.questions;
    const day = dayIndex(dayKey);
    const aPool = qs.filter((q) => q.group === "A" && eligible(q, grade));
    const stagePool = qs.filter((q) => ["B", "C", "D", "E", "H"].includes(q.group) && eligible(q, grade));
    const mixPool = qs.filter((q) => ["F", "G", "J", "K"].includes(q.group) && eligible(q, grade));

    const cards = [
      ...pick(aPool, 4, day % Math.max(aPool.length, 1)),
      ...pick(stagePool, 2, day % Math.max(stagePool.length, 1)),
      ...pick(mixPool, 2, (day * 3) % Math.max(mixPool.length, 1)),
    ];
    // 부족분은 A풀에서 채우되 중복 금지, 최대 8장 고정
    const seen = new Set(cards.map((q) => q.id));
    for (const q of aPool.concat(mixPool)) {
      if (cards.length >= CARD_COUNT) break;
      if (!seen.has(q.id)) { cards.push(q); seen.add(q.id); }
    }
    return cards.slice(0, CARD_COUNT);
  }

  // 전체 열람: 학년과 무관하게 모든 군 노출 (배제하지 않음), 군 순서 고정
  const GROUP_TITLES = {
    A: "많이 하는 고민", B: "중1~2 · 탐색 초기", C: "중3 · 고입", D: "고1 · 과목 선택",
    E: "고2~3 · 입시와 출구", F: "꿈 없음 · 마음", G: "돈 · 현실", H: "학교 밖에서",
    I: "두 문화 사이에서", J: "부모님과 나", K: "AI · 1인 창업",
  };

  function groupsFor(content) {
    const order = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
    return order.map((g) => ({
      group: g,
      title: GROUP_TITLES[g],
      questions: content.questions.filter((q) => q.group === g),
    }));
  }

  // 질문 검색 — 단순 토큰 포함 매칭. 위기 감지(MapsiCare.detectCrisis)를 통과한 뒤에만 호출할 것.
  // grade를 주면 그 시기에 해당하는 질문만 조건에 넣는다.
  const SEARCH_LIMIT = 8; // 무한 피드 금지: 검색 결과도 상한 고정

  function searchQuestions(content, query, grade) {
    const tokens = String(query || "").trim().split(/\s+/).filter((t) => t.length >= 2);
    if (tokens.length === 0) return [];
    const pool = grade ? content.questions.filter((q) => q.grades.includes(grade)) : content.questions;
    const scored = pool.map((q) => {
      const a = content.answers[q.id];
      const answerText = a ? a.l1.headline + " " + a.l1.body + " " + a.l2.body : "";
      let score = 0;
      for (const t of tokens) {
        if (q.text.includes(t)) score += 3;
        if (answerText.includes(t)) score += 1;
      }
      return { q, score };
    });
    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, SEARCH_LIMIT)
      .map((s) => s.q);
  }

  // 직업명 인식 — 입력이 직업명을 담고 있으면 해당 조건 카드를 찾는다 (공백 무시, 양방향 포함)
  const normText = (t) => String(t || "").replace(/\s+/g, "").toLowerCase();
  function findJobsByQuery(jobs, query) {
    const nq = normText(query);
    if (nq.length < 2) return [];
    return jobs.filter((j) => {
      const nn = normText(j.name);
      return nn.includes(nq) || nq.includes(nn);
    }).slice(0, 3);
  }

  // 직업 관련 질문 — jobTags가 그 직업의 직업군과 매칭되는 질문만, 학년 조건 적용 (0건이면 빈 배열 그대로)
  function questionsForJob(content, job, grade) {
    return content.questions
      .filter((q) => (q.jobTags || []).includes(job.clusterId))
      .filter((q) => !grade || q.grades.includes(grade))
      .slice(0, SEARCH_LIMIT);
  }

  return { GRADES, CARD_COUNT, SEARCH_LIMIT, periodNavFor, rotationFor, groupsFor, searchQuestions, findJobsByQuery, questionsForJob, _internal: { pick, dayIndex, eligible } };
});
