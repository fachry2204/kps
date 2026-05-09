"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User, KeyRound, Fingerprint, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authSteps, setAuthSteps] = useState<string[]>([]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setAuthSteps(["Initiating secure connection..."]);

    // Fake authentication sequence
    setTimeout(() => {
      setAuthSteps(prev => [...prev, "Verifying credentials..."]);
      setTimeout(() => {
        if (username === "admin") {
          setAuthSteps(prev => [...prev, "Bypassing biometric firewall..."]);
          setTimeout(() => {
            setAuthSteps(prev => [...prev, "ACCESS GRANTED."]);
            localStorage.setItem("kopasus_auth", "true");
            setTimeout(() => {
              router.push("/");
            }, 500);
          }, 800);
        } else {
          setLoading(false);
          setError("ACCESS DENIED. Invalid security clearance.");
          setAuthSteps([]);
        }
      }, 1000);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-tactical-bg flex items-center justify-center relative overflow-hidden">
      {/* Background Grid & Scanlines */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(27,40,32,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(27,40,32,0.2)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        <div className="scanlines z-10" />
      </div>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-tactical-green/30 m-8" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-tactical-green/30 m-8" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="z-20 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full mb-4 relative drop-shadow-[0_0_30px_rgba(204,0,0,0.5)]">
            <img src="/logo.png" alt="Kopassus Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-bold text-tactical-text tracking-widest uppercase">INTEGRATED DATA CENTER - SPECIAL FORCE</h1>
          <p className="text-tactical-green font-mono text-sm tracking-[0.3em] mt-2">(IDC - SF)</p>
          <div className="flex items-center justify-center gap-2 mt-4 text-xs font-mono text-tactical-muted">
            <Lock className="w-3 h-3" />
            <span>ENCRYPTED SECURE LINK</span>
          </div>
        </div>

        <div className="tactical-glass tactical-border p-8 relative">
          {/* Form */}
          {!loading ? (
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="p-3 border border-tactical-red bg-tactical-red/10 text-tactical-red text-xs font-mono font-bold animate-pulse text-center">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-tactical-muted" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-tactical-border bg-tactical-bg/50 rounded-md text-tactical-text placeholder-tactical-muted focus:outline-none focus:ring-1 focus:ring-tactical-green focus:border-tactical-green font-mono text-sm transition-all"
                    placeholder="OPERATIVE ID (e.g. admin)"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-tactical-muted" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-tactical-border bg-tactical-bg/50 rounded-md text-tactical-text placeholder-tactical-muted focus:outline-none focus:ring-1 focus:ring-tactical-green focus:border-tactical-green font-mono text-sm transition-all"
                    placeholder="CLEARANCE CODE"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-tactical-muted pt-2 border-t border-tactical-border/50">
                <label className="flex items-center gap-2 cursor-pointer hover:text-tactical-text transition-colors">
                  <input type="checkbox" className="accent-tactical-green" />
                  <span>BIOMETRIC OVERRIDE</span>
                </label>
                <Fingerprint className="w-4 h-4 text-tactical-green/50" />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center py-3 px-4 border border-tactical-green bg-tactical-green/20 text-tactical-green font-bold font-mono tracking-widest hover:bg-tactical-green hover:text-black transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tactical-green focus:ring-offset-tactical-bg group"
              >
                INITIALIZE UPLINK
                <div className="ml-3 w-2 h-2 rounded-full bg-tactical-green group-hover:bg-black group-hover:animate-ping" />
              </button>
            </form>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center space-y-6">
              <Loader2 className="w-12 h-12 text-tactical-green animate-spin" />
              <div className="w-full space-y-2 font-mono text-xs">
                {authSteps.map((step, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "flex items-center gap-2",
                      step === "ACCESS GRANTED." ? "text-tactical-green font-bold text-sm" : "text-tactical-muted"
                    )}
                  >
                    <span className="text-tactical-green">&gt;</span> {step}
                  </motion.div>
                ))}
                {authSteps[authSteps.length - 1] !== "ACCESS GRANTED." && (
                  <div className="flex items-center gap-2 text-tactical-muted animate-pulse">
                    <span className="text-tactical-green">&gt;</span> _
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="text-center mt-8 text-[10px] font-mono text-tactical-muted/50 tracking-widest">
          UNAUTHORIZED ACCESS IS STRICTLY PROHIBITED. <br/>
          ALL ACTIVITY IS LOGGED AND MONITORED.
        </div>
      </motion.div>
    </div>
  );
}
