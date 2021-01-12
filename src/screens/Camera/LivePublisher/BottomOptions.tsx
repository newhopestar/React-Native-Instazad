import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SCREEN_HEIGHT, SCREEN_WIDTH, STATUS_BAR_HEIGHT } from "../../../constants";
import { useBiddingActions } from "../../../hooks/Live/useBiddingActions";
import { useBiddingState } from "../../../hooks/Live/useBiddingState";
import { Message, useMessages } from "../../../hooks/Live/useMessages";
import useProducts from "../../../hooks/Live/useProducts";

interface Props {
  username: string;
  avatarURL: string;
  openProducts: () => void;
}

const BottomOptions: FunctionComponent<Props> = ({ username, avatarURL, openProducts }) => {
  const { messages } = useMessages(username, username, avatarURL);
  const { toggleZeroRound, toggleDoneRound } = useBiddingActions(username);
  const { timeLeft } = useBiddingState(username);
  const { currentProductId, sellProduct, rejectProduct, selectNextProduct } = useProducts(username);

  const [showSoldOptions, setShowSoldOptions] = useState(true);

  const flatListRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      setShowSoldOptions(true);
    } else {
      setShowSoldOptions(false);
    }
  }, [timeLeft]);

  useEffect(() => {
    setShowSoldOptions(false);
  }, []);

  function onSellProduct() {
    sellProduct(currentProductId!);
    selectNextProduct();
    setShowSoldOptions(false);
  }

  function onRejectProduct() {
    rejectProduct(currentProductId!);
    selectNextProduct();
    setShowSoldOptions(false);
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
        {!showSoldOptions ? (
          <>
            <TouchableOpacity onPress={openProducts}>
              <Text style={styles.bottomOption}>Bag</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleZeroRound()}>
              <Text style={styles.bottomOption}>Zero</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleDoneRound()}>
              <Text style={styles.bottomOption}>Done!</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={onSellProduct}>
              <Text style={styles.bottomOption}>sell</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onRejectProduct}>
              <Text style={styles.bottomOption}>reject</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowSoldOptions(false)}>
              <Text style={styles.bottomOption}>cancel</Text>
            </TouchableOpacity>
          </>
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
  bottomWrapper: {
    width: "100%",
    height: 70,
    flexDirection: "row",
    justifyContent: "space-evenly",
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
  bottomOption: {
    color: "white",
  },
});

export default BottomOptions;
