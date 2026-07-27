// 커리어넷 오픈API → 정적 스냅샷(data/careernet.data.js) 생성
// 구조 원칙(연동 가이드): 키는 저장소에 넣지 않는다(.careernet.key — gitignore됨, 또는 env CAREERNET_KEY).
//   브라우저가 API를 직접 부르지 않는다 — 로컬에서 받아 스냅샷으로 배포(전 사용자 작동·CORS 무관·API 장애 무관).
// 실행: node tools/fetch-careernet.mjs   (갱신 주기: 분기 1회 권장 — 실행 후 테스트·push)
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const keyFile = path.join(root, ".careernet.key");
const outPath = path.join(root, "data", "careernet.data.js");

const KEY = process.env.CAREERNET_KEY || (existsSync(keyFile) ? readFileSync(keyFile, "utf8").trim() : "");
if (!KEY) {
  console.error("키 없음: mapsi-app/.careernet.key 파일에 인증키를 넣거나 CAREERNET_KEY 환경변수를 설정하세요.");
  process.exit(1);
}

const BASE = "https://www.career.go.kr/cnet/front/openapi";
const UA = { "User-Agent": "Mozilla/5.0 (compatible; MydreamSnapshot/1.0)" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url) {
  const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url.replace(KEY, "***")}`);
  return res.json();
}

// 응답 포장이 문서와 다를 수 있어 배열·필드를 유연하게 찾는다
function findArray(obj) {
  if (Array.isArray(obj)) return obj;
  if (!obj || typeof obj !== "object") return null;
  for (const k of ["jobs", "content", "list", "item", "data"]) {
    if (Array.isArray(obj[k])) return obj[k];
    if (obj[k] && typeof obj[k] === "object") { const inner = findArray(obj[k]); if (inner) return inner; }
  }
  for (const v of Object.values(obj)) { const inner = findArray(v); if (inner) return inner; }
  return null;
}
const pick = (o, keys) => { for (const k of keys) if (o && o[k] != null && o[k] !== "") return o[k]; return null; };
const clean = (t) => String(t ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const cut = (t, n) => { const s = clean(t); return s.length > n ? s.slice(0, n).trim() + "…" : s; };

// ---- 1. 직업 목록 전체 수집 (페이지네이션) ----
console.log("직업 목록 수집 중…");
const all = [];
let sampleLogged = false;
for (let page = 1; page <= 100; page++) {
  const data = await getJson(`${BASE}/jobs.json?apiKey=${KEY}&pageIndex=${page}`);
  const arr = findArray(data);
  if (!sampleLogged && arr && arr[0]) { console.log("  응답 샘플 키:", Object.keys(arr[0]).join(", ")); sampleLogged = true; }
  if (!arr || arr.length === 0) break;
  for (const it of arr) {
    const seq = pick(it, ["seq", "job_seq", "jobSeq", "id"]);
    const name = clean(pick(it, ["job_nm", "jobNm", "name", "job_name"]));
    if (seq != null && name) all.push({ seq: String(seq), name });
  }
  await sleep(150);
}
// 중복 제거
const seen = new Set();
const jobs = all.filter((j) => !seen.has(j.seq) && (seen.add(j.seq), true));
console.log(`목록 ${jobs.length}건 수집.`);
if (jobs.length === 0) { console.error("목록이 비어 있음 — 키/응답 구조 확인 필요"); process.exit(1); }

// ---- 2. 앱 수록 직업과 매칭되는 것만 상세 수집 ----
const JOBS = require(path.join(root, "data", "jobs.data.js"));
const JOBDICT = require(path.join(root, "data", "jobdict.data.js"));
const JOBDEX = require(path.join(root, "data", "jobdex.data.js"));
const norm = (t) => String(t || "").replace(/[\s·()]/g, "").toLowerCase();

// 우리 이름 → 매칭 후보(이름+별칭)
const targets = [];
for (const j of JOBS.jobs) targets.push({ ourName: j.name, keys: [j.name, ...(JOBS.jobAliases[j.id] || [])] });
for (const e of JOBDICT.entries) if (!e.route || e.clusterId) targets.push({ ourName: e.name, keys: [e.name, ...(e.aliases || [])] });
for (const d of JOBDEX.jobs) targets.push({ ourName: d.name, keys: [d.name] });

function matchCareernet(target) {
  const cands = [];
  for (const cj of jobs) {
    const ncj = norm(cj.name);
    for (const k of target.keys) {
      const nk = norm(k);
      if (nk.length >= 2 && (ncj === nk || ncj.includes(nk) || nk.includes(ncj))) { cands.push(cj); break; }
    }
  }
  // 이름 길이가 가장 가까운 것 우선 (과잉 매칭 방지)
  cands.sort((a, b) => Math.abs(norm(a.name).length - norm(target.ourName).length) - Math.abs(norm(b.name).length - norm(target.ourName).length));
  return cands[0] || null;
}

const details = {};
let fetched = 0, missed = 0;
for (const t of targets) {
  if (details[t.ourName]) continue;
  const hit = matchCareernet(t);
  if (!hit) { missed++; continue; }
  try {
    const data = await getJson(`${BASE}/job.json?apiKey=${KEY}&seq=${encodeURIComponent(hit.seq)}`);
    const d = data.job || data.item || data.content || data;
    const detail = {
      cnName: hit.name,
      work: cut(pick(d, ["work", "job_work", "summary"]), 400),
      recruit: cut(pick(d, ["recruit", "way", "job_recruit"]), 300),
      certificate: cut(pick(d, ["certificate", "certi", "license"]), 200),
      depart: cut(Array.isArray(d.departList) ? d.departList.map((x) => (typeof x === "string" ? x : pick(x, ["depart_name", "name", "depart_nm"]))).filter(Boolean).join(", ") : pick(d, ["depart", "department"]), 200),
      wage: cut(pick(d, ["wage", "salary"]), 100),
    };
    if (detail.work || detail.recruit) { details[t.ourName] = detail; fetched++; }
    else missed++;
  } catch (e) {
    console.log(`  상세 실패(${t.ourName}): ${e.message}`);
  }
  await sleep(200);
}
console.log(`상세 ${fetched}건 매칭·수집, 미매칭 ${missed}건.`);

// ---- 3. 스냅샷 출력 ----
const today = new Date();
const fetchedAt = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
const snapshot = {
  available: true,
  source: "커리어넷 직업백과 오픈API(교육부·KRIVET)",
  fetchedAt,
  jobs: jobs.map((j) => ({ name: j.name })),
  details,
};
writeFileSync(outPath,
  "// 생성물 — 손으로 고치지 말 것. 원본: 커리어넷 오픈API → node tools/fetch-careernet.mjs (키 필요)\n" +
  "(function (root, factory) {\n" +
  "  if (typeof module === \"object\" && module.exports) module.exports = factory();\n" +
  "  else root.MAPSI_CAREERNET_DATA = factory();\n" +
  "})(typeof self !== \"undefined\" ? self : this, function () {\n" +
  "  return " + JSON.stringify(snapshot, null, 1) + ";\n" +
  "});\n", "utf8");
console.log(`OK: data/careernet.data.js 생성 (목록 ${jobs.length}·상세 ${fetched}, 기준일 ${fetchedAt})`);
