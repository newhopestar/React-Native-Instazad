import React, { FunctionComponent } from "react";
import { Image, SafeAreaView, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SCREEN_WIDTH } from "../../../constants";
import { ProcessedImage } from "./ImagePicker";

interface Props {
  caption: string;
  onChange: (caption: string) => void;
  processedImages: ProcessedImage[];
  onGoBack: () => void;
}

const CaptionInput: FunctionComponent<Props> = ({ caption, onChange, processedImages, onGoBack }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
      }}
    >
      {processedImages.length > 0 && (
        <TouchableOpacity
          onPress={onGoBack}
          style={{
            height: 50,
            width: 50,
          }}
        >
          {processedImages.length > 1 && (
            <View
              style={{
                position: "absolute",
                zIndex: 1,
                top: 5,
                right: 5,
              }}
            >
              <Icon name="layers-outline" color="#fff" size={20} />
            </View>
          )}
          <Image
            style={{
              width: "100%",
              height: "100%",
            }}
            source={{ uri: processedImages[0].uri }}
          />
        </TouchableOpacity>
      )}
      <TextInput
        value={caption}
        onChangeText={onChange}
        multiline={true}
        style={{
          maxWidth: SCREEN_WIDTH - 30 - 50,
          paddingLeft: 10,
        }}
        placeholder="Write a caption"
      />
    </View>
  );
};

export default CaptionInput;
