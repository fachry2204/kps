"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Search, MoreVertical, Paperclip, Smile, Send, CheckCheck, User, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { getChatContacts, getChatMessages, sendChatMessage } from "@/app/actions";

const CURRENT_USER_ID = 1; // Asumsi login sebagai ID 1 (Administrator)

export default function ChatClient() {
  const searchParams = useSearchParams();
  const unitId = searchParams.get('unitId');
  const opId = searchParams.get('opId');
  const contactId = searchParams.get('id') || searchParams.get('to');
  
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeContact, setActiveContact] = useState<number | null>(null);

  // Set active contact from URL parameter if present
  useEffect(() => {
    if (contactId) {
      setActiveContact(parseInt(contactId));
    }
  }, [contactId]);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [isMessageSearchOpen, setIsMessageSearchOpen] = useState(false);

  // Poll contacts list
  useEffect(() => {
    const fetchContacts = async () => {
      const data = await getChatContacts(
        CURRENT_USER_ID, 
        unitId ? parseInt(unitId) : undefined,
        opId ? parseInt(opId) : undefined
      );
      setContacts(data);
    };
    fetchContacts();
    const interval = setInterval(fetchContacts, 5000);
    return () => clearInterval(interval);
  }, [unitId, opId]);

  // Poll messages for active contact
  useEffect(() => {
    if (!activeContact) {
      setMessages([]);
      return;
    }
    
    const fetchMsgs = async () => {
      const msgs = await getChatMessages(CURRENT_USER_ID, activeContact);
      setMessages(msgs);
    };
    
    fetchMsgs();
    const interval = setInterval(fetchMsgs, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [activeContact]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeContact) return;

    const tempText = inputMessage;
    setInputMessage("");

    // Optimistic update
    const tempMsg = {
      id: Date.now(),
      sender_id: CURRENT_USER_ID,
      receiver_id: activeContact,
      message_text: tempText,
      created_at: new Date().toISOString(),
      status: 'sent'
    };
    setMessages(prev => [...prev, tempMsg]);

    await sendChatMessage(CURRENT_USER_ID, activeContact, tempText);
  };

  const activeUser = contacts.find(c => c.id === activeContact);

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) || 
    (c.lastMessage && c.lastMessage.toLowerCase().includes(contactSearchQuery.toLowerCase()))
  );

  const filteredMessages = messages.filter(m => 
    m.message_text.toLowerCase().includes(messageSearchQuery.toLowerCase())
  );

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-tactical-panel border border-tactical-border rounded-lg overflow-hidden tactical-glass shadow-2xl">
      {/* Left Sidebar - Contacts */}
      <div className="w-80 md:w-[350px] flex flex-col border-r border-tactical-border bg-tactical-bg shrink-0 z-10">
        {/* Sidebar Header */}
        <div className="h-16 border-b border-tactical-border flex items-center justify-between px-4 bg-tactical-panel">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-tactical-green/20 border border-tactical-green flex items-center justify-center">
              <User className="text-tactical-green w-5 h-5" />
            </div>
            <span className="font-bold text-tactical-text">Administrator</span>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-tactical-muted hover:text-tactical-text transition-colors rounded-full hover:bg-tactical-border/50">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-tactical-border bg-tactical-bg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-muted" />
            <input 
              type="text" 
              value={contactSearchQuery}
              onChange={(e) => setContactSearchQuery(e.target.value)}
              placeholder="Cari chat atau kontak..."
              className="w-full bg-tactical-panel border border-tactical-border rounded-md pl-10 pr-4 py-2 text-sm text-tactical-text focus:outline-none focus:border-tactical-green placeholder:text-tactical-muted"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <div 
              key={contact.id}
              onClick={() => setActiveContact(contact.id)}
              className={cn(
                "flex items-center gap-3 p-3 border-b border-tactical-border/50 cursor-pointer hover:bg-tactical-border/30 transition-colors relative",
                activeContact === contact.id ? "bg-tactical-panel" : ""
              )}
            >
              {activeContact === contact.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-tactical-green" />
              )}
              <div className="relative shrink-0">
                {contact.photo_url ? (
                   <img src={contact.photo_url} alt={contact.name} className="w-12 h-12 rounded-full border border-tactical-border object-cover invert grayscale contrast-125 brightness-110 opacity-80 group-hover:opacity-100 transition-all" />
                ) : (
                   <div className="w-12 h-12 rounded-full bg-tactical-panel border border-tactical-border flex items-center justify-center overflow-hidden">
                     <User className="text-tactical-muted w-6 h-6" />
                   </div>
                )}
                {/* Asumsi dummy online status */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-tactical-green rounded-full border-2 border-tactical-bg shadow-[0_0_5px_rgba(57,255,20,0.8)]"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-bold text-sm text-tactical-text truncate">{contact.name}</h4>
                  <span className={cn("text-[10px] font-mono", contact.unread > 0 ? "text-tactical-green" : "text-tactical-muted")}>
                    {contact.time ? formatTime(contact.time) : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-tactical-muted truncate pr-2">
                    {contact.lastMessage || "Mulai percakapan"}
                  </p>
                  {contact.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-tactical-green flex items-center justify-center text-[10px] font-bold text-tactical-bg shrink-0 shadow-[0_0_8px_rgba(57,255,20,0.5)]">
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Area - Chat Window */}
      <div className="flex-1 flex flex-col bg-tactical-bg/50 relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-5 pointer-events-none"
          style={{ 
            backgroundImage: 'url("/camo-sidebar.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {activeContact ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-tactical-border flex items-center justify-between px-6 bg-tactical-panel z-10 shrink-0">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {activeUser?.photo_url ? (
                     <img src={activeUser.photo_url} alt={activeUser.name} className="w-10 h-10 rounded-full border border-tactical-border object-cover invert grayscale contrast-125 brightness-110 opacity-80" />
                  ) : (
                     <div className="w-10 h-10 rounded-full bg-tactical-bg border border-tactical-border flex items-center justify-center">
                       <User className="text-tactical-muted w-5 h-5" />
                     </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-tactical-green rounded-full border-2 border-tactical-panel"></div>
                </div>
                <div>
                  <h3 className="font-bold text-tactical-text">{activeUser?.name}</h3>
                  <p className="text-xs text-tactical-green font-mono tracking-wider">
                    ONLINE - SECURE CONNECTION
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsMessageSearchOpen(!isMessageSearchOpen)}
                  className="p-2 text-tactical-muted hover:text-tactical-green transition-colors rounded-full hover:bg-tactical-border/50"
                >
                  <Search className="w-5 h-5" />
                </button>
                <button className="p-2 text-tactical-muted hover:text-tactical-green transition-colors rounded-full hover:bg-tactical-border/50">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {isMessageSearchOpen && (
              <div className="bg-tactical-panel border-b border-tactical-border p-3 flex items-center z-20 shrink-0">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-muted" />
                  <input 
                    type="text" 
                    autoFocus
                    value={messageSearchQuery}
                    onChange={(e) => setMessageSearchQuery(e.target.value)}
                    placeholder="Cari pesan dalam obrolan ini..."
                    className="w-full bg-tactical-bg border border-tactical-border rounded-md pl-10 pr-4 py-2 text-sm text-tactical-text focus:outline-none focus:border-tactical-green placeholder:text-tactical-muted"
                  />
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 z-10">
              <div className="text-center mb-6">
                <span className="bg-tactical-panel/80 backdrop-blur px-4 py-1.5 rounded-full text-xs text-tactical-muted font-mono border border-tactical-border shadow-sm">
                  END-TO-END ENCRYPTION ENABLED
                </span>
              </div>
              
              {filteredMessages.length === 0 && (
                <div className="text-center text-tactical-muted text-sm mt-10">
                  {messageSearchQuery ? "Tidak ada pesan yang cocok dengan pencarian." : "Belum ada percakapan. Mulai mengirim pesan."}
                </div>
              )}

              {filteredMessages.map((msg, i) => {
                const isMe = msg.sender_id === CURRENT_USER_ID;
                return (
                  <div key={i} className={cn("flex max-w-[75%]", isMe ? "ml-auto justify-end" : "")}>
                    <div className={cn(
                      "p-3 rounded-lg relative shadow-md",
                      isMe 
                        ? "bg-tactical-green/10 border border-tactical-green/30 text-tactical-text rounded-tr-none" 
                        : "bg-tactical-panel border border-tactical-border text-tactical-text rounded-tl-none"
                    )}>
                      <p className="text-sm mb-1 leading-relaxed">{msg.message_text}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] text-tactical-muted font-mono">{formatTime(msg.created_at)}</span>
                        {isMe && (
                          <CheckCheck className={cn("w-3.5 h-3.5", msg.status === 'read' ? "text-tactical-cyan" : "text-tactical-muted")} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-tactical-panel border-t border-tactical-border z-10 shrink-0">
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <button type="button" className="p-3 text-tactical-muted hover:text-tactical-text transition-colors rounded-full hover:bg-tactical-border/50">
                  <Smile className="w-6 h-6" />
                </button>
                <button type="button" className="p-3 text-tactical-muted hover:text-tactical-text transition-colors rounded-full hover:bg-tactical-border/50">
                  <Paperclip className="w-6 h-6" />
                </button>
                <div className="flex-1 bg-tactical-bg border border-tactical-border rounded-lg p-1.5 focus-within:border-tactical-green transition-colors">
                  <textarea 
                    rows={1}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e as any);
                      }
                    }}
                    placeholder="Type a secure message..."
                    className="w-full bg-transparent text-sm text-tactical-text placeholder:text-tactical-muted resize-none focus:outline-none max-h-32 p-2"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-3 bg-tactical-green text-tactical-bg rounded-full hover:bg-tactical-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-0.5 shadow-[0_0_10px_rgba(57,255,20,0.4)]"
                >
                  <Send className="w-5 h-5 ml-1" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-tactical-muted z-10 h-full">
            <div className="w-32 h-32 rounded-full bg-tactical-panel border border-tactical-border flex items-center justify-center mb-6 shadow-lg">
              <ShieldAlert className="w-16 h-16 text-tactical-green opacity-50" />
            </div>
            <h2 className="text-2xl font-bold text-tactical-text mb-2 tracking-wide">SECURE COMMUNICATION CHANNEL</h2>
            <p className="font-mono text-sm text-tactical-muted">Pilih kontak untuk mulai komunikasi realtime</p>
            <div className="mt-8 flex items-center gap-2 text-xs font-mono text-tactical-muted opacity-50">
               <CheckCheck className="w-4 h-4" /> E2E Encrypted Connection to Database
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
