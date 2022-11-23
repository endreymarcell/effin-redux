import { Reducer } from "@reduxjs/toolkit";
import { AnyAction } from "redux";

export const myCombineReducers = <AppState extends {}>(reducers: Record<string, Reducer>, appState: AppState) => {
  return (state = {}, action: AnyAction) => {
    return Object.keys(reducers).reduce((nextState, key) => {
      // @ts-ignore
      nextState[key] = reducers[key](
        {
          // @ts-ignore
          ...state[key],
          $$appState: appState,
        },
        action,
      );
      return nextState;
    }, {});
  };
};
