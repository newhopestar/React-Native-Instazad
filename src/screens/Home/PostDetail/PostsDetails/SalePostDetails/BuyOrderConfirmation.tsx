import React, { FunctionComponent, useState } from "react";
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { goBack } from "../../../../../navigations/rootNavigation";
import { useBottomSheet } from "../../../../../utils/BottomSheetContext";
import DismissKeyboard from "../../../../../utils/DismissKeyboard";

interface Props {
  initialBuyQuantity: number;
  quantityLimit: number;
  alreadyBought: boolean;
  buy: (commentText: string, buyQuantity: number) => void;
  cancel: (commentText: string) => void;
}

const BuyOrderConfirmation: FunctionComponent<Props> = ({
  alreadyBought,
  buy,
  cancel,
  initialBuyQuantity,
  quantityLimit,
}) => {
  const [isFullScreen, setIsFullScreen] = useBottomSheet();
  const [buyQuantity, setBuyQuantity] = useState(initialBuyQuantity);
  const [message, setMessage] = useState("");

  function decreaseBuyQuantity() {
    setBuyQuantity((oldQuantity) => (oldQuantity !== 1 ? oldQuantity - 1 : oldQuantity));
  }

  function increaseBuyQuantity() {
    setBuyQuantity((oldQuantity) => (oldQuantity < quantityLimit ? oldQuantity + 1 : oldQuantity));
  }

  function onBuy() {
    buy(message, buyQuantity);
    goBack();
  }

  function onCancel() {
    cancel(message);
    goBack();
  }

  return (
    <DismissKeyboard>
      {!alreadyBought ? (
        <View>
          <View style={styles.quantityContainer}>
            <TouchableOpacity onPress={decreaseBuyQuantity}>
              <Text>-</Text>
            </TouchableOpacity>
            <Text>{buyQuantity}</Text>
            <TouchableOpacity onPress={increaseBuyQuantity}>
              <Text>+</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            onFocus={() => setIsFullScreen(true)}
            onBlur={() => setIsFullScreen(false)}
            multiline={true}
            style={styles.messageInput}
            placeholder="Write a message..."
            value={message}
            onChangeText={(text) => setMessage(text)}
          />
          <TouchableOpacity onPress={onBuy}>
            <Text>Buy</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <TextInput
            onFocus={() => setIsFullScreen(true)}
            onBlur={() => setIsFullScreen(false)}
            multiline={true}
            style={styles.messageInput}
            placeholder="Write a message..."
            value={message}
            onChangeText={(text) => setMessage(text)}
          />
          <TouchableOpacity onPress={onCancel}>
            <Text>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </DismissKeyboard>
  );
};

const styles = StyleSheet.create({
  quantityContainer: {
    flexDirection: "row",
  },
  messageInput: {
    minHeight: 30,
    flex: 1,
    paddingHorizontal: 15,
    backgroundColor: "green",
  },
});

export default BuyOrderConfirmation;
