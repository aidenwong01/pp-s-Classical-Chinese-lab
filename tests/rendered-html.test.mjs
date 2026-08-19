import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Wenyan learning workspace", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>pp的文言实验室<\/title>/i);
  assert.match(html, /第七轮 · 高考关联资料已接入/);
  assert.match(html, /1131(?:<!-- -->)?条成语关联已接入/);
  assert.match(html, /60个试卷条目 · 268道题/);
  assert.match(html, /32 项上传资料 · 1 项公开核验源/);
  assert.match(html, /11<\/strong><span>册语文教材/);
  assert.match(html, /课堂 · 自学共用/);
  assert.doesNotMatch(html, /使用视角|>教师<|>学生</);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("lists all audited uploaded resources, including the missing textbook and analysis edition", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /"九年级上册"/);
  assert.match(page, /"文言文阅读十年汇编（解析版）"/);
  assert.match(page, /32 项上传文件与公开核验源分开标注/);
  assert.match(page, /<strong>23<\/strong>PDF/);
  assert.match(page, /<strong>9<\/strong>DOCX/);
});

test("indexes verified ninth-grade first-semester textbook contexts", async () => {
  const [linksText, wordsText, page] = await Promise.all([
    readFile(new URL("../app/data/textbook-links.json", import.meta.url), "utf8"),
    readFile(new URL("../app/data/all-words.json", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  ]);
  const links = JSON.parse(linksText);
  const words = JSON.parse(wordsText);
  const wordSet = new Set(words.map((word) => word.character));
  const ninthGradeLinks = links.filter((link) => link.volume === "九年级上册");

  assert.equal(links.length, 217);
  assert.equal(ninthGradeLinks.length, 34);
  assert.equal(new Set(ninthGradeLinks.map((link) => link.character)).size, 27);
  assert.equal(ninthGradeLinks.filter((link) => !wordSet.has(link.character)).length, 0);
  assert.equal(ninthGradeLinks.filter((link) => !link.sentence.includes(link.character)).length, 0);
  assert.equal(ninthGradeLinks.filter((link) => link.pdfPage < 57 || link.pdfPage > 72).length, 0);
  assert.match(page, /"八年级下册", "九年级上册", "九年级下册"/);
});

test("indexes uploaded real-word and function-word exam links without inventing dates", async () => {
  const [realText, functionText, wordsText, page] = await Promise.all([
    readFile(new URL("../app/data/exam-real-words.json", import.meta.url), "utf8"),
    readFile(new URL("../app/data/exam-function-words.json", import.meta.url), "utf8"),
    readFile(new URL("../app/data/all-words.json", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  ]);
  const real = JSON.parse(realText);
  const functionWords = JSON.parse(functionText);
  const coreSet = new Set(JSON.parse(wordsText).map((word) => word.character));
  const mappedRealEntries = real.filter((group) => coreSet.has(group.character)).flatMap((group) => group.entries);
  const functionEntries = functionWords.flatMap((group) => group.entries);

  assert.equal(real.length, 120);
  assert.equal(real.flatMap((group) => group.entries).length, 470);
  assert.equal(mappedRealEntries.length, 466);
  assert.equal(mappedRealEntries.filter((entry) => entry.sourceLabel).length, 411);
  assert.equal(mappedRealEntries.filter((entry) => !entry.sourceLabel).length, 55);
  assert.equal(functionWords.length, 18);
  assert.equal(functionEntries.length, 107);
  assert.equal(functionEntries.filter((entry) => entry.sourceLabel).length, 107);
  assert.match(page, /资料未标注年份及卷别/);
  assert.match(page, /未标注的条目单独提示，不补造考试信息/);
});

test("keeps the uploaded idiom dataset within verified source boundaries", async () => {
  const [uploadedText, wordsText, page] = await Promise.all([
    readFile(new URL("../app/data/uploaded-idioms.json", import.meta.url), "utf8"),
    readFile(new URL("../app/data/all-words.json", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  ]);
  const uploaded = JSON.parse(uploadedText);
  const coreWords = JSON.parse(wordsText).map((word) => word.character);
  const coreSet = new Set(coreWords);
  const mapped = uploaded
    .filter((group) => coreSet.has(group.character))
    .flatMap((group) => group.idioms.map((idiom) => ({ character: group.character, ...idiom })));

  assert.equal(uploaded.length, 120);
  assert.equal(uploaded.flatMap((group) => group.idioms).length, 1147);
  assert.equal(mapped.length, 1131);
  assert.equal(new Set(mapped.map((entry) => entry.character)).size, 117);
  assert.equal(mapped.filter((entry) => !entry.idiom || !entry.explanation).length, 0);
  assert.match(page, /本资料没有逐条指定义项时，页面不自行猜测/);
  assert.match(page, /资料核对说明/);
});

test("keeps a device-local taught status for all 120 real words", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /pp-wenyan-lab-taught-words/);
  assert.match(page, /按已讲状态筛选/);
  assert.match(page, /标记为已讲/);
  assert.match(page, /window\.localStorage\.setItem/);
});

test("builds Anki-style review cards only from connected word data", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /pp-wenyan-lab-review-records/);
  assert.match(page, /Anki 式卡片复习/);
  assert.match(page, /卡片答案只读取已接入资料/);
  assert.match(page, /本轮再见/);
  assert.match(page, /明天复习/);
  assert.match(page, /3 天起复习/);
  assert.match(page, /review-mode/);
});

test("exports and restores device-local learning progress without source content", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /pp-wenyan-lab-progress/);
  assert.match(page, /导出进度/);
  assert.match(page, /导入进度/);
  assert.match(page, /仅包含“已讲”状态与卡片复习安排/);
  assert.match(page, /请选择由本网站导出的学习进度 JSON 文件/);
});

