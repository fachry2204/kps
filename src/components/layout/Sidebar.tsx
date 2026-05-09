"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Map, 
  ShieldAlert, 
  Crosshair, 
  Users, 
  Building2, 
  Package, 
  Settings,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Map", href: "/map", icon: Map },
  { name: "Intelijen", href: "/intel", icon: ShieldAlert },
  { 
    name: "Gelar Operasi", 
    href: "/gelar-operasi", 
    icon: Crosshair,
    subItems: [
      { name: "Operasi Dalam Negeri", href: "/gelar-operasi/dalam-negeri" },
      { name: "Operasi Luar Negeri", href: "/gelar-operasi/luar-negeri" },
    ]
  },
  { name: "Personil", href: "/personnel", icon: Users },
  { name: "Kesatuan", href: "/kesatuan", icon: Building2 },
  { name: "Logistik", href: "/logistics", icon: Package },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen fixed top-0 left-0 flex flex-col bg-tactical-panel border-r border-tactical-border z-40">
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
      <div className="p-6 flex items-center gap-3 border-b border-tactical-border">
        <div className="w-10 h-10 rounded-full bg-tactical-green/10 border border-tactical-green/30 flex items-center justify-center overflow-hidden">
          <img src="/logo.png" alt="Kopassus" className="w-8 h-8 object-contain" />
        </div>
        <div>
          <h1 className="text-tactical-green font-bold text-lg leading-tight tracking-wider">IDC - SF</h1>
          <p className="text-tactical-muted text-xs font-mono tracking-widest">KOPASUS</p>
        </div>
      </div>
      
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-xs font-mono text-tactical-muted uppercase tracking-wider">
          Main Navigation
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.subItems && pathname.startsWith(item.href));
          const Icon = item.icon;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const [isOpen, setIsOpen] = useState(isActive);

          return (
            <div key={item.name} className="space-y-1">
              {hasSubItems ? (
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className={cn(
                    "w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200",
                    isActive 
                      ? "bg-tactical-green/10 text-tactical-green border border-tactical-green/30" 
                      : "text-tactical-text hover:bg-tactical-border hover:text-tactical-green"
                  )}
                >
                  <Icon className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                    isActive ? "text-tactical-green" : "text-tactical-muted group-hover:text-tactical-green"
                  )} />
                  {item.name}
                  <div className="ml-auto">
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </div>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200",
                    isActive 
                      ? "bg-tactical-green/10 text-tactical-green border border-tactical-green/30" 
                      : "text-tactical-text hover:bg-tactical-border hover:text-tactical-green"
                  )}
                >
                  <Icon className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                    isActive ? "text-tactical-green" : "text-tactical-muted group-hover:text-tactical-green"
                  )} />
                  {item.name}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-tactical-green shadow-[0_0_8px_rgba(57,255,20,0.8)]" />
                  )}
                </Link>
              )}

              {hasSubItems && isOpen && (
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
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-tactical-border">
        <div className="tactical-border p-3 bg-tactical-bg">
          <div className="text-xs font-mono text-tactical-muted mb-1">SYSTEM STATUS</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-tactical-green animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.8)]"></div>
            <span className="text-tactical-green text-xs font-bold tracking-wider">SECURE & ONLINE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
