import functionWordGroups from "./exam-function-words.json";
import paperIndexData from "./exam-paper-index.json";
import realWordGroups from "./exam-real-words.json";

export type ExamExample = {
  sourceItem: number;
  sourceLabel: string | null;
  year: number | null;
  paragraphs: string[];
};

export type FunctionWordExamGroup = {
  sourceIndex: number;
  character: string;
  kind: string;
  entries: ExamExample[];
};

export type RealWordExamGroup = FunctionWordExamGroup;

export type ExamPaperQuestion = {
  number: number;
  stem: string;
  choices?: string[];
  answer?: string | string[];
  analysis?: string[];
};

export type ExamPaper = {
  id: string;
  year: number;
  paper: string;
  label: string;
  title: string;
  sourceItem: number;
  heading?: string;
  passages: Array<{ label: string; text: string; source?: string }>;
  notes: string[];
  questions: ExamPaperQuestion[];
  answerText?: string[];
  analysisText?: string[];
  referenceTranslations: Array<{ label: string; text: string }>;
  sourceName: string;
};

export type ExamPaperIndex = Pick<ExamPaper, "id" | "year" | "paper" | "label" | "title" | "sourceItem"> & { questionCount: number };

export const functionWordExamGroups: FunctionWordExamGroup[] = functionWordGroups;
export const realWordExamGroups: RealWordExamGroup[] = realWordGroups;
export const examPaperIndex: ExamPaperIndex[] = paperIndexData;
export const totalFunctionWordExamExamples = functionWordExamGroups.reduce((total, group) => total + group.entries.length, 0);
export const totalDatedFunctionWordExamExamples = functionWordExamGroups.reduce((total, group) => total + group.entries.filter((entry) => entry.sourceLabel).length, 0);
export const totalRealWordExamExamples = realWordExamGroups.reduce((total, group) => total + group.entries.length, 0);
export const totalDatedRealWordExamExamples = realWordExamGroups.reduce((total, group) => total + group.entries.filter((entry) => entry.sourceLabel).length, 0);
export const totalExamPaperQuestions = examPaperIndex.reduce((total, paper) => total + paper.questionCount, 0);
