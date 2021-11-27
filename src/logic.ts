import {
  InfoResponse,
  GameState,
  MoveResponse,
  Game,
  Coord,
  Direction,
  Battlesnake,
} from "./types";

export function info(): InfoResponse {
  console.log("INFO");
  const response: InfoResponse = {
    apiversion: "1",
    author: "",
    color: "#888888",
    head: "default",
    tail: "default",
  };
  return response;
}

export function start(gameState: GameState): void {
  console.log(`${gameState.game.id} START`);
}

export function end(gameState: GameState): void {
  console.log(`${gameState.game.id} END\n`);
}

const notRight = (dir: Direction) => dir !== "right";
const notUp = (dir: Direction) => dir !== "up";
const notDown = (dir: Direction) => dir !== "down";
const notLeft = (dir: Direction) => dir !== "left";

const oppositeDirection = (dir: Direction): Direction => {
  switch (dir) {
    case "up":
      return "down";
    case "down":
      return "up";
    case "right":
      return "left";
    case "left":
      return "right";
  }
};

const hasDirection = (
  possibleMoves: Direction[],
  direction: Direction
): boolean => {
  return !!possibleMoves.find((dir) => dir === direction);
};

const moveDir = (startPos: Coord, direction: Direction): Coord => {
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
  // const positionsInsideBoard = positions.filter(
  //   (pos) => !outsideBoard(pos, gameState)
  // );
  const scores: number[] = positions.map((pos) => {
    if (containsSnake(pos, gameState)) {
      return snakeScore;
    }
    if (containsFood(pos, gameState)) {
      return foodScore;
    }
    // if (outsideBoard(pos, gameState)) {
    //   return outsideScore;
    // }
    if (needsFood) {
      const foodDist = distanceToFood(pos, gameState);
      return 100 - foodDist;
    }
    return 0;
  });
  return scores.reduce((acc, num) => acc + num, 0);
};

const getSnakeDirection = (snake: Battlesnake): Direction => {
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

const arrayMax = <T>(arr: T[], extractor: (arg: T) => number): number => {
  return arr.reduce((p, v) => {
    const value = extractor(v);
    return p > value ? p : value;
  }, -Infinity);
};

const getPossibleMoves = (gameState: GameState): Direction[] => {
  let possibleMoves: Direction[] = ["up", "down", "left", "right"];

  const boardWidth = gameState.board.width - 1;
  const boardHeight = gameState.board.height - 1;

  // Step 0: Don't let your Battlesnake move back on it's own neck
  const myHead = gameState.you.head;
  const myNeck = gameState.you.body[1];
  const isHungry = gameState.you.health <= 100;
  if (myNeck.x < myHead.x) {
    possibleMoves = possibleMoves.filter(notLeft);
  } else if (myNeck.x > myHead.x) {
    possibleMoves = possibleMoves.filter(notRight);
  } else if (myNeck.y < myHead.y) {
    possibleMoves = possibleMoves.filter(notDown);
  } else if (myNeck.y > myHead.y) {
    possibleMoves = possibleMoves.filter(notUp);
  }

  if (myHead.x === 0) {
    possibleMoves = possibleMoves.filter(notLeft);
  }
  if (myHead.x === boardWidth) {
    possibleMoves = possibleMoves.filter(notRight);
  }
  if (myHead.y === 0) {
    possibleMoves = possibleMoves.filter(notDown);
  }
  if (myHead.y === boardHeight) {
    possibleMoves = possibleMoves.filter(notUp);
  }

  // get position the move would place us at, if that is in a snake, remove the direction
  possibleMoves.forEach((dir) => {
    const posAfterMove = moveDir(myHead, dir);
    if (containsSnake(posAfterMove, gameState)) {
      possibleMoves = possibleMoves.filter((move) => move !== dir);
      // if (hasDirection(possibleMoves, oppositeDirection(dir))) {
      //   possibleMoves = [...possibleMoves, oppositeDirection(dir)];
      // }
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
      possibleMoves = possibleMoves.filter((move) => move !== dir);
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
      possibleMoves = possibleMoves.filter((move) => move !== dir);
    }
  });

  const scores = possibleMoves
    .map((dir) => {
      const score = scoreDirection(myHead, dir, gameState);
      const floodFillScore = floodFill(moveDir(myHead, dir), gameState);
      return { dir, score, floodFillScore };
    })
    .sort((a, b) => b.floodFillScore + b.score - (a.floodFillScore + a.score));

  console.log(scores);

  const bestScore = scores[0];
  const bestDirection = scores.find((i) => i.score === bestScore.score);

  if (bestDirection) {
    possibleMoves = possibleMoves.filter((dir) => dir === bestDirection.dir);
  }

  // Pad choices with desirable choices
  if (myHead.x < 2 && hasDirection(possibleMoves, "right")) {
    possibleMoves = [...possibleMoves, "right"];
  }
  if (myHead.x > boardWidth - 2 && hasDirection(possibleMoves, "left")) {
    possibleMoves = [...possibleMoves, "left"];
  }
  if (myHead.y < 2 && hasDirection(possibleMoves, "up")) {
    possibleMoves = [...possibleMoves, "up"];
  }
  if (myHead.y > boardHeight - 2 && hasDirection(possibleMoves, "down")) {
    possibleMoves = [...possibleMoves, "down"];
  }

  return possibleMoves;
};

const pickMove = (
  gameState: GameState,
  possibleMoves: Direction[]
): Direction => {
  // const ffScores = possibleMoves.map((dir) => ({
  //   floodFillScore: floodFill(moveDir(gameState.you.head, dir), gameState),
  //   dir,
  // }));
  // return ffScores.reduce<{ floodFillScore: number; dir: Direction }>(
  //   (acc, v) => (v.floodFillScore > acc.floodFillScore ? v : acc),
  //   { floodFillScore: -1, dir: "up" }
  // ).dir;
  return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
};

export function move(gameState: GameState): MoveResponse {
  const safeMoves = getPossibleMoves(gameState);

  // TODO: Step 1 - Don't hit walls.
  // Use information in gameState to prevent your Battlesnake from moving beyond the boundaries of the board.
  // const boardWidth = gameState.board.width
  // const boardHeight = gameState.board.height

  // TODO: Step 2 - Don't hit yourself.
  // Use information in gameState to prevent your Battlesnake from colliding with itself.
  // const mybody = gameState.you.body

  // TODO: Step 3 - Don't collide with others.
  // Use information in gameState to prevent your Battlesnake from colliding with others.

  // TODO: Step 4 - Find food.
  // Use information in gameState to seek out and find food.

  // Finally, choose a move from the available safe moves.
  // TODO: Step 5 - Select a move to make based on strategy, rather than random.
  const response: MoveResponse = {
    move: pickMove(gameState, safeMoves),
  };

  console.log(`${gameState.game.id} MOVE ${gameState.turn}: ${response.move}`);
  return response;
}
