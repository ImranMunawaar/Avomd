import React, { Component } from "react";
import { View, TouchableOpacity, Text, Image, TextInput } from "react-native";
import { isValid } from "../../models/modules";
import * as Animatable from "react-native-animatable";
import { BubbleCard } from "../BubbleCardDashboard";
import { getHeight, getWidth } from "../../services/helper";
import { ToolResources } from "../ToolResources";
import { QuestionResources } from "../QuestionResources";
import { ExampleResources } from "../ExampleResources";
import Colors from "../../constants/Colors";
import * as Analytics from "../../services/Analytics";
import {
  POSTFIX_VALUE,
  POSTFIX_ASSIGNED,
} from "../../screens/DashboardExports";
import AssociatedCalculators from "../calculator2Screen/AssociatedCalculators2";
import { trimLastExc } from "../../constants/replace";
import AssociatedCalculatorsV1 from "../calculatorScreen/AssociatedCalculators";
import { fontFamily } from "../../constants/strings";
import Layout from "../../constants/Layout";
import { DashboardSegmentedModal } from "../../modals/dashboardSegmented/Modal";
export class DashboardSegmented extends Component {
  state = {
    buttonWrapperWidth: 0,
    choiceDropDown: false,
    selectedChoiceVal: "Select Answer",
    selectedChoiceIndex: 0,
    buttonWidths: {},
  };
  componentDidMount() {
    this.setDefaultChoice();
  }

