interface Player {
  id: string;
  name: string;
  rankPoints: number;
}

interface MatchPairing {
  team1: Player[];
  team2: Player[];
  courtNumber: number;
}

/**
 * Random matchmaking - randomly assigns players to teams
 */
export function randomMatchmaking(
  players: Player[],
  courtsAvailable: number,
  matchType: "SINGLES" | "DOUBLES" = "DOUBLES"
): MatchPairing[] {
  const playersPerMatch = matchType === "DOUBLES" ? 4 : 2;
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  const matches: MatchPairing[] = [];

  for (let i = 0; i < courtsAvailable && shuffled.length >= playersPerMatch; i++) {
    const matchPlayers = shuffled.splice(0, playersPerMatch);
    if (matchType === "DOUBLES") {
      matches.push({
        team1: [matchPlayers[0], matchPlayers[1]],
        team2: [matchPlayers[2], matchPlayers[3]],
        courtNumber: i + 1,
      });
    } else {
      matches.push({
        team1: [matchPlayers[0]],
        team2: [matchPlayers[1]],
        courtNumber: i + 1,
      });
    }
  }

  return matches;
}

/**
 * Skill-based matchmaking - pairs players with similar skill levels
 */
export function skillBasedMatchmaking(
  players: Player[],
  courtsAvailable: number,
  matchType: "SINGLES" | "DOUBLES" = "DOUBLES"
): MatchPairing[] {
  const playersPerMatch = matchType === "DOUBLES" ? 4 : 2;
  // Sort by rank points
  const sorted = [...players].sort((a, b) => b.rankPoints - a.rankPoints);
  const matches: MatchPairing[] = [];

  for (let i = 0; i < courtsAvailable && sorted.length >= playersPerMatch; i++) {
    const matchPlayers = sorted.splice(0, playersPerMatch);
    if (matchType === "DOUBLES") {
      // Pair strongest with weakest for balanced teams
      matches.push({
        team1: [matchPlayers[0], matchPlayers[3]],
        team2: [matchPlayers[1], matchPlayers[2]],
        courtNumber: i + 1,
      });
    } else {
      matches.push({
        team1: [matchPlayers[0]],
        team2: [matchPlayers[1]],
        courtNumber: i + 1,
      });
    }
  }

  return matches;
}
