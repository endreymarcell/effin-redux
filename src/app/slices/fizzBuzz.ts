import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
  reducers: {
    numberChanged: (state, action: PayloadAction<{ numberValue: number }>) => {
      state.value = calculateFizzBuzz(action.payload.numberValue);
    },
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
