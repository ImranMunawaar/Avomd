// import { commitNumber } from "../../commitInfo";
import firebase from "@react-native-firebase/app";
import "@react-native-firebase/database";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import _ from "lodash";
import { getUnit, getTitle } from "./units";
import store, { selectors } from "../store";
import NetInfo from "@react-native-community/netinfo";
import { deeplinkPaths } from "../constants/strings";
import * as Analytics from "../services/Analytics";
import crashlytics from "@react-native-firebase/crashlytics";
import { getModuleClickParams } from "../models/deepLinkActions";
import {
  POSTFIX_SUBMITTED,
  POSTFIX_COUNT,
  POSTFIX_MULTITITLE,
  POSTFIX_VALUE,
  POSTFIX_ASSIGNED,
} from "../screens/DashboardExports";
import { getDatabaseInstance } from "../services/helper";
import { calculateFormula } from "./formula";

export const data = {};
export const followingChannels = ["avomd_universal", "bidmc_plymouth"];

let isOffline = false;

NetInfo.addEventListener((state) => {
  isOffline = !state.isConnected;
});

async function firebaseGetRef(ref, timeout = 60000) {
  const firebaseRequestTimeout = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject("Firebase timed out");
    }, timeout);
    getDatabaseInstance()
      .ref(ref)
      .once("value")
      .then((val) => {
        resolve(val);
      });
    if (isOffline) {
      reject("Firebase is offline");
    }
  });
  return firebaseRequestTimeout;
}

export async function getDataAndCache({ dataKey, elementList }) {
  const { caching } = store.getState().general;
  const { data } = store.getState().persist;
  let currentData = data[dataKey];
  if (_.isNil(currentData)) {
    currentData = {};
  }
  await Promise.all(
    elementList.map(async (elementName) => {
      const serverTimestamp = caching.timestamps[dataKey]
        ? caching.timestamps[dataKey][elementName]
        : null;
      const shouldReloadFromServer =
        !currentData[elementName] ||
        serverTimestamp === undefined ||
        serverTimestamp > currentData[elementName].serverTimestamp;

      if (shouldReloadFromServer) {
        store.dispatch({
          type: "SET_DATA_LOADED",
          name: elementName,
          data: false,
        });
        const elementSnapshot = await firebaseGetRef(
          `${dataKey}/${elementName}`
        );
        currentData[elementName] = elementSnapshot.val();
        if (currentData[elementName]) {
          currentData[elementName].serverTimestamp = serverTimestamp;
          currentData[elementName].timestampUpdated = Date.now();
          /* let teamCode = currentData[elementName].team;
          if (teamCode) {
            currentData[elementName].team = {
              displayName: teams[teamCode]?.displayName,
              icon: teams[teamCode]?.icon,
              code: teamCode,
            };
          } */
        } else {
          console.log(
            `Module Load Error: "${dataKey}/${elementName}" does not exist, ` +
              `please disable/remove "${elementName}" from your channel's ${dataKey} whitelist`
          );
        }
        store.dispatch({
          type: "SET_DATA",
          dataKey,
          key: elementName,
          data: currentData[elementName],
        });
      }
    })
  );
  return currentData;
}

async function getAllDataAndCache({ dataKey }) {
  const { caching } = store.getState().general;
  const { data } = store.getState().persist;
  let currentData = data[dataKey];

  const serverTimestamp = caching.timestamps[dataKey]
    ? caching.timestamps[dataKey]
    : null;
  const shouldReloadFromServer =
    !currentData ||
    serverTimestamp === undefined ||
    !currentData.serverTimestamp ||
    serverTimestamp > currentData.serverTimestamp;
  if (shouldReloadFromServer) {
    store.dispatch({
      type: "SET_DATA_LOADED",
      name: dataKey,
      data: false,
    });
    const elementSnapshot = await firebaseGetRef(`${dataKey}`);
    currentData = elementSnapshot.val();
    if (currentData) {
      currentData.serverTimestamp = serverTimestamp;
      currentData.timestampUpdated = Date.now();
    } else {
      console.log(`${dataKey} load Error`);
    }
    store.dispatch({
      type: "SET_DATA",
      dataKey,
      data: currentData,
    });
  }
  return currentData;
}

