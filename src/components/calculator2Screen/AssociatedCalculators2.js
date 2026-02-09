import React, { Component } from "react";
import { Text, View, StyleSheet } from "react-native";
import { isValid, numericToString } from "../../models/modules";
import * as Animatable from "react-native-animatable";
import { Col, Grid, Row } from "react-native-easy-grid";
import DraftJsView from "../../components/DraftJsView";
import { getHeight, getWidth } from "../../services/helper";
import { fontFamily } from "../../constants/strings";
import Colors from "../../constants/Colors";

function filterString(str) {
  return Boolean(str);
}
export default class AssociatedCalculators extends Component {
  associatedCalculators = [];
  constructor(props) {
    super(props);
    const item = props.item;
    if (isValid(item.tools)) {
      const tools = item.tools;
      const calculatorTools = tools.filter(
        (tool) => tool.type === "calculator"
      );
      this.associatedCalculators = calculatorTools
        .map((calcTool) => calcTool.code)
        .filter(filterString);
    }
  }
  render() {
    const { calculatorReports, classes, groupItem } = this.props;
    return (
      <>
        {this.associatedCalculators.map((key, index) => {
          const calcAnimate = isValid(calculatorReports[key]);
          const outputCatgeory = calculatorReports[key]?.validCategoricalOutput;
          if (!calcAnimate) return null;

          return (
            isValid(calculatorReports[key]) && (
              <View key={key} style={{ marginBottom: getHeight(10) }}>
                <Animatable.View
                  animation="fadeInRight"
                  delay={300}
                  duration={500}
                >
                  <Grid
                    style={{
                      //margin: 5,
                      marginStart: groupItem ? 0 : getWidth(5),
                      bottom: 0,
                      paddingHorizontal: groupItem ? 0 : 20,
                      paddingVertical: index === 0 ? 0 : 10,
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
                            {calculatorReports[key].name}
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
                                )}

                                {isValid(
                                  calculatorReports[key]?.numerical?.unit
                                ) &&
                                  " " + calculatorReports[key]?.numerical?.unit}
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
                      {outputCatgeory && (
                        <>
                          <Grid>
                            <Text
                              style={{
                                fontFamily: fontFamily.Regular,
                                fontWeight: "400",
                                fontSize: getHeight(16),
                                color: "#000000",
                              }}
                            >
                              {outputCatgeory.label}
                            </Text>
                          </Grid>
                          <Grid>
                            <View style={{ height: 9 }} />
                          </Grid>

                          <Grid>
                            <Grid>
                              {isValid(outputCatgeory.descriptionJson) && (
                                <DraftJsView
                                  blocksJSON={outputCatgeory.descriptionJson}
                                  calculatorReport
                                />
                              )}
                            </Grid>
                          </Grid>
                          <Grid>
                            <View style={{ height: 9 }} />
                          </Grid>
                        </>
                      )}
                    </Col>
                  </Grid>
                </Animatable.View>
              </View>
            )
          );
        })}
      </>
    );
  }
}
