import React, { Component } from "react";
import { Text, View } from "react-native";
import generateKey from "react-native-draftjs-render/src/utils/generateKey";
import DraftJsText from "react-native-draftjs-render/src/components/DraftJsText";
import ConditionalText from "./ConditionalText";

const counters = {
  // initialized the each level array with empty
  level: [[], [], [], [], []],
};

export default class OrderedListItem extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    // reset the counter level array on component mount
    counters.level = [[], [], [], [], []];
  }
  componentDidUpdate() {
    // reset the array values during update
    if (
      this.props.item.lastIndexType !== undefined &&
      this.props.item.lastIndexType !== "ordered-list-item-custom"
    ) {
      counters.level = [[], [], [], [], []];
    }
  }
  componentWillReceiveProps() {
    // reset the array values before rendring
    if (
      this.props.item.lastIndexType !== undefined &&
      this.props.item.lastIndexType !== "ordered-list-item-custom"
    ) {
      counters.level = [[], [], [], [], []];
    }
  }
  // conversion from integet to the roman
  integer_to_roman(num) {
    if (typeof num !== "number") return false;

    var digits = String(+num).split(""),
      key = [
        "",
        "C",
        "CC",
        "CCC",
        "CD",
        "D",
        "DC",
        "DCC",
        "DCCC",
        "CM",
        "",
        "X",
        "XX",
        "XXX",
        "XL",
        "L",
        "LX",
        "LXX",
        "LXXX",
        "XC",
        "",
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
      ],
      roman_num = "",
      i = 3;
    while (i--) roman_num = (key[+digits.pop() + i * 10] || "") + roman_num;
    return Array(+digits.join("") + 1).join("M") + roman_num;
  }

  render() {
    let {
      item,
      params,
      setInfo,
      getVar,
      setReference,
      variables,
      conditionalObjects,
      isNewJson,
    } = this.props;

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
    const textStyle = customStyles.unstyled;

    let marginLeft = 0,
      orderBullet = "";
    marginLeft = item.depth * 24;

    if (item.depth !== undefined) {
      if (counters.level[item.depth][item.zeroIndexKey] === undefined) {
        counters.level[item.depth][item.zeroIndexKey] = [];
      }

      if (!counters.level[item.depth][item.zeroIndexKey].includes(item.key)) {
        counters.level[item.depth][item.zeroIndexKey].push(item.key);
      }
      // set numeric counting for level 0 and 3
      if (item.depth === 0 || item.depth === 3) {
        orderBullet =
          counters.level[item.depth][item.zeroIndexKey].indexOf(item.key) +
          1 +
          ". ";
      }
      // set alpha numeric counting for level 1 and 4
      if (item.depth === 1 || item.depth === 4) {
        orderBullet =
          String.fromCharCode(
            counters.level[item.depth][item.zeroIndexKey].indexOf(item.key) + 65
          ).toLowerCase() + ". ";
      }
      // set alpha numeric counting for the level 2
      if (item.depth === 2) {
        orderBullet =
          this.integer_to_roman(
            counters.level[item.depth][item.zeroIndexKey].indexOf(item.key) + 1
          ) + ". ";
      }
    }

    return (
      <View style={{ flexDirection: "row" }} key={generateKey()}>
        <View style={{ flex: 1, flexDirection: "row", marginLeft }}>
          <Text style={textStyle}>{orderBullet}</Text>
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