export function getDateString(miliseconds) {
  const seconds = miliseconds / 1000;
  const mins = seconds / 60;
  const hours = mins / 60;
  const days = hours / 24;
  const weeks = days / 7;
  const months = weeks / 4;

  if (seconds < 60) {
    return parseInt(seconds).toString() + " seconds";
  } else if (mins < 60) {
    return parseInt(mins).toString() + " minutes";
  } else if (hours < 48) {
    return parseInt(hours).toString() + " hours";
  } else if (days < 13) {
    return parseInt(days).toString() + " days";
  } else if (weeks < 15) {
    return parseInt(weeks).toString() + " weeks";
  } else {
    return parseInt(months).toString() + " months";
  }
}

export async function initModules() {
  store.dispatch({ type: "SET_DATA_LOADING_INDICATOR", data: true });
  store.dispatch({ type: "RESET_LOADED_MODULES" });

  new Promise(async (resolve, reject) => {
    //For offline support
    if (isOffline) {
      reject();
      store.dispatch({ type: "SET_DATA_LOADING_INDICATOR", data: false });
    } else {
      setTimeout(() => {
        reject();
        store.dispatch({ type: "SET_DATA_LOADING_INDICATOR", data: false });
      }, 20000);
    }

    let firebaseRefs = [
      firebaseGetRef("timestamps/"),
      firebaseGetRef("calculatorsAttachedTo/"),
    ];

    try {
      const [timestampsSnapshot, calculatorsSnapshot] = await Promise.all(
        firebaseRefs
      );
      store.dispatch({
        type: "SET_CACHING",
        data: timestampsSnapshot.val(),
        key: "timestamps",
      });
      store.dispatch({
        type: "SET_CACHING",
        data: calculatorsSnapshot.val(),
        key: "calculators",
      });
    } catch (err) {
      crashlytics().recordError(err);
      console.log(
        "Firebase cache couldn't load, proceeding from local copy",
        err
      );
    }

    const cachePromises = [
      getAllDataAndCache({
        dataKey: "numerics",
      }),
      getAllDataAndCache({
        dataKey: "teams",
      }),
      getDataAndCache({
        dataKey: "modules",
        elementList: selectors.enabledModules(store.getState()),
      }),
      getDataAndCache({
        dataKey: "calculators",
        elementList: selectors.enabledCalculators(store.getState()),
      }),
      getDataAndCache({
        dataKey: "calculators2",
        elementList: selectors.enabledCalculators2(store.getState()),
      }),
      getDataAndCache({
        dataKey: "tagTrees2",
        elementList: selectors.enabledTagsTree(store.getState()),
      }),
    ];
    try {
      await Promise.all(cachePromises);
    } catch (initModulesErr) {
      crashlytics().recordError(initModulesErr);
      console.log({ initModulesErr });
    }
    resolve();
    store.dispatch({ type: "SET_DATA_LOADING_INDICATOR", data: false });
  });
}

export async function initSharedModule(moduleCode) {
  store.dispatch({ type: "SET_DATA_LOADING_INDICATOR", data: true });
  store.dispatch({ type: "RESET_LOADED_MODULES" });

  // get firebase data and initialized it
  let timestamps;
  try {
    const [timestampsSnapshot, calculatorsSnapshot] = await Promise.all([
      firebaseGetRef("timestamps/"),
      firebaseGetRef("calculatorsAttachedTo/"),
    ]);
    timestamps = timestampsSnapshot.val();

    store.dispatch({
      type: "SET_CACHING",
      data: timestamps,
      key: "timestamps",
    });
    store.dispatch({
      type: "SET_CACHING",
      data: calculatorsSnapshot.val(),
      key: "calculators",
    });
  } catch {
    console.log("Firebase cache couldn't load, proceeding from local copy");
  }
  // retrieve module from firebase
  const elementSnapshot = await firebaseGetRef(`modules/${moduleCode}`);
  const module = elementSnapshot.val();
  if (!module) {
    throw new Error("Module not found");
  }

  //module.serverTimestamp = timestamps?.modules[moduleCode];

  store.dispatch({
    type: "SET_DATA",
    dataKey: "modules",
    key: moduleCode,
    data: module,
  });

  try {
    await Promise.all([
      getDataAndCache({
        dataKey: "calculators",
        elementList:
          store.getState().general.caching?.calculators?.[moduleCode] ?? [],
      }),
      getDataAndCache({
        dataKey: "calculators2",
        elementList: module.calculators2Used ?? [],
      }),
      getAllDataAndCache({ dataKey: "numerics" }),
    ]);
  } catch (initModulesErr) {
    console.log({ initModulesErr });
  }

  store.dispatch({ type: "SET_DATA_LOADING_INDICATOR", data: false });
}
export async function loadSharedModule(moduleId) {
  await initSharedModule(moduleId);
  const found = setActiveModule(moduleId);
  if (found) {
    Analytics.track(
      Analytics.events.VIEW_DASHBOARD_FROM_SHARE_LINK,
      getModuleClickParams(moduleId)
    );
  } else {
    // Analytics.error({ msg: "module doesn't exist" });
  }
}

