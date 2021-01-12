import database, { FirebaseDatabaseTypes } from "@react-native-firebase/database";
import { useEffect, useState } from "react";

export function useViews(streamerUsername: string) {
  const viewsRef = database().ref(`/liveStreamsDetails/${streamerUsername}/views`);

  const [views, setViews] = useState<number>();

  useEffect(() => {
    subscribeToViews();

    return () => {
      unsubscribeFromViews();
    };
  }, []);

  async function subscribeToViews() {
    viewsRef.on("value", (snapshot: FirebaseDatabaseTypes.DataSnapshot) => {
      if (!snapshot.exists()) return;

      setViews(snapshot.val());
    });
  }

  async function unsubscribeFromViews() {
    viewsRef.off("value");
  }

  return views;
}
