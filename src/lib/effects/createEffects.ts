import mapValues from "lodash/mapValues";
import { AsyncThunk } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { BaseThunkAPI } from "@reduxjs/toolkit/dist/createAsyncThunk";
import { EffectIdentifier, thunkLookupTable } from "./thunkLookupTable";

type EffectFunction<EffectArgs extends object, EffectReturn> = (args?: EffectArgs) => Promise<EffectReturn>;

function createEffect<SliceName extends string, EffectName extends string, EffectArgs extends object, EffectReturn>(
  sliceName: SliceName,
  effectName: EffectName,
  effectFunction: EffectFunction<EffectArgs, EffectReturn>,
) {
  const effectIdentifier: EffectIdentifier = `${sliceName}/${effectName}`;
  const simpleThunk = createAsyncThunk(effectIdentifier, effectFunction);
  thunkLookupTable.set(effectIdentifier, simpleThunk);

  const serializer = (args?: EffectArgs) => ({ sliceName, effectName, args });

  const returnValue = function (args: EffectArgs) {
    // @ts-ignore
    if (this === undefined) {
      // Effect is being called from the effect executor internals, we need the actual thunk
      return simpleThunk(args);
    } else {
      // Effect is being called by us in the reducer, we need the serialized version
      return serializer(args);
    }
  };

  returnValue.pending = simpleThunk.pending;
  returnValue.fulfilled = simpleThunk.fulfilled;
  returnValue.rejected = simpleThunk.rejected;

  return returnValue;
}

type SingleEffectCreator<State> = (arg: any, thunkApi: BaseThunkAPI<State, any>) => any;
type AllEffectCreators<State> = { [key: string]: SingleEffectCreator<State> };
// This helper returns its input unchanged. However, due to its type signature,
// it ensures that you get the correct types for the thunkAPI argument in your input.
export const createEffectInputs =
  <State extends object>() =>
  <T extends AllEffectCreators<State>>(t: T): T =>
    t;

type FirstArgumentOf<T> = T extends (firstArgument: infer U) => any ? U : never;

export const createEffects = <State extends object, Inputs extends AllEffectCreators<State>>(
  inputs: Inputs,
  mapper: ReturnType<typeof forSlice>,
): {
  [Key in keyof Inputs]: AsyncThunk<Awaited<ReturnType<Inputs[Key]>>, any, any> &
    ((arg?: FirstArgumentOf<Inputs[Key]>) => { sliceName: string; effectName: string; args: Parameters<Inputs[Key]> });
} => mapValues<Inputs, typeof forSlice>(inputs, mapper as any) as any;

// Returns 'createEffect' with the sliceName argument fixed so you don't have to keep passing it
export function forSlice<SliceName extends string>(sliceName: SliceName) {
  return <EffectName extends string, EffectArgs extends object, EffectReturn>(
    effectFunction: EffectFunction<EffectArgs, EffectReturn>,
    effectName: EffectName,
  ) => createEffect<SliceName, EffectName, EffectArgs, EffectReturn>(sliceName, effectName, effectFunction);
}
