import { Slice } from "@reduxjs/toolkit";

export type Flatten<Arr extends ReadonlyArray<unknown>, Result extends ReadonlyArray<unknown> = []> =
  // if Arr is empty -> return Result
  Arr extends readonly []
    ? Result
    : // if Arr is not empty -> destruct it
    Arr extends readonly [infer Head, ...infer Tail]
    ? // check if Head is an Array
      Head extends ReadonlyArray<any>
      ? // if it is -> call Flatten with flat Head and Tail
        Flatten<readonly [...Head, ...Tail], Result>
      : // otherwise call Flatten with Head without flattening
        Flatten<Tail, readonly [...Result, Head]>
    : never;

export const typedFlatten = <Elem, T extends ReadonlyArray<T | Elem>>(arr: readonly [...T]): Flatten<T> =>
  arr.reduce(
    (acc, elem) => (Array.isArray(elem) ? (typedFlatten(elem) as Flatten<T>) : ([...acc, elem] as Flatten<T>)),
    [] as Flatten<T>,
  );
