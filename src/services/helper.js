import Layout from "../constants/Layout";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { groupPanelType, regex, sortTypes } from "../constants/strings";
import { getKeyFromId } from "../models/units";
import _ from "lodash";
import {
  getFormulaDescriptionDict,
  getReferenceIndexByCode,
} from "../models/moduleExports";
import { roundingModes } from "../constants/strings";
import store from "../store";
import { firebase } from "@react-native-firebase/database";
import moment from "moment";

const screenWidth = 375;
const screenHeight = 812;

export function getHeight(heightPixel) {
  //console.log("Constants.platform.userInterfaceIdiom", Constants.platform[Platform.OS].userInterfaceIdiom);
  if (Constants.platform[Platform.OS].userInterfaceIdiom === "tablet") {
    return heightPixel + 2;
  }
  let calculatedHeight = heightPixel / screenWidth;
  return parseFloat((Layout.window.width * calculatedHeight).toFixed(4));
}

export function getWidth(widthPixel) {
  let calculatedWidth = widthPixel / screenWidth;
  return parseFloat((Layout.window.width * calculatedWidth).toFixed(4));
}

export function convertToLowerCase(value) {
  return value.toLowerCase();
}

export function covertToString(value) {
  return value ? value.toString() : "";
}

export function updateDraftJsForMentions(
  draftJSON,
  variables,
  getVar,
  isNewJson,
  isCalc
) {
  let updatedDraftJSON = _.cloneDeep(draftJSON);

  updatedDraftJSON.blocks.forEach((block, index) => {
    let offsetDiff = 0,
      phoneNoCounter = 0,
      isPhoneNumber = 0,
      linksCounter = 0;
    const inlineStyleRanges = block.inlineStyleRanges;
    // add custom type for the unorderlisting
    if (block.type === "unordered-list-item") {
      block.type = block.type + "-custom";
    }
    // add custom type for the orderlisting
    if (block.type === "ordered-list-item") {
      // set block zero index key for managing unorder list for each block
      block.zeroIndexKey = updatedDraftJSON.blocks[0].key;
      if (index != 0) {
        // set last block type if other then unorder need to reset the array
        block.lastIndexType = updatedDraftJSON.blocks[index - 1].type;
      }

      block.type = block.type + "-custom";
    }
    //Updating entityRanges
    block.entityRanges &&
      block.entityRanges
        .sort((firstItem, secondItem) => firstItem.offset - secondItem.offset)
        .forEach((entityRange, rangeIndex) => {
          if (entityRange.key === null) return;

          const entity = updatedDraftJSON.entityMap[entityRange.key];

          if (entity.type === "IMAGE") {
            block.data = entity.data;
            block.data.type = entity.type;
          }

          if (entity.type === "#mention") {
            const mention = entity.data.mention;
            // on adding icon of phone number in text take 2 spaces if more than one icon will take number of spaces multiple by phonenumber
            isPhoneNumber = isNewJson && mention.code === "phoneNumber" ? 2 : 0;
            phoneNoCounter =
              mention.code === "phoneNumber"
                ? phoneNoCounter + 1
                : phoneNoCounter;
            block.entityRanges[rangeIndex].offset =
              entityRange.offset + phoneNoCounter;
            block.entityRanges[rangeIndex].offset =
              entityRange.offset + linksCounter;

            const mentionCode = isNewJson ? mention.code : mention.name;
            const mentionName = isNewJson ? mention.name : mention.code;
            entity.data.url = mentionCode;
            if (
              mentionCode.match(regex.NUMERIC) ||
              mentionCode.match(regex.CUSTOM_NUMERIC)
            ) {
              let id = mentionCode.match(regex.CUSTOM_NUMERIC)
                ? mentionCode
                : getKeyFromId(mentionCode);
              let variable = getVar(id);
              variable = variable ? variable : "";
              // handle decimal
              const formattedText = variable
                ? getDecimalString(
                    mention.decimalPlaces,
                    mention.decimalRounding,
                    variable
                  ) + ""
                : "";
              block.text = block.text.replace(mention.name, formattedText);

              block.entityRanges[rangeIndex].offset =
                entityRange.offset - offsetDiff;
              offsetDiff +=
                block.entityRanges[rangeIndex].length - variable.length;

              inlineStyleRanges &&
                inlineStyleRanges.forEach(
                  (inlineStyleRange, styleRangeIndex) => {
                    if (inlineStyleRange.offset >= entityRange.offset) {
                      inlineStyleRanges[styleRangeIndex].offset =
                        inlineStyleRange.offset - offsetDiff;
                    }
                  }
                );

              block.entityRanges[rangeIndex].length = 0;
            } else if (mentionCode.match(regex.REFERENCE)) {
              const [refIndex, reference] = getReferenceIndexByCode(
                mentionCode,
                isCalc
              );
              const refrenceText = `[${
                reference?.isShortenedSourceEnabled
                  ? reference.shortened_source
                  : refIndex
              }]`;
              block.entityRanges[rangeIndex].offset =
                entityRange.offset - offsetDiff + phoneNoCounter;
              offsetDiff +=
                block.entityRanges[rangeIndex].length - refrenceText.length;

              inlineStyleRanges &&
                inlineStyleRanges.forEach(
                  (inlineStyleRange, styleRangeIndex) => {
                    if (inlineStyleRange.offset >= entityRange.offset) {
                      inlineStyleRanges[styleRangeIndex].offset =
                        inlineStyleRange.offset - offsetDiff;
                    }
                  }
                );

              block.text = block.text.replace(mention.name, refrenceText);
              entityRange.length = refrenceText.length;
            } else if (mentionCode.match(regex.FORMULA)) {
              const variable = getVar(mentionCode);
              // handle decimal
              const formulaText = variable
                ? getDecimalString(
                    mention.decimalPlaces,
                    mention.decimalRounding,
                    variable
                  ) + ""
                : "";

              block.entityRanges[rangeIndex].offset =
                entityRange.offset - offsetDiff + phoneNoCounter;
              offsetDiff +=
                block.entityRanges[rangeIndex].length - formulaText.length;

              inlineStyleRanges &&
                inlineStyleRanges.forEach(
                  (inlineStyleRange, styleRangeIndex) => {
                    if (inlineStyleRange.offset >= entityRange.offset) {
                      inlineStyleRanges[styleRangeIndex].offset =
                        inlineStyleRange.offset - offsetDiff;
                    }
                  }
                );

              //block.text = block.text.replace(mention.name, formulaText);
              // block.text =
              //   block.text.substring(0, entityRange.offset) + formulaText;

              // block.text =
              //   block.text +
              //   block.text.substring(entityRange.offset + formulaText.length);

              const textBeforeFormula =
                block.text.substring(0, entityRange.offset) + formulaText;
              const textAfterFormula = block.text.substring(
                entityRange.offset + entityRange.length
              );
              block.text = textBeforeFormula + textAfterFormula;

              entityRange.length = formulaText.length;
            } else if (
              mentionCode.match(regex.VARIABLE) ||
              mentionCode.match(regex.MULTI_COUNT)
            ) {
              let variable = getVar(
                mentionCode.match(regex.MULTI_COUNT)
                  ? mentionCode
                  : mentionCode + "__value"
              );
              variable = variable || variable == 0 ? variable : "";
              //const formulaText = variable ? parseFloat(variable).toFixed(1) : "";

              block.entityRanges[rangeIndex].offset =
                entityRange.offset - offsetDiff;
              offsetDiff +=
                block.entityRanges[rangeIndex].length - variable.length;

              inlineStyleRanges &&
                inlineStyleRanges.forEach(
                  (inlineStyleRange, styleRangeIndex) => {
                    if (inlineStyleRange.offset >= entityRange.offset) {
                      inlineStyleRanges[styleRangeIndex].offset =
                        inlineStyleRange.offset - offsetDiff;
                    }
                  }
                );

              block.text = block.text.replace(mention.name, variable);
              // multi variable item1, item2 etc displayed simple instead as mentions
              entityRange.length =
                entity.data.mention.type === "multi_variable" ||
                entity.data.mention.type === "choice_variable"
                  ? 0
                  : variable.length;
              //Conditional Text
            } else if (mentionCode.match(regex.CONDITIONAL_TEXT)) {
              if (
                block.type === "unordered-list-item-custom" ||
                block.type === "ordered-list-item-custom"
              ) {
                block.isConditional = true;
              } else block.type = "conditional_text";
            } else {
              const isPhone = mentionCode === "phoneNumber";
              block.type != "conditional_text"
                ? (block.entityRanges[rangeIndex].offset =
                    entityRange.offset - offsetDiff)
                : (block.entityRanges[rangeIndex].offset =
                    entityRange.offset - offsetDiff);

              offsetDiff +=
                block.entityRanges[rangeIndex].length - mentionName.length;
              block.text = block.text.replace(mentionCode, mentionName);
              entityRange.length = mentionName.length;
              inlineStyleRanges &&
                inlineStyleRanges.forEach(
                  (inlineStyleRange, styleRangeIndex) => {
                    if (inlineStyleRange.offset >= entityRange.offset) {
                      inlineStyleRanges[styleRangeIndex].offset =
                        inlineStyleRange.offset -
                        offsetDiff +
                        (isPhone ? 1 : 0);
                    }
                  }
                );

              if (isPhone) {
                if (isNewJson) {
                  block.text = block.text.replace(
                    mentionName,
                    String.fromCodePoint(0x1f4de) + mentionName
                  );
                }
                entity.data.url = `tel:${mentionName}`;
              } else {
                entity.data.url = mentionCode;
              }
            }
          }
        });

    block.entityRanges = block.entityRanges.filter(
      (entityRange) => entityRange.length > 0
    );

    // for showing blank line
    if (block.text === "") {
      block.text = " ";
    }

    //Updating inlineStyleRanges
    block.inlineStyleRanges &&
      block.inlineStyleRanges.forEach((inlineStyleRange, styleIndex) => {
        if (inlineStyleRange.style === "HEADER") {
          inlineStyleRange.style = "header-three";
        }
      });
  });
  return updatedDraftJSON;
}

