import React from "react";
import { View, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";

export default (props) => (
  <View style={{ backgroundColor: "transparent", flex: 1 }}>
    <LinearGradient
      colors={["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF00"]}
      style={styles.linearGradient}
    ></LinearGradient>
  </View>
);
var styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
    width: "100%",
  },
});
