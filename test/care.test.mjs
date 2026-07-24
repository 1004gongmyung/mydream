// 위기 감지·안심 DB·검색 테스트: node --test test/care.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const CARE = require(join(here, "..", "data", "care.data.js"));
const Care = require(join(here, "..", "js", "care.js"));
const M = require(join(here, "..", "js", "content.js"));
const content = JSON.parse(readFileSync(join(here, "..", "data", "content.json"), "utf8"));

// ---- 위기 감지 ----
test("위기 감지: 죽음·자해·사라짐 계열은 띄어쓰기와 무관하게 감지", () => {
  const positives = [
    "죽고 싶어요", "그냥 죽을래", "자해를 해요", "사라지고 싶다",
    "살기 싫어요", "더 이상 살고 싶지 않아", "없어지고 싶어",
  ];
  for (const t of positives) assert.ok(Care.detectCrisis(CARE, t), `미감지: ${t}`);
});

test("위기 감지: 폭력·학대·가정 위기 호소 감지", () => {
  const positives = [
    "아빠가 때려요", "친구들이 괴롭혀요", "왕따 당하고 있어요",
    "학교폭력 당했어요", "집 나가고 싶어요", "성추행을 당했어요", "매일 맞고 살아요",
  ];
  for (const t of positives) assert.ok(Care.detectCrisis(CARE, t), `미감지: ${t}`);
});

test("위기 감지: 일반 진로 표현은 오감지하지 않음", () => {
  const negatives = [
    "특성화고 가면 망하나요", "죽어라 공부해도 성적이 안 올라요",
    "적성에 맞는 직업", "MBTI 직업 추천", "수시 정시 뭐가 유리해요",
    "코딩 못해도 AI 일 할 수 있나요", "부모님이 반대해요", "",
  ];
  for (const t of negatives) assert.ok(!Care.detectCrisis(CARE, t), `오감지: ${t}`);
});

// ---- 안심 DB 데이터 불변식 ----
test("안심 DB: 1차 창구는 1388, 상황 4종, 모든 항목에 이름·연락 방법", () => {
  assert.equal(CARE.primary.contact, "1388");
  assert.equal(CARE.situations.length, 4);
  for (const s of CARE.situations) {
    assert.ok(s.title && s.lines.length >= 1);
    for (const l of s.lines) {
      assert.ok(l.name, `${s.id}: 이름 없음`);
      assert.ok(l.contact || l.url, `${s.id}/${l.name}: 전화도 링크도 없음`);
    }
  }
});

test("안심 DB: 판단·진단 표현 금지 (정서 안전 규칙)", () => {
  const text = JSON.stringify(CARE);
  for (const banned of ["우울증", "진단", "괜찮아질 거", "힘내", "이겨내"]) {
    assert.ok(!text.includes(banned), `금지 표현: ${banned}`);
  }
});

// ---- 검색 ----
test("검색: 관련 질문이 상위에, 결과는 8개 이하", () => {
  const r1 = M.searchQuestions(content, "특성화고");
  assert.ok(r1.length > 0 && r1.length <= 8);
  assert.ok(["C2", "C3", "C6"].includes(r1[0].id), `1위가 ${r1[0].id}`);
  const r2 = M.searchQuestions(content, "MBTI");
  assert.equal(r2[0].id, "A3");
});

test("검색: 빈 검색어·한 글자는 빈 결과", () => {
  assert.deepEqual(M.searchQuestions(content, ""), []);
  assert.deepEqual(M.searchQuestions(content, "고"), []);
});

test("검색: 무의미 검색어는 결과 없음 (엉뚱한 추천 금지)", () => {
  assert.deepEqual(M.searchQuestions(content, "블랙홀 양자역학"), []);
});
