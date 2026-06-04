import { Link } from "@tanstack/react-router";
import { Moon, Sun, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme") === "dark";
    setDark(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const linkCls = "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors";
  const activeCls = "text-foreground";

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">UrEMONet</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link to="/" className={linkCls} activeProps={{ className: activeCls }} activeOptions={{ exact: true }}>
            Home
          </Link>
          <Link to="/detect" className={linkCls} activeProps={{ className: activeCls }}>
            Detect
          </Link>
          <Link to="/history" className={linkCls} activeProps={{ className: activeCls }}>
            History
          </Link>
          <Link to="/about" className={linkCls} activeProps={{ className: activeCls }}>
            About
          </Link>
        </nav>

        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card hover:bg-accent transition-colors"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
      <nav className="flex items-center justify-around border-t border-border/60 px-4 py-2 md:hidden">
        <Link to="/" className={linkCls} activeProps={{ className: activeCls }} activeOptions={{ exact: true }}>Home</Link>
        <Link to="/detect" className={linkCls} activeProps={{ className: activeCls }}>Detect</Link>
        <Link to="/history" className={linkCls} activeProps={{ className: activeCls }}>History</Link>
        <Link to="/about" className={linkCls} activeProps={{ className: activeCls }}>About</Link>
      </nav>
    </header>
  );
}
