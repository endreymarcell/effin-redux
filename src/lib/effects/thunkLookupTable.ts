import { AsyncThunk } from "@reduxjs/toolkit";
import { BaseThunkAPI } from "@reduxjs/toolkit/dist/createAsyncThunk";
import { __createEffect__exposedForTesting } from "./createEffects";

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

/**
 * Replace an existing effect with a new one for testing purposes.
 */
export function replaceEffect(
  effect: AsyncThunk<any, any, any>,
  implementation: (arg?: any, thunkApi?: BaseThunkAPI<any, any>) => Promise<any>,
) {
  if (!("__identifier" in effect)) {
    throw new Error('Failed to replace effect: "__identifier" property was not found in the provided object');
  }

  const identifier = effect.__identifier as EffectIdentifier;
  if (!thunkLookupTable.get(identifier)) {
    const existingEffects = Array.from(thunkLookupTable.keys()).map((key) => `- ${key}`);
    const messageParts = [
      `Failed to replace effect: "${identifier}" was not found in the lookup table.`,
      `Existing effects are:`,
      ...existingEffects,
    ];
    throw new Error(messageParts.join("\n"));
  }
  const [sliceName, effectName] = identifier.split("/");
  __createEffect__exposedForTesting(sliceName, effectName, implementation);
}
