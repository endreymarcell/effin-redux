import mapValues from "lodash/mapValues";
import { AsyncThunk, Slice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { BaseThunkAPI } from "@reduxjs/toolkit/dist/createAsyncThunk";
import { EffectIdentifier, thunkLookupTable } from "./thunkLookupTable";
import { SerializedEffect } from "./withEffects";

type EffectFunction<EffectArgs extends object, EffectReturn> = (args: EffectArgs) => Promise<EffectReturn>;

function createEffect<SliceName extends string, EffectName extends string, EffectArgs extends object, EffectReturn>(
  sliceName: SliceName,
  effectName: EffectName,
  effectFunction: EffectFunction<EffectArgs, EffectReturn>,
) {
  const effectIdentifier: EffectIdentifier = `${sliceName}/${effectName}`;
  const simpleThunk = createAsyncThunk(effectIdentifier, effectFunction);
  thunkLookupTable.set(effectIdentifier, simpleThunk);

  const serializer = (args: EffectArgs) => ({ sliceName, effectName, args });

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

type SingleEffectCreator<AppState, Arg, Return = void> = (
  arg: Arg,
  thunkApi: BaseThunkAPI<AppState, any>,
) => Return extends void ? void : Promise<Return>;
type AllEffectCreators<AppState> = { [key: string]: SingleEffectCreator<AppState, any, any> };
// This helper returns its input unchanged. However, due to its type signature,
// it ensures that you get the correct types for the thunkAPI argument in your input.
export const createEffectInputs =
  <AppState extends object>() =>
  <T extends AllEffectCreators<AppState>>(t: T): T =>
    t;

type FirstArgumentOf<T> = T extends (firstArgument: infer U, ...maybeMoreArguments: any[]) => any ? U : never;

type CreatedEffectWithArg<
  SliceName extends string,
  EffectName extends string,
  Function extends (arg: any, thunkApiArgUnusedHere?: any) => any,
> = AsyncThunk<Awaited<ReturnType<Function>>, FirstArgumentOf<Function>, any> &
  ((arg: FirstArgumentOf<Function>) => SerializedEffect<SliceName, EffectName, FirstArgumentOf<Function>>);

type CreatedEffectWithoutArg<
  SliceName extends string,
  EffectName extends string,
  Function extends (_unused: EmptyObject, thunkAPI: any) => any,
> = AsyncThunk<Awaited<ReturnType<Function>>, undefined, any> & (() => SerializedEffect<SliceName, EffectName, {}>);

type EmptyObject = {
  [Key in any]: never;
};

export const createEffects =
  <AppState extends {}>() =>
  <SliceName extends string, Inputs extends AllEffectCreators<AppState>>(
    inputs: Inputs,
    mapper: ReturnType<typeof forSlice>,
  ): {
    [Key in keyof Inputs]: Key extends string
      ? Inputs[Key] extends (() => any) | ((arg: EmptyObject, thunkAPI: any) => any)
        ? CreatedEffectWithoutArg<SliceName, Key, Inputs[Key]>
        : CreatedEffectWithArg<SliceName, Key, Inputs[Key]>
      : never;
  } =>
    mapValues<Inputs, typeof forSlice>(inputs, mapper as any) as any;

// Returns 'createEffect' with the sliceName argument fixed, so you don't have to keep passing it
export function forSlice<SliceName extends string>(sliceName: SliceName) {
  return <EffectName extends string, EffectArgs extends object, EffectReturn>(
    effectFunction: EffectFunction<EffectArgs, EffectReturn>,
    effectName: EffectName,
  ) => createEffect<SliceName, EffectName, EffectArgs, EffectReturn>(sliceName, effectName, effectFunction);
}
