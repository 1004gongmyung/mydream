// 렌즈 로직 (Deep Module) — 하루 한 장 노출 규칙과 카드 선택
// 인터페이스: isLensDay(dayKey) / todaysCard(data, dayKey) / cardById(data, id)
// 원칙 4(통합설계): 푸시가 아니라 홈 노출, 주 2~3회만. 매일 노출하지 않는다.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MapsiLens = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const LENS_WEEKDAYS = [0, 2, 4]; // 7일 중 3일만 노출 (주 2~3회)

  function dayIndex(dayKey) {
    return Math.floor(Date.parse(dayKey + "T00:00:00Z") / 86400000);
  }

  function isLensDay(dayKey) {
    return LENS_WEEKDAYS.includes(dayIndex(dayKey) % 7);
  }

  function todaysCard(data, dayKey) {
    const cards = data.dailyCards;
    return cards[dayIndex(dayKey) % cards.length];
  }

  function cardById(data, id) {
    return data.dailyCards.find((c) => c.id === id) || null;
  }

  return { LENS_WEEKDAYS, isLensDay, todaysCard, cardById, _internal: { dayIndex } };
});
