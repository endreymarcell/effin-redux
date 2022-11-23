import { createSlice } from "@reduxjs/toolkit";
import { counterSlice } from "./counter";
import { AppState } from "../index";

type FizzBuzzValue = null | "fizz" | "buzz" | "fizzbuzz";

export type FizzBuzzState = {
  value: FizzBuzzValue;
};

const initialState: FizzBuzzState = {
  value: null,
};

type HasAppState = {
  $$appState: AppState;
};

export const fizzBuzzSlice = createSlice({
  name: "fizzBuzz",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(counterSlice.actions.increaseCountClicked, (state) => {
      const currentNumber = (state as unknown as HasAppState).$$appState.counter.count;
      state.value = calculateFizzBuzz(currentNumber);
    });
  },
});

function calculateFizzBuzz(input: number): FizzBuzzValue {
  const isFizz = input % 3 === 0;
  const isBuzz = input % 5 === 0;
  if (isFizz && isBuzz) {
    return "fizzbuzz";
  } else if (isFizz) {
    return "fizz";
  } else if (isBuzz) {
    return "buzz";
  } else {
    return null;
  }
}
