"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { useTheme } from "./theme-provider";

type CodeThemeContextType = {
  codeTheme: string;
};

const CodeThemeContext = createContext<CodeThemeContextType>({
  codeTheme: "github-dark",
});

export function useCodeTheme() {
  return useContext(CodeThemeContext);
}

export function CodeThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [codeTheme, setCodeTheme] = useState("github-dark");

  useEffect(() => {
    if (theme === "dark") {
      setCodeTheme("github-dark");
    } else {
      setCodeTheme("github-light");
    }
  }, [theme]);

  return (
    <CodeThemeContext.Provider value={{ codeTheme }}>
      {children}
    </CodeThemeContext.Provider>
  );
}
