import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SCREEN_HEIGHT, SCREEN_WIDTH, STATUS_BAR_HEIGHT } from "../../../constants";
import { useBiddingState } from "../../../hooks/Live/useBiddingState";
import { Message, useMessages } from "../../../hooks/Live/useMessages";

interface Props {
  streamerUsername: string;
  username: string;
  avatarURL: string;
  openProducts: () => void;
}

const BottomOptions: FunctionComponent<Props> = ({ streamerUsername, username, avatarURL, openProducts }) => {
  const { messages, sendMessage, sendDone } = useMessages(streamerUsername, username, avatarURL);
  const { doneRound } = useBiddingState(streamerUsername);

  const [messageContent, setMessageContent] = useState<string>("");
  const [bid, setBid] = useState<number>();

  const flatListRef = useRef<FlatList<Message>>(null);

  function onSendMessage() {
    sendMessage(messageContent, bid);
    setMessageContent("");
    setBid(undefined);
  }

  function onSendDone() {
    sendDone(messageContent);
    setMessageContent("");
    setBid(undefined);
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoiding}
      behavior="position"
      keyboardVerticalOffset={STATUS_BAR_HEIGHT + 65}
    >
      <FlatList
        ref={flatListRef}
        style={styles.chatContainer}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={styles.message}>
            <Text>{item.content}</Text>
          </View>
        )}
      />
      <View style={styles.bottomWrapper}>
        <TouchableOpacity onPress={openProducts}>
          <Text style={styles.bagIcon}>Bag</Text>
        </TouchableOpacity>
        <TextInput
          clearTextOnFocus={true}
          onSubmitEditing={onSendMessage}
          returnKeyType="send"
          textAlignVertical="center"
          placeholder="Send a message"
          placeholderTextColor="#fff"
          value={messageContent}
          onChangeText={(text) => setMessageContent(text)}
          style={styles.messageInput}
        />
        {!doneRound ? (
          <TextInput
            clearTextOnFocus={true}
            onSubmitEditing={onSendMessage}
            returnKeyType="send"
            textAlignVertical="center"
            placeholder="Bid"
            placeholderTextColor="#fff"
            value={bid ? bid.toString() : ""}
            onChangeText={(text) => {
              if (!text) {
                setBid(undefined);
                return;
              }
              if (!Number(text)) return;
              setBid(Number(text));
            }}
            style={styles.bidInput}
          />
        ) : (
          <TouchableOpacity style={styles.bidInput} onPress={() => onSendDone()}>
            <Text style={{ color: "white" }}>Done</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoiding: {
    width: SCREEN_WIDTH,
    height: 0,
    position: "absolute",
    bottom: 0,
    left: 0,
    display: "flex",
  },
  messageInput: {
    height: 44,
    width: SCREEN_WIDTH / 2,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 44,
    marginHorizontal: 10,
    paddingHorizontal: 15,
    color: "#fff",
    fontSize: 16,
  },
  bidInput: {
    height: 44,
    width: SCREEN_WIDTH / 4 - 30,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 44,
    paddingHorizontal: 15,
    color: "#fff",
    fontSize: 16,
  },
  bottomWrapper: {
    width: "100%",
    height: 70,
    flexDirection: "row",
    alignItems: "center",
  },
  chatContainer: {
    height: SCREEN_HEIGHT / 4,
    width: SCREEN_WIDTH,
    position: "absolute",
    bottom: 0,
    paddingHorizontal: 10,
  },
  message: {
    marginVertical: 5,
  },
  bagIcon: { color: "white", marginHorizontal: 10 },
});

export default BottomOptions;
