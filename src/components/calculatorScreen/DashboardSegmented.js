import React, { Component } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { BubbleCard } from "../BubbleCardDashboard";
import { isValid } from "../../models/modules";
import { QuestionResources } from "../QuestionResources";
import Colors from "../../constants/Colors";
import crashlytics from "@react-native-firebase/crashlytics";
import * as Animatable from "react-native-animatable";
import { getHeight, getWidth } from "../../services/helper";
import { fontFamily } from "../../constants/strings";

export class DashboardSegmented extends Component {
  state = {
    buttonWrapperWidth: 0,
    buttonWidths: {},
  };

  setButtonWidths = (key, value) => {
    this.setState((prevState) => {
      let buttonWidths = { ...prevState.buttonWidths };
      buttonWidths[key] = value;
      return { buttonWidths };
    });
  };

  render() {
    let {
      variables,
      item,
      itemKey,
      getVar,
      _this,
      interactWithCalculator,
      setVariable,
      styles,
    } = this.props;
    const assignedValues = item.assignedValues;

    let { buttonWidths, buttonWrapperWidth } = this.state;
    let shouldShowAsColumn =
      Object.values(buttonWidths).reduce((partialSum, a) => partialSum + a, 0) >
      buttonWrapperWidth;
    return (
      <Animatable.View
        animation="fadeInRight"
        delay={150}
        duration={300}
        key={itemKey}
      >
        <BubbleCard
          groupCard={true}
          isCalculator={true}
          isChatItem={false}
          style={{
            paddingBottom: getHeight(17),
          }}
        >
          {isValid(item.title) && (
            <View>
              <Text
                style={[
                  styles.titleTextStyle,
                  { fontSize: getHeight(20) },
                  { marginStart: 0 },
                ]}
              >
                {item.title}
              </Text>
            </View>
          )}
          {isValid(item.rationale) && (
            <Text
              style={{
                fontSize: getHeight(15),
                fontFamily: fontFamily.Regular,
                color: "#ADADAD",
              }}
            >
              {item.rationale}
            </Text>
          )}
          {isValid(item.elements) && (
            <QuestionResources
              elements={item.elements}
              navigation={_this.props.navigation}
              variables={variables}
              calculatorID={_this.props.route.params?.calculator.code}
              parent={_this}
              interact={(item, value, shouldLog) =>
                interactWithCalculator(`segmented ${item}: ${value}`, shouldLog)
              }
            />
          )}
        </BubbleCard>

        <BubbleCard
          groupCard={true}
          groupChoice={true}
          answer={false}
          isCalculator={true}
          isChatItem={false}
          style={{
            paddingHorizontal: getWidth(23),
            marginBottom: getHeight(27),
          }}
        >
          <View
            onLayout={(event) => {
              const { width } = event.nativeEvent.layout;
              if (buttonWrapperWidth !== 0) return;
              this.setState({ buttonWrapperWidth: width });
            }}
            style={{
              alignSelf: "center",
              justifyContent: "center",
              flexDirection: shouldShowAsColumn ? "column" : "row",
            }}
          >
            {item.value.map((value, key) => {
              const active = getVar(item.targetVariable) === key;
              const isFirst = key === 0;
              const isLast = key === item.value.length - 1;
              return (
                <TouchableOpacity
                  onLayout={(event) => {
                    const { width } = event.nativeEvent.layout;
                    if (buttonWidths[key + ""]) return;
                    this.setButtonWidths(
                      key + "",
                      width + (shouldShowAsColumn ? 0 : 5)
                    );
                  }}
                  key={key}
                  first={isFirst}
                  last={isLast}
                  active={active}
                  small
                  success={active}
                  style={{
                    ...styles.balloonButtonStyle,
                    borderRadius: getHeight(48) / 2,
                    minHeight: getHeight(48),
                    alignSelf: "stretch",
                    justifyContent: "center",
                    marginBottom: shouldShowAsColumn
                      ? isLast
                        ? 0
                        : getHeight(11)
                      : 0,
                    marginRight: shouldShowAsColumn
                      ? 0
                      : isLast
                      ? 0
                      : getWidth(11),
                    backgroundColor: active ? Colors.button : "#FFFFFF",
                    minWidth: getWidth(85),
                    paddingHorizontal: getWidth(20),
                    paddingVertical: getHeight(10),
                  }}
                  onPress={() => {
                    interactWithCalculator(`segmented button: ${value}`);
                    setVariable(item.targetVariable, key);

                    try {
                      setVariable(
                        item.targetVariable + "__assigned",
                        assignedValues[key]
                      );
                    } catch (e) {
                      crashlytics().recordError(e);
                    }
                  }}
                >
                  <Text
                    numberOfLines={1}
                    uppercase={false}
                    style={{
                      fontSize: getHeight(16),
                      color: active ? "#FFFFFF" : "#000000",
                      fontWeight: "400",
                      textAlign: "center",
                      fontFamily: fontFamily.Regular,
                    }}
                  >
                    {value.trim()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </BubbleCard>
      </Animatable.View>
    );
  }
}
