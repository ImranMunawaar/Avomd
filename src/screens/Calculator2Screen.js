import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Animated,
  Text,
  Pressable
} from "react-native";
import * as Animatable from "react-native-animatable";
import { CalculatorHeader } from "../components/calculator2Screen/CalculatorHeader";
import { getHeight, getWidth } from "../services/helper";
import { fontFamily } from "../constants/strings";
import Colors from "../constants/Colors";
import { CalculatorReport } from "../components/calculator2Screen/CalculatorReport";

import { DashboardMulti } from "../components/dashboardScreen/DashboardMulti";
import { DashboardSegmented } from "../components/dashboardScreen/DashboardSegmented";
import { DashboardPredetermined } from "../components/dashboardScreen/DashboardPredetermined";
import crashlytics from "@react-native-firebase/crashlytics";

import { BALLON_ELEVATION } from "../constants/strings";
import { getHigh, getLow } from "../models/units";
import { POSTFIX_SUBMITTED } from "../screens/DashboardScreen";
import {
  isValid,
  getActiveModule,
  getActiveCalculator,
  extractCalculatorsFrom,
  setCustomNumerics,
} from "../models/modules";
import {
  calculateFormula,
  updateVariablesFromFormulae,
} from "../models/formula";
import * as Analytics from "../services/Analytics";
import { InformationModal } from "../modals/InformationModal";
import { ReferenceModal } from "../modals/ReferenceModal";
import GroupDivider from "../components/group/GroupDivider";
import { isIphoneX } from "../services/iphoneXHelper";
import AnimatedHeader from "../components/AnimatedHeader";
import Modal from "react-native-modal";

let viewWidth;
const autoScrollIncrement = 200;
const autoScrollBottomMargin = 250;
export class Calculator2Screen extends Component {
  constructor(props) {
    super(props);
    this.scrollView = React.createRef();
    this.state = {
      height: 0,
      calculator: getActiveCalculator(),
      variables: this.props.variables || {},
      calculatorReports: {},
      startTimestamp: new Date().getTime(),
      interactionCount: 0,
      progress: 0,
      checkFormComplete: false,
      reference: null,
    };
    if (this.state.calculator.customNumerics) {
      setCustomNumerics(this.state.calculator.customNumerics);
    }
  }
  componentDidMount() {
    const { variables } = this.state;
    this.updateFormulae(variables);
  }

