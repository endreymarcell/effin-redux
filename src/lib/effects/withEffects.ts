import { AsyncThunk, AsyncThunkAction, Reducer } from "@reduxjs/toolkit";

import { effectRemoverReducer, effectSchedulerReducer } from "./scheduling";

export type SerializedEffect<Args extends any[]> = {
  sliceName: string;
  effectName: string;
  args: Args;
};

export type SerializedEffectWithThunkOverload<Args extends any[]> =
  | SerializedEffect<Args>
  | AsyncThunkAction<any, any, any>;

// Helper type for describing a slice's state
export type StateWithEffects<State> = State & {
  $$effects?: SerializedEffectWithThunkOverload<any>[];
};

// Helper type for describing the entire app's state so that its slices have effects
export type GenericAppStateWithEffects = {
  [key: string]: StateWithEffects<any>;
};

/**
 * Take a reducer that returns serialized effect descriptions in the state's $$effects field,
 * and return one that actually executes those effects.
 */
export const withEffects = <State>(pureReducer: Reducer): Reducer<State> => {
  return (state, action) => effectSchedulerReducer(effectRemoverReducer(pureReducer(state, action), action), action);
};
