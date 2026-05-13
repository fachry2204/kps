"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const isAuth = localStorage.getItem("kopasus_auth");
    if (isAuth) {
      router.replace("/map");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-tactical-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-tactical-green/20 border-t-tactical-green rounded-full animate-spin" />
        <p className="text-tactical-green font-mono text-xs animate-pulse tracking-widest">ESTABLISHING SECURE CONNECTION...</p>
      </div>
    </div>
  );
}
