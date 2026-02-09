import React, { Component } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Linking,
  TouchableOpacity,
  Text,
  Image,
  Pressable,
} from "react-native";
import Modal from "react-native-modal";
import * as Animatable from "react-native-animatable";
import { PageHeaderV2 } from "../components/PageHeaderV2";
import {
  getActiveModule,
  getInfoFor,
  isValid,
  getAllInputDescriptions,
  getAllAssociatedVariableNames,
  extractCalculatorsFrom,
  numericToString,
  setActiveModule,
} from "../models/modules";
import { BubbleCard } from "../components/BubbleCardDashboard";
import { SegmentedButton } from "../components/SegmentedButton";
import { QuestionResources } from "../components/QuestionResources";
import { ExampleResources } from "../components/ExampleResources";
import { ToolResources } from "../components/ToolResources";
import { ReferenceModal } from "../modals/ReferenceModal";
import { InformationModal } from "../modals/InformationModal";
import FormattedText from "../components/FormattedText";
import Media from "../components/Media";
import store from "../store";
import * as Analytics from "../services/Analytics";
import PDFViewer from "../components/PDFViewer";
import { getHigh, getLow } from "../models/units";
import { getHeight, getWidth } from "../services/helper";
import Colors from "../constants/Colors";
import DraftJsView from "../components/DraftJsView";
import crashlytics from "@react-native-firebase/crashlytics";
import AssociatedCalculatorsV1 from "../components/calculatorScreen/AssociatedCalculators";
import { fontFamily } from "../constants/strings";
import { calculateFormula } from "../models/formula";

const MAX_LENGTH_CALCULATOR_REPORT = 100;
const HEADING_MARGINS = 6;

export class ContentScreen extends Component {
  state = {
    variables: {},
    calculatorReports: {},
    variablesBuffer: {},
    contentOffset: 0,
    active: false,
    defaultValueSet: false,
  };

  constructor(props) {
    super(props);
    this.setVariable = this.setVariable.bind(this);
    this.getVar = this.getVar.bind(this);
    this.setVisibleModal = this.setVisibleModal.bind(this);
    this.isInfoAvailable = this.isInfoAvailable.bind(this);
    this.ifNegativeFeedbackAvailable =
      this.ifNegativeFeedbackAvailable.bind(this);
    this.scrollViewRef = React.createRef();
  }

  componentDidMount() {
    this.setState({
      startTimestamp: new Date().getTime(),
      interactionCount: 0,
    });
    Analytics.track(Analytics.events.VIEW_CONTENT_SCREEN, {
      protocol: getActiveModule()?.code,
    });
  }

  duration = () => {
    const currTime = new Date().getTime();
    return parseInt(currTime - this.state.startTimestamp);
  };
  interactWithContent = (item, shouldLog = false) => {
    if (shouldLog) {
      Analytics.track(Analytics.events.INTERACT_WITH_CONTENT, { item });
    }
    let interactionCount = this.state.interactionCount;
    this.setState({ interactionCount: (interactionCount += 1) });
  };

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

  getVar = (key) => {
    if (!this.state) {
      return;
    }
    const { variables, variablesBuffer } = this.state;
    if (variablesBuffer[key]) {
      return variablesBuffer[key];
    }
    return variables[key];
  };

  moveToNextStep = () => {
    const { variables, variablesBuffer } = this.state;
    Object.assign(variables, { ...variablesBuffer });
    this.setState({
      variables,
      variablesBuffer: {},
    });

    this.updateFormulae();
  };

  updateFormulae() {
    const { variables } = this.state;
    const { module } = this.state;

    module &&
      module.contents &&
      module.contents.formulae &&
      module.contents.formulae.map((formula) => {
        const calculated = calculateFormula(formula.formula, variables);
        if (calculated === null) {
          return;
        }

        variables[formula.id] = calculated;
      });
  }

  gotoModule(key) {
    setActiveModule(key);
    this.props.navigation.navigate("Dashboard");
    const moduleUpdateNotification =
      this.props.route.params?.moduleUpdateNotification;
    moduleUpdateNotification();
  }

  setReference = (reference) => {
    this.setState({ reference });
  };

  setInfo = (info) => {
    this.setState({ info });
  };

  setDefaultValues() {
    const { contents } = getActiveModule()?.contents;
    {
      contents &&
        contents.map((contentItem, sectionKey) => {
          switch (contentItem.type) {
            case "SEGMENTED":
              const values = contentItem.value
                ? contentItem.value.split("|")
                : [];
              if (contentItem.target) {
                if (
                  !this.getVar(contentItem.target) &&
                  Array.isArray(values) === true
                ) {
                  values.forEach((item, i) => {
                    if (typeof item === "string") {
                      if (item.trim()[item.trim().length - 1] === "!") {
                        // Default Value!
                        if (contentItem.target) {
                          this.setVariable(contentItem.target, i);
                          this.moveToNextStep();
                        }
                      }
                    }
                  });
                }
              }

            default:
              break;
          }
        });
    }
  }

