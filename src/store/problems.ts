import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { useAuthContext } from "../auth/auth-context";
import { IProblem, IProblemCategory } from "../types";
import { useDbContext } from "./db-context";

export const queryKeys = {
  problems: {
    getAll: () => ["problems"],
    get: (id: string) => ["problems", id],
    getCompletion: (id: string) => ["problems", id, "completions"],
  },
};

export const useGetProblems = (category: IProblemCategory) => {
  const db = useDbContext();
  return useQuery({
    queryKey: queryKeys.problems.getAll(),
    queryFn: async () => {
      const collectionRef = collection(db, "problems");
      const snap = await getDocs(
        query(collectionRef, where("category", "==", category))
      );
      return snap.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
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

export const useGetProblemCompletion = (id: string) => {
  const db = useDbContext();
  const { user } = useAuthContext();

  return useQuery({
    queryKey: queryKeys.problems.getCompletion(id),
    queryFn: async () => {
      const docRef = doc(db, "problems", id, "completions", user!.uid);
      const snap = await getDoc(docRef);
      return snap.exists();
    },
  });
};

export const useSetProblemCompletion = (id: string) => {
  const db = useDbContext();
  const { user } = useAuthContext();
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (completed: boolean) => {
      const docRef = doc(db, "problems", id, "completions", user!.uid);
      if (completed) {
        await setDoc(docRef, {});
      } else {
        await deleteDoc(docRef);
      }
    },
    onSuccess: () => {
      client.invalidateQueries({
        queryKey: queryKeys.problems.getCompletion(id),
      });
    },
  });
};
