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

interface DashboardClientProps {
  stats: {
    personnel: number;
    units: number;
    operations: number;
    intel: number;
    logisticsAlert: number;
    unitDistribution: Array<{ name: string; value: number }>;
  };
}

const activityData = [
  { name: '00:00', active: 400, threat: 240 },
  { name: '04:00', active: 300, threat: 139 },
  { name: '08:00', active: 200, threat: 980 },
  { name: '12:00', active: 278, threat: 390 },
  { name: '16:00', active: 189, threat: 480 },
  { name: '20:00', active: 239, threat: 380 },
  { name: '24:00', active: 349, threat: 430 },
];

export default function DashboardClient({ stats }: DashboardClientProps) {
  const personnelData = stats.unitDistribution;
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-tactical-text">COMMAND DASHBOARD</h2>
          <p className="text-tactical-muted font-mono text-sm mt-1">REAL-TIME TACTICAL OVERVIEW (DATABASE ACTIVE)</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Total Personil" 
          value={stats.personnel.toLocaleString()} 
          icon={Users} 
          delay={0.1}
          color="green"
        />
        <StatCard 
          title="Kesatuan" 
          value={stats.units.toString()} 
          icon={Building2} 
          delay={0.2}
          color="muted"
        />
        <StatCard 
          title="Operasi Berjalan" 
          value={stats.operations.toString()} 
          icon={Crosshair} 
          delay={0.3}
          color="cyan"
        />
        <StatCard 
          title="Laporan Intel" 
          value={stats.intel.toString()} 
          icon={ShieldAlert} 
          delay={0.4}
          color="red"
        />
        <StatCard 
          title="Logistik Alert" 
          value={stats.logisticsAlert.toString()} 
          icon={Package} 
          trend="Stok Rendah" 
          trendUp={false} 
          delay={0.5}
          color="yellow"
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
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-tactical-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-tactical-muted)" fontSize={12} />
                <YAxis stroke="var(--color-tactical-muted)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-tactical-panel)', borderColor: 'var(--color-tactical-border)' }} 
                />
                <Area type="monotone" dataKey="threat" stroke="var(--color-tactical-red)" fill="#ff333333" />
                <Area type="monotone" dataKey="active" stroke="var(--color-tactical-cyan)" fill="#00f0ff33" />
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
              <BarChart data={personnelData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="var(--color-tactical-muted)" fontSize={12} width={70} />
                <Tooltip cursor={{ fill: 'var(--color-tactical-border)' }} />
                <Bar dataKey="value" fill="var(--color-tactical-green)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
