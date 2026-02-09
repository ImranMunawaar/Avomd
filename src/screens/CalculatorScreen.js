import React, { Component } from "react";
// import { Content } from "native-base";
import { Keyboard, StyleSheet, View, Platform, Text, Pressable } from "react-native";
import * as Animatable from "react-native-animatable";
import { isIphoneX } from "../services/iphoneXHelper";
import crashlytics from "@react-native-firebase/crashlytics";
import * as Analytics from "../services/Analytics";

import { LegacyCalculatorHeader } from "../components/theme/LegacyCalculatorHeader";
import { getHigh, getLow, getTitle, getUnit } from "../models/units";
import { isValid, getDeeplink, getActiveModule } from "../models/modules";
import { CalculatorReport } from "../components/CalculatorReportV2";
import { InformationModal } from "../modals/InformationModal";
import { DashboardSegmented } from "../components/calculatorScreen/DashboardSegmented";
import { DashboardPredetermined } from "../components/calculatorScreen/DashboardPredetermined";
import GroupDivider from "../components/group/GroupDivider";
import { getHeight, getWidth } from "../services/helper";
import { fontFamily } from "../constants/strings";
import Colors from "../constants/Colors";
import { calculateFormula } from "../models/formula";
export class CalculatorScreen extends Component {
  state = {
    variables: {},
  };

  componentDidMount() {
    this.setState({
      startTimestamp: new Date().getTime(),
      interactionCount: 0,
      variables: {},
    });

    const calculatorId = this.props.route.params?.calculator?.code;
    const deepLink = getDeeplink();

    Analytics.track(Analytics.events.VIEW_CALCULATOR_SCREEN, {
      calculator: calculatorId,
    });
  }

  duration = () => {
    const currTime = new Date().getTime();
    return parseInt(currTime - this.state.startTimestamp);
  };
  interactWithCalculator = (item, shouldLog = false) => {
    if (shouldLog) {
      Analytics.track(Analytics.events.INTERACT_WITH_CALCULATOR, { item });
    }
    let interactionCount = this.state.interactionCount;
    this.setState({ interactionCount: (interactionCount += 1) });
  };

  goBackWithVariables = () => {
    const { variables, result, itemKey } = this.state;
    const { navigation, route } = this.props;
    const calculator = route.params?.calculator;
    const calculatorId = calculator?.code;

    this.updateAssignments(result, variables);
    route.params?.onBackFromCalculator({
      variables,
      result,
      itemKey,
      calculatorId,
    });

    navigation.goBack();
  };

  updateAssignments(result, variables) {
    try {
      if (result.targetName) {
        variables[result.targetName] = result.targetValue;
      }
    } catch (e) {
      crashlytics().recordError(e);
    }
  }

  isInfoAvailable() {
    if (this.state.info) {
      return false;
    } else {
      return true;
    }
  }

  setVisibleModal(modalName) {
    this.setState({ visibleModal: modalName });
  }

  isModalVisible(modalName) {
    try {
      return this.state.visibleModal === modalName;
    } catch (e) {
      crashlytics().recordError(e);
      return false;
    }
  }

  async UNSAFE_componentWillMount() {
    const { params } = this.props.route;
    this.setState({
      variables: params?.variables,
      itemKey: params?.itemKey,
    });
  }

  getInputRating(key, value) {
    if (Number(value) > getHigh(key)) {
      return `High (>${getHigh(key)} ${getUnit(key)})`;
    } else if (Number(value) < getLow(key)) {
      return `Low (<${getLow(key)} ${getUnit(key)})`;
    } else {
      return getUnit(key);
    }
  }

  getVar = (key) => {
    if (!this.state) {
      return;
    }
    const { variables } = this.state;
    return variables[key];
  };

  updateFormulae() {
    const { variables } = this.state;
    const { navigation, route } = this.props;
    const calculator = route.params?.calculator;
    const { results } = calculator;
    const formulaArray = calculator.formula;
    formulaArray?.forEach((formulaObject) => {
      if (typeof formulaObject.formula === "string") {
        // One string ("FORULA")
        const calculated = calculateFormula(formulaObject.formula, variables);
        //console.log("Variables: ")
        //console.log(variables);
        //console.log("Formula: " + formulaObject.formula + "  -- Result: " + string(calculated) );

        if (calculated === null) {
          return;
        }
        variables[formulaObject.id] = calculated;
      } else if (Array.isArray(formulaObject.formula)) {
        // Array ("ASSIGNMENT")
        const formula = formulaObject["formula"];
        const index = formula.findIndex((formula) =>
          calculateFormula(formula, variables, {
            shouldAllVariablesAvailable: true,
          })
        );

        // if "calculatable"
        if (index !== -1) {
          variables[formulaObject.id] = formulaObject.secondaryValue[index];
        }
      }
    });

    const res = results?.find((result) => {
      const isTrue = calculateFormula(result.plusTrigger, variables, {
        returnBool: true,
      });
      return isTrue;
    });
    const result = res;
    // reporting variable
    if (result) {
      if (isValid(result.reportingVariable)) {
        if (result.reportingVariable === "none") {
          result.calculatedValue = null;
        } else {
          result.calculatedValue = this.getVar(result.reportingVariable);
        }
      } else {
        result.calculatedValue = this.getVar(calculator?.formula?.[0]?.id);
      }

      variables[result.targetName] = result;
      //  this.calcResult?.scrollIntoView({ behavior: "smooth" });
    }
    this.setState({ result });
  }

