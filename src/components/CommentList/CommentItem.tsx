import React, { FunctionComponent } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import { Comment } from "../../reducers/commentReducer";
import Icons from "react-native-vector-icons/MaterialCommunityIcons";
import { SCREEN_WIDTH } from "../../constants";
import { useSelector } from "../../reducers";
import { timestampToString } from "../../utils";
import { useDispatch } from "react-redux";
import { ToggleLikeCommentRequest } from "../../actions/commentActions";
import ReplyCommentItem from "./ReplyCommentItem";
import { bottomSheet } from "../../navigations/BottomSheetNavigation";
import ProfilePreview from "../../screens/Others/BottomSheetScreens/ProfilePreview";
import { navigate } from "../../navigations/rootNavigation";

export interface CommentItemProps {
  postId: number;
  item: Comment;
  onReply: (a: number, b: string) => void;
  onShowProfile: (comment: Comment) => void;
}

const CommentItem: FunctionComponent<CommentItemProps> = ({ item, onReply, postId, onShowProfile }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const isLiked =
    item.likes?.indexOf(user.userInfo?.username || "") !== undefined &&
    item.likes?.indexOf(user.userInfo?.username || "") > -1;

  const _onToggleLikeComment = () => {
    if (item?.uid) {
      dispatch(ToggleLikeCommentRequest(postId, item.uid));
    }
  };

  const _onReply = () => {
    if (item.uid && item.userId) {
      onReply(item.uid, item.userId);
    }
  };

  return (
    <View>
      <View style={styles.container}>
        <View style={{ flexDirection: "row", maxWidth: SCREEN_WIDTH - 30 - 30 - 30 }}>
          <TouchableOpacity onPress={() => onShowProfile(item)}>
            <Image source={{ uri: item.avatarURL }} style={styles.avatar} />
          </TouchableOpacity>
          <View style={{ marginLeft: 10 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              <TouchableOpacity onPress={() => onShowProfile(item)}>
                <Text style={{ fontWeight: "bold" }}>{item.userId} </Text>
              </TouchableOpacity>
              <Text>{item.content}</Text>
              {item.bid && <Text style={{ marginLeft: 100 }}>{`bid: ${item.bid}`}</Text>}
            </View>
            <View>
              <View style={styles.infoWrapper}>
                <Text style={{ color: "#666" }}>{timestampToString(item.create_at?.toMillis() || 0)}</Text>
                {item.likes && item.likes.length > 0 && (
                  <Text style={{ color: "#666", fontWeight: "600" }}>
                    {item.likes.length} {item.likes.length < 2 ? "like" : "likes"}
                  </Text>
                )}
                <TouchableOpacity onPress={_onReply}>
                  <Text style={{ color: "#666", fontWeight: "600" }}>Reply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={_onToggleLikeComment} style={styles.btnLove}>
          <Icons name={isLiked ? "heart" : "heart-outline"} color={isLiked ? "red" : "#666"} size={20} />
        </TouchableOpacity>
      </View>
      <View>
        {item.replies &&
          item.replies.map((reply, index) => (
            <ReplyCommentItem
              postId={postId}
              onReply={onReply}
              commentId={item.uid || 0}
              key={index}
              item={reply}
              onShowProfile={onShowProfile}
            />
          ))}
      </View>
    </View>
  );
};

export default React.memo(CommentItem);

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    minHeight: 44,
    flexDirection: "row",
    paddingHorizontal: 15,
    justifyContent: "space-between",
  },
  avatar: {
    height: 30,
    width: 30,
    borderRadius: 30,
    borderColor: "#333",
    borderWidth: 0.3,
  },
  btnLove: {
    height: 44,
    width: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  infoWrapper: {
    marginVertical: 2,
    flexDirection: "row",
    width: 160,
    justifyContent: "space-between",
  },
});
