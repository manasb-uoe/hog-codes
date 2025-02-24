import Firestore from "firebase/firestore";
export type TProblemDifficulty = "easy" | "medium" | "hard";

export interface ITestCase {
  id: string;
  description: string;
  spec: string;
}

export interface IProblem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  difficulty: TProblemDifficulty;
  testCases: ITestCase[];
  createdAt: Firestore.Timestamp;
}
