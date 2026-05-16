"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const fullText = "INITIALIZING TACTICAL COMMAND SYSTEMS...";
  const [stars, setStars] = useState<{left: string, top: string, opacity: number, scale: number, duration: number, x: number, y: number}[]>([]);

  useEffect(() => {
    // Generate stars only on client
    const generatedStars = Array.from({ length: 50 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      opacity: Math.random(),
      scale: Math.random() * 0.5 + 0.5,
      duration: Math.random() * 3 + 2,
      x: Math.random() * 2000 - 1000,
      y: Math.random() * 2000 - 1000
    }));
    setStars(generatedStars);

    // Typewriter effect
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 50);

    // Fade out after 3 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] overflow-hidden"
        >
          {/* Star Field Effect */}
          <div className="absolute inset-0 z-0">
            {stars.map((star, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: star.opacity,
                  scale: star.scale,
                  x: star.x,
                  y: star.y
                }}
                animate={{ 
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  duration: star.duration, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
                style={{
                  left: star.left,
                  top: star.top,
                }}
              />
            ))}
          </div>

          {/* Glowing Background Radial */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.1)_0%,transparent_70%)]" />

          {/* Rotating Logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative z-10 mb-8"
          >
            <motion.div
              animate={{ 
                rotateY: [0, 360],
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="relative"
            >
              <img 
                src="/logo.png" 
                alt="KOPASSUS Logo" 
                className="w-40 h-40 object-contain filter drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]"
              />
              
              {/* Spinning Ring */}
              <div className="absolute inset-[-20px] rounded-full border-2 border-dashed border-tactical-green/30 animate-[spin_10s_linear_infinite]" />
              <div className="absolute inset-[-40px] rounded-full border border-tactical-cyan/10 animate-[spin_15s_linear_infinite_reverse]" />
            </motion.div>
          </motion.div>

          {/* Loading Text */}
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="h-1 w-64 bg-tactical-border/30 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "easeInOut" }}
                className="h-full bg-tactical-green shadow-[0_0_10px_rgba(34,197,94,0.5)]"
              />
            </div>
            <p className="text-tactical-green font-mono text-xs tracking-[0.2em] font-bold">
              {text}<span className="animate-pulse">_</span>
            </p>
          </div>

          {/* Corner Decorations */}
          <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-tactical-green/20" />
          <div className="absolute top-10 right-10 w-20 h-20 border-t-2 border-r-2 border-tactical-green/20" />
          <div className="absolute bottom-10 left-10 w-20 h-20 border-b-2 border-l-2 border-tactical-green/20" />
          <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-tactical-green/20" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
