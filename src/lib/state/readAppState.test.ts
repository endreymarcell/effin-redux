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
