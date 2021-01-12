import database, { FirebaseDatabaseTypes } from "@react-native-firebase/database";
import { store } from "../store";
import firestore from "@react-native-firebase/firestore";
import { UserInfo } from "../reducers/userReducer";
import { LiveAction, liveActionTypes, LiveErrorAction, LivePreview, LiveSuccessAction } from "../reducers/liveReducer";
import { ThunkAction, ThunkDispatch } from "redux-thunk";

const liveStreamsRef = database().ref(`/liveStreams`);

export const FetchLiveListRequest = (): ThunkAction<Promise<void>, {}, {}, LiveAction> => {
  return async (dispatch: ThunkDispatch<{}, {}, LiveAction>) => {
    try {
      liveStreamsRef.off("value");

      const me = store.getState().user.user;
      const myUsername = me.userInfo?.username!;

      const snapshot = await firestore().collection("users").doc(me.userInfo?.username).get();
      if (snapshot.exists) {
        const result = snapshot.data();
        const followingList: string[] = result?.followings || [];

        liveStreamsRef.on("value", async (liveStreams: FirebaseDatabaseTypes.DataSnapshot) => {
          if (!liveStreams.exists()) {
            dispatch(FetchLiveListSuccess([]));
            return;
          }

          const liveItems: Partial<LivePreview>[] = [];

          liveStreams.forEach((stream: FirebaseDatabaseTypes.DataSnapshot) => {
            if (followingList.indexOf(stream.val().username) !== -1 && stream.val().username !== myUsername) {
              liveItems.push({ username: stream.val().username, startedAt: stream.val().startedAt });
            }
          });

          if (liveItems.length) {
            const usernameToInfo = new Map<string, UserInfo>();
            const usersSnapshot = await firestore()
              .collection("users")
              .where(
                "username",
                "in",
                liveItems.map((item) => item.username)
              )
              .get();

            for (const doc of usersSnapshot.docs) {
              usernameToInfo.set(doc.data().username, doc.data());
            }

            for (const liveItem of liveItems) {
              liveItem.avatarURL = usernameToInfo.get(liveItem.username!)!.avatarURL;
            }
          }

          const sortedLiveItems = liveItems.sort((a, b) => a.startedAt! - b.startedAt!) as LivePreview[];

          dispatch(FetchLiveListSuccess(sortedLiveItems));
        });
      } else dispatch(FetchLiveListFailure());
    } catch (error) {
      console.log(error);
      dispatch(FetchLiveListFailure());
    }
  };
};

export const FetchLiveListFailure = (): LiveErrorAction => {
  return {
    type: liveActionTypes.FETCH_LIVE_LIST_FAILURE,
    payload: {
      message: "Get Live List Failed!",
    },
  };
};

export const FetchLiveListSuccess = (payload: LivePreview[]): LiveSuccessAction => {
  return {
    type: liveActionTypes.FETCH_LIVE_LIST_SUCCESS,
    payload: payload,
  };
};