// Handel decimal conditions
export function getDecimalString(decimalPlaces, decimalRounding, num) {
  // check if decimalPlaces or decimalRounding is NAN or undefined
  if (
    typeof decimalPlaces === "undefined" ||
    isNaN(decimalPlaces) ||
    typeof decimalRounding === "undefined"
  ) {
    return num;
  }

  if (decimalRounding === roundingModes.CEIL) {
    return (
      Math.ceil(num * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)
    );
  } else if (decimalRounding === roundingModes.FLOOR) {
    return (
      Math.floor(num * Math.pow(10, decimalPlaces)) /
      Math.pow(10, decimalPlaces)
    );
  } else if (decimalRounding === roundingModes.ROUND) {
    return (
      Math.round(num * Math.pow(10, decimalPlaces)) /
      Math.pow(10, decimalPlaces)
    );
  }
}

// Validates the format of an email address
// Returns the email address if it is valid, or null if it is not
export const validateEmail = (email) => {
  // Convert the email to lower case and use the optimized regex to check if it is in a valid format
  return String(email)
    .toLowerCase()
    .match(
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    );
};

// Returns a new database instance from the firebase library
// using the database URL stored in the global store object
export const getDatabaseInstance = () => {
  // Retrieve the database URL from the global store object
  const databaseUrl = store.getState().persist.dbURL;

  // Create and return a new database instance using the firebase library
  return firebase.app().database(databaseUrl);
};

