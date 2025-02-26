import crypto from "crypto";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { readdirSync, readFileSync } from "fs";
import path from "path";
import { parse } from "yaml";

const problemsDir = path.join(process.cwd(), "problems");
const problems = readdirSync(problemsDir);

const adminUsername = "manas.bajaj94@gmail.com";
const adminPassword = process.argv.at(2);
if (adminPassword === undefined) {
  throw new Error("Please admin password as an argument!");
}

const firebaseConfig = {
  apiKey: "AIzaSyD8a0jdTXuOGO6xb1B7Hg-UA4lT5NxqXWs",
  authDomain: "hog-codes.firebaseapp.com",
  projectId: "hog-codes",
  storageBucket: "hog-codes.firebasestorage.app",
  messagingSenderId: "769306894632",
  appId: "1:769306894632:web:5b5ddec49d73140b46701d",
  measurementId: "G-8MR2PCXEWF",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

await signInWithEmailAndPassword(auth, adminUsername, adminPassword);

async function deleteAllProblems() {
  const all = await getDocs(collection(db, "problems"));
  for (const doc of all.docs) {
    await deleteDoc(doc.ref);
  }
  console.log("Deleted all problems! Now adding new ones... ");
}

function generateProblemId(title) {
  return crypto
    .createHash("shake256", { outputLength: 3 })
    .update(title)
    .digest("hex");
}

async function upsertProblem(parsedProblem) {
  const id = generateProblemId(parsedProblem.title);
  const docRef = doc(db, "problems", id);

  try {
    const exists = (await getDoc(docRef)).exists();

    if (exists) {
      await updateDoc(docRef, parsedProblem);
      console.log(`Document updated: ${parsedProblem.title} ✅`);
    } else {
      await setDoc(docRef, { ...parsedProblem, createdAt: Timestamp.now() });
      console.log(`Document added: ${parsedProblem.title} ✅`);
    }
  } catch (e) {
    console.error(`Failed to upsert problem: ${parsedProblem.title}`);
  }
}

const promises = problems.map((problemPath) => {
  const infoContents = readFileSync(
    path.join(problemsDir, problemPath),
    "utf-8"
  );
  const parsed = parse(infoContents);
  return upsertProblem(parsed);
});

await Promise.all(promises);

process.exit(0);
