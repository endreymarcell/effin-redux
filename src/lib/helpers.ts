import _ from "lodash";

export function getHelpers<AppState>() {
  return {
    addEffect: <Effect>(state: any, effect: Effect) => void (state.$$effects = [...(state.$$effects ?? []), effect]),
    readAppState: (state: any): AppState => {
      const maybeAppState = state.$$appState;
      if (maybeAppState === undefined) {
        throw new Error("Cannot read app state from object. Are you sure you got this directly from the reducer?");
      }
      return _.mapValues(maybeAppState, (sliceState) => {
        const sliceStateWithAppState = { ...sliceState, $$appState: maybeAppState };
        return new Proxy(sliceStateWithAppState, {
          set: () => {
            throw new Error(
              "Cannot modify slice state that was acquired via readAppState. You can only modify the state draft you got directly from the reducer.",
            );
          },
        });
      });
    },
    readOriginalAppState: (state: any): AppState => state.$$originalAppState,
  };
}
