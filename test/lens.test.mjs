// 렌즈 파일럿 테스트: node --test test/lens.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const DATA = require(join(here, "..", "data", "lens.data.js"));
const Lens = require(join(here, "..", "js", "lens.js"));

// ---- 데이터 불변식 ----
test("하루 한 장: 정확히 5장, 5단 구조(훅·구조·반대렌즈·진로·열린질문) 완비", () => {
  assert.equal(DATA.dailyCards.length, 5);
  for (const c of DATA.dailyCards) {
    assert.ok(c.id && c.title && c.lens, `${c.id}: 기본 필드 누락`);
    assert.ok(c.hook.length > 0, `${c.id}: 훅 없음`);
    assert.ok(c.structure.text && c.structure.flows.length >= 1, `${c.id}: 구조 그림 없음`);
    assert.ok(c.counter.includes("다르게 보면"), `${c.id}: 반대 렌즈 없음 (원칙 1)`);
    assert.ok(c.career.length > 0, `${c.id}: 진로 연결 없음`);
    assert.ok(c.openQuestion.trim().endsWith("?") || c.openQuestion.trim().endsWith("요."), `${c.id}: 열린 질문으로 끝나지 않음`);
    assert.ok(c.openQuestion.includes("?") || c.openQuestion.includes("볼래요") || c.openQuestion.includes("적어봐"), `${c.id}: 질문/제안형 아님`);
  }
});

test("하루 한 장: 렌즈 표기가 렌즈 10선에 실재", () => {
  const valid = new Set(DATA.lenses.map((l) => l.n));
  for (const c of DATA.dailyCards) assert.ok(valid.has(c.lens), `${c.id}: 없는 렌즈 ${c.lens}`);
  for (const s of DATA.structureLines) assert.ok(valid.has(s.lens), `${s.job}: 없는 렌즈 ${s.lens}`);
});

test("원칙 1: 단정·주입 표현 금지 (전체 렌즈 콘텐츠)", () => {
  const text = JSON.stringify(DATA);
  const banned = ["가 미래다", "미래는 ", "정답이에요", "해야 해요", "틀렸어요", "구세대", "입니다"];
  for (const b of banned) assert.ok(!text.includes(b), `금지 표현: ${b}`);
});

test("구조 한 줄: 정확히 17개 직업분, '이유 —' 구조 설명 형식", () => {
  assert.equal(DATA.structureLines.length, 17);
  for (const s of DATA.structureLines) {
    assert.ok(s.job && s.line, `${s.job}: 필드 누락`);
    assert.ok(s.line.includes("이유 —"), `${s.job}: 구조 설명 형식 아님`);
    assert.ok(s.line.includes("서예요"), `${s.job}: 인과(~라서/해서/있어서) 설명 형식 아님`);
  }
});

// ---- 노출 규칙 ----
test("노출: 7일 중 정확히 3일만 렌즈 요일 (주 2~3회, 매일 노출 금지)", () => {
  let count = 0;
  const base = "2026-07-";
  for (let d = 6; d <= 12; d++) { // 연속 7일
    if (Lens.isLensDay(base + String(d).padStart(2, "0"))) count++;
  }
  assert.equal(count, 3);
});

test("노출: 같은 날은 같은 카드(결정적), 5일 주기로 5장 전부 순환", () => {
  const seen = new Set();
  for (let d = 10; d < 15; d++) {
    const c1 = Lens.todaysCard(DATA, "2026-07-" + d);
    const c2 = Lens.todaysCard(DATA, "2026-07-" + d);
    assert.equal(c1.id, c2.id);
    seen.add(c1.id);
  }
  assert.equal(seen.size, 5, "5일 동안 5장이 모두 돌지 않음");
});

test("카드 조회: id로 찾기, 없는 id는 null", () => {
  assert.equal(Lens.cardById(DATA, "attention").lens, "⑩");
  assert.equal(Lens.cardById(DATA, "없는카드"), null);
});
