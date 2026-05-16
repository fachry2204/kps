"use client";

import { useMemo } from "react";
import { 
  Users, 
  Building2, 
  Crosshair, 
  ShieldAlert, 
  Package,
  Activity,
  Target
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
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const COLORS = ['#39ff14', '#00ffff', '#ffcc00', '#ff3333', '#cc33ff', '#ff9900'];

interface DashboardClientProps {
  stats: {
    personnel: number;
    units: number;
    operations: number;
    intel: number;
    logisticsAlert: number;
    unitDistribution: Array<{ name: string; value: number }>;
  };
  personnel: any[];
  opsDalamNegeri: any[];
  opsLuarNegeri: any[];
  intel: any[];
  logistics: any[];
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

export default function DashboardClient({ 
  stats, personnel, opsDalamNegeri, opsLuarNegeri, intel, logistics 
}: DashboardClientProps) {
  const personnelData = stats.unitDistribution;

  // Personnel Data Processing
  const personnelStats = useMemo(() => {
    const total = personnel.length;
    const byRank = personnel.reduce((acc, p) => {
      acc[p.rank] = (acc[p.rank] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const rankData = Object.keys(byRank).map(key => ({ name: key, count: byRank[key] }))
      .sort((a, b) => b.count - a.count).slice(0, 5);

    return { total, rankData };
  }, [personnel]);

  // Operations Data Processing
  const opsStats = useMemo(() => {
    const allOps = [...opsDalamNegeri, ...opsLuarNegeri];
    const byStatus = allOps.reduce((acc, op) => {
      const status = op.status || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusData = Object.keys(byStatus).map(key => ({ name: key, count: byStatus[key] }));
    return { statusData };
  }, [opsDalamNegeri, opsLuarNegeri]);

  // Intel Data Processing
  const intelStats = useMemo(() => {
    const byLevel = intel.reduce((acc, report) => {
      const level = report.threat_level || 'UNKNOWN';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const levelData = Object.keys(byLevel).map(key => ({ name: key, count: byLevel[key] }));
    return { levelData };
  }, [intel]);

  // Logistics Data Processing
  const logStats = useMemo(() => {
    const byCondition = logistics.reduce((acc, item) => {
      const condition = item.condition_status || 'UNKNOWN';
      acc[condition] = (acc[condition] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const conditionData = Object.keys(byCondition).map(key => ({ name: key, count: byCondition[key] }));
    return { conditionData };
  }, [logistics]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-tactical-text">DASHBOARD KOMANDO & ANALITIK</h2>
          <p className="text-tactical-muted font-mono text-sm mt-1">TINJAUAN TAKTIS TERINTEGRASI</p>
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
          value={(opsDalamNegeri.length + opsLuarNegeri.length).toString()} 
          icon={Crosshair} 
          delay={0.3}
          color="cyan"
          subStats={[
            { label: "Operasi Dalam Negeri", value: opsDalamNegeri.length },
            { label: "Operasi Luar Negeri", value: opsLuarNegeri.length }
          ]}
        />
        <StatCard 
          title="Laporan Intel" 
          value={stats.intel.toString()} 
          icon={ShieldAlert} 
          delay={0.4}
          color="red"
        />
        <StatCard 
          title="Peringatan Logistik" 
          value={stats.logisticsAlert.toString()} 
          icon={Package} 
          trend="Stok Rendah" 
          trendUp={false} 
          delay={0.5}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart - Occupies 2 columns */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="lg:col-span-2 tactical-glass tactical-border p-5"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-tactical-text font-bold flex items-center gap-2 uppercase tracking-tight">
              <Activity className="w-5 h-5 text-tactical-cyan" />
              AKTIVITAS OPERASI & ANCAMAN
            </h3>
          </div>
          <div className="h-[350px] w-full">
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

        {/* Personnel Distribution - Occupies 1 column */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="tactical-glass tactical-border p-5 flex flex-col"
        >
          <h3 className="text-tactical-text font-bold mb-6 font-mono border-b border-tactical-border pb-2 uppercase tracking-tight">
            DISTRIBUSI PERSONIL
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={personnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-tactical-border)" horizontal={false} />
                <XAxis type="number" stroke="var(--color-tactical-muted)" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="var(--color-tactical-muted)" fontSize={10} width={80} />
                <Tooltip cursor={{ fill: 'var(--color-tactical-border)' }} contentStyle={{ backgroundColor: 'var(--color-tactical-panel)', borderColor: 'var(--color-tactical-border)' }} />
                <Bar dataKey="value" fill="var(--color-tactical-green)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Integrated Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Personnel Rank Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="tactical-glass tactical-border p-4 bg-tactical-dark/50"
        >
          <h3 className="font-mono text-[10px] text-tactical-muted mb-4 tracking-widest border-b border-tactical-border pb-2 uppercase">Sebaran Pangkat</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={personnelStats.rankData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#444" tick={{fill: '#666', fontSize: 8}} />
                <YAxis stroke="#444" tick={{fill: '#666', fontSize: 8}} />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                <Bar dataKey="count" fill="#39ff14" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Operations Status Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="tactical-glass tactical-border p-4 bg-tactical-dark/50"
        >
          <h3 className="font-mono text-[10px] text-tactical-muted mb-4 tracking-widest border-b border-tactical-border pb-2 uppercase">Status Operasi</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={opsStats.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {opsStats.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Intel Threat Levels */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="tactical-glass tactical-border p-4 bg-tactical-dark/50"
        >
          <h3 className="font-mono text-[10px] text-tactical-muted mb-4 tracking-widest border-b border-tactical-border pb-2 uppercase">Ancaman Intelijen</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={intelStats.levelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
                <XAxis type="number" stroke="#444" tick={{fill: '#666', fontSize: 8}} />
                <YAxis dataKey="name" type="category" stroke="#444" tick={{fill: '#666', fontSize: 8}} width={60} />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                <Bar dataKey="count" fill="#ffcc00" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Logistics Condition */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="tactical-glass tactical-border p-4 bg-tactical-dark/50"
        >
          <h3 className="font-mono text-[10px] text-tactical-muted mb-4 tracking-widest border-b border-tactical-border pb-2 uppercase">Kondisi Logistik</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={logStats.conditionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {logStats.conditionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
