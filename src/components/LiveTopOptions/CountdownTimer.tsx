import React, { FunctionComponent } from "react";
import { Platform, Text } from "react-native";

interface Props {
  timeLeft: number;
}

const CountdownTimer: FunctionComponent<Props> = ({ timeLeft }) => {
  function formatTimeLeft() {
    if (timeLeft <= 0) {
      return "00:00:00";
    }

    const minutesLeft = Math.floor((timeLeft / 1000 / 60) % 60);
    const secondsLeft = Math.floor((timeLeft / 1000) % 60);
    const millisecondsLeft = Math.floor(timeLeft % 1000);

    const minutes = `0${minutesLeft}`;
    const seconds = `${secondsLeft < 10 ? "0" : ""}${secondsLeft}`;
    const milliseconds = `${millisecondsLeft < 10 ? "00" : millisecondsLeft < 100 ? "0" : ""}${millisecondsLeft}`;

    return `${minutes}:${seconds}:${milliseconds}`;
  }

  return <Text style={{ fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" }}>{formatTimeLeft()}</Text>;
};

export default CountdownTimer;
