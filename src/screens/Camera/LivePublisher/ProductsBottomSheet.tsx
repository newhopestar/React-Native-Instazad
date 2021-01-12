import React, { FunctionComponent, Ref, useRef } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { SCREEN_HEIGHT } from "../../../constants";
import useProducts, { Product } from "../../../hooks/Live/useProducts";
import { useBiddingActions } from "../../../hooks/Live/useBiddingActions";

interface Props {
  sheetRef: Ref<BottomSheet>;
  streamerUsername: string;
}

const ProductsBottomSheet: FunctionComponent<Props> = ({ sheetRef, streamerUsername }) => {
  const { products, currentProductId, selectProduct } = useProducts(streamerUsername);
  const flatListRef = useRef<FlatList<Product>>(null);
  const { resetTimer } = useBiddingActions(streamerUsername);

  function onSelectProduct(itemId: string) {
    selectProduct(itemId);
    resetTimer();
  }

  function getItemStyle(item: Product) {
    if (item.id == currentProductId) return styles.selectedProduct;
    if (item.status === "sold") return styles.soldProduct;
    if (item.status === "rejected") return styles.rejectedProduct;
    return styles.product;
  }

  return (
    <BottomSheet ref={sheetRef} snapPoints={[0, SCREEN_HEIGHT / 2]}>
      <BottomSheetFlatList
        ref={flatListRef}
        style={styles.list}
        data={products}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onSelectProduct(item.id)}>
            <View style={getItemStyle(item)}>
              <Text>{item.description}</Text>
            </View>
          </TouchableOpacity>
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
  soldProduct: { marginBottom: 100, backgroundColor: "green" },
  rejectedProduct: { marginBottom: 100, backgroundColor: "red" },
  description: {},
});

export default ProductsBottomSheet;
