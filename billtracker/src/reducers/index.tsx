import { combineReducers } from "redux";
import billcard from "./billcard";
import type { State as BillcardState } from "./billcard";
import user from "./user";
import type { State as UserState } from "./user";

export interface Action<T> {
  payload: T;
  type: string;
}

const reducers = {
  billcard,
  user,
};

export interface SelectorState {
  billcard: BillcardState;
  user: UserState;
}

export default combineReducers(reducers);
