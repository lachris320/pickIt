import React, { useState } from 'react';
import { Player, ParticipantStatus } from '../types';
import { FREQUENT_PLAYERS } from '../context/SessionContext';
import {
  X,
  UserPlus,
  ArrowUp,
  ArrowDown,
  Coffee,
  LogOut,
  Clock,
  CheckCircle2,
  Users,
} from 'lucide-react';

interface QueueRosterSheetProps {
  roster: Player[];
  onAddPlayer: (name: string) => void;
  onToggleRest: (playerId: string) => void;
  onCheckOut: (playerId: string) => void;
  onMovePlayer: (fromIndex: number, toIndex: number) => void;
  onDismiss: () => void;
}

export const QueueRosterSheet: React.FC<QueueRosterSheetProps> = ({
  roster,
  onAddPlayer,
  onToggleRest,
  onCheckOut,
  onMovePlayer,
  onDismiss,
}) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [activeTab, setActiveTab] = useState<'QUEUE' | 'RESTING' | 'IN_MATCH' | 'ALL'>('QUEUE');

  const availableQueue = roster.filter((p) => p.status === 'AVAILABLE');
  const restingPlayers = roster.filter((p) => p.status === 'RESTING');
  const inMatchPlayers = roster.filter((p) => p.status === 'IN_MATCH');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      onAddPlayer(newPlayerName.trim());
      setNewPlayerName('');
    }
  };

  // Filter frequent players that aren't already in the roster
  const existingNames = new Set(roster.map((p) => p.name.toLowerCase()));
  const suggestedPlayers = FREQUENT_PLAYERS.filter(
    (name) => !existingNames.has(name.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg max-h-[90vh] bg-canvas-dark border border-pickleball-border rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-pickleball-border flex items-center justify-between bg-pickleball-surface">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pickleball-lime/10 text-pickleball-lime">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-highContrast">
                Digital Paddle Queue & Roster
              </h2>
              <p className="text-xs text-mutedText">
                {availableQueue.length} in queue • {roster.length} total participants
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg bg-[#1D2820] text-mutedText hover:text-highContrast border border-pickleball-border"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add Player Input */}
        <div className="p-4 border-b border-pickleball-border bg-[#0E1510]">
          <form onSubmit={handleAddSubmit} className="flex gap-2 mb-2">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Add player name..."
              className="flex-1 bg-pickleball-surface border border-pickleball-border rounded-xl px-3.5 py-2 text-sm text-highContrast placeholder-mutedText focus:outline-none focus:border-pickleball-lime"
            />
            <button
              type="submit"
              disabled={!newPlayerName.trim()}
              className="bg-pickleball-lime hover:bg-pickleball-limeLight disabled:opacity-40 text-[#132200] font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>

          {/* Quick Frequent Player Chips */}
          {suggestedPlayers.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-[10px] uppercase font-bold text-mutedText shrink-0 mr-1">
                Quick Add:
              </span>
              {suggestedPlayers.slice(0, 6).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => onAddPlayer(name)}
                  className="text-xs bg-[#17241A] hover:bg-[#203324] text-pickleball-lime px-2.5 py-0.5 rounded-full border border-pickleball-borderLight shrink-0 transition-colors"
                >
                  + {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-pickleball-border bg-canvas-dark text-xs font-semibold px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('QUEUE')}
            className={`pb-2 px-2 border-b-2 transition-colors ${
              activeTab === 'QUEUE'
                ? 'border-pickleball-lime text-pickleball-lime'
                : 'border-transparent text-mutedText hover:text-highContrast'
            }`}
          >
            Queue ({availableQueue.length})
          </button>
          <button
            onClick={() => setActiveTab('RESTING')}
            className={`pb-2 px-2 border-b-2 transition-colors ${
              activeTab === 'RESTING'
                ? 'border-pickleball-lime text-pickleball-lime'
                : 'border-transparent text-mutedText hover:text-highContrast'
            }`}
          >
            Resting ({restingPlayers.length})
          </button>
          <button
            onClick={() => setActiveTab('IN_MATCH')}
            className={`pb-2 px-2 border-b-2 transition-colors ${
              activeTab === 'IN_MATCH'
                ? 'border-pickleball-lime text-pickleball-lime'
                : 'border-transparent text-mutedText hover:text-highContrast'
            }`}
          >
            On Court ({inMatchPlayers.length})
          </button>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`pb-2 px-2 border-b-2 transition-colors ${
              activeTab === 'ALL'
                ? 'border-pickleball-lime text-pickleball-lime'
                : 'border-transparent text-mutedText hover:text-highContrast'
            }`}
          >
            All ({roster.length})
          </button>
        </div>

        {/* Player List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeTab === 'QUEUE' && (
            <>
              {availableQueue.length === 0 ? (
                <div className="text-center py-8 text-sm text-mutedText">
                  No players currently waiting in queue.
                </div>
              ) : (
                availableQueue.map((player, idx) => {
                  const waitMinutes = Math.max(
                    0,
                    Math.floor((Date.now() - player.queuedTimestamp) / 60000)
                  );
                  return (
                    <div
                      key={player.id}
                      className="bg-pickleball-surface border border-pickleball-border rounded-xl p-3 flex items-center justify-between gap-2"
                    >
                      {/* Priority rank */}
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-[#22351E] text-pickleball-lime font-black text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-sm text-highContrast">
                            {player.name}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-mutedText">
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {waitMinutes}m wait
                            </span>
                            <span>•</span>
                            <span>{player.matchesPlayed} games</span>
                            <span>•</span>
                            <span>{player.matchesWon} won</span>
                          </div>
                        </div>
                      </div>

                      {/* Controls: Reorder & Rest */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onMovePlayer(idx, idx - 1)}
                          disabled={idx === 0}
                          title="Move up in queue"
                          className="p-1 rounded bg-[#1B271F] disabled:opacity-30 text-mutedText hover:text-highContrast"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onMovePlayer(idx, idx + 1)}
                          disabled={idx === availableQueue.length - 1}
                          title="Move down in queue"
                          className="p-1 rounded bg-[#1B271F] disabled:opacity-30 text-mutedText hover:text-highContrast"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onToggleRest(player.id)}
                          title="Take a break (Rest)"
                          className="p-1.5 rounded bg-[#2A2314] text-[#FFE082] hover:bg-[#3D331B] ml-1"
                        >
                          <Coffee className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onCheckOut(player.id)}
                          title="Check out"
                          className="p-1.5 rounded bg-[#2B1B1B] text-[#FF8A80] hover:bg-[#3D2323]"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {activeTab === 'RESTING' && (
            <>
              {restingPlayers.length === 0 ? (
                <div className="text-center py-8 text-sm text-mutedText">
                  No players currently taking a break.
                </div>
              ) : (
                restingPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="bg-pickleball-surface border border-pickleball-border rounded-xl p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-sm text-highContrast">
                        {player.name}
                      </div>
                      <span className="text-xs text-pickleball-attention">
                        Resting / Break
                      </span>
                    </div>
                    <button
                      onClick={() => onToggleRest(player.id)}
                      className="bg-pickleball-lime hover:bg-pickleball-limeLight text-[#132200] font-bold px-3 py-1.5 rounded-lg text-xs"
                    >
                      Return to Queue
                    </button>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'IN_MATCH' && (
            <>
              {inMatchPlayers.length === 0 ? (
                <div className="text-center py-8 text-sm text-mutedText">
                  No players currently in active matches.
                </div>
              ) : (
                inMatchPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="bg-pickleball-surface border border-pickleball-border rounded-xl p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-sm text-highContrast">
                        {player.name}
                      </div>
                      <span className="text-xs text-pickleball-lime">
                        Currently On Court ({player.consecutiveGamesOnCourt} consecutive)
                      </span>
                    </div>
                    <span className="text-xs text-mutedText">
                      {player.matchesPlayed} played
                    </span>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'ALL' && (
            <div className="space-y-1.5">
              {roster.map((player) => (
                <div
                  key={player.id}
                  className="bg-pickleball-surface border border-pickleball-border rounded-xl p-2.5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        player.status === 'AVAILABLE'
                          ? 'bg-pickleball-lime'
                          : player.status === 'IN_MATCH'
                          ? 'bg-[#00E5FF]'
                          : player.status === 'RESTING'
                          ? 'bg-pickleball-attention'
                          : 'bg-mutedText'
                      }`}
                    />
                    <span className="font-semibold text-highContrast">
                      {player.name}
                    </span>
                    <span className="text-[10px] text-mutedText">
                      ({player.status})
                    </span>
                  </div>
                  <div className="text-mutedText">
                    {player.matchesWon}W - {player.matchesPlayed - player.matchesWon}L
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