export function getAllModules() {
  return store.getState().persist.data.modules;
}

export const getReducedModules = (enabledModules, userActivity) => {
  const reducedModules = [];
  const modules = getAllModules();
  Object.values(modules).forEach((module) => {
    if (module && enabledModules.includes(module.code)) {
      let lastViewedTimeStamp = userActivity?.modules
        ? userActivity.modules[module.code]?.lastVisitedAt
        : 68400000;
      lastViewedTimeStamp = lastViewedTimeStamp || 68400000;
      reducedModules.push({
        title: module.title,
        code: module.code,
        serverTimestamp: module.serverTimestamp,
        lastViewedTimeStamp,
        author: module.author,
        authorList: module?.authorList,
        description: module.description,
        moduleIndication: module.moduleIndication,
        team: module.team,
        tags: module.tags,
        favorite:
          userActivity?.modules && userActivity?.modules[module.code]?.favorite,
      });
    }
  });
  return reducedModules;
};

export const getReducedCalculators2 = (enabledCalculators2, userActivity) => {
  const reducedCalculators = [];
  const calculators2 = store.getState().persist.data.calculators2;
  Object.values(calculators2).forEach((calculator) => {
    if (calculator && enabledCalculators2.includes(calculator.code)) {
      let lastViewedTimeStamp = userActivity?.calculators
        ? userActivity.calculators[calculator.code]?.lastVisitedAt
        : 68400000;
      lastViewedTimeStamp = lastViewedTimeStamp || 68400000;
      reducedCalculators.push({
        title: calculator.title,
        code: calculator.code,
        serverTimestamp: calculator.serverTimestamp,
        lastViewedTimeStamp,
        author: calculator.author,
        description: calculator.description,
        moduleIndication: calculator.moduleIndication,
        team: calculator.team,
        tags: calculator.tags,
        favorite:
          userActivity?.calculators &&
          userActivity?.calculators[calculator.code]?.favorite,
      });
    }
  });
  return reducedCalculators;
};

// Initialize channels if emmpty (the first run of the app)
export async function setDefaultStorage() {
  /*if (store.getState().persist.commitNumber !== commitNumber) {
    store.dispatch({ type: "RESET_DATA" });
  }*/
  const releaseConfigurations = require("../../releaseConfigurations.json");
  try {
    let { activeReleaseTarget } = store.getState().persist;
    if (releaseConfigurations.activeReleaseTarget !== activeReleaseTarget) {
      store.dispatch({
        type: "SET_RELEASE_TARGET",
        data: releaseConfigurations.activeReleaseTarget,
      });
    }
    await syncFollowingChannels();
    //await syncAllModules();
  } catch (error) {
    // Error retrieving data
    crashlytics().recordError(error);
    console.log(error);
  }
}

export async function syncFollowingChannels() {
  const { channels } = store.getState().persist;
  //For offline support
  try {
    if (!isOffline) {
      channels.allChannels = (await firebaseGetRef("channels/")).val();
    }
    /* const testChannelLocal = await AsyncStorage.getItem("test_channel_local");
    if (testChannelLocal) {
      channels.allChannels.test = JSON.parse(testChannelLocal);
    } */
  } catch (err) {
    crashlytics().recordError(err);
  }
  //reduce channels data
  Object.values(channels.allChannels).forEach((channel) => {
    //delete channel.team;
    delete channel.whiteListCalculators2;
    delete channel.whiteList;
    delete channel.listType;
  });
  store.dispatch({
    type: "SET_CHANNELS",
    channelName: "allChannels",
    data: channels.allChannels,
  });
}

export async function syncAllModules() {
  try {
    let allModules = (await firebaseGetRef("modules/")).val();
    let modulesWithTitle = {};
    Object.values(allModules).forEach(
      (module) => (modulesWithTitle[module.code] = { title: module.title })
    );
    store.dispatch({
      type: "SET_DATA",
      dataKey: "allModules",
      data: modulesWithTitle,
    });
  } catch (err) {
    crashlytics().recordError(err);
    console.log("syncAllModules error", err);
  }
}

