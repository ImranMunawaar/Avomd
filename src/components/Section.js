import React from "react";
import { Text } from "react-native";
import { globalStyles } from "./GlobalStyles";
import { getWidth, getHeight } from "../services/helper";
import { fontFamily } from "../constants/strings";

class Section extends React.PureComponent {
  render() {
    const { title, isFirst } = this.props;

    return (
      <Text
        style={[
          globalStyles.sectionTitleTextStyle,
          {
            fontSize: getHeight(24),
            fontWeight: "600",
            fontFamily: fontFamily.SemiBold,
            marginStart: getWidth(38),
            marginTop: isFirst ? getHeight(21) : getHeight(13),
            marginBottom: getHeight(21),
          },
        ]}
      >
        {title}
      </Text>
    );
  }
}

export { Section };
