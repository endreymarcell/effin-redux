import { describe, expect, test, vi } from "vitest";
import { createAppStore } from "../../demo-app/app";
import { counterEffects, counterSlice } from "../../demo-app/slices/counter";
import { createAsyncThunk } from "@reduxjs/toolkit";

describe("replaceEffect", () => {
  test("unregistered effect", async () => {
    const store = createAppStore();

    const fakeEffect = createAsyncThunk("fakeEffect", vi.fn());
    const run = () => store.testUtils.replaceEffect(fakeEffect, vi.fn());
    expect(run).toThrow("not found in the provided object");
  });

  test("replacement is called when effect is triggered", async () => {
    const store = createAppStore();

    const replacement = vi.fn();
    store.testUtils.replaceEffect(counterEffects.fetchExternalNumber, replacement);

    store.dispatch(counterSlice.actions.externalNumberRequested());
    await new Promise(process.nextTick);
    expect(replacement).toHaveBeenCalled();
  });

  test("replaced effect resolves with different value", async () => {
    const store = createAppStore();
    expect(store.getState().counter.count).toBe(0);

    const replacement = vi.fn(async () => -100);
    store.testUtils.replaceEffect(counterEffects.fetchExternalNumber, replacement);

    store.dispatch(counterSlice.actions.externalNumberRequested());
    await new Promise(process.nextTick);
    expect(store.getState().counter.count).toBe(-100);
  });

  test("replaced effect rejects rather than resolves", async () => {
    const store = createAppStore();

    const replacement = vi.fn(() => {
      throw new Error("test error");
    });
    store.testUtils.replaceEffect(counterEffects.fetchExternalNumber, replacement);

    store.dispatch(counterSlice.actions.externalNumberRequested());
    await new Promise(process.nextTick);
    expect(store.getState().counter.externalErrorFetchingState).toBe("rejected");
  });

  test("replace effect, then restore it", async () => {
    const store = createAppStore();

    const replacement = vi.fn(async () => -100);
    store.testUtils.replaceEffect(counterEffects.fetchExternalNumber, replacement);

    store.dispatch(counterSlice.actions.externalNumberRequested());
    await new Promise(process.nextTick);
    expect(store.getState().counter.count).toBe(-100);

    store.testUtils.restoreEffect(counterEffects.fetchExternalNumber);
    store.dispatch(counterSlice.actions.externalNumberRequested());
    await new Promise(process.nextTick);
    expect(store.getState().counter.count).toBe(-2);
  });
});
