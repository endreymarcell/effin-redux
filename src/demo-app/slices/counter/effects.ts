import { createEffectInputs, createEffects, forSlice } from "../../../lib";
import { counterSlice, CounterState } from "./slice";

const inputs = createEffectInputs<CounterState>()({
  startCountingInterval: async (args: {}, thunkAPI) => {
    return window.setInterval(() => thunkAPI.dispatch(counterSlice.actions.countIntervalTicked()), 1000);
  },
  stopCountingInterval: async ({ countingIntervalHandle }: { countingIntervalHandle: number }) => {
    // Counting interval handle could also be read from the state here, but there's a type error there
    // see https://github.com/endreymarcell/effin-redux/issues/2
    if (countingIntervalHandle === null) {
      throw new Error(`Stop counting requested but interval handle is undefined`);
    }
    window.clearInterval(countingIntervalHandle);
  },
  fetchExternalNumber: () => {
    return fetch("https://random-data-api.com/api/v2/users")
      .then((response) => response.json())
      .then(({ id }: { id: number }) => {
        return id;
      });
  },
  setSpecificNumber: async ({ requestedNumber }: { requestedNumber: number }) => {
    return { requestedNumber };
  },
  consoleLog: async () => console.log("Here's a random log line just to demonstrate triggering multiple effects."),
});

const testInputs = createEffectInputs<CounterState>()({
  startCountingInterval: async () => -1,
  stopCountingInterval: async () => {},
  fetchExternalNumber: async () => -2,
  setSpecificNumber: async ({ requestedNumber }: { requestedNumber: number }) => {
    return { requestedNumber };
  },
  consoleLog: async () => {},
  _isTest: async () => true,
});

const inputsForEnvironment: typeof inputs = import.meta.env.VITEST === "true" ? testInputs : inputs;

export const counterEffects = createEffects<CounterState>()(inputsForEnvironment, forSlice("counter"));
