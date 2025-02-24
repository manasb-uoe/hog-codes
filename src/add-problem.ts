import { addDoc, collection, Firestore } from "firebase/firestore";
import { IProblem } from "./types";

export const addProblem = async (
  problem: Omit<IProblem, "id">,
  db: Firestore
) => {
  try {
    const docRef = await addDoc(collection(db, "problems"), problem);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};
