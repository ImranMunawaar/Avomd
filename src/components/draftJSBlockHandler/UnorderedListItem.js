import React, { Component } from "react";
import { Platform, Text, View } from "react-native";
import generateKey from "react-native-draftjs-render/src/utils/generateKey";
import DraftJsText from "react-native-draftjs-render/src/components/DraftJsText";
import { getHeight, getWidth } from "../../services/helper";
import ConditionalText from "./ConditionalText";
import Layout from "../../constants/Layout";

const androidBullets = ["\u2022", "\u25CC", "\u25AA", "\u25AA", "\u25AA"]; // change 25CB to 25CC to resolve android devices conflict
const iOSBullets = ["\u25CF", "\u3007", "\u25AA", "\u25AA", "\u25AA"];
export default class UnorderedListItem extends Component {
  render() {
    let {
      item,
      params,
      setInfo,
      getVar,
      setReference,
      variables,
      conditionalObjects,
      isIndicationCard,
      isNewJson,
    } = this.props;
    let marginLeft = 0;
    marginLeft = item.depth * 24;

    const blockJSON = { ...item };

    const bullets = Platform.select({
      android: androidBullets,
      ios: iOSBullets,
    });

    const textStyle = params.customStyles.unstyled;

    const itemData = {
      key: item.key,
      text: item.text,
      type: item.type,
      data: item.data,
      inlineStyles: item.inlineStyleRanges,
      entityRanges: item.entityRanges,
      depth: item.depth,
    };

    const { contentState, customStyles, navigate } = params;

    return (
      <View
        style={{
          marginLeft,
          width: Layout.window.width - (getWidth(88) + marginLeft), //work arround - width applied because flex 1 is not appliing
          flex: 1,
        }}
        key={generateKey()}
      >
        <View style={{ flexDirection: "row" }}>
          <Text
            style={{
              lineHeight: textStyle.lineHeight,
              color: isIndicationCard ? "#ADADAD" : "#515151",
              fontSize: getHeight(9),
            }}
          >
            {bullets[blockJSON.depth] + "  "}
          </Text>
          {item.isConditional ? (
            <ConditionalText
              item={item}
              params={params}
              setInfo={setInfo}
              getVar={getVar}
              setReference={setReference}
              variables={variables}
              conditionalObjects={conditionalObjects}
              isNewJson={isNewJson}
            />
          ) : (
            <DraftJsText
              {...itemData}
              entityMap={contentState.entityMap}
              customStyles={customStyles}
              navigate={navigate}
              textProps={{}}
            />
          )}
        </View>
      </View>
    );
  }
}
