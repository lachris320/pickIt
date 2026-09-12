import {
  OpenPlaySession,
  Match,
  RotationRecommendation,
  Player,
  Team,
} from '../types';

export const RotationEngine = {
  generateRecommendation(
    session: OpenPlaySession,
    courtId: number,
    justFinishedMatch?: Match | null
  ): RotationRecommendation | null {
    const court = session.courts.find((c) => c.id === courtId);
    if (!court || court.status === 'PAUSED') {
      return null;
    }

    const availableQueue = session.roster
      .filter((p) => p.status === 'AVAILABLE')
      .sort((a, b) => {
        if (a.queuedTimestamp !== b.queuedTimestamp) {
          return a.queuedTimestamp - b.queuedTimestamp;
        }
        return a.matchesPlayed - b.matchesPlayed;
      });

    let departingPlayers: Player[] = [];
    let retainedPlayers: Player[] = [];
    let vacanciesNeeded = 4;
    let primaryReason = '';
    const detailedReasons: string[] = [];
    let warning: string | null = null;

    if (justFinishedMatch && justFinishedMatch.isCompleted) {
      const winners =
        justFinishedMatch.winnerTeamId === 'TEAM_A'
          ? [justFinishedMatch.teamA.player1, justFinishedMatch.teamA.player2]
          : [justFinishedMatch.teamB.player1, justFinishedMatch.teamB.player2];

      const losers =
        justFinishedMatch.winnerTeamId === 'TEAM_A'
          ? [justFinishedMatch.teamB.player1, justFinishedMatch.teamB.player2]
          : [justFinishedMatch.teamA.player1, justFinishedMatch.teamA.player2];

      switch (session.rotationPolicy) {
        case 'FOUR_OFF_FOUR_ON': {
          departingPlayers = [...winners, ...losers];
          retainedPlayers = [];
          vacanciesNeeded = 4;
          primaryReason = 'Next in queue (4-Off / 4-On)';
          detailedReasons.push(`All 4 players from Court ${courtId} rotate off.`);
          detailedReasons.push('4 vacancies opened for the waiting queue.');
          break;
        }

        case 'WINNERS_STAY_SPLIT': {
          const capReached = winners.some(
            (p) => p.consecutiveGamesOnCourt >= session.consecutiveGameCap
          );

          if (capReached) {
            departingPlayers = [...winners, ...losers];
            retainedPlayers = [];
            vacanciesNeeded = 4;
            primaryReason = 'Game cap reached (All 4 rotate)';
            detailedReasons.push(
              `Winners reached consecutive game cap (${session.consecutiveGameCap} games).`
            );
            detailedReasons.push(
              'All 4 players rotated off to ensure fair court sharing.'
            );
          } else {
            departingPlayers = losers;
            retainedPlayers = winners;
            vacanciesNeeded = 2;
            primaryReason = 'Winners stay & split • 2 next from queue';
            detailedReasons.push(
              `Winners stay for game ${(winners[0]?.consecutiveGamesOnCourt ?? 1) + 1} of ${session.consecutiveGameCap}.`
            );
            detailedReasons.push(
              'Winners split to opposite sides of the net for competitive balance.'
            );
          }
          break;
        }
      }
    } else {
      // Empty court assignment (e.g. at session start or after court was cleared)
      vacanciesNeeded = 4;
      primaryReason = 'Next in queue (#1 - #4)';
      detailedReasons.push(`Filling open Court ${courtId} from the waiting queue.`);
    }

    // Draw incoming players from available queue
    const incomingPlayers: Player[] = [];

    if (availableQueue.length >= vacanciesNeeded) {
      incomingPlayers.push(...availableQueue.slice(0, vacanciesNeeded));
      detailedReasons.push(
        `${incomingPlayers.map((p) => p.name).join(', ')} pulled from top of queue.`
      );

      const remainingWaiting = availableQueue.length - vacanciesNeeded;
      if (remainingWaiting >= 1 && remainingWaiting <= 3) {
        warning = `Notice: ${remainingWaiting} player(s) waiting in queue; rotation cadence adjusted.`;
      }
    } else {
      // Odd player / partial queue situation
      incomingPlayers.push(...availableQueue);
      const stillNeeded = vacanciesNeeded - availableQueue.length;

      if (departingPlayers.length > 0) {
        const sortedDeparting = [...departingPlayers].sort(
          (a, b) => a.matchesPlayed - b.matchesPlayed
        );
        const backfilled = sortedDeparting.slice(0, stillNeeded);
        incomingPlayers.push(...backfilled);
        warning = `Odd queue depth: ${backfilled.map((p) => p.name).join(', ')} retained based on lowest game count.`;
        detailedReasons.push(
          `Only ${availableQueue.length} waiting in queue. ${backfilled.map((p) => p.name).join(', ')} re-added for parity.`
        );
      } else {
        warning = `Not enough players in queue (Need ${vacanciesNeeded}, have ${availableQueue.length}).`;
      }
    }

    if (incomingPlayers.length + retainedPlayers.length < 4) {
      return null; // Cannot form a full doubles match yet
    }

    // Pair up teams
    let teamA: Team;
    let teamB: Team;

    if (retainedPlayers.length === 2) {
      // Winners Stay & Split: Pair Winner 1 with Queue 1, Winner 2 with Queue 2
      const winner1 = retainedPlayers[0];
      const winner2 = retainedPlayers[1];
      const queue1 = incomingPlayers[0] ?? winner1;
      const queue2 = incomingPlayers[1] ?? winner2;

      teamA = { id: 'TEAM_A', player1: winner1, player2: queue1 };
      teamB = { id: 'TEAM_B', player1: winner2, player2: queue2 };
    } else {
      // All 4 incoming from queue: Pair #1 & #2 vs #3 & #4
      const p1 = incomingPlayers[0];
      const p2 = incomingPlayers[1];
      const p3 = incomingPlayers[2];
      const p4 = incomingPlayers[3];

      teamA = { id: 'TEAM_A', player1: p1, player2: p2 };
      teamB = { id: 'TEAM_B', player1: p3, player2: p4 };
    }

    return {
      courtId,
      teamA,
      teamB,
      departingPlayers,
      retainedPlayers,
      incomingPlayers,
      primaryReason,
      detailedReason: detailedReasons,
      warningMessage: warning,
    };
  },
};
