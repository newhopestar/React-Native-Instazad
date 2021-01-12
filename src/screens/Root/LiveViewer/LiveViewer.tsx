import { RouteProp } from "@react-navigation/native";
import React, { FunctionComponent, useEffect, useRef } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { CAMERA_RATIO, SCREEN_WIDTH, STATUS_BAR_HEIGHT } from "../../../constants";
import { SuperRootStackParamList } from "../../../navigations";
import { goBack } from "../../../navigations/rootNavigation";
import Subscriber from "../../../components/subscriber";
import BottomOptions from "./BottomOptions";
import LiveTopOptions from "../../../components/LiveTopOptions/LiveTopOptions";
import { store } from "../../../store";
import { useSubscribe } from "../../../hooks/Live/useSubscribe";
import ProductsBottomSheet from "./ProductsBottomSheet";
import BottomSheet from "@gorhom/bottom-sheet";

type LiveViewerRouteProp = RouteProp<SuperRootStackParamList, "LiveViewer">;

type Props = {
  route: LiveViewerRouteProp;
};

const LiveViewer: FunctionComponent<Props> = ({ route }) => {
  const me = store.getState().user.user;
  const username = me.userInfo?.username!;
  const avatarURL = me.userInfo?.avatarURL!;
  const { item } = route.params;

  const { subscribe, unSubscribe } = useSubscribe(item.username);

  const sheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    subscribe();

    return () => {
      unSubscribe();
    };
  }, []);

  function openProducts() {
    sheetRef.current?.snapTo(1);
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.subContainer}>
          {/* <Subscriber username={username} streamId={item.username} /> */}
          <View style={styles.camera}>
            <Text>REMOVE ME AFTER TESTING</Text>
          </View>
          <LiveTopOptions streamerUsername={item.username} onClose={goBack} />
          <BottomOptions
            username={username}
            avatarURL={avatarURL}
            streamerUsername={item.username}
            openProducts={openProducts}
          />
        </View>
      </SafeAreaView>
      <ProductsBottomSheet streamerUsername={item.username} sheetRef={sheetRef} />
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

export default LiveViewer;
