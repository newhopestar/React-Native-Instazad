import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { STATUS_BAR_HEIGHT, SCREEN_WIDTH, SCREEN_HEIGHT } from "../../constants";
import CountdownTimer from "./CountdownTimer";
import { useViews } from "../../hooks/Live/useViews";
import { useBiddingState } from "../../hooks/Live/useBiddingState";
import AdminCountdownTimer from "./AdminCountdownTimer";
import { useBiddingActions } from "../../hooks/Live/useBiddingActions";
import { Message } from "../../hooks/Live/useMessages";

interface Props {
  streamerUsername: string;
  onClose: () => void;
  streamer?: boolean;
}

const LiveTopOptions: FunctionComponent<Props> = ({ streamerUsername, onClose, streamer }) => {
  const views = useViews(streamerUsername);
  const { timeLeft, highestBidMessage, zeroRound, doneRound, doneMessages } = useBiddingState(streamerUsername);
  const { startTimer } = useBiddingActions(streamerUsername);

  const flatListRef = useRef<FlatList<Message>>(null);

  return (
    <View style={styles.topOptions}>
      <View style={styles.leftOptions}>
        <Text style={styles.user}>User goes</Text>
      </View>
      <View style={styles.middleOptions}>
        {streamer ? (
          <AdminCountdownTimer timeLeft={timeLeft} startTimer={startTimer} />
        ) : (
          timeLeft > 0 && <CountdownTimer timeLeft={timeLeft} />
        )}
      </View>
      <View style={styles.rightOptions}>
        <TouchableOpacity onPress={onClose} style={styles.btnTopOptions}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text>Viewers {views && views > 0 ? views : ""}</Text>
        {highestBidMessage && <Text>Highest bid {highestBidMessage.bid}</Text>}
        {zeroRound && <Text>From Zero</Text>}
        {doneRound && <Text>Done Round</Text>}
        {doneRound && (
          <FlatList
            ref={flatListRef}
            style={styles.doneMessagesContainer}
            data={doneMessages}
            keyExtractor={(_, index) => index.toString()}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => (
              <View style={styles.doneMessage}>
                <Text>{item.content}</Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topOptions: {
    position: "absolute",
    left: 0,
    height: 160,
    width: SCREEN_WIDTH,
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  leftOptions: {
    paddingVertical: 20,
    flex: 1,
  },
  middleOptions: {
    paddingVertical: 20,
    flex: 1,
    alignItems: "center",
  },
  rightOptions: {
    alignItems: "flex-end",
    flex: 1,
  },
  btnTopOptions: { paddingVertical: 10 },
  user: {},
  timer: {},
  closeButton: {
    fontSize: 30,
    color: "#fff",
  },
  doneMessagesContainer: {
    height: SCREEN_HEIGHT / 4,
    width: SCREEN_WIDTH / 8,
    paddingHorizontal: 10,
  },
  doneMessage: { marginVertical: 5 },
});

export default LiveTopOptions;