export function getMyChannels() {
  const { data } = store.getState().persist;
  return {
    channels: data.myChannels,
    modules: selectors.enabledModules(store.getState()),
  };
}

export function getActivePages(pages, variables) {
  var candidatePages = { dominant: [], dependent: [] };
  pages?.forEach(function (page) {
    let calculated = calculateFormula(page.positiveTrigger, variables, {
      returnBool: true,
    });
    let dependencies = page.variableDependency.split("|");
    if (calculated && checkDependencies(variables, dependencies)) {
      switch (page.dominance) {
        case "DEPENDENT":
          candidatePages["dependent"].push(page);
          break;
        case "EXCLUSIVE":
          var singleCandidatePages = { dominant: [], dependent: [] };
          singleCandidatePages["dominant"].push(page);
          return singleCandidatePages;
        case "DOMINANT":
        case "":
        default:
          candidatePages["dominant"].push(page);
          break;
      }
    }
  });
  return candidatePages;
}

export function extractCalculatorsFrom(list) {
  if (!list) list = [];
  var allCalculators = {};
  list.forEach(function (id) {
    const calculator = getCalculatorFor(id);
    if (calculator != null) {
      allCalculators[id] = calculator;
    }
  });

  return allCalculators;
}

export function getCalculatorFor(calculatorId) {
  let calculator = null;
  const { calculators } = store.getState().persist.data;
  Object.keys(calculators).forEach(function (key) {
    try {
      if (calculators[key].code === calculatorId) {
        calculator = calculators[key];
      }
    } catch (error) {
      console.log(`getCalculatorFor could not get "${key}"`);
      crashlytics().recordError(error);
    }
  });
  return calculator;
}

export function getCalculator2For(calculatorId) {
  if (!calculatorId) return undefined;
  const { calculators2 } = store.getState().persist.data;
  return calculators2?.[calculatorId];
}

export function setActiveCalculator(code) {
  const { data } = store.getState().persist;
  const activeCalculator = data.calculators2[code];
  store.dispatch({
    type: "SET_ACTIVE_CALCULATOR",
    activeCalculator: activeCalculator,
  });

  if (activeCalculator) {
    return true;
  } else {
    return false;
  }
}

export function getCalculatorOutputMapping(moduleId, calculatorId) {
  if (!moduleId || !calculatorId) return null;
  const { modules } = store.getState().persist.data;
  return modules[moduleId]?.calcOutputMap?.[calculatorId];
}
export function getActiveModule() {
  return data.activeModule;
}
export function getActiveCalculator() {
  const { data } = store.getState().persist;
  return data.activeCalculator;
}
export function getActiveCalculators() {
  return data.activeCalculator;
}

export function getInfoFor(reusableId) {
  return data?.activeModule?.contents?.reusables.find(
    ({ id }) => id === reusableId
  );
}

export function getInfoForCalculator(reusableId, calculator) {
  return calculator.reusables.find(({ id }) => id === reusableId);
}
export function getInfoForCalculatorV2(reusableId) {
  return store
    .getState()
    .persist.data.activeCalculator?.contents?.reusables?.find(
      ({ id }) => id === reusableId
    );
}
export function buildReferenceArray(reference) {
  if (reference instanceof Array) {
    return reference;
  }

  try {
    const references = reference.split(",").map(function (item) {
      return parseInt(item, 10);
    });
  } catch (e) {
    crashlytics().recordError(e);
    return [];
  }
}

export function getReferences(key) {
  const referenceArray = buildReferenceArray(key);
  return referenceArray
    .filter((key) => isValid(data?.activeModule?.contents?.references[key - 1]))
    .map(function (item) {
      return data?.activeModule?.contents?.references[item - 1];
    });
}

function isNormalInteger(str) {
  return /^\+?(0|[1-9]\d*)$/.test(str);
}

export function getReference(key, isCalc = false) {
  if (isNormalInteger(key) || Number.isInteger(key)) {
    try {
      return data?.activeModule?.contents?.references[key - 1];
    } catch (e) {
      crashlytics().recordError(e);
      return {
        url: "www.google.com",
        source: "Placeholder Reference / Please Update",
      };
    }
  } else {
    return isCalc
      ? store
          .getState()
          .persist.data?.activeCalculator?.contents?.references.find(
            ({ id }) => id === key
          )
      : store
          .getState()
          .persist.data?.activeModule?.contents?.references.find(
            ({ id }) => id === key
          );
  }
}

export function getModuleTitle(name) {
  const tempModule = store.getState().persist.data.modules[name];
  if (tempModule) {
    return null;
  } else {
    return tempModule.title;
  }
}

