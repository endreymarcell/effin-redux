import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createExtraReducers, createReducers } from "$lib";
import { createEffectInputs, createEffects, forSlice } from "$lib/effects/createEffects";
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
      addEffect(state, effects.stopCountingInterval());
    },
    countIntervalTicked: (state) => {
      state.count++;
    },
    increaseCountClicked: (state) => {
      if (state.isCounting) {
        state.count++;
      }
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
  startCountingInterval: async (_unused, thunkAPI) =>
    setInterval(() => thunkAPI.dispatch(counterSlice.actions.countIntervalTicked()), 1000),
  stopCountingInterval: async (_unused, thunkAPI) => {
    const countingIntervalHandle = thunkAPI.getState().counter._countingIntervalHandle;
    if (countingIntervalHandle === null) {
      throw new Error(`Stop counting requested but interval handle is undefined`);
    }
    clearInterval(countingIntervalHandle);
  },
  fetchExternalNumber: () => {
    return fetch("https://www.randomnumberapi.com/api/v1.0/random?count=1")
      .then((response) => response.json())
      .then((parsedResponse: [number]) => {
        return parsedResponse[0];
      });
  },
  setSpecificNumber: async ({ requestedNumber }: { requestedNumber: number }) => {
    return { requestedNumber };
  },
  consoleLog: async () => console.log("Here's a random log line just to demonstrate triggering multiple effects."),
});

const effects = createEffects(inputs, forSlice("counter"));
