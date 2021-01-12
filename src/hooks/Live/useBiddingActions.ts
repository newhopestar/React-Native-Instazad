import database, { FirebaseDatabaseTypes } from "@react-native-firebase/database";
import LiveStreamRefs from "./utils/LiveStreamRefs";

export function useBiddingActions(streamerUsername: string) {
  const { zeroRoundRef, timerRef, doneRoundRef } = LiveStreamRefs(streamerUsername);

  function startTimer(seconds: number) {
    initializeBiddingState();

    const startTimestamp = +new Date();
    const endTimestamp = startTimestamp + seconds * 1000;
    timerRef.set({ startTimestamp, endTimestamp });
  }

  function initializeBiddingState() {
    zeroRoundRef.set(0);
    doneRoundRef.set(0);
  }

  function toggleZeroRound() {
    //Since Firebase doesn't support toggle booleans, we increment and make the value (% 2 === 0)
    zeroRoundRef.set(database.ServerValue.increment(1));
  }

  function toggleDoneRound() {
    //Since Firebase doesn't support toggle booleans, we increment and make the value (% 2 === 0)
    doneRoundRef.set(database.ServerValue.increment(1));
  }

  function resetTimer() {
    timerRef.set({ startTimestamp: 0, endTimestamp: 0 });
  }

  return { startTimer, toggleZeroRound, toggleDoneRound, resetTimer };
}
