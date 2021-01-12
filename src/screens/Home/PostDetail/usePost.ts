import { useEffect, useState } from "react";
import { goBack } from "../../../navigations/rootNavigation";
import { ExtraPost } from "../../../reducers/postReducer";
import firestore from "@react-native-firebase/firestore";

export default function usePost(postId: number) {
  const [post, setPost] = useState<ExtraPost>({});

  useEffect(() => {
    const ref = firestore();
    ref
      .collection("posts")
      .doc(`${postId}`)
      .get()
      .then((rs) => {
        if (rs.exists) {
          const data: ExtraPost = rs.data() || {};
          const ownId = data.userId;
          ref
            .collection("users")
            .doc(`${ownId}`)
            .get()
            .then((rs2) => {
              data.ownUser = rs2.data();
              data.notificationUsers = data.notificationUsers || [];
              rs.ref
                .collection("comments")
                .orderBy("create_at", "desc")
                .get()
                .then((rs3) => {
                  data.comments = rs3.docs.map((x) => x.data());
                  setPost(data);
                });
            });
        } else goBack();
      });
    return () => {
      setPost({});
    };
  }, []);

  return { setPost, post };
}
