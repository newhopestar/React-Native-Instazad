import CameraRoll from "@react-native-community/cameraroll";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Animated, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../../constants";
import { SuperRootStackParamList } from "../../../navigations";
import { goBack } from "../../../navigations/rootNavigation";
import DetailsCreator, { Details } from "./DetailsCreator";
import ImagePicker, { ProcessedImage } from "./ImagePicker";
import { useCreatorActions } from "./useCreatorActions";

type CreatorRouteProp = RouteProp<SuperRootStackParamList, "Creator">;

type CreatorNavigationProp = StackNavigationProp<SuperRootStackParamList, "Creator">;

interface Props {
  navigation: CreatorNavigationProp;
  route: CreatorRouteProp;
}

const Creator: FunctionComponent<Props> = ({ navigation, route }) => {
  const [showGroupSelection, setShowGroupSelection] = useState<boolean>(false);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(-1);
  const [groups, setGroups] = useState<string[]>([]);
  const [step, setStep] = useState<number>(1);
  const [details, setDetails] = useState<Details>();
  const [uploading, setUploading] = useState<boolean>(false);
  const [willGoToNextStep, setWillGoToNextStep] = useState<boolean>(false);

  const { uploadPost } = useCreatorActions();

  const _loadingDeg = new Animated.Value(0);

  const _animateLoading = () => {
    Animated.timing(_loadingDeg, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start(() => {
      if (uploading) {
        _loadingDeg.setValue(0);
        _animateLoading();
      }
    });
  };

  useEffect(() => {
    CameraRoll.getPhotos({ assetType: "Photos", first: 1000 }).then((result) => {
      const photos = result.edges;
      const groups = Array.from(new Set(photos.map((photo) => photo.node.group_name)));
      setGroups(groups);
      if (groups.length > 0) setSelectedGroupIndex(0);
    });
    return () => {};
  }, []);

  useEffect(() => {
    if (processedImages.length > 0) {
      setUploading(false);
      setWillGoToNextStep(false);
      setStep(2);
    }
  }, [processedImages]);

  useEffect(() => {
    if (details) {
      uploadPost(processedImages, details);
    }
  }, [details]);

  function onGoNextStep() {
    setUploading(true);
    setWillGoToNextStep(true);
  }

  const _onGoBack = () => {
    if (step === 1) goBack();
    else setStep(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      {uploading && (
        <View
          style={{
            zIndex: 999,
            position: "absolute",
            left: 0,
            top: 0,
            height: SCREEN_HEIGHT,
            width: SCREEN_WIDTH,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        >
          <View style={styles.uploadingContainer}>
            <Animated.Image
              onLayout={_animateLoading}
              style={{
                height: 36,
                width: 36,
                marginRight: 10,
                transform: [
                  {
                    rotate: _loadingDeg.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
              }}
              source={require("../../../assets/icons/waiting.png")}
            />
            <Text style={{ fontSize: 16, fontWeight: "500" }}>
              {step === 1 ? "Processing Photos..." : "Posting..."}
            </Text>
          </View>
        </View>
      )}
      <View
        style={{
          ...styles.navigationBar,
          borderBottomColor: "#ddd",
          borderBottomWidth: step === 2 ? 1 : 0,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={_onGoBack} style={styles.centerBtn}>
            <Icon name="arrow-left" size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={setShowGroupSelection.bind(null, true)}
            style={{ marginLeft: 15, flexDirection: "row", alignItems: "center" }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600" }}>
              {selectedGroupIndex > -1 ? groups[selectedGroupIndex] : "--"}
            </Text>
            <Icon name="chevron-down" size={20} />
          </TouchableOpacity>
          {showGroupSelection && (
            <ScrollView
              bounces={false}
              contentContainerStyle={{ alignItems: "flex-end" }}
              style={styles.groupOptionsWrapper}
            >
              {showGroupSelection &&
                groups.map((group, index) => (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedGroupIndex(index);
                      setShowGroupSelection(false);
                    }}
                  >
                    <Text style={{ fontSize: 16, color: index === selectedGroupIndex ? "#000" : "#999" }}>{group}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          )}
        </View>
        <TouchableOpacity onPress={onGoNextStep} style={{ ...styles.centerBtn, width: 60 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#318bfb" }}>{step === 1 ? "Next" : "Share"}</Text>
        </TouchableOpacity>
      </View>
      {step === 1 && (
        <ImagePicker
          selectedGroupIndex={selectedGroupIndex}
          groups={groups}
          willGoToNextStep={willGoToNextStep}
          onProcessImages={(processedImages) => setProcessedImages(processedImages)}
        />
      )}
      {step === 2 && (
        <DetailsCreator
          processedImages={processedImages}
          onGoBack={_onGoBack}
          willGoToNextStep={willGoToNextStep}
          onDone={(details) => setDetails(details)}
        />
      )}
    </SafeAreaView>
  );
};

export default Creator;

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    backgroundColor: "#fff",
  },
  navigationBar: {
    zIndex: 1,
    backgroundColor: "#fff",
    height: 44,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  centerBtn: {
    height: 44,
    width: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  groupOptionsWrapper: {
    zIndex: 10,
    position: "absolute",
    top: "100%",
    left: 0,
    backgroundColor: "#fff",
    width: "100%",
    padding: 15,
    borderColor: "#ddd",
    borderWidth: 0.5,
  },
  uploadingContainer: {
    zIndex: 1,
    width: "80%",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 5,
  },
});
