import {getOpenNeighbours} from "./logic";
import {Coord, GameState} from "./types";

const getFloodNeighbours = (
  pos: Coord,
  gameState: GameState,
  visitedCoords: Coord[] = [],
  stopAfter: number = Infinity
): Coord[] => {
  const directNeighbours = getOpenNeighbours(pos, gameState, visitedCoords);
  let allNeighbours = [...directNeighbours];

  if (visitedCoords.length >= stopAfter) {
      return allNeighbours;
  }
  for (const n of directNeighbours) {
    allNeighbours = [
      ...new Set([
        ...allNeighbours,
        ...getFloodNeighbours(
          n,
          gameState,
          [
            ...new Set([
              ...allNeighbours,
              ...visitedCoords,
              ...directNeighbours,
            ]),
          ],
          stopAfter
        ),
      ]),
    ];
  }
  return allNeighbours;
};

export const floodFill = (pos: Coord, gameState: GameState, stopAfter: number = Infinity): number => {
  const allNeighbours = getFloodNeighbours(pos, gameState, [pos], stopAfter);
  return allNeighbours.length;
};
