import React, { FunctionComponent, Ref, useRef } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { SCREEN_HEIGHT } from "../../../constants";
import useProducts, { Product } from "../../../hooks/Live/useProducts";

interface Props {
  sheetRef: Ref<BottomSheet>;
  streamerUsername: string;
}

const ProductsBottomSheet: FunctionComponent<Props> = ({ sheetRef, streamerUsername }) => {
  const { products, currentProductId } = useProducts(streamerUsername);
  const flatListRef = useRef<FlatList<Product>>(null);

  return (
    <BottomSheet ref={sheetRef} snapPoints={[0, SCREEN_HEIGHT / 2]}>
      <BottomSheetFlatList
        ref={flatListRef}
        style={styles.list}
        data={products}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={item.id == currentProductId ? styles.selectedProduct : styles.product}>
            <Text>{item.description}</Text>
          </View>
        )}
        extraData={currentProductId}
      />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  list: {
    backgroundColor: "white",
    marginBottom: -10,
  },
  product: {
    marginBottom: 100,
    backgroundColor: "grey",
  },
  selectedProduct: {
    marginBottom: 100,
    backgroundColor: "yellow",
  },
  description: {},
});

export default ProductsBottomSheet;
