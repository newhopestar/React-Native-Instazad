import { useNavigation, useRoute } from "@react-navigation/native";
import { ReactElement } from "react";
import { goBack, navigate } from "./rootNavigation";

export function bottomSheet(content: ReactElement, replace?: boolean): void {
  if (replace) {
    goBack();
    setTimeout(() => navigate("BottomSheet", { content }), 100);
  } else {
    navigate("BottomSheet", { content });
  }
}
