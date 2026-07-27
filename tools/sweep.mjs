// 전 화면 렌더링 스윕 — 헤드리스 Edge로 각 라우트의 DOM을 덤프해 마커 문자열을 검사한다.
// 사용: 서버(8137) 실행 상태에서 node tools/sweep.mjs
import { execFileSync } from "node:child_process";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://localhost:8137";
const P = (grade, to) => `${BASE}/tools/preview.html?grade=${encodeURIComponent(grade)}&to=${encodeURIComponent(to)}`;
const E = (flow) => `${BASE}/tools/e2e.html?flow=${flow}`;

const checks = [
  ["onboarding", `${BASE}/#onboarding`, "지금 어느 시기에 있어요"],
  ["home-중2", P("중2", "home"), "오늘의 고민 카드"],
  ["home-중3-dday", P("중3", "home"), "고입 원서 시즌"],
  ["home-학교밖", P("학교밖", "home"), "오늘의 5분 몫"],
  ["browse", P("고1", "browse"), "전체 질문 · 63개"],
  ["answer-A1", P("중2", "q/A1"), "교실 30명 중 9명"],
  ["answer-K9", P("고2", "q/K9"), "토큰증권 법"],
  ["compass-intro", P("고1", "compass"), "하루부터 골라봐요"],
  ["reverse", P("고1", "reverse"), "취향표"],
  ["care-now", P("중2", "care-now"), "지금 이야기 나눌 수 있는 곳"],
  ["help", P("중2", "help"), "상황별로 바로 연결"],
  ["lens", P("중2", "lens"), "하루 한 장"],
  ["lens-card", P("중2", "lens/delivery"), "다르게 보면"],
  ["jobs", P("고1", "jobs"), "조건이 다른 직업"],
  ["job-teacher", P("고1", "job/teacher"), "임용시험"],
  ["job-aircraftmech", P("고1", "job/aircraftmech"), "국가자격 시험"],
  ["job-marketer", P("고1", "job/marketer"), "판을 짜는 일"],
  ["explore", P("중2", "explore"), "개인 신청 가능"],
  ["quests", P("중2", "quests"), "앱 밖에서 하고 오기"],
  ["journal", P("중2", "journal"), "어떤 기분이에요"],
  ["signal-empty", P("중2", "signal"), "출발 전이라는 뜻"],
  ["shield", P("고2", "shield"), "10,320"],
  ["portfolio-empty", P("고2", "portfolio"), "아직 모은 흔적이 없어요"],
  ["parents", P("중2", "parents"), "같은 자료를 보는 대화"],
  ["jobdex", P("중2", "jobdex"), "낯선 직업 도감"],
  ["paths", P("고2", "paths"), "여러 개의 문"],
  ["answer-I2", P("중2", "q/I2"), "4개 언어 요약 카드"],
  ["hischool", P("중3", "hischool"), "유형부터 보면 길이 보여요"],
  ["hischool-list", P("중3", "hischool"), "한국과학영재학교"],
  ["hischool-fresh", P("중3", "hischool"), "수시 업데이트"],
  ["majors", P("고1", "majors"), "적성 신호로 학과를"],
  ["artprep", P("중3", "artprep"), "순서 설계예요"],
  ["altschools", P("중3", "altschools"), "학력 인정 여부부터"],
  ["altschools-coverage", P("중3", "altschools"), "여기 없다고 인가·등록이 아닌 게 아니에요"],
  ["altschool-detail", P("중3", "altschool/gg-haneulkkum"), "학력 인정"],
  ["altschool-detail-jb", P("중3", "altschool/jb-pureunkkum"), "대안교육 특성화고"],
  ["clergy", P("중3", "clergy"), "성직도 하나의 직업 경로"],
  ["clergy-detail", P("중3", "clergy/budd-jogye"), "되돌리기 어려움"],
  ["clergy-minors", P("중3", "clergy/budd-jogye"), "보호자와 꼭 상의"],
  ["jobs-clergy-entry", P("고1", "jobs"), "종교 성직 경로"],
  ["guide-E7", P("고3", "guide/E7"), "감정 말고 조건으로"],
  ["guide-C4", P("중3", "guide/C4"), "이 순서로 비교해요"],
  ["guide-A4", P("중2", "guide/A4"), "이렇게 뜯어봐요"],
  // 인터랙션 흐름 (e2e 자동 주행)
  ["flow-crisis", E("crisis"), "지금 이야기 나눌 수 있는 곳"],
  ["flow-search", E("search"), "관련 질문"],
  ["flow-compass", E("compass"), "이런 하루를 사는 사람이 많은 직업군"],
  ["flow-reverse", E("reverse"), "네 취향과 자주 만나는 계열"],
  ["flow-quest", E("quest"), "완료 ·"],
  ["flow-journal", E("journal"), "쌓인 기록 1개"],
  ["flow-signal", E("signal"), "확인해볼래요?"],
  ["flow-portfolio", E("portfolio"), "문장 초안"],
  ["flow-parents", E("parents"), "대화를 여는 질문"],
  ["flow-guide", E("guide"), "감정 말고 조건으로"],
  ["flow-altmiss", E("altmiss"), "아직 이 목록에 담기지 않은"],
];

let fail = 0;
for (const [name, url, marker] of checks) {
  let dom = "";
  try {
    dom = execFileSync(EDGE, [
      "--headless=new", "--disable-gpu", "--virtual-time-budget=3500", "--dump-dom", url,
    ], { encoding: "utf8", timeout: 30000, maxBuffer: 20 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] });
  } catch (e) {
    dom = String(e.stdout || "");
  }
  if (dom.includes(marker)) {
    console.log("PASS  " + name);
  } else {
    console.log("FAIL  " + name + "  (marker: " + marker + ")");
    fail++;
  }
}
console.log("----");
console.log(`RESULT: ${checks.length - fail}/${checks.length} pass`);
process.exit(fail ? 1 : 0);
