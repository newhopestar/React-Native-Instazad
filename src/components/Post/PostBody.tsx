import React, { FunctionComponent, useEffect, useState } from "react";
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";
import { navigate } from "../../navigations/rootNavigation";
import { ExtraPost } from "../../reducers/postReducer";
import PhotoShower from "./PhotoShower";
import { useDispatch } from "react-redux";
import { ToggleLikePostRequest } from "../../actions/postActions";
import { ToggleBookMarkRequest } from "../../actions/userActions";
import { useSelector } from "../../reducers";
import { default as Icon, default as Icons } from "react-native-vector-icons/MaterialCommunityIcons";
import CirclePagination from "../CirclePagination";
import ShareToDirect from "../../screens/Others/BottomSheetScreens/ShareToDirect";
import { bottomSheet } from "../../navigations/BottomSheetNavigation";

interface Props {
  post: ExtraPost;
  setPost?: React.Dispatch<React.SetStateAction<ExtraPost>>;
}

const PostBody: FunctionComponent<Props> = ({ post, setPost }) => {
  const user = useSelector((state) => state.user.user);
  const bookmarks = useSelector((state) => state.user.bookmarks)?.find((x) => x.name === "All Posts")?.bookmarks || [];

  const [currentPage, setCurrentPage] = useState<number>(1);

  const dispatch = useDispatch();

  const isLiked = post.likes && post.likes?.indexOf(user.userInfo?.username || "") > -1;
  const isBookmarked = !!bookmarks.find((x) => x.postId === post.uid);

  const _animBookmarkNotification = React.useMemo(() => new Animated.Value(0), []);

  const _onChangePageHandler = (page: number) => {
    setCurrentPage(page);
  };

  const _onToggleBookmark = () => {
    const isBookmarked = !!bookmarks.find((x) => x.postId === post.uid);
    if (!isBookmarked) {
      Animated.sequence([
        Animated.timing(_animBookmarkNotification, {
          toValue: -44,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(_animBookmarkNotification, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
    dispatch(ToggleBookMarkRequest(post.uid as number, (post.source || [{ uri: "" }])[0].uri));
  };

  const _toggleLikePost = () => {
    dispatch(ToggleLikePostRequest(post.uid || 0, post, setPost));
  };

  const goToDetails = () => {
    //TODO:Implement this
  };

  return (
    <>
      <View style={styles.body}>
        <PhotoShower postId={post.uid!} onChangePage={_onChangePageHandler} sources={post.source || []} />
        <Animated.View
          style={{ ...styles.bookmarkAdditionNotification, transform: [{ translateY: _animBookmarkNotification }] }}
        >
          <View style={styles.bookmarkAdditionImageContainer}>
            <FastImage source={{ uri: (post.source || [])[0].uri }} style={styles.bookmarkPreviewImage} />
            <Text style={styles.savedMessage}>Saved</Text>
          </View>
          <TouchableOpacity onPress={() => navigate("Saved")} style={styles.btnGoToSaved}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
      <View style={styles.reactions}>
        <View style={styles.lReactions}>
          <TouchableOpacity onPress={_toggleLikePost}>
            <Icons name={isLiked ? "heart" : "heart-outline"} size={24} color={isLiked ? "red" : "#000"} />
          </TouchableOpacity>
          {post.likes && (
            <Text style={{ fontWeight: "bold" }}>
              {post.likes.length >= 1000 ? Math.round(post.likes.length / 1000) + "k" : post.likes.length}
            </Text>
          )}
          <TouchableOpacity onPress={goToDetails}>
            <Icon name="comment-outline" size={22} />
          </TouchableOpacity>
          {post.comments && (
            <Text style={{ fontWeight: "bold" }}>
              {post.comments.length >= 1000 ? Math.round(post.comments.length / 1000) + "k" : post.comments.length}
            </Text>
          )}
          <TouchableOpacity onPress={() => bottomSheet(<ShareToDirect item={{ ...post }} />)}>
            <Image style={styles.sendIcon} source={require("../../assets/icons/send.png")} />
          </TouchableOpacity>
        </View>
        {post.source && post.source.length > 1 && (
          <CirclePagination maxPage={post.source?.length || 0} currentPage={currentPage} />
        )}
        <TouchableOpacity activeOpacity={0.7} onPress={_onToggleBookmark}>
          <Image
            style={styles.bookmarkIcon}
            source={
              isBookmarked ? require("../../assets/icons/bookmarked.png") : require("../../assets/icons/bookmark.png")
            }
          />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  body: {
    overflow: "hidden",
  },
  bookmarkAdditionNotification: {
    position: "absolute",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 44,
    width: "100%",
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    bottom: -44,
    left: 0,
  },
  btnGoToSaved: {
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  bookmarkAdditionImageContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  savedMessage: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 10,
  },
  seeAll: {
    fontSize: 16,
    fontWeight: "500",
    color: "#318bfb",
  },
  bookmarkPreviewImage: {
    height: 30,
    width: 30,
    borderRadius: 5,
  },
  reactions: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lReactions: {
    flexDirection: "row",
    width: 24.3 * 3 + 15,
    justifyContent: "space-between",
    alignItems: "center",
  },
  sendIcon: {
    height: 20,
    width: 20,
  },
  bookmarkIcon: {
    height: 24,
    width: 24,
  },
});

export default PostBody;
