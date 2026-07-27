// 성직자 진로 로직 (Deep Module) — 빌드 가드·2축 배지·정렬·검색·안전장치 판정. 렌더링은 app.js에 위임.
// 원칙: 포교가 아니라 직업 정보. 정통성 판정 금지 — 배지는 인준·학위라는 객관 사실 2축만 표시한다.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MapsiClergy = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const RELIGION_LABELS = {
    PROTESTANT: "개신교", CATHOLIC: "천주교", BUDDHIST: "불교",
    WON_BUDDHIST: "원불교", ISLAM: "이슬람", OTHER: "기타",
  };
  const REQUIRED_RELIGIONS = ["PROTESTANT", "CATHOLIC", "BUDDHIST"];

  // 빌드 가드 — 최소 요구 종교 각각 실데이터(샘플 제외) 경로 1건 이상일 때만 모듈 노출
  function isVisible(paths) {
    const real = (paths || []).filter((p) => !String(p.id).startsWith("sample-"));
    return REQUIRED_RELIGIONS.every((rel) => real.some((p) => p.religion === rel));
  }

  // 양성기관 2축 배지 — 교단 인준과 학위 인정은 독립 표시 (합치기 금지)
  function instBadges(inst) {
    return [
      inst.is_denomination_approved
        ? { text: "교단 인준", kind: "ok" }
        : { text: "교단 인준 확인 안 됨", kind: "warn" },
      inst.is_accredited_university
        ? { text: "학위 인정" + (inst.degree_awarded ? " · " + inst.degree_awarded : ""), kind: "ok" }
        : { text: "학위 미인정", kind: "warn" },
    ];
  }

  // 미성년 안전장치 — 진입 가능 경로는 상담 전화·보호자 안내·부모 카드 연결 3종이 필수
  function minorsSafetyIssues(path) {
    if (!path.is_open_to_minors) return [];
    const issues = [];
    if (!path.official_contact_phone) issues.push("상담 전화 없음");
    if (!path.official_contact_name) issues.push("상담 창구 이름 없음");
    return issues;
  }

  // 정렬 — 종교 라벨 가나다 → 교단 → 역할. 추천·인기 정렬은 만들지 않는다.
  function sortPaths(paths) {
    return [...paths].sort((a, b) =>
      (RELIGION_LABELS[a.religion] || a.religion).localeCompare(RELIGION_LABELS[b.religion] || b.religion, "ko") ||
      a.denomination.localeCompare(b.denomination, "ko") ||
      a.role_name.localeCompare(b.role_name, "ko"));
  }

  const norm = (t) => String(t || "").replace(/\s+/g, "").toLowerCase();
  function searchInstitutions(list, query) {
    const q = norm(query);
    if (!q) return [];
    return list.filter((i) => norm(i.name).includes(q));
  }

  // 검색창에서 성직 경로 인식 — 역할명·교단명 매칭 (샘플 제외). 홈 검색의 주결과에 쓰인다.
  // 병기형 역할명("스님(비구·비구니)", "수녀·수사(수도자)")은 별칭으로 분해해 문장 속 언급도 잡는다.
  function nameAliases(name) {
    const aliases = String(name || "").split(/[·()\/,]+/).map(norm).filter((a) => a.length >= 2);
    return [norm(name), ...aliases];
  }
  function findPathsByQuery(paths, query) {
    const q = norm(query);
    if (q.length < 2) return [];
    return paths
      .filter((p) => !String(p.id).startsWith("sample-"))
      .filter((p) =>
        nameAliases(p.role_name).some((a) => a.includes(q) || q.includes(a)) ||
        norm(p.denomination).includes(q))
      .slice(0, 3);
  }

  return { RELIGION_LABELS, REQUIRED_RELIGIONS, isVisible, instBadges, minorsSafetyIssues, sortPaths, searchInstitutions, findPathsByQuery };
});