export function setActiveModule(name) {
  const persistStore = store.getState().persist;
  data.activeModule = persistStore.data.modules[name];
  const activeModule = persistStore.data.modules[name];
  store.dispatch({
    type: "SET_ACTIVE_MODULE",
    activeModule,
  });
  if (data.activeModule) {
    return true;
  } else {
    return false;
  }
}

export function resetActiveModule() {
  data.activeModule = null;
}

export function setCustomNumerics(customNumerics) {
  let numerics = { ...store.getState().persist.data.numerics };
  let updateNumerics = false;
  Object.values(customNumerics).forEach((customNumeric) => {
    numerics[customNumeric.id] = customNumeric;
    updateNumerics = true;
  });
  if (updateNumerics) {
    store.dispatch({
      type: "SET_DATA",
      dataKey: "numerics",
      data: numerics,
    });
  }
}

export function getDeeplinkModule() {
  let deeplink = getDeeplink();
  return deeplink.queryParams && deeplink.queryParams.targetModule;
}

export function getDeeplinkVariables() {
  let deeplink = getDeeplink();
  if (
    deeplink.queryParams &&
    deeplink.queryParams.data &&
    deeplink.queryParams.targetOpened === data.activeModule.code
  ) {
    return deeplink.queryParams.data;
  }
  return null;
}

export async function addTestModule(module) {
  let currAllChannels = store.getState().persist.channels.allChannels;

  store.dispatch({
    type: "SET_CHANNELS",
    channelName: "allChannels",
    data: {
      ...currAllChannels,
      test: {
        ...currAllChannels["test"],
        whiteList: [...currAllChannels["test"].whiteList, module.code],
      },
    },
  });

  const currTestChannel = store.getState().persist.channels.allChannels["test"];
  AsyncStorage.setItem("test_channel_local", JSON.stringify(currTestChannel));

  await syncFollowingChannels();
}

export function getParamsAsObject(query) {
  query = query.substring(query.indexOf("?") + 1);

  var re = /([^&=]+)=?([^&]*)/g;
  var decodeRE = /\+/g;

  var decode = function (str) {
    return decodeURIComponent(str.replace(decodeRE, " "));
  };

  var params = {},
    e;
  while ((e = re.exec(query))) {
    var k = decode(e[1]),
      v = decode(e[2]);
    if (k.substring(k.length - 2) === "[]") {
      k = k.substring(0, k.length - 2);
      (params[k] || (params[k] = [])).push(v);
    } else params[k] = v;
  }

  var assign = function (obj, keyPath, value) {
    var lastKeyIndex = keyPath.length - 1;
    for (var i = 0; i < lastKeyIndex; ++i) {
      var key = keyPath[i];
      if (!(key in obj)) obj[key] = {};
      obj = obj[key];
    }
    obj[keyPath[lastKeyIndex]] = value;
  };

  for (var prop in params) {
    var structure = prop.split("[");
    if (structure.length > 1) {
      var levels = [];
      structure.forEach(function (item, i) {
        var key = item.replace(/[?[\]\\ ]/g, "");
        levels.push(key);
      });
      assign(params, levels, params[prop]);
      delete params[prop];
    }
  }
  return params;
}

export async function deepLinkCallback(url) {
  if (Linking === undefined) return;
  let { path, queryParams } = Linking.parse(url);
  if (path === "") {
    if (url.includes("/cds")) {
      path = deeplinkPaths.CDS;
    } else if (url.includes("/enterprise")) {
      path = deeplinkPaths.ENTERPRISE;
    } else if (url.includes("/subscribeChannel")) {
      path = deeplinkPaths.SUBSCRIBE_CHANNEL;
    }
  }
  if (!isValid(path) || !isValid(queryParams)) return;
  if (path !== "" || Object.keys(queryParams).length > 0) {
    console.log({ deeplink: url, path, queryParams });
    let deeplink = {};
    deeplink.path = path;
    deeplink.queryParams = queryParams;
    deeplink.url = url; //store url for heartFlow case

    // Handle different deeplink "paths" to methods
    if (path === deeplinkPaths.TEST_MODULE) {
      const target = queryParams.code;
      const currModules = (await firebaseGetRef("modules/")).val();

      const targetModule = currModules[target];

      addTestModule(targetModule);
      // Analytics.track(Analytics.events.OPEN_DEEPLINK, { path: path });
    } else if (path === deeplinkPaths.CDS) {
      const paramsAsObject = getParamsAsObject(
        decodeURIComponent(decodeURIComponent(url))
      );
      deeplink.queryParams.data = _.toArray(paramsAsObject.data);
      deeplink.queryParams.subscriptions = _.toArray(
        paramsAsObject.subscriptions
      );
      // Analytics.track(Analytics.events.OPEN_DEEPLINK, { path: path });
    } else if (path === deeplinkPaths.ENTERPRISE) {
      deeplink.queryParams.subscriptions = _.toArray(
        getParamsAsObject(decodeURIComponent(decodeURIComponent(url)))
          .subscriptions
      );
      //Analytics.track(Analytics.events.OPEN_DEEPLINK, { path: path });
    }
    Analytics.track(Analytics.events.OPEN_DEEPLINK, {
      path: path,
      ...queryParams,
    });
    setDeeplink(deeplink);
  }
}

