import React, { Component } from "react";
import { Text, View } from "react-native";
import { numericToString, isValid } from "../models/modules";
import * as Animatable from "react-native-animatable";
import { getHeight, getWidth } from "../services/helper";
import { fontFamily } from "../constants/strings";
export class CalculatorReport extends Component {
  render() {
    const { calculatorResult, associatedCalculator } = this.props;
    return (
      <View>
        {isValid(calculatorResult) && (
          <Animatable.View
            animation="bounceInUp"
            delay={100}
            duration={800}
            style={{
              //margin: 5,
              //marginBottom: 5,
              paddingHorizontal: 0,
              marginBottom: getHeight(20),
              // paddingVertical: 3,
              //paddingBottom: 9,
            }}
          >
            <View
              style={{
                paddingRight: getWidth(25),
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: getHeight(18),
                  fontWeight: "800",
                  width: "80%",
                  color: "#000000",
                  fontFamily: fontFamily.Regular,
                }}
              >
                {associatedCalculator.shortTitle}
              </Text>
              {isValid(calculatorResult.calculatedValue, true) && (
                <Text
                  style={{
                    fontSize: getHeight(14),
                    fontWeight: "700",
                    marginEnd: getWidth(5),
                    //paddingTop: getHeight(10),
                  }}
                >
                  {numericToString(calculatorResult.calculatedValue)}{" "}
                  {isValid(calculatorResult.unit) && calculatorResult.unit}
                </Text>
              )}
            </View>
            <View
              style={{
                marginTop: getHeight(10),
                backgroundColor: "lightgray",
                height: 1,
                marginRight: getWidth(25),
              }}
            />
            <View
              style={{
                marginTop: getHeight(15),
                marginBottom: getHeight(5),
                paddingRight: getWidth(25),
              }}
            >
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: getHeight(14),
                  color: "#000000",
                  fontFamily: fontFamily.Regular,
                  lineHeight: getHeight(18),
                }}
              >
                {calculatorResult.value1}
              </Text>
              <Text
                style={{
                  fontSize: getHeight(14),
                  lineHeight: getHeight(18),
                  fontFamily: fontFamily.Regular,
                  color: "#ADADAD",
                }}
              >
                {calculatorResult.value2}
              </Text>
            </View>
          </Animatable.View>
        )}
      </View>
    );
  }
}
