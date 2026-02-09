import React, { Component } from "react";
import {
  Text,
  View
} from "react-native";
import * as Animatable from "react-native-animatable";
import {
  isValid,
} from "../../models/modules";
import { getHeight, getWidth } from "../../services/helper";

export class DashboardSection extends Component {
  constructor(props) {
    super(props);
    //this.state = { isOn: true };
  }
  render() {
    let {
      item,
      itemKey,
      _this,
      styles,
    } = this.props;
    
    return (
      <Animatable.View
        style={{
          marginEnd: getWidth(9),
          marginStart: getWidth(9),
          marginBottom: getHeight(12),
          marginTop: getHeight(14)
        }}
        animation="fadeInRight"
        delay={300}
        duration={500}
        key={item.id}>
        <View>
          <Text
            style={[styles.titleTextStyle, {fontSize: styles.titleTextStyle.fontSize + getHeight(2)}]}>{item.title.toUpperCase()}</Text>
          {isValid(item.value) && (
            <Text style={styles.sectionTitleTextStyleSub}>{item.value}</Text>
          )}
        </View>
      </Animatable.View>
    );
  }
}
