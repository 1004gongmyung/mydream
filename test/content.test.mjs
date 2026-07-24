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
