"use client";

import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';
  
  const [mounted, setMounted] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Auth Check
    const isAuth = localStorage.getItem("kopasus_auth");
    if (!isAuth && !isLoginPage) {
      router.push("/login");
    }

    // Auto-collapse sidebar on Map page, expand on others
    if (pathname === '/map') {
      setIsSidebarCollapsed(true);
    } else {
      setIsSidebarCollapsed(false);
    }

    // Trigger navigation loader
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [isLoginPage, router, pathname]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-tactical-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-48 h-48 mb-4 relative drop-shadow-[0_0_30px_rgba(204,0,0,0.3)] animate-pulse">
            <img src="/logo_puskodal.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 border-4 border-tactical-green/20 border-t-tactical-green rounded-full animate-spin" />
            <p className="text-tactical-green font-mono text-xs animate-pulse tracking-widest uppercase">Initializing Secure Uplink...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoginPage) {
    return <main className="min-h-screen bg-tactical-bg">{children}</main>;
  }

  return (
    <>
      {/* Navigation Loader Overlay */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-tactical-bg/90 backdrop-blur-md flex flex-col items-center justify-center pointer-events-auto"
          >
            <div className="flex flex-col items-center gap-6">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="w-40 h-40 relative drop-shadow-[0_0_30px_rgba(204,0,0,0.5)]"
              >
                <img src="/logo_puskodal.png" alt="Logo" className="w-full h-full object-contain" />
              </motion.div>
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-tactical-green rounded-full animate-ping" />
                  <p className="text-tactical-green font-mono text-sm tracking-[0.4em] uppercase font-bold drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                    Mengakses Data
                  </p>
                  <div className="w-1 h-1 bg-tactical-green rounded-full animate-ping" />
                </div>
                <div className="w-48 h-0.5 bg-tactical-border/50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-tactical-green shadow-[0_0_10px_rgba(34,197,94,0.8)]"
                  />
                </div>
              </div>
            </div>
            
            {/* Tactical Decors */}
            <div className="absolute top-0 left-0 w-32 h-32 border-l border-t border-tactical-green/30 m-8" />
            <div className="absolute bottom-0 right-0 w-32 h-32 border-r border-b border-tactical-green/30 m-8" />
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      {pathname !== '/map' && <Header isSidebarCollapsed={isSidebarCollapsed} />}
      <main className={cn(
        pathname !== '/map' && "pt-16",
        "min-h-screen transition-all duration-300",
        isSidebarCollapsed ? "ml-20" : "ml-64"
      )}>
        <div className={cn(pathname !== '/map' && "p-6", "h-full")}>
          {children}
        </div>
      </main>
    </>
  );
}
