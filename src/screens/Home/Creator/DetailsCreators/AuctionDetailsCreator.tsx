import { useIsFocused } from "@react-navigation/native";
import React, { FunctionComponent, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Switcher from "../../../../components/Switcher";
import RNPickerSelect from "react-native-picker-select";
import { DetailsType } from "../../../../reducers/postReducer";

export type AuctionDetails = {
  type: "auction";
  auctionDuration?: number;
  openingPrice: number;
  buyNowPrice?: number;
  fromZero: boolean;
};

interface Props {
  details: AuctionDetails;
  onChange: (auctionDetails: AuctionDetails) => void;
  setCurrentDetails: (type: DetailsType) => void;
}

const daysSelectorOptions = [
  { label: "0 days", value: 0 },
  { label: "1 day", value: 1 },
  ...[2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => ({ label: `${number} days`, value: number })),
];

const minutesSelectorOptions = [
  ...[0, 10, 15, 30, 45].map((number) => ({ label: `${number} minutes`, value: number })),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((number) => ({ label: `${number} hours`, value: number * 60 })),
];

const AuctionDetailsCreator: FunctionComponent<Props> = ({ details, onChange, setCurrentDetails }) => {
  const [showTimer, setShowTimer] = useState(true);
  const [daysToEnd, setDaysToEnd] = useState<number>(1);
  const [minutesToEnd, setMinutesToEnd] = useState<number>(0);
  const [showOpeningPrice, setShowOpeningPrice] = useState(true);
  const [showBuyNowPrice, setShowBuyNowPrice] = useState(false);

  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) setCurrentDetails("auction");
  }, [isFocused]);

  useEffect(() => {
    if (showTimer) onChange({ ...details, auctionDuration: calculateAuctionDuration() });
  }, [daysToEnd, minutesToEnd]);

  useEffect(() => {
    setDaysToEnd(1);
    setMinutesToEnd(0);
    if (!showTimer) onChange({ ...details, auctionDuration: undefined });
    else onChange({ ...details, auctionDuration: calculateAuctionDuration() });
  }, [showTimer]);

  useEffect(() => {
    onChange({ ...details, openingPrice: 0 });
  }, [showOpeningPrice]);

  useEffect(() => {
    onChange({ ...details, buyNowPrice: undefined });
  }, [showBuyNowPrice]);

  function calculateAuctionDuration() {
    return daysToMilliseconds(daysToEnd) + minutesToMilliseconds(minutesToEnd);
  }

  function daysToMilliseconds(days: number) {
    return days * 1000 * 60 * 60 * 24;
  }

  function minutesToMilliseconds(minutes: number) {
    return minutes * 1000 * 60;
  }

  return (
    <View style={styles.container}>
      <View style={styles.valueOption}>
        <View style={styles.optionHeader}>
          <Text style={{ fontSize: 16 }}>Timer?</Text>
          <Switcher on={showTimer} onTurnOff={() => setShowTimer(false)} onTurnOn={() => setShowTimer(true)} />
        </View>
        {showTimer && (
          <View style={styles.optionValueContainer}>
            <RNPickerSelect
              value={daysToEnd}
              onValueChange={(daysToEnd: number) => daysToEnd !== null && setDaysToEnd(daysToEnd)}
              items={daysSelectorOptions}
            />
            <RNPickerSelect
              value={minutesToEnd}
              onValueChange={(minutesToEnd: number) => minutesToEnd !== null && setMinutesToEnd(minutesToEnd)}
              items={minutesSelectorOptions}
            />
          </View>
        )}
      </View>
      <View style={styles.valueOption}>
        <View style={styles.optionHeader}>
          <Text style={{ fontSize: 16 }}>Opening Price</Text>
          <Switcher
            on={showOpeningPrice}
            onTurnOff={() => setShowOpeningPrice(false)}
            onTurnOn={() => {
              setShowOpeningPrice(true);
              onChange({ ...details, fromZero: false });
            }}
          />
        </View>
        {showOpeningPrice && (
          <View style={styles.optionValueContainer}>
            <TextInput
              keyboardType="number-pad"
              value={details.openingPrice > 0 ? details.openingPrice.toString() : ""}
              onChangeText={(text) => {
                if (!text) {
                  onChange({ ...details, openingPrice: 0 });
                  return;
                }
                if (!Number(text)) return;
                onChange({ ...details, openingPrice: Number(text) });
              }}
              style={{ backgroundColor: "gray", width: 100 }}
            />
          </View>
        )}
      </View>
      <View style={styles.valueOption}>
        <View style={styles.optionHeader}>
          <Text style={{ fontSize: 16 }}>Buy Now Price</Text>
          <Switcher
            on={showBuyNowPrice}
            onTurnOff={() => setShowBuyNowPrice(false)}
            onTurnOn={() => {
              setShowBuyNowPrice(true);
              onChange({ ...details, fromZero: false });
            }}
          />
        </View>
        {showBuyNowPrice && (
          <View style={styles.optionValueContainer}>
            <TextInput
              keyboardType="number-pad"
              value={details.buyNowPrice && details.buyNowPrice > 0 ? details.buyNowPrice.toString() : ""}
              onChangeText={(text) => {
                if (!text) {
                  onChange({ ...details, buyNowPrice: 0 });
                  return;
                }
                if (!Number(text)) return;
                onChange({ ...details, buyNowPrice: Number(text) });
              }}
              style={{ backgroundColor: "gray", width: 100 }}
            />
          </View>
        )}
      </View>
      <View style={styles.option}>
        <Text style={{ fontSize: 16 }}>From Zero</Text>
        <Switcher
          on={details.fromZero}
          onTurnOff={() => onChange({ ...details, fromZero: false })}
          onTurnOn={() => {
            onChange({ ...details, fromZero: true });
            setShowOpeningPrice(false);
            setShowBuyNowPrice(false);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", flex: 1 },
  valueOption: {
    padding: 15,
  },
  optionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optionValueContainer: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  option: {
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default AuctionDetailsCreator;
