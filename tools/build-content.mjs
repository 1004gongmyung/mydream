// 콘텐츠 빌드: 마크다운 원본(질문레이어 v2, 답변엔진 v3) → data/content.json + data/content.data.js
// 원본이 단일 진실이다. 이 산출물을 손으로 고치지 말 것 — 마크다운을 고치고 다시 빌드한다.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const docsDir = join(here, "..", "..");
const outDir = join(here, "..", "data");

const QUESTIONS_MD = join(docsDir, "질문레이어_v2.md");
const ANSWERS_MD = join(docsDir, "답변엔진_63문_v3.md");

// 학년 타게팅: 그룹 기본값 (질문레이어 v2의 군 정의 기준)
const ALL_GRADES = ["중1", "중2", "중3", "고1", "고2", "고3", "학교밖"];
const GROUP_GRADES = {
  A: ALL_GRADES,
  B: ["중1", "중2"],
  C: ["중3"],
  D: ["고1"],
  E: ["고2", "고3"],
  F: ALL_GRADES,
  G: ALL_GRADES,
  H: ["학교밖"], // 배제 아님: 전체 열람에서는 모두 보임. 회전 노출만 학교밖 우선
  I: [], // 대상 분기 필요(I2 등) → 회전 비노출, 전체 열람 전용
  J: ALL_GRADES,
  K: ALL_GRADES,
};

function parseQuestions(md) {
  const questions = [];
  const rowRe = /^\|\s*([A-K]\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*$/;
  for (const line of md.split(/\r?\n/)) {
    const m = line.match(rowRe);
    if (!m) continue;
    const [, id, text, tagRaw, note] = m;
    const group = id[0];
    const tags = tagRaw.replace(/\[렌즈[^\]]*\]/g, "").split("·").map((s) => s.trim()).filter(Boolean);
    const lensM = tagRaw.match(/\[렌즈\s*([^\]]+)\]/);
    const stage = tags.find((t) => /^S\d/.test(t)) || null;
    const type = tags.find((t) => ["정보", "불안", "절차"].includes(t)) || null;
    let grades = GROUP_GRADES[group] ?? ALL_GRADES;
    // 태그가 군 기본보다 좁으면 태그를 따른다 (예: E7=고3, B1=중1)
    if (tags.includes("고3")) grades = ["고3"];
    else if (tags.includes("중1")) grades = ["중1"];
    questions.push({
      id, group, text,
      type, stage,
      lens: lensM ? lensM[1].trim() : null,
      grades,
      rotation: (GROUP_GRADES[group] ?? []).length > 0, // I군 false
      note,
    });
  }
  return questions;
}

function stripChips(text) {
  const chips = [];
  const cleaned = text
    .replace(/`칩:\s*([^`]*)`/g, (_, raw) => {
      const gm = raw.match(/^([①②③④])\s*(.*)$/);
      chips.push(gm ? { grade: gm[1], label: gm[2].trim() } : { grade: null, label: raw.trim() });
      return "";
    })
    .replace(/[ \t]+$/gm, "")
    .trim();
  return { cleaned, chips };
}

function parseAnswers(md) {
  const answers = {};
  const sections = md.split(/^### /m).slice(1);
  for (const sec of sections) {
    const head = sec.match(/^([A-K]\d+)\.\s*(.+)/);
    if (!head) continue;
    const id = head[1];
    // 다음 헤딩(## 또는 다음 ###은 이미 split됨) 전까지가 본문
    const body = sec.slice(head[0].length).split(/^## /m)[0].split(/^---/m)[0];
    const m = body.match(/\*\*\[L1\]\*\*\s*([\s\S]*?)\*\*\[L2[^\]]*\]\*\*\s*([\s\S]*?)\*\*\[L3\]\*\*\s*([\s\S]*?)$/);
    if (!m) throw new Error(`답변 파싱 실패: ${id}`);
    const [, l1Raw, l2Raw, l3Raw] = m;

    const headlineM = l1Raw.match(/\*\*([\s\S]+?)\*\*/);
    if (!headlineM) throw new Error(`L1 헤드라인 없음: ${id}`);
    const l1Rest = l1Raw.replace(headlineM[0], "");
    const l1 = stripChips(l1Rest);
    const l2 = stripChips(l2Raw);

    const l3Text = l3Raw.trim();
    const arrowIdx = l3Text.lastIndexOf("→");
    const l3 = arrowIdx >= 0
      ? { label: l3Text.slice(0, arrowIdx).trim(), target: l3Text.slice(arrowIdx + 1).trim() }
      : { label: l3Text, target: null };

    answers[id] = {
      l1: { headline: headlineM[1].trim(), body: l1.cleaned, chips: l1.chips },
      l2: { body: l2.cleaned, chips: l2.chips },
      l3,
    };
  }
  return answers;
}

const questions = parseQuestions(readFileSync(QUESTIONS_MD, "utf8"));
const answers = parseAnswers(readFileSync(ANSWERS_MD, "utf8"));

// 정합성 검증: 질문·답변 1:1, [확인 후 기입] 잔존 금지(연동 마커 제외)
const qIds = questions.map((q) => q.id);
const aIds = Object.keys(answers);
const missing = qIds.filter((id) => !aIds.includes(id));
const orphan = aIds.filter((id) => !qIds.includes(id));
if (qIds.length !== 63) throw new Error(`질문 수 불일치: ${qIds.length} (기대 63)`);
if (missing.length || orphan.length) throw new Error(`질문↔답변 불일치: 누락 ${missing} / 고아 ${orphan}`);
const allText = JSON.stringify(answers);
if (allText.includes("[확인 후 기입]")) throw new Error("미검증 placeholder([확인 후 기입])가 콘텐츠에 남아 있음");

const content = {
  meta: {
    brand: "마이드림",
    builtFrom: ["질문레이어_v2.md", "답변엔진_63문_v3.md"],
    questionCount: qIds.length,
  },
  questions,
  answers,
};

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "content.json"), JSON.stringify(content, null, 2), "utf8");
writeFileSync(join(outDir, "content.data.js"), "window.MAPSI_CONTENT = " + JSON.stringify(content) + ";\n", "utf8");
console.log(`OK: 질문 ${qIds.length}건, 답변 ${aIds.length}건 → data/content.json, data/content.data.js`);
