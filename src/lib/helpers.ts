import _ from "lodash";

export function getHelpers<AppState>() {
  return {
    addEffect: <Effect>(state: any, effect: Effect) => void (state.$$effects = [...(state.$$effects ?? []), effect]),
    readAppState: (state: any): AppState => {
      const maybeAppState = state.$$appState;
      if (maybeAppState === undefined) {
        throw new Error("Cannot read app state from object. Are you sure you got this directly from the reducer?");
      }
      return _.mapValues(maybeAppState, (sliceState) => ({ ...sliceState, $$appState: maybeAppState }));
    },
    readOriginalAppState: (state: any): AppState => state.$$originalAppState,
  };
}
