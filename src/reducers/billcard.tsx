import { createSlice } from "@reduxjs/toolkit";
import type { Action } from ".";
import BillCard, { Props } from "../components/BillCard";

export interface State {
  cards: Props[];
  counts: { filtered: number; total: number };
  filters: string[];
}

export const billcard = createSlice({
  name: "billcard",
  initialState: {
    cards: [
      {
        date: Date.now(),
        description: "Açıklama",
        receipt:
          "https://ogmmateryal.eba.gov.tr/panel/upload/pdf/dtp0hwksxlx.pdf",
        type: "AİDAT",
      },
    ],
    counts: {
      filtered: 0,
      total: 0,
    },
    filters: [],
  } as State,
  reducers: {
    add: (state: State, action: Action<{ props: Props }>) => {
      state.cards.push(action.payload.props);
      state.counts.total += 1;
    },
    cards: (state: State, action: Action<{ cards: State["cards"] }>) => {
      state.cards = action.payload.cards;
    },
    counts: (
      state: State,
      action: Action<{ [key in keyof State["counts"]]: number }>
    ) => {
      const { filtered, total } = action.payload;
      if (typeof filtered === "number") state.counts.filtered = filtered;
      if (typeof total === "number") state.counts.total = total;
    },
  },
});

export const { add, cards, counts } = billcard.actions;

export default billcard.reducer;
