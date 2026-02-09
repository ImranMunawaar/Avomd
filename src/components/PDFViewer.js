import React, { Component } from "react";
import {
  Linking,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Text,
  View,
  Pressable
} from "react-native";
import * as Analytics from "../services/Analytics";
//import PDFReader from "rn-pdf-reader-js";
import Colors from "../constants/Colors";
import { getHeight, getWidth } from "../services/helper";
import { Image } from "react-native";
import { fontFamily } from "../constants/strings";

export default class PDFViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaderState: false,
      showPdfView: true,
    };
  }
  componentDidMount() {
    this.setState({ loaderState: true });
    // logEvent("opened_reference_modal");
  }
  render() {
    const { pdfLink, onClose } = this.props;
    return (
      <SafeAreaView
        style={{ marginTop: 0, backgroundColor: "#FCFCFC", flex: 1 }}
      >
        <View style={[styles.cardStyle, { flex: 1 }]}>
          <TouchableOpacity
            style={{
              alignSelf: "flex-end",
              marginTop: getHeight(19),
              marginEnd: getWidth(6.95),
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
            onPress={onClose}
          >
            <Image
              source={require("../images/close.png")}
              style={{
                width: getWidth(24),
                height: getHeight(24),
              }}
            />
          </TouchableOpacity>
          <View style={{ minHeight: "78%", justifyContent: "center" }}>
            {this.state.loaderState && Platform.OS === "android" && (
              <ActivityIndicator
                size="large"
                color={Colors.infoBoxThemeColor}
              />
            )}
            {/* {this.state.showPdfView && (
              <PDFReader
                onLoadEnd={() => {
                  this.setState({ loaderState: false });
                }}
                onError={() => {
                  this.setState({ loaderState: true, showPdfView: false });
                }}
                source={{
                  uri: pdfLink ? pdfLink : "",
                }}
              />
            )} */}
          </View>
          <Pressable
            style={{
              borderRadius: 30,
              position: "absolute",
              bottom: 0,
              marginBottom: getHeight(10),
              alignSelf: "center",
              backgroundColor: Colors.borderColor,
              height: getHeight(58),
              width: getWidth(255),
              shadowOffset: {
                width: 0,
                height: getHeight(4),
                backgroundColor: "#000000",
              },
            }}
            onPress={() => Linking.openURL(pdfLink)}
            success
            full
          >
            <Text
              style={{
                fontSize: getHeight(18),
                marginHorizontal: getWidth(62),
                color: "#FFFFFF",
                fontWeight: "bold",
                fontStyle: "normal",
                textAlign: "center",
                fontFamily: fontFamily.Regular,
              }}
            >
              Open in browser
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  cardStyle: {
    marginStart: getWidth(14),
    marginEnd: getWidth(12),
    marginVertical: getHeight(14),
    borderRadius: getHeight(30),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    backgroundColor: "white",
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
    paddingBottom: getHeight(14),
  },
  card: {
    minHeight: 100,
    marginLeft: 9,
    marginRight: 9,
    borderRadius: 8,
    paddingLeft: 5,
    paddingRight: 5,
  },
  cardItem: {
    flexDirection: "column",
    alignItems: "flex-start",
    padding: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
    paddingLeft: 5,
    paddingRight: 5,
  },
});
