import {
  InfoResponse,
  GameState,
  MoveResponse,
  Coord,
  Direction,
} from "./types";
import {
  contains,
  getSnakeDirection,
  moveDir,
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

const containsSnake = (pos: Coord, gameState: GameState): boolean => {
  const dangerousSpots: Coord[] = gameState.board.snakes.flatMap(
    (snake) => snake.body
  );
  return !!dangerousSpots.find((c) => c.x === pos.x && c.y === pos.y);
};

const containsFood = (pos: Coord, gameState: GameState): boolean => {
  const food: Coord[] = gameState.board.food;
  return !!food.find((c) => c.x === pos.x && c.y === pos.y);
};

const outsideBoard = (pos: Coord, gameState: GameState) => {
  const width = gameState.board.width - 1;
  const height = gameState.board.height - 1;
  return pos.x < 0 || pos.x > width || pos.y < 0 || pos.y > height;
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

const getOpenNeighbours = (
  pos: Coord,
  visitedCoords: Coord[],
  gameState: GameState
): Coord[] => {
  const neighbours = [
    moveDir(pos, "up"),
    moveDir(pos, "down"),
    moveDir(pos, "left"),
    moveDir(pos, "right"),
  ];

  return neighbours
    .filter(
      (pos) => !outsideBoard(pos, gameState) && !containsSnake(pos, gameState)
    )
    .filter((p) => !visitedCoords.find((vc) => vc.x === p.x && vc.y === p.y));
};

const getFloodNeighbours = (
  pos: Coord,
  visitedCoords: Coord[],
  gameState: GameState
): Coord[] => {
  const directNeighbours = getOpenNeighbours(pos, visitedCoords, gameState);
  let allNeighbours = [...directNeighbours];

  for (const n of directNeighbours) {
    allNeighbours = [
      ...new Set([
        ...allNeighbours,
        ...getFloodNeighbours(
          n,
          [
            ...new Set([
              ...allNeighbours,
              ...visitedCoords,
              ...directNeighbours,
            ]),
          ],
          gameState
        ),
      ]),
    ];
  }
  return allNeighbours;
};

export const floodFill = (pos: Coord, gameState: GameState): number => {
  const allNeighbours = getFloodNeighbours(pos, [pos], gameState);
  return allNeighbours.length + 1;
};

const scoreDirection = (
  pos: Coord,
  direction: Direction,
  gameState: GameState
) => {
  const distanceLength = 2;
  const healthMultiplier = gameState.you.health / 100;
  const needsFood = gameState.you.health <= 20;
  const foodScore = Math.ceil(1 / healthMultiplier);
  // const outsideScore = -1;
  const snakeScore = -3;

  let positions = [];
  const move = moveDir(pos, direction);
  for (let w = 0; w < 1; w++) {
    for (let l = 1; l <= distanceLength; l++) {
      switch (direction) {
        case "up":
          positions.push({ x: move.x + w, y: move.y + l });
          break;
        case "down":
          positions.push({ x: move.x + w, y: move.y - l });
          break;
        case "right":
          positions.push({ x: move.x + l, y: move.y + w });
          break;
        case "left":
          positions.push({ x: move.x - l, y: move.y + w });
          break;
      }
    }
  }
  const scores: number[] = positions.map((pos) => {
    let score = 0;
    if (containsSnake(pos, gameState)) {
      score += snakeScore;
    }
    if (containsFood(pos, gameState)) {
      score += foodScore;
    }
    if (contains(getLikelyNextSnakePositions(pos, gameState), pos)) {
      score -= -5;
    }
    if (needsFood) {
      const foodDist = distanceToFood(pos, gameState);
      const foodScore = 100 - foodDist;
      score += foodScore;
    }
    return score;
  });
  return scores.reduce((acc, num) => acc + num, 0);
};

const getLikelyNextSnakePositions = (
  myHead: Coord,
  gameState: GameState
): Coord[] => {
  const snakeHeads: Coord[] = gameState.board.snakes
    .filter((snake) => snake.id !== gameState.you.id)
    .flatMap((snake) => snake.head);

  const dangerousTiles: Coord[] = snakeHeads.flatMap((head) =>
    getOpenNeighbours(head, [], gameState)
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
  const isHungry = me.health <= 100;
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
  // Avoid going in front of other snakes
  possibleMoves.forEach((dir) => {
    const posAfterMove = moveDir(myHead, dir);
    const dangerousTiles = gameState.board.snakes
      .filter((snake) => snake.id !== gameState.you.id)
      .flatMap((snake) => ({
        head: snake.head,
        direction: getSnakeDirection(snake),
      }))
      .flatMap((snakeInfo) => [moveDir(snakeInfo.head, snakeInfo.direction)]);
    if (
      dangerousTiles.find(
        (t) => t.x === posAfterMove.x && t.y === posAfterMove.y
      ) &&
      possibleMoves.length > 1
    ) {
      possibleMoves = removeDirection(dir)(possibleMoves);
    }
  });

  // get position the move would place us at, if that is food, remove the direction, unless hungry
  possibleMoves.forEach((dir) => {
    const posAfterMove = moveDir(myHead, dir);
    if (
      containsFood(posAfterMove, gameState) &&
      !isHungry &&
      possibleMoves.length > 1
    ) {
      possibleMoves = removeDirection(dir)(possibleMoves);
    }
  });

  const scores = possibleMoves
    .map((dir) => {
      const score = scoreDirection(myHead, dir, gameState);
      const floodFillScore = floodFill(moveDir(myHead, dir), gameState);
      return {
        dir,
        score,
        floodFillScore,
        combinedScore: score + floodFillScore,
      };
    })
    .sort((a, b) => b.combinedScore - a.combinedScore);

  console.log(scores);

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
