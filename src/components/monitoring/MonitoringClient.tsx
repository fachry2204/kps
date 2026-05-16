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
  Info,
  Clock,
  ExternalLink
} from "lucide-react";
import { useState, useEffect } from "react";
import { getSituationalMonitoring } from "@/app/actions";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, any> = {
  "IDEOLOGI": Shield,
  "POLITIK": Globe,
  "EKONOMI": Banknote,
  "SOSIAL": Users,
  "BUDAYA": Library,
  "MILITER": Crosshair,
  "KEAMANAN": Lock,
};

const statusStyles: Record<string, any> = {
  "STABLE": "text-tactical-green bg-tactical-green/10 border-tactical-green/30",
  "ACTIVE": "text-tactical-cyan bg-tactical-cyan/10 border-tactical-cyan/30",
  "ELEVATED": "text-tactical-yellow bg-tactical-yellow/10 border-tactical-yellow/30",
  "WATCH": "text-tactical-yellow bg-tactical-yellow/10 border-tactical-yellow/30",
  "HIGH READY": "text-tactical-red bg-tactical-red/10 border-tactical-red/30",
  "STANDBY": "text-blue-500 bg-blue-500/10 border-blue-500/30",
};

export default function MonitoringClient() {
  const [time, setTime] = useState(new Date());
  const [monitoringData, setMonitoringData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    fetchData();
    const fetchInterval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => {
      clearInterval(timer);
      clearInterval(fetchInterval);
    };
  }, []);

  const fetchData = async () => {
    try {
      const data = await getSituationalMonitoring();
      setMonitoringData(data);
    } catch (error) {
      console.error("Fetch monitoring data failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
        {/* Monitoring Table */}
        <div className="tactical-glass border border-tactical-border overflow-hidden">
          <div className="bg-tactical-panel/40 px-6 py-4 border-b border-tactical-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-tactical-cyan" />
              <h3 className="text-xs font-black text-tactical-text uppercase tracking-widest font-mono">Laporan Situasi Terkini</h3>
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 text-[10px] text-tactical-cyan animate-pulse font-mono">
                <Clock size={10} /> MENGAMBIL DATA...
              </div>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/40 text-xs uppercase font-mono tracking-widest text-tactical-muted border-b border-tactical-border">
                  <th className="px-6 py-4 font-black">Kategori</th>
                  <th className="px-6 py-4 font-black">Status</th>
                  <th className="px-6 py-4 font-black text-center">Readiness</th>
                  <th className="px-6 py-4 font-black">Berita & Analisis Terkini</th>
                  <th className="px-6 py-4 font-black text-right">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tactical-border/30">
                {monitoringData.map((item, i) => {
                  const Icon = categoryIcons[item.category] || Activity;
                  const statusStyle = statusStyles[item.status] || "text-tactical-muted bg-tactical-muted/10 border-tactical-muted/30";
                  
                  return (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-tactical-cyan/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded bg-tactical-panel/50 border border-tactical-border group-hover:border-tactical-cyan/50 transition-all">
                            <Icon size={18} className="text-tactical-cyan" />
                          </div>
                          <span className="text-sm font-black text-tactical-text uppercase tracking-wider">{item.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-3 py-1.5 rounded text-xs font-black border uppercase tracking-widest",
                          statusStyle
                        )}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 min-w-[150px]">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-mono text-tactical-muted uppercase">
                            <span>Kesiapan</span>
                            <span className="text-tactical-cyan font-bold">{item.readiness}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-tactical-bg rounded-full overflow-hidden border border-tactical-border/30">
                            <div 
                              className="h-full bg-tactical-cyan" 
                              style={{ width: `${item.readiness}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        <p className="text-xs text-tactical-muted leading-relaxed font-mono line-clamp-3 uppercase italic">
                          "{item.news_summary}"
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-xs font-mono text-tactical-muted uppercase">
                          {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Intelligence Summary Overlay */}
        <div className="tactical-glass tactical-border p-6 bg-tactical-cyan/5 border-tactical-cyan/30 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-sm font-bold text-tactical-text font-mono flex items-center justify-center md:justify-start gap-2 mb-4 uppercase">
              <Cpu size={18} className="text-tactical-cyan" /> Intelligence Summary
            </h3>
            <p className="text-xs font-mono text-tactical-muted leading-relaxed uppercase italic border-l-0 md:border-l-2 border-tactical-cyan pl-0 md:pl-3 max-w-2xl">
              "Global monitoring engine is active. No major strategic breaches detected in the last 24 hours. Military readiness remains at peak capacity across all domestic sectors."
            </p>
          </div>
          <div className="flex gap-12 pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-tactical-cyan/20 pl-0 md:pl-12 w-full md:w-auto">
             <div className="text-center md:text-left">
                <div className="text-xs font-mono text-tactical-muted uppercase mb-1">Global Threat Level</div>
                <div className="text-2xl font-mono text-tactical-green font-bold">STABLE</div>
             </div>
             <div className="text-center md:text-left">
                <div className="text-xs font-mono text-tactical-muted uppercase mb-1">Active Surveillance</div>
                <div className="text-2xl font-mono text-tactical-cyan font-bold">428 NODES</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

