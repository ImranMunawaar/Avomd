import React, { Component } from "react";
import {
  View,
  StyleSheet,
  AppState,
  Keyboard,
  Platform,
  Linking,
  TouchableOpacity,
  Image,
  Text,
  Animated,
  UIManager,
  LayoutAnimation,
  TouchableWithoutFeedback,
} from "react-native";
import { SvgXml } from "react-native-svg";
import * as Animatable from "react-native-animatable";
import { isValid, numericToString } from "../../models/modules";
import FormattedText from "../FormattedText";
import { QuestionResources } from "../QuestionResources";
import { BubbleCard } from "../BubbleCardDashboard";
import { getHeight, getWidth } from "../../services/helper";
import { ExampleResources } from "../ExampleResources";
import {
  MAX_LENGTH_CALCULATOR_REPORT,
  POSTFIX_VALUE,
} from "../../screens/DashboardExports";

import { ToolResources } from "../ToolResources";
import Colors from "../../constants/Colors";
import { fontFamily } from "../../constants/strings";
import DraftJsView from "../DraftJsView";
import AssociatedCalculators from "../calculator2Screen/AssociatedCalculators2";
import * as Analytics from "../../services/Analytics";
import _ from "lodash";
import svgs from "../../constants/svgs";
import AssociatedCalculatorsV1 from "../calculatorScreen/AssociatedCalculators";
const parsedJSON = require("../../../draftTest.json");

