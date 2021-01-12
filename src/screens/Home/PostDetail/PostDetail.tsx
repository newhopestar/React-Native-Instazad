import React, { ReactElement, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  FlatList,
  TextInput,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import NavigationBar from "../../../components/NavigationBar";
import { goBack } from "../../../navigations/rootNavigation";
import { RouteProp } from "@react-navigation/native";
import { SuperRootStackParamList } from "../../../navigations";
import { AuctionPost, DetailsType, ExtraPost, SalePost } from "../../../reducers/postReducer";
import { SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from "../../../constants";
import PhotoPostDetails from "./PostsDetails/PhotoPostDetails";
import AuctionPostDetails from "./PostsDetails/AuctionPostDetails/AuctionPostDetails";
import SalePostDetails from "./PostsDetails/SalePostDetails/SalePostDetails";
import usePost from "./usePost";
import useComments from "../../../components/CommentList/useComments";
import CommentInputPopup from "../../../components/CommentInputPopup";
import CommentItem from "../../../components/CommentList/CommentItem";
import VerticalLoadingSpinner from "../../../components/utils/VerticalLoadingSpinner";
import { Comment } from "../../../reducers/commentReducer";
import ProfilePreview from "../../Others/BottomSheetScreens/ProfilePreview";
import { bottomSheet } from "../../../navigations/BottomSheetNavigation";
import { store } from "../../../store";

type GalleryChooserRouteProp = RouteProp<SuperRootStackParamList, "PostDetail">;

type GalleryChooserProps = {
  route: GalleryChooserRouteProp;
};

const PostDetail = ({ route }: GalleryChooserProps) => {
  const postId = route.params.postId;

  const myUsername = store.getState().user.user.userInfo?.username || "";

  const { setPost, post } = usePost(postId);
  const { comments, loadMore } = useComments(postId);

  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [currentReplyCommentId, setCurrentReplyCommentId] = useState<number>(0);
  const [currentReplyUsername, setCurrentReplyUsername] = useState<string>("");

  const ref = useRef({ preOffsetY: 0 });

  const scrollRef = useRef<FlatList>(null);
  const commentInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (comments) setRefreshing(false);
    else setRefreshing(true);
  }, [comments]);

  const onReply = (commentId: number, targetUsername: string) => {
    setCurrentReplyCommentId(commentId);
    setCurrentReplyUsername(targetUsername);
    commentInputRef.current?.focus();
  };

  const onRefresh = async () => {
    // if (!refreshing) {
    //   setRefreshing(true);
    //   await dispatch(FetchCommentListRequest(postId, postData));
    //   setRefreshing(false);
    // }
  };

  const onLoadMore = async () => {
    if (!loadingMore) {
      setLoadingMore(true);
      // await dispatch(LoadMoreCommentListRequest(postId));
      loadMore();
      setLoadingMore(false);
    }
  };

  const onScrollHandler = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetPercent =
      (nativeEvent.contentSize.height - nativeEvent.contentOffset.y) / nativeEvent.contentSize.height;
    const isScrollDown = nativeEvent.contentOffset.y - ref.current.preOffsetY > 0;
    if (offsetPercent < 0.9 && isScrollDown) {
      onLoadMore();
    }
    ref.current.preOffsetY = nativeEvent.contentOffset.y;
  };

  const onInputFocus = () => {
    if (!currentReplyCommentId) {
      setTimeout(() => scrollRef.current?.scrollToIndex({ animated: true, index: 0 }), 100);
    } else {
      setTimeout(
        () =>
          scrollRef.current?.scrollToIndex({
            animated: true,
            index: comments?.findIndex((comment) => comment.uid === currentReplyCommentId)!,
          }),
        100
      );
    }
  };

  function onShowProfile(comment: Comment) {
    if (comment.userId !== myUsername) {
      bottomSheet(
        <ProfilePreview username={comment.userId!} avatarURL={comment.avatarURL!} comment={comment} post={post} />
      );
    }
  }

  function getPostDetailsElement(type: DetailsType): ReactElement | null {
    if (type === "photo") return <PhotoPostDetails post={post} setPost={setPost} />;
    if (type === "auction") return <AuctionPostDetails post={post as AuctionPost} setPost={setPost} />;
    if (type === "sale") return <SalePostDetails post={post as SalePost} setPost={setPost} />;
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="height" style={{ height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT }}>
        <NavigationBar title="Feed" callback={goBack} />
        {post.hasOwnProperty("uid") && (
          <>
            <FlatList
              ref={scrollRef}
              data={comments}
              refreshing={refreshing}
              onRefresh={onRefresh}
              keyExtractor={(_, index) => `${index}`}
              onScroll={onScrollHandler}
              scrollEventThrottle={30}
              ListHeaderComponent={getPostDetailsElement(post.type!)}
              renderItem={({ item }) => (
                <CommentItem postId={post.uid!} onReply={onReply} item={item} onShowProfile={onShowProfile} />
              )}
              ListFooterComponent={() => <VerticalLoadingSpinner loading={loadingMore} />}
            />
            <CommentInputPopup
              replyToCommentUsername={currentReplyUsername}
              replyToCommentId={currentReplyCommentId}
              preValue={currentReplyUsername ? `@${currentReplyUsername} ` : ""}
              commentInputRef={commentInputRef}
              id={post.uid!}
              bidding
              onFocus={onInputFocus}
            />
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PostDetail;

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    backgroundColor: "#fff",
  },
});
