import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuthContext } from "../auth/auth-context";
import { useDbContext } from "./db-context";

export interface IUser {
  id: string;
  completions?: Record<string, boolean>;
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

export const useGetCurrentUser = () => {
  const db = useDbContext();
  const auth = useAuthContext();

  return useQuery({
    queryKey: queryKeys.users.get(auth.user.uid),
    queryFn: async () => {
      const docRef = doc(db, "users", auth.user.uid);
      const snap = await getDoc(docRef);
      return snap.data() as IUser;
    },
  });
};
