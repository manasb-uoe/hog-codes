import React from "react";

export type TThemeContext = {
  colorScheme: "light" | "dark";
  setColorScheme: (scheme: "light" | "dark") => void;
};

export const AppThemeContext = React.createContext<TThemeContext>(
  {} as TThemeContext
);
