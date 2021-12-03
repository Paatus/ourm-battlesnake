import { Battlesnake, Coord, Direction, GameState } from "./types";
import { equals, reject } from "ramda";

export const getSnakeDirection = (snake: Battlesnake): Direction => {
  const neck = snake.body[1];
  const head = snake.head;
  if (head.y > neck.y) {
    return "up";
  }
  if (head.y < neck.y) {
    return "down";
  }
  if (head.x > neck.x) {
    return "right";
  }
  return "left";
};

export const contains = <T>(haystack: T[], needle: T): boolean => {
  return !!haystack.find(equals(needle));
};

export const removeDirection = (dir: Direction) => reject(equals(dir));

export const removeRight = removeDirection("right");
export const removeLeft = removeDirection("left");
export const removeUp = removeDirection("up");
export const removeDown = removeDirection("down");

export const moveDir = (startPos: Coord, direction: Direction): Coord => {
  switch (direction) {
    case "up":
      return { ...startPos, y: startPos.y + 1 };
    case "down":
      return { ...startPos, y: startPos.y - 1 };
    case "right":
      return { ...startPos, x: startPos.x + 1 };
    case "left":
      return { ...startPos, x: startPos.x - 1 };
  }
};

export const map = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;

export const isOuterEdge = (pos: Coord, gameState: GameState): boolean => {
  return (
    pos.x === 0 ||
    pos.x === gameState.board.width - 1 ||
    pos.y === 0 ||
    pos.y === gameState.board.height - 1
  );
};
