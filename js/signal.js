// 신호 리포트 로직 (Deep Module) — 누적 흔적을 모아 '가설'을 제시한다 (여정 A 5단계, S0→S1)
// 원칙: 단정 금지. 리포트는 언제나 확인 요청("확인해볼래요?")으로 끝나는 가설이다.
// 인터페이스: buildReport(inputs)
//   inputs: { clusterTop: string|null, trackTop: string|null,
//             journalCount, questDone, lensCount, compassDone, reverseDone }
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MapsiSignal = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const READY_THRESHOLD = 3; // 신호 3개부터 가설 제시

  function buildReport(inputs) {
    const i = inputs || {};
    const journalCount = i.journalCount || 0;
    const questDone = i.questDone || 0;
    const lensCount = i.lensCount || 0;
    const signals = [
      { key: "compass", label: "나침반", count: i.compassDone ? 1 : 0 },
      { key: "reverse", label: "과목 취향", count: i.reverseDone ? 1 : 0 },
      { key: "journal", label: "몰입 기록", count: journalCount },
      { key: "quest", label: "탐험 완료", count: questDone },
      { key: "lens", label: "렌즈 한 줄 답", count: lensCount },
    ];
    const total = signals.reduce((s, x) => s + x.count, 0);
    const ready = total >= READY_THRESHOLD;

    let hypothesis = null;
    if (ready && i.clusterTop && i.trackTop) {
      hypothesis = `하루 취향은 ${i.clusterTop} 쪽을, 과목 취향은 ${i.trackTop} 계열을 가리켜요. 겹치는 자리를 확인해볼래요?`;
    } else if (ready && i.clusterTop) {
      hypothesis = `지금까지의 흔적이 ${i.clusterTop} 쪽을 가리켜요. 맞는지 확인해볼래요?`;
    } else if (ready && i.trackTop) {
      hypothesis = `과목 취향이 ${i.trackTop} 계열과 자주 만나요. 하루 취향(나침반)도 모아볼래요?`;
    }

    // 다음 신호 제안 — 없는 것부터, 최대 3개
    const nextSteps = [];
    if (!i.compassDone) nextSteps.push({ route: "compass", label: "나침반 2분 — 하루 취향 신호" });
    if (!i.reverseDone) nextSteps.push({ route: "reverse", label: "역방향 지도 — 과목 취향 신호" });
    if (journalCount < 3) nextSteps.push({ route: "journal", label: "강점 저널 한 줄 — 몰입 신호" });
    if (questDone < 1) nextSteps.push({ route: "quests", label: "3분 미션 하나 — 탐험 신호" });

    return { signals, total, ready, hypothesis, nextSteps: nextSteps.slice(0, 3) };
  }

  return { buildReport, READY_THRESHOLD };
});
