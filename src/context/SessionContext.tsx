import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  OpenPlaySession,
  Player,
  Court,
  Match,
  RotationPolicy,
  RotationRecommendation,
  TeamId,
  AppScreen,
} from '../types';
import { PickleballGameEngine } from '../engine/PickleballGameEngine';
import { RotationEngine } from '../engine/RotationEngine';

export const FREQUENT_PLAYERS = [
  'Alice M.', 'Bob T.', 'Charlie D.', 'Dave K.',
  'Frank L.', 'Grace H.', 'Henry P.', 'Ivy W.',
  'Ken S.', 'Elena R.', 'Tom H.', 'Sarah B.',
  'David L.', 'Priya K.', 'Carlos M.', 'Chloe W.',
];

const STORAGE_KEY = 'pickleball_open_play_session_v1';

function createInitialSession(): OpenPlaySession {
  const now = Date.now();
  const initialPlayers: Player[] = FREQUENT_PLAYERS.slice(0, 14).map((name, idx) => ({
    id: `p_${idx}`,
    name,
    status: idx < 8 ? 'IN_MATCH' : 'AVAILABLE',
    queuedTimestamp: now - (14 - idx) * 60_000,
    matchesPlayed: idx < 8 ? (idx % 2) + 1 : 0,
    matchesWon: idx % 4 === 0 ? 1 : 0,
    totalPointsScored: idx < 8 ? 11 : 0,
    totalPointsConceded: idx < 8 ? 8 : 0,
    consecutiveGamesOnCourt: idx < 4 ? 1 : 0,
  }));

  const court1Match: Match = {
    ...PickleballGameEngine.createMatch(
      1,
      { id: 'TEAM_A', player1: initialPlayers[0], player2: initialPlayers[1] },
      { id: 'TEAM_B', player1: initialPlayers[2], player2: initialPlayers[3] }
    ),
    scoreA: 8,
    scoreB: 5,
    serverNumber: 1,
  };

  const court2Match: Match = {
    ...PickleballGameEngine.createMatch(
      2,
      { id: 'TEAM_A', player1: initialPlayers[4], player2: initialPlayers[5] },
      { id: 'TEAM_B', player1: initialPlayers[6], player2: initialPlayers[7] }
    ),
    scoreA: 4,
    scoreB: 2,
    serverNumber: 2,
  };

  const courts: Court[] = [
    { id: 1, name: 'Court 1', status: 'IN_PROGRESS', currentMatch: court1Match },
    { id: 2, name: 'Court 2', status: 'IN_PROGRESS', currentMatch: court2Match },
    { id: 3, name: 'Court 3', status: 'AVAILABLE', currentMatch: null },
  ];

  const session: OpenPlaySession = {
    id: `sess_${now}`,
    name: 'Friday Morning Open Play',
    startTime: now,
    rotationPolicy: 'FOUR_OFF_FOUR_ON',
    consecutiveGameCap: 2,
    targetScore: 11,
    courts,
    roster: initialPlayers,
    completedMatches: [],
    activeRecommendations: {},
    isPaused: false,
    isCompleted: false,
  };

  const rec = RotationEngine.generateRecommendation(session, 3, null);
  if (rec) {
    session.activeRecommendations[3] = rec;
  }

  return session;
}

interface SessionContextType {
  session: OpenPlaySession;
  currentScreen: AppScreen;
  standaloneMatch: Match | null;
  navigateTo: (screen: AppScreen) => void;
  startNewSession: (
    name: string,
    courtCount: number,
    policy: RotationPolicy,
    playerNames: string[]
  ) => void;
  resetToDefaultSession: () => void;
  addPlayerToRoster: (name: string) => void;
  togglePlayerRest: (playerId: string) => void;
  checkOutPlayer: (playerId: string) => void;
  moveQueuePlayer: (fromIndex: IntRange, toIndex: IntRange) => void;
  confirmRecommendation: (courtId: number) => void;
  swapRecommendationPartners: (courtId: number) => void;
  recordRallyInMatch: (courtId: number, winningTeam: TeamId) => void;
  undoRallyInMatch: (courtId: number) => void;
  completeMatch: (courtId: number, finalScoreA: number, finalScoreB: number) => void;
  abandonMatch: (courtId: number) => void;
  toggleCourtPause: (courtId: number) => void;
  launchStandaloneScoreboard: (firstServingTeam?: TeamId) => void;
  recordStandaloneRally: (winningTeam: TeamId) => void;
  undoStandaloneRally: () => void;
}

