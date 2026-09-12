import React, { useState } from 'react';
import { Match } from '../types';
import { X, Check, Trophy, Plus, Minus } from 'lucide-react';

interface FastFinalScoreSheetProps {
  match: Match;
  onConfirm: (scoreA: number, scoreB: number) => void;
  onDismiss: () => void;
}

export const FastFinalScoreSheet: React.FC<FastFinalScoreSheetProps> = ({
  match,
  onConfirm,
  onDismiss,
}) => {
  const [scoreA, setScoreA] = useState(match.scoreA > 0 ? match.scoreA : 11);
  const [scoreB, setScoreB] = useState(match.scoreB > 0 ? match.scoreB : 7);

  // Common quick final scores
  const quickPresup = [
    { a: 11, b: 9 },
    { a: 11, b: 8 },
    { a: 11, b: 7 },
    { a: 11, b: 5 },
    { a: 9, b: 11 },
    { a: 8, b: 11 },
    { a: 7, b: 11 },
    { a: 5, b: 11 },
  ];

  const handleQuickSelect = (a: number, b: number) => {
    setScoreA(a);
    setScoreB(b);
  };

  const isLegalWin = () => {
    const diff = Math.abs(scoreA - scoreB);
    const maxScore = Math.max(scoreA, scoreB);
    return maxScore >= match.targetScore && diff >= (match.winByTwo ? 2 : 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-canvas-dark border border-pickleball-border rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pickleball-border">
          <div>
            <h3 className="text-base font-bold text-highContrast">
              Record Final Score • Court {match.courtId}
            </h3>
            <p className="text-xs text-mutedText">
              2-Tap Quick Entry or Custom Stepper
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="text-mutedText hover:text-highContrast p-1.5 rounded-lg bg-[#19241C] border border-pickleball-border"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick presets grid */}
        <div className="my-4">
          <div className="text-[11px] font-bold text-mutedText uppercase tracking-wider mb-2">
            QUICK PRESETS
          </div>
          <div className="grid grid-cols-4 gap-2">
            {quickPresup.map((preset, idx) => {
              const isSelected = scoreA === preset.a && scoreB === preset.b;
              return (
                <button
                  key={idx}
                  onClick={() => handleQuickSelect(preset.a, preset.b)}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-colors border ${
                    isSelected
                      ? 'bg-pickleball-lime text-[#132200] border-pickleball-lime'
                      : 'bg-pickleball-surface text-highContrast border-pickleball-border hover:border-pickleball-borderLight'
                  }`}
                >
                  {preset.a} - {preset.b}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Stepper for Both Teams */}
        <div className="grid grid-cols-2 gap-3 my-4">
          {/* Team A */}
          <div className="bg-[#121E16] border border-[#00E5FF]/30 rounded-xl p-3 text-center">
            <div className="text-[11px] font-bold text-[#00E5FF] truncate mb-1">
              TEAM A ({match.teamA.player1.name.split(' ')[0]} & {match.teamA.player2.name.split(' ')[0]})
            </div>
            <div className="text-3xl font-black text-highContrast my-1">{scoreA}</div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <button
                onClick={() => setScoreA(Math.max(0, scoreA - 1))}
                className="w-8 h-8 rounded-lg bg-[#1E2D23] hover:bg-[#273B2E] text-highContrast flex items-center justify-center font-bold"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setScoreA(scoreA + 1)}
                className="w-8 h-8 rounded-lg bg-[#1E2D23] hover:bg-[#273B2E] text-highContrast flex items-center justify-center font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Team B */}
          <div className="bg-[#1E1611] border border-[#FF9100]/30 rounded-xl p-3 text-center">
            <div className="text-[11px] font-bold text-[#FF9100] truncate mb-1">
              TEAM B ({match.teamB.player1.name.split(' ')[0]} & {match.teamB.player2.name.split(' ')[0]})
            </div>
            <div className="text-3xl font-black text-highContrast my-1">{scoreB}</div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <button
                onClick={() => setScoreB(Math.max(0, scoreB - 1))}
                className="w-8 h-8 rounded-lg bg-[#2D231E] hover:bg-[#3B2D26] text-highContrast flex items-center justify-center font-bold"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setScoreB(scoreB + 1)}
                className="w-8 h-8 rounded-lg bg-[#2D231E] hover:bg-[#3B2D26] text-highContrast flex items-center justify-center font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Winner Announcement Preview */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-mutedText mb-4">
          <Trophy className="w-3.5 h-3.5 text-pickleball-lime" />
          <span>
            Winner:{' '}
            <strong className="text-highContrast">
              {scoreA > scoreB
                ? `Team A (${match.teamA.player1.name} & ${match.teamA.player2.name})`
                : scoreB > scoreA
                ? `Team B (${match.teamB.player1.name} & ${match.teamB.player2.name})`
                : 'Tie (Score must produce a winner)'}
            </strong>
          </span>
        </div>

        {/* Confirm Button */}
        <button
          onClick={() => onConfirm(scoreA, scoreB)}
          disabled={scoreA === scoreB}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            scoreA !== scoreB
              ? 'bg-pickleball-lime hover:bg-pickleball-limeLight text-[#132200] shadow-md'
              : 'bg-[#223025] text-mutedText cursor-not-allowed'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>Confirm & Trigger Automatic Rotation</span>
        </button>
      </div>
    </div>
  );
};
