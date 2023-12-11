import { describe, expect, test, vi } from "vitest";
import { createAppStore } from "../../demo-app/app";
import { counterEffects, counterSlice } from "../../demo-app/slices/counter";
import { createAsyncThunk } from "@reduxjs/toolkit";

describe("replaceEffect", () => {
  test("replace original effect", async () => {
    const store = createAppStore();

    const replacement = vi.fn();
    store.testUtils.replaceEffect(counterEffects.fetchExternalNumber, () => replacement());

    store.dispatch(counterSlice.actions.externalNumberRequested());
    await new Promise(process.nextTick);
    expect(replacement).toHaveBeenCalled();
  });

  test("unregistered effect", async () => {
    const store = createAppStore();

    const fakeEffect = createAsyncThunk("fakeEffect", vi.fn());
    const run = () => store.testUtils.replaceEffect(fakeEffect, vi.fn());
    expect(run).toThrow("not found in the provided object");
  });
});
