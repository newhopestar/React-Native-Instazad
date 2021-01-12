import React, { FunctionComponent } from "react";
import { Animated, SafeAreaView, StyleSheet, Text } from "react-native";
import { SCREEN_WIDTH } from "../../constants";

const HorizontalLoadingSpinner: FunctionComponent = () => {
  const _loadingDeg = new Animated.Value(0);

  const _onAnimateDeg = () => {
    Animated.timing(_loadingDeg, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      _loadingDeg.setValue(0);
      _onAnimateDeg();
    });
  };

  return (
    <Animated.Image
      onLayout={_onAnimateDeg}
      style={{
        ...styles.loading,
        transform: [
          {
            rotate: _loadingDeg.interpolate({
              inputRange: [0, 1],
              outputRange: ["0deg", "360deg"],
            }),
          },
        ],
      }}
      source={require("../../assets/icons/waiting.png")}
    />
  );
};

const styles = StyleSheet.create({
  loading: {
    position: "absolute",
    width: 30,
    height: 30,
    left: (SCREEN_WIDTH - 30) / 2,
    top: (104 - 30) / 2,
    zIndex: 999,
  },
});

export default HorizontalLoadingSpinner;
