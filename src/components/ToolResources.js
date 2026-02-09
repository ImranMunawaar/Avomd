import React, { Component } from "react";
import {
  View,
  ScrollView,
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  Linking,
} from "react-native";
import {
  getInfoFor,
  getCalculatorFor,
  getCalculator2For,
  getInfoForCalculator,
  setActiveCalculator,
  getInfoForCalculatorV2,
} from "../models/modules";
import { globalStyles } from "./GlobalStyles";
import * as Analytics from "../services/Analytics";
import { isValid } from "../models/modules";
import { getHeight, getWidth } from "../services/helper";
import Colors from "../constants/Colors";
import { fontFamily } from "../constants/strings";

const SMART_LINK = "note_generator";

export class ToolResources extends Component {
  renderCalculator2 = (tool, key) => {
    const { classes, interact } = this.props;
    const code = tool?.code;
    const title = tool?.label;
    const calculator = getCalculator2For(code);
    const { onBackFromCalculator } = this.props.parent || {};

    const { navigation, itemKey, variables } = this.props;

    const onClick = () => {
      interact("calculator", calculator?.code || title || "", false);
      Analytics.track(Analytics.events.CLICK_CALCULATOR_BUTTON, {
        calculator: calculator?.code,
      });
      setActiveCalculator(code);
      navigation.navigate("Calculator2", {
        calculator,
        variables,
        itemKey,
        onBackFromCalculator,
      });

      // this.moveToCalculator2Screen(calculator);
    };

    return (
      <TouchableOpacity
        key={key}
        style={{
          flexDirection: "row",
          marginEnd: getHeight(10),
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: getHeight(8),
          flexShrink: 1,
        }}
        onPress={calculator && onClick}
      >
        {(calculator || title) && (
          <Image
            style={{
              width: getHeight(20) * 0.712707182320442,
              height: getHeight(20),
              marginEnd: getWidth(8),
            }}
            source={{ uri: "calculator2" }}
          />
        )}
        <Text
          uppercase={false}
          style={[
            this.props.white
              ? {
                  color: Colors.exampleThemeColor,
                }
              : globalStyles.questionResourceButtonTextStyle,
            styles.defaultStyle,
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  };
  render() {
    const {
      elements,
      navigation,
      variables,
      parent,
      itemKey,
      calculatorID,
      white,
      interact,
      calculator2,
      startSpace,
    } = this.props;
    const count = elements.length;
    const { onBackFromCalculator } = parent || {};

    const parentCalculator = calculator2
      ? getCalculator2For(calculatorID)
      : getCalculatorFor(calculatorID);

    const renderButtons = elements
      .filter((element) => element.type !== SMART_LINK)
      .map((element, key) => {
        let isLast = elements.length - 1 === key;
        let info,
          title,
          calculator,
          isSmartLink = false;

        // calculator 2 rendring
        if (typeof element === "object") {
          switch (element.type) {
            case "calculator":
              return this.renderCalculator2(element, key);
          }
        }

        // if example is object {label: xyz, code: abc_xyz_code} --> (New format)
        if (element && element.constructor === Object) {
          info = calculator2
            ? getInfoForCalculatorV2(element.code)
            : getInfoFor(element.code);

          calculator = calculator2
            ? getCalculator2For(element.code)
            : getCalculatorFor(element.code);

          // calculator = getCalculatorFor(element.code);
          title = element.label;

          if (parentCalculator && parentCalculator.reusables) {
            info = getInfoForCalculator(element.code, parentCalculator);
          }
        }
        // if it's a simple string (old format)
        else {
          info = getInfoFor(element);
          calculator = getCalculatorFor(element);
          title = calculator
            ? calculator.shortTitle
                .replace("Calculator", "")
                .replace(":", "")
                .trim()
            : info
            ? info.value
            : element;

          if (parentCalculator && parentCalculator.reusables) {
            info = getInfoForCalculator(element, parentCalculator);
          }
        }

        let imageIcon = false,
          pdfFile = false;

        if (isValid(info) && isValid(info.imageLink)) {
          imageIcon = true;
        }

        if (isValid(info) && isValid(info.pdfLink)) {
          pdfFile = true;
        }

        if (calculator || info) {
          const onPress = calculator
            ? () => {
                interact("calculator", calculator.code, false);
                Analytics.track(Analytics.events.CLICK_CALCULATOR_BUTTON, {
                  calculator: calculator.code,
                });

                navigation.navigate("Calculator", {
                  calculator,
                  variables,
                  itemKey,
                  onBackFromCalculator,
                });
              }
            : pdfFile
            ? () => {
                Linking.openURL(info.pdfLink);
              }
            : () => {
                interact("question resource", element, false);
                Analytics.track(Analytics.events.CLICK_QUESTION_RESOURCE, {
                  resource: title,
                });
                parent.setState({ info });
              };
          return (
            <TouchableOpacity
              key={key}
              style={{
                flexDirection: "row",
                marginEnd: getHeight(10),
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 1,
                marginBottom: getHeight(8),
              }}
              onPress={onPress}
            >
              {calculator && (
                <Image
                  style={{
                    width: getHeight(20) * 0.712707182320442,
                    height: getHeight(20),
                    marginEnd: getWidth(8),
                    alignSelf: "flex-start",
                  }}
                  source={{ uri: "calculator2" }}
                />
              )}
              {pdfFile && (
                <Image
                  style={{
                    marginStart: -getWidth(5),
                    width: getHeight(27),
                    height: getHeight(27),
                    alignSelf: "flex-start",
                  }}
                  source={{ uri: "pdficon" }}
                />
              )}
              {!calculator && !imageIcon && !pdfFile && (
                <Image
                  style={{
                    marginStart: -getWidth(5),
                    width: getHeight(27),
                    height: getHeight(27),
                    alignSelf: "flex-start",
                    //backgroundColor: "red",
                  }}
                  source={{ uri: "qmark" }}
                />
              )}
              {!calculator && imageIcon && (
                <Image
                  style={{
                    marginStart: -getWidth(5),
                    width: getHeight(27),
                    height: getHeight(27),
                    alignSelf: "flex-start",
                  }}
                  source={{ uri: "imageicon" }}
                />
              )}
              <Text
                uppercase={false}
                style={[
                  white
                    ? {
                        color: Colors.exampleThemeColor,
                      }
                    : globalStyles.questionResourceButtonTextStyle,
                  styles.defaultStyle,
                ]}
              >
                {title}
              </Text>
            </TouchableOpacity>
          );
        }

        // Element not found in Reusables
        return (
          // Customized margins to align the text items to the buttons
          <View
            style={{ justifyContent: "center", marginBottom: getHeight(8) }}
          >
            <Text
              key={key}
              style={{
                ...styles.defaultStyle,
                marginEnd: getWidth(10),
                color: "#515151",
              }}
            >
              {element && element.constructor === Object
                ? element.label
                : element}
              {key < elements.length - 1 && ","}
            </Text>
          </View>
        );
      });
    //const isSmallList = true; //count < 5 && count > 0;
    const smartLinks = elements.filter(
      (element) => element.type === SMART_LINK
    );
    const renderSmartLinks = smartLinks.map((smartLink) => {
      //console.log("info", JSON.stringify(smartLink.info));
      const title = smartLink.label;
      const onPress = () => {
        interact("question resource", smartLink, false);
        Analytics.track(Analytics.events.CLICK_QUESTION_RESOURCE, {
          resource: title,
        });
        const info = getInfoFor(smartLink.code);
        Analytics.track(Analytics.events.NOTE_READ, { title: info.title });
        parent.setState({ info });
      };
      return (
        <TouchableOpacity
          key={smartLink.code}
          style={{
            flexDirection: "row",
            marginEnd: getHeight(10),
            alignItems: "center",
            marginBottom: getHeight(8),
            justifyContent: "center",
          }}
          onPress={onPress}
        >
          <Image
            style={{
              marginStart: -getWidth(5),
              width: getHeight(27),
              height: getHeight(27),
              alignSelf: "flex-start",
            }}
            source={{ uri: "smartlink" }}
          />
          <Text
            uppercase={false}
            style={[
              globalStyles.questionResourceButtonTextStyle,
              styles.defaultStyle,
            ]}
          >
            {title}
          </Text>
        </TouchableOpacity>
      );
    });

    return (
      <View
        style={{
          marginTop: getHeight(6),
          marginStart: getWidth(startSpace !== undefined ? startSpace : 5),
        }}
      >
        <>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
            }}
          >
            {renderButtons}
          </View>
          {smartLinks.length > 0 ? (
            <>
              <Text
                style={{
                  color: "black",
                  marginTop: getHeight(5),
                  fontFamily: fontFamily.Bold,
                  fontSize: getHeight(17),
                  lineHeight: getHeight(18),
                }}
              >
                Smart Links
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {renderSmartLinks}
              </View>
            </>
          ) : null}
        </>
      </View>
    );
  }
}

let styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
  },
  defaultStyle: {
    fontSize: getHeight(16),
    fontFamily: fontFamily.Medium,
    fontWeight: "400",
  },
});
