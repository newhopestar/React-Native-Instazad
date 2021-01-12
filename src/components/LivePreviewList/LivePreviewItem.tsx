import React, { useEffect, useState } from "react";
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { ExtraStory, seenTypes } from "../../reducers/storyReducer";
import FastImage from "react-native-fast-image";
import firestore from "@react-native-firebase/firestore";
import { navigate } from "../../navigations/rootNavigation";
import { store } from "../../store";
import { LivePreview } from "../../reducers/liveReducer";

export interface StoryPreviewItemProps {
  item: LivePreview;
}

const LivePreviewItem = ({ item }: StoryPreviewItemProps) => {
  const onShowLiveStream = () => {
    navigate("LiveViewer", { item });
  };

  return (
    <View style={styles.container}>
      <View style={styles.itemWrapper}>
        <LinearGradient
          colors={["#c62f90", "#db3072", "#f19d4c"]}
          start={{ x: 0.75, y: 0.25 }}
          end={{ x: 0.25, y: 0.75 }}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={onShowLiveStream} activeOpacity={0.8} style={styles.imageWrapper}>
            <FastImage style={styles.image} source={{ uri: item.avatarURL }} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.username}>
        <Text
          numberOfLines={1}
          style={{
            width: "100%",
            textAlign: "center",
            fontSize: 12,
            color: "#000",
          }}
        >
          {item.username}
        </Text>
      </View>
    </View>
  );
};

export default React.memo(LivePreviewItem);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 7.5,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
  },
  itemWrapper: {
    position: "relative",
    height: 64,
    width: 64,
    overflow: "hidden",
    borderRadius: 999,
  },
  username: {
    position: "absolute",
    bottom: 0,
    left: (64 - 74) / 2,
    width: 74,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    borderRadius: 999,
    width: 60,
    height: 60,
    padding: 2,
    backgroundColor: "#fff",
    top: 2,
    left: 2,
    position: "absolute",
  },
  imageWrapper: {
    backgroundColor: "#fff",
    width: "100%",
    height: "100%",
    borderRadius: 999,
  },
  image: {
    borderRadius: 999,
    width: "100%",
    height: "100%",
  },
});
