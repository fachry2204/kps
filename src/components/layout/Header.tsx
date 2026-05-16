"use client";

import { Bell, Search, User, Activity, LogOut, Globe, Monitor, MapPin, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { getNotifications, markNotificationRead } from "@/app/actions";

interface HeaderProps {
  isSidebarCollapsed: boolean;
}

export function Header({ isSidebarCollapsed }: HeaderProps) {
  const [time, setTime] = useState<Date | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [clientInfo, setClientInfo] = useState({ ip: "Loading...", country: "Loading...", browser: "Loading..." });
  const [isMounted, setIsMounted] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const CURRENT_USER_ID = 1;

  useEffect(() => {
    setIsMounted(true);
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Get Browser Info
    const ua = navigator.userAgent;
    let browser = "Unknown";
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";
    
    setClientInfo(prev => ({ ...prev, browser }));

    // Fetch IP and Country
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
        setClientInfo(prev => ({ 
          ...prev, 
          ip: data.ip || "Unknown", 
          country: data.country_name || "Unknown" 
        }));
      })
      .catch(() => {
        setClientInfo(prev => ({ ...prev, ip: "Local/Hidden", country: "Unknown" }));
      });

    // Click outside handler for dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // Fetch notifications
    const fetchNotifs = async () => {
      try {
        const notifs = await getNotifications(CURRENT_USER_ID);
        setNotifications(notifs);
      } catch (err) {}
    };
    fetchNotifs();
    const notifTimer = setInterval(fetchNotifs, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(notifTimer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("kopasus_auth");
    window.location.href = "/login";
  };

  const handleNotifClick = async (notif: any) => {
    if (!notif.is_read) {
      await markNotificationRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: 1 } : n));
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className={cn(
      "h-16 fixed top-0 right-0 bg-tactical-panel/90 backdrop-blur border-b border-tactical-border z-30 flex items-center justify-between px-6 transition-all duration-300",
      isSidebarCollapsed ? "left-20" : "left-64"
    )}>
      <div className="flex items-center flex-1 gap-6">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-muted" />
          <input 
            type="text" 
            placeholder="Cari operasi, personil, atau intelijen..." 
            className="w-full bg-tactical-bg border border-tactical-border rounded-md pl-10 pr-4 py-2 text-sm text-tactical-text placeholder:text-tactical-muted focus:outline-none focus:border-tactical-green focus:ring-1 focus:ring-tactical-green/50 transition-all"
          />
        </div>

        {/* Client Info Section */}
        <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 rounded-md border border-tactical-border bg-tactical-bg/50">
          <div className="flex items-center gap-1.5 text-xs text-tactical-muted">
            <Monitor className="w-3.5 h-3.5 text-tactical-cyan" />
            <span className="font-mono">{clientInfo.browser}</span>
          </div>
          <div className="w-px h-3 bg-tactical-border"></div>
          <div className="flex items-center gap-1.5 text-xs text-tactical-muted">
            <Globe className="w-3.5 h-3.5 text-tactical-cyan" />
            <span className="font-mono">{clientInfo.ip}</span>
          </div>
          <div className="w-px h-3 bg-tactical-border"></div>
          <div className="flex items-center gap-1.5 text-xs text-tactical-muted">
            <MapPin className="w-3.5 h-3.5 text-tactical-cyan" />
            <span className="font-mono">{clientInfo.country}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end min-w-[120px]">
          {isMounted && time ? (
            <>
              <div className="text-tactical-green font-mono text-sm font-bold">
                {format(time, "HH:mm:ss")} <span className="text-tactical-muted">WIB</span>
              </div>
              <div className="text-tactical-muted text-xs font-mono">
                {format(time, "dd MMM yyyy")}
              </div>
            </>
          ) : (
            <div className="h-10 w-24 bg-tactical-border/20 animate-pulse rounded"></div>
          )}
        </div>


        <div className="h-8 w-px bg-tactical-border mx-2"></div>

        <div className="flex items-center gap-2">
          {/* Notifications Section */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 text-tactical-muted hover:text-tactical-text transition-colors mr-2 cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-tactical-red rounded-full shadow-[0_0_8px_rgba(255,51,51,0.8)]"></span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-tactical-bg border border-tactical-border rounded shadow-lg z-50 overflow-hidden">
                <div className="p-3 border-b border-tactical-border bg-tactical-panel flex justify-between items-center">
                  <h3 className="font-bold text-tactical-text text-sm">NOTIFIKASI</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-tactical-red text-white px-2 py-0.5 rounded-full font-mono">{unreadCount} BELUM DIBACA</span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-tactical-muted">Tidak ada notifikasi.</div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        onClick={() => handleNotifClick(notif)}
                        className={`p-3 border-b border-tactical-border/50 cursor-pointer transition-colors hover:bg-tactical-panel ${!notif.is_read ? 'bg-tactical-panel/50' : 'opacity-70'}`}
                      >
                        <div className="flex justify-between mb-1">
                          <span className={`text-xs font-bold ${!notif.is_read ? 'text-tactical-green' : 'text-tactical-muted'}`}>{notif.title}</span>
                          <span className="text-[10px] font-mono text-tactical-muted">
                            {format(new Date(notif.created_at), 'HH:mm')}
                          </span>
                        </div>
                        <p className="text-xs text-tactical-text">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Profile Section */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 pl-2 border-l border-tactical-border hover:bg-tactical-border/30 p-2 rounded transition-colors cursor-pointer text-left"
            >
              <div className="w-9 h-9 rounded bg-tactical-bg border border-tactical-border flex items-center justify-center group-hover:border-tactical-green transition-colors">
                <User className="w-5 h-5 text-tactical-muted" />
              </div>
              <ChevronDown className={`w-4 h-4 text-tactical-muted transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-tactical-bg border border-tactical-border rounded shadow-lg py-0 z-50 overflow-hidden">
                <div className="px-4 py-3 bg-tactical-panel border-b border-tactical-border">
                  <div className="text-sm font-bold text-tactical-text">Administrator</div>
                  <div className="text-[10px] text-tactical-green font-mono uppercase tracking-widest mt-0.5">KOMANDAN</div>
                </div>
                <div className="py-1">
                  <Link 
                    href="/profile" 
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-tactical-text hover:bg-tactical-border hover:text-tactical-green transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Lihat Profile
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Separate Logout Button */}
          <button 
            onClick={handleLogout}
            title="Keluar"
            className="ml-2 p-2 rounded bg-tactical-red/10 border border-tactical-red/30 text-tactical-red hover:bg-tactical-red hover:text-tactical-bg transition-colors flex items-center justify-center"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