  async UNSAFE_componentWillMount() {
    const { params } = this.props.route;
    const { contents } = getActiveModule()?.contents;
    this.setState({
      variables: params.variables,
      itemKey: params.itemKey,
    });
  }

  setVariable(key, value, { userEntry } = { userEntry: false }) {
    const { variables, variablesBuffer } = this.state;

    if (userEntry && !variables[key]) {
      variablesBuffer[key] = value;

      this.setState({
        variablesBuffer,
      });
    } else {
      variables[key] = value;
      this.setState({
        variables,
      });
    }

    // update all string formulae using eval()
    this.update();
  }

  update() {
    this.updateFormulae();
    //setTimeout(() => this.checkPages());
    //const { updateVariables } = this.props.parent || {};
    //updateVariables(this.state.variables);
  }

  // build groups of contents elements (each group represent a card)
  // 1. continous text with the same triggers are grouped into a card
  // changes in types lead to new card

  firstTriggerContains(contentGroup, allTargets) {
    var isContaining = false;
    var allVariablesInTriggers = [];

    try {
      allVariablesInTriggers = allVariablesInTriggers.concat(
        getAllAssociatedVariableNames(contentGroup[0].positiveTrigger)
      );
    } catch (e) {
      crashlytics().recordError(e);
    }

    allVariablesInTriggers.forEach((variableInTrigger) => {
      if (allTargets.includes(variableInTrigger)) {
        isContaining = true;
      }
    });
    return isContaining;
  }

  anyTriggerContains(contentGroup, allTargets) {
    var isContaining = false;
    var allVariablesInTriggers = [];
    contentGroup.forEach((contentItem) => {
      const associatedVariables = getAllAssociatedVariableNames(
        contentItem.positiveTrigger
      );
      allVariablesInTriggers =
        allVariablesInTriggers.concat(associatedVariables);
    });
    allVariablesInTriggers.forEach((variableInTrigger) => {
      if (allTargets.includes(variableInTrigger)) {
        isContaining = true;
      }
    });
    return isContaining;
  }

  buildContentGroups(contents) {
    var contentsGroups = [];
    var tempArray = [];
    var prevTrigger = "";
    var prevType = "";
    var allTargets = [];

    contents.forEach((contentItem) => {
      if (contentItem.target) {
        allTargets.push(contentItem.target);
      }
    });

    contents.forEach((contentItem, i) => {
      if (
        contentItem.type === prevType &&
        (contentItem.positiveTrigger === prevTrigger ||
          ["SEGMENTED", "SEGMENTAL"].includes(contentItem.type))
      ) {
        tempArray.push(contentItem);
      } else {
        var newGroup = true;

        if (
          prevType === "BEFORESEG" &&
          ["SEGMENTED", "SEGMENTAL"].includes(contentItem.type)
        ) {
          newGroup = false;
        }

        if (
          ["SEGMENTED", "SEGMENTAL"].includes(prevType) &&
          ["SEGMENTED", "SEGMENTAL"].includes(contentItem.type)
        ) {
          newGroup = false;
        }
        /*
        if ( contents.length > i+1 && i > 0 ) {
          if(  ['SEGMENTED', 'SEGMENTAL'].includes(contentItem.type) && ['TEXT'].includes(contents[i-1]).type && contentItem.positiveTrigger === prevTrigger ) {
            newGroup = false;
          }
        }
        */

        if (newGroup) {
          /*
          contentsGroups.push({
            contentGroup: tempArray,
            isSecondary: this.anyTriggerContains(tempArray, allTargets),
          });*/
          contentsGroups.push({
            contentGroup: tempArray,
            isSecondary: this.firstTriggerContains(tempArray, allTargets),
          });
          tempArray = [];
        }

        tempArray.push(contentItem);
      }
      prevTrigger = contentItem.positiveTrigger;
      prevType = contentItem.type;
    });
    if (tempArray.length > 0) {
      contentsGroups.push({
        contentGroup: tempArray,
        isSecondary: this.firstTriggerContains(tempArray, allTargets),
      });
    }
    return contentsGroups;
  }

  onBackFromCalculator = (params) => {
    const { variables, calculatorReports } = this.state;
    Object.assign(variables, params.variables);
    calculatorReports[params.calculatorId] = params.result;
    this.setState({ variables, calculatorReports });
  };

  // check if any of element in a group meets a positiveTrigger.
  checkGroupTrigger(contentsGroup, variables, currentPage) {
    var anyItemTriggered = false;
    contentsGroup.forEach(({ positiveTrigger, type, page }) => {
      if (
        type !== "SUMMARY" &&
        calculateFormula(positiveTrigger, variables, { returnBool: true }) &&
        currentPage.id === page
      ) {
        anyItemTriggered = true;
      }
    });
    return anyItemTriggered;
  }

