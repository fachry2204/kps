"use client";

import { motion } from "framer-motion";
import { Activity, Eye, Shield, AlertTriangle, Radio, Globe, Zap, Cpu, Bell } from "lucide-react";
import { useState, useEffect } from "react";

export default function MonitoringClient() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const sensors = [
    { name: "Border Perimeter A-1", status: "STABLE", value: "98%", icon: Shield, color: "text-tactical-green" },
    { name: "Satellite Link K-9", status: "ELEVATED", value: "SYNC", icon: Globe, color: "text-tactical-yellow" },
    { name: "Cyber Firewall", status: "STABLE", value: "PASS", icon: Zap, color: "text-tactical-green" },
    { name: "COMMS Encryption", status: "ACTIVE", value: "256-AES", icon: Radio, color: "text-tactical-cyan" },
  ];

  const alerts = [
    { title: "UNIDENTIFIED DRONE", location: "Sector 4", time: "2 MIN AGO", type: "WARNING" },
    { title: "ENCRYPTED SIGNAL DETECTED", location: "Unknown Origin", time: "15 MIN AGO", type: "INFO" },
    { title: "PERIMETER BREACH ATTEMPT", location: "North Gate", time: "1 HOUR AGO", type: "CRITICAL" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-tactical-border pb-6">
        <div>
          <h2 className="text-2xl font-bold text-tactical-text flex items-center gap-2">
            <Activity className="text-tactical-green" />
            MONITORING SITUASI
          </h2>
          <p className="text-tactical-muted font-mono text-sm mt-1 uppercase tracking-widest">
            Real-time Tactical Intelligence & Surveillance
          </p>
        </div>
        <div className="text-right font-mono">
          <div className="text-tactical-text text-xl font-bold">{time.toLocaleTimeString()}</div>
          <div className="text-tactical-muted text-[10px] uppercase">{time.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sensor Grid */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          {sensors.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="tactical-glass tactical-border p-5 relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <s.icon size={64} />
              </div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xs font-mono text-tactical-muted uppercase tracking-tighter">{s.name}</h3>
                  <div className={`text-lg font-bold ${s.color} font-mono mt-1`}>{s.status}</div>
                </div>
                <div className="p-2 bg-tactical-panel rounded border border-tactical-border">
                  <s.icon size={16} className={s.color} />
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div className="w-full bg-tactical-bg h-1.5 rounded-full overflow-hidden border border-tactical-border">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "80%" }}
                    className={`h-full ${s.color.replace('text-', 'bg-')}`}
                  />
                </div>
                <span className="text-[10px] font-mono text-tactical-text ml-4">{s.value}</span>
              </div>
            </motion.div>
          ))}

          {/* Large Monitoring Panel */}
          <div className="md:col-span-2 tactical-glass tactical-border p-6 bg-tactical-panel/30">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-tactical-text font-mono flex items-center gap-2">
                <Eye size={16} className="text-tactical-cyan" /> SURVEILLANCE FEED
              </h3>
              <div className="flex gap-2">
                {['CAM 01', 'CAM 02', 'CAM 03'].map(cam => (
                  <button key={cam} className="px-2 py-1 bg-tactical-bg border border-tactical-border text-[9px] font-mono text-tactical-muted hover:text-tactical-cyan hover:border-tactical-cyan transition-colors">
                    {cam}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="aspect-video bg-black rounded border border-tactical-border relative overflow-hidden flex items-center justify-center">
               <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
               </div>
               <div className="text-tactical-muted font-mono text-xs flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-2 border-tactical-green border-t-transparent rounded-full animate-spin"></div>
                  CONNECTING TO SECURE FEED...
               </div>
               <div className="absolute top-4 left-4 text-[10px] font-mono text-tactical-red bg-black/50 px-2 py-1 rounded border border-tactical-red/30 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-tactical-red animate-pulse"></div>
                  LIVE FEED
               </div>
               <div className="absolute bottom-4 right-4 text-[10px] font-mono text-tactical-cyan bg-black/50 px-2 py-1 rounded border border-tactical-cyan/30">
                  GRID: 42.12.99 / 106.81.01
               </div>
            </div>
          </div>
        </div>

        {/* Alerts Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="tactical-glass tactical-border p-5 h-full">
            <h3 className="text-sm font-bold text-tactical-text font-mono mb-4 flex items-center gap-2">
              <Bell size={16} className="text-tactical-yellow" /> TACTICAL ALERTS
            </h3>
            <div className="space-y-4">
              {alerts.map((alert, i) => (
                <motion.div 
                  key={i}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className={`p-3 border-l-2 rounded-r bg-tactical-bg/50 ${
                    alert.type === 'CRITICAL' ? 'border-tactical-red bg-tactical-red/5' :
                    alert.type === 'WARNING' ? 'border-tactical-yellow bg-tactical-yellow/5' :
                    'border-tactical-cyan bg-tactical-cyan/5'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[9px] font-bold font-mono ${
                      alert.type === 'CRITICAL' ? 'text-tactical-red' :
                      alert.type === 'WARNING' ? 'text-tactical-yellow' :
                      'text-tactical-cyan'
                    }`}>{alert.type}</span>
                    <span className="text-[8px] font-mono text-tactical-muted">{alert.time}</span>
                  </div>
                  <h4 className="text-xs font-bold text-tactical-text">{alert.title}</h4>
                  <p className="text-[10px] font-mono text-tactical-muted mt-1 uppercase tracking-tight">{alert.location}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 p-4 border border-dashed border-tactical-border rounded bg-tactical-panel/20 text-center">
               <Cpu size={24} className="text-tactical-muted mx-auto mb-2 opacity-20" />
               <p className="text-[9px] font-mono text-tactical-muted leading-relaxed">
                  INTELLIGENCE ENGINE SCANNING FOR ANOMALIES IN REAR SECTORS...
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
