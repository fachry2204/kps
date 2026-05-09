"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: "green" | "red" | "cyan" | "muted";
  delay?: number;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp, 
  color = "green",
  delay = 0 
}: StatCardProps) {
  
  const colorMap = {
    green: "text-tactical-green border-tactical-green bg-tactical-green/10 shadow-[0_0_15px_rgba(57,255,20,0.1)]",
    red: "text-tactical-red border-tactical-red bg-tactical-red/10 shadow-[0_0_15px_rgba(255,51,51,0.1)]",
    cyan: "text-tactical-cyan border-tactical-cyan bg-tactical-cyan/10 shadow-[0_0_15px_rgba(0,240,255,0.1)]",
    muted: "text-tactical-muted border-tactical-muted bg-tactical-muted/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="tactical-glass tactical-border p-5 relative overflow-hidden group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-tactical-muted text-xs font-mono uppercase tracking-wider mb-1">{title}</h3>
          <div className="text-3xl font-bold text-tactical-text tracking-tight group-hover:text-white transition-colors">
            {value}
          </div>
        </div>
        <div className={cn("p-2 rounded border", colorMap[color])}>
          <Icon size={20} />
        </div>
      </div>
      
      {trend && (
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className={cn(
            trendUp ? "text-tactical-green" : "text-tactical-red"
          )}>
            {trendUp ? "↑" : "↓"} {trend}
          </span>
          <span className="text-tactical-muted">vs last week</span>
        </div>
      )}

      {/* Decorative corner accents */}
      <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}
