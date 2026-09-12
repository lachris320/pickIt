export type RotationPolicy = 'FOUR_OFF_FOUR_ON' | 'WINNERS_STAY_SPLIT';

export interface RotationPolicyInfo {
  id: RotationPolicy;
  displayName: string;
  description: string;
}

export const ROTATION_POLICIES: Record<RotationPolicy, RotationPolicyInfo> = {
  FOUR_OFF_FOUR_ON: {
    id: 'FOUR_OFF_FOUR_ON',
    displayName: '4-Off / 4-On',
    description: 'All 4 players rotate off; the next 4 in queue take the court.',
  },
  WINNERS_STAY_SPLIT: {
    id: 'WINNERS_STAY_SPLIT',
    displayName: 'Winners Stay & Split',
    description: 'Winners stay on court for up to 2 games and split sides; 2 queue players step up.',
  },
};

export type ParticipantStatus = 'AVAILABLE' | 'IN_MATCH' | 'RESTING' | 'CHECKED_OUT';

export type CourtStatus = 'AVAILABLE' | 'IN_PROGRESS' | 'PAUSED';

export type TeamId = 'TEAM_A' | 'TEAM_B';

export type CourtSide = 'RIGHT' | 'LEFT';

export interface Player {
  id: string;
  name: string;
  status: ParticipantStatus;
  queuedTimestamp: number;
  restingTimestamp?: number;
  matchesPlayed: number;
  matchesWon: number;
  totalPointsScored: number;
  totalPointsConceded: number;
  consecutiveGamesOnCourt: number;
}

export interface Team {
  id: TeamId;
  player1: Player;
  player2: Player;
}

export interface RallyEvent {
  rallyIndex: number;
  winningTeam: TeamId;
  scoreA: number;
  scoreB: number;
  servingTeam: TeamId;
  serverNumber: number;
  serverName: string;
  receiverName: string;
  servingSide: CourtSide;
  description: string;
  isSideOut: boolean;
}

export interface Match {
  id: string;
  courtId: number;
  teamA: Team;
  teamB: Team;
  targetScore: number;
  winByTwo: boolean;
  startTime: number;
  endTime?: number | null;
  scoreA: number;
  scoreB: number;
  firstServingTeam: TeamId; // team that served first; needed to replay/undo correctly
  servingTeam: TeamId;
  serverNumber: number; // 1 or 2 (starts at 2 for 0-0-2)
  teamAServer1: Player;
  teamBServer1: Player;
  currentServer: Player;
  currentReceiver: Player;
  servingSide: CourtSide;
  rallyHistory: RallyEvent[];
  isCompleted: boolean;
  winnerTeamId?: TeamId | null;
}

export interface RotationRecommendation {
  courtId: number;
  teamA: Team;
  teamB: Team;
  departingPlayers: Player[];
  retainedPlayers: Player[];
  incomingPlayers: Player[];
  primaryReason: string;
  detailedReason: string[];
  warningMessage?: string | null;
}

export interface Court {
  id: number;
  name: string;
  status: CourtStatus;
  currentMatch?: Match | null;
}

export interface OpenPlaySession {
  id: string;
  name: string;
  startTime: number;
  rotationPolicy: RotationPolicy;
  consecutiveGameCap: number;
  targetScore: number;
  courts: Court[];
  roster: Player[];
  completedMatches: Match[];
  activeRecommendations: Record<number, RotationRecommendation>;
  isPaused: boolean;
  isCompleted: boolean;
}

export type AppScreen =
  | { type: 'SESSION_HUB' }
  | { type: 'SETUP' }
  | { type: 'LIVE_SCOREBOARD'; courtId: number }
  | { type: 'STANDALONE_SCOREBOARD'; match: Match };
