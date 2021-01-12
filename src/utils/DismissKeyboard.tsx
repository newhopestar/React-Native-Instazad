import { TouchableHighlight } from "@gorhom/bottom-sheet";
import React, { FunctionComponent } from "react";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { SCREEN_HEIGHT } from "../constants";

interface Props {}

const DismissKeyboard: FunctionComponent<Props> = ({ children }) => {
  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{ height: SCREEN_HEIGHT }}>{children}</View>
    </TouchableWithoutFeedback>
  );
};

export default DismissKeyboard;
