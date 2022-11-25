import { describe, test, expect, expectTypeOf } from "vitest";
import { AnyAction } from "redux";
import { myCombineReducers } from "./combineReducers";

type CounterState = { count: number };
function counterReducer(state: CounterState, action: AnyAction): CounterState {
  if (action.type === "add") {
    return {
      count: state.count + 1,
    };
  }
  return state;
}

type MoodState = { value: "good" | "bad" };
function moodReducer(state: MoodState, action: AnyAction): MoodState {
  if (action.type === "flip") {
    return {
      value: state.value === "good" ? "bad" : "good",
    };
  }
  return state;
}

describe("combineReducers", () => {
  test("single reducer", () => {
    type AppState = { counter: CounterState };
    const initialState: AppState = {
      counter: {
        count: 0,
      },
    };
    const appReducer = myCombineReducers<AppState>({ counter: counterReducer }, initialState);
    const result = appReducer(initialState, { type: "add" });

    expectTypeOf(result).not.toBeAny();
    expectTypeOf(result).toMatchTypeOf<AppState>();
    expect(result.counter.count).toBe(1);
  });

  test("multiple reducers", () => {
    type AppState = {
      counter: CounterState;
      mood: MoodState;
    };
    const initialState: AppState = {
      counter: { count: 0 },
      mood: { value: "good" },
    };
    const appReducer = myCombineReducers<AppState>({ counter: counterReducer, mood: moodReducer }, initialState);
    const result1 = appReducer(initialState, { type: "add" });
    const result2 = appReducer(result1, { type: "flip" });

    expectTypeOf(result2).not.toBeAny();
    expectTypeOf(result2).toMatchTypeOf<AppState>();
    expect(result2).toMatchObject({
      counter: { count: 1 },
      mood: { value: "bad" },
    });
  });
});
