import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { createRoot } from "react-dom/client";
import App from "./app.tsx";
import { AuthContextProvider } from "./auth/auth-context.tsx";
import "./index.css";

const firebaseConfig = {
  apiKey: "AIzaSyD8a0jdTXuOGO6xb1B7Hg-UA4lT5NxqXWs",
  authDomain: "hog-codes.firebaseapp.com",
  projectId: "hog-codes",
  storageBucket: "hog-codes.firebasestorage.app",
  messagingSenderId: "769306894632",
  appId: "1:769306894632:web:5b5ddec49d73140b46701d",
  measurementId: "G-8MR2PCXEWF",
};

initializeApp(firebaseConfig);
const auth = getAuth();

const theme = createTheme({
  palette: {
    mode: "light",
  },
});

createRoot(document.getElementById("root")!).render(
  <ThemeProvider theme={theme}>
    <AuthContextProvider auth={auth}>
      <CssBaseline />
      <App />
    </AuthContextProvider>
  </ThemeProvider>
);
