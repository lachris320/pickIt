import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { Match, CourtStatus } from '../types';
import { ROTATION_POLICIES } from '../types';
import { RecommendationCard } from '../components/RecommendationCard';
import { OnDeckHorizonBar } from '../components/OnDeckHorizonBar';
import { CourtStatusCard } from '../components/CourtStatusCard';
import { QueueRosterSheet } from '../components/QueueRosterSheet';
import { FastFinalScoreSheet } from '../components/FastFinalScoreSheet';
import {
  Users,
  Settings,
  PlusCircle,
  PlaySquare,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

export const SessionHubScreen: React.FC = () => {
  const {
    session,
    navigateTo,
    addPlayerToRoster,
    togglePlayerRest,
    checkOutPlayer,
    moveQueuePlayer,
    confirmRecommendation,
    swapRecommendationPartners,
    completeMatch,
    toggleCourtPause,
    launchStandaloneScoreboard,
    resetToDefaultSession,
  } = useSession();

  const [showQueueSheet, setShowQueueSheet] = useState(false);
  const [courtToRecordScore, setCourtToRecordScore] = useState<Match | null>(null);

  const availableQueue = session.roster.filter((p) => p.status === 'AVAILABLE');
  const activeMatchesCount = session.courts.filter((c) => c.status === 'IN_PROGRESS').length;
  const recommendations = Object.values(session.activeRecommendations);

  return (
    <div className="min-h-screen bg-canvas-dark text-highContrast pb-20">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-canvas-dark/95 backdrop-blur-md border-b border-pickleball-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Title & Policy */}
          <div>
            <div className="flex items-center gap-2">
              <img
                src="/ic_pickleball_logo.jpg"
                alt="Logo"
                className="w-7 h-7 rounded-lg object-cover border border-pickleball-lime/40"
              />
              <h1 className="text-base sm:text-lg font-black tracking-tight text-highContrast truncate">
                {session.name}
              </h1>
            </div>
            <div className="text-xs text-pickleball-lime font-medium mt-0.5">
              Policy: {ROTATION_POLICIES[session.rotationPolicy]?.displayName ?? session.rotationPolicy}
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2">
            {/* Paddle Queue Button with live counter */}
            <button
              onClick={() => setShowQueueSheet(true)}
              className="bg-[#24330A] hover:bg-[#30440E] text-pickleball-lime border border-pickleball-lime/40 font-bold px-3 py-1.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all"
              data-testid="open_queue_button"
            >
              <Users className="w-4 h-4" />
              <span>Queue ({availableQueue.length})</span>
            </button>

            {/* Session Settings / New Session */}
            <button
              onClick={() => navigateTo({ type: 'SETUP' })}
              className="p-2 rounded-xl bg-pickleball-surface hover:bg-pickleball-surfaceHighlight text-highContrast border border-pickleball-border transition-colors"
              title="Session Configuration"
              data-testid="session_settings_button"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-4 space-y-5">
        {/* Section 1: Active Rotation Recommendations Ready */}
        {recommendations.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-pickleball-attention" />
              <h2 className="text-xs font-black tracking-wider text-pickleball-attention uppercase">
                ROTATION RECOMMENDATIONS READY ({recommendations.length})
              </h2>
            </div>

            <div className="space-y-3">
              {recommendations.map((rec) => (
                <RecommendationCard
                  key={rec.courtId}
                  recommendation={rec}
                  onCallAndStart={() => confirmRecommendation(rec.courtId)}
                  onSwapPartners={() => swapRecommendationPartners(rec.courtId)}
                  onRestPlayer={(id) => togglePlayerRest(id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Section 2: On-Deck Horizon Bar (Next 4) */}
        <section>
          <OnDeckHorizonBar onDeckPlayers={availableQueue.slice(0, 4)} />
        </section>

        {/* Section 3: Courts Overview */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-mutedText uppercase tracking-wider">
              COURTS OVERVIEW ({activeMatchesCount}/{session.courts.length} IN PLAY)
            </h2>
            <span className="text-[11px] text-mutedText">
              Tap Live or Final to record
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {session.courts.map((court) => (
              <CourtStatusCard
                key={court.id}
                court={court}
                onOpenScoreboard={() => {
                  if (court.currentMatch) {
                    navigateTo({ type: 'LIVE_SCOREBOARD', courtId: court.id });
                  }
                }}
                onEnterFinalScore={() => {
                  if (court.currentMatch) {
                    setCourtToRecordScore(court.currentMatch);
                  }
                }}
                onTogglePause={() => toggleCourtPause(court.id)}
              />
            ))}
          </div>
        </section>

        {/* Section 4: Standalone Scorekeeper Affordance & Demo Reset */}
        <section className="bg-[#121A14] border border-pickleball-border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-highContrast flex items-center gap-2">
              <PlaySquare className="w-4 h-4 text-pickleball-lime" />
              <span>Standalone Scorekeeper</span>
            </h3>
            <p className="text-xs text-mutedText mt-0.5">
              Official USA Pickleball 0-0-2 live scoring with undo & side-out tracking for ad-hoc pick-up games.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={launchStandaloneScoreboard}
              className="flex-1 sm:flex-none bg-[#1F2F22] hover:bg-[#2A402E] text-pickleball-lime border border-pickleball-lime/40 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
              data-testid="launch_standalone_scoreboard_button"
            >
              Launch Scorekeeper
            </button>
            <button
              onClick={resetToDefaultSession}
              title="Reset to default session"
              className="p-2 rounded-xl bg-pickleball-surface hover:bg-pickleball-surfaceHighlight text-mutedText hover:text-highContrast border border-pickleball-border text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      </main>

      {/* Modal 1: Digital Paddle Queue & Roster */}
      {showQueueSheet && (
        <QueueRosterSheet
          roster={session.roster}
          onAddPlayer={addPlayerToRoster}
          onToggleRest={togglePlayerRest}
          onCheckOut={checkOutPlayer}
          onMovePlayer={moveQueuePlayer}
          onDismiss={() => setShowQueueSheet(false)}
        />
      )}

      {/* Modal 2: Fast Final Score Sheet */}
      {courtToRecordScore && (
        <FastFinalScoreSheet
          match={courtToRecordScore}
          onConfirm={(finalA, finalB) => {
            completeMatch(courtToRecordScore.courtId, finalA, finalB);
            setCourtToRecordScore(null);
          }}
          onDismiss={() => setCourtToRecordScore(null)}
        />
      )}
    </div>
  );
};
