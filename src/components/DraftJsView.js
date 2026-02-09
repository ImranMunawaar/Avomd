import React from "react";
import { Linking, ScrollView, StyleSheet } from "react-native";
import Colors from "../constants/Colors";
import {
  getHeight,
  getWidth,
  updateDraftJsForMentions,
} from "../services/helper";
import getRNDraftJSBlocks from "react-native-draftjs-render";
import {
  getFormulaDescriptionDict,
  getInfoFor,
  getReference,
  isValid,
  setActiveModule,
} from "../models/modules";
import { fontFamily, regex } from "../constants/strings";
import Env from "../constants/Env";
import ConditionalText from "./draftJSBlockHandler/ConditionalText";
import UnorderedListItem from "./draftJSBlockHandler/UnorderedListItem";
import OrderedListItem from "./draftJSBlockHandler/OrderedListItem";
import { connect } from "react-redux";
import Media from "./Media";
import { useNavigation } from "@react-navigation/native";

const DraftJsView = ({
  blocksJSON,
  setReference,
  setInfo,
  height,
  variables,
  getVar,
  conditionalObjects,
  returnBlocks,
  isIndicationCard = false,
  calculatorReport = false,
  isNewJson,
  isCalc,
  modules,
  calculators2,
}) => {
  const navigation = useNavigation();

  const navigate = async (url) => {
    let linkOpened = false;
    if (!url.includes("tel:") && !url.includes("http")) {
      const module = modules[url];
      const calculator2 = calculators2[url];
      if (isValid(module)) {
        linkOpened = true;
        setInfo(null);
        module.lastViewedTimeStamp = Date.now();
        setActiveModule(url);
        if (module.contents.dashboard) {
          navigation.push("Dashboard");
        }
      } else if (isValid(calculator2)) {
        linkOpened = true;
        setInfo(null);
        calculator2.lastViewedTimeStamp = Date.now();
        navigation.push("Calculator2", {
          calculator: calculator2,
          variables: {},
          isFromModuleScreen: true,
        });
      }
    } else {
      Linking.canOpenURL(url).then((canOpen) => {
        if (canOpen) {
          Linking.openURL(url);
          linkOpened = true;
        }
      });
    }
    if (linkOpened) {
      return;
    }
    let isReference = url.match(regex.REFERENCE);

    let checkIsInfoBox = url.match(regex.INFOBOX);

    let checkIsFormula = url.match(regex.FORMULA);

    let info;
    info = isReference ? getReference(url, isCalc) : getInfoFor(url);

    if (checkIsFormula) {
      const formulaDescriptionDict = getFormulaDescriptionDict(url, variables);
      info = {
        introduction: formulaDescriptionDict["introduction"],
        title: formulaDescriptionDict["calculationTitle"],
        newTextJson: formulaDescriptionDict["newTextJson"],
        isFormula: true,
        formulaDescription: formulaDescriptionDict["newTextJson"],
        calloutText:
          "Formula:: " +
          formulaDescriptionDict["formulaDescription"] +
          "|Calculation:: " +
          formulaDescriptionDict["calculationDescription"],
      };
    }
    isReference ? setReference(info, isCalc) : info ? setInfo(info) : null;
  };

  const atomicHandler = (item) => {
    const data = item.data;
    switch (data.type) {
      case "IMAGE":
        return (
          <Media
            info={{
              imageLink: data.src,
              imageHeight: data.pocHeight,
              imageWidth: data.pocWidth,
            }}
            extraSpace={0}
          />
        );
      default:
        return null;
    }
  };

  const customBlockHandler = (item, params) => {
    if (item.type === "conditional_text") {
      return (
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
      );
    }
    //custom Unorder list
    if (item.type === "unordered-list-item-custom") {
      return (
        <UnorderedListItem
          item={item}
          params={params}
          setInfo={setInfo}
          getVar={getVar}
          setReference={setReference}
          variables={variables}
          conditionalObjects={conditionalObjects}
          isIndicationCard={isIndicationCard}
          isNewJson={isNewJson}
        />
      );
    }
    if (item.type === "ordered-list-item-custom") {
      return (
        <OrderedListItem
          item={item}
          params={params}
          setInfo={setInfo}
          getVar={getVar}
          setReference={setReference}
          variables={variables}
          conditionalObjects={conditionalObjects}
          isNewJson={isNewJson}
        />
      );
    }
  };

  const draftStyles = StyleSheet.flatten({
    link: {
      ...(isIndicationCard
        ? styles.introductionTextStyle
        : calculatorReport
        ? styles.calculatorReportStyle
        : styles.defaultTextStyle),
      color: isIndicationCard ? "#ADADAD" : Colors.primaryColor,
    },
    "header-three": {
      ...styles.defaultHeaderStyle,
    },
    "header-one": {
      ...styles.defaultHeaderStyle,
    },
    "header-two": {
      ...styles.defaultHeaderStyle,
    },
    "header-four": {
      ...styles.defaultHeaderStyle,
    },
    "header-five": {
      ...styles.defaultHeaderStyle,
    },
    highlight: {
      ...(isIndicationCard
        ? styles.introductionTextStyle
        : calculatorReport
        ? styles.calculatorReportStyle
        : styles.defaultTextStyle),
      color: "#EA873F",
    },
    header: {
      ...(isIndicationCard
        ? styles.introductionTextStyle
        : calculatorReport
        ? styles.calculatorReportStyle
        : styles.defaultTextStyle),
      color: Env.HEADER_THREE_TEXT_COLOR,
      fontFamily: fontFamily.SemiBold,
      fontWeight: "600",
      fontSize: getHeight(20),
      marginTop: getHeight(13),
      marginBottom: getHeight(15),
    },
    unstyled: {
      ...(isIndicationCard
        ? styles.introductionTextStyle
        : calculatorReport
        ? styles.calculatorReportStyle
        : styles.defaultTextStyle),
      fontWeight: "normal",
    },
    "ordered-list-item-custom": {
      ...(isIndicationCard
        ? styles.introductionTextStyle
        : calculatorReport
        ? styles.calculatorReportStyle
        : styles.defaultTextStyle),
      flex: 1,
      // flexDirection: "row",
      //left: Platform.select({ android: "-7%", ios: 0 })
    },
    "unordered-list-item-custom": {
      ...(isIndicationCard
        ? styles.introductionTextStyle
        : calculatorReport
        ? styles.calculatorReportStyle
        : styles.defaultTextStyle),
      flex: 1,
    },
    italic: {
      ...(isIndicationCard
        ? styles.introductionTextStyle
        : calculatorReport
        ? styles.calculatorReportStyle
        : styles.defaultTextStyle),
      fontFamily: fontFamily.Italic,
      fontWeight: "300",
    },
    bold: {
      fontSize: getHeight(16),
      lineHeight: getHeight(21.6),
      fontFamily: fontFamily.Regular,
    },
    orderedListItemContainer: {
      alignItems: "flex-start",
      marginBottom: getHeight(8),
    },
    orderedListItemNumber: {
      ...(isIndicationCard
        ? styles.introductionTextStyle
        : calculatorReport
        ? styles.calculatorReportStyle
        : styles.defaultTextStyle),
      fontWeight: "normal",
      alignSelf: "flex-start",
      marginStart: 0,
      marginEnd: getWidth(10),
      flexDirection: "row",
      left: Platform.select({ android: "-7%", ios: 0 }),
    },
    unorderedListItemBullet: {
      ...(isIndicationCard
        ? styles.introductionTextStyle
        : calculatorReport
        ? styles.calculatorReportStyle
        : styles.defaultTextStyle),
      backgroundColor: Env.BULLET_COLOR,
      height: getHeight(6),
      width: getHeight(6),
      borderRadius: getHeight(6) / 2,
      alignSelf: "flex-start",
      marginTop: getHeight(7.5),
      marginEnd: getWidth(11),
    },
    unorderedListItemContainer: {
      alignItems: "flex-start",
      marginBottom: getHeight(8),
    },
    viewAfterList: {
      height: getHeight(5),
    },
  });

  let blocks;
  try {
    //blocksJSON = draftJSON;
    //console.log(JSON.stringify({blocksJSON}));
    /*let entityMap = {};
    for (let entityMapKey in blocksJSON.entityMap) {
      entityMap[entityMapKey + ""] = blocksJSON.entityMap[entityMapKey];
    }
    draftJSON.entityMap = entityMap;*/
    //console.log(JSON.stringify({draftJSON}));
    //const testJSON = "{\"blocks\":[{\"key\":\"mxpz3\",\"data\":{},\"text\":\" infobox_gfyhx_code  + infobox_0958d_code + infobox_kzbz6_code OR\",\"type\":\"unordered-list-item\",\"depth\":0,\"entityRanges\":[{\"key\":0,\"length\":18,\"offset\":44},{\"key\":1,\"length\":18,\"offset\":23},{\"key\":2,\"length\":18,\"offset\":1}],\"inlineStyleRanges\":[]},{\"key\":\"4uspg\",\"data\":{},\"text\":\" infobox_gfyhx_code + infobox_kzbz6_code OR \",\"type\":\"unordered-list-item\",\"depth\":0,\"entityRanges\":[{\"key\":3,\"length\":18,\"offset\":22},{\"key\":4,\"length\":18,\"offset\":1}],\"inlineStyleRanges\":[]},{\"key\":\"8dsc9\",\"data\":{},\"text\":\" infobox_b346z_code + infobox_kzbz6_code OR\",\"type\":\"unordered-list-item\",\"depth\":0,\"entityRanges\":[{\"key\":5,\"length\":18,\"offset\":1},{\"key\":6,\"length\":18,\"offset\":22}],\"inlineStyleRanges\":[]},{\"key\":\"sqr7p\",\"data\":{},\"text\":\" infobox_0958d_code + infobox_kzbz6_code \",\"type\":\"unordered-list-item\",\"depth\":0,\"entityRanges\":[{\"key\":7,\"length\":18,\"offset\":22},{\"key\":8,\"length\":18,\"offset\":1}],\"inlineStyleRanges\":[]},{\"key\":\"6ru9h\",\"data\":{},\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"entityRanges\":[],\"inlineStyleRanges\":[]},{\"key\":\"1mcjj\",\"data\":{},\"text\":\"Mirtazapine is titrated as 7.5mg x 7 days, 15mg x 14 days, 30mg x 14 days, 45mg x 14 days, 60mg.\",\"type\":\"unstyled\",\"depth\":0,\"entityRanges\":[],\"inlineStyleRanges\":[]}],\"entityMap\":{\"0\":{\"data\":{\"mention\":{\"code\":\"mirtazapine\",\"name\":\"infobox_kzbz6_code\"}},\"type\":\"#mention\",\"mutability\":\"SEGMENTED\"},\"1\":{\"data\":{\"mention\":{\"code\":\"bupropion\",\"name\":\"infobox_0958d_code\"}},\"type\":\"#mention\",\"mutability\":\"SEGMENTED\"},\"2\":{\"data\":{\"mention\":{\"code\":\"Sertraline\",\"name\":\"infobox_gfyhx_code\"}},\"type\":\"#mention\",\"mutability\":\"SEGMENTED\"},\"3\":{\"data\":{\"mention\":{\"code\":\"mirtazapine\",\"name\":\"infobox_kzbz6_code\"}},\"type\":\"#mention\",\"mutability\":\"SEGMENTED\"},\"4\":{\"data\":{\"mention\":{\"code\":\"Sertraline\",\"name\":\"infobox_gfyhx_code\"}},\"type\":\"#mention\",\"mutability\":\"SEGMENTED\"},\"5\":{\"data\":{\"mention\":{\"code\":\"venlafaxine\",\"name\":\"infobox_b346z_code\"}},\"type\":\"#mention\",\"mutability\":\"SEGMENTED\"},\"6\":{\"data\":{\"mention\":{\"code\":\"mirtazapine\",\"name\":\"infobox_kzbz6_code\"}},\"type\":\"#mention\",\"mutability\":\"SEGMENTED\"},\"7\":{\"data\":{\"mention\":{\"code\":\"mirtazapine\",\"name\":\"infobox_kzbz6_code\"}},\"type\":\"#mention\",\"mutability\":\"SEGMENTED\"},\"8\":{\"data\":{\"mention\":{\"code\":\"bupropion\",\"name\":\"infobox_0958d_code\"}},\"type\":\"#mention\",\"mutability\":\"SEGMENTED\"}}}";
    //const parsedJSON = JSON.parse(testJSON);
    //console.log(blocksJSON);
    const parsedJSON = JSON.parse(blocksJSON);

    if (parsedJSON.blocks.length === 1 && !isValid(parsedJSON.blocks[0].text)) {
      return null;
    }

    //let updatedBlocksJSON = updateDraftJsBlocks(parsedJSON, variables, conditionalObjects);
    let updatedBlocksJSON = updateDraftJsForMentions(
      parsedJSON,
      variables,
      getVar,
      isNewJson,
      isCalc
    );
    //console.log(JSON.stringify({updatedBlocksJSON}));
    blocks = getRNDraftJSBlocks({
      contentState: updatedBlocksJSON,
      navigate,
      customStyles: draftStyles,
      customBlockHandler,
      atomicHandler,
    });
  } catch (e) {
    console.log("getRNDraftJSBlocks error", e);
    return null;
  }
  if (returnBlocks) {
    return blocks;
  }
  return (
    <ScrollView style={{ height }} scrollEnabled={false}>
      {blocks}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  defaultTextStyle: {
    fontSize: getHeight(16),
    lineHeight: getHeight(21.6),
    fontFamily: fontFamily.Regular,
    color: "#515151",
  },
  calculatorReportStyle: {
    fontSize: getHeight(14),
    lineHeight: getHeight(18),
    fontFamily: fontFamily.Regular,
    color: "#ADADAD",
  },
  introductionTextStyle: {
    fontSize: getHeight(16),
    lineHeight: getHeight(18),
    fontFamily: fontFamily.Regular,
    color: "#ADADAD",
  },
  defaultHeaderStyle: {
    lineHeight: getHeight(24),
    color: Env.HEADER_THREE_TEXT_COLOR,
    fontFamily: fontFamily.SemiBold,
    fontSize: getHeight(20),
    marginTop: getHeight(13),
    marginBottom: getHeight(15),
  },
});

export default connect((state) => ({
  modules: state.persist.data.modules,
  calculators2: state.persist.data.calculators2,
}))(DraftJsView);
