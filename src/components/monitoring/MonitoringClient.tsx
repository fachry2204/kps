"use client";

import { motion } from "framer-motion";
import { 
  Activity, 
  Shield, 
  Globe, 
  Banknote, 
  Users, 
  Library, 
  Crosshair, 
  Lock,
  Bell,
  Cpu,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Info
} from "lucide-react";
import { useState, useEffect } from "react";

export default function MonitoringClient() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    { 
      name: "IDEOLOGI", 
      status: "STABLE", 
      readiness: 95, 
      icon: Shield, 
      color: "text-tactical-green",
      border: "border-tactical-green/30",
      bg: "bg-tactical-green/5",
      alerts: 0,
      description: "Pemantauan ketahanan ideologi dan doktrin nasional."
    },
    { 
      name: "POLITIK", 
      status: "STABLE", 
      readiness: 88, 
      icon: Globe, 
      color: "text-tactical-cyan",
      border: "border-tactical-cyan/30",
      bg: "bg-tactical-cyan/5",
      alerts: 2,
      description: "Stabilitas politik dan dinamika pemerintahan."
    },
    { 
      name: "EKONOMI", 
      status: "ELEVATED", 
      readiness: 76, 
      icon: Banknote, 
      color: "text-tactical-yellow",
      border: "border-tactical-yellow/30",
      bg: "bg-tactical-yellow/5",
      alerts: 5,
      description: "Keamanan finansial dan logistik strategis."
    },
    { 
      name: "SOSIAL", 
      status: "STABLE", 
      readiness: 92, 
      icon: Users, 
      color: "text-tactical-green",
      border: "border-tactical-green/30",
      bg: "bg-tactical-green/5",
      alerts: 1,
      description: "Kondisi demografi dan interaksi masyarakat."
    },
    { 
      name: "BUDAYA", 
      status: "STABLE", 
      readiness: 98, 
      icon: Library, 
      color: "text-tactical-cyan",
      border: "border-tactical-cyan/30",
      bg: "bg-tactical-cyan/5",
      alerts: 0,
      description: "Ketahanan budaya dan integritas sosial."
    },
    { 
      name: "MILITER", 
      status: "HIGH READY", 
      readiness: 100, 
      icon: Crosshair, 
      color: "text-tactical-red",
      border: "border-tactical-red/30",
      bg: "bg-tactical-red/5",
      alerts: 3,
      description: "Kesiapan tempur dan penggelaran pasukan."
    },
    { 
      name: "KEAMANAN", 
      status: "ACTIVE", 
      readiness: 94, 
      icon: Lock, 
      color: "text-tactical-cyan",
      border: "border-tactical-cyan/30",
      bg: "bg-tactical-cyan/5",
      alerts: 4,
      description: "Keamanan internal dan pencegahan ancaman."
    },
  ];

  const recentAlerts = [
    { title: "UNIDENTIFIED DRONE", location: "Sector 4", time: "2 MIN AGO", type: "WARNING" },
    { title: "ENCRYPTED SIGNAL DETECTED", location: "Unknown Origin", time: "15 MIN AGO", type: "INFO" },
    { title: "PERIMETER BREACH ATTEMPT", location: "North Gate", time: "1 HOUR AGO", type: "CRITICAL" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-end border-b border-tactical-border pb-6">
        <div>
          <h2 className="text-2xl font-bold text-tactical-text flex items-center gap-2">
            <Activity className="text-tactical-green" />
            MONITORING SITUASI (IPOLEKSOSBUDHANKAM)
          </h2>
          <p className="text-tactical-muted font-mono text-xs mt-1 uppercase tracking-widest">
            Strategic Situational Awareness & Global Monitoring
          </p>
        </div>
        <div className="text-right font-mono">
          <div className="text-tactical-text text-xl font-bold">{time.toLocaleTimeString()}</div>
          <div className="text-tactical-muted text-[9px] uppercase tracking-tighter">
            {time.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Main Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`tactical-glass border ${cat.border} p-5 relative group cursor-pointer hover:bg-tactical-panel/40 transition-all`}
            >
              <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${cat.color}`}>
                <cat.icon size={64} />
              </div>

              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded border ${cat.border} ${cat.bg}`}>
                  <cat.icon size={18} className={cat.color} />
                </div>
                {cat.alerts > 0 && (
                  <div className="flex items-center gap-1 bg-tactical-red/10 border border-tactical-red/30 px-2 py-0.5 rounded animate-pulse">
                    <AlertTriangle size={10} className="text-tactical-red" />
                    <span className="text-[9px] font-mono text-tactical-red font-bold">{cat.alerts}</span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xs font-mono text-tactical-muted uppercase tracking-widest flex items-center gap-2">
                  {cat.name}
                  <TrendingUp size={10} className="text-tactical-green opacity-50" />
                </h3>
                <div className={`text-xl font-bold text-tactical-text font-mono mt-1`}>
                  {cat.status}
                </div>
                <p className="text-[10px] text-tactical-muted font-mono mt-2 leading-relaxed h-8 line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[9px] font-mono text-tactical-muted uppercase">Readiness</span>
                  <span className={`text-[10px] font-mono font-bold ${cat.color}`}>{cat.readiness}%</span>
                </div>
                <div className="h-1 w-full bg-tactical-bg rounded-full overflow-hidden border border-tactical-border/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.readiness}%` }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                    className={`h-full ${cat.color.replace('text-', 'bg-')}`}
                  />
                </div>
              </div>
              
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight size={14} className="text-tactical-muted" />
              </div>
            </motion.div>
          ))}

          {/* System Status Summary */}
          <div className="md:col-span-2 xl:col-span-4 tactical-glass tactical-border p-6 bg-tactical-cyan/5 border-tactical-cyan/30 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-tactical-text font-mono flex items-center gap-2 mb-4 uppercase">
                <Cpu size={16} className="text-tactical-cyan" /> Intelligence Summary
              </h3>
              <p className="text-[10px] font-mono text-tactical-muted leading-relaxed uppercase italic border-l-2 border-tactical-cyan pl-3 max-w-2xl">
                "Global monitoring engine is active. No major strategic breaches detected in the last 24 hours. Military readiness remains at peak capacity across all domestic sectors."
              </p>
            </div>
            <div className="flex gap-12 pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-tactical-cyan/20 pl-0 md:pl-12 w-full md:w-auto">
               <div>
                  <div className="text-[10px] font-mono text-tactical-muted uppercase mb-1">Global Threat Level</div>
                  <div className="text-xl font-mono text-tactical-green font-bold">STABLE</div>
               </div>
               <div>
                  <div className="text-[10px] font-mono text-tactical-muted uppercase mb-1">Active Surveillance</div>
                  <div className="text-xl font-mono text-tactical-cyan font-bold">428 NODES</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
