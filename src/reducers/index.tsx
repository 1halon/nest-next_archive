import { combineReducers } from "redux";
import billcard from "./billcard";

export interface Action<T> {
  payload: T;
  type: string;
}

const reducers = {
  billcard,
};

export default combineReducers(reducers);
