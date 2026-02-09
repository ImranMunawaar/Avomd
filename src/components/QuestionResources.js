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
  getInfoForCalculator,
} from "../models/modules";
import { globalStyles } from "./GlobalStyles";
import * as Analytics from "../services/Analytics";
import { isValid } from "../models/modules";
import { getHeight, getWidth } from "../services/helper";
import Colors from "../constants/Colors";
import { fontFamily } from "../constants/strings";

export class QuestionResources extends Component {
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
    } = this.props;
    const count = elements.length;
    const { onBackFromCalculator } = parent || {};

    const parentCalculator = getCalculatorFor(calculatorID);

    const renderButtons = elements.map((element, key) => {
      let isLast = elements.length - 1 === key;
      var info = getInfoFor(element);
      if (parentCalculator && parentCalculator.reusables) {
        info = getInfoForCalculator(element, parentCalculator);
      }

      let imageIcon = false,
        pdfFile = false;

      if (isValid(info) && isValid(info.imageLink)) {
        imageIcon = true;
      }

      if (isValid(info) && isValid(info.pdfLink)) {
        pdfFile = true;
      }
      const calculator = getCalculatorFor(element);

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
                resource: element,
              });
              parent.setState({ info });
            };
        const title = calculator
          ? calculator.shortTitle
              .replace("Calculator", "")
              .replace(":", "")
              .trim()
          : info.value;
        return (
          <TouchableOpacity
            key={key}
            style={{
              flexDirection: "row",
              marginEnd: getHeight(10),
              justifyContent: "center",
              alignItems: "center",
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
                }}
                source={{ uri: "calculator2" }}
              />
              /*<View style={{
                width: getWidth(18),
                height: getWidth(18),
                marginEnd: getWidth(8),
                borderRadius: getWidth(18) / 2,
                backgroundColor: "#FFF",
                shadowColor: "#E2E2E2",
                shadowOpacity: 1,
                shadowOffset: {
                  height: 2,
                  width: 0
                },
                shadowRadius: 3
              }}>*/
              /*<Icon
                style={{
                  marginEnd: getWidth(8),
                  textAlign: "center",
                  fontSize: getHeight(14.5),
                  color: "#25CD7C",
                  backgroundColor: "transparent",
                  marginTop: getHeight(2.5)
                }}
                type="MaterialCommunityIcons"
                name="calculator"
              />*/
              /*</View>*/
            )}

            {pdfFile && (
              <Image
                style={{
                  marginStart: -getWidth(5),
                  width: getHeight(27),
                  height: getHeight(27),
                }}
                source={{ uri: "pdficon" }}
              />
              /*<View style={{
                width: getHeight(18),
                height: getHeight(18),
                borderRadius: getHeight(18) / 2,
                backgroundColor: "#FFF",
                shadowColor: "#E2E2E2",
                marginEnd: getWidth(8),
                shadowOpacity: 1,
                shadowOffset: {
                  height: 2,
                  width: 0
                },
                shadowRadius: 3
              }}>
                <Icon
                  style={{
                    textAlign: "center",
                    paddingTop: getHeight(3),
                    fontSize: getHeight(10),
                    color: "#25CD7C",
                    backgroundColor: "transparent"
                  }}
                  type="AntDesign"
                  name="pdffile1"
                />
              </View>*/
            )}
            {!calculator && !imageIcon && !pdfFile && (
              <Image
                style={{
                  marginStart: -getWidth(5),
                  width: getHeight(27),
                  height: getHeight(27),
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
                }}
                source={{ uri: "imageicon" }}
              />
              /*<View style={{
                width: getHeight(18),
                height: getHeight(18),
                marginEnd: getWidth(8),
                borderRadius: getHeight(18) / 2,
                backgroundColor: "#FFF",
                shadowColor: "#E2E2E2",
                shadowOpacity: 1,
                shadowOffset: {
                  height: 2,
                  width: 0
                },
                shadowRadius: 3
              }}>
                <Icon
                  style={{
                    textAlign: "center",
                    paddingTop: getHeight(3),
                    fontSize: getHeight(10),
                    color: "#25CD7C",
                    backgroundColor: "transparent"
                  }}
                  type="Entypo"
                  name="images"
                />
              </View>*/
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
        <View style={{ justifyContent: "center", marginBottom: getHeight(8) }}>
          <Text
            key={key}
            style={{
              ...styles.defaultStyle,
              marginEnd: getWidth(10),
              color: "#515151",
            }}
          >
            {element}
            {key < elements.length - 1 && ","}
          </Text>
        </View>
      );
    });
    const isSmallList = true; //count < 5 && count > 0;

    return (
      <View style={{ marginTop: getHeight(6), marginStart: getWidth(5) }}>
        {!isSmallList && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View
              style={{
                ...globalStyles.questionResourceViewStyle,
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
  },
});