  setVariable = (key, value, { userEntry } = { userEntry: true }) => {
    const { variables } = this.state;
    variables[key] = value;
    this.setState({
      variables,
    });

    // update all string formulae using eval()
    this.updateFormulae();
  };

  renderCalculatorDashboardSegmented(item, itemKey) {
    const { getVar, interactWithCalculator, setVariable } = this;
    const { variables } = this.state;
    return (
      <DashboardSegmented
        variables={variables}
        item={item}
        itemKey={itemKey}
        getVar={getVar}
        _this={this}
        interactWithCalculator={interactWithCalculator}
        setVariable={setVariable}
        styles={styles}
      />
    );
  }

  renderCalculatorDashboardPreset(item, itemKey) {
    const { getVar, interactWithCalculator, setVariable, getInputRating } =
      this;
    const { variables } = this.state;

    return (
      <DashboardPredetermined
        variables={variables}
        item={item}
        itemKey={itemKey}
        getVar={getVar}
        getInputRating={getInputRating}
        _this={this}
        interactWithCalculator={interactWithCalculator}
        setVariable={setVariable}
        styles={styles}
      />
    );
  }

  renderCalculatorDashboardElement(item, itemKey, isLast) {
    const { variables } = this.state;

    // Associated variables are automatically deleted if not visible.

    if (
      !calculateFormula(item.positiveTrigger, variables, { returnBool: true })
    ) {
      delete variables[item.targetVariable];
      delete variables[item.targetVariable + "__assigned"];
      return;
    }

    switch (item.type) {
      case "PRESET":
      case "PREDETERMINED":
        return (
          <>
            {this.renderCalculatorDashboardPreset(item, itemKey)}
            {!isLast && <GroupDivider />}
          </>
        );
      case "BIGSEG":
      case "SEGMENTED":
        return (
          <>
            {this.renderCalculatorDashboardSegmented(item, itemKey)}
            {!isLast && <GroupDivider />}
          </>
        );
      default:
        return <Text key={itemKey}>{item.title}</Text>;
    }
  }

