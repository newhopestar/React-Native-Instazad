import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { FunctionComponent, useRef, useState } from "react";
import { KeyboardAvoidingView, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icons from "react-native-vector-icons/MaterialCommunityIcons";
import CommentInputPopup from "../../../components/CommentInputPopup";
import CommentList from "../../../components/CommentList/CommentList";
import { goBack } from "../../../navigations/rootNavigation";
import { ExtraPost } from "../../../reducers/postReducer";

interface Props {
  post: ExtraPost;
  bidding?: boolean;
}

const Comments: FunctionComponent<Props> = ({ post, bidding }) => {
  const postId = post.uid!;
  const commentInputRef = useRef<TextInput>(null);
  const [currentReplyCommentId, setCurrentReplyCommentId] = useState<number>(0);
  const [currentReplyUsername, setCurrentReplyUsername] = useState<string>("");

  const _onReply = (commentId: number, targetUsername: string) => {
    commentInputRef.current?.focus();
    setCurrentReplyCommentId(commentId);
    setCurrentReplyUsername(targetUsername);
  };

  return (
    <>
      <CommentList post={post} onReply={_onReply} postId={postId} />
      <CommentInputPopup
        replyToCommentUsername={currentReplyUsername}
        replyToCommentId={currentReplyCommentId}
        preValue={currentReplyUsername ? `@${currentReplyUsername} ` : ""}
        commentInputRef={commentInputRef}
        id={postId}
        bidding={bidding}
      />
    </>
  );
};

export default Comments;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    height: "100%",
  },
  navigationBar: {
    flexDirection: "row",
    height: 44,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  btnBack: {
    height: 44,
    width: 44,
    justifyContent: "center",
    alignItems: "center",
  },
});
