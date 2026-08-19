import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const [inputPath, curatedPath, outputPath, indexPath] = process.argv.slice(2);
if (!inputPath || !curatedPath || !outputPath || !indexPath) {
  throw new Error("Usage: node scripts/build-exam-papers.mjs <source.txt> <curated.json> <output.json> <index.json>");
}

const sourceName = "专题04 文言文阅读（10年汇编）（全国通用）（解析版）";
const rawLines = readFileSync(inputPath, "utf8").replace(/\r/g, "").split("\n");
const headingPattern = /^([一二三四五六七八九十]+)、[（【](20\d{2})[^）】]*[）】]/;
const headingIndexes = rawLines.flatMap((line, index) => headingPattern.test(line.trim()) ? [index] : []);

const cleanLines = (lines) => {
  const result = lines.map((line) => line.trim());
  while (result[0] === "") result.shift();
  while (result.at(-1) === "") result.pop();
  return result;
};

const markerText = (line, marker) => line.replace(marker, "").trim();
const isAnswer = (line) => /^【?答案】?/.test(line);
const isAnalysis = (line) => /^【?解析】?/.test(line);
const isTranslation = (line) => /^【?参考译文】?[：:]?/.test(line) || /^参考译文[：:]?/.test(line);
const decimalQuestionPattern = /^(\d{1,2})[.．、]\s*/;
const parentheticalQuestionPattern = /^[（(](\d{1,2})[）)]\s*/;

function parseLabel(heading, year) {
  const bracketed = heading.match(/[（【]([^）】]+)[）】]/)?.[1] ?? `${year}年高考文言文`;
  let normalized = bracketed
    .replace(/·高考真题/g, "")
    .replace(`${year}年高考`, `${year}·`)
    .replace(`${year}年`, `${year}·`)
    .replace(new RegExp(`^${year}(?!·)`), `${year}·`)
    .replace(/··+/g, "·");
  const paper = normalized.replace(new RegExp(`^${year}·`), "");
  return { label: normalized, paper };
}

function parsePaper(lines, yearItem) {
  const block = cleanLines(lines);
  const heading = block[0];
  const year = Number(heading.match(/20\d{2}/)?.[0]);
  const { label, paper } = parseLabel(heading, year);
  const answerIndex = block.findIndex((line, index) => index > 0 && isAnswer(line));
  if (answerIndex < 0) throw new Error(`Missing answer marker: ${heading}`);
  const analysisIndex = block.findIndex((line, index) => index > answerIndex && isAnalysis(line));
  const translationIndex = block.findIndex((line, index) => index > answerIndex && isTranslation(line));
  const questionRegion = block.slice(1, answerIndex);
  const decimalStarts = questionRegion.flatMap((line, index) => decimalQuestionPattern.test(line) ? [index] : []);
  const parentheticalStarts = questionRegion.flatMap((line, index) => parentheticalQuestionPattern.test(line) ? [index] : []);
  const questionStarts = decimalStarts.length ? decimalStarts : parentheticalStarts;
  const activeQuestionPattern = decimalStarts.length ? decimalQuestionPattern : parentheticalQuestionPattern;
  if (!questionStarts.length) throw new Error(`Missing question numbers: ${heading}`);
  const questionStart = questionStarts[0];
  const passageLines = cleanLines(questionRegion.slice(0, questionStart));
  const questions = questionStarts.map((start, index) => {
    const end = questionStarts[index + 1] ?? questionRegion.length;
    const questionLines = cleanLines(questionRegion.slice(start, end));
    const questionMatch = questionLines[0].match(activeQuestionPattern);
    const number = Number(questionMatch?.[1]);
    const stem = questionLines[0].replace(activeQuestionPattern, "").trim();
    return { number, stem, choices: questionLines.slice(1) };
  });

  const answerEnd = analysisIndex >= 0 ? analysisIndex : translationIndex >= 0 ? translationIndex : block.length;
  const rawAnswerLines = cleanLines(block.slice(answerIndex, answerEnd));
  const answerFirst = markerText(rawAnswerLines[0] ?? "", /^【?答案】?/);
  const answerText = cleanLines([answerFirst, ...rawAnswerLines.slice(1)]);

  const analysisEnd = translationIndex >= 0 ? translationIndex : block.length;
  const rawAnalysisLines = analysisIndex >= 0 ? cleanLines(block.slice(analysisIndex, analysisEnd)) : [];
  const analysisFirst = markerText(rawAnalysisLines[0] ?? "", /^【?解析】?/);
  const analysisText = rawAnalysisLines.length ? cleanLines([analysisFirst, ...rawAnalysisLines.slice(1)]) : [];

  const rawTranslationLines = translationIndex >= 0 ? cleanLines(block.slice(translationIndex)) : [];
  const translationFirst = markerText(rawTranslationLines[0] ?? "", /^【?参考译文】?[：:]?|^参考译文[：:]?/);
  const translationText = rawTranslationLines.length ? cleanLines([translationFirst, ...rawTranslationLines.slice(1)]).join("\n") : "";
  const sourceLines = passageLines.filter((line) => /(?:节选自|选自)/.test(line));
  const source = sourceLines.map((line) => line.replace(/^[（(]|[）)]$/g, "")).join("；");
  const title = source || "文言文阅读";

  return {
    id: `${year}-${String(yearItem).padStart(2, "0")}`,
    year,
    paper,
    label,
    title,
    sourceItem: yearItem,
    heading,
    passages: [{ label: "试题原文", text: passageLines.join("\n"), source }],
    notes: [],
    questions,
    answerText,
    analysisText,
    referenceTranslations: translationText ? [{ label: "参考译文", text: translationText }] : [],
    sourceName,
  };
}