export function getDeeplink() {
  return store.getState().general.deeplink;
}

export function setDeeplink(updatedDeeplink) {
  updatedDeeplink.updateTimestamp = Date.now();
  store.dispatch({
    type: "SET_DEEPLINK",
    data: updatedDeeplink,
  });
}

//Moved to formula.js
/* export function calculateFormula(
  formula,
  variables,
  { returnBool = false, shouldAllVariablesAvailable = false } = {}
) {
  this.variables = variables;
  formula = formula && formula.replace(" or ", " || ");
  if (formula === "") return returnBool ? true : null;
  if (shouldAllVariablesAvailable === true) {
    const variableNames = getAllAssociatedVariableNames(formula);
    if (areVariablesAvailable(variables, variableNames) === false) {
      return null;
    }
  }

  const exchangedVars =
    formula &&
    formula.replace(/\[([^\]]*)\]/g, (match, p1) => {
      if (variables[p1] == null) return `variables.${p1}`;
      return `Number(variables.${p1})`;
    });
  // eslint-disable-next-line no-unused-vars
  const nil = null;
  try {
    return eval(exchangedVars);
  } catch (e) {
    crashlytics().recordError(e);
    console.log("calculateFormula error", e);
    return returnBool ? false : null;
  }
} */

export function checkDependencies(variables, dependencies) {
  for (var i = 0; i < dependencies.length; i++) {
    var singleVarName = dependencies[i];
    if (singleVarName.trim() === "") {
      continue;
    }
    if (
      variables[singleVarName] === undefined ||
      isNaN(variables[singleVarName])
    ) {
      return false;
    }
  }
  return true;
}

export function convertToObjects(text, defaultPattern, regexPatterns) {
  let returnedParts = [];
  let splitNextPattern = (stringToMatch, defaultReplaceWith) => {
    let matchedPatterns = regexPatterns
      .map((regexPattern) => {
        let match = regexPattern.pattern.exec(stringToMatch);
        if (match == null) return null;
        return {
          matchedTo: match[0],
          capturedPart: match[1],
          index: match.index,
          replaceWith: regexPattern.replaceWith,
        };
      })
      .filter((matchedPattern) => matchedPattern != null)
      .sort((a, b) => a.index - b.index);
    if (matchedPatterns.length === 0) {
      returnedParts.push(
        defaultReplaceWith(stringToMatch, returnedParts.length)
      );
      return;
    }
    let firstPart = stringToMatch.substring(0, matchedPatterns[0].index);
    let secondPart = stringToMatch.substring(
      matchedPatterns[0].index + matchedPatterns[0].matchedTo.length
    );
    returnedParts.push(defaultReplaceWith(firstPart, returnedParts.length));
    let replacedMatchedPattern = matchedPatterns[0].replaceWith(
      matchedPatterns[0].capturedPart,
      returnedParts.length
    );
    returnedParts.push(replacedMatchedPattern);
    splitNextPattern(secondPart, defaultReplaceWith);
  };
  splitNextPattern(text, defaultPattern);
  if (returnedParts.length === 0) {
    return defaultPattern(text, 1);
  }
  return returnedParts;
}

