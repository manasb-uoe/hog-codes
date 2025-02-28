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
import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "../auth/auth-context";
import { IProblem, IProblemCategory } from "../types";
import { useDbContext } from "./db-context";

export const useGetProblems = (category: IProblemCategory) => {
  const db = useDbContext();

  const [data, setData] = useState<IProblem[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const collectionRef = collection(db, "problems");
    getDocs(query(collectionRef, where("category", "==", category)))
      .then((snapshot) => {
        const problems = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setData(problems as IProblem[]);
      })
      .catch((err: unknown) => {
        setError(err as Error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [db, category]);

  return { data, error, loading };
};

export const useGetProblem = (id: string) => {
  const db = useDbContext();

  const [data, setData] = useState<IProblem | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const docRef = doc(db, "problems", id);
    getDoc(docRef)
      .then((snapshot) => {
        if (!snapshot.exists) {
          throw new Error(`No problem found with id=${id}`);
        }

        setData({ ...snapshot.data(), id: snapshot.id } as IProblem);
      })
      .catch((err: unknown) => {
        setError(err as Error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [db, id]);

  return { data, error, loading };
};

export const useGetProblemCompletion = (id: string) => {
  const db = useDbContext();
  const { user } = useAuthContext();

  const [data, setData] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const docRef = doc(db, "problems", id, "completions", user!.uid);
    getDoc(docRef)
      .then((snapshot) => {
        if (!snapshot.exists) {
          throw new Error(`No problem found with id=${id}`);
        }

        setData(true);
      })
      .catch((err: unknown) => {
        setError(err as Error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [db, id, user]);

  return { data, error, loading };
};

export const useSetProblemCompletion = (id: string) => {
  const db = useDbContext();
  const { user } = useAuthContext();

  const setProblemCompletion = useCallback(
    async (completed: boolean) => {
      const docRef = doc(db, "problems", id, "completions", user!.uid);
      if (completed) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {});
      }
    },
    [db, id, user]
  );

  return { setProblemCompletion };
};
