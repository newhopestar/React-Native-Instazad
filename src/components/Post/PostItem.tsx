import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { navigate, navigation } from "../../navigations/rootNavigation";
import { useSelector } from "../../reducers";
import { ExtraPost } from "../../reducers/postReducer";
import { store } from "../../store";
import { timestampToString } from "../../utils";
import PostBody from "./PostBody";
import PostHeader from "./PostHeader";

export interface PostItemProps {
  item: ExtraPost;
  showCommentInput?: (id: number, prefix?: string) => void;
  setPost?: React.Dispatch<React.SetStateAction<ExtraPost>>;
}

const PostItem = ({ setPost, item, showCommentInput }: PostItemProps) => {
  const [content, setContent] = useState<JSX.Element[]>([]);

  const user = useSelector((state) => state.user.user);

  let diffTime: string = timestampToString(item.create_at?.toMillis() || 0, true);

  useEffect(() => {
    setContent(createFilterContent(item.content || ""));
  }, [item]);

  return (
    <View style={styles.container}>
      <PostHeader post={item} setPost={setPost} />
      <PostBody post={item} setPost={setPost} />
      <View style={styles.reactionsWrapper}>
        <View style={{ flexWrap: "wrap", flexDirection: "row", alignItems: "center" }}>
          {content.map((Jsx) => Jsx)}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 5 }}>
          <Text style={{ fontSize: 12, color: "#666" }}>{diffTime}</Text>
          <Text style={{ fontSize: 12, color: "#666" }}> • </Text>
          <TouchableOpacity>
            <Text style={{ fontSize: 12, color: "#318bfb", fontWeight: "500" }}>See Translation</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default React.memo(PostItem);

const styles = StyleSheet.create({
  container: {},
  reactionsWrapper: {
    padding: 10,
  },
  btnViewCmt: {
    marginVertical: 5,
  },
  commentInputWrapper: {
    height: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  commentIconsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 14.3 * 3 + 15,
  },
  commentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 24,
  },
});

export function createFilterContent(content: string): JSX.Element[] {
  const myUsername = store.getState().user.user.userInfo?.username || "";
  const matchedGroups: {
    match: string;
    index: number;
  }[] = [];
  content?.replace(/@[a-zA-Z0-9._]{4,}|\#\w+/g, (match, index) => {
    matchedGroups.push({ match, index });
    return match;
  });
  let splitedContent: JSX.Element[] = (content?.split("") || []).map((c, i) => <Text key={i}>{c}</Text>);
  let i = 0;
  matchedGroups.map((match) => {
    splitedContent.splice(match.index - i + 1, match.match.length - 1);
    splitedContent[match.index - i] = (
      <TouchableOpacity
        onPress={() => {
          const targetName = match.match.slice(-(match.match.length - 1));
          if (match.match[0] === "@") {
            if (myUsername !== targetName) {
              navigate("ProfileX", {
                username: targetName,
              });
            } else navigate("Account");
          } else if (match.match[0] === "#") {
            navigate("Hashtag", {
              hashtag: match.match,
            });
          }
        }}
        key={`${match.match}${match.index}`}
      >
        <Text
          style={{
            color: "#318bfb",
            fontWeight: "500",
          }}
        >
          {match.match}
        </Text>
      </TouchableOpacity>
    );
    i += match.match.length - 1;
  });
  return splitedContent;
}
