import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createExtraReducers, createReducers } from "$lib";
import { createEffectInputs, createEffects, forSlice } from "../../lib/effects/createEffects";

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
      state.$$effects = [effects.fetchExternalNumber.run()];
    },
    specificNumberRequested: (state, action: PayloadAction<{ requestedNumber: number }>) => {
      state.$$effects = [effects.setSpecificNumber.run({ requestedNumber: action.payload.requestedNumber })];
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
});

const effects = createEffects(inputs, forSlice("counter"));
