import React, { Component } from "react";
import {
  View,
  ScrollView,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
  Linking,
} from "react-native";
import {
  getInfoFor,
  getCalculatorFor,
  getInfoForCalculator,
  getCalculator2For,
  getInfoForCalculatorV2,
} from "../models/modules";
import { globalStyles } from "./GlobalStyles";
import * as Analytics from "../services/Analytics";
import { isValid } from "../models/modules";
import { getHeight, getWidth } from "../services/helper";
import Colors from "../constants/Colors";
import { fontFamily } from "../constants/strings";

const SEPARATOR = " | ";

export class ExampleResources extends Component {
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
      bottomSpace,
    } = this.props;
    const { onBackFromCalculator } = parent || {};
    const parentCalculator = calculator2
      ? getCalculator2For(calculatorID)
      : getCalculatorFor(calculatorID);

    const renderButtons = elements.map((element, key) => {
      let isLast = elements.length - 1 === key;
      let info, title, calculator;

      // if example is object {label: xyz, code: abc_xyz_code} --> (New format)
      if (element && element.constructor === Object) {
        info = calculator2
          ? getInfoForCalculatorV2(element.code)
          : getInfoFor(element.code);

        calculator = calculator2
          ? getCalculator2For(element.code)
          : getCalculatorFor(element.code);
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

      if (info) {
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
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={onPress}
          >
            <Text
              style={[
                {
                  color: Colors.exampleThemeColor,
                },
                styles.defaultStyle,
              ]}
            >
              {title}
              {key < elements.length - 1 && (
                <Text
                  uppercase={false}
                  style={[{ color: "#515151" }, styles.defaultStyle]}
                >
                  {SEPARATOR}
                </Text>
              )}
            </Text>
          </TouchableOpacity>
        );
      }

      // Element not found in Reusables
      return (
        // Customized margins to align the text items to the buttons
        <Text
          key={key}
          style={{
            ...styles.defaultStyle,
            color: "#515151",
          }}
        >
          {element && element.constructor === Object ? element.label : element}
          {key < elements.length - 1 && SEPARATOR}
        </Text>
      );
    });
    const isSmallList = true; //count < 5 && count > 0;

    return (
      <View
        style={[
          styles.exampleResourcesStyle,
          {
            marginBottom: getHeight(
              bottomSpace !== undefined ? bottomSpace : 8
            ),
          },
        ]}
      >
        {!isSmallList && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View
              style={{
                width: Dimensions.get("window").width * 1.4,
              }}
            >
              {renderButtons}
            </View>
          </ScrollView>
        )}

        {isSmallList && (
          <View style={globalStyles.questionResourceViewStyle}>
            {renderButtons}
          </View>
        )}
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
    lineHeight: getHeight(22.72),
  },
  exampleResourcesStyle: {
    marginTop: getHeight(9),
    marginBottom: getHeight(8),
    borderWidth: 1,
    borderColor: "#B2B2B2",
    borderRadius: getHeight(10),
    paddingHorizontal: getWidth(19),
    paddingTop: getHeight(11),
    paddingBottom: getHeight(10),
  },
});
