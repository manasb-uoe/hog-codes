import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
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
