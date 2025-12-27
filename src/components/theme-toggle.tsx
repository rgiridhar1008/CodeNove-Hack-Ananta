
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }
  
  if (!isMounted) {
    return (
        <div className="w-16 h-8 rounded-full bg-muted animate-pulse" />
    )
  }

  return (
    <button
        onClick={toggleTheme}
        className={cn(
            "relative inline-flex items-center h-8 w-16 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            theme === 'light' ? 'bg-sky-400' : 'bg-slate-800'
        )}
    >
      <span className="sr-only">Toggle theme</span>
      
      {/* Sliding thumb */}
      <span
        className={cn(
          "absolute flex items-center justify-center h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300",
          theme === 'light' ? 'translate-x-1' : 'translate-x-9'
        )}
      >
        <Sun className={cn("h-4 w-4 text-yellow-500 transition-opacity duration-300", theme === 'light' ? 'opacity-100' : 'opacity-0 rotate-90 scale-0')} />
        <Moon className={cn("absolute h-4 w-4 text-slate-800 transition-opacity duration-300", theme === 'dark' ? 'opacity-100' : 'opacity-0 -rotate-90 scale-0')} />
      </span>
    </button>
  );
}
