import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SCREEN_WIDTH, STATUS_BAR_HEIGHT } from "../../constants";
import { goBack, navigate } from "../../navigations/rootNavigation";

import BottomOptions from "./StoryTaker/BottomOptions";

interface Props {
  onPublish: () => void;
  useFront: () => [front: boolean, toggleFront: () => void];
}

const LivePreparer: FunctionComponent<Props> = (props) => {
  return (
    <>
      <View style={styles.topOptions}>
        <TouchableOpacity onPress={() => navigate("StoryPrivacy")} style={styles.btnTopOptions}>
          <Icon name="tune" size={30} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={goBack} style={styles.btnTopOptions}>
          <Text
            style={{
              fontSize: 30,
              color: "#fff",
            }}
          >
            ✕
          </Text>
        </TouchableOpacity>
      </View>
      <BottomOptions {...props} onBigButtonPress={props.onPublish} />
    </>
  );
};

const styles = StyleSheet.create({
  topOptions: {
    position: "absolute",
    top: STATUS_BAR_HEIGHT,
    left: 0,
    height: 60,
    width: SCREEN_WIDTH,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  btnTopOptions: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LivePreparer;
