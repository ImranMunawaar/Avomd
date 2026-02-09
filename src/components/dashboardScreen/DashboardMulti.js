import React, { Component } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";
import { getInfoFor, isValid } from "../../models/modules";
import { BubbleCard } from "../../components/BubbleCardDashboard";
import { globalStyles } from "../../components/GlobalStyles";
import { getHeight, getWidth } from "../../services/helper";
import Colors from "../../constants/Colors";
import * as Analytics from "../../services/Analytics";
import {
  POSTFIX_SUBMITTED,
  POSTFIX_COUNT,
  POSTFIX_MULTITITLE,
  POSTFIX_VALUE,
  POSTFIX_ASSIGNED,
} from "../../screens/DashboardExports";
import Layout from "../../constants/Layout";
import { trimLastExc } from "../../constants/replace";
import { fontFamily } from "../../constants/strings";

export const POSTFIX_TITLE = "__title";

export class DashboardMulti extends Component {
  constructor(props) {
    super(props);
    this.state = {
      localVariables: {},
      submitExist: !!props.item?.submitExist && !props.groupItem,
    };
    //Initialize the value to null when submit exists
    if (this.state.submitExist) {
      this.initialValueWithSubmit(this.props.item);
    } else {
      this.initialValueWithoutSubmit(this.props.item);
    }
  }

  componentWillUnmount() {
    /**  reset variable on card unmount */
    let { item, variables } = this.props;
    if (!item.targetVariable) return;
    const newVar =
      item.items?.reduce((acc, cur, index) => {
        acc[`${item.targetVariable}_${index}`] = undefined;
        return acc;
      }, {}) || {};
    newVar[item.targetVariable + POSTFIX_COUNT] = undefined;
    newVar[item.targetVariable + POSTFIX_SUBMITTED] = undefined;
    newVar[item.targetVariable + POSTFIX_TITLE] = undefined;
    newVar[item.targetVariable + POSTFIX_VALUE] = undefined;
    newVar[item.targetVariable] = undefined;
    this.props.setVariables(newVar);
  }

  initialValueWithSubmit(item) {
    const vars = item?.value?.reduce((all, value, key) => {
      const varName = item.targetVariable + "_" + key.toString();
      all[varName] = null;
      return all;
    }, {});
    vars[this.props.item.targetVariable + POSTFIX_SUBMITTED] = 0;
    this.setState({ localVariables: vars });
  }

