import { AsyncThunk } from "@reduxjs/toolkit";
import { BaseThunkAPI } from "@reduxjs/toolkit/dist/createAsyncThunk";
import { __createEffect__exposedForTesting } from "./createEffects";
import { EffectIdentifier, thunkLookupTable } from "./thunkLookupTable";

let copyOfThunkLookupTable: typeof thunkLookupTable | undefined;

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

  if (copyOfThunkLookupTable === undefined) {
    copyOfThunkLookupTable = new Map(thunkLookupTable); // Shallow copy is enough
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

/**
 * Restore the original effect after testing.
 */
export function restoreEffect(effect: AsyncThunk<any, any, any>) {
  if (!("__identifier" in effect)) {
    throw new Error('Failed to restore effect: "__identifier" property was not found in the provided object');
  }
  if (copyOfThunkLookupTable === undefined) {
    throw new Error("Failed to restore effect: no effects were replaced");
  }

  const identifier = effect.__identifier as EffectIdentifier;
  const copyOfEffect = copyOfThunkLookupTable.get(identifier);
  if (!copyOfEffect) {
    throw new Error(`Failed to restore effect: effect ${identifier} was not found in the lookup table`);
  }

  thunkLookupTable.set(identifier, copyOfEffect);
}
