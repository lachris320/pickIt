import React from 'react';
import { useSession } from '../context/SessionContext';
import { TacticalPickleballCourtDiagram } from '../components/TacticalPickleballCourtDiagram';
import { ArrowLeft, Undo2, RotateCcw, Trophy } from 'lucide-react';

export const StandaloneScoreboardScreen: React.FC = () => {
  const {
    standaloneMatch,
    navigateTo,
    recordStandaloneRally,
    undoStandaloneRally,
    launchStandaloneScoreboard,
  } = useSession();

  if (!standaloneMatch) {
    return null;
  }

  const match = standaloneMatch;
  const isTeamAMatchPoint =
    match.scoreA >= match.targetScore - 1 &&
    match.scoreA - match.scoreB >= 1 &&
    match.servingTeam === 'TEAM_A';

  const isTeamBMatchPoint =
    match.scoreB >= match.targetScore - 1 &&
    match.scoreB - match.scoreA >= 1 &&
    match.servingTeam === 'TEAM_B';

  const isMatchPoint = isTeamAMatchPoint || isTeamBMatchPoint;

  return (
    <div className="min-h-screen bg-canvas-dark text-highContrast flex flex-col justify-between">
      {/* Header */}
      <header className="bg-canvas-dark/95 backdrop-blur-md border-b border-pickleball-border px-4 py-3 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigateTo({ type: 'SESSION_HUB' })}
              className="p-1.5 rounded-lg bg-pickleball-surface hover:bg-pickleball-surfaceHighlight border border-pickleball-border text-highContrast"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-highContrast tracking-tight">
                  STANDALONE SCOREBOARD
                </h1>
                {isMatchPoint && (
                  <span className="bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded uppercase">
                    MATCH POINT
                  </span>
                )}
              </div>
              <div className="text-[11px] text-mutedText">
                USA Pickleball Official Rules (0-0-2 Start)
              </div>
            </div>
          </div>

          <button
            onClick={() => launchStandaloneScoreboard()}
            className="p-1.5 rounded-lg bg-pickleball-surface hover:bg-pickleball-surfaceHighlight border border-pickleball-border text-mutedText hover:text-highContrast"
            title="Reset Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Scoring Area */}
      <main className="max-w-2xl mx-auto w-full px-4 py-3 flex-1 flex flex-col justify-between space-y-4">
        {/* Official Callout Display */}
        <div className="bg-pickleball-surface border border-pickleball-border rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-mutedText uppercase tracking-wider">
              OFFICIAL CALLOUT
            </div>
            <div className="text-3xl font-black text-pickleball-lime font-mono tracking-wider">
              {match.scoreA} - {match.scoreB} - {match.serverNumber}
            </div>
          </div>

          <div className="text-right text-xs">
            <div className="text-mutedText">
              Server: <strong className="text-highContrast">{match.currentServer.name}</strong>
            </div>
            <div className="text-mutedText">
              Side: <strong className="text-pickleball-lime">{match.servingSide} Court</strong>
            </div>
          </div>
        </div>

        {/* First Server selector — only before the first rally is recorded */}
        {match.rallyHistory.length === 0 && (
          <div className="bg-pickleball-surface border border-pickleball-border rounded-xl p-3">
            <div className="text-[10px] font-bold text-mutedText uppercase tracking-wider mb-2">
              First Server
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => launchStandaloneScoreboard('TEAM_A')}
                className={`py-2 rounded-lg text-xs font-black uppercase tracking-wider border-2 transition-all active:scale-[0.98] ${
                  match.servingTeam === 'TEAM_A'
                    ? 'bg-[#0E282B] border-[#00E5FF] text-[#00E5FF]'
                    : 'bg-[#0F1C18] border-pickleball-border text-mutedText hover:border-[#00E5FF]/40'
                }`}
              >
                Team A
              </button>
              <button
                onClick={() => launchStandaloneScoreboard('TEAM_B')}
                className={`py-2 rounded-lg text-xs font-black uppercase tracking-wider border-2 transition-all active:scale-[0.98] ${
                  match.servingTeam === 'TEAM_B'
                    ? 'bg-[#2B1F0E] border-[#FF9100] text-[#FF9100]'
                    : 'bg-[#1C150F] border-pickleball-border text-mutedText hover:border-[#FF9100]/40'
                }`}
              >
                Team B
              </button>
            </div>
          </div>
        )}

        {/* Tactical Court Diagram */}
        <section>
          <TacticalPickleballCourtDiagram match={match} />
        </section>

        {/* Dual Touch Scoring Buttons */}
        <section className="grid grid-cols-2 gap-3 flex-1 min-h-[240px]">
          {/* Team A */}
          <button
            onClick={() => recordStandaloneRally('TEAM_A')}
            disabled={match.isCompleted}
            className={`rounded-2xl p-4 flex flex-col justify-between items-center transition-all border-2 active:scale-[0.98] ${
              match.servingTeam === 'TEAM_A'
                ? 'bg-gradient-to-b from-[#0E282B] to-[#0A1D20] border-[#00E5FF] shadow-lg shadow-[#00E5FF]/10'
                : 'bg-[#0F1C18] border-pickleball-border hover:border-[#00E5FF]/40'
            }`}
          >
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-black text-[#00E5FF]">TEAM A</span>
              {match.servingTeam === 'TEAM_A' && (
                <span className="bg-[#00E5FF] text-[#052124] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Server {match.serverNumber}
                </span>
              )}
            </div>
            <div className="text-7xl font-black text-highContrast my-auto">
              {match.scoreA}
            </div>
            <div className="text-xs font-bold text-pickleball-lime bg-black/40 w-full py-1.5 rounded-lg text-center">
              + Won Rally
            </div>
          </button>

          {/* Team B */}
          <button
            onClick={() => recordStandaloneRally('TEAM_B')}
            disabled={match.isCompleted}
            className={`rounded-2xl p-4 flex flex-col justify-between items-center transition-all border-2 active:scale-[0.98] ${
              match.servingTeam === 'TEAM_B'
                ? 'bg-gradient-to-b from-[#2B1F0E] to-[#20170A] border-[#FF9100] shadow-lg shadow-[#FF9100]/10'
                : 'bg-[#1C150F] border-pickleball-border hover:border-[#FF9100]/40'
            }`}
          >
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-black text-[#FF9100]">TEAM B</span>
              {match.servingTeam === 'TEAM_B' && (
                <span className="bg-[#FF9100] text-[#241300] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Server {match.serverNumber}
                </span>
              )}
            </div>
            <div className="text-7xl font-black text-highContrast my-auto">
              {match.scoreB}
            </div>
            <div className="text-xs font-bold text-pickleball-lime bg-black/40 w-full py-1.5 rounded-lg text-center">
              + Won Rally
            </div>
          </button>
        </section>

        {/* Match Completed Banner */}
        {match.isCompleted && (
          <div className="bg-[#1C2C16] border-2 border-pickleball-lime rounded-xl p-4 text-center">
            <Trophy className="w-8 h-8 text-pickleball-lime mx-auto mb-1 animate-bounce" />
            <div className="text-base font-black text-highContrast">
              {match.winnerTeamId === 'TEAM_A' ? 'TEAM A WON!' : 'TEAM B WON!'}
            </div>
            <div className="text-xs text-mutedText mt-1">
              Final Score: {match.scoreA} - {match.scoreB}
            </div>
            <button
              onClick={() => launchStandaloneScoreboard()}
              className="mt-3 bg-pickleball-lime text-[#132200] font-bold py-2 px-5 rounded-xl text-xs"
            >
              Play Again
            </button>
          </div>
        )}

        {/* Bottom Undo Control */}
        <div className="pt-2 border-t border-pickleball-border flex justify-between gap-2">
          <button
            onClick={undoStandaloneRally}
            disabled={match.rallyHistory.length === 0}
            className="flex-1 bg-pickleball-surface hover:bg-pickleball-surfaceHighlight disabled:opacity-30 border border-pickleball-border font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 text-highContrast transition-colors"
          >
            <Undo2 className="w-4 h-4 text-pickleball-attention" />
            <span>Undo Rally ({match.rallyHistory.length})</span>
          </button>
        </div>
      </main>
    </div>
  );
};
