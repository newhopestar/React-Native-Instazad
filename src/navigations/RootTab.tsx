import {
  createMaterialTopTabNavigator,
  MaterialTopTabBarOptions,
  MaterialTopTabNavigationOptions,
} from "@react-navigation/material-top-tabs";
import React, { useState } from "react";
import { useSelector } from "../reducers";
import Direct from "../screens/Others/Direct";
import AuthStack, { AuthStackParamList } from "./AuthStack";
import CameraTab from "./CameraTab";
import HomeTab, { HomeTabParamList } from "./HomeTab";

export type rootStackParamList = {
  AuthStack: undefined;
  HomeTab: undefined;
  CameraTab: { setSwipeEnabled: (swipeEnabled: boolean) => void };
  Direct: undefined;
};
export type commonParamList = AuthStackParamList & HomeTabParamList & rootStackParamList;

const RootTab = createMaterialTopTabNavigator<rootStackParamList>();

const index = (): JSX.Element => {
  const user = useSelector((state) => state.user);
  const loggedIn = !!user?.user?.userInfo;

  const [swipeEnabled, setSwipeEnabled] = useState(true);

  const tabBarOptions: MaterialTopTabBarOptions = {
    indicatorContainerStyle: { display: "none" },
    tabStyle: { display: "none" },
  };

  return (
    <RootTab.Navigator
      initialRouteName={loggedIn ? "HomeTab" : "AuthStack"}
      tabBarOptions={tabBarOptions}
      swipeEnabled={swipeEnabled}
    >
      {!loggedIn && <RootTab.Screen name="AuthStack" component={AuthStack} />}
      {loggedIn && (
        <>
          <RootTab.Screen name="CameraTab" component={CameraTab} initialParams={{ setSwipeEnabled }} />
          <RootTab.Screen name="HomeTab" component={HomeTab} />
          <RootTab.Screen name="Direct" component={Direct} />
        </>
      )}
    </RootTab.Navigator>
  );
};
export default index;
