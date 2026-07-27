// 대안학교 정보 로직 (Deep Module) — 배지·정합·필터·검색. 렌더링은 app.js에 위임.
// 핵심 목적: "교육청 등록 ≠ 학력 인정" 혼동을 구조적으로 막는다.
// 절대 규칙: accredits_diploma를 legal_status에서 파생하지 않는다 — 여기의 기댓값 표는 '검증'에만 쓴다.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MapsiAltschools = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const LEGAL_LABELS = {
    SPECIALIZED_MIDDLE: "대안교육 특성화중학교",
    SPECIALIZED_HIGH: "대안교육 특성화고등학교",
    ACCREDITED_ALT: "인가 대안학교(각종학교)",
    ENTRUSTED: "위탁교육기관",
    REGISTERED: "교육청 등록 대안교육기관",
    UNREGISTERED: "미등록 시설",
  };
  const EXPECTED_ACCREDITS = {
    SPECIALIZED_MIDDLE: true, SPECIALIZED_HIGH: true, ACCREDITED_ALT: true, ENTRUSTED: true,
    REGISTERED: false, UNREGISTERED: false,
  };
  const LEVEL_LABELS = { ELEMENTARY: "초", MIDDLE: "중", HIGH: "고" };
  const CHARACTER_LABELS = {
    ECO: "생태", ARTS: "예술", TECH: "기술", RELIGIOUS: "종교",
    INTERNATIONAL: "국제", READJUSTMENT: "학교 적응·회복", GENERAL: "일반",
  };

  // 카드 최상단 배지 — 학력 인정 여부가 항상 첫 번째. REGISTERED는 '교육청 등록'+'학력 미인정' 병기 필수.
  function badges(s) {
    const list = [];
    list.push(s.accredits_diploma
      ? { text: "학력 인정", kind: "ok" }
      : { text: "학력 미인정", kind: "warn" });
    if (s.legal_status === "REGISTERED") list.splice(0, 0, { text: "교육청 등록", kind: "plain" });
    else list.push({ text: LEGAL_LABELS[s.legal_status] || s.legal_status, kind: "plain" });
    // 학력 인정 배지가 반드시 포함되도록 순서만 조정: REGISTERED는 [교육청 등록, 학력 미인정]
    return list;
  }

  function checkConsistency(s) {
    return EXPECTED_ACCREDITS[s.legal_status] === s.accredits_diploma;
  }

  function needsGedNotice(s) {
    return s.accredits_diploma === false;
  }

  // 필터 — null이면 그 조건 미적용. 우열·랭킹 없음(시도→이름 순은 로더에서 고정).
  function filterSchools(list, f) {
    const q = f || {};
    return list.filter((s) =>
      (q.accredit == null || s.accredits_diploma === q.accredit) &&
      (q.sido == null || s.region_sido === q.sido) &&
      (q.level == null || (s.school_levels || []).includes(q.level)) &&
      (q.boarding !== true || s.is_boarding === true) &&
      (q.entrust !== true || s.accepts_entrustment === true)
    );
  }

  const norm = (t) => String(t || "").replace(/\s+/g, "").toLowerCase();
  function searchByName(list, query) {
    const q = norm(query);
    if (!q) return [];
    return list.filter((s) => norm(s.name).includes(q));
  }

  function sidoList(list) {
    return [...new Set(list.map((s) => s.region_sido))];
  }

  return { LEGAL_LABELS, EXPECTED_ACCREDITS, LEVEL_LABELS, CHARACTER_LABELS, badges, checkConsistency, needsGedNotice, filterSchools, searchByName, sidoList };
});
