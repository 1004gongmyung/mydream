// D-day 내비게이션·오늘의 5분 몫·직업 도감 테스트
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const DDAY = require(join(here, "..", "data", "dday.data.js"));
const JOBDEX = require(join(here, "..", "data", "jobdex.data.js"));
const Daily = require(join(here, "..", "js", "daily.js"));

// ---- D-day ----
test("D-day: 중3은 2026-07-24 기준 고입 시즌까지 D-130", () => {
  const ev = Daily.nextEvent(DDAY, "중3", "2026-07-24");
  assert.equal(ev.label, "고입 원서 시즌");
  assert.equal(ev.dday, 130);
  assert.ok(ev.note.includes("확인"), "일정 확인 안내 병기 원칙");
});

test("D-day: 기준일이 지나면 다음 해로 롤오버 (고3, 10월 → 다음 해 9월)", () => {
  const ev = Daily.nextEvent(DDAY, "고3", "2026-10-01");
  assert.equal(ev.date, "2027-09-01");
  assert.equal(ev.dday, 335);
});

test("D-day: 학교밖은 연 2회 중 가까운 검정고시 시즌 (7월 → 8월)", () => {
  const ev = Daily.nextEvent(DDAY, "학교밖", "2026-07-24");
  assert.equal(ev.dday, 8);
  assert.ok(ev.label.includes("하반기"));
  const spring = Daily.nextEvent(DDAY, "학교밖", "2026-12-01");
  assert.ok(spring.label.includes("상반기"), "12월엔 다음 해 4월이 가까움");
});

test("D-day: 중1·중2는 카운트다운 없음 (탐색 시기)", () => {
  assert.equal(Daily.nextEvent(DDAY, "중1", "2026-07-24"), null);
  assert.equal(Daily.nextEvent(DDAY, "중2", "2026-07-24"), null);
});

test("5분 몫: 모든 학년에 풀 5개 이상, 결정적이며 날마다 회전", () => {
  for (const grade of Object.keys(DDAY.tasks)) {
    assert.ok(DDAY.tasks[grade].length >= 5, `${grade}: 몫 부족`);
    for (const t of DDAY.tasks[grade]) assert.ok(t.text, `${grade}: 텍스트 없음`);
  }
  const t1 = Daily.todaysTask(DDAY, "고1", "2026-07-24");
  assert.deepEqual(t1, Daily.todaysTask(DDAY, "고1", "2026-07-24"));
  const seen = new Set();
  for (let d = 20; d < 25; d++) seen.add(Daily.todaysTask(DDAY, "고1", "2026-07-" + d).text);
  assert.equal(seen.size, 5, "5일 동안 5개 몫이 다 돌지 않음");
});

test("5분 몫: 압박 표현 금지", () => {
  const text = JSON.stringify(DDAY.tasks);
  for (const b of ["해야 해요", "필수", "놓치면", "지금 당장", "매일"]) {
    assert.ok(!text.includes(b), `금지: ${b}`);
  }
});

// ---- 직업 도감 ----
test("도감: 36종 이상, id 중복 없음, 각 2~3문장, 분야·직업군 연결 유효", () => {
  assert.ok(JOBDEX.jobs.length >= 36, `현재 ${JOBDEX.jobs.length}종`);
  const MODULES = require(join(here, "..", "data", "modules.data.js"));
  const clusterIds = new Set(MODULES.clusters.map((c) => c.id));
  const ids = new Set();
  for (const j of JOBDEX.jobs) {
    assert.ok(!ids.has(j.id), `${j.id}: 중복`); ids.add(j.id);
    assert.ok(j.name && j.field, `${j.id}: 필드 누락`);
    assert.ok(j.lines.length >= 2 && j.lines.length <= 3, `${j.id}: 문장 수 ${j.lines.length}`);
    if (j.clusterId) assert.ok(clusterIds.has(j.clusterId), `${j.id}: 없는 직업군`);
  }
});

test("도감: 수치·유망 단정 표현 금지 (정성 설명만)", () => {
  const text = JSON.stringify(JOBDEX);
  for (const b of ["연봉", "%", "유망한 직업", "전망이 밝", "억대"]) {
    assert.ok(!text.includes(b), `금지: ${b}`);
  }
});

test("도감: 오늘의 직업은 결정적이고 풀 크기 주기로 전부 순환", () => {
  const j1 = Daily.todaysJob(JOBDEX, "2026-07-24");
  assert.equal(j1.id, Daily.todaysJob(JOBDEX, "2026-07-24").id);
  const n = JOBDEX.jobs.length;
  const seen = new Set();
  const base = Daily._internal.dayIndex("2026-01-01");
  for (let d = 0; d < n; d++) {
    const key = new Date((base + d) * 86400000).toISOString().slice(0, 10);
    seen.add(Daily.todaysJob(JOBDEX, key).id);
  }
  assert.equal(seen.size, n, `${n}일 동안 전 직업이 돌지 않음`);
});
