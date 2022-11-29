import cloneDeep from "lodash/cloneDeep";
import produce from "immer";
import { AnyAction, Store } from "redux";
import { nanoid, Reducer } from "@reduxjs/toolkit";

import { GenericAppStateWithEffects, SerializedEffect } from "./withEffects";
import { EffectIdentifier, thunkLookupTable } from "./thunkLookupTable";
import { typedObjectKeys } from "$utils";

type ScheduledEffect = {
  instanceId: string;
  serializedEffect: SerializedEffect<any, any, any>;
};

export type SerializedEffectInstance<T extends any[]> = SerializedEffect<any, any, T> & { instanceId: string };

let scheduledEffects: ScheduledEffect[] = [];
let storeForScheduledEffects: Store | undefined = undefined;
export function setStoreForScheduledEffects<State>(store: Store<State>) {
  storeForScheduledEffects = store;
}

/**
 * Check if the main reducer put any side effects in the state and schedule them for execution.
 *
 * This function scans the app state's slices (returned from the app reducer) for $$effects entries.
 * If it finds any, it puts a unique ID on them, and adds them to a list of scheduled effects.
 */
export const effectSchedulerReducer: Reducer = <State extends GenericAppStateWithEffects>(
  state: State,
  action: AnyAction,
) => {
  const isIrrelevantAction =
    action.type.startsWith("$$effect:") ||
    action.type.endsWith("/pending") ||
    action.type.endsWith("/fulfilled") ||
    action.type.endsWith("/rejected");

  if (isIrrelevantAction) {
    return state;
  }

  const stateWithTaggedEffects = produce(state, (draft) => {
    for (const sliceName of typedObjectKeys(draft)) {
      const slice = draft[sliceName];
      if ("$$effects" in slice && slice.$$effects) {
        // Intentionally widening the type from SerializedEffect to SerializedEffectInstance
        const effects: SerializedEffectInstance<any>[] = slice.$$effects;
        effects.forEach((effect) => {
          if (effect.instanceId !== undefined) {
            // Already tagged
            return;
          }
          const instanceId = nanoid();
          effect.instanceId = instanceId;
          scheduleEffect(instanceId, effect);
        });
      }
    }
  });
  return stateWithTaggedEffects;
};

/**
 * Take the serialized form of an effect, schedule it for execution, and execute when idle.
 */
function scheduleEffect(instanceId: string, serializedEffect: SerializedEffect<any, any, any>) {
  // Have to clone serializedEffect because it's a proxy coming from Immer that might be revoked in the meantime
  scheduledEffects.push({ instanceId, serializedEffect: cloneDeep(serializedEffect) });

  // Delay execution to the next idle time
  Promise.resolve().then(() => {
    const copyOfScheduledEffects = [...scheduledEffects];
    scheduledEffects = [];

    if (storeForScheduledEffects === undefined) {
      throw new Error("storeForScheduledEffects must be initialized with a redux store");
    }
    const { dispatch, getState } = storeForScheduledEffects;

    copyOfScheduledEffects.forEach(({ instanceId, serializedEffect: { sliceName, effectName, args } }) => {
      const effectIdentifier: EffectIdentifier = `${sliceName}/${effectName}`;
      // Dispatch an action so that effect execution shows up in the redux logs.
      // We also use this to clean the action from the state.
      dispatch({
        type: `$$effect:${effectIdentifier}`,
        payload: { instanceId, args },
      });

      const thunk = thunkLookupTable.get(effectIdentifier);
      if (thunk === undefined) {
        console.error(`Attempted to call thunk called ${effectIdentifier} but found none in the library`);
        return;
      }
      thunk(args)(dispatch, getState, undefined);
    });
  });
}

type EffectAction = {
  type: `$$effect:${string}`;
  payload: {
    instanceId: string;
  };
};

function isEffectAction(action: AnyAction): action is EffectAction {
  return action.type.startsWith("$$effect:");
}

/**
 * Clean executed actions from the state.
 *
 * Whenever an $$effect action is dispatched, locate the effect instance in the state based on its unique ID and remove it.
 */
export const effectRemoverReducer: Reducer = <State extends GenericAppStateWithEffects>(
  state: State,
  action: AnyAction,
) => {
  if (isEffectAction(action)) {
    const stateWithoutThisEffect = produce(state, (draft) => {
      for (const sliceName of typedObjectKeys(draft)) {
        const slice = draft[sliceName];
        if ("$$effects" in slice && slice.$$effects) {
          // Remove the effect from the state based on its ID
          slice.$$effects = slice.$$effects.filter(
            (effect: SerializedEffectInstance<any>) => effect.instanceId !== action.payload.instanceId,
          );
          if (slice.$$effects.length === 0) {
            delete slice.$$effects;
          }
        }
      }
    });
    return stateWithoutThisEffect;
  }
  return state;
};
