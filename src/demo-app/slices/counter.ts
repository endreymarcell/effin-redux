import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createExtraReducers, createReducers, createEffectInputs, createEffects, forSlice } from "../../lib";
import { addEffect } from "../app";

export type CounterState = {
  count: number;
  isCounting: boolean;
  _countingIntervalHandle: number | null;
  isWaitingForExternalNumber: boolean;
};

const initialState: CounterState = {
  count: 0,
  isCounting: false,
  _countingIntervalHandle: null,
  isWaitingForExternalNumber: false,
};

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: createReducers<CounterState>()({
    startCountingClicked: (state) => {
      addEffect(state, effects.startCountingInterval());
    },
    stopCountingClicked: (state) => {
      if (state._countingIntervalHandle === null) {
        throw new Error(`Stop counting requested but counting is off already`);
      }
      addEffect(state, effects.stopCountingInterval({ countingIntervalHandle: state._countingIntervalHandle }));
    },
    countIntervalTicked: (state) => {
      state.count++;
    },
    increaseCountClicked: (state) => {
      state.count++;
    },
    resetCountClicked: (state) => {
      state.count = initialState.count;
    },
    externalNumberRequested: (state) => {
      addEffect(state, effects.fetchExternalNumber());
      addEffect(state, effects.consoleLog());
    },
    specificNumberRequested: (state, action: PayloadAction<{ requestedNumber: number }>) => {
      addEffect(state, effects.setSpecificNumber({ requestedNumber: action.payload.requestedNumber }));
    },
  }),
  extraReducers: createExtraReducers<CounterState>((builder) =>
    builder
      .addCase(effects.startCountingInterval.fulfilled, (state, action) => {
        state.isCounting = true;
        state._countingIntervalHandle = action.payload;
      })
      .addCase(effects.stopCountingInterval.fulfilled, (state) => {
        state.isCounting = false;
      })
      .addCase(effects.fetchExternalNumber.pending, (state) => {
        state.isWaitingForExternalNumber = true;
      })
      .addCase(effects.fetchExternalNumber.fulfilled, (state, action) => {
        state.isWaitingForExternalNumber = false;
        state.count = action.payload;
      })
      .addCase(effects.setSpecificNumber.fulfilled, (state, action) => {
        state.count = action.payload.requestedNumber;
      }),
  ),
});

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
    const shouldFail = Math.round(Math.random()) === 1;

    if (shouldFail) {
      return fetch("https://httpstat.us/401")
        .then(() => {})
        .catch((error) => console.error(error));
    }

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

const effects = createEffects<CounterState>()(inputsForEnvironment, forSlice("counter"));
