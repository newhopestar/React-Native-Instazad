import React, { FunctionComponent } from "react";
import { Text, TouchableOpacity } from "react-native";
import CountdownTimer from "./CountdownTimer";

interface Props {
  timeLeft: number;
  startTimer: (seconds: number) => void;
}

const AdminCountdownTimer: FunctionComponent<Props> = ({ timeLeft, startTimer }) => {
  return (
    <TouchableOpacity onPress={() => startTimer(10)}>
      <CountdownTimer timeLeft={timeLeft} />
    </TouchableOpacity>
  );
};

export default AdminCountdownTimer;
