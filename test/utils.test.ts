import { Battlesnake, Coord, Direction } from "../src/types";
import {
  contains,
  getSnakeDirection,
  moveDir,
  removeDirection,
  removeDown,
  removeLeft,
  removeRight,
  removeUp,
} from "../src/utils";

describe("getSnakeDirection", () => {
  const createBattleSnake = (head: Coord, neck: Coord): Battlesnake => {
    return {
      id: "",
      name: "",
      health: 100,
      head,
      body: [head, neck],
      latency: "0",
      shout: "",
      length: 2,
      squad: "",
    };
  };
  it("Works for up", () => {
    const snake = createBattleSnake({ x: 0, y: 1 }, { x: 0, y: 0 });
    expect(getSnakeDirection(snake)).toEqual("up");
  });
  it("Works for down", () => {
    const snake = createBattleSnake({ x: 0, y: 0 }, { x: 0, y: 1 });
    expect(getSnakeDirection(snake)).toEqual("down");
  });
  it("Works for left", () => {
    const snake = createBattleSnake({ x: 0, y: 0 }, { x: 1, y: 0 });
    expect(getSnakeDirection(snake)).toEqual("left");
  });
  it("Works for right", () => {
    const snake = createBattleSnake({ x: 1, y: 0 }, { x: 0, y: 0 });
    expect(getSnakeDirection(snake)).toEqual("right");
  });
});

describe("Removing directions", () => {
  it("works", () => {
    const dirs: Direction[] = ["down"];
    expect(removeDirection("down")(dirs)).toEqual([]);

    const allDirs: Direction[] = ["up", "down", "left", "right"];
    expect(removeDirection("up")(allDirs)).toEqual(removeUp(allDirs));
    expect(removeDirection("down")(allDirs)).toEqual(removeDown(allDirs));
    expect(removeDirection("left")(allDirs)).toEqual(removeLeft(allDirs));
    expect(removeDirection("right")(allDirs)).toEqual(removeRight(allDirs));
  });

  it("removeRight works", () => {
    const dirs: Direction[] = ["right"];
    expect(removeRight(dirs)).toEqual([]);
  });
  it("removeLeft works", () => {
    const dirs: Direction[] = ["left"];
    expect(removeLeft(dirs)).toEqual([]);
  });
  it("removeUp works", () => {
    const dirs: Direction[] = ["up"];
    expect(removeUp(dirs)).toEqual([]);
  });
  it("removeDown works", () => {
    const dirs: Direction[] = ["down"];
    expect(removeDown(dirs)).toEqual([]);
  });
});

describe("moving in a direction", () => {
  const position: Coord = { x: 2, y: 2 };

  it("works", () => {
    expect(moveDir(position, "up").y).toEqual(3);
    expect(moveDir(position, "down").y).toEqual(1);

    expect(moveDir(position, "right").x).toEqual(3);
    expect(moveDir(position, "left").x).toEqual(1);
  });
});

describe("Contains", () => {
  it("works", () => {
    const needle: Coord = { x: 2, y: 3 };
    const straw: Coord = { x: 1, y: 3 };

    expect(contains([needle, straw], needle)).toEqual(true);
    expect(contains([straw], needle)).toEqual(false);
  });
});
