"use client";

import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';
  
  // Quick fix to avoid hydration mismatch with usePathname
  const [mounted, setMounted] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  useEffect(() => {
    setMounted(true);
    
    // Auth Check
    const isAuth = localStorage.getItem("kopasus_auth");
    if (!isAuth && !isLoginPage) {
      router.push("/login");
    }

    // Auto-collapse sidebar on Map page
    if (pathname === '/map') {
      setIsSidebarCollapsed(true);
    }
  }, [isLoginPage, router, pathname]);

  if (!mounted) {
    return <div className="min-h-screen bg-tactical-bg" />;
  }

  if (isLoginPage) {
    return <main className="min-h-screen bg-tactical-bg">{children}</main>;
  }

  return (
    <>
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
