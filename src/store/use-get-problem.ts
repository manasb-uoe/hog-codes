import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { IProblem } from "../types";
import { useDbContext } from "./db-context";

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

        setData(snapshot.data() as IProblem);
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
