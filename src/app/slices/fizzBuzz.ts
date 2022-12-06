import { createSlice } from "@reduxjs/toolkit";
import { counterSlice } from "./counter";
import { createExtraReducers } from "$lib";
import { readAppState } from "../app";

type FizzBuzzValue = null | "fizz" | "buzz" | "fizzbuzz";

export type FizzBuzzState = {
  value: FizzBuzzValue;
};

const initialState: FizzBuzzState = {
  value: null,
};

export const fizzBuzzSlice = createSlice({
  name: "fizzBuzz",
  initialState,
  reducers: {},
  extraReducers: createExtraReducers((builder) => {
    builder.addMatcher(
      (action) => action.type.startsWith("counter"),
      (state) => {
        const currentNumber = readAppState(state).counter.count;
        state.value = calculateFizzBuzz(currentNumber);
      },
    );
  }),
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
