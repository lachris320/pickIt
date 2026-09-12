import React, { useState } from 'react';
import { useSession, FREQUENT_PLAYERS } from '../context/SessionContext';
import { RotationPolicy, ROTATION_POLICIES } from '../types';
import { ArrowLeft, Plus, X, Play, CheckCircle2 } from 'lucide-react';

export const SetupScreen: React.FC = () => {
  const { navigateTo, startNewSession } = useSession();

  const [sessionName, setSessionName] = useState('Saturday Morning Open Play');
  const [courtCount, setCourtCount] = useState<number>(3);
  const [rotationPolicy, setRotationPolicy] = useState<RotationPolicy>('FOUR_OFF_FOUR_ON');

  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(
    FREQUENT_PLAYERS.slice(0, 12)
  );
  const [customPlayerInput, setCustomPlayerInput] = useState('');

  const handleTogglePlayer = (name: string) => {
    if (selectedPlayers.includes(name)) {
      setSelectedPlayers(selectedPlayers.filter((p) => p !== name));
    } else {
      setSelectedPlayers([...selectedPlayers, name]);
    }
  };

  const handleAddCustomPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPlayerInput.trim() && !selectedPlayers.includes(customPlayerInput.trim())) {
      setSelectedPlayers([...selectedPlayers, customPlayerInput.trim()]);
      setCustomPlayerInput('');
    }
  };

  const handleStartSession = () => {
    if (selectedPlayers.length < courtCount * 2) {
      alert(`Need at least ${courtCount * 2} players for ${courtCount} court(s).`);
      return;
    }
    startNewSession(sessionName, courtCount, rotationPolicy, selectedPlayers);
  };

  return (
    <div className="min-h-screen bg-canvas-dark text-highContrast pb-20">
      {/* Header */}
      <header className="bg-canvas-dark/95 backdrop-blur-md border-b border-pickleball-border px-4 py-3 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigateTo({ type: 'SESSION_HUB' })}
              className="p-1.5 rounded-lg bg-pickleball-surface hover:bg-pickleball-surfaceHighlight border border-pickleball-border text-highContrast transition-colors"
              data-testid="setup_back_button"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-base font-black text-highContrast tracking-tight uppercase">
              NEW OPEN PLAY SESSION
            </h1>
          </div>
        </div>
      </header>

      {/* Form Content */}
      <main className="max-w-2xl mx-auto px-4 py-5 space-y-6">
        {/* Field 1: Session Name */}
        <section>
          <label className="text-xs font-bold text-pickleball-lime uppercase tracking-wider block mb-2">
            SESSION NAME
          </label>
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className="w-full bg-pickleball-surface border border-pickleball-border rounded-xl px-4 py-2.5 text-sm text-highContrast focus:outline-none focus:border-pickleball-lime transition-colors"
            placeholder="e.g. Saturday Morning Open Play"
            data-testid="setup_session_name_input"
          />
        </section>

        {/* Field 2: Number of Courts */}
        <section>
          <label className="text-xs font-bold text-pickleball-lime uppercase tracking-wider block mb-2">
            NUMBER OF COURTS AVAILABLE
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 6].map((count) => {
              const isSelected = courtCount === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => setCourtCount(count)}
                  className={`py-3 rounded-xl font-black text-base transition-all border ${
                    isSelected
                      ? 'bg-pickleball-lime text-[#132200] border-pickleball-lime shadow-md shadow-pickleball-lime/20'
                      : 'bg-pickleball-surface text-highContrast border-pickleball-border hover:border-pickleball-borderLight'
                  }`}
                  data-testid={`setup_court_count_${count}`}
                >
                  {count}
                </button>
              );
            })}
          </div>
        </section>

        {/* Field 3: Rotation System Policy */}
        <section>
          <label className="text-xs font-bold text-pickleball-lime uppercase tracking-wider block mb-2">
            ROTATION SYSTEM POLICY
          </label>
          <div className="space-y-2.5">
            {(Object.keys(ROTATION_POLICIES) as RotationPolicy[]).map((policyKey) => {
              const policy = ROTATION_POLICIES[policyKey];
              const isSelected = rotationPolicy === policyKey;
              return (
                <button
                  key={policyKey}
                  type="button"
                  onClick={() => setRotationPolicy(policyKey)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-[#1D2920] border-pickleball-lime text-highContrast'
                      : 'bg-pickleball-surface border-pickleball-border hover:border-pickleball-borderLight'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-highContrast">
                      {policy.displayName}
                    </span>
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-pickleball-lime" />
                    )}
                  </div>
                  <p className="text-xs text-mutedText">{policy.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Field 4: Players Roster Selection */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-pickleball-lime uppercase tracking-wider">
              PARTICIPANTS ROSTER ({selectedPlayers.length} SELECTED)
            </label>
            <span className="text-xs text-mutedText">
              Min. {courtCount * 4} recommended
            </span>
          </div>

          {/* Add custom player */}
          <form onSubmit={handleAddCustomPlayer} className="flex gap-2 mb-3">
            <input
              type="text"
              value={customPlayerInput}
              onChange={(e) => setCustomPlayerInput(e.target.value)}
              placeholder="Add other player name..."
              className="flex-1 bg-pickleball-surface border border-pickleball-border rounded-xl px-3.5 py-2 text-xs text-highContrast placeholder-mutedText focus:outline-none focus:border-pickleball-lime"
            />
            <button
              type="submit"
              disabled={!customPlayerInput.trim()}
              className="bg-[#24330A] hover:bg-[#30440E] disabled:opacity-40 text-pickleball-lime border border-pickleball-lime/40 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Player Chips Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1 bg-[#0F1611] rounded-xl border border-pickleball-border">
            {FREQUENT_PLAYERS.map((name) => {
              const isChecked = selectedPlayers.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleTogglePlayer(name)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-between border transition-all ${
                    isChecked
                      ? 'bg-[#1E3022] text-pickleball-lime border-pickleball-lime/50'
                      : 'bg-pickleball-surface text-mutedText border-pickleball-border hover:text-highContrast'
                  }`}
                >
                  <span className="truncate">{name}</span>
                  {isChecked && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Start Session Submit Button */}
        <div className="pt-4">
          <button
            onClick={handleStartSession}
            className="w-full bg-pickleball-lime hover:bg-pickleball-limeLight text-[#132200] font-black py-3.5 px-6 rounded-xl text-sm flex items-center justify-center gap-2 shadow-xl shadow-pickleball-lime/10 transition-all active:scale-[0.99]"
            data-testid="start_new_session_button"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Open Play Session</span>
          </button>
        </div>
      </main>
    </div>
  );
};
