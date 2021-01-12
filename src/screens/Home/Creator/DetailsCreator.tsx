import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React, { FunctionComponent, useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { DetailsType } from "../../../reducers/postReducer";
import CaptionInput from "./CaptionInput";
import AuctionDetailsCreator, { AuctionDetails } from "./DetailsCreators/AuctionDetailsCreator";
import PhotoDetailsCreator, { PhotoDetails } from "./DetailsCreators/PhotoDetailsCreator";
import SaleDetailsCreator, { SaleDetails } from "./DetailsCreators/SaleDetailsCreator";
import { ProcessedImage } from "./ImagePicker";

const Tab = createMaterialTopTabNavigator();

export type Details = (AuctionDetails | SaleDetails | PhotoDetails) & {
  caption: string;
};

const oneDayDuration = 1000 * 60 * 60 * 24;

const defaultAuctionDetails: AuctionDetails = {
  type: "auction",
  openingPrice: 0,
  fromZero: false,
  auctionDuration: oneDayDuration,
};

const defaultSaleDetails: SaleDetails = { type: "sale", quantity: 1 };

interface Props {
  processedImages: ProcessedImage[];
  onGoBack: () => void;
  willGoToNextStep: boolean;
  onDone: (details: Details) => void;
}

const DetailsCreator: FunctionComponent<Props> = ({ processedImages, onGoBack, willGoToNextStep, onDone }) => {
  const [caption, setCaption] = useState<string>("");
  const [photoDetails, setPhotoDetails] = useState<PhotoDetails>({ type: "photo", offComment: false });
  const [auctionDetails, setAuctionDetails] = useState<AuctionDetails>(defaultAuctionDetails);
  const [saleDetails, setSaleDetails] = useState<SaleDetails>(defaultSaleDetails);
  const [currentDetailsType, setCurrentDetailsType] = useState<DetailsType>("photo");

  useEffect(() => {
    if (willGoToNextStep) {
      onDone({ ...getCurrentDetails(), caption });
    }
  }, [willGoToNextStep]);

  function getCurrentDetails() {
    const allDetails = { auction: auctionDetails, sale: saleDetails, photo: photoDetails };
    return allDetails[currentDetailsType];
  }

  return (
    <ScrollView style={{ height: "100%" }} keyboardShouldPersistTaps="never" bounces={true}>
      <CaptionInput caption={caption} onChange={setCaption} onGoBack={onGoBack} processedImages={processedImages} />
      <Tab.Navigator>
        <Tab.Screen name="Photo">
          {() => (
            <PhotoDetailsCreator
              details={photoDetails}
              onChange={setPhotoDetails}
              setCurrentDetails={setCurrentDetailsType}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Auction">
          {() => (
            <AuctionDetailsCreator
              details={auctionDetails}
              onChange={setAuctionDetails}
              setCurrentDetails={setCurrentDetailsType}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Sale">
          {() => (
            <SaleDetailsCreator
              details={saleDetails}
              onChange={setSaleDetails}
              setCurrentDetails={setCurrentDetailsType}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </ScrollView>
  );
};

export default DetailsCreator;
