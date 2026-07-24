// 2단계 기능 테스트 — 포트폴리오·부모 카드·API 어댑터
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const Portfolio = require(join(here, "..", "js", "portfolio.js"));
const Api = require(join(here, "..", "js", "api.js"));
const PARENTS = require(join(here, "..", "data", "parents.data.js"));
const QUEST = require(join(here, "..", "data", "quest.data.js"));
const LENS = require(join(here, "..", "data", "lens.data.js"));

const datasets = { QUEST, LENS };

// ---- 포트폴리오 ----
test("포트폴리오: 퀘스트·저널·렌즈 답을 기록으로 수집, 최신순", () => {
  const records = Portfolio.collectRecords({
    quests: { b1: { date: "2026-07-20", note: "배달비 구조를 알게 됨" } },
    journal: [{ date: "2026-07-22", text: "영상 편집에 몰입" }],
    lensAnswers: { attention: "내 관심은 게임에 제일 많이 쓰였다" },
  }, datasets);
  assert.equal(records.length, 3);
  assert.equal(records[0].type, "몰입"); // 07-22가 최신
  assert.equal(records[1].type, "탐험");
  assert.equal(records[2].type, "생각"); // 날짜 없음 → 뒤
});

test("포트폴리오: 문장 초안 — 유형별 템플릿, 빈칸(______) 포함 결합 초안", () => {
  const r = { type: "탐험", label: "돈의 길 추적하기", detail: "배달비 구조를 알게 됨" };
  const d = Portfolio.draftFor(r);
  assert.ok(d.includes("돈의 길 추적하기") && d.includes("배달비 구조"));
  const combined = Portfolio.combinedDraft([r, { type: "몰입", label: "영상 편집", detail: "" }]);
  assert.ok(combined.includes("______"), "학생이 채울 빈칸이 없음 — 초안은 대필이 아니다");
  assert.equal(Portfolio.combinedDraft([]), "");
});

test("포트폴리오: 큐레이션 상한 3 (500자 축소 원칙)", () => {
  assert.equal(Portfolio.MAX_PICK, 3);
});

test("포트폴리오: 없는 미션·카드 id는 무시", () => {
  const records = Portfolio.collectRecords({ quests: { 없는것: { date: "2026-07-01" } }, lensAnswers: { 없는카드: "x" } }, datasets);
  assert.equal(records.length, 0);
});

// ---- 부모 카드 ----
test("부모 카드: 걱정 4유형, 각각 공감 문장·사실 카드·대화 질문 3개", () => {
  assert.equal(PARENTS.worries.length, 4);
  for (const w of PARENTS.worries) {
    assert.ok(w.parentLine.length > 0, `${w.id}: 공감 문장 없음`);
    assert.ok(w.facts.length >= 2, `${w.id}: 사실 카드 부족`);
    assert.equal(w.questions.length, 3, `${w.id}: 대화 질문 수`);
    assert.ok(w.bridge.length > 0, `${w.id}: 연결 문장 없음`);
  }
});

test("부모 카드: 수치가 있는 사실에는 반드시 출처 칩", () => {
  for (const w of PARENTS.worries) {
    for (const f of w.facts) {
      if (/\d+(\.\d+)?%|\d+만 원/.test(f.text)) assert.ok(f.chip, `${w.id}: 수치에 칩 없음 — "${f.text.slice(0, 20)}"`);
    }
  }
});

test("부모 카드: 부모 비난·설득 강요 표현 금지", () => {
  const text = JSON.stringify(PARENTS.worries);
  for (const b of ["부모님이 틀렸", "꼰대", "설득하세요", "이기세요", "구세대"]) {
    assert.ok(!text.includes(b), `금지: ${b}`);
  }
});

test("다국어 요약: 4개 언어 완비, 각 5문장, 제목 존재", () => {
  assert.equal(PARENTS.shareCard.langs.length, 4);
  for (const l of PARENTS.shareCard.langs) {
    const t = PARENTS.shareCard.texts[l.id];
    assert.ok(t && t.title.length > 0, `${l.id}: 제목 없음`);
    assert.equal(t.body.length, 5, `${l.id}: 문장 수`);
  }
});

// ---- API 어댑터 ----
test("API: 키 없으면 시드 폴백을 명시적으로 반환 (가짜 응답 금지)", async () => {
  const fakeStorage = { getItem: () => null };
  assert.equal(Api.hasKey("work24", fakeStorage), false);
  const r = await Api.fetchJobDetail("교사", fakeStorage);
  assert.equal(r.source, "seed");
  assert.equal(r.available, false);
  assert.ok(r.reason.includes("키"));
});

test("API: 키 등록 시 인식", () => {
  const fakeStorage = { getItem: () => JSON.stringify({ work24: "abc" }) };
  assert.equal(Api.hasKey("work24", fakeStorage), true);
  assert.equal(Api.hasKey("careernet", fakeStorage), false);
});
