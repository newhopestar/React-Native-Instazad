import React, { FunctionComponent } from "react";
import { SafeAreaView, ScrollView, Text } from "react-native";
import PostBody from "../../../../components/Post/PostBody";
import PostHeader from "../../../../components/Post/PostHeader";
import { ExtraPost } from "../../../../reducers/postReducer";
import Comments from "../Comments";

interface Props {
  post: ExtraPost;
  setPost?: React.Dispatch<React.SetStateAction<ExtraPost>>;
}

const PhotoPostDetails: FunctionComponent<Props> = ({ post, setPost }) => {
  return (
    <>
      <PostHeader post={post} setPost={setPost} />
      <PostBody post={post} setPost={setPost} />
    </>
  );
};

export default PhotoPostDetails;