/*
export function convertToObjects(text, defaultPattern, regexPatterns) {
  let returnedParts = [];
  let splitNextPattern = (stringToMatch, defaultReplaceWith) => {
    let matchedPatterns = regexPatterns
      .map(regexPattern => {
        let match = regexPattern.pattern.exec(stringToMatch);
        if (match == null) return null;
        return {
          matchedTo: match[0],
          capturedPart: match[1],
          index: match.index,
          replaceWith: regexPattern.replaceWith,
        };
      })
      .filter(matchedPattern => matchedPattern != null)
      .sort((a, b) => a.index - b.index);
    if (matchedPatterns.length === 0) {
      returnedParts.push(defaultReplaceWith(stringToMatch, returnedParts.length));
      return;
    }
    let firstPart = stringToMatch.substring(0, matchedPatterns[0].index);
    let secondPart = stringToMatch.substring(
      matchedPatterns[0].index + matchedPatterns[0].matchedTo.length
    );
    returnedParts.push(defaultReplaceWith(firstPart, returnedParts.length));
    let replacedMatchedPattern = matchedPatterns[0].replaceWith(
      matchedPatterns[0].capturedPart,
      returnedParts.length
    );
    returnedParts.push(replacedMatchedPattern);
    splitNextPattern(secondPart, defaultReplaceWith);
  };
  splitNextPattern(text + "#___", defaultPattern);

  return returnedParts;
}*/

export function getVariableDescription(variable) {
  return getActiveModule()?.contents.variableDescription.find(
    ({ id }) => id === variable
  );
}

export function getAllInputReviewItems(page) {
  const declaredInputReviews = isValid(page.inputReviews)
    ? page.inputReviews
    : [];
  var implicitInputReviews = [];
  const matches = page.positiveTrigger.match(/\[([^\]]*)\]/g);
  if (matches === null) {
    return declaredInputReviews;
  }
  for (var i = 0; i < matches.length; i++) {
    var str = matches[i];
    implicitInputReviews.push(str.substring(1, str.length - 1));
  }

  // Disabled for now
  implicitInputReviews = [];

  const allInputReviewItems = [
    ...new Set(declaredInputReviews.concat(implicitInputReviews)),
  ];
  return allInputReviewItems;
}

export function getSegmentedItemByTarget(targetID) {
  const dashboardItems = getActiveModule()?.contents.dashboard;
}

export function getFormulaDescription(targetID) {
  //getActiveModule()?.contents.formulae.filter( (formula) => formula.id === targetID ).
  return null;
}

export function getVariableNameByKey(key, variables) {
  if (key.includes(POSTFIX_ASSIGNED)) {
    key = key.split(POSTFIX_ASSIGNED).shift();
  }
  if (key.includes(POSTFIX_COUNT)) {
    key = key.split(POSTFIX_COUNT).shift();
    var stringWithComma = variables[key + POSTFIX_VALUE].toString();
    stringWithComma = stringWithComma.replace(/,/g, "+");
    return stringWithComma;
  }
  if (key.includes(POSTFIX_SUBMITTED)) {
    key = key.split(POSTFIX_SUBMITTED).shift();
    return variables[key + "__title"] + " Submitted";
  }
  var isNumeric = getTitle(key);
  var isVariable = getVariableDescription(key);
  if (isNumeric !== "") return isNumeric;
  else if (typeof isVariable === "object") return isVariable.name;
  else {
    if (getActiveModule()?.contents.formulae) {
      const formula = getActiveModule()?.contents.formulae.find(
        ({ id }) => id === key
      );
      if (formula) {
        return formula.title;
      }
    }
  }
  return null;
}

export function getFormulaToCalculate(formulaDict, variables) {
  let formulaToCalculate = formulaDict.formula;
  if (formulaDict.isConditional && formulaDict.conditionalFormulas) {
    formulaDict.conditionalFormulas.forEach((conditionalFormulae) => {
      if (
        variables &&
        calculateFormula(conditionalFormulae.condition, variables)
      ) {
        formulaToCalculate = conditionalFormulae.formula;
      }
    });
    if (!isValid(formulaToCalculate)) {
      formulaToCalculate = formulaDict.conditionalFormulas.find(
        (conditionalFormulae) => conditionalFormulae.isDefault
      ).formula;
    }
  }
  return formulaToCalculate;
}

