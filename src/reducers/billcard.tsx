import { createSlice } from "@reduxjs/toolkit";

export const billcard = createSlice({
  name: "counter",
  initialState: {
    cards: {},
    counts: {
      filtered: 0,
      total: 0,
    },
  },
  reducers: {},
});

// Action creators are generated for each case reducer function
//export const {} = billcard.actions;

export default billcard.reducer;
