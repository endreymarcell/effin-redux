import { AsyncThunk } from "@reduxjs/toolkit";

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
