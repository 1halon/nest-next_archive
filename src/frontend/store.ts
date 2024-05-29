import { applyMiddleware, compose, configureStore } from "@reduxjs/toolkit";

import { composeWithDevTools } from "@redux-devtools/extension";
import logger from "redux-logger";
import thunk from "redux-thunk";
import root_reducers from "./reducers";

const store = configureStore({
  reducer: root_reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(thunk, logger),
});

export default store;
