import { Reducer, Slice } from "@reduxjs/toolkit";
import { AnyAction } from "redux";
import produce from "immer";
import { typedObjectKeys } from "../../utils";
import { cloneDeep, dieUnlessTest } from "../../utils/other";

type SliceArrayToKeys<Slices extends readonly Slice[]> = {
  [Index in keyof Slices]: Slices[Index]["name"];
}[number];

type FindSliceByName<Slices extends readonly Slice[], Name extends string> = Extract<
  Slices[number],
  Slice<any, any, Name>
>;

export type SlicesToState<Slices extends readonly Slice[]> = {
  [Key in SliceArrayToKeys<Slices>]: FindSliceByName<Slices, Key> extends Slice<infer SliceState, any, infer Name>
    ? SliceState
    : never;
};

export const combineSlices = <Slices extends readonly Slice[], AppState extends SlicesToState<Slices>>(
  slices: Slices,
  onError?: (error: Error, sliceName: string, actionType: string) => void,
): Reducer<AppState> => {
  return ((state: AppState, action: AnyAction): AppState => {
    let appState = state === undefined ? getInitialState(slices) : (produce(state, (state) => state) as any); // TODO fix the type
    const originalAppState = cloneDeep(appState);
    for (const slice of slices) {
      if (slice === undefined) {
        dieUnlessTest("combineSlices received an undefined slice");
        continue;
      }
      try {
        const newStateForSlice = slice.reducer(
          {
            ...appState[slice.name],
            $$appState: appState,
            $$originalAppState: originalAppState,
          },
          action,
        );
        appState = {
          ...appState,
          [slice.name]: newStateForSlice,
        };
      } catch (error: any) {
        console.error(
          `Exception thrown from the reducer of the '${slice.name}' slice while handling the '${action.type}' action:`,
          error,
        );
        onError?.(error, slice.name, action.type);
      }
    }
    return withoutAppStates(appState);
  }) as any;
};

export function getInitialState<Slices extends readonly Slice[], AppState extends SlicesToState<Slices>>(
  slices: Slices,
): SlicesToState<Slices> {
  const initialState: any = {};
  for (const slice of slices) {
    if (slice === undefined) {
      dieUnlessTest("getInitialState received an undefined slice");
      continue;
    }
    initialState[slice.name] = slice.getInitialState();
  }
  return initialState;
}

type SliceStateWithMaybeAppState = {
  [key: string]: unknown;
  $$appState?: unknown;
  $$originalAppState?: unknown;
};

function withoutAppStates<State extends { [key: string]: SliceStateWithMaybeAppState }>(state: State): State {
  return produce(state, (draft) => {
    typedObjectKeys(draft).forEach((sliceName) => {
      if ("$$appState" in draft[sliceName]) {
        delete draft[sliceName].$$appState;
      }
      if ("$$originalAppState" in draft[sliceName]) {
        delete draft[sliceName].$$originalAppState;
      }
    });
  });
}
