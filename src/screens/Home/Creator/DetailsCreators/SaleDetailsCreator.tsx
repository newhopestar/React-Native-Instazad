import { useIsFocused } from "@react-navigation/native";
import React, { FunctionComponent, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Switcher from "../../../../components/Switcher";
import { DetailsType } from "../../../../reducers/postReducer";

export type SaleDetails = {
  type: "sale";
  quantity: number;
  price?: number;
};

interface Props {
  details: SaleDetails;
  onChange: (saleDetails: SaleDetails) => void;
  setCurrentDetails: (type: DetailsType) => void;
}

const SaleDetailsCreator: FunctionComponent<Props> = ({ details, onChange, setCurrentDetails }) => {
  const [showPrice, setShowPrice] = useState(true);

  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) setCurrentDetails("sale");
  }, [isFocused]);

  useEffect(() => {
    onChange({ ...details, price: undefined });
  }, [showPrice]);

  return (
    <View style={styles.container}>
      <View style={styles.option}>
        <Text style={{ fontSize: 16 }}>Quantity</Text>
        <TextInput
          keyboardType="number-pad"
          value={details.quantity > 0 ? details.quantity.toString() : ""}
          onChangeText={(text) => {
            if (!text) {
              onChange({ ...details, quantity: 0 });
              return;
            }
            if (!Number(text)) return;
            onChange({ ...details, quantity: Number(text) });
          }}
          style={{ backgroundColor: "gray", width: 100 }}
        />
      </View>
      <View style={styles.valueOption}>
        <View style={styles.optionHeader}>
          <Text style={{ fontSize: 16 }}>Price</Text>
          <Switcher on={showPrice} onTurnOff={() => setShowPrice(false)} onTurnOn={() => setShowPrice(true)} />
        </View>
        {showPrice ? (
          <View style={styles.optionValueContainer}>
            <TextInput
              keyboardType="number-pad"
              value={details.price && details.price > 0 ? details.price.toString() : ""}
              onChangeText={(text) => {
                if (!text) {
                  onChange({ ...details, price: 0 });
                  return;
                }
                if (!Number(text)) return;
                onChange({ ...details, price: Number(text) });
              }}
              style={{ backgroundColor: "gray", width: 100 }}
            />
          </View>
        ) : (
          <View style={styles.optionValueContainer}>
            <Text>Talk to the buyer</Text>
          </View>
        )}
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

export default SaleDetailsCreator;
