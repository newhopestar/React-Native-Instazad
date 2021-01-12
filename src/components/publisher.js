/* eslint-disable no-console */
import React from "react";
import { AppState, findNodeHandle, Button, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
import {
  R5VideoView,
  publish,
  unpublish,
  swapCamera,
  muteAudio,
  unmuteAudio,
  muteVideo,
  unmuteVideo,
} from "react-native-red5pro";
import { SCREEN_HEIGHT, SCREEN_WIDTH, STATUS_BAR_HEIGHT, CAMERA_RATIO } from "../constants";
import { store } from "../store";

const styles = StyleSheet.create({
  container: {
    zIndex: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * CAMERA_RATIO,
    borderRadius: 15,
    overflow: "hidden",
  },
  subcontainer: {
    flex: 1,
  },
  videoView: {
    position: "absolute",
    backgroundColor: "black",
    top: 0,
    right: 0,
    bottom: 140,
    left: 0,
  },
  iconContainer: {
    position: "absolute",
    top: 12,
    right: 0,
    alignItems: "flex-start",
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  buttonContainer: {
    position: "absolute",
    backgroundColor: "black",
    bottom: 0,
    left: 0,
    right: 0,
    flex: 1,
    flexDirection: "column",
    height: 140,
  },
  button: {
    backgroundColor: "#2089dc",
    height: 46,
    marginTop: 2,
    alignContent: "center",
  },
  buttonLabel: {
    color: "white",
    fontSize: 20,
    padding: 8,
    textAlign: "center",
  },
  toast: {
    flex: 1,
    color: "white",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 14,
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 1.0)",
  },
  muteIcon: {
    padding: 6,
    borderRadius: 40,
    backgroundColor: "white",
  },
  muteIconRightmost: {
    right: 10,
  },
  muteIconRight: {
    right: 30,
  },
  muteIconToggled: {
    backgroundColor: "#2089dc",
  },
});

const isValidStatusMessage = (value) => {
  return value && typeof value !== "undefined" && value !== "undefined" && value !== "null";
};

export default class Publisher extends React.Component {
  constructor(props) {
    super(props);

    // Events.
    this.onMetaData = this.onMetaData.bind(this);
    this.onConfigured = this.onConfigured.bind(this);
    this.onPublisherStreamStatus = this.onPublisherStreamStatus.bind(this);
    this.onUnpublishNotification = this.onUnpublishNotification.bind(this);

    this.onSwapCamera = this.onSwapCamera.bind(this);
    this.onToggleAudioMute = this.onToggleAudioMute.bind(this);
    this.onToggleVideoMute = this.onToggleVideoMute.bind(this);

    this.state = {
      appState: AppState.currentState,
      audioMuted: false,
      isInErrorState: false,
      videoMuted: false,
      buttonProps: {
        style: styles.button,
      },
      toastProps: {
        style: styles.toast,
        value: "waiting...",
      },
      videoProps: {
        style: styles.videoView,
        onMetaData: this.onMetaData,
        onConfigured: this.onConfigured,
        onPublisherStreamStatus: this.onPublisherStreamStatus,
        onUnpublishNotification: this.onUnpublishNotification,
      },
    };

    const me = store.getState().user.user;
    const username = me.userInfo.username;

    this.streamProps = {
      collapsable: false,
      configuration: {
        host: "192.168.8.118",
        licenseKey: "NF69-TYR9-TAAH-CS61",
        streamName: username,
        port: 8554,
        contextName: "live",
        bufferTime: 0.5,
        streamBufferTime: 2.0,
        bundleID: "com.red5pro.reactnative",
        parameters: "",
        key: username,
        enableBackgroundStreaming: true,
      },
      subscribeVideo: true,
      showDebugView: true,
      useBackfacingCamera: true,
      enableBackgroundStreaming: true,
      bitrate: 1500,
      framerate: 30,
      cameraWidth: 1280,
      cameraHeight: 720,
    };
  }

  componentDidMount() {
    console.log("Publisher:componentWillMount()");
    AppState.addEventListener("change", this._handleAppStateChange);
  }

  componentWillUnmount() {
    console.log("Publisher:componentWillUnmount()");
    AppState.removeEventListener("change", this._handleAppStateChange);
    const nodeHandle = findNodeHandle(this.red5pro_video_publisher);
    const {
      configuration: { streamName },
    } = this.streamProps;
    if (nodeHandle) {
      unpublish(nodeHandle, streamName);
    }
  }

  _handleAppStateChange = (nextAppState) => {
    console.log(`Publisher:AppState - ${nextAppState}`);
    const { enableBackgroundStreaming } = this.streamProps;
    const nodeHandle = findNodeHandle(this.red5pro_video_publisher);
    if (this.state.appState.match(/inactive|background/) && nextAppState === "active") {
      console.log("Publisher:AppState - App has come to the foreground.");
    } else if (nextAppState.match(/inactive|background/) && this.state.appState === "active") {
      console.log("Publisher:AppState - App has gone to the background.");
      if (!enableBackgroundStreaming) {
        console.log("Publisher:AppState - unpublish()");
        // unpublish(nodeHandle)
        // onStop();
      }
    }
    this.setState({
      appState: nextAppState,
    });
  };

  render() {
    const { videoProps, toastProps, buttonProps, audioMuted, videoMuted } = this.state;

    const streamProps = this.streamProps;

    const setup = Object.assign({}, streamProps, videoProps);

    const audioIconColor = audioMuted ? "#fff" : "#000";
    const videoIconColor = videoMuted ? "#fff" : "#000";
    const audioIconStyle = audioMuted
      ? [styles.muteIcon, styles.muteIconRight, styles.muteIconToggled]
      : [styles.muteIcon, styles.muteIconRight];
    const videoIconStyle = videoMuted
      ? [styles.muteIcon, styles.muteIconRightmost, styles.muteIconToggled]
      : [styles.muteIcon, styles.muteIconRightmost];

    const assignVideoRef = (video) => {
      this.red5pro_video_publisher = video;
    };
    const assignToastRef = (toast) => {
      this.toast_field = toast;
    };
    return <R5VideoView {...setup} ref={assignVideoRef.bind(this)} style={styles.container} />;
  }

  onMetaData(event) {
    console.log(`Publisher:onMetadata :: ${event.nativeEvent.metadata}`);
  }

  onConfigured(event) {
    const {
      configuration: { streamName },
    } = this.streamProps;

    console.log(`Publisher:onConfigured :: ${event.nativeEvent.key}`);
    publish(findNodeHandle(this.red5pro_video_publisher), streamName);
  }

  onPublisherStreamStatus(event) {
    console.log(`Publisher:onPublisherStreamStatus :: ${JSON.stringify(event.nativeEvent.status, null, 2)}`);
    const status = event.nativeEvent.status;
    let message = isValidStatusMessage(status.message) ? status.message : status.name;
    if (!this.state.inErrorState) {
      this.setState({
        toastProps: { ...this.state.toastProps, value: message },
        isInErrorState: status.code === 2,
      });
    }
  }

  onUnpublishNotification(event) {
    console.log(`Publisher:onUnpublishNotification:: ${JSON.stringify(event.nativeEvent.status, null, 2)}`);
    this.setState({
      isInErrorState: false,
      toastProps: { ...this.state.toastProps, value: "Unpublished" },
    });
  }

  onSwapCamera() {
    console.log("Publisher:onSwapCamera()");
    swapCamera(findNodeHandle(this.red5pro_video_publisher));
  }

  onToggleAudioMute() {
    console.log("Publisher:onToggleAudioMute()");
    const { audioMuted } = this.state;
    if (audioMuted) {
      unmuteAudio(findNodeHandle(this.red5pro_video_publisher));
    } else {
      muteAudio(findNodeHandle(this.red5pro_video_publisher));
    }
    this.setState({
      audioMuted: !audioMuted,
    });
  }

  onToggleVideoMute() {
    console.log("Publisher:onToggleVideoMute()");
    const { videoMuted } = this.state;
    if (videoMuted) {
      unmuteVideo(findNodeHandle(this.red5pro_video_publisher));
    } else {
      muteVideo(findNodeHandle(this.red5pro_video_publisher));
    }
    this.setState({
      videoMuted: !videoMuted,
    });
  }
}
