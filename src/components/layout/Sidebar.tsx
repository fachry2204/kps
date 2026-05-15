"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Map, 
  ShieldAlert, 
  Crosshair, 
  Users, 
  Building2, 
  Package, 
  Settings,
  Activity,
  ChevronDown,
  ChevronRight,
  Radio,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Map", href: "/map", icon: Map },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { 
    name: "Gelar Operasi", 
    href: "/gelar-operasi", 
    icon: Crosshair,
    subItems: [
      { name: "Operasi Dalam Negeri", href: "/gelar-operasi/dalam-negeri" },
      { name: "Operasi Luar Negeri", href: "/gelar-operasi/luar-negeri" },
    ]
  },
  { name: "Personil Perwira", href: "/personnel", icon: Users },
  { name: "Logistik", href: "/logistics", icon: Package },
  { name: "Intelijen", href: "/intel", icon: ShieldAlert },
  { name: "Monitoring Situasi", href: "/monitoring", icon: Activity },
  { name: "Kesatuan", href: "/kesatuan", icon: Building2 },
  {
    name: "Komunikasi",
    href: "/komunikasi",
    icon: Radio,
    subItems: [
      { name: "Chat", href: "/komunikasi/chat" },
      { name: "VCON", href: "/komunikasi/vcon" },
    ]
  },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className={cn(
      "h-screen fixed top-0 left-0 flex flex-col bg-tactical-panel border-r border-tactical-border z-40 transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Camouflage Background Overlay */}
      <div 
        className="absolute inset-0 z-[-1] opacity-100 pointer-events-none"
        style={{ 
          backgroundImage: 'url("/camo-sidebar.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'overlay'
        }}
      />
      <div className={cn(
        "p-6 flex items-center gap-3 border-b border-tactical-border relative",
        isCollapsed && "px-4 justify-center"
      )}>
        <div className="w-10 h-10 rounded-full bg-tactical-green/10 border border-tactical-green/30 flex items-center justify-center overflow-hidden flex-shrink-0">
          <img src="/logo.png" alt="Kopassus" className="w-8 h-8 object-contain" />
        </div>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="overflow-hidden"
          >
            <h1 className="text-tactical-green font-bold text-lg leading-tight tracking-wider whitespace-nowrap">IDC - SF</h1>
            <p className="text-tactical-muted text-[10px] font-mono tracking-widest whitespace-nowrap uppercase">KOPASSUS</p>
          </motion.div>
        )}
        
        {/* Toggle Button */}
        <button 
          onClick={onToggle}
          className={cn(
            "absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-tactical-panel border border-tactical-border rounded-full flex items-center justify-center text-tactical-muted hover:text-tactical-green transition-all z-50",
            isCollapsed && "right-2 top-2 translate-y-0"
          )}
        >
          {isCollapsed ? <PanelLeftOpen size={12} /> : <PanelLeftClose size={12} />}
        </button>
      </div>
      
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="px-3 mb-2 text-[10px] font-mono text-tactical-muted uppercase tracking-wider">
            Main Navigation
          </div>
        )}
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.subItems && pathname.startsWith(item.href));
          const Icon = item.icon;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isOpen = openMenus[item.name] || (isActive && openMenus[item.name] === undefined);

          return (
            <div key={item.name} className="relative group space-y-1">
              {hasSubItems ? (
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={cn(
                    "w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200",
                    isCollapsed && "justify-center px-2",
                    isActive 
                      ? "bg-tactical-green/10 text-tactical-green border border-tactical-green/30" 
                      : "text-tactical-text hover:bg-tactical-border hover:text-tactical-green"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors",
                    !isCollapsed && "mr-3",
                    isActive ? "text-tactical-green" : "text-tactical-muted group-hover:text-tactical-green"
                  )} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      <div className="ml-auto">
                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </div>
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200",
                    isCollapsed && "justify-center px-2",
                    isActive 
                      ? "bg-tactical-green/10 text-tactical-green border border-tactical-green/30" 
                      : "text-tactical-text hover:bg-tactical-border hover:text-tactical-green"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors",
                    !isCollapsed && "mr-3",
                    isActive ? "text-tactical-green" : "text-tactical-muted group-hover:text-tactical-green"
                  )} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-tactical-green shadow-[0_0_8px_rgba(57,255,20,0.8)]" />
                      )}
                    </>
                  )}
                </Link>
              )}

              {hasSubItems && isOpen && !isCollapsed && (
                <div className="pl-11 space-y-1">
                  {item.subItems.map((sub) => {
                    const isSubActive = pathname === sub.href;
                    return (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className={cn(
                          "block px-3 py-1.5 text-[11px] font-mono rounded-md transition-all duration-200 border-l-2",
                          isSubActive
                            ? "text-tactical-green border-tactical-green bg-tactical-green/5"
                            : "text-tactical-muted border-transparent hover:text-tactical-text hover:bg-tactical-border"
                        )}
                      >
                        {sub.name}
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Floating Tooltip/Submenu for Collapsed Mode */}
              {isCollapsed && (
                <div className="absolute left-full top-0 ml-2 w-48 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto">
                  <div className="tactical-glass tactical-border p-2 bg-tactical-panel/95 backdrop-blur-xl shadow-2xl border-l-2 border-l-tactical-green">
                    <div className="px-3 py-1.5 mb-1 text-[10px] font-bold text-tactical-green font-mono border-b border-tactical-border/50 uppercase tracking-widest flex items-center justify-between">
                      {item.name}
                      {hasSubItems && <ChevronRight size={10} />}
                    </div>
                    {hasSubItems && (
                      <div className="space-y-1 mt-1">
                        {item.subItems.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              className={cn(
                                "block px-3 py-2 text-[10px] font-mono rounded transition-all duration-200",
                                isSubActive
                                  ? "text-tactical-green bg-tactical-green/10"
                                  : "text-tactical-muted hover:text-tactical-text hover:bg-tactical-border"
                              )}
                            >
                              {sub.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-tactical-border">
        {isCollapsed ? (
          <div className="flex justify-center">
            <div className="w-3 h-3 rounded-full bg-tactical-green animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.8)]"></div>
          </div>
        ) : (
          <div className="tactical-border p-3 bg-tactical-bg">
            <div className="text-[10px] font-mono text-tactical-muted mb-1 uppercase">System Status</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-tactical-green animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.8)]"></div>
              <span className="text-tactical-green text-[10px] font-bold tracking-wider uppercase">Secure & Online</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