  renderModule(item, itemKey, value) {
    const targetModule = store.getState().persist.data.modules[value];
    // console.log(targetModule.title);

    if (!targetModule) {
      return <View key={item.id} />;
    }

    return (
      <Animatable.View
        animation="fadeInRight"
        delay={300}
        duration={500}
        key={item.id}
      >
        <Text
          style={{
            marginHorizontal: 6,
            padding: 6,
            fontSize: 17,
            fontWeight: "600",
            backgroundColor: "rgba(245, 245, 245, 0.3)",
          }}
        >
          Consider the following Pathway+
        </Text>
        {isValid(item.value) && (
          <View style={{ marginHorizontal: 9 }}>
            <Pressable
              style={{
                borderRadius: getHeight(6),
                backgroundColor: Colors.infoBoxThemeColor,
              }}
              onPress={() => {
                this.interactWithContent(
                  `page go to module: ${targetModule.code}`
                );
                this.gotoModule(targetModule.code);
              }}
              success
              full
            >
              <Text style={{ color: "white", fontWeight: "400", fontSize: 16 }}>
                {targetModule.title}
              </Text>
            </Pressable>
          </View>
        )}
      </Animatable.View>
    );
  }

  renderTools(item, itemKey, value) {
    const { calculatorReports } = this.state;
    const elements = item.value.split("|");
    var rationale = item.secondaryValue;
    const associatedCalculators = extractCalculatorsFrom(elements);

    return (
      <Animatable.View
        animation="fadeInRight"
        delay={300}
        duration={500}
        key={item.id}
      >
        {isValid(item.title) && (
          <Text
            style={{
              marginHorizontal: 9,
              padding: 6,
              fontSize: 17,
              fontWeight: "600",
              backgroundColor: "rgba(245, 245, 245, 0.3)",
            }}
          >
            {item.title}
          </Text>
        )}
        {isValid(rationale) && (
          <Text
            style={{
              ...styles.questionTextStyleSub,
              marginLeft: 15,
              marginRight: 10,
              fontSize: 15,
              color: "black",
            }}
          >
            {rationale}
          </Text>
        )}
        {isValid(elements) && (
          <View style={{ marginHorizontal: getWidth(7) }}>
            <QuestionResources
              elements={elements}
              navigation={this.props.navigation}
              variables={this.state.variables}
              itemKey={itemKey}
              parent={this}
              white
              interact={(item, value, shouldLog) =>
                this.interactWithContent(
                  `page tools ${item}: ${value}`,
                  shouldLog
                )
              }
            />
          </View>
        )}

        <AssociatedCalculatorsV1
          _this={this}
          associatedCalculators={associatedCalculators}
          calculatorReports={calculatorReports}
          interactWithProtocol={this.interactWithContent}
          interactWith={"page tools calculator report more"}
        />
      </Animatable.View>
    );
  }

  renderSegmented(item, itemKey, value) {
    const tertiary = item.tertiaryValue ? item.tertiaryValue.split("|") : [];
    const { calculatorReports } = this.state;
    const elements = item.value.split("|");
    var rationale = null;
    var subtitles = null;
    const associatedCalculators = extractCalculatorsFrom(tertiary);

    if (isValid(item.secondaryValue)) {
      if (Array.isArray(item.secondaryValue)) {
        if (item.secondaryValue.length > 1) {
          subtitles = item.secondaryValue;
        } else {
          rationale = item.secondaryValue[0];
        }
      } else {
        rationale = item.secondaryValue;
      }
    }

    return (
      <Animatable.View
        animation="fadeInRight"
        delay={300}
        duration={500}
        key={item.id}
      >
        <BubbleCard>
          <View style={{ paddingHorizontal: getWidth(5) }}>
            {isValid(item.title) && (
              <Text
                style={{
                  fontSize: getHeight(22),
                  fontWeight: "600",
                  color: "black",
                  fontFamily: fontFamily.SemiBold,
                  lineHeight: getHeight(29.68),
                  marginBottom: getHeight(10),
                }}
              >
                {item.title}
              </Text>
            )}
            {isValid(rationale) && (
              <Text style={styles.questionTextStyleSub}>{rationale}</Text>
            )}
            <AssociatedCalculatorsV1
              _this={this}
              associatedCalculators={associatedCalculators}
              calculatorReports={calculatorReports}
              interactWithProtocol={this.interactWithContent}
              interactWith={"page segmented calculator report more"}
            />
          </View>
          {isValid(item.examples) && (
            <ExampleResources
              elements={item.examples}
              navigation={this.props.navigation}
              variables={this.state.variables}
              itemKey={itemKey}
              parent={this}
              insideGreen
              interact={(item, value, shouldLog) =>
                this.interactWithContent(
                  `page segmented ${item}: ${value}`,
                  shouldLog
                )
              }
            />
          )}
          {isValid(item.tools) && (
            <ToolResources
              elements={item.tools}
              navigation={this.props.navigation}
              variables={this.state.variables}
              itemKey={itemKey}
              parent={this}
              insideGreen
              interact={(item, value, shouldLog) =>
                this.interactWithContent(
                  `page segmented ${item}: ${value}`,
                  shouldLog
                )
              }
            />
          )}
          {!isValid(item.tools) &&
            !isValid(item.examples) &&
            isValid(item.tertiaryValue) && (
              <View>
                <QuestionResources
                  elements={tertiary}
                  navigation={this.props.navigation}
                  variables={this.state.variables}
                  itemKey={itemKey}
                  parent={this}
                  insideGreen
                  interact={(item, value, shouldLog) =>
                    this.interactWithContent(
                      `page segmented ${item}: ${value}`,
                      shouldLog
                    )
                  }
                />
              </View>
            )}
          <SegmentedButton
            elements={elements}
            subtitles={subtitles}
            targetVariable={item.target}
            setVariable={this.setVariable}
            getVar={this.getVar}
            interact={() =>
              this.interactWithContent(
                `page segmented ${item.target}: ${this.getVar}`
              )
            }
          />
        </BubbleCard>
      </Animatable.View>
    );
  }

