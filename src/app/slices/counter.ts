import { createSlice } from "@reduxjs/toolkit";
import { createReducers } from "$lib";

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
  }),
});
