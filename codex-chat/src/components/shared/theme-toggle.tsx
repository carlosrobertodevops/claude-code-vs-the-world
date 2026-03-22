"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <Button
      variant="secondary"
      size="sm"
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <SunMedium className="mr-2 size-4" /> : <MoonStar className="mr-2 size-4" />}
      {theme === "dark" ? "Modo claro" : "Modo escuro"}
    </Button>
  );
}
