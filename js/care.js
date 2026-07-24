// 위기 감지 로직 (Deep Module)
// 인터페이스: detectCrisis(careData, text) → boolean
// 원칙: 감지되면 호출자는 어떤 진로 답변·검색도 실행하지 말고 즉시 안내 화면으로 전환한다.
// 검색 외에 입력 기능(저널·체크인)이 추가되면 반드시 같은 함수를 거친다.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MapsiCare = factory();
})(typeof self !== "undefined" ? self : this, function () {
  function normalize(text) {
    return String(text || "").replace(/\s+/g, "").toLowerCase();
  }

  function detectCrisis(careData, text) {
    const t = normalize(text);
    if (!t) return false;
    return careData.crisisKeywords.some((kw) => t.includes(normalize(kw)));
  }

  return { detectCrisis, normalize };
});
