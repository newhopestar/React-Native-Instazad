import React, { FunctionComponent } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";
import { bottomSheet } from "../../../navigations/BottomSheetNavigation";
import { navigate, replace } from "../../../navigations/rootNavigation";
import { Comment } from "../../../reducers/commentReducer";
import { ExtraPost } from "../../../reducers/postReducer";

interface Props {
  username: string;
  avatarURL: string;
  comment?: Comment;
  post?: ExtraPost;
}

const ProfilePreview: FunctionComponent<Props> = ({ username, avatarURL, post }) => {
  function onMessage() {
    replace("Conversation", { username, post });
  }

  return (
    <View>
      <FastImage style={styles.mainAvatar} source={{ uri: avatarURL }} />
      <Text>{username}</Text>
      <TouchableOpacity onPress={onMessage}>
        <Text>Message</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mainAvatar: {
    height: 80,
    width: 80,
    borderRadius: 80,
  },
});

export default ProfilePreview;
