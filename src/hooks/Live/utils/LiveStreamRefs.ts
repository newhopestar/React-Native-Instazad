import database, { FirebaseDatabaseTypes } from "@react-native-firebase/database";

export default function LiveStreamRefs(streamerUsername: string) {
  const streamDetailsRef = database().ref(`/liveStreamsDetails/${streamerUsername}`);

  const messagesRef = streamDetailsRef.child(`messages`);
  const timerRef = streamDetailsRef.child(`timer`);
  const viewsRef = streamDetailsRef.child(`views`);
  const zeroRoundRef = streamDetailsRef.child(`zeroRound`);
  const doneRoundRef = streamDetailsRef.child(`doneRound`);
  const productsRef = streamDetailsRef.child(`products`);
  const currentProductIdRef = streamDetailsRef.child(`currentProductId`);

  return { messagesRef, zeroRoundRef, timerRef, viewsRef, doneRoundRef, productsRef, currentProductIdRef };
}
