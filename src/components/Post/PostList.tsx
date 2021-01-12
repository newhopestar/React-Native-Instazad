import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { ExtraPost } from "../../reducers/postReducer";
import PostItem from "./PostItem";
export interface PostListProps {
  data: ExtraPost[];
  showCommentInput: (id: number, prefix?: string) => void;
}
const PostList = ({ data, showCommentInput }: PostListProps) => {
  useEffect(() => {}, []);
  return (
    <View style={styles.container}>
      {data.map((post, index) => (
        <PostItem showCommentInput={showCommentInput} key={index} item={post} />
      ))}
    </View>
  );
};

export default React.memo(PostList);

const styles = StyleSheet.create({
  container: {},
});
