// 성직자 진로 시드 로더 — 4개 CSV(경로·단계·양성기관·중간실험) → data/clergy.data.js 생성
// 절대 규칙 (mydream-clergy-path-module-prompt.md):
//   1. 교단 인준(is_denomination_approved)과 학위 인정(is_accredited_university)을 합치거나 파생하지 않는다 — 둘 다 명시 입력.
//   2. verified_at·출처 없는 경로/기관은 넣지 않는다. 모델이 교단명·인준 여부·연령을 추정하지 않는다.
//   3. 빌드 가드: 최소 요구 종교(개신교·천주교·불교) 각각 실데이터 경로 1건 미만이면 모듈 비노출(guard.visible=false).
//      샘플 행(id가 sample-)은 가드 판정에서 제외한다 — 샘플만으로 모듈이 보이면 안 된다.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outPath = path.join(root, "data", "clergy.data.js");

const RELIGIONS = ["PROTESTANT", "CATHOLIC", "BUDDHIST", "WON_BUDDHIST", "ISLAM", "OTHER"];
const REQUIRED_RELIGIONS = ["PROTESTANT", "CATHOLIC", "BUDDHIST"];

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((f) => f !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); if (row.some((f) => f !== "")) rows.push(row); }
  return rows;
}

function readTable(file) {
  const rows = parseCsv(readFileSync(path.join(root, "data", file), "utf8"));
  const header = rows.shift().map((h) => h.trim());
  return rows.map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] || "").trim()])));
}

const orNull = (s) => (s === "" ? null : s);
const intOrNull = (s) => (s === "" ? null : Number(s));
const skipped = [];

// ---- 경로 ----
const PATH_REQUIRED = ["id", "religion", "denomination", "role_name", "summary", "official_contact_name", "official_contact_url", "reality_notes", "source_name", "source_url", "verified_at"];
const paths = [];
const pathIds = new Set();
for (const r of readTable("clergy_paths.seed.csv")) {
  const missing = PATH_REQUIRED.filter((k) => r[k] === "");
  if (missing.length) { skipped.push(`경로 ${r.id || "(id 없음)"} — 필수 누락: ${missing.join(", ")}`); continue; }
  if (!RELIGIONS.includes(r.religion)) { skipped.push(`경로 ${r.id} — religion 값 이상: ${r.religion}`); continue; }
  if (r.is_open_to_minors !== "true" && r.is_open_to_minors !== "false") { skipped.push(`경로 ${r.id} — is_open_to_minors는 true/false 명시 필수`); continue; }
  const minors = r.is_open_to_minors === "true";
  // 미성년 진입 가능 경로는 공식 상담 전화가 반드시 있어야 한다 (안전장치)
  if (minors && r.official_contact_phone === "") { skipped.push(`경로 ${r.id} — 미성년 진입 가능인데 상담 전화 없음 (안전장치 위반)`); continue; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.verified_at)) { skipped.push(`경로 ${r.id} — verified_at 형식(YYYY-MM-DD)`); continue; }
  if (pathIds.has(r.id)) { skipped.push(`경로 ${r.id} — id 중복`); continue; }
  pathIds.add(r.id);
  paths.push({
    id: r.id, religion: r.religion, denomination: r.denomination, role_name: r.role_name, summary: r.summary,
    min_entry_age: intOrNull(r.min_entry_age), is_open_to_minors: minors,
    official_contact_name: r.official_contact_name, official_contact_phone: orNull(r.official_contact_phone),
    official_contact_url: r.official_contact_url,
    reality_notes: r.reality_notes, source_name: r.source_name, source_url: r.source_url, verified_at: r.verified_at,
    stages: [], exploratory: [],
  });
}
const byId = Object.fromEntries(paths.map((p) => [p.id, p]));

// ---- 단계 ----
for (const r of readTable("clergy_stages.seed.csv")) {
  const p = byId[r.path_id];
  if (!p) { skipped.push(`단계 ${r.id} — 없는 경로 ${r.path_id}`); continue; }
  if (!r.name || r.step_order === "") { skipped.push(`단계 ${r.id} — name/step_order 누락`); continue; }
  if (r.is_reversible !== "true" && r.is_reversible !== "false") { skipped.push(`단계 ${r.id} — is_reversible는 true/false 명시 필수`); continue; }
  const rev = r.is_reversible === "true";
  // 되돌릴 수 없는 단계는 '무엇이 남는지' 사실 설명이 반드시 있어야 한다
  if (!rev && r.reversibility_note === "") { skipped.push(`단계 ${r.id} — 비가역 단계인데 reversibility_note 없음`); continue; }
  p.stages.push({
    id: r.id, step_order: Number(r.step_order), name: r.name,
    typical_duration: orNull(r.typical_duration), prerequisites: orNull(r.prerequisites),
    is_reversible: rev, reversibility_note: orNull(r.reversibility_note),
  });
}
for (const p of paths) p.stages.sort((a, b) => a.step_order - b.step_order);

