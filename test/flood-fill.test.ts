import {createBattlesnake, createGameState} from "./utils";
import {floodFill } from '../src/flood-fill';

describe("Flood fill", () => {
  it("calculates score correctly", () => {
    const me = createBattlesnake("me", [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 0 },
    ]);
    const gameState = createGameState(me, [], [me]);

    const calculatedScore =
      gameState.board.width * gameState.board.height - me.length;
    expect(floodFill({ x: 0, y: 0 }, gameState)).toEqual(calculatedScore);
  });

  it("calculates score correctly 2", () => {
    const me = createBattlesnake("me", [
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
      { x: 1, y: 0 },
    ]);
    const gameState = createGameState(me, [], [me]);

    const calculatedScore =
      gameState.board.width * gameState.board.height - me.length;
    expect(floodFill({ x: 0, y: 1 }, gameState)).toEqual(calculatedScore);
  });

  it("calculates score correctly 3", () => {
    const me = createBattlesnake("me", [
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
      { x: 1, y: 0 },
    ]);
    const gameState = createGameState(me, [], [me]);

    const calculatedScore =
      gameState.board.width * gameState.board.height - me.length;
    expect(floodFill({ x: 0, y: 3 }, gameState)).toEqual(calculatedScore);
  });

  it("Stops early if stopAfter is supplied", () => {
    const me = createBattlesnake("me", [
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
      { x: 1, y: 0 },
    ]);
    const gameState = createGameState(me, [], [me]);

    expect(floodFill({ x: 0, y: 3 }, gameState, 4)).toBeLessThan(10);
  });
});
