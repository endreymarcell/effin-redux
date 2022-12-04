import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createExtraReducers, createReducers } from "$lib";
import { createEffectInputs, createEffects, forSlice } from "$lib/effects/createEffects";
import { addEffect } from "../app";

export type CounterState = {
  count: number;
  isCounting: boolean;
};

const initialState: CounterState = {
  count: 0,
  isCounting: false,
};

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: createReducers<CounterState>()({
    startCountingClicked: (state) => {
      state.isCounting = true;
    },
    stopCountingClicked: (state) => {
      state.isCounting = false;
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
      .addCase(effects.fetchExternalNumber.fulfilled, (state, action) => {
        state.count = action.payload.result;
      })
      .addCase(effects.setSpecificNumber.fulfilled, (state, action) => {
        state.count = action.payload.requestedNumber;
      }),
  ),
});

const inputs = createEffectInputs<CounterState>()({
  fetchExternalNumber: async () => ({ result: 99 }),
  setSpecificNumber: async ({ requestedNumber }: { requestedNumber: number }) => {
    return { requestedNumber };
  },
  consoleLog: async () => console.log("hali"),
});

const effects = createEffects(inputs, forSlice("counter"));
