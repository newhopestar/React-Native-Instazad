import database, { FirebaseDatabaseTypes } from "@react-native-firebase/database";
import { useEffect, useState } from "react";

export type Message = {
  content: string;
  bid?: number;
  timestamp: number | object;
  username: string;
  avatarURL: string;
  done?: boolean;
};

export function useMessages(streamerUsername: string, username: string, avatarURL: string) {
  const messagesRef = database().ref(`/liveStreamsDetails/${streamerUsername}/messages`);

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, []);

  function subscribeToMessages() {
    messagesRef.orderByChild("timestamp").on("value", (snapshot: FirebaseDatabaseTypes.DataSnapshot) => {
      if (!snapshot.exists()) return;

      const messages: Message[] = [];
      snapshot.forEach((childNode: any) => {
        messages.push(childNode.val());
      });

      setMessages(messages);
    });
  }

  function unsubscribeFromMessages() {
    messagesRef.off("value");
  }

  function sendMessage(content: string, bid?: number) {
    if (!content && !bid) return;

    const message: Message = {
      content,
      bid,
      timestamp: database.ServerValue.TIMESTAMP,
      username: username,
      avatarURL: avatarURL,
    };

    messagesRef.push(message); //TODO add complete function to confirm message was sent
  }

  function sendDone(content: string) {
    const message: Message = {
      content,
      timestamp: database.ServerValue.TIMESTAMP,
      username: username,
      avatarURL: avatarURL,
      done: true,
    };

    messagesRef.push(message); //TODO add complete function to confirm message was sent
  }

  return { messages, sendMessage, sendDone };
}
