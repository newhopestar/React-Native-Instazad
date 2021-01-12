import React, { useState, useEffect, FunctionComponent } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { FetchStoryListRequest } from "../../actions/storyActions";
import LivePreviewItem from "./LivePreviewItem";
import StoryAdderItem from "../StoryPreviewList/StoryAdderItem";
import HorizontalLoadingSpinner from "../utils/HorizontalLoadingSpinner";
import { LivePreview } from "../../reducers/liveReducer";
import { useSelector } from "../../reducers";
import { FetchLiveListRequest } from "../../actions/liveActions";
import { useDispatch } from "react-redux";

const LivePreviewList: FunctionComponent = () => {
  const [loadingLiveList, setLoadingLiveList] = useState<boolean>(true);
  const liveList = useSelector((state) => state.liveList);

  const dispatch = useDispatch();
  useEffect(() => {
    (async () => {
      await dispatch(FetchLiveListRequest());
      setLoadingLiveList(false);
    })();
  }, []);

  return (
    <View style={styles.container}>
      {loadingLiveList && <HorizontalLoadingSpinner />}
      <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} bounces={false}>
        {/* //TODO Make it LiveAdderItem */}
        <StoryAdderItem />
        {liveList.map((item) => (
          <LivePreviewItem key={item.username} item={item} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    paddingVertical: 10,
    height: 104,
  },
});

export default LivePreviewList;
