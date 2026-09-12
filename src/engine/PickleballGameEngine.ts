import type { Match, Team, TeamId, CourtSide, RallyEvent } from '../types';

export const PickleballGameEngine = {
  createMatch(
    courtId: number,
    teamA: Team,
    teamB: Team,
    targetScore: number = 11,
    winByTwo: boolean = true,
    firstServingTeam: TeamId = 'TEAM_A'
  ): Match {
    // Official start: Serving team begins on Server 2 (0-0-2), on the Right court.
    const servingTeamObj = firstServingTeam === 'TEAM_A' ? teamA : teamB;
    const receivingTeamObj = firstServingTeam === 'TEAM_A' ? teamB : teamA;
    return {
      id: `match_${Date.now()}_${courtId}`,
      courtId,
      teamA,
      teamB,
      targetScore,
      winByTwo,
      startTime: Date.now(),
      scoreA: 0,
      scoreB: 0,
      firstServingTeam,
      servingTeam: firstServingTeam,
      serverNumber: 2,
      teamAServer1: teamA.player1,
      teamBServer1: teamB.player1,
      currentServer: servingTeamObj.player1,
      currentReceiver: receivingTeamObj.player1,
      servingSide: 'RIGHT',
      rallyHistory: [],
      isCompleted: false,
      winnerTeamId: null,
    };
  },

  recordRally(current: Match, winningTeam: TeamId): Match {
    if (current.isCompleted) return current;

    const isServingTeamWinner = winningTeam === current.servingTeam;

    let newScoreA = current.scoreA;
    let newScoreB = current.scoreB;
    let newServingTeam = current.servingTeam;
    let newServerNumber = current.serverNumber;
    let newServer = current.currentServer;
    let newReceiver = current.currentReceiver;
    let newServingSide = current.servingSide;
    let isSideOut = false;
    let description = '';

    const teamANames = `${current.teamA.player1.name} & ${current.teamA.player2.name}`;
    const teamBNames = `${current.teamB.player1.name} & ${current.teamB.player2.name}`;

    if (isServingTeamWinner) {
      // Serving team won rally -> Points are awarded ONLY to the serving team
      if (current.servingTeam === 'TEAM_A') {
        newScoreA++;
        description = `Point Team A (${teamANames})`;
      } else {
        newScoreB++;
        description = `Point Team B (${teamBNames})`;
      }

      // Serving team switches sides (Right <-> Left)
      newServingSide = current.servingSide === 'RIGHT' ? 'LEFT' : 'RIGHT';

      // The serving player continues to serve; receiver is determined by opposing side
      const receivingTeamObj = current.servingTeam === 'TEAM_A' ? current.teamB : current.teamA;

      newServer = current.currentServer;
      newReceiver = newServingSide === 'RIGHT' ? receivingTeamObj.player1 : receivingTeamObj.player2;
    } else {
      // Receiving team won rally -> Fault on serving team
      if (current.serverNumber === 1) {
        // Advance to Server 2 for the same team
        newServerNumber = 2;
        const servingTeamObj = current.servingTeam === 'TEAM_A' ? current.teamA : current.teamB;
        const receivingTeamObj = current.servingTeam === 'TEAM_A' ? current.teamB : current.teamA;

        // Server 2 is the partner of Server 1
        newServer = current.currentServer.id === servingTeamObj.player1.id
          ? servingTeamObj.player2
          : servingTeamObj.player1;

        // Partners always stand on opposite courts. No point was scored (nobody moves),
        // so Server 2 serves from the side diagonally opposite Server 1 -> flip the side.
        newServingSide = current.servingSide === 'RIGHT' ? 'LEFT' : 'RIGHT';

        newReceiver = newServingSide === 'RIGHT' ? receivingTeamObj.player1 : receivingTeamObj.player2;
        description = `Fault. Second Server: ${newServer.name}`;
      } else {
        // Server 2 faulted -> SIDE OUT
        isSideOut = true;
        newServingTeam = current.servingTeam === 'TEAM_A' ? 'TEAM_B' : 'TEAM_A';
        newServerNumber = 1;

        const newServingTeamObj = newServingTeam === 'TEAM_A' ? current.teamA : current.teamB;
        const newReceivingTeamObj = newServingTeam === 'TEAM_A' ? current.teamB : current.teamA;
        const currentServingScore = newServingTeam === 'TEAM_A' ? newScoreA : newScoreB;

        // Serve side is determined by whether the serving team's score is even (Right) or odd (Left)
        newServingSide = currentServingScore % 2 === 0 ? 'RIGHT' : 'LEFT';

        newServer = newServingTeamObj.player1;
        newReceiver = newServingSide === 'RIGHT' ? newReceivingTeamObj.player1 : newReceivingTeamObj.player2;
        description = `Side Out! Serve transfers to ${newServingTeam === 'TEAM_A' ? teamANames : teamBNames}`;
      }
    }

    const event: RallyEvent = {
      rallyIndex: current.rallyHistory.length + 1,
      winningTeam,
      scoreA: newScoreA,
      scoreB: newScoreB,
      servingTeam: newServingTeam,
      serverNumber: newServerNumber,
      serverName: newServer.name,
      receiverName: newReceiver.name,
      servingSide: newServingSide,
      description,
      isSideOut,
    };

    const updatedHistory = [...current.rallyHistory, event];

    // Check winning condition
    const diff = Math.abs(newScoreA - newScoreB);
    const maxScore = Math.max(newScoreA, newScoreB);
    const hasWon = maxScore >= current.targetScore && (!current.winByTwo || diff >= 2);
    const winner = hasWon ? (newScoreA > newScoreB ? 'TEAM_A' : 'TEAM_B') : null;

    return {
      ...current,
      scoreA: newScoreA,
      scoreB: newScoreB,
      servingTeam: newServingTeam,
      serverNumber: newServerNumber,
      currentServer: newServer,
      currentReceiver: newReceiver,
      servingSide: newServingSide,
      rallyHistory: updatedHistory,
      isCompleted: hasWon,
      winnerTeamId: winner,
      endTime: hasWon ? Date.now() : null,
    };
  },

  /**
   * Pops the last rally event from history and recalculates state from start,
   * guaranteeing 100% mathematical integrity for Undo.
   */
  undoLastRally(current: Match): Match {
    if (current.rallyHistory.length === 0) return current;

    const previousEvents = current.rallyHistory.slice(0, -1);
    let replayMatch = this.createMatch(
      current.courtId,
      current.teamA,
      current.teamB,
      current.targetScore,
      current.winByTwo,
      current.firstServingTeam
    );

    for (const event of previousEvents) {
      replayMatch = this.recordRally(replayMatch, event.winningTeam);
    }

    return replayMatch;
  },

  createCompletedMatch(
    courtId: number,
    teamA: Team,
    teamB: Team,
    scoreA: number,
    scoreB: number,
    targetScore: number = 11,
    winByTwo: boolean = true
  ): Match {
    const winner: TeamId = scoreA > scoreB ? 'TEAM_A' : 'TEAM_B';
    return {
      id: `match_${Date.now()}_${courtId}`,
      courtId,
      teamA,
      teamB,
      targetScore,
      winByTwo,
      startTime: Date.now() - 15 * 60 * 1000,
      scoreA,
      scoreB,
      firstServingTeam: 'TEAM_A',
      servingTeam: winner,
      serverNumber: 1,
      teamAServer1: teamA.player1,
      teamBServer1: teamB.player1,
      currentServer: teamA.player1,
      currentReceiver: teamB.player1,
      servingSide: 'RIGHT',
      rallyHistory: [],
      isCompleted: true,
      winnerTeamId: winner,
      endTime: Date.now(),
    };
  },
};
