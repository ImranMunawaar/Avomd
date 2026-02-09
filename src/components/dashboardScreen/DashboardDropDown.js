import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { isValid } from "../../models/modules";
import { getHeight, getWidth } from "../../services/helper";
import { POSTFIX_VALUE } from "../../screens/DashboardExports";
import { BubbleCard } from "../BubbleCardDashboard";
import { InstitutionListModal } from "../../modals/InstitutionListModal";
import { fontFamily } from "../../constants/strings";

export class DashboardDropDown extends Component {
  state = {
    visible: false,
    institutionName: "",
  };
  close = () => this.setState({ visible: false });
  render() {
    const { visible, institutionName } = this.state;
    let { item, setVariables, styles } = this.props;

    return (
      <Animatable.View
        animation="fadeInRight"
        delay={150}
        duration={300}
        key={item.id}
      >
        <BubbleCard
          isChatItem
          style={{
            paddingBottom: isValid(item.elements)
              ? getHeight(16)
              : getHeight(17),
          }}
        >
          {isValid(item.title) && (
            <Text style={[styles.titleTextStyle, { fontSize: getHeight(24) }]}>
              {item.title}
            </Text>
          )}
          {isValid(item.rationale) && (
            <Text style={[dropDownStyle.questionTextStyleSub]}>
              {item.rationale}
            </Text>
          )}
        </BubbleCard>
        <BubbleCard
          answer
          isChatItem
          style={{
            paddingBottom: isValid(item.elements)
              ? getHeight(16)
              : getHeight(17),
          }}
        >
          <Text style={[dropDownStyle.institutionTextStyle]}>Institution</Text>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={{ marginEnd: getWidth(12) }}
              onPress={() => {
                this.setState({ visible: true });
              }}
            >
              <TextInput
                pointerEvents="none"
                style={[dropDownStyle.fieldInput]}
                editable={false}
                // selectTextOnFocus={!isByPassInformation}
                placeholder="Find Your Institution"
                value={institutionName}
              />
            </TouchableOpacity>
            <Image
              source={require("../../images/dropdownarrow.png")}
              style={{
                position: "absolute",
                width: getHeight(10),
                height: getHeight(7),
                top: getHeight(19),
                end: getWidth(18),
              }}
            />
          </View>
        </BubbleCard>
        <View>
          {visible && (
            <InstitutionListModal
              isVisible={visible}
              institutionName={(name) => {
                this.setState({ institutionName: name });
                setVariables?.({
                  [item.targetVariable + POSTFIX_VALUE]: name,
                  [item.targetVariable]: name,
                });
              }}
              close={() => this.setState({ visible: false })}
            />
          )}
        </View>
      </Animatable.View>
    );
  }
}
const dropDownStyle = StyleSheet.create({
  institutionTextStyle: {
    fontSize: getHeight(14),
    lineHeight: getHeight(20),
    color: "#000000",
    fontWeight: "400",
    marginBottom: getHeight(5),
  },
  fieldInput: {
    width: getWidth(310),
    height: getHeight(45),
    alignItems: "flex-start",
    borderRadius: getHeight(50),
    elevation: 3,
    color: "#4A4A4A",
    // padding: 10,
    // paddingTop: getHeight(20),
    // paddingBottom: getHeight(20),
    fontWeight: "400",
    fontSize: getHeight(16),
    fontFamily: fontFamily.Regular,
    // shadowColor: "#000000",
    borderColor: "#4A4A4A",
    borderStyle: "solid",
    //shadowOpacity: 0.15,
    borderWidth: 1,
    shadowOffset: {
      height: 4,
      width: 0,
    },
    backgroundColor: "#FFFFFF",
    paddingStart: getWidth(15),
    paddingEnd: getWidth(28),
    paddingVertical: getHeight(15),
  },
  questionTextStyleSub: {
    color: "#7C7C7B",
    fontSize: getHeight(18),
    marginBottom: getHeight(6),
  },
});
