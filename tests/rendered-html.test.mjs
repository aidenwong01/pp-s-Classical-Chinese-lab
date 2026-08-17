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
  assert.match(html, /第五轮 · 成语关联资料已接入/);
  assert.match(html, /1131(?:<!-- -->)?条成语关联已接入/);
  assert.match(html, /28 项上传资料 · 1 项公开核验源/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
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