  initialValueWithoutSubmit(item) {
    const vars = item?.value?.reduce((all, value, key) => {
      const varName = item.targetVariable + "_" + key.toString();
      all[varName] = 0;
      return all;
    }, {});
    vars[this.props.item.targetVariable + POSTFIX_SUBMITTED] = 1;
    vars[this.props.item.targetVariable + POSTFIX_COUNT] =
      this.sumMultiAssignedValues(vars);
    this.props.setVariables(vars);
  }
  getVar = (key) => {
    const variables = { ...this.props.variables, ...this.state.localVariables };
    return variables[key];
  };
  onSelect = (varName, label, opt = { order }) => {
    const { order } = opt || {};
    const item = this.props.item;
    this.props.interactWithProtocol(`multi multi button: ${label}`);
    const newVar = {
      ...this.state.localVariables,
      /* set the multi item title value for content page */
      [item.targetVariable + POSTFIX_TITLE]: item.title,
    };
    if (this.getVar(varName) !== 1) {
      newVar[varName] = 1;
      Analytics.track(Analytics.events.CLICK_CHOICE, {
        cardTitle: item.title,
        selectedLabel: label,
        selectedOrder: order,
        title: item.title,
        chosen: label,
        type: "MULTI",
      });
    } else {
      // debugger;
      newVar[varName] = this.state.submitExist ? null : 0;
    }

    const postFixValues = this.getStringValue(newVar);
    newVar[item.targetVariable + POSTFIX_VALUE] = postFixValues;
    newVar[item.targetVariable + POSTFIX_COUNT] =
      this.sumMultiAssignedValues(newVar);
    this.postAssignedValues(newVar);
    const isSubmitted =
      this.getVar(item.targetVariable + POSTFIX_SUBMITTED) === 1;
    if (this.state.submitExist) {
      /** Each Time Multi-choice changes, reset the submit button */
      if (isSubmitted) {
        newVar[item.targetVariable + POSTFIX_SUBMITTED] = 0;
      }
    } else {
      this.props.setVariables(newVar);
    }
    /* local variables are always update-to-date */
    this.setState({ localVariables: newVar });
    // console.log(newVar);
  };
  getCount = (newVar) => {
    const item = this.props.item;
    const activeItemCount = item?.value?.reduce((count, value, key) => {
      const varName = item.targetVariable + "_" + key.toString();
      if (newVar[varName] === 1) {
        return count + 1;
      } else {
        return count;
      }
    }, 0);
    // console.log(newVar, activeItemCount);
    return activeItemCount;
  };
  onSubmit = (item) => {
    const { localVariables } = this.state;
    this.props.interactWithProtocol(
      `multi submit button: ${item.targetVariable}`
    );
    const activeItemSum = this.sumMultiAssignedValues(
      this.state.localVariables
    );
    const postFixValues = this.getStringValue(this.state.localVariables);
    const postAssignedValues = this.postAssignedValues(
      this.state.localVariables
    );
    const vars1 = {
      [item.targetVariable + POSTFIX_SUBMITTED]: 1,
      [item.targetVariable]: 1,
      [item.targetVariable + POSTFIX_COUNT]: activeItemSum,
      [item.targetVariable + POSTFIX_TITLE]: item.title,
      [item.targetVariable + POSTFIX_VALUE]: postFixValues,
    };

    let newVar = { ...this.state.localVariables, ...vars1 };
    this.setState({ localVariables: newVar });
    this.props.setVariables(newVar);
    // console.log(newVar);
    // this.props.scrollToBottom();
  };
  postAssignedValues = (localVariables) => {
    const { item } = this.props;
    item?.items?.filter((each, index) => {
      const varName = item.targetVariable + "_" + index.toString();
      if (localVariables[varName] === 1) {
        localVariables[
          item.targetVariable + "_" + index.toString() + POSTFIX_ASSIGNED
        ] = each?.coefficient || 1;
      } else {
        localVariables[
          item.targetVariable + "_" + index.toString() + POSTFIX_ASSIGNED
        ] = 0;
      }
    });
    this.setState({ localVariables });
    return localVariables;
  };
  getStringValue = (newVar) => {
    const { item } = this.props;
    const chosenArr =
      item?.items?.filter((each, index) => {
        const varName = item.targetVariable + "_" + index.toString();
        return newVar[varName] === 1;
      }) || [];
    if (chosenArr.length === 0) return "None";
    const str = chosenArr.map((chosen) => trimLastExc(chosen?.label || ""));
    return str.join(", ");
  };
  sumMultiAssignedValues = (newVar) => {
    const items = this.props.item.items;
    const targetVariable = this.props.item.targetVariable;
    if (!items) return;
    return items?.reduce((count, item, key) => {
      const varName = targetVariable + "_" + key.toString();
      if (newVar[varName] === 1) {
        return count + (item?.coefficient || 1);
      }
      return count;
    }, 0);
  };

