import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationsProvider } from "@toolpad/core/useNotifications";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./app.tsx";
import { AuthContextProvider } from "./auth/auth-context.tsx";
import "./index.css";
import { DbContext } from "./store/db-context.ts";
import { AppThemeContext, TThemeContext } from "./theme-context.tsx";

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

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

export const ThemeWrapper = ({
  children,
}: React.PropsWithChildren<unknown>) => {
  const [colorScheme, setColorScheme] = useState<TThemeContext["colorScheme"]>(
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

  const themeContext = useMemo<TThemeContext>(() => {
    return { colorScheme, setColorScheme };
  }, [colorScheme, setColorScheme]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppThemeContext.Provider value={themeContext}>
        {children}
      </AppThemeContext.Provider>
    </ThemeProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeWrapper>
      <NotificationsProvider
        slotProps={{
          snackbar: {
            autoHideDuration: 3000,
            anchorOrigin: { vertical: "bottom", horizontal: "right" },
          },
        }}
      >
        <BrowserRouter>
          <DbContext.Provider value={db}>
            <AuthContextProvider auth={auth}>
              <App />
            </AuthContextProvider>
          </DbContext.Provider>
        </BrowserRouter>
      </NotificationsProvider>
    </ThemeWrapper>
  </QueryClientProvider>
);
