import { doc, Firestore, getDoc } from "firebase/firestore";

export const isAdmin = async (db: Firestore, uid: string) => {
  const docRef = doc(db, "admins", uid);
  const record = await getDoc(docRef);
  return record.exists();
};
