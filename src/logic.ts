import { clamp, equals } from "ramda";
import { floodFill } from "./flood-fill";
import {
  InfoResponse,
  GameState,
  MoveResponse,
  Coord,
  Direction,
  Battlesnake,
} from "./types";
import {
  contains,
  getSnakeDirection,
  isOuterEdge,
  map,
  moveDir,
  outsideBoard,
  removeDirection,
  removeDown,
  removeLeft,
  removeRight,
  removeUp,
} from "./utils";

export function info(): InfoResponse {
  console.log("INFO");
  const response: InfoResponse = {
    apiversion: "1",
    author: "",
    color: "#2bbfd6",
    head: "beluga",
    tail: "fat-rattle",
  };
  return response;
}

export function start(gameState: GameState): void {
  console.log(`${gameState.game.id} START`);
}

export function end(gameState: GameState): void {
  console.log(`${gameState.game.id} END\n`);
}

export const dangerSnakeHeads = (gameState: GameState): Coord[] => {
  return gameState.board.snakes
    .filter((snake) => snake.length >= gameState.you.length)
    .map((snake) => snake.head);
};

export const snakeTargets = (gameState: GameState): Coord[] => {
  return gameState.board.snakes
    .filter((snake) => snake.length < gameState.you.length)
    .map((snake) => snake.head);
};

export const containsSnake = (pos: Coord, gameState: GameState): boolean => {
  const worseSnekHeads = snakeTargets(gameState);
  const snakeCoords: Coord[] = gameState.board.snakes
    .flatMap((snake) =>
      // remove tail from snakes body, as tail will be empty next turn
      snake.body.slice(0, -1)
    )
    .filter((pos) => !contains(worseSnekHeads, pos));
  return contains(snakeCoords, pos);
};

const containsFood = (pos: Coord, gameState: GameState): boolean => {
  const food: Coord[] = gameState.board.food;
  return !!food.find((c) => c.x === pos.x && c.y === pos.y);
};

const distance = (pos1: Coord, pos2: Coord) => {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
};

export const distanceToFood = (pos: Coord, gameState: GameState) => {
  const food = gameState.board.food;

  const distances = food.map((f) => distance(pos, f));
  return distances.reduce((p, value) => {
    return p < value ? p : value;
  }, Infinity);
};

export const getOpenNeighbours = (
  pos: Coord,
  gameState: GameState,
  visitedCoords: Coord[] = []
): Coord[] => {
  const neighbours = [
    moveDir(pos, "up"),
    moveDir(pos, "down"),
    moveDir(pos, "left"),
    moveDir(pos, "right"),
  ];

  return neighbours
    .filter((p) => !contains(visitedCoords, p))
    .filter(
      (pos) => !outsideBoard(pos, gameState) && !containsSnake(pos, gameState)
    );
};

const getExtraDangerousSpots = (gameState: GameState): Coord[] => {
  const me = gameState.you;
  const dangerousSnakes = gameState.board.snakes
    .filter((snake) => snake.id !== me.id)
    .filter((snake) => snake.length >= me.length);
  return dangerousSnakes.map((snake) => {
    const direction = getSnakeDirection(snake);
    return moveDir(snake.head, direction);
  });
};

export const scoreDirection = (
  head: Coord,
  direction: Direction,
  gameState: GameState
) => {
  const distanceLength = 2;
  const needsFood = gameState.you.health <= 20;
  const foodScore = map(gameState.you.health, 0, 100, 3, -1);
  const snakeScore = -5;
  const dangerousPositionScore = -4;
  const killScore = 2;

  const move = moveDir(head, direction);
  let positions = [move];
  for (let l = 1; l <= distanceLength - 1; l++) {
    switch (direction) {
      case "up":
        positions.push({ x: move.x, y: move.y + l });
        break;
      case "down":
        positions.push({ x: move.x, y: move.y - l });
        break;
      case "right":
        positions.push({ x: move.x + l, y: move.y });
        break;
      case "left":
        positions.push({ x: move.x - l, y: move.y });
        break;
    }
  }
  const scores: number[] = positions.map((pos) => {
    let score = 0;
    const isSnake = containsSnake(pos, gameState);
    const isDangerous = contains(
      getDangerousSnakesNextPositions(gameState),
      pos
    );
    const isKillable = contains(getWorseSnakesNextPositions(gameState), pos);
    const isFood = containsFood(pos, gameState);
    const isNextMove = equals(pos, move);
    const isExtraDangerous = contains(getExtraDangerousSpots(gameState), pos);
    if (isNextMove && isKillable) {
      score += killScore;
    }
    if (isSnake) {
      score += snakeScore;
    }
    if (isDangerous) {
      score += dangerousPositionScore;
    }
    if (isExtraDangerous) {
      score += dangerousPositionScore / 2;
    }
    if (isFood) {
      score += foodScore;
    }
    // Only if the edge is the next in that direction, apply negative score
    if (isNextMove && isOuterEdge(pos, gameState)) {
      score += -1;
    }
    if (needsFood) {
      const foodDist = distanceToFood(pos, gameState);
      const maxDist = distance(
        { x: 0, y: 0 },
        { x: gameState.board.width - 1, y: gameState.board.height - 1 }
      );
      const foodDistanceScore = map(foodDist, 0, maxDist, 3.5, 0);
      score += foodDistanceScore;
    }
    return score;
  });
  return scores.reduce((acc, num) => acc + num, 0);
};

