import { describe, test, expect } from "vitest";
import { createAppStore } from "./app";
import { counterSlice } from "./slices/counter";
import { infoSlice } from "./slices/info";

describe("app with combined slices", () => {
  test("actions work as expected", () => {
    const store = createAppStore();
    expect(store.getState().counter.count).toBe(0);
    expect(store.getState().info.appStatus.type).toBe("good");

    store.dispatch(counterSlice.actions.startCountingClicked());
    store.dispatch(counterSlice.actions.increaseCountClicked());
    const error = "I'm a teapot";
    store.dispatch(infoSlice.actions.gotBadNews({ error }));
    expect(store.getState().counter.count).toBe(1);
    expect(store.getState().info.appStatus).toMatchObject({ type: "bad", error });
  });
});

describe("app with nested slices", () => {
  test("layer can read state of those before", () => {
    const store = createAppStore();
    expect(store.getState().counter.count).toBe(0);

    store.dispatch(counterSlice.actions.startCountingClicked());
    store.dispatch(counterSlice.actions.increaseCountClicked());
    expect(store.getState().counter.count).toBe(1);
    expect(store.getState().fizzBuzz.value).toBe(null);

    store.dispatch(counterSlice.actions.increaseCountClicked());
    expect(store.getState().counter.count).toBe(2);
    expect(store.getState().fizzBuzz.value).toBe(null);

    store.dispatch(counterSlice.actions.increaseCountClicked());
    expect(store.getState().counter.count).toBe(3);
    expect(store.getState().fizzBuzz.value).toBe("fizz");

    store.dispatch(counterSlice.actions.increaseCountClicked());
    expect(store.getState().counter.count).toBe(4);
    expect(store.getState().fizzBuzz.value).toBe(null);

    store.dispatch(counterSlice.actions.increaseCountClicked());
    expect(store.getState().counter.count).toBe(5);
    expect(store.getState().fizzBuzz.value).toBe("buzz");
  });
});
