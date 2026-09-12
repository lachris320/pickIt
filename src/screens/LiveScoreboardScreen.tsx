import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { Match, TeamId } from '../types';
import { TacticalPickleballCourtDiagram } from '../components/TacticalPickleballCourtDiagram';
import { FastFinalScoreSheet } from '../components/FastFinalScoreSheet';
import {
  ArrowLeft,
  Undo2,
  CheckCircle2,
  AlertOctagon,
  Volume2,
  History,
  Trophy,
} from 'lucide-react';

interface LiveScoreboardScreenProps {
  courtId: number;
}

export const LiveScoreboardScreen: React.FC<LiveScoreboardScreenProps> = ({ courtId }) => {
  const {
    session,
    navigateTo,
    recordRallyInMatch,
    undoRallyInMatch,
    completeMatch,
    abandonMatch,
  } = useSession();

  const [showFinalSheet, setShowFinalSheet] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const court = session.courts.find((c) => c.id === courtId);
  const match = court?.currentMatch;

  if (!match) {
    return (
      <div className="min-h-screen bg-canvas-dark flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-lg font-bold text-highContrast mb-2">
          No active match on Court {courtId}
        </h2>
        <p className="text-sm text-mutedText mb-4">
          The match has ended or was cleared.
        </p>
        <button
          onClick={() => navigateTo({ type: 'SESSION_HUB' })}
          className="bg-pickleball-lime text-[#132200] font-bold px-4 py-2 rounded-xl text-sm"
        >
          Back to Session Hub
        </button>
      </div>
    );
  }

  // Check Match Point conditions
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
      {/* Top Header */}
      <header className="bg-canvas-dark/95 backdrop-blur-md border-b border-pickleball-border px-4 py-3 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigateTo({ type: 'SESSION_HUB' })}
              className="p-1.5 rounded-lg bg-pickleball-surface hover:bg-pickleball-surfaceHighlight border border-pickleball-border text-highContrast transition-colors"
              data-testid="back_to_hub_button"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-highContrast tracking-tight">
                  COURT {courtId} LIVE SCORE
                </h1>
                {isMatchPoint && (
                  <span className="bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider animate-bounce">
                    MATCH POINT
                  </span>
                )}
                {match.isCompleted && (
                  <span className="bg-pickleball-lime text-[#132200] font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                    GAME OVER
                  </span>
                )}
              </div>
              <div className="text-[11px] text-mutedText">
                Target: {match.targetScore} (Win by 2)
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowFinalSheet(true)}
            className="bg-[#243410] hover:bg-[#314615] text-pickleball-lime border border-pickleball-lime/40 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
            data-testid="direct_final_score_button"
          >
            Finalize
          </button>
        </div>
      </header>

      {/* Main Scoring Workspace */}
      <main className="max-w-2xl mx-auto w-full px-4 py-3 flex-1 flex flex-col justify-between space-y-4">
        {/* Section 1: Official Callout Banner */}
        <div className="bg-pickleball-surface border border-pickleball-border rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-mutedText uppercase tracking-wider">
              OFFICIAL CALLOUT
            </div>
            <div className="text-2xl font-black text-pickleball-lime font-mono tracking-wider mt-0.5">
              {match.scoreA} - {match.scoreB} - {match.serverNumber}
            </div>
          </div>

          <div className="text-right text-xs">
            <div className="text-mutedText">
              Server: <strong className="text-highContrast">{match.currentServer.name}</strong>
            </div>
            <div className="text-mutedText">
              Receiver: <strong className="text-highContrast">{match.currentReceiver.name}</strong>
            </div>
          </div>
        </div>

        {/* Section 2: Tactical Court Diagram */}
        <section>
          <div className="text-[10px] font-bold text-mutedText uppercase tracking-wider mb-1.5">
            TACTICAL COURT ORIENTATION
          </div>
          <TacticalPickleballCourtDiagram match={match} />
        </section>

        {/* Section 3: Dual Big-Touch Rally Scoring Pads */}
        <section className="grid grid-cols-2 gap-3 flex-1 min-h-[220px]">
          {/* Team A Scoring Pad */}
          <button
            onClick={() => recordRallyInMatch(courtId, 'TEAM_A')}
            disabled={match.isCompleted}
            className={`relative rounded-2xl p-4 flex flex-col justify-between items-center transition-all border-2 active:scale-[0.98] ${
              match.servingTeam === 'TEAM_A'
                ? 'bg-gradient-to-b from-[#0E282B] to-[#0A1D20] border-[#00E5FF] shadow-lg shadow-[#00E5FF]/10'
                : 'bg-[#0F1C18] border-pickleball-border hover:border-[#00E5FF]/40'
            }`}
          >
            {/* Serving Badge */}
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-black text-[#00E5FF] tracking-wider">
                TEAM A
              </span>
              {match.servingTeam === 'TEAM_A' && (
                <span className="bg-[#00E5FF] text-[#052124] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Server {match.serverNumber}
                </span>
              )}
            </div>

            {/* Huge Score */}
            <div className="text-6xl sm:text-7xl font-black text-highContrast my-auto">
              {match.scoreA}
            </div>

            {/* Team Roster & Tap Action */}
            <div className="w-full text-center">
              <div className="text-xs font-medium text-highContrast truncate">
                {match.teamA.player1.name} & {match.teamA.player2.name}
              </div>
              <div className="text-[11px] font-bold text-pickleball-lime mt-1 bg-black/40 py-1 rounded-lg">
                + Won Rally
              </div>
            </div>
          </button>

          {/* Team B Scoring Pad */}
          <button
            onClick={() => recordRallyInMatch(courtId, 'TEAM_B')}
            disabled={match.isCompleted}
            className={`relative rounded-2xl p-4 flex flex-col justify-between items-center transition-all border-2 active:scale-[0.98] ${
              match.servingTeam === 'TEAM_B'
                ? 'bg-gradient-to-b from-[#2B1F0E] to-[#20170A] border-[#FF9100] shadow-lg shadow-[#FF9100]/10'
                : 'bg-[#1C150F] border-pickleball-border hover:border-[#FF9100]/40'
            }`}
          >
            {/* Serving Badge */}
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-black text-[#FF9100] tracking-wider">
                TEAM B
              </span>
              {match.servingTeam === 'TEAM_B' && (
                <span className="bg-[#FF9100] text-[#241300] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Server {match.serverNumber}
                </span>
              )}
            </div>

            {/* Huge Score */}
            <div className="text-6xl sm:text-7xl font-black text-highContrast my-auto">
              {match.scoreB}
            </div>

            {/* Team Roster & Tap Action */}
            <div className="w-full text-center">
              <div className="text-xs font-medium text-highContrast truncate">
                {match.teamB.player1.name} & {match.teamB.player2.name}
              </div>
              <div className="text-[11px] font-bold text-pickleball-lime mt-1 bg-black/40 py-1 rounded-lg">
                + Won Rally
              </div>
            </div>
          </button>
        </section>

        {/* Section 4: Match Won Celebration Banner (If Completed) */}
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
              onClick={() => completeMatch(courtId, match.scoreA, match.scoreB)}
              className="mt-3 bg-pickleball-lime hover:bg-pickleball-limeLight text-[#132200] font-bold py-2.5 px-6 rounded-xl text-xs shadow-lg inline-flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Return to Hub</span>
            </button>
          </div>
        )}

        {/* Section 5: Secondary Controls (Undo, History, Abandon) */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-pickleball-border">
          {/* Undo Rally */}
          <button
            onClick={() => undoRallyInMatch(courtId)}
            disabled={match.rallyHistory.length === 0}
            className="flex-1 bg-pickleball-surface hover:bg-pickleball-surfaceHighlight disabled:opacity-30 border border-pickleball-border font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 text-highContrast transition-colors"
          >
            <Undo2 className="w-4 h-4 text-pickleball-attention" />
            <span>Undo Rally</span>
          </button>

          {/* Rally History Toggle */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="bg-pickleball-surface hover:bg-pickleball-surfaceHighlight border border-pickleball-border font-medium py-2 px-3 rounded-xl text-xs flex items-center gap-1 text-mutedText hover:text-highContrast transition-colors"
          >
            <History className="w-4 h-4" />
            <span>History ({match.rallyHistory.length})</span>
          </button>

          {/* Abandon Match */}
          <button
            onClick={() => {
              if (window.confirm('Abandon this match and return all 4 players to queue?')) {
                abandonMatch(courtId);
              }
            }}
            className="bg-[#241313] hover:bg-[#331A1A] border border-[#522525] text-[#FF8A80] font-medium py-2 px-3 rounded-xl text-xs flex items-center gap-1 transition-colors"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Abandon</span>
          </button>
        </div>

        {/* Collapsible Play-by-Play Log Feed */}
        {showHistory && (
          <div className="bg-[#101712] border border-pickleball-border rounded-xl p-3 max-h-48 overflow-y-auto space-y-1.5 text-xs">
            <div className="font-bold text-highContrast mb-1">Rally Event Feed:</div>
            {match.rallyHistory.length === 0 ? (
              <div className="text-mutedText">No rallies recorded yet.</div>
            ) : (
              [...match.rallyHistory].reverse().map((event) => (
                <div
                  key={event.rallyIndex}
                  className="flex items-center justify-between py-1 border-b border-pickleball-border/50 text-[11px]"
                >
                  <span className="font-mono text-pickleball-lime">#{event.rallyIndex}</span>
                  <span className="text-highContrast truncate mx-2">{event.description}</span>
                  <span className="font-mono text-mutedText shrink-0">
                    {event.scoreA}-{event.scoreB}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Fast Final Score Modal */}
      {showFinalSheet && (
        <FastFinalScoreSheet
          match={match}
          onConfirm={(finalA, finalB) => {
            completeMatch(courtId, finalA, finalB);
            setShowFinalSheet(false);
          }}
          onDismiss={() => setShowFinalSheet(false)}
        />
      )}
    </div>
  );
};
