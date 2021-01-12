import React, { RefObject, useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { PostReplyRequest } from "../../actions/commentActions";
import { PostCommentRequest } from "../../actions/postActions";
import { SCREEN_WIDTH } from "../../constants";
import { useSelector } from "../../reducers";
import { ExtraPost } from "../../reducers/postReducer";
import NumberInput from "../NumberInput/NumberInput";

export interface CommentInputPopupProps {
  commentInputRef: RefObject<TextInput>;
  id: number;
  setCommentContents?: (id: number, content: string) => void;
  preValue?: string;
  replyToCommentId?: number;
  replyToCommentUsername?: string;
  onDone?: () => void;
  postData?: ExtraPost;
  setPost?: React.Dispatch<React.SetStateAction<ExtraPost>>;
  bidding?: boolean;
  onFocus?: () => void;
}
const index = ({
  postData,
  setPost,
  commentInputRef,
  preValue,
  replyToCommentId,
  replyToCommentUsername,
  onDone,
  setCommentContents,
  id,
  bidding,
  onFocus,
}: CommentInputPopupProps) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const [isReplying, setIsReplying] = useState(false);
  const [text, setText] = useState<string>(preValue || "");
  const [bid, setBid] = useState<number>();
  const [commenting, setCommenting] = useState<boolean>(false);
  const _loadingDeg = React.useMemo(() => new Animated.Value(0), []);

  const _onAnimatedLoading = () => {
    Animated.timing(_loadingDeg, {
      toValue: 5,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (replyToCommentId && replyToCommentId !== 0) {
      setIsReplying(true);
    }
  }, [replyToCommentId]);

  useEffect(() => {
    if (preValue !== undefined) {
      setText(preValue);
    }
  }, [preValue]);

  const _onHideReplyLabel = () => {
    setIsReplying(false);
  };

  const _postComment = () => {
    setCommenting(true);
    if (isReplying && replyToCommentId) {
      (async () => {
        await dispatch(PostReplyRequest(id, replyToCommentId, text, bid));
      })().then(() => {
        _onHideReplyLabel();
        setCommenting(false);
        setText("");
        setBid(undefined);
        if (onDone) onDone();
      });
    } else
      (async () => {
        if (setPost && postData) {
          await dispatch(PostCommentRequest(id, text, bid, undefined, undefined, postData, setPost));
        } else await dispatch(PostCommentRequest(id, text, bid));
      })().then(() => {
        setCommenting(false);
        setText("");
        setBid(undefined);
        if (onDone) onDone();
        if (setCommentContents) setCommentContents(id, "");
      });
  };

  return (
    <View style={styles.commentInputWrapper}>
      {isReplying && (
        <View style={styles.replyLabelWrapper}>
          <Text style={{ color: "#666" }}>Replying to {replyToCommentUsername}</Text>
          <TouchableOpacity onPress={_onHideReplyLabel} style={styles.btnHideReplyLabel}>
            <Text style={{ color: "#666", fontSize: 20 }}>×</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.inputWrapper}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image style={styles.avatar} source={{ uri: user.userInfo?.avatarURL, cache: "force-cache" }} />
          <TextInput
            value={text}
            onChangeText={(e) => {
              if (setCommentContents) setCommentContents(id, e);
              setText(e);
            }}
            onFocus={onFocus}
            placeholder="Add a comment..."
            ref={commentInputRef}
            style={styles.commentInput}
          />
          {bidding && (
            <NumberInput
              value={bid}
              onChange={(number) => setBid(number)}
              placeholder="Bid"
              style={styles.bidInput}
              onFocus={onFocus}
            />
          )}
        </View>
        <TouchableOpacity disabled={commenting || text.length === 0} onPress={_postComment} style={styles.btnPost}>
          {!commenting && <Text style={{ color: "#318bfb", fontWeight: "600" }}>POST</Text>}
          {commenting && (
            <Animated.Image
              onLayout={_onAnimatedLoading}
              style={{
                height: 30,
                width: 30,
                transform: [
                  { rotate: _loadingDeg.interpolate({ inputRange: [0, 5], outputRange: ["0deg", "1800deg"] }) },
                ],
              }}
              source={require("../../assets/icons/waiting.png")}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default React.memo(index);

const styles = StyleSheet.create({
  commentInputWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    backgroundColor: "#fff",
  },
  iconItem: {
    height: 36,
    width: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 18,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  avatar: {
    height: 30,
    width: 30,
    borderRadius: 30,
  },
  commentInput: {
    paddingHorizontal: 10,
    height: 44,
    width: SCREEN_WIDTH - 30 - 30 - 40 - 50,
    fontSize: 16,
  },
  bidInput: { height: 44, width: 50, fontSize: 16 },
  btnPost: {
    width: 40,
  },
  replyLabelWrapper: {
    height: 36,
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 15,
    position: "absolute",
    zIndex: -1,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ddd",
    top: -36,
  },
  btnHideReplyLabel: {},
});
