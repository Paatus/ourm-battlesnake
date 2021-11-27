import { InfoResponse, GameState, MoveResponse, Game, Coord, Direction } from "./types"

export function info(): InfoResponse {
    console.log("INFO")
    const response: InfoResponse = {
        apiversion: "1",
        author: "",
        color: "#888888",
        head: "default",
        tail: "default"
    }
    return response
}

export function start(gameState: GameState): void {
    console.log(`${gameState.game.id} START`)
}

export function end(gameState: GameState): void {
    console.log(`${gameState.game.id} END\n`)
}

const notRight = (dir: Direction) => dir !== 'right';
const notUp = (dir: Direction) => dir !== 'up';
const notDown = (dir: Direction) => dir !== 'down';
const notLeft = (dir: Direction) => dir !== 'left';

const oppositeDirection = (dir: Direction): Direction => {
    switch(dir) {
        case 'up':
            return 'down';
        case 'down':
            return 'up'
        case 'right':
            return 'left'
        case 'left':
            return 'right'
    }
}

const hasDirection = (possibleMoves: Direction[], direction: Direction): boolean => {
    return !!possibleMoves.find(dir => dir === direction);
}

const moveDir = (startPos: Coord, direction: Direction): Coord => {
    switch(direction) {
        case 'up':
            return { ...startPos, y: startPos.y + 1 };
        case 'down':
            return { ...startPos, y: startPos.y - 1 };
        case 'right':
            return { ...startPos, x: startPos.x + 1 };
        case 'left':
            return { ...startPos, x: startPos.x - 1 };
    }
};

const getPossibleMoves = (gameState: GameState): Direction[] => {
    let possibleMoves: Direction[] = [
        "up",
        "down",
        "left",
        "right",
    ]

    const boardWidth = gameState.board.width - 1;
    const boardHeight = gameState.board.height - 1;

    // Step 0: Don't let your Battlesnake move back on it's own neck
    const myHead = gameState.you.head
    const myNeck = gameState.you.body[1]
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
    possibleMoves.forEach(dir => {
        const posAfterMove = moveDir(myHead, dir);
        const dangerousSpots: Coord[] = gameState.board.snakes.flatMap(snake => snake.body);
        if (dangerousSpots.find(c => c.x === posAfterMove.x && c.y === posAfterMove.y)) {
            possibleMoves = possibleMoves.filter(move => move !== dir)
            if (hasDirection(possibleMoves, oppositeDirection(dir))) {
                possibleMoves = [...possibleMoves, oppositeDirection(dir)];
            }
        }
    })

    console.log(possibleMoves);


    // Pad choices with desirable choices
    if (myHead.x < 2 && hasDirection(possibleMoves, 'right')) {
        possibleMoves = [...possibleMoves, 'right']
    }
    if (myHead.x > boardWidth - 2 && hasDirection(possibleMoves, 'left')) {
        possibleMoves = [...possibleMoves, 'left']
    }
    if (myHead.y < 2 && hasDirection(possibleMoves, 'up')) {
        possibleMoves = [...possibleMoves, 'up']
    }
    if (myHead.y > boardHeight - 2 && hasDirection(possibleMoves, 'down')) {
        possibleMoves = [...possibleMoves, 'down']
    }

    return possibleMoves;
};

const pickMove = (possibleMoves: Direction[]): Direction => {
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
        move: pickMove(safeMoves)
    }

    console.log(`${gameState.game.id} MOVE ${gameState.turn}: ${response.move}`)
    return response
}
