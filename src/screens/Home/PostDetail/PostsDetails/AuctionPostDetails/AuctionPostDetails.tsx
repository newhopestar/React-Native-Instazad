import React, { FunctionComponent } from "react";
import { SafeAreaView, ScrollView, Text } from "react-native";
import PostBody from "../../../../../components/Post/PostBody";
import PostHeader from "../../../../../components/Post/PostHeader";
import { AuctionPost, ExtraPost } from "../../../../../reducers/postReducer";
import Comments from "../../Comments";
import useAuctionState from "./useAuctionState";

interface Props {
  post: AuctionPost;
  setPost?: React.Dispatch<React.SetStateAction<ExtraPost>>;
}

const AuctionPostDetails: FunctionComponent<Props> = ({ post, setPost }) => {
  const { highestBidComment, timeLeft } = useAuctionState(post);

  return (
    <>
      <PostHeader post={post} setPost={setPost} />
      <PostBody post={post} setPost={setPost} />
      <Text>{`caption: ${post.content}`}</Text>
      <Text>{`buyNowPrice: ${post.buyNowPrice}`}</Text>
      <Text>{(highestBidComment.bid === post.openingPrice ? "openingPrice: " : "bid: ") + highestBidComment.bid}</Text>
    </>
  );
};

export default AuctionPostDetails;