test("filters exam contexts without inventing missing year labels", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /按年份卷别标注状态筛选/);
  assert.match(page, /已标年份卷别/);
  assert.match(page, /资料未标注/);
  assert.match(page, /当前找到/);
  assert.match(page, /请调整搜索词或年份卷别标注筛选/);
  assert.match(page, /选择具体年份与卷别/);
  assert.match(page, /全部已标注来源/);
  assert.match(page, /entry\.sourceLabel === sourceLabelFilter/);
});

test("indexes every 2017-2026 exam entry from the uploaded analysis edition", async () => {
  const [papersText, indexText, page, examData] = await Promise.all([
    readFile(new URL("../public/data/exam-papers.json", import.meta.url), "utf8"),
    readFile(new URL("../app/data/exam-paper-index.json", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/data/exam-data.ts", import.meta.url), "utf8"),
  ]);
  const papers = JSON.parse(papersText);
  const paperIndex = JSON.parse(indexText);
  const yearCounts = Object.fromEntries(Object.entries(Object.groupBy(papers, (paper) => paper.year)).map(([year, items]) => [year, items.length]));
  const firstTwo = papers.slice(0, 2);

  assert.equal(papers.length, 60);
  assert.equal(paperIndex.length, 60);
  assert.equal(papers.flatMap((paper) => paper.questions).length, 268);
  assert.deepEqual(yearCounts, { 2017: 8, 2018: 9, 2019: 9, 2020: 7, 2021: 6, 2022: 6, 2023: 5, 2024: 4, 2025: 4, 2026: 2 });
  assert.deepEqual(firstTwo.map((paper) => paper.label), ["2026·全国I卷", "2026·全国II卷"]);
  assert.deepEqual(firstTwo.map((paper) => paper.questions.map((question) => question.number)), [[10, 11, 12, 13, 14], [10, 11, 12, 13, 14]]);
  assert.deepEqual(firstTwo.map((paper) => paper.questions[0].answer), ["BEH", "CEG"]);
  assert.deepEqual(firstTwo.map((paper) => paper.questions[1].answer), ["A", "B"]);
  assert.deepEqual(firstTwo.map((paper) => paper.questions[2].answer), ["D", "B"]);
  assert.equal(papers.slice(2).every((paper) => paper.answerText?.length), true);
  assert.equal(papers.every((paper) => paper.questions.length && paper.questions.every((question) => question.stem)), true);
  assert.equal(papers.every((paper) => paper.sourceName === "专题04 文言文阅读（10年汇编）（全国通用）（解析版）"), true);
  assert.equal(new Set(papers.map((paper) => paper.id)).size, 60);
  assert.deepEqual(papers.filter((paper) => !paper.analysisText?.length && paper.year !== 2026).map((paper) => paper.label), ["2022·上海卷", "2021·全国甲卷", "2021·全国乙卷", "2021·新高考Ⅰ卷", "2021·浙江卷"]);
  assert.deepEqual(papers.filter((paper) => !paper.referenceTranslations.length).map((paper) => paper.label), ["2022·上海卷", "2021·上海卷"]);
  assert.match(page, /"real" \| "function" \| "paper"/);
  assert.match(page, />真题解析</);
  assert.match(page, /按年份筛选试卷/);
  assert.match(page, /fetch\("\/data\/exam-papers\.json"\)/);
  assert.match(page, /2017—2026共/);
  assert.match(page, /上传资料本条目未另附解析，页面不补写/);
  assert.match(examData, /exam-paper-index\.json/);
  assert.doesNotMatch(examData, /exam-papers\.json/);
});
