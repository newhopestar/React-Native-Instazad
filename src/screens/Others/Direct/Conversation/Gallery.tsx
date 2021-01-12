import React, { FunctionComponent, useEffect, useState } from "react";
import { Animated, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SCREEN_WIDTH } from "../../../../constants";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { MAX_GALLERY_HEIGHT } from "./Conversation";
import CameraRoll from "@react-native-community/cameraroll";
import { CreateMessageRequest } from "../../../../actions/messageActions";
import { PostingMessage, messagesTypes } from "../../../../reducers/messageReducer";
import { useDispatch } from "react-redux";
import storage from "@react-native-firebase/storage";
import { uriToBlob } from "../../../../utils";

interface Props {
  onHide: () => void;
  galleryAnim: Animated.Value;
  myUsername: string;
  targetUsername: string;
}

const Gallery: FunctionComponent<Props> = ({ onHide, galleryAnim, myUsername, targetUsername }) => {
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [groups, setGroups] = useState<string[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);
  const [photos, setPhotos] = useState<CameraRoll.PhotoIdentifier[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(-1);

  const dispatch = useDispatch();

  useEffect(() => {
    CameraRoll.getPhotos({ assetType: "Photos", first: 1000 }).then((result) => {
      const photos = result.edges;
      const groupList = Array.from(new Set(photos.map((photo) => photo.node.group_name)));
      setGroups(groupList);
      if (groupList.length > 0) setSelectedGroupIndex(0);
    });
    return () => {};
  }, []);

  useEffect(() => {
    if (selectedGroupIndex > -1) {
      CameraRoll.getPhotos({
        assetType: "Photos",
        first: 9 * page,
        groupName: groups[selectedGroupIndex],
      }).then((result) => {
        const photos = result.edges;
        setPhotos(photos);
        if (photos.length > 0 && selectedIndex < 0) setSelectedIndex(0);
      });
    }
  }, [selectedGroupIndex, page]);

  const _onLoadmore = () => {
    setPage(page + 1);
  };

  const _onSelectImage = (index: number) => {
    const position = selectedPhotos.indexOf(index);
    if (position > -1) {
      const temp = [...selectedPhotos];
      temp.splice(position, 1);
      setSelectedPhotos(temp);
    } else {
      const temp = [...selectedPhotos];
      temp.push(index);
      setSelectedPhotos(temp);
    }
  };

  const _onUploadImage = async () => {
    setUploadingImage(true);
    if (selectedPhotos.length > 0) {
      const timestamp = new Date().getTime();
      const uploadTasks: Promise<string>[] = selectedPhotos.map(async (index) => {
        const img = photos[index].node.image;
        const extension = img.filename.split(".").pop()?.toLowerCase();
        const blob = await uriToBlob(img.uri);
        const rq = await storage()
          .ref(`messages/${myUsername}/${new Date().getTime() + Math.random()}.${extension}`)
          .put(blob as Blob, {
            contentType: `image/${extension}`,
          });
        const downloadUri = await rq.ref.getDownloadURL();
        return downloadUri;
      });
      Promise.all(uploadTasks).then((rs) => {
        const sendingTask = rs.map(async (uri, index) => {
          const message: PostingMessage = {
            uid: timestamp + index,
            create_at: timestamp,
            type: messagesTypes.IMAGE,
            sourceUri: uri,
            seen: 0,
            width: photos[index].node.image.width,
            height: photos[index].node.image.height,
          };
          dispatch(CreateMessageRequest(message, targetUsername));
        });
        Promise.all(sendingTask).then(() => {
          setUploadingImage(false);
          onHide();
          setSelectedPhotos([]);
        });
      });
    }
  };

  return (
    <Animated.View
      style={{
        ...styles.galleryWrapper,
        transform: [{ translateY: Animated.subtract(MAX_GALLERY_HEIGHT, galleryAnim) }],
      }}
    >
      {uploadingImage && (
        <View style={styles.uploadingImageMask}>
          <View style={styles.uploadingNotification}>
            <Text>Uploading...</Text>
          </View>
        </View>
      )}
      <View style={styles.navigationGalleryBar}>
        <TouchableOpacity onPress={onHide} style={styles.btnNavigation}>
          <Text style={{ fontSize: 24 }}>✕</Text>
          <View
            style={{
              position: "absolute",
              left: "100%",
              height: "50%",
              backgroundColor: "#999",
              borderRadius: 2,
              width: 2,
            }}
          />
        </TouchableOpacity>
        <Text
          style={{
            fontWeight: "500",
            fontSize: 16,
            paddingHorizontal: 15,
          }}
        >
          Gallery
        </Text>
      </View>
      <FlatList
        numColumns={3}
        data={photos}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => _onSelectImage(index)}
            activeOpacity={1}
            style={{
              ...styles.imageItem,
              marginHorizontal: (index - 1) % 3 === 0 ? 2.5 : 0,
              marginTop: index < 3 ? 0 : 1.25,
            }}
          >
            <Image
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
              source={{
                uri: item.node.image.uri,
              }}
            />
            <View
              style={{
                position: "absolute",
                right: 7.5,
                top: 7.5,
                height: 24,
                width: 24,
                borderRadius: 24,
                borderColor: "#fff",
                borderWidth: 1,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1,
                backgroundColor: selectedPhotos.indexOf(index) > -1 ? "#318bfb" : "rgba(0,0,0,0.3)",
              }}
            >
              {selectedPhotos.indexOf(index) > -1 && (
                <Text style={{ color: "#fff" }}>{selectedPhotos.indexOf(index) + 1}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(__, index) => `${index}`}
        onEndReached={_onLoadmore}
        onEndReachedThreshold={0.5}
      />
      {selectedPhotos.length > 0 && (
        <TouchableOpacity onPress={_onUploadImage} activeOpacity={0.8} style={styles.btnUploadImage}>
          <Icon name="arrow-up" size={30} color="#318bfb" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  galleryWrapper: {
    borderTopColor: "#ddd",
    borderTopWidth: 0.5,
    minHeight: MAX_GALLERY_HEIGHT,
    width: "100%",
    position: "absolute",
    backgroundColor: "#000",
    bottom: 0,
    zIndex: 1,
    left: 0,
  },
  uploadingImageMask: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingNotification: {
    backgroundColor: "#fff",
    padding: 15,
    paddingVertical: 10,
    flexDirection: "row",
    borderRadius: 5,
  },
  btnUploadImage: {
    position: "absolute",
    height: 50,
    width: 50,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    bottom: 50,
    left: (SCREEN_WIDTH - 50) / 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navigationGalleryBar: {
    backgroundColor: "#fff",
    flexDirection: "row",
    height: 44,
    alignItems: "center",
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  imageItem: {
    width: (SCREEN_WIDTH - 5) / 3,
    height: (SCREEN_WIDTH - 5) / 3,
    marginVertical: 1.25,
    backgroundColor: "red",
  },
  btnNavigation: {
    height: 44,
    width: 44,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Gallery;
