import React, { Component } from "react";
import { Linking, StyleSheet, Image, TouchableOpacity, Text, View } from "react-native";
import * as Analytics from "../services/Analytics";
import Colors from "../constants/Colors";
import { getHeight, getWidth } from "../services/helper";
import Clipboard from "@react-native-community/clipboard";
import ToastMsg from "../components/theme/ToastMsg";
import Toast from "react-native-toast-message";
import Modal from "react-native-modal";
import { getStatusBarHeight } from "../services/iphoneXHelper";
import { fontFamily } from "../constants/strings";

export class ReferenceModal extends Component {
  componentDidMount() {
    // logEvent("opened_reference_modal");
  }
  render() {
    const { reference, onClose, protocol, onModalClose } = this.props;
    var references = [];
    if (!reference) {
      return <View />;
    }
    if (typeof reference === Array) {
      references = reference;
    } else {
      references = [reference];
    }

    return (
      <Modal
        style={{ margin: 0 }}
        isVisible={reference === null ? false : !!reference}
        onBackButtonPress={onModalClose}
      >
        <View
          style={{
            flex: 1,
            marginTop: 0,
            borderRadius: 8,
            paddingTop: getStatusBarHeight(true),
            backgroundColor: "white",
          }}
        >
          <View style={styles.cardStyle}>
            <TouchableOpacity
              hitSlop={{ top: 50, bottom: 50, left: 50, right: 50 }}
              style={{
                paddingTop: getHeight(12),
                alignSelf: "flex-end",
                flexDirection: "row",
                justifyContent: "flex-end",
              }}
              onPress={onClose}
            >
              <Image
                source={require("../images/close-thick.png")}
                style={{
                  width: getWidth(15),
                  height: getHeight(15),
                }}
              />
            </TouchableOpacity>
            <View
              style={{
                paddingBottom: getHeight(20),
                //paddingEnd: getWidth(24),
              }}
            >
              {references.map((item) => (
                <View>
                  <Text
                    style={{
                      fontSize: getHeight(32),
                      fontWeight: "500",
                      color: "#000000",
                      fontFamily: fontFamily.Regular,
                      marginBottom: getHeight(5),
                      lineHeight: getHeight(35),
                      marginEnd: getWidth(20),
                      alignContent: "flex-start",
                    }}
                  >
                    {item.source}
                  </Text>
                  <View style={{ height: 15 }} />
                  <View style={{ flexDirection: "row" }}>
                    <View style={{ flex: 1 }}>
                      <TouchableOpacity
                        button
                        onPress={() => {
                          Analytics.track(
                            Analytics.events.CLICK_REFERENCE_LINK,
                            {
                              reference: item.source,
                              protocol: protocol,
                            }
                          );
                          Linking.openURL(item.url);
                        }}
                      >
                        <Text style={{ color: Colors.infoBoxThemeColor }}>
                          {item.url}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={{}}>
                      <TouchableOpacity
                        onPress={() => {
                          Clipboard.setString(item.url);
                          Toast.show({
                            type: "customToast",
                            text1: "Link copied to clipboard",
                          });
                        }}
                      >
                        <Image
                          source={{ uri: "copy" }}
                          style={{
                            width: getWidth(17),
                            height: getHeight(17),
                            top: 0,
                          }}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
          <ToastMsg />
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  cardStyle: {
    marginStart: getWidth(14),
    marginEnd: getWidth(14),
    marginVertical: getHeight(14),
    borderRadius: getHeight(30),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    backgroundColor: "#ffffff",
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
    paddingBottom: getHeight(15),
    paddingEnd: getWidth(24),
    paddingStart: getWidth(24),
    paddingTop: getHeight(15),
  },
});
