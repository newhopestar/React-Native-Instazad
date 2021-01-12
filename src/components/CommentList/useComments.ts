import { useEffect, useState } from "react";
import { Comment, ExtraComment } from "../../reducers/commentReducer";
import firestore from "@react-native-firebase/firestore";

export default function useComments(postId: number) {
  const [comments, setComments] = useState<Comment[]>();

  useEffect(() => {
    const unsubscribeFromComments = subscribeToComments();

    return unsubscribeFromComments;
  }, []);

  function subscribeToComments() {
    try {
      return firestore()
        .collection(`posts/${postId}/comments`)
        .orderBy("create_at", "asc")
        .onSnapshot(async (commentsSnapshot) => {
          let fetchedComments: Comment[] = commentsSnapshot.docs.map((doc) => doc.data());
          setComments(fetchedComments);
        });
    } catch (e) {
      //TODO: Alert user that something went wrong
      console.warn(e);
      return () => {};
    }
  }

  function loadMore() {
    return new Promise((resolve, reject) => setTimeout(resolve, 10000));
  }

  return { comments, loadMore };
}
