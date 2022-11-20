import { describe, test, expect } from "vitest";
import { createAppStore } from "./index";
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
