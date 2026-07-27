// 콘텐츠 파이프라인 + 회전 로직 테스트: node --test test/content.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const Mapsi = require(join(here, "..", "js", "content.js"));
const content = JSON.parse(readFileSync(join(here, "..", "data", "content.json"), "utf8"));

test("콘텐츠: 질문 63건, 답변 63건, 1:1 매칭", () => {
  assert.equal(content.questions.length, 63);
  const aIds = Object.keys(content.answers);
  assert.equal(aIds.length, 63);
  for (const q of content.questions) assert.ok(content.answers[q.id], `답변 누락: ${q.id}`);
});

test("콘텐츠: 모든 답변에 L1 헤드라인·L2·L3 라벨 존재", () => {
  for (const [id, a] of Object.entries(content.answers)) {
    assert.ok(a.l1.headline.length > 0, `${id} L1 헤드라인 없음`);
    assert.ok(a.l2.body.length > 0, `${id} L2 없음`);
    assert.ok(a.l3.label.length > 0, `${id} L3 없음`);
  }
});

test("검증 원칙: 미검증 placeholder·삭제된 무출처 문장 부재", () => {
  const all = JSON.stringify(content.answers);
  assert.ok(!all.includes("[확인 후 기입]"), "미검증 placeholder 잔존");
  assert.ok(!all.includes("1년 뒤엔 절반쯤"), "B3 무출처 문장 잔존");
});

test("회전: 8장 고정, 중복 없음, 결정적", () => {
  for (const grade of Mapsi.GRADES) {
    const cards = Mapsi.rotationFor(content, grade, "2026-07-24");
    assert.equal(cards.length, 8, `${grade}: 카드 수 ${cards.length}`);
    assert.equal(new Set(cards.map((q) => q.id)).size, 8, `${grade}: 중복 카드`);
    const again = Mapsi.rotationFor(content, grade, "2026-07-24");
    assert.deepEqual(cards.map((q) => q.id), again.map((q) => q.id), `${grade}: 비결정적`);
  }
});

test("회전: 날짜가 다르면 구성도 달라진다 (회전이 실제로 작동)", () => {
  const d1 = Mapsi.rotationFor(content, "중2", "2026-07-24").map((q) => q.id).join(",");
  const d2 = Mapsi.rotationFor(content, "중2", "2026-07-25").map((q) => q.id).join(",");
  assert.notEqual(d1, d2);
});

test("노출 원칙: I군은 어떤 학년 회전에도 나오지 않는다", () => {
  for (const grade of Mapsi.GRADES) {
    const cards = Mapsi.rotationFor(content, grade, "2026-07-24");
    assert.ok(cards.every((q) => q.group !== "I"), `${grade}: I군 노출됨`);
  }
});

test("노출 원칙: H군은 학교밖에서만 회전, 학년별 맞춤군 포함", () => {
  for (const grade of ["중1", "중2", "중3", "고1", "고2", "고3"]) {
    const cards = Mapsi.rotationFor(content, grade, "2026-07-24");
    assert.ok(cards.every((q) => q.group !== "H"), `${grade}: H군 노출됨`);
  }
  const out = Mapsi.rotationFor(content, "학교밖", "2026-07-24");
  assert.ok(out.some((q) => q.group === "H"), "학교밖: H군 미포함");
  const g1 = Mapsi.rotationFor(content, "고1", "2026-07-24");
  assert.ok(g1.some((q) => q.group === "D"), "고1: D군 미포함");
});

test("전체 열람: 11개 군 모두 노출 (배제하지 않음 — I·H 포함)", () => {
  const groups = Mapsi.groupsFor(content);
  assert.equal(groups.length, 11);
  for (const g of groups) assert.ok(g.questions.length > 0, `${g.group}군 비어 있음`);
});

test("시기 내비게이션: 모든 학년에 한 줄 존재", () => {
  for (const grade of Mapsi.GRADES) assert.ok(Mapsi.periodNavFor(grade).length > 0);
});

// ---- 직업 검색 2층 구조 (v2.3) ----
const JOBS = require(join(here, "..", "data", "jobs.data.js"));
const MODULES = require(join(here, "..", "data", "modules.data.js"));

