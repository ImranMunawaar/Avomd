import React, { Component } from "react";
import { Text, View } from "react-native";
import { isValid, numericToString } from "../../models/modules";
import * as Animatable from "react-native-animatable";
import { Col, Grid, Row } from "react-native-easy-grid";
import { getHeight, getWidth } from "../../services/helper";
import { fontFamily } from "../../constants/strings";
import { MAX_LENGTH_CALCULATOR_REPORT } from "../../screens/DashboardExports";
import Analytics from "../../services/Analytics";
import Colors from "../../constants/Colors";

export default class AssociatedCalculatorsV1 extends Component {
  render() {
    const {
      _this,
      calculatorReports,
      groupItem,
      associatedCalculators,
      interactWithProtocol,
      interactWith,
    } = this.props;
    return (
      <>
        {Object.keys(associatedCalculators).map(
          (key, index) =>
            isValid(calculatorReports[key]) && (
              <View key={key} style={{ marginBottom: getHeight(10) }}>
                <Animatable.View
                  animation="fadeInRight"
                  delay={300}
                  duration={500}
                >
                  <Grid
                    style={{
                      bottom: 0,
                      paddingHorizontal: groupItem ? 0 : 20,
                      paddingTop: index === 0 ? 0 : getHeight(10),
                      paddingBottom: getHeight(10),
                    }}
                  >
                    <Col
                      style={{
                        width: 4,
                        backgroundColor: Colors.secondaryColor,
                      }}
                    />
                    <Col style={{ width: 10 }} />
                    <Col size={99}>
                      <Row>
                        <Col size={75}>
                          <Text
                            style={{
                              fontSize: getHeight(18),
                              fontWeight: "800",
                              fontFamily: fontFamily.Regular,
                            }}
                          >
                            {associatedCalculators[key].shortTitle
                              .replace("Calculator", "")
                              .replace(":", "")
                              .trim()}
                          </Text>
                        </Col>
                        {isValid(
                          calculatorReports[key].calculatedValue,
                          true
                        ) && (
                          <Col size={25}>
                            <View style={{ alignItems: "center" }}>
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontWeight: "700",
                                  fontFamily: fontFamily.Regular,
                                }}
                              >
                                {numericToString(
                                  calculatorReports[key].calculatedValue
                                )}{" "}
                                {isValid(calculatorReports[key].unit) &&
                                  calculatorReports[key].unit}
                              </Text>
                            </View>
                          </Col>
                        )}
                      </Row>
                      <Row>
                        <View style={{ height: 9 }} />
                      </Row>
                      <Row>
                        <Col size={100}>
                          <View
                            style={{
                              backgroundColor: "lightgray",
                              height: 1,
                              leftMargin: 0,
                              rightMargin: 0,
                            }}
                          />
                        </Col>
                      </Row>
                      <Row>
                        <View style={{ height: 9 }} />
                      </Row>
                      <Row>
                        <Text
                          style={{
                            color: "#000000",
                            fontSize: 16,
                            fontWeight: "400",
                            fontFamily: fontFamily.Regular,
                          }}
                        >
                          {calculatorReports[key].value1}
                        </Text>
                      </Row>
                      <Row>
                        <View style={{ height: 9 }} />
                      </Row>
                      <Row>
                        <Text
                          style={{
                            fontSize: getHeight(14),
                            lineHeight: getHeight(18),
                            fontFamily: fontFamily.Regular,
                            color: "#ADADAD",
                          }}
                        >
                          {calculatorReports[key].value2.length >
                          MAX_LENGTH_CALCULATOR_REPORT
                            ? calculatorReports[key].value2.substring(
                                0,
                                MAX_LENGTH_CALCULATOR_REPORT - 1
                              ) + "..."
                            : calculatorReports[key].value2}
                        </Text>
                      </Row>
                      {calculatorReports[key].value2.length >
                        MAX_LENGTH_CALCULATOR_REPORT && (
                        <Row style={{ flexDirection: "row-reverse" }}>
                          <Text
                            style={{
                              fontSize: 13,
                              marginRight: 5,
                              fontWeight: "500",
                              color: Colors.infoBoxThemeColor,
                              textDecorationLine: "underline",
                            }}
                            onPress={() => {
                              interactWithProtocol(
                                `${interactWith}: ${key}`,
                                false
                              );
                              Analytics.track(
                                Analytics.events.OPEN_INFORMATION_MODAL,
                                { info: calculatorReports[key].value1 }
                              );
                              _this.setState({
                                info: {
                                  title: calculatorReports[key].value1,
                                  calloutText: calculatorReports[key].value2,
                                },
                              });
                            }}
                          >
                            More...
                          </Text>
                        </Row>
                      )}
                      <Row>
                        <View style={{ height: 9 }} />
                      </Row>
                    </Col>
                  </Grid>
                </Animatable.View>
              </View>
            )
        )}
      </>
    );
  }
}
