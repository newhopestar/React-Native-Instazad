import React, { FunctionComponent, useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PostBody from "../../../../../components/Post/PostBody";
import PostHeader from "../../../../../components/Post/PostHeader";
import { bottomSheet } from "../../../../../navigations/BottomSheetNavigation";
import { ExtraPost, SalePost } from "../../../../../reducers/postReducer";
import BuyOrderConfirmation from "./BuyOrderConfirmation";
import useSaleState from "./useSaleState";

interface Props {
  post: SalePost;
  setPost?: React.Dispatch<React.SetStateAction<ExtraPost>>;
}

const SalePostDetails: FunctionComponent<Props> = ({ post, setPost }) => {
  const { alreadyBought, buy, cancel } = useSaleState(post);
  const [buyQuantity, setBuyQuantity] = useState(1);

  function decreaseBuyQuantity() {
    setBuyQuantity((oldQuantity) => (oldQuantity !== 1 ? oldQuantity - 1 : oldQuantity));
  }

  function increaseBuyQuantity() {
    setBuyQuantity((oldQuantity) => (oldQuantity < post.quantity ? oldQuantity + 1 : oldQuantity));
  }

  function onBuyOrder() {
    bottomSheet(
      <BuyOrderConfirmation
        initialBuyQuantity={buyQuantity}
        quantityLimit={post.quantity}
        alreadyBought={alreadyBought}
        buy={buy}
        cancel={cancel}
      />
    );
  }

  return (
    <>
      <PostHeader post={post} setPost={setPost} />
      <PostBody post={post} setPost={setPost} />
      <Text>{`caption: ${post.content}`}</Text>
      <Text>{`price: ${post.price}`}</Text>
      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={decreaseBuyQuantity}>
          <Text>-</Text>
        </TouchableOpacity>
        <Text>{buyQuantity}</Text>
        <TouchableOpacity onPress={increaseBuyQuantity}>
          <Text>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={onBuyOrder}>
        <Text>{!alreadyBought ? "Buy" : "Cancel"}</Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  quantityContainer: {
    flexDirection: "row",
  },
});

export default SalePostDetails;
