import { useIsFocused, RouteProp } from "@react-navigation/native";
import React, { useRef, useState, useEffect, FunctionComponent } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, Animated, FlatList, ScrollView } from "react-native";
import { RNCamera } from "react-native-camera";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SCREEN_HEIGHT, SCREEN_WIDTH, STATUS_BAR_HEIGHT } from "../../../constants";
import { goBack, navigate } from "../../../navigations/rootNavigation";
import CameraRoll from "@react-native-community/cameraroll";
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from "react-native-gesture-handler";
import NavigationBar from "../../../components/NavigationBar";
import { SuperRootStackParamList } from "../../../navigations";
import BottomOptions from "./BottomOptions";

export type StoryTakerRouteProp = RouteProp<SuperRootStackParamList, "StoryTaker">;

type Props = {
  route?: StoryTakerRouteProp;
  cameraRef: React.RefObject<RNCamera>;
  useFront: () => [front: boolean, toggleFront: () => void];
  useFlash: () => [flash: boolean, toggleFlash: () => void];
};

export type StoryImageSpec = {
  width: number;
  height: number;
  uri: string;
  base64: string;
  extension: string;
};

const StoryTaker: FunctionComponent<Props> = (props) => {
  const { sendToDirect, username } = props.route?.params || {};
  const [flash, toggleFlash] = props.useFlash();

  const onTakePhoto = async () => {
    const photo = await props.cameraRef.current?.takePictureAsync({
      quality: 1,
    });
    const images: StoryImageSpec[] = [];
    images.push({
      width: photo?.width as number,
      height: photo?.height as number,
      uri: photo?.uri as string,
      base64: photo?.base64 || "",
      extension: (photo?.uri || "").split(".").pop() || "jpg",
    });
    navigate("StoryProcessor", {
      images,
      sendToDirect,
      username,
    });
  };

  return (
    <>
      {/* <PanGestureHandler onGestureEvent={_onGestureEvent} onHandlerStateChange={_onStateChange}> */}

      <View style={styles.topOptions}>
        <TouchableOpacity onPress={() => navigate("StoryPrivacy")} style={styles.btnTopOptions}>
          <Icon name="tune" size={30} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFlash} style={styles.btnTopOptions}>
          <Icon name={flash ? "flash" : "flash-off"} size={30} color="#fff" />
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
      <BottomOptions {...props} onBigButtonPress={onTakePhoto} />
      {/* </PanGestureHandler> */}
    </>
  );
};
export default StoryTaker;

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