type IntRange = number;

const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<OpenPlaySession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as OpenPlaySession;
        if (parsed.roster && parsed.roster.length > 0) {
          // Re-evaluate recommendations
          const recs: Record<number, RotationRecommendation> = {};
          parsed.courts
            .filter((c) => c.status === 'AVAILABLE')
            .forEach((c) => {
              const r = RotationEngine.generateRecommendation(parsed, c.id, null);
              if (r) recs[c.id] = r;
            });
          return { ...parsed, activeRecommendations: recs };
        }
      }
    } catch (e) {
      console.error('Failed to load session from localStorage', e);
    }
    return createInitialSession();
  });

  const [currentScreen, setCurrentScreen] = useState<AppScreen>({ type: 'SESSION_HUB' });
  const [standaloneMatch, setStandaloneMatch] = useState<Match | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('Failed to save session to localStorage', e);
    }
  }, [session]);

  const navigateTo = (screen: AppScreen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const refreshRecommendations = (curr: OpenPlaySession): OpenPlaySession => {
    const updatedRecs: Record<number, RotationRecommendation> = { ...curr.activeRecommendations };
    curr.courts.forEach((c) => {
      if (c.status === 'AVAILABLE') {
        const rec = RotationEngine.generateRecommendation(curr, c.id, null);
        if (rec) {
          updatedRecs[c.id] = rec;
        } else {
          delete updatedRecs[c.id];
        }
      } else {
        delete updatedRecs[c.id];
      }
    });
    return { ...curr, activeRecommendations: updatedRecs };
  };

  const startNewSession = (
    name: string,
    courtCount: number,
    policy: RotationPolicy,
    playerNames: string[]
  ) => {
    const now = Date.now();
    const players: Player[] = playerNames.map((pName, idx) => ({
      id: `player_${now}_${idx}`,
      name: pName.trim(),
      status: 'AVAILABLE',
      queuedTimestamp: now + idx * 1000,
      matchesPlayed: 0,
      matchesWon: 0,
      totalPointsScored: 0,
      totalPointsConceded: 0,
      consecutiveGamesOnCourt: 0,
    }));

    const courts: Court[] = Array.from({ length: courtCount }, (_, i) => ({
      id: i + 1,
      name: `Court ${i + 1}`,
      status: 'AVAILABLE',
      currentMatch: null,
    }));

    const newSession: OpenPlaySession = {
      id: `session_${now}`,
      name: name.trim() || 'Open Play Session',
      startTime: now,
      rotationPolicy: policy,
      consecutiveGameCap: 2,
      targetScore: 11,
      courts,
      roster: players,
      completedMatches: [],
      activeRecommendations: {},
      isPaused: false,
      isCompleted: false,
    };

    const sessionWithRecs = refreshRecommendations(newSession);
    setSession(sessionWithRecs);
    setCurrentScreen({ type: 'SESSION_HUB' });
  };

  const resetToDefaultSession = () => {
    const s = createInitialSession();
    setSession(s);
    setCurrentScreen({ type: 'SESSION_HUB' });
  };

  const addPlayerToRoster = (name: string) => {
    if (!name.trim()) return;
    const newPlayer: Player = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      status: 'AVAILABLE',
      queuedTimestamp: Date.now(),
      matchesPlayed: 0,
      matchesWon: 0,
      totalPointsScored: 0,
      totalPointsConceded: 0,
      consecutiveGamesOnCourt: 0,
    };
    setSession((curr) => {
      const updated = {
        ...curr,
        roster: [...curr.roster, newPlayer],
      };
      return refreshRecommendations(updated);
    });
  };

  const togglePlayerRest = (playerId: string) => {
    setSession((curr) => {
      const updatedRoster = curr.roster.map((player) => {
        if (player.id === playerId) {
          if (player.status === 'AVAILABLE') {
            return {
              ...player,
              status: 'RESTING' as const,
              restingTimestamp: Date.now(),
            };
          } else if (player.status === 'RESTING') {
            return {
              ...player,
              status: 'AVAILABLE' as const,
              queuedTimestamp: Date.now(),
            };
          }
        }
        return player;
      });
      const updated = { ...curr, roster: updatedRoster };
      return refreshRecommendations(updated);
    });
  };

  const checkOutPlayer = (playerId: string) => {
    setSession((curr) => {
      const updatedRoster = curr.roster.map((player) =>
        player.id === playerId ? { ...player, status: 'CHECKED_OUT' as const } : player
      );
      const updated = { ...curr, roster: updatedRoster };
      return refreshRecommendations(updated);
    });
  };

  const moveQueuePlayer = (fromIndex: number, toIndex: number) => {
    setSession((curr) => {
      const available = curr.roster.filter((p) => p.status === 'AVAILABLE');
      if (fromIndex < 0 || fromIndex >= available.length || toIndex < 0 || toIndex >= available.length) {
        return curr;
      }
      const [moved] = available.splice(fromIndex, 1);
      available.splice(toIndex, 0, moved);

      const baseTime = Date.now() - 1_000_000;
      const reindexed = available.map((p, idx) => ({
        ...p,
        queuedTimestamp: baseTime + idx * 10_000,
      }));

      const others = curr.roster.filter((p) => p.status !== 'AVAILABLE');
      const updated = { ...curr, roster: [...reindexed, ...others] };
      return refreshRecommendations(updated);
    });
  };

  const confirmRecommendation = (courtId: number) => {
    setSession((curr) => {
      const rec = curr.activeRecommendations[courtId];
      if (!rec) return curr;

      const newMatch = PickleballGameEngine.createMatch(
        courtId,
        rec.teamA,
        rec.teamB,
        curr.targetScore
      );

      const matchParticipantIds = new Set([
        rec.teamA.player1.id,
        rec.teamA.player2.id,
        rec.teamB.player1.id,
        rec.teamB.player2.id,
      ]);

      const updatedRoster = curr.roster.map((p) =>
        matchParticipantIds.has(p.id)
          ? {
              ...p,
              status: 'IN_MATCH' as const,
              consecutiveGamesOnCourt: p.consecutiveGamesOnCourt + 1,
            }
          : p
      );

      const updatedCourts = curr.courts.map((c) =>
        c.id === courtId ? { ...c, status: 'IN_PROGRESS' as const, currentMatch: newMatch } : c
      );

      const updatedRecs = { ...curr.activeRecommendations };
      delete updatedRecs[courtId];

      return {
        ...curr,
        courts: updatedCourts,
        roster: updatedRoster,
        activeRecommendations: updatedRecs,
      };
    });
  };

  const swapRecommendationPartners = (courtId: number) => {
    setSession((curr) => {
      const rec = curr.activeRecommendations[courtId];
      if (!rec) return curr;

      const newTeamA = { ...rec.teamA, player2: rec.teamB.player2 };
      const newTeamB = { ...rec.teamB, player2: rec.teamA.player2 };

      const updatedRec: RotationRecommendation = {
        ...rec,
        teamA: newTeamA,
        teamB: newTeamB,
        detailedReason: [...rec.detailedReason, 'Host swapped partners for variety.'],
      };

      return {
        ...curr,
        activeRecommendations: {
          ...curr.activeRecommendations,
          [courtId]: updatedRec,
        },
      };
    });
  };

  const recordRallyInMatch = (courtId: number, winningTeam: TeamId) => {
    setSession((curr) => {
      const court = curr.courts.find((c) => c.id === courtId);
      if (!court || !court.currentMatch) return curr;

      const updatedMatch = PickleballGameEngine.recordRally(court.currentMatch, winningTeam);
      const updatedCourts = curr.courts.map((c) =>
        c.id === courtId ? { ...c, currentMatch: updatedMatch } : c
      );

      return { ...curr, courts: updatedCourts };
    });
  };

  const undoRallyInMatch = (courtId: number) => {
    setSession((curr) => {
      const court = curr.courts.find((c) => c.id === courtId);
      if (!court || !court.currentMatch) return curr;

      const revertedMatch = PickleballGameEngine.undoLastRally(court.currentMatch);
      const updatedCourts = curr.courts.map((c) =>
        c.id === courtId ? { ...c, currentMatch: revertedMatch } : c
      );

      return { ...curr, courts: updatedCourts };
    });
  };

  const completeMatch = (courtId: number, finalScoreA: number, finalScoreB: number) => {
    setSession((curr) => {
      const court = curr.courts.find((c) => c.id === courtId);
      if (!court || !court.currentMatch) return curr;

      const activeMatch = court.currentMatch;
      const completedMatch = PickleballGameEngine.createCompletedMatch(
        courtId,
        activeMatch.teamA,
        activeMatch.teamB,
        finalScoreA,
        finalScoreB,
        curr.targetScore
      );

      const winnerTeam = completedMatch.winnerTeamId;
      const teamAPlayerIds = new Set([completedMatch.teamA.player1.id, completedMatch.teamA.player2.id]);
      const teamBPlayerIds = new Set([completedMatch.teamB.player1.id, completedMatch.teamB.player2.id]);

      const updatedRoster = curr.roster.map((p) => {
        if (teamAPlayerIds.has(p.id)) {
          const isWinner = winnerTeam === 'TEAM_A';
          return {
            ...p,
            status: 'AVAILABLE' as const,
            queuedTimestamp: Date.now(),
            matchesPlayed: p.matchesPlayed + 1,
            matchesWon: p.matchesWon + (isWinner ? 1 : 0),
            totalPointsScored: p.totalPointsScored + finalScoreA,
            totalPointsConceded: p.totalPointsConceded + finalScoreB,
            consecutiveGamesOnCourt: isWinner ? p.consecutiveGamesOnCourt : 0,
          };
        }
        if (teamBPlayerIds.has(p.id)) {
          const isWinner = winnerTeam === 'TEAM_B';
          return {
            ...p,
            status: 'AVAILABLE' as const,
            queuedTimestamp: Date.now(),
            matchesPlayed: p.matchesPlayed + 1,
            matchesWon: p.matchesWon + (isWinner ? 1 : 0),
            totalPointsScored: p.totalPointsScored + finalScoreB,
            totalPointsConceded: p.totalPointsConceded + finalScoreA,
            consecutiveGamesOnCourt: isWinner ? p.consecutiveGamesOnCourt : 0,
          };
        }
        return p;
      });

      const updatedCourts = curr.courts.map((c) =>
        c.id === courtId ? { ...c, status: 'AVAILABLE' as const, currentMatch: null } : c
      );

      const interimSession: OpenPlaySession = {
        ...curr,
        courts: updatedCourts,
        roster: updatedRoster,
        completedMatches: [...curr.completedMatches, completedMatch],
      };

      const newRec = RotationEngine.generateRecommendation(interimSession, courtId, completedMatch);
      const updatedRecs = { ...interimSession.activeRecommendations };
      if (newRec) {
        updatedRecs[courtId] = newRec;
      } else {
        delete updatedRecs[courtId];
      }

      return { ...interimSession, activeRecommendations: updatedRecs };
    });
    setCurrentScreen({ type: 'SESSION_HUB' });
  };

  const abandonMatch = (courtId: number) => {
    setSession((curr) => {
      const court = curr.courts.find((c) => c.id === courtId);
      if (!court || !court.currentMatch) return curr;

      const activeMatch = court.currentMatch;
      const matchIds = new Set([
        activeMatch.teamA.player1.id,
        activeMatch.teamA.player2.id,
        activeMatch.teamB.player1.id,
        activeMatch.teamB.player2.id,
      ]);

      const updatedRoster = curr.roster.map((p) =>
        matchIds.has(p.id)
          ? { ...p, status: 'AVAILABLE' as const, queuedTimestamp: Date.now() }
          : p
      );

      const updatedCourts = curr.courts.map((c) =>
        c.id === courtId ? { ...c, status: 'AVAILABLE' as const, currentMatch: null } : c
      );

      const updated = { ...curr, courts: updatedCourts, roster: updatedRoster };
      return refreshRecommendations(updated);
    });
    setCurrentScreen({ type: 'SESSION_HUB' });
  };

  const toggleCourtPause = (courtId: number) => {
    setSession((curr) => {
      const court = curr.courts.find((c) => c.id === courtId);
      if (!court || court.status === 'IN_PROGRESS') return curr;

      const newStatus = court.status === 'AVAILABLE' ? 'PAUSED' : 'AVAILABLE';
      const updatedCourts = curr.courts.map((c) =>
        c.id === courtId ? { ...c, status: newStatus as Court['status'] } : c
      );

      const updatedRecs = { ...curr.activeRecommendations };
      if (newStatus === 'PAUSED') {
        delete updatedRecs[courtId];
      }

      const updated = { ...curr, courts: updatedCourts, activeRecommendations: updatedRecs };
      return newStatus === 'AVAILABLE' ? refreshRecommendations(updated) : updated;
    });
  };

  const launchStandaloneScoreboard = (firstServingTeam: TeamId = 'TEAM_A') => {
    const p1: Player = {
      id: 's1',
      name: 'Team A Player 1',
      status: 'AVAILABLE',
      queuedTimestamp: 0,
      matchesPlayed: 0,
      matchesWon: 0,
      totalPointsScored: 0,
      totalPointsConceded: 0,
      consecutiveGamesOnCourt: 0,
    };
    const p2: Player = { ...p1, id: 's2', name: 'Team A Player 2' };
    const p3: Player = { ...p1, id: 's3', name: 'Team B Player 1' };
    const p4: Player = { ...p1, id: 's4', name: 'Team B Player 2' };

    const match = PickleballGameEngine.createMatch(
      0,
      { id: 'TEAM_A', player1: p1, player2: p2 },
      { id: 'TEAM_B', player1: p3, player2: p4 },
      11,
      true,
      firstServingTeam
    );
    setStandaloneMatch(match);
    setCurrentScreen({ type: 'STANDALONE_SCOREBOARD', match });
  };

  const recordStandaloneRally = (winningTeam: TeamId) => {
    if (!standaloneMatch) return;
    const updated = PickleballGameEngine.recordRally(standaloneMatch, winningTeam);
    setStandaloneMatch(updated);
    setCurrentScreen({ type: 'STANDALONE_SCOREBOARD', match: updated });
  };

  const undoStandaloneRally = () => {
    if (!standaloneMatch) return;
    const reverted = PickleballGameEngine.undoLastRally(standaloneMatch);
    setStandaloneMatch(reverted);
    setCurrentScreen({ type: 'STANDALONE_SCOREBOARD', match: reverted });
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        currentScreen,
        standaloneMatch,
        navigateTo,
        startNewSession,
        resetToDefaultSession,
        addPlayerToRoster,
        togglePlayerRest,
        checkOutPlayer,
        moveQueuePlayer,
        confirmRecommendation,
        swapRecommendationPartners,
        recordRallyInMatch,
        undoRallyInMatch,
        completeMatch,
        abandonMatch,
        toggleCourtPause,
        launchStandaloneScoreboard,
        recordStandaloneRally,
        undoStandaloneRally,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
