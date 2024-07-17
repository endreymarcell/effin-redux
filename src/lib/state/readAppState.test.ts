import { describe, expect, test } from "vitest";
import { createSlice } from "@reduxjs/toolkit";
import { combineSlices } from "./combineSlices";
import { configureStore } from "./appStore";
import { getHelpers } from "../helpers";

// Define app state by hand - only required for test setup
export type AppState = {
  leader: { count: number };
  follower: { leaderCount: number; leaderOriginalCount: number };
};
export const { readAppState, readOriginalAppState } = getHelpers<AppState>();

const leaderSlice = createSlice({
  name: "leader",
  initialState: { count: 0 },
  reducers: {
    increase: (state) => {
      state.count++;
    },
  },
});

const followerSlice = createSlice({
  name: "follower",
  initialState: { leaderCount: 0, leaderOriginalCount: 0 },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(leaderSlice.actions.increase, (state) => {
      const leaderCount = readAppState(state).leader.count;
      const leaderOriginalCount = readOriginalAppState(state).leader.count;
      state.leaderCount = leaderCount;
      state.leaderOriginalCount = leaderOriginalCount;
    });
  },
});

describe("reading app state in slice reducers", () => {
  test("readAppState reads the state that could already have been updated by other slices, readOriginalAppState reads the app state before any slice reducers have run", () => {
    // GIVEN
    const store = configureStore({ reducer: combineSlices([leaderSlice, followerSlice]) });
    expect(store.getState().leader.count).toBe(0);
    expect(store.getState().follower.leaderCount).toBe(0);
    expect(store.getState().follower.leaderOriginalCount).toBe(0);

    // WHEN
    store.dispatch(leaderSlice.actions.increase());

    // THEN
    expect(store.getState().leader.count).toBe(1);
    expect(store.getState().follower.leaderCount).toBe(1);
    expect(store.getState().follower.leaderOriginalCount).toBe(0);
  });
});

describe("readAppState", () => {
  const appState = {
    counter: { count: 3 },
    fizzBuzz: { value: "fizz" },
  };
  const counterSliceStateInReducer = {
    ...appState.counter,
    $$appState: appState,
  };
  const { readAppState } = getHelpers<typeof appState>();
  test("reads app state from object if it is defined", () => {
    expect(readAppState(counterSliceStateInReducer).counter).toContain({ count: 3 });
  });
  test("throws an error if app state is not defined", () => {
    const state = {};
    const helpers = getHelpers();
    expect(() => helpers.readAppState(state)).toThrowError(
      "Cannot read app state from object. Are you sure you got this directly from the reducer?",
    );
  });
  test("reads app state infinitely deep", () => {
    const firstLevelAppState = readAppState(counterSliceStateInReducer);
    expect(firstLevelAppState.fizzBuzz.value).toBe("fizz");

    const secondLevelAppState = readAppState(firstLevelAppState.fizzBuzz);
    expect(secondLevelAppState.counter.count).toBe(3);

    const thirdLevelAppState = readAppState(secondLevelAppState.counter);
    expect(thirdLevelAppState.counter.count).toBe(3);

    const fourthLevelAppState = readAppState(thirdLevelAppState.counter);
    expect(fourthLevelAppState.fizzBuzz.value).toBe("fizz");

    const fifthLevelAppState = readAppState(fourthLevelAppState.fizzBuzz);
    expect(fifthLevelAppState.counter.count).toBe(3);
  });
  test("trying to modify anything on the app state throws", () => {
    expect(() => counterSliceStateInReducer.count++).not.toThrowError();

    const appState = readAppState(counterSliceStateInReducer);
    expect(() => appState.counter.count++).toThrowError(
      "Cannot modify slice state that was acquired via readAppState.",
    );
  });
});
