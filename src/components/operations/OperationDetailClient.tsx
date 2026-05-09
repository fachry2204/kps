"use client";

import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Target, 
  Shield, 
  Calendar, 
  Activity, 
  Flag,
  AlertTriangle,
  History,
  FileText
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function OperationDetailClient({ id, initialData }: { id: string, initialData: any }) {
  const router = useRouter();
  const pathname = usePathname();

  // Mock data for extended details to show a premium UI
  const details = {
    name: initialData?.operation_name || `SATGAS OPS ${id}`,
    code: `OPS-TAC-${String(id).padStart(3, '0')}`,
    location: initialData?.location || "Area of Responsibility",
    status: "ACTIVE",
    priority: "HIGH",
    deploymentDate: "12 Jan 2026",
    objectives: [
      "Securing vital strategic infrastructure",
      "Intelligence gathering and reconnaissance",
      "Neutralizing asymmetric threats",
      "Community engagement and stabilization"
    ],
    intelSummary: "Recent surveillance indicates increased movement in the northern sector. Tactical teams are on high alert.",
    timeline: [
      { date: "10 May 2026", event: "Routine patrol completed. No anomalies detected." },
      { date: "08 May 2026", event: "Personnel rotation successful. Fresh troops deployed." },
      { date: "05 May 2026", event: "Strategic meeting with local leadership held." }
    ]
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-tactical-border pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (pathname.includes('/dalam-negeri/')) {
                router.push('/gelar-operasi/dalam-negeri');
              } else if (pathname.includes('/luar-negeri/')) {
                router.push('/gelar-operasi/luar-negeri');
              } else {
                router.push('/gelar-operasi');
              }
            }}
            className="p-2 hover:bg-tactical-border rounded-full text-tactical-muted hover:text-tactical-text transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-tactical-text tracking-tighter uppercase">{details.name}</h2>
              <span className="px-2 py-0.5 bg-tactical-green/10 text-tactical-green border border-tactical-green/30 text-[10px] font-mono rounded font-bold">
                {details.status}
              </span>
            </div>
            <p className="text-tactical-muted font-mono text-xs mt-1 tracking-widest">{details.code} | {details.location}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-tactical-panel border border-tactical-border rounded text-xs font-mono text-tactical-text hover:bg-tactical-border transition-all">
            EXPORT REPORT
          </button>
          <button className="px-4 py-2 bg-tactical-red/20 border border-tactical-red/50 rounded text-xs font-mono text-tactical-red font-bold hover:bg-tactical-red hover:text-white transition-all">
            ALERT COMMAND
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & Objectives */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="tactical-glass tactical-border p-4">
              <div className="text-[10px] font-mono text-tactical-muted mb-2 uppercase">Personnel Strength</div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-tactical-cyan/10 rounded border border-tactical-cyan/30 text-tactical-cyan">
                  <Users size={18} />
                </div>
                <div>
                  <div className="text-xl font-bold text-tactical-text">450 <span className="text-xs font-normal text-tactical-muted font-mono">PX</span></div>
                  <div className="text-[9px] font-mono text-tactical-green uppercase">Full Capacity</div>
                </div>
              </div>
            </div>
            
            <div className="tactical-glass tactical-border p-4">
              <div className="text-[10px] font-mono text-tactical-muted mb-2 uppercase">Deployment Time</div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-tactical-yellow/10 rounded border border-tactical-yellow/30 text-tactical-yellow">
                  <Calendar size={18} />
                </div>
                <div>
                  <div className="text-xl font-bold text-tactical-text">120 <span className="text-xs font-normal text-tactical-muted font-mono">DAYS</span></div>
                  <div className="text-[9px] font-mono text-tactical-muted uppercase">Since {details.deploymentDate}</div>
                </div>
              </div>
            </div>

            <div className="tactical-glass tactical-border p-4">
              <div className="text-[10px] font-mono text-tactical-muted mb-2 uppercase">Strategic Priority</div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-tactical-red/10 rounded border border-tactical-red/30 text-tactical-red">
                  <Target size={18} />
                </div>
                <div>
                  <div className="text-xl font-bold text-tactical-red">{details.priority}</div>
                  <div className="text-[9px] font-mono text-tactical-muted uppercase">Level 5 Clearance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mission Objectives */}
          <div className="tactical-glass tactical-border p-6">
            <h3 className="text-sm font-bold text-tactical-text font-mono border-b border-tactical-border pb-3 mb-4 flex items-center gap-2 uppercase">
              <Flag size={16} className="text-tactical-cyan" /> Mission Objectives
            </h3>
            <ul className="space-y-4">
              {details.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-tactical-text">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-tactical-cyan flex-shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  {obj}
                </li>
              ))}
            </ul>
          </div>

          {/* Timeline / Recent Activity */}
          <div className="tactical-glass tactical-border p-6">
            <h3 className="text-sm font-bold text-tactical-text font-mono border-b border-tactical-border pb-3 mb-4 flex items-center gap-2 uppercase">
              <History size={16} className="text-tactical-green" /> Operational Timeline
            </h3>
            <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-tactical-border">
              {details.timeline.map((item, i) => (
                <div key={i} className="pl-6 relative">
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-tactical-panel border border-tactical-border flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-tactical-green" />
                  </div>
                  <div className="text-[10px] font-mono text-tactical-muted uppercase mb-1">{item.date}</div>
                  <div className="text-sm text-tactical-text">{item.event}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Intel & Map Preview */}
        <div className="space-y-6">
          {/* Intelligence Summary */}
          <div className="tactical-glass border-l-4 border-l-tactical-yellow p-6 bg-tactical-yellow/5">
            <h3 className="text-sm font-bold text-tactical-yellow font-mono mb-3 flex items-center gap-2 uppercase">
              <AlertTriangle size={16} /> Intelligence Summary
            </h3>
            <p className="text-xs text-tactical-text leading-relaxed font-mono">
              {details.intelSummary}
            </p>
            <div className="mt-4 pt-4 border-t border-tactical-yellow/20 flex justify-between items-center">
              <span className="text-[9px] font-mono text-tactical-muted uppercase">Intel Confidence: 85%</span>
              <button className="text-[10px] font-bold text-tactical-yellow hover:underline uppercase tracking-tighter">VIEW SOURCE</button>
            </div>
          </div>

          {/* Operational Status */}
          <div className="tactical-glass tactical-border p-6">
            <h3 className="text-sm font-bold text-tactical-text font-mono mb-4 flex items-center gap-2 uppercase">
              <Activity size={16} className="text-tactical-green" /> System Integrity
            </h3>
            <div className="space-y-4">
              {[
                { label: "Comms Link", status: "STABLE", color: "text-tactical-green" },
                { label: "Supply Chain", status: "MODERATE", color: "text-tactical-yellow" },
                { label: "Medevac Readiness", status: "STANDBY", color: "text-tactical-cyan" },
                { label: "Air Support", status: "UNAVAILABLE", color: "text-tactical-red" }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-[11px] font-mono text-tactical-muted uppercase">{item.label}</span>
                  <span className={`text-[10px] font-bold font-mono ${item.color}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="tactical-glass tactical-border p-6">
            <h3 className="text-sm font-bold text-tactical-text font-mono mb-4 flex items-center gap-2 uppercase">
              <FileText size={16} /> Related Documents
            </h3>
            <div className="space-y-2">
              {['MissionBriefing.pdf', 'AreaMap_v2.dwg', 'RulesOfEngagement.docx'].map((file, i) => (
                <div key={i} className="p-2 bg-tactical-panel/50 border border-tactical-border rounded flex items-center justify-between group hover:border-tactical-green/50 cursor-pointer transition-all">
                  <span className="text-[10px] font-mono text-tactical-muted group-hover:text-tactical-text">{file}</span>
                  <Activity size={10} className="text-tactical-muted" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
