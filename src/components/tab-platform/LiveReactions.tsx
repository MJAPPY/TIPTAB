"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Reaction {
  id: number;
  x: number;
  scale: number;
  duration: number;
}

export const LiveReactions = () => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  
  const addReaction = useCallback(() => {
    const id = Date.now();
    const x = Math.random() * 80 + 10; // 10% to 90%
    const scale = Math.random() * 0.5 + 0.8;
    const duration = Math.random() * 1000 + 2000;
    
    setReactions(prev => [...prev, { id, x, scale, duration }]);
    
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, duration);
  }, []);

  // Expose the trigger globally for this session
  useEffect(() => {
    (window as any).triggerReaction = addReaction;
    return () => delete (window as any).triggerReaction;
  }, [addReaction]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {reactions.map(r => (
        <div
          key={r.id}
          className="absolute bottom-0 animate-float-up"
          style={{
            left: `${r.x}%`,
            transform: `scale(${r.scale})`,
            animationDuration: `${r.duration}ms`
          }}
        >
          <Heart className="text-red-500 fill-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]" size={24} />
        </div>
      ))}
      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(0.5) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-500px) scale(1.5) rotate(20deg);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: float-up linear forwards;
        }
      `}</style>
    </div>
  );
};