// Note: needs refactoring
export function getAllInputDescriptions(page, variables) {
  var descriptions = {};
  const itemKeys = getAllInputReviewItems(page);
  // add/push variables in the input reviews that are missing
  // if (itemKeys) {
  //   for (const property in variables) {
  //     if (!itemKeys.find((val) => val === property)) {
  //       // alert(property);
  //       if (property.includes('__submitted')) {
  //         continue;
  //       } else if (property.includes('__count')) {
  //         continue;
  //       } else if (property.includes('_code_')) {
  //         if (variables[property] === 0) {
  //           continue;
  //         } else {
  //           itemKeys.push(property);
  //         }
  //       } else {
  //         itemKeys.push(property);
  //       }
  //     }
  //   }
  // }
  // itemKeys.sort();
  // end of add/push variables in the input reviews that are missing
  for (var i = 0; i < itemKeys.length; i++) {
    var key = itemKeys[i];
    const registeredDescription = getVariableDescription(key);

    var description = "Not Assigned";
    var title = "Untitled";
    var calculationTitle = null;
    var formulaDescription = null;
    var newTextJson = null;
    var calculationDescription = null;
    var introduction = null;
    var formulaHigh = null;
    var formulaLow = null;

    // Variable description does not describe the variable
    if (registeredDescription == null) {
      // Possibly numeric variables defined in predetermined/preset
      if (getTitle(key) !== "") {
        title = getTitle(key);
        const value = parseFloat(variables[key]);
        const unit = getUnit(key);
        var numericDescribed = Number.isInteger(value)
          ? value.toString()
          : value.toFixed(1);
        description =
          numericDescribed + " " + (unit.toLowerCase() !== "ph" ? unit : "");
      } else {
        // The variable is not described anywhere.
        if (getActiveModule()?.contents.formulae) {
          const formula = getActiveModule()?.contents.formulae.find(
            ({ id }) => id === key
          );

          if (formula && formula.formula && variables[key] !== null) {
            title = formula.title;
            formulaHigh = formula.high ? formula.high + "" : null;
            formulaLow = formula.low ? formula.low + "" : null;
            introduction = formula.introduction;
            const value = parseFloat(variables[key]);
            var numericDescribed = Number.isInteger(value)
              ? value.toString()
              : value.toFixed(1);
            newTextJson = formula?.newTextJson;
            description =
              numericDescribed + " " + (formula.unit ? formula.unit : "");
            calculationTitle = formula.title;
            formulaDescription = formula.formula.replace(
              /\[([^\]]*)\]/g,
              (match, p1) => {
                return "[" + getVariableNameByKey(p1, variables) + "]";
              }
            );
            calculationDescription = formula.formula.replace(
              /\[([^\]]*)\]/g,
              (match, p1) => {
                return "[" + parseFloat(variables[p1]).toFixed(1) + "]";
              }
            );
            calculationDescription = calculationDescription.replace("/", "÷");
            calculationDescription = calculationDescription.replace("*", "×");
            calculationDescription = calculationDescription.replace("**", "^");

            calculationDescription +=
              " = " + parseFloat(variables[key]).toFixed(1);
          } else {
            continue;
          }
        } else {
          continue;
        }
      }
    } else {
      // Variable description describes the variable
      title = registeredDescription.name;
      const assignedLabels = registeredDescription.value.split("|");
      var description = "Undefined";

      if (!isNaN(variables[key])) {
        if (Number.isInteger(variables[key]) && variables[key] <= 10) {
          // Mostly segmented buttons
          description = assignedLabels[variables[key]];
        } else {
          // Float/Double (e.g., lab values)
          description = variables[key]?.toFixed(2)?.toString();
        }
      } else {
        continue;
      }
      description = assignedLabels[variables[key]];
    }
    descriptions[key] = {
      title,
      description,
      newTextJson,
      formulaDescription,
      calculationDescription,
      calculationTitle,
      introduction,
      formulaHigh,
      formulaLow,
    };
  }
  return descriptions;
}

export function numericToString(numericItem) {
  if (typeof numericItem === "string") {
    return numericItem;
  }
  if (Number.isInteger(numericItem)) {
    return numericItem.toString();
  }
  if (Number.isNaN(numericItem)) {
    return numericItem;
  } else {
    return numericItem.toFixed(2);
  }
}

export function isValid(item, shouldBeNumeric = false) {
  if (item === null || item === undefined) {
    return false;
  }
  if (item === "" || item === "none") {
    return false;
  }

  if (item === []) {
    return false;
  }
  if (item instanceof String) {
    if (item.trim() === "") {
      return false;
    } else {
      if (shouldBeNumeric === false) {
        return true;
      } else {
        if (isNaN(item)) {
          // Not a number
          return false;
        } else {
          // a number
          return true;
        }
      }
    }
  } else if (item instanceof Array || Array.isArray(item) === true) {
    if (item.length > 1) {
      return true;
    } else if (item.length === 1) {
      if (typeof item[0] === "string") {
        return item[0].trim() !== "";
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  if (typeof item === "object") {
    // Dictionary
    return Object.keys(item).length > 0;
  }

  return true;
}
