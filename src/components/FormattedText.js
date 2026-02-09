import React from "react";
import { StyleSheet, Linking, View, Text, Platform } from "react-native";
import {
  getInfoFor,
  isValid,
  convertToObjects,
  getReference,
  getReferences,
  getFormulaDescriptionDict,
} from "../models/modules";
import * as Analytics from "../services/Analytics";
import { getHeight, getWidth } from "../services/helper";
import Colors from "../constants/Colors";
import { fontFamily } from "../constants/strings";

export default ({
  text,
  _this,
  variables,
  calloutName,
  calloutTitle,
  calloutText,
  calloutReferences,
  onTextLayout,
  height,
  isIndicationCard,
}) => {
  //let textHeight = expandable && !expanded ? 3 * 26 : null;
  //console.log({ lines, expanded, expandable });
  return (
    <View>
      <Text
        onTextLayout={(event) => {
          if (onTextLayout) {
            onTextLayout(event);
          }
        }}
        style={[
          styles.defaultStyle,
          {
            height,
          },
        ]}
      >
        {convertToObjects(
          text,
          (capturedPart, key) => {
            return (
              <Text
                key={key}
                style={[
                  isIndicationCard
                    ? styles.introductionTextStyle
                    : styles.defaultStyle,
                  {
                    color: isIndicationCard ? "#ADADAD" : "#515151",
                  },
                ]}
              >
                {capturedPart}
              </Text>
            );
          },
          [
            {
              pattern: /\[\[([^\]]*)\]\]/,
              replaceWith: (capturedPart, key) => {
                const info = getInfoFor(capturedPart);
                if (!info) {
                  //console.log({ noInfoFor: capturedPart });
                  return;
                }
                if (info.type === "COMMENT") {
                  return (
                    <Text
                      onPress={() => {
                        _this.interactWithContent(
                          `page tool link: ${info.toolLink}`,
                          false
                        );
                        Analytics.track(
                          Analytics.events.OPEN_INFORMATION_MODAL,
                          { info: info.title }
                        );
                        _this.setState({ info });
                      }}
                      key={key}
                      style={[
                        styles.defaultStyle,
                        {
                          color: Colors.primaryColor,
                          textDecorationLine: "underline",
                        },
                      ]}
                    >
                      [Read "{info && info.value}"]
                    </Text>
                  );
                } else if (info.type === "HYPERLINK") {
                  return (
                    <Text
                      onPress={() => {
                        if (isValid(info.toolLink)) {
                          _this.interactWithContent(
                            `page tool link: ${info.toolLink}`
                          );
                          Linking.openURL(info.toolLink);
                        }
                      }}
                      key={key}
                      style={[
                        styles.defaultStyle,
                        {
                          color: Colors.primaryColor,
                          textDecorationLine: "underline",
                        },
                      ]}
                    >
                      {info && info.value}
                    </Text>
                  );
                } else {
                  return (
                    <Text
                      onPress={() => {
                        if (isValid(info.calloutText)) {
                          _this.interactWithContent(
                            `page callout text: ${info.calloutTitle}`,
                            false
                          );
                          Analytics.track(
                            Analytics.events.OPEN_INFORMATION_MODAL,
                            { info: info.title }
                          );
                          _this.setState({ info });
                        } else if (isValid(info.toolLink)) {
                          _this.interactWithContent(
                            `page tool link: ${info.toolLink}`
                          );
                          Linking.openURL(info.toolLink);
                        }
                      }}
                      key={key}
                      style={[
                        styles.defaultStyle,
                        {
                          color: Colors.primaryColor,
                          textDecorationLine: "underline",
                        },
                      ]}
                    >
                      {info && info.value}
                    </Text>
                  );
                }
              },
            },
            {
              pattern: /#(\w*)/,
              replaceWith: (capturedPart, key) => {
                const variable = _this.getVar(capturedPart);
                if (!variable) {
                  //console.log({ noVariableFor: capturedPart });
                  return;
                }
                const formulaDescriptionDict = getFormulaDescriptionDict(
                  capturedPart,
                  variables
                );
                if (isValid(formulaDescriptionDict)) {
                  return (
                    <Text
                      key={key}
                      style={[
                        styles.defaultStyle,
                        {
                          color: Colors.primaryColor,
                          textDecorationLine: "underline",
                        },
                      ]}
                      onPress={() => {
                        _this.interactWithContent(
                          `page formula description dict: ${formulaDescriptionDict["calculationTitle"]}`,
                          false
                        );
                        Analytics.track(
                          Analytics.events.OPEN_INFORMATION_MODAL,
                          { info: formulaDescriptionDict["calculationTitle"] }
                        );
                        _this.setState({
                          info: {
                            introduction:
                              formulaDescriptionDict["introduction"],
                            title: formulaDescriptionDict["calculationTitle"],
                            calloutText:
                              "Formula:: " +
                              formulaDescriptionDict["formulaDescription"] +
                              "|Calculation:: " +
                              formulaDescriptionDict["calculationDescription"],
                          },
                        });
                      }}
                    >
                      {parseFloat(variable).toFixed(1)}
                    </Text>
                  );
                }
                return (
                  <Text
                    key={key}
                    style={[
                      styles.defaultStyle,
                      {
                        color: "#515151",
                      },
                    ]}
                  >
                    {parseFloat(variable).toFixed(1)}
                  </Text>
                );
              },
            },
            {
              pattern: /\(\(([^)]*)\)\)/,
              replaceWith: (capturedPart, key) => {
                const reference = getReference(capturedPart);
                if (!reference) {
                  //console.log({ noReferenceFor: capturedPart });
                  return;
                }
                var refStr = "?";
                if (Number.isInteger(capturedPart)) {
                  refStr = capturedPart;
                } else if (reference.shortened_source) {
                  refStr = reference.shortened_source;
                } else {
                  refStr = capturedPart;
                }
                return (
                  <Text
                    onPress={() => {
                      _this.interactWithContent(
                        `page reference captured: ${capturedPart}`,
                        false
                      );
                      Analytics.track(Analytics.events.OPEN_REFERENCE_MODAL, {
                        reference: reference.source,
                      });
                      _this.setState({ reference });
                    }}
                    key={key}
                    textDecorationLine={"underline"}
                    style={[
                      styles.defaultStyle,
                      {
                        color: Colors.primaryColor,
                        textDecorationLine: "underline",
                      },
                    ]}
                  >
                    [{refStr}]
                  </Text>
                );
              },
            },
            {
              pattern: /\| ?/,
              replaceWith: (capturedPart, key) => {
                return [
                  <Text style={styles.defaultStyle} key={`1${key}`}>
                    {"\n"}
                  </Text>,
                  <Text
                    key={`2${key}`}
                    style={[
                      styles.defaultStyle,
                      { fontSize: 8, lineHeight: 8 },
                    ]}
                  >
                    {"\n"}
                  </Text>,
                ];
              },
            },
            {
              pattern: /\*\*/,
              replaceWith: (capturedPart, key) => {
                return (
                  <Text
                    key={key}
                    style={[
                      styles.defaultStyle,
                      {
                        color: "#5B5B5B",
                        fontSize: Platform.select({
                          android: getHeight(7),
                          ios: getHeight(13),
                        }),
                      },
                    ]}
                  >
                    &#9679;{" "}
                  </Text>
                );
              },
            },
          ]
        )}
        {calloutName &&
          isValid(calloutName) &&
          isValid(calloutTitle) &&
          isValid(calloutText) && (
            <Text
              style={[
                styles.defaultStyle,
                {
                  color: Colors.primaryColor,
                  textDecorationLine: "underline",
                },
              ]}
              onPress={() => {
                _this.interactWithContent(
                  `page callout: ${calloutTitle}`,
                  false
                );
                Analytics.track(Analytics.events.OPEN_INFORMATION_MODAL, {
                  info: calloutTitle,
                });
                _this.setState({
                  info: {
                    title: calloutTitle,
                    calloutText,
                    calloutReferences: getReferences(calloutReferences),
                  },
                });
              }}
            >
              {" "}
              [Read "{calloutName}"]
            </Text>
          )}
      </Text>
    </View>
  );
};
var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  defaultStyle: {
    fontSize: getHeight(16),
    lineHeight: getHeight(21.6),
    fontFamily: fontFamily.Regular,
    fontWeight: "400",
    color: "#515151",
  },
  introductionTextStyle: {
    fontSize: getHeight(16),
    lineHeight: getHeight(18),
    fontWeight: "400",
    fontFamily: fontFamily.Regular,
    color: "#ADADAD",
  },
});
