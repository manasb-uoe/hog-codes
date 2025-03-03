import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useDbContext } from "./db-context";

export interface IUser {
  id: string;
  completions: Record<string, boolean>;
}

const queryKeys = {
  users: {
    get: (id: string) => ["users", id],
  },
};

export const useSetUser = () => {
  const db = useDbContext();
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (user: IUser) => {
      const docRef = doc(db, "users", user.id);
      await setDoc(docRef, user);
    },
    onSuccess: (_, user) => {
      client.invalidateQueries({
        queryKey: queryKeys.users.get(user.id),
      });
    },
  });
};

export const useUser = (id?: string) => {
  const db = useDbContext();

  return useQuery({
    queryKey: queryKeys.users.get(id!),
    queryFn: async () => {
      const docRef = doc(db, "users", id!);
      const snap = await getDoc(docRef);
      return snap.data() as IUser;
    },
    enabled: !!id,
  });
};
