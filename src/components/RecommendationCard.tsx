import React, { useState } from 'react';
import { RotationRecommendation } from '../types';
import { Play, Shuffle, AlertTriangle, ChevronDown, ChevronUp, Coffee } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: RotationRecommendation;
  onCallAndStart: () => void;
  onSwapPartners: () => void;
  onRestPlayer: (playerId: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onCallAndStart,
  onSwapPartners,
  onRestPlayer,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-gradient-to-br from-[#1C261B] to-[#141C16] border-2 border-pickleball-attention/70 rounded-xl p-4 shadow-lg shadow-black/40">
      {/* Header Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-pickleball-attention text-[#1F1700] text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
            Court {recommendation.courtId} Ready
          </span>
          <span className="text-xs font-semibold text-highContrast">
            {recommendation.primaryReason}
          </span>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-mutedText hover:text-highContrast flex items-center gap-1 transition-colors py-1 px-2"
        >
          <span>Why?</span>
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Warning if any */}
      {recommendation.warningMessage && (
        <div className="mb-3 bg-[#33250A] border border-[#805D17] rounded-lg p-2.5 flex items-start gap-2 text-xs text-[#FFE082]">
          <AlertTriangle className="w-4 h-4 text-pickleball-attention shrink-0 mt-0.5" />
          <span>{recommendation.warningMessage}</span>
        </div>
      )}

      {/* Detailed reasons drawer */}
      {showDetails && (
        <div className="mb-3.5 bg-[#0F1711] border border-pickleball-border rounded-lg p-3 text-xs space-y-1.5 text-mutedText">
          <div className="font-semibold text-highContrast mb-1">Rotation Logic Explanation:</div>
          {recommendation.detailedReason.map((reason, idx) => (
            <div key={idx} className="flex items-start gap-1.5">
              <span className="text-pickleball-lime">•</span>
              <span>{reason}</span>
            </div>
          ))}
        </div>
      )}

      {/* Team matchup cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Team A */}
        <div className="bg-[#14221A] border border-[#00E5FF]/30 rounded-lg p-3">
          <div className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>TEAM A</span>
            {recommendation.retainedPlayers.some((p) => p.id === recommendation.teamA.player1.id) && (
              <span className="text-[9px] bg-[#1F3D2E] text-pickleball-lime px-1.5 py-0.2 rounded font-semibold">
                Winner Retained
              </span>
            )}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm font-semibold text-highContrast">
              <span>{recommendation.teamA.player1.name}</span>
              <button
                onClick={() => onRestPlayer(recommendation.teamA.player1.id)}
                title="Send to rest"
                className="text-mutedText hover:text-pickleball-attention p-1"
              >
                <Coffee className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center justify-between text-sm font-semibold text-highContrast">
              <span>{recommendation.teamA.player2.name}</span>
              <button
                onClick={() => onRestPlayer(recommendation.teamA.player2.id)}
                title="Send to rest"
                className="text-mutedText hover:text-pickleball-attention p-1"
              >
                <Coffee className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Team B */}
        <div className="bg-[#241A14] border border-[#FF9100]/30 rounded-lg p-3">
          <div className="text-[10px] font-bold text-[#FF9100] uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>TEAM B</span>
            {recommendation.retainedPlayers.some((p) => p.id === recommendation.teamB.player1.id) && (
              <span className="text-[9px] bg-[#1F3D2E] text-pickleball-lime px-1.5 py-0.2 rounded font-semibold">
                Winner Retained
              </span>
            )}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm font-semibold text-highContrast">
              <span>{recommendation.teamB.player1.name}</span>
              <button
                onClick={() => onRestPlayer(recommendation.teamB.player1.id)}
                title="Send to rest"
                className="text-mutedText hover:text-pickleball-attention p-1"
              >
                <Coffee className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center justify-between text-sm font-semibold text-highContrast">
              <span>{recommendation.teamB.player2.name}</span>
              <button
                onClick={() => onRestPlayer(recommendation.teamB.player2.id)}
                title="Send to rest"
                className="text-mutedText hover:text-pickleball-attention p-1"
              >
                <Coffee className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onCallAndStart}
          className="flex-1 bg-pickleball-lime hover:bg-pickleball-limeLight text-[#132200] font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md transition-all active:scale-[0.99]"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Call & Start Court {recommendation.courtId}</span>
        </button>

        <button
          onClick={onSwapPartners}
          title="Swap partner combinations"
          className="bg-[#223326] hover:bg-[#2A4030] text-highContrast border border-pickleball-border font-semibold p-2.5 rounded-xl flex items-center justify-center transition-colors"
        >
          <Shuffle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
