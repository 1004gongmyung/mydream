// 클릭 목적지 전수 감사 — 앱 안의 모든 버튼·링크가 실제 존재하는 화면/질문/데이터로 이어지는지 검사
// 실행: node tools/audit-links.mjs  (mapsi-app 폴더에서)
// 검사 항목:
//   1. 질문 ↔ 답변 정합 (질문만 있고 답변이 없으면 클릭 시 홈으로 튕김 = "안 넘어가요")
//   2. L3 버튼 target 커버리지 (TARGET_ROUTES/LINKS에 없으면 '준비 중' 안내만 뜸)
//   3. 조건 카드 relatedQuestions → 질문 ID 존재
//   4. 경로 지도 relatedQ / route → 질문·라우트 존재
//   5. 오늘의 5분 몫 route → 라우트·질문 존재
//   6. 렌즈 구조 한 줄 job명 → 조건 카드 존재
//   7. 도감 clusterId → 조건 카드 클러스터 연결
//   8. 체험 지도 URL·안심 DB 연락처 존재
//   9. 부모 카드 언어 키 정합
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const d = (f) => require(path.join(root, "data", f));

// content.data.js는 브라우저 전용(window 할당)이므로 동일 내용의 content.json을 읽는다
const content = JSON.parse(readFileSync(path.join(root, "data", "content.json"), "utf8"));
const JOBS = d("jobs.data.js");
const LENS = d("lens.data.js");
const PATHS = d("paths.data.js");
const DDAY = d("dday.data.js");
const JOBDEX = d("jobdex.data.js");
const EXPLORE = d("explore.data.js");
const CARE = d("care.data.js");
const PARENTS = d("parents.data.js");
const MD = d("modules.data.js");
const GUIDES = d("guides.data.js");

const appSrc = readFileSync(path.join(root, "js", "app.js"), "utf8");

// app.js에서 TARGET_ROUTES / TARGET_LINKS 리터럴 추출
function extractObject(name) {
  const m = appSrc.match(new RegExp(`const ${name} = \\{([\\s\\S]*?)\\};`));
  if (!m) throw new Error(name + " 를 app.js에서 찾지 못함");
  const obj = {};
  for (const pair of m[1].matchAll(/"([^"]+)":\s*"([^"]+)"/g)) obj[pair[1]] = pair[2];
  return obj;
}
const TARGET_ROUTES = extractObject("TARGET_ROUTES");
const TARGET_LINKS = extractObject("TARGET_LINKS");

// route() 함수가 처리하는 정적 라우트
const STATIC_ROUTES = new Set([
  "home", "onboarding", "browse", "compass", "reverse", "search", "care-now", "help",
  "lens", "jobs", "explore", "quests", "journal", "signal", "shield", "portfolio",
  "parents", "jobdex", "paths",
]);
const qids = new Set(content.questions.map((q) => q.id));
const jobIds = new Set(JOBS.jobs.map((j) => j.id));
const lensIds = new Set(LENS.dailyCards.map((c) => c.id));

function validRoute(r) {
  if (STATIC_ROUTES.has(r)) return true;
  if (r.startsWith("q/")) return qids.has(r.slice(2));
  if (r.startsWith("job/")) return jobIds.has(r.slice(4));
  if (r.startsWith("lens/")) return lensIds.has(r.slice(5));
  if (r.startsWith("guide/")) return !!GUIDES.byQuestion[r.slice(6)];
  return false;
}

const problems = [];
const notes = [];
const p = (where, what) => problems.push(`[${where}] ${what}`);
const n = (where, what) => notes.push(`[${where}] ${what}`);

// 1. 질문 ↔ 답변 정합 — 답변 없는 질문은 클릭하면 홈으로 튕긴다
for (const q of content.questions) if (!content.answers[q.id]) p("질문↔답변", `${q.id} "${q.text}" — 답변 없음 (클릭 시 홈으로 튕김)`);
for (const id of Object.keys(content.answers)) if (!qids.has(id)) n("질문↔답변", `답변 ${id}는 질문 목록에 없음 (직접 노출 안 됨)`);

// 2. L3 target 커버리지 — 가이드 카드(질문별) > TARGET_ROUTES > TARGET_LINKS 순으로 커버 (app.js와 동일)
const uncovered = new Map();
for (const [id, a] of Object.entries(content.answers)) {
  const t = a.l3 && a.l3.target;
  if (!t) continue;
  if (GUIDES.byQuestion[id]) continue;
  if (!TARGET_ROUTES[t] && !TARGET_LINKS[t]) {
    if (!uncovered.has(t)) uncovered.set(t, []);
    uncovered.get(t).push(id);
  }
}
for (const [t, ids] of uncovered) n("L3 준비중", `"${t}" ← ${ids.join(", ")} (${ids.length}건: 클릭 시 화면 전환 없이 '준비 중' 안내만 표시)`);
for (const [t, r] of Object.entries(TARGET_ROUTES)) if (!validRoute(r)) p("L3 라우트", `"${t}" → "${r}" 라우트 없음`);