test("직업군 태그: 조건 카드 역인덱스와 정합 — 태그는 전부 유효한 직업군 id", () => {
  const clusterIds = new Set(MODULES.clusters.map((c) => c.id));
  for (const q of content.questions) {
    assert.ok(Array.isArray(q.jobTags), `${q.id}: jobTags 필드 없음`);
    for (const t of q.jobTags) assert.ok(clusterIds.has(t), `${q.id}: 없는 직업군 태그 ${t}`);
  }
  for (const j of JOBS.jobs) {
    for (const qid of j.relatedQuestions || []) {
      const q = content.questions.find((x) => x.id === qid);
      assert.ok(q.jobTags.includes(j.clusterId), `${qid}: ${j.id}(${j.clusterId}) 역인덱스 누락`);
    }
  }
});

test("직업 인식: 직업명이 든 문장에서 조건 카드 매칭, 무관 입력은 빈 배열", () => {
  assert.deepEqual(Mapsi.findJobsByQuery(JOBS.jobs, "간호사").map((j) => j.id), ["nurse"]);
  assert.ok(Mapsi.findJobsByQuery(JOBS.jobs, "게임 개발자 되려면").some((j) => j.id === "gamedev"));
  assert.deepEqual(Mapsi.findJobsByQuery(JOBS.jobs, "오늘 점심 뭐 먹지"), []);
  assert.deepEqual(Mapsi.findJobsByQuery(JOBS.jobs, "가"), [], "한 글자는 무시");
});

test("검색 학년 조건: 시기에 안 맞는 질문은 결과에서 제외", () => {
  const jung3 = Mapsi.searchQuestions(content, "특성화고", "중3");
  assert.ok(jung3.some((q) => q.group === "C"), "중3은 C군 노출");
  const go1 = Mapsi.searchQuestions(content, "특성화고", "고1");
  assert.ok(!go1.some((q) => q.group === "C"), "고1엔 중3 전용 C군 비노출");
  assert.deepEqual(Mapsi.searchQuestions(content, "특성화고"), Mapsi.searchQuestions(content, "특성화고", null), "학년 없으면 전체 풀");
});

test("직업 관련 질문: 태그+학년 매칭만 노출, 0건이면 빈 배열(전체 대체 금지)", () => {
  const nurse = JOBS.jobs.find((j) => j.id === "nurse");
  const go2 = Mapsi.questionsForJob(content, nurse, "고2");
  assert.ok(go2.length >= 1 && go2.every((q) => q.jobTags.includes("care")), "care 태그 질문만");
  assert.ok(go2.some((q) => q.id === "E5"), "고2엔 E5 포함");
  assert.ok(!Mapsi.questionsForJob(content, nurse, "중1").some((q) => q.id === "E5"), "중1엔 E5(고2·3 전용) 제외");
  assert.deepEqual(Mapsi.questionsForJob(content, { clusterId: "없는군" }, "중1"), [], "매칭 0건은 빈 배열");
});

test("커버리지: 17개 직업 × 7개 학년 전 조합에서 관련 질문 2건 이상, 첫 결과는 특화 질문", () => {
  const total = MODULES.clusters.length;
  for (const j of JOBS.jobs) {
    for (const g of Mapsi.GRADES) {
      const qs = Mapsi.questionsForJob(content, j, g);
      assert.ok(qs.length >= 2, `${j.id}×${g}: ${qs.length}건 — 최소 2건 보장 실패`);
      assert.ok(qs[0].jobTags.length < total, `${j.id}×${g}: 첫 결과가 보편 질문 — 특화 질문이 먼저여야 함`);
    }
  }
});

test("직업 인식 별칭: 병기형 이름('유튜버·크리에이터')의 문장 속 언급도 매칭", () => {
  assert.ok(Mapsi.findJobsByQuery(JOBS.jobs, "유튜버 되고 싶어요").some((j) => j.id === "creator"));
  assert.ok(Mapsi.findJobsByQuery(JOBS.jobs, "크리에이터").some((j) => j.id === "creator"));
  assert.ok(Mapsi.findJobsByQuery(JOBS.jobs, "웹툰 작가는 어때").some((j) => j.id === "webtoon"));
  assert.ok(Mapsi.findJobsByQuery(JOBS.jobs, "창업가").some((j) => j.id === "seller"));
});
