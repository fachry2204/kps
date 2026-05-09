"use client";

import { 
  Users, 
  Building2, 
  Crosshair, 
  ShieldAlert, 
  Package,
  Activity
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const activityData = [
  { name: '00:00', active: 400, threat: 240 },
  { name: '04:00', active: 300, threat: 139 },
  { name: '08:00', active: 200, threat: 980 },
  { name: '12:00', active: 278, threat: 390 },
  { name: '16:00', active: 189, threat: 480 },
  { name: '20:00', active: 239, threat: 380 },
  { name: '24:00', active: 349, threat: 430 },
];

const personnelData = [
  { name: 'Grup 1', value: 850 },
  { name: 'Grup 2', value: 720 },
  { name: 'Grup 3', value: 930 },
  { name: 'Sat-81', value: 450 },
  { name: 'Pusdik', value: 300 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-tactical-text">COMMAND DASHBOARD</h2>
          <p className="text-tactical-muted font-mono text-sm mt-1">REAL-TIME TACTICAL OVERVIEW</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-xs font-mono bg-tactical-green/10 text-tactical-green border border-tactical-green rounded hover:bg-tactical-green/20 transition-colors">
            GENERATE REPORT
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Personil Aktif" 
          value="14,289" 
          icon={Users} 
          trend="2.4%" 
          trendUp={true} 
          delay={0.1}
          color="green"
        />
        <StatCard 
          title="Kesatuan" 
          value="12" 
          icon={Building2} 
          delay={0.2}
          color="muted"
        />
        <StatCard 
          title="Operasi Berjalan" 
          value="8" 
          icon={Crosshair} 
          trend="1 Baru" 
          trendUp={true} 
          delay={0.3}
          color="cyan"
        />
        <StatCard 
          title="Status Intelijen" 
          value="DEFCON 3" 
          icon={ShieldAlert} 
          delay={0.4}
          color="red"
        />
        <StatCard 
          title="Kesiapan Logistik" 
          value="94%" 
          icon={Package} 
          trend="Aman" 
          trendUp={true} 
          delay={0.5}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="lg:col-span-2 tactical-glass tactical-border p-5"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-tactical-text font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-tactical-cyan" />
              AKTIVITAS OPERASI & ANCAMAN
            </h3>
            <span className="text-xs font-mono text-tactical-muted bg-tactical-bg px-2 py-1 border border-tactical-border rounded">24H TIMELINE</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-tactical-cyan)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-tactical-cyan)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorThreat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-tactical-red)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-tactical-red)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-tactical-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-tactical-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-tactical-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-tactical-panel)', 
                    borderColor: 'var(--color-tactical-border)',
                    color: 'var(--color-tactical-text)'
                  }} 
                  itemStyle={{ color: 'var(--color-tactical-text)' }}
                />
                <Area type="monotone" dataKey="threat" stroke="var(--color-tactical-red)" fillOpacity={1} fill="url(#colorThreat)" />
                <Area type="monotone" dataKey="active" stroke="var(--color-tactical-cyan)" fillOpacity={1} fill="url(#colorActive)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Side Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="tactical-glass tactical-border p-5 flex flex-col"
        >
          <h3 className="text-tactical-text font-bold mb-6 font-mono border-b border-tactical-border pb-2">
            DISTRIBUSI PERSONIL
          </h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={personnelData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-tactical-border)" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} stroke="var(--color-tactical-muted)" fontSize={12} width={70} />
                <Tooltip 
                  cursor={{ fill: 'var(--color-tactical-border)' }}
                  contentStyle={{ backgroundColor: 'var(--color-tactical-bg)', borderColor: 'var(--color-tactical-border)' }}
                />
                <Bar dataKey="value" fill="var(--color-tactical-green)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Activity Logs & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="tactical-glass tactical-border p-5"
        >
          <h3 className="text-tactical-text font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tactical-red animate-pulse shadow-[0_0_8px_rgba(255,51,51,0.8)]"></span>
            LIVE ALERTS
          </h3>
          <div className="space-y-3">
            {[
              { time: "14:23", msg: "Pergerakan tak teridentifikasi di Sektor B", level: "high" },
              { time: "13:45", msg: "Tim Alpha telah mencapai titik rendezvous", level: "info" },
              { time: "12:30", msg: "Logistik suplai amunisi telah diberangkatkan", level: "info" },
              { time: "11:15", msg: "Perubahan cuaca ekstrem di area operasi timur", level: "warn" },
            ].map((alert, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded border border-tactical-border bg-tactical-bg">
                <span className="text-xs font-mono text-tactical-muted shrink-0 mt-0.5">{alert.time}</span>
                <p className={cn(
                  "text-sm",
                  alert.level === 'high' ? "text-tactical-red font-semibold" : 
                  alert.level === 'warn' ? "text-yellow-500" : "text-tactical-text"
                )}>
                  {alert.msg}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="tactical-glass tactical-border p-5"
        >
          <h3 className="text-tactical-text font-bold mb-4 font-mono">
            SITUATION REPORT
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-tactical-border bg-tactical-bg rounded flex flex-col items-center justify-center text-center">
              <span className="text-tactical-muted text-xs font-mono mb-2">THREAT LEVEL</span>
              <span className="text-2xl font-bold text-yellow-500">ELEVATED</span>
            </div>
            <div className="p-4 border border-tactical-border bg-tactical-bg rounded flex flex-col items-center justify-center text-center">
              <span className="text-tactical-muted text-xs font-mono mb-2">SYSTEM STATUS</span>
              <span className="text-2xl font-bold text-tactical-green">OPTIMAL</span>
            </div>
            <div className="p-4 border border-tactical-border bg-tactical-bg rounded flex flex-col items-center justify-center text-center">
              <span className="text-tactical-muted text-xs font-mono mb-2">ACTIVE SATELLITES</span>
              <span className="text-2xl font-bold text-tactical-cyan">4 / 5</span>
            </div>
            <div className="p-4 border border-tactical-border bg-tactical-bg rounded flex flex-col items-center justify-center text-center">
              <span className="text-tactical-muted text-xs font-mono mb-2">NETWORK SEC</span>
              <span className="text-2xl font-bold text-tactical-green">ENCRYPTED</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
