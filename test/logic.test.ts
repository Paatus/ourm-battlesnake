import {
  containsSnake,
  distanceToFood,
  getOpenNeighbours,
  info,
  move,
  scoreDirection,
} from "../src/logic";
import {outsideBoard} from "../src/utils";
import {createBattlesnake, createGameState} from "./utils";

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
    const gameState = createGameState(
      me,
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
      [me]
    );
    expect(distanceToFood(me.head, gameState)).toEqual(1);
  });
});


describe("Scores", () => {
  it("Scores negatively for likely next position for other snakes", () => {
    const me = createBattlesnake("me", [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
    ]);
    const other = createBattlesnake("other", [
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ]);
    const gameState = createGameState(me, [], [me, other]);

    const downScore = scoreDirection(me.head, "down", gameState);
    const leftScore = scoreDirection(me.head, "left", gameState);
    const rightScore = scoreDirection(me.head, "right", gameState);

    expect(downScore).toBeLessThan(rightScore);
    expect(leftScore).toBeLessThan(rightScore);
  });

  it("Food score is higher when lower health", () => {
    for (let health = 10; health <= 100; health += 10) {
      const me = createBattlesnake(
        "me",
        [
          { x: 2, y: 2 },
          { x: 2, y: 3 },
        ],
        health
      );
      const gameState = createGameState(me, [{ x: 1, y: 2 }], [me]);

      const foodScore = scoreDirection(me.head, "left", gameState);
      const nonFoodScore = scoreDirection(me.head, "right", gameState);

      if (health <= 20) {
        expect(foodScore).toBeGreaterThan(nonFoodScore);
      }
    }
  });
});

describe("containsSnake", () => {
  it("excludes worse snakes", () => {
    const me = createBattlesnake("me", [
      { x: 4, y: 0 },
      { x: 3, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 0 },
    ]);
    const worse = createBattlesnake("worse", [
      { x: 0, y: 3 },
      { x: 0, y: 2 },
      { x: 0, y: 1 },
    ]);
    const gameState = createGameState(me, [], [me, worse]);

    expect(containsSnake(worse.head, gameState)).toEqual(false);
    expect(containsSnake(worse.body[1], gameState)).toEqual(true);
  });
});

describe("outsideBoard", () => {
  const me = createBattlesnake("me", [{ x: 9, y: 9 }]);
  const gs = createGameState(me, [], [me]);

  it("returns true if outside board", () => {
    expect(outsideBoard({ x: -1, y: 0 }, gs)).toEqual(true);
  });

  it("returns true if outside board", () => {
    expect(outsideBoard({ x: 0, y: 0 }, gs)).toEqual(false);
  });
});

describe("getOpenNeighbours", () => {
  it("works", () => {
    const me = createBattlesnake("me", [{ x: 9, y: 9 }]);
    const gs = createGameState(me, [], [me]);
    const result = getOpenNeighbours({ x: 1, y: 1 }, gs);
    expect(result).toHaveLength(4);
    expect(result).toContainEqual({ x: 0, y: 1 });
    expect(result).toContainEqual({ x: 2, y: 1 });
    expect(result).toContainEqual({ x: 1, y: 2 });
    expect(result).toContainEqual({ x: 1, y: 0 });
  });

  it("filters known items", () => {
    const me = createBattlesnake("me", [{ x: 9, y: 9 }]);
    const gs = createGameState(me, [], [me]);
    const result = getOpenNeighbours({ x: 1, y: 1 }, gs, [{ x: 0, y: 1 }]);
    expect(result).toHaveLength(3);
    expect(result).not.toContainEqual({ x: 0, y: 1 });
    expect(result).toContainEqual({ x: 2, y: 1 });
    expect(result).toContainEqual({ x: 1, y: 2 });
    expect(result).toContainEqual({ x: 1, y: 0 });
  });
});

describe("Game tests", () => {
  it("Grabs food even when full", () => {
    const food = [{ x: 10, y: 7 }];
    const me = createBattlesnake("me", [
      { x: 9, y: 7 },
      { x: 9, y: 6 },
      { x: 9, y: 5 },
      { x: 9, y: 4 },
      { x: 9, y: 3 },
      { x: 9, y: 2 },
      { x: 9, y: 1 },
      { x: 8, y: 1 },
      { x: 7, y: 1 },
      { x: 7, y: 2 },
    ]);
    const other = createBattlesnake("other", [
      { x: 8, y: 8 },
      { x: 7, y: 8 },
      { x: 6, y: 8 },
      { x: 5, y: 8 },
      { x: 4, y: 8 },
      { x: 3, y: 8 },
      { x: 2, y: 8 },
      { x: 1, y: 8 },
      { x: 1, y: 9 },
      { x: 2, y: 9 },
      { x: 3, y: 9 },
      { x: 4, y: 9 },
      { x: 5, y: 9 },
      { x: 6, y: 9 },
      { x: 6, y: 10 },
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 },
      { x: 2, y: 10 },
      { x: 1, y: 10 },
      { x: 0, y: 10 },
      { x: 0, y: 9 },
      { x: 0, y: 8 },
      { x: 0, y: 7 },
      { x: 0, y: 6 },
      { x: 0, y: 5 },
      { x: 0, y: 4 },
    ]);
    const snakes = [me, other];
    const gs = createGameState(me, food, snakes);

    expect(move(gs)).toEqual({ move: "right" });
  });

  it('Don\'t move into hole', () => {
      const me = createBattlesnake("me", [{"x":2,"y":0},{"x":2,"y":1},{"x":1,"y":1},{"x":1,"y":2}]);
        const snakes = [
            me,
            createBattlesnake("red", [{"x":0,"y":2},{"x":0,"y":3},{"x":1,"y":3},{"x":2,"y":3},{"x":2,"y":4},{"x":2,"y":5},{"x":2,"y":6},{"x":2,"y":7}]),
            createBattlesnake("green", [{"x":7,"y":3},{"x":6,"y":3},{"x":5,"y":3},{"x":4,"y":3},{"x":4,"y":2},{"x":4,"y":1},{"x":4,"y":0},{"x": 5, "y": 0}]),
        ]
      const gs = createGameState(me, [], snakes);

      expect(move(gs)).toEqual({ move: "right" });
  });

  it('Can move to a tail, to avoid dangerous positions', () => {
      const me = createBattlesnake("me", [{"x":8,"y":2},{"x":8,"y":1},{"x":9,"y":1},{"x":9,"y":2}]);
        const snakes = [
            me,
            createBattlesnake("iSnek", [{"x":7,"y":3},{"x":7,"y":4},{"x":7,"y":5},{"x":7,"y":6},{"x":8,"y":6},{"x":9,"y":6},{"x":9,"y":7}]),
            createBattlesnake("ramsay", [{"x":6,"y":2},{"x":6,"y":3},{"x":6,"y":4}]),
        ]
      const gs = createGameState(me, [], snakes);

      expect(move(gs)).toEqual({ move: "right" });
  });
});
