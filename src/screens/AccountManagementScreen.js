import React, { Component } from "react";
import {
  View,
  Text,
  Linking,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { getHeight, getWidth } from "../services/helper";
import { PageHeaderV2 } from "../components/PageHeaderV2";
import { fontFamily, LIVE_DB } from "../constants/strings";
import Colors from "../constants/Colors";
import { version } from "../../package.json";
import store from "../store";

export class AccountManagementScreen extends Component {
  constructor(props) {
    super(props);
  }
  clicksCount = 0;
  render() {
    let { dbURL } = store.getState().persist;
    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <PageHeaderV2
          onBackPress={() => {
            this.props.navigation.goBack();
          }}
          title="Account Management"
        />
        <View
          style={{ paddingHorizontal: getWidth(30), paddingTop: getHeight(30) }}
        >
          <Text
            style={{
              fontFamily: fontFamily.Regular,
              fontSize: getHeight(18),
              lineHeight: getHeight(22),
              color: "#8F8F8F",
            }}
          >
            Please contact us to update your profile or delete your account.
          </Text>
          <Text
            style={{
              marginTop: getHeight(10),
              fontFamily: fontFamily.Regular,
              fontSize: getHeight(18),
              color: Colors.primaryColor,
            }}
            onPress={() => {
              Linking.openURL(
                "mailto:support@avomd.io?subject=Account Update/Removal Request"
              );
            }}
          >
            support@avomd.io
          </Text>
        </View>
        <TouchableWithoutFeedback>
          <Text
            style={{
              position: "absolute",
              bottom: getHeight(31),
              left: getWidth(28),
              color: "#85959D",
              fontFamily: fontFamily.Regular,
              fontSize: 16,
              lineHeight: getHeight(22),
              fontWeight: "400",
            }}
          >
            v{version + (dbURL !== LIVE_DB ? " staging" : "")}
          </Text>
        </TouchableWithoutFeedback>
      </View>
    );
  }
}
