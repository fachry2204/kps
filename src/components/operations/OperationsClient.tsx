"use client";

import { Crosshair, Play, CheckCircle, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface Operation {
  id: number;
  operation_name: string;
  operation_type: string;
  status: string;
  priority: string;
  location: string;
  start_date: string;
  description: string;
}

interface OperationsClientProps {
  operations: Operation[];
}

export default function OperationsClient({ operations }: OperationsClientProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-tactical-text flex items-center gap-2">
            <Crosshair className="text-tactical-cyan" />
            OPERASI MILITER
          </h2>
          <p className="text-tactical-muted font-mono text-sm mt-1">MISSION CONTROL & TRACKING</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-xs font-mono bg-tactical-cyan/10 text-tactical-cyan border border-tactical-cyan rounded hover:bg-tactical-cyan/20 transition-colors">
            BUAT OPERASI BARU
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Active Operations List */}
        <div className="space-y-4">
          {operations.map((ops, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={ops.id} 
              className="tactical-glass tactical-border p-5 hover:border-tactical-cyan transition-colors group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-tactical-text group-hover:text-tactical-cyan transition-colors">{ops.operation_name}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-tactical-muted font-mono">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Tipe: {ops.operation_type}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {ops.location}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-bold rounded border ${
                  ops.status === 'ONGOING' ? 'bg-tactical-cyan/10 border-tactical-cyan text-tactical-cyan' :
                  ops.status === 'COMPLETED' ? 'bg-tactical-green/10 border-tactical-green text-tactical-green' :
                  ops.status === 'PLANNING' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' :
                  'bg-tactical-red/10 border-tactical-red text-tactical-red'
                }`}>
                  {ops.status}
                </span>
              </div>
              
              <p className="text-sm text-tactical-muted mb-4">{ops.description}</p>
              
              <div className="mt-4">
                <div className="flex justify-between text-xs font-mono text-tactical-muted mb-1">
                  <span>PRIORITY: {ops.priority}</span>
                  <span>START: {new Date(ops.start_date).toLocaleDateString()}</span>
                </div>
                <div className="w-full h-1.5 bg-tactical-bg rounded overflow-hidden">
                  <div 
                    className={`h-full ${
                      ops.status === 'COMPLETED' ? 'bg-tactical-green' : 'bg-tactical-cyan shadow-[0_0_8px_rgba(0,240,255,0.8)]'
                    }`} 
                    style={{ width: ops.status === 'COMPLETED' ? '100%' : ops.status === 'ONGOING' ? '65%' : '10%' }}
                  ></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
