"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

type ReactionType = 'heart' | 'firework' | 'applause';

interface Reaction {
  id: number;
  type: ReactionType;
  x: number;
  scale: number;
  duration: number;
}

export const LiveReactions = () => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  
  const addReaction = useCallback((type?: ReactionType) => {
    const id = Date.now() + Math.random();
    const x = Math.random() * 80 + 10; // 10% to 90%
    const scale = Math.random() * 0.5 + 1.1; // Balanced scale range
    const duration = Math.random() * 1000 + 2500; 
    
    const types: ReactionType[] = ['heart', 'firework', 'applause'];
    const selectedType = type || types[Math.floor(Math.random() * types.length)];
    
    setReactions(prev => [...prev, { id, type: selectedType, x, scale, duration }]);
    
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, duration);
  }, []);

  useEffect(() => {
    (window as any).triggerReaction = addReaction;
    return () => delete (window as any).triggerReaction;
  }, [addReaction]);

  const renderReaction = (reaction: Reaction) => {
    switch (reaction.type) {
      case 'firework':
        return <span className="text-3xl drop-shadow-[0_0_15px_rgba(255,165,0,0.5)] brightness-110">🎇</span>;
      case 'applause':
        return <span className="text-3xl drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">👏</span>;
      default:
        return <Heart className="text-red-500 fill-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]" size={30} />;
    }
  };

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
          {renderReaction(r)}
        </div>
      ))}
      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(0.3) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translateY(-50px) scale(1) rotate(5deg);
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-800px) scale(1.4) rotate(15deg);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: float-up cubic-bezier(0.2, 0, 0.4, 1) forwards;
        }
      `}</style>
    </div>
  );
};