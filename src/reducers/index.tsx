import { combineReducers } from "redux";
import billcard from "./billcard";
import user from "./user";

export interface Action<T> {
  payload: T;
  type: string;
}

const reducers = {
  billcard,
  user,
};

export default combineReducers(reducers);
