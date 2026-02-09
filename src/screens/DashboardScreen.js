import React, { Component } from "react";
import {
  Animated,
  AppState,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
} from "react-native";
import Modal from "react-native-modal";
import * as Animatable from "react-native-animatable";
import { useIsFocused } from "@react-navigation/native";
import {
  extractCalculatorsFrom,
  getActiveModule,
  getActivePages,
  getDeeplink,
  getDeeplinkVariables,
  isValid,
  setCustomNumerics,
  getCalculatorOutputMapping,
  resetActiveModule,
  getDataAndCache,
} from "../models/modules";
import {
  filterByTriggerFn,
  updateVariablesFromFormulae,
} from "../models/formula";
import { getHigh, getKeyFromCode, getLow, getUnit } from "../models/units";
import { PageHeaderV2 } from "../components/PageHeaderV2";
import { InformationModal } from "../modals/InformationModal";
import { ReferenceModal } from "../modals/ReferenceModal";
import DashboardDescriptionCardV2 from "../components/dashboardScreen/DashboardDescriptionCardV2";
import * as Analytics from "../services/Analytics";
import PDFViewer from "../components/PDFViewer";
import { BALLON_ELEVATION, fontFamily, panelType } from "../constants/strings";
import { getHeight, getWidth, getDatabaseInstance } from "../services/helper";
import Colors from "../constants/Colors";
import crashlytics from "@react-native-firebase/crashlytics";
import firebase from "@react-native-firebase/app";
import "@react-native-firebase/database";
import "@react-native-firebase/auth";
import GroupForm from "../components/group/GroupForm";
import GroupDivider from "../components/group/GroupDivider";
import _ from "lodash";
import { DashboardSegmented } from "../components/dashboardScreen/DashboardSegmented";
import { DashboardMulti } from "../components/dashboardScreen/DashboardMulti";
import { DashboardPredetermined } from "../components/dashboardScreen/DashboardPredetermined";
import { DashboardDropDown } from "../components/dashboardScreen/DashboardDropDown";
import { DashboardIndications } from "../components/dashboardScreen/DashboardIndications";
import { DashboardDescription } from "../components/dashboardScreen/DashboardDescription";
import { DashboardSection } from "../components/dashboardScreen/DashboardSection";
import { DashboardSpecial } from "../components/dashboardScreen/DashboardSpecial";
// import { DashboardNumericLabel } from "../components/dashboardScreen/DashboardNumericLabel";
import { getModuleClickParams } from "../models/deepLinkActions";
import FeaturedAuthors from "../modals/featuredAuthor";
import AnimatedHeader from "../components/AnimatedHeader";
import store from "../store";
import { DashboardTextPanel } from "../components/dashboardScreen/DashboardTextPanel";
import {
  POSTFIX_SKIPPED,
  POSTFIX_COUNT,
  POSTFIX_MULTITITLE,
  POSTFIX_VALUE,
  POSTFIX_SUBMITTED,
  POSTFIX_ASSIGNED,
  MAX_LENGTH_CALCULATOR_REPORT,
} from "./DashboardExports";

const autoScrollIncrement = 200;
const autoScrollBottomMargin = 250;
const calculatorMode = false;
const oneByOneMode = false;
let viewWidth;

class DashboardScreen extends Component {
  state = {
    variables: {},
    calculatorReports: {},
    variablesBuffer: {},
    groupVariablesBuffer: {},
    groupAnswerAbleItemArray: {},
    testModalIsVisible: true,
    activePages: { dominant: [], dependent: [] },
    contentOffset: 0,
    defaultValueSet: false,
    progress: 0,
    firstInput: false,
    hasPanel: false,
    authorDescription: null,
    appState: AppState.currentState,
    startTime: null,
    showQuestionResources: {},
  };

  constructor(props) {
    super(props);
    this.setVariable = this.setVariable.bind(this);
    this.getVar = this.getVar.bind(this);
    this.setVisibleModal = this.setVisibleModal.bind(this);
    this.isInfoAvailable = this.isInfoAvailable.bind(this);
    this.scrollView = React.createRef();
  }

