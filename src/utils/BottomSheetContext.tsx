import React, { createContext, Dispatch, FunctionComponent, SetStateAction, useContext, useState } from "react";
import { SafeAreaView, Text } from "react-native";

interface Props {}

const BottomSheetContext = createContext<[boolean, Dispatch<SetStateAction<boolean>>]>([false, () => {}]);

export const useBottomSheet = () => useContext(BottomSheetContext);

export const BottomSheetProvider: FunctionComponent<Props> = ({ children }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  return <BottomSheetContext.Provider value={[isFullScreen, setIsFullScreen]}>{children}</BottomSheetContext.Provider>;
};
