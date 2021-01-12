import React, { FunctionComponent } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";
import { navigate, navigation } from "../../navigations/rootNavigation";
import { ExtraPost } from "../../reducers/postReducer";
import { store } from "../../store";
import { default as Icon, default as Icons } from "react-native-vector-icons/MaterialCommunityIcons";

interface Props {
  post: ExtraPost;
  setPost?: React.Dispatch<React.SetStateAction<ExtraPost>>;
}

const PostHeader: FunctionComponent<Props> = ({ post, setPost }) => {
  const myUsername = store.getState().user.user.userInfo?.username;

  function onHeaderPress() {
    myUsername === post.ownUser?.username
      ? navigate("AccountIndex")
      : navigate("ProfileX", {
          username: post.ownUser?.username,
        });
  }

  return (
    <View style={styles.postHeader}>
      <TouchableOpacity style={styles.infoWrapper} onPress={onHeaderPress}>
        <FastImage style={styles.avatar} source={{ uri: post.ownUser?.avatarURL }} />
        <Text style={styles.username}>{post.ownUser?.username}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.push("PostOptions", { item: post, setPost })}>
        <Icons name="dots-vertical" size={24} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderTopColor: "#ddd",
    borderTopWidth: 0.5,
    borderBottomColor: "#ddd",
    borderBottomWidth: 0.5,
  },
  infoWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    fontWeight: "600",
  },
  avatar: {
    borderColor: "#ddd",
    borderWidth: 0.3,
    height: 36,
    width: 36,
    borderRadius: 36,
    marginRight: 10,
  },
});

export default PostHeader;
