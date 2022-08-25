import { createSlice } from "@reduxjs/toolkit";
import type { Action } from ".";
import type { Props } from "../components/BillCard";

export interface State {
  cards: Props[];
  counts: { filtered: number; total: number };
  filters: string[];
}

export const billcard = createSlice({
  name: "billcard",
  initialState: {
    cards: [],
    counts: {
      filtered: 0,
      total: 0,
    },
    filters: [],
  } as State,
  reducers: {
    add: (state: State, action: Action<Props>) => {
      state.cards = [action.payload, ...state.cards];
      state.counts.total += 1;
    },
    cards: (state: State, action: Action<State["cards"]>) => {
      state.cards = action.payload;
      state.counts.total = state.cards.length;
    },
    counts: (
      state: State,
      action: Action<{ [key in keyof State["counts"]]: number }>
    ) => {
      const { filtered, total } = action.payload;
      if (typeof filtered === "number") state.counts.filtered = filtered;
      if (typeof total === "number") state.counts.total = total;
    },
    remove: (state: State, action: Action<Props>) => {
      state.cards.splice(
        state.cards.findIndex(
          (card) => JSON.stringify(card) === JSON.stringify(action.payload)
        ),
        1
      );
      state.counts.total -= 1;
    },
  },
});

export const { add, cards, counts, remove } = billcard.actions;

export default billcard.reducer;
