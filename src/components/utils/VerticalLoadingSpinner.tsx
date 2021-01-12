import React, { FunctionComponent } from "react";
import { Animated, View } from "react-native";

interface Props {
  loading: boolean;
}

const VerticalLoadingSpinner: FunctionComponent<Props> = ({ loading }) => {
  const _loadingDeg = new Animated.Value(0);

  const _onAnimateLoading = () => {
    Animated.timing(_loadingDeg, {
      toValue: 5,
      duration: 400 * 5,
      useNativeDriver: true,
    }).start(() => {
      _loadingDeg.setValue(0);
      _onAnimateLoading();
    });
  };

  return (
    <View style={{ marginBottom: 85, height: 44, justifyContent: "center", alignItems: "center" }}>
      {loading && (
        <Animated.Image
          onLayout={_onAnimateLoading}
          style={{
            height: 30,
            width: 30,
            transform: [{ rotate: _loadingDeg.interpolate({ inputRange: [0, 5], outputRange: ["0deg", "1800deg"] }) }],
          }}
          source={require("../../assets/icons/waiting.png")}
        />
      )}
    </View>
  );
};

export default VerticalLoadingSpinner;
