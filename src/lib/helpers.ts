export function getHelpers<AppState>() {
  return {
    addEffect: <Effect>(state: any, effect: Effect) => void (state.$$effects = [...(state.$$effects ?? []), effect]),
    readAppState: (state: any): AppState => state.$$appState,
  };
}
