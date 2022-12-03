export function getHelpers<AppState>() {
  return {
    addEffect: <SliceState extends { $$effects?: any[] }, Effect>(state: SliceState, effect: Effect) =>
      void (state.$$effects = [...(state.$$effects ?? []), effect]),
    readAppState: (state: any): AppState => state.$$appState,
  };
}
