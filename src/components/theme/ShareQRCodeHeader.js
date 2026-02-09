import React, { Component } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  Platform,
} from "react-native";
import { getWidth, getHeight, isAndroid } from "../../services/helper";
import { isIphoneX, getStatusBarHeight } from "../../services/iphoneXHelper";
import { fontFamily } from "../../constants/strings";

export class ShareQRCodeHeader extends Component {
  async componentDidMount() {
    //this.user = await AsyncStorage.getItem("user");
    //console.log("user", this.user);
  }
  render() {
    const { onBackPress, title } = this.props;
    return (
      <View
        style={{
          // shadowColor: "#EDEDED",
          // shadowOpacity: 1,
          // shadowOffset: {
          //   height: 10,
          //   width: 0,
          // },
          // shadowRadius: 5,
          borderBottomWidth: isAndroid ? 0.5 : 0,
          borderBottomColor: "#EDEDED",
          paddingTop: getHeight(
            Platform.OS === "ios" ? (isIphoneX() ? 45 : 15) : 3
          ),
          flexDirection: "row",
          backgroundColor: "white",
          alignItems: "flex-end",
          paddingBottom: getHeight(3),
          zIndex: 500,
          // elevation: 8,
        }}
      >
        <View style={styles.headerContentContainer}>
          <View
            style={{
              position: "absolute",
              alignItems: isAndroid ? "flex-start" : "center",
              width: isAndroid ? "60%" : "100%",
              start: isAndroid ? getWidth(50) : null,
            }}
          >
            <Text numberOfLines={1} style={styles.title}>
              {title}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (onBackPress) {
                onBackPress();
              }
            }}
          >
            {/*<Icon name="chevron-small-left" type="Entypo" style={styles.backIcon}/>*/}
            {Platform.OS === "ios" && (
              <Image
                source={require("../../images/chevron-small-left.png")}
                style={{
                  height: getHeight(32),
                  width: getWidth(32),
                  marginStart: getWidth(6),
                  marginTop: getHeight(11),
                  resizeMode: "contain",
                }}
              />
            )}
            {Platform.OS !== "ios" && (
              <Image
                source={require("../../images/arrow.png")}
                style={{
                  height: getHeight(32),
                  width: getWidth(32),
                  marginStart: getWidth(16),
                  marginEnd: getWidth(20),
                  marginTop: getHeight(15),
                  marginBottom: getHeight(15),
                  resizeMode: "contain",
                }}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerView: {
    paddingTop:
      getHeight(Platform.select({ ios: 10, android: 35 })) +
      getStatusBarHeight(true),
    paddingBottom: getHeight(15),
    paddingLeft: getWidth(5),
    flexDirection: "row",
  },

  welcomeNote: {
    fontSize: getHeight(18),
    fontWeight: "700",
    color: "#7C7C7C",
  },
  moduleTitle: {
    fontSize: getHeight(20),
    color: "#000000",
    fontWeight: "700",
  },
  logo: {
    width: getWidth(56),
    height: getHeight(57),
    marginLeft: "auto",
    marginRight: "auto",
  },
  headerContentContainer: {
    flex: 1,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
  leftHeader: {
    flex: 0,
  },
  rightHeader: {
    flex: 0,
  },
  title: {
    fontSize: getHeight(18),
    fontWeight: "700",
    fontFamily: fontFamily.Black,
    color: "black",
    textAlign: "center",
  },
  moduleTitle: {
    fontSize: getHeight(20),
    fontFamily: fontFamily.Bold,
    color: "black",
  },
  backIcon: {
    color: "black",
    fontSize: getHeight(33),
  },
});
