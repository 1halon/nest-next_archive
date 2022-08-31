import { createSlice } from "@reduxjs/toolkit";
import type { Action } from ".";
import type { AlertColor } from "@mui/material";

export interface State {
  alert: {
    content: string;
    severity: AlertColor;
    open?: boolean;
    timeout?: number;
    title?: string;
  };
  username: string;
}

export const user = createSlice({
  name: "user",
  initialState: {
    alert: null,
    username: null,
  } as State,
  reducers: {
    alert: (state: State, action: Action<State["alert"]>) => {
      state.alert = { ...action.payload, open: action.payload?.open ?? true };
    },
    username: (state: State, action: Action<string>) => {
      state.username = action.payload;
    },
  },
});

export const { alert, username } = user.actions;

export default user.reducer;
