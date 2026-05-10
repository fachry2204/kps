"use client";

import { useMemo } from "react";
import { Users, Crosshair, ShieldAlert, Package, Activity } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const COLORS = ['#39ff14', '#00ffff', '#ffcc00', '#ff3333', '#cc33ff', '#ff9900'];

interface StatistikClientProps {
  personnel: any[];
  opsDalamNegeri: any[];
  opsLuarNegeri: any[];
  intel: any[];
  logistics: any[];
}

export default function StatistikClient({ 
  personnel, opsDalamNegeri, opsLuarNegeri, intel, logistics 
}: StatistikClientProps) {
  
  // Personnel Data
  const personnelStats = useMemo(() => {
    const total = personnel.length;
    const byRank = personnel.reduce((acc, p) => {
      acc[p.rank] = (acc[p.rank] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const rankData = Object.keys(byRank).map(key => ({ name: key, count: byRank[key] }))
      .sort((a, b) => b.count - a.count).slice(0, 5); // Top 5 ranks

    return { total, rankData };
  }, [personnel]);

  // Operations Data
  const opsStats = useMemo(() => {
    const allOps = [...opsDalamNegeri, ...opsLuarNegeri];
    const total = allOps.length;
    const byStatus = allOps.reduce((acc, op) => {
      const status = op.status || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusData = Object.keys(byStatus).map(key => ({ name: key, count: byStatus[key] }));
    return { total, statusData };
  }, [opsDalamNegeri, opsLuarNegeri]);

  // Intel Data
  const intelStats = useMemo(() => {
    const total = intel.length;
    const byLevel = intel.reduce((acc, report) => {
      const level = report.threat_level || 'UNKNOWN';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const levelData = Object.keys(byLevel).map(key => ({ name: key, count: byLevel[key] }));
    return { total, levelData };
  }, [intel]);

  // Logistics Data
  const logStats = useMemo(() => {
    const total = logistics.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const byCondition = logistics.reduce((acc, item) => {
      const condition = item.condition_status || 'UNKNOWN';
      acc[condition] = (acc[condition] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const conditionData = Object.keys(byCondition).map(key => ({ name: key, count: byCondition[key] }));
    return { total, conditionData, itemsCount: logistics.length };
  }, [logistics]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-tactical-text flex items-center gap-2">
            <Activity className="text-tactical-green" />
            STATISTIK SISTEM
          </h2>
          <p className="text-tactical-muted font-mono text-sm mt-1">ANALYTICS & METRICS DASHBOARD</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="tactical-glass tactical-border p-4 bg-tactical-green/5 border-tactical-green">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-tactical-green" />
            <span className="text-sm font-bold uppercase tracking-wider text-tactical-muted">Total Personil</span>
          </div>
          <div className="text-3xl font-bold text-tactical-text font-mono">{personnelStats.total.toLocaleString()}</div>
        </div>
        
        <div className="tactical-glass tactical-border p-4 bg-tactical-cyan/5 border-tactical-cyan">
          <div className="flex items-center gap-3 mb-2">
            <Crosshair className="w-5 h-5 text-tactical-cyan" />
            <span className="text-sm font-bold uppercase tracking-wider text-tactical-muted">Total Operasi</span>
          </div>
          <div className="text-3xl font-bold text-tactical-cyan font-mono">{opsStats.total.toLocaleString()}</div>
        </div>

        <div className="tactical-glass tactical-border p-4 bg-yellow-500/5 border-yellow-500">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-bold uppercase tracking-wider text-tactical-muted">Laporan Intel</span>
          </div>
          <div className="text-3xl font-bold text-yellow-500 font-mono">{intelStats.total.toLocaleString()}</div>
        </div>

        <div className="tactical-glass tactical-border p-4 bg-purple-500/5 border-purple-500">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-bold uppercase tracking-wider text-tactical-muted">Total Logistik (Unit)</span>
          </div>
          <div className="text-3xl font-bold text-purple-500 font-mono">{logStats.total.toLocaleString()}</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Personnel Rank Chart */}
        <div className="tactical-glass tactical-border p-4">
          <h3 className="font-mono text-sm text-tactical-muted mb-4 tracking-widest border-b border-tactical-border pb-2">DISTRIBUSI PANGKAT PERSONIL</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={personnelStats.rankData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" tick={{fill: '#888', fontSize: 12}} />
                <YAxis stroke="#666" tick={{fill: '#888', fontSize: 12}} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #39ff14', color: '#fff' }}
                  itemStyle={{ color: '#39ff14' }}
                />
                <Bar dataKey="count" fill="#39ff14" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operations Status Chart */}
        <div className="tactical-glass tactical-border p-4">
          <h3 className="font-mono text-sm text-tactical-muted mb-4 tracking-widest border-b border-tactical-border pb-2">STATUS OPERASI</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={opsStats.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {opsStats.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #00ffff', color: '#fff' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Intel Threat Levels */}
        <div className="tactical-glass tactical-border p-4">
          <h3 className="font-mono text-sm text-tactical-muted mb-4 tracking-widest border-b border-tactical-border pb-2">TINGKAT ANCAMAN INTELIJEN</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={intelStats.levelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" stroke="#666" tick={{fill: '#888', fontSize: 12}} />
                <YAxis dataKey="name" type="category" stroke="#666" tick={{fill: '#888', fontSize: 12}} width={100} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #ffcc00', color: '#fff' }}
                  itemStyle={{ color: '#ffcc00' }}
                />
                <Bar dataKey="count" fill="#ffcc00" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Logistics Condition */}
        <div className="tactical-glass tactical-border p-4">
          <h3 className="font-mono text-sm text-tactical-muted mb-4 tracking-widest border-b border-tactical-border pb-2">KONDISI LOGISTIK & PERALATAN</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={logStats.conditionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {logStats.conditionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #cc33ff', color: '#fff' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
