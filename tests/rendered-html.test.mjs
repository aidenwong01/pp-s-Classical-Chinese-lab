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
  assert.match(html, /522(?:<!-- -->)?条标注年份关联/);
  assert.match(html, /30 项上传资料 · 1 项公开核验源/);
  assert.match(html, /课堂 · 自学共用/);
  assert.doesNotMatch(html, /使用视角|>教师<|>学生</);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
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
