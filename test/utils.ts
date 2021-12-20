import {Battlesnake, Coord, GameState} from "../src/types";

export const createGameState = (
  me: Battlesnake,
  food: Coord[],
  snakes: Battlesnake[]
): GameState => {
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
      height: 11,
      width: 11,
      food,
      snakes,
      hazards: [],
    },
    you: me,
  };
}

export const createBattlesnake = (
  id: string,
  body: Coord[],
  health: number = 100
): Battlesnake => {
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

