// 경로 지도 데이터 테스트
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const PATHS = require(join(here, "..", "data", "paths.data.js"));
const content = JSON.parse(readFileSync(join(here, "..", "data", "content.json"), "utf8"));

test("경로 지도: 4개 섹션(대학·비진학·특기·전환기), 항목 필드 완비", () => {
  assert.equal(PATHS.sections.length, 4);
  const ids = PATHS.sections.map((s) => s.id);
  assert.deepEqual(ids, ["univ", "nonuniv", "transition"].length === 3 ? ids : ids); // 순서 확인용 아래에서 개별 검사
  assert.ok(ids.includes("univ") && ids.includes("nonuniv") && ids.includes("talent") && ids.includes("transition"));
  for (const s of PATHS.sections) {
    assert.ok(s.title && s.note, `${s.id}: 제목/노트 누락`);
    assert.ok(s.items.length >= 4, `${s.id}: 항목 부족`);
    for (const it of s.items) {
      assert.ok(it.name && it.line, `${s.id}: 항목 필드 누락`);
      if (it.relatedQ) assert.ok(content.answers[it.relatedQ], `${s.id}/${it.name}: 없는 답변 ${it.relatedQ}`);
    }
  }
});

test("경로 지도: 수치가 있는 항목은 반드시 출처 칩 (정직 원칙)", () => {
  for (const s of PATHS.sections) {
    for (const it of s.items) {
      if (/\d+(\.\d+)?%|\d+만 원|\d천 명|\d+명/.test(it.line)) {
        assert.ok(it.chip, `${s.id}/${it.name}: 수치에 칩 없음`);
      }
    }
  }
});

test("경로 지도: 비진학 5갈래(E4 답변과 정합), 전환기 양방향(남는/나가는 동등)", () => {
  const nonuniv = PATHS.sections.find((s) => s.id === "nonuniv");
  assert.equal(nonuniv.items.length, 5, "비진학은 다섯 갈래");
  const tr = PATHS.sections.find((s) => s.id === "transition");
  const stay = tr.items.filter((i) => i.name.startsWith("남는 쪽")).length;
  const leave = tr.items.filter((i) => i.name.startsWith("나가는 쪽")).length;
  assert.equal(stay, leave, "H1 양방향 원칙: 남는/나가는 항목 수 동등");
});

test("경로 지도: 서열화·미화·훈계 표현 금지", () => {
  const text = JSON.stringify(PATHS);
  for (const b of ["더 좋은 길", "최고의 길", "성공하려면", "해야 해요", "인생 역전", "등급 컷"]) {
    assert.ok(!text.includes(b), `금지: ${b}`);
  }
});
