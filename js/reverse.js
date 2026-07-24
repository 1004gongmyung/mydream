// 역방향 로직 (Deep Module) — 과목 취향("시간이 빨리 가는 과목") → 계열 가설
// 인터페이스: trackScores(data, subjectIds) → [{track, score, subjects[]}] 내림차순
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MapsiReverse = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const WEIGHT = { P: 2, S: 1 };

  function trackScores(data, subjectIds) {
    const acc = {}; // trackId → {score, subjects[]}
    for (const sid of subjectIds) {
      const subject = data.subjects.find((s) => s.id === sid);
      if (!subject) continue;
      for (const [trackId, link] of Object.entries(subject.links)) {
        if (!acc[trackId]) acc[trackId] = { score: 0, subjects: [] };
        acc[trackId].score += WEIGHT[link] || 0;
        acc[trackId].subjects.push(subject.name);
      }
    }
    return data.tracks
      .map((t) => ({ track: t, score: acc[t.id] ? acc[t.id].score : 0, subjects: acc[t.id] ? acc[t.id].subjects : [] }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  return { trackScores, WEIGHT };
});
