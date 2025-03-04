import {
  DefinedInitialDataOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuthContext } from "../auth/auth-context";
import { useDbContext } from "./db-context";

export interface IUser {
  id: string;
  completions: Record<string, boolean>;
}

export type TSubmission = Record<string, string>;

const queryKeys = {
  users: {
    get: (id: string) => ["users", id],
  },
  submissions: {
    get: (id: string) => ["submissions", id],
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

export const useGetSubmission = (
  problemId: string,
  queryOptions?: Partial<DefinedInitialDataOptions<TSubmission>>
) => {
  const db = useDbContext();
  const { user } = useAuthContext();

  return useQuery({
    ...queryOptions,
    queryKey: queryKeys.submissions.get(problemId),
    queryFn: async () => {
      const docRef = doc(db, "users", user.id, "submissions", problemId);
      const snap = await getDoc(docRef);
      if (!snap.exists) {
        throw new Error(`No submission found with id=${problemId}`);
      }

      return snap.data() as TSubmission;
    },
  });
};

export const useSetSubmission = () => {
  const db = useDbContext();
  const client = useQueryClient();
  const { user } = useAuthContext();

  return useMutation({
    mutationFn: async ({
      problemId,
      submission,
    }: {
      problemId: string;
      submission: TSubmission;
    }) => {
      console.log("saving", "users", user.id, "submissions", problemId);
      const docRef = doc(db, "users", user.id, "submissions", problemId);
      await setDoc(docRef, submission);
    },
    onSuccess: (_, variables) => {
      client.invalidateQueries({
        queryKey: queryKeys.submissions.get(variables.problemId),
      });
    },
  });
};
