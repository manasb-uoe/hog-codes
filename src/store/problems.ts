import { useQuery } from "@tanstack/react-query";
import Firestore, {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useDbContext } from "./db-context";

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
export type TProblemDifficulty = "easy" | "medium" | "hard";

export const problemCategories = ["JavaScript", "React"] as const;

export type IProblemCategory = (typeof problemCategories)[number];

export const queryKeys = {
  problems: {
    getAll: (category: string) => ["problems", category],
    get: (id: string) => ["problems", id],
  },
};

export const useGetProblems = (category: IProblemCategory) => {
  const db = useDbContext();

  return useQuery({
    queryKey: queryKeys.problems.getAll(category),
    queryFn: async () => {
      const collectionRef = collection(db, "problems");
      const snap = await getDocs(
        query(collectionRef, where("category", "==", category))
      );

      return snap.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as IProblem[];
    },
  });
};

export const useGetProblem = (id: string) => {
  const db = useDbContext();

  return useQuery({
    queryKey: queryKeys.problems.get(id),
    queryFn: async () => {
      const docRef = doc(db, "problems", id);
      const snap = await getDoc(docRef);
      if (!snap.exists) {
        throw new Error(`No problem found with id=${id}`);
      }

      return { ...snap.data(), id: snap.id } as IProblem;
    },
  });
};