  setButtonWidths = (key, value) => {
    this.setState((prevState) => {
      let buttonWidths = { ...prevState.buttonWidths };
      buttonWidths[key] = value;
      return { buttonWidths };
    });
  };
  setDefaultChoice = () => {
    const targetVariable = this.props.item?.targetVariable;
    const items = this.props.item?.items || [];

    items.forEach((item, index) => {
      if (item.isSelected) {
        const labelStr = typeof item === "object" ? item.label : item;
        const label = trimLastExc(labelStr || "");
        this.setState({ selectedChoiceVal: label, selectedChoiceIndex: index });
        const newVar = {
          [targetVariable]: index,
          [targetVariable + POSTFIX_VALUE]: item.label.replace("!", ""),
          [targetVariable + POSTFIX_ASSIGNED]: item.coefficient || 0,
        };
        this.props.setVariables(newVar);
        this.props.moveToNextStep();
      }
    });
  };
  onSelect = (key, value, coefficient) => {
    const { item } = this.props;
    const label = trimLastExc(value || "");
    const newVar = {
      [item.targetVariable]: key,
      /* store variable value in Varible object along with 
      its index to show variable values in different texts */
      [item.targetVariable + POSTFIX_VALUE]: label,
      /* store variable value in Varible object along with 
      its index to calculate formulas */
      [item.targetVariable + POSTFIX_ASSIGNED]: coefficient || 0,
    };
    this.props.setVariables(newVar);
    this.props.interactWithProtocol(
      `segmented button: ${label.replace("!", "")}`
    );
    Analytics.track(Analytics.events.CLICK_CHOICE, {
      title: item.title,
      chosen: label,
      type: "SEGMENTED",
    });
    this.props.moveToNextStep();
  };
  render() {
    let {
      variables,
      variablesBuffer,
      calculatorReports,
      item,
      itemKey,
      isLast,
      groupItem,
      groupTargetVariable,
      associatedCalculators,
      getVar,
      interactWithContent,
      interactWithProtocol,
      setInfo,
      _this,
      calculator,
      calculatorInfo,
      styles,
    } = this.props;
    const values = (isValid(item.items) ? item.items : item.value) || [];
    let {
      buttonWidths,
      choiceDropDown,
      selectedChoiceVal,
      selectedChoiceIndex,
    } = this.state;
    //TO-DO find a better way to get the values of full and half button
    const fullWidth = Layout.window.width - getWidth(12 + 14 + 23 + 23);
    const halfWidth = (fullWidth - getWidth(11)) / 2;
    let isFullButton = false;
    Object.values(buttonWidths).forEach((buttonWidth) => {
      if (!isFullButton && buttonWidth > halfWidth) {
        isFullButton = true;
      }
    });
    return (
      <Animatable.View
        animation="fadeInRight"
        delay={150}
        duration={300}
        key={item.id}
      >
        <BubbleCard
          groupCard={groupItem || calculator}
          isCalculator={calculator}
          isChatItem={!groupItem}
          style={{
            paddingBottom: isValid(item.elements)
              ? getHeight(16)
              : getHeight(17),
          }}
        >
          {isValid(item.title) && (
            <Text
              style={[
                styles.titleTextStyle,
                { fontSize: getHeight(groupItem || calculator ? 20 : 24) },
                groupItem || calculator ? { marginStart: 0 } : {},
              ]}
            >
              {item.title}
            </Text>
          )}
          {isValid(item.rationale) && (
            <Text
              style={[
                styles.questionTextStyleSub,
                groupItem || calculator ? { marginStart: 0 } : {},
              ]}
            >
              {item.rationale}
            </Text>
          )}
          {isValid(item.examples) && (
            <ExampleResources
              elements={item.examples}
              navigation={_this.props.navigation}
              variables={variables}
              calculator2={calculator}
              calculatorID={calculatorInfo ? calculatorInfo.code : false}
              itemKey={itemKey}
              parent={_this}
              insideGreen
              interact={(item, value, shouldLog) =>
                interactWithContent(
                  `page segmented ${item}: ${value}`,
                  shouldLog
                )
              }
            />
          )}
          {isValid(item.tools) && (
            <ToolResources
              elements={item.tools}
              navigation={_this.props.navigation}
              variables={variables}
              calculator2={calculator}
              calculatorID={calculatorInfo ? calculatorInfo.code : false}
              itemKey={itemKey}
              parent={_this}
              interact={(item, value, shouldLog) =>
                interactWithProtocol(`segmented ${item}: ${value}`, shouldLog)
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
                parent={_this}
                interact={(item, value, shouldLog) =>
                  interactWithProtocol(`segmented ${item}: ${value}`, shouldLog)
                }
              />
            )}
        </BubbleCard>

        <AssociatedCalculatorsV1
          _this={_this}
          associatedCalculators={associatedCalculators}
          calculatorReports={calculatorReports}
          setInfo={setInfo}
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

        <BubbleCard
          groupCard={groupItem || calculator}
          groupChoice={groupItem || calculator}
          answer={!groupItem && !calculator}
          isCalculator={calculator}
          isChatItem={!groupItem && !calculator}
          style={{
            width: values.length > 10 ? "100%" : "auto",
            paddingHorizontal: groupItem ? 0 : getWidth(23),
            marginBottom:
              groupItem || calculator ? getHeight(27) : getHeight(30),
            paddingBottom: getHeight(9),
          }}
        >
          {values.length > 10 && (
            <>
              <View
                style={{
                  marginBottom: getHeight(30),
                  marginTop: getHeight(19),
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    this.setState({ choiceDropDown: true });
                  }}
                >
                  <TextInput
                    style={{
                      height: getHeight(40),
                      borderRadius: getHeight(50),
                      elevation: 3,
                      color: "#1E1F20",
                      fontWeight: "400",
                      fontSize: getHeight(14),
                      shadowColor: "#000000",
                      borderColor: "#4A4A4A",
                      borderStyle: "solid",
                      borderWidth: 1,
                      backgroundColor: "#FFFFFF",
                      paddingHorizontal: getWidth(15),
                      fontFamily: fontFamily.Regular,
                    }}
                    pointerEvents="none"
                    editable={false}
                    value={selectedChoiceVal}
                  />
                  <Image
                    source={require("../../images/dropdownarrow.png")}
                    style={{
                      marginTop: getHeight(18),
                      position: "absolute",
                      right: getWidth(17),
                      width: getHeight(8),
                      height: getHeight(5),
                    }}
                  />
                </TouchableOpacity>
              </View>
              {/* DashboardSegmented Modal */}
              <View>
                {choiceDropDown && (
                  <DashboardSegmentedModal
                    isVisible={choiceDropDown}
                    selectedChoiceVal={selectedChoiceVal}
                    selectedChoiceIndex={selectedChoiceIndex}
                    choiceItems={values}
                    setChoice={(index, label, coefficient) => {
                      this.onSelect(index, label, coefficient);
                      this.setState({
                        selectedChoiceVal: label,
                        selectedChoiceIndex: index,
                      });
                    }}
                    close={() => this.setState({ choiceDropDown: false })}
                  />
                )}
              </View>
            </>
          )}

          {values.length <= 10 && (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
              }}
            >
              {values.map((value, key) => {
                const active = getVar(item.targetVariable, groupItem) === key;
                const isEvenIndex = key % 2 == 0;
                const labelStr =
                  typeof value === "object" ? value.label : value;
                const coefficient =
                  typeof value === "object" ? value.coefficient : 0;
                const label = trimLastExc(labelStr || "");
                return (
                  <TouchableOpacity
                    onLayout={(event) => {
                      const { width } = event.nativeEvent.layout;
                      if (buttonWidths[key + ""]) return;
                      this.setButtonWidths(key + "", width);
                    }}
                    key={key}
                    style={{
                      ...styles.balloonButtonStyle,
                      borderRadius: getHeight(48) / 2,
                      minHeight: getHeight(48),
                      width:
                        Object.keys(buttonWidths).length === values.length
                          ? isFullButton
                            ? "100%"
                            : "48.5%"
                          : null,
                      marginEnd: isEvenIndex ? (isFullButton ? 0 : "1.5%") : 0,
                      marginStart: isEvenIndex ? 0 : isFullButton ? 0 : "1.5%",
                      alignSelf: "stretch",
                      justifyContent: "center",
                      marginBottom: getHeight(11),
                      backgroundColor: active ? Colors.button : "#FFFFFF",
                      paddingHorizontal: getWidth(20),
                      paddingVertical: getHeight(10),
                    }}
                    onPress={() => this.onSelect(key, label, coefficient)}
                  >
                    <Text
                      style={{
                        fontSize: getHeight(16),
                        color: active ? "#FFFFFF" : "#000000",
                        fontWeight: "400",
                        textAlign: "center",
                        fontFamily: fontFamily.Regular,
                      }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </BubbleCard>
      </Animatable.View>
    );
  }
}
