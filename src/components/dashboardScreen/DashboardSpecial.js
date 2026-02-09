import React, { Component } from "react";
import {
  Image,
  Text,
  View,
  Pressable
} from "react-native";
import * as Animatable from "react-native-animatable";
import {
  getInfoFor,
  isValid,
} from "../../models/modules";
import { BubbleCard } from "../../components/BubbleCardDashboard";
import { globalStyles } from "../../components/GlobalStyles";
import { getHeight, getWidth} from "../../services/helper";
import Colors from "../../constants/Colors";

export class DashboardSpecial extends Component {
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
    var title = "(Optional) Consider following circumstances:";
    if (isValid(item.title) && item.title.trim() !== "") {
      title = item.title;
    }
    return (
      <Animatable.View animation="fadeInRight" delay={300} duration={500} key={item.id}>
        <BubbleCard answer full isChatItem>
          <Text style={styles.titleTextStyle}> {item.title}</Text>
          <View style={globalStyles.questionResourceViewStyle}>
            {item.value.map((value, key) => {
              const info = getInfoFor(value);
              const varName = item.targetVariable + "_" + key.toString();
              const active = getVar(varName) === 1;
              var itemName = value;
              
              if (info) {
                itemName = info.value;
              }
              
              // Element not found in Reusables
              return (
                // Customized margins to align the text items to the buttons
                <View key={key}>
                  {info && (
                    <View style={{flexDirection: "row"}}>
                      <Pressable
                        style={[
                          globalStyles.multipleButtonStyleWithInfo, {
                            backgroundColor: active ? Colors.button : "white"
                          }]
                        }
                        onPress={() => {
                          interactWithProtocol(`special multi button: ${itemName}`);
                          if (getVar(varName) !== 1) {
                            setVariable(varName, 1);
                          } else {
                            setVariable(varName, 0);
                          }
                          setGroupToVariable(item.targetVariable, item.value.length);
                          moveToNextStep();
                        }}>
                        {/*Multi Selections*/}
                        {/* <MaterialCommunityIcons
                          name={active ? "check-box-outline" : "checkbox-blank-outline"}
                          color={active ? "white" : "#848484"}
                          size={16}
                          style={{marginStart: 10, marginEnd: -13}}/> */}
                        <Image
                          source={active
                            ? require('../../images/check-box-fill.png')
                            : require('../../images/check-box-outline.png')}
                          style={{
                            marginStart: getWidth(10),
                            marginEnd: getWidth(-13),
                            width: getHeight(16),
                            height: getHeight(16)
                          }}/>
                        <Text
                          style={
                            {
                              margin: 0,
                              fontSize: 13,
                              color: active ? "white" : "#848484",
                              fontWeight: "500"
                            }}
                          uppercase={false}>
                          {itemName}
                        </Text>
                      </Pressable>
                      <Pressable
                        style={globalStyles.multipleButtonInfoStyle}
                        onPress={() => {
                          interactWithProtocol(`special multi button info: ${itemName}`, false);
                          //console.log(Analytics.events.OPEN_INFORMATION_MODAL, {info: info.title});
                          _this.setState({info});
                        }}>
                        <Text style={{marginLeft: -7, color: "white", fontWeight: "500"}}>ⓘ</Text>
                      </Pressable>
                    </View>
                  )}
                  
                  {!info && (
                    <View style={{flexDirection: "row"}}>
                      <Pressable
                        style={[
                          globalStyles.multipleButtonStyle, {
                            backgroundColor: active ? Colors.button : "white"
                          }]
                        }
                        onPress={() => {
                          interactWithProtocol(`special multi button: ${itemName}`);
                          if (getVar(varName) !== 1) {
                            setVariable(varName, 1);
                          } else {
                            setVariable(varName, 0);
                          }
                          setGroupToVariable(item.targetVariable, item.value.length);
                          moveToNextStep();
                        }}>
                        {/*Multi Selections*/}
                        {/* <MaterialCommunityIcons
                          name={active ? "check-box-outline" : "checkbox-blank-outline"}
                          color={active ? "white" : "#848484"}
                          size={16}
                          style={{marginStart: 10, marginEnd: -13}}/> */}
                        <Image
                          source={active
                            ? require('../../images/check-box-fill.png')
                            : require('../../images/check-box-outline.png')}
                          style={{
                            marginStart: getWidth(10),
                            marginEnd: getWidth(-13),
                            width: getHeight(16),
                            height: getHeight(16)
                          }}/>
                        <Text
                          style={
                            {
                              margin: 0,
                              fontSize: 13,
                              color: active ? "white" : "#848484",
                              fontWeight: "500"
                            }}
                          uppercase={false}>
                          {itemName}
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </BubbleCard>
      </Animatable.View>
    );
  }
}
