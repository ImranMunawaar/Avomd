import React from "react";
import { getHeight, getWidth } from "../../services/helper";
import { View } from "react-native";

export default function GroupDivider() {
  return (
    <View
      style={{
        backgroundColor: "#C4C4C4",
        height: 0.5,
        marginBottom: getHeight(24), // -3 for title's font space
        //marginTop: getHeight(27),
      }}
    />
  );
}