// ---- 중간 실험 (전부 되돌릴 수 있는 활동만) ----
for (const r of readTable("exploratory_steps.seed.csv")) {
  const p = byId[r.path_id];
  if (!p) { skipped.push(`실험 ${r.id} — 없는 경로 ${r.path_id}`); continue; }
  if (!r.name || !r.description) { skipped.push(`실험 ${r.id} — name/description 누락`); continue; }
  if (r.requires_guardian_consent !== "true" && r.requires_guardian_consent !== "false") { skipped.push(`실험 ${r.id} — requires_guardian_consent는 true/false 명시`); continue; }
  p.exploratory.push({
    id: r.id, name: r.name, description: r.description,
    min_age: intOrNull(r.min_age), requires_guardian_consent: r.requires_guardian_consent === "true",
    duration: orNull(r.duration), official_contact_url: orNull(r.official_contact_url),
  });
}

// ---- 양성기관 ----
const INST_REQUIRED = ["id", "religion", "denomination", "name", "region_sido", "source_name", "source_url", "verified_at"];
const institutions = [];
const instIds = new Set();
for (const r of readTable("training_institutions.seed.csv")) {
  const missing = INST_REQUIRED.filter((k) => r[k] === "");
  if (missing.length) { skipped.push(`기관 ${r.id || "(id 없음)"} — 필수 누락: ${missing.join(", ")}`); continue; }
  // 두 인정 축은 각각 명시 입력 — 서로에게서, 이름에서 파생 금지
  if (r.is_denomination_approved !== "true" && r.is_denomination_approved !== "false") { skipped.push(`기관 ${r.id} — is_denomination_approved는 true/false 명시 필수`); continue; }
  if (r.is_accredited_university !== "true" && r.is_accredited_university !== "false") { skipped.push(`기관 ${r.id} — is_accredited_university는 true/false 명시 필수`); continue; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.verified_at)) { skipped.push(`기관 ${r.id} — verified_at 형식`); continue; }
  if (instIds.has(r.id)) { skipped.push(`기관 ${r.id} — id 중복`); continue; }
  instIds.add(r.id);
  institutions.push({
    id: r.id, religion: r.religion, denomination: r.denomination, name: r.name,
    is_denomination_approved: r.is_denomination_approved === "true", approving_body: orNull(r.approving_body),
    is_accredited_university: r.is_accredited_university === "true", degree_awarded: orNull(r.degree_awarded),
    program_years: intOrNull(r.program_years), region_sido: r.region_sido, address: orNull(r.address),
    website: orNull(r.website), source_name: r.source_name, source_url: r.source_url, verified_at: r.verified_at,
  });
}

// ---- 빌드 가드 — 샘플 제외, 최소 요구 종교 각 1건 이상 ----
const isSample = (id) => id.startsWith("sample-");
const realPaths = paths.filter((p) => !isSample(p.id));
const missingReligions = REQUIRED_RELIGIONS.filter((rel) => !realPaths.some((p) => p.religion === rel));
const guard = { required: REQUIRED_RELIGIONS, missing: missingReligions, visible: missingReligions.length === 0 };

const data = {
  builtFrom: ["clergy_paths.seed.csv", "clergy_stages.seed.csv", "training_institutions.seed.csv", "exploratory_steps.seed.csv"],
  allSample: paths.length > 0 && paths.every((p) => isSample(p.id)),
  guard,
  paths,
  institutions,
};

writeFileSync(outPath,
  "// 생성물 — 손으로 고치지 말 것. 원본: data/clergy_*.seed.csv → node tools/load-clergy.mjs\n" +
  "(function (root, factory) {\n" +
  "  if (typeof module === \"object\" && module.exports) module.exports = factory();\n" +
  "  else root.MAPSI_CLERGY_DATA = factory();\n" +
  "})(typeof self !== \"undefined\" ? self : this, function () {\n" +
  "  return " + JSON.stringify(data, null, 2) + ";\n" +
  "});\n", "utf8");

console.log(`OK: 경로 ${paths.length}건·기관 ${institutions.length}건 적재 → data/clergy.data.js`);
console.log(`빌드 가드: ${guard.visible ? "통과 — 모듈 노출" : "미달 — 모듈 비노출 (실데이터 부족: " + guard.missing.join(", ") + ")"}`);
for (const s of skipped) console.log("  스킵: " + s);
