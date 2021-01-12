import React, { FunctionComponent } from "react";
import { TextInput } from "react-native";

interface Props {
  value?: number;
  onChange: (number: number | undefined) => void;
  onFocus: (() => void) | undefined;
  placeholder?: string;
  style?: any;
}

const NumberInput: FunctionComponent<Props> = ({ value, onChange, placeholder, style, onFocus }) => {
  return (
    <TextInput
      keyboardType="number-pad"
      placeholder={placeholder}
      value={value ? value.toString() : ""}
      onChangeText={(text) => {
        if (!text) {
          onChange(undefined);
          return;
        }
        if (!Number(text)) return;
        onChange(Number(text));
      }}
      onFocus={onFocus}
      style={style}
    />
  );
};

export default NumberInput;
