import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
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

// await addProblem(
//   {
//     title: "Intersection of unsorted arrays",
//     description: `
// Given 2 sorted array of integers, find the elements that exist in both arrays.

// \`\`\`javascript
// intersect(
//   [1,2,2,3,4,4],q
//   [2,2,4,5,5,6,2000]
// )
// \`\`\`

// 1. The arrays might have duplicate numbers.
// 1. The order of returning result doesn't matter.
// 1. What is the **time** & **space** cost of your approach? Could you improve it?
// `,
//     category: "JavaScript",
//     createdAt: Timestamp.now(),
//     difficulty: "easy",
//     tags: ["Array"],
//     testCases: [],
//   } as Omit<IProblem, "id">,
//   db
// );

// await addProblem(
//   {
//     title: "Implement curry()",
//     description: `
// Currying is a useful technique used in JavaScript applications.

// &nbsp;  

// Please implement a \`curry()\` function, which accepts a function and return a curried one.
// &nbsp;  
// Here is an example: 

// \`\`\`javascript
// const join = (a, b, c) => {
//    return \`\${a}_\${b}_\${c}\`
// }
// const curriedJoin = curry(join)
// curriedJoin(1, 2, 3) // '1_2_3'
// curriedJoin(1)(2, 3) // '1_2_3'
// curriedJoin(1, 2)(3) // '1_2_3'
// \`\`\`

// More to read:

// - https://javascript.info/currying-partials
// - https://lodash.com/docs/4.17.15#curry
// `,
//     category: "JavaScript",
//     createdAt: Timestamp.now(),
//     difficulty: "easy",
//     tags: ["Array"],
//     testCases: [],
//   } as Omit<IProblem, "id">,
//   db
// );

createRoot(document.getElementById("root")!).render(
  <ThemeWrapper>
    <CssBaseline />
    <BrowserRouter>
      <AuthContextProvider auth={auth}>
        <DbContext.Provider value={db}>
          <App />
        </DbContext.Provider>
      </AuthContextProvider>
    </BrowserRouter>
  </ThemeWrapper>
);
