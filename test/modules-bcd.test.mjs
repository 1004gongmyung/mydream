// 체험 DB·퀘스트(모듈 C), 조건 대시보드(모듈 B), 저널 관련 데이터 테스트
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const EXPLORE = require(join(here, "..", "data", "explore.data.js"));
const QUEST = require(join(here, "..", "data", "quest.data.js"));
const JOBS = require(join(here, "..", "data", "jobs.data.js"));
const LENS = require(join(here, "..", "data", "lens.data.js"));
const MODULES = require(join(here, "..", "data", "modules.data.js"));
const Quests = require(join(here, "..", "js", "quests.js"));

// ---- 체험 DB ----
test("체험 DB: 확충분 포함 25곳 이상, 필수 필드 완비, 유료면 요금 표기", () => {
  assert.ok(EXPLORE.entries.length >= 25, `현재 ${EXPLORE.entries.length}곳`);
  const ids = new Set();
  for (const e of EXPLORE.entries) {
    assert.ok(e.id && e.name && e.org && e.desc && e.region, `${e.id}: 필드 누락`);
    assert.ok(!ids.has(e.id), `${e.id}: 중복`); ids.add(e.id);
    assert.ok(e.url.startsWith("https://"), `${e.id}: URL 형식`);
    assert.ok([true, false].includes(e.free), `${e.id}: free 플래그`);
    if (!e.free) assert.ok(e.costNote, `${e.id}: 유료인데 요금 표기 없음 (정직 원칙)`);
    assert.ok([true, false].includes(e.personal), `${e.id}: personal 플래그`);
    assert.ok([true, false, null].includes(e.openToAll), `${e.id}: openToAll 플래그`);
  }
});

test("체험 DB: 개인 신청 가능이 다수 (개인신청 필터 기본 원칙)", () => {
  const personal = EXPLORE.entries.filter((e) => e.personal).length;
  assert.ok(personal >= EXPLORE.entries.length * 0.6, `개인 신청 ${personal}/${EXPLORE.entries.length}`);
});

// ---- 퀘스트 ----
test("퀘스트: 15개, 6개 역량군 유효, 모든 미션이 앱 밖 행동", () => {
  assert.equal(QUEST.missions.length, 15);
  const skillIds = new Set(QUEST.skills.map((s) => s.id));
  for (const m of QUEST.missions) {
    assert.ok(skillIds.has(m.skill), `${m.id}: 없는 역량 ${m.skill}`);
    assert.ok(m.title && m.action, `${m.id}: 필드 누락`);
    assert.ok(m.action.trim().endsWith("요."), `${m.id}: -해요체 문장 아님`);
  }
});

test("퀘스트 편성 규칙: 강소·신기술 미션 40% 이상 (내부 규칙 — UI 비노출)", () => {
  assert.ok(Quests.emergingRatio(QUEST) >= 0.4, `비율 ${Quests.emergingRatio(QUEST)}`);
});

test("퀘스트: 금전 보상·랭킹 표현 금지", () => {
  const text = JSON.stringify(QUEST);
  for (const b of ["포인트", "현금", "상금", "랭킹", "순위"]) assert.ok(!text.includes(b), `금지: ${b}`);
});

test("퀘스트 진행 집계: 역량별 완료 수, 미션 조회", () => {
  const p = Quests.progressBySkill(QUEST, { c1: { date: "2026-07-24" }, c2: { date: "2026-07-24" }, v2: { date: "2026-07-24" } });
  const cur = p.find((x) => x.skill.id === "curiosity");
  assert.equal(cur.done, 2);
  assert.equal(cur.total, 3);
  assert.equal(Quests.missionById(QUEST, "b3").skill, "observe");
  assert.equal(Quests.missionById(QUEST, "없음"), null);
});

// ---- 조건 대시보드 ----
test("직업 카드: 17개, 필수 섹션 완비, 나침반 직업군과 연결", () => {
  assert.equal(JOBS.jobs.length, 17);
  const clusterIds = new Set(MODULES.clusters.map((c) => c.id));
  for (const j of JOBS.jobs) {
    assert.ok(j.name && j.summary && j.aiNote, `${j.id}: 필드 누락`);
    assert.ok(j.paths.main.length >= 1 && j.paths.alt.length >= 1, `${j.id}: 경로/대안 누락`);
    assert.ok(j.conditions.length >= 2, `${j.id}: 조건 노트 부족`);
    assert.ok(clusterIds.has(j.clusterId), `${j.id}: 없는 직업군 ${j.clusterId}`);
    assert.ok(j.relatedQuestions.length >= 1, `${j.id}: 관련 질문 없음`);
  }
});

test("직업 카드: 구조 한 줄(렌즈 데이터)과 17개 전부 1:1 매칭", () => {
  const lensJobs = new Set(LENS.structureLines.map((s) => s.job));
  for (const j of JOBS.jobs) assert.ok(lensJobs.has(j.name), `${j.id}(${j.name}): 구조 한 줄 없음`);
});

test("직업 카드: 나침반 14개 직업군 전부에 카드 최소 1장 (도감 연결 보장)", () => {
  const covered = new Set(JOBS.jobs.map((j) => j.clusterId));
  for (const c of MODULES.clusters) assert.ok(covered.has(c.id), `직업군 ${c.id}(${c.name}): 조건 카드 없음`);
});

test("직업 카드 정직 원칙: 미검증 임금 수치 없음, 유일한 수치는 검증 칩과 함께", () => {
  for (const j of JOBS.jobs) {
    const text = JSON.stringify(j);
    const hasNumbers = /\d+(\.\d+)?%|\d+만 원/.test(text.replace(/G1|K[0-9]|A\d+|E\d+/g, ""));
    if (hasNumbers) assert.ok(j.conditionChip, `${j.id}: 수치가 있는데 출처 칩 없음`);
  }
  assert.ok(JOBS.wagePendingNote.includes("고용24"), "임금 연동 안내 없음");
  assert.equal(JOBS.wageCommonRef.chip.grade, "①");
});

test("직업 카드: 미화·훈계 표현 금지", () => {
  const text = JSON.stringify(JOBS);
  for (const b of ["유망한 직업", "안정적인 직업이에요", "추천해요", "해야 해요", "꿈을 포기"]) {
    assert.ok(!text.includes(b), `금지: ${b}`);
  }
});
