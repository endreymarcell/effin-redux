import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createExtraReducers, createReducers } from "../../../lib";
import { addEffect } from "../../app";
import { counterEffects } from "./effects";

export type CounterState = {
  count: number;
  isCounting: boolean;
  _countingIntervalHandle: number | null;
  externalErrorFetchingState: "initial" | "pending" | "fulfilled" | "rejected";
};

const initialState: CounterState = {
  count: 0,
  isCounting: false,
  _countingIntervalHandle: null,
  externalErrorFetchingState: "initial",
};

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: createReducers<CounterState>()({
    startCountingClicked: (state) => {
      addEffect(state, counterEffects.startCountingInterval());
    },
    stopCountingClicked: (state) => {
      if (state._countingIntervalHandle === null) {
        throw new Error(`Stop counting requested but counting is off already`);
      }
      addEffect(state, counterEffects.stopCountingInterval({ countingIntervalHandle: state._countingIntervalHandle }));
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
      addEffect(state, counterEffects.fetchExternalNumber());
      addEffect(state, counterEffects.consoleLog());
    },
    specificNumberRequested: (state, action: PayloadAction<{ requestedNumber: number }>) => {
      addEffect(state, counterEffects.setSpecificNumber({ requestedNumber: action.payload.requestedNumber }));
    },
  }),
  extraReducers: createExtraReducers<CounterState>((builder) =>
    builder
      .addCase(counterEffects.startCountingInterval.fulfilled, (state, action) => {
        state.isCounting = true;
        state._countingIntervalHandle = action.payload;
      })
      .addCase(counterEffects.stopCountingInterval.fulfilled, (state) => {
        state.isCounting = false;
      })
      .addCase(counterEffects.fetchExternalNumber.pending, (state) => {
        state.externalErrorFetchingState = "pending";
      })
      .addCase(counterEffects.fetchExternalNumber.fulfilled, (state, action) => {
        state.externalErrorFetchingState = "fulfilled";
        state.count = action.payload;
      })
      .addCase(counterEffects.fetchExternalNumber.rejected, (state) => {
        state.externalErrorFetchingState = "rejected";
      })
      .addCase(counterEffects.setSpecificNumber.fulfilled, (state, action) => {
        state.count = action.payload.requestedNumber;
      }),
  ),
});
