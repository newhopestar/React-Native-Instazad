import database from "@react-native-firebase/database";
import LiveStreamRefs from "./utils/LiveStreamRefs";

export function useSubscribe(streamerUsername: string) {
  const { viewsRef } = LiveStreamRefs(streamerUsername);

  async function subscribe() {
    await viewsRef.onDisconnect().set(database.ServerValue.increment(-1));
    await viewsRef.set(database.ServerValue.increment(1));
  }

  async function unSubscribe() {
    await viewsRef.onDisconnect().cancel();
    await viewsRef.set(database.ServerValue.increment(-1));
  }

  return { subscribe, unSubscribe };
}
