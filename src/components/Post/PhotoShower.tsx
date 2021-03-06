import React, { useState, useRef, FunctionComponent } from "react";
import {
  Text,
  ScrollView,
  StyleSheet,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TouchableOpacity,
} from "react-native";
import { SCREEN_WIDTH } from "../../constants";
import ScaleImage from "../ScaleImage";
import { PostImage } from "../../reducers/postReducer";
import FastImage from "react-native-fast-image";
import { navigate } from "../../navigations/rootNavigation";

export interface Props {
  sources: PostImage[];
  onChangePage?: (page: number) => any;
  postId: number;
}

const PhotoShower: FunctionComponent<Props> = ({ sources, onChangePage, postId }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const scrollRef = useRef<ScrollView>(null);

  const _onEndDragHandler = ({
    nativeEvent: {
      contentOffset: { x },
    },
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currIndex = Math.floor(x / SCREEN_WIDTH);
    const offsetXpercent = (x - Math.floor(x / SCREEN_WIDTH) * SCREEN_WIDTH) / SCREEN_WIDTH;

    if (offsetXpercent > 0.5) {
      scrollRef.current?.scrollTo({
        x: (currIndex + 1) * SCREEN_WIDTH,
        y: 0,
        animated: true,
      });

      if (onChangePage) onChangePage(currIndex + 2);
      setCurrentPage(currIndex + 2);
    } else {
      scrollRef.current?.scrollTo({
        x: currIndex * SCREEN_WIDTH,
        y: 0,
        animated: true,
      });

      if (onChangePage) onChangePage(currIndex + 1);
      setCurrentPage(currIndex + 1);
    }
  };

  return (
    <View style={styles.container}>
      {sources.length > 1 && (
        <View style={styles.paging}>
          <Text style={styles.pagingText}>
            {currentPage}/{sources?.length}
          </Text>
        </View>
      )}
      <ScrollView
        ref={scrollRef}
        onScrollEndDrag={_onEndDragHandler}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        horizontal={true}
      >
        {sources &&
          sources.map((img, index) => (
            <TouchableOpacity key={index} activeOpacity={1} onPress={() => navigate("PostDetail", { postId })}>
              <View>
                {img.fullSize ? (
                  <FastImage
                    style={{
                      width: img.width < img.height ? (img.width * SCREEN_WIDTH) / img.height : SCREEN_WIDTH,
                      height: img.width > img.height ? (img.height * SCREEN_WIDTH) / img.width : SCREEN_WIDTH,
                    }}
                    source={{ uri: img.uri }}
                  />
                ) : (
                  <ScaleImage
                    height={(img.height * SCREEN_WIDTH) / img.width}
                    width={SCREEN_WIDTH}
                    source={{ uri: img.uri }}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );
};

export default React.memo(PhotoShower);

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  paging: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.9)",
    padding: 5,
    paddingHorizontal: 10,
    zIndex: 99,
    borderRadius: 50,
    top: 10,
    right: 10,
  },
  pagingText: {
    fontWeight: "600",
    color: "#fff",
  },
});
