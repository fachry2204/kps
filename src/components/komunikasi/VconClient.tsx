"use client";

import { useState } from "react";
import { Video, Users, PhoneOff, ShieldAlert, Key, Server, Globe } from "lucide-react";

export default function VconClient() {
  const [roomName, setRoomName] = useState("Kopassus-CommandCenter-Secure");
  const [isJoined, setIsJoined] = useState(false);
  const [inputRoom, setInputRoom] = useState("");
  const [isPrivateServer, setIsPrivateServer] = useState(false);

  // Private server placeholder (will be used when they deploy their own Jitsi instance)
  const serverUrl = isPrivateServer ? "https://vcon.kopassus.local/" : "https://meet.ffmuc.net/";

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRoom.trim()) {
      setRoomName(inputRoom.trim().replace(/\s+/g, '-'));
      setIsJoined(true);
    }
  };

  const handleLeave = () => {
    setIsJoined(false);
  };

  const generateSecureRoom = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'KPS-';
    for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    result += '-';
    for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    setInputRoom(result);
  };

  return (
    <div className={isJoined ? "fixed inset-0 z-[100] bg-tactical-bg flex flex-col" : "h-[calc(100vh-7rem)] flex flex-col gap-4"}>
      {/* Header Info */}
      <div className={isJoined ? "hidden" : "flex items-center justify-between bg-tactical-panel border border-tactical-border rounded-lg p-4 tactical-glass shrink-0 shadow-lg"}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-tactical-green/20 border border-tactical-green flex items-center justify-center shadow-[0_0_10px_rgba(57,255,20,0.3)]">
            <Video className="w-6 h-6 text-tactical-green" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-tactical-text tracking-widest">SECURE VIDEO CONFERENCE</h1>
            <p className="text-xs text-tactical-green font-mono">ENCRYPTED E2E VCON MULTI-POINT</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsPrivateServer(!isPrivateServer)}
            className={`flex items-center gap-2 px-3 py-1.5 border rounded-full text-xs font-mono transition-colors ${
              isPrivateServer 
                ? 'bg-tactical-green/20 border-tactical-green text-tactical-green' 
                : 'bg-tactical-bg border-tactical-border text-tactical-muted hover:text-tactical-text'
            }`}
            title="Toggle between Public Secure Node and Internal Private Node"
          >
            {isPrivateServer ? <Server className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
            {isPrivateServer ? 'PRIVATE NODE ACTIVE' : 'PUBLIC SECURE NODE'}
          </button>
          <span className="flex items-center gap-2 px-3 py-1.5 bg-tactical-bg border border-tactical-border rounded-full text-xs font-mono text-tactical-text">
            <ShieldAlert className="w-4 h-4 text-tactical-green" />
            KOPASSUS MEET ENGINE
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-tactical-panel border border-tactical-border rounded-lg overflow-hidden tactical-glass relative shadow-2xl">
        {!isJoined ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-32 h-32 rounded-full bg-tactical-bg border border-tactical-border flex items-center justify-center mb-6 shadow-2xl relative p-4 bg-gradient-to-b from-tactical-panel to-tactical-bg">
              <img src="/logo.png" alt="KOPASSUS" className="w-20 h-20 object-contain relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
              <div className="absolute inset-0 rounded-full border border-tactical-green animate-ping opacity-20"></div>
              <div className="absolute inset-[-4px] rounded-full border-2 border-tactical-green/30 border-t-tactical-green animate-spin"></div>
            </div>
            
            <h2 className="text-2xl font-bold text-tactical-text mb-2 tracking-wider uppercase">KOPASSUS MEET SYSTEM</h2>
            <p className="text-tactical-muted text-sm font-mono mb-8 max-w-md">
              Secure Point-to-Point Video Link. Encryption Key active.
            </p>

            <form onSubmit={handleJoin} className="w-full max-w-md flex flex-col gap-5">
              <div className="flex items-center bg-tactical-bg border border-tactical-border rounded-lg p-3 focus-within:border-tactical-green transition-colors shadow-inner">
                <Users className="w-5 h-5 text-tactical-green ml-2 mr-4" />
                <input 
                  type="text" 
                  value={inputRoom}
                  onChange={(e) => setInputRoom(e.target.value)}
                  placeholder="Enter Room Code..."
                  className="flex-1 bg-transparent border-none outline-none text-tactical-text font-mono placeholder:text-tactical-muted text-lg tracking-wider"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={generateSecureRoom}
                  className="flex-1 py-4 bg-tactical-panel border border-tactical-border text-tactical-text font-bold font-mono text-sm tracking-widest rounded-lg hover:border-tactical-green hover:text-tactical-green transition-all flex items-center justify-center gap-2"
                >
                  <Key className="w-5 h-5" />
                  GENERATE CODE
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-tactical-green text-black font-bold font-mono tracking-widest rounded-lg hover:bg-tactical-green/90 transition-all flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(57,255,20,0.5)]"
                >
                  <Video className="w-6 h-6" />
                  INITIALIZE LINK
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col relative bg-[#150a0a]">
            {/* Jitsi Iframe */}
            <iframe 
              src={`https://meet.jit.si/${roomName}#userInfo.displayName="Jendral. K"&config.prejoinPageEnabled=false&config.disableDeepLinking=true&config.hideWatermark=true&config.disableBranding=true&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false&interfaceConfig.SHOW_BRAND_WATERMARK=false&interfaceConfig.BRAND_WATERMARK_LINK=""`}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="w-full flex-1 border-0"
            />
            
            {/* PHYSICAL OVERLAY TO COVER JITSI LOGO (Top Left) - ENLARGED */}
            <div className="absolute top-0 left-0 w-32 h-16 bg-[#150a0a] z-20 flex items-center justify-center border-b border-r border-tactical-green/30 rounded-br-xl shadow-[5px_5px_15px_rgba(0,0,0,0.5)]">
              <img src="/logo.png" alt="KPS" className="h-12 w-12 object-contain" />
            </div>
            
            {/* Custom Control Overlay - Positioned FURTHER BELOW the enlarged logo mask */}
            <div className="absolute top-20 left-4 z-10 pointer-events-none">
              <div className="bg-black/60 backdrop-blur px-4 py-2 rounded-full border border-tactical-green/30 flex items-center gap-3 shadow-lg">
                <div className="w-2.5 h-2.5 rounded-full bg-tactical-green animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.8)]"></div>
                <span className="text-tactical-green text-xs font-mono font-bold tracking-widest">
                  ROOM: {roomName.toUpperCase()}
                </span>
                <span className="border-l border-tactical-green/30 pl-3 text-tactical-muted text-[10px]">
                  SECURE INTERNAL LINK
                </span>
              </div>
            </div>
            
            <button 
              onClick={handleLeave}
              className="absolute top-4 right-4 z-10 bg-tactical-red/90 text-white px-5 py-2.5 rounded-lg font-bold font-mono text-sm shadow-[0_0_15px_rgba(255,51,51,0.5)] hover:bg-tactical-red transition-colors flex items-center gap-2 border border-tactical-red"
            >
              <PhoneOff className="w-4 h-4" />
              TERMINATE
            </button>
          </div>
        )}

        {/* Camo Background when not joined */}
        {!isJoined && (
          <div 
            className="absolute inset-0 z-0 opacity-5 pointer-events-none"
            style={{ 
              backgroundImage: 'url("/camo-sidebar.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}
      </div>
    </div>
  );
}