  getHighLowIcons = (inputDescriptions, key, high, low) => {
    if (!high && !low) {
      return null;
    }
    return (
      <View
        style={{
          marginEnd: getWidth(4),
          marginStart: getWidth(4),
          paddingTop: getHeight(5),
        }}
      >
        {high &&
        parseFloat(inputDescriptions[key]["description"]) >
          parseFloat(high.match(/(\d+)/)) ? (
          <Image
            source={require("../images/high.png")}
            style={{
              width: getWidth(17),
              height: getHeight(17),
            }}
          />
        ) : null}
        {low &&
        parseFloat(inputDescriptions[key]["description"]) <
          parseFloat(low.match(/(\d+)/)) ? (
          <Image
            source={require("../images/low.png")}
            style={{
              width: getWidth(17),
              height: getHeight(17),
              //paddingTop: 5
            }}
          />
        ) : null}
      </View>
    );
  };

  renderInputBoxes(pages) {
    const { navigation, route } = this.props;
    const variables = route.params?.variables;
    const { contents } = getActiveModule()?.contents;
    let inputDescriptions = {};
    {
      pages.forEach((page, key) => {
        inputDescriptions = Object.assign(
          {},
          inputDescriptions,
          getAllInputDescriptions(page, variables)
        );
      });
    }
    //group the multi items in one array and unset the indvidual item
    var multiItemArray = {};

    Object.keys(inputDescriptions).map((key) => {
      if (key.includes("_code_")) {
        let splitItem = key.split("_code_");
        // console.log(variables[key]);
        // console.log('variables[key]');
        if (variables[key] === 1) {
          if (multiItemArray.hasOwnProperty(splitItem[0]) === false) {
            multiItemArray[splitItem[0]] = [];
          }

          multiItemArray[splitItem[0]].push(inputDescriptions[key]["title"]);
        }

        delete inputDescriptions[key];
      }
    });
    //console.log(variables);
    //console.log('multiItemArray.length');
    //set the new multi item set for content or summary page
    // multi title changed from _code__multititle to _code__title
    Object.keys(multiItemArray).map((key, index) => {
      inputDescriptions[key] = {
        title: variables[key + "_code__title"]
          ? variables[key + "_code__title"]
          : "",
        description: multiItemArray[key].join(", "),
        formulaDescription: null,
        calculationDescription: null,
        calculationTitle: null,
        introduction: null,
      };
    });
    if (!isValid(inputDescriptions)) {
      return <View />;
    }

    return (
      <View
        style={{
          marginStart: getWidth(44),
          marginEnd: getWidth(43),
          marginTop: getHeight(34),
        }}
      >
        <Text
          style={{
            marginBottom: getHeight(17),
            color: "black",
            fontSize: getHeight(18),
            fontFamily: fontFamily.SemiBold,
            fontWeight: "600",
          }}
        >
          Your Inputs
        </Text>
        <View style={{ backgroundColor: "#CDCDCD", height: 1 }} />
        <View style={{ marginTop: getHeight(3) }}>
          {Object.keys(inputDescriptions).map((key) => {
            return (
              <View
                style={{ paddingTop: getHeight(8), flexDirection: "row" }}
                key={key}
              >
                <Text
                  style={{
                    fontSize: getHeight(14),
                    color: "black",
                    fontFamily: fontFamily.SemiBold,
                    fontWeight: "600",
                    flex: 5,
                    paddingEnd: getWidth(8),
                  }}
                >
                  {inputDescriptions[key]["title"]}
                </Text>
                <View style={{ flexDirection: "row", flex: 5 }}>
                  {isValid(
                    inputDescriptions[key]["calculationDescription"]
                  ) && (
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        alignSelf: "flex-start",
                      }}
                      onPress={() => {
                        this.interactWithContent(`input boxes: ${key}`, false);
                        Analytics.track(
                          Analytics.events.OPEN_INFORMATION_MODAL,
                          { info: inputDescriptions[key]["calculationTitle"] }
                        );
                        this.setState({
                          info: {
                            introduction:
                              inputDescriptions[key]["introduction"],
                            title: inputDescriptions[key]["calculationTitle"],
                            newTextJson: inputDescriptions[key]["newTextJson"],
                            isFormula: true,
                            calloutText:
                              "Formula:: " +
                              inputDescriptions[key]["formulaDescription"] +
                              "|Calculation:: " +
                              inputDescriptions[key]["calculationDescription"],
                          },
                        });
                      }}
                    >
                      <Text
                        style={{
                          fontSize: getHeight(14),
                          color: "black",
                          marginEnd: getWidth(3),
                          marginTop: getHeight(1),
                          fontFamily: fontFamily.Regular,
                        }}
                      >
                        {inputDescriptions[key]["description"]}
                      </Text>
                      {this.getHighLowIcons(
                        inputDescriptions,
                        key,
                        inputDescriptions[key]["formulaHigh"],
                        inputDescriptions[key]["formulaLow"]
                      )}
                      <Image
                        style={{
                          marginStart: -getWidth(5),
                          width: getHeight(27),
                          height: getHeight(27),
                        }}
                        source={{ uri: "qmark" }}
                      />
                      {/* <View style={{
                        width: getHeight(18),
                        height: getHeight(18),
                        borderRadius: getHeight(18) / 2,
                        backgroundColor: "#FFF",
                        shadowColor: "#000000",
                        shadowOpacity: 0.15,
                        shadowOffset: {
                          height: 1.5,
                          width: -1.5
                        },
                        shadowRadius: 4,
                        justifyContent: "center",
                        alignItems: "center",
                        marginStart: getWidth(4)
                      }}>
                        <Icon
                          style={{
                            marginTop: getHeight(1),
                            fontSize: getHeight(14),
                            color: "#25CD7C",
                            backgroundColor: "transparent"
                          }}
                          type="AntDesign"
                          name="question"
                        />
                      </View> */}
                    </TouchableOpacity>
                  )}
                  {!isValid(
                    inputDescriptions[key]["calculationDescription"]
                  ) && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: getHeight(3),
                      }}
                    >
                      <Text
                        style={{
                          fontSize: getHeight(14),
                          color: "black",
                          fontFamily: fontFamily.Regular,
                        }}
                      >
                        {inputDescriptions[key]["description"]}
                      </Text>
                      {this.getHighLowIcons(
                        inputDescriptions,
                        key,
                        getHigh(key),
                        getLow(key)
                      )}
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  renderMedia = (mediaId) => {
    const info = getInfoFor(mediaId);
    if (!isValid(info)) return;
    /*let hasBullet = null;
    hasBullet = info.calloutText && info.calloutText.includes("**");*/
    return (
      <View style={{ marginTop: getHeight(21) }} key={mediaId}>
        {!info.pdfLink ? (
          <Media info={info} extraSpace={getWidth(120)} />
        ) : (
          <TouchableOpacity
            onPress={() => {
              Linking.openURL(info.pdfLink);
            }}
            style={{ flexDirection: "row", justifyContent: "center" }}
          >
            <Image
              style={{
                marginStart: -getWidth(5),
                width: getHeight(27),
                height: getHeight(27),
              }}
              source={{ uri: "pdficon" }}
            />
            {/* <Icon
          style={{
            fontSize: 100,
            color: "#25CD7C",
            backgroundColor: "transparent"
          }}
          type="AntDesign"
          name="pdffile1"
        /> */}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  renderSummary(currentPage, isFirst, isLast, index) {
    const { navigation, route } = this.props;
    const variables = route.params?.variables;
    const { contents } = getActiveModule()?.contents;
    const goToPageSection = (ref) => {
      this[ref].measure((fx, fy, width, height, px, py) => {
        this.scrollViewRef.current.scrollTo({
          x: 0,
          y: py - getHeight(148),
          animated: true,
        });
      });
    };

    return (
      <View style={{ marginEnd: getWidth(16) }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text
            style={styles.summaryTitle}
            onPress={() => {
              this.interactWithContent(
                `summary go to category title: ${currentPage.categoricalTitle}`
              );
              this.scrollViewRef.current.scrollTo({
                x: 0,
                y: this[currentPage.categoricalTitle],
                animated: true,
              });
              //goToPageSection(currentPage.categoricalTitle);
            }}
          >
            {isValid(currentPage.categoricalTitle)
              ? currentPage.categoricalTitle
              : "Strategy"}
          </Text>
        </View>
        {contents
          .filter(
            ({ positiveTrigger, type, page, summary }) =>
              (type === "SUMMARY" || isValid(summary)) &&
              page === currentPage.id &&
              calculateFormula(positiveTrigger, variables, { returnBool: true })
          )
          .map(({ type, value, summary, id }, key) => (
            <View
              key={id}
              style={{ flexDirection: "row", marginTop: getHeight(6) }}
            >
              <Text
                style={{
                  color: "#5B5B5B",
                  lineHeight: getHeight(21.6),
                  fontSize: getHeight(7),
                  marginEnd: getWidth(12),
                }}
              >
                &#9679;
              </Text>
              <Text
                style={{
                  fontSize: getHeight(16),
                  lineHeight: getHeight(21.6),
                  color: "#5B5B5B",
                  fontFamily: fontFamily.Regular,
                  flex: 1,
                  fontWeight: "400",
                }}
                onPress={() => {
                  if (summary && this[id + "_" + index]) {
                    this.interactWithContent(`summary read more: ${summary}`);
                    let scrollTo =
                      this[id + "_" + index]?.y +
                      this[this[id + "_" + index]?.page] +
                      getHeight(15);
                    this.scrollViewRef.current.scrollTo({
                      x: 0,
                      y: scrollTo,
                      animated: true,
                    });
                    //goToPageSection(value);
                  } else console.log("NOT A SUMMARY");
                }}
              >
                {(type === "SUMMARY" ? value : summary) + " "}
                {isValid(summary) && (
                  <Text
                    style={{
                      color: Colors.primaryColor,
                      textDecorationLine: "underline",
                      fontSize: getHeight(16),
                      lineHeight: getHeight(21.6),
                      fontFamily: fontFamily.Regular,
                    }}
                  >
                    (below)
                  </Text>
                )}
              </Text>
            </View>
          ))}
        {/* {isLast && (
          <View
            bordered
            style={{
              height: 20,
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
              paddingLeft: 0,
              paddingRight: 0,
              paddingTop: 0,
              paddingBottom: 0
            }}>
            <Text> </Text>
          </View>
        )} */}
      </View>
    );
  }

  renderPage(currentPage, index) {
    const { navigation, route } = this.props;
    const variables = route.params?.variables;
    const conditionalObjects = route.params?.conditionalObjects;
    const { contents } = getActiveModule()?.contents;
    //const allInputReviews = currentPage.inputReviews;
    const contentsGroups = this.buildContentGroups(contents);
    //const inputDescriptions = getAllInputDescriptions(currentPage, variables);
    return (
      <View style={{ marginTop: getHeight(11) }}>
        <View
          onLayout={(event) => {
            this[currentPage.categoricalTitle] +=
              event.nativeEvent.layout.y + HEADING_MARGINS;
          }}
        >
          {currentPage.categoricalTitle ? (
            <Text
              style={{
                marginStart: getWidth(44),
                fontFamily: fontFamily.Bold,
                fontSize: getHeight(22),
                marginEnd: getWidth(44),
                marginBottom: getHeight(12),
                color: "black",
              }}
            >
              {currentPage.categoricalTitle}
            </Text>
          ) : null}
        </View>
        <View
          onLayout={(event) => {
            if (isValid(event.nativeEvent.layout.y))
              this["page_" + index] += event.nativeEvent.layout.y;
          }}
        >
          {contentsGroups
            .filter(({ contentGroup }) =>
              this.checkGroupTrigger(contentGroup, variables, currentPage)
            )
            .map(({ contentGroup, isSecondary }, key) => {
              let textKeys = [];
              return (
                <View
                  onLayout={(event) => {
                    if (isValid(event.nativeEvent.layout.y))
                      this["page_" + index] += event.nativeEvent.layout.y;
                  }}
                  style={{ flexDirection: "row", flex: 1 }}
                >
                  <View
                    style={{
                      marginStart: 0 + isSecondary ? getWidth(17) : 0,
                    }}
                  >
                    {contentGroup
                      .filter(
                        ({ positiveTrigger, type, page }) =>
                          page === currentPage.id &&
                          type !== "SUMMARY" &&
                          calculateFormula(positiveTrigger, variables, {
                            returnBool: true,
                          })
                      )
                      .map((item, key) => {
                        const {
                          title,
                          value,
                          type,
                          calloutName,
                          calloutTitle,
                          calloutText,
                          calloutReferences,
                          media,
                          id,
                          textJson,
                          newTextJson,
                        } = item;
                        switch (type) {
                          case "MODULE":
                            return this.renderModule(item, key, value);
                          case "TOOLS":
                            return this.renderTools(item, key, value);
                          case "SEGMENTAL":
                          case "SEGMENTED":
                            return this.renderSegmented(item, key, value);
                          case "BEFORESEG":
                          case "TEXT":
                            //console.log("value: ", {textJson});
                            // if (!textKeys.includes(id))
                            //   textKeys.push(id);
                            return (
                              <Animatable.View
                                onLayout={(event) => {
                                  if (event.nativeEvent.layout.y || id) {
                                    this[id + "_" + index] = {
                                      y:
                                        event.nativeEvent.layout.y +
                                        (isValid(this["page_" + index])
                                          ? this["page_" + index]
                                          : 0),
                                      page: "page_" + index,
                                    };
                                  }
                                }}
                                animation="fadeInRight"
                                delay={300}
                                duration={500}
                                key={id}
                              >
                                <BubbleCard expanded>
                                  <View
                                    style={{ paddingHorizontal: getWidth(5) }}
                                  >
                                    {isValid(title) && (
                                      <Text
                                        style={{
                                          fontSize: getHeight(22),
                                          lineHeight: getHeight(29.68),
                                          fontFamily: fontFamily.SemiBold,
                                          marginBottom: getHeight(10),
                                          fontWeight: "600",
                                          color: "black",
                                        }}
                                      >
                                        {title}
                                      </Text>
                                    )}
                                    {isValid(textJson) ||
                                    isValid(newTextJson) ? (
                                      <DraftJsView
                                        key={id}
                                        blocksJSON={
                                          newTextJson ? newTextJson : textJson
                                        }
                                        variables={variables}
                                        setReference={this.setReference}
                                        setInfo={this.setInfo}
                                        getVar={this.getVar}
                                        conditionalObjects={conditionalObjects}
                                        isNewJson={newTextJson}
                                      />
                                    ) : (
                                      <FormattedText
                                        text={value}
                                        _this={this}
                                        variables={variables}
                                        calloutName={calloutName}
                                        calloutTitle={calloutTitle}
                                        calloutText={calloutText}
                                        calloutReferences={calloutReferences}
                                      />
                                    )}
                                    {isValid(media) &&
                                      media[0] &&
                                      this.renderMedia(media[0])}
                                  </View>
                                </BubbleCard>
                              </Animatable.View>
                            );
                          default:
                            return <Text>???</Text>;
                        }
                      })}
                  </View>
                </View>
              );
            })}
        </View>
      </View>
    );
  }

  ifNegativeFeedbackAvailable() {
    return !this.state.feedback;
  }

  isInfoAvailable() {
    return !this.state.info;
  }

  render() {
    //console.log("Variables", this.state.variables);
    const { info, reference, feedback, pdfLink } = this.state;
    const onModalClose = () =>
      this.setState({
        info: null,
        reference: null,
        feedback: null,
        pdfLink: null,
      });
    const { navigation, route } = this.props;
    const activePages = route.params?.activePages;
    const allPages = [...activePages.dominant, ...activePages.dependent];
    const { contents } = getActiveModule()?.contents;
    const filteredSummary = contents.filter((item) => item.summary);

    if (this.state.defaultValueSet === false) {
      this.setDefaultValues();
      this.setState({ defaultValueSet: true });
    }
    return (
      <View style={{ backgroundColor: "white", flex: 1 }}>
        <PageHeaderV2
          onRightPress={() => {
            Analytics.track(Analytics.events.CLICK_HELP_FEEDBACK_BUTTON);
            var descriptions = "";
            var descriptionStr = "[" + getActiveModule()?.title + "/ ";
            if (allPages.length > 0) {
              descriptions = getAllInputDescriptions(
                allPages[0],
                this.state.variables
              );
              for (const single in descriptions) {
                descriptionStr =
                  descriptionStr +
                  single +
                  ": " +
                  String(this.state.variables[single]) +
                  ", ";
              }
            }
            Linking.openURL(
              "mailto:support@avomd.io?subject=AvoMD: Feedback for improvement&body=" +
                descriptionStr +
                "]"
            );
          }}
          hasTabs
          onBackPress={() => {
            Analytics.track(Analytics.events.EXIT_CONTENT_SCREEN, {
              protocol: getActiveModule()?.code,
              "interaction count": this.state.interactionCount,
              duration: this.duration(),
            });
            navigation.goBack();
          }}
          title={"Content"}
        />
        <InformationModal
          info={info}
          onClose={() => {
            Analytics.track(Analytics.events.CLOSE_INFORMATION_MODAL);
            onModalClose();
          }}
          setVisibleModal={this.setVisibleModal}
          isInfoAvailable={this.isInfoAvailable}
          protocol={getActiveModule()?.code}
          getVar={this.getVar}
          variables={this.state.variables}
          setInfo={this.setInfo}
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

        <Modal
          style={{ margin: 0 }}
          isVisible={pdfLink === null ? false : !!pdfLink}
          onBackButtonPress={onModalClose}
          onSwipeComplete={onModalClose}
        >
          <PDFViewer onClose={onModalClose} pdfLink={pdfLink} />
        </Modal>

        <ScrollView ref={this.scrollViewRef}>
          {this.renderInputBoxes(allPages)}
          {filteredSummary.length > 0 && (
            <View
              style={{
                marginTop: getHeight(39),
                marginStart: getWidth(44),
                marginEnd: getWidth(26),
                marginBottom: getHeight(22),
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: getHeight(32),
                    fontFamily: fontFamily.Regular,
                    fontWeight: "400",
                    color: "black",
                  }}
                >
                  SUMMARY
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    this.interactWithContent(`disclaimer button`, false);
                    Analytics.track(Analytics.events.CLICK_DISCLAIMER_BUTTON);
                    this.setState({
                      info: {
                        title: "Legal Notices and Disclaimer",
                        calloutText:
                          "All information contained in and produced by the current app, AvoMD (\"App\") is provided for educational purposes only. This information should not be used for the diagnosis or treatment of any health problem or disease. THIS INFORMATION IS NOT INTENDED TO REPLACE CLINICAL JUDGMENT in any manner.|The User is hereby notified that the information contained herein may not meet the user's needs. The User is advised that, although the information is derived from medical research and literature we cannot guarantee either its correctness, comprehensiveness or currency. The User of this software assumes sole responsibility for any decisions made or actions taken based on the information contained in the App.|The system's authors and any other party involved in the preparation, publication or distribution of the app are not liable for any special, consequential, or exemplary damages resulting in whole or part from any User's use of or reliance upon this system and the information contained within.|We disclaim all warranties regarding such information whether express or implied, including any warranty as to the quality, accuracy, currency or suitability of this information for any particular purpose.|The app system's authors, developers and distributors assume no responsibility for any erroneous results due to defects in the system. ACCESS TO AND USE OF THIS APP IS PROVIDED WITHOUT WARRANTY OF MERCHANTABILITY OR FITNESS FOR ANY PARTICULAR PURPOSE OR ANY OTHER WARRANTY, EXPRESS OR IMPLIED. In no event shall we be liable for special, direct, indirect or consequential damages, charges, claims, costs, demands, losses fees or expenses of any nature or kind arising from use of this app.|By using the app and/or any software found therein, the User agrees to abide by United States and International copyright laws and all other applicable laws involving copyright.",
                      },
                    });
                  }}
                >
                  <Text
                    style={{
                      fontSize: getHeight(18),
                      fontFamily: fontFamily.SemiBold,
                      color: Colors.primaryColor,
                      paddingStart: getWidth(13),
                      paddingVertical: getHeight(5.5),
                    }}
                  >
                    Disclaimer
                  </Text>
                </TouchableOpacity>
              </View>
              {allPages.map((page, key) =>
                this.renderSummary(
                  page,
                  key === 0,
                  key === allPages.length - 1,
                  key
                )
              )}
            </View>
          )}
          {allPages.map((page, index) => {
            return (
              <View
                style={{
                  marginTop: filteredSummary.length > 0 ? 0 : getHeight(15),
                }}
                onLayout={(event) => {
                  if (!this[page.categoricalTitle]) {
                    this[page.categoricalTitle] = 0;
                  }
                  if (!this["page_" + index]) {
                    this["page_" + index] = 0;
                  }
                  this[page.categoricalTitle] += event.nativeEvent.layout.y;
                  this["page_" + index] += event.nativeEvent.layout.y;
                }}
                key={index + ""}
              >
                {this.renderPage(page, index)}
              </View>
            );
          })}
        </ScrollView>
        {/*<Fab
          active={this.state.active}
          direction="up"
          containerStyle={{}}
          style={{ backgroundColor: "#5067FF" }}
          position="bottomRight"
          onPress={() => {
            Analytics.track(Analytics.events.CLICK_HELP_BUTTON);
            this.setState({ active: !this.state.active });
          }}>
          <Icon type="MaterialIcons" name="feedback"/>
          <Button
            style={{ backgroundColor: "#a3a11f" }}
            onPress={() => {
              Analytics.track(Analytics.events.CLICK_HELP_WEB_BUTTON);
              Linking.openURL('https://www.avomd.io');
            }}>
            <Icon type="MaterialCommunityIcons" name="web"/>
          </Button>
          <Button
            style={{ backgroundColor: "#34A34F" }}
            onPress={() => {
              Analytics.track(Analytics.events.CLICK_HELP_MAIL_BUTTON);
              Linking.openURL('mailto:support@avomd.io?subject=avoMD: Contact Us');
            }}>
            <Icon name="mail"/>
          </Button>
          <Button style={{ backgroundColor: "#3B5998" }}>
            <Icon
              type="MaterialIcons"
              name="thumb-up"
              onPress={() => {
                Analytics.track(Analytics.events.CLICK_HELP_THUMBS_UP_BUTTON);
                StoreReview.requestReview();
              }}
            />
          </Button>
          <Button
            style={{ backgroundColor: "#DD5144" }}
            onPress={() => {
              Analytics.track(Analytics.events.CLICK_HELP_FEEDBACK_BUTTON);
              var descriptions = '';
              var descriptionStr = '[' + getActiveModule()?.title + '/ ';
              if (allPages.length > 0) {
                descriptions = getAllInputDescriptions(allPages[0], this.state.variables);
                for (const single in descriptions) {
                  descriptionStr =
                    descriptionStr + single + ": " + String(this.state.variables[single]) + ", ";
                }
              }
              Linking.openURL(
                "mailto:support@avomd.io?subject=AvoMD: Feedback for improvement&body=" +
                descriptionStr +
                "]"
              );
            }}>
            <Icon type="Ionicons" name="ios-warning"/>
          </Button>
        </Fab>*/}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tab: {
    maxWidth: 1000,
    backgroundColor: "white",
  },
  textStyle: {
    color: "black",
    fontWeight: "600",
  },
  activeTabTextStyle: {
    color: Colors.primaryColor,
    fontWeight: "600",
  },
  summaryTitle: {
    textDecorationLine: "underline",
    color: Colors.primaryColor,
    fontSize: 24,
    marginTop: 24,
    fontWeight: "700",
    lineHeight: 30.8,
    fontFamily: fontFamily.Bold,
  },
  activeTab: {
    backgroundColor: "white",
    maxWidth: 1000,
  },
  questionTextStyleSub: {
    color: "#ADADAD",
    fontSize: 16,
    fontWeight: "400",
    fontFamily: fontFamily.Regular,
    lineHeight: 20,
  },
});
