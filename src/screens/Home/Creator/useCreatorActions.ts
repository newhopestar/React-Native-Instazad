import { Details } from "./DetailsCreator";
import { ProcessedImage } from "./ImagePicker";
import { Timestamp } from "../../../utils";
import { Post, PostImage } from "../../../reducers/postReducer";
import storage from "@react-native-firebase/storage";
import { CreatePostRequest } from "../../../actions/postActions";
import { navigate } from "../../../navigations/rootNavigation";
import { useDispatch } from "react-redux";
import { store } from "../../../store";

export function useCreatorActions() {
  const user = store.getState().user.user.userInfo;
  const dispatch = useDispatch();

  function uploadPost(processedImages: ProcessedImage[], details: Details) {
    const imageList = [...processedImages];

    const tasks: Promise<PostImage>[] = imageList.map(async (img) => {
      const ref = storage().ref(
        `posts/${user?.username || "others"}/${new Date().getTime() + Math.random()}.${img.extension}`
      );
      await ref.putFile(img.uri);
      const downloadUri = await ref.getDownloadURL();
      return {
        uri: downloadUri,
        width: img.width,
        height: img.height,
        extension: img.extension,
        fullSize: img.fullSize,
      };
    });

    Promise.all(tasks).then((images) => {
      const post = createPostObject(images, details);
      dispatch(CreatePostRequest(post));
      navigate("HomeTab");
    });
  }

  function createPostObject(images: PostImage[], details: Details): Post {
    const post: Post = {
      content: details?.caption,
      create_at: Timestamp(),
      isVideo: false,
      permission: 1,
      notificationUsers: [user!.username!],
      likes: [],
      source: images,
      userId: user?.username,
      ...details,
    };
    return post;
  }

  return { uploadPost };
}
