/* eslint-disable no-console */
import React from "react";
import {
  AppState,
  findNodeHandle,
  Button,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "react-native-elements";
import {
  R5VideoView,
  R5ScaleMode,
  subscribe,
  unsubscribe,
  updateScaleMode,
  setPlaybackVolume,
} from "react-native-red5pro";
import { SCREEN_HEIGHT, SCREEN_WIDTH, STATUS_BAR_HEIGHT, CAMERA_RATIO } from "../constants";

const isValidStatusMessage = (value) => {
  return value && typeof value !== "undefined" && value !== "undefined" && value !== "null";
};

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
    backgroundColor: "white",
    bottom: 0,
    left: 0,
    right: 0,
    flex: 1,
    flexDirection: "column",
    height: 140,
  },
  imageContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "black",
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
    right: 10,
    width: 40,
    padding: 6,
    borderRadius: 40,
    backgroundColor: "white",
  },
  muteIconToggled: {
    backgroundColor: "#2089dc",
  },
});

export default class Subscriber extends React.Component {
  constructor(props) {
    super(props);

    // Events.
    this.onMetaData = this.onMetaData.bind(this);
    this.onConfigured = this.onConfigured.bind(this);
    this.onSubscriberStreamStatus = this.onSubscriberStreamStatus.bind(this);
    this.onUnsubscribeNotification = this.onUnsubscribeNotification.bind(this);

    this.onScaleMode = this.onScaleMode.bind(this);
    this.onToggleAudioMute = this.onToggleAudioMute.bind(this);

    this.doSubscribe = this.doSubscribe.bind(this);
    this.doUnsubscribe = this.doUnsubscribe.bind(this);
    this.retry = this.retry.bind(this);
    this.startRetry = this.startRetry.bind(this);
    this.stopRetry = this.stopRetry.bind(this);

    this.streamProps = {
      collapsable: false,
      configuration: {
        host: "192.168.8.118",
        licenseKey: "NF69-TYR9-TAAH-CS61",
        streamName: props.streamId,
        port: 8554,
        contextName: "live",
        bufferTime: 0.5,
        streamBufferTime: 2.0,
        bundleID: "com.red5pro.reactnative",
        parameters: "",
        key: props.username,
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

    this.state = {
      appState: AppState.currentState,
      scaleMode: R5ScaleMode.SCALE_TO_FILL,
      audioMuted: false,
      isInErrorState: false,
      isConnecting: false,
      isDisconnected: true,
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
        onSubscriberStreamStatus: this.onSubscriberStreamStatus,
        onUnSubscribeNotification: this.onUnsubscribeNotification,
      },
    };
  }

  componentDidMount() {
    console.log("Subscriber:componentWillMount()");
    AppState.addEventListener("change", this._handleAppStateChange);
  }

  componentWillUnmount() {
    console.log("Subscriber:componentWillUnmount()");
    this.stopRetry();
    AppState.removeEventListener("change", this._handleAppStateChange);
    this.doUnsubscribe();
  }

  _handleAppStateChange = (nextAppState) => {
    console.log(`Subscriber:AppState - ${nextAppState}`);
    const { enableBackgroundStreaming } = this.streamProps;

    if (this.state.appState.match(/inactive|background/) && nextAppState === "active") {
      console.log("Subscriber:AppState - App has come to the foreground.");
    } else if (nextAppState === "inactive") {
      console.log("Subscriber:AppState - App has gone to the background.");
      if (!enableBackgroundStreaming) {
        console.log("Subscriber:AppState - unsubscribe()");
        //        this.doUnsubscribe()
      }
    }
    this.setState({
      appState: nextAppState,
    });
  };

  render() {
    const { videoProps, toastProps, buttonProps, audioMuted, isDisconnected } = this.state;

    const { streamProps } = this;

    const setup = Object.assign({}, streamProps, videoProps);

    const displayVideo = setup.subscribeVideo;

    const audioIconColor = audioMuted ? "#fff" : "#000";
    const audioIconStyle = audioMuted ? [styles.muteIcon, styles.muteIconToggled] : styles.muteIcon;

    const assignVideoRef = (video) => {
      this.red5pro_video_subscriber = video;
    };
    const assignToastRef = (toast) => {
      this.toast_field = toast;
    };

    return <R5VideoView {...setup} ref={assignVideoRef.bind(this)} style={styles.container} />;
  }

  onMetaData(event) {
    console.log(`Subscriber:onMetadata :: ${event.nativeEvent.metadata}`);
  }

  onConfigured(event) {
    console.log(`Subscriber:onConfigured :: ${event.nativeEvent.key}`);
    this.doSubscribe();
  }

  onSubscriberStreamStatus(event) {
    console.log(`Subscriber:onSubscriberStreamStatus :: ${JSON.stringify(event.nativeEvent.status, null, 2)}`);
    const status = event.nativeEvent.status;
    let message = isValidStatusMessage(status.message) ? status.message : status.name;
    if (status.name.toLowerCase() === "error" || message.toLowerCase() === "disconnected") {
      this.doUnsubscribe();
      this.setState({
        isDisconnected: true,
        isConnecting: false,
      });
    } else if (message.toLowerCase() === "connected") {
      this.setState({
        isDisconnected: false,
        isConnecting: false,
      });
    }
    if (!this.state.inErrorState) {
      this.setState({
        toastProps: { ...this.state.toastProps, value: message },
        isInErrorState: status.code === 2,
      });
    }
  }

  onUnsubscribeNotification(event) {
    console.log(`Subscriber:onUnsubscribeNotification:: ${JSON.stringify(event.nativeEvent.status, null, 2)}`);
    this.setState({
      isInErrorState: false,
      toastProps: { ...this.state.toastProps, value: "waiting..." },
    });
  }

  onScaleMode() {
    console.log("Subscriber:onScaleMode()");
    const { scaleMode } = this.state;
    let scale = scaleMode + 1;
    if (scale > 2) {
      scale = 0;
    }
    updateScaleMode(findNodeHandle(this.red5pro_video_subscriber), scale);
    this.setState({
      scaleMode: scale,
    });
  }

  onToggleAudioMute() {
    console.log("Subscriber:onToggleAudioMute()");
    const { audioMuted } = this.state;
    if (audioMuted) {
      setPlaybackVolume(findNodeHandle(this.red5pro_video_subscriber), 100);
    } else {
      setPlaybackVolume(findNodeHandle(this.red5pro_video_subscriber), 0);
    }
    this.setState({
      audioMuted: !audioMuted,
    });
  }

  doSubscribe() {
    const {
      configuration: { streamName },
    } = this.streamProps;
    const nodeHandle = findNodeHandle(this.red5pro_video_subscriber);
    if (nodeHandle) {
      subscribe(findNodeHandle(this.red5pro_video_subscriber), streamName);
      setPlaybackVolume(findNodeHandle(this.red5pro_video_subscriber), 100);
    }
  }

  doUnsubscribe() {
    const nodeHandle = findNodeHandle(this.red5pro_video_subscriber);
    if (nodeHandle) {
      unsubscribe(nodeHandle);
    }
  }

  startRetry() {
    this.stopRetry();
    this.retryTimer = setTimeout(() => {
      this.retry();
    }, 1000);
  }

  stopRetry() {
    clearTimeout(this.retryTimer);
  }

  retry() {
    const {
      configuration: { streamName },
    } = this.streamProps;

    console.log(`attempting retry for stream name :: ${streamName}`);
    subscribe(findNodeHandle(this.red5pro_video_subscriber), streamName);
  }
}
