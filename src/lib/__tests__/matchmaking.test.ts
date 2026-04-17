import { describe, it, expect } from "vitest";
import { randomMatchmaking, skillBasedMatchmaking } from "../matchmaking";

const makePlayers = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `p${i + 1}`,
    name: `Player ${i + 1}`,
    rankPoints: (count - i) * 100, // descending points: p1 has most
  }));

describe("randomMatchmaking()", () => {
  describe("DOUBLES mode (default)", () => {
    it("creates correct number of matches based on available courts", () => {
      const players = makePlayers(8);
      const matches = randomMatchmaking(players, 2);
      expect(matches).toHaveLength(2);
    });

    it("assigns 2 players per team in doubles", () => {
      const players = makePlayers(4);
      const [match] = randomMatchmaking(players, 1);
      expect(match.team1).toHaveLength(2);
      expect(match.team2).toHaveLength(2);
    });

    it("assigns sequential court numbers starting from 1", () => {
      const players = makePlayers(8);
      const matches = randomMatchmaking(players, 2);
      expect(matches[0].courtNumber).toBe(1);
      expect(matches[1].courtNumber).toBe(2);
    });

    it("does not create a match when fewer than 4 players available", () => {
      const players = makePlayers(3);
      const matches = randomMatchmaking(players, 2);
      expect(matches).toHaveLength(0);
    });

    it("creates only as many matches as players allow (not limited by courts)", () => {
      // 6 players → only 1 full doubles match (4 players), not 2
      const players = makePlayers(6);
      const matches = randomMatchmaking(players, 3);
      expect(matches).toHaveLength(1);
    });

    it("assigns all 4 players across both teams without duplication", () => {
      const players = makePlayers(4);
      const [match] = randomMatchmaking(players, 1);
      const allIds = [...match.team1, ...match.team2].map((p) => p.id);
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(4);
    });

    it("returns empty array when no players provided", () => {
      expect(randomMatchmaking([], 4)).toHaveLength(0);
    });
  });

  describe("SINGLES mode", () => {
    it("assigns 1 player per team in singles", () => {
      const players = makePlayers(2);
      const [match] = randomMatchmaking(players, 1, "SINGLES");
      expect(match.team1).toHaveLength(1);
      expect(match.team2).toHaveLength(1);
    });

    it("does not create a match when only 1 player", () => {
      const players = makePlayers(1);
      expect(randomMatchmaking(players, 1, "SINGLES")).toHaveLength(0);
    });

    it("creates matches for every pair of players up to court limit", () => {
      const players = makePlayers(4);
      const matches = randomMatchmaking(players, 4, "SINGLES");
      expect(matches).toHaveLength(2);
    });
  });
});

describe("skillBasedMatchmaking()", () => {
  describe("DOUBLES mode", () => {
    it("creates correct number of matches", () => {
      const players = makePlayers(8);
      const matches = skillBasedMatchmaking(players, 2);
      expect(matches).toHaveLength(2);
    });

    it("pairs strongest with weakest for balanced teams", () => {
      // Players sorted by rankPoints desc: p1(400), p2(300), p3(200), p4(100)
      const players = [
        { id: "p1", name: "P1", rankPoints: 400 },
        { id: "p2", name: "P2", rankPoints: 300 },
        { id: "p3", name: "P3", rankPoints: 200 },
        { id: "p4", name: "P4", rankPoints: 100 },
      ];
      const [match] = skillBasedMatchmaking(players, 1);
      // Team1: [0]=p1 (strongest) + [3]=p4 (weakest)
      // Team2: [1]=p2 + [2]=p3
      const team1Ids = match.team1.map((p) => p.id);
      const team2Ids = match.team2.map((p) => p.id);
      expect(team1Ids).toContain("p1");
      expect(team1Ids).toContain("p4");
      expect(team2Ids).toContain("p2");
      expect(team2Ids).toContain("p3");
    });

    it("does not duplicate players across teams", () => {
      const players = makePlayers(4);
      const [match] = skillBasedMatchmaking(players, 1);
      const allIds = [...match.team1, ...match.team2].map((p) => p.id);
      expect(new Set(allIds).size).toBe(4);
    });

    it("returns empty array for insufficient players", () => {
      expect(skillBasedMatchmaking(makePlayers(3), 2)).toHaveLength(0);
    });

    it("assigns court numbers starting from 1", () => {
      const players = makePlayers(8);
      const matches = skillBasedMatchmaking(players, 2);
      expect(matches.map((m) => m.courtNumber)).toEqual([1, 2]);
    });
  });

  describe("SINGLES mode", () => {
    it("matches top player against second player", () => {
      const players = [
        { id: "p1", name: "P1", rankPoints: 500 },
        { id: "p2", name: "P2", rankPoints: 300 },
        { id: "p3", name: "P3", rankPoints: 100 },
        { id: "p4", name: "P4", rankPoints: 50 },
      ];
      const [match] = skillBasedMatchmaking(players, 1, "SINGLES");
      expect(match.team1[0].id).toBe("p1");
      expect(match.team2[0].id).toBe("p2");
    });

    it("creates 1 player per team in singles", () => {
      const players = makePlayers(2);
      const [match] = skillBasedMatchmaking(players, 1, "SINGLES");
      expect(match.team1).toHaveLength(1);
      expect(match.team2).toHaveLength(1);
    });
  });
});
