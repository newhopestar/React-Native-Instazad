import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { Alert, Animated, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  PinchGestureHandler,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  PinchGestureHandlerGestureEvent,
  State,
} from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SCREEN_WIDTH } from "../../../constants";
import CameraRoll from "@react-native-community/cameraroll";
import ImageEditor, { ImageCropData } from "@react-native-community/image-editor";

export type ProcessedImage = {
  uri: string;
  width: number;
  height: number;
  extension: string;
  fullSize: boolean;
};

interface PhotoSpecs {
  preventScaleOffset: boolean;
  fullSize: boolean;
  enableGesture: boolean;
  currentPhoto: {
    preX: number;
    preY: number;
    preRatio: number;
  };
}

interface Props {
  selectedGroupIndex: number;
  groups: string[];
  willGoToNextStep: boolean;
  onProcessImages: (processedImages: ProcessedImage[]) => void;
}

const ImagePicker: FunctionComponent<Props> = ({ selectedGroupIndex, groups, willGoToNextStep, onProcessImages }) => {
  const [multiple, setMultiple] = useState<boolean>(false);
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);
  const [selectedPhotoSpecs, setSelectedPhotosSpecs] = useState<PhotoSpecs[]>([]);
  const [photos, setPhotos] = useState<CameraRoll.PhotoIdentifier[]>([]);
  const [enableGesture, setEnableGesture] = useState<boolean>(true);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [page, setPage] = useState<number>(1);

  const _photoOffsetX = React.useMemo(() => new Animated.Value(0), []);
  const _photoOffsetY = React.useMemo(() => new Animated.Value(0), []);
  const _photoRatio = React.useMemo(() => new Animated.Value(1), []);
  const _maskOpacity = React.useMemo(() => new Animated.Value(0), []);

  const ref = useRef({
    enableGesture: true,
    fullSize: false,
    maskTimeout: setTimeout(() => {}, 0),
    showMask: false,
    preventScaleOffset: true,
    currentPhoto: { preX: 0, preY: 0, preRatio: 1 },
  });

  useEffect(() => {
    if (willGoToNextStep) {
      processImages();
    }
  }, [willGoToNextStep]);

  useEffect(() => {
    if (selectedGroupIndex > -1) {
      CameraRoll.getPhotos({
        assetType: "Photos",
        first: 8 * page,
        groupName: groups[selectedGroupIndex],
      }).then((result) => {
        const photos = result.edges;
        setPhotos(photos);
        if (photos.length > 0 && selectedIndex < 0) setSelectedIndex(0);
      });
    }
    return () => {};
  }, [selectedGroupIndex, page]);

  useEffect(() => {
    if (selectedIndex > -1) {
      const position = selectedPhotos.indexOf(selectedIndex);
      if (position > -1 && selectedPhotoSpecs[position] && multiple) {
        ref.current.currentPhoto = {
          ...selectedPhotoSpecs[position].currentPhoto,
        };
        ref.current.preventScaleOffset = selectedPhotoSpecs[position].preventScaleOffset;
        ref.current.enableGesture = selectedPhotoSpecs[position].enableGesture;
        setEnableGesture(ref.current.enableGesture);
        // _photoRatio.setValue(ref.current.currentPhoto.preRatio)
        // _photoRatio.setValue(ref.current.currentPhoto.preRatio)
        // _photoRatio.setValue(ref.current.currentPhoto.preRatio)
        if (ref.current.preventScaleOffset) {
          Animated.parallel([
            Animated.spring(_photoRatio, {
              toValue: ref.current.currentPhoto.preRatio,
              useNativeDriver: false,
            }),
            Animated.spring(_photoOffsetX, {
              toValue: ref.current.currentPhoto.preX,
              useNativeDriver: false,
            }),
            Animated.spring(_photoOffsetY, {
              toValue: ref.current.currentPhoto.preY,
              useNativeDriver: false,
            }),
          ]).start();
        } else {
          Animated.parallel([
            Animated.spring(_photoOffsetX, {
              toValue: ref.current.currentPhoto.preX * ref.current.currentPhoto.preRatio,
              useNativeDriver: false,
            }),
            Animated.spring(_photoOffsetY, {
              toValue: ref.current.currentPhoto.preY * ref.current.currentPhoto.preRatio,
              useNativeDriver: false,
            }),
          ]).start();
        }
      } else {
        setEnableGesture(true);
        ref.current.preventScaleOffset = true;
        ref.current.currentPhoto = {
          preX: 0,
          preY: 0,
          preRatio:
            SCREEN_WIDTH /
            (photos[selectedIndex].node.image.height < photos[selectedIndex].node.image.width
              ? photos[selectedIndex].node.image.height
              : photos[selectedIndex].node.image.width),
        };
        ref.current.currentPhoto.preX =
          -(photos[selectedIndex].node.image.width * ref.current.currentPhoto.preRatio - SCREEN_WIDTH) / 2;
        ref.current.currentPhoto.preY =
          -(photos[selectedIndex].node.image.height * ref.current.currentPhoto.preRatio - SCREEN_WIDTH) / 2;
        _photoRatio.setValue(ref.current.currentPhoto.preRatio);
        _photoOffsetX.setValue(ref.current.currentPhoto.preX);
        _photoOffsetY.setValue(ref.current.currentPhoto.preY);
      }
    }
    return () => {};
  }, [selectedIndex]);

  const _onPanGestureEvent = ({ nativeEvent: { translationX, translationY } }: PanGestureHandlerGestureEvent) => {
    clearTimeout(ref.current.maskTimeout);
    ref.current.maskTimeout = setTimeout(() => {
      Animated.timing(_maskOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => (ref.current.showMask = false));
    }, 1000);
    if (!ref.current.showMask) {
      _maskOpacity.setValue(1);
      ref.current.showMask = true;
    }

    if (ref.current.preventScaleOffset) {
      _photoOffsetX.setValue(translationX + ref.current.currentPhoto.preX);
      _photoOffsetY.setValue(translationY + ref.current.currentPhoto.preY);
    } else {
      _photoOffsetX.setValue((translationX + ref.current.currentPhoto.preX) * ref.current.currentPhoto.preRatio);
      _photoOffsetY.setValue((translationY + ref.current.currentPhoto.preY) * ref.current.currentPhoto.preRatio);
    }
  };

  const _onPanStateChange = ({ nativeEvent: { translationX, translationY, state } }: PanGestureHandlerGestureEvent) => {
    if (state === State.END) {
      ref.current.currentPhoto.preX += translationX;
      ref.current.currentPhoto.preY += translationY;
      if (ref.current.currentPhoto.preX > 0) {
        Animated.spring(_photoOffsetX, {
          useNativeDriver: false,
          toValue: 0,
        }).start(() => (ref.current.currentPhoto.preX = 0));
      }
      if (ref.current.currentPhoto.preY > 0) {
        Animated.spring(_photoOffsetY, {
          useNativeDriver: false,
          toValue: 0,
        }).start(() => (ref.current.currentPhoto.preY = 0));
      }
      if (
        photos[selectedIndex].node.image.height * ref.current.currentPhoto.preRatio +
          (ref.current.preventScaleOffset
            ? ref.current.currentPhoto.preY
            : ref.current.currentPhoto.preRatio * ref.current.currentPhoto.preY) -
          SCREEN_WIDTH <
        0
      ) {
        Animated.spring(_photoOffsetY, {
          useNativeDriver: false,
          toValue: -(photos[selectedIndex].node.image.height * ref.current.currentPhoto.preRatio - SCREEN_WIDTH),
        }).start(() => {
          ref.current.currentPhoto.preY = -(
            photos[selectedIndex].node.image.height * ref.current.currentPhoto.preRatio -
            SCREEN_WIDTH
          );
          ref.current.preventScaleOffset = true;
        });
      }
      if (
        photos[selectedIndex].node.image.width * ref.current.currentPhoto.preRatio +
          (ref.current.preventScaleOffset
            ? ref.current.currentPhoto.preX
            : ref.current.currentPhoto.preRatio * ref.current.currentPhoto.preX) -
          SCREEN_WIDTH <
        0
      ) {
        Animated.spring(_photoOffsetX, {
          useNativeDriver: false,
          toValue: -(photos[selectedIndex].node.image.width * ref.current.currentPhoto.preRatio - SCREEN_WIDTH),
        }).start(() => {
          ref.current.currentPhoto.preX = -(
            photos[selectedIndex].node.image.width * ref.current.currentPhoto.preRatio -
            SCREEN_WIDTH
          );
          ref.current.preventScaleOffset = true;
        });
      }
    }
  };

  const _onPinchGestureEvent = ({ nativeEvent: { scale } }: PinchGestureHandlerGestureEvent) => {
    clearTimeout(ref.current.maskTimeout);
    ref.current.maskTimeout = setTimeout(() => {
      Animated.timing(_maskOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => (ref.current.showMask = false));
    }, 1000);
    if (!ref.current.showMask) {
      _maskOpacity.setValue(1);
      ref.current.showMask = true;
    }

    if (ref.current.preventScaleOffset) {
      _photoOffsetX.setValue(ref.current.currentPhoto.preX * scale);
      _photoOffsetY.setValue(ref.current.currentPhoto.preY * scale);
    } else {
      _photoOffsetX.setValue(ref.current.currentPhoto.preX * (scale * ref.current.currentPhoto.preRatio));
      _photoOffsetY.setValue(ref.current.currentPhoto.preY * (scale * ref.current.currentPhoto.preRatio));
    }
    _photoRatio.setValue(scale * ref.current.currentPhoto.preRatio);
  };

  const _onPinchStateChange = ({ nativeEvent: { scale, state } }: PinchGestureHandlerGestureEvent) => {
    if (state === State.END) {
      if (ref.current.preventScaleOffset) {
        ref.current.currentPhoto.preX /= ref.current.currentPhoto.preRatio;
        ref.current.currentPhoto.preY /= ref.current.currentPhoto.preRatio;
      }
      ref.current.preventScaleOffset = false;

      ref.current.currentPhoto.preRatio *= scale;
      const defaultRatio =
        SCREEN_WIDTH /
        (photos[selectedIndex].node.image.height < photos[selectedIndex].node.image.width
          ? photos[selectedIndex].node.image.height
          : photos[selectedIndex].node.image.width);
      if (ref.current.currentPhoto.preRatio < defaultRatio) {
        Animated.spring(_photoRatio, {
          toValue: defaultRatio,
          useNativeDriver: false,
        }).start(() => {
          ref.current.currentPhoto.preRatio = defaultRatio;
        });
      }
    }
  };

  const _onLoadmore = () => {
    setPage(page + 1);
  };

  const _onSelectImage = (index: number) => {
    if (!multiple) setSelectedIndex(index);
    else {
      const position = selectedPhotos.indexOf(index);
      if (index !== selectedIndex && position > -1) {
        const temp2 = [...selectedPhotoSpecs];
        temp2[selectedPhotos.indexOf(selectedIndex)] = {
          enableGesture,
          currentPhoto: { ...ref.current.currentPhoto },
          preventScaleOffset: ref.current.preventScaleOffset,
          fullSize: ref.current.fullSize,
        };
        setSelectedPhotosSpecs(temp2);
        return setSelectedIndex(index);
      }
      if (position > -1) {
        const temp = [...selectedPhotos];
        temp.splice(position, 1);
        setSelectedPhotos(temp);
        const temp2 = [...selectedPhotoSpecs];
        temp2.splice(position, 1);
        setSelectedPhotosSpecs(temp2);
      } else {
        const temp = [...selectedPhotos];
        temp.push(index);
        setSelectedPhotos(temp);
        const temp2 = [...selectedPhotoSpecs];
        temp2[temp.indexOf(selectedIndex)] = {
          enableGesture,
          currentPhoto: { ...ref.current.currentPhoto },
          preventScaleOffset: ref.current.preventScaleOffset,
          fullSize: ref.current.fullSize,
        };
        setSelectedPhotosSpecs(temp2);
      }
      setSelectedIndex(index);
    }
  };

  const _onToggleMultiple = () => {
    if (selectedPhotos.indexOf(selectedIndex) === -1 && !multiple) {
      const temp = [...selectedPhotos];
      temp.push(selectedIndex);
      setSelectedPhotos(temp);
    }
    setMultiple(!multiple);
  };

  const _onToggleFullSize = () => {
    if (photos[selectedIndex].node.image.height == photos[selectedIndex].node.image.width) return;
    let switcher = false;
    if (!ref.current.fullSize) {
      switcher = photos[selectedIndex].node.image.height > photos[selectedIndex].node.image.width;
      ref.current.fullSize = true;
      setEnableGesture(false);
    } else {
      switcher = photos[selectedIndex].node.image.height < photos[selectedIndex].node.image.width;
      ref.current.fullSize = false;
      setEnableGesture(true);
    }
    ref.current.preventScaleOffset = true;
    ref.current.currentPhoto = {
      preX: 0,
      preY: 0,
      preRatio:
        SCREEN_WIDTH / (switcher ? photos[selectedIndex].node.image.height : photos[selectedIndex].node.image.width),
    };
    ref.current.currentPhoto.preX =
      -(photos[selectedIndex].node.image.width * ref.current.currentPhoto.preRatio - SCREEN_WIDTH) / 2;
    ref.current.currentPhoto.preY =
      -(photos[selectedIndex].node.image.height * ref.current.currentPhoto.preRatio - SCREEN_WIDTH) / 2;
    _photoRatio.setValue(ref.current.currentPhoto.preRatio);
    _photoOffsetX.setValue(ref.current.currentPhoto.preX);
    _photoOffsetY.setValue(ref.current.currentPhoto.preY);
  };

  function processImages() {
    if (selectedPhotos.length < 1 && multiple) {
      return Alert.alert("Error!", "You need to choose at least 1 picture");
    }
    const photoList = multiple ? [...selectedPhotos] : [selectedIndex];
    const specs = multiple ? [...selectedPhotoSpecs] : [];
    if (specs.length < photoList.length) {
      specs.push({
        currentPhoto: { ...ref.current.currentPhoto },
        enableGesture,
        preventScaleOffset: ref.current.preventScaleOffset,
        fullSize: ref.current.fullSize,
      });
    } else if (specs.length === photoList.length) {
      specs[photoList.indexOf(selectedIndex)] = {
        currentPhoto: { ...ref.current.currentPhoto },
        enableGesture,
        preventScaleOffset: ref.current.preventScaleOffset,
        fullSize: ref.current.fullSize,
      };
    }
    const tasks: Promise<ProcessedImage>[] = photoList.map(async (index, rIndex) => {
      const spec = specs[photoList.indexOf(index)];
      const { width, height } = photos[index].node.image;
      const cropData: ImageCropData = {
        offset: {
          x: spec.fullSize
            ? 0
            : Math.abs(
                spec.preventScaleOffset ? spec.currentPhoto.preX / spec.currentPhoto.preRatio : spec.currentPhoto.preX
              ),
          y: spec.fullSize
            ? 0
            : Math.abs(
                spec.preventScaleOffset ? spec.currentPhoto.preY / spec.currentPhoto.preRatio : spec.currentPhoto.preY
              ),
        },
        size: {
          width: spec.fullSize && height > width ? width : SCREEN_WIDTH / spec.currentPhoto.preRatio,
          height: spec.fullSize && height < width ? height : SCREEN_WIDTH / spec.currentPhoto.preRatio,
        },
      };
      const img = photos[index].node;
      const extension = img.image.filename.split(".").pop()?.toLocaleLowerCase();
      const uri = await ImageEditor.cropImage(img.image.uri, cropData);
      return {
        uri,
        fullSize: spec.fullSize,
        tags: [],
        extension: extension as string,
        width: spec.fullSize && height > width ? width : SCREEN_WIDTH / spec.currentPhoto.preRatio,
        height: spec.fullSize && height < width ? height : SCREEN_WIDTH / spec.currentPhoto.preRatio,
      };
    });
    Promise.all(tasks).then((result) => {
      onProcessImages([...result]);
    });
  }

  return (
    <>
      <View
        style={{
          height: SCREEN_WIDTH,
          width: SCREEN_WIDTH,
          overflow: "hidden",
        }}
      >
        {selectedIndex > -1 && (
          <View>
            <Animated.View
              style={{
                transform: [
                  {
                    translateX: _photoOffsetX,
                  },
                  {
                    translateY: _photoOffsetY,
                  },
                ],
                width: Animated.multiply(photos[selectedIndex].node.image.width, _photoRatio),
                height: Animated.multiply(photos[selectedIndex].node.image.height, _photoRatio),
              }}
            >
              <Image
                style={{
                  width: "100%",
                  height: "100%",
                }}
                source={{ uri: photos[selectedIndex].node.image.uri || "" }}
              />
            </Animated.View>
          </View>
        )}
        <PinchGestureHandler
          enabled={enableGesture}
          onHandlerStateChange={_onPinchStateChange}
          onGestureEvent={_onPinchGestureEvent}
        >
          <PanGestureHandler
            enabled={enableGesture}
            onHandlerStateChange={_onPanStateChange}
            onGestureEvent={_onPanGestureEvent}
          >
            <View
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                zIndex: 1,
                left: 0,
                top: 0,
              }}
            >
              <View style={styles.postToolWrapper}>
                <TouchableOpacity onPress={_onToggleFullSize} style={styles.btnPostTool}>
                  <Icon name="resize" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={_onToggleMultiple}
                  style={{
                    ...styles.btnPostTool,
                    backgroundColor: multiple ? "#318bfb" : "rgba(0,0,0,0.5)",
                  }}
                >
                  <Icon name="layers-outline" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </PanGestureHandler>
        </PinchGestureHandler>
      </View>
      <FlatList
        showsVerticalScrollIndicator={false}
        bounces={false}
        data={photos}
        onEndReached={_onLoadmore}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={_onSelectImage.bind(null, index)}
            activeOpacity={0.8}
            style={{
              padding: 1,
              width: SCREEN_WIDTH / 4,
              height: SCREEN_WIDTH / 4,
            }}
          >
            {multiple && (
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
                  <Text
                    style={{
                      color: "#fff",
                    }}
                  >
                    {selectedPhotos.indexOf(index) + 1}
                  </Text>
                )}
              </View>
            )}
            <Image
              style={{
                opacity: index === selectedIndex && !multiple ? 0.8 : 1,
                width: "100%",
                height: "100%",
              }}
              source={{
                uri: item.node.image.uri,
                // priority: FastImage.priority.high
              }}
            />
          </TouchableOpacity>
        )}
        numColumns={4}
        keyExtractor={(item, key) => `${key}`}
      />
    </>
  );
};

const styles = StyleSheet.create({
  postToolWrapper: {
    zIndex: 10,
    position: "absolute",
    bottom: 15,
    left: 0,
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 15,
    justifyContent: "space-between",
    alignItems: "center",
  },
  btnPostTool: {
    height: 40,
    width: 40,
    borderRadius: 44,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ImagePicker;