class DashboardDescriptionCardV2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
    };
    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  _setMaxHeight = (event) => {
    this.setState({
      maxHeight: event.nativeEvent.layout.height,
    });
  };

  toggle = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });
    //this.setState({expanded: !this.state.expanded});
    this.setState((prev) => {
      if (!prev.expanded) {
        Analytics.track(Analytics.events.READING_DESCRIPTION_CARD, {
          title: this.props.item.title,
        });
        Analytics.track(Analytics.events.DESCRIPTION_CARD_TOGGLED, {
          title: this.props.item.title,
        });
      }
      return {
        expanded: !prev.expanded,
      };
    });
  };

  _setMinHeight = (event) => {
    this.setState({
      minHeight: event.nativeEvent.layout.height,
    });
  };

  onTextLayout = (event) => {
    this.setState({ lines: event.nativeEvent.lines.length });
  };

  render() {
    let {
      item,
      itemKey,
      isLast,
      groupItem,
      variables,
      conditionalObjects,
      getVar,
      _this,
      calculatorReports,
      setInfo,
      interactWithProtocol,
      associatedCalculators,
      isFirst,
    } = this.props;
    let { expanded } = this.state;

    const isAction = item.descriptionType === "action";
    const isLongDescEnabled = _.has(item, "isLongDescEnabled")
      ? item.isLongDescEnabled
      : null;

    const isNewShortDescJson = _.has(item, "newShortDescJson");
    const isNewLongDescJson = _.has(item, "newLongDescJson");

    const expandable =
      isLongDescEnabled !== null
        ? isLongDescEnabled
        : item.value
        ? isValid(item.value[1]) && item.value[1].length > 0
        : false;

    expanded = expandable && isLast ? true : expanded;
    const animationName = isLast ? "slideInUp" : "fadeInRight";

    return (
      <Animatable.View
        animation={groupItem ? false : animationName}
        delay={300}
        duration={500}
        key={itemKey}
      >
        <TouchableOpacity
          disabled={!expandable}
          onPress={() => {
            if (expandable) this.toggle();
          }}
        >
          <BubbleCard
            title={item.title}
            groupCard={groupItem}
            isChatItem={!isLast && !groupItem}
            isAction={!isLast}
            isLast={isLast}
            expanded={expanded}
            style={{
              paddingBottom: groupItem
                ? expandable
                  ? getHeight(15)
                  : getHeight(27)
                : isValid(item.elements)
                ? expandable
                  ? getHeight(15)
                  : getHeight(16)
                : getHeight(13),
              marginTop: getHeight(isFirst ? 10 : 0),
            }}
          >
            <View
              style={{
                marginStart: getWidth(0),
                marginBottom: groupItem ? 0 : getHeight(4),
                marginEnd: getWidth(0),
              }}
            >
              {isValid(item.title) && (
                <View
                  style={{
                    marginBottom: getHeight(6),
                    flexDirection: "row",
                  }}
                >
                  {isAction && (
                    <SvgXml
                      style={{
                        position: "absolute",
                        marginEnd: getWidth(9),
                        marginTop: getHeight(1),
                      }}
                      xml={svgs.bolt}
                      width={getHeight(21)}
                      height={getHeight(21)}
                    />
                  )}
                  <Text
                    style={[
                      styles.questionTitleTextStyle,
                      { fontSize: getHeight(groupItem ? 20 : 22) },
                    ]}
                  >
                    {(isAction ? "     " : "") + item.title}
                  </Text>
                </View>
              )}
              {(item.isShortDescEnabled && isValid(item.shortDescJson)) ||
              isValid(item.newShortDescJson) ? (
                <DraftJsView
                  blocksJSON={
                    isNewShortDescJson
                      ? item.newShortDescJson
                      : item.shortDescJson
                  }
                  variables={variables}
                  setReference={_this.setReference}
                  setInfo={_this.setInfo}
                  getVar={groupItem ? getVar : _this.getVar}
                  conditionalObjects={conditionalObjects}
                  isNewJson={isNewShortDescJson}
                />
              ) : item.value && isValid(item?.value[0]) ? (
                <FormattedText
                  text={item.value[0]}
                  _this={_this}
                  variables={variables}
                  calloutName={item.calloutName}
                  calloutTitle={item.calloutTitle}
                  calloutText={item.calloutText}
                  calloutReferences={item.calloutReferences}
                />
              ) : null}
              {expandable && (
                <View
                  style={{
                    marginTop: getHeight(expanded ? 16 : 0),
                  }}
                >
                  {expanded && (
                    <View
                      style={{
                        borderBottomWidth: 1,
                        borderBottomColor: "#E3E3E3",
                        marginBottom: 18,
                      }}
                    >
                      <Text
                        style={{
                          color: "#BFBFBF",
                          marginBottom: 5,
                          fontWeight: "400",
                          fontFamily: fontFamily.Regular,
                          fontSize: getHeight(16),
                        }}
                      >
                        Details
                      </Text>
                    </View>
                  )}
                  {isValid(item.longDescJson) ||
                  isValid(item.newLongDescJson) ? (
                    <DraftJsView
                      height={!expanded ? 0 : null}
                      blocksJSON={
                        isNewLongDescJson
                          ? item.newLongDescJson
                          : item.longDescJson
                      }
                      variables={variables}
                      setReference={_this.setReference}
                      setInfo={_this.setInfo}
                      getVar={groupItem ? getVar : _this.getVar}
                      conditionalObjects={conditionalObjects}
                      isNewJson={isNewLongDescJson}
                    />
                  ) : isValid(item.value[1]) ? (
                    <FormattedText
                      height={!expanded ? 0 : null}
                      text={item.value[1]}
                      _this={_this}
                      variables={variables}
                      calloutName={item.calloutName}
                      calloutTitle={item.calloutTitle}
                      calloutText={item.calloutText}
                      calloutReferences={item.calloutReferences}
                    />
                  ) : null}
                </View>
              )}
            </View>
            {/*<View>*/}
            {expandable ? (
              expanded && (
                <>
                  {/* Examples removed from builder */}
                  {isValid(item.examples) && (
                    <ExampleResources
                      elements={item.examples}
                      navigation={_this.props.navigation}
                      variables={variables}
                      itemKey={itemKey}
                      parent={_this}
                      insideGreen
                      interact={(item, value, shouldLog) =>
                        _this.interactWithContent(
                          `page segmented ${item}: ${value}`,
                          shouldLog
                        )
                      }
                      bottomSpace={isValid(item.tools) ? 8 : 0}
                    />
                  )}
                  {isValid(item.tools) && (
                    <ToolResources
                      elements={item.tools}
                      navigation={_this.props.navigation}
                      variables={variables}
                      itemKey={itemKey}
                      parent={_this}
                      interact={(item, value, shouldLog) =>
                        _this.interactWithProtocol(
                          `description ${item}: ${value}`,
                          shouldLog
                        )
                      }
                    />
                  )}
                  {!isValid(item.tools) &&
                    !isValid(item.examples) &&
                    isValid(item.elements) && (
                      <QuestionResources
                        elements={item.elements}
                        navigation={_this.props.navigation}
                        variables={variables}
                        itemKey={itemKey}
                        parent={_this}
                        interact={(item, value, shouldLog) =>
                          _this.interactWithProtocol(
                            `description ${item}: ${value}`,
                            shouldLog
                          )
                        }
                      />
                    )}
                </>
              )
            ) : (
              <>
                {/* Examples removed from builder */}
                {isValid(item.examples) && (
                  <ExampleResources
                    elements={item.examples}
                    navigation={_this.props.navigation}
                    variables={variables}
                    itemKey={itemKey}
                    parent={_this}
                    insideGreen
                    interact={(item, value, shouldLog) =>
                      _this.interactWithContent(
                        `page segmented ${item}: ${value}`,
                        shouldLog
                      )
                    }
                    bottomSpace={isValid(item.tools) ? 8 : 0}
                  />
                )}
                {isValid(item.tools) && (
                  <ToolResources
                    elements={item.tools}
                    navigation={_this.props.navigation}
                    variables={variables}
                    itemKey={itemKey}
                    parent={_this}
                    interact={(item, value, shouldLog) =>
                      _this.interactWithProtocol(
                        `description ${item}: ${value}`,
                        shouldLog
                      )
                    }
                  />
                )}
                {!isValid(item.tools) &&
                  !isValid(item.examples) &&
                  isValid(item.elements) && (
                    <QuestionResources
                      elements={item.elements}
                      navigation={_this.props.navigation}
                      variables={variables}
                      itemKey={itemKey}
                      parent={_this}
                      interact={(item, value, shouldLog) =>
                        _this.interactWithProtocol(
                          `description ${item}: ${value}`,
                          shouldLog
                        )
                      }
                    />
                  )}
              </>
            )}
            {/*</View>*/}
            {expandable && !isLast && (
              <View
                style={{
                  backgroundColor: "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: isValid(item.elements) ? 0 : getHeight(7),
                  flexDirection: "row",
                }}
              >
                <Image
                  source={
                    expanded
                      ? require("../../images/chevron-small-up.png")
                      : require("../../images/chevron-small-down.png")
                  }
                  style={{
                    width: getHeight(21),
                    height: getHeight(21),
                    marginEnd: getWidth(3),
                    marginTop: getHeight(3),
                  }}
                />
                <Text
                  style={{
                    color: Colors.primaryColor,
                    fontWeight: "600",
                    fontSize: getHeight(16),
                    lineHeight: getHeight(21.6),
                    fontFamily: fontFamily.Regular,
                  }}
                >
                  {expanded ? "" : "Read More"}
                </Text>
              </View>
            )}
          </BubbleCard>
        </TouchableOpacity>

        <AssociatedCalculatorsV1
          _this={_this}
          associatedCalculators={associatedCalculators}
          calculatorReports={calculatorReports}
          interactWithProtocol={interactWithProtocol}
          interactWith={"segmented more"}
        />
        <AssociatedCalculators
          item={item}
          groupItem={groupItem}
          calculatorReports={calculatorReports}
          setInfo={setInfo}
          interactWithProtocol={interactWithProtocol}
        />
      </Animatable.View>
    );
  }
}

export default DashboardDescriptionCardV2;

const styles = StyleSheet.create({
  questionTitleTextStyle: {
    color: "#000000",
    fontWeight: "700",
    fontSize: getHeight(22),
    lineHeight: getHeight(23),
    fontFamily: fontFamily.Bold,
    flexShrink: 1,
    // color: 'black',
    // fontWeight: '600',
    // fontSize: 15,
  },
  exampleResourcesStyle: {
    marginTop: getHeight(9),
    marginBottom: getHeight(8),
    borderWidth: 1,
    borderColor: "#B2B2B2",
    borderRadius: getHeight(10),
    paddingHorizontal: getWidth(19),
    paddingTop: getHeight(11),
    paddingBottom: getHeight(10),
  },
});
