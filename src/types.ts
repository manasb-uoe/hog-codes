import Firestore from "firebase/firestore";
export type TProblemDifficulty = "easy" | "medium" | "hard";

export const problemCategories = ["JavaScript", "React"] as const;

export type IProblemCategory = (typeof problemCategories)[number];

export interface ITestCase {
  id: string;
  description: string;
  spec: string;
}

export interface IFile {
  name: string;
  content: string;
}

export interface IProblem {
  id: string;
  title: string;
  description: string;
  category: IProblemCategory;
  tags: string[];
  difficulty: TProblemDifficulty;
  createdAt: Firestore.Timestamp;
  files: IFile[];
}
