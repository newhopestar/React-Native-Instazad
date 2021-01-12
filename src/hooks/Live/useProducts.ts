import { FirebaseDatabaseTypes } from "@react-native-firebase/database";
import { useEffect, useState } from "react";
import LiveStreamRefs from "./utils/LiveStreamRefs";

export type Product = {
  id: string;
  imageURL: string;
  description: string;
  status: "sold" | "rejected" | undefined;
};

export default function useProducts(streamerUsername: string) {
  const { productsRef, currentProductIdRef } = LiveStreamRefs(streamerUsername);

  const [products, setProducts] = useState<Product[]>([]);
  const [currentProductId, setCurrentProductId] = useState<string>();

  useEffect(() => {
    subscribeToProducts();
    subscribeToCurrentProduct();

    return () => {
      unsubscribeFromProducts();
      unsubscribeFromCurrentProduct();
    };
  }, []);

  function subscribeToProducts() {
    productsRef.on("value", (snapshot: FirebaseDatabaseTypes.DataSnapshot) => {
      if (!snapshot.exists()) return;

      const products: Product[] = [];
      snapshot.forEach((childNode: any) => {
        if (childNode.val()) {
          products.push({ ...childNode.val(), id: childNode.key });
        }
      });

      setProducts(products);
    });
  }

  function unsubscribeFromProducts() {
    productsRef.off("value");
    setProducts([]);
  }

  function subscribeToCurrentProduct() {
    currentProductIdRef.on("value", (snapshot: FirebaseDatabaseTypes.DataSnapshot) => {
      if (!snapshot.exists()) return;

      setCurrentProductId(snapshot.val());
    });
  }

  function unsubscribeFromCurrentProduct() {
    currentProductIdRef.off("value");
    setCurrentProductId(undefined);
  }

  function selectProduct(id: string) {
    currentProductIdRef.set(id);
  }

  function sellProduct(productId: string) {
    productsRef.child(`${productId}`).update({ status: "sold" });
  }

  function rejectProduct(productId: string) {
    productsRef.child(`${productId}`).update({ status: "rejected" });
  }

  function selectNextProduct() {
    const currentProductIndex = products.findIndex((product) => product.id == currentProductId);

    if (currentProductIndex !== products.length - 1) {
      currentProductIdRef.set(products[currentProductIndex + 1].id);
    }
  }

  return { products, currentProductId, selectProduct, sellProduct, rejectProduct, selectNextProduct };
}
