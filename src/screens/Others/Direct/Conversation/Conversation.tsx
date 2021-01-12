import { RouteProp } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import {
  CreateEmptyConversationRequest,
  CreateMessageRequest,
  MakeSeenRequest,
} from "../../../../actions/messageActions";
import MessageItem from "../../../../components/MessageItem";
import { SCREEN_HEIGHT, SCREEN_WIDTH, STATUS_BAR_HEIGHT } from "../../../../constants";
import { SuperRootStackParamList } from "../../../../navigations";
import { useSelector } from "../../../../reducers";
import { PostingMessage, seenTypes } from "../../../../reducers/messageReducer";
import { store } from "../../../../store";
import ReactionEmojiSelector, { ReactionEmojiSelectorProps } from "./ReactionEmojiSelector";
import NavigationBar from "./NavigationBar";
import Gallery from "./Gallery";
import FastImage from "react-native-fast-image";

export const MAX_GALLERY_HEIGHT = SCREEN_WIDTH + 44;

type ConversationRouteProp = RouteProp<SuperRootStackParamList, "Conversation">;
type ConversationProps = {
  route: ConversationRouteProp;
};

const Conversation = ({ route }: ConversationProps) => {
  const dispatch = useDispatch();
  const myUsername = store.getState().user.user.userInfo?.username || "";
  const targetUsername = route.params.username;
  const myCurrentBlockAccounts =
    useSelector((state) => state.user.setting?.privacy?.blockedAccounts?.blockedAccounts) || [];
  const conversation = useSelector(
    (state) => state.messages.filter((group) => group.ownUser.username === targetUsername)[0]
  );
  console.log(conversation.messageList);

  const [typing, setTyping] = useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const [post, setPost] = useState(route.params.post);
  const [showGallery, setShowGallery] = useState<boolean>(false);
  const [reactionSelectorProps, setReactionSelectorProps] = useState<ReactionEmojiSelectorProps>({
    conversation,
    targetUsername,
    preventNextScroll: () => (ref.current.preventNextScrollToEnd = true),
  });

  const _flatlistRef = useRef<FlatList>(null);
  const ref = useRef({
    scrollTimeOut: setTimeout(() => {}, 0),
    text: "",
    preventNextScrollToEnd: false,
  });
  const _galleryAnim = React.useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    if (!!!conversation) {
      dispatch(CreateEmptyConversationRequest(targetUsername));
      return;
    }
    if (conversation.messageList.length > 0) {
      const myUsername = store.getState().user.user.userInfo?.username || "";
      const isMyMessage = conversation.messageList[0].userId === myUsername;
      const unRead = !isMyMessage && conversation.messageList[0].seen === seenTypes.NOTSEEN;
      if (unRead) {
        dispatch(MakeSeenRequest(conversation.messageList[0].userId, conversation.messageList[0].uid));
      }
    }
  }, [conversation]);

  const _onSendText = () => {
    if (text.length > 0) {
      const msg: PostingMessage = {
        seen: 0,
        type: post?.uid ? 4 : 1,
        postId: post?.uid,
        text,
        create_at: new Date().getTime(),
      };
      dispatch(CreateMessageRequest(msg, targetUsername));
      setText("");
      setPost(undefined);
    }
  };

  function _onShowEmojiSelection(px: number, py: number, index: number) {
    const targetMsg = conversation.messageList[index];
    const isMyMessage = targetMsg.userId === myUsername;
    setReactionSelectorProps((oldProps) => ({ ...oldProps, px, py, targetMsg, isMyMessage }));
  }

  const _onShowGallery = () => {
    ref.current.text = text;
    setText("");
    Animated.spring(_galleryAnim, {
      toValue: MAX_GALLERY_HEIGHT,
      useNativeDriver: true,
    }).start(() => setShowGallery(true));
  };

  const _onHideGallery = () => {
    setText(ref.current.text);
    Animated.spring(_galleryAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
    setShowGallery(false);
  };

  const _onMsgInputFocus = () => {
    setTyping(true);
  };

  const _onMessageBoxSizeChange = () => {
    if (conversation.messageList.length > 0 && !ref.current.preventNextScrollToEnd && typing) {
      clearTimeout(ref.current.scrollTimeOut);
      ref.current.scrollTimeOut = setTimeout(() => {
        _flatlistRef.current?.scrollToIndex({
          index: 0,
          animated: true,
        });
      }, 100);
    }
    if (ref.current.preventNextScrollToEnd) {
      ref.current.preventNextScrollToEnd = false;
    }
  };
  if (!!!conversation || !!!conversation.online)
    return (
      <View
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#fff",
          justifyContent: "center",
          alignItems: "center",
        }}
      ></View>
    );

  const isBlocked =
    myCurrentBlockAccounts.indexOf(targetUsername) > -1 ||
    (conversation.ownUser.privacySetting?.blockedAccounts?.blockedAccounts &&
      conversation.ownUser.privacySetting?.blockedAccounts?.blockedAccounts.indexOf(myUsername) > -1);

  return (
    <View style={styles.container}>
      <ReactionEmojiSelector {...reactionSelectorProps} />
      <NavigationBar
        username={conversation.ownUser.username!}
        avatarURL={conversation.ownUser.avatarURL!}
        fullName={conversation.ownUser.fullname!}
        status={conversation.online.status}
        lastOnline={conversation.online.last_online}
      />
      <KeyboardAvoidingView behavior="height" style={styles.messagesContainer}>
        <Animated.View
          style={{
            ...styles.inboxContainer,
            height: showGallery ? SCREEN_HEIGHT - STATUS_BAR_HEIGHT - MAX_GALLERY_HEIGHT : "100%",
            transform: [
              {
                translateY: Animated.multiply(
                  -1,
                  Animated.subtract(
                    _galleryAnim,
                    Animated.multiply(64, Animated.divide(_galleryAnim, MAX_GALLERY_HEIGHT))
                  )
                ),
              },
            ],
          }}
        >
          <FlatList
            showsVerticalScrollIndicator={false}
            ref={_flatlistRef}
            onLayout={_onMessageBoxSizeChange}
            style={{ height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT - 88 - 30 }}
            data={conversation.messageList || []}
            renderItem={({ item, index }) => (
              <MessageItem
                {...{
                  item,
                  index,
                  owner: conversation.ownUser,
                  showMsgEmojiSelection: _onShowEmojiSelection,
                }}
              />
            )}
            keyExtractor={(__, index) => `${index}`}
            inverted
          />
          {post && (
            <View style={styles.postLabelWrapper}>
              <FastImage source={{ uri: post.source![0].uri }} style={styles.postPreviewImage} />
              <Text style={styles.postCaption}>{post.content}</Text>
              <TouchableOpacity onPress={() => setPost(undefined)}>
                <Text style={{ color: "#666", fontSize: 15, fontWeight: "600", marginRight: 20 }}>×</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.msgInputWrapper}>
            {!isBlocked && (
              <>
                <TextInput
                  value={text}
                  onChangeText={setText}
                  multiline={true}
                  onFocus={_onMsgInputFocus}
                  onBlur={setTyping.bind(null, false)}
                  style={{
                    ...styles.msgInput,
                    width: typing || text.length > 0 ? SCREEN_WIDTH - 30 - 44 - 60 : SCREEN_WIDTH - 30 - 44,
                  }}
                  placeholder="Message..."
                />
                {typing || text.length > 0 ? (
                  <TouchableOpacity onPress={_onSendText} style={styles.btnSend}>
                    <Text style={{ fontWeight: "600", color: "#318bfb" }}>Send</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    {text.length === 0 && (
                      <View style={styles.msgRightOptions}>
                        <TouchableOpacity onPress={_onShowGallery} style={styles.btnNavigation}>
                          <Image
                            style={{ width: 20, height: 20 }}
                            source={require("../../../../assets/icons/photo.png")}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
              </>
            )}
            {isBlocked && (
              <Text style={{ textAlign: "center", width: "100%", color: "#666" }}>
                You can't not reply to this conversation.
              </Text>
            )}
          </View>
        </Animated.View>
        <Gallery
          galleryAnim={_galleryAnim}
          onHide={_onHideGallery}
          myUsername={myUsername}
          targetUsername={targetUsername}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

export default Conversation;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  btnNavigation: {
    height: 44,
    width: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesContainer: {
    backgroundColor: "#fff",
    width: "100%",
    height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT - 44,
    paddingBottom: 20,
  },
  inboxContainer: {
    height: "100%",
    width: "100%",
    position: "absolute",
    zIndex: -1,
    bottom: 20,
    left: 0,
  },
  msgInputWrapper: {
    marginTop: 5,
    width: SCREEN_WIDTH - 30,
    marginHorizontal: 15,
    minHeight: 44,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  msgInput: {
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  btnSend: {
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    width: 60,
  },
  msgRightOptions: {
    flexDirection: "row",
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 0,
    bottom: 0,
    marginRight: 4,
  },
  postLabelWrapper: {
    height: 40,
    width: "100%",
    backgroundColor: "#fff",
    zIndex: -1,
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
  },
  postPreviewImage: {
    height: 30,
    width: 30,
    borderRadius: 5,
  },
  postCaption: {
    fontSize: 16,
    marginHorizontal: 10,
    flex: 1,
  },
  hidePostButton: {
    backgroundColor: "green",
  },
});
