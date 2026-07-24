// 데일리 로직 (Deep Module) — D-day 계산과 오늘의 5분 몫, 오늘의 낯선 직업
// 원칙: 결정적(같은 날 같은 결과), 스트릭·출석 개념 없음(놓쳐도 손해 없이 순환).
// 인터페이스: nextEvent(ddayData, grade, dayKey) / todaysTask(ddayData, grade, dayKey) / todaysJob(jobdexData, dayKey)
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MapsiDaily = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const DAY_MS = 86400000;

  function dayIndex(dayKey) {
    return Math.floor(Date.parse(dayKey + "T00:00:00Z") / DAY_MS);
  }

  // 학년의 다음 결정 이벤트: 올해 기준일이 지났으면 다음 발생일로 롤오버
  function nextEvent(ddayData, grade, dayKey) {
    const events = ddayData.events[grade] || [];
    if (events.length === 0) return null;
    const today = dayIndex(dayKey);
    const year = Number(dayKey.slice(0, 4));
    let best = null;
    for (const ev of events) {
      for (const y of [year, year + 1]) {
        const key = y + "-" + String(ev.month).padStart(2, "0") + "-" + String(ev.day).padStart(2, "0");
        const d = dayIndex(key) - today;
        if (d >= 0 && (best === null || d < best.dday)) {
          best = { label: ev.label, note: ev.note, dday: d, date: key };
        }
      }
    }
    return best;
  }

  function todaysTask(ddayData, grade, dayKey) {
    const pool = ddayData.tasks[grade] || ddayData.tasks["중2"];
    return pool[dayIndex(dayKey) % pool.length];
  }

  function todaysJob(jobdexData, dayKey) {
    const jobs = jobdexData.jobs;
    return jobs[dayIndex(dayKey) % jobs.length];
  }

  return { nextEvent, todaysTask, todaysJob, _internal: { dayIndex } };
});
