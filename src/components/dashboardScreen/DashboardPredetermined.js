import React, { Component } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";
import {
  getInfoFor,
  getInfoForCalculatorV2,
  isValid,
} from "../../models/modules";
import { BubbleCard } from "../BubbleCardDashboard";
import { getHigh, getLow, getTitle, getUnit } from "../../models/units";
import { getHeight, getWidth } from "../../services/helper";
import Colors from "../../constants/Colors";

import {
  POSTFIX_SUBMITTED,
  POSTFIX_SKIPPED,
} from "../../screens/DashboardExports";
import _ from "lodash";
import { fontFamily } from "../../constants/strings";

let timeoutId = 0;
const TIME_OUT = 800;
let viewWidth = 0;

export class DashboardPredetermined extends Component {
  constructor(props) {
    super(props);
    this.state = {
      localVariables: {},
      initialVariables: props.variables,
      isSubmitted: !props.item?.submitExist || !!props.groupItem,
    };
  }
  componentDidMount() {
    /**
     * set default values when:
     * 1. no form and submitExist btn
     * 2. inside form
     *  */
    if (
      this.props.item?.submitExist ||
      this.props.groupItem ||
      this.props.calculator
    ) {
      const { localVariables } = this.state;
      const { variables } = this.props;
      this.props.item?.values?.forEach((codeValue) => {
        if (codeValue.defaultValue !== undefined && codeValue.code) {
          /** prioritize calculator integration  */
          localVariables[codeValue.code] =
            variables[codeValue.code] || codeValue.defaultValue;
        }
      });
      this.setState({ localVariables });
      if (this.props.groupItem || this.props.calculator) {
        this.props.setVariables(localVariables);
      }
    }
  }

  componentDidUpdate() {
    const { variables } = this.props;
    const isParentVarChanged = !Object.is(
      variables,
      this.state.initialVariables
    );
    // console.log(isParentVarChanged, variables, this.state.localVariables);
    if (isParentVarChanged) {
      const localVariables = { ...this.state.localVariables, ...variables };
      this.setState({ localVariables, initialVariables: variables });
    }
  }

  checkSubmitted(groupItem) {
    const { item, variables } = this.props;
    const isSubmitted = item.value.every((key) => variables[key] !== undefined);
    return isSubmitted;
  }

  checkAllFilled() {
    const { item } = this.props;
    const { localVariables } = this.state;
    const isAllFilled = item.value.every(
      (key) =>
        localVariables[key] !== undefined &&
        localVariables[key] !== null &&
        localVariables[key] !== ""
    );
    return isAllFilled;
  }

  clickNext = () => {
    this.setState(({ localVariables }) => {
      this.props.setVariables(localVariables);
      // this.props.scrollToBottom();
      return { isSubmitted: true };
    });
  };

  setVariable = (key, value) => {
    if (this.props.item?.submitExist) {
      this.setState({ isSubmitted: false });
    }

    this.setState(({ localVariables, isSubmitted }) => {
      if (isSubmitted || this.props.groupItem || this.props.calculator) {
        this.props.setVariables({ [key]: value });
        if (!this.props.groupItem) {
          // this.props.scrollToBottom();
        }
      }
      localVariables[key] = value;
      return { localVariables };
    });
  };
  onNotTyping = (item) => {
    const isAllInputsFilled = this.checkAllFilled();

    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (isAllInputsFilled) {
      timeoutId = setTimeout(() => {
        this.props.setVariables(item.targetVariable + POSTFIX_SUBMITTED, 1.0);
        this.props.moveToNextStep();
      }, TIME_OUT);
    }
  };

  componentWillUnmount() {
    /**  reset variable on card unmount */
    let { item } = this.props;
    const newVar =
      item.value?.reduce((acc, cur) => {
        acc[cur] = undefined;
        return acc;
      }, {}) || {};
    this.props.setVariables(newVar);
  }

