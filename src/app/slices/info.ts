import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createReducers } from "$lib";

type GoodStatus = {
  type: "good";
};

type BadStatus = {
  type: "bad";
  error: string;
};

export type InfoState = {
  appStatus: GoodStatus | BadStatus;
};

const initialState: InfoState = {
  appStatus: {
    type: "good",
  },
};

export const infoSlice = createSlice({
  name: "info",
  initialState,
  reducers: createReducers<InfoState>({
    gotGoodNews: (state) => {
      state.appStatus = {
        type: "good",
      };
    },
    gotBadNews: (state, action: PayloadAction<{ error: string }>) => {
      state.appStatus = {
        type: "bad",
        error: action.payload.error,
      };
    },
  }),
});
