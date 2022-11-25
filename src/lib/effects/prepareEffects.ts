import mapValues from "lodash/mapValues";
import { AsyncThunk } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { BaseThunkAPI } from "@reduxjs/toolkit/dist/createAsyncThunk";

type EffectFunction<EffectArgs extends object, EffectReturn> = (args?: EffectArgs) => Promise<EffectReturn>;

/**
 * When executing scheduled actions, we only know the slice name and the effect name,
 * but we don't have access to the function itself, or the thunk calculated from it.
 * So let's store all generated thunks in this globally accessible lookup table
 * and index them based on their slice and effect name.
 */
type SliceName = string;
type EffectName = string;
export type EffectIdentifier = `${SliceName}/${EffectName}`;
export const thunkLookupTable: Map<EffectIdentifier, AsyncThunk<any, any, any>> = new Map();

function createEffect<EffectArgs extends object, EffectReturn>(
  sliceName: string,
  effectName: string,
  effectFunction: EffectFunction<EffectArgs, EffectReturn>,
) {
  const effectIdentifier: EffectIdentifier = `${sliceName}/${effectName}`;
  const simpleThunk = createAsyncThunk(effectIdentifier, effectFunction);
  thunkLookupTable.set(effectIdentifier, simpleThunk);

  // If you ended up here via code navigation: -- These are not the droids you're looking for.
  // Click on `effectName` in `effects.effectName.run()` to get to the actual implementation!
  const serializer = (args?: EffectArgs) => ({ sliceName, effectName, args });

  return {
    ...simpleThunk,
    run: serializer,
  };
}

type SingleEffectCreator<State> = (arg: any, thunkApi: BaseThunkAPI<State, any>) => any;
type AllEffectCreators<State> = { [key: string]: SingleEffectCreator<State> };
export const createEffectInputs =
  <State extends object>() =>
  <T extends AllEffectCreators<State>>(t: T): T =>
    t;

export const createEffects = <Inputs extends object>(inputs: Inputs, mapper: any) =>
  mapValues<Inputs, any>(inputs, mapper);

// Returns 'createEffect' with the sliceName argument fixed so you don't have to keep passing it
export function forSlice(sliceName: string) {
  return <EffectArgs extends object, EffectReturn>(
    effectFunction: EffectFunction<EffectArgs, EffectReturn>,
    effectName: string,
  ) => createEffect<EffectArgs, EffectReturn>(sliceName, effectName, effectFunction);
}
