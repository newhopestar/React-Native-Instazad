import { RouteProp } from "@react-navigation/native";
import React, { FunctionComponent, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Keyboard, SafeAreaView, StyleSheet, TouchableOpacity } from "react-native";
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from "react-native-gesture-handler";
import { SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from "../../constants";
import { SuperRootStackParamList } from "../../navigations";
import { goBack } from "../../navigations/rootNavigation";
import { useBottomSheet } from "../../utils/BottomSheetContext";

const TOP_OF_SCREEN = STATUS_BAR_HEIGHT - SCREEN_HEIGHT * 0.5;
const DRAG_THRESHOLD = SCREEN_HEIGHT * 0.05;

type BottomSheetRouteProp = RouteProp<SuperRootStackParamList, "BottomSheet">;
interface Props {
  route: BottomSheetRouteProp;
}

const BottomSheet: FunctionComponent<Props> = ({ route }) => {
  const { content } = route.params;

  const [isFullScreen, setIsFullScreen] = useBottomSheet();

  const ref = useRef<{ bottomSheetHeight: number; preOffsetY: number }>({
    bottomSheetHeight: 0,
    preOffsetY: 0,
  });
  const _bottomSheetOffsetY = useMemo(() => new Animated.Value(0), []);
  const _bottomSheetAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    if (isFullScreen) {
      animateToFullScreen();
    } else {
      animateToMiddleScreen();
    }
  }, [isFullScreen]);

  function animateToFullScreen() {
    Animated.timing(_bottomSheetAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    Animated.timing(_bottomSheetOffsetY, {
      toValue: TOP_OF_SCREEN,
      duration: 200,
      useNativeDriver: true,
    }).start();
    ref.current.preOffsetY = TOP_OF_SCREEN;
    setIsFullScreen(true);
  }

  function animateToMiddleScreen() {
    Animated.timing(_bottomSheetAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    Animated.spring(_bottomSheetOffsetY, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
    setIsFullScreen(false);
    ref.current.preOffsetY = 0;
    Keyboard.dismiss();
  }

  const _onGestureEventHandler = ({ nativeEvent: { translationY } }: PanGestureHandlerGestureEvent) => {
    if (translationY < TOP_OF_SCREEN) return;
    _bottomSheetOffsetY.setValue(ref.current.preOffsetY + translationY);
  };

  const _onStateChangeHandler = ({ nativeEvent: { translationY, state } }: PanGestureHandlerGestureEvent) => {
    if (state === State.END) {
      if (ref.current.preOffsetY + translationY > DRAG_THRESHOLD) {
        setIsFullScreen(false);
        dismiss();
        return;
      }

      if (isFullScreen) {
        if (translationY > DRAG_THRESHOLD) animateToMiddleScreen();
        else animateToFullScreen();
      } else {
        if (translationY < -DRAG_THRESHOLD) animateToFullScreen();
        else animateToMiddleScreen();
      }
    }
  };

  function dismiss() {
    Animated.timing(_bottomSheetOffsetY, {
      toValue: ref.current.bottomSheetHeight,
      useNativeDriver: true,
      duration: 200,
    }).start(() => goBack());
  }

  return (
    <SafeAreaView>
      <TouchableOpacity onPress={goBack} style={{ height: "100%", width: "100%" }}></TouchableOpacity>
      <PanGestureHandler onGestureEvent={_onGestureEventHandler} onHandlerStateChange={_onStateChangeHandler}>
        <Animated.View
          onLayout={(event) => (ref.current.bottomSheetHeight = event.nativeEvent.layout.height)}
          style={{
            ...styles.bottomSheet,
            borderTopLeftRadius: _bottomSheetAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 0] }),
            borderTopRightRadius: _bottomSheetAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 0] }),
            shadowOpacity: _bottomSheetAnim.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0] }),
            shadowRadius: _bottomSheetAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 1] }),
            transform: [{ translateY: _bottomSheetOffsetY }],
          }}
        >
          {content}
        </Animated.View>
      </PanGestureHandler>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    backgroundColor: "#fff",
    borderWidth: 0.5,
    borderColor: "#ddd",
    paddingBottom: 40,
    position: "absolute",
    zIndex: 1,
    top: SCREEN_HEIGHT * 0.5,
    left: 0,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    elevation: 5,
    height: SCREEN_HEIGHT,
  },
});

export default BottomSheet;
