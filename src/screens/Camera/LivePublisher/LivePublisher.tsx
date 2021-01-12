import React, { FunctionComponent, useEffect, useRef } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { STATUS_BAR_HEIGHT, SCREEN_WIDTH, CAMERA_RATIO, SCREEN_HEIGHT } from "../../../constants";
import { store } from "../../../store";
import Publisher from "../../../components/publisher";
import LiveTopOptions from "../../../components/LiveTopOptions/LiveTopOptions";
import BottomOptions from "./BottomOptions";
import { usePublish } from "../../../hooks/Live/usePublish";
import { useSubscribe } from "../../../hooks/Live/useSubscribe";
import { useBiddingState } from "../../../hooks/Live/useBiddingState";
import BottomSheet from "@gorhom/bottom-sheet";
import ProductsBottomSheet from "./ProductsBottomSheet";

interface Props {
  onUnpublish: () => void;
  useFront: () => [front: boolean, toggleFront: () => void];
}

const LivePublisher: FunctionComponent<Props> = (props) => {
  const me = store.getState().user.user;
  const username = me.userInfo?.username!;
  const avatarURL = me.userInfo?.avatarURL!;

  const { publish, unPublish } = usePublish(username);
  const { subscribe, unSubscribe } = useSubscribe(username);

  const sheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    publish().then(() => subscribe());

    return () => {
      unSubscribe().then(() => unPublish());
    };
  }, []);

  function openProducts() {
    sheetRef.current?.snapTo(1);
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.subContainer}>
          {/* <Publisher /> */}
          <View style={styles.camera}>
            <Text>REMOVE ME AFTER TESTING</Text>
          </View>
          <LiveTopOptions streamerUsername={username} onClose={props.onUnpublish} streamer />
          <BottomOptions username={username} avatarURL={avatarURL} openProducts={openProducts} />
        </View>
      </SafeAreaView>
      <ProductsBottomSheet sheetRef={sheetRef} streamerUsername={username} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    flexGrow: 1,
  },
  subContainer: {
    position: "absolute",
    top: STATUS_BAR_HEIGHT,
  },
  camera: {
    zIndex: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * CAMERA_RATIO,
    borderRadius: 15,
    overflow: "hidden",
    justifyContent: "center",
    backgroundColor: "grey",
  },
});
export default LivePublisher;
