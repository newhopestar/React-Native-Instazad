import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import StoryTaker from "../screens/Camera/StoryTaker/StoryTaker";
import LivePreparer from "../screens/Camera/LivePreparer";
import { Alert, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { RNCamera } from "react-native-camera";
import { CAMERA_RATIO, SCREEN_HEIGHT, SCREEN_WIDTH } from "../constants";
import { RouteProp, useIsFocused } from "@react-navigation/native";
import Carousel from "react-native-snap-carousel";
import { rootStackParamList } from "./RootTab";
import LivePublisher from "../screens/Camera/LivePublisher/LivePublisher";

const SIDESWIPE_WIDTH = SCREEN_WIDTH / 2;
const SIDESWIPE_ITEM_WIDTH = 60;

type StoryTakerRouteProp = RouteProp<rootStackParamList, "CameraTab">;

interface Props {
  route: StoryTakerRouteProp;
}

const CameraTab: FunctionComponent<Props> = ({ route }) => {
  const { setSwipeEnabled } = route.params;
  const [front, setFront] = useState<boolean>(false);
  const [flash, setFlash] = useState<boolean>(false);
  const [publish, setPublish] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(1);

  const cameraRef = useRef<RNCamera>(null);
  const CarouselRef = useRef<Carousel<string>>(null);
  const focused = useIsFocused();

  const toggleFront = () => setFront(!front);
  const toggleFlash = () => setFlash(!flash);

  useEffect(() => {
    CarouselRef.current?.triggerRenderingHack();
  }, []);

  function onPublish() {
    setSwipeEnabled(false);
    setPublish(true);
  }

  function onUnpublish() {
    setSwipeEnabled(true);
    setPublish(false);
  }

  return !publish ? (
    <SafeAreaView style={styles.container}>
      {focused && (
        <RNCamera
          ratio="16:9"
          pictureSize="3840x2160"
          captureAudio={false}
          ref={cameraRef}
          style={styles.camera}
          type={front ? "front" : "back"}
          flashMode={flash ? "on" : "off"}
        />
      )}
      {currentIndex === 0 ? (
        <StoryTaker cameraRef={cameraRef} useFront={() => [front, toggleFront]} useFlash={() => [flash, toggleFlash]} />
      ) : (
        <LivePreparer onPublish={onPublish} useFront={() => [front, toggleFront]} />
      )}
      <View style={styles.sliderContainer}>
        <Carousel
          ref={CarouselRef}
          data={["Story", "Live"]}
          renderItem={({ item }: { item: string }) => <Text style={styles.sliderItem}>{item}</Text>}
          sliderWidth={SIDESWIPE_WIDTH}
          itemWidth={SIDESWIPE_ITEM_WIDTH}
          onBeforeSnapToItem={(index) => setCurrentIndex(index)}
          firstItem={1}
          useScrollView
          swipeThreshold={1}
        />
      </View>
    </SafeAreaView>
  ) : (
    <LivePublisher onUnpublish={onUnpublish} useFront={() => [front, toggleFront]} />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    flexGrow: 1,
  },
  camera: {
    zIndex: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * CAMERA_RATIO,
    borderRadius: 15,
    overflow: "hidden",
  },
  sliderContainer: {
    height: 100,
    position: "absolute",
    bottom: 0,
    left: SCREEN_WIDTH / 4,
    width: SCREEN_WIDTH / 2,
    zIndex: 1000,
  },
  sliderItem: {
    width: SIDESWIPE_ITEM_WIDTH,
    fontSize: 20,
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    lineHeight: 80,
  },
});

export default CameraTab;
