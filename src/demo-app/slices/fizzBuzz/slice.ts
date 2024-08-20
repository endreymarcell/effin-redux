import { createSlice } from "@reduxjs/toolkit";
import { createExtraReducers } from "../../../lib";
import { readAppState } from "../../app";
import { calculateFizzBuzz } from "./helpers";

export type FizzBuzzValue = null | "fizz" | "buzz" | "fizzbuzz";

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
