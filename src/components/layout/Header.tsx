"use client";

import { Bell, Search, User, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";

export function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 fixed top-0 right-0 left-64 bg-tactical-panel/90 backdrop-blur border-b border-tactical-border z-30 flex items-center justify-between px-6">
      <div className="flex items-center flex-1 gap-6">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-muted" />
          <input 
            type="text" 
            placeholder="Search operation, personnel, or intel..." 
            className="w-full bg-tactical-bg border border-tactical-border rounded-md pl-10 pr-4 py-2 text-sm text-tactical-text placeholder:text-tactical-muted focus:outline-none focus:border-tactical-green focus:ring-1 focus:ring-tactical-green/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex flex-col items-end">
          <div className="text-tactical-green font-mono text-sm font-bold">
            {format(time, "HH:mm:ss")} <span className="text-tactical-muted">WIB</span>
          </div>
          <div className="text-tactical-muted text-xs font-mono">
            {format(time, "dd MMM yyyy")}
          </div>
        </div>

        <div className="h-8 w-px bg-tactical-border"></div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-tactical-muted hover:text-tactical-text transition-colors">
            <Activity className="w-5 h-5" />
          </button>
          <button className="relative p-2 text-tactical-muted hover:text-tactical-text transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-tactical-red rounded-full shadow-[0_0_8px_rgba(255,51,51,0.8)]"></span>
          </button>
          
          <button 
            onClick={() => {
              localStorage.removeItem("kopasus_auth");
              window.location.href = "/login";
            }}
            className="flex items-center gap-3 pl-2 border-l border-tactical-border hover:bg-tactical-border/30 p-2 rounded transition-colors cursor-pointer text-left"
          >
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-tactical-text">Jendral. K</span>
              <span className="text-xs text-tactical-green font-mono">COMMANDER</span>
            </div>
            <div className="w-9 h-9 rounded bg-tactical-bg border border-tactical-border flex items-center justify-center group-hover:border-tactical-red">
              <User className="w-5 h-5 text-tactical-muted group-hover:text-tactical-red transition-colors" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