const yearCounts = new Map();
const parsed = headingIndexes.map((start, index) => {
  let end = headingIndexes[index + 1] ?? rawLines.length;
  const yearMarkerOffset = rawLines.slice(start + 1, end).findIndex((line) => /^〖20\d{2}年高考真题〗$/.test(line.trim()));
  if (yearMarkerOffset >= 0) end = start + 1 + yearMarkerOffset;
  const year = Number(rawLines[start].match(/20\d{2}/)?.[0]);
  const yearItem = (yearCounts.get(year) ?? 0) + 1;
  yearCounts.set(year, yearItem);
  const sourceLines = cleanLines(rawLines.slice(start, end));
  const paper = parsePaper(sourceLines, yearItem);
  Object.defineProperty(paper, "_sourceLines", { value: sourceLines, enumerable: false });
  return paper;
});

const collectStrings = (value, result = []) => {
  if (typeof value === "string") result.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, result));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectStrings(item, result));
  return result;
};
const normalizeAuditText = (value) => value.replace(/\s/g, "");
for (const paper of parsed) {
  const storedStrings = collectStrings(paper).map(normalizeAuditText);
  for (const sourceLine of paper._sourceLines) {
    const comparable = normalizeAuditText(sourceLine
      .replace(/^【?答案】?/, "")
      .replace(/^【?解析】?/, "")
      .replace(/^【?参考译文】?[：:]?|^参考译文[：:]?/, "")
      .replace(decimalQuestionPattern, "")
      .replace(parentheticalQuestionPattern, ""));
    if (comparable && !storedStrings.some((stored) => stored.includes(comparable))) {
      throw new Error(`Source line was not preserved in ${paper.label}: ${sourceLine}`);
    }
  }
}

const curated = JSON.parse(readFileSync(curatedPath, "utf8"));
const curatedWithCompleteSections = curated.map((paper) => {
  const extracted = parsed.find((candidate) => candidate.year === paper.year && candidate.sourceItem === paper.sourceItem);
  if (!extracted) throw new Error(`Missing extracted source section for curated paper: ${paper.label}`);
  const questions = extracted.questions.map((question) => {
    const curatedQuestion = paper.questions.find((candidate) => candidate.number === question.number);
    return curatedQuestion ? { ...question, answer: curatedQuestion.answer, analysis: curatedQuestion.analysis } : question;
  });
  return { ...extracted, id: paper.id, paper: paper.paper, label: paper.label, title: paper.title, questions };
});
const papers = [...curatedWithCompleteSections, ...parsed.filter((paper) => paper.year !== 2026)];
const index = papers.map(({ id, year, paper, label, title, sourceItem, questions }) => ({
  id, year, paper, label, title, sourceItem, questionCount: questions.length,
}));

mkdirSync(dirname(outputPath), { recursive: true });
mkdirSync(dirname(indexPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(papers, null, 2)}\n`);
writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);

const totalQuestions = papers.reduce((total, paper) => total + paper.questions.length, 0);
console.log(JSON.stringify({ papers: papers.length, totalQuestions, years: Object.fromEntries(yearCounts) }));