  render() {
    let {
      item,
      isLast,
      groupItem,
      calculator,
      groupTargetVariable,
      getVar,
      setVariable,
      setVariables,
      moveToNextStep,
      interactWithProtocol,
      setInfo,
      variables,
      viewWidth,
      _this,
      styles,
    } = this.props;

    //For the previous/old modules that don't have submitExist property
    if (item.submitExist !== false) {
      item.submitExist = true;
    }
    //const mapItem = item.items || item.value;
    const mapItem = item.items ? item.items : item.value;
    const submitCount = mapItem.reduce((acc, value, key) => {
      const temp = item.targetVariable + "_" + key.toString();
      return this.getVar(temp) === 1 ? acc + 1 : acc;
    }, 0);

    return (
      <Animatable.View
        animation="fadeInRight"
        delay={300}
        duration={500}
        key={item.id}
      >
        <BubbleCard
          groupCard={groupItem || calculator}
          isCalculator={calculator}
          isChatItem={!groupItem && !calculator}
        >
          <Text
            style={[
              styles.titleTextStyle,
              { fontSize: getHeight(groupItem || calculator ? 20 : 24) },
              groupItem || calculator ? { marginStart: 0 } : {},
            ]}
          >
            {item.title}
          </Text>
          {isValid(item.rationale) && (
            <Text style={styles.questionTextStyleSub}>{item.rationale}</Text>
          )}
        </BubbleCard>
        {(groupItem || calculator) && <View style={{ height: getHeight(6) }} />}
        <BubbleCard
          groupCard={groupItem || calculator}
          groupChoice={groupItem || calculator}
          answer={!groupItem && !calculator}
          isCalculator={calculator}
          isChatItem={!groupItem && !calculator}
          style={{
            // paddingHorizontal: groupItem ? getWidth(23):getWidth(23),
            paddingBottom:
              groupItem || calculator
                ? 0
                : getHeight(item.submitExist ? 17 : 27),
            paddingEnd: 0,
            marginTop: groupItem || calculator ? getHeight(10) : 0,
            paddingStart: 0,
            marginBottom: getHeight(17),
          }}
        >
          <View
            style={[
              globalStyles.questionResourceViewStyle,
              {
                paddingStart: groupItem || calculator ? 0 : getWidth(20),
                paddingEnd: groupItem || calculator ? 0 : getWidth(13),
              },
            ]}
          >
            {mapItem.map((multiItem, key) => {
              const multiItemLength = multiItem.length;
              const isLast = key === mapItem.length - 1;
              const isFirst = key === 0;
              let infoBoxCode = multiItem.infoBoxAssigned
                ? multiItem.infoBoxAssigned
                : multiItem;
              const info = getInfoFor(infoBoxCode);
              const varName = item.targetVariable + "_" + key.toString();
              const active = this.getVar(varName) === 1;
              let itemName = multiItem.label ? multiItem.label : multiItem;
              /*if (info) {
                itemName = info.value;
              }*/

              // Element not found in Reusables
              return (
                // Customized margins to align the text items to the buttons
                <View
                  key={multiItem.label ? multiItem.label : multiItem + key}
                  style={{
                    marginEnd: getWidth(7),
                    marginBottom: getHeight(10),
                    maxWidth: Layout.window.width - getWidth(65),
                  }}
                  onLayout={(event) => {
                    const obj = event.nativeEvent.layout;
                    viewWidth = (obj.width - getWidth(14)) / 8;
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.nextButtonStyle,
                      styles.balloonButtonStyle,
                      {
                        backgroundColor: "white",
                        alignItems: "center",
                        paddingEnd: getWidth(9),
                        paddingStart: getWidth(12),
                        //paddingVertical: getHeight(10),
                        borderWidth: getWidth(1.5),
                        borderColor: active ? Colors.primaryColor : "#FFFFFF00",
                        height: null,
                        borderRadius: getHeight(30),
                        shadowOpacity: 0.15,
                        shadowOffset: {
                          height: getHeight(1),
                          width: getHeight(2),
                        },
                        shadowRadius: getHeight(10),
                        flexDirection: "row",
                      },
                    ]}
                    onPress={() => {
                      this.onSelect(varName, itemName, {
                        order: key,
                      });
                    }}
                  >
                    {/*Multi Selections*/}
                    <Image
                      source={
                        active
                          ? require("../../images/check-box-fill.png")
                          : require("../../images/check-box-outline.png")
                      }
                      style={{
                        marginEnd: getWidth(6),
                        width: getHeight(13),
                        height: getHeight(13),
                        marginVertical: getHeight(10),
                      }}
                    />
                    <Text
                      style={{
                        flexShrink: 1,
                        fontSize:
                          multiItemLength > viewWidth
                            ? getHeight(13)
                            : getHeight(14),
                        fontWeight: "normal",
                        fontFamily: fontFamily.Medium,
                        color: "#000000",
                      }}
                    >
                      {itemName}
                    </Text>
                    {info && (
                      <TouchableOpacity onPress={() => setInfo(info)}>
                        <Image
                          style={{
                            marginStart: getWidth(5),
                            width: getHeight(20),
                            height: getHeight(20),
                          }}
                          source={{ uri: "multiinfobox" }}
                        />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {isValid(item.targetVariable) &&
            this.state.submitExist &&
            this.getVar(item.targetVariable + POSTFIX_SUBMITTED) !== 1 && (
              <TouchableOpacity
                style={{
                  ...styles.nextButtonStyle,
                  ...styles.balloonButtonStyle,
                  backgroundColor: Colors.button,
                  marginTop: getHeight(20),
                }}
                onPress={() => {
                  this.onSubmit(item);
                  interactWithProtocol(
                    `multi submit button: ${item.targetVariable}`
                  );

                  moveToNextStep();
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontFamily: fontFamily.Medium,
                    fontSize: getHeight(16),
                  }}
                >
                  {submitCount !== 0 ? (
                    <Text
                      style={{
                        color: "white",
                        fontFamily: fontFamily.Medium,
                        fontSize: getHeight(16),
                      }}
                    >
                      Submit {submitCount} selections
                    </Text>
                  ) : (
                    <Text
                      style={{
                        color: "white",
                        fontFamily: fontFamily.Medium,
                        fontSize: getHeight(16),
                      }}
                    >
                      None
                    </Text>
                  )}
                </Text>
              </TouchableOpacity>
            )}
        </BubbleCard>
      </Animatable.View>
    );
  }
}
