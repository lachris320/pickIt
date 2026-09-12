import React from 'react';
import { Player } from '../types';
import { Users, Clock } from 'lucide-react';

interface OnDeckHorizonBarProps {
  onDeckPlayers: Player[];
}

export const OnDeckHorizonBar: React.FC<OnDeckHorizonBarProps> = ({ onDeckPlayers }) => {
  return (
    <div className="bg-pickleball-surface border border-pickleball-border rounded-xl p-3.5 shadow-sm">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4 text-pickleball-lime" />
          <span className="text-xs font-bold text-mutedText uppercase tracking-wider">
            ON-DECK HORIZON (NEXT {onDeckPlayers.length})
          </span>
        </div>
        <span className="text-[11px] text-mutedText">FIFO Seniority</span>
      </div>

      {onDeckPlayers.length === 0 ? (
        <div className="text-center py-2 text-xs text-mutedText/70">
          Queue is empty. Players will appear here when added.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {onDeckPlayers.map((player, idx) => {
            const waitMinutes = Math.max(
              0,
              Math.floor((Date.now() - player.queuedTimestamp) / 60000)
            );
            return (
              <div
                key={player.id}
                className="bg-[#19241C] border border-[#2B3B2F] rounded-lg p-2 flex flex-col justify-between hover:border-pickleball-lime/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-pickleball-lime bg-[#23351C] px-1.5 py-0.2 rounded">
                    #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-mutedText">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{waitMinutes}m</span>
                  </div>
                </div>
                <div className="font-semibold text-sm text-highContrast truncate">
                  {player.name}
                </div>
                <div className="text-[10px] text-mutedText mt-0.5">
                  {player.matchesPlayed} {player.matchesPlayed === 1 ? 'game' : 'games'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
