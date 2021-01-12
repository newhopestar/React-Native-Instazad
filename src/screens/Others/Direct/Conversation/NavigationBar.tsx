import React, { FunctionComponent } from "react";
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";
import { STATUS_BAR_HEIGHT } from "../../../../constants";
import { goBack, navigate } from "../../../../navigations/rootNavigation";
import { onlineTypes } from "../../../../reducers/messageReducer";
import { timestampToString } from "../../../../utils";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface Props {
  username: string;
  avatarURL: string;
  fullName: string;
  status: number;
  lastOnline: number;
}

const NavigationBar: FunctionComponent<Props> = ({ username, avatarURL, fullName, status, lastOnline }) => {
  return (
    <>
      <View style={styles.navigationBar}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={goBack} style={styles.btnNavigation}>
            <Icon name="arrow-left" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigate("ProfileX", { username })} style={styles.userInfo}>
            <View style={styles.targetUserAvatarWrapper}>
              <FastImage style={styles.targetUserAvatar} source={{ uri: avatarURL }} />
              {status === onlineTypes.ACTIVE && <View style={styles.onlinePoint} />}
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={{ fontWeight: "600" }}>{fullName}</Text>
              {status === onlineTypes.ACTIVE ? (
                <Text style={styles.onlineText}>Active now</Text>
              ) : (
                <Text style={styles.onlineText}>Active {timestampToString(lastOnline)} ago</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.rightOptions}>
          <TouchableOpacity style={styles.btnNavigation}>
            <Image style={{ height: 24, width: 24 }} source={require("../../../../assets/icons/video-call.png")} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigate("ConversationOptions", { username })} style={styles.btnNavigation}>
            <Image style={{ height: 24, width: 24 }} source={require("../../../../assets/icons/info.png")} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  navigationBar: {
    height: 44 + STATUS_BAR_HEIGHT,
    paddingTop: STATUS_BAR_HEIGHT,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2.5,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 5,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    zIndex: 1,
  },
  rightOptions: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 5,
  },
  btnNavigation: {
    height: 44,
    width: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    marginLeft: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  onlinePoint: {
    position: "absolute",
    backgroundColor: "#79d70f",
    height: 15,
    width: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#fff",
    bottom: -2,
    right: -2,
  },
  onlineText: {
    fontSize: 12,
    color: "#666",
  },
  targetUserAvatarWrapper: {},
  targetUserAvatar: {
    width: 30,
    height: 30,
    borderRadius: 30,
    borderColor: "#333",
    borderWidth: 0.3,
  },
});

export default NavigationBar;
