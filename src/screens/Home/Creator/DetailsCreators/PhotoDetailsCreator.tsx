import { useIsFocused } from "@react-navigation/native";
import React, { FunctionComponent, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Switcher from "../../../../components/Switcher";
import { DetailsType } from "../../../../reducers/postReducer";

export type PhotoDetails = {
  type: "photo";
  offComment: boolean;
};

interface Props {
  details: PhotoDetails;
  onChange: (photoDetails: PhotoDetails) => void;
  setCurrentDetails: (type: DetailsType) => void;
}

const PhotoDetailsCreator: FunctionComponent<Props> = ({ details, onChange, setCurrentDetails }) => {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) setCurrentDetails("photo");
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <View style={{ backgroundColor: "#000" }}>
        <TouchableOpacity
          onPress={setShowAdvancedSettings.bind(null, !showAdvancedSettings)}
          activeOpacity={1}
          style={{ ...styles.postOptionItem, borderWidth: 0 }}
        >
          <Text style={{ color: "#666", fontWeight: "600", fontSize: 14 }}>Advanced Settings</Text>
        </TouchableOpacity>
      </View>
      {showAdvancedSettings && (
        <>
          <View style={styles.settingWrapper}>
            <Text style={{ fontWeight: "600", fontSize: 16 }}>Comments</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 15 }}>
              <Text style={{ fontSize: 16 }}>Turn Off Commenting</Text>
              <Switcher
                on={details.offComment}
                onTurnOff={() => onChange({ ...details, offComment: false })}
                onTurnOn={() => onChange({ ...details, offComment: true })}
              />
            </View>
            <Text style={{ fontSize: 12, color: "#666" }}>
              You can change this later by going to option menu at the top of your post.
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", flex: 1 },
  postOptionItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    minHeight: 44,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#ddd",
    paddingHorizontal: 15,
  },
  settingWrapper: {
    padding: 15,
  },
});

export default PhotoDetailsCreator;
