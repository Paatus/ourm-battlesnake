import { distanceToFood, floodFill, info, scoreDirection } from "../src/logic";
import { Battlesnake, Coord, GameState } from "../src/types";

function createGameState(me: Battlesnake, food: Coord[], snakes: Battlesnake[]): GameState {
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
      snakes,
      hazards: [],
    },
    you: me,
  };
}

function createBattlesnake(id: string, body: Coord[], health: number = 100): Battlesnake {
  return {
    id: id,
    name: id,
    health,
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
    ], [me]);
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
    const gameState = createGameState(me, [], [me]);

    expect(floodFill({ x: 0, y: 0 }, gameState)).toEqual(1);
  });

  it("calculates score correctly 2", () => {
    const me = createBattlesnake("me", [
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
      { x: 1, y: 0 },
    ]);
    const gameState = createGameState(me, [], [me]);

    expect(floodFill({ x: 0, y: 1 }, gameState)).toEqual(2);
  });

  it("calculates score correctly 3", () => {
    const me = createBattlesnake("me", [
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
      { x: 1, y: 0 },
    ]);
    const gameState = createGameState(me, [], [me]);

    expect(floodFill({ x: 0, y: 3 }, gameState)).toEqual(19);
  });
});

describe('Scores', () => {
    it('Scores negatively for likely next position for other snakes', () => {
        const me = createBattlesnake("me", [{ x: 2, y: 2 }, {x:2, y: 3}]);
        const other = createBattlesnake("other", [{ x: 1, y: 1 }, {x:0, y: 1}]);
        const gameState = createGameState(me, [], [me, other])

        const downScore = scoreDirection(me.head, 'down', gameState);
        const leftScore = scoreDirection(me.head, 'left', gameState);
        const rightScore = scoreDirection(me.head, 'right', gameState);

        expect(downScore).toBeLessThan(rightScore);
        expect(leftScore).toBeLessThan(rightScore);
    });

    it('Food score is higher when lower health', () => {
        for (let health = 10; health <= 100; health += 10) {
            const me = createBattlesnake("me", [{ x: 2, y: 2 }, {x:2, y: 3}], health);
            const gameState = createGameState(me, [{ x: 1, y: 2}], [me])

            const foodScore = scoreDirection(me.head, 'left', gameState);
            const nonFoodScore = scoreDirection(me.head, 'right', gameState);

            if (health <= 20) {
                expect(foodScore).toBeGreaterThan(nonFoodScore);
            } else {
                expect(foodScore).toEqual(nonFoodScore);
            }
        }


    });
});
