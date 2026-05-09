"use client";

import { Settings, Shield, User, Database, Bell } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-tactical-text flex items-center gap-2">
            <Settings className="text-tactical-muted" />
            PENGATURAN SISTEM
          </h2>
          <p className="text-tactical-muted font-mono text-sm mt-1">SYSTEM CONFIGURATION & SECURITY</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-left tactical-glass border border-tactical-green bg-tactical-green/10 text-tactical-green rounded">
            <Shield className="w-4 h-4" /> Security & Access
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-left border border-tactical-border bg-tactical-bg hover:bg-tactical-border/50 text-tactical-muted hover:text-tactical-text rounded transition-colors">
            <User className="w-4 h-4" /> User Management
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-left border border-tactical-border bg-tactical-bg hover:bg-tactical-border/50 text-tactical-muted hover:text-tactical-text rounded transition-colors">
            <Database className="w-4 h-4" /> Database Backup
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-left border border-tactical-border bg-tactical-bg hover:bg-tactical-border/50 text-tactical-muted hover:text-tactical-text rounded transition-colors">
            <Bell className="w-4 h-4" /> Notifications
          </button>
        </div>

        <div className="md:col-span-3 tactical-glass tactical-border p-6 space-y-6">
          <h3 className="text-tactical-text font-bold mb-4 font-mono text-sm border-b border-tactical-border pb-2">
            SECURITY SETTINGS
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border border-tactical-border bg-tactical-bg rounded">
              <div>
                <h4 className="font-bold text-tactical-text">Multi-Factor Authentication (MFA)</h4>
                <p className="text-xs text-tactical-muted mt-1">Wajibkan MFA untuk semua pengguna dengan role Komandan dan Admin.</p>
              </div>
              <div className="w-12 h-6 bg-tactical-green rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-tactical-panel rounded-full"></div>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border border-tactical-border bg-tactical-bg rounded">
              <div>
                <h4 className="font-bold text-tactical-text">Data Encryption (AES-256)</h4>
                <p className="text-xs text-tactical-muted mt-1">Enkripsi end-to-end untuk semua data intelijen dan koordinat operasi.</p>
              </div>
              <div className="w-12 h-6 bg-tactical-green rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-tactical-panel rounded-full"></div>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border border-tactical-border bg-tactical-bg rounded">
              <div>
                <h4 className="font-bold text-tactical-text">Strict Session Timeout</h4>
                <p className="text-xs text-tactical-muted mt-1">Logout otomatis setelah 15 menit inaktif.</p>
              </div>
              <div className="w-12 h-6 bg-tactical-green rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-tactical-panel rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button className="px-4 py-2 border border-tactical-border text-tactical-muted rounded hover:bg-tactical-border hover:text-tactical-text transition-colors">
              Reset Default
            </button>
            <button className="px-4 py-2 bg-tactical-green/20 border border-tactical-green text-tactical-green rounded hover:bg-tactical-green hover:text-black transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
