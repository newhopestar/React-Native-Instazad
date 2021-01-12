import { FirebaseDatabaseTypes } from "@react-native-firebase/database";
import { useCallback, useEffect, useState } from "react";
import { Message } from "./useMessages";
import LiveStreamRefs from "./utils/LiveStreamRefs";

export type Timer = {
  startTimestamp: number;
  endTimestamp: number;
};

export function useBiddingState(streamerUsername: string) {
  const { timerRef, messagesRef, zeroRoundRef, doneRoundRef } = LiveStreamRefs(streamerUsername);

  const [timer, setTimer] = useState<Timer>({ startTimestamp: 0, endTimestamp: 0 });
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [highestBidMessage, setHighestBidMessage] = useState<Message>();
  const [zeroRound, setZeroRound] = useState(false);
  const [doneRound, setDoneRound] = useState(false);
  const [doneMessages, setDoneMessages] = useState<Message[]>([]);

  useEffect(() => {
    subscribeToTimer();

    return () => {
      unsubscribeFromTimer();
      resetState();
    };
  }, []);

  useEffect(() => {
    if (timer.endTimestamp > +new Date()) {
      setTimeLeft(calculateTimeLeft());
      onTimerStarted();
    } else {
      resetState();
    }
  }, [timer.startTimestamp, timer.endTimestamp]);

  useEffect(() => {
    if (timeLeft > 0) {
      setTimeout(() => setTimeLeft(calculateTimeLeft()), 1);
    } else {
      resetState();
    }
  }, [timeLeft]);

  useEffect(() => {
    if (doneRound) {
      subscribeToDoneMessages();
    } else {
      unsubscribeFromDoneMessages();
    }
  }, [doneRound]);

  function calculateTimeLeft() {
    return timer.endTimestamp - +new Date();
  }

  function onTimerStarted() {
    subscribeToHighestBid();
    subscribeToZeroRound();
    subscribeToDoneRound();
  }

  function resetState() {
    unsubscribeFromHighestBid();
    unsubscribeFromZeroRound();
    unsubscribeFromDoneRound();
  }

  function subscribeToTimer() {
    timerRef.on("value", (snapshot: FirebaseDatabaseTypes.DataSnapshot) => {
      if (!snapshot.exists()) return;

      setTimer(snapshot.val());
    });
  }

  function unsubscribeFromTimer() {
    timerRef.off("value");
  }

  function subscribeToHighestBid() {
    //Unsubscribe because a new timer can be set before the old one ends
    unsubscribeFromHighestBid();

    messagesRef
      .orderByChild("timestamp")
      .startAt(timer.startTimestamp)
      .endAt(timer.endTimestamp)
      .on("child_added", onNewBidPlaced);
  }

  const onNewBidPlaced = useCallback((snapshot: FirebaseDatabaseTypes.DataSnapshot) => {
    if (!snapshot.exists()) return;

    const newMessage: Message = snapshot.val();

    if (newMessage.bid) {
      setHighestBidMessage((oldHighestBidMessage) => {
        if (!oldHighestBidMessage || newMessage.bid! > oldHighestBidMessage.bid!) {
          return newMessage;
        } else {
          return oldHighestBidMessage;
        }
      });
    }
  }, []);

  function unsubscribeFromHighestBid() {
    messagesRef.off("child_added", onNewBidPlaced);
    setHighestBidMessage(undefined);
  }

  function subscribeToZeroRound() {
    zeroRoundRef.on("value", (snapshot: FirebaseDatabaseTypes.DataSnapshot) => {
      if (!snapshot.exists()) return;

      setZeroRound(snapshot.val() % 2 !== 0);
    });
  }

  function unsubscribeFromZeroRound() {
    zeroRoundRef.off("value");
    setZeroRound(false);
  }

  function subscribeToDoneRound() {
    doneRoundRef.on("value", (snapshot: FirebaseDatabaseTypes.DataSnapshot) => {
      if (!snapshot.exists()) return;

      setDoneRound(snapshot.val() % 2 !== 0);
    });
  }

  function unsubscribeFromDoneRound() {
    doneRoundRef.off("value");
    setDoneRound(false);
  }

  function subscribeToDoneMessages() {
    messagesRef
      .orderByChild("timestamp")
      .startAt(timer.startTimestamp)
      .endAt(timer.endTimestamp)
      .on("child_added", onNewDoneMessage);
  }

  const onNewDoneMessage = useCallback((snapshot: FirebaseDatabaseTypes.DataSnapshot) => {
    if (!snapshot.exists()) return;

    const newMessage: Message = snapshot.val();

    if (newMessage.done) {
      setDoneMessages((oldDoneMessages) => [...oldDoneMessages, newMessage]);
    }
  }, []);

  function unsubscribeFromDoneMessages() {
    messagesRef.off("child_added", onNewDoneMessage);
    setDoneMessages([]);
  }

  return { timeLeft, highestBidMessage, zeroRound, doneRound, doneMessages };
}
