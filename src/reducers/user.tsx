import { createSlice } from "@reduxjs/toolkit";
import type { Action } from ".";

export interface State {
    username: string;
}

export const user = createSlice({
  name: "user",
  initialState: {
    username: null
  } as State,
  reducers: {
    set: (state: State, action: Action<string>) => {
        state.username = action.payload;
    },
  },
});

export const { set } = user.actions;

export default user.reducer;