  render() {
    const { result } = this.state;
    const { navigation, route } = this.props;
    const { module, info, variables } = this.state;

    const onInfoClose = () => {
      Analytics.track(Analytics.events.CLOSE_INFORMATION_MODAL);
      this.setState({ info: null });
    };
    const calculator = route.params?.calculator;

    return (
      <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <View
          style={{
            flex: 1,
            marginTop: getHeight(
              Platform.OS === "ios" ? (isIphoneX ? 45 : 15) : 3
            ),
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 0,
            },
            backgroundColor: "#ffffff",
            shadowOpacity: 0.15,
            shadowRadius: 15,
            elevation: 5,
            borderRadius: getHeight(30),
          }}
        >
          <LegacyCalculatorHeader
            onBackPress={() => {
              // console.log("EXIT CALCULATOR SCREEN VARIABLES", );
              Analytics.track(Analytics.events.EXIT_CALCULATOR_SCREEN, {
                calculator: calculator?.code,
                protocol: getActiveModule()?.code,
                "interaction count": this.state.interactionCount,
                duration: this.duration(),
                variables: Object.keys(variables),
                result: result,
              });

              this.goBackWithVariables();
            }}
            navigation={navigation}
            title={
              isValid(calculator.shortTitle)
                ? calculator.shortTitle
                : "Calculator"
            }
          />
          <View>
            <Animatable.View animation="fadeInRight" delay={300} duration={500}>
              <View style={styles.introductionCard}>
                <InformationModal
                  info={info}
                  onClose={onInfoClose}
                  setVisibleModal={this.setVisibleModal}
                  isInfoAvailable={this.isInfoAvailable}
                  protocol={module}
                />
                <View
                  style={{
                    paddingTop: getHeight(0),
                    marginTop: getHeight(10),
                    //marginStart: getWidth(5),
                  }}
                >
                  {calculator.calculatorDescription
                    .split("|")
                    .map((sentence, key) => {
                      return (
                        <Text key={key} style={styles.introDescription}>
                          {sentence.split("::").length <= 1
                            ? sentence
                            : [
                                <Text style={styles.introDescription}>
                                  {sentence.split("::")[0]}:
                                </Text>,
                                <Text style={styles.introDescription}>
                                  {sentence.split("::")[1]}
                                </Text>,
                              ]}
                        </Text>
                      );
                    })}
                </View>
              </View>
            </Animatable.View>
            <View style={styles.calculatorContainer}>
              {calculator &&
                calculator.dashboard.map((dashboardElement, key) =>
                  this.renderCalculatorDashboardElement(
                    dashboardElement,
                    key,
                    calculator.dashboard.length - 1 === key
                  )
                )}
            </View>
          </View>

          <Animatable.View
            animation="bounceInUp"
            delay={1000}
            duration={1000}
            onAnimationBegin={Keyboard.dismiss}
            style={{
              margin: 0,
              backgroundColor: "#FCFCFC",
              bottom: 0,
              //paddingHorizontal: 13,
              //  paddingTop: 13,
              paddingBottom: getHeight(10),
              borderWidth: 0.3,
              borderColor: "#cdcdcd",
              shadowColor: "#000",
              shadowOffset: {
                width: 1,
                height: getHeight(2),
              },
              shadowOpacity: 0.1,
              shadowRadius: getHeight(10),
              elevation: 5,
            }}
          >
            <View
              style={{
                margin: 0,
                // backgroundColor: "white",
                bottom: 0,
                flexDirection: "column",
                paddingStart: getWidth(25),
                paddingVertical: getHeight(25),
                // borderTopWidth: 0.5,
              }}
            >
              <View>
                <CalculatorReport
                  calculatorResult={result}
                  associatedCalculator={calculator}
                />
              </View>
              <View style={{ paddingRight: getWidth(25) }}>
                <Pressable
                  full
                  disabled={!result}
                  style={{
                    backgroundColor: result ? Colors.button : "#C5C5C5",
                    height: 48,
                    borderRadius: 5,
                    //shadowColor: "#ffffff",
                    //marginHorizontal: getWidth(15),
                    // shadowOffset: {
                    //   width: 0,
                    //   height: 2,
                    // },
                    // shadowOpacity: 0.25,
                    //opacity: this.state.checkFormComplete ? 1 : 0.4,
                    //shadowRadius: 3.84,
                  }}
                  onPress={() => {
                    Analytics.track(Analytics.events.CLICK_SUBMIT_CALCULATOR, {
                      calculator: calculator?.code,
                      protocol: getActiveModule()?.code,
                      "interaction count": this.state.interactionCount,
                      duration: this.duration(),
                      variables: Object.keys(variables),
                      result: `${result.targetName}: ${result.value1}`,
                    });
                    this.goBackWithVariables();
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontWeight: "900",
                      lineHeight: getHeight(25),
                      fontFamily: this.state.checkFormComplete
                        ? fontFamily.Regular
                        : fontFamily.Bold,
                      fontSize: getHeight(16),
                    }}
                  >
                    Submit
                  </Text>
                </Pressable>
              </View>
            </View>
          </Animatable.View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cardStyle: {
    marginLeft: 15,
    marginRight: 15,
    borderRadius: 20,
    padding: 15,
  },
  ratingTextStyle: {
    color: "#FF8E3D",
    fontSize: 11,
    paddingLeft: 3,
  },
  lastItemStyle: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingLeft: 0,
    paddingRight: 0,
    marginLeft: 13,
    marginRight: 10,
    marginBottom: 11,
  },
  defaultInputStyle: {
    alignSelf: "center",
    width: getWidth(89),
    borderRadius: getHeight(34) / 2,
    backgroundColor: "#FFFFFF",
    height: getHeight(34),
    borderColor: "#4A4A4A",
    borderWidth: 0.5,
  },
  validInputStyle: {
    alignSelf: "center",
    minWidth: 90,
    borderRadius: 20,
    marginRight: 4,
    backgroundColor: "transparent",
    borderColor: "#25C377",
    height: 33,
  },
  introductionCard: {
    paddingBottom: getHeight(1),
    elevation: 0,
    paddingHorizontal: getWidth(30),
    paddingTop: getHeight(0),
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowColor: "#fff",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    backgroundColor: "white",
    marginBottom: getHeight(23),
  },
  introDescription: {
    fontSize: getHeight(18),
    fontWeight: "400",
    lineHeight: getHeight(18),
    fontFamily: fontFamily.Regular,
    color: "#ADADAD",
  },
  calculatorContainer: {
    //paddingBottom: getHeight(1),
    paddingHorizontal: getWidth(30),
    paddingTop: getHeight(1),
    marginTop: getHeight(15),
  },
  titleTextStyle: {
    fontSize: getHeight(22),
    fontWeight: "700",
    fontFamily: fontFamily.Bold,
    color: "#000000",
    lineHeight: getHeight(26.4),
    marginStart: getWidth(5),
  },
  balloonButtonStyle: {
    shadowColor: "black",
    shadowOpacity: 0.1,
    shadowOffset: {
      height: getHeight(4),
      width: 0,
    },
    shadowRadius: getHeight(10),
    elevation: 8,
  },
  descriptionTextStyle: {
    color: "#515151",
    fontWeight: "400",
    fontSize: getHeight(16),
    fontFamily: fontFamily.Regular,
    marginStart: getWidth(5),
  },
  questionTextStyleSub: {
    color: "#ADADAD",
    fontSize: getHeight(14),
    lineHeight: getHeight(18),
    fontFamily: fontFamily.Regular,
    fontWeight: "400",
    marginTop: getHeight(2),
    marginStart: getWidth(5),
  },
});