// 2b. 가이드 카드 정합 — 질문 존재·필드 완비·링크 목적지 존재
for (const [id, g] of Object.entries(GUIDES.byQuestion)) {
  if (!qids.has(id)) p("가이드", `${id} — 없는 질문의 가이드`);
  if (!g.kicker || !g.title || !g.intro || !g.note) p("가이드", `${id} — 필드 누락`);
  if (!g.items || g.items.length < 3) p("가이드", `${id} — 항목 3개 미만`);
  for (const it of g.items || []) if (!it.head || !it.body) p("가이드", `${id} — 항목 head/body 누락`);
  for (const l of g.links || []) {
    if (l.route && !validRoute(l.route)) p("가이드", `${id} — 링크 라우트 "${l.route}" 없음`);
    if (l.url && !/^https:\/\//.test(l.url)) p("가이드", `${id} — 외부 링크가 https 아님: ${l.url}`);
    if (!l.route && !l.url) p("가이드", `${id} — 링크에 route/url 둘 다 없음`);
  }
}

// 3. 조건 카드 relatedQuestions
for (const j of JOBS.jobs)
  for (const qid of j.relatedQuestions || [])
    if (!qids.has(qid)) p("조건 카드", `${j.id}(${j.name}) 관련질문 ${qid} 없음`);

// 4. 경로 지도
for (const s of PATHS.sections)
  for (const it of s.items) {
    if (it.relatedQ && !qids.has(it.relatedQ)) p("경로 지도", `"${it.name}" relatedQ ${it.relatedQ} 없음 (클릭 시 홈으로 튕김)`);
    if (it.route && !validRoute(it.route)) p("경로 지도", `"${it.name}" route "${it.route}" 없음`);
  }

// 5. 오늘의 5분 몫
for (const [grade, tasks] of Object.entries(DDAY.tasks))
  for (const t of tasks)
    if (t.route && !validRoute(t.route)) p("5분 몫", `${grade} "${t.text}" route "${t.route}" 없음`);

// 6. 렌즈 구조 한 줄 → 조건 카드
const jobNames = new Set(JOBS.jobs.map((j) => j.name));
for (const s of LENS.structureLines)
  if (!jobNames.has(s.job)) n("렌즈 구조", `"${s.job}" 조건 카드 없음 (버튼 미표시 — 정보 부재)`);
// 렌즈 카드 lens 번호 정합
const lensNums = new Set(LENS.lenses.map((l) => l.n));
for (const c of LENS.dailyCards) if (!lensNums.has(c.lens)) p("렌즈", `${c.id} lens ${c.lens} 이름 없음`);

// 7. 도감 clusterId → 조건 카드 연결
const clusterIds = new Set(JOBS.jobs.map((j) => j.clusterId));
const orphan = JOBDEX.jobs.filter((j) => !clusterIds.has(j.clusterId));
if (orphan.length) n("도감", `조건 카드로 연결 안 되는 직업 ${orphan.length}/${JOBDEX.jobs.length}건 (버튼 미표시): ${orphan.slice(0, 8).map((j) => j.name).join(", ")}${orphan.length > 8 ? " 외" : ""}`);

// 8. 체험 지도 URL · 안심 DB 연락처
for (const e of EXPLORE.entries) if (!e.url || !/^https?:/.test(e.url)) p("체험 지도", `"${e.name}" URL 없음/비정상`);
for (const s of CARE.situations)
  for (const l of s.lines)
    if (!l.contact && !l.url) p("안심 DB", `"${s.title}" › "${l.name}" 연락처·링크 둘 다 없음`);

// 9. 부모 카드 언어 키
for (const l of PARENTS.shareCard.langs)
  if (!PARENTS.shareCard.texts[l.id]) p("부모 카드", `언어 "${l.id}" 본문 없음 (클릭 시 화면 깨짐)`);

// 결과 출력
console.log("=== 클릭 목적지 전수 감사 ===");
console.log(`질문 ${content.questions.length} · 답변 ${Object.keys(content.answers).length} · 조건카드 ${JOBS.jobs.length} · 렌즈 ${LENS.dailyCards.length} · 도감 ${JOBDEX.jobs.length}`);
console.log("");
if (problems.length) {
  console.log(`문제 ${problems.length}건:`);
  for (const x of problems) console.log("  ✗ " + x);
} else console.log("✓ 깨진 클릭 목적지 없음");
console.log("");
if (notes.length) {
  console.log(`참고(정보 부재·의도된 폴백) ${notes.length}건:`);
  for (const x of notes) console.log("  · " + x);
}
process.exitCode = problems.length ? 1 : 0;
