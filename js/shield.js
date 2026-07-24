// 첫 일자리 방패 로직 (Deep Module) — 주급·주휴수당·월 추정 계산
// 인터페이스: calcPay(hourly, weeklyHours) — 근로기준법 규칙:
//   주휴수당: 주 15시간 이상 개근 시 (주당시간/40)×8시간분 (최대 8시간)
//   청소년(만 18세 미만) 기본 한도: 주 35시간 → 초과 시 youthCapExceeded 플래그
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MapsiShield = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const WEEKS_PER_MONTH = 365 / 7 / 12; // ≈ 4.345

  function calcPay(hourly, weeklyHours) {
    const h = Math.max(0, Number(hourly) || 0);
    const wh = Math.max(0, Number(weeklyHours) || 0);
    const base = Math.round(h * wh);
    const jusuHours = wh >= 15 ? Math.min(wh, 40) / 40 * 8 : 0;
    const jusu = Math.round(h * jusuHours);
    const weekly = base + jusu;
    return {
      base, jusu, weekly,
      monthly: Math.round(weekly * WEEKS_PER_MONTH),
      hasJusu: jusuHours > 0,
      youthCapExceeded: wh > 35,
    };
  }

  return { calcPay, WEEKS_PER_MONTH };
});
