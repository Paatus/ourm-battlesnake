import { distanceToFood, floodFill, info, move } from "../src/logic";
import { Battlesnake, Coord, GameState, MoveResponse } from "../src/types";

function createGameState(me: Battlesnake, food: Coord[]): GameState {
  return {
    game: {
      id: "",
      ruleset: {
        name: "",
        version: "",
        settings: {
          minimumFood: 1,
          foodSpawnChance: 1,
          hazardDamagePerTurn: 1,
          royale: { shrinkEveryNTurns: 0 },
          squad: {
            sharedHealth: false,
            sharedLength: false,
            sharedElimination: false,
            allowBodyCollisions: false,
          },
        },
      },
      timeout: 0,
      source: "",
    },
    turn: 0,
    board: {
      height: 5,
      width: 5,
      food,
      snakes: [me],
      hazards: [],
    },
    you: me,
  };
}

function createBattlesnake(id: string, body: Coord[]): Battlesnake {
  return {
    id: id,
    name: id,
    health: 0,
    body: body,
    latency: "",
    head: body[0],
    length: body.length,
    shout: "",
    squad: "",
  };
}

describe("Battlesnake API Version", () => {
  it("should be api version 1", () => {
    const result = info();
    expect(result.apiversion).toBe("1");
  });
});

describe("Seek food", () => {
  it("distance to food", () => {
    const me = createBattlesnake("me", [
      { x: 2, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 0 },
    ]);
    const gameState = createGameState(me, [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ]);
    expect(distanceToFood(me.head, gameState)).toEqual(1);
  });
});

describe("Flood fill", () => {
  it("calculates score correctly", () => {
    const me = createBattlesnake("me", [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 0 },
    ]);
    const gameState = createGameState(me, []);

    expect(floodFill({ x: 0, y: 0 }, gameState)).toEqual(1);
  });

  it("calculates score correctly 2", () => {
    const me = createBattlesnake("me", [
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
      { x: 1, y: 0 },
    ]);
    const gameState = createGameState(me, []);

    expect(floodFill({ x: 0, y: 1 }, gameState)).toEqual(2);
  });

  it("calculates score correctly 3", () => {
    const me = createBattlesnake("me", [
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
      { x: 1, y: 0 },
    ]);
    const gameState = createGameState(me, []);

    expect(floodFill({ x: 0, y: 3 }, gameState)).toEqual(19);
  });
});
