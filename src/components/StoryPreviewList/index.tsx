import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, Animated } from "react-native";
import { useSelector } from "../../reducers";
import StoryAdderItem from "./StoryAdderItem";
import StoryPreviewItem from "./StoryPreviewItem";
import { SCREEN_WIDTH } from "../../constants";
import { useDispatch } from "react-redux";
import { FetchStoryListRequest } from "../../actions/storyActions";
import HorizontalLoadingSpinner from "../utils/HorizontalLoadingSpinner";

const index = () => {
  const [loadingStoryList, setLoadingStoryList] = useState<boolean>(true);
  const storyList = useSelector((state) => state.storyList);

  const dispatch = useDispatch();
  useEffect(() => {
    (async () => {
      await dispatch(FetchStoryListRequest());
      setLoadingStoryList(false);
    })();
  }, []);

  return (
    <View style={styles.container}>
      {loadingStoryList && <HorizontalLoadingSpinner />}
      <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} bounces={false}>
        <StoryAdderItem />
        {storyList.map((story, index) => (
          <StoryPreviewItem index={index} item={story} key={index} />
        ))}
      </ScrollView>
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    position: "relative",
    paddingVertical: 10,
    height: 104,
  },
  loading: {
    position: "absolute",
    width: 30,
    height: 30,
    left: (SCREEN_WIDTH - 30) / 2,
    top: (104 - 30) / 2,
    zIndex: 999,
  },
});
