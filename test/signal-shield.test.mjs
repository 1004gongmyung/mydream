// 신호 리포트·첫 일자리 방패 테스트
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const Signal = require(join(here, "..", "js", "signal.js"));
const Shield = require(join(here, "..", "js", "shield.js"));
const SHIELD = require(join(here, "..", "data", "shield.data.js"));

// ---- 신호 리포트 ----
test("신호: 3개 미만이면 가설 없이 '모으는 중' + 다음 제안", () => {
  const r = Signal.buildReport({ compassDone: true, clusterTop: "개발·데이터" });
  assert.equal(r.total, 1);
  assert.equal(r.ready, false);
  assert.equal(r.hypothesis, null);
  assert.ok(r.nextSteps.length >= 1 && r.nextSteps.length <= 3);
  assert.ok(r.nextSteps.every((s) => s.route !== "compass"), "이미 한 나침반을 또 제안함");
});

test("신호: 나침반+역방향+저널이면 겹침 가설 (확인 요청으로 끝남 — 단정 금지)", () => {
  const r = Signal.buildReport({
    compassDone: true, clusterTop: "콘텐츠·창작",
    reverseDone: true, trackTop: "사회",
    journalCount: 2,
  });
  assert.equal(r.total, 4);
  assert.ok(r.ready);
  assert.ok(r.hypothesis.includes("콘텐츠·창작") && r.hypothesis.includes("사회"));
  assert.ok(r.hypothesis.endsWith("확인해볼래요?"), "가설이 확인 요청으로 끝나지 않음");
});

test("신호: 방향 정보가 없으면 신호가 많아도 가설 없음 (억지 가설 금지)", () => {
  const r = Signal.buildReport({ journalCount: 5, questDone: 3 });
  assert.ok(r.ready);
  assert.equal(r.hypothesis, null);
});

test("신호: 빈 입력도 안전, 전부 0", () => {
  const r = Signal.buildReport({});
  assert.equal(r.total, 0);
  assert.equal(r.ready, false);
  assert.equal(r.nextSteps.length, 3);
});

// ---- 첫 일자리 방패 ----
test("계산기: 주 20시간 × 10,320원 — 주휴 포함 주급·월 추정", () => {
  const p = Shield.calcPay(10320, 20);
  assert.equal(p.base, 206400);
  assert.equal(p.jusu, 41280); // (20/40)×8시간 × 10,320
  assert.equal(p.weekly, 247680);
  assert.ok(p.hasJusu);
  assert.equal(p.youthCapExceeded, false);
  assert.equal(p.monthly, Math.round(247680 * (365 / 7 / 12)));
});

test("계산기: 주 14시간은 주휴 없음, 주 40시간은 주휴 8시간 상한", () => {
  const p14 = Shield.calcPay(10320, 14);
  assert.equal(p14.jusu, 0);
  assert.equal(p14.hasJusu, false);
  const p40 = Shield.calcPay(10320, 40);
  assert.equal(p40.jusu, 10320 * 8);
});

test("계산기: 주 36시간이면 청소년 한도(35시간) 초과 플래그", () => {
  assert.equal(Shield.calcPay(10320, 36).youthCapExceeded, true);
  assert.equal(Shield.calcPay(10320, 35).youthCapExceeded, false);
});

test("계산기: 이상 입력(음수·문자)에도 안전", () => {
  const p = Shield.calcPay("abc", -5);
  assert.equal(p.weekly, 0);
  assert.equal(p.monthly, 0);
});

test("방패 데이터: 최저임금 검증치·칩, 체크리스트 10개, 법률 자문 아님 명시", () => {
  assert.equal(SHIELD.minWage.hourly, 10320);
  assert.equal(SHIELD.minWage.year, 2026);
  assert.equal(SHIELD.minWage.monthly209, 2156880);
  assert.ok(SHIELD.minWage.chip.label.includes("최저임금위원회"));
  assert.equal(SHIELD.checklist.length, 10);
  assert.ok(SHIELD.contractMust.length >= 5 && SHIELD.redFlags.length >= 4);
  assert.ok(SHIELD.disclaimer.includes("법률 자문이 아니라"));
});

test("방패 데이터: 겁주기·훈계 표현 금지, 권리 프레임 유지", () => {
  const text = JSON.stringify(SHIELD);
  for (const b of ["절대 하지 마", "당하지 마", "조심하세요", "위험하니까 하지"]) {
    assert.ok(!text.includes(b), `금지: ${b}`);
  }
  assert.ok(SHIELD.rightsNote.includes("같은 일이면 같은 임금"));
});