  render() {
    let {
      item,
      isLast,
      groupItem,
      calculator,
      groupTargetVariable,
      getVar,
      setInfo,
      moveToNextStep,
      interactWithProtocol,
      setVariable,
      styles,
      _this,
    } = this.props;
    const length = item.value?.length || 0;
    const isAllFilled = this.checkAllFilled();
    const { localVariables, isSubmitted } = this.state;
    const mapItem = item.values ? item.values : item.value;

    return (
      <Animatable.View
        animation="fadeInRight"
        delay={300}
        duration={500}
        key={item.id}
      >
        {isValid(item.rationale) && (
          <BubbleCard
            answer={!groupItem && !calculator}
            isCalculator={calculator}
            isChatItem={!groupItem && !calculator}
            groupCard={groupItem || calculator}
          >
            <Text style={styles.descriptionTextStyle}>{item.rationale}</Text>
          </BubbleCard>
        )}
        <BubbleCard
          answer={!groupItem && !calculator}
          isCalculator={calculator}
          isChatItem={!groupItem && !calculator}
          groupCard={groupItem || calculator}
          full
          style={{
            borderRadius: getHeight(20),
            paddingStart: groupItem || calculator ? 0 : getWidth(20),
            paddingEnd: groupItem || calculator ? 0 : getWidth(15),
            paddingTop: groupItem || calculator ? 0 : getHeight(18),
            paddingBottom:
              groupItem || calculator ? getHeight(27) : getHeight(18),
          }}
        >
          {isValid(item.title) && (
            <Text
              style={{
                fontWeight: groupItem || calculator ? "700" : "600",
                color: "#000000",
                fontSize:
                  groupItem || calculator ? getHeight(22) : getHeight(24),
                fontFamily: fontFamily.Bold,
                marginBottom: groupItem || calculator ? getHeight(16) : 0,
              }}
            >
              {item.title}
            </Text>
          )}
          {!calculator && !groupItem && (
            <View
              style={{
                backgroundColor: "#BCBCBC",
                height: 0.5,
                marginTop: getHeight(14),
                marginBottom: getHeight(16),
              }}
            />
          )}
          {getVar(item.id + POSTFIX_SKIPPED, groupItem) && (
            <Animatable.View animation="fadeInRight" delay={300} duration={500}>
              <Text
                style={{
                  ...styles.lastItemStyle,
                  marginTop: 5,
                  fontSize: getHeight(14),
                  color: "#000000",
                  fontWeight: "500",
                  marginLeft: 18,
                  fontFamily: fontFamily.Medium,
                }}
              >
                Not Available
              </Text>
            </Animatable.View>
          )}
          {!getVar(item.id + POSTFIX_SKIPPED, groupItem) &&
            mapItem.map((key, i) => {
              let infoBoxCode = key.infobox ? key.infobox : "";

              // key is using for handling backward compatibility
              key = key.code ? key.code : key;

              const info = calculator
                ? getInfoForCalculatorV2(infoBoxCode)
                : getInfoFor(infoBoxCode);
              return (
                <View
                  key={key}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom:
                      item.value.length - 1 === i ? 0 : getHeight(8),
                  }}
                >
                  <View
                    style={{
                      width: "55%",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        flex: 1,
                        fontWeight: "600",
                        fontSize: getHeight(14),
                        color: "#000000",
                        fontFamily: fontFamily.SemiBold,
                      }}
                    >
                      {getTitle(key)
                        ? getTitle(key)
                        : key === "sex" && "Gender"}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        alignItems: "center",
                      }}
                    >
                      {info && (
                        <TouchableOpacity onPress={() => setInfo(info)}>
                          <Image
                            style={{
                              marginStart: getWidth(3),
                              width: getHeight(30),
                              height: getHeight(30),
                            }}
                            source={{ uri: "qmark" }}
                          />
                        </TouchableOpacity>
                      )}
                      <View
                        style={{
                          width: getWidth(17),
                          height: getHeight(17),
                          marginEnd: getWidth(2),
                          //marginStart: getWidth(2),
                        }}
                      >
                        {isValid(getHigh(key)) &&
                        isValid(localVariables[key]) &&
                        Number(localVariables[key]) > Number(getHigh(key)) ? (
                          <Image
                            source={require("../../images/high.png")}
                            style={{
                              width: getHeight(17),
                              height: getHeight(17),
                            }}
                          />
                        ) : null}
                        {isValid(getLow(key)) &&
                        isValid(localVariables[key]) &&
                        Number(localVariables[key]) < Number(getLow(key)) ? (
                          <Image
                            source={require("../../images/low.png")}
                            style={{
                              width: getHeight(17),
                              height: getHeight(17),
                            }}
                          />
                        ) : null}
                      </View>
                    </View>
                  </View>
                  {key !== "sex" && (
                    <View
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start",
                      }}
                    >
                      <View style={styles.defaultInputStyle}>
                        <TextInput
                          selectionColor={Colors.borderColor}
                          ref={key + "__" + i}
                          onChangeText={(inputValue) => {
                            //variables clearing
                            this.setVariable(key, null);
                            ///Buffer
                            this.setVariable(key, inputValue);

                            if (
                              !calculator &&
                              !groupItem &&
                              !isSubmitted &&
                              !item.submitExist
                            ) {
                              this.onNotTyping(item);
                            }
                          }}
                          value={
                            localVariables[key] ? localVariables[key] + "" : ""
                          }
                          keyboardType="numeric"
                          style={{
                            fontWeight: "400",
                            fontSize: getHeight(14),
                            fontFamily: fontFamily.Medium,
                            color: "#000000",
                            textAlign: "center",
                            paddingVertical: getHeight(9),
                            paddingRight: getHeight(30),
                          }}
                        />
                        {localVariables[key] ? (
                          <TouchableOpacity
                            style={{
                              top: getHeight(5),
                              alignSelf: "flex-end",
                              position: "absolute",
                              right: getWidth(5),
                            }}
                            onPress={() => {
                              this.refs[key + "__" + i].focus();
                              this.setVariable(key, "");
                            }}
                          >
                            <Image
                              source={require("../../images/input_cross.png")}
                              style={{
                                height: getHeight(23),
                                width: getHeight(23),
                              }}
                            />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                      <Text
                        style={{
                          fontSize: getHeight(14),
                          marginStart: getWidth(8),
                          color: "#000000",
                          fontWeight: "400",
                          fontFamily: fontFamily.Regular,
                        }}
                      >
                        {getUnit(key)}
                      </Text>
                    </View>
                  )}
                  {key === "sex" && (
                    <View style={{ flexDirection: "row" }}>
                      <TouchableOpacity
                        key={"sex1" + key}
                        style={[
                          styles.genderButtonStyle,
                          {
                            backgroundColor:
                              localVariables[key] === 1
                                ? Colors.button
                                : "white",
                            marginEnd: getWidth(10.12),
                          },
                        ]}
                        onPress={() => {
                          interactWithProtocol(
                            `pre-determined sex button: ${key}`
                          );
                          this.setVariable(key, 1);
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          uppercase={false}
                          style={[
                            styles.genderTextStyle,
                            {
                              color:
                                localVariables[key] === 1 ? "white" : "black",
                            },
                          ]}
                        >
                          Male
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        key={"sex2" + key}
                        style={[
                          styles.genderButtonStyle,
                          {
                            backgroundColor:
                              localVariables[key] === 2
                                ? Colors.button
                                : "white",
                          },
                        ]}
                        onPress={() => {
                          interactWithProtocol(
                            `pre-determined sex button: ${key}`
                          );
                          this.setVariable(key, 2);
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          uppercase={false}
                          style={[
                            styles.genderTextStyle,
                            {
                              color:
                                localVariables[key] === 2 ? "white" : "black",
                            },
                          ]}
                        >
                          Female
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          {!calculator &&
            !groupItem &&
            !isSubmitted &&
            this.props.item.submitExist &&
            getVar(item.id + POSTFIX_SKIPPED, groupItem) !== false && (
              <TouchableOpacity
                disabled={!isAllFilled}
                style={[
                  styles.nextButtonStyle,
                  !isAllFilled
                    ? { backgroundColor: "#F4F4F4" }
                    : {
                        backgroundColor: Colors.button,
                        ...styles.balloonButtonStyle,
                      },
                  {
                    justifyContent: "center",
                    alignItems: "center",
                    width: getWidth(180),
                    height: getHeight(39),
                    marginTop: getHeight(14),
                  },
                ]}
                onPress={() => {
                  // interactWithProtocol(`pre-determined next button: ${item.targetVariable}`);
                  // this.setVariable(item.targetVariable + POSTFIX_SUBMITTED, 1.0, groupItem);
                  this.clickNext();
                  moveToNextStep();
                }}
              >
                <Text
                  style={{
                    fontFamily: fontFamily.SemiBold,
                    fontWeight: "600",
                    fontSize: getHeight(14),
                    color: "#FFFFFF",
                    lineHeight: getHeight(14),
                  }}
                >
                  Next
                </Text>
              </TouchableOpacity>
            )}
        </BubbleCard>
      </Animatable.View>
    );
  }
}