export const getFormattedDate = (date) => {
  let formattedDate = "";
  if (moment(new Date()).diff(moment(date), "months") < 1) {
    formattedDate += moment(date).fromNow();
  } else {
    formattedDate += "on " + moment(date).format("MMM DD, yyyy");
  }
  return formattedDate;
};

/**
 * Sorts an array of items based on the given sort type.
 * @param {Array} array - The array of items to sort.
 * @param {string} sortType - The sort type to use. Possible values are: "Newest", "Last Viewed", and "Alphabetically".
 * @return {Array} The sorted array.
 */
export function sortArray(array, sortType = "Alphabetically") {
  switch (sortType) {
    case sortTypes.NEWEST:
      // Sort the array by serverTimestamp in descending order.
      return _.orderBy(array, ["serverTimestamp"], ["desc"]);
    case sortTypes.LAST_VIEWED:
      // Sort the array by lastViewedTimeStamp in descending order.
      return _.orderBy(array, ["lastViewedTimeStamp"], ["desc"]);
    case sortTypes.ALPHABETICAL:
    default:
      // Sort the filtered array by title in ascending order, case-insensitive.
      return _.orderBy(array, [(item) => item.title.toLowerCase()]);
  }
}
export function sortFavorite(array) {
  return _.orderBy(array, ["favorite"], ["desc"]);
}

export function checkInputType(cards) {
  const cardsType = cards.map((panel) => {
    switch (panel.type) {
      case "SEGMENTED":
        return groupPanelType.NO_SUBMIT_INPUT;
      case "MULTI":
      case "PREDETERMINED":
        return groupPanelType.INPUT;
      default:
        return groupPanelType.DESC;
    }
  });

  if (cardsType.includes(groupPanelType.INPUT)) {
    return groupPanelType.INPUT;
  } else if (
    !cardsType.includes(groupPanelType.INPUT) &&
    cardsType.includes(groupPanelType.NO_SUBMIT_INPUT)
  ) {
    return groupPanelType.NO_SUBMIT_INPUT;
  } else {
    return groupPanelType.DESC;
  }
}

export const isAndroid = Platform.OS === "android";
export const deviceWidth = Layout.window.width;
export const deviceHeight = Layout.window.height;