  interactWithCalculator = (item, shouldLog = false) => {
    if (shouldLog) {
      Analytics.track(Analytics.events.INTERACT_WITH_CALCULATOR, { item });
    }
    let interactionCount = this.state.interactionCount;
    this.setState({ interactionCount: (interactionCount += 1) });
  };
  goBackWithVariables = () => {
    const { variables, output, itemKey } = this.state;
    const { navigation, route } = this.props;
    const calculator = route.params?.calculator;
    const calculatorId = calculator?.code;

    this.updateAssignments(output, variables);
    route.params?.onBackFromCalculator({
      variables,
      result: output,
      itemKey,
      calculatorId,
      isCalculator2: true,
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
  duration = () => {
    const currTime = new Date().getTime();
    return currTime - this.state.startTimestamp;
  };

  isInfoAvailable() {
    if (this.state.info) {
      return false;
    } else {
      return true;
    }
  }

  getInputRating = (key, value) => {
    if (Number(value) > getHigh(key)) {
      return true;
      // return `High (>${getHigh(key)} ${getUnit(key)})`;
    } else if (Number(value) < getLow(key)) {
      return false;
      // return `Low (<${getLow(key)} ${getUnit(key)})`;
    } else {
      // return getUnit(key);
      return;
    }
  };

  getVar = (key) => this.state.variables?.[key];
  checkFormComplete(localVariables, filteredGroupItem) {
    return (
      filteredGroupItem?.every((panel) => {
        switch (panel.type) {
          case "INDICATIONS":
          case "BETA_DESCRIPTION":
          //  return true;
          case "SEGMENTED":
            return localVariables[panel.targetVariable] !== undefined;
          case "MULTI":
            return (
              localVariables[panel.targetVariable + POSTFIX_SUBMITTED] === 1
            );
          case "PREDETERMINED":
            return (
              Array.isArray(panel.value) &&
              panel.value.every((code) => localVariables[code] !== undefined)
            );
          default:
            return true;
        }
      }) || false
    );
  }
  updateFormulae(variables) {
    const { calculator } = this.state;
    const output = { ...calculator?.contents?.output };
    const formulaArray = calculator?.contents?.formulae || [];
    variables = updateVariablesFromFormulae(variables, formulaArray);

    const filteredGroupItem = calculator?.contents?.dashboard?.filter(
      this.filterByTrigger
    );
    const isAllAnswerDone = this.checkFormComplete(
      variables,
      filteredGroupItem
    );

    let isTrue = calculateFormula(output.condition, variables, {
      returnBool: true,
    });

    if (isTrue) {
      // numerical output
      let numericalOutput = output.numerical?.id;
      if (numericalOutput) {
        output.calculatedValue =
          variables[output.numerical?.id] != undefined
            ? variables[output.numerical?.id]
            : this.getVar(output.numerical?.id);
      }
      if (output.outputType === "Numerical") {
        if (!output.calculatedValue) {
          return;
        }
      }

      // categorical output
      let categoricalOutputs = output.categorical;
      let validCategoricalOutputs = [];
      // find out categorical output whose condition equals to true
      categoricalOutputs?.forEach((categoricalOutput) => {
        const shouldDisplay = calculateFormula(
          categoricalOutput.categoryFormula,
          variables,
          {
            returnBool: true,
          }
        );

        if (shouldDisplay) {
          validCategoricalOutputs.push(categoricalOutput);
        }
      });

      let itemLengthBeforeFilter = validCategoricalOutputs.length;
      // if no valid categorical output found the show the default category
      // if more than one categorical output found, then neglect the default one
      if (validCategoricalOutputs.length > 1) {
        validCategoricalOutputs = validCategoricalOutputs.filter(
          (validCatOutput) => validCatOutput.isDefault !== true
        );
      }
      // calculator output always be one so only choose the first true condition
      output.validCategoricalOutput = validCategoricalOutputs[0];

      if (isAllAnswerDone || itemLengthBeforeFilter > 1) {
        this.setState({ output, checkFormComplete: isAllAnswerDone }, () =>
          this.calcResult?.scrollIntoView({ behavior: "smooth" })
        );
        //this.setState({ checkFormComplete: true });
      } else {
        this.setState({ output: null, checkFormComplete: isAllAnswerDone });
      }
    } else {
      this.setState({ output: null });
      //this.setState({ variables: variables });
    }
  }
  //  set variables for form and group
  setVariables = (newVars) => {
    this.setState(({ variables: oldVars }) => {
      // update all string formulae using eval()
      let variables = this.updateFormulae({ ...oldVars, ...newVars });
      variables =
        variables === undefined ? { ...oldVars, ...newVars } : variables;
      //const { activePages } = this.checkPages(variables);
      return { variables };
    });
  };

  setVariable = (key, value) => {
    const { variables } = this.state;
    variables[key] = value;
    this.setState({ variables }, () => this.updateFormulae(variables));
  };
  interactWithContent = (item, shouldLog = false) => {
    if (shouldLog) {
      Analytics.track(Analytics.events.INTERACT_WITH_CONTENT, { item });
    }
    let interactionCount = this.state.interactionCount;
    this.setState({ interactionCount: (interactionCount += 1) });
  };
  interactWithProtocol = (item, shouldLog = false) => {
    if (shouldLog) {
      Analytics.track(Analytics.events.INTERACT_WITH_PROTOCOL, { item });
    }
    let interactionCount = this.state.interactionCount;
    this.setState({ interactionCount: (interactionCount += 1) });
  };
  sigmoid = (t) => {
    return 1 / (1 + Math.pow(Math.E, -t));
  };

  moveToNextStep = () => {
    this.update();
  };
  update = () => {
    this.updateFormulae(this.state.variables);
  };

  setInfo = (info) => {
    this.setState({ info });
  };
  setReference = (reference) => {
    this.setState({ reference });
  };

  onInfoClose = () => {
    Analytics.track(Analytics.events.CLOSE_INFORMATION_MODAL);
    this.setState({ info: null });
  };

  // filter by trigger
  filterByTrigger = (item) => {
    const { variables } = this.state;
    const returnBool = true;
    const isDisplayed = calculateFormula(item.positiveTrigger, variables, {
      returnBool,
    });

    return isDisplayed;
  };

  renderCalculatorDashboardElement = (item, itemKey, isLast) => {
    const { variables, calculator } = this.state;

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
            <DashboardPredetermined
              item={item}
              itemKey={itemKey}
              calculator
              calculatorInfo={calculator}
              getVar={this.getVar}
              setVariable={this.setVariable}
              setVariables={this.setVariables}
              setInfo={this.setInfo}
              moveToNextStep={this.moveToNextStep}
              interactWithProtocol={this.interactWithProtocol}
              variables={variables}
              _this={this}
              styles={styles}
            />
            {!isLast && <GroupDivider />}
          </>
        );
      case "BIGSEG":
      case "SEGMENTED":
        const associatedCalculators = extractCalculatorsFrom(item.elements);
        return (
          <>
            <DashboardSegmented
              itemKey={itemKey}
              item={item}
              calculator
              calculatorInfo={calculator}
              getVar={this.getVar}
              variables={variables}
              setVariable={this.setVariable}
              setVariables={this.setVariables}
              moveToNextStep={this.moveToNextStep}
              interactWithContent={this.interactWithContent}
              associatedCalculators={associatedCalculators}
              calculatorReports={this.state.calculatorReports}
              interactWithProtocol={this.interactWithProtocol}
              _this={this}
              styles={styles}
            />
            {!isLast && <GroupDivider />}
          </>
        );
      case "MULTI":
        return (
          <>
            <DashboardMulti
              itemKey={itemKey}
              item={item}
              getVar={this.getVar}
              variables={variables}
              calculator
              isLast={false}
              setVariable={this.setVariable}
              setVariables={this.setVariables}
              moveToNextStep={this.moveToNextStep}
              interactWithProtocol={this.interactWithProtocol}
              setInfo={this.setInfo}
              viewWidth={viewWidth}
              styles={styles}
              _this={this}
            />
            {!isLast && <GroupDivider />}
            {isLast && (
              <View
                style={[
                  {
                    width: 40,
                    height: 40,
                    backgroundColor: "white",
                    top: 0,
                  },
                ]}
              />
            )}
          </>
        );
      default:
        return <Text>{item.title}</Text>;
    }
  };

  render() {
    const { output, reference } = this.state;
    const { navigation, route } = this.props;
    const { module, info, variables } = this.state;
    const offset = new Animated.Value(0);
    const onModalClose = () => this.setState({ reference: null });
    const calculator = route.params?.calculator;
    const isFromModuleScreen = route.params?.isFromModuleScreen;
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#ffffff",
        }}
      >
        <View
          style={{
            flex: 1,
            marginTop: isFromModuleScreen
              ? 0
              : getHeight(Platform.OS === "ios" ? (isIphoneX ? 45 : 15) : 3),
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
          {isFromModuleScreen ? (
            <AnimatedHeader
              animatedValue={offset}
              moduleTitle={calculator?.title}
              onBackPress={() => {
                Analytics.track(Analytics.events.EXIT_CALCULATOR_SCREEN, {
                  calculator: calculator?.code,
                  protocol: "from module screen",
                  "interaction count": this.state.interactionCount,
                  duration: this.duration(),
                  variables: Object.keys(variables),
                  result: output,
                });

                this.props.navigation.goBack();
              }}
            />
          ) : (
            <CalculatorHeader
              onBackPress={() => {
                Analytics.track(Analytics.events.EXIT_CALCULATOR_SCREEN, {
                  calculator: calculator?.code,
                  protocol: getActiveModule()?.code,
                  "interaction count": this.state.interactionCount,
                  duration: this.duration(),
                  variables: Object.keys(variables),
                  result: output,
                });

                navigation.goBack();
              }}
              title={calculator.title}
            />
          )}
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            enabled={Platform.OS === "ios"}
            behavior={"padding"}
          >
            <ScrollView
              ref={this.scrollView}
              scrollEventThrottle={0}
              onLayout={(event) => {
                var { height } = event.nativeEvent.layout;
                this.setState({ scrollViewHeight: height });
              }}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: offset } } }],
                {
                  useNativeDriver: false,
                  listener: (event) => {
                    this.setState({
                      contentOffset: event.nativeEvent.contentOffset.y,
                    });
                  },
                }
              )}
              enableResetScrollToCoords={false}
            >
              <View
                onLayout={(event) => {
                  const { scrollViewHeight } = this.state;
                  var { height } = event.nativeEvent.layout;
                  if (
                    this.shouldScrollPage &&
                    height - (this.state.contentOffset + autoScrollIncrement) >
                      scrollViewHeight - autoScrollBottomMargin
                  ) {
                    setTimeout(() => {
                      this.scrollView.current.scrollTo({
                        x: 0,
                        y: this.state.contentOffset + autoScrollIncrement,
                        animated: true,
                      });
                      this.shouldScrollPage = false;
                    });
                  }
                }}
                style={{
                  paddingTop: getHeight(5),
                  //paddingBottom: getHeight(12),
                }}
              >
                {isValid(calculator.description) ? (
                  <View style={styles.introductionCard}>
                    <Text
                      style={{
                        fontSize: getHeight(15),
                        fontWeight: "400",
                        lineHeight: getHeight(18),
                        fontFamily: fontFamily.Regular,
                        color: "#ADADAD",
                      }}
                    >
                      {calculator.description}
                    </Text>
                  </View>
                ) : null}
                <View style={styles.calculatorContainer}>
                  {calculator?.contents?.dashboard?.map(
                    (dashboardElement, key) => {
                      return this.renderCalculatorDashboardElement(
                        dashboardElement,
                        key,
                        calculator?.contents?.dashboard.length - 1 === key
                      );
                    }
                  )}
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
          <InformationModal
            info={info}
            onClose={this.onInfoClose}
            setReference={this.setReference}
            setVisibleModal={this.setVisibleModal}
            isInfoAvailable={this.isInfoAvailable}
            protocol={module}
            isCalc
          />

          <ReferenceModal
            reference={reference}
            onClose={() => {
              Analytics.track(Analytics.events.CLOSE_REFERENCE_MODAL);
              onModalClose();
            }}
            protocol={getActiveModule()?.code}
            onModalClose={onModalClose}
          />

          {isValid(output) && (
            <Animatable.View
              animation="bounceInUp"
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
                  paddingHorizontal: getWidth(25),
                  paddingVertical: getHeight(25),
                  // borderTopWidth: 0.5,
                }}
              >
                <ScrollView style={{ maxHeight: getHeight(300) }}>
                  <CalculatorReport
                    calculatorResult={output}
                    associatedCalculator={calculator}
                  />
                </ScrollView>
                {!isFromModuleScreen && (
                  <Pressable
                    full
                    disabled={!this.state.checkFormComplete}
                    style={{
                      backgroundColor: this.state.checkFormComplete
                        ? Colors.button
                        : "#C5C5C5",
                      height: 48,
                      borderRadius: getHeight(5),
                      shadowColor: "#ffffff",
                      //marginHorizontal: getWidth(15),
                      // shadowOffset: {
                      //   width: 0,
                      //   height: 2,
                      // },
                      // shadowOpacity: 0.25,
                      opacity: this.state.checkFormComplete ? 1 : 0.4,
                      //shadowRadius: 3.84,
                    }}
                    onPress={() => {
                      Analytics.track(
                        Analytics.events.CLICK_SUBMIT_CALCULATOR,
                        {
                          calculator: this.state.calculator.code,
                          protocol: getActiveModule()?.code,
                          "interaction count": this.state.interactionCount,
                          duration: this.duration(),
                          variables: Object.keys(variables),
                          result: `${output?.name}: ${output?.calculatedValue}`,
                        }
                      );
                      this.goBackWithVariables();
                      // navigation.goBack();
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
                )}
              </View>
            </Animatable.View>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  introductionCard: {
    paddingBottom: getHeight(1),
    paddingHorizontal: getWidth(30),
    marginTop: getHeight(5),
  },
  calculatorContainer: {
    //paddingBottom: getHeight(1),
    paddingHorizontal: getWidth(30),
    paddingTop: getHeight(1),
    marginTop: getHeight(15),
  },
  cardStyle: {
    marginLeft: getWidth(15),
    marginRight: getWidth(15),
    borderRadius: getHeight(20),
    padding: getHeight(15),
  },
  inputStyle: {
    width: getWidth(100),
    borderRadius: getHeight(8),
  },
  nextButtonStyle: {
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: "#F4F4F4",
    height: getHeight(48),
    borderRadius: getHeight(48) / 2,
    paddingHorizontal: getWidth(24),
    alignItems: "center",
  },
  balloonButtonStyle: {
    shadowColor: "black",
    shadowOpacity: 0.1,
    shadowOffset: {
      height: getHeight(4),
      width: 0,
    },
    shadowRadius: getHeight(10),
    elevation: BALLON_ELEVATION,
  },
  notAvailableButtonStyle: {
    alignSelf: "center",
    margin: getHeight(10),
    borderRadius: getHeight(6),
    borderColor: "black",
  },
  questionBubbleStyle: {
    backgroundColor: "#EEEEEE",
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
  descriptionTextStyle: {
    color: "#515151",
    fontWeight: "400",
    fontSize: getHeight(16),
    fontFamily: fontFamily.Regular,
    marginStart: getWidth(5),
  },
  titleTextStyle: {
    fontSize: getHeight(22),
    fontWeight: "700",
    fontFamily: fontFamily.Bold,
    color: "#000000",
    lineHeight: getHeight(26.4),
    marginStart: getWidth(5),
  },
  lastItemStyle: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginLeft: getWidth(13),
    marginRight: getWidth(10),
    marginBottom: getHeight(11),
    paddingLeft: 0,
    paddingRight: 0,
  },
  sectionTitleTextStyleSub: {
    fontSize: getHeight(12),
    fontFamily: fontFamily.Regular,
    marginStart: getWidth(5),
  },
  sectionTitleTextStyle: {
    marginStart: getWidth(46),
    marginEnd: getWidth(44),
    fontFamily: fontFamily.Bold,
    fontSize: 24,
    color: "#000000",
  },
  sectionStyle: {
    backgroundColor: "white",
  },
  ratingTextStyle: {
    color: "#FF8E3D",
    fontSize: 11,
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
  focusedInputStyle: {
    alignSelf: "center",
    minWidth: getHeight(90),
    borderRadius: getHeight(20),
    marginRight: getWidth(4),
    height: getHeight(33),
    borderColor: "transparent",
    backgroundColor: "#FFF",
  },
  validInputStyle: {
    alignSelf: "center",
    minWidth: getWidth(90),
    borderRadius: getHeight(20),
    marginRight: getWidth(4),
    backgroundColor: "transparent",
    borderColor: "#25C377",
    height: getHeight(33),
  },
  genderTextStyle: {
    fontSize: getHeight(15),
    fontFamily: fontFamily.Medium,
    fontWeight: "400",
  },
  genderButtonStyle: {
    borderRadius: getHeight(48) / 2,
    justifyContent: "center",
    width: getWidth(74.88),
    height: getHeight(48),
    shadowColor: "black",
    shadowOpacity: 0.1,
    shadowOffset: {
      height: getHeight(4),
      width: 0,
    },
    shadowRadius: getHeight(10),
    alignItems: "center",
    elevation: BALLON_ELEVATION,
  },
  questionTitleTextStyle: {
    color: "#000000",
    fontWeight: "700",
    fontSize: getHeight(22),
    fontFamily: fontFamily.Bold,
    lineHeight: getHeight(22),
    flex: 1,
  },
  upperShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -getHeight(10),
    },
    shadowOpacity: 0.15,
    shadowRadius: getHeight(10),
    backgroundColor: "white",
    elevation: 8,
  },
});
