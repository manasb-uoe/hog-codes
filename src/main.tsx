import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./app.tsx";
import { AuthContextProvider } from "./auth/auth-context.tsx";
import "./index.css";
import { DbContext } from "./store/db-context.ts";

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

const auth = getAuth();

// try {
//   const docRef = await addDoc(collection(db, "problems"), {
//     id: shortid.generate(),
//     title: "Find the single integer",
//     description: `
// Given an array of integers, all integers appear twice except one integer, could you quickly target it ?

// \`\`\`
// const arr = [10, 2, 2 , 1, 0, 0, 10]
// findSingle(arr) // 1
// \`\`\`
// `,
//     difficulty: "easy",
//     tags: ["Algorithm"],
//     testCases: [],
//     createdAt: Timestamp.now(),
//   } as IProblem);
//   console.log("Document written with ID: ", docRef.id);
// } catch (e) {
//   console.error("Error adding document: ", e);
// }

export const ThemeWrapper = ({
  children,
}: React.PropsWithChildren<unknown>) => {
  const [colorScheme, setColorScheme] = useState<"light" | "dark">(
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  );

  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode: colorScheme,
      },
    });
  }, [colorScheme]);

  useEffect(() => {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (event) =>
        setColorScheme(event.matches ? "dark" : "light")
      );
  }, []);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

createRoot(document.getElementById("root")!).render(
  <ThemeWrapper>
    <CssBaseline />
    <AuthContextProvider auth={auth}>
      <DbContext.Provider value={db}>
        <App />
      </DbContext.Provider>
    </AuthContextProvider>
  </ThemeWrapper>
);
