import { Battlesnake, Coord, Direction } from "./types";
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

export const map = (value: number, x1: number, y1: number, x2: number, y2: number):number => (value - x1) * (y2 - x2) / (y1 - x1) + x2;
