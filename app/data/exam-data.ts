import functionWordGroups from "./exam-function-words.json";
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

export const functionWordExamGroups: FunctionWordExamGroup[] = functionWordGroups;
export const realWordExamGroups: RealWordExamGroup[] = realWordGroups;
export const totalFunctionWordExamExamples = functionWordExamGroups.reduce((total, group) => total + group.entries.length, 0);
export const totalDatedFunctionWordExamExamples = functionWordExamGroups.reduce((total, group) => total + group.entries.filter((entry) => entry.sourceLabel).length, 0);
export const totalRealWordExamExamples = realWordExamGroups.reduce((total, group) => total + group.entries.length, 0);
export const totalDatedRealWordExamExamples = realWordExamGroups.reduce((total, group) => total + group.entries.filter((entry) => entry.sourceLabel).length, 0);