const getWorseSnakesNextPositions = (gameState: GameState): Coord[] => {
  const snakeHeads: Coord[] = snakeTargets(gameState);

  const opportunityTiles: Coord[] = snakeHeads.flatMap((head) =>
    getOpenNeighbours(head, gameState)
  );
  return opportunityTiles;
};

const getDangerousSnakesNextPositions = (gameState: GameState): Coord[] => {
  const snakeHeads: Coord[] = gameState.board.snakes
    .filter((snake) => snake.id !== gameState.you.id)
    .flatMap((snake) => snake.head)
    .filter((head) => !contains(snakeTargets(gameState), head));

  const dangerousTiles: Coord[] = snakeHeads.flatMap((head) =>
    getOpenNeighbours(head, gameState)
  );
  return dangerousTiles;
};

const getBestMove = (gameState: GameState): Direction => {
  let possibleMoves: Direction[] = ["up", "down", "left", "right"];

  const boardWidth = gameState.board.width - 1;
  const boardHeight = gameState.board.height - 1;

  // Step 0: Don't let your Battlesnake move back on it's own neck
  const me = gameState.you;
  const myHead = me.head;
  switch (getSnakeDirection(me)) {
    case "up":
      possibleMoves = removeDown(possibleMoves);
      break;
    case "down":
      possibleMoves = removeUp(possibleMoves);
      break;
    case "right":
      possibleMoves = removeLeft(possibleMoves);
      break;
    case "left":
      possibleMoves = removeRight(possibleMoves);
      break;
  }

  if (myHead.x === 0) {
    possibleMoves = removeLeft(possibleMoves);
  }
  if (myHead.x === boardWidth) {
    possibleMoves = removeRight(possibleMoves);
  }
  if (myHead.y === 0) {
    possibleMoves = removeDown(possibleMoves);
  }
  if (myHead.y === boardHeight) {
    possibleMoves = removeUp(possibleMoves);
  }

  // get position the move would place us at, if that is in a snake, remove the direction
  possibleMoves.forEach((dir) => {
    const posAfterMove = moveDir(myHead, dir);
    if (containsSnake(posAfterMove, gameState)) {
      possibleMoves = removeDirection(dir)(possibleMoves);
    }
  });

  const scores = possibleMoves
    .map((dir) => {
      const unsafeFFScore = gameState.you.length * 1.5;
      const score = scoreDirection(myHead, dir, gameState);
      const floodFillValue = floodFill(
        moveDir(myHead, dir),
        gameState,
        unsafeFFScore
      );
      const floodFillScore = clamp(0, gameState.you.length, floodFillValue);
      let combinedScore = score + floodFillScore;
      if (floodFillValue < unsafeFFScore) {
        combinedScore -= 5;
      }
      console.log(dir, { combinedScore, score });
      return {
        dir,
        score,
        floodFillScore,
        combinedScore,
      };
    })
    .sort((a, b) => b.combinedScore - a.combinedScore);

  const bestScore = scores[0];
  const choices = scores
    .filter((i) => i.combinedScore === bestScore.combinedScore)
    .sort((a, b) => b.floodFillScore - a.floodFillScore);

  return choices[0].dir;
};

export function move(gameState: GameState): MoveResponse {
  const bestMove = getBestMove(gameState);

  const response: MoveResponse = {
    move: bestMove,
  };

  console.log(`${gameState.game.id} MOVE ${gameState.turn}: ${response.move}`);
  return response;
}
