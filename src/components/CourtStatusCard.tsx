import React from 'react';
import { Court, Match } from '../types';
import { Activity, CheckCircle2, Pause, Play, ChevronRight, Hash } from 'lucide-react';

interface CourtStatusCardProps {
  court: Court;
  onOpenScoreboard: () => void;
  onEnterFinalScore: () => void;
  onTogglePause: () => void;
}

export const CourtStatusCard: React.FC<CourtStatusCardProps> = ({
  court,
  onOpenScoreboard,
  onEnterFinalScore,
  onTogglePause,
}) => {
  const match = court.currentMatch;

  return (
    <div className="bg-pickleball-surface border border-pickleball-border rounded-xl p-4 shadow-sm transition-all hover:border-pickleball-borderLight">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-base text-highContrast">{court.name}</span>
          {court.status === 'IN_PROGRESS' && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-pickleball-lime bg-[#23351C] px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-pickleball-lime animate-ping" />
              LIVE MATCH
            </span>
          )}
          {court.status === 'AVAILABLE' && (
            <span className="text-[11px] font-semibold text-mutedText bg-[#18241C] px-2 py-0.5 rounded-full">
              AVAILABLE
            </span>
          )}
          {court.status === 'PAUSED' && (
            <span className="text-[11px] font-semibold text-pickleball-attention bg-[#292211] px-2 py-0.5 rounded-full">
              PAUSED
            </span>
          )}
        </div>

        {/* Pause / Resume action */}
        {court.status !== 'IN_PROGRESS' && (
          <button
            onClick={onTogglePause}
            className="text-xs text-mutedText hover:text-highContrast flex items-center gap-1 bg-[#1A251D] px-2.5 py-1 rounded-lg border border-pickleball-border transition-colors"
          >
            {court.status === 'PAUSED' ? (
              <>
                <Play className="w-3 h-3 text-pickleball-lime" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 text-pickleball-attention" />
                <span>Pause Court</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Body: In-Progress Match details */}
      {match ? (
        <div>
          {/* Match Score Display */}
          <div className="bg-[#101712] border border-pickleball-border rounded-xl p-3 mb-3">
            <div className="grid grid-cols-5 items-center gap-2">
              {/* Team A */}
              <div className="col-span-2">
                <div className="text-[11px] font-bold text-[#00E5FF] tracking-wider mb-0.5">
                  TEAM A
                </div>
                <div className="text-sm font-semibold text-highContrast truncate">
                  {match.teamA.player1.name}
                </div>
                <div className="text-xs text-mutedText truncate">
                  {match.teamA.player2.name}
                </div>
              </div>

              {/* Central Score */}
              <div className="col-span-1 text-center">
                <div className="text-2xl font-black tracking-tight text-highContrast flex items-center justify-center gap-1">
                  <span className={match.scoreA > match.scoreB ? 'text-pickleball-lime' : ''}>
                    {match.scoreA}
                  </span>
                  <span className="text-mutedText/40">-</span>
                  <span className={match.scoreB > match.scoreA ? 'text-pickleball-lime' : ''}>
                    {match.scoreB}
                  </span>
                </div>
                <div className="text-[10px] font-semibold text-mutedText mt-0.5 bg-[#17231A] rounded px-1 py-0.2 inline-block">
                  Call: {match.scoreA}-{match.scoreB}-{match.serverNumber}
                </div>
              </div>

              {/* Team B */}
              <div className="col-span-2 text-right">
                <div className="text-[11px] font-bold text-[#FF9100] tracking-wider mb-0.5">
                  TEAM B
                </div>
                <div className="text-sm font-semibold text-highContrast truncate">
                  {match.teamB.player1.name}
                </div>
                <div className="text-xs text-mutedText truncate">
                  {match.teamB.player2.name}
                </div>
              </div>
            </div>

            {/* Serving indicator bar */}
            <div className="mt-2.5 pt-2 border-t border-pickleball-border flex items-center justify-between text-xs text-mutedText">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-pickleball-lime" />
                <span className="text-highContrast font-medium truncate">
                  Serving: {match.currentServer.name} (Server {match.serverNumber})
                </span>
              </div>
              <span className="text-[11px] font-mono shrink-0">
                {match.rallyHistory.length} rallies
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenScoreboard}
              className="bg-[#1D2C20] hover:bg-[#25392A] text-pickleball-lime border border-pickleball-lime/40 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Scorekeeper</span>
            </button>

            <button
              onClick={onEnterFinalScore}
              className="bg-[#242E26] hover:bg-[#2E3C31] text-highContrast border border-pickleball-border font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-mutedText" />
              <span>Enter Final Score</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 bg-[#101712] border border-dashed border-pickleball-border rounded-xl">
          <div className="text-xs text-mutedText">
            {court.status === 'PAUSED'
              ? 'Court is currently paused from rotation.'
              : 'No match in play. Awaiting rotation recommendation.'}
          </div>
        </div>
      )}
    </div>
  );
};
