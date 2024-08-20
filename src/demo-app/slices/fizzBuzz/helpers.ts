import { FizzBuzzValue } from "./slice";

export function calculateFizzBuzz(input: number): FizzBuzzValue {
  if (input === 0) {
    return null;
  }

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
