import React, { FunctionComponent, useEffect, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity } from "react-native";
import { RemoveEmoijToMessageRequest, AddEmoijToMessageRequest } from "../../../../actions/messageActions";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../../../../constants";
import { useDispatch } from "react-redux";
import { emojiTypes, ExtraMessage, Message } from "../../../../reducers/messageReducer";

const EMOJI_SELECTION_BAR_WIDTH = 44 * 6 + 15;

export interface ReactionEmojiSelectorProps {
  conversation: ExtraMessage;
  targetUsername: string;
  targetMsg?: Message;
  isMyMessage?: boolean;
  px?: number;
  py?: number;
  preventNextScroll: () => void;
}

const ReactionEmojiSelector: FunctionComponent<ReactionEmojiSelectorProps> = ({
  px,
  py,
  conversation,
  isMyMessage,
  targetMsg,
  targetUsername,
  preventNextScroll,
}) => {
  const dispatch = useDispatch();

  const [showSelector, setShowSelector] = useState(false);

  const _emojiBarAnimX = React.useMemo(() => new Animated.Value(0), []);
  const _emojiBarAnimY = React.useMemo(() => new Animated.Value(0), []);
  const _emojiBarAnimRatio = React.useMemo(() => new Animated.Value(0), []);
  const _emojiPointAnimOffsetX = React.useMemo(() => new Animated.Value(0), []);
  const _emojiPointAnimOpacity = React.useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    _onShowEmojiSelection();
  }, [px, py, isMyMessage, targetMsg]);

  const _onShowEmojiSelection = React.useCallback(() => {
    if (px && py && targetMsg) {
      setShowSelector(true);
      _emojiBarAnimY.setValue(py - 50);
      if (px > SCREEN_WIDTH / 2) {
        _emojiBarAnimX.setValue(SCREEN_WIDTH - 15 - EMOJI_SELECTION_BAR_WIDTH);
      } else _emojiBarAnimX.setValue(15);
      //show selected emoji
      if (targetMsg.ownEmoji && isMyMessage) {
        _emojiPointAnimOffsetX.setValue(7.5 + (targetMsg.ownEmoji - 1) * 44 + 22 - 1.5);
      }
      if (targetMsg.yourEmoji && !isMyMessage) {
        _emojiPointAnimOffsetX.setValue(7.5 + (targetMsg.yourEmoji - 1) * 44 + 22 - 1.5);
      }
      if (!(targetMsg.ownEmoji && isMyMessage) && !(targetMsg.yourEmoji && !isMyMessage))
        _emojiPointAnimOpacity.setValue(0);
      else _emojiPointAnimOpacity.setValue(1);
      //end show selected emoji
      Animated.spring(_emojiBarAnimRatio, {
        useNativeDriver: true,
        toValue: 1,
      }).start();
    }
  }, [conversation?.messageList, px, py, isMyMessage, targetMsg]);

  const _onHideEmojiSelection = () => {
    Animated.timing(_emojiBarAnimRatio, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowSelector(false));
  };

  const _onEmojiSelect = (emojiType: "LOVE" | "HAHA" | "WOW" | "SAD" | "ANGRY" | "LIKE") => {
    preventNextScroll();
    _onHideEmojiSelection();
    const emoji = emojiTypes[emojiType];
    if ((targetMsg!.ownEmoji === emoji && isMyMessage) || (targetMsg!.yourEmoji === emoji && !isMyMessage)) {
      return dispatch(RemoveEmoijToMessageRequest(targetUsername, targetMsg!.uid));
    }
    dispatch(AddEmoijToMessageRequest(targetUsername, targetMsg!.uid, emoji));
  };

  return showSelector ? (
    <TouchableOpacity
      style={{
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        position: "absolute",
        zIndex: 10,
        top: 0,
        left: 0,
      }}
      onPress={_onHideEmojiSelection}
      activeOpacity={1}
    >
      <Animated.View
        style={{
          ...styles.emojiSelectionBar,
          transform: [{ translateY: _emojiBarAnimY }, { translateX: _emojiBarAnimX }, { scale: _emojiBarAnimRatio }],
        }}
      >
        {
          <Animated.View
            style={{
              ...styles.selectedEmojiPoint,
              opacity: _emojiPointAnimOpacity,
              transform: [{ translateX: _emojiPointAnimOffsetX }],
            }}
          />
        }
        <TouchableOpacity onPress={_onEmojiSelect.bind(null, "LOVE")} style={styles.btnEmoji}>
          <Text style={styles.emoji}>❤️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_onEmojiSelect.bind(null, "HAHA")} style={styles.btnEmoji}>
          <Text style={styles.emoji}>😂</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_onEmojiSelect.bind(null, "WOW")} style={styles.btnEmoji}>
          <Text style={styles.emoji}>😮</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_onEmojiSelect.bind(null, "SAD")} style={styles.btnEmoji}>
          <Text style={styles.emoji}>😢</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_onEmojiSelect.bind(null, "ANGRY")} style={styles.btnEmoji}>
          <Text style={styles.emoji}>😡</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_onEmojiSelect.bind(null, "LIKE")} style={styles.btnEmoji}>
          <Text style={styles.emoji}>👍</Text>
        </TouchableOpacity>
      </Animated.View>
    </TouchableOpacity>
  ) : null;
};

const styles = StyleSheet.create({
  btnEmoji: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: {
    fontSize: 30,
  },
  emojiSelectionBar: {
    position: "absolute",
    zIndex: 999,
    backgroundColor: "#fff",
    top: 0,
    left: 0,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    borderRadius: 44,
    paddingHorizontal: 7.5,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  selectedEmojiPoint: {
    height: 3,
    width: 3,
    borderRadius: 3,
    backgroundColor: "#666",
    position: "absolute",
    bottom: 2,
  },
});

export default ReactionEmojiSelector;
