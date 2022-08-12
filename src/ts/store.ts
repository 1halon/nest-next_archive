import { configureStore } from "@reduxjs/toolkit";
import type { AnyAction } from "@reduxjs/toolkit";
import { createWrapper, HYDRATE } from "next-redux-wrapper";
import logger from "redux-logger";
import thunk from "redux-thunk";
import root_reducers from "../reducers";

const store = configureStore({
  reducer: (state: any, action: AnyAction) => {
    switch (action.type) {
      case HYDRATE:
        // Attention! This will overwrite client state! Real apps should use proper reconciliation.
        return { ...state, ...action.payload };
      default:
        return root_reducers(state, action);
    }
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logger, thunk),
});

export default store;
export const wrapper = createWrapper(() => store, { debug: true });
