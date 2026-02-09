import React, { Component } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  Platform,
} from "react-native";
import { getWidth, getHeight, isAndroid } from "../services/helper";
import { isIphoneX, getStatusBarHeight } from "../services/iphoneXHelper";
import Colors from "../constants/Colors";
import { getActiveModule } from "../models/modules";
import { AsyncStorage } from "@react-native-async-storage/async-storage";
import { fontFamily } from "../constants/strings";

export class PageHeaderV2 extends Component {
  async componentDidMount() {
    //this.user = await AsyncStorage.getItem("user");
    //console.log("user", this.user);
  }
  render() {
    const {
      onBackPress,
      title,
      hasTabs,
      onRightPress,
      moduleTitle,
      adminModule,
      titleFontSize,
    } = this.props;
    const activeModule = getActiveModule();
    const activeModuleTitle = activeModule?.title;
    return !adminModule ? (
      <View
        style={{
          shadowColor: "#EDEDED",
          shadowOpacity: 1,
          shadowOffset: {
            height: 10,
            width: 0,
          },
          shadowRadius: 5,
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
          elevation: 8,
        }}
      >
        <View style={styles.headerContentContainer}>
          <View
            style={{
              position: "absolute",
              alignItems: moduleTitle ? "flex-start" : "center",
              width: moduleTitle ? "60%" : "100%",
              start: moduleTitle ? getWidth(37) : null,
            }}
          >
            {moduleTitle ? (
              <Text numberOfLines={1} style={styles.moduleTitle}>
                {moduleTitle}
              </Text>
            ) : (
              <Text
                numberOfLines={1}
                style={[
                  styles.title,
                  titleFontSize ? { fontSize: titleFontSize } : {},
                ]}
              >
                {title}
              </Text>
            )}
          </View>
          <TouchableOpacity
            accessible={true}
            accessibilityLabel="headerBackBtn"
            onPress={() => {
              if (onBackPress) {
                onBackPress();
              }
            }}
          >
            {/*<Icon name="chevron-small-left" type="Entypo" style={styles.backIcon}/>*/}
            <Image
              source={{ uri: "backicon" }}
              style={{
                height: getHeight(18),
                width: getWidth(12),
                marginStart: getWidth(16),
                marginEnd: getWidth(20),
                marginTop: getHeight(15),
                marginBottom: getHeight(15),
                resizeMode: "contain",
              }}
            />
          </TouchableOpacity>
          {onRightPress && (
            <TouchableOpacity
              style={{ marginEnd: getWidth(26) }}
              onPress={() => {
                if (onRightPress) onRightPress();
              }}
            >
              <Text
                style={{
                  color: Colors.primaryColor,
                  fontFamily: fontFamily.Medium,
                  fontSize: getHeight(18),
                  fontWeight: "400",
                }}
              >
                Feedback
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    ) : (
      <>
        <View style={styles.headerView}>
          <View style={{ flex: 1 }}>
            <Image source={{ uri: "logo" }} style={styles.logo} />
          </View>
          <View style={{ flex: 3, padding: 0, margin: 0 }}>
            <Text style={styles.welcomeNote}>Welcome to AvoMD</Text>
            <Text style={styles.moduleTitle}>{activeModuleTitle}</Text>
          </View>
        </View>
      </>
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
    fontFamily: fontFamily.Regular,
    color: "black",
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
