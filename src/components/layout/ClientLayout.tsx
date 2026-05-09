"use client";

import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useEffect, useState } from "react";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';
  
  // Quick fix to avoid hydration mismatch with usePathname
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    
    // Auth Check
    const isAuth = localStorage.getItem("kopasus_auth");
    if (!isAuth && !isLoginPage) {
      router.push("/login");
    }
  }, [isLoginPage, router]);

  if (!mounted) {
    return <div className="min-h-screen bg-tactical-bg" />;
  }

  if (isLoginPage) {
    return <main className="min-h-screen bg-tactical-bg">{children}</main>;
  }

  return (
    <>
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </>
  );
}