  async componentDidMount() {
    this.appStateSubscription = AppState.addEventListener(
      "change",
      this._handleAppStateChange
    );
    await this.getModule();
    //this.initializeMultiVariables();

    this.setState({
      startTimestamp: new Date().getTime(),
      interactionCount: 0,
    });
    const deepLink = getDeeplink();

    Analytics.track(Analytics.events.VIEW_DASHBOARD_SCREEN, {
      ...getModuleClickParams(this.state.module.code),
      "Page Name": this.state.module.contents.pages[0].categoricalTitle,
      firstPageTitle: this.state.module.contents?.pages[0].categoricalTitle,
    });

    this.update();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.isFocused !== this.props.isFocused && this.props.isFocused) {
      this.update();
    }
  }

  initializeMultiVariables = () => {
    //Set Default value for multi submit choices

    getActiveModule()?.contents?.dashboard?.forEach(
      (dashboardSection, sectionKey) => {
        if (dashboardSection.type === "MULTI") {
          dashboardSection.value.map((value, key) => {
            const varName =
              dashboardSection.targetVariable + "_" + key.toString();
            if (dashboardSection.submitExist) {
              //Submit Enabled: Set Value to null
              this.setVariable(varName, null);
              this.moveToNextStep(true);
            } else {
              //Submit Disabled: Set value to false (0) and submitted by default
              this.setVariable(varName, 0);
              this.setVariable(
                dashboardSection.targetVariable + POSTFIX_SUBMITTED,
                1
              );
              this.setVariable(
                dashboardSection.targetVariable + POSTFIX_COUNT,
                0
              );
              this.setVariable(dashboardSection.targetVariable, 1);
              this.moveToNextStep(true);
            }
          });
        }
      }
    );
  };

  duration = () => {
    const currTime = new Date().getTime();
    return parseInt(currTime - this.state.startTimestamp);
  };

  interactWithProtocol = (item, shouldLog = false) => {
    if (shouldLog) {
      Analytics.track(Analytics.events.INTERACT_WITH_PROTOCOL, { item });
    }
    let interactionCount = this.state.interactionCount;
    this.setState({ interactionCount: (interactionCount += 1) });
  };

  refresh() {
    this.getModule();
    this.update();
  }

  /*TODO - merge this function with initializeMultiVariables*/
  setDefaultValues() {
    const module = getActiveModule();
    this.setState({ authorDescription: module?.authorDescription });

    {
      module &&
        module.contents &&
        module.contents.dashboard.map((dashboardSection, sectionKey) => {
          switch (dashboardSection.type) {
            case "PREDETERMINED":
              this.setState({ hasPanel: true });
              // if (_.has(dashboardSection, "values")) {
              //   dashboardSection.values.map((val) => {
              //     if (_.has(val, "defaultValue")) {
              //       //this.setVariable(val.code, val.defaultValue, true);
              //     }
              //   });
              // }
              break;
            case "SEGMENTED":
              if (dashboardSection.targetVariable) {
                if (
                  !this.getVar(dashboardSection.targetVariable) &&
                  Array.isArray(dashboardSection.value) === true
                ) {
                  dashboardSection.value.forEach((item, i) => {
                    if (typeof item === "string") {
                      if (item.trim()[item.trim().length - 1] === "!") {
                        // Default Value!
                        if (dashboardSection.targetVariable) {
                          this.setVariable(dashboardSection.targetVariable, i);
                          this.moveToNextStep(true);
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

  updateVariables = (params) => {
    const { variables } = this.state;
    Object.assign(variables, params.variables);
    this.setState({ variables });
  };

  isInfoAvailable() {
    return !this.state.info;
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

  onBackFromCalculator = (params) => {
    const { variables, calculatorReports } = this.state;
    Object.assign(variables, params.variables);
    calculatorReports[params.calculatorId] = params.result;
    if (params.isCalculator2) {
      const output = params.result;
      const mapping = getCalculatorOutputMapping(
        this.state.module.code,
        params.calculatorId
      );
      if (output?.numerical?.id) {
        const numericalMapping = mapping?.numerical || [];
        numericalMapping.forEach((numeric) => {
          variables[numeric] = output.calculatedValue;
        });
      }

      if (output?.validCategoricalOutput) {
        const categoricalMapping = mapping?.categorical || {};

        const choiceVariables =
          categoricalMapping[output.validCategoricalOutput.uniqueCode] || {};
        Object.keys(choiceVariables).forEach((key) => {
          variables[key] = choiceVariables[key].position;
          variables[key + POSTFIX_VALUE] = choiceVariables[key].value;
        });
      }
    }
    // console.log(variables, params.variables);
    const { activePages } = this.checkPages(variables);
    this.setState({ activePages, calculatorReports, variables });
    //this.setState({ variables, calculatorReports });
  };

  componentWillUnmount() {
    Analytics.track(Analytics.events.LEAVE_A_MODULE, {
      ...getModuleClickParams(this.state.module.code),
      "Page Name": this.state.module.contents.pages[0].categoricalTitle,
      firstPageTitle: this.state.module.contents.pages[0].categoricalTitle,
    });

    this.appStateSubscription && this.appStateSubscription.remove();
  }

  _backgroundState(state) {
    return state.match(/inactive|background/);
  }

  _handleAppStateChange = (nextAppState) => {
    if (
      this._backgroundState(this.state.appState) &&
      nextAppState === "active"
    ) {
      this.getModule();
    }
    this.setState({ appState: nextAppState });
  };

  async getModule() {
    const variablesToSet = getDeeplinkVariables();
    let activeModule = getActiveModule();
    this.setState({ module: activeModule });
    if (activeModule?.customNumerics) {
      setCustomNumerics(activeModule.customNumerics);
    }
    if (variablesToSet) {
      variablesToSet.forEach(({ code, value }) => {
        this.setVariable(getKeyFromCode(code), value);
      });
    }
    //this.initializeMultiVariables();
  }

  getVar = (key, groupItem = false) => {
    if (!this.state) {
      return;
    }
    const { variables, variablesBuffer, groupVariablesBuffer } = this.state;
    // if set group item parameter then get values from groupVariablesBuffer state
    // console.log("inside getVar",key, variablesBuffer);
    if (groupItem) {
      return groupVariablesBuffer[key];
    }
    if (variablesBuffer[key]) {
      // console.log("inside variable buffer----");
      return variablesBuffer[key];
    }
    return variables[key];
  };

  sigmoid = (t) => {
    return 1 / (1 + Math.pow(Math.E, -t));
  };

  calculateProgress = () => {
    const { variables, variablesBuffer } = this.state;
    const { module } = this.state;

    try {
      const dashboardItemCount = module.contents.dashboard.length;

      const mergedVariables = Object.assign({}, variables, variablesBuffer);
      var count = 0;

      Object.keys(mergedVariables).forEach(function (k) {
        if (
          (variables[k] >= 0 && !k.includes("_")) ||
          (variables[k] && k.includes("_"))
        ) {
          count += 1;
        }
      });

      var fakeProgress = count / (dashboardItemCount * 0.6);
      if (fakeProgress >= 0.7) {
        fakeProgress = 0.7 + this.sigmoid((fakeProgress - 0.7) * 0.8) * 0.3;
      }

      return fakeProgress;
    } catch (e) {
      crashlytics().recordError(e);
      return 0;
    }
  };

  moveToNextStep = (isInitial) => {
    if (!isInitial) this.shouldScrollPage = true;
    this.update();
    this.setState({
      progress: this.calculateProgress(),
      shouldShowScroll: true,
    });
    Keyboard.dismiss();
  };

  moveToFinish = () => {
    Analytics.track(Analytics.events.CLICK_TAP_TO_READ, {
      moduleId: this.state.module.code,
      moduleTitle: this.state.module.title,
      name: "to read a content page",
      title: this.state.activePages["dominant"][0].categoricalTitle,
      firstPageTitle: this.state.activePages["dominant"][0].categoricalTitle,
      "interaction count": this.state.interactionCount,
      duration: this.duration(),
    });
    const { activePages, variables, module } = this.state;
    this.props.navigation.navigate("Content", {
      activePages,
      variables,
      conditionalObjects: module?.contents?.conditionalObjects,
      moduleUpdateNotification: () => this.refresh(), //function to refresh screen,
    });

    /*this.props.navigation.navigate("Content", {
      moduleUpdateNotification: () => this.refresh() //function to refresh screen,
    });*/
    //console.log(`Finishing protocol ${this.state.module.code}`);
  };
  // for on boarding survey read values and convert them for upating data in firebase
  convertToReadableVariable(variables, module) {
    const keysEndWithCode = Object.keys(variables).filter(
      (code) => code.endsWith("_code") || code.endsWith("__count")
    );
    return keysEndWithCode.reduce((all, key) => {
      key = key.includes("__count") ? key.replace("__count", "") : key;
      const panel = module.contents?.dashboard?.find(
        (panel) => panel.targetVariable === key
      );
      const readableKey = panel?.name;
      if (!readableKey) return all;
      switch (panel.type) {
        case "MULTI":
          const labels = [];
          panel.items?.forEach(({ label }, order) => {
            if (variables[`${key}_${order}`] && label) {
              labels.push(label);
            }
          });
          all[readableKey] = labels;
          break;
        case "SEGMENTED":
        case "DROPDOWN":
          const value = variables[key + POSTFIX_VALUE];
          if (value) {
            all[readableKey] = value;
          }
          break;
      }
      return all;
    }, {});
  }
  continueWithOnBoarding = () => {
    const { variables, module } = this.state;
    const dataBaseInfo = getDatabaseInstance();

    const readableOutput = this.convertToReadableVariable(variables, module);
    const { uid, email } = firebase.auth().currentUser || {};

    try {
      // /users/6cTxn5XN0SVZn8sMD4tiodcsaxg2/surveyProfile
      dataBaseInfo.ref(`users/${uid}/surveyProfile`).update(readableOutput);
      Analytics.identify(email || uid, readableOutput);
      Analytics.track(Analytics.events.SET_ADDITIONAL_INFO, {
        page: "Questionnaire",
        duration: duration(),
      });
    } catch (e) {
      //Analytics.error(e);
    } finally {
      //history.push('/');
      //this.props.navigation.goBack();
      resetActiveModule();
      store.dispatch({
        type: "SET_IS_USER_LOGGED_IN",
        data: true,
      });
      this.props.navigation.navigate("Modules", { isSurveyDone: true });
    }
  };

  isInVars = (key) => {
    const { variables } = this.state;
    return variables[key];
  };

  isInBuffer = (key) => {
    const { variablesBuffer } = this.state;
    return variablesBuffer[key];
  };

  checkPages = (variables) => {
    const { module } = this.state;
    const activePages = getActivePages(module?.contents?.pages, variables);
    return { activePages };
  };

  updateFormulae(variables) {
    const { module } = this.state;
    // Update calculation at local level av-899 && formula sequence av-898
    return updateVariablesFromFormulae(variables, module?.contents?.formulae);
  }

  setGroupToVariable(target, count, groupItem, groupTargetVariable) {
    const group_array = [...Array(count).keys()];
    for (var i = 0; i < group_array.length; i++) {
      const varName = target + "_" + i.toString();
      const varElement = this.getVar(varName, groupItem);
      if (varElement === 1) {
        this.setVariable(target, 1, true, groupItem, groupTargetVariable);
        return;
      }
    }
    this.setVariable(target, 0, true, groupItem, groupTargetVariable);
  }

  setVariable(
    key,
    value,
    { userEntry } = { userEntry: true },
    groupItem = false,
    groupTargetVariable
  ) {
    const {
      variables,
      variablesBuffer,
      groupAnswerAbleItemArray,
      groupVariablesBuffer,
    } = this.state;

    if (userEntry && !variables[key]) {
      groupItem
        ? (groupVariablesBuffer[key] = value)
        : (variablesBuffer[key] = value);
      groupItem
        ? this.setState({ groupVariablesBuffer })
        : this.setState({ variablesBuffer });
    } else {
      groupItem
        ? (groupVariablesBuffer[key] = value)
        : (variables[key] = value);
      groupItem
        ? this.setState({ groupVariablesBuffer })
        : this.setState({ variables });
    }
    //console.log("buffer and variable", variables);
    // update all string formulae using eval()
    this.update();

    if (this.state.firstInput === false) {
      this.setState({ firstInput: true });
    }
  }
  //  set variables for form and group
  setVariables = (newVars) => {
    this.setState(({ variables: oldVars }) => {
      // update all string formulae using eval()
      const variables = this.updateFormulae({ ...oldVars, ...newVars });
      const { activePages } = this.checkPages(variables);
      //console.log("dash", variables);
      return { activePages, variables };
    });
  };

  update = () => {
    this.setState(({ variables: oldVars, progress, variablesBuffer }) => {
      const variables = this.updateFormulae({ ...oldVars, ...variablesBuffer });
      const { activePages } = this.checkPages(variables);
      if (isValid(activePages["dominant"])) {
        progress = 1;
      }
      return { activePages, variables, progress, variablesBuffer: {} };
    });
  };

  getInputRating(key, value) {
    if (Number(value) > getHigh(key)) {
      return `High (>${getHigh(key)} ${getUnit(key)})`;
    } else if (Number(value) < getLow(key)) {
      return `Low (<${getLow(key)} ${getUnit(key)})`;
    } else {
      return getUnit(key);
    }
  }

  interactWithContent = (item, shouldLog = false) => {
    if (shouldLog) {
      Analytics.track(Analytics.events.INTERACT_WITH_CONTENT, { item });
    }
    let interactionCount = this.state.interactionCount;
    this.setState({ interactionCount: (interactionCount += 1) });
  };

  setReference = (reference) => {
    this.setState({ reference });
  };

  setInfo = (info) => {
    this.setState({ info });
  };

  openFullTextPanel = (props) => {
    this.props.navigation.navigate("TextPanel", props);
  };

  renderDashboardSegmented(
    item,
    itemKey,
    isLast,
    groupItem,
    groupTargetVariable,
    props
  ) {
    const {
      getVar,
      moveToNextStep,
      interactWithContent,
      interactWithProtocol,
      setVariable,
      setVariables,
      setInfo,
    } = this;
    const { variables, calculatorReports, variablesBuffer } = this.state;
    const associatedCalculators = extractCalculatorsFrom(item.elements);
    return (
      <DashboardSegmented
        variables={variables}
        variablesBuffer={variablesBuffer}
        calculatorReports={calculatorReports}
        item={item}
        itemKey={itemKey}
        isLast={isLast}
        groupItem={groupItem}
        groupTargetVariable={groupTargetVariable}
        getVar={props?.getVar ? props?.getVar : getVar}
        setVariable={props?.setVariable ? props?.setVariable : setVariable}
        setVariables={props?.setVariables ? props?.setVariables : setVariables}
        moveToNextStep={moveToNextStep}
        interactWithContent={interactWithContent}
        setInfo={setInfo}
        interactWithProtocol={interactWithProtocol}
        associatedCalculators={associatedCalculators}
        _this={this}
        styles={styles}
      />
    );
  }
  // Introduction Panel
  renderDashboardIndications(item, itemKey, conditionalObjects) {
    const {
      getVar,
      setInfo,
      setReference,
      interactWithContent,
      interactWithProtocol,
    } = this;
    const { variables, calculatorReports, authorDescription } = this.state;
    const associatedCalculators = extractCalculatorsFrom(item.elements);

    /*
      if ( module && isValid(module.authorDescription)) {
        this.setState({ authorDescription: module.authorDescription})
      }*/

    return (
      <DashboardIndications
        item={item}
        itemKey={itemKey}
        setReference={setReference}
        setInfo={setInfo}
        getVar={getVar}
        variables={variables}
        calculatorReports={calculatorReports}
        associatedCalculators={associatedCalculators}
        interactWithContent={interactWithContent}
        interactWithProtocol={interactWithProtocol}
        authorDescription={authorDescription}
        _this={this}
        styles={styles}
        conditionalObjects={conditionalObjects}
      />
    );
  }

  renderDashboardDescription(item, itemKey) {
    //const {variables} = this.state;
    //const isAction = item.descriptionType === "action";
    const { interactWithProtocol } = this;
    const { variables } = this.state;
    return (
      <DashboardDescription
        item={item}
        itemKey={itemKey}
        variables={variables}
        interactWithProtocol={interactWithProtocol}
        _this={this}
        styles={styles}
      />
    );
  }

  renderDashboardBetaDescription(
    item,
    itemKey,
    conditionalObjects,
    isLast,
    groupItem,
    props
  ) {
    const { variables, showQuestionResources, calculatorReports } = this.state;
    const associatedCalculators = extractCalculatorsFrom(item.elements);
    const { getVar, setInfo, interactWithProtocol } = this;
    //console.log("itemKey", item.id);
    return (
      <DashboardDescriptionCardV2
        item={item}
        itemKey={item.id}
        isLast={isLast}
        groupItem={groupItem}
        variables={
          props.variables && !props.isSubmitted ? props.variables : variables
        }
        getVar={props.getVar && !props.isSubmitted ? props.getVar : getVar}
        conditionalObjects={conditionalObjects}
        showQuestionResources={showQuestionResources}
        calculatorReports={calculatorReports}
        associatedCalculators={associatedCalculators}
        setInfo={setInfo}
        interactWithProtocol={interactWithProtocol}
        _this={this}
        isFirst={itemKey === 0}
      />
    );
  }
  // Render section element
  renderDashboardSection(item, itemKey) {
    return (
      <DashboardSection
        item={item}
        styles={styles}
        itemKey={item.id}
        _this={this}
      />
    );
  }

  // Multi choice items
  renderDashboardMulti(
    item,
    itemKey,
    isLast,
    groupItem,
    groupTargetVariable,
    props
  ) {
    const {
      getVar,
      moveToNextStep,
      setVariable,
      interactWithProtocol,
      setInfo,
      setVariables,
    } = this;
    const { variables, calculatorReports, variablesBuffer } = this.state;
    return (
      <DashboardMulti
        item={item}
        variables={variables}
        itemKey={itemKey}
        isLast={isLast}
        groupItem={groupItem}
        groupTargetVariable={groupTargetVariable}
        getVar={props?.getVar ? props?.getVar : getVar}
        setVariable={props?.setVariable ? props?.setVariable : setVariable}
        setVariables={props?.setVariables ? props?.setVariables : setVariables}
        moveToNextStep={moveToNextStep}
        interactWithProtocol={interactWithProtocol}
        setInfo={setInfo}
        viewWidth={viewWidth}
        styles={styles}
        _this={this}
      />
    );
  }
  renderDashboardForm = (item, itemKey, conditionalObjects) => {
    return item.groupItems ? (
      <GroupForm
        item={item}
        //  filteredGroupItem={item.groupItems.filter(this.filterByTrigger)}
        renderSection={this.renderSection}
        // filterByTrigger={this.filterByTrigger}
        // getVar={this.getVar}
        setVariables={this.setVariables}
        variables={this.state.variables}
        itemKey={itemKey}
        // groupVariablesBuffer={this.state.groupVariablesBuffer}
        setVariable={this.setVariable}
        _this={this}
        conditionalObjects={conditionalObjects}
        styles={styles}
      />
    ) : null;
  };

  // Dashboard Special item
  renderDashboardSpecial(item, itemKey) {
    const {
      moveToNextStep,
      interactWithProtocol,
      getVar,
      setVariable,
      setGroupToVariable,
    } = this;
    return (
      <DashboardSpecial
        item={item}
        itemKey={itemKey}
        getVar={getVar}
        interactWithProtocol={interactWithProtocol}
        setGroupToVariable={setGroupToVariable}
        moveToNextStep={moveToNextStep}
        _this={this}
        styles={styles}
      />
    );
  }
  // render institution dropdwon for on boarding survey
  renderDashboardDropDown(item) {
    const { setVariables } = this;
    return (
      <DashboardDropDown
        item={item}
        setVariables={setVariables}
        styles={styles}
      />
    );
  }
  // Number Panel
  renderDashboardPredetermined(
    item,
    itemKey,
    isLast,
    groupItem,
    groupTargetVariable,
    props
  ) {
    const {
      getVar,
      moveToNextStep,
      setVariable,
      setVariables,
      setInfo,
      interactWithProtocol,
      isInBuffer,
      isInVars,
    } = this;
    return (
      <DashboardPredetermined
        item={item}
        itemKey={itemKey}
        isLast={isLast}
        groupItem={groupItem}
        setInfo={setInfo}
        groupTargetVariable={groupTargetVariable}
        getVar={props?.getVar ? props?.getVar : getVar}
        setVariable={props?.setVariable ? props?.setVariable : setVariable}
        setVariables={props?.setVariables ? props?.setVariables : setVariables}
        moveToNextStep={moveToNextStep}
        interactWithProtocol={interactWithProtocol}
        variables={this.state.variables}
        _this={this}
        styles={styles}
        {...props}
      />
    );
  }
  // Numeric Label I think it's depreceated
  // renderDashboardNumericLabel(item, itemKey) {
  //   const {
  //     setVariable,
  //     getVar,
  //     getInputRating,
  //     interactWithProtocol,
  //     dismissKeyboardAction,
  //   } = this;
  //   return (
  //     <DashboardNumericLabel
  //       item={item}
  //       itemKey={itemKey}
  //       getVar={getVar}
  //       interactWithProtocol={interactWithProtocol}
  //       dismissKeyboardAction={dismissKeyboardAction}
  //       getInputRating={getInputRating}
  //       setVariable={setVariable}
  //       _this={this}
  //       styles={styles}
  //     />
  //   );
  // }

  renderDashboardTextPanel(
    item,
    itemKey,
    conditionalObjects,
    isLast,
    groupItem,
    props
  ) {
    const { variables, showQuestionResources, calculatorReports } = this.state;
    const associatedCalculators = extractCalculatorsFrom(item.elements);
    const { getVar, setInfo, interactWithProtocol } = this;
    return (
      <DashboardTextPanel
        item={item}
        itemKey={item.id}
        isLast={isLast}
        groupItem={groupItem}
        variables={
          props.variables && !props.isSubmitted ? props.variables : variables
        }
        getVar={props.getVar && !props.isSubmitted ? props.getVar : getVar}
        conditionalObjects={conditionalObjects}
        showQuestionResources={showQuestionResources}
        calculatorReports={calculatorReports}
        associatedCalculators={associatedCalculators}
        setInfo={setInfo}
        interactWithProtocol={interactWithProtocol}
        styles={styles}
        _this={this}
        isFirst={itemKey === 0}
        openFullTextPanel={this.openFullTextPanel}
      />
    );
  }

  renderSection(
    item,
    itemKey,
    conditionalObjects = {
      blocks: [],
      entityMap: {},
    },
    isLast,
    groupItem = false,
    groupTargetVariable,
    props = {}
  ) {
    switch (item.type) {
      case panelType.DIVIDER:
        return !isLast && <GroupDivider key={itemKey} />;
      case panelType.PRESET:
      case panelType.DROPDOWN:
        return this.renderDashboardDropDown(item);
      case panelType.PREDETERMINED:
        return this.renderDashboardPredetermined(
          item,
          itemKey,
          isLast,
          groupItem,
          groupTargetVariable,
          props
        );
      case panelType.INDICATIONS:
        return this.renderDashboardIndications(
          item,
          itemKey,
          conditionalObjects
        );
      case panelType.DESCRIPTION:
        return this.renderDashboardDescription(item, itemKey);
      case panelType.BETA_DESCRIPTION:
        return this.renderDashboardBetaDescription(
          item,
          itemKey,
          conditionalObjects,
          isLast,
          groupItem,
          props
        );
      case panelType.SECTION:
        return this.renderDashboardSection(item, itemKey);
      case panelType.SEGMENTED:
        return this.renderDashboardSegmented(
          item,
          itemKey,
          isLast,
          groupItem,
          groupTargetVariable,
          props
        );
      case panelType.SPECIAL:
        return this.renderDashboardSpecial(item, itemKey);
      case panelType.MULTI:
        return this.renderDashboardMulti(
          item,
          itemKey,
          isLast,
          groupItem,
          groupTargetVariable,
          props
        );
      case panelType.FORM:
        return this.renderDashboardForm(item, itemKey, conditionalObjects);
      case panelType.VERTICAL:
        break;
      case panelType.NUMERIC:
        break;
      case panelType.VALUELABEL:
        return this.renderDashboardNumericLabel(item, itemKey);
      case panelType.TEXT_INPUT:
        return this.renderDashboardTextPanel(
          item,
          itemKey,
          isLast,
          groupItem,
          groupTargetVariable,
          props
        );
    }
  }

  render() {
    const {
      module,
      info,
      reference,
      variables,
      pdfLink,
      contentOffset,
      scrollViewContentSize,
      isScrollable,
      shouldShowScroll,
    } = this.state;
    const offset = new Animated.Value(0);
    const onModalClose = () =>
      this.setState({ reference: null, pdfLink: null });
    const activeCards = [];
    const onInfoClose = () => {
      Analytics.track(Analytics.events.CLOSE_INFORMATION_MODAL);
      this.setState({ info: null });
    };

    if (this.state.defaultValueSet === false) {
      this.setDefaultValues();
      this.setState({ defaultValueSet: true });
    }

    module &&
      module.contents &&
      module.contents.dashboard.forEach((dashboardSection, sectionKey) => {
        if (filterByTriggerFn(dashboardSection, variables)) {
          if (dashboardSection.type === "FORM" && dashboardSection.groupItems) {
            dashboardSection.groupItems.forEach((panel) => {
              delete variables[panel.targetVariable];
            });
          }
          delete variables[dashboardSection.targetVariable];
        } else {
          activeCards.push(dashboardSection);
        }
      });
    // In case if calculators not loaded on main screen
    // Todo temporary solution - Proper fix should load calculators in modules.js
    if (module && module.calculators2Used) {
      getDataAndCache({
        dataKey: "calculators2",
        elementList: module.calculators2Used ?? [],
      });
    }

    //console.log("Dashboard", module);

    return (
      <View style={{ backgroundColor: "#FFF", flex: 1 }}>
        <AnimatedHeader
          animatedValue={offset}
          moduleTitle={module?.title}
          adminModule={module?.isAdminModule}
          onBackPress={() => {
            Analytics.track(Analytics.events.EXIT_DASHBOARD_SCREEN, {
              protocol: this.state.module.code,
              "interaction count": this.state.interactionCount,
              duration: this.duration(),
            });

            this.props.navigation.goBack();
          }}
        />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          enabled={Platform.OS === "ios"}
          behavior={"padding"}
        >
          <Animated.ScrollView
            style={{ flex: 1, backgroundColor: "white" }}
            showsVerticalScrollIndicator={false}
            ref={this.scrollView}
            scrollEventThrottle={20}
            enableResetScrollToCoords={false}
            onContentSizeChange={(width, height) => {
              this.setState({ scrollViewContentSize: height });
            }}
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
                  const paddingToBottom = 100;
                  this.setState({
                    isScrollable:
                      event.nativeEvent.layoutMeasurement.height +
                        event.nativeEvent.contentOffset.y <
                      scrollViewContentSize - paddingToBottom,
                  });
                },
              }
            )}
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
                paddingBottom: getHeight(12),
              }}
            >
              {/* For FeaturedAuthors    */}
              {Array.isArray(module?.authorList) &&
                module?.authorList.length > 0 && (
                  <FeaturedAuthors authors={module?.authorList} />
                )}
              {activeCards.map((activeCard, itemKey) => {
                let isLast = activeCards.length - 1 === itemKey;
                if (activeCards.length > 1 && itemKey > 0) {
                  prevCard = activeCards[itemKey - 1];
                  if (
                    prevCard.type === "BETA_DESCRIPTION" &&
                    activeCard.type === "BETA_DESCRIPTION"
                  ) {
                    isLast = false;
                  }
                }
                return this.renderSection(
                  activeCard,
                  itemKey,
                  module?.contents?.conditionalObjects,
                  isLast
                );
              })}
            </View>
          </Animated.ScrollView>
          {shouldShowScroll && isScrollable && (
            <TouchableWithoutFeedback
              onPress={() => {
                this.scrollView.current.scrollToEnd({
                  animated: true,
                });
                this.setState({ shouldShowScroll: false });
              }}
            >
              <Image
                style={styles.scrollToBottomBtn}
                resizeMode={"contain"}
                source={require("../images/scroll-bottom.png")}
              />
            </TouchableWithoutFeedback>
          )}
        </KeyboardAvoidingView>

        {isValid(this.state.activePages["dominant"]) && (
          <Animatable.View
            animation="bounceInUp"
            delay={100}
            duration={800}
            onAnimationBegin={Keyboard.dismiss}
            style={{
              ...styles.upperShadow,
              paddingTop: getHeight(28),
              paddingBottom: getHeight(38),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TouchableOpacity
              style={{
                ...styles.balloonButtonStyle,
                borderRadius: getHeight(53) / 2,
                backgroundColor: Colors.button,
                height: getHeight(53),
                width: getWidth(239),
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={
                module.isAdminModule
                  ? this.continueWithOnBoarding
                  : this.moveToFinish
              }
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "700",
                  fontSize: getHeight(20),
                  fontFamily: fontFamily.Bold,
                  textAlign: "center",
                }}
              >
                {module.isAdminModule ? "Continue" : "Read more"}
              </Text>
            </TouchableOpacity>
          </Animatable.View>
        )}

        {Platform.OS === "ios" &&
          this.state.firstInput &&
          !isValid(this.state.activePages["dominant"]) &&
          !this.state.hasPanel}

        {Platform.OS === "ios" &&
          this.state.firstInput &&
          !isValid(this.state.activePages["dominant"]) &&
          !this.state.hasPanel}
        {info ? (
          <InformationModal
            info={info}
            onClose={onInfoClose}
            setVisibleModal={this.setVisibleModal}
            isInfoAvailable={this.isInfoAvailable}
            protocol={module}
            setReference={this.setReference}
            getVar={this.getVar}
            setInfo={this.setInfo}
            variables={variables}
            conditionalObjects={module?.contents?.conditionalObjects}
          />
        ) : (
          <View />
        )}

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
      </View>
    );
  }
}

export default function (props) {
  const isFocused = useIsFocused();

  const optionalProps = {
    isFocused,
  };

  return <DashboardScreen {...props} {...optionalProps} />;
}

const styles = StyleSheet.create({
  cardStyle: {
    marginLeft: 15,
    marginRight: 15,
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
    marginLeft: 13,
    marginRight: 10,
    marginBottom: 11,
    paddingLeft: 0,
    paddingRight: 0,
  },
  sectionTitleTextStyleSub: {
    fontSize: getHeight(12),
    fontFamily: fontFamily.Regular,
    marginStart: getWidth(5),
  },
  sectionTitleTextStyle: {
    marginStart: 46,
    marginEnd: 44,
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
    minWidth: getWidth(90),
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
  scrollToBottomBtn: {
    width: getHeight(80),
    height: getHeight(66),
    backgroundColor: "transparent",
    position: "absolute",
    alignSelf: "center",
    bottom: getHeight(5),
  },
});
