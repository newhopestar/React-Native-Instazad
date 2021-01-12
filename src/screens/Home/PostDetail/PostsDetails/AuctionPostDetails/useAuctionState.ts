import { useEffect, useState } from "react";
import firestore from "@react-native-firebase/firestore";
import { Comment } from "../../../../../reducers/commentReducer";
import { AuctionPost } from "../../../../../reducers/postReducer";

export default function useAuctionState(post: AuctionPost) {
  const [highestBidComment, setHighestBidComment] = useState<Comment>({ bid: post.openingPrice });
  const [timeLeft, setTimeLeft] = useState<number>();

  useEffect(() => {
    const unsubscribeFromHighestBid = subscribeToHighestBid();

    return unsubscribeFromHighestBid;
  }, []);

  function subscribeToHighestBid() {
    try {
      return firestore()
        .collection(`posts/${post.uid}/comments`)
        .orderBy("create_at", "asc")
        .onSnapshot(async (commentsSnapshot) => {
          for (const commentDoc of commentsSnapshot.docs) {
            const comment: Comment = commentDoc.data();
            if (comment.bid && comment.bid > highestBidComment.bid!) {
              setHighestBidComment(comment);
            }
          }
        });
    } catch (e) {
      //TODO: Alert user that something went wrong
      console.warn(e);
      return () => {};
    }
  }

  return { highestBidComment, timeLeft };
}
