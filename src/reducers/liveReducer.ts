import { UserInfo } from "./userReducer";
import { Alert } from "react-native";
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export const liveActionTypes = {
  FETCH_LIVE_LIST_REQUEST: "FETCH_LIVE_LIST_REQUEST",
  FETCH_LIVE_LIST_SUCCESS: "FETCH_LIVE_LIST_SUCCESS",
  FETCH_LIVE_LIST_FAILURE: "FETCH_LIVE_LIST_FAILURE",
};

export const livePermissions = {
  ALL: 1,
  CLOSE_FRIENDS: 2,
};

export type LivePreview = {
  username: string;
  avatarURL: string;
  startedAt: number;
};

export interface LiveErrorAction {
  type: string;
  payload: {
    message: string;
  };
}

export interface LiveSuccessAction {
  type: string;
  payload: LivePreview[];
}

export type LiveAction = LiveSuccessAction | LiveErrorAction;

const defaultState: LivePreview[] = [];

const reducer = (state: LivePreview[] = defaultState, action: LiveAction): LivePreview[] => {
  switch (action.type) {
    case liveActionTypes.FETCH_LIVE_LIST_REQUEST:
      state = [...defaultState];
      return state;
    case liveActionTypes.FETCH_LIVE_LIST_SUCCESS:
      action = <LiveSuccessAction>action;
      state = [...action.payload];
      return state;
    case liveActionTypes.FETCH_LIVE_LIST_FAILURE:
      action = <LiveErrorAction>action;
      const message = action.payload.message;
      Alert.alert("Error", message);
      return state;
    default:
      return state;
  }
};
export default reducer;
