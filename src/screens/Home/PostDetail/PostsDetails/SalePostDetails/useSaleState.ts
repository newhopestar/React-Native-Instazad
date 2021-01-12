import { useEffect, useState } from "react";
import { PostCommentRequest } from "../../../../../actions/postActions";
import { SalePost } from "../../../../../reducers/postReducer";
import { useDispatch } from "react-redux";
import firestore from "@react-native-firebase/firestore";
import { Comment } from "../../../../../reducers/commentReducer";
import { useSelector } from "../../../../../reducers";

export default function useSaleState(post: SalePost) {
  const me = useSelector((state) => state.user.user);
  const username = me.userInfo?.username!;

  const [alreadyBought, setAlreadyBought] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = subscribeToAlreadyBought();

    return unsubscribe;
  }, []);

  function subscribeToAlreadyBought() {
    try {
      return firestore()
        .collection(`posts/${post.uid}/comments`)
        .where("buyOrder", "in", [true, false])
        .where("userId", "==", username)
        .orderBy("create_at", "desc")
        .limit(1)
        .onSnapshot(async (commentsSnapshot) => {
          if (!commentsSnapshot) return;

          setAlreadyBought(commentsSnapshot.docs[0].data().buyOrder);
        });
    } catch (e) {
      //TODO: Alert user that something went wrong
      console.warn(e);
      return () => {};
    }
  }

  async function buy(commentText: string, buyQuantity: number) {
    await dispatch(PostCommentRequest(post.uid!, commentText, undefined, true, buyQuantity));
  }

  async function cancel(commentText: string) {
    await dispatch(PostCommentRequest(post.uid!, commentText, undefined, false));
  }

  return { alreadyBought, buy, cancel };
}
