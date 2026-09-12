import React from 'react';
import { Match } from '../types';

interface TacticalCourtDiagramProps {
  match: Match;
  className?: string;
}

export const TacticalPickleballCourtDiagram: React.FC<TacticalCourtDiagramProps> = ({
  match,
  className = '',
}) => {
  const isTeamAServing = match.servingTeam === 'TEAM_A';
  const isRightCourt = match.servingSide === 'RIGHT';

  return (
    <div
      className={`relative w-full h-24 bg-[#132219] rounded-xl border border-[#43604E]/50 overflow-hidden select-none ${className}`}
      data-testid="court_diagram"
    >
      <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
        {/* Court Baseline & Boundaries are handled by parent container */}

        {/* 1. Kitchen Zone (Non-Volley Zone - middle 24%) */}
        <rect x="152" y="0" width="96" height="100" fill="#1E3326" />

        {/* 2. Highlight Serving Quadrant */}
        {/* Team A is on left (0 to 152). Facing net, Right service court is bottom half (y: 50 to 100) */}
        {/* Team B is on right (248 to 400). Facing net towards left, Right service court is top half (y: 0 to 50) */}
        {isTeamAServing ? (
          <rect
            x="2"
            y={isRightCourt ? 50 : 2}
            width="150"
            height="48"
            fill="#C6FF00"
            fillOpacity="0.25"
            stroke="#C6FF00"
            strokeWidth="1.5"
            rx="4"
          />
        ) : (
          <rect
            x="248"
            y={isRightCourt ? 2 : 50}
            width="150"
            height="48"
            fill="#C6FF00"
            fillOpacity="0.25"
            stroke="#C6FF00"
            strokeWidth="1.5"
            rx="4"
          />
        )}

        {/* 3. Kitchen Boundary Lines (7ft kitchen line) */}
        <line x1="152" y1="0" x2="152" y2="100" stroke="#43604E" strokeWidth="2" />
        <line x1="248" y1="0" x2="248" y2="100" stroke="#43604E" strokeWidth="2" />

        {/* 4. Center Service Lines */}
        {/* Team A center line */}
        <line x1="0" y1="50" x2="152" y2="50" stroke="#43604E" strokeWidth="2" />
        {/* Team B center line */}
        <line x1="248" y1="50" x2="400" y2="50" stroke="#43604E" strokeWidth="2" />

        {/* 5. Center Net Line (thick dashed white) */}
        <line
          x1="200"
          y1="0"
          x2="200"
          y2="100"
          stroke="#F5F7F6"
          strokeWidth="3"
          strokeDasharray="6 4"
        />
      </svg>

      {/* Overlay UI text labels for fast glanceability */}
      <div className="absolute inset-0 px-3 py-1.5 flex items-center justify-between pointer-events-none text-xs">
        {/* Left: Team A indicator */}
        <div className="flex flex-col items-start leading-tight">
          <span className="font-bold text-[#00E5FF] tracking-wider text-[11px]">TEAM A</span>
          {match.servingTeam === 'TEAM_A' && (
            <span className="text-[10px] font-black text-pickleball-lime animate-pulse">
              ● SERVING ({match.servingSide})
            </span>
          )}
        </div>

        {/* Center: NVZ Kitchen badge */}
        <div className="bg-[#101F15]/80 backdrop-blur-xs px-2 py-0.5 rounded border border-[#344B3A] text-center">
          <span className="text-[10px] font-semibold text-mutedText uppercase tracking-wider block">
            NVZ (Kitchen)
          </span>
          <span className="text-[9px] text-[#A7B8AC]">7ft Non-Volley</span>
        </div>

        {/* Right: Team B indicator */}
        <div className="flex flex-col items-end leading-tight">
          <span className="font-bold text-[#FF9100] tracking-wider text-[11px]">TEAM B</span>
          {match.servingTeam === 'TEAM_B' && (
            <span className="text-[10px] font-black text-pickleball-lime animate-pulse">
              ● SERVING ({match.servingSide})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
