// 나침반·역방향 모듈 테스트: node --test test/modules.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const DATA = require(join(here, "..", "data", "modules.data.js"));
const Compass = require(join(here, "..", "js", "compass.js"));
const Reverse = require(join(here, "..", "js", "reverse.js"));

// ---- 데이터 불변식 ----
test("나침반 데이터: 6축, 각 축에 양자택일 라벨", () => {
  assert.equal(DATA.axes.length, 6);
  for (const ax of DATA.axes) {
    assert.ok(ax.key && ax.q && ax.left && ax.right, `축 불완전: ${ax.key}`);
  }
});

test("직업군 데이터: 12개 이상, 벡터 키·값 유효, 예시 직업 3개 이상", () => {
  assert.ok(DATA.clusters.length >= 12);
  const axisKeys = new Set(DATA.axes.map((a) => a.key));
  for (const c of DATA.clusters) {
    assert.ok(c.name && c.day, `${c.id}: 이름/하루 설명 없음`);
    assert.ok(c.jobs.length >= 3, `${c.id}: 예시 직업 부족`);
    for (const [k, v] of Object.entries(c.vector)) {
      assert.ok(axisKeys.has(k), `${c.id}: 없는 축 ${k}`);
      assert.ok([null, "L", "R"].includes(v), `${c.id}: 잘못된 값 ${v}`);
    }
  }
});

test("표현 원칙: 직업군 설명에 단정 표현 금지", () => {
  const banned = ["딱 맞는", "정답", "입니다", "해야 해요"];
  for (const c of DATA.clusters) {
    for (const word of banned) {
      assert.ok(!c.day.includes(word) && !c.name.includes(word), `${c.id}: 금지 표현 "${word}"`);
    }
  }
});

test("역방향 데이터: 과목 15개 이상, 모든 링크가 실제 계열을 가리킴", () => {
  assert.ok(DATA.subjects.length >= 15);
  const trackIds = new Set(DATA.tracks.map((t) => t.id));
  for (const s of DATA.subjects) {
    const links = Object.keys(s.links);
    assert.ok(links.length >= 1, `${s.id}: 계열 연결 없음`);
    for (const t of links) assert.ok(trackIds.has(t), `${s.id}: 없는 계열 ${t}`);
    for (const v of Object.values(s.links)) assert.ok(["P", "S"].includes(v));
  }
});

// ---- 나침반 로직 ----
test("나침반: 완전 일치 직업군이 1위, 결과 6~10개", () => {
  // 개발·데이터 벡터 그대로 선택 (null 축은 임의)
  const picks = { rhythm: "L", social: "L", space: "L", risk: "L", mode: "R", object: "R" };
  const results = Compass.scoreClusters(DATA, picks);
  assert.ok(results.length >= 6 && results.length <= 10, `결과 수 ${results.length}`);
  // 연구·과학(research)은 이 picks와 6/6 완전 일치
  assert.equal(results[0].cluster.id, "research");
  assert.equal(results[0].score, 6);
});

test("나침반: 건너뛴 축(null)이 있어도 동작, 결정적", () => {
  const picks = { rhythm: null, social: "L", space: null, risk: null, mode: "L", object: null };
  const r1 = Compass.scoreClusters(DATA, picks);
  const r2 = Compass.scoreClusters(DATA, picks);
  assert.deepEqual(r1.map((x) => x.cluster.id), r2.map((x) => x.cluster.id));
  assert.ok(r1.length >= 6);
});

test("나침반: 매칭 이유 수 = 점수 (설명 가능성)", () => {
  const picks = { rhythm: "R", social: "L", space: "L", risk: "R", mode: "L", object: null };
  for (const r of Compass.scoreClusters(DATA, picks)) {
    assert.equal(r.matched.length, r.score, r.cluster.id);
  }
});

test("나침반: 렌즈 한 줄은 최대 1개, 혼자·창작이면 렌즈 ③", () => {
  const line = Compass.lensLineFor(DATA, { social: "L", mode: "L" });
  assert.ok(line && line.includes("렌즈 ③"));
  assert.equal(typeof line, "string");
  const none = Compass.lensLineFor(DATA, { rhythm: "L" });
  assert.equal(none, null); // 해당 없으면 침묵 (조미료 원칙)
});

test("나침반: 전부 건너뛰면 전 직업군 0점이어도 6개 가설 제시", () => {
  const results = Compass.scoreClusters(DATA, {});
  assert.equal(results.length, 6);
  assert.ok(results.every((r) => r.score === 0));
});

// ---- 역방향 로직 ----
test("역방향: 물리학+정보 → 공학이 1위, 기여 과목 표시", () => {
  const results = Reverse.trackScores(DATA, ["phys", "info"]);
  assert.equal(results[0].track.id, "eng");
  assert.equal(results[0].score, 4); // P(2) + P(2)
  assert.deepEqual(results[0].subjects, ["물리학", "정보(프로그래밍)"]);
});

test("역방향: 생명과학+화학 → 의약·보건과 자연이 상위", () => {
  const results = Reverse.trackScores(DATA, ["bio", "chem"]);
  const top2 = results.slice(0, 2).map((r) => r.track.id).sort();
  assert.deepEqual(top2, ["med", "nat"].sort());
});

test("역방향: 빈 선택 → 빈 결과 (강요하지 않음)", () => {
  assert.deepEqual(Reverse.trackScores(DATA, []), []);
});

test("역방향: 없는 과목 id는 무시하고 동작", () => {
  const results = Reverse.trackScores(DATA, ["phys", "없는과목"]);
  // 물리학 단독은 공학·자연 동점(각 2점) — 없는 id가 점수에 영향을 주지 않아야 한다
  const ids = results.map((r) => r.track.id).sort();
  assert.deepEqual(ids, ["eng", "nat"].sort());
  assert.ok(results.every((r) => r.score === 2));
});
