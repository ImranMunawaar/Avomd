import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { Grid, Row, Col } from 'react-native-easy-grid';
import { numericToString, isValid } from '../models/modules';

export class CalculatorReport extends Component {
  render() {
    const { calculatorResult, associatedCalculator } = this.props;
    return (
      <View>
        {isValid(calculatorResult) && (
          <View style={{ marginVertical: 5, height: 125 }}>
            <Grid
              style={{
                margin: 5,
                marginBottom: 5,
                paddingHorizontal: 0,
                paddingVertical: 3,
              }}>
              <Col style={{ width: 3 }} />
              <Col size={99}>
                <Row>
                  <Col size={75}>
                    <Text style={{ fontSize: 14, fontWeight: '700' }}>
                      {associatedCalculator.shortTitle}
                    </Text>
                  </Col>
                  {isValid(calculatorResult.calculatedValue, true) && (
                    <Col size={25}>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 14, fontWeight: '700' }}>
                          {numericToString(calculatorResult.calculatedValue)}{' '}
                          {isValid(calculatorResult.unit) && calculatorResult.unit}
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
                        backgroundColor: 'lightgray',
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
                  <Text style={{ fontSize: 14, fontWeight: '600' }}>{calculatorResult.value1}</Text>
                </Row>
                <Row>
                  <View style={{ height: 9 }} />
                </Row>
                <Row>
                  <Col size={100}>
                    <Text style={{ fontSize: 11 }}>{calculatorResult.value2}</Text>
                  </Col>
                </Row>
                <Row>
                  <View style={{ height: 9 }} />
                </Row>
              </Col>
            </Grid>
          </View>
        )}
      </View>
    );
  }
}
